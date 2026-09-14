// Pure utility: parse a percent the way a young child types it — "50%" or "%50"
// (and with optional space). Returns { percent } for an exact match, otherwise
// null. Intentionally strict: the whole (trimmed) string must be the percent,
// so sentences and "50% cookie" fall through to other behaviors. Values above
// 100 are kept as typed — an overcharged battery is the joke. Values above
// MAX_CHARGE are also kept: the animation clamps the battery at a million and
// lets the oversized number fall off the screen.

export const MAX_CHARGE = 1_000_000;

// Up to fifteen digits leaves room for a ridiculous over-a-million gag without
// inviting Number.MAX_SAFE_INTEGER overflow from a pasted wall of digits.
const PERCENT_PATTERN = /^(\d{1,15})\s*%$|^%\s*(\d{1,15})$/;

export function parsePercent(input) {
  if (typeof input !== 'string') return null;

  const match = input.trim().match(PERCENT_PATTERN);
  if (!match) return null;

  const raw = match[1] ?? match[2];
  const value = parseInt(raw, 10);
  if (Number.isNaN(value)) return null;

  return { percent: value };
}
