import { EASTER_EGGS } from '@/constants/emojiEasterEggs';
// This composable is a factory that takes dependencies from the caller
import { BALLOON_MAX } from '@/constants/balloons';
import { resolveWordEffect } from '@/features/effects/utils/wordEffect';

// Build the spawn arguments (type, count, options) for an egg. When `text` is
// provided, an embedded number (e.g. "5 lions") overrides the fallback count.
// Shared by live evaluation and the guide's tap-to-preview.
export function resolveSpawn(egg, text = '') {
  const lower = typeof text === 'string' ? text.toLowerCase() : '';

  let count = egg.count?.fallback ?? 10;
  const cap = egg.count?.cap ?? 150;
  if (egg.count?.numberPattern) {
    const m = lower.match(egg.count.numberPattern);
    if (m && m[1]) {
      const n = parseInt(m[1], 10);
      if (!Number.isNaN(n)) count = Math.max(1, Math.min(n, cap));
    }
  }

  const emojis = egg.emojis || ['✨'];
  const options = { ...egg.options };
  if (Array.isArray(emojis) && emojis.length > 1) options.emojiSet = emojis;
  else if (Array.isArray(emojis) && emojis.length === 1) options.emoji = emojis[0];
  else if (typeof emojis === 'string') options.emoji = emojis;

  // Direction handling for run animation
  if (egg.type === 'run') {
    const dir = egg.options?.direction;
    if (dir === 'left' || dir === 'right') options.direction = dir;
    else options.direction = Math.random() > 0.5 ? 'left' : 'right';
  }

  return { type: egg.type, count, options };
}

// Spawn a single egg's effect immediately (used by the guide preview).
export function spawnForEgg(egg, spawnEmojis, text = '') {
  if (!egg || typeof spawnEmojis !== 'function') return;
  const { type, count, options } = resolveSpawn(egg, text);
  spawnEmojis(type, count, options);
}

// Evaluate text against declarative easter egg config and spawn effects
export function useEasterEggs({ spawnBalloons }) {
  const evaluateEasterEggs = (text, spawnEmojis, onTrigger) => {
    if (!text || typeof text !== 'string') return false;
    const lower = text.toLowerCase();
    let triggered = false;

    for (const egg of EASTER_EGGS) {
      const any = egg.triggersAny || [];
      const all = egg.mustAlsoMatch || [];

      const anyMatch = any.length === 0 || any.some(re => re.test(lower));
      const allMatch = all.length === 0 || all.every(re => re.test(lower));
      if (!anyMatch || !allMatch) continue;

      const { type, count, options } = resolveSpawn(egg, text);
      spawnEmojis(type, count, options);
      triggered = true;
      if (typeof onTrigger === 'function') onTrigger(egg);
    }

    // If no easter egg triggered, consider spawning balloons from a bare number
    if (!triggered) {
      const parts = text.split(/\s+/); // Split by whitespace
      for (const part of parts) {
        const numberMatch = part.match(/^\d+$/);
        if (numberMatch) {
          const number = parseInt(numberMatch[0], 10);
          if (number >= 1) {
            spawnBalloons(Math.min(number, BALLOON_MAX));
            triggered = true;
            break; // Only spawn balloons for the first number found
          }
        }
      }
    }

    // Last resort: any word we have a picture for still animates, so words
    // without a hand-written easter egg don't land silently.
    if (!triggered) {
      const effect = resolveWordEffect(text);
      if (effect) {
        spawnEmojis(effect.type, effect.count, effect.options);
        triggered = true;
      }
    }

    return triggered;
  };

  return {
    evaluateEasterEggs,
  };
}
