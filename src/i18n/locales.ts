export const LOCALES = ['sv', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'sv';

export const LOCALE_LABELS: Record<Locale, string> = { sv: 'Svenska', en: 'English' };
export const HTML_LANG: Record<Locale, string> = { sv: 'sv-SE', en: 'en' };

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/**
 * The deploy base, e.g. '/Studio-Taube/' on a project-path deploy and '/' on a
 * custom domain. Astro injects it; it is '/' under the unit test runner.
 */
const BASE = import.meta.env.BASE_URL ?? '/';

/**
 * The base is taken from the build by default, and passed explicitly by tests
 * so the project-path behaviour can be exercised without a build.
 */
export function stripBase(pathname: string, base: string = BASE): string {
  const prefix = base.replace(/\/$/, '');
  if (prefix !== '' && (pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return pathname.slice(prefix.length) || '/';
  }
  return pathname;
}

/** Resolves the locale from a URL path. Unprefixed paths are Swedish. */
export function localeFromPath(pathname: string, base: string = BASE): Locale {
  const [, first] = stripBase(pathname, base).split('/');
  return first !== undefined && isLocale(first) && first !== DEFAULT_LOCALE ? first : DEFAULT_LOCALE;
}

/**
 * Turns a site-root path into a href: adds the locale prefix, then the deploy
 * base. Every internal link goes through here, so a project-path deploy never
 * produces a link that skips the base.
 */
export function localisePath(path: string, locale: Locale, base: string = BASE): string {
  const normalised = path.startsWith('/') ? path : `/${path}`;
  const localised = locale === DEFAULT_LOCALE ? normalised : `/${locale}${normalised}`;
  return `${base.replace(/\/$/, '')}${localised}`;
}

/** The same page in the other locale, for the language switch. */
export function alternatePath(pathname: string, target: Locale, base: string = BASE): string {
  const stripped = stripBase(pathname, base).replace(/^\/(en)(?=\/|$)/, '') || '/';
  return localisePath(stripped, target, base);
}
