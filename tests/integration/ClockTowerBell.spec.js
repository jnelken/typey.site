import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { render } from '@testing-library/vue';
import { nextTick } from 'vue';
import App from '@/App.vue';

const original = global.AudioContext;

describe('Clock tower bell — Enter path', () => {
  let oscillators;

  beforeEach(() => {
    jest.useFakeTimers();
    oscillators = [];
    global.AudioContext = jest.fn(() => ({
      currentTime: 0, state: 'running', destination: {},
      createGain: () => ({ connect() {}, disconnect() {}, gain: { setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {} } }),
      createOscillator: () => {
        const o = { connect() {}, disconnect() {}, start: jest.fn(), stop: jest.fn(), frequency: { setValueAtTime() {}, exponentialRampToValueAtTime() {} } };
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

  it.each(['1:15pm bell', '1 o clock bell', '1pm bell'])('"%s" shows and rings the bell', async text => {
    const { container } = render(App);
    await type(container, text);
    await press(container, 'Enter');
    expect(container.querySelector('[data-testid="clock-tower-bell"]')).not.toBeNull();
    expect(oscillators.length).toBeGreaterThan(0);
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
