import { describe, it, expect } from '@jest/globals';
import { GROUP_COLORS } from '@/constants/palette';
import {
  SCREEN_COLORS,
  DEFAULT_SCREEN_COLOR,
} from '@/features/effects/utils/screenColor';

// Battery fill is stroked in COLOR_TEXT; WCAG 1.4.11 is carried by that
// outline, not by the fill against the wash. Same helpers as screenColor.spec.
const COLOR_TEXT = '#2b2d42';
const COLOR_LOW = GROUP_COLORS[0]; // vermillion — ≤20%
const COLOR_HIGH = GROUP_COLORS[3]; // green — above 20%

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

describe('battery fill colours', () => {
  it('clears 3:1 against the COLOR_TEXT outline they are stroked with', () => {
    expect(contrast(COLOR_LOW, COLOR_TEXT)).toBeGreaterThanOrEqual(3);
    expect(contrast(COLOR_HIGH, COLOR_TEXT)).toBeGreaterThanOrEqual(3);
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
