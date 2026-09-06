// Maps each word prompt candidate to a matching emoji, so the practice word
// shown above the input always comes with a picture a pre-reader can use to
// confirm the word without sounding it out. Only words with an obvious,
// kid-recognizable emoji get an entry — abstract sight words (the, and, you)
// are left out and simply never chosen as a prompt.
export const WORD_EMOJI = {
  mom: '👩',
  dad: '👨',
  mommy: '👩',
  daddy: '👨',
  baby: '👶',
  love: '❤️',
  hug: '🤗',
  kiss: '💋',
  hello: '👋',
  happy: '😊',
  smile: '😄',
  play: '⚽',
  fun: '🎉',
  run: '🏃',
  jump: '🤸',
  go: '🚦',
  cat: '🐱',
  dog: '🐶',
  puppy: '🐶',
  kitty: '🐱',
  fish: '🐟',
  frog: '🐸',
  bird: '🐦',
  bee: '🐝',
  duck: '🦆',
  bear: '🐻',
  lion: '🦁',
  tiger: '🐯',
  zebra: '🦓',
  panda: '🐼',
  horse: '🐴',
  sheep: '🐑',
  mouse: '🐭',
  snake: '🐍',
  shark: '🦈',
  whale: '🐳',
  monkey: '🐵',
  rabbit: '🐰',
  turtle: '🐢',
  spider: '🕷️',
  dino: '🦕',
  dinosaur: '🦖',
  dragon: '🐉',
  unicorn: '🦄',
  butterfly: '🦋',
  elephant: '🐘',
  giraffe: '🦒',
  apple: '🍎',
  banana: '🍌',
  orange: '🍊',
  cookie: '🍪',
  candy: '🍬',
  cake: '🎂',
  milk: '🥛',
  water: '💧',
  pizza: '🍕',
  icecream: '🍦',
  ball: '⚽',
  book: '📚',
  tree: '🌳',
  star: '⭐',
  moon: '🌙',
  sun: '☀️',
  house: '🏠',
  car: '🚗',
  truck: '🚚',
  train: '🚂',
  plane: '✈️',
  boat: '🚤',
  rocket: '🚀',
  robot: '🤖',
  heart: '❤️',
  flower: '🌸',
  rainbow: '🌈',
  snow: '❄️',
  rain: '🌧️',
  music: '🎵',
  party: '🎉',
  money: '💵',
  cars: '🚗',
  stars: '⭐',
  hearts: '💕',
  lions: '🦁',
  rockets: '🚀',
  unicorns: '🦄',
  butterflies: '🦋',
  flowers: '🌸',
  ghosts: '👻',
  blue: '🔵',
  green: '🟢',
  yellow: '🟡',
  purple: '🟣',
  pink: '🩷',
  black: '⚫',
  white: '⚪',
  brown: '🟤',
};

/**
 * The emoji for a word, or null when the word has none.
 */
export function emojiForWord(word) {
  if (typeof word !== 'string') return null;
  return WORD_EMOJI[word.toLowerCase()] ?? null;
}

/**
 * The first word in a line that has an emoji, as `{ word, emoji }`, or null
 * when the line has none. A plural falls back to its singular ("cookies" is
 * still a 🍪) so a stray S doesn't cost a child their picture.
 */
export function findWordEmoji(text) {
  if (typeof text !== 'string') return null;

  for (const word of text.toLowerCase().split(/[^a-z]+/)) {
    if (!word) continue;

    const emoji = emojiForWord(word);
    if (emoji) return { word, emoji };

    if (word.endsWith('s')) {
      const singular = word.slice(0, -1);
      const singularEmoji = emojiForWord(singular);
      if (singularEmoji) return { word: singular, emoji: singularEmoji };
    }
  }
  return null;
}
