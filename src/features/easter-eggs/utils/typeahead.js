import { EASTER_EGGS } from '@/constants/emojiEasterEggs';

// Build a flat list of { word, emoji } from the easter-egg hints once.
const HINTS = EASTER_EGGS.flatMap(egg =>
  (egg.hints || [])
    .filter(h => typeof h === 'string' && /^[a-z]/i.test(h))
    .map(word => ({ word: word.toLowerCase(), emoji: (egg.emojis || [])[0] })),
);

// Gentle preview: while the child types, peek at the last word and, if it's a
// prefix of a magic word, return that effect's emoji so we can hint at the fun
// that's coming. Returns null when there's nothing worth previewing.
export function matchTypeahead(text) {
  if (typeof text !== 'string') return null;
  const word = text.trim().toLowerCase().split(/\s+/).pop();
  if (!word || word.length < 2) return null;

  for (const hint of HINTS) {
    if (hint.emoji && hint.word.startsWith(word)) {
      return hint.emoji;
    }
  }
  return null;
}
