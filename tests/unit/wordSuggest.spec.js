import { describe, it, expect } from '@jest/globals';
import { suggestCompletion } from '@/features/typing/utils/wordSuggest';

describe('suggestCompletion', () => {
  it('completes a partially typed word', () => {
    expect(suggestCompletion('pizz')).toBe('pizza');
  });

  it('completes from just a couple of letters', () => {
    // "ca" -> shortest match wins (cat)
    expect(suggestCompletion('ca')).toBe('cat');
  });

  it('only completes the last word, ignoring earlier ones', () => {
    expect(suggestCompletion('i love rai')).toBe('rain');
  });

  it('returns null when the word is already complete with no longer match', () => {
    // "yellow" has no longer word starting with it
    expect(suggestCompletion('yellow')).toBeNull();
  });

  it('returns null for fewer than two letters', () => {
    expect(suggestCompletion('p')).toBeNull();
  });

  it('returns null when nothing matches', () => {
    expect(suggestCompletion('xq')).toBeNull();
  });

  it('returns null when the text ends with a space (word finished)', () => {
    expect(suggestCompletion('cat ')).toBeNull();
  });

  it('is case-insensitive and returns the canonical lowercase word', () => {
    expect(suggestCompletion('PIZZ')).toBe('pizza');
  });

  it('returns null for non-letter input', () => {
    expect(suggestCompletion('3+1')).toBeNull();
    expect(suggestCompletion('')).toBeNull();
    expect(suggestCompletion(null)).toBeNull();
  });
});
