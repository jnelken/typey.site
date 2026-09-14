// Pure utility: parse a percent the way a young child types it — "50%" or "%50"
// (and with optional space). Returns { percent } for an exact match, otherwise
// null. Intentionally strict: the whole (trimmed) string must be the percent,
// so sentences and "50% cookie" fall through to other behaviors. Values above
// 100 are kept as typed — an overcharged battery is the joke — and the
// four-digit cap means the range is 0–9999. Four digits rather than three
// because the charge is spendable now: past 1000% the battery zaps the letters
// being typed at 1000% a shot, so a child needs room to type a charge worth
// several zaps.

const PERCENT_PATTERN = /^(\d{1,4})\s*%$|^%\s*(\d{1,4})$/;

export function parsePercent(input) {
  if (typeof input !== 'string') return null;

  const match = input.trim().match(PERCENT_PATTERN);
  if (!match) return null;

  const raw = match[1] ?? match[2];
  const value = parseInt(raw, 10);
  if (Number.isNaN(value)) return null;

  return { percent: value };
}
