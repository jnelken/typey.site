<template>
  <canvas
    v-show="typingApp.mathEquation.value"
    ref="canvasEl"
    class="math-canvas"
    aria-hidden="true" />
</template>

<script setup>
import { ref, watch, onBeforeUnmount } from 'vue';
import { useTypingApp } from '@/composables/useTypingApp';
import { MATH_ANIM_DURATION } from '@/features/math/composables/useMathAnimation';

// Bright, kid-friendly colors. Group A is blue; the "added" group B is orange
// so the new amount (often "+1") visually pops as it joins the pile.
const COLOR_A = '#4f9cf9';
const COLOR_B = '#ff9f1c';
const COLOR_TEXT = '#2b2d42';

const typingApp = useTypingApp();
const canvasEl = ref(null);
let rafId = null;
let startTime = 0;

const smoothstep = t => t * t * (3 - 2 * t);
const lerp = (a, b, t) => a + (b - a) * t;

// Lay out n dots in a centered grid; returns array of {x, y} in CSS pixels.
const gridPositions = (n, cx, cy, spacing, cols) => {
  const positions = [];
  const columns = Math.max(1, Math.min(cols, n));
  const rows = Math.ceil(n / columns);
  const width = (columns - 1) * spacing;
  const height = (rows - 1) * spacing;
  for (let i = 0; i < n; i++) {
    const col = i % columns;
    const row = Math.floor(i / columns);
    positions.push({
      x: cx - width / 2 + col * spacing,
      y: cy - height / 2 + row * spacing,
    });
  }
  return positions;
};

const draw = () => {
  const eq = typingApp.mathEquation.value;
  const canvas = canvasEl.value;
  if (!eq || !canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  const w = window.innerWidth;
  const h = window.innerHeight;
  if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
    canvas.width = w * dpr;
    canvas.height = h * dpr;
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);

  const progress = Math.min(1, (performance.now() - startTime) / MATH_ANIM_DURATION);

  // Timeline: fade in -> merge to center -> hold reveal -> fade out
  const fadeIn = smoothstep(Math.min(1, progress / 0.2));
  const merge = smoothstep(Math.min(1, Math.max(0, (progress - 0.2) / 0.4)));
  const revealed = progress > 0.6;
  const fadeOut = progress > 0.85 ? smoothstep((progress - 0.85) / 0.15) : 0;
  const alpha = fadeIn * (1 - fadeOut);

  const cx = w / 2;
  const cy = h / 2;
  const base = Math.min(w, h);
  const radius = Math.max(8, Math.min(34, base / (8 + eq.sum)));
  const spacing = radius * 2.6;

  // Start clusters (left = a, right = b) and the merged target row/grid.
  const cols = Math.min(10, eq.sum);
  const clusterCols = Math.max(1, Math.ceil(Math.sqrt(Math.max(eq.a, eq.b))));
  const offset = base * 0.18 + spacing;
  const startA = gridPositions(eq.a, cx - offset, cy + radius * 2, spacing, clusterCols);
  const startB = gridPositions(eq.b, cx + offset, cy + radius * 2, spacing, clusterCols);
  const merged = gridPositions(eq.sum, cx, cy + radius * 2, spacing, cols);

  ctx.globalAlpha = alpha;

  // Draw each dot, interpolating from its start cluster to its merged slot.
  for (let i = 0; i < eq.sum; i++) {
    const from = i < eq.a ? startA[i] : startB[i - eq.a];
    const to = merged[i];
    const x = lerp(from.x, to.x, merge);
    const y = lerp(from.y, to.y, merge);
    ctx.beginPath();
    ctx.fillStyle = i < eq.a ? COLOR_A : COLOR_B;
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // Equation text above the dots. The "= sum" appears at the reveal.
  ctx.globalAlpha = alpha;
  ctx.fillStyle = COLOR_TEXT;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const fontSize = Math.max(40, Math.min(120, base / 8));
  // Canvas ctx.font does not resolve CSS variables, so use a concrete stack.
  ctx.font = `bold ${fontSize}px "Comic Sans MS", "Baloo 2", system-ui, sans-serif`;
  const equationText = revealed
    ? `${eq.a} + ${eq.b} = ${eq.sum}`
    : `${eq.a} + ${eq.b}`;
  ctx.fillText(equationText, cx, cy - base * 0.18);

  if (progress < 1) {
    rafId = requestAnimationFrame(draw);
  } else {
    rafId = null;
  }
};

const stop = () => {
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
};

// Restart the canvas loop whenever a new equation is played.
watch(
  () => typingApp.mathEquation.value?.id,
  id => {
    stop();
    if (id == null) return;
    startTime = performance.now();
    rafId = requestAnimationFrame(draw);
  },
);

onBeforeUnmount(stop);
</script>

<style scoped>
.math-canvas {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 1400;
}
</style>
