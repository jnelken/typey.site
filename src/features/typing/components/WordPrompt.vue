<template>
  <div v-if="isWordPromptEnabled" class="word-prompt">
    <Text size="sm" align="center" color="light">Type this word:</Text>
    <div class="word-prompt-row">
      <Text tag="span" size="3xl" color="primary" weight="bold" font="mono">
        {{ promptWord }}
      </Text>
      <span class="word-prompt-emoji" aria-hidden="true">{{ promptEmoji }}</span>
    </div>
  </div>
</template>

<script setup>
import Text from '@/ui/Text.vue';
import { useTypingApp } from '@/composables/useTypingApp';

const { promptWord, promptEmoji, isWordPromptEnabled } = useTypingApp();
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
