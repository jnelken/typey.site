<template>
  <Container height="screen" center max-width="default" padding="lg">
    <div class="typing-app">
      <div class="header">
        <Text tag="h1" size="3xl" align="center" color="primary" weight="bold">
          🎯 Typey Site
        </Text>
        <Text tag="p" size="lg" align="center" color="secondary">
          Fun typing for kids!
        </Text>
      </div>

      <div class="controls">
        <Button 
          variant="ghost" 
          size="sm" 
          @click="toggleSound"
        >
          {{ isSoundEnabled ? '🔊' : '🔇' }} Sound
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          @click="toggleSpeech"
        >
          {{ isSpeechEnabled ? '🗣️' : '🤫' }} Speech
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          @click="toggleAutoSpeak"
        >
          {{ isAutoSpeakEnabled ? '📢' : '📵' }} Auto-Speak
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          @click="toggleCapsLock"
        >
          {{ isCapsLockEnabled ? '🔠' : '🔡' }} {{ isCapsLockEnabled ? 'CAPS' : 'caps' }}
        </Button>
      </div>

      <div class="typing-area">
        <div class="lines-history" ref="historyContainer">
          <div 
            v-for="(line, index) in completedLines" 
            :key="`line-${index}`"
            class="completed-line"
            :class="{ 'line-enter': index === completedLines.length - 1 }"
            @click="speakHistoryLine(line)"
          >
            <Text size="typing" font="mono" color="secondary">
              {{ line }}
            </Text>
          </div>
        </div>
      </div>

      <div class="input-section" @click="focusInput">
        <div class="current-line-display">
          <AnimatedText 
            :text="currentText"
            size="typing"
            font="mono"
            color="primary"
            :animate-on-change="false"
            :show-cursor="!isInputFocused"
            @character-typed="onCharacterTyped"
          />
        </div>
        
        <div class="input-container">
          <Input
            ref="typingInput"
            v-model="currentText"
            variant="typing"
            size="xl"
            placeholder="Start typing..."
            autofocus
            @keydown="onKeyDown"
            @focus="onInputFocus"
            @blur="onInputBlur"
          />
        </div>
      </div>

      <div class="help-text">
        <Text size="sm" align="center" color="light">
          Type anything and press Enter to move to the next line
        </Text>
      </div>
    </div>
  </Container>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import Container from './ui/Container.vue'
import Text from './ui/Text.vue'
import Button from './ui/Button.vue'
import Input from './ui/Input.vue'
import AnimatedText from './ui/AnimatedText.vue'
import { useSound } from './composables/useSound'
import { useSpeech } from './composables/useSpeech'

const typingInput = ref(null)
const historyContainer = ref(null)
const currentText = ref('')
const completedLines = ref([])
const isInputFocused = ref(false)
const isCapsLockEnabled = ref(false)
const isAutoSpeakEnabled = ref(true)

const {
  isAudioEnabled: isSoundEnabled,
  playKeySound,
  playEnterSound,
  toggleAudio: toggleSound,
  initAudio
} = useSound()

const {
  isSpeechEnabled,
  speakLetter,
  speakLine,
  toggleSpeech,
  stopSpeaking
} = useSpeech()

const onKeyDown = async (event) => {
  const key = event.key
  
  if (key === 'Enter') {
    event.preventDefault()
    await handleEnterKey()
  } else if (key.length === 1) {
    // Stop any currently speaking letter
    stopSpeaking()
    
    if (isCapsLockEnabled.value && key.match(/[a-z]/)) {
      event.preventDefault()
      const upperKey = key.toUpperCase()
      const cursorPos = event.target.selectionStart
      const textBefore = currentText.value.substring(0, cursorPos)
      const textAfter = currentText.value.substring(cursorPos)
      currentText.value = textBefore + upperKey + textAfter
      
      nextTick(() => {
        if (typingInput.value && typingInput.value.inputRef) {
          typingInput.value.inputRef.setSelectionRange(cursorPos + 1, cursorPos + 1)
        }
      })
      
      playKeySound(upperKey)
      
      nextTick(() => {
        if (isSpeechEnabled.value) {
          speakLetter(upperKey)
        }
      })
    } else {
      playKeySound(key)
      
      nextTick(() => {
        if (isSpeechEnabled.value && key !== ' ') {
          speakLetter(key)
        }
      })
    }
  }
}

const handleEnterKey = async () => {
  if (currentText.value.trim()) {
    playEnterSound()
    
    const lineToSpeak = currentText.value
    completedLines.value.push(currentText.value)
    currentText.value = ''
    
    if (isAutoSpeakEnabled.value && isSpeechEnabled.value) {
      speakLine(lineToSpeak)
    }
    
    await nextTick()
    
    // Scroll to bottom of history after DOM update
    if (historyContainer.value) {
      setTimeout(() => {
        historyContainer.value.scrollTop = historyContainer.value.scrollHeight
      }, 50)
    }
    
    if (typingInput.value) {
      typingInput.value.focus()
    }
  }
}

const onCharacterTyped = (data) => {
  // Additional handling for character typing if needed
}

const onInputFocus = () => {
  isInputFocused.value = true
}

const onInputBlur = () => {
  isInputFocused.value = false
}

const toggleAutoSpeak = () => {
  isAutoSpeakEnabled.value = !isAutoSpeakEnabled.value
}

const toggleCapsLock = () => {
  isCapsLockEnabled.value = !isCapsLockEnabled.value
}

const focusInput = () => {
  if (typingInput.value) {
    typingInput.value.focus()
  }
}

const speakHistoryLine = (line) => {
  if (isSpeechEnabled.value && line.trim()) {
    speakLine(line)
  }
}

onMounted(() => {
  initAudio()
  
  nextTick(() => {
    if (typingInput.value) {
      typingInput.value.focus()
    }
  })
})
</script>

<style scoped>
.typing-app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  position: relative;
}

.header {
  padding: var(--spacing-lg) 0 var(--spacing-md);
  flex-shrink: 0;
}

.controls {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  flex-shrink: 0;
}

.typing-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  padding-bottom: 160px;
}

.lines-history {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  scroll-behavior: smooth;
}

.completed-line {
  opacity: 0.7;
  transition: all var(--transition-slow);
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
  max-width: 100%;
  flex-shrink: 0;
  cursor: pointer;
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
}

.completed-line:hover {
  opacity: 1;
  background-color: rgba(255, 107, 107, 0.1);
  transform: scale(1.02);
}

.line-enter {
  animation: line-move-up 0.5s ease-out;
}

.input-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--color-background);
  border-top: 2px solid var(--color-primary);
  padding: var(--spacing-lg);
  cursor: text;
  z-index: 100;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.1);
}

.current-line-display {
  pointer-events: none;
  position: relative;
  z-index: 5;
  min-height: 4rem;
  display: flex;
  align-items: flex-start;
  user-select: none;
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
  max-width: 100%;
  flex-wrap: wrap;
  margin-bottom: var(--spacing-sm);
}

.input-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
}

.help-text {
  position: fixed;
  bottom: 120px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.9);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  z-index: 50;
}

@keyframes line-move-up {
  0% {
    transform: translateY(100px);
    opacity: 0.3;
  }
  100% {
    transform: translateY(0);
    opacity: 0.7;
  }
}

@media (max-width: 768px) {
  .current-line-display {
    min-height: 4rem;
  }
  
  .controls {
    flex-wrap: wrap;
    gap: var(--spacing-sm);
  }
}
</style>