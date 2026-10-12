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
import {
  COLUMN_PITCH_RATIO,
  MAX_DOTS,
  colorForGroup,
  dotAt,
  fitDotGrid,
  gridDimensions,
  layoutDots,
} from '@/features/math/utils/dotLayout';

const COLOR_TEXT = '#2b2d42';
const FONT_FAMILY = '"Comic Sans MS", "Baloo 2", system-ui, sans-serif';
// The equation line may use this share of the screen width.
const TEXT_WIDTH_RATIO = 0.9;
// Past this many dots a single dot is too small to animate on its own, so the
// dots are drawn once into offscreen layers and the layers are what move.
const LAYERED_DOT_COUNT = 2_000;
// One loop = play the operation, then hold the answer, then replay.
const PLAY_MS = 2200;
const HOLD_MS = 2000;
const CYCLE_MS = PLAY_MS + HOLD_MS;

const typingApp = useTypingApp();
const canvasEl = ref(null);
let rafId = null;
let startTime = 0;
// The dot arrangement depends only on the equation and the viewport, so it is
// built once for each and reused on every frame.
let scene = null;

const clamp01 = t => Math.max(0, Math.min(1, t));
const smoothstep = t => { const x = clamp01(t); return x * x * (3 - 2 * x); };
const lerp = (a, b, t) => a + (b - a) * t;

// Pixel geometry for the dot grid, sized so the whole arrangement fits the
// screen for the largest count (a+b for addition, a for subtraction).
const geometry = (maxN, w, h) => {
  const { bands, cellSize: s } = fitDotGrid(maxN, w * 0.8, h * 0.42);
  const { cols, rows } = gridDimensions(maxN, bands);
  const colPitch = s * COLUMN_PITCH_RATIO;
  const totalW = (cols - 1) * colPitch;
  const totalH = (rows - 1) * s;
  const originX = w / 2 - totalW / 2;
  const originY = h * 0.6 - totalH / 2;
  return {
    bands,
    radius: s * 0.34,
    posFor: dot => ({ x: originX + dot.col * colPitch, y: originY + dot.row * s }),
  };
};

// Dense counts: draw dots [from, to) once into an offscreen canvas.
const buildLayer = ({ maxN, geo, w, h, dpr, from, to }) => {
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  // Never smaller than a device pixel, so even sub-pixel dots still show colour.
  const size = Math.max(2 * geo.radius, 1 / dpr);
  for (let i = from; i < to; i++) {
    const dot = dotAt(i, maxN, geo.bands);
    const { x, y } = geo.posFor(dot);
    ctx.fillStyle = colorForGroup(dot.groupIndex);
    ctx.fillRect(x - size / 2, y - size / 2, size, size);
  }
  return canvas;
};

// Above MAX_DOTS there are no dots, only the equation. For addition the split
// is between the two groups; for subtraction it is between the kept dots and
// the ones taken away.
const buildScene = (eq, w, h, dpr) => {
  const maxN = eq.op === '+' ? eq.result : eq.a;
  const split = eq.op === '+' ? eq.a : eq.result;
  if (maxN > MAX_DOTS) return { maxN, split, geo: null, dots: null, layers: null };

  const geo = geometry(maxN, w, h);
  if (maxN <= LAYERED_DOT_COUNT) {
    return { maxN, split, geo, dots: layoutDots(maxN, geo.bands), layers: null };
  }
  const args = { maxN, geo, w, h, dpr };
  const layers = [
    buildLayer({ ...args, from: 0, to: split }),
    buildLayer({ ...args, from: split, to: maxN }),
  ];
  return { maxN, split, geo, dots: null, layers };
};

const sceneFor = (eq, w, h, dpr) => {
  const key = `${eq.id}|${w}|${h}|${dpr}`;
  if (scene?.key !== key) scene = { key, ...buildScene(eq, w, h, dpr) };
  return scene;
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

const drawLayer = (ctx, layer, dx, dy, alpha, w, h) => {
  if (alpha <= 0) return;
  ctx.globalAlpha = alpha;
  ctx.drawImage(layer, dx, dy, w, h);
};

// The answer wears its modifier the way it is written: "$5", "5%". Only the
// answer does — the operands are counted as dots, and the modifier is a fact
// about what the total is worth.
const withModifier = (value, modifier) => {
  if (modifier === '$') return `$${value}`;
  if (modifier === '%') return `${value}%`;
  return `${value}`;
};

const drawEquation = (ctx, eq, w, h, showResult, ga, base) => {
  const sign = eq.op === '+' ? '+' : '−';
  const text = showResult
    ? `${eq.a} ${sign} ${eq.b} = ${withModifier(eq.result, eq.modifier)}`
    : `${eq.a} ${sign} ${eq.b}`;

  ctx.globalAlpha = ga;
  ctx.fillStyle = COLOR_TEXT;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const setFont = size => { ctx.font = `bold ${size}px ${FONT_FAMILY}`; };
  const fontSize = Math.max(40, Math.min(110, base / 9));
  setFont(fontSize);
  // A long answer (up to a million) shrinks until the line fits the screen.
  const maxWidth = w * TEXT_WIDTH_RATIO;
  const width = ctx.measureText(text).width;
  setFont(width > maxWidth ? fontSize * maxWidth / width : fontSize);
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

  const current = sceneFor(eq, w, h, dpr);
  // A gentle "pop" as the answer settles.
  const pop = p > 0.82 ? 1 + 0.1 * Math.sin(((p - 0.82) / 0.18) * Math.PI) : 1;

  if (current.layers) {
    drawLayered(ctx, eq, current, w, h, p, ga);
  } else if (current.dots) {
    const radius = current.geo.radius * pop;
    if (eq.op === '+') {
      drawAddition(ctx, eq, p, ga, radius, current);
    } else {
      drawSubtraction(ctx, eq, p, ga, radius, current);
    }
  }
  drawEquation(ctx, eq, w, h, p > 0.7, ga, base);

  rafId = requestAnimationFrame(draw);
};

// Addition: group A appears, then group B slides in from the right to extend
// it into the combined, color-grouped layout.
const drawAddition = (ctx, eq, p, ga, radius, { dots, geo }) => {
  dots.forEach((dot, i) => {
    const final = geo.posFor(dot);
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
const drawSubtraction = (ctx, eq, p, ga, radius, { dots, geo }) => {
  dots.forEach((dot, i) => {
    const final = geo.posFor(dot);
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

// Dense counts: the same two movements as above, applied to the two layers.
// Per-dot timing is invisible at this size, so each frame only draws two images.
const drawLayered = (ctx, eq, { layers, geo }, w, h, p, ga) => {
  const [first, second] = layers;
  const appear = smoothstep(Math.min(1, p / 0.3));
  if (eq.op === '+') {
    const local = smoothstep(clamp01((p - 0.3) / 0.45));
    drawLayer(ctx, first, 0, 0, appear * ga, w, h);
    drawLayer(ctx, second, (1 - local) * geo.radius * 8, 0, local * ga, w, h);
  } else {
    const local = smoothstep(clamp01((p - 0.35) / 0.45));
    drawLayer(ctx, first, 0, 0, appear * ga, w, h);
    drawLayer(ctx, second, 0, local * geo.radius * 9, appear * (1 - local) * ga, w, h);
  }
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
