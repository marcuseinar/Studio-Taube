import { describe, expect, it } from 'vitest';
import { countServices, findCatalogueProblems, serviceIds } from './catalogue-shape.mjs';

const service = (overrides = {}) => ({ id: 1, name: 'Head spa', price: 950, duration: 3600, ...overrides });

/** A catalogue that comfortably clears the plausibility floor. */
const plausible = (services = []) => [
  { name: 'Behandlingar', services: Array.from({ length: 12 }, (_, i) => service({ id: i + 100 })).concat(services) },
];

describe('findCatalogueProblems', () => {
  it('accepts a catalogue that carries everything the site reads', () => {
    expect(findCatalogueProblems(plausible())).toEqual([]);
  });

  it('rejects a payload that is not an array', () => {
    expect(findCatalogueProblems({ services: [] })).toEqual(['The catalogue is object, not an array.']);
    expect(findCatalogueProblems(null)).toEqual(['The catalogue is null, not an array.']);
  });

  it('rejects a catalogue too small to be the real one', () => {
    const problems = findCatalogueProblems([{ name: 'Behandlingar', services: [service()] }]);
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain('Only 1 services');
  });

  it('treats a free treatment as priced, but a missing price as broken', () => {
    expect(findCatalogueProblems(plausible([service({ id: 900, price: 0 })]))).toEqual([]);

    const problems = findCatalogueProblems(plausible([service({ id: 901, price: undefined })]));
    expect(problems.some((problem) => problem.includes('no usable price'))).toBe(true);
  });

  it('rejects a duration that could not produce a real appointment', () => {
    const problems = findCatalogueProblems(plausible([service({ id: 902, duration: 0 })]));
    expect(problems.some((problem) => problem.includes('no usable duration'))).toBe(true);
  });

  it('catches a duplicated service id, which would misroute booking links', () => {
    const problems = findCatalogueProblems(plausible([service({ id: 100 })]));
    expect(problems).toContain('Service id 100 appears more than once.');
  });

  it('names the category that has no name', () => {
    const problems = findCatalogueProblems([...plausible(), { services: [] }]);
    expect(problems).toContain('Category 1 has no name.');
  });

  it('reports a services value that is not a list rather than treating it as empty', () => {
    const problems = findCatalogueProblems([...plausible(), { name: 'Trasig', services: 'nope' }]);
    expect(problems).toContain('Category 1 has a services value that is not an array.');
  });
});

describe('countServices', () => {
  it('totals across categories and tolerates a category with none', () => {
    expect(countServices([{ name: 'A', services: [service()] }, { name: 'B' }])).toBe(1);
  });

  it('is zero for anything that is not a catalogue', () => {
    expect(countServices(undefined)).toBe(0);
  });
});

describe('serviceIds', () => {
  it('collects every id across categories', () => {
    const ids = serviceIds([
      { name: 'A', services: [service({ id: 1 })] },
      { name: 'B', services: [service({ id: 2 })] },
    ]);
    expect([...ids].sort()).toEqual([1, 2]);
  });
});
