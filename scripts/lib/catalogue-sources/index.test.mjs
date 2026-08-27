import { describe, expect, it } from 'vitest';
import { fetchFromFirstWorkingSource, resolveSources } from './index.mjs';

const workingSource = (name, categories) => ({ name, fetchCatalogue: async () => categories });
const brokenSource = (name, message) => ({
  name,
  fetchCatalogue: async () => {
    throw new Error(message);
  },
});

const CATALOGUE = [{ name: 'Behandlingar', services: [] }];

describe('resolveSources', () => {
  it('reads the salon page when nothing is configured', () => {
    expect(resolveSources({}).chain.map((source) => source.name)).toEqual(['salon-page']);
  });

  it('puts the API in front of the page when asked to fall back', () => {
    expect(resolveSources({ BOKADIREKT_SOURCE: 'api+page' }).chain.map((source) => source.name)).toEqual([
      'bokadirekt-api',
      'salon-page',
    ]);
  });

  it('refuses an unrecognised source rather than silently using the default', () => {
    expect(() => resolveSources({ BOKADIREKT_SOURCE: 'guess' })).toThrow(/Unknown BOKADIREKT_SOURCE/);
  });
});

describe('fetchFromFirstWorkingSource', () => {
  it('uses the first source and reports no failures', async () => {
    const result = await fetchFromFirstWorkingSource([workingSource('api', CATALOGUE), workingSource('page', [])]);
    expect(result.source.name).toBe('api');
    expect(result.failures).toEqual([]);
  });

  it('falls back, and still reports the failure it worked around', async () => {
    const result = await fetchFromFirstWorkingSource([
      brokenSource('api', 'connection refused'),
      workingSource('page', CATALOGUE),
    ]);

    expect(result.source.name).toBe('page');
    expect(result.categories).toBe(CATALOGUE);
    expect(result.failures).toEqual([{ source: 'api', message: 'connection refused' }]);
  });

  it('throws with every reason when nothing works', async () => {
    await expect(
      fetchFromFirstWorkingSource([brokenSource('api', 'timed out'), brokenSource('page', 'HTTP 503')]),
    ).rejects.toThrow(/api: timed out[\s\S]*page: HTTP 503/);
  });
});
