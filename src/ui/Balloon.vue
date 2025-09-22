<template>
  <div
    v-if="balloon && balloon.id"
    class="balloon-container"
    :style="containerStyle"
    :class="{ 'balloon-popping': balloon.isPopping }"
    @click="handleBalloonClick">
    <div class="balloon-sway-wrapper" :style="swayStyle">
      <div class="balloon" :style="balloonStyle">
        <div class="balloon-highlight"></div>
      </div>
      <div class="balloon-string"></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useTypingApp } from '../composables/useTypingApp';

const props = defineProps({
  balloon: {
    type: Object,
    required: true,
  },
});

const typingApp = useTypingApp();

const containerStyle = computed(() => ({
  left: `${props.balloon?.left || 50}%`,
}));

const balloonStyle = computed(() => ({
  backgroundColor: props.balloon?.color || '#ff6b6b',
}));

// Randomized sway parameters per balloon instance
const swayDuration = `${(8 + Math.random() * 8).toFixed(2)}s`; // 8s–16s
const swayDelay = `${(Math.random() * 3).toFixed(2)}s`; // 0–3s
const ampX = `${(1 + Math.random() * 2.5).toFixed(2)}vh`; // 1–3.5vh
const ampY = `${(0.8 + Math.random() * 2.2).toFixed(2)}vh`; // 0.8–3vh
const ampYNeg = `-${ampY}`;

const swayStyle = computed(() => ({
  '--sway-duration': swayDuration,
  '--sway-delay': swayDelay,
  '--sway-x': ampX,
  '--sway-y': ampY,
  '--sway-y-neg': ampYNeg,
}));

const handleBalloonClick = () => {
  if (!props.balloon.isPopping) {
    typingApp.popBalloon(props.balloon.id, { loud: true });
  }
};
</script>

<style scoped>
.balloon-container {
  position: fixed;
  bottom: -80px;
  z-index: 1000;
  pointer-events: auto;
  /* Use a bezier with non-zero initial slope for small initial velocity */
  animation: balloon-float 6s cubic-bezier(0.3, 0.1, 0.4, 1) forwards;
  cursor: pointer;
}

.balloon-sway-wrapper {
  position: relative;
  transform: translateX(-50%);
  animation: balloon-sway-bob var(--sway-duration, 10s) ease-in-out infinite;
  animation-delay: var(--sway-delay, 0s);
}

.balloon-sway-wrapper:hover .balloon {
  transform: scale(1.1);
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
  0% { bottom: -80px; }
  100% { bottom: calc(100vh - 180px); }
}

@keyframes balloon-pop {
  0% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
  30% {
    transform: scale(1.4) rotate(5deg);
    opacity: 0.9;
  }
  100% {
    transform: scale(2.5) rotate(15deg);
    opacity: 0;
  }
}

@keyframes balloon-sway-bob {
  0%   { transform: translateX(-50%) translateY(0); }
  25%  { transform: translateX(calc(-50% + var(--sway-x))) translateY(var(--sway-y)); }
  50%  { transform: translateX(calc(-50% - var(--sway-x))) translateY(var(--sway-y-neg)); }
  75%  { transform: translateX(calc(-50% + var(--sway-x))) translateY(var(--sway-y)); }
  100% { transform: translateX(-50%) translateY(0); }
}
</style>
