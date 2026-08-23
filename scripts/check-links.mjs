/**
 * Every internal link must resolve to a page the build actually produced.
 * A broken link on a salon site costs a booking, so this is a gate.
 */
import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const distDir = process.argv[2] ?? 'dist';

async function htmlFiles(dir) {
  const found = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) found.push(...(await htmlFiles(path)));
    else if (entry.name.endsWith('.html')) found.push(path);
  }
  return found;
}

const pages = await htmlFiles(distDir);
const routes = new Set(pages.map((page) => `/${relative(distDir, page).replace(/index\.html$/, '')}`));

/*
 * Links carry the deploy base, dist paths do not. The canonical URL on the
 * home page is exactly the base, so read it from the build rather than
 * duplicating the value here where it could drift.
 */
const home = await readFile(join(distDir, 'index.html'), 'utf8');
const canonical = home.match(/<link rel="canonical" href="([^"]*)"/)?.[1];
const base = canonical ? new URL(canonical).pathname.replace(/\/$/, '') : '';

const broken = [];
for (const page of pages) {
  const html = await readFile(page, 'utf8');
  for (const match of html.matchAll(/href="(\/[^"#?]*)"/g)) {
    const href = match[1];
    const rooted = base !== '' && href.startsWith(`${base}/`) ? href.slice(base.length) : href;
    if (rooted.startsWith('/_astro/')) continue;
    const normalised = rooted.endsWith('/') ? rooted : `${rooted}/`;
    const isFile = /\.[a-z0-9]+$/i.test(rooted);
    if (isFile || routes.has(normalised)) continue;
    broken.push({ page: relative(distDir, page), href });
  }
}

if (broken.length > 0) {
  for (const { page, href } of broken) console.error(`Broken internal link in ${page}: ${href}`);
  process.exit(1);
}

console.log(`Checked ${pages.length} pages, all internal links resolve.`);
