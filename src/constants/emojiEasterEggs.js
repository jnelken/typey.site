// Declarative emoji easter egg configuration
// Each entry defines how to detect a phrase and what animation/emojis to spawn

export const EASTER_EGGS = [
  // 1) Money rain when $ and a number appear
  {
    id: 'money-rain',
    triggersAny: [/\$/],
    mustAlsoMatch: [/\d+/],
    type: 'rain',
    emojis: ['💵', '💸'],
    count: { fallback: 60, cap: 150 },
    options: { minDuration: 3000, maxDuration: 7000, stagger: 1200, minSize: 22, maxSize: 40 },
    hints: ['money', 'dollar'],
  },
  // 2) Lions run: "N lions" or presence of word
  {
    id: 'lions-run',
    triggersAny: [/lions?/i],
    type: 'run',
    emojis: ['🦁'],
    count: { fallback: 6, cap: 40, numberPattern: /(\d+)\s*lions?/i },
    options: { minDuration: 4000, maxDuration: 7000, stagger: 1500, minSize: 28, maxSize: 48, direction: 'random' },
    hints: ['lions'],
  },
  // 3) Rockets launch
  { id: 'rockets-float', triggersAny: [/rockets?/i], type: 'float', emojis: ['🚀'], count: { fallback: 5, cap: 30, numberPattern: /(\d+)\s*rockets?/i }, options: { minDuration: 3000, maxDuration: 6000, stagger: 1200, minSize: 26, maxSize: 42 }, hints: ['rockets'] },
  // 4) Stars float
  { id: 'stars-float', triggersAny: [/stars?/i], type: 'float', emojis: ['✨', '⭐️'], count: { fallback: 24, cap: 120, numberPattern: /(\d+)\s*stars?/i }, options: { minDuration: 3500, maxDuration: 7000, stagger: 1500, minSize: 18, maxSize: 28 }, hints: ['stars'] },
  // 5) Hearts float
  { id: 'hearts-float', triggersAny: [/hearts?/i], type: 'float', emojis: ['💖', '💗', '💞'], count: { fallback: 20, cap: 100, numberPattern: /(\d+)\s*hearts?/i }, options: { minDuration: 4000, maxDuration: 8000, stagger: 1600, minSize: 22, maxSize: 36 }, hints: ['hearts'] },
  // 6) Pizza rain
  { id: 'pizza-rain', triggersAny: [/pizzas?/i, /\bpizza\b/i], type: 'rain', emojis: ['🍕'], count: { fallback: 30, cap: 120, numberPattern: /(\d+)\s*pizzas?/i }, options: { minDuration: 3500, maxDuration: 7000, stagger: 1500, minSize: 24, maxSize: 40 }, hints: ['pizza'] },
  // 7) Rainbow float
  { id: 'rainbow-float', triggersAny: [/rainbows?/i, /\brainbow\b/i], type: 'float', emojis: ['🌈'], count: { fallback: 6, cap: 20 }, options: { minDuration: 4000, maxDuration: 8000, stagger: 1500, minSize: 28, maxSize: 44 }, hints: ['rainbow'] },
  // 8) Unicorns run
  { id: 'unicorns-run', triggersAny: [/unicorns?/i], type: 'run', emojis: ['🦄'], count: { fallback: 5, cap: 30, numberPattern: /(\d+)\s*unicorns?/i }, options: { minDuration: 4500, maxDuration: 8000, stagger: 1800, minSize: 28, maxSize: 48, direction: 'random' }, hints: ['unicorns'] },
  // 9) Notes float
  { id: 'notes-float', triggersAny: [/music/i, /notes?/i], type: 'float', emojis: ['🎵', '🎶'], count: { fallback: 20, cap: 100, numberPattern: /(\d+)\s*(notes?|music)/i }, options: { minDuration: 3500, maxDuration: 8000, stagger: 1800, minSize: 22, maxSize: 34 }, hints: ['music', 'notes'] },
  // 10) Party burst + rain
  { id: 'party-burst', triggersAny: [/party/i, /celebrat/i, /congrats/i, /\byay\b/i, /hooray/i], type: 'burst', emojis: ['🎉', '🎊'], count: { fallback: 24, cap: 60 }, options: { minDuration: 2000, maxDuration: 4000, stagger: 800, minSize: 22, maxSize: 36 }, hints: ['party', 'celebrate', 'congrats', 'yay', 'hooray'] },
  { id: 'party-rain', triggersAny: [/party/i, /celebrat/i, /congrats/i, /\byay\b/i, /hooray/i], type: 'rain', emojis: ['🎉', '🎊'], count: { fallback: 40, cap: 120 }, options: { minDuration: 3000, maxDuration: 6000, stagger: 1200, minSize: 20, maxSize: 30 }, hints: ['party'] },
  // 11) Sun float
  { id: 'sun-float', triggersAny: [/\bsun\b/i, /sunny/i], type: 'float', emojis: ['☀️'], count: { fallback: 6, cap: 20 }, options: { minDuration: 5000, maxDuration: 9000, stagger: 1500, minSize: 28, maxSize: 46 }, hints: ['sun', 'sunny'] },
  // 12) Snow fall
  { id: 'snow-rain', triggersAny: [/snow/i, /snowflakes?/i], type: 'rain', emojis: ['❄️'], count: { fallback: 40, cap: 150, numberPattern: /(\d+)\s*(snowflakes?|snow)/i }, options: { minDuration: 5000, maxDuration: 10000, stagger: 2000, minSize: 16, maxSize: 26, rotate: true, rotateMin: 4000, rotateMax: 9000 }, hints: ['snow', 'snowflakes'] },
  // 13) Butterflies float
  { id: 'butterflies-float', triggersAny: [/butterflies?/i], type: 'float', emojis: ['🦋'], count: { fallback: 10, cap: 40, numberPattern: /(\d+)\s*butterflies?/i }, options: { minDuration: 5000, maxDuration: 9000, stagger: 2000, minSize: 24, maxSize: 36 }, hints: ['butterflies'] },
  // 14) Cars run
  { id: 'cars-run', triggersAny: [/cars?/i], type: 'run', emojis: ['🚗'], count: { fallback: 8, cap: 40, numberPattern: /(\d+)\s*cars?/i }, options: { minDuration: 4500, maxDuration: 8000, stagger: 1800, minSize: 26, maxSize: 44, direction: 'left' }, hints: ['cars'] },
  // 15) Ghosts float (friendly)
  { id: 'ghosts-float', triggersAny: [/ghosts?/i], type: 'float', emojis: ['👻'], count: { fallback: 10, cap: 60, numberPattern: /(\d+)\s*ghosts?/i }, options: { minDuration: 4000, maxDuration: 9000, stagger: 2000, minSize: 24, maxSize: 40 }, hints: ['ghosts'] },
  // 16) Flowers float
  { id: 'flowers-float', triggersAny: [/flowers?/i], type: 'float', emojis: ['🌸', '🌼', '🌷'], count: { fallback: 20, cap: 100, numberPattern: /(\d+)\s*flowers?/i }, options: { minDuration: 4500, maxDuration: 9000, stagger: 1800, minSize: 20, maxSize: 34 }, hints: ['flowers'] },
];
