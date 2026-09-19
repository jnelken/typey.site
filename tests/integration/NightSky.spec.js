import { describe, it, expect } from '@jest/globals';
import { render } from '@testing-library/vue';
import NightSky from '@/features/night/components/NightSky.vue';
import { starField } from '@/features/night/utils/nightMode';

// jsdom does not implement custom properties on `el.style`, so reading one back
// comes up empty and an assertion on it would pass for any value. Read the
// attribute the way the confetti spec does.
const styleOf = el => el.getAttribute('style') ?? '';

describe('NightSky', () => {
  it('draws nothing while the night is off, even with a sky to hand', () => {
    const { container } = render(NightSky, {
      props: { active: false, stars: starField(10, { seed: 3 }) },
    });

    expect(container.querySelector('.night-sky')).toBeNull();
    expect(container.querySelectorAll('.star')).toHaveLength(0);
    expect(container.querySelector('.moon')).toBeNull();
  });

  it('hangs a moon and every star it was given', () => {
    const stars = starField(12, { seed: 3 });
    const { container } = render(NightSky, { props: { active: true, stars } });

    expect(container.querySelector('.moon')).not.toBeNull();
    expect(container.querySelectorAll('.star')).toHaveLength(12);
  });

  it('places each star as a percentage, so the sky scales with the window', () => {
    const stars = starField(4, { seed: 9 });
    const { container } = render(NightSky, { props: { active: true, stars } });

    const rendered = [...container.querySelectorAll('.star')];
    rendered.forEach((el, index) => {
      const style = styleOf(el);
      expect(style).toContain(`left: ${stars[index].x * 100}%`);
      expect(style).toContain(`top: ${stars[index].y * 100}%`);
      expect(style).toContain(`${stars[index].twinkleMs}ms`);
    });
  });

  it('gives each star a negative delay, so the sky is already out of step on the first frame', () => {
    const { container } = render(NightSky, {
      props: { active: true, stars: starField(8, { seed: 5 }) },
    });

    for (const el of container.querySelectorAll('.star')) {
      expect(styleOf(el)).toMatch(/animation-delay:\s*-\d+ms/);
    }
  });

  it('is scenery, so a screen reader never has to read it', () => {
    const { container } = render(NightSky, {
      props: { active: true, stars: starField(3, { seed: 1 }) },
    });

    expect(container.querySelector('.night-sky').getAttribute('aria-hidden')).toBe('true');
  });
});
