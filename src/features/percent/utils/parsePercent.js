// Pure utility: parse a percent the way a young child types it — "50%" or "%50"
// (and with optional space). Returns { percent } for an exact match, otherwise
// null. Intentionally strict: the whole (trimmed) string must be the percent,
// so sentences and "50% cookie" fall through to other behaviors. Values above
// 100 are kept as typed — an overcharged battery is the joke — and the cap at
// one million leaves room for a charge worth many cheap zaps (100% apiece once
// past the 1000% danger line).

export const MAX_CHARGE = 1_000_000;

const PERCENT_PATTERN = /^(\d{1,7})\s*%$|^%\s*(\d{1,7})$/;

export function parsePercent(input) {
  if (typeof input !== 'string') return null;

  const match = input.trim().match(PERCENT_PATTERN);
  if (!match) return null;

  const raw = match[1] ?? match[2];
  const value = parseInt(raw, 10);
  if (Number.isNaN(value) || value > MAX_CHARGE) return null;

  return { percent: value };
}
