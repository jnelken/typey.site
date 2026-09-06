import { describe, it, expect, beforeEach } from '@jest/globals';
import { render } from '@testing-library/vue';
import { h, nextTick } from 'vue';
import WordPrompt from '@/features/typing/components/WordPrompt.vue';
import { createTypingApp, provideTypingApp } from '@/composables/useTypingApp';

describe('WordPrompt integration', () => {
  let typingApp;
  let wrapper;

  beforeEach(() => {
    typingApp = createTypingApp();
    wrapper = {
      setup() {
        provideTypingApp(typingApp);
        return () => h(WordPrompt);
      },
    };
  });

  it('shows the word in caps while caps lock is on (the default)', () => {
    typingApp.promptWord.value = 'cat';
    const { container } = render(wrapper);

    expect(container.textContent).toContain('CAT');
    expect(container.textContent).not.toContain('cat');
  });

  it('shows the word in lowercase once caps lock is off', async () => {
    typingApp.promptWord.value = 'cat';
    typingApp.toggleCapsLock();
    const { container } = render(wrapper);
    await nextTick();

    expect(container.textContent).toContain('cat');
    expect(container.textContent).not.toContain('CAT');
  });

  it('follows the caps lock toggle without a remount', async () => {
    typingApp.promptWord.value = 'dog';
    const { container } = render(wrapper);
    expect(container.textContent).toContain('DOG');

    typingApp.toggleCapsLock();
    await nextTick();
    expect(container.textContent).toContain('dog');
  });

  it('shows the matching emoji beside the word', () => {
    typingApp.promptWord.value = 'cat';
    const { container } = render(wrapper);

    expect(container.textContent).toContain('🐱');
  });

  it('renders nothing while the word prompt is turned off', async () => {
    typingApp.toggleWordPrompt();
    const { container } = render(wrapper);
    await nextTick();

    expect(container.textContent).not.toContain('Type this word');
  });
});
