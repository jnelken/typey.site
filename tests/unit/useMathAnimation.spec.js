import { describe, it, expect } from '@jest/globals';
import { useMathAnimation } from '@/features/math/composables/useMathAnimation';

describe('useMathAnimation', () => {
  it('starts with no active equation', () => {
    const { current } = useMathAnimation();
    expect(current.value).toBeNull();
  });

  it('play() sets the current equation with an id', () => {
    const { current, play } = useMathAnimation();
    play({ a: 3, b: 1, op: '+', result: 4 });
    expect(current.value).toMatchObject({ a: 3, b: 1, op: '+', result: 4 });
    expect(typeof current.value.id).toBe('number');
  });

  it('stays active until explicitly cleared (replayable, no auto-dismiss)', () => {
    const { current, play } = useMathAnimation();
    play({ a: 2, b: 2, op: '+', result: 4 });
    expect(current.value).not.toBeNull();
  });

  it('ignores invalid equations', () => {
    const { current, play } = useMathAnimation();
    play(null);
    play({ a: 1, b: 1 });
    expect(current.value).toBeNull();
  });

  it('clear() removes the current equation', () => {
    const { current, play, clear } = useMathAnimation();
    play({ a: 1, b: 1, op: '+', result: 2 });
    clear();
    expect(current.value).toBeNull();
  });
});
