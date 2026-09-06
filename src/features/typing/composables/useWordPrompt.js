import { ref, computed } from 'vue';
import {
  randomPrompt,
  emojiForPrompt,
  promptKind,
} from '@/features/typing/utils/promptWords';

/**
 * A prompt (and its matching picture) for the child to copy-type, shown above
 * the input: a word from the emoji library, a number, or a dollar amount.
 * Every one is something the app answers with an animation.
 *
 * Prompts are kept in a history rather than replaced outright, so a child can
 * step back to one they want another go at and then forward again through the
 * same ones instead of a fresh random pick.
 */
export function useWordPrompt() {
  const history = ref([randomPrompt()]);
  const cursor = ref(0);

  const promptWord = computed({
    get: () => history.value[cursor.value],
    set: word => {
      history.value[cursor.value] = word;
    },
  });
  const promptEmoji = computed(() => emojiForPrompt(promptWord.value));
  const promptType = computed(() => promptKind(promptWord.value));

  // True when there's an earlier prompt to go back to.
  const hasPreviousWord = computed(() => cursor.value > 0);

  // Whether a finished line is the prompt, typed correctly. Case is ignored
  // because caps lock changes what the same keystrokes produce.
  const matchesPromptWord = text =>
    typeof text === 'string' &&
    text.trim().toLowerCase() === promptWord.value.toLowerCase();

  // Forward: replay the next prompt already in history, or draw a fresh one.
  const nextPromptWord = () => {
    if (cursor.value < history.value.length - 1) {
      cursor.value++;
      return;
    }
    history.value.push(randomPrompt(promptWord.value));
    cursor.value++;
  };

  // Back: return to the previous prompt for another go. Returns whether it moved.
  const previousPromptWord = () => {
    if (!hasPreviousWord.value) return false;
    cursor.value--;
    return true;
  };

  return {
    promptWord,
    promptEmoji,
    promptType,
    hasPreviousWord,
    matchesPromptWord,
    nextPromptWord,
    previousPromptWord,
  };
}
