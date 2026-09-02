import { describe, expect, it } from 'vitest';
import type { CatalogueService } from './catalogue.ts';
import { resolveService } from './services.ts';

const catalogueService = (overrides: Partial<CatalogueService> = {}): CatalogueService => ({
  id: 3372866,
  name: 'Head spa 60 minuter',
  priceSek: 950,
  durationMinutes: 60,
  priceFrom: false,
  categoryName: 'Head spa',
  ...overrides,
});

/** What the content file says, which may be months out of date. */
const contentEntry = (overrides = {}) => ({
  priceSek: 760,
  durationMinutes: 45,
  priceFrom: false,
  bokadirektServiceId: 3372866,
  ...overrides,
});

const found = (service: CatalogueService) => () => service;
const withdrawn = () => undefined;

describe('resolveService', () => {
  it('prices a treatment as Bokadirekt prices it, not as the content file does', () => {
    const resolved = resolveService(contentEntry(), found(catalogueService()));

    expect(resolved.visible).toBe(true);
    if (!resolved.visible) return;
    expect(resolved.priceSek).toBe(950);
    expect(resolved.durationMinutes).toBe(60);
  });

  it('stops rendering a treatment the salon has withdrawn', () => {
    const resolved = resolveService(contentEntry(), withdrawn);

    expect(resolved.visible).toBe(false);
    if (resolved.visible) return;
    expect(resolved.reason).toBe('withdrawn-from-bokadirekt');
  });

  it('follows the catalogue when a free treatment starts costing money', () => {
    const resolved = resolveService(contentEntry({ priceSek: 0 }), found(catalogueService({ priceSek: 500 })));

    expect(resolved.visible).toBe(true);
    if (!resolved.visible) return;
    expect(resolved.priceSek).toBe(500);
    expect(resolved.isFree).toBe(false);
  });

  it('calls a treatment free when the catalogue prices it at nothing', () => {
    const resolved = resolveService(contentEntry({ priceSek: 400 }), found(catalogueService({ priceSek: 0 })));

    expect(resolved.visible).toBe(true);
    if (!resolved.visible) return;
    expect(resolved.isFree).toBe(true);
  });

  it("follows the catalogue's from-price flag", () => {
    const resolved = resolveService(contentEntry({ priceFrom: false }), found(catalogueService({ priceFrom: true })));

    expect(resolved.visible).toBe(true);
    if (!resolved.visible) return;
    expect(resolved.priceFrom).toBe(true);
  });

  it('leaves an editorial entry with no Bokadirekt id on its own terms', () => {
    const resolved = resolveService(
      contentEntry({ bokadirektServiceId: undefined, priceSek: 1200, durationMinutes: 90 }),
      withdrawn,
    );

    expect(resolved.visible).toBe(true);
    if (!resolved.visible) return;
    expect(resolved.priceSek).toBe(1200);
    expect(resolved.durationMinutes).toBe(90);
  });
});
