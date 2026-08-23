import type { Locale } from '../i18n/locales.ts';

const PRICE_LOCALE: Record<Locale, string> = { sv: 'sv-SE', en: 'en-GB' };

/**
 * Prices are stored as whole SEK. Formatting belongs here, never in content —
 * a stored "från 1 450 kr" cannot be translated or sorted.
 */
export function formatPrice(priceSek: number, locale: Locale): string {
  const amount = new Intl.NumberFormat(PRICE_LOCALE[locale], { maximumFractionDigits: 0 }).format(priceSek);
  return `${amount} kr`;
}

export function formatPriceRange(priceSek: number, priceFrom: boolean, locale: Locale): string {
  const price = formatPrice(priceSek, locale);
  if (!priceFrom) return price;
  return locale === 'sv' ? `Från ${price.toLowerCase()}` : `From ${price}`;
}

export function formatDuration(minutes: number, locale: Locale): string {
  return locale === 'sv' ? `${minutes} min` : `${minutes} min`;
}

export function formatPhoneForHumans(e164: string): string {
  const national = e164.replace('+46', '0');
  return national.replace(/^(\d{3})(\d{3})(\d{2})(\d{2})$/, '$1-$2 $3 $4');
}
