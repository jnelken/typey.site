import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { useZaps, STRIKE_MS, BOLT_MS } from '@/features/percent/composables/useZaps';

describe('useZaps', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('starts with no bolts', () => {
    const { bolts } = useZaps();
    expect(bolts.value).toEqual([]);
  });

  it('strike() puts a bolt on screen straight away', () => {
    const { bolts, strike } = useZaps();
    const bolt = strike();
    expect(bolts.value).toHaveLength(1);
    expect(bolts.value[0].id).toBe(bolt.id);
    expect(typeof bolt.firedAt).toBe('number');
  });

  it('eats the letter a beat after the bolt is fired, not immediately', () => {
    const onStrike = jest.fn();
    const { strike } = useZaps({ onStrike });
    strike();

    jest.advanceTimersByTime(STRIKE_MS - 1);
    expect(onStrike).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    expect(onStrike).toHaveBeenCalledTimes(1);
  });

  it('clears the bolt once it has burned out', () => {
    const { bolts, strike } = useZaps();
    strike();
    jest.advanceTimersByTime(STRIKE_MS + 1);
    expect(bolts.value).toHaveLength(1);
    jest.advanceTimersByTime(BOLT_MS);
    expect(bolts.value).toEqual([]);
  });

  it('holds several bolts at once for fast typing, each with its own id', () => {
    const onStrike = jest.fn();
    const { bolts, strike } = useZaps({ onStrike });
    strike();
    strike();
    strike();
    expect(new Set(bolts.value.map(bolt => bolt.id)).size).toBe(3);
    jest.advanceTimersByTime(STRIKE_MS);
    expect(onStrike).toHaveBeenCalledTimes(3);
  });

  it('clear() takes the bolts off screen but still eats what they paid for', () => {
    const onStrike = jest.fn();
    const { bolts, strike, clear } = useZaps({ onStrike });
    strike();
    clear();

    // The charge was spent when the bolt was fired, so the letter goes with it.
    expect(onStrike).toHaveBeenCalledTimes(1);
    expect(bolts.value).toEqual([]);

    // And it only eats it once — the cancelled timer must not fire as well.
    jest.advanceTimersByTime(BOLT_MS * 2);
    expect(onStrike).toHaveBeenCalledTimes(1);
  });

  it('clear() eats one letter per bolt still in the air', () => {
    const onStrike = jest.fn();
    const { strike, clear } = useZaps({ onStrike });
    strike();
    strike();
    clear();
    expect(onStrike).toHaveBeenCalledTimes(2);
  });

  it('clear() with nothing in the air does nothing', () => {
    const onStrike = jest.fn();
    const { strike, clear } = useZaps({ onStrike });
    strike();
    jest.advanceTimersByTime(BOLT_MS);
    clear();
    expect(onStrike).toHaveBeenCalledTimes(1);
  });

  it('works without an onStrike callback', () => {
    const { strike } = useZaps();
    strike();
    expect(() => jest.advanceTimersByTime(BOLT_MS)).not.toThrow();
  });
});
