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
 */
export function useWordPrompt() {
  const promptWord = ref(randomPromptWord());
  const promptEmoji = computed(() => emojiForWord(promptWord.value));

  const nextPromptWord = () => {
    promptWord.value = randomPromptWord(promptWord.value);
  };

  return {
    promptWord,
    promptEmoji,
    nextPromptWord,
  };
}
