<template>
  <div class="toolbar" :class="{ caps: typingApp.isCapsLockEnabled.value }">
    <button class="toolbar-btn" @click="typingApp.toggleGuide(true)">
      <span class="toolbar-icon">✨</span>
      <span class="toolbar-label">Words</span>
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
  align-items: center;
  gap: var(--spacing-sm);
  flex-shrink: 0;
}
.toolbar-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-full);
  border: 2px solid var(--color-primary);
  background: transparent;
  color: var(--color-primary);
  /* The typing font, like everything else the child reads on this page. */
  font-family: var(--font-family-mono);
  font-weight: 700;
  font-size: var(--font-size-sm);
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
  font-size: 1.3em;
  line-height: 1;
}
.toolbar.caps .toolbar-label {
  text-transform: uppercase;
}

/* On a narrow screen the icons carry it on their own. */
@media (max-width: 560px) {
  .toolbar-label {
    display: none;
  }
  .toolbar-btn {
    padding: var(--spacing-xs) var(--spacing-sm);
  }
}
</style>
