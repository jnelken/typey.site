import { ref, watch } from 'vue'
import { loadSetting, saveSetting } from '@/utils/storage'

export function useSound() {
  const audioContext = ref(null)
  const isAudioEnabled = ref(loadSetting('sound', true))

  watch(isAudioEnabled, value => saveSetting('sound', value))

  const initAudio = () => {
    if (!audioContext.value && typeof AudioContext !== 'undefined') {
      audioContext.value = new AudioContext()
    }
  }

  const createClickSound = () => {
    if (!audioContext.value || !isAudioEnabled.value) return

    const oscillator = audioContext.value.createOscillator()
    const gainNode = audioContext.value.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.value.destination)
    
    oscillator.frequency.setValueAtTime(800, audioContext.value.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.value.currentTime + 0.1)
    
    gainNode.gain.setValueAtTime(0.1, audioContext.value.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.value.currentTime + 0.1)
    
    oscillator.start(audioContext.value.currentTime)
    oscillator.stop(audioContext.value.currentTime + 0.1)
  }

  const createSuccessSound = () => {
    if (!audioContext.value || !isAudioEnabled.value) return

    const oscillator = audioContext.value.createOscillator()
    const gainNode = audioContext.value.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.value.destination)
    
    oscillator.frequency.setValueAtTime(523, audioContext.value.currentTime)
    oscillator.frequency.setValueAtTime(659, audioContext.value.currentTime + 0.1)
    oscillator.frequency.setValueAtTime(784, audioContext.value.currentTime + 0.2)
    
    gainNode.gain.setValueAtTime(0.2, audioContext.value.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.value.currentTime + 0.3)
    
    oscillator.start(audioContext.value.currentTime)
    oscillator.stop(audioContext.value.currentTime + 0.3)
  }

  // The zap an overcharged battery fires at a letter: a hard buzz falling fast,
  // so it reads as electricity rather than as another key click.
  const createZapSound = () => {
    if (!audioContext.value || !isAudioEnabled.value) return

    const oscillator = audioContext.value.createOscillator()
    const gainNode = audioContext.value.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.value.destination)

    oscillator.type = 'sawtooth'
    oscillator.frequency.setValueAtTime(1400, audioContext.value.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(90, audioContext.value.currentTime + 0.22)

    gainNode.gain.setValueAtTime(0.12, audioContext.value.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.value.currentTime + 0.22)

    oscillator.start(audioContext.value.currentTime)
    oscillator.stop(audioContext.value.currentTime + 0.22)
  }

  const playKeySound = (key) => {
    initAudio()
    
    if (typeof key === 'string' && key.length === 1) {
      createClickSound()
    }
  }

  const playEnterSound = () => {
    initAudio()
    createSuccessSound()
  }

  const playZapSound = () => {
    initAudio()
    createZapSound()
  }

  const toggleAudio = () => {
    isAudioEnabled.value = !isAudioEnabled.value
  }

  return {
    isAudioEnabled,
    playKeySound,
    playEnterSound,
    playZapSound,
    toggleAudio,
    initAudio
  }
}