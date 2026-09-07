import { EMOJI_WORDS, emojiForWord } from '@/features/typing/utils/wordEmoji';

// Gentle preview: while the child types, peek at the last word and, if it's a
// prefix of a word we have a picture for, return that picture so we can hint at
// the fun that's coming.
//
// This used to read a hand-written list of 28 hints, so typing "cook" showed
// nothing even though 🍪 was already in the library. It now reads the same
// dictionary the prompts and the guide read.

// Single words only — a phrase like "traffic light" can't be a prefix of the
// one word under the cursor.
const PREVIEW_WORDS = EMOJI_WORDS.filter(word => !word.includes(' '));

export function matchTypeahead(text) {
  if (typeof text !== 'string') return null;
  const word = text.trim().toLowerCase().split(/\s+/).pop();
  if (!word || word.length < 2) return null;

  // An exact word wins; otherwise the nearest word it could still become, so
  // "cook" previews the cookie rather than a cookbook three letters further on.
  let best = null;
  for (const candidate of PREVIEW_WORDS) {
    if (candidate === word) return emojiForWord(candidate);
    if (candidate.startsWith(word) && (!best || candidate.length < best.length)) {
      best = candidate;
    }
  }
  return best ? emojiForWord(best) : null;
}
