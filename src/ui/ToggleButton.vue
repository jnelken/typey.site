<template>
  <Button variant="ghost" size="sm" @click="$emit('toggle')">
    <span class="toggle-button-content">
      <span class="toggle-icon">{{
        isEnabled ? enabledIcon : disabledIcon
      }}</span>
      <span class="toggle-label">{{ label }}</span>
    </span>
  </Button>
</template>

<script setup>
import Button from './Button.vue';

defineProps({
  label: {
    type: String,
    required: true,
  },
  enabledIcon: {
    type: String,
    required: true,
  },
  disabledIcon: {
    type: String,
    required: true,
  },
  isEnabled: {
    type: Boolean,
    required: true,
  },
});

defineEmits(['toggle']);
</script>

<style scoped>
.toggle-button-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  min-width: 120px;
  justify-content: center;
}

.toggle-icon {
  font-size: 2em;
  line-height: 1;
}

.toggle-label {
  font-size: inherit;
}
</style>
