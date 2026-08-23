/**
 * One-time seeder. Turns the Bokadirekt catalogue snapshot in
 * data/bokadirekt-catalogue.json into content collection entries.
 *
 * Bokadirekt is the source of truth for names, prices and durations
 * (docs/DECISIONS.md D9). This script never overwrites an existing file, so
 * edits made in the CMS survive a re-run.
 */
import { mkdirSync, existsSync, writeFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { CATEGORY_MAP, SERVICE_EN, SKIP_SERVICE_IDS } from './seed-translations.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT = join(ROOT, 'src', 'content');

const catalogue = JSON.parse(await readFile(join(ROOT, 'data', 'bokadirekt-catalogue.json'), 'utf8'));

const cleanText = (raw) =>
  (raw ?? '')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

const firstSentence = (text, fallback) => {
  const flat = text.replace(/\n+/g, ' ').trim();
  if (!flat) return fallback;
  const cut = flat.match(/^.{20,160}?[.!?](\s|$)/);
  return (cut ? cut[0] : flat.slice(0, 150)).trim();
};

const yamlString = (value) => `"${String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;

const frontmatter = (fields) =>
  Object.entries(fields)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}: ${typeof value === 'string' ? yamlString(value) : value}`)
    .join('\n');

const write = (relativePath, fields, body) => {
  const file = join(CONTENT, relativePath);
  if (existsSync(file)) return false;
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, `---\n${frontmatter(fields)}\n---\n\n${body}\n`, 'utf8');
  return true;
};

let written = 0;
let order = 0;

for (const category of catalogue) {
  const mapping = CATEGORY_MAP[category.id];
  if (!mapping || mapping.kind !== 'services') continue;

  for (const service of category.services) {
    if (SKIP_SERVICE_IDS.has(service.id)) continue;

    const about = service.about ?? {};
    const slug = about.slug;
    const svBody = cleanText(about.description);
    const english = SERVICE_EN[service.id];

    if (!english) {
      console.warn(`No English copy for ${service.id} (${service.name.trim()}) — skipping.`);
      continue;
    }

    const shared = {
      category: mapping.slug,
      durationMinutes: Math.round(service.duration / 60),
      priceSek: service.price,
      priceFrom: about.settings?.showFrom === true || /^Från/i.test(service.priceLabel ?? ''),
      isFree: service.price === 0,
      requiresConsultation: mapping.slug === 'co2-laser',
      performedByStudent: mapping.slug === 'elevbehandlingar',
      bokadirektServiceId: service.id,
      bokadirektSlug: slug,
      order: order++,
      featured: mapping.featured === true,
    };

    const svTitle = english.svTitle ?? service.name.trim();
    written += write(
      `services/sv/${slug}.md`,
      { title: svTitle, ...shared, summary: english.svSummary ?? firstSentence(svBody, svTitle) },
      svBody || `## ${svTitle}`,
    );

    written += write(
      `services/en/${slug}.md`,
      { title: english.title, ...shared, summary: english.summary, translationStatus: 'needs-review' },
      cleanText(english.body) || `## ${english.title}`,
    );
  }
}

console.log(`Seeded ${written} content files.`);
