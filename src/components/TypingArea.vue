<template>
  <div class="typing-area">
    <div class="lines-history" ref="historyContainer">
      <div
        v-for="(line, index) in completedLines"
        :key="`line-${index}`"
        class="completed-line"
        :class="{ 'line-enter': index === completedLines.length - 1 }"
        @click="speakHistoryLine(line)">
        <Text size="typing" font="mono" color="secondary">
          {{ line }}
        </Text>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue';
import Text from '../ui/Text.vue';
import { useTypingApp } from '../composables/useTypingApp';

const { completedLines, speakHistoryLine } = useTypingApp();

const historyContainer = ref(null);

watch(
  () => completedLines.value.length,
  async () => {
    await nextTick();

    // Scroll to bottom of history after DOM update
    if (historyContainer.value) {
      setTimeout(() => {
        historyContainer.value.scrollTop = historyContainer.value.scrollHeight;
      }, 50);
    }
  },
);
</script>

<style scoped>
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
</style>
