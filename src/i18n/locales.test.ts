import { describe, expect, it } from 'vitest';
import { alternatePath, localeFromPath, localisePath } from './locales.ts';

describe('localeFromPath', () => {
  it('treats an unprefixed path as Swedish', () => {
    expect(localeFromPath('/behandlingar/')).toBe('sv');
  });

  it('reads the English prefix', () => {
    expect(localeFromPath('/en/treatments/')).toBe('en');
  });

  it('treats the site root as Swedish', () => {
    expect(localeFromPath('/')).toBe('sv');
  });
});

describe('localisePath', () => {
  it('leaves Swedish routes unprefixed', () => {
    expect(localisePath('/priser/', 'sv')).toBe('/priser/');
  });

  it('prefixes English routes', () => {
    expect(localisePath('/prices/', 'en')).toBe('/en/prices/');
  });
});

describe('alternatePath', () => {
  it('switches a Swedish page to English', () => {
    expect(alternatePath('/kontakt/', 'en')).toBe('/en/kontakt/');
  });

  it('switches an English page back to Swedish', () => {
    expect(alternatePath('/en/kontakt/', 'sv')).toBe('/kontakt/');
  });

  it('keeps the root usable in both directions', () => {
    expect(alternatePath('/', 'en')).toBe('/en/');
    expect(alternatePath('/en/', 'sv')).toBe('/');
  });
});
