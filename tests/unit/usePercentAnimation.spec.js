import { describe, it, expect } from '@jest/globals';
import { usePercentAnimation } from '@/features/percent/composables/usePercentAnimation';

describe('usePercentAnimation', () => {
  it('starts with no active percent', () => {
    const { current } = usePercentAnimation();
    expect(current.value).toBeNull();
  });

  it('play() sets the current percent with an id', () => {
    const { current, play } = usePercentAnimation();
    play({ percent: 50 });
    expect(current.value).toMatchObject({ percent: 50 });
    expect(typeof current.value.id).toBe('number');
  });

  it('stays active until explicitly cleared (replayable, no auto-dismiss)', () => {
    const { current, play } = usePercentAnimation();
    play({ percent: 75 });
    expect(current.value).not.toBeNull();
  });

  it('ignores invalid data', () => {
    const { current, play } = usePercentAnimation();
    play(null);
    play({});
    play({ percent: '50' });
    expect(current.value).toBeNull();
  });

  it('clear() removes the current percent', () => {
    const { current, play, clear } = usePercentAnimation();
    play({ percent: 25 });
    clear();
    expect(current.value).toBeNull();
  });

  it('drain() takes a point off without replacing the battery', () => {
    const { current, play, drain } = usePercentAnimation();
    play({ percent: 50 });
    const { id } = current.value;
    drain();
    drain();
    // Same id on purpose: a drain must not replay the arrival animation.
    expect(current.value).toEqual({ percent: 48, id });
  });

  it('drain() floors at 0 and leaves the battery on screen', () => {
    const { current, play, drain } = usePercentAnimation();
    play({ percent: 1 });
    drain();
    drain();
    expect(current.value).toMatchObject({ percent: 0 });
  });

  it('drain() with no battery is a no-op', () => {
    const { current, drain } = usePercentAnimation();
    drain();
    expect(current.value).toBeNull();
  });

  it('keeps an overcharge above 100 and drains it back down', () => {
    const { current, play, drain } = usePercentAnimation();
    play({ percent: 250 });
    expect(current.value).toMatchObject({ percent: 250 });
    drain();
    expect(current.value).toMatchObject({ percent: 249 });
  });

  it('play({ percent: 0 }) sets current (0% is a legitimate charge)', () => {
    const { current, play } = usePercentAnimation();
    play({ percent: 0 });
    expect(current.value).not.toBeNull();
    expect(current.value.percent).toBe(0);
  });
});
