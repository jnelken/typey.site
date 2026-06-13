import { ref } from 'vue';

// How long the "add the groups" animation stays on screen (ms).
export const MATH_ANIM_DURATION = 3600;

let mathIdCounter = 0;

// Holds the currently-animating equation. The MathAnimation component watches
// `current` and draws it on a canvas; the composable owns the lifecycle so the
// animation auto-clears after MATH_ANIM_DURATION.
export function useMathAnimation() {
  const current = ref(null);
  let clearTimer = null;

  const clear = () => {
    current.value = null;
    if (clearTimer) {
      clearTimeout(clearTimer);
      clearTimer = null;
    }
  };

  const play = equation => {
    if (!equation || typeof equation.sum !== 'number') return;

    current.value = { ...equation, id: ++mathIdCounter };

    if (clearTimer) clearTimeout(clearTimer);
    clearTimer = setTimeout(() => {
      current.value = null;
      clearTimer = null;
    }, MATH_ANIM_DURATION);
  };

  return {
    current,
    play,
    clear,
  };
}
