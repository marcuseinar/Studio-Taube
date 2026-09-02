import type { sv } from './sv.ts';

/**
 * Typed against the Swedish source, so removing or misspelling a key fails
 * the build. Treatment copy is translated by a human, never machine-generated.
 */
export const en: Record<keyof typeof sv, string> = {
  'nav.home': 'Home',
  'nav.treatments': 'Treatments',
  'nav.prices': 'Prices',
  'nav.campaigns': 'Offers',
  'nav.about': 'About',
  'nav.contact': 'Contact',
  'nav.skipToContent': 'Skip to content',
  'nav.menu': 'Menu',

  'booking.cta.primary': 'Book now',
  'booking.cta.service': 'Book this treatment',
  'booking.opensExternally': 'Opens at Bokadirekt in a new tab',
  'booking.consultationRequired': 'A free consultation is required before this treatment',

  'treatments.title': 'Treatments',
  'treatments.intro': 'Skincare, laser, lashes and brows, massage and head spa — at Nääs Fabriker.',
  'treatments.allCategories': 'All treatments',
  'treatments.duration': 'Duration',
  'treatments.price': 'Price',
  'treatments.readMore': 'Read more',

  'campaigns.title': 'Offers',
  'campaigns.none': 'No current offers.',
  'campaigns.ordinaryPrice': 'Regular price',

  'contact.title': 'Contact',
  'contact.address': 'Address',
  'contact.phone': 'Phone',
  'contact.email': 'Email',
  'contact.openingHours': 'Opening hours',
  'contact.closed': 'Closed',
  'contact.viewOnMap': 'View on map',

  'about.staff': 'The team',

  'weekday.1': 'Monday',
  'weekday.2': 'Tuesday',
  'weekday.3': 'Wednesday',
  'weekday.4': 'Thursday',
  'weekday.5': 'Friday',
  'weekday.6': 'Saturday',
  'weekday.0': 'Sunday',

  'footer.followUs': 'Follow us',
  'footer.bookVia': 'Book via',
  'footer.privacy': 'Privacy policy',
  'footer.rights': 'All rights reserved',

  'language.current': 'English',
};
