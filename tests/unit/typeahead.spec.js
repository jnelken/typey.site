import { describe, it, expect } from '@jest/globals';
import { matchTypeahead } from '@/features/easter-eggs/utils/typeahead';

describe('matchTypeahead', () => {
  it('previews an emoji when the last word is a prefix of a magic word', () => {
    expect(matchTypeahead('pizz')).toBe('🍕');
  });

  it('matches a full magic word too', () => {
    expect(matchTypeahead('lions')).toBe('🦁');
  });

  it('only considers the last word typed', () => {
    expect(matchTypeahead('i love rain')).toBe('🌈'); // "rain" -> rainbow
  });

  it('returns null for words shorter than two letters', () => {
    expect(matchTypeahead('p')).toBeNull();
  });

  it('returns null when nothing matches', () => {
    expect(matchTypeahead('xyz')).toBeNull();
  });

  it('returns null for empty or non-string input', () => {
    expect(matchTypeahead('')).toBeNull();
    expect(matchTypeahead('   ')).toBeNull();
    expect(matchTypeahead(null)).toBeNull();
    expect(matchTypeahead(42)).toBeNull();
  });
});
