import { describe, it, expect } from '@jest/globals';
import { remainingWedgePath, pathArea } from '@/features/eaten/utils/eatenWedge';

// The geometry of a bite. Every assertion here is on the polygon string the
// pure function returns rather than on a rendered style: jsdom does not resolve
// `clip-path`, so an assertion against a computed style would compare empty to
// empty and pass whatever the function did.

describe('remainingWedgePath', () => {
  it('leaves an unbitten glyph unclipped', () => {
    expect(remainingWedgePath(1)).toBe('polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)');
  });

  it('collapses a fully eaten glyph to nothing visible', () => {
    // Not an empty clip-path: an empty one shows the whole glyph, which is the
    // opposite of "they ate all of it".
    expect(pathArea(remainingWedgePath(0))).toBe(0);
  });

  it('cuts the bite out of the top, clockwise', () => {
    // Three quarters eaten leaves the quadrant between nine and twelve o'clock.
    expect(remainingWedgePath(0.25)).toBe('polygon(50% 50%, 0% 50%, 0% 0%, 50% 0%)');
  });

  it('halves the box at half eaten', () => {
    expect(remainingWedgePath(0.5)).toBe('polygon(50% 50%, 50% 100%, 0% 100%, 0% 0%, 50% 0%)');
  });

  it('keeps the quarter turns exact', () => {
    expect(pathArea(remainingWedgePath(0.25))).toBeCloseTo(0.25, 5);
    expect(pathArea(remainingWedgePath(0.5))).toBeCloseTo(0.5, 5);
    expect(pathArea(remainingWedgePath(0.75))).toBeCloseTo(0.75, 5);
  });

  it('leaves strictly less behind for every bigger bite', () => {
    // The real guarantee: whatever the corner-handling does, more eaten is
    // always visibly less left. Ten steps, each compared to the one before.
    const areas = Array.from({ length: 11 }, (_, i) => pathArea(remainingWedgePath(i / 10)));
    for (let i = 1; i < areas.length; i++) {
      expect(areas[i]).toBeGreaterThan(areas[i - 1]);
    }
  });

  it('clamps a proportion outside 0–1 instead of drawing a broken polygon', () => {
    expect(remainingWedgePath(1.5)).toBe(remainingWedgePath(1));
    expect(remainingWedgePath(-0.2)).toBe(remainingWedgePath(0));
    expect(remainingWedgePath(NaN)).toBe(remainingWedgePath(0));
    expect(remainingWedgePath(undefined)).toBe(remainingWedgePath(0));
  });

  it('always returns a closed polygon of at least three points', () => {
    for (let i = 0; i <= 20; i++) {
      const path = remainingWedgePath(i / 20);
      expect(path.startsWith('polygon(')).toBe(true);
      expect(path.split(',').length).toBeGreaterThanOrEqual(3);
    }
  });
});
