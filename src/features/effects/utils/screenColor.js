import { findWordEmoji } from '@/features/typing/utils/wordEmoji';

// Typing a colour washes the whole screen in it until the next line is sent.
//
// The washes are pale on purpose. The app draws its text in a near-black
// (`--color-text-primary`) that it uses everywhere, and a fully saturated
// ground would leave a child reading their own typing against no contrast at
// all. Every value below is checked against that text colour in
// `tests/unit/screenColor.spec.js`, which is also why "black" lands as a slate
// grey rather than actual black: on black there is nothing left to read.

export const SCREEN_COLORS = Object.freeze({
  red: '#ffdad6',
  orange: '#ffe3c7',
  yellow: '#fff3c4',
  green: '#d6f5da',
  blue: '#d7e7ff',
  purple: '#e8dcff',
  pink: '#ffdcec',
  brown: '#ecdac6',
  black: '#d4d8dd',
  white: '#ffffff',
});

// Produce words map to SCREEN_COLORS *names*, not hexes, so every wash still
// resolves through SCREEN_COLORS and the existing contrast test covers the
// feature for free. garlic → brown: white on a near-white page is invisible.
export const PRODUCE_COLORS = Object.freeze({
  apple: 'red', strawberry: 'red', cherry: 'red', tomato: 'red', pepper: 'red',
  banana: 'yellow', lemon: 'yellow', pineapple: 'yellow', corn: 'yellow',
  grapes: 'purple', onion: 'purple',
  blueberry: 'blue',
  watermelon: 'pink', peach: 'pink',
  kiwi: 'green', pear: 'green', avocado: 'green', broccoli: 'green',
  cucumber: 'green', melon: 'green',
  orange: 'orange', mango: 'orange', carrot: 'orange',
  coconut: 'brown', potato: 'brown', mushroom: 'brown', peanut: 'brown',
  garlic: 'brown',
});

// Saturated hues for splat droplets only. Deliberately NOT the AA-darkened
// COLOR_PALETTE hues from easter-eggs/utils/colorMode.js: those are for text
// and read muddy as splatter. Droplets are pointer-events:none decoration
// carrying no contrast constraint — don't "fix" these to match the washes.
export const SPLAT_COLORS = Object.freeze({
  red: '#e33e3e', orange: '#f08a24', yellow: '#f5c518', green: '#3fa85a',
  blue: '#3d7fe0', purple: '#8a5fd6', pink: '#e35b9a', brown: '#a8703f',
  black: '#5b6270', white: '#dfe3e8',
});

// The page's own background, restored when a line names no colour.
export const DEFAULT_SCREEN_COLOR = '#f8f9fa';

const COLOR_WORDS = Object.keys(SCREEN_COLORS);

/**
 * The wash a finished line asks for, or null when it names no colour. A named
 * colour beats a produce word regardless of order ("purple banana" and
 * "banana purple" are both purple). The first colour word in the line wins
 * among colour words; only if none appear does produce get a look in.
 */
export function screenColorForText(text) {
  if (typeof text !== 'string') return null;

  for (const word of text.toLowerCase().split(/[^a-z]+/).filter(Boolean)) {
    if (COLOR_WORDS.includes(word)) return SCREEN_COLORS[word];
  }

  const match = findWordEmoji(text);
  if (!match) return null;
  const colorName = PRODUCE_COLORS[match.word];
  return colorName ? SCREEN_COLORS[colorName] : null;
}
