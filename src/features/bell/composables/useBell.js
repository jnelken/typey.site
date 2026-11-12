import { ref, getCurrentScope, onScopeDispose } from 'vue';
import { buildSchedule, scheduleDuration } from '@/features/bell/utils/westminster';
import { swingAngle } from '@/features/bell/utils/bellSwing';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * The clock-tower bell: one deterministic schedule (westminster.js) drives both
 * the audio (via playSchedule, which owns the oscillators) and the swing.
 *
 * `playSchedule(events)` and `stopSchedule()` are injected from the sound system.
 * Audio being muted or unavailable never stops the bell from swinging.
 * Under prefers-reduced-motion the bell is shown still instead of swinging.
 */
export function useBell({
  playSchedule = () => false,
  stopSchedule = () => {},
  now = () => performance.now(),
  requestFrame = cb =>
    typeof requestAnimationFrame === 'function'
      ? requestAnimationFrame(cb)
      : setTimeout(() => cb(now()), 16),
  cancelFrame = id =>
    typeof cancelAnimationFrame === 'function' ? cancelAnimationFrame(id) : clearTimeout(id),
  reducedMotion = prefersReducedMotion,
} = {}) {
  // { label, hour, minute, reducedMotion } while ringing, otherwise null.
  const current = ref(null);
  const angle = ref(0);

  let frame = null;
  let stillTimer = null;
  let startedAt = 0;
  let events = [];
  let duration = 0;

  const stopLoop = () => {
    if (frame !== null) cancelFrame(frame);
    frame = null;
    if (stillTimer !== null) clearTimeout(stillTimer);
    stillTimer = null;
  };

  const clear = () => {
    stopLoop();
    stopSchedule();
    events = [];
    current.value = null;
    angle.value = 0;
  };

  const tick = () => {
    frame = null;
    if (!current.value) return;
    const elapsed = (now() - startedAt) / 1000;
    if (elapsed >= duration) {
      clear();
      return;
    }
    angle.value = swingAngle(events, elapsed);
    frame = requestFrame(tick);
  };

  // `bell` is a parseBell() result. Returns false when it has nothing to ring.
  const play = bell => {
    clear();
    if (!bell) return false;
    events = buildSchedule({ minute: bell.minute, hour: bell.hour });
    if (events.length === 0) return false;

    duration = scheduleDuration(events);
    startedAt = now();
    const still = reducedMotion();
    current.value = { label: bell.label, hour: bell.hour, minute: bell.minute, reducedMotion: still };
    playSchedule(events);

    // A still bell has no frames to run; a timer ends it with the sound.
    if (still) stillTimer = setTimeout(clear, duration * 1000);
    else frame = requestFrame(tick);
    return true;
  };

  if (getCurrentScope()) onScopeDispose(clear);

  return { current, angle, play, clear };
}
