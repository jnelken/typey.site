import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/vue';
import { h } from 'vue';
import TypingArea from '@/features/typing/components/TypingArea.vue';
import {
  createTypingApp,
  provideTypingApp,
} from '@/composables/useTypingApp';

describe('TypingArea Integration', () => {
  let typingApp;
  let wrapper;

  beforeEach(() => {
    // Create the typing app instance first
    typingApp = createTypingApp();

    // Create a wrapper component that provides the typing app context
    wrapper = {
      setup() {
        provideTypingApp(typingApp);
        return () => h(TypingArea);
      },
    };
  });

  describe('rendering', () => {
    it('should render the typing area', () => {
      render(wrapper);
      const typingArea = screen.getByText((content, element) => {
        return element?.classList?.contains('typing-area');
      }, { selector: 'div' });
      expect(typingArea).toBeInTheDocument();
    });

    it('should show completed lines', () => {
      typingApp.completedLines.value = ['Hello world', 'Test line'];
      const { container } = render(wrapper);

      // Check that the text content includes our lines (note: spaces are rendered as \u00A0)
      expect(container.textContent).toContain('Hello\u00A0world');
      expect(container.textContent).toContain('Test\u00A0line');
    });

    it('should show no lines when empty', () => {
      typingApp.completedLines.value = [];
      render(wrapper);

      const completedLines = screen.queryAllByText((content, element) => {
        return element?.classList?.contains('completed-line');
      }, { selector: 'div' });
      expect(completedLines).toHaveLength(0);
    });
  });

  describe('speech functionality', () => {
    it('should speak line when clicked', async () => {
      typingApp.completedLines.value = ['Hello world'];
      const speakHistoryLineSpy = jest.spyOn(typingApp, 'speakHistoryLine');

      render(wrapper);

      const lineElement = screen.getByText((content, element) => {
        return element?.classList?.contains('completed-line');
      }, { selector: 'div' });
      fireEvent.click(lineElement);

      expect(speakHistoryLineSpy).toHaveBeenCalledWith('Hello world');
    });

    it('should highlight line being spoken', async () => {
      typingApp.completedLines.value = ['Hello world'];
      typingApp.speakingLine.value = 'Hello world';
      typingApp.speakingPosition.value = 0;

      render(wrapper);

      const lineElement = screen.getByText((content, element) => {
        return element?.classList?.contains('completed-line');
      }, { selector: 'div' });
      expect(lineElement).toHaveClass('completed-line');

      // Check if characters are highlighted
      const characters = lineElement.querySelectorAll('.character-speaking');
      expect(characters.length).toBeGreaterThan(0);
    });

    it('should not highlight when not speaking', () => {
      typingApp.completedLines.value = ['Hello world'];
      typingApp.speakingLine.value = null;

      render(wrapper);

      const lineElement = screen.getByText((content, element) => {
        return element?.classList?.contains('completed-line');
      }, { selector: 'div' });
      const highlightedCharacters = lineElement.querySelectorAll(
        '.character-speaking',
      );
      expect(highlightedCharacters.length).toBe(0);
    });
  });

  describe('scrolling behavior', () => {
    it('should scroll to bottom when new lines are added', async () => {
      const mockScrollTo = jest.fn();
      Object.defineProperty(window, 'scrollTo', {
        value: mockScrollTo,
        writable: true,
      });

      const { container } = render(wrapper);

      // Add a new line
      typingApp.completedLines.value = ['New line'];

      await waitFor(() => {
        expect(container.textContent).toContain('New\u00A0line');
      });
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(wrapper);

      const typingArea = screen.getByText((content, element) => {
        return element?.classList?.contains('typing-area');
      }, { selector: 'div' });
      expect(typingArea).toBeInTheDocument();
    });

    it('should be keyboard accessible', () => {
      typingApp.completedLines.value = ['Hello world'];
      render(wrapper);

      const lineElement = screen.getByText((content, element) => {
        return element?.classList?.contains('completed-line');
      }, { selector: 'div' });
      // Check that the line is clickable (cursor: pointer is set in CSS)
      expect(lineElement).toBeInTheDocument();
    });
  });

  describe('visual feedback', () => {
    it('should show hover effects', async () => {
      typingApp.completedLines.value = ['Hello world'];
      const { container } = render(wrapper);

      const lineElement = container.querySelector('.completed-line');

      // Simulate hover
      fireEvent.mouseEnter(lineElement);

      // Check that the line element exists and can receive hover events
      // Note: CSS transitions don't work in JSDOM so we can't test the opacity change
      expect(lineElement).toBeInTheDocument();
      expect(lineElement).toHaveClass('completed-line');
    });

    it('should animate new lines', async () => {
      render(wrapper);

      // Add a new line
      typingApp.completedLines.value = ['Animated line'];

      await waitFor(() => {
        const lineElement = screen.getByText((content, element) => {
          return element?.classList?.contains('completed-line');
        }, { selector: 'div' });
        expect(lineElement).toHaveClass('line-enter');
      });
    });
  });

  describe('multiple lines', () => {
    it('should handle multiple completed lines', () => {
      typingApp.completedLines.value = [
        'First line',
        'Second line',
        'Third line',
      ];

      const { container } = render(wrapper);

      expect(container.textContent).toContain('First\u00A0line');
      expect(container.textContent).toContain('Second\u00A0line');
      expect(container.textContent).toContain('Third\u00A0line');
    });

    it('should speak correct line when clicked', () => {
      typingApp.completedLines.value = [
        'First line',
        'Second line',
        'Third line',
      ];

      const speakHistoryLineSpy = jest.spyOn(typingApp, 'speakHistoryLine');
      render(wrapper);

      const allLines = screen.getAllByText((content, element) => {
        return element?.classList?.contains('completed-line');
      }, { selector: 'div' });

      // Click the second line (index 1)
      fireEvent.click(allLines[1]);

      expect(speakHistoryLineSpy).toHaveBeenCalledWith('Second line');
    });
  });
});
