import { en } from './en.ts';
import { sv, type TranslationKey } from './sv.ts';
import type { Locale } from './locales.ts';

const TRANSLATIONS: Record<Locale, Record<TranslationKey, string>> = { sv, en };

/** Returns a translator bound to one locale. A missing key is a type error. */
export function useTranslations(locale: Locale) {
  return function t(key: TranslationKey): string {
    return TRANSLATIONS[locale][key];
  };
}

export type { TranslationKey };
export * from './locales.ts';
