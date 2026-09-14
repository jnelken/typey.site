<template>
  <div v-if="food" :key="food.id" class="eaten" aria-hidden="true">
    <div class="eaten-plate">
      <!-- The whole glyph, fading back to a faint outline: the part that just
           got eaten. Drawn underneath so the bitten edge stays crisp. -->
      <span class="eaten-glyph eaten-gone" :class="{ 'eaten-all': food.remaining <= 0 }">{{
        food.emoji
      }}</span>
      <span class="eaten-glyph eaten-left" :style="clipStyle">{{ food.emoji }}</span>
    </div>
    <span class="eaten-label">{{ food.percent }}% eaten</span>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { remainingWedgePath } from '@/features/eaten/utils/eatenWedge';

// A plain renderer over the state `useEatenFood` holds, the way Balloons and
// Emojis take theirs — so the drawing can be tested without standing up the
// whole app context.
const props = defineProps({
  food: {
    type: Object,
    default: null,
  },
});

const food = computed(() => props.food);

// Both properties are set: Safari still wants the prefixed one, and this is
// the only clip-path in the app.
const clipStyle = computed(() => {
  if (!food.value) return null;
  const path = remainingWedgePath(food.value.remaining);
  return { clipPath: path, WebkitClipPath: path };
});
</script>

<style scoped>
.eaten {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  pointer-events: none;
  z-index: 1400;
}

.eaten-plate {
  position: relative;
  width: clamp(7rem, 30vmin, 15rem);
  height: clamp(7rem, 30vmin, 15rem);
  animation: eaten-arrive 420ms cubic-bezier(0.2, 1.4, 0.4, 1) both;
}

.eaten-glyph {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(6rem, 26vmin, 13rem);
  line-height: 1;
  user-select: none;
}

/* The bite: the eaten part is still drawn, faintly, so the proportion is
 * readable as "this much is gone" rather than as an odd-shaped glyph. It is
 * the same glyph at low opacity, not a new colour — nothing here has to clear
 * the contrast bar `screenColor.spec.js` holds, because nothing here is new
 * paint on the page. */
.eaten-gone {
  animation: eaten-bite 620ms ease-out 180ms both;
}

/* A whole thing eaten leaves no full-opacity glyph beside the ghost to read it
 * against, so the ghost has to carry the picture on its own and fades less far.
 * Without this, "100% cookie" is a page that looks like nothing happened. */
.eaten-gone.eaten-all {
  animation-name: eaten-bite-all;
}

.eaten-label {
  font-family: var(--font-family-primary);
  font-size: var(--font-size-3xl);
  font-weight: bold;
  color: var(--color-text-primary);
}

@keyframes eaten-arrive {
  from {
    transform: scale(0.4);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes eaten-bite {
  from {
    opacity: 1;
  }
  to {
    opacity: 0.14;
  }
}

@keyframes eaten-bite-all {
  from {
    opacity: 1;
  }
  to {
    opacity: 0.38;
  }
}

/* The bite has to stay visible when nothing may move, so the eaten part goes
 * straight to its faint state instead of fading there. */
@media (prefers-reduced-motion: reduce) {
  .eaten-plate {
    animation: none;
  }

  .eaten-gone {
    animation: none;
    opacity: 0.14;
  }

  .eaten-gone.eaten-all {
    opacity: 0.38;
  }
}
</style>
