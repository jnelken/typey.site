<template>
  <div v-if="active" class="night-sky" aria-hidden="true">
    <div class="moon" />
    <span
      v-for="star in stars"
      :key="star.id"
      class="star"
      :style="{
        left: `${star.x * 100}%`,
        top: `${star.y * 100}%`,
        width: `${star.size}px`,
        height: `${star.size}px`,
        animationDuration: `${star.twinkleMs}ms`,
        animationDelay: `-${star.delayMs}ms`,
      }" />
  </div>
</template>

<script setup>
// A plain renderer over the sky `useNight` holds, the way Balloons, Emojis and
// PartyConfetti render theirs. Every star's position is a percentage, so the
// field scales with the window without anything having to measure it.
//
// `aria-hidden`: the night is scenery. The letters a child typed are still the
// same letters, and a screen reader should not have forty-eight stars read to
// it before reaching them.
defineProps({
  active: {
    type: Boolean,
    default: false,
  },
  stars: {
    type: Array,
    default: () => [],
  },
});
</script>

<style scoped>
.night-sky {
  position: fixed;
  inset: 0;
  pointer-events: none;
  /* Behind every effect and behind the app's own chrome: this is the sky the
     rest of the page sits in front of, not another thing flying across it. */
  z-index: 0;
}

.moon {
  position: absolute;
  right: 8%;
  top: 12%;
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: var(--night-moon, #fdf6d8);
  /* The crescent is cut by a second disc in the page's own ground colour
     rather than drawn, so the moon always matches the sky exactly. */
  box-shadow: inset -26px 6px 0 -2px var(--night-background, #0b1026),
    0 0 36px rgba(253, 246, 216, 0.35);
}

.star {
  position: absolute;
  border-radius: 50%;
  background: var(--night-star, #ffffff);
  opacity: 0.85;
  animation-name: star-twinkle;
  animation-iteration-count: infinite;
  animation-timing-function: ease-in-out;
}

@keyframes star-twinkle {
  0%, 100% { opacity: 0.25; }
  50% { opacity: 1; }
}

/* A sky of forty-eight independently pulsing dots is exactly the kind of
   motion 2.3.3 asks to be able to turn off. Reduced motion keeps the stars —
   they are the point — and simply stops them moving. */
@media (prefers-reduced-motion: reduce) {
  .star {
    animation: none;
    opacity: 0.85;
  }

  .moon {
    box-shadow: inset -26px 6px 0 -2px var(--night-background, #0b1026);
  }
}

@media (max-width: 480px) {
  .moon {
    width: 64px;
    height: 64px;
    box-shadow: inset -18px 4px 0 -2px var(--night-background, #0b1026),
      0 0 24px rgba(253, 246, 216, 0.35);
  }
}
</style>
