import { ref, provide, inject } from 'vue';
import { useSound } from './useSound';
import { useSpeech } from './useSpeech';
import { useBalloons } from './useBalloons';

const TYPING_APP_KEY = Symbol('typing-app');

export function createTypingApp() {
  // State
  const currentText = ref('');
  const completedLines = ref([]);
  const isInputFocused = ref(false);
  const isCapsLockEnabled = ref(true);
  const isAutoSpeakEnabled = ref(true);

  // Composables
  const {
    isAudioEnabled: isSoundEnabled,
    playKeySound,
    playEnterSound,
    toggleAudio: toggleSound,
    initAudio,
  } = useSound();

  const {
    isSpeechEnabled,
    speakLetter,
    speakLine,
    toggleSpeech,
    initSpeech,
    currentlySpeaking,
    speakingLine,
    speakingPosition,
    speakingQueue,
  } = useSpeech();

  const { balloons, spawnBalloons, popBalloon, clearAllBalloons } =
    useBalloons();

  // Methods
  const onKeyDown = async event => {
    const key = event.key;

    if (key === 'Enter') {
      event.preventDefault();
      await handleEnterKey();
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

  const submitEntry = async text => {
    try {
      const response = await fetch('/.netlify/functions/submit-entry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        console.warn('Failed to submit entry:', response.status);
      }
    } catch (error) {
      console.warn('Error submitting entry:', error);
    }
  };

  const handleEnterKey = async () => {
    if (currentText.value.trim()) {
      playEnterSound();

      const lineToSpeak = currentText.value;
      completedLines.value.push(currentText.value);

      // Check if the entered text is a number and spawn balloons
      const trimmedText = currentText.value.trim();
      const numberMatch = trimmedText.match(/^\d+$/);
      if (numberMatch) {
        const number = parseInt(numberMatch[0], 10);
        if (number >= 1) {
          spawnBalloons(Math.min(number, 100));
        }
      }

      // Submit to API for Tidbyt companion app
      await submitEntry(currentText.value);

      currentText.value = '';

      if (isAutoSpeakEnabled.value && isSpeechEnabled.value) {
        speakLine(lineToSpeak);
      }
    }
  };

  const onInputFocus = () => {
    isInputFocused.value = true;
  };

  const onInputBlur = () => {
    isInputFocused.value = false;
  };

  const toggleAutoSpeak = () => {
    isAutoSpeakEnabled.value = !isAutoSpeakEnabled.value;
  };

  const toggleCapsLock = () => {
    isCapsLockEnabled.value = !isCapsLockEnabled.value;
  };

  const speakHistoryLine = line => {
    if (isSpeechEnabled.value && line.trim()) {
      speakLine(line);
    }
  };

  const onCharacterTyped = () => {
    // Additional handling for character typing if needed
  };

  const initApp = () => {
    initAudio();
    initSpeech();
  };

  // Create the context object
  const typingApp = {
    // State
    currentText,
    completedLines,
    isInputFocused,
    isCapsLockEnabled,
    isAutoSpeakEnabled,
    isSoundEnabled,
    isSpeechEnabled,
    currentlySpeaking,
    speakingLine,
    speakingPosition,
    speakingQueue,
    balloons,

    // Methods
    onKeyDown,
    onInputFocus,
    onInputBlur,
    onCharacterTyped,
    toggleSound,
    toggleSpeech,
    toggleAutoSpeak,
    toggleCapsLock,
    speakHistoryLine,
    spawnBalloons,
    popBalloon,
    clearAllBalloons,
    initApp,
  };

  return typingApp;
}

export function provideTypingApp(typingApp) {
  provide(TYPING_APP_KEY, typingApp);
}

export function useTypingApp() {
  const typingApp = inject(TYPING_APP_KEY);

  if (!typingApp) {
    throw new Error(
      'useTypingApp must be used within a component that provides typing app context',
    );
  }

  return typingApp;
}
