import { provide, inject } from 'vue';
import { useTypingState } from '@/features/typing/composables/useTypingState';
import { useTypingSettings } from '@/features/typing/composables/useTypingSettings';
import { useTypingEvents } from '@/features/typing/composables/useTypingEvents';
import { useTypingAPI } from '@/features/typing/composables/useTypingAPI';
import { useEnterKeyHandler } from '@/features/typing/composables/useEnterKeyHandler';
import { useWordPrompt } from '@/features/typing/composables/useWordPrompt';
import { useSound } from '@/features/audio/composables/useSound';
import { useSpeech } from '@/features/audio/composables/useSpeech';
import { useBalloons } from '@/features/effects/composables/useBalloons';
import { useEmojis } from '@/features/effects/composables/useEmojis';
import { useScreenColor } from '@/features/effects/composables/useScreenColor';
import { useEasterEggs, spawnForWord } from '@/features/easter-eggs/composables/useEasterEggs';
import { useWordGuide } from '@/features/typing/composables/useWordGuide';
import { useSillyMode } from '@/features/easter-eggs/composables/useSillyMode';
import { useColorMode } from '@/features/easter-eggs/composables/useColorMode';
import { useParty } from '@/features/party/composables/useParty';
import { useNight } from '@/features/night/composables/useNight';
import { useMathAnimation } from '@/features/math/composables/useMathAnimation';
import { usePercentAnimation } from '@/features/percent/composables/usePercentAnimation';
import { useZaps } from '@/features/percent/composables/useZaps';
import { useEatenFood } from '@/features/eaten/composables/useEatenFood';
import { capture } from '@/features/analytics/analytics';
import { createEasterEggTracker, EASTER_EGGS } from '@/features/analytics/easterEggs';

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
    // Each silly word goes out as if it had been typed and entered, which is
    // what gives it its animation. `handleEnterKey` is declared just below;
    // a run only ever calls this from a timer, long after that.
    sendLine: () => handleEnterKey(),
  });
  const colorSystem = useColorMode();
  const partySystem = useParty();
  const nightSystem = useNight();
  const trackEgg = createEasterEggTracker(capture);

  // One entry path for every way into night — goodnight, black/moon/night,
  // typed 0%, drain-to-zero, equation zero — so Color Mode and screen washes
  // always clear the same way. Idempotent: already-night is a no-op (and does
  // not re-fire analytics).
  const enterNight = () => {
    const already = nightSystem.isActive.value;
    nightSystem.start();
    colorSystem.stop();
    // Hands `--color-background` back to the stylesheet so the night class
    // governs it. `resetScreenColor` would not do: it writes the daylight hex
    // inline, and inline beats a class.
    screenColorSystem.clearScreenColor();
    if (!already) trackEgg(EASTER_EGGS.NIGHT, { enabled: true });
  };

  const exitNight = () => {
    if (!nightSystem.isActive.value) return;
    nightSystem.stop();
    screenColorSystem.resetScreenColor();
    trackEgg(EASTER_EGGS.NIGHT, { enabled: false });
  };

  const mathSystem = useMathAnimation();
  // Empty charge opens night rather than a separate blackout. Drain already at
  // 0% does not call onEmpty again, so a daylight exit or Escape cannot be
  // undone by the next keystroke while the battery still reads zero.
  const percentSystem = usePercentAnimation({ onEmpty: enterNight });
  const eatenSystem = useEatenFood();
  // Past 1000% the battery is dangerous: each keystroke may fire a bolt that
  // eats the letter it hit. Misses spend charge with no bolt and no zap sound.
  const zapSystem = useZaps({ onStrike: () => typingState.deleteLastCharacter() });

  const handleEnterKey = useEnterKeyHandler({
    typingState, typingSettings, typingAPI, wordPromptSystem,
    soundSystem, speechSystem, screenColorSystem, easterEggsSystem,
    emojisSystem, guideSystem, sillySystem, colorSystem, partySystem,
    nightSystem, mathSystem, percentSystem, eatenSystem,
    enterNight, exitNight, trackEgg,
  });

  // Initialize event handlers
  const eventHandlers = useTypingEvents({
    currentText: typingState.currentText,
    isCapsLockEnabled: typingSettings.isCapsLockEnabled,
    playKeySound: soundSystem.playKeySound,
    playEnterSound: soundSystem.playEnterSound,
    speakLetter: speechSystem.speakLetter,
    isSpeechEnabled: speechSystem.isSpeechEnabled,
    onEnterPressed: handleEnterKey,
    // The math animation stays up (replayable) until the next character. The
    // battery is the opposite: it docks and stays, and every keystroke costs it
    // a point of charge — the whole point is watching it run down as you type.
    onPrintableKey: () => {
      mathSystem.clear();
      eatenSystem.clear();
      partySystem.burstAtLetter();
      // An overcharge spends itself 100% a keystroke instead of a point at a
      // time. Only about one in five attempts hits — a hit shows a bolt and
      // eats the letter; a miss spends charge with neither. It stops on its
      // own once the charge falls back under the line.
      if (percentSystem.zap()) {
        const { hit } = zapSystem.strike();
        if (hit) soundSystem.playZapSound();
      } else {
        percentSystem.drain();
      }
    },
    onEscapePressed: () => {
      sillySystem.stop();
      partySystem.stop();
      exitNight();
      balloonsSystem.popAllBalloons();
      percentSystem.clear();
      zapSystem.clear();
      eatenSystem.clear();
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
    // Tidbyt display; editing it sends a second entry rather than undoing
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

  // A tap on the prompt plays a small preview of its animation — a handful of
  // emojis rather than the dozen-plus a typed line earns, and without the
  // finale glyph, so it reads as a hint and not the real payoff.
  const PREVIEW_EMOJI_COUNT = 5;

  const previewWord = word => {
    guideSystem.revealForWord(word);
    spawnForWord(word, emojisSystem.spawnEmojis, { count: PREVIEW_EMOJI_COUNT, finale: false });
  };

  // Tapping a word guide card sets it as the prompt to copy-type, and closes
  // the guide so the prompt is visible.
  const setPromptWord = word => {
    wordPromptSystem.promptWord.value = word;
    guideSystem.toggle(false);
  };

  const initApp = () => {
    soundSystem.initAudio();
    speechSystem.initSpeech();
  };

  const toggleSetting = (setting, toggle, enabled) => {
    toggle();
    capture('setting_changed', { setting, enabled: enabled.value });
  };

  const trackControl = control => capture('control_used', { control });

  const toggleGuide = state => {
    guideSystem.toggle(state);
    if (state === true) trackControl('word_guide');
  };

  const openSecretWords = () => {
    guideSystem.openSecrets();
    trackControl('secret_words');
  };

  const toggleSound = () =>
    toggleSetting('sound', soundSystem.toggleAudio, soundSystem.isAudioEnabled);
  const toggleSpeech = () =>
    toggleSetting('speech', speechSystem.toggleSpeech, speechSystem.isSpeechEnabled);
  const toggleAutoSpeak = () =>
    toggleSetting('auto_speak', typingSettings.toggleAutoSpeak, typingSettings.isAutoSpeakEnabled);
  const toggleCapsLock = () =>
    toggleSetting('caps_lock', typingSettings.toggleCapsLock, typingSettings.isCapsLockEnabled);
  const toggleEmojiMode = () =>
    toggleSetting('emoji_mode', typingSettings.toggleEmojiMode, typingSettings.isEmojiModeEnabled);
  const toggleWordPrompt = () =>
    toggleSetting('word_prompt', typingSettings.toggleWordPrompt, typingSettings.isWordPromptEnabled);

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
    batteryCharge: percentSystem.current,
    eatenFood: eatenSystem.current,
    isBatteryOvercharged: percentSystem.isOvercharged,
    zapBolts: zapSystem.bolts,
    promptWord: wordPromptSystem.promptWord,
    promptEmoji: wordPromptSystem.promptEmoji,
    promptType: wordPromptSystem.promptType,
    hasPreviousWord: wordPromptSystem.hasPreviousWord,

    isSillyModeActive: sillySystem.isActive,
    isColorModeActive: colorSystem.isActive,
    isPartyModeActive: partySystem.isActive,
    partyBursts: partySystem.bursts,
    isNightModeActive: nightSystem.isActive,
    nightStars: nightSystem.stars,

    // Word guide
    guideVisible: guideSystem.guideVisible,
    guideGroups: guideSystem.guideGroups,
    guideSecrets: guideSystem.guideSecrets,
    guideFilter: guideSystem.guideFilter,
    guideWordCount: guideSystem.guideWordCount,
    guideSecretsOnly: guideSystem.guideSecretsOnly,
    discoveredHints: guideSystem.discovered,
    isHintDiscovered: guideSystem.isDiscovered,
    toggleGuide,
    openSecretWords,
    trackControl,
    previewWord,
    setPromptWord,

    // Methods
    onKeyDown: eventHandlers.onKeyDown,
    onInputFocus,
    onInputBlur,
    onCharacterTyped: eventHandlers.onCharacterTyped,
    toggleSound,
    toggleSpeech,
    toggleAutoSpeak,
    toggleCapsLock,
    toggleEmojiMode,
    toggleWordPrompt,
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
    clearScreenColor: screenColorSystem.clearScreenColor,
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
