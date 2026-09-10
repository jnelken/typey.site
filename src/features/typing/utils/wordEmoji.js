// The emoji word library: every word worth typing for a kid, paired with the
// picture that proves they got it right.
//
// Words are drawn from across the emoji keyboard — faces, animals, food,
// nature, space, vehicles, play, home, clothes, symbols — and kept to ones a
// child would actually want to type and can recognise at a glance. Anything
// abstract (the, and, you) is deliberately absent: no picture, no entry.
//
// This map is the source of truth for practice words, so adding an entry here
// puts the word into rotation, gives it ghost-text spelling help, and gives it
// an animation. A handful of entries are two words ("traffic light"); those
// are matched as a phrase before single words are considered.

// Faces and feelings
const FEELING_EMOJI = {
  happy: '😊',
  smile: '😄',
  laugh: '😂',
  silly: '🤪',
  sad: '😢',
  cry: '😭',
  mad: '😡',
  angry: '😠',
  scared: '😨',
  surprised: '😲',
  wow: '🤩',
  cool: '😎',
  wink: '😉',
  yum: '😋',
  sick: '🤒',
  sleepy: '😴',
  sleep: '😴',
  tired: '🥱',
  dream: '💭',
  think: '🤔',
  quiet: '🤫',
  celebrate: '🥳',
  love: '❤️',
  kiss: '💋',
  hug: '🤗',
  hello: '👋',
};

// People, family and jobs
const PEOPLE_EMOJI = {
  baby: '👶',
  boy: '👦',
  girl: '👧',
  kid: '🧒',
  man: '👨',
  woman: '👩',
  mom: '👩',
  mommy: '👩',
  dad: '👨',
  daddy: '👨',
  grandma: '👵',
  grandpa: '👴',
  family: '👨‍👩‍👧',
  friend: '🧑‍🤝‍🧑',
  doctor: '🧑‍⚕️',
  nurse: '🧑‍⚕️',
  teacher: '🧑‍🏫',
  farmer: '🧑‍🌾',
  chef: '🧑‍🍳',
  cook: '🧑‍🍳',
  police: '👮',
  firefighter: '🧑‍🚒',
  astronaut: '🧑‍🚀',
  pilot: '🧑‍✈️',
  artist: '🧑‍🎨',
  singer: '🧑‍🎤',
  scientist: '🧑‍🔬',
  builder: '👷',
  dancer: '💃',
  runner: '🏃',
  swimmer: '🏊',
};

// Make-believe
const MAGIC_EMOJI = {
  ghost: '👻',
  ghosts: '👻',
  monster: '👾',
  alien: '👽',
  robot: '🤖',
  dragon: '🐉',
  unicorn: '🦄',
  unicorns: '🦄',
  fairy: '🧚',
  mermaid: '🧜',
  wizard: '🧙',
  witch: '🧙',
  superhero: '🦸',
  prince: '🤴',
  princess: '👸',
  crown: '👑',
  angel: '👼',
  santa: '🎅',
  elf: '🧝',
  zombie: '🧟',
  ninja: '🥷',
  genie: '🧞',
  magic: '🪄',
};

// Body
const BODY_EMOJI = {
  hand: '🖐️',
  wave: '👋',
  clap: '👏',
  eye: '👁️',
  eyes: '👀',
  nose: '👃',
  ear: '👂',
  mouth: '👄',
  tooth: '🦷',
  tongue: '👅',
  foot: '🦶',
  leg: '🦵',
  muscle: '💪',
  brain: '🧠',
  bone: '🦴',
};

// Animals
const ANIMAL_EMOJI = {
  cat: '🐱',
  kitty: '🐱',
  dog: '🐶',
  puppy: '🐶',
  mouse: '🐭',
  rat: '🐀',
  hamster: '🐹',
  rabbit: '🐰',
  bunny: '🐰',
  fox: '🦊',
  bear: '🐻',
  panda: '🐼',
  koala: '🐨',
  tiger: '🐯',
  lion: '🦁',
  lions: '🦁',
  cow: '🐮',
  pig: '🐷',
  frog: '🐸',
  monkey: '🐵',
  gorilla: '🦍',
  chicken: '🐔',
  chick: '🐤',
  rooster: '🐓',
  turkey: '🦃',
  penguin: '🐧',
  bird: '🐦',
  duck: '🦆',
  goose: '🦢',
  swan: '🦢',
  eagle: '🦅',
  owl: '🦉',
  parrot: '🦜',
  peacock: '🦚',
  flamingo: '🦩',
  dove: '🕊️',
  feather: '🪶',
  bat: '🦇',
  wolf: '🐺',
  horse: '🐴',
  pony: '🐴',
  zebra: '🦓',
  deer: '🦌',
  sheep: '🐑',
  goat: '🐐',
  llama: '🦙',
  camel: '🐫',
  giraffe: '🦒',
  elephant: '🐘',
  rhino: '🦏',
  hippo: '🦛',
  kangaroo: '🦘',
  sloth: '🦥',
  otter: '🦦',
  skunk: '🦨',
  hedgehog: '🦔',
  squirrel: '🐿️',
  raccoon: '🦝',
  beaver: '🦫',
  seal: '🦭',
  poodle: '🐩',
  paw: '🐾',
  dino: '🦕',
  dinosaur: '🦖',
};

