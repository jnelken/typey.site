<template>
  <div class="input-section" @click="focusInput">
    <div class="current-line-display">
      <AnimatedText
        :text="displayText"
        size="typing"
        font="mono"
        color="primary"
        :animate-on-change="false"
        :show-cursor="false"
        :currently-speaking="currentlySpeaking"
        :speaking-line="speakingLine"
        :speaking-position="speakingPosition"
        :speaking-queue="speakingQueue"
        :ghost-text="displayGhostSuffix"
        :color-mode="isColorModeActive"
        :letter-states="letterStates"
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

    <Transition name="typeahead-fade">
      <span v-if="typeaheadEmoji" class="typeahead-preview" aria-hidden="true">
        {{ typeaheadEmoji }}
      </span>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import Input from '@/ui/Input.vue';
import AnimatedText from '@/ui/AnimatedText.vue';
import { useTypingApp } from '@/composables/useTypingApp';
import { matchTypeahead } from '@/features/easter-eggs/utils/typeahead';
import { suggestCompletion } from '@/features/typing/utils/wordSuggest';
import { toEmojiText } from '@/features/typing/utils/emojiMode';
import { typedLetterStates } from '@/features/typing/utils/spelling';

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
  isEmojiModeEnabled,
  isColorModeActive,
  isWordPromptEnabled,
  promptWord,
} = useTypingApp();

// Colour the line the child is typing the same way the prompt above it is
// coloured — but only while what they're typing is plainly an attempt at that
// word, so a line about dinosaurs isn't painted red and blue for no reason.
const letterStates = computed(() =>
  isWordPromptEnabled.value
    ? typedLetterStates(currentText.value, promptWord.value)
    : null
);

// Gentle hint of the emoji that the current word is about to summon.
const typeaheadEmoji = computed(() => matchTypeahead(currentText.value));

// Ghost text that finishes the word being spelled. Matches the typed case so
// it blends in (caps lock is on by default for this app).
const ghostSuffix = computed(() => {
  const suggestion = suggestCompletion(currentText.value);
  if (!suggestion) return '';
  const lastWord = currentText.value.split(/\s+/).pop();
  const suffix = suggestion.slice(lastWord.length);
  const isUpper = /[A-Z]/.test(lastWord) && lastWord === lastWord.toUpperCase();
  return isUpper ? suffix.toUpperCase() : suffix;
});

// Emoji mode only changes what is drawn. `currentText` stays the real letters,
// so speech, easter eggs and the API submission are unaffected.
const displayText = computed(() =>
  isEmojiModeEnabled.value ? toEmojiText(currentText.value) : currentText.value
);

const displayGhostSuffix = computed(() =>
  isEmojiModeEnabled.value ? toEmojiText(ghostSuffix.value) : ghostSuffix.value
);

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
  transition: background-color 0.5s ease;
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

.typeahead-preview {
  position: absolute;
  top: var(--spacing-lg);
  right: var(--spacing-lg);
  font-size: 2.5rem;
  opacity: 0.35;
  pointer-events: none;
  z-index: 6;
  filter: grayscale(0.2);
}

.typeahead-fade-enter-active,
.typeahead-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.typeahead-fade-enter-from,
.typeahead-fade-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

@media (max-width: 768px) {
  .current-line-display {
    min-height: 4rem;
  }
}
</style>
