import { describe, it, expect, beforeEach } from '@jest/globals';
import { useNight, NIGHT_CLASS } from '@/features/night/composables/useNight';
import { STAR_COUNT } from '@/features/night/utils/nightMode';

describe('useNight', () => {
  beforeEach(() => {
    document.documentElement.classList.remove(NIGHT_CLASS);
  });

  const pinned = () => {
    let seed = 0;
    return useNight({ nextSeed: () => (seed += 1) });
  };

  it('is off, starless and unmarked until it is started', () => {
    const night = pinned();

    expect(night.isActive.value).toBe(false);
    expect(night.stars.value).toEqual([]);
    expect(document.documentElement.classList.contains(NIGHT_CLASS)).toBe(false);
  });

  it('raises a full sky and marks the document root', () => {
    const night = pinned();
    night.start();

    expect(night.isActive.value).toBe(true);
    expect(night.stars.value).toHaveLength(STAR_COUNT);
    expect(document.documentElement.classList.contains(NIGHT_CLASS)).toBe(true);
  });

  it('takes the sky and the class down again on stop', () => {
    const night = pinned();
    night.start();
    night.stop();

    expect(night.isActive.value).toBe(false);
    expect(night.stars.value).toEqual([]);
    expect(document.documentElement.classList.contains(NIGHT_CLASS)).toBe(false);
  });

  it('holds the sky still while the night lasts', () => {
    // The stars are generated once and kept, so they don't jump every time
    // something else in the app re-renders.
    const night = pinned();
    night.start();
    const sky = night.stars.value;
    night.start();

    expect(night.stars.value).toBe(sky);
  });

  it('gives a different sky each time the night is started again', () => {
    const night = pinned();
    night.start();
    const first = night.stars.value;
    night.stop();
    night.start();

    expect(night.stars.value).not.toEqual(first);
  });

  it('toggles both ways', () => {
    const night = pinned();
    night.toggle();
    expect(night.isActive.value).toBe(true);
    night.toggle();
    expect(night.isActive.value).toBe(false);
  });

  it('leaves the class alone when stopped while already off', () => {
    // Escape clears every effect at once, so `stop` is called on nights that
    // never started. It must not strip a class it did not put there.
    document.documentElement.classList.add(NIGHT_CLASS);
    const night = pinned();
    night.stop();

    expect(document.documentElement.classList.contains(NIGHT_CLASS)).toBe(true);
  });
});
