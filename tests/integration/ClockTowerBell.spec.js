import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

jest.mock('@/features/analytics/analytics', () => ({
  capture: jest.fn(),
  initAnalytics: jest.fn(),
  isAnalyticsConfigured: jest.fn(() => false),
}));

import { render } from '@testing-library/vue';
import { nextTick } from 'vue';
import App from '@/App.vue';
import { buildSchedule } from '@/features/bell/utils/westminster';
import { capture } from '@/features/analytics/analytics';

const original = global.AudioContext;

describe('Clock tower bell — Enter path', () => {
  let oscillators;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    oscillators = [];
    global.AudioContext = jest.fn(() => ({
      currentTime: 0, state: 'running', destination: {},
      createGain: () => ({ connect() {}, disconnect() {}, gain: { setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {} } }),
      createOscillator: () => {
        const o = { connect() {}, disconnect() {}, start: jest.fn(), stop: jest.fn(), frequency: { setValueAtTime: jest.fn(), exponentialRampToValueAtTime() {} } };
        oscillators.push(o);
        return o;
      },
    }));
  });
  afterEach(() => { global.AudioContext = original; jest.useRealTimers(); });

  // Bell voices are the only 'sine' oscillators; each is stopped once on its
  // schedule and once more when cancelled.
  const expectBellVoicesCancelled = () => {
    const voices = oscillators.filter(o => o.type === 'sine');
    expect(voices.length).toBeGreaterThan(0);
    voices.forEach(o => expect(o.stop.mock.calls.length).toBeGreaterThanOrEqual(2));
  };

  const type = async (container, text) => {
    const input = container.querySelector('input, textarea');
    input.value = text;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await nextTick();
  };
  const press = async (container, key) => {
    const input = container.querySelector('input, textarea');
    input.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
    await nextTick();
  };

  it.each([
    ['1:15pm bell', 15],
    ['1 o clock bell', 0],
    ['1pm bell', 0],
  ])('"%s" shows and rings the bell', async (text, minute) => {
    const { container } = render(App);
    await type(container, text);
    await press(container, 'Enter');
    expect(container.querySelector('[data-testid="clock-tower-bell"]')).not.toBeNull();
    // createAnalytics.capture owns property sanitization; protect the bell's
    // useTypingApp -> createEasterEggTracker delegation into that owner.
    expect(capture).toHaveBeenCalledWith('easter_egg_triggered', { quarter: minute, egg: 'clock_bell' });
    const bellFrequencies = new Set(
      buildSchedule({ minute, hour: 1 }).flatMap(({ hz }) => [hz, hz * 2.4]),
    );
    const bellVoices = oscillators.filter(o => bellFrequencies.has(o.frequency.setValueAtTime.mock.calls[0]?.[0]));
    expect(bellVoices).toHaveLength(buildSchedule({ minute, hour: 1 }).length * 2);
  });

  it('ordinary text and invalid times do not ring', async () => {
    const { container } = render(App);
    await type(container, '1:20 bell');
    await press(container, 'Enter');
    expect(container.querySelector('[data-testid="clock-tower-bell"]')).toBeNull();
  });

  it('Escape cancels the bell and silences pending strikes', async () => {
    const { container } = render(App);
    await type(container, '2pm bell');
    await press(container, 'Enter');
    expect(container.querySelector('[data-testid="clock-tower-bell"]')).not.toBeNull();
    await press(container, 'Escape');
    expect(container.querySelector('[data-testid="clock-tower-bell"]')).toBeNull();
    expectBellVoicesCancelled();
  });

  it('unmounting cancels pending audio', async () => {
    const { container, unmount } = render(App);
    await type(container, '2pm bell');
    await press(container, 'Enter');
    unmount();
    expectBellVoicesCancelled();
  });
});
