import { describe, it, expect } from '@jest/globals';
import { render } from '@testing-library/vue';
import EmojiEffect from '@/ui/EmojiEffect.vue';

const renderEffect = effect =>
  render(EmojiEffect, { props: { effect: { emoji: '⚽', ...effect } } }).container
    .querySelector('.emoji');

describe('EmojiEffect', () => {
  it('draws each animation the effects can ask for', () => {
    for (const type of ['float', 'rain', 'burst', 'run', 'arc', 'lob', 'bounce']) {
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

  it('shows the emoji it was handed', () => {
    expect(renderEffect({ type: 'arc' }).textContent.trim()).toBe('⚽');
  });
});
