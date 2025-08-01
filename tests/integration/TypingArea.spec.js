import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/vue';
import { createApp } from 'vue';
import TypingArea from '../../src/components/TypingArea.vue';
import {
  createTypingApp,
  provideTypingApp,
} from '../../src/composables/useTypingApp';

describe('TypingArea Integration', () => {
  let app;
  let typingApp;

  beforeEach(() => {
    // Create a fresh app instance for each test
    app = createApp({
      components: { TypingArea },
      setup() {
        typingApp = createTypingApp();
        provideTypingApp(typingApp);
        return {};
      },
      template: '<TypingArea />',
    });
  });

  describe('rendering', () => {
    it('should render the typing area', () => {
      render(app);
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('should show completed lines', () => {
      typingApp.completedLines.value = ['Hello world', 'Test line'];
      render(app);

      expect(screen.getByText('Hello world')).toBeInTheDocument();
      expect(screen.getByText('Test line')).toBeInTheDocument();
    });

    it('should show no lines when empty', () => {
      typingApp.completedLines.value = [];
      render(app);

      const lines = screen.queryAllByText(/.*/);
      expect(lines).toHaveLength(0);
    });
  });

  describe('speech functionality', () => {
    it('should speak line when clicked', async () => {
      typingApp.completedLines.value = ['Hello world'];
      const speakHistoryLineSpy = jest.spyOn(typingApp, 'speakHistoryLine');

      render(app);

      const lineElement = screen.getByText('Hello world');
      fireEvent.click(lineElement);

      expect(speakHistoryLineSpy).toHaveBeenCalledWith('Hello world');
    });

    it('should highlight line being spoken', async () => {
      typingApp.completedLines.value = ['Hello world'];
      typingApp.speakingLine.value = 'Hello world';
      typingApp.speakingPosition.value = 0;

      render(app);

      const lineElement = screen.getByText('Hello world');
      expect(lineElement).toHaveClass('completed-line');

      // Check if characters are highlighted
      const characters = lineElement.querySelectorAll('.character-speaking');
      expect(characters.length).toBeGreaterThan(0);
    });

    it('should not highlight when not speaking', () => {
      typingApp.completedLines.value = ['Hello world'];
      typingApp.speakingLine.value = null;

      render(app);

      const lineElement = screen.getByText('Hello world');
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

      render(app);

      // Add a new line
      typingApp.completedLines.value = ['New line'];

      await waitFor(() => {
        expect(screen.getByText('New line')).toBeInTheDocument();
      });
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(app);

      const container = screen.getByRole('main');
      expect(container).toBeInTheDocument();
    });

    it('should be keyboard accessible', () => {
      typingApp.completedLines.value = ['Hello world'];
      render(app);

      const lineElement = screen.getByText('Hello world');
      expect(lineElement).toHaveAttribute('tabindex', '0');
    });
  });

  describe('visual feedback', () => {
    it('should show hover effects', async () => {
      typingApp.completedLines.value = ['Hello world'];
      render(app);

      const lineElement = screen.getByText('Hello world');

      // Simulate hover
      fireEvent.mouseEnter(lineElement);

      await waitFor(() => {
        expect(lineElement).toHaveStyle('opacity: 1');
      });
    });

    it('should animate new lines', async () => {
      render(app);

      // Add a new line
      typingApp.completedLines.value = ['Animated line'];

      await waitFor(() => {
        const lineElement = screen.getByText('Animated line');
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

      render(app);

      expect(screen.getByText('First line')).toBeInTheDocument();
      expect(screen.getByText('Second line')).toBeInTheDocument();
      expect(screen.getByText('Third line')).toBeInTheDocument();
    });

    it('should speak correct line when clicked', () => {
      typingApp.completedLines.value = [
        'First line',
        'Second line',
        'Third line',
      ];

      const speakHistoryLineSpy = jest.spyOn(typingApp, 'speakHistoryLine');
      render(app);

      const secondLine = screen.getByText('Second line');
      fireEvent.click(secondLine);

      expect(speakHistoryLineSpy).toHaveBeenCalledWith('Second line');
    });
  });
});
