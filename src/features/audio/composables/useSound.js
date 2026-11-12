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

  // Bells scheduled ahead of time on the audio clock (see useBell). Tracked so
  // a retrigger, Escape or teardown can silence the ones still pending.
  let bellVoices = []

  const stopBell = () => {
    const voices = bellVoices
    bellVoices = []
    for (const { oscillator, gainNode } of voices) {
      try { oscillator.stop() } catch { /* never started or already stopped */ }
      try { oscillator.disconnect() } catch { /* already disconnected */ }
      try { gainNode.disconnect() } catch { /* already disconnected */ }
    }
  }

  // Schedule every strike up front: { time (s from now), hz, decay (s), type }.
  // A fundamental plus an inharmonic overtone reads as metal rather than a beep.
  // Returns false (and schedules nothing) when muted or when audio is unavailable,
  // so the caller can still run its animation in silence.
  const playBell = (events) => {
    stopBell()
    initAudio()
    const ctx = audioContext.value
    if (!ctx || !isAudioEnabled.value || !Array.isArray(events) || events.length === 0) return false

    try {
      if (ctx.state === 'suspended') ctx.resume?.()?.catch?.(() => {})
      const origin = ctx.currentTime + 0.05
      for (const event of events) {
        const at = origin + event.time
        const peak = event.type === 'toll' ? 0.28 : 0.14
        for (const [ratio, level] of [[1, 1], [2.4, 0.3]]) {
          const oscillator = ctx.createOscillator()
          const gainNode = ctx.createGain()
          oscillator.type = 'sine'
          oscillator.frequency.setValueAtTime(event.hz * ratio, at)
          gainNode.gain.setValueAtTime(0.0001, at)
          gainNode.gain.linearRampToValueAtTime(peak * level, at + 0.01)
          gainNode.gain.exponentialRampToValueAtTime(0.0001, at + event.decay)
          oscillator.connect(gainNode)
          gainNode.connect(ctx.destination)
          oscillator.start(at)
          oscillator.stop(at + event.decay + 0.05)
          bellVoices.push({ oscillator, gainNode })
        }
      }
      return true
    } catch {
      stopBell()
      return false
    }
  }

  const toggleAudio = () => {
    isAudioEnabled.value = !isAudioEnabled.value
  }

  return {
    isAudioEnabled,
    playKeySound,
    playEnterSound,
    playZapSound,
    playBell,
    stopBell,
    toggleAudio,
    initAudio
  }
}