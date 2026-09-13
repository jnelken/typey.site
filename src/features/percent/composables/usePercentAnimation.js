import { ref } from 'vue';

let percentIdCounter = 0;

// Holds the battery's charge. The BatteryAnimation component watches `current`
// and draws it: a new `id` plays the big arrival animation, after which the
// battery docks in the corner and stays put like a phone's menubar indicator.
// From then on every keystroke drains a point (`drain`), so the child watches
// the charge run down as they type. Only Escape (or a new percent) clears it.
export function usePercentAnimation() {
  const current = ref(null);

  const clear = () => {
    current.value = null;
  };

  const play = data => {
    if (!data || typeof data.percent !== 'number') return;
    current.value = { percent: data.percent, id: ++percentIdCounter };
  };

  // Keeps the same `id` on purpose: a drain is a change of charge, not a new
  // battery, so the component tracks the value instead of replaying arrival.
  const drain = (amount = 1) => {
    const charge = current.value;
    if (!charge || charge.percent <= 0) return;
    current.value = { ...charge, percent: Math.max(0, charge.percent - amount) };
  };

  return {
    current,
    play,
    drain,
    clear,
  };
}
