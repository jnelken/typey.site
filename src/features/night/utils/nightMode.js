// Goodnight — typing "goodnight" on its own line puts the page to bed: the
// ground goes to a deep night blue, a moon rises in the corner, and the sky
// fills with stars. Typing it again wakes it back up, and so does Escape.
//
// Like Color Mode, Silly Mode and Party Mode this is an easter egg rather than
// a setting, so it is deliberately not persisted — a refresh brings back a
// daylit page and the surprise stays a surprise.
//
// The sky's geometry lives here rather than in the component, the way
// `electricFrame.js` is kept out of the overcharge canvas and `dotLayout.js`
// out of the math one: star placement is arithmetic, and arithmetic can be
// proven without a layout engine. jsdom reports every rect as zero, so a spec
// that measured real elements would assert nothing.

import { MIN_CONTRAST_RATIO, contrastRatio } from '@/features/easter-eggs/utils/colorMode';
import { seededRandom } from '@/features/percent/utils/electricFrame';

// Matched on its own as a whole line rather than anywhere in the text, the
// same way every other mode switch is. Both spellings are here because a child
// saying goodnight will reach for either, and neither is a dictionary word
// with a picture of its own, so this takes nothing over.
export const NIGHT_TRIGGERS = Object.freeze(['goodnight', 'good night']);

/**
 * The night palette.
 *
 * Deliberately NOT the blackout's `#000000` (`html.battery-dead` in
 * `src/style.css`). That black is a power cut — the room losing its lights —
 * and reusing it would make going to bed and running the battery flat look
 * like the same event. A night sky is blue, so this is a deep indigo, dark
 * enough that a white moon and white stars read against it.
 *
 * Every foreground here is checked against `BACKGROUND` at the same 4.5:1 bar
 * Color Mode holds its palette to (`tests/unit/nightMode.spec.js`), which is
 * what keeps the aesthetic choice above from quietly costing accessibility.
 */
export const NIGHT_COLORS = Object.freeze({
  background: '#0b1026',
  surface: '#141a35',
  textPrimary: '#f4f6ff',
  textSecondary: '#d8ddf5',
  textLight: '#a7b0d8',
  // The heading and focus ring. A pale moon-gold rather than the daytime
  // coral, which sinks into the indigo.
  primary: '#ffd88a',
  moon: '#fdf6d8',
  star: '#ffffff',
});

/** The foreground tokens the contrast bar applies to, keyed as they are above. */
export const NIGHT_FOREGROUND_KEYS = Object.freeze([
  'textPrimary',
  'textSecondary',
  'textLight',
  'primary',
  'moon',
  'star',
]);

export { MIN_CONTRAST_RATIO, contrastRatio };

// Enough stars to read as a sky, few enough that a phone still paints them in
// one frame. Each is a single absolutely-positioned span, so the cost is linear.
export const STAR_COUNT = 48;

// Stars are placed in viewport fractions, so the caller owns the window and
// this stays provable with no layout at all.
export const STAR_MIN_SIZE_PX = 2;
export const STAR_MAX_SIZE_PX = 5;

// The moon sits in the top-right, clear of the title on the left and of the
// typing column down the middle.
export const MOON = Object.freeze({ right: 0.08, top: 0.12, sizePx: 96 });

// The band the child is actually reading — the prompt, their own typing and the
// input strip all live between these two fractions of the screen height.
// Stars keep out of it so the sky never sits behind a letter.
export const READING_BAND = Object.freeze({ top: 0.34, bottom: 0.88 });

// How far from the moon's centre a star may not fall, as a fraction of the
// viewport's smaller edge — otherwise a few always land inside the disc.
export const MOON_KEEP_OUT = 0.13;

// The slowest and fastest a star twinkles. Varying the period is what stops
// forty-eight stars from pulsing in lockstep, which reads as a flashing screen
// rather than a sky.
export const TWINKLE_MIN_MS = 2600;
export const TWINKLE_MAX_MS = 5200;

const lerp = (from, to, t) => from + (to - from) * t;

/**
 * Whether a finished line is the goodnight trigger.
 *
 * Collapses runs of whitespace so "good  night" is still goodnight — a child
 * typing two words will not be consistent about the gap between them.
 */
export function isNightTrigger(text) {
  if (typeof text !== 'string') return false;
  const normalized = text.trim().toLowerCase().replace(/\s+/g, ' ');
  return NIGHT_TRIGGERS.includes(normalized);
}

/**
 * The sky: `count` stars, each a position in viewport fractions plus the size
 * and twinkle period it keeps for as long as the night lasts.
 *
 * Seeded rather than `Math.random`, so the same seed always gives the same sky.
 * That is what makes the keep-out rules below testable — a random field could
 * only ever be spot-checked.
 *
 * Stars that would land on the moon or in the reading band are moved rather
 * than dropped, so the count returned is always the count asked for.
 */
export function starField(count = STAR_COUNT, { seed = 1 } = {}) {
  if (!Number.isInteger(count) || count < 1) return [];

  const stars = [];
  for (let index = 0; index < count; index += 1) {
    // Three independent draws per star from one counter, so adjacent stars
    // don't share a coordinate.
    const base = (seed + index) * 3;
    const rx = seededRandom(base + 1);
    const ry = seededRandom(base + 2);
    const rs = seededRandom(base + 3);

    let x = rx;
    // Squeezed into the two bands above and below the reading band rather than
    // rejected, so a crowded seed can't run out of room and return short.
    const upper = READING_BAND.top;
    const lower = 1 - READING_BAND.bottom;
    const total = upper + lower;
    const y = ry * total < upper
      ? (ry * total)
      : READING_BAND.bottom + (ry * total - upper);

    // Push a star off the moon along the x axis, which keeps it in its band.
    const dx = x - (1 - MOON.right);
    const dy = y - MOON.top;
    if (Math.sqrt(dx * dx + dy * dy) < MOON_KEEP_OUT) {
      x = x < 1 - MOON.right
        ? Math.max(0.02, 1 - MOON.right - MOON_KEEP_OUT)
        : Math.min(0.98, 1 - MOON.right + MOON_KEEP_OUT);
    }

    stars.push({
      id: index,
      x,
      y,
      size: lerp(STAR_MIN_SIZE_PX, STAR_MAX_SIZE_PX, rs),
      twinkleMs: Math.round(lerp(TWINKLE_MIN_MS, TWINKLE_MAX_MS, seededRandom(base + 4))),
      // Spread the starting phase so they are already out of step on the first
      // frame, not just drifting apart over the following minute.
      delayMs: Math.round(seededRandom(base + 5) * TWINKLE_MAX_MS),
    });
  }
  return stars;
}
