import { describe, it, expect } from '@jest/globals';
import {
  EMOJI_MODE_MAP,
  emojiForChar,
  toEmojiText,
} from '@/features/typing/utils/emojiMode';

describe('emojiForChar', () => {
  it('maps a lowercase letter to its namesake emoji', () => {
    expect(emojiForChar('a')).toBe('🍎');
    expect(emojiForChar('z')).toBe('🦓');
  });

  it('ignores case so caps lock makes no difference', () => {
    expect(emojiForChar('A')).toBe(emojiForChar('a'));
    expect(emojiForChar('P')).toBe('🍕');
  });

  it('maps digits to keycap emoji so they are read as the number', () => {
    expect(emojiForChar('0')).toBe('0️⃣');
    expect(emojiForChar('7')).toBe('7️⃣');
  });

  it('maps the supported symbols', () => {
    expect(emojiForChar('!')).toBe('❗');
    expect(emojiForChar('+')).toBe('➕');
    expect(emojiForChar('$')).toBe('💵');
  });

  it('returns null for unmapped characters', () => {
    expect(emojiForChar(' ')).toBeNull();
    expect(emojiForChar(',')).toBeNull();
    expect(emojiForChar('é')).toBeNull();
  });

  it('returns null for non-string or empty input', () => {
    expect(emojiForChar('')).toBeNull();
    expect(emojiForChar(null)).toBeNull();
    expect(emojiForChar(undefined)).toBeNull();
    expect(emojiForChar(5)).toBeNull();
  });
});

describe('EMOJI_MODE_MAP', () => {
  it('covers every letter of the alphabet', () => {
    const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');
    const missing = letters.filter(letter => !EMOJI_MODE_MAP[letter]);
    expect(missing).toEqual([]);
  });

  it('covers every digit', () => {
    const digits = '0123456789'.split('');
    const missing = digits.filter(digit => !EMOJI_MODE_MAP[digit]);
    expect(missing).toEqual([]);
  });

  it('gives every letter a distinct emoji so characters stay tellable apart', () => {
    const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');
    const emojis = letters.map(letter => EMOJI_MODE_MAP[letter]);
    expect(new Set(emojis).size).toBe(letters.length);
  });

  it('is frozen so a caller cannot mutate the shared mapping', () => {
    expect(Object.isFrozen(EMOJI_MODE_MAP)).toBe(true);
  });
});

describe('toEmojiText', () => {
  it('replaces each mapped character in a word', () => {
    expect(toEmojiText('cat')).toBe('🐱🍎🌳');
  });

  it('preserves spaces so word boundaries survive', () => {
    expect(toEmojiText('a b')).toBe('🍎 🐻');
  });

  it('passes unmapped punctuation through untouched', () => {
    expect(toEmojiText('hi, a')).toBe('🏠🍦, 🍎');
  });

  it('handles mixed case, digits and symbols together', () => {
    expect(toEmojiText('A1!')).toBe('🍎1️⃣❗');
  });

  it('returns an empty string for empty or non-string input', () => {
    expect(toEmojiText('')).toBe('');
    expect(toEmojiText(null)).toBe('');
    expect(toEmojiText(undefined)).toBe('');
    expect(toEmojiText(42)).toBe('');
  });

  it('produces one emoji per source character for alphanumeric text', () => {
    const source = 'dog9';
    const glyphs = Array.from(
      new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(
        toEmojiText(source),
      ),
      part => part.segment,
    );
    expect(glyphs).toHaveLength(source.length);
  });
});
