// Pure geometry for the overcharge: the electricity that runs around the edge
// of the screen past 1000%, and the bolts that leap off it to eat a letter.
// Kept out of the canvas component the way `dotLayout.js` is kept out of the
// math one — the shapes are arithmetic and can be tested without a canvas.

// Stable pseudo-random: the same seed always gives the same number, so a bolt
// holds its shape for its bucket of frames instead of seething every frame.
export function seededRandom(seed) {
  const x = Math.sin(seed * 127.1) * 43758.5453;
  return x - Math.floor(x);
}

// Where fraction `t` around the screen's inset rectangle falls, plus the
// inward normal at that point so a caller can fray the line into the screen
// rather than off it. `t` wraps, so travelling is just `t += speed`.
export function perimeterPoint(w, h, inset, t) {
  const left = inset;
  const top = inset;
  const right = w - inset;
  const bottom = h - inset;
  const spanW = Math.max(0, right - left);
  const spanH = Math.max(0, bottom - top);
  const total = (spanW + spanH) * 2;
  if (total <= 0) return { x: left, y: top, nx: 0, ny: 0 };

  let d = (((t % 1) + 1) % 1) * total;

  if (d <= spanW) return { x: left + d, y: top, nx: 0, ny: 1 };
  d -= spanW;
  if (d <= spanH) return { x: right, y: top + d, nx: -1, ny: 0 };
  d -= spanH;
  if (d <= spanW) return { x: right - d, y: bottom, nx: 0, ny: -1 };
  d -= spanW;
  return { x: left, y: bottom - d, nx: 1, ny: 0 };
}

// One travelling arc of the frame: a run of the perimeter from `start`, `span`
// long, frayed inward and tapering to nothing at both ends so it reads as a
// current passing through rather than a segment stuck on.
export function framePoints(w, h, inset, start, span, { steps = 14, seed = 0, jitter = 14 } = {}) {
  const points = [];
  for (let i = 0; i <= steps; i += 1) {
    const along = i / steps;
    const point = perimeterPoint(w, h, inset, start + span * along);
    const taper = Math.sin(along * Math.PI);
    const offset = (seededRandom(seed + i * 13) - 0.5) * jitter * taper;
    points.push({ x: point.x + point.nx * offset, y: point.y + point.ny * offset });
  }
  return points;
}

// A jagged bolt from one point to another. Both ends are exact — it has to
// leave the frame and land on the letter — and the fray is widest in the
// middle, which is what makes a straight line read as lightning.
export function boltPoints(from, to, { seed = 0, segments = 9, spread = 0.18 } = {}) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy) || 1;
  const perpX = -dy / length;
  const perpY = dx / length;

  const points = [{ x: from.x, y: from.y }];
  for (let i = 1; i < segments; i += 1) {
    const along = i / segments;
    const taper = Math.sin(along * Math.PI);
    const offset = (seededRandom(seed + i * 17) - 0.5) * length * spread * taper;
    points.push({
      x: from.x + dx * along + perpX * offset,
      y: from.y + dy * along + perpY * offset,
    });
  }
  points.push({ x: to.x, y: to.y });
  return points;
}

// Where a bolt leaves the frame: a point on the perimeter picked from the
// bolt's own id, so the same bolt always fires from the same place, and biased
// to the half of the frame the letter is nearer to.
export function boltOrigin(w, h, inset, target, seed) {
  const pick = seededRandom(seed * 3 + 1);
  // Two candidates, take the one closer to the target: a bolt that crosses the
  // whole screen to reach a letter reads as unrelated to it.
  const candidates = [
    perimeterPoint(w, h, inset, pick),
    perimeterPoint(w, h, inset, seededRandom(seed * 7 + 5)),
  ];
  const distance = point => Math.hypot(point.x - target.x, point.y - target.y);
  return distance(candidates[0]) <= distance(candidates[1]) ? candidates[0] : candidates[1];
}
