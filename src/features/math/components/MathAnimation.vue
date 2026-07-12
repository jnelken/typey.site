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
import { layoutDots, gridDimensions, colorForGroup } from '@/features/math/utils/dotLayout';

const COLOR_TEXT = '#2b2d42';
// One loop = play the operation, then hold the answer, then replay.
const PLAY_MS = 2200;
const HOLD_MS = 2000;
const CYCLE_MS = PLAY_MS + HOLD_MS;

const typingApp = useTypingApp();
const canvasEl = ref(null);
let rafId = null;
let startTime = 0;

const clamp01 = t => Math.max(0, Math.min(1, t));
const smoothstep = t => { const x = clamp01(t); return x * x * (3 - 2 * x); };
const lerp = (a, b, t) => a + (b - a) * t;

// Pixel geometry for the dot grid, sized to fit the largest count on screen
// (a+b for addition, a for subtraction) with constant dot size/spacing so the
// answer never looks "smaller" than the inputs.
const geometry = (eq, w, h) => {
  const maxN = eq.op === '+' ? eq.result : eq.a;
  const { cols, rows } = gridDimensions(maxN);
  const availH = h * 0.42;
  const availW = w * 0.8;
  const s = Math.max(40, Math.min(110,
    Math.min(availH / Math.max(rows, 1), availW / (Math.max(cols, 1) * 1.6))));
  const colPitch = s * 1.6;
  const radius = s * 0.34;
  const totalW = (cols - 1) * colPitch;
  const totalH = (rows - 1) * s;
  const cy = h * 0.6;
  const originX = w / 2 - totalW / 2;
  const originY = cy - totalH / 2;
  const posFor = dot => ({ x: originX + dot.col * colPitch, y: originY + dot.row * s });
  return { s, radius, posFor };
};

const drawDot = (ctx, x, y, radius, color, alpha) => {
  if (alpha <= 0) return;
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.fillStyle = color;
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = Math.max(1, radius * 0.08);
  ctx.strokeStyle = 'rgba(0,0,0,0.18)';
  ctx.stroke();
};

const drawEquation = (ctx, eq, w, h, showResult, ga, base) => {
  ctx.globalAlpha = ga;
  ctx.fillStyle = COLOR_TEXT;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const fontSize = Math.max(40, Math.min(110, base / 9));
  ctx.font = `bold ${fontSize}px "Comic Sans MS", "Baloo 2", system-ui, sans-serif`;
  const sign = eq.op === '+' ? '+' : '−';
  const text = showResult
    ? `${eq.a} ${sign} ${eq.b} = ${eq.result}`
    : `${eq.a} ${sign} ${eq.b}`;
  ctx.fillText(text, w / 2, h * 0.28);
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

  // Loop: animate during PLAY, hold the answer during HOLD, then repeat.
  const t = (performance.now() - startTime) % CYCLE_MS;
  const p = t < PLAY_MS ? t / PLAY_MS : 1;
  const ga = smoothstep(Math.min(1, t / (PLAY_MS * 0.15))); // soft re-entry each loop
  const base = Math.min(w, h);

  const { radius, posFor } = geometry(eq, w, h);
  // A gentle "pop" as the answer settles.
  const pop = p > 0.82 ? 1 + 0.1 * Math.sin(((p - 0.82) / 0.18) * Math.PI) : 1;

  if (eq.op === '+') {
    drawAddition(ctx, eq, p, ga, radius * pop, posFor);
  } else {
    drawSubtraction(ctx, eq, p, ga, radius * pop, posFor);
  }
  drawEquation(ctx, eq, w, h, p > 0.7, ga, base);

  rafId = requestAnimationFrame(draw);
};

// Addition: group A appears, then group B slides in from the right to extend
// it into the combined, color-grouped layout.
const drawAddition = (ctx, eq, p, ga, radius, posFor) => {
  const dots = layoutDots(eq.result);
  dots.forEach((dot, i) => {
    const final = posFor(dot);
    const color = colorForGroup(dot.groupIndex);
    if (i < eq.a) {
      const alpha = smoothstep(Math.min(1, p / 0.3));
      drawDot(ctx, final.x, final.y, radius, color, alpha * ga);
    } else {
      const stagger = ((i - eq.a) / Math.max(1, eq.b)) * 0.2;
      const local = smoothstep(clamp01((p - 0.3 - stagger) / 0.45));
      const startX = final.x + radius * 8;
      const x = lerp(startX, final.x, local);
      drawDot(ctx, x, final.y, radius, color, local * ga);
    }
  });
};

// Subtraction: all of A appears, then the trailing b dots slide down and fade
// away ("take away"), leaving the answer already in place.
const drawSubtraction = (ctx, eq, p, ga, radius, posFor) => {
  const dots = layoutDots(eq.a);
  dots.forEach((dot, i) => {
    const final = posFor(dot);
    const color = colorForGroup(dot.groupIndex);
    const appear = smoothstep(Math.min(1, p / 0.3));
    if (i < eq.result) {
      drawDot(ctx, final.x, final.y, radius, color, appear * ga);
    } else {
      const stagger = ((i - eq.result) / Math.max(1, eq.b)) * 0.2;
      const local = smoothstep(clamp01((p - 0.35 - stagger) / 0.45));
      const y = final.y + local * radius * 9;
      drawDot(ctx, final.x, y, radius, color, appear * (1 - local) * ga);
    }
  });
};

const stop = () => {
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
};

// Restart the loop whenever a new equation is played.
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
