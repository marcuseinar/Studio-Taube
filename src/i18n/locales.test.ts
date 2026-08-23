import { describe, expect, it } from 'vitest';
import { alternatePath, localeFromPath, localisePath, stripBase } from './locales.ts';

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

/**
 * A project-path deploy (github.io/Studio-Taube) is the case that breaks
 * hand-built links, so it gets its own coverage.
 */
describe('with a deploy base', () => {
  const base = '/Studio-Taube/';

  it('prefixes Swedish routes with the base', () => {
    expect(localisePath('/priser/', 'sv', base)).toBe('/Studio-Taube/priser/');
  });

  it('prefixes English routes with the base, before the locale', () => {
    expect(localisePath('/priser/', 'en', base)).toBe('/Studio-Taube/en/priser/');
  });

  it('reads the locale from a based path', () => {
    expect(localeFromPath('/Studio-Taube/en/priser/', base)).toBe('en');
    expect(localeFromPath('/Studio-Taube/priser/', base)).toBe('sv');
  });

  it('switches locale without losing or doubling the base', () => {
    expect(alternatePath('/Studio-Taube/kontakt/', 'en', base)).toBe('/Studio-Taube/en/kontakt/');
    expect(alternatePath('/Studio-Taube/en/kontakt/', 'sv', base)).toBe('/Studio-Taube/kontakt/');
  });

  it('handles the based root in both directions', () => {
    expect(alternatePath('/Studio-Taube/', 'en', base)).toBe('/Studio-Taube/en/');
    expect(alternatePath('/Studio-Taube/en/', 'sv', base)).toBe('/Studio-Taube/');
  });

  it('leaves a path that does not carry the base alone', () => {
    expect(stripBase('/priser/', base)).toBe('/priser/');
  });
});
