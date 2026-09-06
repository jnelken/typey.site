import { describe, it, expect } from '@jest/globals';
import {
  SILLY_TRIGGER,
  isSillyTrigger,
  appendSillyWord,
  randomSillyWord,
} from '@/features/easter-eggs/utils/sillyMode';
import { EMOJI_WORDS } from '@/features/typing/utils/wordEmoji';

describe('isSillyTrigger', () => {
  it('matches the trigger word on its own, whatever the case or spacing', () => {
    expect(isSillyTrigger('silly')).toBe(true);
    expect(isSillyTrigger('SILLY')).toBe(true);
    expect(isSillyTrigger('  Silly  ')).toBe(true);
  });

  it('does not match the word inside a longer line', () => {
    expect(isSillyTrigger('you are silly')).toBe(false);
    expect(isSillyTrigger('sillyness')).toBe(false);
  });

  it('handles non-strings', () => {
    expect(isSillyTrigger(null)).toBe(false);
    expect(isSillyTrigger(undefined)).toBe(false);
    expect(isSillyTrigger(42)).toBe(false);
  });

  it('exports the trigger it matches', () => {
    expect(isSillyTrigger(SILLY_TRIGGER)).toBe(true);
  });
});

describe('appendSillyWord', () => {
  it('starts an empty line without a leading space', () => {
    expect(appendSillyWord('', 'lion')).toBe('lion');
  });

  it('separates words with a single space', () => {
    expect(appendSillyWord('lion', 'pizza')).toBe('lion pizza');
  });

  it('does not double the space when the line already ends in one', () => {
    expect(appendSillyWord('lion ', 'pizza')).toBe('lion pizza');
  });

  it('leaves the line alone when there is no word to add', () => {
    expect(appendSillyWord('lion', '')).toBe('lion');
    expect(appendSillyWord('lion', null)).toBe('lion');
  });

  it('treats a missing line as empty', () => {
    expect(appendSillyWord(undefined, 'lion')).toBe('lion');
  });
});

describe('randomSillyWord', () => {
  it('always picks a word from the emoji library', () => {
    for (let i = 0; i < 50; i++) {
      expect(EMOJI_WORDS).toContain(randomSillyWord());
    }
  });

  it('never repeats the word just used', () => {
    let previous = randomSillyWord();
    for (let i = 0; i < 50; i++) {
      const word = randomSillyWord(previous);
      expect(word).not.toBe(previous);
      previous = word;
    }
  });
});
