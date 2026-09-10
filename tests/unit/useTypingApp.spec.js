import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { createTypingApp } from '@/composables/useTypingApp';
import { SILLY_WORDS } from '@/features/easter-eggs/utils/sillyMode';

describe('useTypingApp', () => {
  let typingApp;

  beforeEach(() => {
    jest.clearAllMocks();
    typingApp = createTypingApp();
  });

  describe('initialization', () => {
    it('should initialize with default state', () => {
      expect(typingApp.currentText.value).toBe('');
      expect(typingApp.completedLines.value).toEqual([]);
      expect(typingApp.isInputFocused.value).toBe(false);
      // Caps Lock defaults to enabled in this app
      expect(typingApp.isCapsLockEnabled.value).toBe(true);
      expect(typingApp.isAutoSpeakEnabled.value).toBe(true);
      expect(typingApp.isSoundEnabled.value).toBe(true);
      expect(typingApp.isSpeechEnabled.value).toBe(true);
    });
  });

  describe('text input handling', () => {
    it('should insert uppercase letters when Caps Lock is enabled', () => {
      const event = {
        key: 'a',
        preventDefault: jest.fn(),
        target: {
          get selectionStart() {
            return typingApp.currentText.value.length;
          },
          setSelectionRange: jest.fn(),
        },
      };
      typingApp.onKeyDown(event);
      expect(typingApp.currentText.value).toBe('A');
    });

    it('should insert multiple letters in order at the cursor', () => {
      const events = [
        {
          key: 'h',
          preventDefault: jest.fn(),
          target: {
            get selectionStart() {
              return typingApp.currentText.value.length;
            },
            setSelectionRange: jest.fn(),
          },
        },
        {
          key: 'e',
          preventDefault: jest.fn(),
          target: {
            get selectionStart() {
              return typingApp.currentText.value.length;
            },
            setSelectionRange: jest.fn(),
          },
        },
        {
          key: 'l',
          preventDefault: jest.fn(),
          target: {
            get selectionStart() {
              return typingApp.currentText.value.length;
            },
            setSelectionRange: jest.fn(),
          },
        },
        {
          key: 'l',
          preventDefault: jest.fn(),
          target: {
            get selectionStart() {
              return typingApp.currentText.value.length;
            },
            setSelectionRange: jest.fn(),
          },
        },
        {
          key: 'o',
          preventDefault: jest.fn(),
          target: {
            get selectionStart() {
              return typingApp.currentText.value.length;
            },
            setSelectionRange: jest.fn(),
          },
        },
      ];

      events.forEach(event => typingApp.onKeyDown(event));
      expect(typingApp.currentText.value).toBe('HELLO');
    });

    it('should not mutate text for non-letter keys (space) via onKeyDown', () => {
      const makeEvent = key => ({
        key,
        preventDefault: jest.fn(),
        target: {
          get selectionStart() {
            return typingApp.currentText.value.length;
          },
          setSelectionRange: jest.fn(),
        },
      });

      typingApp.onKeyDown(makeEvent('h'));
      expect(typingApp.currentText.value).toBe('H');

      typingApp.onKeyDown(makeEvent(' '));
      expect(typingApp.currentText.value).toBe('H');
    });
  });

  describe('Enter key handling', () => {
    it('should add line to completed lines when Enter is pressed', async () => {
      typingApp.currentText.value = 'test line';

      const event = {
        key: 'Enter',
        preventDefault: jest.fn(),
      };

      await typingApp.onKeyDown(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(typingApp.currentText.value).toBe('');
      expect(typingApp.completedLines.value).toContain('test line');
    });

    it('should not add empty lines', async () => {
      typingApp.currentText.value = '   ';

      const event = {
        key: 'Enter',
        preventDefault: jest.fn(),
      };

      await typingApp.onKeyDown(event);

      expect(typingApp.completedLines.value).toHaveLength(0);
    });

    it('should not add whitespace-only lines', async () => {
      typingApp.currentText.value = '  \t  \n  ';

      const event = {
        key: 'Enter',
        preventDefault: jest.fn(),
      };

      await typingApp.onKeyDown(event);

      expect(typingApp.completedLines.value).toHaveLength(0);
    });
  });

  describe('editing the last entry with Up', () => {
    const up = (overrides = {}) => ({
      key: 'ArrowUp',
      metaKey: false,
      ctrlKey: false,
      altKey: false,
      preventDefault: jest.fn(),
      ...overrides,
    });

    it('brings the last line back into the input for another go', async () => {
      typingApp.currentText.value = 'cat';
      await typingApp.onKeyDown({ key: 'Enter', preventDefault: jest.fn() });

      const event = up();
      await typingApp.onKeyDown(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(typingApp.currentText.value).toBe('cat');
    });

    it('takes the line back out of the history, so sending it again does not duplicate it', async () => {
      typingApp.currentText.value = 'cat';
      await typingApp.onKeyDown({ key: 'Enter', preventDefault: jest.fn() });
      await typingApp.onKeyDown(up());

      expect(typingApp.completedLines.value).toEqual([]);

      typingApp.currentText.value = 'cats';
      await typingApp.onKeyDown({ key: 'Enter', preventDefault: jest.fn() });

      expect(typingApp.completedLines.value).toEqual(['cats']);
    });

    it('only steps back one entry at a time', async () => {
      typingApp.currentText.value = 'one';
      await typingApp.onKeyDown({ key: 'Enter', preventDefault: jest.fn() });
      typingApp.currentText.value = 'two';
      await typingApp.onKeyDown({ key: 'Enter', preventDefault: jest.fn() });

      await typingApp.onKeyDown(up());

      expect(typingApp.currentText.value).toBe('two');
      expect(typingApp.completedLines.value).toEqual(['one']);
    });

    it('leaves the caret alone when there is already text in the box', async () => {
      typingApp.currentText.value = 'cat';
      await typingApp.onKeyDown({ key: 'Enter', preventDefault: jest.fn() });
      typingApp.currentText.value = 'do';

      const event = up();
      await typingApp.onKeyDown(event);

      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(typingApp.currentText.value).toBe('do');
      expect(typingApp.completedLines.value).toEqual(['cat']);
    });

    it('does nothing when nothing has been sent yet', async () => {
      const event = up();
      await typingApp.onKeyDown(event);

      expect(typingApp.currentText.value).toBe('');
    });
  });

  describe('caps lock functionality', () => {
    it('should convert lowercase to uppercase when caps lock is enabled', () => {
      typingApp.isCapsLockEnabled.value = true;

      const event = {
        key: 'a',
        preventDefault: jest.fn(),
        target: {
          get selectionStart() {
            return typingApp.currentText.value.length;
          },
          setSelectionRange: jest.fn(),
        },
      };

      typingApp.onKeyDown(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(typingApp.currentText.value).toBe('A');
    });

    it('should not mutate text for uppercase input when caps lock is enabled (handled by input element)', () => {
      typingApp.isCapsLockEnabled.value = true;

      const event = {
        key: 'A',
        target: {
          get selectionStart() {
            return typingApp.currentText.value.length;
          },
          setSelectionRange: jest.fn(),
        },
      };

      typingApp.onKeyDown(event);

      expect(typingApp.currentText.value).toBe('');
    });

    it('should not mutate text for non-letters when caps lock is enabled', () => {
      typingApp.isCapsLockEnabled.value = true;

      const event = {
        key: '1',
        target: {
          get selectionStart() {
            return typingApp.currentText.value.length;
          },
          setSelectionRange: jest.fn(),
        },
      };

      typingApp.onKeyDown(event);

      expect(typingApp.currentText.value).toBe('');
    });
  });

  describe('input focus management', () => {
    it('should handle input focus', () => {
      typingApp.onInputFocus();
      expect(typingApp.isInputFocused.value).toBe(true);
    });

    it('should handle input blur', () => {
      typingApp.isInputFocused.value = true;
      typingApp.onInputBlur();
      expect(typingApp.isInputFocused.value).toBe(false);
    });
  });

  describe('toggle functionality', () => {
    it('should toggle auto-speak', () => {
      expect(typingApp.isAutoSpeakEnabled.value).toBe(true);

      typingApp.toggleAutoSpeak();
      expect(typingApp.isAutoSpeakEnabled.value).toBe(false);

      typingApp.toggleAutoSpeak();
      expect(typingApp.isAutoSpeakEnabled.value).toBe(true);
    });

    it('should toggle caps lock', () => {
      expect(typingApp.isCapsLockEnabled.value).toBe(true);

      typingApp.toggleCapsLock();
      expect(typingApp.isCapsLockEnabled.value).toBe(false);

      typingApp.toggleCapsLock();
      expect(typingApp.isCapsLockEnabled.value).toBe(true);
    });

    it('should toggle sound', () => {
      expect(typingApp.isSoundEnabled.value).toBe(true);

      typingApp.toggleSound();
      expect(typingApp.isSoundEnabled.value).toBe(false);

      typingApp.toggleSound();
      expect(typingApp.isSoundEnabled.value).toBe(true);
    });

    it('should toggle speech', () => {
      expect(typingApp.isSpeechEnabled.value).toBe(true);

      typingApp.toggleSpeech();
      expect(typingApp.isSpeechEnabled.value).toBe(false);

      typingApp.toggleSpeech();
      expect(typingApp.isSpeechEnabled.value).toBe(true);
    });
  });

  describe('speech integration', () => {
    it('should trigger speaking of the line when auto-speak is enabled', async () => {
      typingApp.currentText.value = 'test line';
      typingApp.isAutoSpeakEnabled.value = true;
      typingApp.isSpeechEnabled.value = true;

      await typingApp.onKeyDown({ key: 'Enter', preventDefault: jest.fn() });

      expect(typingApp.speakingLine.value).toBe('test line');
    });

    it('should not call speakHistoryLine when auto-speak is disabled', async () => {
      typingApp.currentText.value = 'test line';
      typingApp.isAutoSpeakEnabled.value = false;

      await typingApp.onKeyDown({ key: 'Enter', preventDefault: jest.fn() });

      expect(typingApp.speakingLine.value).toBe(null);
    });

    it('should speak history line when manually triggered', () => {
      typingApp.isSpeechEnabled.value = true;

      typingApp.speakHistoryLine('test line');

      expect(typingApp.speakingLine.value).toBe('test line');
    });
  });

  describe('word prompt', () => {
    it('starts with a word paired to an emoji', () => {
      expect(typingApp.promptWord.value).toEqual(expect.any(String));
      expect(typingApp.promptEmoji.value).toEqual(expect.any(String));
    });

    it('picks a new word on Cmd+Right', () => {
      const firstWord = typingApp.promptWord.value;

      typingApp.onKeyDown({
        key: 'ArrowRight',
        metaKey: true,
        preventDefault: jest.fn(),
      });

      // Guaranteed to differ since the picker excludes an immediate repeat.
      expect(typingApp.promptWord.value).not.toBe(firstWord);
    });

    it('does not shuffle the word for a plain Right arrow', () => {
      const firstWord = typingApp.promptWord.value;

      typingApp.onKeyDown({
        key: 'ArrowRight',
        metaKey: false,
        preventDefault: jest.fn(),
      });

      expect(typingApp.promptWord.value).toBe(firstWord);
    });

    it('moves to a new word once the word is typed correctly', async () => {
      const word = typingApp.promptWord.value;
      typingApp.currentText.value = word;

      await typingApp.onKeyDown({ key: 'Enter', preventDefault: jest.fn() });

      expect(typingApp.promptWord.value).not.toBe(word);
    });

    it('accepts the word in caps, since caps lock is on by default', async () => {
      const word = typingApp.promptWord.value;
      typingApp.currentText.value = word.toUpperCase();

      await typingApp.onKeyDown({ key: 'Enter', preventDefault: jest.fn() });

      expect(typingApp.promptWord.value).not.toBe(word);
    });

    it('ignores surrounding whitespace when checking the word', async () => {
      const word = typingApp.promptWord.value;
      typingApp.currentText.value = `  ${word}  `;

      await typingApp.onKeyDown({ key: 'Enter', preventDefault: jest.fn() });

      expect(typingApp.promptWord.value).not.toBe(word);
    });

    it('keeps the same word up when it is typed wrong', async () => {
      const word = typingApp.promptWord.value;
      typingApp.currentText.value = `${word}zzz`;

      await typingApp.onKeyDown({ key: 'Enter', preventDefault: jest.fn() });

      expect(typingApp.promptWord.value).toBe(word);
    });

    it('keeps the same word up for an unrelated line', async () => {
      const word = typingApp.promptWord.value;
      typingApp.currentText.value = 'hello world';

      await typingApp.onKeyDown({ key: 'Enter', preventDefault: jest.fn() });

      expect(typingApp.promptWord.value).toBe(word);
    });

    it('still records the wrong attempt as a completed line', async () => {
      typingApp.currentText.value = 'not the word';

      await typingApp.onKeyDown({ key: 'Enter', preventDefault: jest.fn() });

      expect(typingApp.completedLines.value).toContain('not the word');
    });

    it('goes back to the previous word on Cmd+Left', () => {
      const firstWord = typingApp.promptWord.value;

      typingApp.onKeyDown({ key: 'ArrowRight', metaKey: true, preventDefault: jest.fn() });
      expect(typingApp.promptWord.value).not.toBe(firstWord);

      typingApp.onKeyDown({ key: 'ArrowLeft', metaKey: true, preventDefault: jest.fn() });
      expect(typingApp.promptWord.value).toBe(firstWord);
    });

    it('stays put on Cmd+Left when there is no earlier word', () => {
      const firstWord = typingApp.promptWord.value;

      typingApp.onKeyDown({ key: 'ArrowLeft', metaKey: true, preventDefault: jest.fn() });

      expect(typingApp.promptWord.value).toBe(firstWord);
    });

    it('does not go back for a plain Left arrow', () => {
      typingApp.onKeyDown({ key: 'ArrowRight', metaKey: true, preventDefault: jest.fn() });
      const secondWord = typingApp.promptWord.value;

      typingApp.onKeyDown({ key: 'ArrowLeft', metaKey: false, preventDefault: jest.fn() });

      expect(typingApp.promptWord.value).toBe(secondWord);
    });

    it('does not shuffle when word prompt is disabled', () => {
      typingApp.toggleWordPrompt();
      const firstWord = typingApp.promptWord.value;

      typingApp.onKeyDown({
        key: 'ArrowRight',
        metaKey: true,
        preventDefault: jest.fn(),
      });

      expect(typingApp.promptWord.value).toBe(firstWord);
    });
  });

  describe('app initialization', () => {
    it('should initialize audio and speech', () => {
      typingApp.initApp();
      // Indirect assertion: initSpeech invokes getVoices
      expect(window.speechSynthesis.getVoices).toHaveBeenCalled();
    });
  });

  describe('math equation handling', () => {
    it('plays the math animation for an a+b equation', async () => {
      typingApp.currentText.value = '3+1';
      await typingApp.onKeyDown({ key: 'Enter', preventDefault: jest.fn() });
      expect(typingApp.mathEquation.value).toMatchObject({ a: 3, b: 1, op: '+', result: 4 });
    });

    it('plays the math animation for a subtraction', async () => {
      typingApp.currentText.value = '5-2';
      await typingApp.onKeyDown({ key: 'Enter', preventDefault: jest.fn() });
      expect(typingApp.mathEquation.value).toMatchObject({ a: 5, b: 2, op: '-', result: 3 });
    });

    it('speaks the answer for an equation when auto-speak is on', async () => {
      typingApp.isAutoSpeakEnabled.value = true;
      typingApp.isSpeechEnabled.value = true;
      typingApp.currentText.value = '4 + 1';
      await typingApp.onKeyDown({ key: 'Enter', preventDefault: jest.fn() });
      expect(typingApp.speakingLine.value).toBe('4 plus 1 equals 5');
    });

    it('speaks subtraction with the word "minus"', async () => {
      typingApp.isAutoSpeakEnabled.value = true;
      typingApp.isSpeechEnabled.value = true;
      typingApp.currentText.value = '9 - 4';
      await typingApp.onKeyDown({ key: 'Enter', preventDefault: jest.fn() });
      expect(typingApp.speakingLine.value).toBe('9 minus 4 equals 5');
    });

    it('does not treat a plain sentence as an equation', async () => {
      typingApp.currentText.value = 'hello world';
      await typingApp.onKeyDown({ key: 'Enter', preventDefault: jest.fn() });
      expect(typingApp.mathEquation.value).toBeNull();
    });

    it('dismisses the animation when the child types the next character', async () => {
      typingApp.currentText.value = '3+1';
      await typingApp.onKeyDown({ key: 'Enter', preventDefault: jest.fn() });
      expect(typingApp.mathEquation.value).not.toBeNull();
      // Typing the next printable character clears the animation.
      await typingApp.onKeyDown({
        key: 'a',
        preventDefault: jest.fn(),
        target: {
          get selectionStart() {
            return typingApp.currentText.value.length;
          },
          setSelectionRange: jest.fn(),
        },
      });
      expect(typingApp.mathEquation.value).toBeNull();
    });
  });

  describe('percent battery handling', () => {
    it('plays the battery for 50% and floats no balloons', async () => {
      typingApp.currentText.value = '50%';
      await typingApp.onKeyDown({ key: 'Enter', preventDefault: jest.fn() });
      expect(typingApp.batteryCharge.value).toMatchObject({ percent: 50 });
      expect(typingApp.balloons.value).toEqual([]);
    });

    it('plays the battery for "% 50" instead of floating fifty balloons', async () => {
      // Behaviour change: before the percent branch, "% 50" split into a bare
      // "50" token and floated fifty balloons.
      typingApp.currentText.value = '% 50';
      await typingApp.onKeyDown({ key: 'Enter', preventDefault: jest.fn() });
      expect(typingApp.batteryCharge.value).toMatchObject({ percent: 50 });
      expect(typingApp.balloons.value).toEqual([]);
    });

    it('dismisses the battery when the child types the next character', async () => {
      typingApp.currentText.value = '50%';
      await typingApp.onKeyDown({ key: 'Enter', preventDefault: jest.fn() });
      expect(typingApp.batteryCharge.value).not.toBeNull();
      await typingApp.onKeyDown({
        key: 'a',
        preventDefault: jest.fn(),
        target: {
          get selectionStart() {
            return typingApp.currentText.value.length;
          },
          setSelectionRange: jest.fn(),
        },
      });
      expect(typingApp.batteryCharge.value).toBeNull();
    });
  });

  describe('silly mode', () => {
    const pressEnter = () =>
      typingApp.onKeyDown({ key: 'Enter', preventDefault: jest.fn() });

    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('starts on the word "silly" and clears the line it was typed on', async () => {
      typingApp.currentText.value = 'silly';
      await pressEnter();

      expect(typingApp.isSillyModeActive.value).toBe(true);
      expect(typingApp.currentText.value).toBe('');
    });

    // A sent line lands in the history synchronously, which is what makes the
    // run observable here — the input is cleared later, after the API call.
    it('sends each word rather than piling them into the input', () => {
      typingApp.currentText.value = 'silly';
      pressEnter();
      const before = typingApp.completedLines.value.length;

      jest.advanceTimersByTime(3000);
      const [first] = typingApp.completedLines.value.slice(before);
      // One dictionary word per line, not a line growing a word at a time.
      expect(SILLY_WORDS).toContain(first.toLowerCase());

      jest.advanceTimersByTime(3000);
      expect(typingApp.completedLines.value).toHaveLength(before + 2);
    });

    it('stops itself after five words', () => {
      typingApp.currentText.value = 'silly';
      pressEnter();
      const before = typingApp.completedLines.value.length;

      jest.advanceTimersByTime(60000);

      expect(typingApp.isSillyModeActive.value).toBe(false);
      expect(typingApp.completedLines.value).toHaveLength(before + 5);
    });

    it('is off until the word is typed', () => {
      expect(typingApp.isSillyModeActive.value).toBe(false);
      jest.advanceTimersByTime(9000);
      expect(typingApp.completedLines.value).toEqual([]);
    });

    it('ignores the word inside a longer line', async () => {
      typingApp.currentText.value = 'you are silly';
      await pressEnter();

      expect(typingApp.isSillyModeActive.value).toBe(false);
    });

    it('stops when the word is typed again', async () => {
      typingApp.currentText.value = 'silly';
      await pressEnter();
      jest.advanceTimersByTime(3000);

      typingApp.currentText.value = 'silly';
      await pressEnter();
      const settled = typingApp.completedLines.value.length;
      jest.advanceTimersByTime(15000);

      expect(typingApp.isSillyModeActive.value).toBe(false);
      expect(typingApp.completedLines.value).toHaveLength(settled);
    });

    it('stops on Escape', async () => {
      typingApp.currentText.value = 'silly';
      await pressEnter();
      jest.advanceTimersByTime(3000);

      await typingApp.onKeyDown({ key: 'Escape', preventDefault: jest.fn() });
      const settled = typingApp.completedLines.value.length;
      jest.advanceTimersByTime(15000);

      expect(typingApp.isSillyModeActive.value).toBe(false);
      expect(typingApp.completedLines.value).toHaveLength(settled);
    });
  });

  describe('color mode', () => {
    const pressEnter = () =>
      typingApp.onKeyDown({ key: 'Enter', preventDefault: jest.fn() });

    it('is off until the word is typed', () => {
      expect(typingApp.isColorModeActive.value).toBe(false);
    });

    it('turns on for "color" and clears the line it was typed on', async () => {
      typingApp.currentText.value = 'color';
      await pressEnter();

      expect(typingApp.isColorModeActive.value).toBe(true);
      expect(typingApp.currentText.value).toBe('');
    });

    it('accepts the British spelling too', async () => {
      typingApp.currentText.value = 'colour';
      await pressEnter();

      expect(typingApp.isColorModeActive.value).toBe(true);
    });

    it('turns back off when the word is typed again', async () => {
      typingApp.currentText.value = 'color';
      await pressEnter();
      typingApp.currentText.value = 'COLOR';
      await pressEnter();

      expect(typingApp.isColorModeActive.value).toBe(false);
    });

    it('ignores the word inside a longer line', async () => {
      typingApp.currentText.value = 'what color is it';
      await pressEnter();

      expect(typingApp.isColorModeActive.value).toBe(false);
    });

    it('still records the trigger line in history so it can be spoken', async () => {
      typingApp.currentText.value = 'color';
      await pressEnter();

      expect(typingApp.completedLines.value).toContain('color');
    });
  });

  describe('number detection and balloon spawning', () => {
    let appUnderTest;
    let mockSpawnBalloons;

    beforeEach(async () => {
      jest.resetModules();
      mockSpawnBalloons = jest.fn();

      jest.doMock('@/features/effects/composables/useBalloons', () => ({
        useBalloons: () => ({
          balloons: { value: [] },
          spawnBalloons: mockSpawnBalloons,
          popBalloon: jest.fn(),
          clearAllBalloons: jest.fn(),
        }),
      }));

      const mod = await import('@/composables/useTypingApp.js');
      appUnderTest = mod.createTypingApp();
    });

    it('should spawn balloons when text contains a number at the beginning', async () => {
      appUnderTest.currentText.value = '5 qwx zzy';
      await appUnderTest.onKeyDown({ key: 'Enter', preventDefault: jest.fn() });
      expect(mockSpawnBalloons).toHaveBeenCalledWith(5);
    });

    it('counts the word instead when the number is written against one', async () => {
      // "5 hello" is five waves, not five balloons — the number belongs to the
      // word next to it. Balloons keep every other line with a number in it.
      appUnderTest.currentText.value = '5 hello world';
      await appUnderTest.onKeyDown({ key: 'Enter', preventDefault: jest.fn() });
      expect(mockSpawnBalloons).not.toHaveBeenCalled();
    });

    it('still gives the balloon system its own word', async () => {
      appUnderTest.currentText.value = '9 balloons';
      await appUnderTest.onKeyDown({ key: 'Enter', preventDefault: jest.fn() });
      expect(mockSpawnBalloons).toHaveBeenCalledWith(9);
    });

    it('should spawn balloons when text contains a number in the middle', async () => {
      appUnderTest.currentText.value = 'hello 10 balloons please';
      await appUnderTest.onKeyDown({ key: 'Enter', preventDefault: jest.fn() });
      expect(mockSpawnBalloons).toHaveBeenCalledWith(10);
    });

    it('should spawn balloons when text contains a number at the end', async () => {
      appUnderTest.currentText.value = 'I want 25 balloons';
      await appUnderTest.onKeyDown({ key: 'Enter', preventDefault: jest.fn() });
      expect(mockSpawnBalloons).toHaveBeenCalledWith(25);
    });

    it('should spawn balloons for the first number when multiple numbers are present', async () => {
      appUnderTest.currentText.value = '3 7 2 balloons';
      await appUnderTest.onKeyDown({ key: 'Enter', preventDefault: jest.fn() });
      expect(mockSpawnBalloons).toHaveBeenCalledWith(3);
      expect(mockSpawnBalloons).toHaveBeenCalledTimes(1);
    });

    it('should not spawn balloons when no pure numbers are found', async () => {
      appUnderTest.currentText.value = 'no numbers here';
      await appUnderTest.onKeyDown({ key: 'Enter', preventDefault: jest.fn() });
      expect(mockSpawnBalloons).not.toHaveBeenCalled();
    });

    it('should not spawn balloons for decimal numbers', async () => {
      appUnderTest.currentText.value = '5.5 balloons';
      await appUnderTest.onKeyDown({ key: 'Enter', preventDefault: jest.fn() });
      expect(mockSpawnBalloons).not.toHaveBeenCalled();
    });

    it('should not spawn balloons for numbers with letters', async () => {
      appUnderTest.currentText.value = '5a balloons';
      await appUnderTest.onKeyDown({ key: 'Enter', preventDefault: jest.fn() });
      expect(mockSpawnBalloons).not.toHaveBeenCalled();
    });

    it('should not spawn balloons for zero', async () => {
      appUnderTest.currentText.value = '0 balloons';
      await appUnderTest.onKeyDown({ key: 'Enter', preventDefault: jest.fn() });
      expect(mockSpawnBalloons).not.toHaveBeenCalled();
    });

    it('should not spawn balloons for negative numbers', async () => {
      appUnderTest.currentText.value = '-5 balloons';
      await appUnderTest.onKeyDown({ key: 'Enter', preventDefault: jest.fn() });
      expect(mockSpawnBalloons).not.toHaveBeenCalled();
    });

    it('should handle multiple spaces between words', async () => {
      appUnderTest.currentText.value = 'hello    5    world';
      await appUnderTest.onKeyDown({ key: 'Enter', preventDefault: jest.fn() });
      expect(mockSpawnBalloons).toHaveBeenCalledWith(5);
    });

    it('should handle tabs and newlines as whitespace', async () => {
      appUnderTest.currentText.value = 'hello\t5\nworld';
      await appUnderTest.onKeyDown({ key: 'Enter', preventDefault: jest.fn() });
      expect(mockSpawnBalloons).toHaveBeenCalledWith(5);
    });

    it('should not cap counts under the limit (10000)', async () => {
      appUnderTest.currentText.value = '500 balloons';
      await appUnderTest.onKeyDown({ key: 'Enter', preventDefault: jest.fn() });
      expect(mockSpawnBalloons).toHaveBeenCalledWith(500);
    });

    it('should handle single digit numbers', async () => {
      appUnderTest.currentText.value = '1 balloon';
      await appUnderTest.onKeyDown({ key: 'Enter', preventDefault: jest.fn() });
      expect(mockSpawnBalloons).toHaveBeenCalledWith(1);
    });

    it('should handle large numbers up to 10000', async () => {
      appUnderTest.currentText.value = '999 balloons';
      await appUnderTest.onKeyDown({ key: 'Enter', preventDefault: jest.fn() });
      expect(mockSpawnBalloons).toHaveBeenCalledWith(999);
    });

    it('should handle empty input', async () => {
      appUnderTest.currentText.value = '';
      await appUnderTest.onKeyDown({ key: 'Enter', preventDefault: jest.fn() });
      expect(mockSpawnBalloons).not.toHaveBeenCalled();
    });

    it('should handle whitespace-only input', async () => {
      appUnderTest.currentText.value = '   \t  \n  ';
      await appUnderTest.onKeyDown({ key: 'Enter', preventDefault: jest.fn() });
      expect(mockSpawnBalloons).not.toHaveBeenCalled();
    });
  });
});
