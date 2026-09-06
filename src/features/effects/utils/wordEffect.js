import { findWordEmoji } from '@/features/typing/utils/wordEmoji';

// Every word in the emoji library gets an animation, not just the ones with a
// hand-written easter egg. This is the fallback that fills those gaps, so no
// word a child types ever lands with nothing happening.

const TYPES = ['float', 'rain', 'burst'];

// Per-type feel. Bursts are short and punchy; rain and float drift longer.
const TYPE_OPTIONS = {
  float: { count: 20, minDuration: 4000, maxDuration: 8000, stagger: 1600, minSize: 24, maxSize: 38 },
  rain: { count: 26, minDuration: 3500, maxDuration: 7000, stagger: 1400, minSize: 22, maxSize: 36 },
  burst: { count: 18, minDuration: 2000, maxDuration: 4000, stagger: 800, minSize: 24, maxSize: 40 },
};

/**
 * Which animation a word gets. Deterministic, so a word always moves the same
 * way — a child learns that bananas rain — while the library as a whole stays
 * varied without anyone hand-assigning an effect per word.
 */
export function animationTypeForWord(word) {
  if (typeof word !== 'string' || word.length === 0) return TYPES[0];

  let hash = 0;
  for (const char of word) {
    hash = (hash * 31 + char.charCodeAt(0)) % 100003;
  }
  return TYPES[hash % TYPES.length];
}

/**
 * The spawn arguments for a line's word animation, or null when the line has
 * no word we have a picture for.
 */
export function resolveWordEffect(text) {
  const match = findWordEmoji(text);
  if (!match) return null;

  const type = animationTypeForWord(match.word);
  const { count, ...options } = TYPE_OPTIONS[type];

  return { type, count, options: { ...options, emoji: match.emoji } };
}
