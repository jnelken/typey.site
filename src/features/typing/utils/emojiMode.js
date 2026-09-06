// Emoji Mode — maps each alphanumeric and symbol character to a matching emoji
// so the typed line renders as pictures instead of letters.
//
// The mapping is display-only: speech, easter eggs, word suggestions and the
// Tidbyt submission all keep reading the real text, so the mode stays a fun
// skin rather than a different app.
//
// Letters map to an object whose spoken name starts with that letter, which is
// what makes the mode accessible: VoiceOver announces "apple" for A, "bear"
// for B, and so on. Digits use keycap emoji so they are read as the number
// itself. A few letters have no kid-recognizable namesake (Q, X, Z), so those
// fall back to the closest familiar object.

const LETTER_EMOJI = {
  a: '🍎', // apple
  b: '🐻', // bear
  c: '🐱', // cat
  d: '🐶', // dog
  e: '🐘', // elephant
  f: '🐸', // frog
  g: '🍇', // grapes
  h: '🏠', // house
  i: '🍦', // ice cream
  j: '🧃', // juice box
  k: '🔑', // key
  l: '🦁', // lion
  m: '🌙', // moon
  n: '👃', // nose
  o: '🐙', // octopus
  p: '🍕', // pizza
  q: '👑', // queen's crown
  r: '🌈', // rainbow
  s: '⭐', // star
  t: '🌳', // tree
  u: '🦄', // unicorn
  v: '🎻', // violin
  w: '🍉', // watermelon
  x: '❌', // cross mark
  y: '🪀', // yo-yo
  z: '🦓', // zebra
};

const DIGIT_EMOJI = {
  0: '0️⃣',
  1: '1️⃣',
  2: '2️⃣',
  3: '3️⃣',
  4: '4️⃣',
  5: '5️⃣',
  6: '6️⃣',
  7: '7️⃣',
  8: '8️⃣',
  9: '9️⃣',
};

const SYMBOL_EMOJI = {
  '!': '❗',
  '?': '❓',
  '+': '➕',
  '-': '➖',
  '=': '🟰',
  '/': '➗',
  '*': '✳️',
  $: '💵',
  '@': '📧',
  '#': '🔢',
  '%': '💯',
  '&': '🤝',
  '<': '◀️',
  '>': '▶️',
};

export const EMOJI_MODE_MAP = Object.freeze({
  ...LETTER_EMOJI,
  ...DIGIT_EMOJI,
  ...SYMBOL_EMOJI,
});

/**
 * The emoji for a single character, or null when nothing is mapped.
 * Letters are matched case-insensitively so caps lock makes no difference.
 */
export function emojiForChar(char) {
  if (typeof char !== 'string' || char.length === 0) return null;
  return EMOJI_MODE_MAP[char.toLowerCase()] ?? null;
}

/**
 * Rewrite a line for display in emoji mode. Unmapped characters — spaces and
 * punctuation outside the symbol set — pass through untouched, so word
 * boundaries survive and the line stays readable.
 */
export function toEmojiText(text) {
  if (typeof text !== 'string' || text.length === 0) return '';
  let out = '';
  for (const char of text) {
    out += emojiForChar(char) ?? char;
  }
  return out;
}
