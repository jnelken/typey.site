import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import {
  useMathAnimation,
  MATH_ANIM_DURATION,
} from '@/features/math/composables/useMathAnimation';

describe('useMathAnimation', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('starts with no active equation', () => {
    const { current } = useMathAnimation();
    expect(current.value).toBeNull();
  });

  it('play() sets the current equation with an id', () => {
    const { current, play } = useMathAnimation();
    play({ a: 3, b: 1, sum: 4 });
    expect(current.value).toMatchObject({ a: 3, b: 1, sum: 4 });
    expect(typeof current.value.id).toBe('number');
  });

  it('auto-clears after the animation duration', () => {
    const { current, play } = useMathAnimation();
    play({ a: 2, b: 2, sum: 4 });
    expect(current.value).not.toBeNull();
    jest.advanceTimersByTime(MATH_ANIM_DURATION + 1);
    expect(current.value).toBeNull();
  });

  it('ignores invalid equations', () => {
    const { current, play } = useMathAnimation();
    play(null);
    play({ a: 1, b: 1 });
    expect(current.value).toBeNull();
  });

  it('clear() removes the current equation immediately', () => {
    const { current, play, clear } = useMathAnimation();
    play({ a: 1, b: 1, sum: 2 });
    clear();
    expect(current.value).toBeNull();
  });
});
