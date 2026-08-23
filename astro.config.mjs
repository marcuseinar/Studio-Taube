import { writeFileSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import svelte from '@astrojs/svelte';
import tailwindcss from '@tailwindcss/vite';

import { BASE_PATH, CUSTOM_DOMAIN, DEPLOY_TARGET, SITE_URL } from './src/lib/site.ts';

/**
 * Markdown authors write site-root links such as /behandlingar/head-spa/.
 * On a project-path deploy those need the base prefix, and asking content
 * editors to remember that would guarantee broken links.
 */
function prefixMarkdownLinks() {
  return (tree) => {
    const visit = (node) => {
      if (node.tagName === 'a') {
        const href = node.properties?.href;
        if (typeof href === 'string' && href.startsWith('/') && !href.startsWith('//')) {
          node.properties.href = BASE_PATH.replace(/\/$/, '') + href;
        }
      }
      for (const child of node.children ?? []) visit(child);
    };
    visit(tree);
  };
}

/** GitHub Pages reads the custom domain from a CNAME file at the site root. */
function emitCname() {
  return {
    name: 'studio-taube:cname',
    hooks: {
      'astro:build:done': ({ dir }) => {
        if (DEPLOY_TARGET !== 'custom-domain') return;
        writeFileSync(new URL('CNAME', dir), `${CUSTOM_DOMAIN}\n`);
      },
    },
  };
}

export default defineConfig({
  site: SITE_URL,
  base: BASE_PATH,
  trailingSlash: 'always',
  i18n: {
    defaultLocale: 'sv',
    locales: ['sv', 'en'],
    routing: { prefixDefaultLocale: false },
  },
  markdown: { rehypePlugins: [prefixMarkdownLinks] },
  integrations: [svelte(), sitemap({ i18n: { defaultLocale: 'sv', locales: { sv: 'sv-SE', en: 'en' } } }), emitCname()],
  vite: { plugins: [tailwindcss()] },
  build: { inlineStylesheets: 'auto' },
});
