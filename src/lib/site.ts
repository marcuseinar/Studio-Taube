/**
 * Where this build is published.
 *
 * 'github-pages' serves the site from a project path on github.io, which is
 * what to use until studiotaube.se is pointed at GitHub. Switching to
 * 'custom-domain' moves the site to the apex domain and makes the build emit
 * a CNAME file; nothing else needs to change. See docs/ARCHITECTURE.md.
 */
export const DEPLOY_TARGET: 'github-pages' | 'custom-domain' = 'github-pages';

const TARGETS = {
  'github-pages': { origin: 'https://marcuseinar.github.io', base: '/Studio-Taube/' },
  'custom-domain': { origin: 'https://studiotaube.se', base: '/' },
} as const;

export const SITE_URL = TARGETS[DEPLOY_TARGET].origin;
export const BASE_PATH = TARGETS[DEPLOY_TARGET].base;
export const CUSTOM_DOMAIN = 'studiotaube.se';

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

/** Resolves a file in public/ to a URL that respects the deploy base. */
export function assetUrl(path: string): string {
  const base = (import.meta.env.BASE_URL ?? '/').replace(/\/$/, '');
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}
