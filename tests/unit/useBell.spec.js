import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { effectScope } from 'vue';
import { useBell } from '@/features/bell/composables/useBell';
import { useSound } from '@/features/audio/composables/useSound';
import { buildSchedule, scheduleDuration } from '@/features/bell/utils/westminster';

const QUARTER = { hour: 1, minute: 15, label: '1:15' };
const HOUR_TWO = { hour: 2, minute: 0, label: "2 o'clock" };

// A manual frame loop so swing timing is driven by a clock the test owns.
const harness = (overrides = {}) => {
  let clock = 0;
  let pending = null;
  const playSchedule = jest.fn(() => true);
  const stopSchedule = jest.fn();
  const bell = useBell({
    playSchedule,
    stopSchedule,
    now: () => clock,
    requestFrame: cb => { pending = cb; return 1; },
    cancelFrame: () => { pending = null; },
    reducedMotion: () => false,
    ...overrides,
  });
  const advance = ms => { clock += ms; const cb = pending; pending = null; cb?.(); };
  return { bell, playSchedule, stopSchedule, advance, hasFrame: () => pending !== null };
};

describe('useBell', () => {
  it('starts idle', () => {
    const { bell } = harness();
    expect(bell.current.value).toBeNull();
    expect(bell.angle.value).toBe(0);
  });

  it('hands the sourced schedule to the audio and shows the bell', () => {
    const { bell, playSchedule } = harness();
    expect(bell.play(QUARTER)).toBe(true);
    expect(playSchedule).toHaveBeenCalledWith(buildSchedule({ minute: 15, hour: 1 }));
    expect(bell.current.value).toMatchObject({ label: '1:15', minute: 15 });
  });

  it('swings on the schedule and comes to rest when it ends', () => {
    const { bell, advance, hasFrame, stopSchedule } = harness();
    const duration = scheduleDuration(buildSchedule({ minute: 15, hour: 1 })) * 1000;

    bell.play(QUARTER);
    advance(100);
    expect(bell.angle.value).not.toBe(0);

    advance(duration);
    expect(bell.current.value).toBeNull();
    expect(bell.angle.value).toBe(0);
    expect(hasFrame()).toBe(false);
    expect(stopSchedule).toHaveBeenCalled();
  });

  it('is the same swing for the same elapsed time', () => {
    const a = harness();
    const b = harness();
    a.bell.play(HOUR_TWO); b.bell.play(HOUR_TWO);
    a.advance(12000); b.advance(12000);
    expect(a.bell.angle.value).toBe(b.bell.angle.value);
  });

  it('a retrigger silences the old schedule before starting the new one', () => {
    const { bell, playSchedule, stopSchedule } = harness();
    bell.play(QUARTER);
    bell.play(HOUR_TWO);
    expect(stopSchedule).toHaveBeenCalledTimes(2); // once per play()
    expect(playSchedule).toHaveBeenCalledTimes(2);
    expect(bell.current.value.label).toBe("2 o'clock");
  });

  it('clear() (Escape) cancels audio, animation and the visible bell', () => {
    const { bell, advance, stopSchedule, hasFrame } = harness();
    bell.play(HOUR_TWO);
    advance(500);
    stopSchedule.mockClear();
    bell.clear();
    expect(stopSchedule).toHaveBeenCalledTimes(1);
    expect(hasFrame()).toBe(false);
    expect(bell.current.value).toBeNull();
    expect(bell.angle.value).toBe(0);
  });

  it('cancels on scope teardown', () => {
    const scope = effectScope();
    let h;
    scope.run(() => { h = harness(); });
    h.bell.play(QUARTER);
    h.stopSchedule.mockClear();
    scope.stop();
    expect(h.stopSchedule).toHaveBeenCalled();
    expect(h.hasFrame()).toBe(false);
    expect(h.bell.current.value).toBeNull();
  });

  it('refuses nothing-to-ring input', () => {
    const { bell, playSchedule } = harness();
    expect(bell.play(null)).toBe(false);
    expect(bell.play({ hour: 1, minute: 20, label: 'x' })).toBe(false);
    expect(playSchedule).not.toHaveBeenCalled();
    expect(bell.current.value).toBeNull();
  });

  it('still swings when audio reports nothing played (muted / unavailable)', () => {
    const { bell, advance } = harness({ playSchedule: () => false });
    bell.play(QUARTER);
    advance(100);
    expect(bell.current.value).not.toBeNull();
    expect(bell.angle.value).not.toBe(0);
  });

  describe('when animation frames are paused', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    it('ends the visible bell on schedule even without another frame', () => {
      const { bell, stopSchedule, hasFrame } = harness();
      const duration = scheduleDuration(buildSchedule({ minute: 15, hour: 1 })) * 1000;

      bell.play(QUARTER);
      expect(hasFrame()).toBe(true);
      jest.advanceTimersByTime(duration);

      expect(bell.current.value).toBeNull();
      expect(hasFrame()).toBe(false);
      expect(stopSchedule).toHaveBeenCalled();
    });
  });

  describe('reduced motion', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    it('shows the bell still, then removes it when the sound ends', () => {
      const { bell, hasFrame } = harness({ reducedMotion: () => true });
      bell.play(QUARTER);
      expect(bell.current.value.reducedMotion).toBe(true);
      expect(hasFrame()).toBe(false);
      expect(bell.angle.value).toBe(0);
      jest.advanceTimersByTime(scheduleDuration(buildSchedule({ minute: 15, hour: 1 })) * 1000);
      expect(bell.current.value).toBeNull();
    });

    it('clear() cancels the end timer', () => {
      const { bell, stopSchedule } = harness({ reducedMotion: () => true });
      bell.play(QUARTER);
      bell.clear();
      stopSchedule.mockClear();
      jest.advanceTimersByTime(60000);
      expect(stopSchedule).not.toHaveBeenCalled();
    });
  });
});

