import { findWordEmoji } from '@/features/typing/utils/wordEmoji';

// Every word in the emoji library gets an animation, not just the ones with a
// hand-written easter egg. This is the fallback that fills those gaps, so no
// word a child types ever lands with nothing happening.

// Drifting up and off the top of the screen is fine for a balloon and wrong
// for a football. Anything with weight gets one of the gravity animations
// instead: kicked across in an arc, launched up and falling back, or dropped
// and bouncing to a stop.
const HEAVY_WORDS = new Set([
  'ball', 'soccer', 'basketball', 'football', 'baseball', 'tennis',
  'volleyball', 'bowling', 'golf', 'hockey',
  'apple', 'orange', 'peach', 'pear', 'melon', 'watermelon', 'coconut',
  'potato', 'tomato', 'onion', 'pumpkin', 'egg',
  'rock', 'coin', 'gem', 'dice', 'medal', 'trophy',
]);

const TYPES = ['float', 'rain', 'burst'];
const HEAVY_TYPES = ['arc', 'lob', 'bounce'];

// Per-type feel. Bursts are short and punchy; rain and float drift longer.
// The gravity types run fewer and larger, so each throw reads as one object.
const TYPE_OPTIONS = {
  float: { count: 20, minDuration: 4000, maxDuration: 8000, stagger: 1600, minSize: 24, maxSize: 38 },
  rain: { count: 26, minDuration: 3500, maxDuration: 7000, stagger: 1400, minSize: 22, maxSize: 36 },
  burst: { count: 18, minDuration: 2000, maxDuration: 4000, stagger: 800, minSize: 24, maxSize: 40 },
  arc: { count: 8, minDuration: 2600, maxDuration: 4200, stagger: 1400, minSize: 34, maxSize: 52, scaleMin: 1.1, scaleMax: 1.9 },
  lob: { count: 8, minDuration: 2400, maxDuration: 3800, stagger: 1500, minSize: 34, maxSize: 52, scaleMin: 1.1, scaleMax: 1.9 },
  bounce: { count: 10, minDuration: 3000, maxDuration: 4600, stagger: 1600, minSize: 32, maxSize: 50, scaleMin: 1.1, scaleMax: 1.9 },
};

/** Whether a word names something with enough weight to obey gravity. */
export function isHeavyWord(word) {
  return typeof word === 'string' && HEAVY_WORDS.has(word.toLowerCase());
}

/**
 * Which animation a word gets. Deterministic, so a word always moves the same
 * way — a child learns that bananas rain and the football bounces — while the
 * library as a whole stays varied without anyone hand-assigning an effect per
 * word.
 */
export function animationTypeForWord(word) {
  const types = isHeavyWord(word) ? HEAVY_TYPES : TYPES;
  if (typeof word !== 'string' || word.length === 0) return types[0];

  let hash = 0;
  for (const char of word) {
    hash = (hash * 31 + char.charCodeAt(0)) % 100003;
  }
  return types[hash % types.length];
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
