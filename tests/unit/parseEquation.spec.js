import { describe, it, expect } from '@jest/globals';
import { parseEquation } from '@/features/math/utils/parseEquation';

describe('parseEquation', () => {
  it('parses a simple single-digit addition', () => {
    expect(parseEquation('3+1')).toEqual({ a: 3, b: 1, op: '+', result: 4, modifier: null });
  });

  it('parses subtraction', () => {
    expect(parseEquation('5-2')).toEqual({ a: 5, b: 2, op: '-', result: 3, modifier: null });
  });

  it('parses with spaces around the operator', () => {
    expect(parseEquation('4 + 1')).toEqual({ a: 4, b: 1, op: '+', result: 5, modifier: null });
    expect(parseEquation('9 - 4')).toEqual({ a: 9, b: 4, op: '-', result: 5, modifier: null });
  });

  it('parses with surrounding whitespace', () => {
    expect(parseEquation('  2 + 2  ')).toEqual({ a: 2, b: 2, op: '+', result: 4, modifier: null });
  });

  it('supports multi-digit operands', () => {
    expect(parseEquation('10+5')).toEqual({ a: 10, b: 5, op: '+', result: 15, modifier: null });
  });

  it('supports adding zero and subtracting to zero', () => {
    expect(parseEquation('0+1')).toEqual({ a: 0, b: 1, op: '+', result: 1, modifier: null });
    expect(parseEquation('3-3')).toEqual({ a: 3, b: 3, op: '-', result: 0, modifier: null });
  });

  it('returns null for subtraction that would go negative', () => {
    expect(parseEquation('2-5')).toBeNull();
  });

  it('returns null for plain numbers (no operator)', () => {
    expect(parseEquation('5')).toBeNull();
  });

  it('returns null for multiplication or other operators', () => {
    expect(parseEquation('3*1')).toBeNull();
    expect(parseEquation('3x1')).toBeNull();
  });

  it('returns null for three operands', () => {
    expect(parseEquation('1+2+3')).toBeNull();
  });

  it('ignores a trailing =answer, correct or not', () => {
    expect(parseEquation('3+1=4')).toEqual({ a: 3, b: 1, op: '+', result: 4, modifier: null });
    expect(parseEquation('1+1=2')).toEqual({ a: 1, b: 1, op: '+', result: 2, modifier: null });
    expect(parseEquation('1+1=3')).toEqual({ a: 1, b: 1, op: '+', result: 2, modifier: null });
    expect(parseEquation('5-2=1')).toEqual({ a: 5, b: 2, op: '-', result: 3, modifier: null });
    expect(parseEquation('1 + 1 = 2')).toEqual({ a: 1, b: 1, op: '+', result: 2, modifier: null });
  });

  it('returns null for incomplete expressions', () => {
    expect(parseEquation('3+')).toBeNull();
    expect(parseEquation('+1')).toBeNull();
    expect(parseEquation('3++1')).toBeNull();
  });

  it('returns null for words around the numbers', () => {
    expect(parseEquation('i have 3+1 apples')).toBeNull();
  });

  it('returns null for non-string / empty input', () => {
    expect(parseEquation('')).toBeNull();
    expect(parseEquation(null)).toBeNull();
    expect(parseEquation(undefined)).toBeNull();
    expect(parseEquation(31)).toBeNull();
  });

  describe('modifiers', () => {
    it('reads a "$" or "%" written after either number', () => {
      expect(parseEquation('2+3$')).toEqual({ a: 2, b: 3, op: '+', result: 5, modifier: '$' });
      expect(parseEquation('2%+3')).toEqual({ a: 2, b: 3, op: '+', result: 5, modifier: '%' });
    });

    it('reads a modifier written before either number', () => {
      expect(parseEquation('$2 + $3')).toEqual({ a: 2, b: 3, op: '+', result: 5, modifier: '$' });
      expect(parseEquation('%20 - %5')).toEqual({ a: 20, b: 5, op: '-', result: 15, modifier: '%' });
    });

    it('takes the last modifier typed when they conflict', () => {
      expect(parseEquation('2% + 3$')).toMatchObject({ modifier: '$' });
      expect(parseEquation('$2 + 3%')).toMatchObject({ modifier: '%' });
      expect(parseEquation('2$ + %3')).toMatchObject({ modifier: '%' });
      // Both on the same number: the suffix is typed after the prefix.
      expect(parseEquation('$2% + 1')).toMatchObject({ modifier: '%' });
    });

    it('counts a modifier on the answer as the last one typed', () => {
      expect(parseEquation('$2 + 3 = 5%')).toMatchObject({ modifier: '%' });
      expect(parseEquation('2 + 3 = $5')).toMatchObject({ modifier: '$' });
    });

    it('leaves the arithmetic alone', () => {
      expect(parseEquation('$10 - $4')).toEqual({ a: 10, b: 4, op: '-', result: 6, modifier: '$' });
      // Still age-safe: a modifier does not license a negative answer.
      expect(parseEquation('$2 - $5')).toBeNull();
    });

    it('returns null for a modifier with no number of its own', () => {
      expect(parseEquation('$ + 3')).toBeNull();
      expect(parseEquation('%+%')).toBeNull();
    });
  });
});
