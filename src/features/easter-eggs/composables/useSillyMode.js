import { ref } from 'vue';
import {
  SILLY_INTERVAL_MS,
  SILLY_MAX_WORDS,
  randomSillyWord,
} from '@/features/easter-eggs/utils/sillyMode';

/**
 * Typing "silly" starts a run of random words, each one dropped into the input
 * and sent on its own so it plays its animation. The child stays in control
 * throughout: they can type over it, type "silly" again, or press Escape to
 * stop.
 */
export function useSillyMode({
  currentText,
  isCapsLockEnabled,
  sendLine,
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

  const sendWord = () => {
    const word = pickWord(lastWord);
    if (!word) return;
    lastWord = word;
    // Caps lock is what the rest of the app types in, so a silly word matches
    // it rather than sending lowercase from an otherwise uppercase session.
    const cased = isCapsLockEnabled?.value ? word.toUpperCase() : word;
    // The word replaces the line rather than joining it. The send handler
    // clears the input only after awaiting the API call, so anything left in
    // there would ride along with the next word on a slow network — which is
    // the pile-up this mode was changed to stop doing.
    currentText.value = cased;
    wordsAdded += 1;
    // Stop before sending, so the last word of a run still goes out but the
    // timer is already cleared when it does.
    if (wordsAdded >= maxWords) stop();
    sendLine?.();
  };

  const start = () => {
    if (isActive.value) return;
    wordsAdded = 0;
    lastWord = '';
    isActive.value = true;
    timer = setInterval(sendWord, intervalMs);
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
