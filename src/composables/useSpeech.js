import { ref } from 'vue';

export function useSpeech() {
  const isSpeechEnabled = ref(true);
  const isSpeaking = ref(false);
  const speechRate = ref(0.8);
  const speechPitch = ref(1.2);
  const currentlySpeaking = ref(null); // Track what's currently being spoken
  const speakingLine = ref(null); // Track which line is being spoken
  const speakingPosition = ref(0); // Track position within the line being spoken
  const speakingQueue = ref([]); // Track characters in the speaking queue

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

        utterance.onstart = () => {
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
          isSpeaking.value = false;
          currentlySpeaking.value = null;

          // Remove from speaking queue when done
          if (options.speechData && options.speechData.label.length === 1) {
            const index = speakingQueue.value.indexOf(options.speechData.label);
            if (index > -1) {
              speakingQueue.value.splice(index, 1);
            }
          } else if (text.length === 1) {
            const index = speakingQueue.value.indexOf(text);
            if (index > -1) {
              speakingQueue.value.splice(index, 1);
            }
          }

          speakingLine.value = null;
          speakingPosition.value = 0;
          resolve();
        };

        utterance.onerror = event => {
          console.warn('Speech synthesis error:', event.error);
          isSpeaking.value = false;
          currentlySpeaking.value = null;

          // Remove from speaking queue on error
          if (options.speechData && options.speechData.label.length === 1) {
            const index = speakingQueue.value.indexOf(options.speechData.label);
            if (index > -1) {
              speakingQueue.value.splice(index, 1);
            }
          } else if (text.length === 1) {
            const index = speakingQueue.value.indexOf(text);
            if (index > -1) {
              speakingQueue.value.splice(index, 1);
            }
          }

          speakingLine.value = null;
          speakingPosition.value = 0;
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

        // Debug logging
        console.log('Speaking word:', {
          actualWord,
          wordStartIndex,
          wordEndIndex,
          originalText: trimmedLine.substring(wordStartIndex, wordEndIndex),
          speechData,
          speakingLine: speakingLine.value,
        });
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
