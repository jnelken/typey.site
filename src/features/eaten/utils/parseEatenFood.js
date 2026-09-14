import { findWordEmoji, categoryForWord } from '@/features/typing/utils/wordEmoji';

// Pure utility: read "50% cookie" as *half a cookie eaten*.
//
// A percent written against a word is the same generalisation counting made
// when "5 lions" replaced fifteen hand-written regexes — the number says what
// happens to the word's picture. Here it says how much of it is gone.
//
// Restricted to things you can eat, and that restriction is the whole reason
// the item needed stating before it was built: the wedge that reads as a bite
// out of a cookie reads as *broken* through a lion. Only the dictionary's
// `food` and `produce` categories get it; every other line returns null and
// falls through to the word animation it already had, so "50% lion" is still a
// pride of lions running across the screen.
//
// Note that a percent never reached `countForWord` anyway: its pattern is
// `(\d+)\s*word`, and the "%" sits between the two. So this takes nothing away
// from counting — "5 cookies" is still five cookies.

const EDIBLE_CATEGORIES = ['food', 'produce'];

// Written either side of the number, the way the money egg takes "$5" or "5$"
// and the battery takes "50%" or "%50". Three digits at most: there is no
// eating more than all of it, and the four-digit range belongs to the battery,
// where an overcharge is the joke.
const PERCENT_PATTERN = /(\d{1,3})\s*%|%\s*(\d{1,3})/;

/**
 * `{ percent, word, emoji, remaining }` for a line that eats a proportion of a
 * food word, or null when the line isn't one.
 *
 * `remaining` is the 0–1 fraction left on the plate, which is what the clip
 * geometry wants; `percent` is what the child typed and what gets spoken.
 */
export function parseEatenFood(text) {
  if (typeof text !== 'string') return null;

  const match = text.match(PERCENT_PATTERN);
  if (!match) return null;

  const percent = parseInt(match[1] ?? match[2], 10);
  // Above 100 there is nothing left to take a bite out of, so the line goes
  // back to being an ordinary cookie line — the swarm it played before this
  // existed. The four-digit range stays the battery's, where an overcharge is
  // the joke.
  if (Number.isNaN(percent) || percent > 100) return null;

  // The same "which word is this line about" rule the rest of the app uses:
  // the first word in the line that has a picture, phrases first, plurals
  // folded back to their singular. A line whose first picture-word isn't food
  // is not an eating line at all, even if a food word follows it — one rule
  // for the whole app beats a second one that only this feature knows.
  const found = findWordEmoji(text);
  if (!found) return null;
  if (!EDIBLE_CATEGORIES.includes(categoryForWord(found.word))) return null;

  return {
    percent,
    word: found.word,
    emoji: found.emoji,
    remaining: (100 - percent) / 100,
  };
}
