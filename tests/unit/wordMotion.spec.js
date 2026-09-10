import { describe, it, expect, jest } from '@jest/globals';
import { motionForWord, PATHS, FLAIRS } from '@/features/effects/utils/wordMotion';
import { countForWord, animationTypeForWord, resolveWordEffect } from '@/features/effects/utils/wordEffect';
import { WORD_EMOJI, categoryForWord } from '@/features/typing/utils/wordEmoji';
import { useEasterEggs } from '@/features/easter-eggs/composables/useEasterEggs';

describe('motion comes from what the word is', () => {
  it('gives every word in the dictionary a path and a flair the renderer knows', () => {
    for (const word of Object.keys(WORD_EMOJI)) {
      const motion = motionForWord(word);
      expect(PATHS).toContain(motion.path);
      expect(FLAIRS).toContain(motion.flair);
      expect(['left', 'right', 'any']).toContain(motion.facing);
    }
  });

  it('always moves a given word the same way', () => {
    expect(motionForWord('cookie')).toEqual(motionForWord('cookie'));
  });

  it('throws a cookie up and lets it fall, instead of floating it away', () => {
    // The bug this table was written for: a cookie drifted off the top of the
    // screen like a balloon because motion was picked by hashing the word.
    expect(['lob', 'bounce', 'arc']).toContain(animationTypeForWord('cookie'));
  });

  it('runs animals and vehicles across the screen', () => {
    for (const word of ['dog', 'lion', 'zebra', 'car', 'train', 'bus']) {
      expect(animationTypeForWord(word)).toBe('run');
    }
  });

  it('floats what belongs in the sky', () => {
    for (const word of ['rocket', 'star', 'moon', 'sun', 'balloon', 'planet']) {
      expect(animationTypeForWord(word)).toBe('float');
    }
  });

  it('drops what has weight, wherever the dictionary files it', () => {
    for (const word of ['apple', 'egg', 'rock', 'coin', 'pumpkin', 'football']) {
      expect(['lob', 'bounce', 'arc']).toContain(animationTypeForWord(word));
    }
  });

  it('gives a heart its heartbeat and a snowflake its spin', () => {
    expect(motionForWord('heart').flair).toBe('throb');
    expect(motionForWord('snowflake').flair).toBe('spin');
  });
});

describe('which way a travelling thing faces', () => {
  it('defaults a side-on animal to facing left, so it can be flipped', () => {
    expect(motionForWord('zebra').facing).toBe('left');
  });

  it('never flips a glyph drawn head-on', () => {
    for (const word of ['lion', 'bus', 'robot']) {
      expect(motionForWord(word).facing).toBe('any');
    }
  });

  it('flips a family that mixes a head-on glyph with a side-on one', () => {
    // dog and cat pair a head-on primary with a side-on sibling, so they take
    // the animal default rather than sitting in FRONT_FACING — otherwise 🐕
    // and 🐈 run tail-first half the time.
    for (const word of ['dog', 'cat']) {
      expect(motionForWord(word).facing).toBe('left');
    }
  });

  it('knows the plane points the other way', () => {
    expect(motionForWord('plane').facing).toBe('right');
  });
});

describe('motion stays about motion', () => {
  it('returns no emojiSet for any word', () => {
    for (const word of Object.keys(WORD_EMOJI)) {
      expect(motionForWord(word).emojiSet).toBeUndefined();
    }
  });
});

describe('counting works for every word, not a hand-picked few', () => {
  it('reads a number written before the word', () => {
    expect(countForWord('5 lions', 'lion')).toBe(5);
    expect(countForWord('3 cookies', 'cookie')).toBe(3);
    expect(countForWord('12 giraffes', 'giraffe')).toBe(12);
  });

  it('falls back to the word default when no number was asked for', () => {
    expect(countForWord('lions', 'lion')).toBeNull();
    expect(resolveWordEffect('lions').count).toBeGreaterThan(0);
  });

  it('carries the count into the effect', () => {
    expect(resolveWordEffect('7 dogs').count).toBe(7);
  });

  it('caps a silly number so a tab stays usable', () => {
    expect(countForWord('99999 bees', 'bee')).toBe(150);
  });

  it('copes with a phrase entry', () => {
    expect(countForWord('4 ice cream', 'ice cream')).toBe(4);
  });
});

describe('a number next to a word counts the word, not balloons', () => {
  const run = text => {
    const spawnEmojis = jest.fn();
    const spawnBalloons = jest.fn();
    useEasterEggs({ spawnBalloons }).evaluateEasterEggs(text, spawnEmojis);
    return { spawnEmojis, spawnBalloons };
  };

  it('sends five lions across, and no balloons', () => {
    const { spawnEmojis, spawnBalloons } = run('5 lions');

    expect(spawnBalloons).not.toHaveBeenCalled();
    expect(spawnEmojis).toHaveBeenCalledTimes(1);
    expect(spawnEmojis.mock.calls[0][0]).toBe('run');
    expect(spawnEmojis.mock.calls[0][1]).toBe(5);
  });

  it('still floats balloons for a bare number', () => {
    const { spawnEmojis, spawnBalloons } = run('7');

    expect(spawnBalloons).toHaveBeenCalledWith(7);
    expect(spawnEmojis).not.toHaveBeenCalled();
  });

  it('still floats balloons when the number belongs to nothing', () => {
    const { spawnBalloons } = run('hello 5');
    expect(spawnBalloons).toHaveBeenCalledWith(5);
  });

  it('leaves the money rain to the special that owns it', () => {
    const { spawnEmojis, spawnBalloons } = run('$5');

    expect(spawnBalloons).not.toHaveBeenCalled();
    expect(spawnEmojis.mock.calls[0][1]).toBe(5);
  });
});

describe('the dictionary knows its own categories', () => {
  it('files every word under exactly one category', () => {
    for (const word of Object.keys(WORD_EMOJI)) {
      expect(categoryForWord(word)).not.toBeNull();
    }
  });

  it('has nothing to say about a word it does not hold', () => {
    expect(categoryForWord('qqq')).toBeNull();
  });
});
