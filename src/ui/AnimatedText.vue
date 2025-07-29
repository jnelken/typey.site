<template>
  <Text 
    :tag="tag"
    :size="size"
    :color="color"
    :align="align"
    :font="font"
    class="animated-text"
  >
    <span
      v-for="(char, index) in characters"
      :key="`${char}-${index}`"
      :class="getCharacterClass(index)"
      :style="getCharacterStyle(index)"
    >
      {{ char === ' ' ? '\u00A0' : char }}
    </span>
    <span 
      v-if="showCursor"
      class="cursor"
      :class="{ 'cursor-blink': !isTyping }"
    >|</span>
  </Text>
</template>

<script setup>
import { computed, ref, watch, nextTick } from 'vue'
import Text from './Text.vue'

const props = defineProps({
  text: {
    type: String,
    default: ''
  },
  tag: {
    type: String,
    default: 'p'
  },
  size: {
    type: String,
    default: 'typing'
  },
  color: {
    type: String,
    default: 'primary'
  },
  align: {
    type: String,
    default: 'left'
  },
  font: {
    type: String,
    default: 'mono'
  },
  showCursor: {
    type: Boolean,
    default: true
  },
  typewriterSpeed: {
    type: Number,
    default: 50
  },
  animateOnChange: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['typing-complete', 'character-typed'])

const displayedText = ref('')
const isTyping = ref(false)
const typingTimeout = ref(null)

const characters = computed(() => {
  return displayedText.value.split('')
})

const getCharacterClass = (index) => {
  return [
    'character',
    {
      'character-new': index === displayedText.value.length - 1 && isTyping.value
    }
  ]
}

const getCharacterStyle = (index) => {
  if (props.animateOnChange && index === displayedText.value.length - 1 && isTyping.value) {
    return {
      animation: 'character-appear 0.3s ease-out'
    }
  }
  return {}
}

const typeNextCharacter = async () => {
  if (displayedText.value.length < props.text.length) {
    const nextChar = props.text[displayedText.value.length]
    displayedText.value += nextChar
    
    emit('character-typed', {
      character: nextChar,
      index: displayedText.value.length - 1,
      isComplete: displayedText.value.length === props.text.length
    })
    
    if (displayedText.value.length < props.text.length) {
      typingTimeout.value = setTimeout(typeNextCharacter, props.typewriterSpeed)
    } else {
      isTyping.value = false
      emit('typing-complete')
    }
  }
}

const startTyping = () => {
  if (typingTimeout.value) {
    clearTimeout(typingTimeout.value)
  }
  
  displayedText.value = ''
  isTyping.value = true
  
  if (props.text.length > 0) {
    typeNextCharacter()
  } else {
    isTyping.value = false
  }
}

const stopTyping = () => {
  if (typingTimeout.value) {
    clearTimeout(typingTimeout.value)
    typingTimeout.value = null
  }
  isTyping.value = false
}

const setInstantText = () => {
  stopTyping()
  displayedText.value = props.text
  isTyping.value = false
}

watch(() => props.text, (newText) => {
  if (props.animateOnChange) {
    startTyping()
  } else {
    displayedText.value = newText
  }
}, { immediate: true })

defineExpose({
  startTyping,
  stopTyping,
  setInstantText,
  isTyping: computed(() => isTyping.value)
})
</script>

<style scoped>
.animated-text {
  position: relative;
  min-height: 1em;
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
  max-width: 100%;
  width: 100%;
}

.character {
  display: inline;
  position: relative;
}

.character-new {
  animation: character-appear 0.3s ease-out;
}

.cursor {
  color: var(--color-primary);
  font-weight: bold;
  margin-left: 2px;
}

.cursor-blink {
  animation: cursor-blink 1s infinite;
}

@keyframes character-appear {
  0% {
    opacity: 0;
    transform: scale(1.2);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes cursor-blink {
  0%, 50% {
    opacity: 1;
  }
  51%, 100% {
    opacity: 0;
  }
}
</style>