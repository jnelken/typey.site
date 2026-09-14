import { ref } from 'vue';

let eatenIdCounter = 0;

// Holds the food currently sitting half-eaten on screen. `EatenFood.vue`
// watches `current` and draws it.
//
// It behaves like the math animation rather than like the battery: it stays up
// until the child types again, so they can look at it, and a new `id` on every
// play is what replays the bite when the same line is sent twice. The battery's
// keep-the-id trick exists because a drain is a change to a live value; a bite
// is a whole new plate.
export function useEatenFood() {
  const current = ref(null);

  const clear = () => {
    current.value = null;
  };

  const play = food => {
    if (!food || typeof food.remaining !== 'number') return;
    current.value = { ...food, id: ++eatenIdCounter };
  };

  return {
    current,
    play,
    clear,
  };
}
