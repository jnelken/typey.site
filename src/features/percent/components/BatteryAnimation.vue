<template>
  <canvas
    v-show="typingApp.batteryCharge.value"
    ref="canvasEl"
    class="battery-canvas"
    aria-hidden="true" />
</template>

<script setup>
import { ref, watch, onBeforeUnmount } from 'vue';
import { useTypingApp } from '@/composables/useTypingApp';
import { GROUP_COLORS } from '@/constants/palette';

const COLOR_TEXT = '#2b2d42';
const COLOR_LOW = GROUP_COLORS[0];  // vermillion — ≤20%
const COLOR_HIGH = GROUP_COLORS[3]; // green — above 20%
// One loop = play the fill, then hold, then replay.
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

const roundRect = (ctx, x, y, w, h, r) => {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
};

const fillColorFor = percent => (percent <= 20 ? COLOR_LOW : COLOR_HIGH);

const drawLabel = (ctx, percent, w, h, ga, base) => {
  ctx.globalAlpha = ga;
  ctx.fillStyle = COLOR_TEXT;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const fontSize = Math.max(40, Math.min(110, base / 9));
  ctx.font = `bold ${fontSize}px "Comic Sans MS", "Baloo 2", system-ui, sans-serif`;
  ctx.fillText(`${percent}%`, w / 2, h * 0.28);
};

const drawShell = (ctx, cx, cy, bodyW, bodyH, ga) => {
  const x = cx - bodyW / 2;
  const y = cy - bodyH / 2;
  const radius = bodyH * 0.18;
  const strokeW = bodyH * 0.06;

  ctx.globalAlpha = ga;
  ctx.strokeStyle = COLOR_TEXT;
  ctx.lineWidth = strokeW;
  roundRect(ctx, x, y, bodyW, bodyH, radius);
  ctx.stroke();

  // Terminal nub on the right.
  const nubW = bodyW * 0.045;
  const nubH = bodyH * 0.34;
  const nubR = Math.min(nubW * 0.4, nubH * 0.2);
  const nubX = x + bodyW;
  const nubY = cy - nubH / 2;
  ctx.fillStyle = COLOR_TEXT;
  roundRect(ctx, nubX, nubY, nubW, nubH, nubR);
  ctx.fill();
};

const drawFill = (ctx, cx, cy, bodyW, bodyH, percent, displayPercent, ga, pop) => {
  const inset = bodyH * 0.12;
  const innerW = bodyW - inset * 2;
  const innerH = bodyH - inset * 2;
  const x = cx - bodyW / 2 + inset;
  const y = cy - bodyH / 2 + inset;
  const fillW = innerW * (displayPercent / 100);
  const radius = innerH * 0.22;

  if (fillW > 0) {
    ctx.globalAlpha = ga;
    ctx.fillStyle = fillColorFor(percent);
    roundRect(ctx, x, y, fillW, innerH, radius);
    ctx.fill();

    // Outline carries WCAG 1.4.11; skip only when there is no rect (0%).
    if (percent > 0) {
      ctx.strokeStyle = COLOR_TEXT;
      ctx.lineWidth = bodyH * 0.03;
      roundRect(ctx, x, y, fillW, innerH, radius);
      ctx.stroke();
    }
  }

  // Scale ticks at 25 / 50 / 75, drawn over the fill.
  ctx.globalAlpha = ga;
  ctx.strokeStyle = 'rgba(0,0,0,0.18)';
  ctx.lineWidth = Math.max(1, bodyH * 0.02);
  for (const tick of [0.25, 0.5, 0.75]) {
    const tx = x + innerW * tick;
    ctx.beginPath();
    ctx.moveTo(tx, y + innerH * 0.15);
    ctx.lineTo(tx, y + innerH * 0.85);
    ctx.stroke();
  }

  // Full charge: bolt inside the bar with a gentle pop pulse.
  if (percent >= 100 && displayPercent >= 99) {
    const fontSize = innerH * 0.55 * pop;
    ctx.globalAlpha = ga;
    ctx.font = `${fontSize}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⚡', cx, cy);
  }
};

const draw = () => {
  const charge = typingApp.batteryCharge.value;
  const canvas = canvasEl.value;
  if (!charge || !canvas) return;
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

  // Loop: animate during PLAY, hold during HOLD, then repeat.
  const t = (performance.now() - startTime) % CYCLE_MS;
  const p = t < PLAY_MS ? t / PLAY_MS : 1;
  const ga = smoothstep(Math.min(1, t / (PLAY_MS * 0.15))); // soft re-entry each loop
  const base = Math.min(w, h);

  // A gentle "pop" as the answer settles (full-charge bolt).
  const pop = p > 0.82 ? 1 + 0.1 * Math.sin(((p - 0.82) / 0.18) * Math.PI) : 1;

  const { percent } = charge;
  const displayPercent = lerp(0, percent, smoothstep(p));

  const bodyW = Math.min(w * 0.62, 760);
  const bodyH = bodyW * 0.46;
  const cx = w / 2;
  const cy = h * 0.58;

  drawShell(ctx, cx, cy, bodyW, bodyH, ga);
  drawFill(ctx, cx, cy, bodyW, bodyH, percent, displayPercent, ga, pop);
  drawLabel(ctx, percent, w, h, ga, base);

  rafId = requestAnimationFrame(draw);
};

const stop = () => {
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
};

// Restart the loop whenever a new charge is played.
watch(
  () => typingApp.batteryCharge.value?.id,
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
.battery-canvas {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 1400;
}
</style>
