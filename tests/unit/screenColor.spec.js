import { describe, it, expect } from '@jest/globals';
import {
  SCREEN_COLORS,
  DEFAULT_SCREEN_COLOR,
  screenColorForText,
} from '@/features/effects/utils/screenColor';
import { useScreenColor } from '@/features/effects/composables/useScreenColor';
import { WORD_EMOJI } from '@/features/typing/utils/wordEmoji';

// The text the child reads their own typing in.
const TEXT_PRIMARY = '#2f3640';
// The dimmed grey used for the letters of a prompt they haven't reached yet —
// the faintest thing on the page, and so the one that decides how pale a wash
// is allowed to be.
const TEXT_LIGHT = '#a4b0be';

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

describe('every wash keeps the page readable', () => {
  it('clears WCAG AA for body text on all of them', () => {
    for (const [name, hex] of Object.entries(SCREEN_COLORS)) {
      expect([name, contrast(TEXT_PRIMARY, hex) >= 4.5]).toEqual([name, true]);
    }
  });

  it('keeps even the dimmed prompt letters visible', () => {
    // Not AA — these are deliberately faint — but they must not vanish.
    for (const [name, hex] of Object.entries(SCREEN_COLORS)) {
      expect([name, contrast(TEXT_LIGHT, hex) >= 1.4]).toEqual([name, true]);
    }
  });

  it('covers every colour word the dictionary can produce as a prompt', () => {
    const colorWords = ['red', 'blue', 'green', 'yellow', 'purple', 'black', 'white', 'brown', 'pink'];
    for (const word of colorWords) {
      expect(WORD_EMOJI[word]).toBeDefined();
      expect(screenColorForText(word)).toBe(SCREEN_COLORS[word]);
    }
  });
});

describe('screenColorForText', () => {
  it('takes the first colour named in the line', () => {
    expect(screenColorForText('red car')).toBe(SCREEN_COLORS.red);
    expect(screenColorForText('i want a green frog')).toBe(SCREEN_COLORS.green);
  });

  it('ignores case', () => {
    expect(screenColorForText('BLUE')).toBe(SCREEN_COLORS.blue);
  });

  it('does not read a colour out of the middle of a word', () => {
    expect(screenColorForText('bluebird')).toBeNull();
    expect(screenColorForText('greenhouse')).toBeNull();
  });

  it('has nothing to say about a line with no colour in it', () => {
    expect(screenColorForText('dinosaur')).toBeNull();
    expect(screenColorForText('')).toBeNull();
    expect(screenColorForText(null)).toBeNull();
  });
});

describe('useScreenColor', () => {
  it('holds the colour of the last line sent', () => {
    const { screenColor, setScreenColorFromText } = useScreenColor();

    expect(screenColor.value).toBe(DEFAULT_SCREEN_COLOR);
    setScreenColorFromText('purple');
    expect(screenColor.value).toBe(SCREEN_COLORS.purple);
  });

  it('gives the page back when the next line names no colour', () => {
    const { screenColor, setScreenColorFromText } = useScreenColor();

    setScreenColorFromText('purple');
    setScreenColorFromText('dinosaur');

    expect(screenColor.value).toBe(DEFAULT_SCREEN_COLOR);
  });

  it('paints the document so every surface reading the variable follows', () => {
    const { setScreenColorFromText, resetScreenColor } = useScreenColor();

    setScreenColorFromText('pink');
    expect(
      document.documentElement.style.getPropertyValue('--color-background'),
    ).toBe(SCREEN_COLORS.pink);

    resetScreenColor();
    expect(
      document.documentElement.style.getPropertyValue('--color-background'),
    ).toBe(DEFAULT_SCREEN_COLOR);
  });
});
