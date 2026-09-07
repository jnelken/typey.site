import { ref, computed } from 'vue';
import {
  WORD_CATEGORIES,
  CATEGORY_LABELS,
} from '@/features/typing/utils/wordEmoji';

// The handful of things that aren't words in the dictionary and so have no card
// of their own: a mode you switch on, a sum, an amount of money. Listed so a
// child (or a parent) can find them again without remembering them.
export const SECRET_WORDS = Object.freeze([
  { word: '$5', emoji: '💵', description: 'Rains one bill per dollar' },
  { word: '2 + 3', emoji: '🔢', description: 'Counts out the answer' },
  { word: 'silly', emoji: '🤪', description: 'Types random words for you' },
  { word: 'color', emoji: '🌈', description: 'Paints every letter a colour' },
  { word: 'qwerty', emoji: '✨', description: 'Opens this list' },
]);

/**
 * The word guide: the whole typing dictionary, browsable, grouped the way the
 * dictionary itself is grouped.
 *
 * It used to list 28 hand-written "magic words" — a separate dataset from the
 * ~600 words the prompts drew on, so most of what the app could do was
 * invisible. There is one list now, and this is a view of it.
 */
export function useWordGuide() {
  const visible = ref(false);
  const discovered = ref(new Set());
  const filter = ref('');

  // Every word, grouped by category, filtered by what's typed in the search
  // box. Empty groups drop out so the list doesn't leave holes.
  const groups = computed(() => {
    const needle = filter.value.trim().toLowerCase();

    return Object.entries(WORD_CATEGORIES)
      .map(([category, words]) => ({
        category,
        label: CATEGORY_LABELS[category] ?? category,
        items: Object.entries(words)
          .filter(([word]) => !needle || word.includes(needle))
          .map(([word, emoji]) => ({ word, emoji })),
      }))
      .filter(group => group.items.length > 0);
  });

  // The secrets are filtered by the same search box, and sit in their own group
  // at the end rather than inside a category they don't belong to.
  const secrets = computed(() => {
    const needle = filter.value.trim().toLowerCase();
    return SECRET_WORDS.filter(item => !needle || item.word.toLowerCase().includes(needle));
  });

  const wordCount = computed(() =>
    groups.value.reduce((total, group) => total + group.items.length, 0),
  );

  const revealForWord = word => {
    if (typeof word !== 'string') return;
    const next = new Set(discovered.value);
    next.add(word.toLowerCase());
    discovered.value = next;
  };

  const isDiscovered = word =>
    typeof word === 'string' && discovered.value.has(word.toLowerCase());

  const toggle = state => {
    visible.value = typeof state === 'boolean' ? state : !visible.value;
    // A stale filter would hide most of the list next time it opens.
    if (!visible.value) filter.value = '';
  };

  return {
    guideVisible: visible,
    guideGroups: groups,
    guideSecrets: secrets,
    guideFilter: filter,
    guideWordCount: wordCount,
    discovered,
    isDiscovered,
    revealForWord,
    toggle,
  };
}
