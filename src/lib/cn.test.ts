import { describe, expect, it } from 'vitest';
import { cn } from './cn.ts';

describe('cn', () => {
  it("lets a caller's display utility override the component's base", () => {
    expect(cn('inline-flex items-center', 'hidden sm:inline-flex')).toBe('items-center hidden sm:inline-flex');
  });

  it('keeps non-conflicting utilities from both sides', () => {
    expect(cn('rounded-pill px-7', 'mt-6')).toBe('rounded-pill px-7 mt-6');
  });

  it('ignores empty and falsy input', () => {
    expect(cn('px-4', undefined, false, '')).toBe('px-4');
  });

  it('resolves a later padding against an earlier one', () => {
    expect(cn('px-7 py-3', 'px-5')).toBe('py-3 px-5');
  });
});
