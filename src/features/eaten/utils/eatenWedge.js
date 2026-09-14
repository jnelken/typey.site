// Pure geometry: the CSS `clip-path` that leaves only the *uneaten* part of a
// glyph on screen.
//
// A bite is drawn as a wedge out of the top, running clockwise from twelve
// o'clock — the shape a slice missing from a pie or a pizza makes, which is the
// one cut that reads as "eaten" rather than "broken". So what's left is the
// wedge from wherever the bite ended round to twelve o'clock again.
//
// The proportion is carried by *angle*, not by area of the clipping box. Food
// glyphs are drawn round inside their square, so an angular wedge on a cookie
// is an area-proportional bite of the cookie; an area-proportional bite of the
// square would not be. This is the same convention a pie chart uses, for the
// same reason.

// Where the polygon's straight edges meet the box, in turns from twelve
// o'clock going clockwise. Every wedge has to include the corners it sweeps
// past or its edge cuts the corner off.
const CORNER_TURNS = [0.125, 0.375, 0.625, 0.875];

const CENTER = '50% 50%';
const FULL_BOX = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)';
// A wedge of nothing still has to be a valid polygon, so it collapses to the
// centre point rather than to an empty string — an empty clip-path would show
// the whole glyph, which is the opposite of what a fully eaten one means.
const EMPTY = `polygon(${CENTER}, ${CENTER}, ${CENTER})`;

const round = value => Math.round(value * 100) / 100;

/**
 * Where the ray at `turn` (0 = twelve o'clock, clockwise) leaves the box, as a
 * `"x% y%"` pair. Projected onto the square rather than a circle so the clip
 * covers the glyph's corners.
 */
function edgePoint(turn) {
  const angle = turn * 2 * Math.PI;
  const dx = Math.sin(angle);
  const dy = -Math.cos(angle);
  const scale = 1 / Math.max(Math.abs(dx), Math.abs(dy));
  return `${round(50 + 50 * dx * scale)}% ${round(50 + 50 * dy * scale)}%`;
}

/**
 * The clip-path leaving `remaining` (0–1) of a glyph visible.
 *
 * 1 is the whole box — a glyph nobody has bitten is not clipped at all, so it
 * keeps its antialiased edges instead of being traced round by a polygon.
 */
export function remainingWedgePath(remaining) {
  const fraction = Number.isFinite(remaining) ? Math.max(0, Math.min(1, remaining)) : 0;
  if (fraction >= 1) return FULL_BOX;
  if (fraction <= 0) return EMPTY;

  // The bite is taken from twelve o'clock clockwise, so what's left starts
  // where the bite stopped and runs round to twelve o'clock.
  const start = 1 - fraction;
  const points = [CENTER, edgePoint(start)];
  for (const corner of CORNER_TURNS) {
    if (corner > start) points.push(edgePoint(corner));
  }
  points.push(edgePoint(1));

  return `polygon(${points.join(', ')})`;
}

/**
 * The area of a clip-path this module produced, as a fraction of the box.
 * Exported for the spec: it is how "a bigger bite leaves less behind" is
 * asserted on the polygon itself rather than on a rendered style, which jsdom
 * would not resolve.
 */
export function pathArea(path) {
  const pairs = path
    .replace(/^polygon\(|\)$/g, '')
    .split(',')
    .map(pair => pair.trim().split(/\s+/).map(n => parseFloat(n)));

  // Shoelace, over a 100×100 box.
  let twiceArea = 0;
  for (let i = 0; i < pairs.length; i++) {
    const [x1, y1] = pairs[i];
    const [x2, y2] = pairs[(i + 1) % pairs.length];
    twiceArea += x1 * y2 - x2 * y1;
  }
  return Math.abs(twiceArea) / 2 / 10000;
}
