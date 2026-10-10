import { spawn } from 'node:child_process';

export const WIDTH = 64;
export const HEIGHT = 32;

// 3x5 bitmap glyphs. System fonts anti-alias into mush at 5px tall on a
// 64x32 LED panel, so captions are drawn pixel by pixel instead.
export const GLYPHS = {
  A: ['.#.', '#.#', '###', '#.#', '#.#'],
  B: ['##.', '#.#', '##.', '#.#', '##.'],
  C: ['.##', '#..', '#..', '#..', '.##'],
  D: ['##.', '#.#', '#.#', '#.#', '##.'],
  E: ['###', '#..', '##.', '#..', '###'],
  F: ['###', '#..', '##.', '#..', '#..'],
  G: ['.##', '#..', '#.#', '#.#', '.##'],
  H: ['#.#', '#.#', '###', '#.#', '#.#'],
  I: ['###', '.#.', '.#.', '.#.', '###'],
  J: ['..#', '..#', '..#', '#.#', '.#.'],
  K: ['#.#', '#.#', '##.', '#.#', '#.#'],
  L: ['#..', '#..', '#..', '#..', '###'],
  M: ['#.#', '###', '###', '#.#', '#.#'],
  N: ['##.', '#.#', '#.#', '#.#', '#.#'],
  O: ['.#.', '#.#', '#.#', '#.#', '.#.'],
  P: ['##.', '#.#', '##.', '#..', '#..'],
  Q: ['.#.', '#.#', '#.#', '##.', '.##'],
  R: ['##.', '#.#', '##.', '#.#', '#.#'],
  S: ['.##', '#..', '.#.', '..#', '##.'],
  T: ['###', '.#.', '.#.', '.#.', '.#.'],
  U: ['#.#', '#.#', '#.#', '#.#', '###'],
  V: ['#.#', '#.#', '#.#', '#.#', '.#.'],
  W: ['#.#', '#.#', '#.#', '###', '#.#'],
  X: ['#.#', '#.#', '.#.', '#.#', '#.#'],
  Y: ['#.#', '#.#', '.#.', '.#.', '.#.'],
  Z: ['###', '..#', '.#.', '#..', '###'],
  0: ['###', '#.#', '#.#', '#.#', '###'],
  1: ['.#.', '##.', '.#.', '.#.', '###'],
  2: ['##.', '..#', '.#.', '#..', '###'],
  3: ['##.', '..#', '.#.', '..#', '##.'],
  4: ['#.#', '#.#', '###', '..#', '..#'],
  5: ['###', '#..', '##.', '..#', '##.'],
  6: ['.##', '#..', '###', '#.#', '###'],
  7: ['###', '..#', '.#.', '.#.', '.#.'],
  8: ['###', '#.#', '###', '#.#', '###'],
  9: ['###', '#.#', '###', '..#', '##.'],
  ' ': ['...', '...', '...', '...', '...'],
};

export const GLYPH_ADVANCE = 4;
export const MAX_TEXT_CHARACTERS = Math.floor((WIDTH + 1) / GLYPH_ADVANCE);

export function hexToRgb(hex) {
  const value = Number.parseInt(hex.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

export function createCanvas(background = '#000000') {
  const pixels = Buffer.alloc(WIDTH * HEIGHT * 4);
  const canvas = { pixels };
  fillRect(canvas, 0, 0, WIDTH, HEIGHT, background);
  return canvas;
}

export function setPixel({ pixels }, x, y, color) {
  if (x < 0 || y < 0 || x >= WIDTH || y >= HEIGHT) return;
  const [red, green, blue] = hexToRgb(color);
  const offset = (y * WIDTH + x) * 4;
  pixels[offset] = red;
  pixels[offset + 1] = green;
  pixels[offset + 2] = blue;
  pixels[offset + 3] = 255;
}

export function getPixel({ pixels }, x, y) {
  const offset = (y * WIDTH + x) * 4;
  return `#${[0, 1, 2].map(index => pixels[offset + index].toString(16).padStart(2, '0')).join('')}`;
}

export function fillRect(canvas, x, y, width, height, color) {
  for (let row = y; row < y + height; row += 1) {
    for (let column = x; column < x + width; column += 1) {
      setPixel(canvas, column, row, color);
    }
  }
}

// Sprites are rows of palette keys; '.' leaves the pixel underneath alone.
export function drawSprite(canvas, sprite, palette, x, y) {
  sprite.forEach((row, rowIndex) => {
    [...row].forEach((key, columnIndex) => {
      if (key !== '.') setPixel(canvas, x + columnIndex, y + rowIndex, palette[key]);
    });
  });
}

export function fitText(text) {
  const upper = text.toUpperCase().replace(/[^A-Z0-9 ]/g, '').trim();
  return upper.slice(0, MAX_TEXT_CHARACTERS);
}

export function textWidth(text) {
  return text.length ? text.length * GLYPH_ADVANCE - 1 : 0;
}

export function drawText(canvas, text, x, y, color) {
  [...text].forEach((character, index) => {
    const glyph = GLYPHS[character] || GLYPHS[' '];
    const palette = { '#': color };
    drawSprite(canvas, glyph, palette, x + index * GLYPH_ADVANCE, y);
  });
}

export function drawCenteredText(canvas, text, y, color) {
  const fitted = fitText(text);
  drawText(canvas, fitted, Math.floor((WIDTH - textWidth(fitted)) / 2), y, color);
}

function runMagick(args, input) {
  return new Promise((resolve, reject) => {
    const child = spawn('magick', args);
    const output = [];
    const errors = [];

    child.stdout.on('data', chunk => output.push(chunk));
    child.stderr.on('data', chunk => errors.push(chunk));
    child.on('error', reject);
    child.on('close', code => {
      if (code === 0) {
        resolve(Buffer.concat(output));
      } else {
        reject(new Error(Buffer.concat(errors).toString().trim() || `ImageMagick exited ${code}`));
      }
    });

    child.stdin.end(input);
  });
}

const RAW_INPUT = ['-size', `${WIDTH}x${HEIGHT}`, '-depth', '8', 'rgba:-'];

// Lossless keeps single-pixel edges sharp; lossy WebP smears them on the LEDs.
export function encodeWebp({ pixels }) {
  return runMagick([...RAW_INPUT, '-define', 'webp:lossless=true', 'webp:-'], pixels);
}

export function encodePreviewPng({ pixels }, scale = 10) {
  return runMagick([...RAW_INPUT, '-filter', 'point', '-scale', `${scale * 100}%`, 'png:-'], pixels);
}
