import { findWordEmoji } from '@/features/typing/utils/wordEmoji';
import { motionForWord, PATH_OPTIONS } from '@/features/effects/utils/wordMotion';

// Every word in the dictionary gets an animation, and the dictionary decides
// which one — see `wordMotion.js`. This module turns that decision into the
// arguments `spawnEmojis` wants.

// Paths that fall back to the ground instead of drifting off the top.
const GRAVITY_PATHS = ['arc', 'lob', 'bounce'];

// How many copies a line can ask for. "10 lions" is a treat; a stray "9999" is
// a frozen tab.
const COUNT_CAP = 150;

/** Whether a word names something the app throws or drops rather than floats. */
export function isHeavyWord(word) {
  if (typeof word !== 'string' || !word) return false;
  return GRAVITY_PATHS.includes(motionForWord(word).path);
}

/**
 * Which animation a word gets. A property of the word, not of its spelling:
 * animals run, food is thrown, weather falls.
 */
export function animationTypeForWord(word) {
  if (typeof word !== 'string' || word.length === 0) return 'float';
  return motionForWord(word).path;
}

/**
 * A count written into the line — "5 lions", "3 cookies" — capped. Returns null
 * when the child didn't ask for a number, so the word's own default stands.
 *
 * This used to be a hand-written regex per easter egg, which meant fifteen
 * words could be counted and the other six hundred could not.
 */
export function countForWord(text, word) {
  if (typeof text !== 'string' || typeof word !== 'string' || !word) return null;
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = text.toLowerCase().match(new RegExp(`(\\d+)\\s*${escaped}s?\\b`));
  if (!match) return null;
  const parsed = parseInt(match[1], 10);
  if (Number.isNaN(parsed)) return null;
  return Math.max(1, Math.min(parsed, COUNT_CAP));
}

/**
 * The spawn arguments for a word's animation: `{ type, count, options }`.
 * Exported on its own so the word guide can play the same effect on a tap that
 * typing the word would play.
 */
export function effectForWord(word, emoji, text = '') {
  const motion = motionForWord(word);
  const { count: pathCount, ...pathOptions } = PATH_OPTIONS[motion.path];

  const options = { ...pathOptions, flair: motion.flair, facing: motion.facing };
  if (motion.emojiSet) options.emojiSet = motion.emojiSet;
  else options.emoji = emoji;

  const count = countForWord(text, word) ?? motion.count ?? pathCount;

  return { type: motion.path, count, options };
}

/**
 * The spawn arguments for a line's word animation, or null when the line has
 * no word we have a picture for.
 */
export function resolveWordEffect(text) {
  const match = findWordEmoji(text);
  if (!match) return null;
  return effectForWord(match.word, match.emoji, text);
}
