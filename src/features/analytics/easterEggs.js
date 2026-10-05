// Stable names for every easter egg the app can play. These are what PostHog
// groups by, so renaming one splits its history in two.
export const EASTER_EGGS = Object.freeze({
  WORD_GUIDE: 'word_guide',
  SILLY: 'silly',
  COLOR: 'color',
  NIGHT: 'night',
  PARTY: 'party',
  MATH: 'math',
  BATTERY: 'battery',
  BATTERY_OVERCHARGE: 'battery_overcharge',
  EATEN_FOOD: 'eaten_food',
  MONEY_RAIN: 'money_rain',
  COUNTED_WORD: 'counted_word',
  BALLOONS: 'balloons',
  SCREEN_COLOR: 'screen_color',
  WORD_PROMPT: 'word_prompt',
});

/**
 * Report easter eggs: `easter_egg_discovered` the first time each one plays in
 * a page load, and `easter_egg_triggered` every time. Discovery is per tracker,
 * and the app makes one tracker per page load.
 */
export function createEasterEggTracker(capture) {
  const discovered = new Set();

  return (egg, properties = {}) => {
    if (!discovered.has(egg)) {
      discovered.add(egg);
      capture('easter_egg_discovered', { egg });
    }
    capture('easter_egg_triggered', { ...properties, egg });
  };
}
