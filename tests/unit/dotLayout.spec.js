import { describe, it, expect } from '@jest/globals';
import {
  layoutDots,
  gridDimensions,
  colorForGroup,
  GROUP_COLORS,
} from '@/features/math/utils/dotLayout';

describe('layoutDots', () => {
  it('lays out a single small group in one column', () => {
    const dots = layoutDots(4);
    expect(dots).toHaveLength(4);
    expect(dots.every(d => d.groupIndex === 0 && d.col === 0)).toBe(true);
    expect(dots.map(d => d.row)).toEqual([0, 1, 2, 3]);
  });

  it('splits into columns of five', () => {
    const dots = layoutDots(7);
    expect(dots).toHaveLength(7);
    // first five in column 0
    expect(dots.slice(0, 5).every(d => d.col === 0)).toBe(true);
    // remaining two in column 1
    expect(dots.slice(5).every(d => d.col === 1)).toBe(true);
    expect(dots[6]).toMatchObject({ groupIndex: 1, indexInGroup: 1, row: 1 });
  });

  it('handles three full groups plus a remainder (16)', () => {
    const dots = layoutDots(16);
    expect(dots).toHaveLength(16);
    expect(dots[15]).toMatchObject({ groupIndex: 3, col: 3, row: 0 });
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
  it('reports columns and the tallest column height', () => {
    expect(gridDimensions(3)).toEqual({ cols: 1, rows: 3 });
    expect(gridDimensions(7)).toEqual({ cols: 2, rows: 5 });
    expect(gridDimensions(16)).toEqual({ cols: 4, rows: 5 });
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
