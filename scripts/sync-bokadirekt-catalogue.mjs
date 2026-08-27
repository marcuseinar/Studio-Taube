/**
 * Refreshes data/bokadirekt-catalogue.json from whichever source is configured.
 *
 * Runs on a schedule and on a webhook, never during a build: the build stays
 * offline and reproducible. When an offer disappears from Bokadirekt, this is
 * what lets the next deploy stop advertising it.
 *
 * It refuses to write a catalogue that fails validation, because a truncated
 * snapshot would silently blank every price on the site. A failed run leaves
 * the previous snapshot exactly where it was.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { findCatalogueProblems, countServices, serviceIds } from './lib/catalogue-shape.mjs';
import { fetchFromFirstWorkingSource, resolveSources } from './lib/catalogue-sources/index.mjs';

const SNAPSHOT = 'data/bokadirekt-catalogue.json';
const META = 'data/bokadirekt-catalogue.meta.json';

/**
 * How long the snapshot may sit unchanged before the metadata is rewritten
 * anyway. GitHub disables scheduled workflows in a repository that has seen no
 * activity for 60 days, so a salon whose prices are stable would quietly lose
 * its nightly sync — and with it every automatic update. A commit at least
 * this often keeps the schedule alive. See docs/DECISIONS.md D12.
 */
const KEEPALIVE_DAYS = 7;

const readJson = async (path, fallback) => {
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch {
    return fallback;
  }
};

const previous = await readJson(SNAPSHOT, []);
const previousMeta = await readJson(META, {});

const { requested, chain } = resolveSources();
console.log(`Catalogue source: ${requested} (${chain.map((source) => source.name).join(' then ')})`);

let result;
try {
  result = await fetchFromFirstWorkingSource(chain);
} catch (error) {
  console.error(`${error.message}\nKeeping the existing snapshot.`);
  process.exit(1);
}

const { categories, source, failures } = result;

for (const failure of failures) {
  console.error(`WARNING: ${failure.source} failed and was skipped — ${failure.message}`);
}

const problems = findCatalogueProblems(categories);
if (problems.length > 0) {
  console.error(`The ${source.name} catalogue did not survive validation:`);
  for (const problem of problems) console.error(`  - ${problem}`);
  console.error('Keeping the existing snapshot.');
  process.exit(1);
}

const count = countServices(categories);
const previousIds = serviceIds(previous);
const currentIds = serviceIds(categories);
const removed = [...previousIds].filter((id) => !currentIds.has(id));
const added = [...currentIds].filter((id) => !previousIds.has(id));

console.log(`Bokadirekt now lists ${count} services (previously ${countServices(previous)}).`);
if (removed.length > 0) console.log(`Withdrawn: ${removed.join(', ')}`);
if (added.length > 0) console.log(`New: ${added.join(', ')}`);

const serialised = `${JSON.stringify(categories, null, 1)}\n`;
const catalogueChanged = serialised !== `${JSON.stringify(previous, null, 1)}\n`;

if (catalogueChanged) await writeFile(SNAPSHOT, serialised, 'utf8');
console.log(catalogueChanged ? 'Snapshot written.' : 'Catalogue unchanged.');

const daysSince = (timestamp) => (Date.now() - Date.parse(timestamp)) / 86_400_000;
const metaIsStale = !previousMeta.fetchedAt || !(daysSince(previousMeta.fetchedAt) < KEEPALIVE_DAYS);
const degraded = failures.length > 0;

/* A source starting or stopping failing is worth a commit of its own: without
   it, "the API has been broken for a week" is visible only in expired logs. */
if (catalogueChanged || metaIsStale || degraded !== Boolean(previousMeta.degraded)) {
  await writeFile(
    META,
    `${JSON.stringify(
      {
        fetchedAt: new Date().toISOString(),
        source: source.name,
        serviceCount: count,
        degraded,
      },
      null,
      2,
    )}\n`,
    'utf8',
  );
  console.log('Metadata written.');
}

/* A successful fallback still means the preferred source is broken. Signal it
   so the workflow can raise it, without discarding the fresh catalogue. */
if (degraded) process.exitCode = 2;
