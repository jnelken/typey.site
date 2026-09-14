import { describe, it, expect } from '@jest/globals';
import { parseEatenFood } from '@/features/eaten/utils/parseEatenFood';
import { WORD_CATEGORIES, categoryForWord } from '@/features/typing/utils/wordEmoji';

describe('parseEatenFood', () => {
  it('eats the proportion written against a food word', () => {
    expect(parseEatenFood('50% cookie')).toEqual({
      percent: 50,
      word: 'cookie',
      emoji: '🍪',
      remaining: 0.5,
    });
  });

  it('takes the percent written either side of the number', () => {
    expect(parseEatenFood('%25 pizza').percent).toBe(25);
    expect(parseEatenFood('25 % pizza').percent).toBe(25);
  });

  it('reads fruit and vegetables as food too', () => {
    expect(parseEatenFood('30% apple').word).toBe('apple');
    expect(parseEatenFood('30% carrot').word).toBe('carrot');
  });

  it('follows a plural back to its singular, the way every other word does', () => {
    expect(parseEatenFood('40% cookies').word).toBe('cookie');
  });

  it('refuses a word that is not food, so the line falls through to counting', () => {
    // A wedge out of a cookie reads as a bite; the same wedge through a lion
    // reads as broken. That is the whole reason for the category gate.
    expect(parseEatenFood('50% lion')).toBeNull();
    expect(parseEatenFood('50% rocket')).toBeNull();
  });

  it('goes by the line\'s first picture word, not its first food word', () => {
    // One rule for "which word is this line about" across the whole app. The
    // cost is stated rather than hidden: a line led by an animal is not an
    // eating line even when a cookie follows it.
    expect(categoryForWord('lion')).toBe('animal');
    expect(parseEatenFood('50% lion cookie')).toBeNull();
    expect(parseEatenFood('50% cookie lion').word).toBe('cookie');
  });

  it('needs both a percent and a word', () => {
    expect(parseEatenFood('50%')).toBeNull();
    expect(parseEatenFood('cookie')).toBeNull();
    expect(parseEatenFood('5 cookies')).toBeNull();
  });

  it('hands anything over 100% back to counting', () => {
    // There is no eating more than all of it, and the four-digit range belongs
    // to the battery, where an overcharge is the joke.
    expect(parseEatenFood('150% cookie')).toBeNull();
    expect(parseEatenFood('9999% cookie')).toBeNull();
    expect(parseEatenFood('100% cookie').remaining).toBe(0);
  });

  it('survives a nonsense argument', () => {
    expect(parseEatenFood(null)).toBeNull();
    expect(parseEatenFood(42)).toBeNull();
    expect(parseEatenFood('')).toBeNull();
  });

  it('has a picture and a sane proportion for every edible word in the dictionary', () => {
    // A drift guard: a food word added later is covered by this feature the
    // moment it lands, and a category renamed out from under the gate fails
    // here rather than silently switching the feature off.
    const edible = [
      ...Object.keys(WORD_CATEGORIES.food),
      ...Object.keys(WORD_CATEGORIES.produce),
    ];
    expect(edible.length).toBeGreaterThan(50);

    for (const word of edible) {
      const eaten = parseEatenFood(`60% ${word}`);
      expect(eaten).not.toBeNull();
      expect(eaten.emoji).toBeTruthy();
      expect(eaten.remaining).toBeCloseTo(0.4, 5);
    }
  });
});
