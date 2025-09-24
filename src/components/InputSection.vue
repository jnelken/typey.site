<template>
  <div class="input-section" @click="focusInput">
    <div class="current-line-display">
      <AnimatedText
        :text="currentText"
        size="typing"
        font="mono"
        color="primary"
        :animate-on-change="false"
        :show-cursor="false"
        :currently-speaking="currentlySpeaking"
        :speaking-line="speakingLine"
        :speaking-position="speakingPosition"
        :speaking-queue="speakingQueue"
        @character-typed="onCharacterTyped" />
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
        @blur="onInputBlur" />
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue';
import Input from '../ui/Input.vue';
import AnimatedText from '../ui/AnimatedText.vue';
import { useTypingApp } from '../composables/useTypingApp';

const {
  currentText,
  isInputFocused,
  onKeyDown,
  onInputFocus,
  onInputBlur,
  onCharacterTyped,
  currentlySpeaking,
  speakingLine,
  speakingPosition,
  speakingQueue,
} = useTypingApp();

const typingInput = ref(null);

const focusInput = () => {
  if (typingInput.value) {
    typingInput.value.focus();
  }
};

// Expose focus method for parent component
defineExpose({
  focus: focusInput,
});
</script>

<style scoped>
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

@media (max-width: 768px) {
  .current-line-display {
    min-height: 4rem;
  }
}
</style>
