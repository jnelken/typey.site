// Where the line being typed is sitting on screen, in viewport coordinates.
//
// Two features aim at it — the overcharged battery's bolts and Party Mode's
// confetti — and both measure it once on the frame they fire and remember the
// answer, because by the time the effect lands the letter may be gone. Sharing
// one selector is what keeps them from drifting apart when `InputSection`'s
// markup changes: a stale copy would leave one of them firing into the corner.

export const CURRENT_LINE_SELECTOR = '.current-line-display';
export const GLYPH_SELECTOR = `${CURRENT_LINE_SELECTOR} span.character`;

const centreOf = rect => {
  if (!rect || !(rect.width || rect.height)) return null;
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
};

/**
 * The centre of the last rendered glyph on the current line, or null when the
 * line is empty (or not laid out, as in jsdom).
 */
export function lastGlyphPoint() {
  if (typeof document === 'undefined') return null;
  const glyphs = document.querySelectorAll(GLYPH_SELECTOR);
  const last = glyphs[glyphs.length - 1];
  return centreOf(last?.getBoundingClientRect());
}

/** The centre of the current line itself — the fallback when no glyph is left. */
export function currentLinePoint() {
  if (typeof document === 'undefined') return null;
  return centreOf(document.querySelector(CURRENT_LINE_SELECTOR)?.getBoundingClientRect());
}
