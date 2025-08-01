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
      expect(typingApp.isCapsLockEnabled.value).toBe(false);
      expect(typingApp.isAutoSpeakEnabled.value).toBe(true);
      expect(typingApp.isSoundEnabled.value).toBe(true);
      expect(typingApp.isSpeechEnabled.value).toBe(true);
    });
  });

  describe('text input handling', () => {
    it('should add characters to current text', () => {
      const event = { key: 'a' };
      typingApp.onKeyDown(event);
      expect(typingApp.currentText.value).toBe('a');
    });

    it('should handle multiple characters', () => {
      const events = [
        { key: 'h' },
        { key: 'e' },
        { key: 'l' },
        { key: 'l' },
        { key: 'o' },
      ];

      events.forEach(event => typingApp.onKeyDown(event));
      expect(typingApp.currentText.value).toBe('hello');
    });

    it('should handle spaces', () => {
      const events = [
        { key: 'h' },
        { key: ' ' },
        { key: 'w' },
        { key: 'o' },
        { key: 'r' },
        { key: 'l' },
        { key: 'd' },
      ];

      events.forEach(event => typingApp.onKeyDown(event));
      expect(typingApp.currentText.value).toBe('h world');
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
          selectionStart: 0,
          setSelectionRange: jest.fn(),
        },
      };

      typingApp.onKeyDown(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(typingApp.currentText.value).toBe('A');
    });

    it('should not affect uppercase letters when caps lock is enabled', () => {
      typingApp.isCapsLockEnabled.value = true;

      const event = {
        key: 'A',
        target: {
          selectionStart: 0,
          setSelectionRange: jest.fn(),
        },
      };

      typingApp.onKeyDown(event);

      expect(typingApp.currentText.value).toBe('A');
    });

    it('should not affect non-letters when caps lock is enabled', () => {
      typingApp.isCapsLockEnabled.value = true;

      const event = {
        key: '1',
        target: {
          selectionStart: 0,
          setSelectionRange: jest.fn(),
        },
      };

      typingApp.onKeyDown(event);

      expect(typingApp.currentText.value).toBe('1');
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
      expect(typingApp.isCapsLockEnabled.value).toBe(false);

      typingApp.toggleCapsLock();
      expect(typingApp.isCapsLockEnabled.value).toBe(true);

      typingApp.toggleCapsLock();
      expect(typingApp.isCapsLockEnabled.value).toBe(false);
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
    it('should call speakHistoryLine when line is completed with auto-speak enabled', async () => {
      typingApp.currentText.value = 'test line';
      typingApp.isAutoSpeakEnabled.value = true;
      typingApp.isSpeechEnabled.value = true;

      const speakLineSpy = jest.spyOn(typingApp, 'speakHistoryLine');

      await typingApp.handleEnterKey();

      expect(speakLineSpy).toHaveBeenCalledWith('test line');
    });

    it('should not call speakHistoryLine when auto-speak is disabled', async () => {
      typingApp.currentText.value = 'test line';
      typingApp.isAutoSpeakEnabled.value = false;

      const speakLineSpy = jest.spyOn(typingApp, 'speakHistoryLine');

      await typingApp.handleEnterKey();

      expect(speakLineSpy).not.toHaveBeenCalled();
    });

    it('should call speakHistoryLine when manually triggered', () => {
      typingApp.isSpeechEnabled.value = true;

      const speakLineSpy = jest.spyOn(typingApp, 'speakHistoryLine');

      typingApp.speakHistoryLine('test line');

      expect(speakLineSpy).toHaveBeenCalledWith('test line');
    });
  });

  describe('app initialization', () => {
    it('should initialize audio and speech', () => {
      const initAudioSpy = jest.spyOn(typingApp, 'initAudio');
      const initSpeechSpy = jest.spyOn(typingApp, 'initSpeech');

      typingApp.initApp();

      expect(initAudioSpy).toHaveBeenCalled();
      expect(initSpeechSpy).toHaveBeenCalled();
    });
  });
});
