import { describe, it, expect } from '@jest/globals';
import { render } from '@testing-library/vue';
import PartyConfetti from '@/features/party/components/PartyConfetti.vue';
import { CONFETTI_COLORS } from '@/features/party/utils/partyMode';

// jsdom implements neither `clip-path` nor custom properties on `el.style`, so
// reading `el.style.getPropertyValue('--droplet-color')` comes back empty and
// an assertion on it would pass for any value at all. Read the attribute.
const styleOf = el => el.getAttribute('style') ?? '';

const burst = (overrides = {}) => ({
  id: 1,
  x: 240,
  y: 360,
  count: 6,
  size: 12,
  ...overrides,
});

describe('PartyConfetti', () => {
  it('draws nothing when no confetti is in the air', () => {
    const { container } = render(PartyConfetti, { props: { bursts: [] } });
    expect(container.querySelectorAll('.party-burst')).toHaveLength(0);
    expect(container.querySelectorAll('.droplet')).toHaveLength(0);
  });

  it('anchors each burst at the point it came from', () => {
    const { container } = render(PartyConfetti, {
      props: { bursts: [burst({ id: 1, x: 240, y: 360 }), burst({ id: 2, x: 0, y: 100 })] },
    });

    const anchors = [...container.querySelectorAll('.party-burst')];
    expect(anchors).toHaveLength(2);
    expect(styleOf(anchors[0])).toContain('left: 240px');
    expect(styleOf(anchors[0])).toContain('top: 360px');
    expect(styleOf(anchors[1])).toContain('left: 0px');
    expect(styleOf(anchors[1])).toContain('top: 100px');
  });

  it('throws the number of droplets the burst asked for', () => {
    const { container } = render(PartyConfetti, {
      props: { bursts: [burst({ count: 9 })] },
    });
    expect(container.querySelectorAll('.droplet')).toHaveLength(9);
  });

  it('cycles the confetti palette rather than the single produce colour', () => {
    const { container } = render(PartyConfetti, {
      props: { bursts: [burst({ count: CONFETTI_COLORS.length })] },
    });

    const used = [...container.querySelectorAll('.droplet')].map(
      el => styleOf(el).match(/--droplet-color:\s*([^;]+)/)?.[1]?.trim(),
    );

    // Every palette entry appears exactly once across a burst the size of the
    // palette — which is what makes it confetti rather than a splatter.
    expect(new Set(used)).toEqual(new Set(CONFETTI_COLORS));
  });

  it('is decoration, so a screen reader never sees it', () => {
    const { container } = render(PartyConfetti, { props: { bursts: [burst()] } });
    expect(container.querySelector('.party-confetti').getAttribute('aria-hidden')).toBe('true');
  });
});
