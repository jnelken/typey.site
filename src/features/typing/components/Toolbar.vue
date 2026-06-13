<template>
  <div class="toolbar">
    <button class="toolbar-btn" @click="typingApp.toggleGuide(true)">
      <span class="toolbar-icon">✨</span>
      <span class="toolbar-label">Magic Words</span>
    </button>
    <button class="toolbar-btn" @click="settingsOpen = true">
      <span class="toolbar-icon">⚙️</span>
      <span class="toolbar-label">Settings</span>
    </button>

    <SettingsMenu :open="settingsOpen" @close="settingsOpen = false" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import SettingsMenu from './SettingsMenu.vue';
import { useTypingApp } from '@/composables/useTypingApp';

const typingApp = useTypingApp();
const settingsOpen = ref(false);
</script>

<style scoped>
.toolbar {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  flex-shrink: 0;
}
.toolbar-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-lg);
  border: 2px solid var(--color-primary);
  background: transparent;
  color: var(--color-primary);
  font-family: var(--font-family-primary);
  font-weight: 600;
  font-size: var(--font-size-base);
  cursor: pointer;
  transition: all var(--transition-normal);
}
.toolbar-btn:hover {
  transform: translateY(-2px);
  background: var(--color-primary);
  color: white;
  box-shadow: var(--shadow-lg);
}
.toolbar-icon {
  font-size: 1.5em;
  line-height: 1;
}

@media (max-width: 768px) {
  .toolbar {
    flex-wrap: wrap;
    gap: var(--spacing-sm);
  }
}
</style>
