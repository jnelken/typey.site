import { describe, it, expect } from '@jest/globals';
import {
  layoutDots,
  gridDimensions,
  colorForGroup,
  GROUP_COLORS,
  COLUMN_PITCH_RATIO,
  MAX_CELL_SIZE,
  MAX_DOTS,
  dotAt,
  fitDotGrid,
} from '@/features/math/utils/dotLayout';

describe('layoutDots', () => {
  it('lays out a single small group in one row', () => {
    const dots = layoutDots(4);
    expect(dots).toHaveLength(4);
    expect(dots.every(d => d.groupIndex === 0 && d.row === 0)).toBe(true);
    expect(dots.map(d => d.col)).toEqual([0, 1, 2, 3]);
  });

  it('stacks groups of five as rows', () => {
    const dots = layoutDots(7);
    expect(dots).toHaveLength(7);
    // first five in row 0
    expect(dots.slice(0, 5).every(d => d.row === 0)).toBe(true);
    // remaining two in row 1
    expect(dots.slice(5).every(d => d.row === 1)).toBe(true);
    expect(dots[6]).toMatchObject({ groupIndex: 1, indexInGroup: 1, col: 1, row: 1 });
  });

  it('handles three full groups plus a remainder (16)', () => {
    const dots = layoutDots(16);
    expect(dots).toHaveLength(16);
    expect(dots[15]).toMatchObject({ groupIndex: 3, col: 0, row: 3 });
  });

  it('is prefix-stable (first k dots match layoutDots(k))', () => {
    const seven = layoutDots(7).slice(0, 5).map(d => [d.col, d.row]);
    const five = layoutDots(5).map(d => [d.col, d.row]);
    expect(seven).toEqual(five);
  });

  it('returns empty for zero or invalid input', () => {
    expect(layoutDots(0)).toEqual([]);
    expect(layoutDots(-3)).toEqual([]);
    expect(layoutDots(2.5)).toEqual([]);
  });
});

describe('gridDimensions', () => {
  it('reports the widest row and the number of rows', () => {
    expect(gridDimensions(3)).toEqual({ cols: 3, rows: 1 });
    expect(gridDimensions(7)).toEqual({ cols: 5, rows: 2 });
    expect(gridDimensions(16)).toEqual({ cols: 5, rows: 4 });
  });

  it('is zero for empty', () => {
    expect(gridDimensions(0)).toEqual({ cols: 0, rows: 0 });
  });
});

describe('colorForGroup', () => {
  it('maps groups to the rainbow palette', () => {
    expect(colorForGroup(0)).toBe(GROUP_COLORS[0]);
    expect(colorForGroup(3)).toBe('#009E73');
  });

  it('wraps around past five groups', () => {
    expect(colorForGroup(5)).toBe(GROUP_COLORS[0]);
  });
});

describe('bands', () => {
  it('fills each band top to bottom before starting the next one', () => {
    const dots = layoutDots(12, 2);
    expect(dots[9]).toMatchObject({ groupIndex: 1, col: 4, row: 1 });
    expect(dots[10]).toEqual({ groupIndex: 2, indexInGroup: 0, col: 6, row: 0 });
  });

  it('dotAt agrees with layoutDots at every index', () => {
    const n = 37;
    const dots = layoutDots(n, 3);
    dots.forEach((dot, i) => expect(dotAt(i, n, 3)).toEqual(dot));
  });

  it('counts band columns with a gap between bands', () => {
    expect(gridDimensions(12, 2)).toEqual({ cols: 11, rows: 2 });
  });
});

describe('fitDotGrid', () => {
  it('keeps small counts in one band', () => {
    expect(fitDotGrid(7, 720, 294).bands).toBe(1);
    expect(fitDotGrid(15, 720, 294).bands).toBe(1);
  });

  it('splits a tall count into bands when that makes the dots bigger', () => {
    const split = fitDotGrid(50, 720, 294);
    const single = Math.min(294 / 10, 720 / (5 * COLUMN_PITCH_RATIO));
    expect(split.bands).toBeGreaterThan(1);
    expect(split.cellSize).toBeGreaterThan(single);
  });

  it('caps the dot size on large screens', () => {
    expect(fitDotGrid(1, 5000, 5000).cellSize).toBe(MAX_CELL_SIZE);
  });
});

describe('the dot grid fits the screen', () => {
  // Phone, iPad portrait and landscape, laptop and desktop.
  const VIEWPORTS = [[390, 844], [768, 1024], [1024, 768], [900, 700], [1920, 1080]];

  it.each([1, 5, 7, 16, 999, 99_999, MAX_DOTS])('fits %i dots on every viewport', n => {
    for (const [w, h] of VIEWPORTS) {
      const availW = w * 0.8;
      const availH = h * 0.42;
      const { bands, cellSize } = fitDotGrid(n, availW, availH);
      const { cols, rows } = gridDimensions(n, bands);
      expect((cols - 1) * COLUMN_PITCH_RATIO * cellSize).toBeLessThanOrEqual(availW + 1e-6);
      expect((rows - 1) * cellSize).toBeLessThanOrEqual(availH + 1e-6);
      expect(cellSize).toBeGreaterThan(0);
    }
  });
});
