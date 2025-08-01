<template>
  <div
    class="typing-area"
    :style="{
      '--typing-area-bottom-margin': `${LAYOUT_CONSTANTS.TYPING_AREA_BOTTOM_MARGIN}px`,
      '--lines-history-max-height': LAYOUT_CONSTANTS.LINES_HISTORY_MAX_HEIGHT,
    }">
    <div class="lines-history" ref="historyContainer">
      <div
        v-for="(line, index) in completedLines"
        :key="`line-${index}`"
        class="completed-line"
        :class="{ 'line-enter': index === completedLines.length - 1 }"
        @click="speakHistoryLine(line)">
        <AnimatedText
          :text="line"
          size="typing"
          font="mono"
          color="secondary"
          :animate-on-change="false"
          :show-cursor="false"
          :currently-speaking="currentlySpeaking"
          :speaking-line="speakingLine"
          :speaking-position="speakingPosition"
          :speaking-queue="speakingQueue" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue';
import Text from '../ui/Text.vue';
import AnimatedText from '../ui/AnimatedText.vue';
import { useTypingApp } from '../composables/useTypingApp';
import { LAYOUT_CONSTANTS } from '../constants/layout';

const {
  completedLines,
  speakHistoryLine,
  currentlySpeaking,
  speakingLine,
  speakingPosition,
  speakingQueue,
} = useTypingApp();

const historyContainer = ref(null);

watch(
  () => completedLines.value.length,
  async () => {
    await nextTick();

    // Scroll to bottom to show most recent content (messaging app UX)
    if (historyContainer.value) {
      historyContainer.value.scrollTop = historyContainer.value.scrollHeight;
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
  margin-bottom: var(--typing-area-bottom-margin);
}

.lines-history {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: var(--spacing-md);
  scroll-behavior: smooth;
  max-height: var(--lines-history-max-height);
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
