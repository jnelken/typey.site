<template>
  <div v-if="open" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-panel">
      <div class="modal-header">
        <h2>{{ title }}</h2>
        <button class="modal-close" aria-label="Close" @click="$emit('close')">
          ✕
        </button>
      </div>
      <slot />
    </div>
  </div>
</template>

<script setup>
defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
});

defineEmits(['close']);
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1500;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-panel {
  background: rgba(255, 255, 255, 0.97);
  width: min(720px, 92vw);
  max-height: 80vh;
  border-radius: 16px;
  padding: 16px 20px 24px;
  overflow: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.modal-header h2 {
  margin: 0;
  font-size: 24px;
}
.modal-close {
  border: none;
  background: transparent;
  font-size: 20px;
  cursor: pointer;
  line-height: 1;
}
</style>
