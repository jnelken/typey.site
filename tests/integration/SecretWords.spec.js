import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, fireEvent } from '@testing-library/vue';
import { h, nextTick, ref } from 'vue';
import SettingsMenu from '@/features/typing/components/SettingsMenu.vue';
import WordGuide from '@/features/typing/components/WordGuide.vue';
import {
  createTypingApp,
  provideTypingApp,
} from '@/composables/useTypingApp';
import { SECRET_WORDS } from '@/features/typing/composables/useWordGuide';

// Settings and the guide are siblings in the real app (the Toolbar owns the
// settings modal), so the test mounts them the same way.
const mountBoth = typingApp => {
  const settingsOpen = ref(true);
  return {
    settingsOpen,
    wrapper: {
      setup() {
        provideTypingApp(typingApp);
        return () => [
          h(SettingsMenu, {
            open: settingsOpen.value,
            onClose: () => {
              settingsOpen.value = false;
            },
          }),
          h(WordGuide),
        ];
      },
    },
  };
};

describe('Secret words from settings', () => {
  let typingApp;

  beforeEach(() => {
    typingApp = createTypingApp();
  });

  it('opens the guide on the secret words and steps settings aside', async () => {
    const { settingsOpen, wrapper } = mountBoth(typingApp);
    const { getByText, queryByText } = render(wrapper);

    await fireEvent.click(getByText('Secret Words'));
    await nextTick();

    expect(settingsOpen.value).toBe(false);
    expect(typingApp.guideVisible.value).toBe(true);
    expect(typingApp.guideSecretsOnly.value).toBe(true);
    expect(queryByText('⚙️ Settings')).toBeNull();
    expect(getByText('🤫 Secret Words 🤫')).toBeTruthy();
  });

  it('shows every secret word with what it does, and no dictionary cards', async () => {
    const { wrapper } = mountBoth(typingApp);
    const { getByText, container } = render(wrapper);

    await fireEvent.click(getByText('Secret Words'));
    await nextTick();

    SECRET_WORDS.forEach(secret => {
      expect(getByText(secret.word)).toBeTruthy();
      expect(getByText(secret.description)).toBeTruthy();
    });

    // The percent battery trigger is findable from Settings → Secret Words.
    expect(getByText('50%')).toBeTruthy();
    expect(getByText('Charges a battery that much')).toBeTruthy();

    expect(container.querySelectorAll('.guide-card:not(.secret)').length).toBe(0);
  });

  it('gives the dictionary back when the guide is opened the usual way', async () => {
    const { wrapper } = mountBoth(typingApp);
    const { getByText, container } = render(wrapper);

    await fireEvent.click(getByText('Secret Words'));
    await nextTick();

    typingApp.toggleGuide(false);
    typingApp.toggleGuide(true);
    await nextTick();

    expect(typingApp.guideSecretsOnly.value).toBe(false);
    expect(container.querySelectorAll('.guide-card:not(.secret)').length).toBeGreaterThan(0);
  });
});
