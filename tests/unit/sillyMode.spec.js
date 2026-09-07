import { describe, it, expect } from '@jest/globals';
import {
  SILLY_TRIGGER,
  SILLY_WORDS,
  isSillyTrigger,
  randomSillyWord,
} from '@/features/easter-eggs/utils/sillyMode';
import { COLOR_TRIGGERS } from '@/features/easter-eggs/utils/colorMode';
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

describe('SILLY_WORDS', () => {
  it('is the emoji library', () => {
    expect(SILLY_WORDS.length).toBeGreaterThan(0);
    for (const word of SILLY_WORDS) expect(EMOJI_WORDS).toContain(word);
  });

  it('leaves out the mode triggers, which send nothing and would derail a run', () => {
    for (const trigger of [SILLY_TRIGGER, ...COLOR_TRIGGERS]) {
      expect(SILLY_WORDS).not.toContain(trigger);
    }
  });

  it('is a real exclusion: "silly" and "rainbow" are dictionary words', () => {
    // If these ever leave the dictionary the filter above stops proving
    // anything, so the exclusion is only meaningful while this holds.
    expect(EMOJI_WORDS).toContain('silly');
    expect(EMOJI_WORDS).toContain('rainbow');
  });
});

describe('randomSillyWord', () => {
  it('always picks a word a run can send', () => {
    for (let i = 0; i < 50; i++) {
      expect(SILLY_WORDS).toContain(randomSillyWord());
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
