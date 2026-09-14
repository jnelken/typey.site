import { describe, it, expect } from '@jest/globals';
import { parsePercent, MAX_CHARGE } from '@/features/percent/utils/parsePercent';

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

  it('keeps values above 100 as typed (an overcharge is the joke)', () => {
    expect(parsePercent('200%')).toEqual({ percent: 200 });
    expect(parsePercent('%250')).toEqual({ percent: 250 });
    expect(parsePercent('999%')).toEqual({ percent: 999 });
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

  it('parses four- and seven-digit overcharges up to the million cap', () => {
    expect(parsePercent('1000%')).toEqual({ percent: 1000 });
    expect(parsePercent('%3000')).toEqual({ percent: 3000 });
    expect(parsePercent('9999%')).toEqual({ percent: 9999 });
    expect(parsePercent('1000000%')).toEqual({ percent: MAX_CHARGE });
    expect(parsePercent('%1000000')).toEqual({ percent: MAX_CHARGE });
  });

  it('returns null above the million-percent cap', () => {
    expect(parsePercent('1000001%')).toBeNull();
    expect(parsePercent('9999999%')).toBeNull();
  });

  it('returns null for non-string / empty input', () => {
    expect(parsePercent('')).toBeNull();
    expect(parsePercent(null)).toBeNull();
    expect(parsePercent(undefined)).toBeNull();
    expect(parsePercent(50)).toBeNull();
  });
});
