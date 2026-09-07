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
    expect(matchTypeahead('i love rain')).toBe('🌧️');
  });

  it('prefers the word itself over a longer word starting with it', () => {
    // "rain" is a word in its own right, so it wins over "rainbow".
    expect(matchTypeahead('rain')).toBe('🌧️');
    expect(matchTypeahead('rainb')).toBe('🌈');
  });

  it('previews any word in the dictionary, not just a hand-picked few', () => {
    // The old hint list held 28 words, so "cook" showed nothing.
    expect(matchTypeahead('cook')).toBe('🧑‍🍳');
    expect(matchTypeahead('cooki')).toBe('🍪');
    expect(matchTypeahead('giraf')).toBe('🦒');
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
