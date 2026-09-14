import { categoryForWord } from '@/features/typing/utils/wordEmoji';

// How a word moves, decided by what the word *is*.
//
// The old rule hashed the word and picked from float/rain/burst, which is why a
// cookie drifted up off the top of the screen like a balloon. Motion now comes
// from the dictionary's own categories: animals run, food is thrown and falls,
// weather rains, space floats. The hash survives only as a tie-breaker *within*
// what a category allows, so a word still always moves the same way while the
// library as a whole stays varied.

// The paths an effect can take across the screen. `bloom` is the odd one out:
// it goes nowhere. Some words name things that don't travel — a flower doesn't
// fly across the screen, it opens — so the path layer swells them in place and
// leaves the turning to a flair.
export const PATHS = Object.freeze([
  'float', 'rain', 'burst', 'run', 'arc', 'lob', 'bounce', 'bloom',
]);

// Flourishes layered on top of a path. These are modifiers, not paths: any
// flair composes with any path.
export const FLAIRS = Object.freeze([
  'none', 'spin', 'bobble', 'grow', 'pulse', 'throb',
]);

// Paths that travel sideways, and so care which way the glyph is facing.
export const TRAVELLING_PATHS = Object.freeze(['run', 'arc']);

// Paths that stay where they were put, and so need a vertical position of their
// own. Every other path is anchored to an edge in CSS and animates away from it,
// so handing one a `top` would fight the keyframes; these two never move off
// their spawn point, and without a `top` the whole burst stacks in one band.
export const PLACED_PATHS = Object.freeze(['burst', 'bloom']);

// Per-path feel. Bursts are short and punchy; rain and float drift longer. The
// paths that obey gravity run fewer and larger, so each throw reads as one
// object rather than a swarm.
export const PATH_OPTIONS = Object.freeze({
  float: { count: 20, minDuration: 4000, maxDuration: 8000, stagger: 1600, minSize: 24, maxSize: 38 },
  rain: { count: 26, minDuration: 3500, maxDuration: 7000, stagger: 1400, minSize: 22, maxSize: 36 },
  burst: { count: 18, minDuration: 2000, maxDuration: 4000, stagger: 800, minSize: 24, maxSize: 40 },
  run: { count: 6, minDuration: 4000, maxDuration: 7500, stagger: 1500, minSize: 30, maxSize: 50, scaleMin: 1.1, scaleMax: 1.9 },
  arc: { count: 8, minDuration: 2600, maxDuration: 4200, stagger: 1400, minSize: 34, maxSize: 52, scaleMin: 1.1, scaleMax: 1.9 },
  lob: { count: 8, minDuration: 2400, maxDuration: 3800, stagger: 1500, minSize: 34, maxSize: 52, scaleMin: 1.1, scaleMax: 1.9 },
  bounce: { count: 10, minDuration: 3000, maxDuration: 4600, stagger: 1600, minSize: 32, maxSize: 50, scaleMin: 1.1, scaleMax: 1.9 },
  // Blooms run fewer and smaller than the drifting paths. A travelling glyph
  // only shares the screen with its crowd for a moment; a stationary one sits
  // in its patch for the whole effect, and its own keyframes swell it further,
  // so the same twenty would pile on top of each other rather than read as a
  // patch of flowers.
  bloom: { count: 12, minDuration: 3200, maxDuration: 5200, stagger: 1500, minSize: 22, maxSize: 34, scaleMin: 1.0, scaleMax: 1.6 },
});

// When a thrown thing is at its most hittable, as a fraction of its own
// duration. Read straight off the keyframes in EmojiEffect.vue: lob peaks at
// 55%, arc at 50%, and bounce makes first ground contact at 40% — its later
// hops are smaller and read as settling, not impact.
export const IMPACT_AT = Object.freeze({ lob: 0.55, arc: 0.50, bounce: 0.40 });

