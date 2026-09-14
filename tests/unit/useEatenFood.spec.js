import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { createTypingApp } from '@/composables/useTypingApp';
import { useEatenFood } from '@/features/eaten/composables/useEatenFood';

const pressEnter = app => app.onKeyDown({ key: 'Enter', preventDefault: jest.fn() });

const typeLetter = app =>
  app.onKeyDown({
    key: 'a',
    preventDefault: jest.fn(),
    target: { selectionStart: 0, setSelectionRange: jest.fn() },
  });

describe('useEatenFood', () => {
  it('holds a plate until it is cleared', () => {
    const { current, play, clear } = useEatenFood();

    expect(current.value).toBeNull();
    play({ percent: 50, word: 'cookie', emoji: '🍪', remaining: 0.5 });
    expect(current.value).toMatchObject({ word: 'cookie', remaining: 0.5 });
    clear();
    expect(current.value).toBeNull();
  });

  it('gives every bite a new id, so the same line replays', () => {
    const { current, play } = useEatenFood();

    play({ percent: 50, word: 'cookie', emoji: '🍪', remaining: 0.5 });
    const first = current.value.id;
    play({ percent: 50, word: 'cookie', emoji: '🍪', remaining: 0.5 });

    expect(current.value.id).not.toBe(first);
  });

  it('ignores a plate with no proportion on it', () => {
    const { current, play } = useEatenFood();

    play(null);
    play({ word: 'cookie' });
    expect(current.value).toBeNull();
  });
});

describe('eating a proportion from a typed line', () => {
  let typingApp;

  beforeEach(() => {
    jest.clearAllMocks();
    typingApp = createTypingApp();
  });

  it('eats half a cookie instead of spawning a swarm of them', async () => {
    typingApp.currentText.value = '50% cookie';

    await pressEnter(typingApp);

    expect(typingApp.eatenFood.value).toMatchObject({
      percent: 50,
      word: 'cookie',
      emoji: '🍪',
      remaining: 0.5,
    });
    // The half-eaten cookie is the whole answer to the line: before this, the
    // percent meant nothing and "50% cookie" flew a swarm of cookies past.
    expect(typingApp.emojiEffects.value).toHaveLength(0);
  });

  it('still runs lions, because a lion is not food', async () => {
    typingApp.currentText.value = '50% lion';

    await pressEnter(typingApp);

    expect(typingApp.eatenFood.value).toBeNull();
    // Asserted on what *did* happen rather than on the absence of a plate:
    // "no eaten animation" would pass even if the feature never ran at all.
    // Compared against the bare word, which says the thing that matters — the
    // percent changes nothing for a word that isn't food. (It never counted
    // either: `countForWord` looks for "50 lion" and the "%" sits between.)
    const bare = createTypingApp();
    bare.currentText.value = 'lion';
    await pressEnter(bare);

    expect(typingApp.emojiEffects.value).toHaveLength(bare.emojiEffects.value.length);
    expect(typingApp.emojiEffects.value.every(e => e.emoji === '🦁')).toBe(true);
  });

  it('hands a bite bigger than the whole thing back to the ordinary swarm', async () => {
    typingApp.currentText.value = '150% cookie';

    await pressEnter(typingApp);

    expect(typingApp.eatenFood.value).toBeNull();
    expect(typingApp.emojiEffects.value.length).toBeGreaterThan(0);
    expect(typingApp.emojiEffects.value.every(e => e.emoji === '🍪')).toBe(true);
  });

  it('leaves a bare percent to the battery', async () => {
    typingApp.currentText.value = '50%';

    await pressEnter(typingApp);

    expect(typingApp.eatenFood.value).toBeNull();
    expect(typingApp.batteryCharge.value).toMatchObject({ percent: 50 });
  });

  it('leaves an equation to the maths, modifier and all', async () => {
    typingApp.currentText.value = '20 + 30%';

    await pressEnter(typingApp);

    expect(typingApp.eatenFood.value).toBeNull();
    expect(typingApp.mathEquation.value).toMatchObject({ result: 50 });
    expect(typingApp.batteryCharge.value).toMatchObject({ percent: 50 });
  });

  it('washes the screen when the food is produce, the way any produce line does', async () => {
    typingApp.currentText.value = '50% banana';

    await pressEnter(typingApp);

    expect(typingApp.eatenFood.value).toMatchObject({ word: 'banana' });
    expect(typingApp.screenColor.value).toBe('#fff3c4');
  });

  it('clears the plate when the child starts typing again', async () => {
    typingApp.currentText.value = '50% cookie';
    await pressEnter(typingApp);
    expect(typingApp.eatenFood.value).not.toBeNull();

    typeLetter(typingApp);

    expect(typingApp.eatenFood.value).toBeNull();
  });

  it('clears the plate on Escape', async () => {
    typingApp.currentText.value = '50% cookie';
    await pressEnter(typingApp);

    typingApp.onKeyDown({ key: 'Escape', preventDefault: jest.fn() });

    expect(typingApp.eatenFood.value).toBeNull();
  });
});
