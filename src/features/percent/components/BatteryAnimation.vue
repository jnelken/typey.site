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
import {
  COLOR_TEXT,
  COLOR_OVER,
  batteryFillColor,
} from '@/features/percent/utils/batteryColor';
import {
  framePoints,
  boltPoints,
  boltOrigin,
  seededRandom,
} from '@/features/percent/utils/electricFrame';
import { STRIKE_MS, BOLT_MS } from '@/features/percent/composables/useZaps';

// Two phases. ARRIVE plays the charge big in the middle of the screen; DOCK
// flies it up to the corner, where it parks for good as a menubar-style
// indicator that drains a point per keystroke.
const ARRIVE_MS = 1600;
const DOCK_MS = 750;
const STORM_MS = 1800;
// How long the oversized (over-a-million) number takes to tumble off screen.
const FALL_MS = 1600;

// Parked geometry: right edge of the viewport, below the app's own top row —
// the title and toolbar reach the right of the content column on a wide screen,
// so the indicator sits under them rather than on top of them. On a phone the
// word prompt takes that band too, so it parks lower and smaller there: the
// child has to be able to read the word they are copying and the charge at once.
const DOCK_RIGHT = 26;
const DOCK_TOP = 164;
const DOCK_TOP_NARROW = 215;
const DOCK_BODY_W = 104;
const NARROW_W = 640;

// Past ZAP_THRESHOLD the screen's own edge runs with current. One lap of the
// perimeter takes FRAME_LAP_MS, and the arcs are spaced evenly around it so
// there is always one in sight.
const FRAME_INSET = 9;
const FRAME_RADIUS = 20;
const FRAME_ARCS = 4;
const FRAME_ARC_SPAN = 0.13;
const FRAME_LAP_MS = 3200;
// New jitter this often, so the frame crackles rather than seethes.
const CRACKLE_MS = 110;

// An overcharge can read up to a million percent, which would run bars off both
// edges — the spill is capped at this multiple of the battery's inner width.
const MAX_SPILL = 1.6;
// How far past the spill's body the bursting point reaches.
const SPILL_TIP = 1.12;

const typingApp = useTypingApp();
const canvasEl = ref(null);
let rafId = null;
let startTime = 0;
let stormStart = 0;
// Follows the live charge with a short ease, so a drain slides rather than jumps.
let displayed = 0;
// Where each bolt was aimed, measured once on the frame it first appears —
// after that the letter it hit is gone, so the aim has to be remembered.
const boltTargets = new Map();

const clamp01 = t => Math.max(0, Math.min(1, t));
const smoothstep = t => { const x = clamp01(t); return x * x * (3 - 2 * x); };
const lerp = (a, b, t) => a + (b - a) * t;

const prefersReducedMotion = () =>
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

const roundRect = (ctx, x, y, w, h, r) => {
  const radius = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
};

// Everything the indicator needs, derived from one number: the body width.
// The label sits to the left of the shell the way a phone's menubar reads.
const geometryFor = (ctx, bodyW, label) => {
  const bodyH = bodyW * 0.46;
  const nubW = bodyW * 0.075;
  const gap = bodyW * 0.16;
  const fontSize = bodyH * 0.62;

  ctx.font = `bold ${fontSize}px "Comic Sans MS", "Baloo 2", system-ui, sans-serif`;
  const labelW = ctx.measureText(label).width;

  return { bodyW, bodyH, nubW, gap, fontSize, labelW, groupW: labelW + gap + bodyW + nubW };
};

const drawShell = (ctx, geo, bodyX, bodyY) => {
  const { bodyW, bodyH, nubW } = geo;
  ctx.strokeStyle = COLOR_TEXT;
  ctx.lineWidth = bodyH * 0.09;
  roundRect(ctx, bodyX, bodyY, bodyW, bodyH, bodyH * 0.22);
  ctx.stroke();

  const nubH = bodyH * 0.34;
  ctx.fillStyle = COLOR_TEXT;
  roundRect(ctx, bodyX + bodyW, bodyY + (bodyH - nubH) / 2, nubW, nubH, nubW * 0.4);
  ctx.fill();
};

