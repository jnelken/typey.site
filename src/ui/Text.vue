<template>
  <component 
    :is="tag" 
    :class="textClasses"
    :style="customStyles"
  >
    <slot />
  </component>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  tag: {
    type: String,
    default: 'p'
  },
  size: {
    type: String,
    default: 'base',
    validator: (value) => [
      'xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', 
      '4xl', '5xl', '6xl', 'typing'
    ].includes(value)
  },
  weight: {
    type: String,
    default: 'normal',
    validator: (value) => ['normal', 'bold', 'light'].includes(value)
  },
  color: {
    type: String,
    default: 'primary'
  },
  align: {
    type: String,
    default: 'left',
    validator: (value) => ['left', 'center', 'right'].includes(value)
  },
  font: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'mono'].includes(value)
  }
})

const textClasses = computed(() => [
  'text-component',
  `text-${props.size}`,
  `text-weight-${props.weight}`,
  `text-align-${props.align}`,
  `text-font-${props.font}`
])

const customStyles = computed(() => ({
  color: `var(--color-text-${props.color})`
}))
</script>

<style scoped>
.text-component {
  margin: 0;
  line-height: 1.2;
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
  max-width: 100%;
}

/* Font sizes */
.text-xs { font-size: var(--font-size-xs); }
.text-sm { font-size: var(--font-size-sm); }
.text-base { font-size: var(--font-size-base); }
.text-lg { font-size: var(--font-size-lg); }
.text-xl { font-size: var(--font-size-xl); }
.text-2xl { font-size: var(--font-size-2xl); }
.text-3xl { font-size: var(--font-size-3xl); }
.text-4xl { font-size: var(--font-size-4xl); }
.text-5xl { font-size: var(--font-size-5xl); }
.text-6xl { font-size: var(--font-size-6xl); }
.text-typing { font-size: var(--font-size-typing); }

/* Font weights */
.text-weight-light { font-weight: 300; }
.text-weight-normal { font-weight: 400; }
.text-weight-bold { font-weight: 700; }

/* Text alignment */
.text-align-left { text-align: left; }
.text-align-center { text-align: center; }
.text-align-right { text-align: right; }

/* Font families */
.text-font-primary { font-family: var(--font-family-primary); }
.text-font-mono { font-family: var(--font-family-mono); }
</style>