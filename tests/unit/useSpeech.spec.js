import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { useSpeech } from '../../src/composables/useSpeech';

describe('useSpeech', () => {
  let speech;

  beforeEach(() => {
    jest.clearAllMocks();
    speech = useSpeech();
  });

  describe('initialization', () => {
    it('should initialize with default values', () => {
      expect(speech.isSpeechEnabled.value).toBe(true);
      expect(speech.isSpeaking.value).toBe(false);
      expect(speech.speechRate.value).toBe(0.8);
      expect(speech.speechPitch.value).toBe(1.2);
      expect(speech.currentlySpeaking.value).toBe(null);
      expect(speech.speakingLine.value).toBe(null);
      expect(speech.speakingPosition.value).toBe(0);
      expect(speech.speakingQueue.value).toEqual([]);
    });
  });

  describe('initSpeech', () => {
    it('should initialize speech synthesis', () => {
      speech.initSpeech();
      expect(window.speechSynthesis.getVoices).toHaveBeenCalled();
    });

    it('should resume speech synthesis if paused', () => {
      window.speechSynthesis.paused = true;
      speech.initSpeech();
      expect(window.speechSynthesis.resume).toHaveBeenCalled();
    });
  });

  describe('speech state management', () => {
    it('should not speak when speech is disabled', async () => {
      speech.isSpeechEnabled.value = false;
      await speech.speak('test');
      expect(window.speechSynthesis.speak).not.toHaveBeenCalled();
    });

    it('should not speak empty text', async () => {
      await speech.speak('');
      expect(window.speechSynthesis.speak).not.toHaveBeenCalled();
    });

    it('should call speech synthesis when speaking', async () => {
      speech.speak('test');
      await Promise.resolve();
      expect(window.speechSynthesis.speak).toHaveBeenCalled();
    });
  });

  describe('speakLetter', () => {
    it('should call speech synthesis for valid letters', async () => {
      speech.speakLetter('A');
      await Promise.resolve();
      expect(window.speechSynthesis.speak).toHaveBeenCalled();
    });

    it('should not speak spaces', async () => {
      window.speechSynthesis.speak.mockClear();
      speech.speakLetter(' ');
      await Promise.resolve();
      expect(window.speechSynthesis.speak).not.toHaveBeenCalled();
    });

    it('should not speak multiple characters', async () => {
      window.speechSynthesis.speak.mockClear();
      speech.speakLetter('AB');
      await Promise.resolve();
      expect(window.speechSynthesis.speak).not.toHaveBeenCalled();
    });
  });

  describe('speakWord', () => {
    it('should call speech synthesis for valid words', async () => {
      speech.speakWord('hello');
      await Promise.resolve();
      expect(window.speechSynthesis.speak).toHaveBeenCalled();
    });

    it('should not speak empty words', async () => {
      window.speechSynthesis.speak.mockClear();
      speech.speakWord('');
      await Promise.resolve();
      expect(window.speechSynthesis.speak).not.toHaveBeenCalled();
    });
  });

  describe('speakLine', () => {
    it('should set speaking line state', () => {
      speech.speakLine('hello world');
      expect(speech.speakingLine.value).toBe('hello world');
      expect(speech.speakingPosition.value).toBe(0);
    });

    it('should not process empty lines', () => {
      const speakSpy = jest.spyOn(speech, 'speak');
      speech.speakLine('');
      expect(speakSpy).not.toHaveBeenCalled();
    });
  });

  describe('stopSpeaking', () => {
    it('should cancel speech synthesis and reset state', () => {
      speech.isSpeaking.value = true;
      speech.currentlySpeaking.value = 'test';

      speech.stopSpeaking();

      expect(window.speechSynthesis.cancel).toHaveBeenCalled();
      expect(speech.isSpeaking.value).toBe(false);
    });
  });

  describe('toggleSpeech', () => {
    it('should toggle speech enabled state', () => {
      expect(speech.isSpeechEnabled.value).toBe(true);

      speech.toggleSpeech();
      expect(speech.isSpeechEnabled.value).toBe(false);

      speech.toggleSpeech();
      expect(speech.isSpeechEnabled.value).toBe(true);
    });
  });

  describe('speech rate and pitch', () => {
    it('should set speech rate within bounds', () => {
      speech.setSpeechRate(1.5);
      expect(speech.speechRate.value).toBe(1.5);

      speech.setSpeechRate(3.0); // Above max
      expect(speech.speechRate.value).toBe(2.0);

      speech.setSpeechRate(-1); // Below min
      expect(speech.speechRate.value).toBe(0.1);
    });

    it('should set speech pitch within bounds', () => {
      speech.setSpeechPitch(1.5);
      expect(speech.speechPitch.value).toBe(1.5);

      speech.setSpeechPitch(3.0); // Above max
      expect(speech.speechPitch.value).toBe(2.0);

      speech.setSpeechPitch(-1); // Below min
      expect(speech.speechPitch.value).toBe(0.1);
    });
  });
});
