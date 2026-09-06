import { EMOJI_WORDS } from '@/features/typing/utils/wordEmoji';

// Gentle spelling help: as the child types the start of a word, we suggest a
// full word that starts with those letters. This both helps when they forget
// how to finish a word and teaches new words when they type a few letters.
//
// The list is the emoji word library plus a few sight words that have no
// picture but are still worth completing. Drawing from the library means ghost
// text, the emoji preview and the practice prompts all agree on one vocabulary.

// Words worth completing even though there's no picture for them.
const SIGHT_WORDS = ['the', 'and', 'you', 'big', 'little'];

// Two-word entries ("traffic light") are left out: ghost text completes the
// word under the cursor, and a phrase can't finish a single word.
export const SUGGESTION_WORDS = [
  ...SIGHT_WORDS,
  ...EMOJI_WORDS.filter(word => !word.includes(' ')),
];

// Suggest a full word that completes the last word the child is typing.
// Returns the canonical (lowercase) word, or null when nothing fits.
export function suggestCompletion(text) {
  if (typeof text !== 'string') return null;

  // The "current word" is the run of letters after the last space. If the text
  // ends with a space there is no word in progress.
  const word = text.split(/\s+/).pop().toLowerCase();
  if (word.length < 2 || !/^[a-z]+$/.test(word)) return null;

  let best = null;
  for (const candidate of SUGGESTION_WORDS) {
    if (candidate.length > word.length && candidate.startsWith(word)) {
      // Prefer the shortest match so we complete to the nearest word.
      if (!best || candidate.length < best.length) best = candidate;
    }
  }
  return best;
}
