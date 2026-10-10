import {
  createCanvas,
  drawCenteredText,
  drawSprite,
  drawText,
  fillRect,
} from './pixelCanvas.js';

// Hand-drawn 7x7 icons. Downscaled 16px textures turn to mud at this size,
// so each item keeps only the shapes that make it recognizable.
export const PALETTE = {
  p: '#c29d62', // plank light
  q: '#8a6a3a', // plank seam
  l: '#6b4f2a', // log bark
  m: '#3f2d17', // log bark groove
  s: '#a0763c', // stick light
  t: '#5c4020', // stick dark
  k: '#0a0a0a', // coal
  c: '#9a9a9a', // coal fleck
  g: '#8f8f8f', // stone light
  h: '#5e5e5e', // stone dark
  n: '#bdbdbd', // stone highlight
  y: '#ffe14d', // flame
  o: '#ff8a1f', // ember
  d: '#4a2e12', // chest frame
  b: '#a8692b', // chest body
  w: '#d8d8d8', // latch
  f: '#000000', // furnace mouth
};

export const ITEMS = {
  oak_log: {
    name: 'Oak Log',
    sprite: ['lmllmll', 'lmllmll', 'llmllml', 'llmllml', 'lmllmll', 'lmllmll', 'llmllml'],
  },
  oak_planks: {
    name: 'Planks',
    sprite: ['ppppppp', 'pppqppp', 'qqqqqqq', 'ppppppp', 'pqppppp', 'qqqqqqq', 'ppppppp'],
  },
  stick: {
    name: 'Stick',
    sprite: ['.....st', '....st.', '...st..', '..st...', '.st....', 'st.....', 't......'],
  },
  coal: {
    name: 'Coal',
    sprite: ['.......', '..kck..', '.kkkkc.', '.ckkkk.', '.kkckk.', '..kkc..', '.......'],
  },
  cobblestone: {
    name: 'Cobblestone',
    sprite: ['gghgngh', 'ngghggh', 'hhgnghg', 'ggnhhgn', 'ghhggng', 'gnggnhg', 'hggghgg'],
  },
  crafting_table: {
    name: 'Crafting Table',
    sprite: ['qqqqqqq', 'qpqpqpq', 'qqqqqqq', 'pdppphp', 'pdpphhp', 'pdppphp', 'ppppppp'],
  },
  torch: {
    name: 'Torch',
    sprite: ['...y...', '..yoy..', '...o...', '...s...', '...s...', '...t...', '...t...'],
  },
  chest: {
    name: 'Chest',
    sprite: ['ddddddd', 'dbbbbbd', 'dbbbbbd', 'dddwddd', 'dbbwbbd', 'dbbbbbd', 'ddddddd'],
  },
  furnace: {
    name: 'Furnace',
    sprite: ['hhhhhhh', 'hgggggh', 'hhhhhhh', 'hgggggh', 'hgfffgh', 'hgfoygh', 'hhhhhhh'],
  },
  wooden_pickaxe: {
    name: 'Wooden Pickaxe',
    sprite: ['.pppp..', 'p..qqp.', '...sqp.', '..s..p.', '.s...p.', 's......', '.......'],
  },
  stone_pickaxe: {
    name: 'Stone Pickaxe',
    sprite: ['.gggg..', 'g..hhg.', '...shg.', '..s..g.', '.s...g.', 's......', '.......'],
  },
  wooden_axe: {
    name: 'Wooden Axe',
    sprite: ['...pp..', '..pqpp.', '..pqsp.', '...sp..', '..s....', '.s.....', 's......'],
  },
  wooden_shovel: {
    name: 'Wooden Shovel',
    sprite: ['....pp.', '...pqpp', '....qp.', '...s...', '..s....', '.s.....', 's......'],
  },
  wooden_sword: {
    name: 'Wooden Sword',
    sprite: ['.....pp', '....pqp', '...pqp.', 't.pqp..', '.tqp...', '.st....', 's..t...'],
  },
  ladder: {
    name: 'Ladder',
    sprite: ['s.....s', 'sssssss', 's.....s', 's.....s', 'sssssss', 's.....s', 's.....s'],
  },
};

