/**
 * Reports how fresh the catalogue snapshot is.
 *
 * Part of `npm run verify`, where it only ever reports — see the note in
 * lib/catalogue-freshness.mjs about why staleness must not block a deploy.
 * Pass --strict to make an alarm a failing exit code; the health-check
 * workflow uses that to open an issue, which is a signal a human actually
 * receives.
 */
import { readFile } from 'node:fs/promises';
import { assessFreshness } from './lib/catalogue-freshness.mjs';

const META = 'data/bokadirekt-catalogue.meta.json';
const strict = process.argv.includes('--strict');

let meta;
try {
  meta = JSON.parse(await readFile(META, 'utf8'));
} catch {
  meta = undefined;
}

const { level, summary } = assessFreshness(meta);

if (level === 'ok') {
  console.log(summary);
  process.exit(0);
}

const label = level === 'alarm' ? 'STALE CATALOGUE' : 'WARNING';
console.error(`${label}: ${summary}`);

if (level === 'alarm') {
  console.error(
    'Check the "Sync Bokadirekt catalogue" workflow. If GitHub disabled it for inactivity, re-enable it in the Actions tab.',
  );
}

process.exit(strict && level === 'alarm' ? 1 : 0);
