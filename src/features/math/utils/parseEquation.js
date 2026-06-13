// Pure utility: parse a simple "a + b" addition the way a young child types it.
// Returns { a, b, sum } for an exact two-operand addition, otherwise null.
// Intentionally strict: the whole (trimmed) string must be the equation, so
// normal sentences and bare numbers fall through to other behaviors.

const EQUATION_PATTERN = /^(\d+)\s*\+\s*(\d+)$/;

export function parseEquation(input) {
  if (typeof input !== 'string') return null;

  const match = input.trim().match(EQUATION_PATTERN);
  if (!match) return null;

  const a = parseInt(match[1], 10);
  const b = parseInt(match[2], 10);
  if (Number.isNaN(a) || Number.isNaN(b)) return null;

  return { a, b, sum: a + b };
}
