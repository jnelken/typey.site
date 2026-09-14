import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import {
  usePercentAnimation,
  ZAP_COST,
  ZAP_THRESHOLD,
  BLACKOUT_MS,
  POWER_OFF,
  POWER_DEAD,
} from '@/features/percent/composables/usePercentAnimation';
import { MAX_CHARGE } from '@/features/percent/utils/parsePercent';

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

  describe('zapping past the threshold', () => {
    it('is not overcharged at or below the threshold', () => {
      const { play, isOvercharged } = usePercentAnimation();
      play({ percent: ZAP_THRESHOLD });
      expect(isOvercharged.value).toBe(false);
    });

    it('is overcharged above it', () => {
      const { play, isOvercharged } = usePercentAnimation();
      play({ percent: ZAP_THRESHOLD + 1 });
      expect(isOvercharged.value).toBe(true);
    });

    it('zap() spends a bolt\'s worth of charge and keeps the same battery', () => {
      const { current, play, zap } = usePercentAnimation();
      play({ percent: 3500 });
      const { id } = current.value;
      expect(zap()).toBe(true);
      expect(current.value).toEqual({ percent: 3500 - ZAP_COST, id });
    });

    it('stops firing once the charge falls back under the threshold', () => {
      const { current, play, zap, isOvercharged } = usePercentAnimation();
      play({ percent: 1100 });
      expect(zap()).toBe(true); // 1000 — still at the line, no longer over
      expect(zap()).toBe(false);
      expect(isOvercharged.value).toBe(false);
      expect(current.value).toMatchObject({ percent: 1000 });
    });

    it('keeps zapping while still above the threshold after cheap bolts', () => {
      const { current, play, zap, isOvercharged } = usePercentAnimation();
      play({ percent: 2500 });
      expect(zap()).toBe(true); // 2400
      expect(zap()).toBe(true); // 2300
      expect(isOvercharged.value).toBe(true);
      expect(current.value).toMatchObject({ percent: 2300 });
    });

    it('zap() with no battery is a no-op', () => {
      const { current, zap } = usePercentAnimation();
      expect(zap()).toBe(false);
      expect(current.value).toBeNull();
    });
  });

  describe('overflow past a million', () => {
    it('clamps the battery at max and locks it with the typed overflow', () => {
      const { current, play } = usePercentAnimation();
      play({ percent: 2500000 });
      expect(current.value).toMatchObject({
        percent: MAX_CHARGE,
        locked: true,
        overflow: 2500000,
      });
    });

    it('refuses to drain, zap, or clear a locked overflow charge', () => {
      const { current, play, drain, zap, clear } = usePercentAnimation();
      play({ percent: 1000001 });
      const snapshot = { ...current.value };

      expect(zap()).toBe(false);
      drain();
      clear();

      expect(current.value).toEqual(snapshot);
      expect(current.value.percent).toBe(MAX_CHARGE);
    });

    it('does not lock an exact million', () => {
      const { current, play, drain } = usePercentAnimation();
      play({ percent: MAX_CHARGE });
      expect(current.value).toEqual({ percent: MAX_CHARGE, id: current.value.id });
      drain();
      expect(current.value.percent).toBe(MAX_CHARGE - 1);
    });
  });

  describe('blackout at zero', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => {
      document.documentElement.className = '';
      jest.useRealTimers();
    });

    it('flickers when drain crosses to zero, then goes dead after a second', () => {
      const { current, play, drain, powerState } = usePercentAnimation();
      play({ percent: 1 });
      drain();

      expect(current.value).toMatchObject({ percent: 0 });
      expect(powerState.value).toBe(POWER_OFF);
      expect(document.documentElement.classList.contains('battery-flickering')).toBe(true);

      jest.advanceTimersByTime(BLACKOUT_MS);
      expect(powerState.value).toBe(POWER_DEAD);
      expect(document.documentElement.classList.contains('battery-dead')).toBe(true);
      expect(document.documentElement.classList.contains('battery-blackout')).toBe(true);
    });

    it('does not restart blackout while already dark', () => {
      const { play, drain, powerState } = usePercentAnimation();
      play({ percent: 1 });
      drain();
      jest.advanceTimersByTime(BLACKOUT_MS);
      expect(powerState.value).toBe(POWER_DEAD);

      drain();
      expect(powerState.value).toBe(POWER_DEAD);
    });

    it('clear() ends the blackout and restores the page', () => {
      const { play, drain, clear, powerState, current } = usePercentAnimation();
      play({ percent: 1 });
      drain();
      jest.advanceTimersByTime(BLACKOUT_MS);
      clear();

      expect(current.value).toBeNull();
      expect(powerState.value).toBeNull();
      expect(document.documentElement.classList.contains('battery-blackout')).toBe(false);
    });

    it('play() ends the blackout for a fresh charge', () => {
      const { play, drain, powerState, current } = usePercentAnimation();
      play({ percent: 1 });
      drain();
      jest.advanceTimersByTime(BLACKOUT_MS);
      play({ percent: 50 });

      expect(current.value).toMatchObject({ percent: 50 });
      expect(powerState.value).toBeNull();
      expect(document.documentElement.classList.contains('battery-blackout')).toBe(false);
    });

    it('typing 0% does not black the room out by itself', () => {
      const { play, powerState } = usePercentAnimation();
      play({ percent: 0 });
      expect(powerState.value).toBeNull();
    });
  });
});
