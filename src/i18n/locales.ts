export const LOCALES = ['sv', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'sv';

export const LOCALE_LABELS: Record<Locale, string> = { sv: 'Svenska', en: 'English' };
export const HTML_LANG: Record<Locale, string> = { sv: 'sv-SE', en: 'en' };

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/** Resolves the locale from a URL path. Unprefixed paths are Swedish. */
export function localeFromPath(pathname: string): Locale {
  const [, first] = pathname.split('/');
  return first !== undefined && isLocale(first) && first !== DEFAULT_LOCALE ? first : DEFAULT_LOCALE;
}

/** Prefixes a route with its locale. The default locale stays unprefixed. */
export function localisePath(path: string, locale: Locale): string {
  const normalised = path.startsWith('/') ? path : `/${path}`;
  return locale === DEFAULT_LOCALE ? normalised : `/${locale}${normalised}`;
}

/** The same page in the other locale, for the language switch. */
export function alternatePath(pathname: string, target: Locale): string {
  const stripped = pathname.replace(/^\/(en)(?=\/|$)/, '') || '/';
  return localisePath(stripped, target);
}
