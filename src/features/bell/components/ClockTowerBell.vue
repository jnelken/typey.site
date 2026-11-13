<template>
  <div
    v-if="typingApp.bell.value"
    class="clock-tower-bell"
    :class="{ still: typingApp.bell.value.reducedMotion }"
    data-testid="clock-tower-bell"
    aria-hidden="true">
    <div class="beam" />
    <svg
      class="bell"
      viewBox="0 0 100 110"
      width="96"
      height="106"
      :style="{ transform: `rotate(${typingApp.bellAngle.value}deg)` }">
      <path
        d="M50 6 C34 6 30 24 28 44 C26 62 18 72 10 86 L90 86 C82 72 74 62 72 44 C70 24 66 6 50 6 Z"
        fill="#d9a521"
        stroke="#7a5a0c"
        stroke-width="3"
        stroke-linejoin="round" />
      <ellipse cx="50" cy="86" rx="40" ry="5" fill="#b8860b" stroke="#7a5a0c" stroke-width="3" />
      <circle cx="50" cy="96" r="7" fill="#5c4308" />
    </svg>
    <div class="caption">{{ typingApp.bell.value.label }}</div>
  </div>
</template>

<script setup>
import { useTypingApp } from '@/composables/useTypingApp';

const typingApp = useTypingApp();
</script>

<style scoped>
/* Never takes clicks or focus: the child keeps typing underneath it. */
.clock-tower-bell {
  position: fixed;
  top: 150px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 40;
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
}

.beam {
  width: 140px;
  height: 10px;
  border-radius: 5px;
  background: #5b3a1a;
}

/* Hangs from the beam: swings about the top of the bell. */
.bell {
  transform-origin: 50% 0;
  margin-top: -2px;
}

.caption {
  margin-top: 4px;
  padding: 2px 10px;
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.9);
  font-family: monospace;
  font-weight: bold;
}
</style>
