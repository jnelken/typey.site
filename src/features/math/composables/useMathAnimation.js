import { ref } from 'vue';

let mathIdCounter = 0;

// Holds the currently-animating equation. The MathAnimation component watches
// `current` and draws it on a canvas, looping so the child can keep watching.
// The animation stays until explicitly cleared (when the child starts typing
// again), so it is replayable rather than vanishing on a timer.
export function useMathAnimation() {
  const current = ref(null);

  const clear = () => {
    current.value = null;
  };

  const play = equation => {
    if (!equation || typeof equation.result !== 'number') return;
    current.value = { ...equation, id: ++mathIdCounter };
  };

  return {
    current,
    play,
    clear,
  };
}
