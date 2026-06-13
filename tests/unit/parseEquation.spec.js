import { describe, it, expect } from '@jest/globals';
import { parseEquation } from '@/features/math/utils/parseEquation';

describe('parseEquation', () => {
  it('parses a simple single-digit addition', () => {
    expect(parseEquation('3+1')).toEqual({ a: 3, b: 1, sum: 4 });
  });

  it('parses with spaces around the operator', () => {
    expect(parseEquation('4 + 1')).toEqual({ a: 4, b: 1, sum: 5 });
  });

  it('parses with surrounding whitespace', () => {
    expect(parseEquation('  2 + 2  ')).toEqual({ a: 2, b: 2, sum: 4 });
  });

  it('supports multi-digit operands', () => {
    expect(parseEquation('10+5')).toEqual({ a: 10, b: 5, sum: 15 });
  });

  it('supports adding zero', () => {
    expect(parseEquation('0+1')).toEqual({ a: 0, b: 1, sum: 1 });
  });

  it('returns null for plain numbers (no operator)', () => {
    expect(parseEquation('5')).toBeNull();
  });

  it('returns null for subtraction', () => {
    expect(parseEquation('3-1')).toBeNull();
  });

  it('returns null for three operands', () => {
    expect(parseEquation('1+2+3')).toBeNull();
  });

  it('returns null for a trailing equals/answer', () => {
    expect(parseEquation('3+1=4')).toBeNull();
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
});
