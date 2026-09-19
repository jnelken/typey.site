import { describe, it, expect } from '@jest/globals';
import {
  NIGHT_TRIGGERS,
  NIGHT_COLORS,
  NIGHT_FOREGROUND_KEYS,
  MIN_CONTRAST_RATIO,
  contrastRatio,
  isNightTrigger,
  starField,
  STAR_COUNT,
  STAR_MIN_SIZE_PX,
  STAR_MAX_SIZE_PX,
  READING_BAND,
  MOON,
  MOON_KEEP_OUT,
  TWINKLE_MIN_MS,
  TWINKLE_MAX_MS,
} from '@/features/night/utils/nightMode';
import { COLOR_PALETTE, PAGE_BACKGROUND } from '@/features/easter-eggs/utils/colorMode';

describe('isNightTrigger', () => {
  it.each(NIGHT_TRIGGERS)('matches "%s" on its own line', trigger => {
    expect(isNightTrigger(trigger)).toBe(true);
  });

  it('ignores case and surrounding whitespace', () => {
    expect(isNightTrigger('  GoodNight  ')).toBe(true);
    expect(isNightTrigger('GOOD NIGHT')).toBe(true);
  });

  it('collapses a run of spaces, because a child will not be consistent', () => {
    expect(isNightTrigger('good   night')).toBe(true);
  });

  it('ignores the word inside a longer line', () => {
    expect(isNightTrigger('say goodnight to the cat')).toBe(false);
    expect(isNightTrigger('goodnight moon')).toBe(false);
  });

  it('is false for anything that is not a string', () => {
    expect(isNightTrigger(null)).toBe(false);
    expect(isNightTrigger(undefined)).toBe(false);
    expect(isNightTrigger(42)).toBe(false);
  });
});

describe('the night palette', () => {
  it.each(NIGHT_FOREGROUND_KEYS)(
    'clears AA against the night ground: %s',
    key => {
      const ratio = contrastRatio(NIGHT_COLORS[key], NIGHT_COLORS.background);
      expect(ratio).toBeGreaterThanOrEqual(MIN_CONTRAST_RATIO);
    },
  );

  it('is a night blue rather than the blackout black, which means a different thing', () => {
    // `html.battery-dead` in src/style.css is #000000 — a power cut. Sharing a
    // ground would make going to bed and running the battery flat look alike.
    expect(NIGHT_COLORS.background).not.toBe('#000000');
  });

  it('is dark enough that the daylight text colour would be unreadable on it', () => {
    // The guard on the other side: a "dark" theme light enough to keep the
    // day's near-black text would not be a dark theme at all.
    const ratio = contrastRatio('#2f3640', NIGHT_COLORS.background);
    expect(ratio).toBeLessThan(MIN_CONTRAST_RATIO);
  });

  it('is why Color Mode has to go off — every hue in it fails AA here', () => {
    // DEV-54 decided Color Mode is off during the night rather than growing a
    // second palette. This is the evidence for that decision, kept executable:
    // if someone later re-points these hues, this fails and the decision gets
    // re-examined instead of silently shipping unreadable text.
    for (const hue of COLOR_PALETTE) {
      expect(contrastRatio(hue, PAGE_BACKGROUND)).toBeGreaterThanOrEqual(MIN_CONTRAST_RATIO);
      expect(contrastRatio(hue, NIGHT_COLORS.background)).toBeLessThan(MIN_CONTRAST_RATIO);
    }
  });
});

describe('starField', () => {
  const stars = starField();

  it('returns the count it was asked for', () => {
    expect(stars).toHaveLength(STAR_COUNT);
    expect(starField(12)).toHaveLength(12);
  });

  it('is deterministic: the same seed always gives the same sky', () => {
    expect(starField(20, { seed: 7 })).toEqual(starField(20, { seed: 7 }));
  });

  it('gives a different sky for a different seed', () => {
    expect(starField(20, { seed: 7 })).not.toEqual(starField(20, { seed: 8 }));
  });

  it('places every star inside the viewport', () => {
    for (const star of stars) {
      expect(star.x).toBeGreaterThanOrEqual(0);
      expect(star.x).toBeLessThanOrEqual(1);
      expect(star.y).toBeGreaterThanOrEqual(0);
      expect(star.y).toBeLessThanOrEqual(1);
    }
  });

  it('keeps every star out of the band the child is reading', () => {
    for (const star of stars) {
      const inBand = star.y > READING_BAND.top && star.y < READING_BAND.bottom;
      expect(inBand).toBe(false);
    }
  });

  it('keeps every star off the moon', () => {
    for (const star of stars) {
      const dx = star.x - (1 - MOON.right);
      const dy = star.y - MOON.top;
      expect(Math.sqrt(dx * dx + dy * dy)).toBeGreaterThanOrEqual(MOON_KEEP_OUT);
    }
  });

  it('sizes every star within the range, so none is a blob or invisible', () => {
    for (const star of stars) {
      expect(star.size).toBeGreaterThanOrEqual(STAR_MIN_SIZE_PX);
      expect(star.size).toBeLessThanOrEqual(STAR_MAX_SIZE_PX);
    }
  });

  it('gives each star a twinkle period inside the range', () => {
    for (const star of stars) {
      expect(star.twinkleMs).toBeGreaterThanOrEqual(TWINKLE_MIN_MS);
      expect(star.twinkleMs).toBeLessThanOrEqual(TWINKLE_MAX_MS);
    }
  });

  it('staggers the phases, so the sky does not pulse in lockstep', () => {
    // Forty-eight dots fading together is a flashing screen, not a sky. More
    // than a handful of distinct delays is enough to prove they are spread.
    const delays = new Set(stars.map(star => star.delayMs));
    expect(delays.size).toBeGreaterThan(stars.length / 2);
  });

  it('returns nothing for a count that is not a positive whole number', () => {
    expect(starField(0)).toEqual([]);
    expect(starField(-3)).toEqual([]);
    expect(starField(2.5)).toEqual([]);
  });
});
