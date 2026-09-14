import { GROUP_COLORS } from '@/constants/palette';

// Outline the fill is stroked with — WCAG 1.4.11 rides on this, not the wash.
export const COLOR_TEXT = '#2b2d42';

export const COLOR_LOW = GROUP_COLORS[0]; // vermillion — ≤20%
export const COLOR_MID = GROUP_COLORS[3]; // green — ≤100%
export const COLOR_OVER = GROUP_COLORS[2]; // yellow — ≤ zap threshold (1000%)
// Okabe-Ito sky blue rather than GROUP_COLORS[4] (#0072B2): the darker blue
// only clears ~2.6:1 against COLOR_TEXT, below WCAG 1.4.11's 3:1.
export const COLOR_HIGH = '#56B4E9';
// Highest band: two purples that flip on a short crackle so the fill seethes.
// Both clear 3:1 against COLOR_TEXT (WCAG 1.4.11).
export const COLOR_PEAK_A = '#BE4BDB';
export const COLOR_PEAK_B = '#E599F7';

// Matches ZAP_THRESHOLD in usePercentAnimation — kept literal here so this
// util does not import the Vue composable.
const OVERCHARGE_THRESHOLD = 1000;
// Past this the fill goes purple — well above the zap line, toward the million.
export const PEAK_THRESHOLD = 100_000;

// Same crackle cadence the electric frame uses, so the flicker feels related.
export const FLICKER_MS = 110;

/**
 * Fill colour for the battery body (and matching spill) at a given charge.
 * `elapsed` drives the purple flicker; `reducedMotion` freezes it on COLOR_PEAK_A.
 */
export function batteryFillColor(percent, elapsed = 0, reducedMotion = false) {
  if (percent <= 20) return COLOR_LOW;
  if (percent <= 100) return COLOR_MID;
  if (percent <= OVERCHARGE_THRESHOLD) return COLOR_OVER;
  if (percent <= PEAK_THRESHOLD) return COLOR_HIGH;
  if (reducedMotion) return COLOR_PEAK_A;
  const bucket = Math.floor(Math.max(0, elapsed) / FLICKER_MS);
  return bucket % 2 === 0 ? COLOR_PEAK_A : COLOR_PEAK_B;
}