// How long the droplet burst lasts. Lives here so the component that plays it
// and the composable that decides when to unmount it read one number.
export const SPLAT_DURATION = 900;

// What each category of the dictionary does. `facing` is the direction the
// glyphs in that category are drawn pointing; it only matters for the
// travelling paths.
const CATEGORY_MOTION = Object.freeze({
  feeling: { paths: ['burst', 'float'], flairs: ['pulse', 'bobble'] },
  people: { paths: ['run'], flairs: ['bobble', 'none'], facing: 'any' },
  magic: { paths: ['float', 'run'], flairs: ['bobble', 'pulse'], facing: 'any' },
  body: { paths: ['burst', 'float'], flairs: ['pulse', 'none'], facing: 'any' },
  animal: { paths: ['run'], flairs: ['bobble', 'none'], facing: 'left' },
  bug: { paths: ['float', 'run'], flairs: ['bobble'], facing: 'left' },
  sea: { paths: ['run', 'float'], flairs: ['bobble'], facing: 'left' },
  produce: { paths: ['lob', 'bounce', 'arc'], flairs: ['none', 'spin'], facing: 'any' },
  food: { paths: ['lob', 'bounce', 'arc'], flairs: ['none', 'spin'], facing: 'any' },
  nature: { paths: ['float', 'rain'], flairs: ['none', 'bobble'] },
  space: { paths: ['float'], flairs: ['none', 'spin'] },
  vehicle: { paths: ['run'], flairs: ['none', 'bobble'], facing: 'left' },
  place: { paths: ['burst', 'float'], flairs: ['pulse', 'none'], facing: 'any' },
  play: { paths: ['burst', 'arc'], flairs: ['spin', 'none'], facing: 'any' },
  thing: { paths: ['burst', 'rain'], flairs: ['none', 'pulse'], facing: 'any' },
  clothes: { paths: ['float', 'rain'], flairs: ['none', 'bobble'], facing: 'any' },
  symbol: { paths: ['burst', 'float'], flairs: ['pulse', 'grow', 'none'], facing: 'any' },
});

const DEFAULT_MOTION = { paths: ['float', 'burst'], flairs: ['none'], facing: 'any' };

// Front-facing glyphs. A 🐱 is drawn head-on, so flipping it to "face" the way
// it's travelling changes nothing except which whisker is on the left. Listed
// so the flip is spent only where it reads.
const FRONT_FACING = [
  'mouse', 'hamster', 'rabbit', 'bunny', 'fox',
  'bear', 'panda', 'koala', 'tiger', 'lion', 'lions', 'cow', 'pig', 'frog',
  'monkey', 'gorilla', 'wolf', 'horse', 'pony', 'chick', 'penguin', 'raccoon',
  'sloth', 'bug', 'caterpillar', 'ladybug', 'spider', 'scorpion', 'web',
  'octopus', 'crab', 'squid', 'lobster', 'robot', 'alien', 'monster', 'ghost',
  'ghosts', 'subway', 'tram', 'skateboard', 'sailboat',
];

