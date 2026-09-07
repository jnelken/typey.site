import { describe, it, expect, beforeEach } from '@jest/globals';
import { render } from '@testing-library/vue';
import { h, nextTick } from 'vue';
import TypingArea from '@/features/typing/components/TypingArea.vue';
import {
  createTypingApp,
  provideTypingApp,
} from '@/composables/useTypingApp';
import { colorForIndex } from '@/features/easter-eggs/utils/colorMode';

// jsdom normalises inline colors to `rgb(r, g, b)`.
const toRgb = hex =>
  `rgb(${[1, 3, 5]
    .map(offset => parseInt(hex.slice(offset, offset + 2), 16))
    .join(', ')})`;

describe('Color Mode integration', () => {
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

  it('leaves characters uncolored while the mode is off', () => {
    typingApp.completedLines.value = ['cat'];
    const { container } = render(wrapper);

    container.querySelectorAll('.character').forEach(span => {
      expect(span.style.color).toBe('');
    });
  });

  it('paints each character its palette color once the mode is on', async () => {
    typingApp.completedLines.value = ['cat'];
    typingApp.isColorModeActive.value = true;
    const { container } = render(wrapper);
    await nextTick();

    const spans = [...container.querySelectorAll('.character')];
    expect(spans).toHaveLength(3);
    spans.forEach((span, index) => {
      expect(span.style.color).toBe(toRgb(colorForIndex(index)));
    });
  });

  it('gives neighbouring characters different colors', async () => {
    typingApp.completedLines.value = ['cat'];
    typingApp.isColorModeActive.value = true;
    const { container } = render(wrapper);
    await nextTick();

    const colors = [...container.querySelectorAll('.character')].map(
      span => span.style.color,
    );
    expect(new Set(colors).size).toBe(colors.length);
  });

  it('does not change the text a screen reader gets', async () => {
    typingApp.completedLines.value = ['cat'];
    const { container } = render(wrapper);
    const plain = container.textContent;

    typingApp.isColorModeActive.value = true;
    await nextTick();

    expect(container.textContent).toBe(plain);
  });

  it('brings history lines back to full strength so the palette is not muted', async () => {
    typingApp.completedLines.value = ['cat'];
    typingApp.isColorModeActive.value = true;
    const { container } = render(wrapper);
    await nextTick();

    expect(
      container.querySelector('.completed-line').classList,
    ).toContain('full-strength');
  });

  it('combines with emoji mode without breaking either', async () => {
    typingApp.completedLines.value = ['cat'];
    typingApp.isColorModeActive.value = true;
    typingApp.toggleEmojiMode();
    const { container } = render(wrapper);
    await nextTick();

    const spans = [...container.querySelectorAll('.character')];
    expect(spans.map(span => span.textContent.trim())).toEqual([
      '🐱',
      '🍎',
      '🌳',
    ]);
    spans.forEach((span, index) => {
      expect(span.style.color).toBe(toRgb(colorForIndex(index)));
    });
  });

  it('leaves the read-aloud highlight in charge of the word being spoken', async () => {
    typingApp.completedLines.value = ['cat'];
    typingApp.isColorModeActive.value = true;
    typingApp.currentlySpeaking.value = 'a';
    const { container } = render(wrapper);
    await nextTick();

    const spans = [...container.querySelectorAll('.character')];
    expect(spans[1].classList).toContain('character-speaking');
    expect(spans[1].style.color).toBe('');
    expect(spans[0].style.color).toBe(toRgb(colorForIndex(0)));
  });
});
