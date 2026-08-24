/**
 * Refreshes data/bokadirekt-catalogue.json from the live salon page.
 *
 * Run on a schedule, not during a normal build: the build must stay offline
 * and reproducible. When an offer disappears from Bokadirekt, this is what
 * lets the next deploy stop advertising it.
 *
 * It refuses to write a catalogue that looks broken, because an empty or
 * truncated snapshot would silently hide every offer and every price.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { countServices, parseCatalogue } from './lib/parse-bokadirekt.mjs';

const SALON_URL = 'https://www.bokadirekt.se/places/studio-taube-56559';
const SNAPSHOT = 'data/bokadirekt-catalogue.json';
const MINIMUM_PLAUSIBLE_SERVICES = 10;

const previous = JSON.parse(await readFile(SNAPSHOT, 'utf8'));
const previousCount = countServices(previous);

const response = await fetch(SALON_URL, {
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36',
    'Accept-Language': 'sv-SE,sv;q=0.9',
  },
});

if (!response.ok) {
  console.error(`Bokadirekt returned ${response.status}. Keeping the existing snapshot.`);
  process.exit(1);
}

const categories = parseCatalogue(await response.text());
const count = countServices(categories);

if (count < MINIMUM_PLAUSIBLE_SERVICES) {
  console.error(`Parsed only ${count} services, which is not plausible. Keeping the existing snapshot.`);
  process.exit(1);
}

const previousIds = new Set(previous.flatMap((c) => (c.services ?? []).map((s) => s.id)));
const currentIds = new Set(categories.flatMap((c) => (c.services ?? []).map((s) => s.id)));

const removed = [...previousIds].filter((id) => !currentIds.has(id));
const added = [...currentIds].filter((id) => !previousIds.has(id));

console.log(`Bokadirekt now lists ${count} services (previously ${previousCount}).`);
if (removed.length > 0) console.log(`Withdrawn: ${removed.join(', ')}`);
if (added.length > 0) console.log(`New: ${added.join(', ')}`);

await writeFile(SNAPSHOT, `${JSON.stringify(categories, null, 1)}\n`, 'utf8');
console.log('Snapshot written.');
