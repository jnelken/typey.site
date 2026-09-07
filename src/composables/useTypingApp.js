import { provide, inject } from 'vue';
import { useTypingState } from '@/features/typing/composables/useTypingState';
import { useTypingSettings } from '@/features/typing/composables/useTypingSettings';
import { useTypingEvents } from '@/features/typing/composables/useTypingEvents';
import { useTypingAPI } from '@/features/typing/composables/useTypingAPI';
import { useWordPrompt } from '@/features/typing/composables/useWordPrompt';
import { useSound } from '@/features/audio/composables/useSound';
import { useSpeech } from '@/features/audio/composables/useSpeech';
import { useBalloons } from '@/features/effects/composables/useBalloons';
import { useEmojis } from '@/features/effects/composables/useEmojis';
import { useScreenColor } from '@/features/effects/composables/useScreenColor';
import { useEasterEggs, spawnForWord } from '@/features/easter-eggs/composables/useEasterEggs';
import { useWordGuide } from '@/features/typing/composables/useWordGuide';
import { useSillyMode } from '@/features/easter-eggs/composables/useSillyMode';
import { isSillyTrigger } from '@/features/easter-eggs/utils/sillyMode';
import { useColorMode } from '@/features/easter-eggs/composables/useColorMode';
import { isColorTrigger } from '@/features/easter-eggs/utils/colorMode';
import { useMathAnimation } from '@/features/math/composables/useMathAnimation';
import { parseEquation } from '@/features/math/utils/parseEquation';

const TYPING_APP_KEY = Symbol('typing-app');

