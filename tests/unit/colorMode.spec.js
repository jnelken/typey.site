import { describe, it, expect } from '@jest/globals';
import {
  COLOR_PALETTE,
  COLOR_TRIGGERS,
  MIN_CONTRAST_RATIO,
  PAGE_BACKGROUND,
  colorForIndex,
  contrastRatio,
  isColorTrigger,
  relativeLuminance,
} from '@/features/easter-eggs/utils/colorMode';

describe('isColorTrigger', () => {
  it('matches both spellings on their own line', () => {
    expect(isColorTrigger('color')).toBe(true);
    expect(isColorTrigger('colour')).toBe(true);
  });

  it('ignores case and surrounding space', () => {
    expect(isColorTrigger('COLOR')).toBe(true);
    expect(isColorTrigger('  Colour  ')).toBe(true);
  });

  it('does not fire on the word inside a longer line', () => {
    expect(isColorTrigger('what color is it')).toBe(false);
    expect(isColorTrigger('colorful')).toBe(false);
  });

  it('handles non-string input', () => {
    expect(isColorTrigger(null)).toBe(false);
    expect(isColorTrigger(undefined)).toBe(false);
    expect(isColorTrigger(42)).toBe(false);
  });

  it('matches every declared trigger', () => {
    COLOR_TRIGGERS.forEach(trigger => {
      expect(isColorTrigger(trigger)).toBe(true);
    });
  });
});

describe('colorForIndex', () => {
  it('gives each position in the palette its own color', () => {
    const colors = COLOR_PALETTE.map((_, index) => colorForIndex(index));
    expect(new Set(colors).size).toBe(COLOR_PALETTE.length);
  });

  it('cycles once the line is longer than the palette', () => {
    expect(colorForIndex(COLOR_PALETTE.length)).toBe(colorForIndex(0));
    expect(colorForIndex(COLOR_PALETTE.length + 3)).toBe(colorForIndex(3));
  });

  it('never returns undefined, whatever the index', () => {
    [-1, 0, 1, 500, 1.5, NaN, null, undefined, 'a'].forEach(index => {
      expect(COLOR_PALETTE).toContain(colorForIndex(index));
    });
  });
});

describe('contrastRatio', () => {
  it('is 21 for black on white and 1 for a color on itself', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 1);
    expect(contrastRatio('#1b7a3e', '#1b7a3e')).toBeCloseTo(1, 5);
  });

  it('is symmetric', () => {
    expect(contrastRatio('#cc1f36', PAGE_BACKGROUND)).toBeCloseTo(
      contrastRatio(PAGE_BACKGROUND, '#cc1f36'),
      5,
    );
  });

  it('reads luminance in the expected order', () => {
    expect(relativeLuminance('#ffffff')).toBeCloseTo(1, 5);
    expect(relativeLuminance('#000000')).toBeCloseTo(0, 5);
  });
});

describe('COLOR_PALETTE accessibility', () => {
  // The roadmap asks for "accessible color combinations (high contrast)". This
  // is that requirement as a failing test rather than an intention: darken the
  // page background or brighten a hue and this catches it.
  it.each(COLOR_PALETTE)(
    '%s clears WCAG AA against the page background',
    color => {
      expect(contrastRatio(color, PAGE_BACKGROUND)).toBeGreaterThanOrEqual(
        MIN_CONTRAST_RATIO,
      );
    },
  );

  it('is written as six-digit hex so the contrast maths applies', () => {
    COLOR_PALETTE.forEach(color => {
      expect(color).toMatch(/^#[0-9a-f]{6}$/);
    });
  });
});
