import { describe, it, expect, jest, afterEach } from '@jest/globals';
import {
  ALL_PROMPTS,
  PROMPT_NUMBERS,
  PROMPT_DOLLARS,
  promptKind,
  emojiForPrompt,
  randomPrompt,
} from '@/features/typing/utils/promptWords';
import { useEasterEggs } from '@/features/easter-eggs/composables/useEasterEggs';

afterEach(() => {
  jest.restoreAllMocks();
});

describe('the prompt pool', () => {
  it('offers numbers to count out', () => {
    expect(PROMPT_NUMBERS).toContain('1');
    expect(PROMPT_NUMBERS).toContain('20');
  });

  it('offers dollar amounts', () => {
    expect(PROMPT_DOLLARS).toContain('$1');
    expect(PROMPT_DOLLARS).toContain('$20');
  });

  it('holds words, numbers and amounts together', () => {
    expect(ALL_PROMPTS).toContain('cat');
    expect(ALL_PROMPTS).toContain('7');
    expect(ALL_PROMPTS).toContain('$5');
  });
});

describe('promptKind', () => {
  it('tells the three kinds apart', () => {
    expect(promptKind('cat')).toBe('word');
    expect(promptKind('traffic light')).toBe('word');
    expect(promptKind('7')).toBe('number');
    expect(promptKind('$5')).toBe('dollars');
  });
});

describe('emojiForPrompt', () => {
  it('gives a number the balloons it will float', () => {
    expect(emojiForPrompt('7')).toBe('🎈');
  });

  it('gives an amount the bill it will rain', () => {
    expect(emojiForPrompt('$5')).toBe('💵');
  });

  it('gives a word its own picture', () => {
    expect(emojiForPrompt('cat')).toBe('🐱');
  });

  it('gives every prompt in the pool a picture', () => {
    const blanks = ALL_PROMPTS.filter(prompt => !emojiForPrompt(prompt));
    expect(blanks).toEqual([]);
  });
});

describe('randomPrompt', () => {
  it('draws a number when the roll lands there', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.01);
    expect(PROMPT_NUMBERS).toContain(randomPrompt());
  });

  it('draws an amount when the roll lands there', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.1);
    expect(PROMPT_DOLLARS).toContain(randomPrompt());
  });

  it('draws a word the rest of the time', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.5);
    const prompt = randomPrompt();
    expect(promptKind(prompt)).toBe('word');
  });

  it('turns up numbers and amounts over a run of draws', () => {
    const kinds = new Set();
    for (let i = 0; i < 2000; i++) kinds.add(promptKind(randomPrompt()));
    expect([...kinds].sort()).toEqual(['dollars', 'number', 'word']);
  });
});

describe('every prompt animates when typed', () => {
  it('sets something off for numbers and amounts too', () => {
    const blanks = [];

    for (const prompt of [...PROMPT_NUMBERS, ...PROMPT_DOLLARS]) {
      const spawnEmojis = jest.fn();
      const spawnBalloons = jest.fn();
      useEasterEggs({ spawnBalloons }).evaluateEasterEggs(prompt, spawnEmojis);

      if (!spawnEmojis.mock.calls.length && !spawnBalloons.mock.calls.length) {
        blanks.push(prompt);
      }
    }

    expect(blanks).toEqual([]);
  });

  it('floats one balloon per number typed', () => {
    const spawnBalloons = jest.fn();
    useEasterEggs({ spawnBalloons }).evaluateEasterEggs('7', jest.fn());
    expect(spawnBalloons).toHaveBeenCalledWith(7);
  });
});
