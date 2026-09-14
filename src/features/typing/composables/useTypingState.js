import { ref } from 'vue';

/**
 * Core typing state management
 */
export function useTypingState() {
  const currentText = ref('');
  const completedLines = ref([]);
  const isInputFocused = ref(false);

  const addCompletedLine = (line) => {
    completedLines.value.push(line);
  };

  // Take the most recent line back off the history and hand it back, so it can
  // be edited and re-sent rather than appearing twice.
  const popCompletedLine = () => {
    if (completedLines.value.length === 0) return null;
    return completedLines.value.pop();
  };

  // Take the last character back off the line — what an overcharged battery's
  // bolt does to the letter it hits. Returns the character it ate, or null if
  // the line was already empty.
  const deleteLastCharacter = () => {
    if (!currentText.value) return null;
    const last = currentText.value.slice(-1);
    currentText.value = currentText.value.slice(0, -1);
    return last;
  };

  const clearCurrentText = () => {
    currentText.value = '';
  };

  const setInputFocus = (focused) => {
    isInputFocused.value = focused;
  };

  return {
    // State
    currentText,
    completedLines,
    isInputFocused,
    
    // Actions
    addCompletedLine,
    popCompletedLine,
    deleteLastCharacter,
    clearCurrentText,
    setInputFocus,
  };
}