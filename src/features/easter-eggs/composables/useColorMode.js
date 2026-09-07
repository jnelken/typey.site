import { ref } from 'vue';

/**
 * Color mode is a display skin toggled by typing its trigger word: on once,
 * off again. Unlike emoji mode it is an easter egg rather than a setting, so
 * it is deliberately not persisted — a refresh brings back plain text, and
 * the surprise stays a surprise.
 */
export function useColorMode() {
  const isActive = ref(false);

  const start = () => {
    isActive.value = true;
  };

  const stop = () => {
    isActive.value = false;
  };

  const toggle = () => {
    isActive.value = !isActive.value;
  };

  return { isActive, start, stop, toggle };
}
