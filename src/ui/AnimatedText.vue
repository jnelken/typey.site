<template>
  <Text
    :tag="tag"
    :size="size"
    :color="color"
    :align="align"
    :font="font"
    class="animated-text">
    <span
      v-for="(char, index) in characters"
      :key="`${char}-${index}`"
      :class="getCharacterClass(index)"
      :style="getCharacterStyle(index)">
      {{ char === ' ' ? '\u00A0' : char }}
    </span>
    <span
      v-if="showCursor"
      class="cursor"
      :class="{ 'cursor-blink': !isTyping }"
      >|</span
    >
  </Text>
</template>

<script setup>
import { computed, ref, watch, nextTick } from 'vue';
import Text from './Text.vue';

const props = defineProps({
  text: {
    type: String,
    default: '',
  },
  tag: {
    type: String,
    default: 'p',
  },
  size: {
    type: String,
    default: 'typing',
  },
  color: {
    type: String,
    default: 'primary',
  },
  align: {
    type: String,
    default: 'left',
  },
  font: {
    type: String,
    default: 'mono',
  },
  showCursor: {
    type: Boolean,
    default: true,
  },
  typewriterSpeed: {
    type: Number,
    default: 50,
  },
  animateOnChange: {
    type: Boolean,
    default: true,
  },
  currentlySpeaking: {
    type: String,
    default: null,
  },
  speakingLine: {
    type: String,
    default: null,
  },
  speakingPosition: {
    type: Number,
    default: 0,
  },
  speakingQueue: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['typing-complete', 'character-typed']);

const displayedText = ref('');
const isTyping = ref(false);
const typingTimeout = ref(null);

const characters = computed(() => {
  return displayedText.value.split('');
});

const getCharacterClass = index => {
  const char = displayedText.value[index];
  const isBeingSpoken = props.currentlySpeaking === char;
  const isInSpeakingQueue = props.speakingQueue.includes(char);

  // For historical lines, check if this character should be highlighted
  const isInSpeakingLine = props.speakingLine === displayedText.value;

  // Check if this character is within the current word being spoken
  const isInCurrentWord = isInSpeakingLine && index >= props.speakingPosition;

  // Find the end of the current word by looking for the next space or end of text
  let wordEndIndex = displayedText.value.length;
  for (let i = props.speakingPosition; i < displayedText.value.length; i++) {
    if (/\s/.test(displayedText.value[i])) {
      wordEndIndex = i;
      break;
    }
  }

  const isHistoricalHighlight = isInCurrentWord && index < wordEndIndex;

  // Debug logging for troubleshooting
  if (isInSpeakingLine && index === props.speakingPosition) {
    console.log('Highlighting word:', {
      text: displayedText.value,
      speakingPosition: props.speakingPosition,
      wordEndIndex,
      char: displayedText.value[index],
      isHistoricalHighlight,
    });
  }

  return [
    'character',
    {
      'character-new':
        index === displayedText.value.length - 1 && isTyping.value,
      'character-speaking':
        isBeingSpoken || isInSpeakingQueue || isHistoricalHighlight,
    },
  ];
};

const getCharacterStyle = index => {
  const char = displayedText.value[index];
  const isBeingSpoken = props.currentlySpeaking === char;
  const isInSpeakingQueue = props.speakingQueue.includes(char);

  // For historical lines, check if this character should be highlighted
  const isInSpeakingLine = props.speakingLine === displayedText.value;

  // Check if this character is within the current word being spoken
  const isInCurrentWord = isInSpeakingLine && index >= props.speakingPosition;

  // Find the end of the current word by looking for the next space or end of text
  let wordEndIndex = displayedText.value.length;
  for (let i = props.speakingPosition; i < displayedText.value.length; i++) {
    if (/\s/.test(displayedText.value[i])) {
      wordEndIndex = i;
      break;
    }
  }

  const isHistoricalHighlight = isInCurrentWord && index < wordEndIndex;

  if (
    props.animateOnChange &&
    index === displayedText.value.length - 1 &&
    isTyping.value
  ) {
    return {
      animation: 'character-appear 0.3s ease-out',
    };
  }

  if (isBeingSpoken || isInSpeakingQueue || isHistoricalHighlight) {
    return {
      animation: 'character-speak 0.5s ease-in-out',
    };
  }

  return {};
};

const typeNextCharacter = async () => {
  if (displayedText.value.length < props.text.length) {
    const nextChar = props.text[displayedText.value.length];
    displayedText.value += nextChar;

    emit('character-typed', {
      character: nextChar,
      index: displayedText.value.length - 1,
      isComplete: displayedText.value.length === props.text.length,
    });

    if (displayedText.value.length < props.text.length) {
      typingTimeout.value = setTimeout(
        typeNextCharacter,
        props.typewriterSpeed,
      );
    } else {
      isTyping.value = false;
      emit('typing-complete');
    }
  }
};

const startTyping = () => {
  if (typingTimeout.value) {
    clearTimeout(typingTimeout.value);
  }

  displayedText.value = '';
  isTyping.value = true;

  if (props.text.length > 0) {
    typeNextCharacter();
  } else {
    isTyping.value = false;
  }
};

const stopTyping = () => {
  if (typingTimeout.value) {
    clearTimeout(typingTimeout.value);
    typingTimeout.value = null;
  }
  isTyping.value = false;
};

const setInstantText = () => {
  stopTyping();
  displayedText.value = props.text;
  isTyping.value = false;
};

watch(
  () => props.text,
  newText => {
    if (props.animateOnChange) {
      startTyping();
    } else {
      displayedText.value = newText;
    }
  },
  { immediate: true },
);

defineExpose({
  startTyping,
  stopTyping,
  setInstantText,
  isTyping: computed(() => isTyping.value),
});
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

.character-speaking {
  color: var(--color-primary);
  font-weight: bold;
  text-shadow: 0 0 8px var(--color-primary);
  transform: scale(1.1);
  transition: all 0.2s ease-in-out;
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
  0%,
  50% {
    opacity: 1;
  }
  51%,
  100% {
    opacity: 0;
  }
}

@keyframes character-speak {
  0% {
    transform: scale(1);
    text-shadow: 0 0 0 var(--color-primary);
  }
  50% {
    transform: scale(1.2);
    text-shadow: 0 0 12px var(--color-primary);
  }
  100% {
    transform: scale(1.1);
    text-shadow: 0 0 8px var(--color-primary);
  }
}
</style>
