import { ref } from 'vue';
import { SPLAT_DURATION } from '@/features/effects/utils/wordMotion';
import { lastGlyphPoint, currentLinePoint } from '@/features/effects/utils/glyphTarget';
import {
  CHARACTER_BURST_COUNT,
  CHARACTER_BURST_SIZE,
  EDGE_BURST_COUNT,
  EDGE_BURST_SIZE,
  EDGE_INSET_PX,
  edgeBurstPositions,
  shouldBurst,
} from '@/features/party/utils/partyMode';

let burstIdCounter = 0;

const domViewport = () => ({
  width: typeof window === 'undefined' ? 0 : window.innerWidth,
  height: typeof window === 'undefined' ? 0 : window.innerHeight,
});

const domTarget = () => lastGlyphPoint() ?? currentLinePoint();

/**
 * Party Mode's live confetti: the bursts currently in the air, and the two
 * events that add to them.
 *
 * The DOM measurement and the window size come in as functions so the whole
 * thing is provable without a layout engine — jsdom reports every rect as
 * zero, so a spec that relied on real measurement would assert nothing.
 */
export function useParty({ measureTarget = domTarget, viewport = domViewport } = {}) {
  const isActive = ref(false);
  const bursts = ref([]);
  const timers = new Set();
  // Nothing has fired yet, so the first keystroke is never throttled.
  let lastBurstAt = null;

  const add = ({ x, y, count, size }) => {
    const burst = { id: ++burstIdCounter, x, y, count, size };
    bursts.value = [...bursts.value, burst];

    // Retire it as the droplets finish, so a long party doesn't accumulate
    // thousands of dead spans behind the live ones.
    const timer = setTimeout(() => {
      timers.delete(timer);
      bursts.value = bursts.value.filter(active => active.id !== burst.id);
    }, SPLAT_DURATION);
    timers.add(timer);

    return burst;
  };

  /**
   * A keystroke's confetti, thrown from the letter just typed.
   *
   * Measured once, synchronously, on the frame it fires — the same rule the
   * zap bolt lives by. The glyph the child pressed may not have rendered yet,
   * so this can land on the letter before it; at typing speed that is half a
   * character's width away from where they are looking, and waiting a tick
   * would trade that for a burst that fires after the next keystroke.
   */
  const burstAtLetter = () => {
    if (!isActive.value) return null;

    const now = Date.now();
    if (!shouldBurst(lastBurstAt, now)) return null;

    const point = measureTarget();
    if (!point) return null;

    lastBurstAt = now;
    return add({
      x: point.x,
      y: point.y,
      count: CHARACTER_BURST_COUNT,
      size: CHARACTER_BURST_SIZE,
    });
  };

  /**
   * A sent line's confetti, sprayed in off both edges. Not rate-capped: a line
   * takes seconds to type, so this can't repeat fast enough to need one.
   */
  const burstFromEdges = () => {
    if (!isActive.value) return [];

    const { width, height } = viewport();
    return edgeBurstPositions().map(({ side, top }) =>
      add({
        x: side === 'left' ? EDGE_INSET_PX : width - EDGE_INSET_PX,
        y: top * height,
        count: EDGE_BURST_COUNT,
        size: EDGE_BURST_SIZE,
      }),
    );
  };

  const clearBursts = () => {
    timers.forEach(timer => clearTimeout(timer));
    timers.clear();
    bursts.value = [];
    lastBurstAt = null;
  };

  const start = () => {
    isActive.value = true;
  };

  // Turning the party off takes the confetti in the air with it — Escape
  // clears every other effect outright, and leaving flecks flying after the
  // mode ended would read as the page being stuck.
  const stop = () => {
    isActive.value = false;
    clearBursts();
  };

  const toggle = () => {
    if (isActive.value) {
      stop();
      return;
    }
    start();
    // The party announces itself. Without this the line that starts it is the
    // only line of the session that visibly does nothing — the trigger returns
    // early, so it plays no animation of its own either.
    burstFromEdges();
  };

  return {
    isActive,
    bursts,
    burstAtLetter,
    burstFromEdges,
    start,
    stop,
    toggle,
  };
}