describe('useSound bell scheduling', () => {
  const original = global.AudioContext;
  let ctx;
  let voices;

  beforeEach(() => {
    voices = [];
    ctx = {
      currentTime: 10,
      state: 'running',
      destination: {},
      createGain: jest.fn(() => ({
        connect: jest.fn(), disconnect: jest.fn(),
        gain: { setValueAtTime: jest.fn(), linearRampToValueAtTime: jest.fn(), exponentialRampToValueAtTime: jest.fn() },
      })),
      createOscillator: jest.fn(() => {
        const o = {
          connect: jest.fn(), disconnect: jest.fn(), start: jest.fn(), stop: jest.fn(),
          frequency: { setValueAtTime: jest.fn() },
        };
        voices.push(o);
        return o;
      }),
    };
    global.AudioContext = jest.fn(() => ctx);
  });
  afterEach(() => { global.AudioContext = original; });

  it('schedules each strike on the audio clock at its offset', () => {
    const sound = useSound();
    const events = buildSchedule({ minute: 15 });
    expect(sound.playBell(events)).toBe(true);
    // two oscillators (fundamental + overtone) per strike
    expect(voices).toHaveLength(events.length * 2);
    expect(voices[0].start).toHaveBeenCalledWith(expect.closeTo(10.05, 5));
    expect(voices[0].frequency.setValueAtTime).toHaveBeenCalledWith(events[0].hz, expect.any(Number));
    const last = events.length - 1;
    expect(voices[last * 2].start).toHaveBeenCalledWith(expect.closeTo(10.05 + events[last].time, 5));
  });

  it('stopBell stops every pending voice, and a replay stops the previous one', () => {
    const sound = useSound();
    sound.playBell(buildSchedule({ minute: 15 }));
    const first = [...voices];
    sound.playBell(buildSchedule({ minute: 15 }));
    first.forEach(v => expect(v.stop).toHaveBeenCalledTimes(2)); // scheduled stop + cancel
    const second = voices.slice(first.length);
    sound.stopBell();
    second.forEach(v => expect(v.stop).toHaveBeenCalledTimes(2));
  });

  it('stops pending bell voices immediately when audio is muted', () => {
    const sound = useSound();
    sound.playBell(buildSchedule({ minute: 15 }));
    const scheduledVoices = [...voices];

    sound.toggleAudio();

    scheduledVoices.forEach(voice => expect(voice.stop).toHaveBeenCalledTimes(2));
  });

  it('is silent when sound is muted', () => {
    const sound = useSound();
    sound.toggleAudio();
    expect(sound.playBell(buildSchedule({ minute: 15 }))).toBe(false);
    expect(ctx.createOscillator).not.toHaveBeenCalled();
  });

  it('is silent (no throw) when AudioContext is unavailable', () => {
    delete global.AudioContext;
    const sound = useSound();
    expect(sound.playBell(buildSchedule({ minute: 15 }))).toBe(false);
    expect(() => sound.stopBell()).not.toThrow();
  });

  it('survives an audio graph that throws', () => {
    ctx.createOscillator = jest.fn(() => { throw new Error('nope'); });
    const sound = useSound();
    expect(sound.playBell(buildSchedule({ minute: 15 }))).toBe(false);
  });
});
