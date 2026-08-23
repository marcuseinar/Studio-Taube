export const SITE_URL = 'https://studiotaube.se';

export const SALON = {
  name: 'Studio Taube',
  tagline: 'Skönhet & Hälsa',
  street: 'Spinnerivägen 1',
  postalCode: '448 50',
  city: 'Tollered',
  area: 'Nääs Fabriker',
  countryCode: 'SE',
  phone: '+46763128797',
  email: 'studiotaube1@gmail.com',
  latitude: 57.8195,
  longitude: 12.4169,
  bokadirektSlug: 'studio-taube-56559',
  instagram: 'https://www.instagram.com/linda_studiotaube',
  facebook: 'https://www.facebook.com/share/19LTJHPi9a/',
} as const;

/** Weekday numbers follow `Date.getDay()`, where 0 is Sunday. */
export const OPENING_HOURS = [
  { weekday: 1, opens: '09:00', closes: '15:30' },
  { weekday: 2, opens: '09:00', closes: '15:30' },
  { weekday: 3, opens: '09:00', closes: '15:30' },
  { weekday: 4, opens: '09:00', closes: '20:00' },
  { weekday: 5, opens: '09:00', closes: '15:00' },
] as const;
