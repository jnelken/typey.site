// Visual grouping for early number sense, from the research spec:
// dots are greedily grouped into fives and each group is a vertical column,
// laid out left-to-right. Color encodes the group-of-five so a quantity is
// graspable at a glance (conceptual subitizing) instead of counted one-by-one.
import { GROUP_COLORS } from '@/constants/palette';

export { GROUP_COLORS };

export function colorForGroup(groupIndex) {
  return GROUP_COLORS[groupIndex % GROUP_COLORS.length];
}

// Lay out n dots as columns of five. Returns one entry per dot with its group
// (column) index, position within the column, and integer grid coordinates
// (col, row). The component scales these to pixels.
//
// Greedy filling makes the layout prefix-stable: the first k dots of
// layoutDots(n) occupy the same slots as layoutDots(k). This is what lets the
// subtraction animation simply remove the trailing dots and leave the
// remaining ones already in their correct, subitizable arrangement.
export function layoutDots(n) {
  const dots = [];
  if (!Number.isInteger(n) || n <= 0) return dots;

  let remaining = n;
  let groupIndex = 0;
  while (remaining > 0) {
    const count = Math.min(5, remaining);
    for (let i = 0; i < count; i++) {
      dots.push({ groupIndex, indexInGroup: i, col: groupIndex, row: i });
    }
    remaining -= count;
    groupIndex += 1;
  }
  return dots;
}

// Grid extent (in cells) used to center the whole arrangement.
export function gridDimensions(n) {
  if (!Number.isInteger(n) || n <= 0) return { cols: 0, rows: 0 };
  return { cols: Math.ceil(n / 5), rows: Math.min(5, n) };
}
