import { useParty } from '@/features/party/composables/useParty';
import {
  CHARACTER_BURST_COUNT,
  EDGE_BURSTS_PER_SIDE,
  EDGE_BURST_COUNT,
  EDGE_BURST_SIZE,
  EDGE_INSET_PX,
  MIN_BURST_INTERVAL_MS,
} from '@/features/party/utils/partyMode';
import { SPLAT_DURATION } from '@/features/effects/utils/wordMotion';

// jsdom lays nothing out, so every getBoundingClientRect reads zero — the
// measurement is injected rather than read off the DOM, which is what lets the
// throttle and the geometry be asserted at all.
const stubTarget = (x = 120, y = 400) => jest.fn(() => ({ x, y }));
const stubViewport = (width = 1000, height = 800) => () => ({ width, height });

const setup = (overrides = {}) =>
  useParty({ measureTarget: stubTarget(), viewport: stubViewport(), ...overrides });

describe('useParty', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('starts quiet — no confetti until the trigger is typed', () => {
    const party = setup();
    expect(party.isActive.value).toBe(false);
    expect(party.bursts.value).toEqual([]);
  });

  it('toggles on and back off', () => {
    const party = setup();
    party.toggle();
    expect(party.isActive.value).toBe(true);
    party.toggle();
    expect(party.isActive.value).toBe(false);
  });

  it('announces itself when it starts, so the trigger line is not a no-op', () => {
    const party = setup();
    party.toggle();
    expect(party.bursts.value).toHaveLength(EDGE_BURSTS_PER_SIDE * 2);
  });

  it('leaves nothing behind when it is toggled back off', () => {
    const party = setup();
    party.toggle();
    party.toggle();
    expect(party.bursts.value).toEqual([]);
  });

  describe('a keystroke burst', () => {
    it('does nothing while the party is off', () => {
      const measureTarget = stubTarget();
      const party = setup({ measureTarget });

      expect(party.burstAtLetter()).toBeNull();
      expect(party.bursts.value).toEqual([]);
      // Not even measured: an inactive mode should not be reading layout on
      // every keystroke the child types.
      expect(measureTarget).not.toHaveBeenCalled();
    });

    it('throws confetti from the letter that was measured', () => {
      const party = setup({ measureTarget: stubTarget(321, 654) });
      party.start();

      party.burstAtLetter();

      expect(party.bursts.value).toHaveLength(1);
      expect(party.bursts.value[0]).toMatchObject({
        x: 321,
        y: 654,
        count: CHARACTER_BURST_COUNT,
      });
    });

    it('holds the rate under the cap when keys come faster than it', () => {
      const party = setup();
      party.start();

      party.burstAtLetter();
      jest.advanceTimersByTime(MIN_BURST_INTERVAL_MS - 50);
      party.burstAtLetter();
      party.burstAtLetter();

      expect(party.bursts.value).toHaveLength(1);
    });

    it('fires again once the interval has passed', () => {
      const party = setup();
      party.start();

      party.burstAtLetter();
      jest.advanceTimersByTime(MIN_BURST_INTERVAL_MS);
      party.burstAtLetter();

      expect(party.bursts.value).toHaveLength(2);
    });

    it('skips the burst when there is no letter to measure', () => {
      const party = setup({ measureTarget: () => null });
      party.start();

      expect(party.burstAtLetter()).toBeNull();
      expect(party.bursts.value).toEqual([]);
    });

    it('does not spend the throttle on a burst it could not place', () => {
      // A miss that stamped the clock would swallow the next real keystroke.
      let point = null;
      const party = setup({ measureTarget: () => point });
      party.start();

      party.burstAtLetter();
      point = { x: 10, y: 10 };
      party.burstAtLetter();

      expect(party.bursts.value).toHaveLength(1);
    });

    it('retires the burst once its droplets have finished', () => {
      const party = setup();
      party.start();

      party.burstAtLetter();
      expect(party.bursts.value).toHaveLength(1);

      jest.advanceTimersByTime(SPLAT_DURATION);
      expect(party.bursts.value).toEqual([]);
    });
  });

  describe('an edge burst', () => {
    it('does nothing while the party is off', () => {
      const party = setup();
      expect(party.burstFromEdges()).toEqual([]);
      expect(party.bursts.value).toEqual([]);
    });

    it('sprays one off each edge at every height', () => {
      const party = setup({ viewport: stubViewport(1000, 800) });
      party.start();

      party.burstFromEdges();

      expect(party.bursts.value).toHaveLength(EDGE_BURSTS_PER_SIDE * 2);
      const xs = new Set(party.bursts.value.map(burst => burst.x));
      expect([...xs].sort((a, b) => a - b)).toEqual([EDGE_INSET_PX, 1000 - EDGE_INSET_PX]);

      // Inset far enough that the largest fleck it can throw still lands on
      // screen rather than half of the burst firing into the void.
      expect(EDGE_INSET_PX).toBeGreaterThan(EDGE_BURST_SIZE);
      party.bursts.value.forEach(burst => {
        expect(burst.count).toBe(EDGE_BURST_COUNT);
        expect(burst.y).toBeGreaterThan(0);
        expect(burst.y).toBeLessThan(800);
      });
    });

    it('is not fired by start() itself — that is toggle\'s job', () => {
      const party = setup();
      party.start();
      expect(party.bursts.value).toEqual([]);
    });

    it('is not rate-capped — a keystroke burst just before it still lets it through', () => {
      const party = setup();
      party.start();

      party.burstAtLetter();
      party.burstFromEdges();

      expect(party.bursts.value).toHaveLength(1 + EDGE_BURSTS_PER_SIDE * 2);
    });
  });

  describe('stopping', () => {
    it('takes the confetti in the air with it', () => {
      const party = setup();
      party.start();
      party.burstFromEdges();
      expect(party.bursts.value.length).toBeGreaterThan(0);

      party.stop();

      expect(party.isActive.value).toBe(false);
      expect(party.bursts.value).toEqual([]);
    });

    it('cancels the retirement timers rather than leaving them to fire', () => {
      const party = setup();
      party.start();
      party.burstFromEdges();
      party.stop();

      party.start();
      party.burstFromEdges();
      const afterRestart = party.bursts.value.length;

      // If stop() had left its timers running, they would land here and strip
      // bursts that belong to the new party.
      jest.advanceTimersByTime(SPLAT_DURATION - 1);
      expect(party.bursts.value).toHaveLength(afterRestart);
    });

    it('lets the very next keystroke burst, rather than holding the old throttle', () => {
      const party = setup();
      party.start();
      party.burstAtLetter();
      party.stop();

      party.start();
      party.burstAtLetter();

      expect(party.bursts.value).toHaveLength(1);
    });
  });
});
