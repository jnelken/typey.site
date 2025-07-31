<template>
  <div class="controls">
    <ToggleButton
      label="Sound"
      enabled-icon="🔊"
      disabled-icon="🔇"
      :is-enabled="isSoundEnabled"
      @toggle="toggleSound" />
    <ToggleButton
      label="Speech"
      enabled-icon="🗣️"
      disabled-icon="🤫"
      :is-enabled="isSpeechEnabled"
      @toggle="toggleSpeech" />
    <ToggleButton
      label="Auto-Speak"
      enabled-icon="📢"
      disabled-icon="📵"
      :is-enabled="isAutoSpeakEnabled"
      @toggle="toggleAutoSpeak" />
    <ToggleButton
      :label="isCapsLockEnabled ? 'CAPS' : 'caps'"
      enabled-icon="🔠"
      disabled-icon="🔡"
      :is-enabled="isCapsLockEnabled"
      @toggle="toggleCapsLock" />
  </div>
</template>

<script setup>
import ToggleButton from '../ui/ToggleButton.vue';
import { useTypingApp } from '../composables/useTypingApp';

const {
  isSoundEnabled,
  isSpeechEnabled,
  isAutoSpeakEnabled,
  isCapsLockEnabled,
  toggleSound,
  toggleSpeech,
  toggleAutoSpeak,
  toggleCapsLock,
} = useTypingApp();
</script>

<style scoped>
.controls {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .controls {
    flex-wrap: wrap;
    gap: var(--spacing-sm);
  }
}
</style>
