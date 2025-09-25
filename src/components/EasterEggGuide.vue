<template>
  <div
    v-if="typingApp.guideVisible.value"
    class="guide-overlay"
    @click.self="typingApp.toggleGuide(false)">
    <div class="guide-panel">
      <div class="guide-header">
        <h2>Easter Eggs</h2>
        <button class="close-btn" @click="typingApp.toggleGuide(false)">
          ✕
        </button>
      </div>
      <p class="guide-sub">Type words to reveal the blanks!</p>
      <p style="font-size: 12px; color: #666">
        Debug:
        {{
          typingApp.allHints ? typingApp.allHints.value.length : 'undefined'
        }}
        hints found
      </p>
      <p style="font-size: 12px; color: #666">
        First few hints:
        {{
          typingApp.allHints
            ? typingApp.allHints.value.slice(0, 5).join(', ')
            : 'none'
        }}
      </p>
      <ul class="guide-list">
        <li v-for="hint in typingApp.allHints.value" :key="hint">
          <span
            class="hint"
            :class="{ found: typingApp.isHintDiscovered(hint) }">
            {{
              typingApp.isHintDiscovered(hint) ? hint : typingApp.maskHint(hint)
            }}
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { useTypingApp } from '@/composables/useTypingApp';
import { watch } from 'vue';

const typingApp = useTypingApp();

// Debug: watch for guide visibility changes
watch(
  () => typingApp.guideVisible.value,
  newVal => {
    console.log('Guide visibility changed:', newVal);
  },
);
</script>

<style scoped>
.guide-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1500;
  display: flex;
  align-items: center;
  justify-content: center;
}
.guide-panel {
  background: rgba(255, 255, 255, 0.95);
  width: min(720px, 92vw);
  max-height: 80vh;
  border-radius: 12px;
  padding: 16px 20px;
  overflow: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}
.guide-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.guide-header h2 {
  margin: 0;
  font-size: 20px;
}
.guide-sub {
  margin: 6px 0 12px 0;
  color: #444;
}
.close-btn {
  border: none;
  background: transparent;
  font-size: 18px;
  cursor: pointer;
}
.guide-list {
  list-style: none;
  padding: 0;
  margin: 0;
  columns: 2;
  column-gap: 24px;
}
.guide-list li {
  padding: 6px 0;
  break-inside: avoid;
}
.hint {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
    'Liberation Mono', 'Courier New', monospace;
}
.hint.found {
  color: #0a7;
  font-weight: 600;
}
</style>
