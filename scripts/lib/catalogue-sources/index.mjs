/**
 * Chooses where tonight's catalogue comes from.
 *
 * Both sources return the same shape and are validated by the same rules, so
 * moving between them is a configuration change — the same bargain the booking
 * layer makes with BookingProvider (docs/DECISIONS.md D6, D12).
 *
 *   BOKADIREKT_SOURCE=page      the public salon page (default, free)
 *   BOKADIREKT_SOURCE=api       the paid API module
 *   BOKADIREKT_SOURCE=api+page  the API, falling back to the page if it fails
 *
 * api+page exists because this runs unattended. Two independent routes to the
 * same data mean one of them breaking leaves the site current instead of
 * frozen — but a fallback that happened quietly would hide exactly the outage
 * worth knowing about, so the caller is told and the run still reports it.
 */
import { bokadirektApiSource } from './bokadirekt-api.mjs';
import { salonPageSource } from './salon-page.mjs';

export { bokadirektApiSource, salonPageSource };

const SOURCES = {
  page: [salonPageSource],
  api: [bokadirektApiSource],
  'api+page': [bokadirektApiSource, salonPageSource],
};

export function resolveSources(env = process.env) {
  const requested = env.BOKADIREKT_SOURCE?.trim() || 'page';
  const chain = SOURCES[requested];

  if (!chain) {
    throw new Error(`Unknown BOKADIREKT_SOURCE '${requested}'. Use ${Object.keys(SOURCES).join(', ')}.`);
  }
  return { requested, chain };
}

/**
 * Runs the chain until one source yields a catalogue. Returns the catalogue
 * alongside the failures that preceded it, so a successful fallback is still
 * a reportable event rather than a silent recovery.
 */
export async function fetchFromFirstWorkingSource(chain, options = {}) {
  const failures = [];

  for (const source of chain) {
    try {
      const categories = await source.fetchCatalogue(options);
      return { categories, source, failures };
    } catch (error) {
      failures.push({ source: source.name, message: error.message });
    }
  }

  const detail = failures.map((failure) => `  - ${failure.source}: ${failure.message}`).join('\n');
  throw new Error(`Every catalogue source failed:\n${detail}`);
}
