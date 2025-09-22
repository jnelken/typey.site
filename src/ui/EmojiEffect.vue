<template>
  <div class="emoji" :class="effectClass" :style="rootStyle">{{ effect.emoji }}</div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  effect: {
    type: Object,
    required: true,
  },
});

const effectClass = computed(() => {
  const t = props.effect.type || 'float';
  const dir = props.effect.direction || 'right';
  return {
    'effect-rain': t === 'rain',
    'effect-float': t === 'float',
    'effect-run': t === 'run',
    'run-right': t === 'run' && dir === 'right',
    'run-left': t === 'run' && dir === 'left',
    'effect-burst': t === 'burst',
  };
});

const rootStyle = computed(() => {
  const e = props.effect;
  const duration = `${e.duration || 4000}ms`;
  const delay = `${e.delay || 0}ms`;
  const fontSize = `${e.size || 32}px`;
  const left = e.left || '50%';
  const top = e.top || '50%';
  const dir = e.direction || 'right';
  return {
    left,
    top,
    fontSize,
    '--dur': duration,
    '--delay': delay,
    '--dir': dir,
  };
});
</script>

<style scoped>
.emoji {
  position: fixed;
  z-index: 1001;
  pointer-events: none;
  animation-duration: var(--dur, 4000ms);
  animation-delay: var(--delay, 0ms);
}

/* Rain: fall from above to below */
.effect-rain {
  top: -10vh;
  animation-name: emoji-rain;
  animation-timing-function: linear;
  will-change: transform, opacity;
}

@keyframes emoji-rain {
  0% { transform: translateY(-10vh); opacity: 0.9; }
  100% { transform: translateY(110vh); opacity: 1; }
}

/* Float: rise gently */
.effect-float {
  bottom: -10vh;
  animation-name: emoji-float;
  animation-timing-function: cubic-bezier(0.3, 0.1, 0.4, 1);
}

@keyframes emoji-float {
  0% { transform: translateY(10vh); opacity: 0.8; }
  100% { transform: translateY(-100vh); opacity: 1; }
}

/* Run: traverse across screen horizontally */
.effect-run {
  top: auto;
  bottom: 10vh;
  animation-timing-function: linear;
}

.effect-run.run-right { animation-name: emoji-run-right; }
.effect-run.run-left { animation-name: emoji-run-left; }

@keyframes emoji-run-right {
  0% { transform: translateX(-120vw); }
  100% { transform: translateX(120vw); }
}

@keyframes emoji-run-left {
  0% { transform: translateX(120vw); }
  100% { transform: translateX(-120vw); }
}

/* Burst: small outward pop with fade */
.effect-burst {
  animation-name: emoji-burst;
  animation-timing-function: ease-out;
}

@keyframes emoji-burst {
  0% { transform: scale(0.6); opacity: 0; }
  30% { transform: scale(1); opacity: 1; }
  100% { transform: scale(1.1); opacity: 0; }
}
</style>
