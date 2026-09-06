import { describe, it, expect } from '@jest/globals';
import { useWordPrompt, randomPromptWord } from '@/features/typing/composables/useWordPrompt';
import { SUGGESTION_WORDS } from '@/features/typing/utils/wordSuggest';
import { emojiForWord } from '@/features/typing/utils/wordEmoji';

describe('useWordPrompt', () => {
  it('starts with a word from the emoji word library', () => {
    const { promptWord } = useWordPrompt();
    expect(SUGGESTION_WORDS).toContain(promptWord.value);
  });

  it('always pairs the word with a matching emoji', () => {
    const { promptWord, promptEmoji } = useWordPrompt();
    expect(promptEmoji.value).toBe(emojiForWord(promptWord.value));
    expect(promptEmoji.value).toBeTruthy();
  });

  it('picks a new word from the library on nextPromptWord', () => {
    const { promptWord, nextPromptWord } = useWordPrompt();
    nextPromptWord();
    expect(SUGGESTION_WORDS).toContain(promptWord.value);
  });

  it('avoids repeating the same word twice in a row', () => {
    for (let i = 0; i < 20; i++) {
      const word = randomPromptWord('mom');
      expect(word).not.toBe('mom');
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
