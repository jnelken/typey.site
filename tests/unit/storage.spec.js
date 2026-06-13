import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { loadSetting, saveSetting } from '@/utils/storage';

describe('storage', () => {
  beforeEach(() => localStorage.clear());

  it('returns the fallback when nothing is stored', () => {
    expect(loadSetting('sound', true)).toBe(true);
    expect(loadSetting('missing', false)).toBe(false);
  });

  it('round-trips a saved value', () => {
    saveSetting('sound', false);
    expect(loadSetting('sound', true)).toBe(false);
  });

  it('persists non-boolean values too', () => {
    saveSetting('rate', 0.8);
    expect(loadSetting('rate', 1)).toBe(0.8);
  });

  it('returns the fallback for corrupt JSON', () => {
    localStorage.setItem('typey:sound', 'not-json');
    expect(loadSetting('sound', true)).toBe(true);
  });

  it('namespaces keys with a prefix', () => {
    saveSetting('caps', true);
    expect(localStorage.getItem('typey:caps')).toBe('true');
  });

  describe('when localStorage throws', () => {
    let getSpy;
    let setSpy;

    beforeEach(() => {
      getSpy = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('denied');
      });
      setSpy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('denied');
      });
    });

    afterEach(() => {
      getSpy.mockRestore();
      setSpy.mockRestore();
    });

    it('loadSetting falls back instead of throwing', () => {
      expect(() => loadSetting('sound', true)).not.toThrow();
      expect(loadSetting('sound', true)).toBe(true);
    });

    it('saveSetting swallows the error', () => {
      expect(() => saveSetting('sound', false)).not.toThrow();
    });
  });
});
