<template>
  <div class="emojis-container">
    <EmojiEffect v-for="e in effects" :key="e.id" :effect="e" />
  </div>
</template>

<script setup>
import EmojiEffect from '@/ui/EmojiEffect.vue';

defineProps({
  effects: {
    type: Array,
    required: true,
  },
});
</script>

<style scoped>
.emojis-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 1001;
}
</style>

