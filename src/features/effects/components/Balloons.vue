<template>
  <div class="balloons-container">
    <Balloon v-for="balloon in balloons" :key="balloon.id" :balloon="balloon" />
  </div>
</template>

<script setup>
import Balloon from '@/ui/Balloon.vue';

defineProps({
  balloons: {
    type: Array,
    required: true,
  },
});
</script>

<style scoped>
.balloons-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 1000;
}
</style>
