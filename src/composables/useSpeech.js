import { ref } from 'vue'

export function useSpeech() {
  const isSpeechEnabled = ref(true)
  const isSpeaking = ref(false)
  const speechRate = ref(0.8)
  const speechPitch = ref(1.2)

  const speak = (text, options = {}) => {
    if (!isSpeechEnabled.value || !text || typeof SpeechSynthesisUtterance === 'undefined') {
      return Promise.resolve()
    }

    return new Promise((resolve) => {
      if (isSpeaking.value) {
        speechSynthesis.cancel()
      }

      const utterance = new SpeechSynthesisUtterance(text)
      
      utterance.rate = options.rate || speechRate.value
      utterance.pitch = options.pitch || speechPitch.value
      utterance.volume = options.volume || 0.8
      
      const voices = speechSynthesis.getVoices()
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Google') || 
        voice.name.includes('Alex') ||
        voice.name.includes('Samantha') ||
        voice.default
      )
      
      if (preferredVoice) {
        utterance.voice = preferredVoice
      }

      utterance.onstart = () => {
        isSpeaking.value = true
      }

      utterance.onend = () => {
        isSpeaking.value = false
        resolve()
      }

      utterance.onerror = () => {
        isSpeaking.value = false
        resolve()
      }

      speechSynthesis.speak(utterance)
    })
  }

  const speakLetter = (letter) => {
    if (typeof letter === 'string' && letter.length === 1 && letter !== ' ') {
      return speak(letter, { rate: 1.0, pitch: 1.4 })
    }
    return Promise.resolve()
  }

  const speakWord = (word) => {
    if (typeof word === 'string' && word.trim().length > 0) {
      return speak(word.trim(), { rate: 0.9, pitch: 1.1 })
    }
    return Promise.resolve()
  }

  const speakLine = (line) => {
    if (typeof line === 'string' && line.trim().length > 0) {
      return speak(line.trim())
    }
    return Promise.resolve()
  }

  const stopSpeaking = () => {
    if (typeof speechSynthesis !== 'undefined') {
      speechSynthesis.cancel()
      isSpeaking.value = false
    }
  }

  const toggleSpeech = () => {
    isSpeechEnabled.value = !isSpeechEnabled.value
    if (!isSpeechEnabled.value) {
      stopSpeaking()
    }
  }

  const setSpeechRate = (rate) => {
    speechRate.value = Math.max(0.1, Math.min(2.0, rate))
  }

  const setSpeechPitch = (pitch) => {
    speechPitch.value = Math.max(0.1, Math.min(2.0, pitch))
  }

  return {
    isSpeechEnabled,
    isSpeaking,
    speechRate,
    speechPitch,
    speak,
    speakLetter,
    speakWord,
    speakLine,
    stopSpeaking,
    toggleSpeech,
    setSpeechRate,
    setSpeechPitch
  }
}