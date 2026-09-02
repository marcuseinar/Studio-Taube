import { describe, expect, it } from 'vitest';
import { describeDrift, findCatalogueDrift, hasDrift } from './catalogue-drift.mjs';

const catalogue = [
  {
    name: 'Head spa',
    services: [
      { id: 1, name: ' Head spa 60 minuter ', price: 950 },
      { id: 2, name: 'Head & face spa', price: 1450 },
    ],
  },
  { name: 'KAMPANJ', services: [{ id: 3, name: 'Cool peel', price: 2999 }] },
];

const entry = (slug, bokadirektServiceId) => ({ slug, bokadirektServiceId });

describe('findCatalogueDrift', () => {
  it('is quiet when every treatment has an entry and every entry a treatment', () => {
    const drift = findCatalogueDrift(catalogue, [entry('a.md', 1), entry('b.md', 2), entry('c.md', 3)]);

    expect(drift).toEqual({ unlisted: [], orphaned: [] });
    expect(hasDrift(drift)).toBe(false);
  });

  it('reports a treatment Bokadirekt sells that the site has no entry for', () => {
    const drift = findCatalogueDrift(catalogue, [entry('a.md', 1), entry('c.md', 3)]);

    expect(drift.unlisted).toEqual([{ id: 2, name: 'Head & face spa', categoryName: 'Head spa', priceSek: 1450 }]);
  });

  it('trims the name, because Bokadirekt pads them', () => {
    const drift = findCatalogueDrift(catalogue, []);
    expect(drift.unlisted[0].name).toBe('Head spa 60 minuter');
  });

  it('counts a campaign entry as covering its service, so offers are not flagged as missing', () => {
    const drift = findCatalogueDrift(catalogue, [entry('a.md', 1), entry('b.md', 2), entry('kampanj.md', 3)]);
    expect(drift.unlisted).toEqual([]);
  });

  it('reports an entry pointing at a service Bokadirekt no longer lists', () => {
    const drift = findCatalogueDrift(catalogue, [
      entry('a.md', 1),
      entry('b.md', 2),
      entry('c.md', 3),
      entry('gone.md', 999),
    ]);

    expect(drift.orphaned).toEqual([{ slug: 'gone.md', bokadirektServiceId: 999 }]);
  });

  it('ignores an editorial entry with no Bokadirekt id rather than calling it orphaned', () => {
    const drift = findCatalogueDrift(catalogue, [
      entry('a.md', 1),
      entry('b.md', 2),
      entry('c.md', 3),
      entry('editorial.md', undefined),
    ]);

    expect(drift.orphaned).toEqual([]);
  });

  it('survives a catalogue category carrying no services', () => {
    expect(() => findCatalogueDrift([{ name: 'Tom' }], [])).not.toThrow();
  });
});

describe('describeDrift', () => {
  it('writes a table a person can act on', () => {
    const body = describeDrift(findCatalogueDrift(catalogue, [entry('a.md', 1), entry('c.md', 3)]));

    expect(body).toContain('1 treatment on Bokadirekt but not on the site');
    expect(body).toContain('| 2 | Head spa | Head & face spa | 1450 kr |');
  });

  it('says what an orphaned entry means, since nothing is visibly broken', () => {
    const body = describeDrift(
      findCatalogueDrift(catalogue, [entry('a.md', 1), entry('b.md', 2), entry('c.md', 3), entry('gone.md', 999)]),
    );

    expect(body).toContain('already stop rendering');
    expect(body).toContain('`gone.md` → Bokadirekt id 999');
  });

  it('pluralises so the issue title does not read like a bug', () => {
    const one = describeDrift({ unlisted: [{ id: 1, name: 'A', categoryName: 'C', priceSek: 1 }], orphaned: [] });
    const two = describeDrift({
      unlisted: [
        { id: 1, name: 'A', categoryName: 'C', priceSek: 1 },
        { id: 2, name: 'B', categoryName: 'C', priceSek: 2 },
      ],
      orphaned: [],
    });

    expect(one).toContain('1 treatment on');
    expect(two).toContain('2 treatments on');
  });
});
