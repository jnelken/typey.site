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
    clearCurrentText,
    setInputFocus,
  };
}