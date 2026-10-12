// Visual grouping for early number sense, from the research spec:
// dots are greedily grouped into fives and each group is a horizontal row,
// stacked top-to-bottom. Color encodes the group-of-five so a quantity is
// graspable at a glance (conceptual subitizing) instead of counted one-by-one.
//
// Rows that would run off the bottom of the screen are split into side-by-side
// bands instead, so every count fits the screen.
import { GROUP_COLORS } from '@/constants/palette';

export { GROUP_COLORS };

// The largest count drawn as dots. Above it the equation is shown without dots.
export const MAX_DOTS = 1_000_000;
// The largest dot pitch in CSS pixels, so small counts do not balloon.
export const MAX_CELL_SIZE = 110;
// Horizontal dot pitch as a multiple of the vertical pitch.
export const COLUMN_PITCH_RATIO = 1.6;

const GROUP_SIZE = 5;
// A band is one group of dots plus one empty column, so bands read as separate.
const BAND_STRIDE = GROUP_SIZE + 1;

export function colorForGroup(groupIndex) {
  return GROUP_COLORS[groupIndex % GROUP_COLORS.length];
}

// The dot at `index` of layoutDots(n, bands), computed without building the
// whole list. Rows fill band by band, top to bottom.
export function dotAt(index, n, bands = 1) {
  const groupIndex = Math.floor(index / GROUP_SIZE);
  const indexInGroup = index % GROUP_SIZE;
  const rowsPerBand = Math.ceil(Math.ceil(n / GROUP_SIZE) / bands);
  const band = Math.floor(groupIndex / rowsPerBand);
  return {
    groupIndex,
    indexInGroup,
    col: band * BAND_STRIDE + indexInGroup,
    row: groupIndex % rowsPerBand,
  };
}

// Lay out n dots as rows of five, split into `bands` side-by-side bands. Returns
// one entry per dot with its group (row) index, position within the row, and
// integer grid coordinates (col, row). The component scales these to pixels.
//
// Greedy filling makes the layout prefix-stable for a fixed band count: the
// first k dots of layoutDots(n, bands) occupy the same slots as
// layoutDots(k, bands) when k fills the same rows. Subtraction relies on this
// and always passes the band count for the larger count.
export function layoutDots(n, bands = 1) {
  if (!Number.isInteger(n) || n <= 0) return [];
  return Array.from({ length: n }, (_, index) => dotAt(index, n, bands));
}

// Grid extent (in cells) for n dots in `bands` bands, used to center and scale
// the arrangement.
export function gridDimensions(n, bands = 1) {
  if (!Number.isInteger(n) || n <= 0) return { cols: 0, rows: 0 };
  return {
    cols: (bands - 1) * BAND_STRIDE + Math.min(GROUP_SIZE, n),
    rows: Math.ceil(Math.ceil(n / GROUP_SIZE) / bands),
  };
}

// Picks the band count that makes the dots largest while the whole grid still
// fits in availW x availH (CSS pixels). Ties keep the fewer bands, so counts
// that fit as one band look exactly as they always have.
export function fitDotGrid(n, availW, availH) {
  const groups = Math.ceil(n / GROUP_SIZE);
  let best = { bands: 1, cellSize: 0 };
  for (let bands = 1; bands <= Math.max(1, groups); bands++) {
    const { cols, rows } = gridDimensions(n, bands);
    const cellSize = Math.min(
      availH / Math.max(rows, 1),
      availW / (Math.max(cols, 1) * COLUMN_PITCH_RATIO),
    );
    if (cellSize > best.cellSize) best = { bands, cellSize };
  }
  return { bands: best.bands, cellSize: Math.min(MAX_CELL_SIZE, best.cellSize) };
}
