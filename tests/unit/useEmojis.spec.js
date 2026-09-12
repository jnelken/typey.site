import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { useEmojis } from '@/features/effects/composables/useEmojis';

describe('useEmojis', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('gives a burst of several emojis a range of different sizes', () => {
    const { effects, spawnEmojis } = useEmojis();
    spawnEmojis('float', 20, { emoji: '🐱', minSize: 24, maxSize: 38 });

    const sizes = new Set(effects.value.map(e => e.size));
    expect(sizes.size).toBeGreaterThan(10);
  });

  it('adds exactly one finale glyph at the end of a full burst', () => {
    const { effects, spawnEmojis } = useEmojis();
    spawnEmojis('float', 20, { emoji: '🐱', minSize: 24, maxSize: 38 });

    const regular = effects.value.slice(0, -1);
    const finale = effects.value[effects.value.length - 1];

    expect(effects.value).toHaveLength(21);
    expect(finale.emoji).toBe('🐱');
    expect(finale.size).toBeGreaterThan(Math.max(...regular.map(e => e.size)));
    expect(finale.delay).toBeGreaterThan(Math.max(...regular.map(e => e.delay)));
  });

  it('gives the finale the same flair as the burst, so a `grow` finale grows just as much', () => {
    const { effects, spawnEmojis } = useEmojis();
    spawnEmojis('burst', 18, { emoji: '💯', flair: 'grow', minSize: 24, maxSize: 40 });

    const regular = effects.value.slice(0, -1);
    const finale = effects.value[effects.value.length - 1];

    expect(regular.every(e => e.flair === 'grow')).toBe(true);
    expect(finale.flair).toBe('grow');
    expect(finale.size).toBeGreaterThan(Math.max(...regular.map(e => e.size)));
  });

  it('uses the word\'s own emoji for the finale, not a random family member', () => {
    const { effects, spawnEmojis } = useEmojis();
    spawnEmojis('float', 10, { emoji: '🐱', emojiSet: ['🐱', '🐈', '🐈‍⬛'] });

    const finale = effects.value[effects.value.length - 1];
    expect(finale.emoji).toBe('🐱');
  });

  it('skips the finale for a burst too small to have a crowd', () => {
    const { effects, spawnEmojis } = useEmojis();
    spawnEmojis('float', 1, { emoji: '🐱' });

    expect(effects.value).toHaveLength(1);
  });

  it('skips the finale when explicitly disabled, e.g. a preview tap', () => {
    const { effects, spawnEmojis } = useEmojis();
    spawnEmojis('float', 5, { emoji: '🐱', finale: false });

    expect(effects.value).toHaveLength(5);
  });
});