const drawFill = (ctx, geo, bodyX, bodyY, shown, fillColor) => {
  const { bodyW, bodyH } = geo;
  const inset = bodyH * 0.14;
  const innerW = bodyW - inset * 2;
  const innerH = bodyH - inset * 2;
  const x = bodyX + inset;
  const y = bodyY + inset;
  const radius = innerH * 0.24;

  // Inside the shell: never wider than the shell itself.
  const insideW = innerW * (Math.min(shown, 100) / 100);
  if (insideW > 0) {
    ctx.fillStyle = fillColor;
    roundRect(ctx, x, y, insideW, innerH, radius);
    ctx.fill();
    // Outline carries WCAG 1.4.11; skip only when there is no rect (0%).
    ctx.strokeStyle = COLOR_TEXT;
    ctx.lineWidth = bodyH * 0.05;
    roundRect(ctx, x, y, insideW, innerH, radius);
    ctx.stroke();
  }

  // Scale ticks at 25 / 50 / 75, over the fill but under any spill.
  ctx.strokeStyle = 'rgba(0,0,0,0.18)';
  ctx.lineWidth = Math.max(1, bodyH * 0.025);
  for (const tick of [0.25, 0.5, 0.75]) {
    const tx = x + innerW * tick;
    ctx.beginPath();
    ctx.moveTo(tx, y + innerH * 0.15);
    ctx.lineTo(tx, y + innerH * 0.85);
    ctx.stroke();
  }

  return { x, y, innerW, innerH };
};

// How far the overcharge reaches past the battery's inner bar. Shared so the
// parked position can leave room for it instead of pushing it off-screen.
const spillWidthFor = (geo, shown) => {
  const over = (shown - 100) / 100;
  if (over <= 0) return 0;
  const inset = geo.bodyH * 0.14;
  return (geo.bodyW - inset * 2) * Math.min(over, MAX_SPILL);
};

