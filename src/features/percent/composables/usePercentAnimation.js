import { computed, ref } from 'vue';
import { MAX_CHARGE } from '@/features/percent/utils/parsePercent';

let percentIdCounter = 0;

// Past this much charge the battery stops being an indicator and starts being a
// hazard: the screen's frame runs with electricity and every letter typed is
// zapped off the line. Strictly above, so an even 1000% is still calm.
export const ZAP_THRESHOLD = 1000;
// What one zap costs. Cheaper than the threshold so a big charge fires many
// bolts before it falls back under the danger line.
export const ZAP_COST = 100;

// Holds the battery's charge. The BatteryAnimation component watches `current`
// and draws it: a new `id` plays the big arrival animation, after which the
// battery docks in the corner and stays put like a phone's menubar indicator.
// From then on every keystroke drains a point (`drain`), so the child watches
// the charge run down as they type. Only Escape (or a new percent) clears it —
// unless the charge is locked from typing over a million, which sticks until
// the page refreshes.
export function usePercentAnimation() {
  const current = ref(null);

  const clear = () => {
    // A locked overflow charge survives Escape; only a full page refresh drops it.
    if (current.value?.locked) return;
    current.value = null;
  };

  const play = data => {
    if (!data || typeof data.percent !== 'number') return;
    const typed = data.percent;
    const locked = typed > MAX_CHARGE;
    current.value = {
      percent: locked ? MAX_CHARGE : typed,
      id: ++percentIdCounter,
      ...(locked ? { locked: true, overflow: typed } : {}),
    };
  };

  // Keeps the same `id` on purpose: a drain is a change of charge, not a new
  // battery, so the component tracks the value instead of replaying arrival.
  const drain = (amount = 1) => {
    const charge = current.value;
    if (!charge || charge.locked || charge.percent <= 0) return;
    current.value = { ...charge, percent: Math.max(0, charge.percent - amount) };
  };

  const isOvercharged = computed(() => (current.value?.percent ?? 0) > ZAP_THRESHOLD);

  // Spend one bolt's worth of charge. Returns whether it fired, so the caller
  // can zap a letter instead of draining the usual single point — and stops
  // zapping by itself once the charge falls back under the threshold.
  const zap = () => {
    if (!isOvercharged.value || current.value?.locked) return false;
    drain(ZAP_COST);
    return true;
  };

  return {
    current,
    isOvercharged,
    play,
    drain,
    zap,
    clear,
  };
}
