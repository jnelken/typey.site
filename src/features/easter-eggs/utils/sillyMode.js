import { EMOJI_WORDS } from '@/features/typing/utils/wordEmoji';

// Silly mode drops a random word into the input once a second, so the line
// grows into nonsense the child can send with Enter whenever they like.
export const SILLY_INTERVAL_MS = 1000;

// A tab left open shouldn't keep writing forever, so a run stops itself after
// this many words — about twenty seconds of silliness.
export const SILLY_MAX_WORDS = 20;

// The word that starts (and stops) a run, matched on its own as a whole line
// rather than anywhere in the text: a mode switch shouldn't fire mid-sentence.
export const SILLY_TRIGGER = 'silly';

/** Whether a finished line is the silly-mode trigger. */
export function isSillyTrigger(text) {
  return typeof text === 'string' && text.trim().toLowerCase() === SILLY_TRIGGER;
}

/** A line with one more word on the end, and no leading space on an empty one. */
export function appendSillyWord(text, word) {
  const base = typeof text === 'string' ? text : '';
  if (typeof word !== 'string' || word.length === 0) return base;
  if (base.length === 0) return word;
  return /\s$/.test(base) ? base + word : `${base} ${word}`;
}

/**
 * A random word from the emoji library — every one of those has a picture and
 * an animation, so pressing Enter on a silly line always pays off. Never the
 * word just used, so the line doesn't stutter.
 */
export function randomSillyWord(exclude) {
  const pool = EMOJI_WORDS;
  if (pool.length === 0) return '';
  const index = Math.floor(Math.random() * pool.length);
  const word = pool[index];
  if (pool.length > 1 && word === exclude) return pool[(index + 1) % pool.length];
  return word;
}
