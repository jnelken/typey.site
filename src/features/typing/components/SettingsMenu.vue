<template>
  <Modal :open="open" title="⚙️ Settings" @close="$emit('close')">
    <div class="settings-list">
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
  </Modal>
</template>

<script setup>
import Modal from '@/ui/Modal.vue';
import ToggleButton from '@/ui/ToggleButton.vue';
import { useTypingApp } from '@/composables/useTypingApp';

defineProps({
  open: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['close']);

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
.settings-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  align-items: stretch;
}
</style>
