import { describe, it, expect } from '@jest/globals';
import { render } from '@testing-library/vue';
import EmojiEffect from '@/ui/EmojiEffect.vue';
import { PATHS, PLACED_PATHS } from '@/features/effects/utils/wordMotion';

const renderEffect = effect =>
  render(EmojiEffect, { props: { effect: { emoji: '⚽', ...effect } } }).container
    .querySelector('.emoji');

describe('EmojiEffect', () => {
  it('draws each animation the effects can ask for', () => {
    // Read from PATHS rather than a copy of it: a path added to the table and
    // not to the stylesheet renders an element that never becomes visible,
    // because `.emoji` starts at `opacity: 0` and only its path's keyframes
    // bring it back.
    for (const type of PATHS) {
      expect(renderEffect({ type }).classList).toContain(`effect-${type}`);
    }
  });

  it('points a travelling effect the way it is headed', () => {
    expect(renderEffect({ type: 'arc', direction: 'left' }).classList).toContain('go-left');
    expect(renderEffect({ type: 'arc', direction: 'right' }).classList).toContain('go-right');
    expect(renderEffect({ type: 'run', direction: 'left' }).classList).toContain('go-left');
  });

  it('does not give a direction to effects that stay put', () => {
    const classes = [...renderEffect({ type: 'bounce', direction: 'left' }).classList];
    expect(classes).not.toContain('go-left');
    expect(classes).not.toContain('go-right');
  });

  it('falls back to floating when no type is given', () => {
    expect(renderEffect({}).classList).toContain('effect-float');
  });

  it('gives a path that stays put the vertical position it was spawned at', () => {
    for (const type of PLACED_PATHS) {
      expect(renderEffect({ type, top: '40%' }).style.top).toBe('40%');
    }
  });

  it('leaves a path that animates away from an edge to the stylesheet', () => {
    for (const type of PATHS.filter(path => !PLACED_PATHS.includes(path))) {
      expect(renderEffect({ type, top: '40%' }).style.top).toBe('');
    }
  });

  it('does not point a bloom anywhere, since it never goes anywhere', () => {
    const classes = [...renderEffect({ type: 'bloom', direction: 'left' }).classList];
    expect(classes).toContain('effect-bloom');
    expect(classes).not.toContain('go-left');
    expect(classes).not.toContain('go-right');
  });

  it('shows the emoji it was handed', () => {
    expect(renderEffect({ type: 'arc' }).textContent.trim()).toBe('⚽');
  });
});
