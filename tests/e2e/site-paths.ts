/**
 * The deploy base, mirrored from src/lib/site.ts. Tests navigate by site-root
 * path and this adds the prefix, so switching to the custom domain means
 * changing one constant here and one there.
 */
export const BASE = '/Studio-Taube';

/** Turns a site-root path into a path the running preview server serves. */
export function url(path: string): string {
  return `${BASE}${path}`;
}
