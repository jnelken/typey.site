import { ref, computed } from 'vue';
import { EASTER_EGGS } from '@/constants/emojiEasterEggs';

export function useEasterEggGuide() {
  const visible = ref(false);
  const discovered = ref(new Set());

  // One readable row per effect for the menu: the word to type plus its
  // emoji(s). Deduplicated by label so effects that share a word (e.g. the
  // two "party" entries) appear once.
  const menuItems = computed(() => {
    const seen = new Set();
    const items = [];
    for (const egg of EASTER_EGGS) {
      const label = egg.example || egg.hints?.[0] || egg.id.replace(/-.*/, '');
      if (seen.has(label)) continue;
      seen.add(label);
      items.push({ label, emojis: egg.emojis || ['✨'], egg });
    }
    return items;
  });

  const revealForEgg = egg => {
    const next = new Set(discovered.value);
    const label = egg.example || egg.hints?.[0] || egg.id.replace(/-.*/, '');
    next.add(label);
    discovered.value = next;
  };

  const isDiscovered = label =>
    typeof label === 'string' && discovered.value.has(label);

  const toggle = state => {
    visible.value = typeof state === 'boolean' ? state : !visible.value;
  };

  return {
    guideVisible: visible,
    menuItems,
    discovered,
    isDiscovered,
    revealForEgg,
    toggle,
  };
}
