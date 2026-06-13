import { ref, watch } from 'vue';
import { loadSetting, saveSetting } from '@/utils/storage';

/**
 * User preferences and settings for typing behavior.
 * Toggle states persist across page refreshes via localStorage.
 */
export function useTypingSettings() {
  const isCapsLockEnabled = ref(loadSetting('capsLock', true));
  const isAutoSpeakEnabled = ref(loadSetting('autoSpeak', true));

  watch(isCapsLockEnabled, value => saveSetting('capsLock', value));
  watch(isAutoSpeakEnabled, value => saveSetting('autoSpeak', value));

  const toggleCapsLock = () => {
    isCapsLockEnabled.value = !isCapsLockEnabled.value;
  };

  const toggleAutoSpeak = () => {
    isAutoSpeakEnabled.value = !isAutoSpeakEnabled.value;
  };

  return {
    // State
    isCapsLockEnabled,
    isAutoSpeakEnabled,

    // Actions
    toggleCapsLock,
    toggleAutoSpeak,
  };
}
