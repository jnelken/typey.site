import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';

jest.mock('@/features/analytics/analytics', () => ({ capture: jest.fn() }));

import { createTypingApp } from '@/composables/useTypingApp';
import { capture } from '@/features/analytics/analytics';

const triggered = () =>
  capture.mock.calls
    .filter(([event]) => event === 'easter_egg_triggered')
    .map(([, props]) => props);

const triggeredEggs = () => triggered().map(props => props.egg);

describe('useTypingApp analytics', () => {
  let typingApp;

  const send = async text => {
    typingApp.currentText.value = text;
    await typingApp.onKeyDown({ key: 'Enter', preventDefault: jest.fn() });
  };

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    typingApp = createTypingApp();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  describe('easter eggs', () => {
    it.each([
      ['qwerty', 'word_guide'],
      ['silly', 'silly'],
      ['color', 'color'],
      ['rainbow', 'color'],
      ['goodnight', 'night'],
      ['party', 'party'],
      ['2 + 3', 'math'],
      ['50%', 'battery'],
      ['50% cookie', 'eaten_food'],
      ['$5', 'money_rain'],
      ['5 lions', 'counted_word'],
      ['7', 'balloons'],
      ['red', 'screen_color'],
    ])('"%s" plays the %s egg', async (line, egg) => {
      await send(line);
      expect(triggeredEggs()).toContain(egg);
    });

    it('reports a mode switch with its new state', async () => {
      await send('party');
      await send('party');
      expect(triggered().filter(props => props.egg === 'party')).toEqual([
        { egg: 'party', enabled: true },
        { egg: 'party', enabled: false },
      ]);
    });

    it('reports an equation by its operation and modifier, never its numbers', async () => {
      await send('12 + 30%');
      expect(triggered()).toContainEqual({ egg: 'math', operation: '+', modifier: '%' });
    });

    it('reports the modifier effect an equation plays', async () => {
      await send('2 + 3$');
      expect(triggeredEggs()).toEqual(expect.arrayContaining(['math', 'money_rain']));
    });

    it('reports an overcharged battery, however it was charged', async () => {
      await send('2000%');
      expect(triggeredEggs()).toEqual(['battery', 'battery_overcharge']);

      capture.mockClear();
      await send('1500 + 1%');
      expect(triggeredEggs()).toContain('battery_overcharge');
    });

    it('reports spelling the prompt word', async () => {
      if (!typingApp.isWordPromptEnabled.value) typingApp.toggleWordPrompt();
      capture.mockClear();
      await send(typingApp.promptWord.value);
      expect(triggeredEggs()).toContain('word_prompt');
    });

    it('reports a discovery once per egg per page load', async () => {
      await send('7');
      await send('9');
      const discoveries = capture.mock.calls.filter(([event]) => event === 'easter_egg_discovered');
      expect(discoveries).toEqual([['easter_egg_discovered', { egg: 'balloons' }]]);
    });

    it('sends nothing for an ordinary line that plays no egg', async () => {
      await send('hello there');
      expect(triggered()).toEqual([]);
    });

    it('never puts what was typed into an event', async () => {
      const lines = ['50% cookie', '12 + 30', '2000%', '5 lions', '$77', 'MY NAME IS SAM', 'red apple'];
      for (const line of lines) await send(line);

      const sent = JSON.stringify(capture.mock.calls).toLowerCase();
      ['cookie', 'lions', 'sam', 'apple', '"12"', '42', '2000', '77'].forEach(fragment =>
        expect(sent).not.toContain(fragment),
      );
      capture.mock.calls.forEach(([, props]) =>
        Object.values(props ?? {}).forEach(value =>
          expect(typeof value === 'string' ? value.length : 0).toBeLessThanOrEqual(40),
        ),
      );
    });
  });

  describe('settings', () => {
    it.each([
      ['toggleSound', 'sound', 'isSoundEnabled'],
      ['toggleSpeech', 'speech', 'isSpeechEnabled'],
      ['toggleAutoSpeak', 'auto_speak', 'isAutoSpeakEnabled'],
      ['toggleCapsLock', 'caps_lock', 'isCapsLockEnabled'],
      ['toggleEmojiMode', 'emoji_mode', 'isEmojiModeEnabled'],
      ['toggleWordPrompt', 'word_prompt', 'isWordPromptEnabled'],
    ])('%s reports the %s setting and its new state', (toggle, setting, flag) => {
      typingApp[toggle]();
      expect(capture).toHaveBeenCalledWith('setting_changed', {
        setting,
        enabled: typingApp[flag].value,
      });
    });
  });

  describe('controls', () => {
    it('reports opening the word guide, but not closing it', () => {
      typingApp.toggleGuide(true);
      typingApp.toggleGuide(false);
      expect(capture.mock.calls).toEqual([['control_used', { control: 'word_guide' }]]);
      expect(typingApp.guideVisible.value).toBe(false);
    });

    it('reports opening the secret words', () => {
      typingApp.openSecretWords();
      expect(capture).toHaveBeenCalledWith('control_used', { control: 'secret_words' });
      expect(typingApp.guideSecretsOnly.value).toBe(true);
    });

    it('does not count typing "qwerty" as a press of the guide button', async () => {
      await send('qwerty');
      expect(capture).not.toHaveBeenCalledWith('control_used', expect.anything());
    });
  });
});
