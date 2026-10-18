import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { useZaps, STRIKE_MS, BOLT_MS, HIT_CHANCE } from '@/features/percent/composables/useZaps';

describe('useZaps', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    // Default to a guaranteed hit so existing strike/clear timing stays pinned.
    jest.spyOn(Math, 'random').mockReturnValue(0);
  });
  afterEach(() => {
    Math.random.mockRestore();
    jest.useRealTimers();
  });

  it('starts with no bolts', () => {
    const { bolts } = useZaps();
    expect(bolts.value).toEqual([]);
  });

  it('strike() puts a bolt on screen straight away on a hit', () => {
    const { bolts, strike } = useZaps();
    const result = strike();
    expect(result).toEqual({ hit: true, bolt: expect.objectContaining({ id: expect.any(Number) }) });
    expect(bolts.value).toHaveLength(1);
    expect(bolts.value[0].id).toBe(result.bolt.id);
    expect(typeof result.bolt.firedAt).toBe('number');
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

  it('clear() takes the bolts off screen but still eats what they hit', () => {
    const onStrike = jest.fn();
    const { bolts, strike, clear } = useZaps({ onStrike });
    strike();
    clear();

    // A hit was rolled when the bolt was fired, so the letter goes with it.
    expect(onStrike).toHaveBeenCalledTimes(1);
    expect(bolts.value).toEqual([]);

    // And it only eats it once — the cancelled timer must not fire as well.
    jest.advanceTimersByTime(BOLT_MS * 2);
    expect(onStrike).toHaveBeenCalledTimes(1);
  });

  it('clear() eats one letter per hit still in the air', () => {
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

  it('repeated clear() does not delete the same letter twice', () => {
    const onStrike = jest.fn();
    const { strike, clear } = useZaps({ onStrike });
    strike();
    clear();
    clear();
    clear();
    expect(onStrike).toHaveBeenCalledTimes(1);
    jest.advanceTimersByTime(BOLT_MS * 2);
    expect(onStrike).toHaveBeenCalledTimes(1);
  });

  it('works without an onStrike callback', () => {
    const { strike } = useZaps();
    strike();
    expect(() => jest.advanceTimersByTime(BOLT_MS)).not.toThrow();
  });

  describe('one-in-five hit chance', () => {
    it('exposes a 1/5 hit chance', () => {
      expect(HIT_CHANCE).toBe(1 / 5);
    });

    it('misses with no bolt and no deletion when the roll is at the hit chance', () => {
      Math.random.mockReturnValue(HIT_CHANCE);
      const onStrike = jest.fn();
      const { bolts, strike } = useZaps({ onStrike });
      const result = strike();

      expect(result).toEqual({ hit: false, bolt: null });
      expect(bolts.value).toEqual([]);
      jest.advanceTimersByTime(BOLT_MS);
      expect(onStrike).not.toHaveBeenCalled();
      expect(bolts.value).toEqual([]);
    });

    it('misses with no bolt when the roll is above the hit chance', () => {
      Math.random.mockReturnValue(0.99);
      const onStrike = jest.fn();
      const { bolts, strike } = useZaps({ onStrike });
      expect(strike()).toEqual({ hit: false, bolt: null });
      expect(bolts.value).toEqual([]);
      jest.advanceTimersByTime(BOLT_MS);
      expect(onStrike).not.toHaveBeenCalled();
    });

    it('hits when the roll is just under the hit chance', () => {
      Math.random.mockReturnValue(HIT_CHANCE - Number.EPSILON);
      const onStrike = jest.fn();
      const { bolts, strike } = useZaps({ onStrike });
      expect(strike().hit).toBe(true);
      expect(bolts.value).toHaveLength(1);
      jest.advanceTimersByTime(STRIKE_MS);
      expect(onStrike).toHaveBeenCalledTimes(1);
    });

    it('clear() does not eat a letter from a miss (nothing was pending)', () => {
      Math.random.mockReturnValue(HIT_CHANCE);
      const onStrike = jest.fn();
      const { strike, clear } = useZaps({ onStrike });
      strike();
      clear();
      expect(onStrike).not.toHaveBeenCalled();
    });

    it('handles concurrent hit and miss attempts independently', () => {
      const onStrike = jest.fn();
      const { bolts, strike } = useZaps({ onStrike });

      Math.random.mockReturnValue(0);
      expect(strike().hit).toBe(true);
      Math.random.mockReturnValue(HIT_CHANCE);
      expect(strike().hit).toBe(false);
      Math.random.mockReturnValue(0);
      expect(strike().hit).toBe(true);

      expect(bolts.value).toHaveLength(2);
      jest.advanceTimersByTime(STRIKE_MS);
      expect(onStrike).toHaveBeenCalledTimes(2);
      jest.advanceTimersByTime(BOLT_MS);
      expect(bolts.value).toEqual([]);
    });
  });
});
