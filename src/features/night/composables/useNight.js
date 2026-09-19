import { ref } from 'vue';
import { STAR_COUNT, starField } from '@/features/night/utils/nightMode';

// The class the night palette hangs off, the way the blackout hangs off
// `battery-dead`. Put on the document root rather than a component, because the
// ground shows through in several places at once — the page, the input strip,
// the help pill — and they all already read the same custom properties.
export const NIGHT_CLASS = 'goodnight';

const syncNightDom = active => {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle(NIGHT_CLASS, active);
};

/**
 * Goodnight: the dark theme, its sky, and the two ways out of it.
 *
 * The sky is generated once when the night starts and held until it ends, so
 * the stars stay where they were put instead of jumping on every re-render. A
 * fresh seed per night means saying goodnight twice gives two different skies.
 *
 * The seed comes in as a function so a spec can pin it; nothing else about
 * this needs a clock or a window.
 */
export function useNight({ nextSeed = () => Date.now(), count = STAR_COUNT } = {}) {
  const isActive = ref(false);
  const stars = ref([]);

  const start = () => {
    if (isActive.value) return;
    stars.value = starField(count, { seed: nextSeed() });
    isActive.value = true;
    syncNightDom(true);
  };

  // Taking the stars down with the night matters for the same reason Party
  // Mode clears its confetti: a sky left hanging over a daylit page reads as
  // the page being stuck rather than as an effect that ended.
  const stop = () => {
    if (!isActive.value) return;
    isActive.value = false;
    stars.value = [];
    syncNightDom(false);
  };

  const toggle = () => {
    if (isActive.value) stop();
    else start();
  };

  return { isActive, stars, start, stop, toggle };
}
