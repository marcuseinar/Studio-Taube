import { describe, expect, it } from 'vitest';
import { apiCredentials, bokadirektApiSource, buildRequest, toCategories } from './bokadirekt-api.mjs';

const env = (overrides = {}) => ({
  BOKADIREKT_API_URL: 'https://api.example.com/services',
  BOKADIREKT_API_KEY: 'secret',
  ...overrides,
});

const service = (overrides = {}) => ({ id: 1, name: 'Head spa', price: 950, duration: 3600, ...overrides });

describe('apiCredentials', () => {
  it('names every missing variable at once, so configuring it is one pass', () => {
    expect(() => apiCredentials({})).toThrow(/BOKADIREKT_API_URL and BOKADIREKT_API_KEY/);
  });

  it('defaults to bearer auth and the seconds the salon page already uses', () => {
    const credentials = apiCredentials(env());
    expect(credentials.auth).toBe('bearer');
    expect(credentials.durationUnit).toBe('seconds');
  });
});

describe('buildRequest', () => {
  it('sends a bearer token by default', () => {
    const request = buildRequest(apiCredentials(env()));
    expect(request.headers.Authorization).toBe('Bearer secret');
  });

  it('can send the key as a named header instead', () => {
    const request = buildRequest(
      apiCredentials(env({ BOKADIREKT_API_AUTH: 'header', BOKADIREKT_API_AUTH_NAME: 'X-Bd-Key' })),
    );
    expect(request.headers['X-Bd-Key']).toBe('secret');
    expect(request.headers.Authorization).toBeUndefined();
  });

  it('can send the key as a query parameter', () => {
    const request = buildRequest(
      apiCredentials(env({ BOKADIREKT_API_AUTH: 'query', BOKADIREKT_API_AUTH_NAME: 'apikey' })),
    );
    expect(request.url).toContain('apikey=secret');
  });

  it('refuses an auth scheme it does not understand rather than sending no credential', () => {
    expect(() => buildRequest(apiCredentials(env({ BOKADIREKT_API_AUTH: 'magic' })))).toThrow(/Unknown/);
  });
});

describe('toCategories', () => {
  it('passes through a response that is already grouped', () => {
    const categories = toCategories([{ name: 'Head spa', services: [service()] }]);
    expect(categories).toHaveLength(1);
    expect(categories[0].services[0].duration).toBe(3600);
  });

  it('unwraps a response that nests the list under a key', () => {
    for (const key of ['categories', 'data', 'items', 'results']) {
      const categories = toCategories({ [key]: [{ name: 'Head spa', services: [service()] }] });
      expect(categories[0].name).toBe('Head spa');
    }
  });

  it('groups a flat list by the category each service names', () => {
    const categories = toCategories([
      service({ id: 1, categoryName: 'Head spa' }),
      service({ id: 2, category: { name: 'Ansikte' } }),
      service({ id: 3, category: 'Head spa' }),
    ]);
    expect(categories.map((category) => category.name).sort()).toEqual(['Ansikte', 'Head spa']);
    expect(categories.find((category) => category.name === 'Head spa').services).toHaveLength(2);
  });

  it('refuses a flat list with no categories rather than inventing a heading', () => {
    expect(() => toCategories([service()])).toThrow(/flat service list with no category/);
  });

  it('converts minutes to the seconds the snapshot stores', () => {
    const categories = toCategories([{ name: 'Head spa', services: [service({ duration: 60 })] }], {
      durationUnit: 'minutes',
    });
    expect(categories[0].services[0].duration).toBe(3600);
  });

  it('reports the keys it actually received when it cannot find a list', () => {
    expect(() => toCategories({ salon: {}, meta: {} })).toThrow(/salon, meta/);
  });

  it('rejects an empty list, which would otherwise blank every price', () => {
    expect(() => toCategories([])).toThrow(/empty service list/);
  });
});

describe('bokadirektApiSource.fetchCatalogue', () => {
  const catalogue = [{ name: 'Behandlingar', services: Array.from({ length: 12 }, (_, i) => service({ id: i + 1 })) }];
  const ok = () => ({ ok: true, status: 200, json: async () => catalogue });

  it('returns a validated catalogue', async () => {
    const categories = await bokadirektApiSource.fetchCatalogue({ fetchImpl: async () => ok(), env: env() });
    expect(categories[0].services).toHaveLength(12);
  });

  it('does not retry a rejected key, which could trip a lockout', async () => {
    let calls = 0;
    const fetchImpl = async () => {
      calls += 1;
      return { ok: false, status: 401, json: async () => ({}) };
    };

    await expect(bokadirektApiSource.fetchCatalogue({ fetchImpl, env: env(), retries: 3 })).rejects.toThrow(
      /rejected the API key/,
    );
    expect(calls).toBe(1);
  });

  it('retries a transient failure and accepts a later success', async () => {
    let calls = 0;
    const fetchImpl = async () => {
      calls += 1;
      if (calls < 2) throw new Error('socket hang up');
      return ok();
    };

    const categories = await bokadirektApiSource.fetchCatalogue({ fetchImpl, env: env(), retries: 2 });
    expect(categories).toHaveLength(1);
    expect(calls).toBe(2);
  });

  it('refuses a response that arrives intact but too small to be the real catalogue', async () => {
    const fetchImpl = async () => ({ ok: true, status: 200, json: async () => [{ name: 'A', services: [service()] }] });

    await expect(bokadirektApiSource.fetchCatalogue({ fetchImpl, env: env(), retries: 1 })).rejects.toThrow(
      /did not survive validation/,
    );
  });
});
