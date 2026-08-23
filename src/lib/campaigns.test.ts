import { describe, expect, it } from 'vitest';
import { discountPercent, isCampaignActive } from './campaigns.ts';

const now = new Date('2026-08-23T12:00:00Z');

describe('isCampaignActive', () => {
  it('treats a campaign with no dates as running', () => {
    expect(isCampaignActive({}, now)).toBe(true);
  });

  it('hides a campaign that has not started', () => {
    expect(isCampaignActive({ validFrom: new Date('2026-09-01') }, now)).toBe(false);
  });

  it('shows a campaign on its final day', () => {
    expect(isCampaignActive({ validTo: new Date('2026-08-23') }, now)).toBe(true);
  });

  it('hides a campaign the day after it ends', () => {
    expect(isCampaignActive({ validTo: new Date('2026-08-22') }, now)).toBe(false);
  });

  it('respects both bounds together', () => {
    const period = { validFrom: new Date('2026-08-01'), validTo: new Date('2026-08-31') };
    expect(isCampaignActive(period, now)).toBe(true);
  });
});

describe('discountPercent', () => {
  it('reports the reduction against the ordinary price', () => {
    expect(discountPercent(760, 950)).toBe(20);
    expect(discountPercent(2999, 3499)).toBe(14);
  });
});
