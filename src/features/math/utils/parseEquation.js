// Pure utility: parse a simple "a + b" or "a - b" the way a young child types
// it. Returns { a, b, op, result, modifier } for an exact two-operand
// sum/difference, otherwise null. Intentionally strict: the whole (trimmed)
// string must be the equation, so normal sentences and bare numbers fall
// through to other behaviors. Subtraction that would go negative returns null
// (kept age-safe).
//
// A trailing "=answer" is accepted and ignored — a kid typing "1+1=2" (or
// "1+1=3") is still typing the equation "1+1" and should get its animation
// either way; the computed `result` always comes from a/op/b, never from what
// they typed after the "=".
//
// Either number may carry a "$" or "%" modifier, written before or after it
// the way the money egg takes "$5" or "5$" and the battery takes "50%" or
// "%50". The modifier says what the answer *is* — five dollars, five percent —
// so the caller plays that effect on the result. A line may carry more than one
// ("2% + $3"), and the last one typed wins: it is the most recent thing the
// child asked for, and reading left to right it is the one their eye is on.

const MODIFIER = '[$%]';
// One operand: optional modifier, digits, optional modifier.
const OPERAND = `(?:(${MODIFIER})\\s*)?(\\d+)(?:\\s*(${MODIFIER}))?`;
const EQUATION_PATTERN = new RegExp(
  `^${OPERAND}\\s*([+-])\\s*${OPERAND}(?:\\s*=\\s*(?:(${MODIFIER})\\s*)?\\d+(?:\\s*(${MODIFIER}))?)?$`
);

export function parseEquation(input) {
  if (typeof input !== 'string') return null;

  const match = input.trim().match(EQUATION_PATTERN);
  if (!match) return null;

  const [, aBefore, aDigits, aAfter, op, bBefore, bDigits, bAfter, ansBefore, ansAfter] = match;

  const a = parseInt(aDigits, 10);
  const b = parseInt(bDigits, 10);
  if (Number.isNaN(a) || Number.isNaN(b)) return null;

  const result = op === '+' ? a + b : a - b;
  if (result < 0) return null;

  // Listed in the order they appear in the line, so the last entry is the
  // last modifier typed.
  const modifiers = [aBefore, aAfter, bBefore, bAfter, ansBefore, ansAfter].filter(Boolean);
  const modifier = modifiers.length ? modifiers[modifiers.length - 1] : null;

  return { a, b, op, result, modifier };
}