// Bugs and creepy crawlies
const BUG_EMOJI = {
  bee: '🐝',
  bug: '🐛',
  caterpillar: '🐛',
  worm: '🪱',
  ant: '🐜',
  ladybug: '🐞',
  butterfly: '🦋',
  butterflies: '🦋',
  snail: '🐌',
  spider: '🕷️',
  web: '🕸️',
  cricket: '🦗',
  scorpion: '🦂',
};

// Sea and reptiles
const SEA_EMOJI = {
  fish: '🐟',
  goldfish: '🐠',
  dolphin: '🐬',
  whale: '🐳',
  shark: '🦈',
  octopus: '🐙',
  squid: '🦑',
  crab: '🦀',
  lobster: '🦞',
  shrimp: '🦐',
  turtle: '🐢',
  snake: '🐍',
  lizard: '🦎',
  crocodile: '🐊',
};

// Fruit and vegetables
const PRODUCE_EMOJI = {
  apple: '🍎',
  banana: '🍌',
  orange: '🍊',
  lemon: '🍋',
  grapes: '🍇',
  watermelon: '🍉',
  melon: '🍈',
  strawberry: '🍓',
  blueberry: '🫐',
  cherry: '🍒',
  peach: '🍑',
  pear: '🍐',
  pineapple: '🍍',
  mango: '🥭',
  coconut: '🥥',
  kiwi: '🥝',
  tomato: '🍅',
  avocado: '🥑',
  corn: '🌽',
  carrot: '🥕',
  potato: '🥔',
  broccoli: '🥦',
  cucumber: '🥒',
  onion: '🧅',
  garlic: '🧄',
  pepper: '🌶️',
  mushroom: '🍄',
  peanut: '🥜',
};

// Meals, treats and drinks
const FOOD_EMOJI = {
  bread: '🍞',
  toast: '🍞',
  croissant: '🥐',
  bagel: '🥯',
  pancakes: '🥞',
  waffle: '🧇',
  cheese: '🧀',
  egg: '🥚',
  bacon: '🥓',
  meat: '🍖',
  burger: '🍔',
  fries: '🍟',
  pizza: '🍕',
  hotdog: '🌭',
  sandwich: '🥪',
  taco: '🌮',
  burrito: '🌯',
  popcorn: '🍿',
  soup: '🍲',
  salad: '🥗',
  sushi: '🍣',
  rice: '🍚',
  noodles: '🍜',
  spaghetti: '🍝',
  pretzel: '🥨',
  butter: '🧈',
  salt: '🧂',
  cookie: '🍪',
  cake: '🎂',
  cupcake: '🧁',
  pie: '🥧',
  donut: '🍩',
  candy: '🍬',
  lollipop: '🍭',
  chocolate: '🍫',
  honey: '🍯',
  icecream: '🍦',
  'ice cream': '🍦',
  milk: '🥛',
  juice: '🧃',
  water: '💧',
  tea: '🍵',
  soda: '🥤',
};

// Weather, sky and growing things
const NATURE_EMOJI = {
  sun: '☀️',
  sunny: '☀️',
  moon: '🌙',
  star: '⭐',
  stars: '⭐',
  cloud: '☁️',
  rain: '🌧️',
  snow: '❄️',
  snowflake: '❄️',
  snowman: '⛄',
  storm: '⛈️',
  lightning: '⚡',
  tornado: '🌪️',
  wind: '🌬️',
  fog: '🌫️',
  rainbow: '🌈',
  fire: '🔥',
  ocean: '🌊',
  earth: '🌍',
  world: '🌍',
  tree: '🌳',
  palm: '🌴',
  cactus: '🌵',
  leaf: '🍃',
  grass: '🌿',
  clover: '🍀',
  flower: '🌸',
  flowers: '🌸',
  rose: '🌹',
  sunflower: '🌻',
  tulip: '🌷',
  seed: '🌱',
  plant: '🪴',
  pumpkin: '🎃',
  mountain: '⛰️',
  volcano: '🌋',
  desert: '🏜️',
  island: '🏝️',
  beach: '🏖️',
  park: '🏞️',
  rock: '🪨',
  log: '🪵',
};

