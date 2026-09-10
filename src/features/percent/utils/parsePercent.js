// Pure utility: parse a percent the way a young child types it — "50%" or "%50"
// (and with optional space). Returns { percent } for an exact match, otherwise
// null. Intentionally strict: the whole (trimmed) string must be the percent,
// so sentences and "50% cookie" fall through to other behaviors. Values above
// 100 clamp to 100; the three-digit cap means "1000%" doesn't match at all.

const PERCENT_PATTERN = /^(\d{1,3})\s*%$|^%\s*(\d{1,3})$/;

export function parsePercent(input) {
  if (typeof input !== 'string') return null;

  const match = input.trim().match(PERCENT_PATTERN);
  if (!match) return null;

  const raw = match[1] ?? match[2];
  const value = parseInt(raw, 10);
  if (Number.isNaN(value)) return null;

  return { percent: Math.min(value, 100) };
}
