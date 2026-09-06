import { describe, it, expect } from '@jest/globals';
import { nextTick } from 'vue';
import { useTypingSettings } from '@/features/typing/composables/useTypingSettings';
import { loadSetting, saveSetting } from '@/utils/storage';

describe('useTypingSettings — emoji mode', () => {
  it('is off by default so the app still opens on letters', () => {
    const { isEmojiModeEnabled } = useTypingSettings();
    expect(isEmojiModeEnabled.value).toBe(false);
  });

  it('restores a previously saved preference', () => {
    saveSetting('emojiMode', true);
    const { isEmojiModeEnabled } = useTypingSettings();
    expect(isEmojiModeEnabled.value).toBe(true);
  });

  it('toggles on and back off', () => {
    const { isEmojiModeEnabled, toggleEmojiMode } = useTypingSettings();
    toggleEmojiMode();
    expect(isEmojiModeEnabled.value).toBe(true);
    toggleEmojiMode();
    expect(isEmojiModeEnabled.value).toBe(false);
  });

  it('persists the toggle so it survives a refresh', async () => {
    const { toggleEmojiMode } = useTypingSettings();
    toggleEmojiMode();
    await nextTick();
    expect(loadSetting('emojiMode', false)).toBe(true);
  });

  it('leaves the other toggles at their defaults', () => {
    const { isCapsLockEnabled, isAutoSpeakEnabled } = useTypingSettings();
    expect(isCapsLockEnabled.value).toBe(true);
    expect(isAutoSpeakEnabled.value).toBe(true);
  });
});
