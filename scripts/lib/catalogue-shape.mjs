/**
 * Guards what is allowed to become the catalogue snapshot.
 *
 * The snapshot is the only thing standing between the salon's real prices and
 * the ones printed on the site, and it is written by a job nobody watches.
 * Whichever source produced a payload — the salon page today, the Bokadirekt
 * API once credentials exist (docs/DECISIONS.md D12) — a shape nobody expected
 * has to fail here, while the previous snapshot is still on disk.
 *
 * Only the fields the nightly path actually reads are required. Bokadirekt
 * adds keys to this payload regularly; demanding all of them would turn every
 * harmless addition into an outage.
 */

export const MINIMUM_PLAUSIBLE_SERVICES = 10;

const isPlainObject = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);

function findServiceProblems(service, where) {
  const problems = [];

  if (!isPlainObject(service)) return [`${where} is not an object.`];

  if (!Number.isInteger(service.id) || service.id <= 0) {
    problems.push(`${where} has no usable id (got ${JSON.stringify(service.id)}).`);
  }
  if (typeof service.name !== 'string' || service.name.trim() === '') {
    problems.push(`${where} has no name.`);
  }
  /* Zero is legitimate — a free consultation is priced at 0 in Bokadirekt.
     A missing or negative price is not. */
  if (!Number.isFinite(service.price) || service.price < 0) {
    problems.push(`${where} has no usable price (got ${JSON.stringify(service.price)}).`);
  }
  if (!Number.isFinite(service.duration) || service.duration <= 0) {
    problems.push(`${where} has no usable duration (got ${JSON.stringify(service.duration)}).`);
  }

  return problems;
}

/**
 * Returns every reason this payload must not be written, newest concern first.
 * An empty array means it is safe to persist.
 */
export function findCatalogueProblems(categories, { minimumServices = MINIMUM_PLAUSIBLE_SERVICES } = {}) {
  if (!Array.isArray(categories)) {
    return [`The catalogue is ${categories === null ? 'null' : typeof categories}, not an array.`];
  }

  const problems = [];
  const seenServiceIds = new Set();

  categories.forEach((category, categoryIndex) => {
    const where = `Category ${categoryIndex}`;

    if (!isPlainObject(category)) {
      problems.push(`${where} is not an object.`);
      return;
    }
    if (typeof category.name !== 'string' || category.name.trim() === '') {
      problems.push(`${where} has no name.`);
    }
    if (category.services !== undefined && !Array.isArray(category.services)) {
      problems.push(`${where} has a services value that is not an array.`);
      return;
    }

    for (const [serviceIndex, service] of (category.services ?? []).entries()) {
      problems.push(...findServiceProblems(service, `${where} service ${serviceIndex}`));

      if (isPlainObject(service) && Number.isInteger(service.id)) {
        /* Booking links are built from this id, so a duplicate would silently
           send half the visitors to the wrong treatment. */
        if (seenServiceIds.has(service.id)) problems.push(`Service id ${service.id} appears more than once.`);
        seenServiceIds.add(service.id);
      }
    }
  });

  const count = countServices(categories);
  if (count < minimumServices) {
    problems.push(
      `Only ${count} services, which is below the ${minimumServices} needed to look like a real catalogue.`,
    );
  }

  return problems;
}

export function countServices(categories) {
  if (!Array.isArray(categories)) return 0;
  return categories.reduce(
    (total, category) => total + (Array.isArray(category?.services) ? category.services.length : 0),
    0,
  );
}

/** Service ids present in a catalogue, for reporting what a sync changed. */
export function serviceIds(categories) {
  if (!Array.isArray(categories)) return new Set();
  return new Set(
    categories.flatMap((category) =>
      (Array.isArray(category?.services) ? category.services : []).map((service) => service?.id).filter(Boolean),
    ),
  );
}
