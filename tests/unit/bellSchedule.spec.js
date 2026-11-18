import { describe, it, expect } from '@jest/globals';
import {
  buildSchedule, tollCount, scheduleDuration, NOTE_HZ, TIMING,
} from '@/features/bell/utils/westminster';
import { swingAngle, SWING } from '@/features/bell/utils/bellSwing';

const notes = events => events.filter(e => e.type === 'chime').map(e => e.note);
const c1 = ['G#4', 'F#4', 'E4', 'B3'];
const c2 = ['E4', 'G#4', 'F#4', 'B3'];
const c3 = ['E4', 'F#4', 'G#4', 'E4'];
const c4 = ['G#4', 'E4', 'F#4', 'B3'];
const c5 = ['B3', 'F#4', 'G#4', 'E4'];

describe('Westminster Quarters (sourced in docs/plans/clock-tower-bell.md)', () => {
  it(':15 is change 1', () => expect(notes(buildSchedule({ minute: 15 }))).toEqual(c1));
  it(':30 is changes 2, 3', () => expect(notes(buildSchedule({ minute: 30 }))).toEqual([...c2, ...c3]));
  it(':45 is changes 4, 5, 1', () => expect(notes(buildSchedule({ minute: 45 }))).toEqual([...c4, ...c5, ...c1]));
  it(':00 is changes 2, 3, 4, 5', () => {
    expect(notes(buildSchedule({ minute: 0, hour: 3 }))).toEqual([...c2, ...c3, ...c4, ...c5]);
  });

  it('pins the pitches (A4 = 440 equal temperament)', () => {
    const hz = (n, a4 = 440) => a4 * 2 ** (n / 12);
    expect(NOTE_HZ['G#4']).toBeCloseTo(hz(-1), 1);
    expect(NOTE_HZ['F#4']).toBeCloseTo(hz(-3), 1);
    expect(NOTE_HZ.E4).toBeCloseTo(hz(-5), 1);
    expect(NOTE_HZ.B3).toBeCloseTo(hz(-10), 1);
    expect(NOTE_HZ.E3).toBeCloseTo(hz(-17), 1);
  });

  it('strikes the hour on E3, one toll per hour on a 12-hour clock', () => {
    const tolls = buildSchedule({ minute: 0, hour: 3 }).filter(e => e.type === 'toll');
    expect(tolls).toHaveLength(3);
    tolls.forEach(t => expect(t.note).toBe('E3'));
  });

  it.each([[1, 1], [2, 2], [11, 11], [12, 12], [13, 1], [0, 12], [24, 12]])(
    'hour %i -> %i tolls', (hour, count) => {
      expect(tollCount(hour)).toBe(count);
      expect(buildSchedule({ minute: 0, hour }).filter(e => e.type === 'toll')).toHaveLength(count);
    });

  it('has no tolls at the quarters', () => {
    [15, 30, 45].forEach(minute => {
      expect(buildSchedule({ minute, hour: 5 }).some(e => e.type === 'toll')).toBe(false);
    });
  });

  it('times: a change is three crotchets and a minim; events are strictly increasing', () => {
    const s = buildSchedule({ minute: 30 });
    expect(s[1].time - s[0].time).toBe(TIMING.crotchet);
    expect(s[4].time - s[3].time).toBe(TIMING.minim);
    s.slice(1).forEach((e, i) => expect(e.time).toBeGreaterThan(s[i].time));
  });

  it('first toll follows the last minim by hourPause; tolls are evenly spaced', () => {
    const s = buildSchedule({ minute: 0, hour: 3 });
    const lastChime = s.filter(e => e.type === 'chime').at(-1);
    const tolls = s.filter(e => e.type === 'toll');
    expect(tolls[0].time).toBeCloseTo(lastChime.time + TIMING.minim + TIMING.hourPause);
    expect(tolls[1].time - tolls[0].time).toBeCloseTo(TIMING.tollSpacing);
  });

  it('returns [] for an unknown minute and 0 duration', () => {
    expect(buildSchedule({ minute: 20 })).toEqual([]);
    expect(buildSchedule()).toEqual([]);
    expect(scheduleDuration([])).toBe(0);
  });

  it('12 o\'clock is the longest schedule, under 40s', () => {
    expect(scheduleDuration(buildSchedule({ minute: 0, hour: 12 }))).toBeLessThan(40);
  });
});

describe('swingAngle', () => {
  const s = buildSchedule({ minute: 0, hour: 2 });

  it('is deterministic and zero before the first strike', () => {
    expect(swingAngle(s, -1)).toBe(0);
    expect(swingAngle(s, 4.2)).toBe(swingAngle(s, 4.2));
  });

  it('is kicked at a strike and rings down to rest', () => {
    const toll = s.find(e => e.type === 'toll');
    expect(Math.abs(swingAngle(s, toll.time))).toBeGreaterThan(5);
    expect(Math.abs(swingAngle(s, scheduleDuration(s) + 30))).toBeLessThan(0.01);
  });

  it('never exceeds the max angle', () => {
    for (let t = 0; t < 30; t += 0.05) {
      expect(Math.abs(swingAngle(s, t))).toBeLessThanOrEqual(SWING.maxDegrees);
    }
  });

  it('tolerates bad input', () => {
    expect(swingAngle(null, 1)).toBe(0);
  });
});
