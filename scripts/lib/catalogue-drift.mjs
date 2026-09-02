/**
 * Finds the gaps between what Bokadirekt sells and what the site publishes.
 *
 * Prices, durations and withdrawals resolve themselves at build time
 * (docs/DECISIONS.md D11). Two things cannot, because they need words nobody
 * has written yet:
 *
 *   unlisted  Bokadirekt sells it, the site has no entry for it. Someone has
 *             to write a Swedish and an English description and pick a
 *             category. Inventing those is precisely what CLAUDE.md forbids,
 *             so the machine's job ends at saying which ones are missing.
 *   orphaned  A content entry points at a service Bokadirekt no longer lists.
 *             The page already stops rendering, so nothing is broken — but the
 *             file is now inert and will quietly do nothing forever.
 *
 * Renames are deliberately NOT reported. Display names on the site are
 * spelling-corrected against Bokadirekt's own typos by design (D9, and
 * docs/CONTENT-REVIEW.md lists them), so comparing titles would flag those
 * corrections every night. A report that cries wolf is a report nobody reads.
 */

export function findCatalogueDrift(categories, entries) {
  const referenced = new Set(
    entries.map((entry) => entry.bokadirektServiceId).filter((id) => Number.isInteger(id) && id > 0),
  );

  const unlisted = [];
  const catalogueIds = new Set();

  for (const category of categories ?? []) {
    for (const service of category?.services ?? []) {
      if (!Number.isInteger(service?.id)) continue;
      catalogueIds.add(service.id);

      if (!referenced.has(service.id)) {
        unlisted.push({
          id: service.id,
          name: String(service.name ?? '').trim(),
          categoryName: String(category.name ?? '').trim(),
          priceSek: service.price,
        });
      }
    }
  }

  const orphaned = entries
    .filter((entry) => Number.isInteger(entry.bokadirektServiceId) && !catalogueIds.has(entry.bokadirektServiceId))
    .map((entry) => ({ slug: entry.slug, bokadirektServiceId: entry.bokadirektServiceId }));

  return { unlisted, orphaned };
}

export const hasDrift = (drift) => drift.unlisted.length > 0 || drift.orphaned.length > 0;

/** A GitHub issue body. Markdown, because that is where this ends up. */
export function describeDrift(drift) {
  const lines = [];

  if (drift.unlisted.length > 0) {
    lines.push(
      `### ${drift.unlisted.length} treatment${drift.unlisted.length === 1 ? '' : 's'} on Bokadirekt but not on the site`,
      '',
      'Each needs a Swedish and an English description and a category before it can be published.',
      '',
      '| Bokadirekt id | Category | Name | Price |',
      '| --- | --- | --- | --- |',
      ...drift.unlisted.map(
        (service) => `| ${service.id} | ${service.categoryName} | ${service.name} | ${service.priceSek} kr |`,
      ),
      '',
    );
  }

  if (drift.orphaned.length > 0) {
    lines.push(
      `### ${drift.orphaned.length} content entr${drift.orphaned.length === 1 ? 'y' : 'ies'} pointing at a withdrawn service`,
      '',
      'These already stop rendering, so nothing on the site is wrong. The files are inert and want removing or repointing.',
      '',
      ...drift.orphaned.map((entry) => `- \`${entry.slug}\` → Bokadirekt id ${entry.bokadirektServiceId}`),
      '',
    );
  }

  return lines.join('\n').trimEnd();
}
