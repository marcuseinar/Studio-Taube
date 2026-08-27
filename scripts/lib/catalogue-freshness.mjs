/**
 * Decides how worried to be about the age of the catalogue snapshot.
 *
 * This is the check that catches the failures nobody is watching for: a sync
 * that has been erroring for a week, a scraper Bokadirekt broke, a scheduled
 * workflow GitHub switched off. All of them look identical from the outside —
 * a site serving prices that quietly stopped being refreshed.
 *
 * Note what this deliberately does NOT do: fail a build. Blocking the deploy
 * on a stale snapshot would freeze the site on the very prices that are out of
 * date, and block the fix along with them. Staleness raises an alarm; it never
 * stops a deploy. Same reasoning as docs/DECISIONS.md D11.
 */

export const WARN_AFTER_DAYS = 3;
export const ALARM_AFTER_DAYS = 10;

export const daysBetween = (from, to) => (to.getTime() - from.getTime()) / 86_400_000;

/**
 * @returns {{ level: 'ok'|'warn'|'alarm', ageDays: number|null, summary: string }}
 */
export function assessFreshness(meta, now = new Date()) {
  const fetchedAt = meta?.fetchedAt ? new Date(meta.fetchedAt) : undefined;

  if (!fetchedAt || Number.isNaN(fetchedAt.getTime())) {
    return {
      level: 'alarm',
      ageDays: null,
      summary: 'The catalogue snapshot has no readable fetchedAt, so its age cannot be established.',
    };
  }

  const ageDays = daysBetween(fetchedAt, now);
  const age = `${ageDays.toFixed(1)} days old`;

  if (ageDays >= ALARM_AFTER_DAYS) {
    return {
      level: 'alarm',
      ageDays,
      summary: `The catalogue snapshot is ${age}. The sync has not succeeded since ${meta.fetchedAt}.`,
    };
  }

  if (meta.degraded) {
    return {
      level: 'warn',
      ageDays,
      summary: `The catalogue is current (${age}) but came from a fallback source — the preferred one is failing.`,
    };
  }

  if (ageDays >= WARN_AFTER_DAYS) {
    return { level: 'warn', ageDays, summary: `The catalogue snapshot is ${age}, which is older than expected.` };
  }

  return {
    level: 'ok',
    ageDays,
    summary: `The catalogue snapshot is ${age}, from ${meta.source ?? 'an unnamed source'}.`,
  };
}
