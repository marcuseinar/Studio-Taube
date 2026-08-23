/**
 * The site never talks to a booking system directly. Every "Boka tid"
 * affordance resolves through this interface, so replacing deep links with
 * Bokadirekt's embed widget — or one day its paid API — is a configuration
 * change rather than a rewrite. See docs/DECISIONS.md D6.
 */
export interface BookableService {
  readonly slug: string;
  readonly bokadirektServiceId?: number | undefined;
}

export interface BookingProvider {
  /** Where a visitor goes to book this service. */
  bookingUrlFor(service: BookableService): string;

  /** Where a visitor goes to book without having chosen a service. */
  salonBookingUrl(): string;

  /** True when booking can complete without leaving this site. */
  supportsInlineBooking(): boolean;
}
