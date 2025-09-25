import { ref } from 'vue';

/**
 * User preferences and settings for typing behavior
 */
export function useTypingSettings() {
  const isCapsLockEnabled = ref(true);
  const isAutoSpeakEnabled = ref(true);

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