import { ref, computed } from 'vue';
import { SUGGESTION_WORDS } from '@/features/typing/utils/wordSuggest';
import { emojiForWord } from '@/features/typing/utils/wordEmoji';

// Only words with a matching emoji are usable prompts — the picture is what
// lets a pre-reader confirm the word without sounding it out.
const PROMPT_WORDS = SUGGESTION_WORDS.filter(word => emojiForWord(word));

/**
 * Picks a random word from the emoji word library, avoiding an immediate
 * repeat of the previous word when there's more than one word to choose from.
 */
export function randomPromptWord(exclude) {
  let word = PROMPT_WORDS[Math.floor(Math.random() * PROMPT_WORDS.length)];
  while (word === exclude && PROMPT_WORDS.length > 1) {
    word = PROMPT_WORDS[Math.floor(Math.random() * PROMPT_WORDS.length)];
  }
  return word;
}

/**
 * A word (and its matching emoji) for the child to copy-type, shown above the
 * input. Draws from the same word list used for spelling suggestions, so
 * every prompt is one the app already knows how to speak and animate.
 *
 * Words are kept in a history rather than replaced outright, so a child can
 * step back to a word they want another go at and then forward again through
 * the same words instead of a fresh random one.
 */
export function useWordPrompt() {
  const history = ref([randomPromptWord()]);
  const cursor = ref(0);

  const promptWord = computed({
    get: () => history.value[cursor.value],
    set: word => {
      history.value[cursor.value] = word;
    },
  });
  const promptEmoji = computed(() => emojiForWord(promptWord.value));

  // True when there's an earlier word to go back to.
  const hasPreviousWord = computed(() => cursor.value > 0);

  // Whether a finished line is the prompt word, typed correctly. Case is
  // ignored because caps lock changes what the same keystrokes produce.
  const matchesPromptWord = text =>
    typeof text === 'string' &&
    text.trim().toLowerCase() === promptWord.value.toLowerCase();

  // Forward: replay the next word already in history, or draw a fresh one.
  const nextPromptWord = () => {
    if (cursor.value < history.value.length - 1) {
      cursor.value++;
      return;
    }
    history.value.push(randomPromptWord(promptWord.value));
    cursor.value++;
  };

  // Back: return to the previous word for another go. Returns whether it moved.
  const previousPromptWord = () => {
    if (!hasPreviousWord.value) return false;
    cursor.value--;
    return true;
  };

  return {
    promptWord,
    promptEmoji,
    hasPreviousWord,
    matchesPromptWord,
    nextPromptWord,
    previousPromptWord,
  };
}
