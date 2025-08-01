import { ref } from 'vue';

export function useSpeech() {
  const isSpeechEnabled = ref(true);
  const isSpeaking = ref(false);
  const speechRate = ref(0.8);
  const speechPitch = ref(1.2);

  // Initialize speech synthesis for macOS compatibility
  const initSpeech = () => {
    if (typeof window.speechSynthesis !== 'undefined') {
      // Force voices to load on macOS
      window.speechSynthesis.getVoices();

      // Resume speech synthesis if it's paused (macOS requirement)
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    }
  };

  const speak = (text, options = {}) => {
    if (
      !isSpeechEnabled.value ||
      !text ||
      typeof SpeechSynthesisUtterance === 'undefined'
    ) {
      return Promise.resolve();
    }

    return new Promise(resolve => {
      if (isSpeaking.value) {
        window.speechSynthesis.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(text);

      utterance.rate = options.rate || speechRate.value;
      utterance.pitch = options.pitch || speechPitch.value;
      utterance.volume = options.volume || 0.8;

      // Get voices and handle macOS-specific voice selection
      const getVoices = () => {
        let voices = window.speechSynthesis.getVoices();

        // If voices aren't loaded yet, wait for them
        if (voices.length === 0) {
          return new Promise(resolveVoices => {
            window.speechSynthesis.onvoiceschanged = () => {
              voices = window.speechSynthesis.getVoices();
              resolveVoices(voices);
            };
            // Trigger voices to load
            window.speechSynthesis.getVoices();
          });
        }

        return Promise.resolve(voices);
      };

      getVoices().then(voices => {
        // macOS-specific voice selection
        const preferredVoice = voices.find(
          voice =>
            voice.name.includes('Google') ||
            voice.name.includes('Alex') ||
            voice.name.includes('Samantha') ||
            voice.name.includes('Victoria') || // macOS default
            voice.name.includes('Daniel') || // macOS default
            voice.name.includes('Karen') || // macOS default
            voice.default,
        );

        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }

        utterance.onstart = () => {
          isSpeaking.value = true;
        };

        utterance.onend = () => {
          isSpeaking.value = false;
          resolve();
        };

        utterance.onerror = event => {
          console.warn('Speech synthesis error:', event.error);
          isSpeaking.value = false;
          resolve();
        };

        // Ensure speech synthesis is resumed (macOS requirement)
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }

        window.speechSynthesis.speak(utterance);
      });
    });
  };

  const speakLetter = letter => {
    if (typeof letter === 'string' && letter.length === 1 && letter !== ' ') {
      return speak(letter, { rate: 1.0, pitch: 1.4 });
    }
    return Promise.resolve();
  };

  const speakWord = word => {
    if (typeof word === 'string' && word.trim().length > 0) {
      return speak(word.trim(), { rate: 0.9, pitch: 1.1 });
    }
    return Promise.resolve();
  };

  const speakLine = line => {
    if (typeof line === 'string' && line.trim().length > 0) {
      return speak(line.trim());
    }
    return Promise.resolve();
  };

  const stopSpeaking = () => {
    if (typeof window.speechSynthesis !== 'undefined') {
      window.speechSynthesis.cancel();
      isSpeaking.value = false;
    }
  };

  const toggleSpeech = () => {
    isSpeechEnabled.value = !isSpeechEnabled.value;
    if (!isSpeechEnabled.value) {
      stopSpeaking();
    }
  };

  const setSpeechRate = rate => {
    speechRate.value = Math.max(0.1, Math.min(2.0, rate));
  };

  const setSpeechPitch = pitch => {
    speechPitch.value = Math.max(0.1, Math.min(2.0, pitch));
  };

  return {
    isSpeechEnabled,
    isSpeaking,
    speechRate,
    speechPitch,
    initSpeech,
    speak,
    speakLetter,
    speakWord,
    speakLine,
    stopSpeaking,
    toggleSpeech,
    setSpeechRate,
    setSpeechPitch,
  };
}
