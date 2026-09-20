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
import {
  useEasterEggs,
  spawnForWord,
  spawnMoneyRain,
} from '@/features/easter-eggs/composables/useEasterEggs';
import { useWordGuide } from '@/features/typing/composables/useWordGuide';
import { useSillyMode } from '@/features/easter-eggs/composables/useSillyMode';
import { isSillyTrigger } from '@/features/easter-eggs/utils/sillyMode';
import { useColorMode } from '@/features/easter-eggs/composables/useColorMode';
import { isColorTrigger } from '@/features/easter-eggs/utils/colorMode';
import { useParty } from '@/features/party/composables/useParty';
import { isPartyTrigger } from '@/features/party/utils/partyMode';
import { useNight } from '@/features/night/composables/useNight';
import { isNightTrigger } from '@/features/night/utils/nightMode';
import { useMathAnimation } from '@/features/math/composables/useMathAnimation';
import { parseEquation } from '@/features/math/utils/parseEquation';
import { usePercentAnimation } from '@/features/percent/composables/usePercentAnimation';
import { useZaps } from '@/features/percent/composables/useZaps';
import { parsePercent } from '@/features/percent/utils/parsePercent';
import { useEatenFood } from '@/features/eaten/composables/useEatenFood';
import { parseEatenFood } from '@/features/eaten/utils/parseEatenFood';

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
  const mathSystem = useMathAnimation();
  const percentSystem = usePercentAnimation();
  const eatenSystem = useEatenFood();
  // Past 1000% the battery is dangerous: each keystroke is struck by a bolt off
  // the electrified frame, which eats the letter it hit.
  const zapSystem = useZaps({ onStrike: () => typingState.deleteLastCharacter() });

  // An equation's modifier plays on the answer: "2 + 3$" rains five bills,
  // "2 + 3%" charges the battery to five percent. The dot animation still runs
  // underneath — the modifier says what the dots are worth, not what replaces
  // them.
  const playModifierEffect = equation => {
    if (equation.modifier === '$') spawnMoneyRain(equation.result, emojisSystem.spawnEmojis);
    if (equation.modifier === '%') percentSystem.play({ percent: equation.result });
  };

  const spokenAnswer = equation => {
    const { result, modifier } = equation;
    if (modifier === '$') return `${result} ${result === 1 ? 'dollar' : 'dollars'}`;
    if (modifier === '%') return `${result} percent`;
    return `${result}`;
  };

  // Handle Enter key press
  const handleEnterKey = async () => {
    if (typingState.currentText.value.trim()) {
      soundSystem.playEnterSound();

      const lineToSpeak = typingState.currentText.value;
      typingState.addCompletedLine(typingState.currentText.value);

      const trimmedText = typingState.currentText.value.trim();

      // Every completed line goes to the local Tidbyt bridge exactly once,
      // including commands and special effects that return early below. This
      // stays fire-and-forget so a slow device never delays Typey's effects.
      void typingAPI.submitEntry(lineToSpeak);

      // The screen takes its colour from the line just sent, and keeps it until
      // the next one. Decided up here so it holds for every kind of line — the
      // ones below that handle themselves and return early included.
      //
      // Except at night. The washes in `screenColor.js` are pale grounds chosen
      // to keep near-black text readable; on the night sky they would be the
      // brightest thing on screen, and the dark text tokens they were checked
      // against are not the ones in use. Same call as Color Mode's, and made
      // for the same reason — DEV-54 settled both.
      if (!nightSystem.isActive.value) {
        screenColorSystem.setScreenColorFromText(trimmedText);
      }

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

      // Silly mode: "silly" starts a short run of random words, each sent on
      // its own so it animates, and typing it again stops them.
      if (isSillyTrigger(trimmedText)) {
        sillySystem.toggle();
        typingState.clearCurrentText();
        return;
      }

      // Color mode: "color" (or "colour") paints every character a different
      // color, and typing it again puts the text back.
      //
      // It stays off while the night is on. The seven hues are contrast-checked
      // against the light page only (`tests/unit/colorMode.spec.js`) and every
      // one of them fails AA on the indigo ground, so the line still clears —
      // it just doesn't light the palette up.
      if (isColorTrigger(trimmedText)) {
        if (!nightSystem.isActive.value) colorSystem.toggle();
        typingState.clearCurrentText();
        return;
      }

      // Goodnight: the page goes to bed — indigo ground, a moon, and a sky full
      // of stars. Typing it again wakes it up. Color Mode goes off on the way
      // in rather than being left on over a palette it can't be read against.
      if (isNightTrigger(trimmedText)) {
        nightSystem.toggle();
        if (nightSystem.isActive.value) {
          colorSystem.stop();
          // Hands `--color-background` back to the stylesheet so the night
          // class governs it. `resetScreenColor` would not do: it writes the
          // daylight hex inline, and inline beats a class.
          screenColorSystem.clearScreenColor();
        } else {
          screenColorSystem.resetScreenColor();
        }
        typingState.clearCurrentText();
        return;
      }

      // Party mode: "party" turns every keystroke into confetti, and typing it
      // again turns it back off. The word is a real dictionary entry (🎉🎊), so
      // this *changes* what it does rather than adding to it — the same trade
      // "% 50" made when it stopped floating fifty balloons.
      if (isPartyTrigger(trimmedText)) {
        partySystem.toggle();
        typingState.clearCurrentText();
        return;
      }

      // Finishing a line during a party sprays confetti in off both edges.
      // Sits below the mode triggers and above everything else, so it holds for
      // every line that actually says something — unlike the screen colour,
      // which is set above the triggers and so holds for those too. A mode
      // switch is not a line worth celebrating, and `party` itself already
      // sprays on the way in.
      partySystem.burstFromEdges();

      // Math: an "a + b" equation plays the count-up animation and speaks the
      // answer instead of running the usual emoji/balloon effects. A "$" or "%"
      // written on either side says what the answer *is*, so the answer also
      // plays that modifier's own effect — bills raining, or a battery charged.
      const equation = parseEquation(trimmedText);
      if (equation) {
        mathSystem.play(equation);
        playModifierEffect(equation);
        typingState.clearCurrentText();
        if (typingSettings.isAutoSpeakEnabled.value && speechSystem.isSpeechEnabled.value) {
          const word = equation.op === '+' ? 'plus' : 'minus';
          speechSystem.speakLine(
            `${equation.a} ${word} ${equation.b} equals ${spokenAnswer(equation)}`
          );
        }
        return;
      }

      // Percent: "50%" or "%50" draws a battery charged that much, and speaks
      // the amount instead of running the usual emoji/balloon effects.
      const percent = parsePercent(trimmedText);
      if (percent) {
        percentSystem.play(percent);
        typingState.clearCurrentText();
        if (typingSettings.isAutoSpeakEnabled.value && speechSystem.isSpeechEnabled.value) {
          speechSystem.speakLine(`${percent.percent} percent`);
        }
        return;
      }

      // A percent written against something edible eats that much of it:
      // "50% cookie" leaves half a cookie. Sits below the percent check
      // because a bare "50%" is the battery's, and below the equation check
      // because both of those are anchored to the whole line and this is not.
      // Non-food words return null here and fall through to the animation
      // they already had, so "50% lion" is still a pride of lions.
      const eaten = parseEatenFood(trimmedText);
      if (eaten) {
        eatenSystem.play(eaten);
        typingState.clearCurrentText();
        if (typingSettings.isAutoSpeakEnabled.value && speechSystem.isSpeechEnabled.value) {
          speechSystem.speakLine(`${eaten.percent} percent ${eaten.word}`);
        }
        return;
      }

      // Easter eggs: emoji effects based on input
      easterEggsSystem.evaluateEasterEggs(
        trimmedText,
        emojisSystem.spawnEmojis,
        word => guideSystem.revealForWord(word)
      );

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
    // The math animation stays up (replayable) until the next character. The
    // battery is the opposite: it docks and stays, and every keystroke costs it
    // a point of charge — the whole point is watching it run down as you type.
    onPrintableKey: () => {
      mathSystem.clear();
      eatenSystem.clear();
      partySystem.burstAtLetter();
      // An overcharge spends itself a bolt at a time instead of a point at a
      // time. Bolts miss often — only about one in five eats the letter just
      // typed. It stops on its own once the charge falls back under the line.
      if (percentSystem.zap()) {
        zapSystem.strike();
        soundSystem.playZapSound();
      } else {
        percentSystem.drain();
      }
    },
    onEscapePressed: () => {
      sillySystem.stop();
      partySystem.stop();
      if (nightSystem.isActive.value) {
        nightSystem.stop();
        screenColorSystem.resetScreenColor();
      }
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
    batteryPowerState: percentSystem.powerState,
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
    toggleGuide: guideSystem.toggle,
    openSecretWords: guideSystem.openSecrets,
    previewWord,
    setPromptWord,

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
