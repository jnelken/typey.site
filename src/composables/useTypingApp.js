import { provide, inject } from 'vue';
import { useTypingState } from '@/features/typing/composables/useTypingState';
import { useTypingSettings } from '@/features/typing/composables/useTypingSettings';
import { useTypingEvents } from '@/features/typing/composables/useTypingEvents';
import { useTypingAPI } from '@/features/typing/composables/useTypingAPI';
import { useSound } from '@/features/audio/composables/useSound';
import { useSpeech } from '@/features/audio/composables/useSpeech';
import { useBalloons } from '@/features/effects/composables/useBalloons';
import { useEmojis } from '@/features/effects/composables/useEmojis';
import { useEasterEggs } from '@/features/easter-eggs/composables/useEasterEggs';
import { useEasterEggGuide } from '@/features/easter-eggs/composables/useEasterEggGuide';

const TYPING_APP_KEY = Symbol('typing-app');

export function createTypingApp() {
  // Initialize sub-composables
  const typingState = useTypingState();
  const typingSettings = useTypingSettings();
  const typingAPI = useTypingAPI();
  
  const soundSystem = useSound();
  const speechSystem = useSpeech();
  const balloonsSystem = useBalloons();
  const emojisSystem = useEmojis();
  const easterEggsSystem = useEasterEggs({ spawnBalloons: balloonsSystem.spawnBalloons });
  const guideSystem = useEasterEggGuide();

  // Handle Enter key press
  const handleEnterKey = async () => {
    if (typingState.currentText.value.trim()) {
      soundSystem.playEnterSound();

      const lineToSpeak = typingState.currentText.value;
      typingState.addCompletedLine(typingState.currentText.value);

      // Easter eggs guide: show on special command
      const trimmedText = typingState.currentText.value.trim();
      if (trimmedText.toLowerCase() === 'qwerty') {
        console.log('QWERTY command detected, toggling guide');
        guideSystem.toggle(true);
        typingState.clearCurrentText();
        return;
      } else {
        // Easter eggs: emoji effects based on input
        easterEggsSystem.evaluateEasterEggs(
          trimmedText,
          emojisSystem.spawnEmojis,
          egg => guideSystem.revealForEgg(egg)
        );
      }

      // Submit to API for Tidbyt companion app
      await typingAPI.submitEntry(typingState.currentText.value);

      typingState.clearCurrentText();

      if (typingSettings.isAutoSpeakEnabled.value && speechSystem.isSpeechEnabled.value) {
        speechSystem.speakLine(lineToSpeak);
      }
    }
  };

  // Initialize event handlers
  const eventHandlers = useTypingEvents({
    currentText: typingState.currentText,
    isCapsLockEnabled: typingSettings.isCapsLockEnabled,
    playKeySound: soundSystem.playKeySound,
    playEnterSound: soundSystem.playEnterSound,
    speakLetter: speechSystem.speakLetter,
    isSpeechEnabled: speechSystem.isSpeechEnabled,
    onEnterPressed: handleEnterKey,
  });

  // Wrapper functions for event handlers to include state updates
  const onInputFocus = () => {
    eventHandlers.onInputFocus(typingState.setInputFocus);
  };

  const onInputBlur = () => {
    eventHandlers.onInputBlur(typingState.setInputFocus);
  };

  const speakHistoryLine = (line) => {
    if (speechSystem.isSpeechEnabled.value && line.trim()) {
      speechSystem.speakLine(line);
    }
  };

  const initApp = () => {
    soundSystem.initAudio();
    speechSystem.initSpeech();
  };

  // Create the unified context object
  const typingApp = {
    // State from sub-composables
    ...typingState,
    ...typingSettings,
    isSoundEnabled: soundSystem.isAudioEnabled,
    isSpeechEnabled: speechSystem.isSpeechEnabled,
    currentlySpeaking: speechSystem.currentlySpeaking,
    speakingLine: speechSystem.speakingLine,
    speakingPosition: speechSystem.speakingPosition,
    speakingQueue: speechSystem.speakingQueue,
    balloons: balloonsSystem.balloons,
    emojiEffects: emojisSystem.effects,
    
    // Guide system
    guideVisible: guideSystem.guideVisible,
    allHints: guideSystem.allHints,
    discoveredHints: guideSystem.discovered,
    isHintDiscovered: guideSystem.isDiscovered,
    maskHint: guideSystem.mask,
    toggleGuide: guideSystem.toggle,

    // Methods
    onKeyDown: eventHandlers.onKeyDown,
    onInputFocus,
    onInputBlur,
    onCharacterTyped: eventHandlers.onCharacterTyped,
    toggleSound: soundSystem.toggleAudio,
    toggleSpeech: speechSystem.toggleSpeech,
    toggleAutoSpeak: typingSettings.toggleAutoSpeak,
    toggleCapsLock: typingSettings.toggleCapsLock,
    speakHistoryLine,
    spawnBalloons: balloonsSystem.spawnBalloons,
    popBalloon: balloonsSystem.popBalloon,
    clearAllBalloons: balloonsSystem.clearAllBalloons,
    spawnEmojis: emojisSystem.spawnEmojis,
    clearEmojis: emojisSystem.clearEmojis,
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
      'useTypingApp must be used within a component that provides typing app context'
    );
  }

  return typingApp;
}
