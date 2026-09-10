import { EMOJI_WORDS, emojiForWord } from '@/features/typing/utils/wordEmoji';

// What a practice prompt can be: a word from the emoji library, a plain number,
// a dollar amount, or a percent. Numbers, amounts and percents earn their place
// because the app already answers them — a bare number floats that many
// balloons, "$5" rains five bills, and "50%" charges a battery — so counting
// practice pays off the same way spelling does.

export const PROMPT_NUMBERS = Object.freeze(
  Array.from({ length: 20 }, (_, i) => String(i + 1)),
);

export const PROMPT_DOLLARS = Object.freeze(
  Array.from({ length: 20 }, (_, i) => `$${i + 1}`),
);

export const PROMPT_PERCENTS = Object.freeze(
  Array.from({ length: 100 }, (_, i) => `${i + 1}%`),
);

export const PROMPT_WORDS = EMOJI_WORDS;

export const ALL_PROMPTS = Object.freeze([
  ...PROMPT_WORDS,
  ...PROMPT_NUMBERS,
  ...PROMPT_DOLLARS,
  ...PROMPT_PERCENTS,
]);

// Roughly one prompt in five is a number, amount or percent. Chosen as a share
// rather than by pooling the lists, so counting keeps showing up however far
// the word library grows — and so the hundred percents don't crowd it out.
const NUMBER_CHANCE = 0.08;
const DOLLAR_CHANCE = 0.07;
const PERCENT_CHANCE = 0.05;

/** The kind of prompt a string is: 'number', 'dollars', 'percent' or 'word'. */
export function promptKind(prompt) {
  if (typeof prompt !== 'string') return 'word';
  const trimmed = prompt.trim();
  if (/^\$\d+$/.test(trimmed)) return 'dollars';
  if (/^\d{1,3}%$/.test(trimmed)) return 'percent';
  if (/^\d+$/.test(trimmed)) return 'number';
  return 'word';
}

/**
 * The picture for a prompt: a word's own emoji, balloons for a number (what
 * typing one sets off), a bill for an amount, or a battery for a percent.
 */
export function emojiForPrompt(prompt) {
  switch (promptKind(prompt)) {
    case 'dollars':
      return '💵';
    case 'percent':
      return '🔋';
    case 'number':
      return '🎈';
    default:
      return emojiForWord(prompt);
  }
}

/**
 * A random prompt, never the one just shown.
 */
export function randomPrompt(exclude) {
  const roll = Math.random();
  const pool =
    roll < NUMBER_CHANCE
      ? PROMPT_NUMBERS
      : roll < NUMBER_CHANCE + DOLLAR_CHANCE
        ? PROMPT_DOLLARS
        : roll < NUMBER_CHANCE + DOLLAR_CHANCE + PERCENT_CHANCE
          ? PROMPT_PERCENTS
          : PROMPT_WORDS;

  let choice = pool[Math.floor(Math.random() * pool.length)];
  while (choice === exclude && pool.length > 1) {
    choice = pool[Math.floor(Math.random() * pool.length)];
  }
  return choice;
}
