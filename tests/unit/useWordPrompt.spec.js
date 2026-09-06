import { describe, it, expect } from '@jest/globals';
import { useWordPrompt, randomPromptWord } from '@/features/typing/composables/useWordPrompt';
import { SUGGESTION_WORDS } from '@/features/typing/utils/wordSuggest';

describe('useWordPrompt', () => {
  it('starts with a word from the emoji word library', () => {
    const { promptWord } = useWordPrompt();
    expect(SUGGESTION_WORDS).toContain(promptWord.value);
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
