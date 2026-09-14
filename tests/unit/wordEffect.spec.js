import { describe, it, expect, jest } from '@jest/globals';
import {
  resolveWordEffect,
  animationTypeForWord,
  isHeavyWord,
} from '@/features/effects/utils/wordEffect';
import { PATHS, IMPACT_AT } from '@/features/effects/utils/wordMotion';
import { PRODUCE_COLORS, SPLAT_COLORS } from '@/features/effects/utils/screenColor';
import { WORD_EMOJI, WORD_FAMILY, findWordEmoji } from '@/features/typing/utils/wordEmoji';
import { useEasterEggs } from '@/features/easter-eggs/composables/useEasterEggs';

describe('resolveWordEffect', () => {
  it('resolves an effect carrying the word emoji', () => {
    const effect = resolveWordEffect('banana');
    expect(effect.options.emoji).toBe('🍌');
    expect(effect.count).toBeGreaterThan(0);
  });

  it('uses an animation type the renderer knows', () => {
    for (const word of Object.keys(WORD_EMOJI)) {
      expect(PATHS).toContain(animationTypeForWord(word));
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

  it('sends a ball across in fewer, bigger copies than a drift of stars', () => {
    const ball = resolveWordEffect('ball');
    expect(ball.count).toBeLessThan(resolveWordEffect('star').count);
    expect(ball.options.minSize).toBeGreaterThan(resolveWordEffect('star').options.minSize);
  });

  it('carries the ball emoji into the effect', () => {
    expect(resolveWordEffect('soccer').options.emoji).toBe('⚽');
  });
});

describe('emoji families', () => {
  it('mixes related balls when the word is the generic one', () => {
    const set = resolveWordEffect('ball').options.emojiSet;
    expect(set).toEqual(expect.arrayContaining(['⚽', '🏀', '🏈']));
  });

  it('keeps a specific ball as a single glyph', () => {
    const effect = resolveWordEffect('soccer');
    expect(effect.options.emojiSet).toBeUndefined();
    expect(effect.options.emoji).toBe('⚽');
  });

  it('puts the word\'s own emoji first in every family pool', () => {
    for (const word of Object.keys(WORD_FAMILY)) {
      const effect = resolveWordEffect(word);
      expect(effect.options.emojiSet[0]).toBe(WORD_EMOJI[word]);
    }
  });

  it('sets options.emoji for every word in the dictionary', () => {
    for (const word of Object.keys(WORD_EMOJI)) {
      expect(resolveWordEffect(word).options.emoji).toBe(WORD_EMOJI[word]);
    }
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

describe('produce gets an impact', () => {
  const GRAVITY = ['lob', 'arc', 'bounce'];

  it('throws every produce word on a gravity path with an impact', () => {
    for (const word of Object.keys(PRODUCE_COLORS)) {
      const effect = resolveWordEffect(word);
      expect(GRAVITY).toContain(effect.type);
      expect(effect.options.impact).toBeDefined();
    }
  });

  it('splats bounce words and bursts lob and arc words', () => {
    for (const word of Object.keys(PRODUCE_COLORS)) {
      const effect = resolveWordEffect(word);
      if (effect.type === 'bounce') {
        expect(effect.options.impact).toBe('splat');
      } else {
        expect(effect.options.impact).toBe('burst');
      }
    }
  });

  it('colours and times the impact from the produce maps', () => {
    for (const word of Object.keys(PRODUCE_COLORS)) {
      const effect = resolveWordEffect(word);
      expect(effect.options.splatColor).toBe(SPLAT_COLORS[PRODUCE_COLORS[word]]);
      expect(effect.options.impactAt).toBe(IMPACT_AT[effect.type]);
    }
  });

  it('gives no impact to a non-produce word', () => {
    // lion is an animal; pizza is food, which shares produce's gravity paths,
    // so a missing impact here proves the gate is produce-membership.
    expect(resolveWordEffect('lion').options.impact).toBeUndefined();
    expect(resolveWordEffect('pizza').options.impact).toBeUndefined();
  });
});
