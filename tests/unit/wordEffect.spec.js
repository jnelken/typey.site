import { describe, it, expect, jest } from '@jest/globals';
import { resolveWordEffect, animationTypeForWord } from '@/features/effects/utils/wordEffect';
import { WORD_EMOJI, findWordEmoji } from '@/features/typing/utils/wordEmoji';
import { useEasterEggs } from '@/features/easter-eggs/composables/useEasterEggs';

describe('resolveWordEffect', () => {
  it('resolves an effect carrying the word emoji', () => {
    const effect = resolveWordEffect('banana');
    expect(effect.options.emoji).toBe('🍌');
    expect(effect.count).toBeGreaterThan(0);
  });

  it('uses an animation type the renderer knows', () => {
    for (const word of Object.keys(WORD_EMOJI)) {
      expect(['float', 'rain', 'burst']).toContain(animationTypeForWord(word));
    }
  });

  it('always animates a given word the same way', () => {
    expect(animationTypeForWord('banana')).toBe(animationTypeForWord('banana'));
  });

  it('finds the word anywhere in the line', () => {
    expect(resolveWordEffect('i want a banana').options.emoji).toBe('🍌');
  });

  it('reads a plural as its singular', () => {
    expect(findWordEmoji('cookies').word).toBe('cookie');
    expect(resolveWordEffect('cookies').options.emoji).toBe('🍪');
  });

  it('returns null for a line with no word it has a picture for', () => {
    expect(resolveWordEffect('qqq zzz')).toBeNull();
  });
});

describe('every word in the library animates', () => {
  it('spawns something for every single word', () => {
    const blanks = [];

    for (const word of Object.keys(WORD_EMOJI)) {
      const spawnEmojis = jest.fn();
      const spawnBalloons = jest.fn();
      const { evaluateEasterEggs } = useEasterEggs({ spawnBalloons });

      evaluateEasterEggs(word, spawnEmojis);

      if (spawnEmojis.mock.calls.length === 0 && spawnBalloons.mock.calls.length === 0) {
        blanks.push(word);
      }
    }

    expect(blanks).toEqual([]);
  });

  it('spawns something for every word typed in caps', () => {
    const blanks = [];

    for (const word of Object.keys(WORD_EMOJI)) {
      const spawnEmojis = jest.fn();
      const spawnBalloons = jest.fn();
      const { evaluateEasterEggs } = useEasterEggs({ spawnBalloons });

      evaluateEasterEggs(word.toUpperCase(), spawnEmojis);

      if (spawnEmojis.mock.calls.length === 0 && spawnBalloons.mock.calls.length === 0) {
        blanks.push(word);
      }
    }

    expect(blanks).toEqual([]);
  });
});
