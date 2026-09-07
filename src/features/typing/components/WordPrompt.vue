<template>
  <div v-if="isWordPromptEnabled" class="word-prompt">
    <Text size="sm" align="center" color="light" font="mono" :caps="isCapsLockEnabled">
      {{ label }}
    </Text>
    <div class="word-prompt-row">
      <span class="word-prompt-word" :class="{ long: displayWord.length > 8 }">
        <span
          v-for="(letter, index) in letters"
          :key="`${letter.char}-${index}`"
          class="prompt-letter"
          :class="`is-${letter.state}`"
          >{{ letter.char === ' ' ? ' ' : letter.char }}</span
        >
      </span>
      <span class="word-prompt-emoji" aria-hidden="true">{{ promptEmoji }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import Text from '@/ui/Text.vue';
import { useTypingApp } from '@/composables/useTypingApp';
import { promptLetterStates } from '@/features/typing/utils/spelling';

const {
  promptWord,
  promptEmoji,
  promptType,
  isWordPromptEnabled,
  isCapsLockEnabled,
  currentText,
} = useTypingApp();

// The prompt is what the child copies, so it has to be spelled the way their
// keystrokes will land: caps lock on means the letters they see are the
// letters they'll type.
const displayWord = computed(() =>
  isCapsLockEnabled.value ? promptWord.value.toUpperCase() : promptWord.value
);

// Each letter lights up as it's spelled. The untyped letters have to be dim
// for this to read at all — the prompt's own colour is already the "right"
// red, so without the dim state nothing appears to change.
const letters = computed(() => {
  const states = promptLetterStates(currentText.value, promptWord.value);
  return Array.from(displayWord.value, (char, index) => ({
    char,
    state: states[index] ?? 'untyped',
  }));
});

// "Type this word: 5" reads wrong, so the label follows what's being asked for.
const LABELS = {
  number: 'Type this number:',
  dollars: 'Type this amount:',
  word: 'Type this word:',
};
const label = computed(() => LABELS[promptType.value] ?? LABELS.word);
</script>

<style scoped>
.word-prompt {
  flex-shrink: 0;
  padding: var(--spacing-md) 0 var(--spacing-lg);
}

.word-prompt-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

/* The word the child is copying is the biggest thing on the page. Clamped
 * against viewport width so "traffic light" doesn't run off a phone. */
.word-prompt-word {
  font-family: var(--font-family-mono);
  font-weight: 700;
  line-height: 1.1;
  font-size: clamp(2.25rem, 11vw, 5rem);
  letter-spacing: 0.02em;
}

.word-prompt-word.long {
  font-size: clamp(1.5rem, 7vw, 3.25rem);
}

.prompt-letter {
  transition: color 0.15s ease;
}

/* Typed correctly. */
.prompt-letter.is-right {
  color: var(--color-primary);
}

/* Typed, but not the letter that belongs here. */
.prompt-letter.is-wrong {
  color: var(--color-mistake);
}

/* Still to come. */
.prompt-letter.is-untyped {
  color: var(--color-text-light);
}

.word-prompt-emoji {
  font-size: clamp(2rem, 8vw, 3.5rem);
  line-height: 1;
}
</style>
