import { describe, it, expect, jest, afterEach } from '@jest/globals';
import { toEmojiText } from '@/features/typing/utils/emojiMode';
import {
  ALL_PROMPTS,
  PROMPT_NUMBERS,
  PROMPT_DOLLARS,
  PROMPT_PERCENTS,
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

  it('offers percents across 1–100', () => {
    expect(PROMPT_PERCENTS).toContain('1%');
    expect(PROMPT_PERCENTS).toContain('100%');
    expect(PROMPT_PERCENTS).toHaveLength(100);
  });

  it('holds words, numbers, amounts and percents together', () => {
    expect(ALL_PROMPTS).toContain('cat');
    expect(ALL_PROMPTS).toContain('7');
    expect(ALL_PROMPTS).toContain('$5');
    expect(ALL_PROMPTS).toContain('75%');
  });
});

describe('promptKind', () => {
  it('tells the four kinds apart', () => {
    expect(promptKind('cat')).toBe('word');
    expect(promptKind('traffic light')).toBe('word');
    expect(promptKind('7')).toBe('number');
    expect(promptKind('$5')).toBe('dollars');
    expect(promptKind('50%')).toBe('percent');
    expect(promptKind('100%')).toBe('percent');
  });

  it('reads a percent before a bare number', () => {
    expect(promptKind('75%')).toBe('percent');
  });
});

describe('emojiForPrompt', () => {
  it('gives a number the balloons it will float', () => {
    expect(emojiForPrompt('7')).toBe('🎈');
  });

  it('gives an amount the bill it will rain', () => {
    expect(emojiForPrompt('$5')).toBe('💵');
  });

  it('gives a percent the battery it will charge', () => {
    expect(emojiForPrompt('50%')).toBe('🔋');
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

  it('draws a percent when the roll lands there', () => {
    // NUMBER_CHANCE + DOLLAR_CHANCE = 0.15; + PERCENT_CHANCE = 0.20
    jest.spyOn(Math, 'random').mockReturnValue(0.16);
    expect(PROMPT_PERCENTS).toContain(randomPrompt());
  });

  it('draws a word the rest of the time', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.5);
    const prompt = randomPrompt();
    expect(promptKind(prompt)).toBe('word');
  });

  it('turns up numbers, amounts and percents over a run of draws', () => {
    const kinds = new Set();
    for (let i = 0; i < 2000; i++) kinds.add(promptKind(randomPrompt()));
    expect([...kinds].sort()).toEqual(['dollars', 'number', 'percent', 'word']);
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

  // A percent prompt is only practisable if Emoji Mode can draw it whole — a
  // gap where the "%" is would leave the child spelling a character that has
  // no picture. SYMBOL_EMOJI carries '%', so every one of the hundred renders.
  describe('percent prompts under Emoji Mode', () => {
    it('renders every percent prompt whole', () => {
      for (const prompt of PROMPT_PERCENTS) {
        const drawn = toEmojiText(prompt);
        expect(drawn.endsWith('\u{1F4AF}')).toBe(true);
        expect(drawn.includes('%')).toBe(false);
      }
    });

    it('draws 75% as its digits plus the hundred points', () => {
      expect(toEmojiText('75%')).toBe('7\uFE0F\u20E35\uFE0F\u20E3\u{1F4AF}');
    });
  });
});
