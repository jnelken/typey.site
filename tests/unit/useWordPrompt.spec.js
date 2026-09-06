import { describe, it, expect } from '@jest/globals';
import { useWordPrompt } from '@/features/typing/composables/useWordPrompt';
import {
  ALL_PROMPTS,
  randomPrompt,
  emojiForPrompt,
} from '@/features/typing/utils/promptWords';

describe('useWordPrompt', () => {
  it('starts with a prompt from the pool', () => {
    const { promptWord } = useWordPrompt();
    expect(ALL_PROMPTS).toContain(promptWord.value);
  });

  it('always pairs the prompt with a matching emoji', () => {
    const { promptWord, promptEmoji } = useWordPrompt();
    expect(promptEmoji.value).toBe(emojiForPrompt(promptWord.value));
    expect(promptEmoji.value).toBeTruthy();
  });

  it('picks a new prompt from the pool on nextPromptWord', () => {
    const { promptWord, nextPromptWord } = useWordPrompt();
    nextPromptWord();
    expect(ALL_PROMPTS).toContain(promptWord.value);
  });

  it('avoids repeating the same prompt twice in a row', () => {
    for (let i = 0; i < 20; i++) {
      expect(randomPrompt('mom')).not.toBe('mom');
    }
  });
});

describe('useWordPrompt — history', () => {
  it('has nothing to go back to on the very first word', () => {
    const { hasPreviousWord, previousPromptWord } = useWordPrompt();
    expect(hasPreviousWord.value).toBe(false);
    expect(previousPromptWord()).toBe(false);
  });

  it('steps back to the word before', () => {
    const { promptWord, nextPromptWord, previousPromptWord } = useWordPrompt();
    const first = promptWord.value;

    nextPromptWord();
    expect(promptWord.value).not.toBe(first);

    expect(previousPromptWord()).toBe(true);
    expect(promptWord.value).toBe(first);
  });

  it('steps back through several words in order', () => {
    const { promptWord, nextPromptWord, previousPromptWord } = useWordPrompt();
    const seen = [promptWord.value];

    for (let i = 0; i < 3; i++) {
      nextPromptWord();
      seen.push(promptWord.value);
    }

    for (let i = seen.length - 2; i >= 0; i--) {
      previousPromptWord();
      expect(promptWord.value).toBe(seen[i]);
    }
  });

  it('replays the same words going forward again after stepping back', () => {
    const { promptWord, nextPromptWord, previousPromptWord } = useWordPrompt();
    nextPromptWord();
    const second = promptWord.value;

    previousPromptWord();
    nextPromptWord();

    expect(promptWord.value).toBe(second);
  });

  it('draws a fresh word once past the end of the history', () => {
    const { promptWord, nextPromptWord, previousPromptWord } = useWordPrompt();
    nextPromptWord();
    const second = promptWord.value;
    previousPromptWord();
    nextPromptWord();
    nextPromptWord();

    expect(promptWord.value).not.toBe(second);
  });

  it('stops at the oldest word instead of running off the end', () => {
    const { promptWord, previousPromptWord } = useWordPrompt();
    const first = promptWord.value;

    previousPromptWord();
    previousPromptWord();

    expect(promptWord.value).toBe(first);
  });
});
