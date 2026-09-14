import { describe, it, expect } from '@jest/globals';
import {
  SCREEN_COLORS,
  DEFAULT_SCREEN_COLOR,
} from '@/features/effects/utils/screenColor';
import {
  COLOR_TEXT,
  COLOR_LOW,
  COLOR_MID,
  COLOR_OVER,
  COLOR_HIGH,
  COLOR_PEAK_A,
  COLOR_PEAK_B,
  PEAK_THRESHOLD,
  FLICKER_MS,
  batteryFillColor,
} from '@/features/percent/utils/batteryColor';

// Battery fill is stroked in COLOR_TEXT; WCAG 1.4.11 is carried by that
// outline, not by the fill against the wash. Same helpers as screenColor.spec.
const channel = value => {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

const luminance = hex => {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
};

const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

describe('batteryFillColor ladder', () => {
  it('uses vermillion at or below 20%', () => {
    expect(batteryFillColor(0)).toBe(COLOR_LOW);
    expect(batteryFillColor(20)).toBe(COLOR_LOW);
  });

  it('uses green above 20% through a full battery', () => {
    expect(batteryFillColor(21)).toBe(COLOR_MID);
    expect(batteryFillColor(100)).toBe(COLOR_MID);
  });

  it('uses yellow from just over full through the zap threshold', () => {
    expect(batteryFillColor(101)).toBe(COLOR_OVER);
    expect(batteryFillColor(1000)).toBe(COLOR_OVER);
  });

  it('uses blue past the zap threshold until the peak band', () => {
    expect(batteryFillColor(1001)).toBe(COLOR_HIGH);
    expect(batteryFillColor(PEAK_THRESHOLD)).toBe(COLOR_HIGH);
  });

  it('flickers purple above the peak band', () => {
    expect(batteryFillColor(PEAK_THRESHOLD + 1, 0)).toBe(COLOR_PEAK_A);
    expect(batteryFillColor(PEAK_THRESHOLD + 1, FLICKER_MS)).toBe(COLOR_PEAK_B);
    expect(batteryFillColor(1_000_000, FLICKER_MS * 2)).toBe(COLOR_PEAK_A);
  });

  it('freezes on the darker purple under reduced motion', () => {
    expect(batteryFillColor(PEAK_THRESHOLD + 1, FLICKER_MS, true)).toBe(COLOR_PEAK_A);
  });
});

describe('battery fill colours', () => {
  it('clears 3:1 against the COLOR_TEXT outline they are stroked with', () => {
    const fills = [COLOR_LOW, COLOR_MID, COLOR_OVER, COLOR_HIGH, COLOR_PEAK_A, COLOR_PEAK_B];
    for (const fill of fills) {
      expect(contrast(fill, COLOR_TEXT)).toBeGreaterThanOrEqual(3);
    }
  });
});

describe('battery outline against every wash', () => {
  it('clears 3:1 against every screen-colour wash and the default', () => {
    const grounds = [...Object.values(SCREEN_COLORS), DEFAULT_SCREEN_COLOR];
    for (const ground of grounds) {
      expect(contrast(COLOR_TEXT, ground)).toBeGreaterThanOrEqual(3);
    }
  });
});
