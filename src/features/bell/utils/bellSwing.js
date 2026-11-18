// Deterministic swing of the tower bell from the same schedule that drives the
// audio. Each strike kicks the bell to alternating sides; the swing then rings
// down as a damped oscillation. Pure: same schedule + same time = same angle.

export const SWING = Object.freeze({
  maxDegrees: 24,
  chimeKick: 6,
  tollKick: 22,
  period: 1.6, // seconds per full swing
  decay: 1.4, // seconds for the swing to fall to 1/e
});

/** Bell angle in degrees at `time` seconds into `events`. 0 before the first strike. */
export function swingAngle(events, time) {
  if (!Array.isArray(events) || time < 0) return 0;

  let angle = 0;
  events.forEach((event, i) => {
    const dt = time - event.time;
    if (dt < 0) return;
    const kick = event.type === 'toll' ? SWING.tollKick : SWING.chimeKick;
    const side = i % 2 === 0 ? 1 : -1;
    angle += side * kick * Math.exp(-dt / SWING.decay) * Math.sin((2 * Math.PI * dt) / SWING.period + Math.PI / 2);
  });

  return Math.max(-SWING.maxDegrees, Math.min(SWING.maxDegrees, angle));
}
