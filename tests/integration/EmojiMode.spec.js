import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/vue';
import { h, nextTick } from 'vue';
import TypingArea from '@/features/typing/components/TypingArea.vue';
import {
  createTypingApp,
  provideTypingApp,
} from '@/composables/useTypingApp';

describe('Emoji Mode integration', () => {
  let typingApp;
  let wrapper;

  beforeEach(() => {
    typingApp = createTypingApp();
    wrapper = {
      setup() {
        provideTypingApp(typingApp);
        return () => h(TypingArea);
      },
    };
  });

  it('renders plain letters while the mode is off', () => {
    typingApp.completedLines.value = ['cat'];
    const { container } = render(wrapper);
    expect(container.textContent).toContain('cat');
  });

  it('renders history as emoji once the mode is on', async () => {
    typingApp.completedLines.value = ['cat'];
    typingApp.toggleEmojiMode();
    const { container } = render(wrapper);
    await nextTick();

    expect(container.textContent).toContain('🐱🍎🌳');
    expect(container.textContent).not.toContain('cat');
  });

  it('keeps each emoji whole rather than splitting surrogate pairs', async () => {
    typingApp.completedLines.value = ['a'];
    typingApp.toggleEmojiMode();
    const { container } = render(wrapper);
    await nextTick();

    const charSpans = container.querySelectorAll('.character');
    expect(charSpans).toHaveLength(1);
    expect(charSpans[0].textContent).toBe('🍎');
  });

  it('still speaks the real words when an emoji line is clicked', async () => {
    typingApp.completedLines.value = ['cat'];
    typingApp.toggleEmojiMode();
    const speakSpy = jest.spyOn(typingApp, 'speakHistoryLine');
    render(wrapper);
    await nextTick();

    const lineElement = screen.getByText(
      (content, element) => element?.classList?.contains('completed-line'),
      { selector: 'div' },
    );
    fireEvent.click(lineElement);

    expect(speakSpy).toHaveBeenCalledWith('cat');
  });

  it('goes back to letters when the mode is switched off again', async () => {
    typingApp.completedLines.value = ['cat'];
    typingApp.toggleEmojiMode();
    const { container } = render(wrapper);
    await nextTick();
    expect(container.textContent).toContain('🐱🍎🌳');

    typingApp.toggleEmojiMode();
    await nextTick();
    expect(container.textContent).toContain('cat');
  });
});
