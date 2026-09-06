import { describe, it, expect, jest } from '@jest/globals';
import {
  resolveWordEffect,
  animationTypeForWord,
  isHeavyWord,
} from '@/features/effects/utils/wordEffect';
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
      expect(['float', 'rain', 'burst', 'arc', 'lob', 'bounce']).toContain(
        animationTypeForWord(word),
      );
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

describe('things with weight obey gravity', () => {
  const GRAVITY = ['arc', 'lob', 'bounce'];

  it('never floats a ball up and off the screen', () => {
    for (const ball of [
      'ball', 'soccer', 'basketball', 'football', 'baseball',
      'tennis', 'volleyball', 'bowling', 'golf',
    ]) {
      expect(isHeavyWord(ball)).toBe(true);
      expect(GRAVITY).toContain(animationTypeForWord(ball));
      expect(GRAVITY).toContain(resolveWordEffect(ball).type);
    }
  });

  it('drops other heavy things the same way', () => {
    for (const thing of ['rock', 'coin', 'egg', 'watermelon', 'pumpkin']) {
      expect(GRAVITY).toContain(animationTypeForWord(thing));
    }
  });

  it('leaves weightless things drifting as before', () => {
    for (const light of ['balloon', 'cloud', 'snow', 'bee', 'star']) {
      expect(isHeavyWord(light)).toBe(false);
      expect(['float', 'rain', 'burst']).toContain(animationTypeForWord(light));
    }
  });

  it('sends a ball across in fewer, bigger copies than a rain of confetti', () => {
    const ball = resolveWordEffect('ball');
    expect(ball.count).toBeLessThan(resolveWordEffect('banana').count);
    expect(ball.options.minSize).toBeGreaterThan(resolveWordEffect('banana').options.minSize);
  });

  it('carries the ball emoji into the effect', () => {
    expect(resolveWordEffect('soccer').options.emoji).toBe('⚽');
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
