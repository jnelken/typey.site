import { ref } from 'vue';
import { SUGGESTION_WORDS } from '@/features/typing/utils/wordSuggest';

/**
 * Picks a random word from the emoji word library, avoiding an immediate
 * repeat of the previous word when there's more than one word to choose from.
 */
export function randomPromptWord(exclude) {
  let word = SUGGESTION_WORDS[Math.floor(Math.random() * SUGGESTION_WORDS.length)];
  while (word === exclude && SUGGESTION_WORDS.length > 1) {
    word = SUGGESTION_WORDS[Math.floor(Math.random() * SUGGESTION_WORDS.length)];
  }
  return word;
}

/**
 * A word for the child to copy-type, shown above the input. Draws from the
 * same word list used for spelling suggestions, so every prompt is one the
 * app already knows how to speak and animate.
 */
export function useWordPrompt() {
  const promptWord = ref(randomPromptWord());

  const nextPromptWord = () => {
    promptWord.value = randomPromptWord(promptWord.value);
  };

  return {
    promptWord,
    nextPromptWord,
  };
}
