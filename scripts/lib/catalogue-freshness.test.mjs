import { describe, expect, it } from 'vitest';
import { ALARM_AFTER_DAYS, WARN_AFTER_DAYS, assessFreshness } from './catalogue-freshness.mjs';

const NOW = new Date('2026-08-27T03:00:00Z');
const daysBefore = (days) => new Date(NOW.getTime() - days * 86_400_000).toISOString();
const meta = (overrides = {}) => ({ fetchedAt: daysBefore(1), source: 'salon-page', degraded: false, ...overrides });

describe('assessFreshness', () => {
  it('is content with a snapshot from last night', () => {
    expect(assessFreshness(meta(), NOW).level).toBe('ok');
  });

  it('warns once the snapshot is older than a few failed runs', () => {
    const result = assessFreshness(meta({ fetchedAt: daysBefore(WARN_AFTER_DAYS) }), NOW);
    expect(result.level).toBe('warn');
    expect(result.summary).toContain('older than expected');
  });

  it('raises an alarm when the sync has clearly stopped working', () => {
    const result = assessFreshness(meta({ fetchedAt: daysBefore(ALARM_AFTER_DAYS) }), NOW);
    expect(result.level).toBe('alarm');
    expect(result.summary).toContain('has not succeeded');
  });

  it('warns about a fresh catalogue that came from a fallback source', () => {
    const result = assessFreshness(meta({ degraded: true }), NOW);
    expect(result.level).toBe('warn');
    expect(result.summary).toContain('fallback source');
  });

  it('prefers the staleness alarm over the fallback warning', () => {
    const result = assessFreshness(meta({ fetchedAt: daysBefore(30), degraded: true }), NOW);
    expect(result.level).toBe('alarm');
  });

  it('treats a missing or unreadable timestamp as an alarm, never as fresh', () => {
    expect(assessFreshness(undefined, NOW).level).toBe('alarm');
    expect(assessFreshness({}, NOW).level).toBe('alarm');
    expect(assessFreshness({ fetchedAt: 'sometime last week' }, NOW).level).toBe('alarm');
  });

  it('reports the age it measured', () => {
    expect(assessFreshness(meta({ fetchedAt: daysBefore(2) }), NOW).ageDays).toBeCloseTo(2, 5);
  });
});
