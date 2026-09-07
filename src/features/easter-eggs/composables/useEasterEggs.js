import { SPECIAL_EFFECTS } from '@/constants/emojiEasterEggs';
// This composable is a factory that takes dependencies from the caller
import { BALLOON_MAX } from '@/constants/balloons';
import { resolveWordEffect, countForWord } from '@/features/effects/utils/wordEffect';
import { findWordEmoji } from '@/features/typing/utils/wordEmoji';

// Words the balloon system owns outright — see the exception below.
const BALLOON_WORDS = ['balloon', 'balloons'];

// Build the spawn arguments (type, count, options) for a special effect. When
// `text` is provided, an embedded number (e.g. "$5") sets the count.
export function resolveSpawn(special, text = '') {
  const lower = typeof text === 'string' ? text.toLowerCase() : '';

  let count = special.count?.fallback ?? 10;
  const cap = special.count?.cap ?? 150;
  if (special.count?.numberPattern) {
    const m = lower.match(special.count.numberPattern);
    // The first group that matched holds the number, so a pattern can accept
    // the same count written more than one way ("$5" or "5$").
    const digits = m && m.slice(1).find(group => group !== undefined);
    if (digits) {
      const n = parseInt(digits, 10);
      if (!Number.isNaN(n)) count = Math.max(1, Math.min(n, cap));
    }
  }

  const emojis = special.emojis || ['✨'];
  const options = { ...special.options };
  if (Array.isArray(emojis) && emojis.length > 1) options.emojiSet = emojis;
  else if (Array.isArray(emojis) && emojis.length === 1) options.emoji = emojis[0];
  else if (typeof emojis === 'string') options.emoji = emojis;

  return { type: special.type, count, options };
}

/**
 * Play the effect a word would play if it were typed. Used by the word guide's
 * tap-to-preview, so a tap and a typed word are guaranteed to look the same.
 */
export function spawnForWord(word, spawnEmojis) {
  if (typeof spawnEmojis !== 'function') return;
  const effect = resolveWordEffect(word);
  if (!effect) return;
  spawnEmojis(effect.type, effect.count, effect.options);
}

// Evaluate a finished line and spawn whatever it earns.
export function useEasterEggs({ spawnBalloons }) {
  const evaluateEasterEggs = (text, spawnEmojis, onTrigger) => {
    if (!text || typeof text !== 'string') return false;
    const lower = text.toLowerCase();
    let triggered = false;

    // Specials first: they read punctuation a word never could.
    for (const special of SPECIAL_EFFECTS) {
      const any = special.triggersAny || [];
      const all = special.mustAlsoMatch || [];

      const anyMatch = any.length === 0 || any.some(re => re.test(lower));
      const allMatch = all.length === 0 || all.every(re => re.test(lower));
      if (!anyMatch || !allMatch) continue;

      const { type, count, options } = resolveSpawn(special, text);
      spawnEmojis(type, count, options);
      triggered = true;
    }

    // A number written against a word counts that word: "5 lions" is five
    // lions. This has to be settled before the balloon check below, which would
    // otherwise see the 5 on its own and float five balloons instead.
    if (!triggered) {
      const match = findWordEmoji(text);
      // "25 balloons" is the one exception: balloons are real, poppable objects
      // in this app, not an emoji effect, so the word belongs to the balloon
      // system and falls through to it.
      const isBalloons = match && BALLOON_WORDS.includes(match.word);
      if (match && !isBalloons && countForWord(text, match.word) !== null) {
        const effect = resolveWordEffect(text);
        spawnEmojis(effect.type, effect.count, effect.options);
        triggered = true;
        if (typeof onTrigger === 'function') onTrigger(match.word);
      }
    }

    // A bare number floats that many balloons.
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

    // Any word we have a picture for animates the way that word moves.
    if (!triggered) {
      const effect = resolveWordEffect(text);
      if (effect) {
        spawnEmojis(effect.type, effect.count, effect.options);
        triggered = true;
        if (typeof onTrigger === 'function') {
          const match = findWordEmoji(text);
          if (match) onTrigger(match.word);
        }
      }
    }

    return triggered;
  };

  return {
    evaluateEasterEggs,
  };
}
