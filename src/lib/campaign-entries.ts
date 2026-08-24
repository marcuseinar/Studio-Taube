import type { CollectionEntry } from 'astro:content';
import { findCatalogueService } from './catalogue.ts';
import { resolveCampaign } from './campaigns.ts';
import { entrySlug } from './content-utils.ts';

export interface VisibleCampaign {
  readonly slug: string;
  readonly data: CollectionEntry<'campaigns'>['data'];
  /** From the Bokadirekt catalogue where the offer is tied to a service. */
  readonly priceSek: number;
}

/**
 * Drops offers the salon has withdrawn or dated out, and pins each surviving
 * price to the catalogue. See resolveCampaign for why this filters rather
 * than fails.
 */
export function visibleCampaigns(entries: CollectionEntry<'campaigns'>[], now: Date): VisibleCampaign[] {
  const visible: VisibleCampaign[] = [];

  for (const entry of entries) {
    const resolved = resolveCampaign(entry.data, findCatalogueService, now);
    if (!resolved.visible) continue;
    visible.push({ slug: entrySlug(entry.id), data: entry.data, priceSek: resolved.priceSek });
  }

  return visible;
}
