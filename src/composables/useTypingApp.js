import { ref, provide, inject } from 'vue';
import { useSound } from './useSound';
import { useSpeech } from './useSpeech';
import { useBalloons } from './useBalloons';
import { useEmojis } from './useEmojis';
import { useEasterEggs } from './useEasterEggs';
import { useEasterEggGuide } from './useEasterEggGuide';

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
  const { effects: emojiEffects, spawnEmojis, clearEmojis } = useEmojis();
  const { evaluateEasterEggs } = useEasterEggs({ spawnBalloons });
  const guide = useEasterEggGuide();

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

      // Easter eggs guide: show on special command
      const trimmedText = currentText.value.trim();
      if (trimmedText.toLowerCase() === 'qwerty') {
        console.log('QWERTY command detected, toggling guide');
        guide.toggle(true);
        // Clear input and skip network/speech/eggs for this command
        currentText.value = '';
        return;
      } else {
        // Easter eggs: emoji effects based on input (declarative rules)
        evaluateEasterEggs(trimmedText, spawnEmojis, egg =>
          guide.revealForEgg(egg),
        );
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
    emojiEffects,
    // Guide
    guideVisible: guide.guideVisible,
    allHints: guide.allHints,
    discoveredHints: guide.discovered,
    isHintDiscovered: guide.isDiscovered,
    maskHint: guide.mask,
    toggleGuide: guide.toggle,

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
    spawnEmojis,
    clearEmojis,
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
