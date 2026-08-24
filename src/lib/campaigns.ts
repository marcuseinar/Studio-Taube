import type { CatalogueService } from './catalogue.ts';

export interface CampaignPeriod {
  readonly validFrom?: Date | undefined;
  readonly validTo?: Date | undefined;
}

export interface CampaignOffer extends CampaignPeriod {
  readonly priceSek: number;
  readonly bokadirektServiceId?: number | undefined;
}

export type CampaignLookup = (id: number) => CatalogueService | undefined;

export type HiddenReason = 'before-start' | 'after-end' | 'withdrawn-from-bokadirekt';

export type ResolvedCampaign =
  { readonly visible: true; readonly priceSek: number } | { readonly visible: false; readonly reason: HiddenReason };

/**
 * Decides whether an offer may be shown, and at what price.
 *
 * An offer tied to a Bokadirekt service is shown only while that service is
 * still in the catalogue, and always at the catalogue's price. Advertising a
 * price the salon no longer honours is a marketing-law problem, so the
 * catalogue wins over anything typed into the content file.
 *
 * This is why visibility is derived rather than validated: if a withdrawn
 * offer failed the build instead, the deploy would stop and the stale price
 * would stay on the live site — the opposite of what is wanted.
 */
export function resolveCampaign(offer: CampaignOffer, lookup: CampaignLookup, now: Date): ResolvedCampaign {
  if (offer.validFrom && now < offer.validFrom) return { visible: false, reason: 'before-start' };
  if (offer.validTo && now > endOfDay(offer.validTo)) return { visible: false, reason: 'after-end' };

  if (offer.bokadirektServiceId === undefined) {
    return { visible: true, priceSek: offer.priceSek };
  }

  const service = lookup(offer.bokadirektServiceId);
  if (!service) return { visible: false, reason: 'withdrawn-from-bokadirekt' };

  return { visible: true, priceSek: service.priceSek };
}

function endOfDay(date: Date): Date {
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return end;
}

export function discountPercent(priceSek: number, ordinaryPriceSek: number): number {
  return Math.round((1 - priceSek / ordinaryPriceSek) * 100);
}