// Grids match the Minecraft Wiki's crafting-table layouts; null is an empty slot.
const _ = null;
const P = 'oak_planks';
const S = 'stick';
const C = 'cobblestone';

export const RECIPES = [
  { result: 'oak_planks', count: 4, grid: [[_, _, _], [_, 'oak_log', _], [_, _, _]] },
  { result: 'stick', count: 4, grid: [[_, P, _], [_, P, _], [_, _, _]] },
  { result: 'crafting_table', count: 1, grid: [[P, P, _], [P, P, _], [_, _, _]] },
  { result: 'torch', count: 4, grid: [[_, 'coal', _], [_, S, _], [_, _, _]] },
  { result: 'chest', count: 1, grid: [[P, P, P], [P, _, P], [P, P, P]] },
  { result: 'furnace', count: 1, grid: [[C, C, C], [C, _, C], [C, C, C]] },
  { result: 'wooden_pickaxe', count: 1, grid: [[P, P, P], [_, S, _], [_, S, _]] },
  { result: 'stone_pickaxe', count: 1, grid: [[C, C, C], [_, S, _], [_, S, _]] },
  { result: 'wooden_axe', count: 1, grid: [[P, P, _], [P, S, _], [_, S, _]] },
  { result: 'wooden_shovel', count: 1, grid: [[_, P, _], [_, S, _], [_, S, _]] },
  { result: 'wooden_sword', count: 1, grid: [[_, P, _], [_, P, _], [_, S, _]] },
  { result: 'ladder', count: 3, grid: [[S, _, S], [S, S, S], [S, _, S]] },
];

const COLORS = {
  background: '#000000',
  border: '#6e6e6e',
  slot: '#262626',
  caption: '#ffffff',
  arrow: '#bdbdbd',
  count: '#ffffff',
};

const CELL = 7;
const GRID_SIZE = CELL * 3 + 4;
const ARROW = ['..#..', '...#.', '#####', '...#.', '..#..'];
const LAYOUT = {
  captionY: 0,
  gridX: 7,
  gridY: 7,
  arrowX: 7 + GRID_SIZE + 3,
  resultX: 7 + GRID_SIZE + 3 + ARROW[0].length + 3,
};

function drawSlotFrame(canvas, x, y, size) {
  fillRect(canvas, x, y, size, size, COLORS.border);
  fillRect(canvas, x + 1, y + 1, size - 2, size - 2, COLORS.slot);
}

function drawGrid(canvas, grid) {
  const { gridX, gridY } = LAYOUT;
  fillRect(canvas, gridX, gridY, GRID_SIZE, GRID_SIZE, COLORS.border);

  grid.forEach((row, rowIndex) => {
    row.forEach((itemId, columnIndex) => {
      const x = gridX + 1 + columnIndex * (CELL + 1);
      const y = gridY + 1 + rowIndex * (CELL + 1);
      fillRect(canvas, x, y, CELL, CELL, COLORS.slot);
      if (itemId) drawSprite(canvas, ITEMS[itemId].sprite, PALETTE, x, y);
    });
  });
}

function drawResult(canvas, { result, count }) {
  const size = CELL + 2;
  const x = LAYOUT.resultX;
  const y = LAYOUT.gridY + Math.floor((GRID_SIZE - size) / 2);
  drawSlotFrame(canvas, x, y, size);
  drawSprite(canvas, ITEMS[result].sprite, PALETTE, x + 1, y + 1);
  if (count > 1) drawText(canvas, String(count), x + size + 1, y + size - 5, COLORS.count);
}

export function renderRecipe(recipe) {
  const canvas = createCanvas(COLORS.background);
  drawCenteredText(canvas, ITEMS[recipe.result].name, LAYOUT.captionY, COLORS.caption);
  drawGrid(canvas, recipe.grid);

  const arrowY = LAYOUT.gridY + Math.floor((GRID_SIZE - ARROW.length) / 2);
  drawSprite(canvas, ARROW, { '#': COLORS.arrow }, LAYOUT.arrowX, arrowY);
  drawResult(canvas, recipe);
  return canvas;
}
