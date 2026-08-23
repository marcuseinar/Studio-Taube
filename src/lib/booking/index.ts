import { SALON } from '../site.ts';
import { BokadirektLinkProvider } from './bokadirekt-link-provider.ts';
import type { BookingProvider } from './types.ts';

/**
 * The one place that decides how booking works. Swapping in an embed or API
 * provider happens here and nowhere else.
 */
export const bookingProvider: BookingProvider = new BokadirektLinkProvider(SALON.bokadirektSlug);

export type { BookingProvider, BookableService } from './types.ts';
