import { describe, it, expect } from '@jest/globals';
import {
  promptLetterStates,
  typedLetterStates,
  isAttemptingPrompt,
} from '@/features/typing/utils/spelling';

describe('promptLetterStates', () => {
  it('lights up the letters spelled so far and leaves the rest waiting', () => {
    expect(promptLetterStates('coo', 'cookie')).toEqual([
      'right', 'right', 'right', 'untyped', 'untyped', 'untyped',
    ]);
  });

  it('marks the letter that went wrong', () => {
    expect(promptLetterStates('cak', 'cat')).toEqual(['right', 'right', 'wrong']);
  });

  it('marks only the first mismatch, and goes quiet after it', () => {
    // Once the spelling has parted company with the word the letters no longer
    // line up, so there is nothing honest to say about the rest.
    expect(promptLetterStates('cxt', 'cat')).toEqual(['right', 'wrong', 'untyped']);
    expect(promptLetterStates('cxx', 'cat')).toEqual(['right', 'wrong', 'untyped']);
    expect(promptLetterStates('coxxie', 'cookie')).toEqual([
      'right', 'right', 'wrong', 'untyped', 'untyped', 'untyped',
    ]);
  });

  it('stays quiet when the first letter is a different word entirely', () => {
    expect(promptLetterStates('dog', 'cat')).toEqual(['untyped', 'untyped', 'untyped']);
    expect(promptLetterStates('d', 'cat')).toEqual(['untyped', 'untyped', 'untyped']);
  });

  it('ignores case, since caps lock changes what a keystroke produces', () => {
    expect(promptLetterStates('CAT', 'cat')).toEqual(['right', 'right', 'right']);
  });

  it('says nothing about a word not started yet', () => {
    expect(promptLetterStates('', 'cat')).toEqual(['untyped', 'untyped', 'untyped']);
  });

  it('handles a prompt that is a number or an amount', () => {
    expect(promptLetterStates('$5', '$5')).toEqual(['right', 'right']);
    expect(promptLetterStates('1', '12')).toEqual(['right', 'untyped']);
  });
});

describe('isAttemptingPrompt', () => {
  it('recognises a partial spelling of the word', () => {
    expect(isAttemptingPrompt('coo', 'cookie')).toBe(true);
    expect(isAttemptingPrompt('cookie', 'cookie')).toBe(true);
  });

  it('recognises a wrong letter as still an attempt', () => {
    expect(isAttemptingPrompt('cak', 'cat')).toBe(true);
  });

  it('leaves an unrelated line alone', () => {
    expect(isAttemptingPrompt('dinosaur', 'cookie')).toBe(false);
    expect(isAttemptingPrompt('i love dinosaurs', 'cookie')).toBe(false);
  });

  it('leaves a line longer than the word alone', () => {
    expect(isAttemptingPrompt('cookies please', 'cookie')).toBe(false);
  });

  it('has nothing to say about an empty line', () => {
    expect(isAttemptingPrompt('', 'cookie')).toBe(false);
    expect(isAttemptingPrompt('cookie', '')).toBe(false);
  });
});

describe('typedLetterStates', () => {
  it('colours the letters the child has actually typed', () => {
    expect(typedLetterStates('cak', 'cat')).toEqual(['right', 'right', 'wrong']);
  });

  it('colours only the first mismatch, leaving the tail neutral', () => {
    expect(typedLetterStates('cxt', 'cat')).toEqual(['right', 'wrong', 'untyped']);
    expect(typedLetterStates('coxxi', 'cookie')).toEqual([
      'right', 'right', 'wrong', 'untyped', 'untyped',
    ]);
  });

  it('says nothing at all when the first letter is wrong', () => {
    expect(typedLetterStates('dog', 'cat')).toBeNull();
  });

  it('returns null when the line is not an attempt at the word', () => {
    expect(typedLetterStates('dinosaur', 'cookie')).toBeNull();
  });

  it('stays aligned when the child types a leading space', () => {
    expect(typedLetterStates(' ca', 'cat')).toEqual(['untyped', 'right', 'right']);
  });
});
