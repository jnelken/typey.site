import { ref } from 'vue';
import { FLAIRS, TRAVELLING_PATHS } from '@/features/effects/utils/wordMotion';

// How long one cycle of a repeating flourish takes, in ms. Grow and pulse are
// absent because they play once, over the effect's own duration.
const FLAIR_TEMPO = {
  spin: [4000, 9000],
  bobble: [600, 1100],
  throb: [700, 1200],
};

// How much bigger the finale's base size is than the largest regular glyph in
// its own burst (before either one's flair scales it further), capped so it
// never outgrows a phone-width screen.
const FINALE_SCALE = 1.7;
const FINALE_SIZE_CAP = 140;

let effectIdCounter = 0;

export function useEmojis() {
  const effects = ref([]);

  const addEffect = effect => {
    const id = `effect-${++effectIdCounter}`;
    const full = { id, duration: 4000, delay: 0, size: 32, ...effect };
    effects.value.push(full);

    const total = (full.duration || 4000) + (full.delay || 0) + 500;
    setTimeout(() => {
      const idx = effects.value.findIndex(e => e.id === id);
      if (idx !== -1) effects.value.splice(idx, 1);
    }, total);
  };

  const randomBetween = (min, max) => Math.random() * (max - min) + min;

  const pickDirection = options =>
    options.direction === 'left' || options.direction === 'right'
      ? options.direction
      : Math.random() > 0.5 ? 'left' : 'right';

  // A travelling glyph flips to face the way it's headed, unless it's drawn
  // to face either way already.
  const isFlipped = (type, direction, facing) =>
    TRAVELLING_PATHS.includes(type) && facing !== 'any' && facing !== direction;

  const spawnEmojis = (type, count = 10, options = {}) => {
    const emojis = options.emojiSet || [options.emoji || '✨'];
    const max = Math.min(count, options.max || 150);
    const facing = options.facing || 'left';
    const flair = FLAIRS.includes(options.flair) ? options.flair : 'none';

    const minSize = options.minSize || 24;
    const maxSize = options.maxSize || 48;
    const scaleMin = options.scaleMin ?? 1.5;
    const scaleMax = options.scaleMax ?? 3.0;
    let largestSize = 0;

    for (let i = 0; i < max; i++) {
      const emoji = emojis[Math.floor(Math.random() * emojis.length)];
      const left = `${Math.floor(randomBetween(2, 98))}%`;
      const top = `${Math.floor(randomBetween(0, 80))}%`;
      const duration = Math.floor(randomBetween(
        options.minDuration || 3500,
        options.maxDuration || 7000,
      ));
      const delay = Math.floor(randomBetween(0, options.stagger || 1000));

      // Spread sizes across the full min-max range by position in the burst,
      // then jitter each one. Independent random draws alone can cluster
      // together by chance and read as one uniform size.
      const t = max > 1 ? i / (max - 1) : 0.5;
      const jitter = (maxSize - minSize) * 0.15;
      const baseSize = Math.min(maxSize, Math.max(minSize,
        minSize + (maxSize - minSize) * t + randomBetween(-jitter, jitter)));
      const scale = Math.max(scaleMin, scaleMin + (scaleMax - scaleMin) * t + randomBetween(-0.2, 0.2));
      const size = Math.max(8, Math.floor(baseSize * scale));
      largestSize = Math.max(largestSize, size);

      const direction = pickDirection(options);
      const flairDuration = flair === 'none'
        ? 0
        : Math.floor(randomBetween(...(FLAIR_TEMPO[flair] || [duration, duration])));
      const flipped = isFlipped(type, direction, facing);

      addEffect({ type, emoji, left, top, duration, delay, size, direction, flair, flairDuration, flipped });
    }

    // A burst of one thing has no crowd for a finale to top, and a preview
    // (`options.finale === false`) deliberately skips it so a tap reads as a
    // hint rather than the real payoff.
    if (max >= 2 && options.finale !== false) {
      spawnFinale(type, options, facing, flair, largestSize);
    }
  };

  // The last glyph of the burst: the word's own emoji (never a random family
  // member, so it stays recognizable), clearly bigger than anything else in
  // the burst, timed to land as the crowd is thinning out rather than
  // dropping in after everyone's already gone. Shares the burst's own flair
  // (rather than a fixed one) so a `grow` burst's finale grows just as much
  // as the regular glyphs it needs to outsize, not by a smaller, hardcoded
  // amount.
  const spawnFinale = (type, options, facing, flair, largestSize) => {
    const emoji = options.emoji || (options.emojiSet && options.emojiSet[0]) || '✨';
    const left = `${Math.floor(randomBetween(15, 85))}%`;
    const top = `${Math.floor(randomBetween(10, 70))}%`;
    const duration = Math.floor(randomBetween(
      options.minDuration || 3500,
      options.maxDuration || 7000,
    ));
    const delay = Math.round((options.stagger || 1000) + (options.maxDuration || 7000) * 0.35);
    const base = largestSize || 32;
    const size = Math.max(base + 8, Math.min(FINALE_SIZE_CAP, Math.round(base * FINALE_SCALE)));
    const direction = pickDirection(options);
    const finaleFlair = flair === 'none' ? 'pulse' : flair;
    const flairDuration = Math.floor(randomBetween(...(FLAIR_TEMPO[finaleFlair] || [duration, duration])));
    const flipped = isFlipped(type, direction, facing);

    addEffect({ type, emoji, left, top, duration, delay, size, direction, flair: finaleFlair, flairDuration, flipped });
  };

  const clearEmojis = () => {
    effects.value = [];
  };

  return {
    effects,
    spawnEmojis,
    clearEmojis,
  };
}
