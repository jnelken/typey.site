import { describe, it, expect } from '@jest/globals';
import { parsePercent } from '@/features/percent/utils/parsePercent';

describe('parsePercent', () => {
  it('parses number-then-percent', () => {
    expect(parsePercent('50%')).toEqual({ percent: 50 });
  });

  it('parses percent-then-number', () => {
    expect(parsePercent('%50')).toEqual({ percent: 50 });
  });

  it('parses percent-then-number with a space (% 50)', () => {
    // Behaviour change: today "% 50" floats fifty balloons via the bare
    // number token; this parser intercepts it as a battery instead.
    expect(parsePercent('% 50')).toEqual({ percent: 50 });
  });

  it('parses number-then-percent with a space', () => {
    expect(parsePercent('50 %')).toEqual({ percent: 50 });
  });

  it('parses with surrounding whitespace', () => {
    expect(parsePercent('  50%  ')).toEqual({ percent: 50 });
    expect(parsePercent('  %50  ')).toEqual({ percent: 50 });
  });

  it('parses 0%', () => {
    expect(parsePercent('0%')).toEqual({ percent: 0 });
  });

  it('clamps values above 100 to 100', () => {
    expect(parsePercent('200%')).toEqual({ percent: 100 });
    expect(parsePercent('%250')).toEqual({ percent: 100 });
  });

  it('returns null for a bare %', () => {
    expect(parsePercent('%')).toBeNull();
  });

  it('returns null for words around the percent (50% cookie)', () => {
    expect(parsePercent('50% cookie')).toBeNull();
  });

  it('returns null for equations', () => {
    expect(parsePercent('5 + 5')).toBeNull();
  });

  it('returns null for four-digit percents (three-digit cap)', () => {
    expect(parsePercent('1000%')).toBeNull();
  });

  it('returns null for non-string / empty input', () => {
    expect(parsePercent('')).toBeNull();
    expect(parsePercent(null)).toBeNull();
    expect(parsePercent(undefined)).toBeNull();
    expect(parsePercent(50)).toBeNull();
  });
});
