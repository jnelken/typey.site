<template>
  <div class="splatter" aria-hidden="true">
    <span
      v-for="(droplet, i) in droplets"
      :key="i"
      class="droplet"
      :style="droplet"
    />
  </div>
</template>

<script setup>
import { SPLAT_DURATION } from '@/features/effects/utils/wordMotion';

const props = defineProps({
  // Single colour for a produce burst. Party Mode can pass `colors` instead
  // for a multi-coloured confetti spray without rewriting this component.
  color: {
    type: String,
    default: '#e33e3e',
  },
  colors: {
    type: Array,
    default: null,
  },
  count: {
    type: Number,
    default: 10,
  },
  size: {
    type: Number,
    default: 12,
  },
});

const palette = props.colors?.length ? props.colors : [props.color];

// Angle and distance are fixed once at setup so a re-render never reshuffles
// the burst mid-flight.
const droplets = Array.from({ length: props.count }, (_, i) => {
  const angle = (360 / props.count) * i + (Math.random() * 40 - 20);
  const distance = 28 + Math.random() * 42;
  const dropletSize = props.size * (0.55 + Math.random() * 0.55);
  return {
    '--angle': `${angle}deg`,
    '--distance': `${distance}px`,
    '--droplet-size': `${dropletSize}px`,
    '--droplet-color': palette[i % palette.length],
    '--splat-dur': `${SPLAT_DURATION}ms`,
  };
});
</script>

<style scoped>
.splatter {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 0;
  height: 0;
  pointer-events: none;
  z-index: 1;
}

.droplet {
  position: absolute;
  left: 0;
  top: 0;
  width: var(--droplet-size, 12px);
  height: var(--droplet-size, 12px);
  margin: calc(var(--droplet-size, 12px) / -2) 0 0 calc(var(--droplet-size, 12px) / -2);
  border-radius: 50%;
  background: radial-gradient(
    circle at 35% 30%,
    rgba(255, 255, 255, 0.55),
    var(--droplet-color) 42%,
    var(--droplet-color)
  );
  pointer-events: none;
  animation: splat-fly var(--splat-dur, 900ms) ease-out forwards;
  will-change: transform, opacity;
}

/* Fly out along a fixed angle, shrink, and fade. */
@keyframes splat-fly {
  0% {
    transform: rotate(var(--angle)) translateY(0) scale(1);
    opacity: 1;
  }
  100% {
    transform: rotate(var(--angle)) translateY(calc(var(--distance) * -1)) scale(0.15);
    opacity: 0;
  }
}

/* Honour the same reduced-motion intent as BatteryAnimation — CSS idiom
 * rather than a JS gate, since this layer is keyframe-driven. */
@media (prefers-reduced-motion: reduce) {
  .droplet {
    animation: splat-reduce 120ms ease-out forwards;
  }
}

@keyframes splat-reduce {
  from {
    transform: scale(1);
    opacity: 0.55;
  }
  to {
    transform: scale(0.7);
    opacity: 0;
  }
}
</style>
