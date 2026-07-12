// A kid-friendly word list used to offer gentle spelling help: as the child
// types the start of a word, we suggest a full word that starts with those
// letters. This both helps when they forget how to finish a word and teaches
// new words when they type a few random letters.
//
// Ordered roughly by familiarity so common favourites win ties. Includes all
// the "magic words" so ghost text and the emoji preview agree.
export const SUGGESTION_WORDS = [
  // family + everyday favourites
  'mom', 'dad', 'mommy', 'daddy', 'baby', 'love', 'hug', 'kiss',
  'hello', 'happy', 'smile', 'yes', 'play', 'fun',
  // short sight words
  'the', 'and', 'you', 'big', 'red', 'run', 'jump', 'go',
  // animals
  'cat', 'dog', 'puppy', 'kitty', 'fish', 'frog', 'bird', 'bee', 'duck',
  'bear', 'lion', 'tiger', 'zebra', 'panda', 'horse', 'sheep', 'mouse',
  'snake', 'shark', 'whale', 'monkey', 'rabbit', 'turtle', 'spider',
  'dino', 'dinosaur', 'dragon', 'unicorn', 'butterfly', 'elephant', 'giraffe',
  // food
  'apple', 'banana', 'orange', 'cookie', 'candy', 'cake', 'milk', 'water',
  'pizza', 'icecream',
  // things + nature
  'ball', 'book', 'tree', 'star', 'moon', 'sun', 'house', 'car', 'truck',
  'train', 'plane', 'boat', 'rocket', 'robot', 'heart', 'flower', 'rainbow',
  'snow', 'rain', 'music', 'party', 'money', 'cars', 'stars', 'hearts',
  'lions', 'rockets', 'unicorns', 'butterflies', 'flowers', 'ghosts',
  // colors
  'blue', 'green', 'yellow', 'purple', 'pink', 'black', 'white', 'brown',
];

// Suggest a full word that completes the last word the child is typing.
// Returns the canonical (lowercase) word, or null when nothing fits.
export function suggestCompletion(text) {
  if (typeof text !== 'string') return null;

  // The "current word" is the run of letters after the last space. If the text
  // ends with a space there is no word in progress.
  const word = text.split(/\s+/).pop().toLowerCase();
  if (word.length < 2 || !/^[a-z]+$/.test(word)) return null;

  let best = null;
  for (const candidate of SUGGESTION_WORDS) {
    if (candidate.length > word.length && candidate.startsWith(word)) {
      // Prefer the shortest match so we complete to the nearest word.
      if (!best || candidate.length < best.length) best = candidate;
    }
  }
  return best;
}
