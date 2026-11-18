// The Westminster Quarters, as sourced in docs/plans/clock-tower-bell.md.
// Pure data + a deterministic schedule builder: the audio and the swinging
// bell both read the same schedule, so they can never drift apart.

// Equal temperament, A4 = 440 Hz.
export const NOTE_HZ = Object.freeze({
  E3: 164.81,
  B3: 246.94,
  E4: 329.63,
  'F#4': 369.99,
  'G#4': 415.3,
});

// Five changes, each three crotchets and a minim.
export const CHANGES = Object.freeze({
  1: Object.freeze(['G#4', 'F#4', 'E4', 'B3']),
  2: Object.freeze(['E4', 'G#4', 'F#4', 'B3']),
  3: Object.freeze(['E4', 'F#4', 'G#4', 'E4']),
  4: Object.freeze(['G#4', 'E4', 'F#4', 'B3']),
  5: Object.freeze(['B3', 'F#4', 'G#4', 'E4']),
});

// Which changes play at each quarter (minute -> change numbers).
export const QUARTER_CHANGES = Object.freeze({
  15: Object.freeze([1]),
  30: Object.freeze([2, 3]),
  45: Object.freeze([4, 5, 1]),
  0: Object.freeze([2, 3, 4, 5]),
});

export const HOUR_NOTE = 'E3';

// Not in the sources (they give no tempo): kept short for a child at the keyboard.
export const TIMING = Object.freeze({
  crotchet: 0.5,
  minim: 1.0,
  hourPause: 1.5,
  tollSpacing: 1.4,
  chimeDecay: 1.2,
  tollDecay: 3,
});

/** Tolls for an hour on a 12-hour clock: 1..12 (noon and midnight are 12). */
export function tollCount(hour) {
  if (!Number.isInteger(hour)) return 0;
  return hour % 12 || 12;
}

/**
 * Every strike for a quarter, in order.
 * Each event: { time (s from start), type: 'chime'|'toll', note, hz, decay }.
 * Returns [] for an unknown minute.
 */
export function buildSchedule({ minute, hour = 12 } = {}) {
  const changes = QUARTER_CHANGES[minute];
  if (!changes) return [];

  const events = [];
  let t = 0;

  for (const change of changes) {
    CHANGES[change].forEach((note, i) => {
      events.push({
        time: t,
        type: 'chime',
        note,
        hz: NOTE_HZ[note],
        decay: TIMING.chimeDecay,
      });
      t += i === 3 ? TIMING.minim : TIMING.crotchet;
    });
  }

  if (minute === 0) {
    t += TIMING.hourPause; // after the last minim has run its course
    const tolls = tollCount(hour);
    for (let n = 0; n < tolls; n++) {
      events.push({
        time: t + n * TIMING.tollSpacing,
        type: 'toll',
        note: HOUR_NOTE,
        hz: NOTE_HZ[HOUR_NOTE],
        decay: TIMING.tollDecay,
      });
    }
  }

  return events;
}

/** Seconds until the last strike has faded. */
export function scheduleDuration(events) {
  return events.reduce((end, e) => Math.max(end, e.time + e.decay), 0);
}
