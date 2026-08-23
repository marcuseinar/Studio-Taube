import { describe, expect, it } from 'vitest';
import { entrySlug, groupByCategory } from './content-utils.ts';

describe('entrySlug', () => {
  it('strips the locale segment from an entry id', () => {
    expect(entrySlug('sv/head-spa-60-minuter')).toBe('head-spa-60-minuter');
    expect(entrySlug('en/head-spa-60-minuter')).toBe('head-spa-60-minuter');
  });
});

describe('groupByCategory', () => {
  it('keeps entries in the order they were given', () => {
    const entries = [
      { data: { category: 'massage' } },
      { data: { category: 'head-spa' } },
      { data: { category: 'massage' } },
    ];
    const grouped = groupByCategory(entries);
    expect([...grouped.keys()]).toEqual(['massage', 'head-spa']);
    expect(grouped.get('massage')).toHaveLength(2);
  });
});
