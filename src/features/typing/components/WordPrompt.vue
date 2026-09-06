<template>
  <div v-if="isWordPromptEnabled" class="word-prompt">
    <Text size="sm" align="center" color="light">{{ label }}</Text>
    <div class="word-prompt-row">
      <Text tag="span" size="3xl" color="primary" weight="bold" font="mono">
        {{ displayWord }}
      </Text>
      <span class="word-prompt-emoji" aria-hidden="true">{{ promptEmoji }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import Text from '@/ui/Text.vue';
import { useTypingApp } from '@/composables/useTypingApp';

const {
  promptWord,
  promptEmoji,
  promptType,
  isWordPromptEnabled,
  isCapsLockEnabled,
} = useTypingApp();

// The prompt is what the child copies, so it has to be spelled the way their
// keystrokes will land: caps lock on means the letters they see are the
// letters they'll type.
const displayWord = computed(() =>
  isCapsLockEnabled.value ? promptWord.value.toUpperCase() : promptWord.value
);

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
  padding: var(--spacing-sm) 0;
}

.word-prompt-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
}

.word-prompt-emoji {
  font-size: 2rem;
  line-height: 1;
}
</style>
