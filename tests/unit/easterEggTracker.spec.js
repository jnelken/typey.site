import { describe, it, expect, jest } from '@jest/globals';
import { createEasterEggTracker, EASTER_EGGS } from '@/features/analytics/easterEggs';

describe('createEasterEggTracker', () => {
  it('reports a discovery the first time an egg plays, and a trigger every time', () => {
    const capture = jest.fn();
    const trackEgg = createEasterEggTracker(capture);

    trackEgg(EASTER_EGGS.PARTY, { enabled: true });
    trackEgg(EASTER_EGGS.PARTY, { enabled: false });

    expect(capture.mock.calls).toEqual([
      ['easter_egg_discovered', { egg: 'party' }],
      ['easter_egg_triggered', { egg: 'party', enabled: true }],
      ['easter_egg_triggered', { egg: 'party', enabled: false }],
    ]);
  });

  it('tracks discovery separately for each egg', () => {
    const capture = jest.fn();
    const trackEgg = createEasterEggTracker(capture);

    trackEgg(EASTER_EGGS.SILLY);
    trackEgg(EASTER_EGGS.NIGHT);

    const discovered = capture.mock.calls
      .filter(([event]) => event === 'easter_egg_discovered')
      .map(([, props]) => props.egg);
    expect(discovered).toEqual(['silly', 'night']);
  });

  it('starts fresh for a new tracker (a new page load)', () => {
    const capture = jest.fn();
    createEasterEggTracker(capture)(EASTER_EGGS.MATH);
    createEasterEggTracker(capture)(EASTER_EGGS.MATH);

    expect(capture.mock.calls.filter(([event]) => event === 'easter_egg_discovered')).toHaveLength(2);
  });

  it('never lets a property overwrite the egg name', () => {
    const capture = jest.fn();
    createEasterEggTracker(capture)(EASTER_EGGS.MATH, { egg: 'other' });
    expect(capture).toHaveBeenLastCalledWith('easter_egg_triggered', { egg: 'math' });
  });

  it('names every egg with a stable snake_case identifier', () => {
    Object.values(EASTER_EGGS).forEach(name => expect(name).toMatch(/^[a-z]+(_[a-z]+)*$/));
  });
});
