<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="buttonClasses"
    @click="handleClick"
  >
    <slot />
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'button'
  },
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'tertiary', 'ghost'].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg', 'xl'].includes(value)
  },
  disabled: {
    type: Boolean,
    default: false
  },
  fullWidth: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])

const buttonClasses = computed(() => [
  'button-base',
  `button-${props.variant}`,
  `button-${props.size}`,
  {
    'button-disabled': props.disabled,
    'button-full-width': props.fullWidth
  }
])

const handleClick = (event) => {
  if (!props.disabled) {
    emit('click', event)
  }
}
</script>

<style scoped>
.button-base {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-lg);
  font-family: var(--font-family-primary);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
  border: 2px solid transparent;
  text-decoration: none;
  outline: none;
}

.button-base:hover:not(.button-disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.button-base:active:not(.button-disabled) {
  transform: translateY(0);
}

.button-disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

.button-full-width {
  width: 100%;
}

/* Button variants */
.button-primary {
  background-color: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.button-primary:hover:not(.button-disabled) {
  background-color: color-mix(in srgb, var(--color-primary) 90%, black);
}

.button-secondary {
  background-color: var(--color-secondary);
  color: white;
  border-color: var(--color-secondary);
}

.button-secondary:hover:not(.button-disabled) {
  background-color: color-mix(in srgb, var(--color-secondary) 90%, black);
}

.button-tertiary {
  background-color: var(--color-tertiary);
  color: var(--color-text-primary);
  border-color: var(--color-tertiary);
}

.button-tertiary:hover:not(.button-disabled) {
  background-color: color-mix(in srgb, var(--color-tertiary) 90%, black);
}

.button-ghost {
  background-color: transparent;
  color: var(--color-primary);
  border-color: var(--color-primary);
}

.button-ghost:hover:not(.button-disabled) {
  background-color: var(--color-primary);
  color: white;
}

/* Button sizes */
.button-sm {
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--font-size-sm);
  gap: var(--spacing-xs);
}

.button-md {
  padding: var(--spacing-md) var(--spacing-lg);
  font-size: var(--font-size-base);
  gap: var(--spacing-sm);
}

.button-lg {
  padding: var(--spacing-lg) var(--spacing-xl);
  font-size: var(--font-size-lg);
  gap: var(--spacing-md);
}

.button-xl {
  padding: var(--spacing-xl) var(--spacing-2xl);
  font-size: var(--font-size-xl);
  gap: var(--spacing-lg);
}
</style>