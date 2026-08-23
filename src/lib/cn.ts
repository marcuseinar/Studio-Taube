import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind classes so a caller's class always wins over a component's
 * base class. Without this, `hidden` passed into a component whose base is
 * `inline-flex` silently loses to source order in the generated stylesheet.
 *
 * Runs at build time only — nothing ships to the browser.
 */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return twMerge(classes.filter(Boolean).join(' '));
}
