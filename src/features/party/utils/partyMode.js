// Party Mode — typing "party" on its own line turns every keystroke into a
// burst of confetti, and every line sent into a spray off both edges of the
// screen. Typing it again turns it back off, and so does Escape.
//
// Like Color Mode and Silly Mode this is an easter egg rather than a setting:
// it is deliberately not persisted, so a refresh brings back a quiet page.

import { SPLAT_COLORS } from '@/features/effects/utils/screenColor';

// Matched on its own as a whole line rather than anywhere in the text, the
// same way every other mode switch is — a celebration shouldn't fire in the
// middle of a sentence about a party.
export const PARTY_TRIGGERS = Object.freeze(['party']);

// The confetti palette is the produce splatter's own, minus the two colours
// that can't read as a fleck on a near-white page: `white` is the invisible
// splatter that made `garlic` brown, and `black` reads as grit rather than
// celebration. Naming the keys rather than the hexes is what keeps this from
// introducing a colour `tests/unit/screenColor.spec.js` would have to start
// checking — every value here is already covered there.
export const CONFETTI_COLOR_NAMES = Object.freeze([
  'red',
  'orange',
  'yellow',
  'green',
  'blue',
  'purple',
  'pink',
]);

export const CONFETTI_COLORS = Object.freeze(
  CONFETTI_COLOR_NAMES.map(name => SPLAT_COLORS[name]),
);

// A burst per keystroke is a new photosensitivity surface — a child hammering
// the keyboard would otherwise fire six or eight a second. Held to the same
// three-a-second ceiling the overcharge storm already uses (WCAG 2.3.1), which
// doubles as the performance guard: a held-down key can never outrun the
// droplets it spawns.
export const MIN_BURST_INTERVAL_MS = 340;

// A keystroke burst is small and close to the letter; an edge burst is the
// bigger payoff for finishing a line, so it throws more and larger flecks.
export const CHARACTER_BURST_COUNT = 8;
export const CHARACTER_BURST_SIZE = 10;
export const EDGE_BURST_COUNT = 14;
export const EDGE_BURST_SIZE = 14;

// Three per side, so the spray frames the screen without crowding the middle
// where the child is reading their own typing.
export const EDGE_BURSTS_PER_SIDE = 3;

// Droplets fly out radially, so a burst fired exactly on the edge throws half
// of itself off-screen. Inset by a little over the largest fleck so the cluster
// still reads as coming in *off* the edge while staying visible.
export const EDGE_INSET_PX = 24;

/** Whether a finished line is the party-mode trigger. */
export function isPartyTrigger(text) {
  if (typeof text !== 'string') return false;
  return PARTY_TRIGGERS.includes(text.trim().toLowerCase());
}

/**
 * Whether enough time has passed since the last burst to fire another. Pure so
 * the rate cap is provable without a keyboard: the caller owns the clock.
 */
export function shouldBurst(lastBurstAt, now, interval = MIN_BURST_INTERVAL_MS) {
  if (typeof now !== 'number' || !Number.isFinite(now)) return false;
  if (typeof lastBurstAt !== 'number' || !Number.isFinite(lastBurstAt)) return true;
  return now - lastBurstAt >= interval;
}

/**
 * Where a sent line's confetti comes from: evenly spaced down the left and
 * right edges, alternating sides so a short spray is still balanced.
 *
 * Returns fractions of the viewport rather than pixels — the caller owns the
 * window, which is what keeps this testable with no layout at all.
 */
export function edgeBurstPositions(perSide = EDGE_BURSTS_PER_SIDE) {
  if (!Number.isInteger(perSide) || perSide < 1) return [];

  const positions = [];
  for (let rank = 0; rank < perSide; rank += 1) {
    // Inset from both ends: at three a side that's 25% / 50% / 75%, so nothing
    // fires off the top or bottom corner where it would be half off-screen.
    const top = (rank + 1) / (perSide + 1);
    positions.push({ side: 'left', top });
    positions.push({ side: 'right', top });
  }
  return positions;
}
