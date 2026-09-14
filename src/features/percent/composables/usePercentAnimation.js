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

// How long the lights-out flicker runs before the dead battery appears.
export const BLACKOUT_MS = 1000;

// null — normal; 'flickering' — lights going out; 'dead' — black room, white battery.
export const POWER_OFF = 'flickering';
export const POWER_DEAD = 'dead';

const syncBlackoutDom = state => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.classList.toggle('battery-blackout', state === POWER_OFF || state === POWER_DEAD);
  root.classList.toggle('battery-flickering', state === POWER_OFF);
  root.classList.toggle('battery-dead', state === POWER_DEAD);
};

// Holds the battery's charge. The BatteryAnimation component watches `current`
// and draws it: a new `id` plays the big arrival animation, after which the
// battery docks in the corner and stays put like a phone's menubar indicator.
// From then on every keystroke drains a point (`drain`), so the child watches
// the charge run down as they type. Only Escape (or a new percent) clears it —
// unless the charge is locked from typing over a million, which sticks until
// the page refreshes. Hitting 0% blacks the room out, then leaves a white
// dead battery in the centre until Escape or a new charge.
export function usePercentAnimation() {
  const current = ref(null);
  const powerState = ref(null);
  let blackoutTimer = null;

  const endBlackout = () => {
    if (blackoutTimer != null) {
      clearTimeout(blackoutTimer);
      blackoutTimer = null;
    }
    if (powerState.value != null) {
      powerState.value = null;
      syncBlackoutDom(null);
    }
  };

  const startBlackout = () => {
    if (powerState.value != null) return;
    powerState.value = POWER_OFF;
    syncBlackoutDom(POWER_OFF);
    blackoutTimer = setTimeout(() => {
      powerState.value = POWER_DEAD;
      syncBlackoutDom(POWER_DEAD);
      blackoutTimer = null;
    }, BLACKOUT_MS);
  };

  const clear = () => {
    // A locked overflow charge survives Escape; only a full page refresh drops it.
    if (current.value?.locked) return;
    endBlackout();
    current.value = null;
  };

  const play = data => {
    if (!data || typeof data.percent !== 'number') return;
    endBlackout();
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
    const next = Math.max(0, charge.percent - amount);
    current.value = { ...charge, percent: next };
    // Crossing to empty blacks the room out — the gag for running the battery dry.
    if (next === 0) startBlackout();
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
    powerState,
    isOvercharged,
    play,
    drain,
    zap,
    clear,
  };
}
