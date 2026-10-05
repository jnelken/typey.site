import { describe, it, expect } from '@jest/globals';
import { sanitizeProperties } from '@/features/analytics/properties';

describe('sanitizeProperties', () => {
  it('keeps allowlisted identifiers, booleans and numbers', () => {
    expect(
      sanitizeProperties({ egg: 'math', operation: '+', modifier: '%', enabled: true, load_ms: 812 }),
    ).toEqual({ egg: 'math', operation: '+', modifier: '%', enabled: true, load_ms: 812 });
  });

  it('drops property names that are not on the allowlist', () => {
    expect(sanitizeProperties({ egg: 'silly', text: 'hello', word: 'cat', percent: 50 })).toEqual({
      egg: 'silly',
    });
  });

  it('drops values that look like sentences, even under an allowed name', () => {
    expect(sanitizeProperties({ reason: 'MY NAME IS SAM', egg: 'a'.repeat(41) })).toEqual({});
  });

  it('drops non-finite numbers and objects', () => {
    expect(sanitizeProperties({ load_ms: NaN, ttfb_ms: Infinity, egg: { nested: 'x' } })).toEqual({});
  });

  it('accepts nothing at all', () => {
    expect(sanitizeProperties(undefined)).toEqual({});
    expect(sanitizeProperties(null)).toEqual({});
  });
});
