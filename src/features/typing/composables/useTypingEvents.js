/**
 * Keyboard event handling for typing interface
 */
export function useTypingEvents({ 
  currentText, 
  isCapsLockEnabled, 
  playKeySound, 
  playEnterSound,
  speakLetter,
  isSpeechEnabled,
  onEnterPressed 
}) {
  const onKeyDown = async (event) => {
    const key = event.key;

    if (key === 'Enter') {
      event.preventDefault();
      await onEnterPressed();
    } else if (key.length === 1) {
      if (isCapsLockEnabled.value && key.match(/[a-z]/)) {
        event.preventDefault();
        const upperKey = key.toUpperCase();
        const cursorPos = event.target.selectionStart;
        const textBefore = currentText.value.substring(0, cursorPos);
        const textAfter = currentText.value.substring(cursorPos);
        currentText.value = textBefore + upperKey + textAfter;

        // Update cursor position
        setTimeout(() => {
          if (event.target) {
            event.target.setSelectionRange(cursorPos + 1, cursorPos + 1);
          }
        }, 0);

        playKeySound(upperKey);

        if (isSpeechEnabled.value) {
          speakLetter(upperKey);
        }
      } else {
        playKeySound(key);

        if (isSpeechEnabled.value && key !== ' ') {
          speakLetter(key);
        }
      }
    }
  };

  const onInputFocus = (setInputFocus) => {
    setInputFocus(true);
  };

  const onInputBlur = (setInputFocus) => {
    setInputFocus(false);
  };

  const onCharacterTyped = () => {
    // Additional handling for character typing if needed
  };

  return {
    onKeyDown,
    onInputFocus,
    onInputBlur,
    onCharacterTyped,
  };
}