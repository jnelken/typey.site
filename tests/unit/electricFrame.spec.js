import { describe, it, expect } from '@jest/globals';
import {
  seededRandom,
  perimeterPoint,
  framePoints,
  boltPoints,
  boltOrigin,
} from '@/features/percent/utils/electricFrame';

describe('seededRandom', () => {
  it('is stable for a seed and spread over 0–1', () => {
    expect(seededRandom(7)).toBe(seededRandom(7));
    expect(seededRandom(7)).not.toBe(seededRandom(8));
    for (const seed of [0, 1, 42, 1000]) {
      expect(seededRandom(seed)).toBeGreaterThanOrEqual(0);
      expect(seededRandom(seed)).toBeLessThan(1);
    }
  });
});

describe('perimeterPoint', () => {
  const w = 1000;
  const h = 600;
  const inset = 10;

  it('walks the four edges in order from the top-left corner', () => {
    expect(perimeterPoint(w, h, inset, 0)).toMatchObject({ x: 10, y: 10 });
    // Corners fall at the running length of each edge over the total.
    const spanW = w - inset * 2;
    const spanH = h - inset * 2;
    const total = (spanW + spanH) * 2;
    expect(perimeterPoint(w, h, inset, spanW / total)).toMatchObject({ x: 990, y: 10 });
    expect(perimeterPoint(w, h, inset, (spanW + spanH) / total)).toMatchObject({ x: 990, y: 590 });
    expect(perimeterPoint(w, h, inset, (spanW * 2 + spanH) / total)).toMatchObject({
      x: 10,
      y: 590,
    });
  });

  it('points its normal into the screen on every edge', () => {
    expect(perimeterPoint(w, h, inset, 0.1)).toMatchObject({ nx: 0, ny: 1 });   // top → down
    expect(perimeterPoint(w, h, inset, 0.45)).toMatchObject({ nx: -1, ny: 0 }); // right → left
    expect(perimeterPoint(w, h, inset, 0.6)).toMatchObject({ nx: 0, ny: -1 });  // bottom → up
    expect(perimeterPoint(w, h, inset, 0.95)).toMatchObject({ nx: 1, ny: 0 });  // left → right
  });

  it('wraps, so travelling is just adding to t', () => {
    expect(perimeterPoint(w, h, inset, 1.25)).toEqual(perimeterPoint(w, h, inset, 0.25));
    expect(perimeterPoint(w, h, inset, -0.25)).toEqual(perimeterPoint(w, h, inset, 0.75));
  });

  it('survives a viewport smaller than its own inset', () => {
    expect(perimeterPoint(10, 10, 40, 0.3)).toMatchObject({ x: 40, y: 40 });
  });
});

describe('framePoints', () => {
  it('returns steps + 1 points and stays inside the screen', () => {
    const points = framePoints(800, 500, 10, 0.2, 0.15, { steps: 12, seed: 3, jitter: 20 });
    expect(points).toHaveLength(13);
    for (const point of points) {
      expect(point.x).toBeGreaterThanOrEqual(0);
      expect(point.x).toBeLessThanOrEqual(800);
      expect(point.y).toBeGreaterThanOrEqual(0);
      expect(point.y).toBeLessThanOrEqual(500);
    }
  });

  it('tapers to the bare perimeter at both ends', () => {
    const start = 0.2;
    const span = 0.15;
    const points = framePoints(800, 500, 10, start, span, { steps: 10, seed: 5, jitter: 40 });
    expect(points[0]).toMatchObject(pointXY(perimeterPoint(800, 500, 10, start)));
    expect(points[10]).toMatchObject(pointXY(perimeterPoint(800, 500, 10, start + span)));
  });

  it('is stable for a seed and different between seeds', () => {
    const a = framePoints(800, 500, 10, 0.2, 0.15, { seed: 1 });
    const b = framePoints(800, 500, 10, 0.2, 0.15, { seed: 1 });
    const c = framePoints(800, 500, 10, 0.2, 0.15, { seed: 2 });
    expect(a).toEqual(b);
    expect(a).not.toEqual(c);
  });
});

describe('boltPoints', () => {
  const from = { x: 0, y: 0 };
  const to = { x: 100, y: 0 };

  it('starts and ends exactly on its endpoints', () => {
    const points = boltPoints(from, to, { seed: 4, segments: 8 });
    expect(points).toHaveLength(9);
    expect(points[0]).toEqual(from);
    expect(points[points.length - 1]).toEqual(to);
  });

  it('frays widest in the middle and not at all at the ends', () => {
    const segments = 8;
    const spread = 0.4;
    const points = boltPoints(from, to, { seed: 4, segments, spread });
    const strayOf = point => Math.abs(point.y);

    // Ends are anchored exactly; every interior point stays inside the taper
    // envelope, which is widest at the middle and closes at both ends.
    expect(strayOf(points[0])).toBe(0);
    expect(strayOf(points[segments])).toBe(0);
    for (let i = 1; i < segments; i += 1) {
      const envelope = (100 * spread * Math.sin((i / segments) * Math.PI)) / 2;
      expect(strayOf(points[i])).toBeLessThanOrEqual(envelope);
    }
    expect(points.slice(1, segments).some(point => strayOf(point) > 0)).toBe(true);
  });

  it('handles a zero-length bolt without dividing by zero', () => {
    const points = boltPoints(from, { ...from }, { seed: 2 });
    expect(points.every(point => Number.isFinite(point.x) && Number.isFinite(point.y))).toBe(true);
  });
});

describe('boltOrigin', () => {
  it('lands on the frame', () => {
    const origin = boltOrigin(900, 600, 10, { x: 450, y: 500 }, 3);
    const onEdge =
      origin.x === 10 || origin.x === 890 || origin.y === 10 || origin.y === 590;
    expect(onEdge).toBe(true);
  });

  it('is stable per bolt id, so a bolt fires from the same place each frame', () => {
    const target = { x: 300, y: 400 };
    expect(boltOrigin(900, 600, 10, target, 12)).toEqual(boltOrigin(900, 600, 10, target, 12));
  });

  it('picks the nearer of its two candidates', () => {
    const target = { x: 450, y: 580 };
    const seed = 9;
    const candidates = [
      perimeterPoint(900, 600, 10, seededRandom(seed * 3 + 1)),
      perimeterPoint(900, 600, 10, seededRandom(seed * 7 + 5)),
    ];
    const distance = point => Math.hypot(point.x - target.x, point.y - target.y);
    const nearer = distance(candidates[0]) <= distance(candidates[1]) ? candidates[0] : candidates[1];
    expect(boltOrigin(900, 600, 10, target, seed)).toEqual(nearer);
  });
});

const pointXY = point => ({ x: point.x, y: point.y });
