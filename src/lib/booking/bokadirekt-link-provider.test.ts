import { describe, expect, it } from 'vitest';
import { BokadirektLinkProvider } from './bokadirekt-link-provider.ts';

const provider = new BokadirektLinkProvider('studio-taube-56559');

describe('BokadirektLinkProvider', () => {
  it('deep links to a service using its slug and numeric id', () => {
    expect(provider.bookingUrlFor({ slug: 'head-spa-60-minuter', bokadirektServiceId: 3077572 })).toBe(
      'https://www.bokadirekt.se/boka-tjanst/studio-taube-56559/head-spa-60-minuter-3077572',
    );
  });

  it('falls back to the salon page when a service has no Bokadirekt id', () => {
    expect(provider.bookingUrlFor({ slug: 'nagon-behandling' })).toBe(
      'https://www.bokadirekt.se/places/studio-taube-56559',
    );
  });

  it('links to the salon page when no service is chosen', () => {
    expect(provider.salonBookingUrl()).toBe('https://www.bokadirekt.se/places/studio-taube-56559');
  });

  it('reports that booking leaves the site, so callers can render an external link', () => {
    expect(provider.supportsInlineBooking()).toBe(false);
  });

  it('produces absolute https urls for every service', () => {
    const url = new URL(provider.bookingUrlFor({ slug: 'ansiktsbehandling-classic', bokadirektServiceId: 3115245 }));
    expect(url.protocol).toBe('https:');
    expect(url.hostname).toBe('www.bokadirekt.se');
  });
});