// The joke: charge past 100% bursts straight out of the terminal nub and keeps
// going, taller than the battery and ending in a ragged lightning edge. Drawn
// after the shell so it reads as bursting out over it, not tucked behind.
const drawSpill = (ctx, geo, inner, bodyY, shown, wobble, fillColor) => {
  const { bodyH } = geo;
  const over = (shown - 100) / 100;
  if (over <= 0) return;

  const spillW = spillWidthFor(geo, shown);
  const x = inner.x + inner.innerW + geo.nubW * 0.6;
  const cy = bodyY + bodyH / 2;
  // Taller the harder it is overcharged, and tapering to a point as it shoots
  // out, so it reads as a jet of energy rather than a flag on a pole.
  const rootH = inner.innerH * (1.15 + Math.min(over, 1) * 0.7);
  const steps = 6;

  const edge = (dir, i) => {
    const t = i / steps;
    const taper = 1 - t * t * 0.82;               // pointed at the far end
    const zig = i % 2 === 0 ? 0.72 : 1;           // ragged, not smooth
    return {
      x: x + spillW * t,
      y: cy + dir * (rootH / 2) * taper * zig + Math.sin(wobble + i * 1.7 + dir) * rootH * 0.05,
    };
  };

  ctx.save();
  ctx.fillStyle = fillColor;
  ctx.strokeStyle = COLOR_TEXT;
  ctx.lineWidth = bodyH * 0.05;
  ctx.lineJoin = 'miter';

  ctx.beginPath();
  ctx.moveTo(x, cy - rootH / 2);
  for (let i = 1; i <= steps; i += 1) {
    const pt = edge(-1, i);
    ctx.lineTo(pt.x, pt.y);
  }
  ctx.lineTo(x + spillW * SPILL_TIP, cy);         // the point it bursts to
  for (let i = steps; i >= 1; i -= 1) {
    const pt = edge(1, i);
    ctx.lineTo(pt.x, pt.y);
  }
  ctx.lineTo(x, cy + rootH / 2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
};

const drawLabel = (ctx, geo, labelRight, cy, label) => {
  ctx.fillStyle = COLOR_TEXT;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.font = `bold ${geo.fontSize}px "Comic Sans MS", "Baloo 2", system-ui, sans-serif`;
  ctx.fillText(label, labelRight, cy);
};

// The gag for typing past a million: the ridiculous number tumbles off the
// bottom while the battery itself stays locked at the million-percent max.
const drawFallingOverflow = (ctx, w, h, overflow, elapsed, reduced) => {
  const label = `${overflow}%`;
  const life = reduced ? 1 : clamp01(elapsed / FALL_MS);
  if (life >= 1 && !reduced) return;

  const fontSize = Math.min(w * 0.12, 96);
  ctx.save();
  ctx.font = `bold ${fontSize}px "Comic Sans MS", "Baloo 2", system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = COLOR_TEXT;

  if (reduced) {
    // Reduced motion: flash the number once in place, then it's gone — the
    // battery still keeps the capped million until the page refreshes.
    if (elapsed < 400) {
      ctx.globalAlpha = 1 - elapsed / 400;
      ctx.fillText(label, w / 2, h * 0.28);
    }
    ctx.restore();
    return;
  }

  const startY = h * 0.28;
  const endY = h + fontSize;
  const x = w / 2 + Math.sin(life * Math.PI * 2) * w * 0.04;
  const y = lerp(startY, endY, life * life);
  const spin = life * Math.PI * 0.7;

  ctx.translate(x, y);
  ctx.rotate(spin);
  ctx.globalAlpha = 1 - life * 0.85;
  ctx.fillText(label, 0, 0);
  ctx.restore();
};

// Screen-filling electricity for an overcharge. Flashes are held to three a
// second and to a partial wash rather than a white-out (WCAG 2.3.1), and the
// whole thing is skipped for anyone who asked for reduced motion.
const drawStorm = (ctx, w, h, cx, cy, elapsed) => {
  const life = clamp01(elapsed / STORM_MS);
  const envelope = 1 - life;
  if (envelope <= 0) return;

  // Bolts, regenerated a few times a second so each one holds still briefly.
  const bucket = Math.floor(elapsed / 110);
  const reach = Math.hypot(w, h);
  ctx.save();
  ctx.lineCap = 'round';
  for (let b = 0; b < 9; b += 1) {
    const seed = bucket * 31 + b;
    const angle = (b / 9) * Math.PI * 2 + seededRandom(seed) * 0.7;
    const len = reach * (0.45 + seededRandom(seed + 7) * 0.55);
    const segments = 7;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    for (let s = 1; s <= segments; s += 1) {
      const along = (len * s) / segments;
      const spread = (seededRandom(seed + s * 13) - 0.5) * len * 0.16;
      ctx.lineTo(
        cx + Math.cos(angle) * along - Math.sin(angle) * spread,
        cy + Math.sin(angle) * along + Math.cos(angle) * spread,
      );
    }

    ctx.globalAlpha = envelope * (0.35 + seededRandom(seed + 3) * 0.4);
    ctx.strokeStyle = COLOR_OVER;
    ctx.lineWidth = 9 * envelope + 2;
    ctx.stroke();
    ctx.globalAlpha = envelope;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3 * envelope + 1;
    ctx.stroke();
  }
  ctx.restore();

  // Three flashes a second, each a quick decaying wash.
  const flash = (1 - ((elapsed / (1000 / 3)) % 1)) ** 3;
  ctx.save();
  ctx.globalAlpha = flash * envelope * 0.45;
  ctx.fillStyle = bucket % 2 === 0 ? '#ffffff' : COLOR_OVER;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
};

const tracePath = (ctx, points) => {
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i].x, points[i].y);
  ctx.stroke();
};

// A jagged line, drawn as three layers: a dark casing, the charge's yellow, and
// a white core. The casing is what makes it legible — yellow alone all but
// disappears on this near-white page, the same wall the battery's fill hit
// (WCAG 1.4.11), and it is what the fill's COLOR_TEXT outline solved.
const strokeBolt = (ctx, points, width, alpha) => {
  if (points.length < 2) return;
  ctx.globalAlpha = alpha * 0.85;
  ctx.strokeStyle = COLOR_TEXT;
  ctx.lineWidth = width * 1.55;
  tracePath(ctx, points);

  ctx.globalAlpha = alpha;
  ctx.strokeStyle = COLOR_OVER;
  ctx.lineWidth = width;
  tracePath(ctx, points);

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = Math.max(1, width * 0.32);
  tracePath(ctx, points);
};

// Past the zapping threshold the screen's own frame runs with current: a steady
// rail around the edge with arcs travelling along it. Under reduced motion the
// rail stays and the travelling stops — the state still has to be visible, it
// just doesn't move.
const drawElectricFrame = (ctx, w, h, elapsed, reduced) => {
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // A slow swell, well under any flash rate — the rail breathes, never strobes.
  const railAlpha = reduced ? 0.55 : 0.42 + Math.sin(elapsed / 260) * 0.12;
  const frame = () =>
    roundRect(ctx, FRAME_INSET, FRAME_INSET, w - FRAME_INSET * 2, h - FRAME_INSET * 2, FRAME_RADIUS);

  ctx.globalAlpha = railAlpha * 0.7;
  ctx.strokeStyle = COLOR_TEXT;
  ctx.lineWidth = 8;
  frame();
  ctx.stroke();

  ctx.globalAlpha = railAlpha;
  ctx.strokeStyle = COLOR_OVER;
  ctx.lineWidth = 5;
  frame();
  ctx.stroke();

  if (!reduced) {
    const lap = (elapsed % FRAME_LAP_MS) / FRAME_LAP_MS;
    const crackle = Math.floor(elapsed / CRACKLE_MS);
    for (let i = 0; i < FRAME_ARCS; i += 1) {
      const points = framePoints(w, h, FRAME_INSET, lap + i / FRAME_ARCS, FRAME_ARC_SPAN, {
        seed: crackle * 17 + i * 101,
        jitter: 18,
      });
      strokeBolt(ctx, points, 9, 0.85);
    }
  }

  ctx.restore();
};

// Where the letter just typed is sitting, so a bolt can be aimed at it. Falls
// back to the middle of the line it was typed on if the glyph has already gone.
const letterTarget = (w, h) => {
  const letters = document.querySelectorAll('.current-line-display span.character');
  const last = letters[letters.length - 1];
  const rect = last?.getBoundingClientRect();
  if (rect && (rect.width || rect.height)) {
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  }
  const line = document.querySelector('.current-line-display')?.getBoundingClientRect();
  if (line) return { x: line.left + line.width / 2, y: line.top + line.height / 2 };
  return { x: w / 2, y: h * 0.8 };
};

// Each bolt leaves the frame and lands on the letter, holds while the letter is
// still there, then fades once it has eaten it — with a ring at the impact so
// the letter is plainly taken rather than merely missing.
const drawZapBolt = (ctx, w, h, bolt, target, elapsed, reduced) => {
  const envelope =
    elapsed <= STRIKE_MS
      ? 1
      : 1 - clamp01((elapsed - STRIKE_MS) / Math.max(1, BOLT_MS - STRIKE_MS));
  if (envelope <= 0) return;

  const origin = boltOrigin(w, h, FRAME_INSET, target, bolt.id);
  // A still bolt under reduced motion; otherwise it re-frays as it burns.
  const crackle = reduced ? 0 : Math.floor(elapsed / 60);
  const points = boltPoints(origin, target, { seed: bolt.id * 977 + crackle * 31 });

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  strokeBolt(ctx, points, 10 * envelope + 3, envelope);

  if (elapsed > STRIKE_MS) {
    const burst = clamp01((elapsed - STRIKE_MS) / Math.max(1, BOLT_MS - STRIKE_MS));
    const radius = 12 + burst * 34;
    ctx.globalAlpha = (1 - burst) * 0.7;
    ctx.strokeStyle = COLOR_TEXT;
    ctx.lineWidth = 7 * (1 - burst) + 2;
    ctx.beginPath();
    ctx.arc(target.x, target.y, radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.globalAlpha = (1 - burst) * 0.95;
    ctx.strokeStyle = COLOR_OVER;
    ctx.lineWidth = 4 * (1 - burst) + 1;
    ctx.beginPath();
    ctx.arc(target.x, target.y, radius, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
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

  const now = performance.now();
  const elapsed = now - startTime;
  const { percent, overflow } = charge;
  const reduced = prefersReducedMotion();

  // Oversized typed value tumbles away while the battery keeps the million cap.
  if (overflow != null) drawFallingOverflow(ctx, w, h, overflow, elapsed, reduced);

  // Arrival fills 0 → charge once; after that the bar simply follows the live
  // value, easing toward it so each keystroke's point slides off.
  const arriving = elapsed < ARRIVE_MS;
  if (arriving) {
    displayed = lerp(0, percent, smoothstep(elapsed / ARRIVE_MS));
  } else {
    displayed += (percent - displayed) * 0.18;
    if (Math.abs(percent - displayed) < 0.05) displayed = percent;
  }

  // Hero geometry shrinks and flies to the corner once the charge has landed.
  const dockT = smoothstep((elapsed - ARRIVE_MS) / DOCK_MS);
  const narrow = w < NARROW_W;
  const heroBodyW = Math.min(w * 0.34, 420);
  const dockBodyW = narrow ? Math.max(60, w * 0.16) : DOCK_BODY_W;
  const geo = geometryFor(ctx, lerp(heroBodyW, dockBodyW, dockT), `${percent}%`);

  const heroCx = w / 2;
  const heroCy = h * 0.42;
  // Parked, the spill hangs off the right end, so the whole group shifts left
  // by however far it currently reaches — it slides back as the charge drains.
  const overhang = spillWidthFor(geo, displayed) * SPILL_TIP + geo.nubW * 0.6;
  const dockCx = w - DOCK_RIGHT - overhang - geo.groupW / 2;
  const dockCy = narrow ? DOCK_TOP_NARROW : DOCK_TOP;
  const cx = lerp(heroCx, dockCx, dockT);
  const cy = lerp(heroCy, dockCy, dockT);

  const groupLeft = cx - geo.groupW / 2;
  const labelRight = groupLeft + geo.labelW;
  const bodyX = groupLeft + geo.labelW + geo.gap;
  const bodyY = cy - geo.bodyH / 2;

  // The storm starts the instant the charge blows past full, not before.
  if (percent > 100 && displayed >= 100 && !stormStart && !reduced) {
    stormStart = now;
  }
  if (stormStart) drawStorm(ctx, w, h, bodyX + geo.bodyW, cy, now - stormStart);

  // Parked, it gets a soft pill behind it so it stays legible over the app.
  if (dockT > 0) {
    ctx.save();
    ctx.globalAlpha = dockT * 0.8;
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    const pad = geo.bodyH * 0.4;
    roundRect(
      ctx,
      groupLeft - pad,
      cy - geo.bodyH / 2 - pad,
      geo.groupW + pad * 2,
      geo.bodyH + pad * 2,
      geo.bodyH,
    );
    ctx.fill();
    ctx.restore();
  }

  // The frame runs with current for as long as the charge is dangerous; it
  // stops by itself as soon as a zap spends the charge back under the line.
  if (typingApp.isBatteryOvercharged.value) drawElectricFrame(ctx, w, h, elapsed, reduced);

  const fillColor = batteryFillColor(percent, elapsed, reduced);
  drawShell(ctx, geo, bodyX, bodyY);
  const inner = drawFill(ctx, geo, bodyX, bodyY, displayed, fillColor);
  drawSpill(ctx, geo, inner, bodyY, displayed, now / 90, fillColor);
  drawLabel(ctx, geo, labelRight, cy, `${percent}%`);

  // Bolts last, over everything: they are what the child is watching.
  const bolts = typingApp.zapBolts.value;
  if (bolts.length) {
    const wallClock = Date.now();
    for (const bolt of bolts) {
      if (!boltTargets.has(bolt.id)) boltTargets.set(bolt.id, letterTarget(w, h));
      drawZapBolt(ctx, w, h, bolt, boltTargets.get(bolt.id), wallClock - bolt.firedAt, reduced);
    }
  }
  // Forget the aim of bolts that have burned out, so the map can't grow.
  if (boltTargets.size > bolts.length) {
    const live = new Set(bolts.map(bolt => bolt.id));
    for (const id of boltTargets.keys()) if (!live.has(id)) boltTargets.delete(id);
  }

  rafId = requestAnimationFrame(draw);
};

const stop = () => {
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
};

// A new `id` is a new battery: replay arrival from empty. A changed percent on
// the same `id` is a drain, and the running loop eases to it on its own.
watch(
  () => typingApp.batteryCharge.value?.id,
  id => {
    stop();
    if (id == null) return;
    startTime = performance.now();
    stormStart = 0;
    displayed = 0;
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