// Words that don't take their category's motion. Each one is a fact about the
// object, not a preference: a balloon is the one thing in the toy box that
// floats, a ball is the one that bounces, a heart beats.
const WORD_MOTION = Object.freeze({
  // Play: balls obey gravity, balloons and kites do not.
  ...fill(['ball', 'soccer', 'basketball', 'football', 'baseball', 'tennis',
    'volleyball', 'bowling', 'golf', 'hockey'], { paths: ['bounce', 'arc'], flairs: ['spin'] }),
  ...fill(['balloon', 'kite'], { paths: ['float'], flairs: ['bobble'] }),
  ...fill(['party', 'yay', 'hooray', 'congrats', 'fun'],
    { paths: ['burst'], flairs: ['spin', 'none'], count: 40 }),
  ...fill(['gift', 'present'], { paths: ['rain'], flairs: ['spin'] }),
  ...fill(['music', 'note', 'song'], { paths: ['float'], flairs: ['bobble'], count: 20 }),
  // Athletes are drawn side-on, facing left, so they turn around like an animal.
  ...fill(['dance', 'dancer', 'run', 'runner', 'swim', 'swimmer', 'surf', 'skate', 'ski'],
    { paths: ['run'], flairs: ['bobble'], facing: 'left' }),
  ...fill(['jump'], { paths: ['run'], flairs: ['bobble'], facing: 'any' }),

  // Symbols that want to be felt rather than read.
  ...fill(['heart'], { paths: ['float'], flairs: ['throb'], count: 20 }),
  ...fill(['hearts'], { paths: ['float'], flairs: ['throb'], count: 20 }),
  ...fill(['sparkles'], { paths: ['float'], flairs: ['spin'], count: 24 }),
  ...fill(['hundred', 'check', 'yes'], { paths: ['burst'], flairs: ['grow'] }),

  // Weather and sky. Snow spins as it falls; the sun and the moon just hang.
  ...fill(['snow', 'snowflake'], { paths: ['rain'], flairs: ['spin'], count: 40 }),
  ...fill(['rain'], { paths: ['rain'], flairs: ['none'], count: 40 }),
  ...fill(['star'], { paths: ['float'], flairs: ['spin'], count: 24 }),
  ...fill(['stars'], { paths: ['float'], flairs: ['spin'], count: 24 }),
  ...fill(['sun', 'sunny', 'moon', 'rainbow', 'fire', 'lightning'],
    { paths: ['float'], flairs: ['pulse'], count: 8 }),
  // A flower is rooted. It opens where it stands and turns to the light, so it
  // takes no path at all — `bloom` swells it and `spin` turns it. Singular and
  // plural share the entry: which way a thing moves is a fact about the thing,
  // not about how many of them were typed. The named flowers come along because
  // they are the same thing said more precisely — and because `flower`'s own
  // family already spawns 🌷, so a tulip that drifts away when typed by name
  // would contradict the tulip blooming beside it.
  ...fill(['flower', 'flowers', 'rose', 'sunflower', 'tulip'],
    { paths: ['bloom'], flairs: ['spin'] }),
  ...fill(['tornado'], { paths: ['run'], flairs: ['spin'], facing: 'any' }),
  ...fill(['wind'], { paths: ['run'], flairs: ['none'], facing: 'right' }),

  // Scenery sits in the world rather than falling through it.
  ...fill(['tree', 'palm', 'cactus', 'mountain', 'volcano', 'desert', 'island',
    'beach', 'park', 'city', 'bridge', 'road'], { paths: ['burst'], flairs: ['grow', 'none'] }),
  ...fill(['earth', 'world', 'planet'], { paths: ['float'], flairs: ['spin'], count: 8 }),
  ...fill(['ocean'], { paths: ['rain'], flairs: ['none'] }),

  // Heavy things, wherever their category filed them.
  ...fill(['rock', 'log', 'coin', 'gem', 'ring', 'medal', 'trophy', 'dice', 'hammer',
    'pumpkin'], { paths: ['bounce', 'lob'], flairs: ['spin', 'none'] }),
  ...fill(['money'], { paths: ['rain'], flairs: ['spin'], count: 40 }),

  // Food with a shape of its own.
  ...fill(['pizza'], { paths: ['rain'], flairs: ['spin'], count: 30 }),
  ...fill(['apple'], { paths: ['lob', 'bounce'], flairs: ['spin'] }),
  ...fill(['icecream', 'ice cream'], { paths: ['float'], flairs: ['bobble'], count: 16 }),
  ...fill(['water', 'milk', 'juice', 'tea', 'soda', 'honey'], { paths: ['rain'], flairs: ['none'] }),

  // Animals with motion overrides, and the ones that don't run.
  ...fill(['dino', 'dinosaur'], { paths: ['run'], flairs: ['bobble'], count: 6 }),
  ...fill(['dog', 'puppy'], { paths: ['run'], flairs: ['bobble'], count: 6 }),
  ...fill(['cat', 'kitty'], { paths: ['run'], flairs: ['bobble'], count: 6 }),
  ...fill(['fish'], { paths: ['run'], flairs: ['bobble'], count: 18 }),
  ...fill(['bee'], { paths: ['float'], flairs: ['bobble'], count: 16 }),
  ...fill(['butterfly', 'butterflies'], { paths: ['float'], flairs: ['bobble'], count: 10 }),
  ...fill(['bird', 'dove', 'eagle', 'owl', 'parrot', 'bat'], { paths: ['float'], flairs: ['bobble'] }),
  ...fill(['snail', 'worm', 'sloth', 'turtle'], { paths: ['run'], flairs: ['none'] }),
  ...fill(['dragon'], { paths: ['float'], flairs: ['bobble'], count: 6 }),
  ...fill(['unicorn', 'unicorns'], { paths: ['run'], flairs: ['bobble'], facing: 'left', count: 5 }),
  ...fill(['paw', 'feather', 'web', 'bone'], { paths: ['rain'], flairs: ['none'] }),

  // Vehicles. Emergency vehicles and buses are drawn head-on; the plane points
  // up and to the right, so it is the one thing that flips the other way.
  ...fill(['train'], { paths: ['run'], flairs: ['none'], count: 5 }),
  ...fill(['choo'], { paths: ['run'], flairs: ['none'], count: 5 }),
  ...fill(['plane', 'airplane'], { paths: ['run'], flairs: ['none'], facing: 'right' }),
  ...fill(['bus', 'school bus', 'ambulance', 'firetruck', 'fire truck', 'police car', 'taxi'],
    { paths: ['run'], flairs: ['none'], facing: 'any' }),
  ...fill(['rocket', 'rockets'], { paths: ['float'], flairs: ['none'], count: 5 }),
  ...fill(['ufo', 'satellite'], { paths: ['run'], flairs: ['none'], facing: 'any' }),
  // A comet trails its tail behind it, so it does have a front.
  ...fill(['comet'], { paths: ['run'], flairs: ['none'], facing: 'left' }),
  ...fill(['anchor'], { paths: ['rain'], flairs: ['none'] }),
});

