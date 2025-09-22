import { ref } from 'vue';

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

  const spawnEmojis = (type, count = 10, options = {}) => {
    const emojis = options.emojiSet || [options.emoji || '✨'];
    const max = Math.min(count, options.max || 150);

    for (let i = 0; i < max; i++) {
      const emoji = emojis[Math.floor(Math.random() * emojis.length)];
      const left = `${Math.floor(randomBetween(2, 98))}%`;
      const top = `${Math.floor(randomBetween(0, 80))}%`;
      const duration = Math.floor(randomBetween(
        options.minDuration || 3500,
        options.maxDuration || 7000,
      ));
      const delay = Math.floor(randomBetween(0, options.stagger || 1000));
      // Base size, then scale 1.5x–3x (configurable)
      const baseSize = Math.floor(
        randomBetween(options.minSize || 24, options.maxSize || 48),
      );
      const scaleMin = options.scaleMin ?? 1.5;
      const scaleMax = options.scaleMax ?? 3.0;
      const scale = randomBetween(scaleMin, scaleMax);
      const size = Math.max(8, Math.floor(baseSize * scale));

      const direction = options.direction === 'left' || options.direction === 'right'
        ? options.direction
        : Math.random() > 0.5 ? 'left' : 'right';

      addEffect({ type, emoji, left, top, duration, delay, size, direction });
    }
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
