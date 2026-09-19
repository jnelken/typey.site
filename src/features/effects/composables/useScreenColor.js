import { ref } from 'vue';
import {
  screenColorForText,
  DEFAULT_SCREEN_COLOR,
} from '@/features/effects/utils/screenColor';

/**
 * The colour of the page itself, set by whatever the last submitted line named.
 *
 * Every submission decides it, so the wash lasts exactly until the next one:
 * type "blue" and the screen is blue until the next line, whether that line
 * names another colour or nothing at all.
 *
 * It writes `--color-background` on the document root rather than being bound
 * to one element, because the ground shows through several places at once —
 * the page, the input strip along the bottom, the help pill — and they all
 * already read that variable.
 */
export function useScreenColor() {
  const current = ref(DEFAULT_SCREEN_COLOR);

  const apply = color => {
    current.value = color;
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--color-background', color);
    }
  };

  /** Set the wash from a finished line. Returns the colour it settled on. */
  const setFromText = text => {
    apply(screenColorForText(text) ?? DEFAULT_SCREEN_COLOR);
    return current.value;
  };

  const reset = () => apply(DEFAULT_SCREEN_COLOR);

  /**
   * Hand `--color-background` back to the stylesheet.
   *
   * `reset` is not the same thing and cannot stand in for it: it writes the
   * daylight hex *inline* on the root, and an inline custom property beats any
   * class rule. A theme that re-points the ground from a class on <html> —
   * Goodnight does — would be silently overridden by a page that had ever been
   * washed a colour. Removing the property is the only way the class wins.
   */
  const clear = () => {
    current.value = DEFAULT_SCREEN_COLOR;
    if (typeof document !== 'undefined') {
      document.documentElement.style.removeProperty('--color-background');
    }
  };

  return {
    screenColor: current,
    setScreenColorFromText: setFromText,
    resetScreenColor: reset,
    clearScreenColor: clear,
  };
}
