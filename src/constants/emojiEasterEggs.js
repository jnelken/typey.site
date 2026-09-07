// Effects that no dictionary word can carry.
//
// Every typable word now lives in `src/features/typing/utils/wordEmoji.js` and
// gets its motion from `src/features/effects/utils/wordMotion.js`. What's left
// here is the one effect triggered by punctuation rather than by a word: an
// amount of money, where the number typed is the number of bills that rain.

export const SPECIAL_EFFECTS = [
  {
    id: 'money-rain',
    triggersAny: [/\$/],
    mustAlsoMatch: [/\d+/],
    type: 'rain',
    emojis: ['💵', '💸'],
    // One bill per dollar typed: "$5" rains five. Written either way round,
    // since a child may well type the sign after the number.
    count: { fallback: 60, cap: 1000, numberPattern: /\$\s*(\d+)|(\d+)\s*\$/ },
    options: { minDuration: 3000, maxDuration: 7000, stagger: 1200, minSize: 22, maxSize: 40, max: 1000, flair: 'spin' },
  },
];