// Space
const SPACE_EMOJI = {
  rocket: '🚀',
  rockets: '🚀',
  planet: '🪐',
  ufo: '🛸',
  comet: '☄️',
  satellite: '🛰️',
  telescope: '🔭',
};

// Vehicles
const VEHICLE_EMOJI = {
  car: '🚗',
  cars: '🚗',
  taxi: '🚕',
  bus: '🚌',
  'school bus': '🚌',
  truck: '🚚',
  firetruck: '🚒',
  'fire truck': '🚒',
  ambulance: '🚑',
  'police car': '🚓',
  tractor: '🚜',
  farm: '🚜',
  bike: '🚲',
  bicycle: '🚲',
  scooter: '🛴',
  skateboard: '🛹',
  motorcycle: '🏍️',
  train: '🚂',
  choo: '🚂',
  subway: '🚇',
  tram: '🚊',
  plane: '✈️',
  airplane: '✈️',
  helicopter: '🚁',
  boat: '🚤',
  sailboat: '⛵',
  ship: '🚢',
  canoe: '🛶',
  anchor: '⚓',
};

// Places and street
const PLACE_EMOJI = {
  'traffic light': '🚦',
  'stop light': '🚦',
  stoplight: '🚦',
  stop: '🛑',
  'stop sign': '🛑',
  go: '🟢',
  house: '🏠',
  home: '🏠',
  castle: '🏰',
  tent: '⛺',
  school: '🏫',
  hospital: '🏥',
  store: '🏪',
  bridge: '🌉',
  road: '🛣️',
  city: '🏙️',
};

// Sports, games and music
const PLAY_EMOJI = {
  ball: '⚽',
  soccer: '⚽',
  basketball: '🏀',
  football: '🏈',
  baseball: '⚾',
  tennis: '🎾',
  volleyball: '🏐',
  bowling: '🎳',
  hockey: '🏒',
  golf: '⛳',
  skate: '⛸️',
  ski: '⛷️',
  surf: '🏄',
  swim: '🏊',
  run: '🏃',
  jump: '🤸',
  dance: '💃',
  kite: '🪁',
  balloon: '🎈',
  party: '🎉',
  yay: '🎉',
  hooray: '🎉',
  congrats: '🎉',
  gift: '🎁',
  present: '🎁',
  drum: '🥁',
  guitar: '🎸',
  piano: '🎹',
  trumpet: '🎺',
  violin: '🎻',
  music: '🎵',
  note: '🎵',
  song: '🎶',
  game: '🎮',
  play: '🎮',
  fun: '🎉',
  puzzle: '🧩',
  dice: '🎲',
  cards: '🃏',
  teddy: '🧸',
  'teddy bear': '🧸',
  toy: '🧸',
  art: '🎨',
  paint: '🎨',
  crayon: '🖍️',
  brush: '🖌️',
  book: '📚',
  pencil: '✏️',
  pen: '🖊️',
  medal: '🏅',
  trophy: '🏆',
  circus: '🎪',
  movie: '🎬',
  camera: '📷',
  ticket: '🎫',
  mask: '🎭',
};

// Things around the house
const THING_EMOJI = {
  phone: '📱',
  tv: '📺',
  clock: '⏰',
  watch: '⌚',
  key: '🔑',
  lock: '🔒',
  light: '💡',
  lamp: '💡',
  candle: '🕯️',
  flashlight: '🔦',
  battery: '🔋',
  magnet: '🧲',
  hammer: '🔨',
  wrench: '🔧',
  scissors: '✂️',
  soap: '🧼',
  bath: '🛁',
  toilet: '🚽',
  bed: '🛏️',
  chair: '🪑',
  door: '🚪',
  window: '🪟',
  broom: '🧹',
  basket: '🧺',
  umbrella: '☂️',
  spoon: '🥄',
  fork: '🍴',
  plate: '🍽️',
  trash: '🗑️',
  box: '📦',
  mail: '📬',
  letter: '✉️',
  map: '🗺️',
  compass: '🧭',
  microscope: '🔬',
  bandage: '🩹',
  bell: '🔔',
  money: '💵',
  coin: '🪙',
  ring: '💍',
  gem: '💎',
};

