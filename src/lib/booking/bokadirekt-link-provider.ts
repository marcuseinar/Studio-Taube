import type { BookableService, BookingProvider } from './types.ts';

const BOKADIREKT_ORIGIN = 'https://www.bokadirekt.se';

/**
 * Deep links into Bokadirekt. Costs nothing and needs nothing from the salon.
 *
 * Bokadirekt addresses a single service as
 * `/boka-tjanst/<salon-slug>/<service-slug>-<serviceId>`; a link missing the
 * numeric id redirects away, so a service without one falls back to the salon
 * page rather than producing a broken link.
 */
export class BokadirektLinkProvider implements BookingProvider {
  readonly #salonSlug: string;

  constructor(salonSlug: string) {
    this.#salonSlug = salonSlug;
  }

  bookingUrlFor(service: BookableService): string {
    if (service.bokadirektServiceId === undefined) {
      return this.salonBookingUrl();
    }
    return `${BOKADIREKT_ORIGIN}/boka-tjanst/${this.#salonSlug}/${service.slug}-${service.bokadirektServiceId}`;
  }

  salonBookingUrl(): string {
    return `${BOKADIREKT_ORIGIN}/places/${this.#salonSlug}`;
  }

  supportsInlineBooking(): boolean {
    return false;
  }
}
