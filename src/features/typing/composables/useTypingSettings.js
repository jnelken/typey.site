import { ref, watch } from 'vue';
import { loadSetting, saveSetting } from '@/utils/storage';

/**
 * User preferences and settings for typing behavior.
 * Toggle states persist across page refreshes via localStorage.
 */
export function useTypingSettings() {
  const isCapsLockEnabled = ref(loadSetting('capsLock', true));
  const isAutoSpeakEnabled = ref(loadSetting('autoSpeak', true));
  // Emoji mode is off by default — it replaces the letters on screen, so it
  // should be something the child opts into rather than the first thing seen.
  const isEmojiModeEnabled = ref(loadSetting('emojiMode', false));
  // Word prompt is on by default — it's the practice word shown above the
  // input, and a kid should see it right away without digging into settings.
  const isWordPromptEnabled = ref(loadSetting('wordPrompt', true));

  watch(isCapsLockEnabled, value => saveSetting('capsLock', value));
  watch(isAutoSpeakEnabled, value => saveSetting('autoSpeak', value));
  watch(isEmojiModeEnabled, value => saveSetting('emojiMode', value));
  watch(isWordPromptEnabled, value => saveSetting('wordPrompt', value));

  const toggleCapsLock = () => {
    isCapsLockEnabled.value = !isCapsLockEnabled.value;
  };

  const toggleAutoSpeak = () => {
    isAutoSpeakEnabled.value = !isAutoSpeakEnabled.value;
  };

  const toggleEmojiMode = () => {
    isEmojiModeEnabled.value = !isEmojiModeEnabled.value;
  };

  const toggleWordPrompt = () => {
    isWordPromptEnabled.value = !isWordPromptEnabled.value;
  };

  return {
    // State
    isCapsLockEnabled,
    isAutoSpeakEnabled,
    isEmojiModeEnabled,
    isWordPromptEnabled,

    // Actions
    toggleCapsLock,
    toggleAutoSpeak,
    toggleEmojiMode,
    toggleWordPrompt,
  };
}
