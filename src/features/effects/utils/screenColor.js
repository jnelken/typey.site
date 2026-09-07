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

// The page's own background, restored when a line names no colour.
export const DEFAULT_SCREEN_COLOR = '#f8f9fa';

const COLOR_WORDS = Object.keys(SCREEN_COLORS);

/**
 * The wash a finished line asks for, or null when it names no colour. The
 * first colour word in the line wins, so "red car" is red.
 */
export function screenColorForText(text) {
  if (typeof text !== 'string') return null;

  for (const word of text.toLowerCase().split(/[^a-z]+/).filter(Boolean)) {
    if (COLOR_WORDS.includes(word)) return SCREEN_COLORS[word];
  }
  return null;
}
