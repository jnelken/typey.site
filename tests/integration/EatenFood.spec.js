import { describe, it, expect } from '@jest/globals';
import { render } from '@testing-library/vue';
import EatenFood from '@/features/eaten/components/EatenFood.vue';
import { remainingWedgePath } from '@/features/eaten/utils/eatenWedge';

const renderPlate = food => render(EatenFood, { props: { food } }).container;

const HALF_COOKIE = { id: 1, percent: 50, word: 'cookie', emoji: '🍪', remaining: 0.5 };

describe('EatenFood', () => {
  it('draws nothing when nothing has been eaten', () => {
    expect(renderPlate(null).querySelector('.eaten')).toBeNull();
  });

  it('draws the glyph twice — what is left, over what is gone', () => {
    const container = renderPlate(HALF_COOKIE);

    const glyphs = [...container.querySelectorAll('.eaten-glyph')];
    expect(glyphs).toHaveLength(2);
    expect(glyphs.every(el => el.textContent === '🍪')).toBe(true);
    // The faded one is underneath, so the bitten edge stays crisp.
    expect(glyphs[0].classList).toContain('eaten-gone');
    expect(glyphs[1].classList).toContain('eaten-left');
  });

  it('clips the remaining glyph to the wedge the proportion asks for', () => {
    const left = renderPlate(HALF_COOKIE).querySelector('.eaten-left');

    // Read off the attribute rather than `style.clipPath`: jsdom does not
    // implement clip-path, so the resolved property comes back empty and an
    // assertion on it would pass for any wedge at all.
    expect(left.getAttribute('style')).toContain(remainingWedgePath(0.5));
  });

  it('clips a bigger bite to a smaller wedge', () => {
    const little = renderPlate({ ...HALF_COOKIE, percent: 10, remaining: 0.9 });
    const lots = renderPlate({ ...HALF_COOKIE, percent: 90, remaining: 0.1 });

    const clipOf = container => container.querySelector('.eaten-left').getAttribute('style');
    expect(clipOf(little)).toContain(remainingWedgePath(0.9));
    expect(clipOf(lots)).toContain(remainingWedgePath(0.1));
    expect(clipOf(little)).not.toBe(clipOf(lots));
  });

  it('says how much was eaten, in the text colour the page already uses', () => {
    // No new paint on the page: the label uses `--color-text-primary`, which is
    // what `screenColor.spec.js` contrast-checks every wash against, and the
    // eaten part is the same glyph at low opacity rather than a new colour.
    const container = renderPlate(HALF_COOKIE);
    expect(container.querySelector('.eaten-label').textContent).toBe('50%');
  });

  it('hides the whole thing from screen readers — the typed line is the text', () => {
    expect(renderPlate(HALF_COOKIE).querySelector('.eaten').getAttribute('aria-hidden')).toBe(
      'true'
    );
  });
});
