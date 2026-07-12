// Pure utility: parse a simple "a + b" or "a - b" the way a young child types
// it. Returns { a, b, op, result } for an exact two-operand sum/difference,
// otherwise null. Intentionally strict: the whole (trimmed) string must be the
// equation, so normal sentences and bare numbers fall through to other
// behaviors. Subtraction that would go negative returns null (kept age-safe).

const EQUATION_PATTERN = /^(\d+)\s*([+-])\s*(\d+)$/;

export function parseEquation(input) {
  if (typeof input !== 'string') return null;

  const match = input.trim().match(EQUATION_PATTERN);
  if (!match) return null;

  const a = parseInt(match[1], 10);
  const op = match[2];
  const b = parseInt(match[3], 10);
  if (Number.isNaN(a) || Number.isNaN(b)) return null;

  const result = op === '+' ? a + b : a - b;
  if (result < 0) return null;

  return { a, b, op, result };
}
