import { ref, watch } from 'vue';
import { loadSetting, saveSetting } from '@/utils/storage';

export function useSpeech() {
  const isSpeechEnabled = ref(loadSetting('speech', true));
  watch(isSpeechEnabled, value => saveSetting('speech', value));
  const isSpeaking = ref(false);
  const speechRate = ref(0.8);
  const speechPitch = ref(1.2);
  const currentlySpeaking = ref(null); // Track what's currently being spoken
  const speakingLine = ref(null); // Track which line is being spoken
  const speakingPosition = ref(0); // Track position within the line being spoken
  const speakingQueue = ref([]); // Track characters in the speaking queue

  // Surfaces what's actually happening with the Web Speech API, for
  // debugging on devices (iPad) where there's no console access.
  const speechDebug = ref({
    supported: typeof window !== 'undefined' && 'speechSynthesis' in window,
    voiceCount: 0,
    lastEvent: null,
    lastError: null,
    lastText: null,
  });

  const logDebug = (event, extra = {}) => {
    speechDebug.value = {
      ...speechDebug.value,
      lastEvent: event,
      lastEventAt: new Date().toLocaleTimeString(),
      ...extra,
    };
  };

  // Initialize speech synthesis for macOS compatibility
  const initSpeech = () => {
    if (typeof window.speechSynthesis !== 'undefined') {
      // Force voices to load on macOS
      const voices = window.speechSynthesis.getVoices();
      logDebug('init', { voiceCount: voices.length });

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
      logDebug('speak-skipped', {
        lastText: text,
        reason: !isSpeechEnabled.value
          ? 'speech-disabled'
          : !text
            ? 'empty-text'
            : 'no-utterance-api',
      });
      return Promise.resolve();
    }

    logDebug('speak-called', { lastText: text });

    return new Promise(resolve => {
      let settled = false;
      const settle = () => {
        if (settled) return;
        settled = true;
        resolve();
      };

      // Get voices and handle macOS-specific voice selection
      const getVoices = () => {
        let voices = window.speechSynthesis.getVoices();

        // If voices aren't loaded yet, wait for them
        if (voices.length === 0) {
          return new Promise(resolveVoices => {
            let resolved = false;
            const finish = v => {
              if (resolved) return;
              resolved = true;
              resolveVoices(v);
            };
            window.speechSynthesis.onvoiceschanged = () => {
              finish(window.speechSynthesis.getVoices());
            };
            // Trigger voices to load
            window.speechSynthesis.getVoices();
            // iOS sometimes never fires onvoiceschanged - don't hang forever
            setTimeout(() => finish(window.speechSynthesis.getVoices()), 300);
          });
        }

        return Promise.resolve(voices);
      };

      const startSpeaking = () => {
        const utterance = new SpeechSynthesisUtterance(text);

        utterance.rate = options.rate || speechRate.value;
        utterance.pitch = options.pitch || speechPitch.value;
        utterance.volume = options.volume || 0.8;

        speakWithUtterance(utterance);
      };

      const cleanupQueue = () => {
        const label = options.speechData ? options.speechData.label : text;
        if (label.length === 1) {
          const index = speakingQueue.value.indexOf(label);
          if (index > -1) {
            speakingQueue.value.splice(index, 1);
          }
        }
        speakingLine.value = null;
        speakingPosition.value = 0;
      };

      const speakWithUtterance = utterance => {
        getVoices().then(voices => {
          logDebug('voices-ready', { voiceCount: voices.length });
          if (settled) return;

          // Voice selection with English priority
          const preferredVoice =
            voices.find(
              voice =>
                voice.lang.startsWith('en') &&
                (voice.name.includes('Google') ||
                  voice.name.includes('Alex') ||
                  voice.name.includes('Samantha') ||
                  voice.name.includes('Victoria') || // macOS default
                  voice.name.includes('Daniel') || // macOS default
                  voice.name.includes('Karen') || // macOS default
                  voice.default),
            ) ||
            voices.find(voice => voice.lang.startsWith('en')) ||
            voices.find(voice => voice.default);

          if (preferredVoice) {
            utterance.voice = preferredVoice;
          }

          // Safety net: iOS occasionally never fires onend/onerror
          // (goes silent after backgrounding, especially in fullscreen/PWA mode).
          // Don't let that hang the whole typing queue.
          const watchdog = setTimeout(() => {
            logDebug('watchdog-timeout');
            isSpeaking.value = false;
            currentlySpeaking.value = null;
            cleanupQueue();
            settle();
          }, 15000);

          utterance.onstart = () => {
            logDebug('onstart');
            isSpeaking.value = true;

            // Use speechData if available for proper highlighting
            if (options.speechData) {
              currentlySpeaking.value = options.speechData.label;
              // Add to speaking queue for letter-by-letter highlighting
              if (options.speechData.label.length === 1) {
                speakingQueue.value.push(options.speechData.label);
              }
            } else {
              currentlySpeaking.value = text;
              // Add to speaking queue for letter-by-letter highlighting
              if (text.length === 1) {
                speakingQueue.value.push(text);
              }
            }

            // For line speech, track the line and start position
            // Only set speakingLine if we don't have speechData (to avoid overwriting original case)
            if (text.length > 1 && !options.speechData) {
              speakingLine.value = text;
              speakingPosition.value = 0;
            }
          };

          utterance.onend = () => {
            logDebug('onend');
            clearTimeout(watchdog);
            isSpeaking.value = false;
            currentlySpeaking.value = null;
            cleanupQueue();
            settle();
          };

          utterance.onerror = event => {
            console.warn('Speech synthesis error:', event.error);
            logDebug('onerror', { lastError: event.error });
            clearTimeout(watchdog);
            isSpeaking.value = false;
            currentlySpeaking.value = null;
            cleanupQueue();
            settle();
          };

          // Ensure speech synthesis is resumed (macOS requirement)
          if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
          }

          logDebug('calling-speak');
          window.speechSynthesis.speak(utterance);
        });
      };

      if (isSpeaking.value || window.speechSynthesis.speaking) {
        // iOS/WebKit can silently drop an utterance if speak() is called
        // in the same tick as cancel() - give it a beat to actually clear.
        window.speechSynthesis.cancel();
        setTimeout(startSpeaking, 50);
      } else {
        startSpeaking();
      }
    });
  };

  const speakLetter = letter => {
    if (typeof letter === 'string' && letter.length === 1 && letter !== ' ') {
      // Create speech object with original letter for highlighting and lowercase for speech
      const speechData = {
        label: letter,
        value: letter.toLowerCase()
      };
      return speak(speechData.value, { 
        rate: 1.0, 
        pitch: 1.4, 
        speechData: speechData 
      });
    }
    return Promise.resolve();
  };

  const speakWord = word => {
    if (typeof word === 'string' && word.trim().length > 0) {
      return speak(word.trim(), { rate: 0.9, pitch: 1.1 });
    }
    return Promise.resolve();
  };

  const speakLine = async line => {
    if (typeof line === 'string' && line.trim().length > 0) {
      const trimmedLine = line.trim();

      // Set the line being spoken
      speakingLine.value = trimmedLine;
      speakingPosition.value = 0;

      // Track word boundaries directly in the original text
      let currentPosition = 0;

      const speakNextWord = async () => {
        // Skip leading whitespace
        while (
          currentPosition < trimmedLine.length &&
          /\s/.test(trimmedLine[currentPosition])
        ) {
          currentPosition++;
        }

        // Check if we've reached the end
        if (currentPosition >= trimmedLine.length) {
          // Finished speaking all words
          speakingLine.value = null;
          speakingPosition.value = 0;
          return;
        }

        const wordStartIndex = currentPosition;

        // Find the end of the current word
        let wordEndIndex = wordStartIndex;
        while (
          wordEndIndex < trimmedLine.length &&
          !/\s/.test(trimmedLine[wordEndIndex])
        ) {
          wordEndIndex++;
        }

        // Extract the actual word from the original text
        const actualWord = trimmedLine.substring(wordStartIndex, wordEndIndex);

        // Update position to start of current word
        speakingPosition.value = wordStartIndex;

        // Create speech object with original word for highlighting and lowercase for speech
        const speechData = {
          label: actualWord,
          value: actualWord.toLowerCase()
        };

        // Debug logging (uncomment if needed)
        // console.log('Speaking word:', {
        //   actualWord,
        //   wordStartIndex,
        //   wordEndIndex,
        //   originalText: trimmedLine.substring(wordStartIndex, wordEndIndex),
        //   speechData,
        //   speakingLine: speakingLine.value,
        // });
        await speak(speechData.value, { speechData: speechData });

        // Move to next word
        currentPosition = wordEndIndex;

        // Continue with next word
        speakNextWord();
      };

      // Start speaking words
      speakNextWord();

      return Promise.resolve();
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
    currentlySpeaking,
    speakingLine,
    speakingPosition,
    speakingQueue,
    speechDebug,
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
