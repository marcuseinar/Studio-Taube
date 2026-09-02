import { getCollection, type CollectionEntry } from 'astro:content';
import type { Locale } from '../i18n/index.ts';
import { findCatalogueService } from './catalogue.ts';
import { resolveService } from './services.ts';
import { entrySlug } from './content-utils.ts';

type LocalisedCollection = 'services' | 'campaigns' | 'staff' | 'pages';

async function localisedEntries<C extends LocalisedCollection>(
  collection: C,
  locale: Locale,
): Promise<CollectionEntry<C>[]> {
  const entries = await getCollection(collection);
  return entries.filter((entry) => entry.id.startsWith(`${locale}/`));
}

/**
 * Treatments the salon still sells, priced as Bokadirekt prices them.
 *
 * The resolution happens here rather than in each view so that no page can
 * render a treatment on the content file's terms by forgetting to ask — see
 * resolveService and docs/DECISIONS.md D11.
 */
export async function getServices(locale: Locale) {
  const services = await localisedEntries('services', locale);

  return services
    .sort((a, b) => a.data.order - b.data.order)
    .flatMap((entry) => {
      const resolved = resolveService(entry.data, findCatalogueService);
      if (!resolved.visible) return [];

      const { priceSek, durationMinutes, priceFrom, isFree } = resolved;
      return [{ ...entry, data: { ...entry.data, priceSek, durationMinutes, priceFrom, isFree } }];
    });
}

export async function getCampaigns(locale: Locale) {
  const campaigns = await localisedEntries('campaigns', locale);
  return campaigns.sort((a, b) => a.data.priority - b.data.priority);
}

export async function getStaff(locale: Locale) {
  const staff = await localisedEntries('staff', locale);
  return staff.sort((a, b) => a.data.order - b.data.order);
}

export async function getPage(slug: string, locale: Locale) {
  const pages = await localisedEntries('pages', locale);
  const page = pages.find((entry) => entrySlug(entry.id) === slug);
  if (!page) throw new Error(`Missing page "${slug}" for locale "${locale}".`);
  return page;
}

export { entrySlug, groupByCategory } from './content-utils.ts';
