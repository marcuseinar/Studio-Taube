import { describe, expect, it } from 'vitest';
import { formatDuration, formatPhoneForHumans, formatPrice, formatPriceRange } from './format.ts';

/** Intl groups thousands with a non-breaking space in Swedish. */
const normaliseSpaces = (value: string) => value.replace(/\u00a0/g, ' ');

describe('formatPrice', () => {
  it('groups thousands the Swedish way', () => {
    expect(normaliseSpaces(formatPrice(1450, 'sv'))).toBe('1 450 kr');
  });

  it('leaves prices under a thousand ungrouped', () => {
    expect(formatPrice(950, 'sv')).toBe('950 kr');
  });
});

describe('formatPriceRange', () => {
  it('marks an open-ended price in Swedish', () => {
    expect(normaliseSpaces(formatPriceRange(1450, true, 'sv'))).toBe('Från 1 450 kr');
  });

  it('marks an open-ended price in English', () => {
    expect(formatPriceRange(1450, true, 'en')).toContain('From');
  });

  it('renders a fixed price without a prefix', () => {
    expect(formatPriceRange(950, false, 'sv')).toBe('950 kr');
  });
});

describe('formatDuration', () => {
  it('renders minutes', () => {
    expect(formatDuration(90, 'sv')).toBe('90 min');
  });
});

describe('formatPhoneForHumans', () => {
  it('renders an E.164 Swedish mobile number in national form', () => {
    expect(formatPhoneForHumans('+46763128797')).toBe('076-312 87 97');
  });
});
