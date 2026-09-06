<template>
  <div class="emoji" :class="effectClass" :style="rootStyle">
    <span class="emoji-inner" :class="{ rotate: effect.rotate }" :style="innerStyle">{{ effect.emoji }}</span>
  </div>
  </template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  effect: {
    type: Object,
    required: true,
  },
});

// Effects that travel sideways need to know which way they're headed.
const TRAVELLING = ['run', 'arc'];

const effectClass = computed(() => {
  const type = props.effect.type || 'float';
  const dir = props.effect.direction === 'left' ? 'left' : 'right';
  return [`effect-${type}`, TRAVELLING.includes(type) ? `go-${dir}` : null].filter(Boolean);
});

const rootStyle = computed(() => {
  const e = props.effect;
  const duration = `${e.duration || 4000}ms`;
  const delay = `${e.delay || 0}ms`;
  const fontSize = `${e.size || 32}px`;
  const left = e.left || '50%';
  const dir = e.direction || 'right';
  const style = {
    left,
    fontSize,
    '--dur': duration,
    '--delay': delay,
    '--dir': dir,
  };
  // Only set top for burst effects; the rest are anchored top/bottom in CSS
  const type = props.effect.type || 'float';
  if (type === 'burst' && e.top) {
    style.top = e.top;
  }
  return style;
});

const innerStyle = computed(() => {
  const e = props.effect;
  return e.rotate ? { '--rot-dur': `${e.rotateDuration || 6000}ms` } : {};
});
</script>

<style scoped>
.emoji {
  position: fixed;
  z-index: 1001;
  pointer-events: none;
  animation-duration: var(--dur, 4000ms);
  animation-delay: var(--delay, 0ms);
  animation-fill-mode: both;
  opacity: 0;
}

.emoji-inner { display: inline-block; }
.emoji-inner.rotate { animation: emoji-rotate var(--rot-dur, 6000ms) linear infinite; }

@keyframes emoji-rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Rain: fall from above to below */
.effect-rain {
  top: -10vh;
  animation-name: emoji-rain;
  animation-timing-function: linear;
  will-change: transform, opacity;
}

@keyframes emoji-rain {
  0% { transform: translateY(-10vh); opacity: 0; }
  5% { opacity: 1; }
  95% { opacity: 1; }
  100% { transform: translateY(110vh); opacity: 0; }
}

/* Float: rise gently */
.effect-float {
  bottom: -10vh;
  animation-name: emoji-float;
  animation-timing-function: cubic-bezier(0.3, 0.1, 0.4, 1);
}

@keyframes emoji-float {
  0% { transform: translateY(10vh); opacity: 0.0; }
  10% { opacity: 0.85; }
  85% { opacity: 0.85; }
  100% { transform: translateY(-100vh); opacity: 0; }
}

/* Run: traverse across screen horizontally */
.effect-run {
  top: auto;
  bottom: 10vh;
  animation-timing-function: linear;
}

.effect-run.go-right { animation-name: emoji-run-right; }
.effect-run.go-left { animation-name: emoji-run-left; }

@keyframes emoji-run-right {
  0% { transform: translateX(-120vw); opacity: 0; }
  5% { opacity: 1; }
  95% { opacity: 1; }
  100% { transform: translateX(120vw); opacity: 0; }
}

@keyframes emoji-run-left {
  0% { transform: translateX(120vw); opacity: 0; }
  5% { opacity: 1; }
  95% { opacity: 1; }
  100% { transform: translateX(-120vw); opacity: 0; }
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

/* --- Effects that obey gravity ---------------------------------------
 * A thrown thing shouldn't drift off the top of the screen. These three
 * split the motion in two: the outer element carries it sideways at a
 * steady speed while the inner one handles height, easing out on the way
 * up and in on the way down so the weight reads right.
 */

/* Arc: kicked across the screen, rising and falling on the way */
.effect-arc {
  top: auto;
  bottom: 8vh;
  animation-timing-function: linear;
}

.effect-arc.go-right { animation-name: emoji-run-right; }
.effect-arc.go-left { animation-name: emoji-run-left; }

.effect-arc .emoji-inner {
  animation: emoji-arc-height var(--dur, 4000ms) var(--delay, 0ms) both;
}

@keyframes emoji-arc-height {
  0% { transform: translateY(0); animation-timing-function: ease-out; }
  50% { transform: translateY(-42vh); animation-timing-function: ease-in; }
  100% { transform: translateY(0); }
}

/* Lob: launched straight up, falling back to the ground */
.effect-lob {
  top: auto;
  bottom: 8vh;
  animation-name: emoji-ground-fade;
  animation-timing-function: linear;
}

.effect-lob .emoji-inner {
  animation: emoji-lob-height var(--dur, 4000ms) var(--delay, 0ms) both;
}

@keyframes emoji-lob-height {
  0% { transform: translateY(0); animation-timing-function: ease-out; }
  55% { transform: translateY(-66vh); animation-timing-function: ease-in; }
  100% { transform: translateY(0); }
}

@keyframes emoji-ground-fade {
  0% { opacity: 0; }
  6% { opacity: 1; }
  92% { opacity: 1; }
  100% { opacity: 0; }
}

/* Bounce: dropped from above, settling in smaller and smaller hops */
.effect-bounce {
  top: auto;
  bottom: 8vh;
  animation-name: emoji-bounce;
}

@keyframes emoji-bounce {
  0% { transform: translateY(-105vh); opacity: 0; animation-timing-function: ease-in; }
  4% { opacity: 1; }
  40% { transform: translateY(0); animation-timing-function: ease-out; }
  54% { transform: translateY(-24vh); animation-timing-function: ease-in; }
  68% { transform: translateY(0); animation-timing-function: ease-out; }
  78% { transform: translateY(-11vh); animation-timing-function: ease-in; }
  86% { transform: translateY(0); animation-timing-function: ease-out; }
  92% { transform: translateY(-4vh); animation-timing-function: ease-in; }
  97% { transform: translateY(0); opacity: 1; }
  100% { transform: translateY(0); opacity: 0; }
}
</style>
