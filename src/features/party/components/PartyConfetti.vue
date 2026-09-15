<template>
  <div class="party-confetti" aria-hidden="true">
    <span
      v-for="burst in bursts"
      :key="burst.id"
      class="party-burst"
      :style="{ left: `${burst.x}px`, top: `${burst.y}px` }">
      <Splatter
        :colors="CONFETTI_COLORS"
        :count="burst.count"
        :size="burst.size" />
    </span>
  </div>
</template>

<script setup>
import Splatter from '@/ui/Splatter.vue';
import { CONFETTI_COLORS } from '@/features/party/utils/partyMode';

// A plain renderer over the bursts `useParty` holds, the way Balloons and
// Emojis render theirs. Each burst is a zero-sized anchor at the point the
// confetti came from; `Splatter` centres itself on its parent, so the flecks
// fly out of that exact spot.
defineProps({
  bursts: {
    type: Array,
    default: () => [],
  },
});
</script>

<style scoped>
.party-confetti {
  position: fixed;
  inset: 0;
  pointer-events: none;
  /* Above the emoji swarms, below the battery and the half-eaten plate, which
     are the two things a child is reading a number off. */
  z-index: 1002;
}

.party-burst {
  position: absolute;
  width: 0;
  height: 0;
}
</style>
