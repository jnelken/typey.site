import { EASTER_EGGS } from '@/constants/emojiEasterEggs';

// Evaluate text against declarative easter egg config and spawn effects
export function evaluateEasterEggs(text, spawnEmojis) {
  if (!text || typeof text !== 'string') return false;
  const lower = text.toLowerCase();
  let triggered = false;

  for (const egg of EASTER_EGGS) {
    const any = egg.triggersAny || [];
    const all = egg.mustAlsoMatch || [];

    const anyMatch = any.length === 0 || any.some(re => re.test(lower));
    const allMatch = all.length === 0 || all.every(re => re.test(lower));
    if (!anyMatch || !allMatch) continue;

    // Determine count
    let count = egg.count?.fallback ?? 10;
    let cap = egg.count?.cap ?? 150;
    if (egg.count?.numberPattern) {
      const m = lower.match(egg.count.numberPattern);
      if (m && m[1]) {
        const n = parseInt(m[1], 10);
        if (!Number.isNaN(n)) count = Math.max(1, Math.min(n, cap));
      }
    }

    // Build options
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

    spawnEmojis(egg.type, count, options);
    triggered = true;
  }
  return triggered;
}
