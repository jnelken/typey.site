import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { ref } from 'vue';
import { useSillyMode } from '@/features/easter-eggs/composables/useSillyMode';

// A deterministic word source, so the assertions read as plainly as the
// behaviour does.
const WORDS = ['lion', 'pizza', 'robot'];

/**
 * `clearsAfter: 'never'` stands in for a send that hasn't come back yet — the
 * real handler clears the input only after awaiting the API call, so a run has
 * to hold up even when the line it just sent is still sitting there.
 */
const createSillyMode = ({ clears = true, ...overrides } = {}) => {
  const currentText = ref('');
  const isCapsLockEnabled = ref(false);
  const sent = [];
  let next = 0;
  const silly = useSillyMode({
    currentText,
    isCapsLockEnabled,
    pickWord: () => WORDS[next++ % WORDS.length],
    sendLine: () => {
      sent.push(currentText.value);
      if (clears) currentText.value = '';
    },
    ...overrides,
  });
  return { currentText, isCapsLockEnabled, silly, sent };
};

describe('useSillyMode', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('starts inactive and sends nothing', () => {
    const { currentText, silly, sent } = createSillyMode();

    jest.advanceTimersByTime(15000);

    expect(silly.isActive.value).toBe(false);
    expect(sent).toEqual([]);
    expect(currentText.value).toBe('');
  });

  it('sends one word every three seconds once started', () => {
    const { silly, sent } = createSillyMode();

    silly.start();
    expect(silly.isActive.value).toBe(true);
    expect(sent).toEqual([]);

    jest.advanceTimersByTime(3000);
    expect(sent).toEqual(['lion']);

    jest.advanceTimersByTime(3000);
    expect(sent).toEqual(['lion', 'pizza']);
  });

  it('sends each word on its own line even when the last send is still in flight', () => {
    const { silly, sent } = createSillyMode({ clears: false });

    silly.start();
    jest.advanceTimersByTime(9000);

    expect(sent).toEqual(['lion', 'pizza', 'robot']);
  });

  it('replaces whatever the child has half-typed rather than sending it along', () => {
    const { currentText, silly, sent } = createSillyMode();
    currentText.value = 'my';

    silly.start();
    jest.advanceTimersByTime(3000);

    expect(sent).toEqual(['lion']);
  });

  it('matches caps lock when it is on', () => {
    const { isCapsLockEnabled, silly, sent } = createSillyMode();
    isCapsLockEnabled.value = true;

    silly.start();
    jest.advanceTimersByTime(3000);

    expect(sent).toEqual(['LION']);
  });

  it('stops sending when stopped', () => {
    const { silly, sent } = createSillyMode();

    silly.start();
    jest.advanceTimersByTime(3000);
    silly.stop();
    jest.advanceTimersByTime(15000);

    expect(silly.isActive.value).toBe(false);
    expect(sent).toEqual(['lion']);
  });

  it('toggles off and back on', () => {
    const { silly, sent } = createSillyMode();

    silly.toggle();
    jest.advanceTimersByTime(3000);
    silly.toggle();
    jest.advanceTimersByTime(15000);
    expect(silly.isActive.value).toBe(false);
    expect(sent).toEqual(['lion']);

    silly.toggle();
    jest.advanceTimersByTime(3000);
    expect(silly.isActive.value).toBe(true);
    expect(sent).toEqual(['lion', 'pizza']);
  });

  it('ignores a second start while already running', () => {
    const { silly, sent } = createSillyMode();

    silly.start();
    silly.start();
    jest.advanceTimersByTime(3000);

    expect(sent).toEqual(['lion']);
  });

  it('is a no-op to stop when it was never started', () => {
    const { silly, sent } = createSillyMode();

    expect(() => silly.stop()).not.toThrow();
    expect(silly.isActive.value).toBe(false);
    expect(sent).toEqual([]);
  });

  it('stops itself after the word cap, with the last word still sent', () => {
    const { silly, sent } = createSillyMode({ maxWords: 3 });

    silly.start();
    jest.advanceTimersByTime(30000);

    expect(silly.isActive.value).toBe(false);
    expect(sent).toEqual(['lion', 'pizza', 'robot']);
  });

  it('starts a fresh word budget on the next run', () => {
    const { silly, sent } = createSillyMode({ maxWords: 1 });

    silly.start();
    jest.advanceTimersByTime(6000);
    expect(sent).toEqual(['lion']);

    silly.start();
    jest.advanceTimersByTime(6000);
    expect(sent).toEqual(['lion', 'pizza']);
  });

  it('runs without a send handler rather than throwing', () => {
    const currentText = ref('');
    const silly = useSillyMode({ currentText, pickWord: () => 'lion' });

    silly.start();
    expect(() => jest.advanceTimersByTime(3000)).not.toThrow();
    expect(currentText.value).toBe('lion');
  });
});
