import { describe, it, expect } from '@jest/globals';
import {
  WORD_EMOJI,
  WORD_FAMILY,
  EMOJI_WORDS,
  emojiForWord,
  familyForWord,
  findWordEmoji,
} from '@/features/typing/utils/wordEmoji';
import { SUGGESTION_WORDS } from '@/features/typing/utils/wordSuggest';

describe('the emoji word library', () => {
  it('covers a wide span of the emoji keyboard', () => {
    expect(EMOJI_WORDS.length).toBeGreaterThan(300);
  });

  it('gives every word an emoji', () => {
    const blanks = EMOJI_WORDS.filter(word => !WORD_EMOJI[word]);
    expect(blanks).toEqual([]);
  });

  it('keeps every word lowercase letters and single spaces', () => {
    const odd = EMOJI_WORDS.filter(word => !/^[a-z]+( [a-z]+)?$/.test(word));
    expect(odd).toEqual([]);
  });

  it('has no word that is only an emoji or punctuation', () => {
    const odd = EMOJI_WORDS.filter(word => word.trim() !== word || word.length < 2);
    expect(odd).toEqual([]);
  });

  it('includes the everyday words a kid reaches for', () => {
    for (const word of ['baby', 'stop', 'traffic light', 'mom', 'dad', 'cat', 'dog', 'pizza']) {
      expect(emojiForWord(word)).toBeTruthy();
    }
  });

  it('covers each corner of the keyboard', () => {
    // one word from each family: feeling, person, animal, bug, sea, food,
    // nature, space, vehicle, place, play, thing, clothes, symbol
    for (const word of [
      'happy', 'doctor', 'kangaroo', 'ladybug', 'dolphin', 'broccoli',
      'volcano', 'planet', 'helicopter', 'castle', 'guitar', 'flashlight',
      'backpack', 'purple',
    ]) {
      expect(emojiForWord(word)).toBeTruthy();
    }
  });
});

describe('emojiForWord', () => {
  it('ignores case and surrounding space', () => {
    expect(emojiForWord('  BANANA ')).toBe('🍌');
  });

  it('returns null for a word with no picture', () => {
    expect(emojiForWord('the')).toBeNull();
    expect(emojiForWord('')).toBeNull();
    expect(emojiForWord(null)).toBeNull();
  });
});

describe('WORD_FAMILY', () => {
  it('only lists words that already live in the dictionary', () => {
    const orphans = Object.keys(WORD_FAMILY).filter(word => !WORD_EMOJI[word]);
    expect(orphans).toEqual([]);
  });

  it('gives every family a non-empty list of distinct glyphs', () => {
    for (const [word, family] of Object.entries(WORD_FAMILY)) {
      expect(Array.isArray(family)).toBe(true);
      expect(family.length).toBeGreaterThan(0);
      for (const glyph of family) {
        expect(typeof glyph).toBe('string');
        expect(glyph.length).toBeGreaterThan(0);
      }
      expect(new Set(family).size).toBe(family.length);
    }
  });
});

describe('familyForWord', () => {
  it('ignores case and surrounding space', () => {
    expect(familyForWord('  BALL ')).toEqual(WORD_FAMILY.ball);
    expect(familyForWord('Ball')).toEqual(WORD_FAMILY.ball);
  });

  it('returns null for a word it does not hold', () => {
    expect(familyForWord('soccer')).toBeNull();
    expect(familyForWord('the')).toBeNull();
    expect(familyForWord('')).toBeNull();
  });

  it('returns null for non-string input', () => {
    expect(familyForWord(null)).toBeNull();
    expect(familyForWord(undefined)).toBeNull();
    expect(familyForWord(42)).toBeNull();
  });
});

describe('findWordEmoji', () => {
  it('prefers a two-word phrase over the words inside it', () => {
    expect(findWordEmoji('traffic light')).toEqual({ word: 'traffic light', emoji: '🚦' });
    expect(findWordEmoji('light')).toEqual({ word: 'light', emoji: '💡' });
  });

  it('finds a phrase in the middle of a line', () => {
    expect(findWordEmoji('i saw a fire truck today').word).toBe('fire truck');
  });

  it('reads a plural as its singular', () => {
    expect(findWordEmoji('two turtles').word).toBe('turtle');
  });

  it('returns null when there is no word it has a picture for', () => {
    expect(findWordEmoji('zzz qqq')).toBeNull();
    expect(findWordEmoji(null)).toBeNull();
  });
});

describe('spelling suggestions and the library agree', () => {
  it('offers every single-word library entry as a completion', () => {
    const suggestable = new Set(SUGGESTION_WORDS);
    const missing = EMOJI_WORDS.filter(
      word => !word.includes(' ') && !suggestable.has(word),
    );
    expect(missing).toEqual([]);
  });

  it('leaves two-word phrases out of single-word completions', () => {
    expect(SUGGESTION_WORDS.some(word => word.includes(' '))).toBe(false);
  });
});
