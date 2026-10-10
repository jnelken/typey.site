import { describe, it, expect } from '@jest/globals';
import { ITEMS, PALETTE, RECIPES, renderRecipe } from '../../server/minecraftRecipes';
import { GLYPHS, HEIGHT, MAX_TEXT_CHARACTERS, WIDTH, fitText, getPixel } from '../../server/pixelCanvas';

describe('Minecraft recipes', () => {
  it('uses only items that have a 7x7 sprite drawn from the palette', () => {
    const itemIds = RECIPES.flatMap(({ result, grid }) => [result, ...grid.flat().filter(Boolean)]);

    for (const itemId of itemIds) {
      const sprite = ITEMS[itemId]?.sprite;
      expect(sprite).toHaveLength(7);
      for (const row of sprite) {
        expect(row).toHaveLength(7);
        for (const key of row) {
          if (key !== '.') expect(PALETTE).toHaveProperty(key);
        }
      }
    }
  });

  it('lays every recipe out on a 3x3 crafting grid', () => {
    for (const { grid, count } of RECIPES) {
      expect(grid).toHaveLength(3);
      grid.forEach(row => expect(row).toHaveLength(3));
      expect(count).toBeGreaterThanOrEqual(1);
    }
  });

  it('fits every caption on the display using known glyphs', () => {
    for (const { result } of RECIPES) {
      const name = ITEMS[result].name.toUpperCase();
      expect(name.length).toBeLessThanOrEqual(MAX_TEXT_CHARACTERS);
      expect(fitText(name)).toBe(name);
      for (const character of name) expect(GLYPHS).toHaveProperty(character);
    }
  });

  it('draws filled and empty grid slots where the recipe puts them', () => {
    const torch = RECIPES.find(({ result }) => result === 'torch');
    const canvas = renderRecipe(torch);

    expect(canvas.pixels).toHaveLength(WIDTH * HEIGHT * 4);
    // Top-left slot is empty; the stick's bottom-left pixel sits in the center slot.
    expect(getPixel(canvas, 8, 8)).toBe('#262626');
    expect(getPixel(canvas, 16, 22)).toBe(PALETTE.t);
  });
});
