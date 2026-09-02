import type { CatalogueService } from './catalogue.ts';

export interface ServiceOffer {
  readonly priceSek: number;
  readonly durationMinutes: number;
  readonly priceFrom: boolean;
  readonly bokadirektServiceId?: number | undefined;
}

export type ServiceLookup = (id: number) => CatalogueService | undefined;

export interface ServicePricing {
  readonly priceSek: number;
  readonly durationMinutes: number;
  readonly priceFrom: boolean;
  readonly isFree: boolean;
}

export type ResolvedService =
  | ({ readonly visible: true } & ServicePricing)
  | { readonly visible: false; readonly reason: 'withdrawn-from-bokadirekt' };

/**
 * Decides whether a treatment may be shown, and on what terms.
 *
 * This is docs/DECISIONS.md D11 applied to the rest of the catalogue. D11
 * pinned campaign prices to Bokadirekt because advertising a price the salon
 * no longer honours is a marketing-law problem — which is just as true of an
 * ordinary treatment, and was left unfixed for far longer. The content file
 * stays the source of the description, which is the thing it genuinely
 * authors; everything a visitor could hold the salon to comes from Bokadirekt.
 *
 * Withdrawn treatments stop rendering rather than failing the build, for the
 * reason D11 gives: a build that refuses to deploy strands the live site on
 * exactly the prices that are wrong.
 */
export function resolveService(offer: ServiceOffer, lookup: ServiceLookup): ResolvedService {
  /* No id means nothing in Bokadirekt to check against — an editorial entry
     stands on what the content file says. */
  if (offer.bokadirektServiceId === undefined) {
    return {
      visible: true,
      priceSek: offer.priceSek,
      durationMinutes: offer.durationMinutes,
      priceFrom: offer.priceFrom,
      isFree: offer.priceSek === 0,
    };
  }

  const service = lookup(offer.bokadirektServiceId);
  if (!service) return { visible: false, reason: 'withdrawn-from-bokadirekt' };

  return {
    visible: true,
    priceSek: service.priceSek,
    durationMinutes: service.durationMinutes,
    priceFrom: service.priceFrom,
    /* Derived, never carried over: a consultation the salon starts charging
       for must stop announcing itself as free. */
    isFree: service.priceSek === 0,
  };
}
