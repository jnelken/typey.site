<template>
  <div
    v-if="balloon && balloon.id"
    class="balloon-container"
    :style="containerStyle"
    :class="{ 'balloon-popping': balloon.isPopping }">
    <div class="balloon" :style="balloonStyle">
      <div class="balloon-highlight"></div>
    </div>
    <div class="balloon-string"></div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  balloon: {
    type: Object,
    required: true,
  },
});

const containerStyle = computed(() => ({
  left: `${props.balloon?.left || 50}%`,
}));

const balloonStyle = computed(() => ({
  backgroundColor: props.balloon?.color || '#ff6b6b',
}));
</script>

<style scoped>
.balloon-container {
  position: fixed;
  bottom: -80px;
  transform: translateX(-50%);
  z-index: 1000;
  pointer-events: none;
  animation: balloon-float 4s ease-out forwards;
}

.balloon {
  width: 60px;
  height: 80px;
  border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
  position: relative;
  box-shadow: inset -10px -10px 0 rgba(0, 0, 0, 0.1);
  margin: 0 auto;
}

.balloon-highlight {
  width: 20px;
  height: 20px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  position: absolute;
  top: 15px;
  left: 15px;
}

.balloon-string {
  width: 2px;
  height: 100px;
  background: linear-gradient(to bottom, #666 0%, transparent 100%);
  margin: 0 auto;
  position: relative;
}

.balloon-popping .balloon {
  animation: balloon-pop 0.5s ease-in forwards;
}

@keyframes balloon-float {
  0% {
    bottom: -80px;
    transform: translateX(-50%) rotate(-2deg);
  }
  25% {
    bottom: 20vh;
    transform: translateX(-50%) rotate(2deg);
  }
  40% {
    bottom: calc(100vh - 200px);
    transform: translateX(-50%) rotate(-1deg);
  }
  50% {
    bottom: calc(100vh - 180px);
    transform: translateX(-50%) rotate(1deg);
  }
  60% {
    bottom: calc(100vh - 200px);
    transform: translateX(-50%) rotate(-0.5deg);
  }
  75% {
    bottom: calc(100vh - 190px);
    transform: translateX(-50%) rotate(0.5deg);
  }
  100% {
    bottom: calc(100vh - 180px);
    transform: translateX(-50%) rotate(0deg);
  }
}

@keyframes balloon-pop {
  0% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
  50% {
    transform: scale(1.2) rotate(10deg);
    opacity: 0.8;
  }
  100% {
    transform: scale(0) rotate(20deg);
    opacity: 0;
  }
}

/* Add subtle sway animation */
.balloon-container {
  animation: balloon-float 4s ease-out forwards,
    balloon-sway 6s ease-in-out infinite;
}

@keyframes balloon-sway {
  0%,
  100% {
    transform: translateX(-50%) translateY(0);
  }
  25% {
    transform: translateX(-50%) translateY(-5px);
  }
  50% {
    transform: translateX(-50%) translateY(0);
  }
  75% {
    transform: translateX(-50%) translateY(-3px);
  }
}
</style>
