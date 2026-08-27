/**
 * Reads the catalogue from Bokadirekt's API module.
 *
 * WHAT IS AND IS NOT KNOWN HERE
 *
 * Bokadirekt publishes no public API reference — the documentation arrives
 * with the paid module. So nothing in this file hard-codes an endpoint path,
 * an auth scheme or a field name that has not been confirmed. Every one of
 * those is configuration, listed in docs/ARCHITECTURE.md, and the sync refuses
 * to run rather than guess:
 *
 *   BOKADIREKT_API_URL       full URL of the endpoint listing services
 *   BOKADIREKT_API_KEY       credential, sent per BOKADIREKT_API_AUTH
 *   BOKADIREKT_API_AUTH      'bearer' (default) | 'header' | 'query'
 *   BOKADIREKT_API_AUTH_NAME header or query parameter name, when not bearer
 *   BOKADIREKT_API_DURATION  'seconds' (default, what the salon page uses)
 *                            | 'minutes'
 *
 * The duration unit is configuration rather than a guess on purpose: reading
 * minutes as seconds is a silent sixtyfold error that every plausibility check
 * would pass and every visitor would see as a 90-second facial.
 *
 * When the credentials arrive, confirm the response shape against the real
 * reference and adjust toCategories() if it is none of the ones handled here.
 * It throws with the keys it actually received, so the adjustment is obvious.
 */
import { findCatalogueProblems } from '../catalogue-shape.mjs';

const RETRIES = 3;
const RETRY_BASE_MS = 2000;
const TIMEOUT_MS = 20000;

export function apiCredentials(env = process.env) {
  const url = env.BOKADIREKT_API_URL?.trim();
  const key = env.BOKADIREKT_API_KEY?.trim();

  const missing = [!url && 'BOKADIREKT_API_URL', !key && 'BOKADIREKT_API_KEY'].filter(Boolean);
  if (missing.length > 0) {
    throw new Error(`The Bokadirekt API source needs ${missing.join(' and ')}. See docs/ARCHITECTURE.md.`);
  }

  return {
    url,
    key,
    auth: env.BOKADIREKT_API_AUTH?.trim() || 'bearer',
    authName: env.BOKADIREKT_API_AUTH_NAME?.trim() || 'X-API-Key',
    durationUnit: env.BOKADIREKT_API_DURATION?.trim() || 'seconds',
  };
}

export function buildRequest({ url, key, auth, authName }) {
  const headers = { Accept: 'application/json' };
  const target = new URL(url);

  if (auth === 'bearer') headers.Authorization = `Bearer ${key}`;
  else if (auth === 'header') headers[authName] = key;
  else if (auth === 'query') target.searchParams.set(authName, key);
  else throw new Error(`Unknown BOKADIREKT_API_AUTH '${auth}'. Use bearer, header or query.`);

  return { url: target.toString(), headers };
}

const unwrap = (payload) => {
  if (Array.isArray(payload)) return payload;
  for (const key of ['categories', 'serviceCategories', 'data', 'items', 'results']) {
    if (Array.isArray(payload?.[key])) return payload[key];
  }
  return undefined;
};

const categoryNameOf = (service) =>
  [service?.categoryName, service?.category?.name, typeof service?.category === 'string' ? service.category : undefined]
    .find((name) => typeof name === 'string' && name.trim() !== '')
    ?.trim();

/**
 * Normalises an API response into the snapshot's category/service shape.
 *
 * Handles the response shapes worth anticipating; anything else throws naming
 * what arrived, because a wrong guess here becomes wrong prices on the site.
 */
export function toCategories(payload, { durationUnit = 'seconds' } = {}) {
  const list = unwrap(payload);

  if (list === undefined) {
    const keys = Object.keys(payload ?? {}).join(', ') || '(none)';
    throw new Error(`Could not find a service list in the API response. Top-level keys: ${keys}.`);
  }
  if (list.length === 0) throw new Error('The API returned an empty service list.');

  const toSeconds = (duration) => {
    if (!Number.isFinite(duration)) return duration;
    return durationUnit === 'minutes' ? duration * 60 : duration;
  };

  const normaliseService = (service) => ({
    ...service,
    duration: toSeconds(service?.duration ?? service?.durationSeconds ?? service?.lengthMinutes),
    price: service?.price ?? service?.priceSek ?? service?.amount,
  });

  /* Already grouped — a category is anything carrying its own service list. */
  if (list.some((entry) => Array.isArray(entry?.services))) {
    return list.map((category) => ({
      ...category,
      services: (category.services ?? []).map(normaliseService),
    }));
  }

  /* Otherwise it is a flat list, which has to carry a category per service —
     inventing a heading for treatments would be putting words on the site
     that the salon never wrote. */
  const grouped = new Map();
  for (const service of list) {
    const name = categoryNameOf(service);
    if (!name) {
      throw new Error(
        'The API returned a flat service list with no category on each service. ' +
          'Adjust toCategories() in scripts/lib/catalogue-sources/bokadirekt-api.mjs to match the real shape.',
      );
    }
    if (!grouped.has(name)) grouped.set(name, { name, services: [] });
    grouped.get(name).services.push(normaliseService(service));
  }
  return [...grouped.values()];
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const bokadirektApiSource = {
  name: 'bokadirekt-api',

  describe: () => {
    try {
      return new URL(apiCredentials().url).origin;
    } catch {
      return 'unconfigured';
    }
  },

  async fetchCatalogue({ fetchImpl = fetch, env = process.env, retries = RETRIES } = {}) {
    const credentials = apiCredentials(env);
    const request = buildRequest(credentials);
    let lastError;

    for (let attempt = 1; attempt <= retries; attempt += 1) {
      try {
        const response = await fetchImpl(request.url, {
          headers: request.headers,
          signal: AbortSignal.timeout(TIMEOUT_MS),
        });

        /* A credential problem will not fix itself by trying again, and
           retrying a rejected key risks tripping a lockout. */
        if (response.status === 401 || response.status === 403) {
          throw new Error(`Bokadirekt rejected the API key (${response.status}). Check BOKADIREKT_API_KEY.`);
        }
        if (!response.ok) throw new Error(`Bokadirekt API returned ${response.status}.`);

        const categories = toCategories(await response.json(), credentials);
        const problems = findCatalogueProblems(categories);
        if (problems.length > 0) {
          throw new Error(`The API response did not survive validation:\n  - ${problems.join('\n  - ')}`);
        }
        return categories;
      } catch (error) {
        lastError = error;
        if (String(error.message).includes('rejected the API key')) break;
        if (attempt < retries) await wait(RETRY_BASE_MS * 2 ** (attempt - 1));
      }
    }

    throw lastError;
  },
};
