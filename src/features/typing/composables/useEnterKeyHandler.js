import { spawnMoneyRain } from '@/features/easter-eggs/composables/useEasterEggs';
import { isSillyTrigger } from '@/features/easter-eggs/utils/sillyMode';
import { isColorTrigger } from '@/features/easter-eggs/utils/colorMode';
import { isPartyTrigger } from '@/features/party/utils/partyMode';
import {
  isNightTrigger,
  isNightEnterTrigger,
  isNightExitTrigger,
} from '@/features/night/utils/nightMode';
import { parseEquation } from '@/features/math/utils/parseEquation';
import { parsePercent } from '@/features/percent/utils/parsePercent';
import { parseEatenFood } from '@/features/eaten/utils/parseEatenFood';
import { EASTER_EGGS } from '@/features/analytics/easterEggs';
import { screenColorForText } from '@/features/effects/utils/screenColor';

// Dispatch completed lines in precedence order using the app's shared systems.
// Night transitions stay in the app so battery drain and Escape use the same path.
export function useEnterKeyHandler({
  typingState, typingSettings, typingAPI, wordPromptSystem,
  soundSystem, speechSystem, screenColorSystem, easterEggsSystem,
  emojisSystem, guideSystem, sillySystem, colorSystem, partySystem,
  nightSystem, mathSystem, percentSystem, eatenSystem,
  enterNight, exitNight, trackEgg,
}) {
  // Crossing the zap line is its own discovery, whichever way the battery got
  // charged — a typed "2000%" or an equation answered in percent.
  const trackBattery = () => {
    if (percentSystem.isOvercharged.value) trackEgg(EASTER_EGGS.BATTERY_OVERCHARGE);
  };

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

      const speakAndClear = () => {
        typingState.clearCurrentText();
        // Mode branches return before the auto-speak at the bottom, so say the
        // line here too — entering and leaving night alike.
        if (typingSettings.isAutoSpeakEnabled.value && speechSystem.isSpeechEnabled.value) {
          speechSystem.speakLine(lineToSpeak);
        }
      };

      // Night / light commands resolve before screen washes or ordinary word
      // effects. Whole-line "black" must open night, not wash the page slate;
      // "moon" / "sun" / "light" must not fall through to their emoji swarms.
      if (isNightTrigger(trimmedText)) {
        if (nightSystem.isActive.value) exitNight();
        else enterNight();
        speakAndClear();
        return;
      }
      if (isNightEnterTrigger(trimmedText)) {
        enterNight();
        speakAndClear();
        return;
      }
      if (isNightExitTrigger(trimmedText)) {
        exitNight();
        speakAndClear();
        return;
      }

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
        if (screenColorForText(trimmedText)) trackEgg(EASTER_EGGS.SCREEN_COLOR);
      }

      // The prompt only moves on once the word has actually been spelled
      // right — a wrong try leaves it up for another go.
      if (
        typingSettings.isWordPromptEnabled.value &&
        wordPromptSystem.matchesPromptWord(trimmedText)
      ) {
        trackEgg(EASTER_EGGS.WORD_PROMPT);
        wordPromptSystem.nextPromptWord();
      }

      // Easter eggs guide: show on special command
      if (trimmedText.toLowerCase() === 'qwerty') {
        guideSystem.toggle(true);
        trackEgg(EASTER_EGGS.WORD_GUIDE);
        typingState.clearCurrentText();
        return;
      }

      // Silly mode: "silly" starts a short run of random words, each sent on
      // its own so it animates, and typing it again stops them.
      if (isSillyTrigger(trimmedText)) {
        sillySystem.toggle();
        trackEgg(EASTER_EGGS.SILLY, { enabled: sillySystem.isActive.value });
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
        if (!nightSystem.isActive.value) {
          colorSystem.toggle();
          trackEgg(EASTER_EGGS.COLOR, { enabled: colorSystem.isActive.value });
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
        trackEgg(EASTER_EGGS.PARTY, { enabled: partySystem.isActive.value });
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
        // The operands and answer are what the child typed, so they stay here.
        trackEgg(EASTER_EGGS.MATH, {
          operation: equation.op,
          modifier: equation.modifier || 'none',
        });
        mathSystem.play(equation);
        playModifierEffect(equation);
        if (equation.modifier === '$') trackEgg(EASTER_EGGS.MONEY_RAIN);
        if (equation.modifier === '%') trackBattery();
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
        trackEgg(EASTER_EGGS.BATTERY);
        trackBattery();
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
        trackEgg(EASTER_EGGS.EATEN_FOOD);
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
        word => guideSystem.revealForWord(word),
        trackEgg
      );

      typingState.clearCurrentText();

      if (typingSettings.isAutoSpeakEnabled.value && speechSystem.isSpeechEnabled.value) {
        speechSystem.speakLine(lineToSpeak);
      }
    }
  };

  return handleEnterKey;
}
