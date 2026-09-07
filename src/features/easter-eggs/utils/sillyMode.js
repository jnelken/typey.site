import { EMOJI_WORDS } from '@/features/typing/utils/wordEmoji';
import { COLOR_TRIGGERS } from '@/features/easter-eggs/utils/colorMode';

// Silly mode sends a random word every few seconds, so each one gets the usual
// animation. Three seconds is about how long a word takes to cross the screen
// and land, which is the part worth watching.
export const SILLY_INTERVAL_MS = 3000;

// Five sends is a run you can watch to the end. A tab left open shouldn't keep
// firing animations forever, so the run stops itself here.
export const SILLY_MAX_WORDS = 5;

// The word that starts (and stops) a run, matched on its own as a whole line
// rather than anywhere in the text: a mode switch shouldn't fire mid-sentence.
export const SILLY_TRIGGER = 'silly';

// A word typed on its own line that is itself a mode trigger returns early from
// the send handler, so it plays no animation — and "silly" would stop the run
// mid-flight while "rainbow" would switch Color Mode on. They are all real
// dictionary words with pictures; the run just never reaches for one.
const MODE_TRIGGERS = new Set([SILLY_TRIGGER, ...COLOR_TRIGGERS]);

/** The words a run can send: the emoji library minus the mode triggers. */
export const SILLY_WORDS = Object.freeze(EMOJI_WORDS.filter(word => !MODE_TRIGGERS.has(word)));

/** Whether a finished line is the silly-mode trigger. */
export function isSillyTrigger(text) {
  return typeof text === 'string' && text.trim().toLowerCase() === SILLY_TRIGGER;
}

/**
 * A random word from the emoji library — every one of those has a picture and
 * an animation, so every silly line pays off. Never the word just used, so a
 * run doesn't stutter.
 */
export function randomSillyWord(exclude) {
  const pool = SILLY_WORDS;
  if (pool.length === 0) return '';
  const index = Math.floor(Math.random() * pool.length);
  const word = pool[index];
  if (pool.length > 1 && word === exclude) return pool[(index + 1) % pool.length];
  return word;
}
