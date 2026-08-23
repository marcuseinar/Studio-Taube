import { assetUrl, OPENING_HOURS, SALON, SITE_URL } from './site.ts';

const SCHEMA_WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

/**
 * Structured data for local discovery. The address and hours must match the
 * salon's Google Business Profile exactly — a mismatch hurts local ranking.
 */
export function beautySalonSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BeautySalon',
    name: SALON.name,
    url: new URL(assetUrl('/'), SITE_URL).href,
    telephone: SALON.phone,
    email: SALON.email,
    image: new URL(assetUrl('/apple-touch-icon.png'), SITE_URL).href,
    priceRange: '249–3499 SEK',
    address: {
      '@type': 'PostalAddress',
      streetAddress: SALON.street,
      postalCode: SALON.postalCode,
      addressLocality: SALON.city,
      addressCountry: SALON.countryCode,
    },
    geo: { '@type': 'GeoCoordinates', latitude: SALON.latitude, longitude: SALON.longitude },
    openingHoursSpecification: OPENING_HOURS.map((hours) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: `https://schema.org/${SCHEMA_WEEKDAYS[hours.weekday]}`,
      opens: hours.opens,
      closes: hours.closes,
    })),
    sameAs: [SALON.instagram, SALON.facebook, `https://www.bokadirekt.se/places/${SALON.bokadirektSlug}`],
  };
}

export function mapUrl(): string {
  const query = encodeURIComponent(`${SALON.name}, ${SALON.street}, ${SALON.postalCode} ${SALON.city}`);
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}