// Clothes
const CLOTHES_EMOJI = {
  hat: '🎩',
  cap: '🧢',
  shirt: '👕',
  pants: '👖',
  dress: '👗',
  shoe: '👟',
  shoes: '👟',
  boot: '🥾',
  sock: '🧦',
  socks: '🧦',
  mitten: '🧤',
  gloves: '🧤',
  scarf: '🧣',
  coat: '🧥',
  jacket: '🧥',
  backpack: '🎒',
  bag: '👜',
  glasses: '👓',
};

// Symbols and colours
const SYMBOL_EMOJI = {
  heart: '❤️',
  hearts: '💕',
  check: '✅',
  yes: '✅',
  no: '❌',
  question: '❓',
  plus: '➕',
  minus: '➖',
  sparkles: '✨',
  hundred: '💯',
  peace: '✌️',
  arrow: '➡️',
  warning: '⚠️',
  recycle: '♻️',
  red: '🔴',
  blue: '🔵',
  green: '🟢',
  yellow: '🟡',
  purple: '🟣',
  black: '⚫',
  white: '⚪',
  brown: '🟤',
  pink: '🩷',
};

// The categories, in one place. Grouping is not just documentation: the motion
// table in `src/features/effects/utils/wordMotion.js` reads it to decide how a
// word moves, so an animal added below runs across the screen without anyone
// assigning it an animation.
export const WORD_CATEGORIES = Object.freeze({
  feeling: FEELING_EMOJI,
  people: PEOPLE_EMOJI,
  magic: MAGIC_EMOJI,
  body: BODY_EMOJI,
  animal: ANIMAL_EMOJI,
  bug: BUG_EMOJI,
  sea: SEA_EMOJI,
  produce: PRODUCE_EMOJI,
  food: FOOD_EMOJI,
  nature: NATURE_EMOJI,
  space: SPACE_EMOJI,
  vehicle: VEHICLE_EMOJI,
  place: PLACE_EMOJI,
  play: PLAY_EMOJI,
  thing: THING_EMOJI,
  clothes: CLOTHES_EMOJI,
  symbol: SYMBOL_EMOJI,
});

// Related glyphs a word can also be drawn as. Authoring rules a future editor
// cannot infer from the data alone:
// (a) Every member must itself be a correct picture of the word (🏈 is a ball;
//     🎳 and ⛳ are not). Generic words get families; specific words (soccer,
//     basketball, poodle, rose) stay single.
// (b) A family belongs to the word, not to its number — star and stars share
//     one family.
// (c) When a family mixes orientations on a travelling path (run/arc), take
//     the side-on member's orientation.
export const WORD_FAMILY = Object.freeze({
  // Play
  ball: ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐'],
  book: ['📚', '📖', '📕', '📗', '📘'],
  toy: ['🧸', '🪀', '🧩'],
  game: ['🎮', '🕹️'],
  cards: ['🃏', '🎴'],
  medal: ['🏅', '🎖️'],
  music: ['🎵', '🎶'],
  note: ['🎵', '🎶'],
  song: ['🎵', '🎶'],

  // Symbol
  heart: ['❤️', '💕', '💖', '💗', '💞', '🧡', '💛', '💚', '💙', '💜'],
  hearts: ['❤️', '💕', '💖', '💗', '💞', '🧡', '💛', '💚', '💙', '💜'],
  check: ['✅', '☑️', '✔️'],
  yes: ['✅', '☑️', '✔️'],
  sparkles: ['✨', '💫'],

  // Nature
  tree: ['🌳', '🌲', '🌴'],
  leaf: ['🍃', '🍂', '🍁'],
  earth: ['🌍', '🌎', '🌏'],
  world: ['🌍', '🌎', '🌏'],
  mountain: ['⛰️', '🏔️', '🗻'],
  plant: ['🪴', '🌱', '🌿'],
  rain: ['🌧️', '💧'],
  star: ['⭐', '🌟', '✨'],
  stars: ['⭐', '🌟', '✨'],
  flower: ['🌸', '🌼', '🌷', '🌺'],
  flowers: ['🌸', '🌼', '🌷', '🌺'],

  // Food and produce
  cake: ['🎂', '🍰'],
  candy: ['🍬', '🍭', '🍫'],
  bread: ['🍞', '🥖'],
  toast: ['🍞', '🥖'],
  meat: ['🍖', '🍗'],
  pepper: ['🌶️', '🫑'],
  apple: ['🍎', '🍏'],
  icecream: ['🍦', '🍨'],
  'ice cream': ['🍦', '🍨'],

  // Animals
  dog: ['🐶', '🐕', '🐩'],
  puppy: ['🐶', '🐕', '🐩'],
  cat: ['🐱', '🐈'],
  kitty: ['🐱', '🐈'],
  bear: ['🐻', '🐻‍❄️'],
  bird: ['🐦', '🕊️'],
  fish: ['🐠', '🐟', '🐡'],
  dino: ['🦕', '🦖'],
  dinosaur: ['🦕', '🦖'],
  dragon: ['🐉', '🐲'],

  // Vehicles
  car: ['🚗', '🚙'],
  cars: ['🚗', '🚙'],
  truck: ['🚚', '🚛'],
  plane: ['✈️', '🛩️'],
  airplane: ['✈️', '🛩️'],
  train: ['🚂', '🚃'],
  choo: ['🚂', '🚃'],

  // Clothes
  hat: ['🎩', '🧢', '👒'],
  shoe: ['👟', '👞', '🥾'],
  shoes: ['👟', '👞', '🥾'],
  shirt: ['👕', '👚'],

  // Places and things
  house: ['🏠', '🏡'],
  home: ['🏠', '🏡'],
  castle: ['🏰', '🏯'],
  key: ['🔑', '🗝️'],
  money: ['💵', '💸', '💰'],

  // Body
  hand: ['🖐️', '✋', '🤚'],

  // Party
  party: ['🎉', '🎊'],
  yay: ['🎉', '🎊'],
  hooray: ['🎉', '🎊'],
  congrats: ['🎉', '🎊'],
  fun: ['🎉', '🎊'],
});

