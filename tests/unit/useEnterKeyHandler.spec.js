import { ref } from 'vue';
import { useEnterKeyHandler } from '@/features/typing/composables/useEnterKeyHandler';
import { EASTER_EGGS } from '@/features/analytics/easterEggs';

function setup(line) {
  const systems = {
    typingState: {
      currentText: ref(line),
      addCompletedLine: jest.fn(),
      clearCurrentText: jest.fn(() => { systems.typingState.currentText.value = ''; }),
    },
    typingSettings: { isAutoSpeakEnabled: ref(true), isWordPromptEnabled: ref(true) },
    typingAPI: { submitEntry: jest.fn(() => new Promise(() => {})) },
    wordPromptSystem: { matchesPromptWord: jest.fn(() => false), nextPromptWord: jest.fn() },
    soundSystem: { playEnterSound: jest.fn() },
    speechSystem: { isSpeechEnabled: ref(true), speakLine: jest.fn() },
    screenColorSystem: { setScreenColorFromText: jest.fn() },
    easterEggsSystem: { evaluateEasterEggs: jest.fn() },
    emojisSystem: { spawnEmojis: jest.fn() },
    guideSystem: { toggle: jest.fn(), revealForWord: jest.fn() },
    sillySystem: { toggle: jest.fn(), isActive: ref(true) },
    colorSystem: { toggle: jest.fn(), isActive: ref(true) },
    partySystem: { toggle: jest.fn(), isActive: ref(true), burstFromEdges: jest.fn() },
    nightSystem: { isActive: ref(false) },
    mathSystem: { play: jest.fn() },
    percentSystem: { play: jest.fn(), isOvercharged: ref(false) },
    eatenSystem: { play: jest.fn() },
    enterNight: jest.fn(),
    exitNight: jest.fn(),
    trackEgg: jest.fn(),
  };
  return { ...systems, handleEnterKey: useEnterKeyHandler(systems) };
}

describe('useEnterKeyHandler', () => {
  it('ignores blank input without playing, clearing or submitting it', async () => {
    const app = setup(' \t ');
    await app.handleEnterKey();
    expect(app.soundSystem.playEnterSound).not.toHaveBeenCalled();
    expect(app.typingAPI.submitEntry).not.toHaveBeenCalled();
    expect(app.typingState.addCompletedLine).not.toHaveBeenCalled();
    expect(app.typingState.clearCurrentText).not.toHaveBeenCalled();
  });

  it('records and submits the original line before effects, without awaiting submission', async () => {
    const app = setup('  red  ');
    app.wordPromptSystem.matchesPromptWord.mockReturnValue(true);
    await app.handleEnterKey();
    expect(app.typingState.addCompletedLine).toHaveBeenCalledWith('  red  ');
    expect(app.typingAPI.submitEntry).toHaveBeenCalledTimes(1);
    expect(app.typingAPI.submitEntry).toHaveBeenCalledWith('  red  ');
    expect(app.screenColorSystem.setScreenColorFromText).toHaveBeenCalledWith('red');
    expect(app.wordPromptSystem.matchesPromptWord).toHaveBeenCalledWith('red');
    expect(app.wordPromptSystem.nextPromptWord).toHaveBeenCalledTimes(1);
    expect(app.speechSystem.speakLine).toHaveBeenCalledWith('  red  ');
    expect(app.typingState.currentText.value).toBe('');
    const order = mock => mock.mock.invocationCallOrder[0];
    expect(order(app.typingState.addCompletedLine)).toBeLessThan(order(app.typingAPI.submitEntry));
    expect(order(app.typingAPI.submitEntry)).toBeLessThan(order(app.screenColorSystem.setScreenColorFromText));
    expect(order(app.wordPromptSystem.nextPromptWord)).toBeLessThan(order(app.easterEggsSystem.evaluateEasterEggs));
    expect(app.trackEgg.mock.calls).toEqual([[EASTER_EGGS.SCREEN_COLOR], [EASTER_EGGS.WORD_PROMPT]]);
  });

  it.each([
    ['goodnight', false, 'enterNight'], ['goodnight', true, 'exitNight'],
    ['black', false, 'enterNight'], ['moon', true, 'enterNight'],
    ['light', false, 'exitNight'], ['sun', true, 'exitNight'],
  ])('dispatches %s before washes, prompts and effects (night=%s)', async (line, active, action) => {
    const app = setup(line);
    app.nightSystem.isActive.value = active;
    await app.handleEnterKey();
    expect(app[action]).toHaveBeenCalledTimes(1);
    expect(app[action === 'enterNight' ? 'exitNight' : 'enterNight']).not.toHaveBeenCalled();
    expect(app.screenColorSystem.setScreenColorFromText).not.toHaveBeenCalled();
    expect(app.wordPromptSystem.matchesPromptWord).not.toHaveBeenCalled();
    expect(app.partySystem.burstFromEdges).not.toHaveBeenCalled();
    expect(app.easterEggsSystem.evaluateEasterEggs).not.toHaveBeenCalled();
    expect(app.speechSystem.speakLine).toHaveBeenCalledWith(line);
    expect(app.typingState.currentText.value).toBe('');
  });

  it.each(['qwerty', 'silly', 'color', 'party'])('keeps %s ahead of party bursts and ordinary speech', async line => {
    const app = setup(line);
    await app.handleEnterKey();
    expect(app.partySystem.burstFromEdges).not.toHaveBeenCalled();
    expect(app.easterEggsSystem.evaluateEasterEggs).not.toHaveBeenCalled();
    expect(app.speechSystem.speakLine).not.toHaveBeenCalled();
    expect(app.typingState.currentText.value).toBe('');
  });

  it('suppresses washes and color toggles at night', async () => {
    const app = setup('color');
    app.nightSystem.isActive.value = true;
    await app.handleEnterKey();
    expect(app.colorSystem.toggle).not.toHaveBeenCalled();
    expect(app.screenColorSystem.setScreenColorFromText).not.toHaveBeenCalled();
    expect(app.trackEgg).not.toHaveBeenCalled();
  });

  it.each([
    ['2 + 3%', 'mathSystem', '2 plus 3 equals 5 percent'],
    ['50%', 'percentSystem', '50 percent'],
    ['50% cookie', 'eatenSystem', '50 percent cookie'],
  ])('dispatches %s to its own effect and speech', async (line, system, speech) => {
    const app = setup(line);
    await app.handleEnterKey();
    expect(app[system].play).toHaveBeenCalledTimes(1);
    expect(app.partySystem.burstFromEdges).toHaveBeenCalledTimes(1);
    expect(app.easterEggsSystem.evaluateEasterEggs).not.toHaveBeenCalled();
    expect(app.speechSystem.speakLine).toHaveBeenCalledWith(speech);
    if (line === '2 + 3%') expect(app.percentSystem.play).toHaveBeenCalledWith({ percent: 5 });
  });

  it.each(['hello there', 'goodnight', '2 + 3', '50%', '50% cookie'])(
    'rechecks both live speech settings for %s', async line => {
      const app = setup(line);
      for (const [autoSpeak, speech] of [[false, true], [true, false], [false, false], [true, true]]) {
        app.typingState.currentText.value = line;
        app.typingSettings.isAutoSpeakEnabled.value = autoSpeak;
        app.speechSystem.isSpeechEnabled.value = speech;
        app.speechSystem.speakLine.mockClear();
        await app.handleEnterKey();
        expect(app.speechSystem.speakLine).toHaveBeenCalledTimes(autoSpeak && speech ? 1 : 0);
      }
    },
  );
});
