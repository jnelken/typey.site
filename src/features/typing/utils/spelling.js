// Letter-by-letter feedback against the prompt word.
//
// Case is ignored throughout: caps lock changes what the same keystroke
// produces, and a child who types C-A-T with it on has not made a mistake.

export const RIGHT = 'right';
export const WRONG = 'wrong';
export const UNTYPED = 'untyped';

const normalise = value => (typeof value === 'string' ? value.trim().toLowerCase() : '');

/**
 * The state of each letter *of the prompt*: `right` up to the point where the
 * spelling went astray, `wrong` on the single letter that went astray, and
 * `untyped` for everything after it.
 *
 * Only the first mismatch is marked. Past that point the child and the word
 * have come apart — the letters no longer line up, so calling the rest wrong
 * would be marking them against positions they were never aimed at.
 *
 * A different *first* letter means they aren't spelling this word at all, so
 * nothing is marked and the prompt stays quiet.
 */
export function promptLetterStates(typed, prompt) {
  const target = normalise(prompt);
  const attempt = normalise(typed);
  const states = Array.from(target, () => UNTYPED);

  if (!attempt || attempt[0] !== target[0]) return states;

  for (let index = 0; index < target.length && index < attempt.length; index++) {
    if (attempt[index] !== target[index]) {
      states[index] = WRONG;
      break;
    }
    states[index] = RIGHT;
  }

  return states;
}

/** Where the typed text first parts company with the word, or -1. */
function firstMismatch(attempt, target) {
  for (let index = 0; index < attempt.length; index++) {
    if (attempt[index] !== target[index]) return index;
  }
  return -1;
}

/**
 * Whether what's in the input is plainly an attempt at the prompt, rather than
 * a child who has wandered off to type "dinosaur" instead.
 *
 * Deliberately strict: the same first letter, and no longer than the word
 * itself. Getting this wrong in the permissive direction would paint an
 * unrelated line red and blue for no reason, which is worse than not painting
 * an attempt that really was one.
 */
export function isAttemptingPrompt(typed, prompt) {
  const target = normalise(prompt);
  const attempt = normalise(typed);
  if (!target || !attempt) return false;
  if (attempt.length > target.length) return false;
  return attempt[0] === target[0];
}

/**
 * The state of each letter *the child has typed*, for colouring the input
 * line. Returns null when the input isn't an attempt at the prompt, so the
 * caller leaves it alone.
 *
 * Marked the same way as the prompt: right up to the first mismatch, wrong on
 * it, and nothing after — the tail goes quiet rather than staying red, which
 * would read as approval of letters that no longer line up.
 */
export function typedLetterStates(typed, prompt) {
  if (!isAttemptingPrompt(typed, prompt)) return null;

  const target = normalise(prompt);
  const attempt = normalise(typed);
  const leading = typed.length - typed.trimStart().length;
  const mismatch = firstMismatch(attempt, target);

  // Aligned to the raw string the input renders, so any leading whitespace the
  // child typed doesn't shift the colours off by one.
  return Array.from({ length: typed.length }, (_, index) => {
    const attemptIndex = index - leading;
    if (attemptIndex < 0 || attemptIndex >= attempt.length) return UNTYPED;
    if (mismatch === -1 || attemptIndex < mismatch) return RIGHT;
    return attemptIndex === mismatch ? WRONG : UNTYPED;
  });
}
