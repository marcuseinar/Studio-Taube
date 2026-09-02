/**
 * Reports treatments Bokadirekt sells that the site does not publish.
 *
 * Not part of `npm run verify`: a treatment the salon added this morning is
 * not a reason to stop deploying. The sync workflow runs it with --strict and
 * turns a non-zero exit into a GitHub issue, which is a signal that reaches a
 * person once the site has been handed over.
 */
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { describeDrift, findCatalogueDrift, hasDrift } from './lib/catalogue-drift.mjs';

const SNAPSHOT = 'data/bokadirekt-catalogue.json';

/* Swedish only: every entry must exist in both locales or the build fails
   (D5), so one locale is the whole picture. */
const CONTENT_DIRECTORIES = ['src/content/services/sv', 'src/content/campaigns/sv'];

const strict = process.argv.includes('--strict');

async function readEntries(directory) {
  let files;
  try {
    files = await readdir(directory);
  } catch {
    return [];
  }

  const entries = await Promise.all(
    files
      .filter((file) => file.endsWith('.md'))
      .map(async (file) => {
        const frontmatter = await readFile(join(directory, file), 'utf8');
        const id = frontmatter.match(/^bokadirektServiceId:\s*(\d+)/m);
        return { slug: `${directory}/${file}`, bokadirektServiceId: id ? Number(id[1]) : undefined };
      }),
  );

  return entries;
}

const categories = JSON.parse(await readFile(SNAPSHOT, 'utf8'));
const entries = (await Promise.all(CONTENT_DIRECTORIES.map(readEntries))).flat();

const drift = findCatalogueDrift(categories, entries);

if (!hasDrift(drift)) {
  console.log('Every Bokadirekt treatment has a page, and every page has a treatment.');
  process.exit(0);
}

console.log(describeDrift(drift));
process.exit(strict ? 1 : 0);
