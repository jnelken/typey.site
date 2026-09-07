// Color Mode — typing "color" (or "colour", or "rainbow") on its own line
// paints every character a different color, cycling through a rainbow palette.
//
// "rainbow" is an alias rather than a mode of its own: the roadmap once planned
// a separate Rainbow Mode that cycled whole colour themes, and there is only
// one palette here by design, so the word people reach for lands on the effect
// that already exists.
//
// Like emoji mode, this is display-only: the palette is applied per rendered
// character in `AnimatedText`, so speech, easter eggs, word suggestions and
// the Tidbyt submission all keep reading the real text. A screen reader still
// gets exactly the letters that were typed.

export const COLOR_TRIGGERS = ['color', 'colour', 'rainbow'];

// The page background (`--color-background` in `src/style.css`). Every palette
// entry is contrast-checked against it, so keep the two in step.
export const PAGE_BACKGROUND = '#f8f9fa';

// WCAG AA for normal-size text. The typing display is 4rem, so it clears the
// large-text bar comfortably too — this is the stricter of the two.
export const MIN_CONTRAST_RATIO = 4.5;

// A rainbow read left to right, darkened until each hue clears AA against the
// near-white background. "Yellow" has to land as a deep gold: a bright yellow
// cannot reach 4.5:1 on a light page at any saturation.
export const COLOR_PALETTE = [
  '#cc1f36', // red
  '#a8500f', // orange
  '#7a6100', // gold
  '#1b7a3e', // green
  '#0f6f74', // teal
  '#1a53c4', // blue
  '#6a2fb5', // purple
];

/** Whether a finished line is the color-mode trigger. */
export function isColorTrigger(text) {
  if (typeof text !== 'string') return false;
  return COLOR_TRIGGERS.includes(text.trim().toLowerCase());
}

/**
 * The palette color for a character position. Cycles, so a line longer than
 * the palette starts over rather than running out of colors. Spaces occupy a
 * position like any other character — the index is the raw one from the
 * rendered line, which keeps this a pure function of position.
 */
export function colorForIndex(index) {
  if (!Number.isInteger(index) || index < 0) return COLOR_PALETTE[0];
  return COLOR_PALETTE[index % COLOR_PALETTE.length];
}

/** Relative luminance of a `#rrggbb` color, per WCAG 2.1. */
export function relativeLuminance(hex) {
  const channels = [1, 3, 5]
    .map(offset => parseInt(hex.slice(offset, offset + 2), 16) / 255)
    .map(value =>
      value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
    );
  return (
    0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]
  );
}

/** Contrast ratio between two `#rrggbb` colors, from 1 to 21. */
export function contrastRatio(foreground, background) {
  const a = relativeLuminance(foreground);
  const b = relativeLuminance(background);
  const lighter = Math.max(a, b);
  const darker = Math.min(a, b);
  return (lighter + 0.05) / (darker + 0.05);
}