/** The related glyphs a word can also be drawn as, or null. */
export function familyForWord(word) {
  if (typeof word !== 'string') return null;
  return WORD_FAMILY[word.trim().toLowerCase()] ?? null;
}

// Friendly labels for the categories, used by the word guide.
export const CATEGORY_LABELS = Object.freeze({
  feeling: 'Feelings',
  people: 'People',
  magic: 'Make-believe',
  body: 'Body',
  animal: 'Animals',
  bug: 'Bugs',
  sea: 'In the sea',
  produce: 'Fruit and veg',
  food: 'Food and treats',
  nature: 'Weather and nature',
  space: 'Space',
  vehicle: 'Things that go',
  place: 'Places',
  play: 'Play and music',
  thing: 'Around the house',
  clothes: 'Clothes',
  symbol: 'Signs and colours',
});

export const WORD_EMOJI = Object.freeze(
  Object.assign({}, ...Object.values(WORD_CATEGORIES)),
);

// Which category a word belongs to, or null when it isn't in the library.
const WORD_CATEGORY = Object.freeze(
  Object.fromEntries(
    Object.entries(WORD_CATEGORIES).flatMap(([category, words]) =>
      Object.keys(words).map(word => [word, category]),
    ),
  ),
);

/** The category a word belongs to ('animal', 'food', …), or null. */
export function categoryForWord(word) {
  if (typeof word !== 'string') return null;
  return WORD_CATEGORY[word.trim().toLowerCase()] ?? null;
}

// Every word in the library, and the two-word phrases on their own — phrases
// are checked first so "traffic light" wins over the "light" inside it.
export const EMOJI_WORDS = Object.freeze(Object.keys(WORD_EMOJI));
const PHRASES = Object.freeze(EMOJI_WORDS.filter(word => word.includes(' ')));

/**
 * The emoji for a word, or null when the word has none.
 */
export function emojiForWord(word) {
  if (typeof word !== 'string') return null;
  return WORD_EMOJI[word.trim().toLowerCase()] ?? null;
}

/**
 * The first word in a line that has an emoji, as `{ word, emoji }`, or null
 * when the line has none. Two-word entries win over the single words inside
 * them, and a plural falls back to its singular ("cookies" is still a 🍪) so a
 * stray S doesn't cost a child their picture.
 */
export function findWordEmoji(text) {
  if (typeof text !== 'string') return null;

  const words = text.toLowerCase().split(/[^a-z]+/).filter(Boolean);

  // Phrases first, in the order they appear in the line.
  for (let i = 0; i < words.length - 1; i++) {
    const pair = `${words[i]} ${words[i + 1]}`;
    if (PHRASES.includes(pair)) return { word: pair, emoji: WORD_EMOJI[pair] };
  }

  for (const word of words) {
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
