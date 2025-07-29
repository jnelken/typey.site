<template>
  <div class="input-wrapper">
    <input
      ref="inputRef"
      v-model="inputValue"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :class="inputClasses"
      @input="handleInput"
      @keydown="handleKeydown"
      @focus="handleFocus"
      @blur="handleBlur"
    />
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'text'
  },
  placeholder: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg', 'xl'].includes(value)
  },
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'typing'].includes(value)
  },
  autofocus: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'keydown', 'focus', 'blur', 'input'])

const inputRef = ref(null)
const isFocused = ref(false)

const inputValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const inputClasses = computed(() => [
  'input-base',
  `input-${props.size}`,
  `input-${props.variant}`,
  {
    'input-focused': isFocused.value,
    'input-disabled': props.disabled
  }
])

const handleInput = (event) => {
  emit('input', event)
}

const handleKeydown = (event) => {
  emit('keydown', event)
}

const handleFocus = (event) => {
  isFocused.value = true
  emit('focus', event)
}

const handleBlur = (event) => {
  isFocused.value = false
  emit('blur', event)
}

const focus = () => {
  nextTick(() => {
    inputRef.value?.focus()
  })
}

defineExpose({
  focus,
  inputRef
})
</script>

<style scoped>
.input-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.input-base {
  width: 100%;
  border: 2px solid var(--color-text-light);
  border-radius: var(--radius-lg);
  background-color: var(--color-surface);
  color: var(--color-text-primary);
  font-family: var(--font-family-primary);
  transition: border-color var(--transition-normal), box-shadow var(--transition-normal);
  outline: none;
}

.input-base:hover {
  border-color: var(--color-secondary);
}

.input-focused,
.input-base:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.1);
}

.input-disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: var(--color-background);
}

/* Input sizes */
.input-sm {
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--font-size-sm);
}

.input-md {
  padding: var(--spacing-md) var(--spacing-lg);
  font-size: var(--font-size-base);
}

.input-lg {
  padding: var(--spacing-lg) var(--spacing-xl);
  font-size: var(--font-size-lg);
}

.input-xl {
  padding: var(--spacing-xl) var(--spacing-2xl);
  font-size: var(--font-size-xl);
}

/* Typing variant - invisible input for seamless typing experience */
.input-typing {
  background: transparent;
  border: none;
  font-size: var(--font-size-typing);
  font-family: var(--font-family-mono);
  caret-color: var(--color-primary);
  color: transparent;
  position: absolute;
  z-index: 10;
}

.input-typing:focus {
  box-shadow: none;
}
</style>