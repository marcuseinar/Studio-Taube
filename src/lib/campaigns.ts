export interface CampaignPeriod {
  readonly validFrom?: Date | undefined;
  readonly validTo?: Date | undefined;
}

/**
 * A campaign with no end date runs until the salon removes it, which is how
 * Bokadirekt models them. An absent bound is therefore open, not zero.
 */
export function isCampaignActive(period: CampaignPeriod, now: Date): boolean {
  if (period.validFrom && now < period.validFrom) return false;
  if (period.validTo && now > endOfDay(period.validTo)) return false;
  return true;
}

function endOfDay(date: Date): Date {
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return end;
}

export function discountPercent(priceSek: number, ordinaryPriceSek: number): number {
  return Math.round((1 - priceSek / ordinaryPriceSek) * 100);
}
