import type { ServiceCategory } from '../content.config.ts';
import type { Locale } from './locales.ts';

/** Display names per category. Slugs stay Swedish in both locales. */
export const CATEGORY_LABELS: Record<ServiceCategory, Record<Locale, string>> = {
  konsultation: { sv: 'Konsultation', en: 'Consultation' },
  ansiktsbehandlingar: { sv: 'Ansiktsbehandlingar', en: 'Facials' },
  'avancerad-hudvard': { sv: 'Avancerad hudvård', en: 'Advanced skincare' },
  'co2-laser': { sv: 'CO2-laser', en: 'CO2 laser' },
  'head-spa': { sv: 'Head spa', en: 'Head spa' },
  'lash-browlift': { sv: 'Lash & browlift', en: 'Lash & brow lift' },
  fransforlangning: { sv: 'Fransförlängning', en: 'Lash extensions' },
  'fransar-bryn': { sv: 'Fransar & bryn', en: 'Lashes & brows' },
  massage: { sv: 'Massage', en: 'Massage' },
  tandblekning: { sv: 'Tandblekning', en: 'Teeth whitening' },
  elevbehandlingar: { sv: 'Elevbehandlingar', en: 'Student treatments' },
};

export function categoryLabel(category: ServiceCategory, locale: Locale): string {
  return CATEGORY_LABELS[category][locale];
}