export function createTypingApp() {
  // Initialize sub-composables
  const typingState = useTypingState();
  const typingSettings = useTypingSettings();
  const typingAPI = useTypingAPI();
  const wordPromptSystem = useWordPrompt();

  const soundSystem = useSound();
  const speechSystem = useSpeech();
  const balloonsSystem = useBalloons();
  const emojisSystem = useEmojis();
  const screenColorSystem = useScreenColor();
  const easterEggsSystem = useEasterEggs({ spawnBalloons: balloonsSystem.spawnBalloons });
  const guideSystem = useWordGuide();
  const sillySystem = useSillyMode({
    currentText: typingState.currentText,
    isCapsLockEnabled: typingSettings.isCapsLockEnabled,
  });
  const colorSystem = useColorMode();
  const mathSystem = useMathAnimation();

  // Handle Enter key press
  const handleEnterKey = async () => {
    if (typingState.currentText.value.trim()) {
      soundSystem.playEnterSound();

      const lineToSpeak = typingState.currentText.value;
      typingState.addCompletedLine(typingState.currentText.value);

      const trimmedText = typingState.currentText.value.trim();

      // The screen takes its colour from the line just sent, and keeps it until
      // the next one. Decided up here so it holds for every kind of line — the
      // ones below that handle themselves and return early included.
      screenColorSystem.setScreenColorFromText(trimmedText);

      // The prompt only moves on once the word has actually been spelled
      // right — a wrong try leaves it up for another go.
      if (
        typingSettings.isWordPromptEnabled.value &&
        wordPromptSystem.matchesPromptWord(trimmedText)
      ) {
        wordPromptSystem.nextPromptWord();
      }

      // Easter eggs guide: show on special command
      if (trimmedText.toLowerCase() === 'qwerty') {
        guideSystem.toggle(true);
        typingState.clearCurrentText();
        return;
      }

      // Silly mode: "silly" starts random words landing in the input once a
      // second, and typing it again stops them.
      if (isSillyTrigger(trimmedText)) {
        sillySystem.toggle();
        typingState.clearCurrentText();
        return;
      }

      // Color mode: "color" (or "colour") paints every character a different
      // color, and typing it again puts the text back.
      if (isColorTrigger(trimmedText)) {
        colorSystem.toggle();
        typingState.clearCurrentText();
        return;
      }

      // Math: an "a + b" equation plays the count-up animation and speaks the
      // answer instead of running the usual emoji/balloon effects.
      const equation = parseEquation(trimmedText);
      if (equation) {
        mathSystem.play(equation);
        await typingAPI.submitEntry(typingState.currentText.value);
        typingState.clearCurrentText();
        if (typingSettings.isAutoSpeakEnabled.value && speechSystem.isSpeechEnabled.value) {
          const word = equation.op === '+' ? 'plus' : 'minus';
          speechSystem.speakLine(`${equation.a} ${word} ${equation.b} equals ${equation.result}`);
        }
        return;
      }

      // Easter eggs: emoji effects based on input
      easterEggsSystem.evaluateEasterEggs(
        trimmedText,
        emojisSystem.spawnEmojis,
        word => guideSystem.revealForWord(word)
      );

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
    // The math animation stays up (replayable) until the next character is typed.
    onPrintableKey: () => mathSystem.clear(),
    onEscapePressed: () => {
      sillySystem.stop();
      balloonsSystem.popAllBalloons();
    },
    onShuffleWord: () => {
      if (typingSettings.isWordPromptEnabled.value) {
        wordPromptSystem.nextPromptWord();
      }
    },
    onPreviousWord: () => {
      if (typingSettings.isWordPromptEnabled.value) {
        wordPromptSystem.previousPromptWord();
      }
    },
    // The line has already had its animation and has already gone to the
    // Tidbyt companion; editing it sends a second entry rather than undoing
    // the first. That's the honest trade for letting a typo be fixed.
    onEditLastEntry: () => {
      const line = typingState.popCompletedLine();
      if (line !== null) typingState.currentText.value = line;
    },
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

  // Play a word's effect on demand (used by the guide's tap-to-preview cards).
  // Closes the guide so the animation is visible full-screen.
  const previewWord = word => {
    guideSystem.revealForWord(word);
    guideSystem.toggle(false);
    spawnForWord(word, emojisSystem.spawnEmojis);
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
    speechDebug: speechSystem.speechDebug,
    balloons: balloonsSystem.balloons,
    emojiEffects: emojisSystem.effects,
    screenColor: screenColorSystem.screenColor,
    mathEquation: mathSystem.current,
    promptWord: wordPromptSystem.promptWord,
    promptEmoji: wordPromptSystem.promptEmoji,
    promptType: wordPromptSystem.promptType,
    hasPreviousWord: wordPromptSystem.hasPreviousWord,

    isSillyModeActive: sillySystem.isActive,
    isColorModeActive: colorSystem.isActive,

    // Word guide
    guideVisible: guideSystem.guideVisible,
    guideGroups: guideSystem.guideGroups,
    guideSecrets: guideSystem.guideSecrets,
    guideFilter: guideSystem.guideFilter,
    guideWordCount: guideSystem.guideWordCount,
    discoveredHints: guideSystem.discovered,
    isHintDiscovered: guideSystem.isDiscovered,
    toggleGuide: guideSystem.toggle,
    previewWord,

    // Methods
    onKeyDown: eventHandlers.onKeyDown,
    onInputFocus,
    onInputBlur,
    onCharacterTyped: eventHandlers.onCharacterTyped,
    toggleSound: soundSystem.toggleAudio,
    toggleSpeech: speechSystem.toggleSpeech,
    toggleAutoSpeak: typingSettings.toggleAutoSpeak,
    toggleCapsLock: typingSettings.toggleCapsLock,
    toggleEmojiMode: typingSettings.toggleEmojiMode,
    toggleWordPrompt: typingSettings.toggleWordPrompt,
    nextPromptWord: wordPromptSystem.nextPromptWord,
    previousPromptWord: wordPromptSystem.previousPromptWord,
    speakHistoryLine,
    spawnBalloons: balloonsSystem.spawnBalloons,
    popBalloon: balloonsSystem.popBalloon,
    clearAllBalloons: balloonsSystem.clearAllBalloons,
    popAllBalloons: balloonsSystem.popAllBalloons,
    spawnEmojis: emojisSystem.spawnEmojis,
    clearEmojis: emojisSystem.clearEmojis,
    resetScreenColor: screenColorSystem.resetScreenColor,
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