/** Expand one motion spec across several words. */
function fill(words, motion) {
  return Object.fromEntries(words.map(word => [word, motion]));
}

/**
 * Pick one entry from a list, always the same one for a given word. Salted so
 * a word's path and its flair aren't drawn from the same position in their
 * lists — otherwise every two-option category pairs its first path with its
 * first flair and half the combinations never appear.
 */
function pick(list, word, salt) {
  if (!list || list.length === 0) return null;
  let hash = salt;
  for (const char of word) {
    hash = (hash * 31 + char.charCodeAt(0)) % 100003;
  }
  return list[hash % list.length];
}

/**
 * How a word moves: `{ path, flair, facing, count? }`.
 *
 * Deterministic — a child learns that the football bounces and the bee bobs,
 * and it stays true every time they type it.
 */
export function motionForWord(word) {
  const key = typeof word === 'string' ? word.trim().toLowerCase() : '';
  const category = categoryForWord(key);
  const base = CATEGORY_MOTION[category] || DEFAULT_MOTION;
  const override = WORD_MOTION[key];
  const motion = override ? { ...base, ...override } : base;

  const path = pick(motion.paths, key, 0) || 'float';
  const flair = pick(motion.flairs, key, 7) || 'none';

  // A front-facing glyph never flips, whatever its category says.
  const facing = FRONT_FACING.includes(key) ? 'any' : (motion.facing ?? 'left');

  const resolved = { path, flair, facing };
  if (motion.count) resolved.count = motion.count;
  return resolved;
}
