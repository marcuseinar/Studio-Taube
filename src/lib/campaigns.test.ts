import { describe, expect, it } from 'vitest';
import { discountPercent, resolveCampaign, type CampaignLookup } from './campaigns.ts';

const now = new Date('2026-08-23T12:00:00Z');

const HEAD_SPA = {
  id: 3464121,
  name: 'Head spa 60 min',
  priceSek: 760,
  durationMinutes: 70,
  priceFrom: false,
  categoryName: 'KAMPANJ',
};

const onBokadirekt: CampaignLookup = (id) => (id === HEAD_SPA.id ? HEAD_SPA : undefined);
const withdrawn: CampaignLookup = () => undefined;

describe('resolveCampaign', () => {
  it('shows an offer that is still in the Bokadirekt catalogue', () => {
    const result = resolveCampaign({ priceSek: 760, bokadirektServiceId: HEAD_SPA.id }, onBokadirekt, now);
    expect(result).toEqual({ visible: true, priceSek: 760 });
  });

  it('hides an offer the salon has withdrawn, even with no end date', () => {
    const result = resolveCampaign({ priceSek: 760, bokadirektServiceId: HEAD_SPA.id }, withdrawn, now);
    expect(result).toEqual({ visible: false, reason: 'withdrawn-from-bokadirekt' });
  });

  it('takes the price from Bokadirekt when the content file has drifted', () => {
    // Content still says 760; the salon has since raised it to 800.
    const raised: CampaignLookup = () => ({ ...HEAD_SPA, priceSek: 800 });
    const result = resolveCampaign({ priceSek: 760, bokadirektServiceId: HEAD_SPA.id }, raised, now);
    expect(result).toEqual({ visible: true, priceSek: 800 });
  });

  it('hides an offer before it starts', () => {
    const result = resolveCampaign(
      { priceSek: 760, bokadirektServiceId: HEAD_SPA.id, validFrom: new Date('2026-09-01') },
      onBokadirekt,
      now,
    );
    expect(result).toEqual({ visible: false, reason: 'before-start' });
  });

  it('shows an offer on its final day', () => {
    const result = resolveCampaign(
      { priceSek: 760, bokadirektServiceId: HEAD_SPA.id, validTo: new Date('2026-08-23') },
      onBokadirekt,
      now,
    );
    expect(result).toEqual({ visible: true, priceSek: 760 });
  });

  it('hides an offer the day after it ends', () => {
    const result = resolveCampaign(
      { priceSek: 760, bokadirektServiceId: HEAD_SPA.id, validTo: new Date('2026-08-22') },
      onBokadirekt,
      now,
    );
    expect(result).toEqual({ visible: false, reason: 'after-end' });
  });

  it('lets an end date withdraw an offer that is still listed on Bokadirekt', () => {
    const result = resolveCampaign(
      { priceSek: 760, bokadirektServiceId: HEAD_SPA.id, validTo: new Date('2026-08-01') },
      onBokadirekt,
      now,
    );
    expect(result.visible).toBe(false);
  });

  it('shows an editorial offer that is not tied to a Bokadirekt service', () => {
    const result = resolveCampaign({ priceSek: 500 }, withdrawn, now);
    expect(result).toEqual({ visible: true, priceSek: 500 });
  });
});

describe('discountPercent', () => {
  it('reports the reduction against the ordinary price', () => {
    expect(discountPercent(760, 950)).toBe(20);
    expect(discountPercent(2999, 3499)).toBe(14);
  });
});
