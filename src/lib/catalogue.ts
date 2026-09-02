import rawCatalogue from '../../data/bokadirekt-catalogue.json';

/**
 * A snapshot of the salon's Bokadirekt catalogue, refreshed by the scheduled
 * sync workflow. Bokadirekt is the source of truth for what is on offer and at
 * what price (docs/DECISIONS.md D9), and this file is how the build sees it.
 */
export interface CatalogueService {
  readonly id: number;
  readonly name: string;
  readonly priceSek: number;
  readonly durationMinutes: number;
  /** Bokadirekt's "visa från-pris" flag: the price is a starting point. */
  readonly priceFrom: boolean;
  readonly categoryName: string;
}

interface RawService {
  id: number;
  name: string;
  price: number;
  duration: number;
  about?: { settings?: { showFrom?: boolean } };
}

interface RawCategory {
  name: string;
  services?: RawService[];
}

function indexById(categories: RawCategory[]): Map<number, CatalogueService> {
  const index = new Map<number, CatalogueService>();
  for (const category of categories) {
    for (const service of category.services ?? []) {
      index.set(service.id, {
        id: service.id,
        name: service.name.trim(),
        priceSek: service.price,
        durationMinutes: Math.round(service.duration / 60),
        priceFrom: service.about?.settings?.showFrom === true,
        categoryName: category.name,
      });
    }
  }
  return index;
}

const SERVICES = indexById(rawCatalogue as RawCategory[]);

/** Looks up a service by its Bokadirekt id. Absent means it is no longer sold. */
export function findCatalogueService(id: number): CatalogueService | undefined {
  return SERVICES.get(id);
}
