/**
 * The BeautySalon schema drives local discovery. A page that ships without it,
 * or with an address that drifts from the booking system, quietly costs
 * visibility — so the shape is asserted rather than trusted.
 */
import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const distDir = process.argv[2] ?? 'dist';

const REQUIRED_ADDRESS = { streetAddress: 'Spinnerivägen 1', postalCode: '448 50', addressLocality: 'Tollered' };

async function htmlFiles(dir) {
  const found = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) found.push(...(await htmlFiles(path)));
    else if (entry.name.endsWith('.html')) found.push(path);
  }
  return found;
}

/* The CMS lives at /admin, is noindex, and is not a page of the site. */
const isSitePage = (path) => !relative(distDir, path).startsWith('admin/');

const problems = [];
const pages = (await htmlFiles(distDir)).filter(isSitePage);

for (const page of pages) {
  const html = await readFile(page, 'utf8');
  const name = relative(distDir, page);
  const block = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);

  if (!block) {
    problems.push(`${name}: no JSON-LD block`);
    continue;
  }

  let schema;
  try {
    schema = JSON.parse(block[1]);
  } catch (error) {
    problems.push(`${name}: JSON-LD does not parse (${error.message})`);
    continue;
  }

  if (schema['@type'] !== 'BeautySalon') problems.push(`${name}: @type is ${schema['@type']}, expected BeautySalon`);

  for (const [key, expected] of Object.entries(REQUIRED_ADDRESS)) {
    if (schema.address?.[key] !== expected) {
      problems.push(`${name}: address.${key} is "${schema.address?.[key]}", expected "${expected}"`);
    }
  }

  if (!Array.isArray(schema.openingHoursSpecification) || schema.openingHoursSpecification.length === 0) {
    problems.push(`${name}: missing opening hours`);
  }
}

if (problems.length > 0) {
  for (const problem of problems) console.error(problem);
  process.exit(1);
}

console.log(`Structured data valid on all ${pages.length} pages.`);
