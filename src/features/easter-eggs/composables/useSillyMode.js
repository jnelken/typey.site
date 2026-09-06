import { ref } from 'vue';
import {
  SILLY_INTERVAL_MS,
  SILLY_MAX_WORDS,
  appendSillyWord,
  randomSillyWord,
} from '@/features/easter-eggs/utils/sillyMode';

/**
 * Typing "silly" starts a run of random words landing in the input, one a
 * second. The child stays in control throughout: they can keep typing, press
 * Enter to send the line (and set off its animation), type "silly" again, or
 * press Escape to stop.
 */
export function useSillyMode({
  currentText,
  isCapsLockEnabled,
  pickWord = randomSillyWord,
  intervalMs = SILLY_INTERVAL_MS,
  maxWords = SILLY_MAX_WORDS,
}) {
  const isActive = ref(false);
  let timer = null;
  let lastWord = '';
  let wordsAdded = 0;

  const stop = () => {
    if (timer !== null) {
      clearInterval(timer);
      timer = null;
    }
    isActive.value = false;
  };

  const addWord = () => {
    const word = pickWord(lastWord);
    if (!word) return;
    lastWord = word;
    // Caps lock is what the rest of the app types in, so a silly word matches
    // it rather than dropping lowercase into an otherwise uppercase line.
    const cased = isCapsLockEnabled?.value ? word.toUpperCase() : word;
    currentText.value = appendSillyWord(currentText.value, cased);
    wordsAdded += 1;
    if (wordsAdded >= maxWords) stop();
  };

  const start = () => {
    if (isActive.value) return;
    wordsAdded = 0;
    lastWord = '';
    isActive.value = true;
    timer = setInterval(addWord, intervalMs);
  };

  const toggle = () => {
    if (isActive.value) stop();
    else start();
  };

  return {
    isActive,
    start,
    stop,
    toggle,
  };
}
