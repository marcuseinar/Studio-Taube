/**
 * Pure helpers for content shaping. Kept free of `astro:content` so they can
 * be unit-tested directly; the data access that needs Astro lives in
 * content.ts alongside them.
 */

/** Entry ids are `<locale>/<slug>`; this strips the locale to give the slug. */
export function entrySlug(id: string): string {
  const [, ...rest] = id.split('/');
  return rest.join('/');
}

export function groupByCategory<T extends { data: { category: string } }>(entries: T[]): Map<string, T[]> {
  const grouped = new Map<string, T[]>();
  for (const entry of entries) {
    const existing = grouped.get(entry.data.category);
    if (existing) existing.push(entry);
    else grouped.set(entry.data.category, [entry]);
  }
  return grouped;
}
