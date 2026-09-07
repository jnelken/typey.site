<template>
  <div class="emoji" :class="effectClass" :style="rootStyle">
    <span class="emoji-lift">
      <span class="emoji-flair" :class="flairClass">
        <span class="emoji-glyph" :class="{ flipped: effect.flipped }">{{ effect.emoji }}</span>
      </span>
    </span>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { TRAVELLING_PATHS } from '@/features/effects/utils/wordMotion';

const props = defineProps({
  effect: {
    type: Object,
    required: true,
  },
});

const effectClass = computed(() => {
  const type = props.effect.type || 'float';
  const dir = props.effect.direction === 'left' ? 'left' : 'right';
  return [
    `effect-${type}`,
    TRAVELLING_PATHS.includes(type) ? `go-${dir}` : null,
  ].filter(Boolean);
});

const flairClass = computed(() => {
  const flair = props.effect.flair;
  return flair && flair !== 'none' ? `flair-${flair}` : null;
});

const rootStyle = computed(() => {
  const e = props.effect;
  const style = {
    left: e.left || '50%',
    fontSize: `${e.size || 32}px`,
    '--dur': `${e.duration || 4000}ms`,
    '--delay': `${e.delay || 0}ms`,
    '--flair-dur': `${e.flairDuration || e.duration || 4000}ms`,
  };
  // Only set top for burst effects; the rest are anchored top/bottom in CSS
  const type = e.type || 'float';
  if (type === 'burst' && e.top) {
    style.top = e.top;
  }
  return style;
});
</script>

<style scoped>
/* Four layers, so nothing overwrites anything else.
 *
 * `.emoji`       travels across the screen        (transform)
 * `.emoji-lift`  carries height for gravity paths (transform)
 * `.emoji-flair` spins, bobs, grows or pulses     (rotate / scale)
 * `.emoji-glyph` faces the way it's going         (scale)
 *
 * The inner two use the individual `rotate` and `scale` properties rather than
 * `transform`. They compose independently, so a flourish and a horizontal flip
 * can sit on the same element without one silently winning — which is exactly
 * what went wrong when the flip was first tried as `transform: scaleX(-1)` on
 * an element whose keyframes already animated `transform: translateY`.
 */
.emoji {
  position: fixed;
  z-index: 1001;
  pointer-events: none;
  animation-duration: var(--dur, 4000ms);
  animation-delay: var(--delay, 0ms);
  animation-fill-mode: both;
  opacity: 0;
}

.emoji-lift,
.emoji-flair,
.emoji-glyph {
  display: inline-block;
}

/* A glyph drawn facing left, sent to the right, is turned around. */
.emoji-glyph.flipped {
  scale: -1 1;
}

/* --- Flourishes ------------------------------------------------------
 * Modifiers, not paths: any of these layers onto any path below.
 */

.flair-spin {
  animation: flair-spin var(--flair-dur, 6000ms) var(--delay, 0ms) linear infinite;
}

@keyframes flair-spin {
  from { rotate: 0deg; }
  to { rotate: 360deg; }
}

/* Bobble: a rocking wobble, like a bobblehead. */
.flair-bobble {
  animation: flair-bobble var(--flair-dur, 900ms) var(--delay, 0ms)
    ease-in-out infinite alternate;
}

@keyframes flair-bobble {
  from { rotate: -14deg; }
  to { rotate: 14deg; }
}

/* Grow: swells as it fades out. Plays once, over the effect's own life. */
.flair-grow {
  animation: flair-grow var(--flair-dur, 4000ms) var(--delay, 0ms) ease-out both;
}

@keyframes flair-grow {
  from { scale: 1; opacity: 1; }
  to { scale: 2.2; opacity: 0; }
}

/* Pulse: swells and comes back to its own size. */
.flair-pulse {
  animation: flair-pulse var(--flair-dur, 4000ms) var(--delay, 0ms) ease-in-out both;
}

@keyframes flair-pulse {
  0% { scale: 1; }
  50% { scale: 1.45; }
  100% { scale: 1; }
}

/* Throb: large, small, large — a heartbeat, on repeat. */
.flair-throb {
  animation: flair-throb var(--flair-dur, 900ms) var(--delay, 0ms)
    ease-in-out infinite;
}

@keyframes flair-throb {
  0% { scale: 1; }
  20% { scale: 1.3; }
  35% { scale: 1; }
  55% { scale: 1.22; }
  100% { scale: 1; }
}

/* --- Paths ------------------------------------------------------------ */

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

/* --- Paths that obey gravity ------------------------------------------
 * A thrown thing shouldn't drift off the top of the screen. These three
 * split the motion in two: the outer element carries it sideways at a
 * steady speed while the lift span handles height, easing out on the way
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

.effect-arc .emoji-lift {
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

.effect-lob .emoji-lift {
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
