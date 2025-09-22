import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { createTypingApp } from '../../src/composables/useTypingApp';

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

  describe('app initialization', () => {
    it('should initialize audio and speech', () => {
      typingApp.initApp();
      // Indirect assertion: initSpeech invokes getVoices
      expect(window.speechSynthesis.getVoices).toHaveBeenCalled();
    });
  });

  describe('number detection and balloon spawning', () => {
    let appUnderTest;
    let mockSpawnBalloons;

    beforeEach(async () => {
      jest.resetModules();
      mockSpawnBalloons = jest.fn();

      jest.doMock('../../src/composables/useBalloons', () => ({
        useBalloons: () => ({
          balloons: { value: [] },
          spawnBalloons: mockSpawnBalloons,
          popBalloon: jest.fn(),
          clearAllBalloons: jest.fn(),
        }),
      }));

      const mod = await import('../../src/composables/useTypingApp.js');
      appUnderTest = mod.createTypingApp();
    });

    it('should spawn balloons when text contains a number at the beginning', async () => {
      appUnderTest.currentText.value = '5 hello world';
      await appUnderTest.onKeyDown({ key: 'Enter', preventDefault: jest.fn() });
      expect(mockSpawnBalloons).toHaveBeenCalledWith(5);
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

    it('should limit balloon count to 100', async () => {
      appUnderTest.currentText.value = '500 balloons';
      await appUnderTest.onKeyDown({ key: 'Enter', preventDefault: jest.fn() });
      expect(mockSpawnBalloons).toHaveBeenCalledWith(100);
    });

    it('should handle single digit numbers', async () => {
      appUnderTest.currentText.value = '1 balloon';
      await appUnderTest.onKeyDown({ key: 'Enter', preventDefault: jest.fn() });
      expect(mockSpawnBalloons).toHaveBeenCalledWith(1);
    });

    it('should handle large numbers', async () => {
      appUnderTest.currentText.value = '999 balloons';
      await appUnderTest.onKeyDown({ key: 'Enter', preventDefault: jest.fn() });
      expect(mockSpawnBalloons).toHaveBeenCalledWith(100); // Should be capped at 100
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
