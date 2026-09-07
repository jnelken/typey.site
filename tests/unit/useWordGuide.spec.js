import { describe, it, expect } from '@jest/globals';
import { useWordGuide, SECRET_WORDS } from '@/features/typing/composables/useWordGuide';
import { EMOJI_WORDS } from '@/features/typing/utils/wordEmoji';

describe('useWordGuide', () => {
  it('shows the whole dictionary, not a hand-written shortlist', () => {
    const guide = useWordGuide();
    expect(guide.guideWordCount.value).toBe(EMOJI_WORDS.length);
  });

  it('groups the words the way the dictionary groups them', () => {
    const guide = useWordGuide();
    const animals = guide.guideGroups.value.find(g => g.category === 'animal');

    expect(animals.label).toBe('Animals');
    expect(animals.items.map(item => item.word)).toContain('giraffe');
    expect(animals.items.find(item => item.word === 'giraffe').emoji).toBe('🦒');
  });

  it('filters to the words a search matches, and drops the empty groups', () => {
    const guide = useWordGuide();
    guide.guideFilter.value = 'cook';

    const words = guide.guideGroups.value.flatMap(g => g.items.map(i => i.word));
    expect(words).toEqual(expect.arrayContaining(['cook', 'cookie']));
    expect(guide.guideGroups.value.every(group => group.items.length > 0)).toBe(true);
  });

  it('finds nothing for a search that matches nothing', () => {
    const guide = useWordGuide();
    guide.guideFilter.value = 'qqqzzz';
    expect(guide.guideWordCount.value).toBe(0);
  });

  it('clears a stale filter when the guide is closed', () => {
    const guide = useWordGuide();
    guide.toggle(true);
    guide.guideFilter.value = 'cook';
    guide.toggle(false);

    expect(guide.guideFilter.value).toBe('');
    expect(guide.guideWordCount.value).toBe(EMOJI_WORDS.length);
  });

  it('lists the secrets that are not words, so they can be found again', () => {
    const guide = useWordGuide();
    const words = guide.guideSecrets.value.map(s => s.word);

    expect(words).toEqual(expect.arrayContaining(['$5', 'silly', 'color', 'qwerty']));
    expect(guide.guideSecrets.value.every(s => s.description)).toBe(true);
  });

  it('lists every typed trigger, including the ones that share an effect', () => {
    const guide = useWordGuide();
    const words = guide.guideSecrets.value.map(s => s.word);

    expect(words).toEqual(
      expect.arrayContaining(['color', 'rainbow', 'red', '$5', '2 + 3', 'silly', 'qwerty']),
    );
  });

  it('shows the secrets alone when opened from settings', () => {
    const guide = useWordGuide();
    guide.openSecrets();

    expect(guide.guideVisible.value).toBe(true);
    expect(guide.guideSecretsOnly.value).toBe(true);
    expect(guide.guideGroups.value).toEqual([]);
    expect(guide.guideWordCount.value).toBe(0);
    expect(guide.guideSecrets.value.length).toBe(SECRET_WORDS.length);
  });

  it('drops a stale filter when settings opens the secrets', () => {
    const guide = useWordGuide();
    guide.guideFilter.value = 'cook';
    guide.openSecrets();

    expect(guide.guideFilter.value).toBe('');
  });

  it('gives the dictionary back the next time the guide opens in full', () => {
    const guide = useWordGuide();
    guide.openSecrets();
    guide.toggle(false);
    guide.toggle(true);

    expect(guide.guideSecretsOnly.value).toBe(false);
    expect(guide.guideWordCount.value).toBe(EMOJI_WORDS.length);
  });

  it('searches the secrets alongside the dictionary', () => {
    const guide = useWordGuide();
    guide.guideFilter.value = 'sill';

    expect(guide.guideSecrets.value.map(s => s.word)).toEqual(['silly']);

    guide.guideFilter.value = 'qqqzzz';
    expect(guide.guideSecrets.value).toEqual([]);
  });

  it('remembers which words have been discovered, whatever their case', () => {
    const guide = useWordGuide();
    expect(guide.isDiscovered('cookie')).toBe(false);

    guide.revealForWord('COOKIE');

    expect(guide.isDiscovered('cookie')).toBe(true);
    expect(guide.isDiscovered('cake')).toBe(false);
  });
});
