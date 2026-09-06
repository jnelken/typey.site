import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { ref } from 'vue';
import { useSillyMode } from '@/features/easter-eggs/composables/useSillyMode';

// A deterministic word source, so the assertions read as plainly as the
// behaviour does.
const WORDS = ['lion', 'pizza', 'robot'];

const createSillyMode = (overrides = {}) => {
  const currentText = ref('');
  const isCapsLockEnabled = ref(false);
  let next = 0;
  const silly = useSillyMode({
    currentText,
    isCapsLockEnabled,
    pickWord: () => WORDS[next++ % WORDS.length],
    ...overrides,
  });
  return { currentText, isCapsLockEnabled, silly };
};

describe('useSillyMode', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('starts inactive and writes nothing', () => {
    const { currentText, silly } = createSillyMode();

    jest.advanceTimersByTime(5000);

    expect(silly.isActive.value).toBe(false);
    expect(currentText.value).toBe('');
  });

  it('adds one word a second once started', () => {
    const { currentText, silly } = createSillyMode();

    silly.start();
    expect(silly.isActive.value).toBe(true);
    expect(currentText.value).toBe('');

    jest.advanceTimersByTime(1000);
    expect(currentText.value).toBe('lion');

    jest.advanceTimersByTime(1000);
    expect(currentText.value).toBe('lion pizza');
  });

  it('appends to whatever the child has already typed', () => {
    const { currentText, silly } = createSillyMode();
    currentText.value = 'my';

    silly.start();
    jest.advanceTimersByTime(1000);

    expect(currentText.value).toBe('my lion');
  });

  it('matches caps lock when it is on', () => {
    const { currentText, isCapsLockEnabled, silly } = createSillyMode();
    isCapsLockEnabled.value = true;

    silly.start();
    jest.advanceTimersByTime(1000);

    expect(currentText.value).toBe('LION');
  });

  it('stops adding words when stopped', () => {
    const { currentText, silly } = createSillyMode();

    silly.start();
    jest.advanceTimersByTime(1000);
    silly.stop();
    jest.advanceTimersByTime(5000);

    expect(silly.isActive.value).toBe(false);
    expect(currentText.value).toBe('lion');
  });

  it('toggles off and back on', () => {
    const { currentText, silly } = createSillyMode();

    silly.toggle();
    jest.advanceTimersByTime(1000);
    silly.toggle();
    jest.advanceTimersByTime(5000);
    expect(silly.isActive.value).toBe(false);
    expect(currentText.value).toBe('lion');

    silly.toggle();
    jest.advanceTimersByTime(1000);
    expect(silly.isActive.value).toBe(true);
    expect(currentText.value).toBe('lion pizza');
  });

  it('ignores a second start while already running', () => {
    const { currentText, silly } = createSillyMode();

    silly.start();
    silly.start();
    jest.advanceTimersByTime(1000);

    expect(currentText.value).toBe('lion');
  });

  it('is a no-op to stop when it was never started', () => {
    const { currentText, silly } = createSillyMode();

    expect(() => silly.stop()).not.toThrow();
    expect(silly.isActive.value).toBe(false);
    expect(currentText.value).toBe('');
  });

  it('stops itself after the word cap so a forgotten tab stays quiet', () => {
    const { currentText, silly } = createSillyMode({ maxWords: 3 });

    silly.start();
    jest.advanceTimersByTime(10000);

    expect(silly.isActive.value).toBe(false);
    expect(currentText.value).toBe('lion pizza robot');
  });

  it('starts a fresh word budget on the next run', () => {
    const { currentText, silly } = createSillyMode({ maxWords: 1 });

    silly.start();
    jest.advanceTimersByTime(2000);
    expect(currentText.value).toBe('lion');

    silly.start();
    jest.advanceTimersByTime(2000);
    expect(currentText.value).toBe('lion pizza');
  });
});
