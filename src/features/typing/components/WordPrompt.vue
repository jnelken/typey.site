<template>
  <div v-if="isWordPromptEnabled" class="word-prompt">
    <Text size="sm" align="center" color="light">Type this word:</Text>
    <Text tag="p" size="3xl" align="center" color="primary" weight="bold" font="mono">
      {{ promptWord }}
    </Text>
  </div>
</template>

<script setup>
import Text from '@/ui/Text.vue';
import { useTypingApp } from '@/composables/useTypingApp';

const { promptWord, isWordPromptEnabled } = useTypingApp();
</script>

<style scoped>
.word-prompt {
  flex-shrink: 0;
  padding: var(--spacing-sm) 0;
}
</style>
