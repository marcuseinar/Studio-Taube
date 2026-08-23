/**
 * Reports content still awaiting human review, and fails if a Swedish entry
 * has no English counterpart. A half-translated page is worse than an
 * obviously missing one — see CLAUDE.md §9.
 */
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const CONTENT = 'src/content';
const COLLECTIONS = ['services', 'campaigns', 'staff', 'pages'];

const slugsIn = async (collection, locale) => {
  try {
    const files = await readdir(join(CONTENT, collection, locale));
    return files.filter((file) => file.endsWith('.md')).map((file) => file.replace(/\.md$/, ''));
  } catch {
    return [];
  }
};

let missing = 0;
let needsReview = 0;

for (const collection of COLLECTIONS) {
  const swedish = await slugsIn(collection, 'sv');
  const english = new Set(await slugsIn(collection, 'en'));

  for (const slug of swedish) {
    if (!english.has(slug)) {
      console.error(`Missing English entry: ${collection}/${slug}`);
      missing += 1;
    }
  }

  for (const slug of english) {
    const body = await readFile(join(CONTENT, collection, 'en', `${slug}.md`), 'utf8');
    if (/translationStatus:\s*['"]?needs-review/.test(body)) needsReview += 1;
  }
}

if (missing > 0) {
  console.error(`\n${missing} entries have no English translation.`);
  process.exit(1);
}

console.log(`All Swedish entries have an English counterpart.`);
if (needsReview > 0) {
  console.log(`${needsReview} English entries are still marked needs-review and want a human read-through.`);
}
