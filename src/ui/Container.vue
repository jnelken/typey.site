<template>
  <div :class="containerClasses">
    <slot />
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  maxWidth: {
    type: String,
    default: 'default',
    validator: (value) => ['none', 'sm', 'md', 'lg', 'xl', 'default', 'full'].includes(value)
  },
  padding: {
    type: String,
    default: 'md',
    validator: (value) => ['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'].includes(value)
  },
  center: {
    type: Boolean,
    default: false
  },
  height: {
    type: String,
    default: 'auto',
    validator: (value) => ['auto', 'full', 'screen'].includes(value)
  }
})

const containerClasses = computed(() => [
  'container-base',
  `container-max-width-${props.maxWidth}`,
  `container-padding-${props.padding}`,
  `container-height-${props.height}`,
  {
    'container-center': props.center
  }
])
</script>

<style scoped>
.container-base {
  width: 100%;
  position: relative;
}

.container-center {
  margin-left: auto;
  margin-right: auto;
}

/* Max widths */
.container-max-width-none {
  max-width: none;
}

.container-max-width-sm {
  max-width: 640px;
}

.container-max-width-md {
  max-width: 768px;
}

.container-max-width-lg {
  max-width: 1024px;
}

.container-max-width-xl {
  max-width: 1280px;
}

.container-max-width-default {
  max-width: var(--max-width);
}

.container-max-width-full {
  max-width: 100%;
}

/* Padding */
.container-padding-none {
  padding: 0;
}

.container-padding-xs {
  padding: var(--spacing-xs);
}

.container-padding-sm {
  padding: var(--spacing-sm);
}

.container-padding-md {
  padding: var(--spacing-md);
}

.container-padding-lg {
  padding: var(--spacing-lg);
}

.container-padding-xl {
  padding: var(--spacing-xl);
}

.container-padding-2xl {
  padding: var(--spacing-2xl);
}

.container-padding-3xl {
  padding: var(--spacing-3xl);
}

/* Heights */
.container-height-auto {
  height: auto;
}

.container-height-full {
  height: 100%;
}

.container-height-screen {
  min-height: 100vh;
}
</style>