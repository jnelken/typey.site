import { ref, computed } from 'vue';
import { EASTER_EGGS } from '@/constants/emojiEasterEggs';

export function useEasterEggGuide() {
  const visible = ref(false);
  const discovered = ref(new Set());

  const allHints = computed(() => {
    const set = new Set();
    for (const egg of EASTER_EGGS) {
      const hints = egg.hints && egg.hints.length ? egg.hints : deriveHints(egg);
      for (const h of hints) set.add(h.toLowerCase());
    }
    return Array.from(set);
  });

  const deriveHints = egg => {
    const list = [];
    if (egg.triggersAny) {
      for (const re of egg.triggersAny) {
        const src = re.source.replace(/\\b/g, '');
        if (src && src !== '\\$') list.push(src.replace(/\W+/g, '').toLowerCase());
      }
    }
    return list.length ? list : [egg.id.replace(/-.*/, '')];
  };

  const revealForEgg = egg => {
    const next = new Set(discovered.value);
    const hints = egg.hints && egg.hints.length ? egg.hints : deriveHints(egg);
    for (const h of hints) next.add(h.toLowerCase());
    discovered.value = next;
  };

  const isDiscovered = hint => discovered.value.has(hint.toLowerCase());

  const mask = text =>
    text
      .split('')
      .map(ch => (/^[A-Za-z0-9]$/.test(ch) ? '_' : ch))
      .join('');

  const toggle = state => {
    visible.value = typeof state === 'boolean' ? state : !visible.value;
  };

  return {
    guideVisible: visible,
    allHints,
    discovered,
    isDiscovered,
    revealForEgg,
    mask,
    toggle,
  };
}

