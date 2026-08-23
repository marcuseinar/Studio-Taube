import type { TranslationKey } from '../i18n/index.ts';

export interface NavItem {
  readonly labelKey: TranslationKey;
  readonly path: string;
}

/** Routes keep Swedish slugs in both locales; only the /en prefix differs. */
export const MAIN_NAV: readonly NavItem[] = [
  { labelKey: 'nav.treatments', path: '/behandlingar/' },
  { labelKey: 'nav.prices', path: '/priser/' },
  { labelKey: 'nav.campaigns', path: '/erbjudanden/' },
  { labelKey: 'nav.about', path: '/om-oss/' },
  { labelKey: 'nav.contact', path: '/kontakt/' },
];
