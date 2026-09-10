import { ref } from 'vue';

let percentIdCounter = 0;

// Holds the currently-animating battery charge. The BatteryAnimation component
// watches `current` and draws it on a canvas, looping so the child can keep
// watching. The animation stays until explicitly cleared (when the child starts
// typing again), so it is replayable rather than vanishing on a timer.
export function usePercentAnimation() {
  const current = ref(null);

  const clear = () => {
    current.value = null;
  };

  const play = data => {
    if (!data || typeof data.percent !== 'number') return;
    current.value = { percent: data.percent, id: ++percentIdCounter };
  };

  return {
    current,
    play,
    clear,
  };
}
