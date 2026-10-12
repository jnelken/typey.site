import { describe, it, expect, afterEach, jest } from '@jest/globals';
import { typingEndpoint, useTypingAPI } from '@/features/typing/composables/useTypingAPI';
import { WORD_EMOJI } from '@/features/typing/utils/wordEmoji';

describe('useTypingAPI', () => {
  it('uses the same-origin bridge on the local site', () => {
    expect(typingEndpoint({ hostname: 'localhost', search: '' })).toBe('/api/tidbyt');
    expect(typingEndpoint({ hostname: '127.0.0.1', search: '' })).toBe('/api/tidbyt');
  });

  it('uses the existing endpoint for ordinary production visitors', () => {
    expect(typingEndpoint({ hostname: 'typey.site', protocol: 'https:', search: '' }))
      .toBe('/.netlify/functions/submit-entry');
  });

  it('uses the local bridge when production explicitly opts in', () => {
    expect(typingEndpoint({ hostname: 'typey.site', protocol: 'https:', search: '?tidbyt=local' }))
      .toBe('http://localhost:8173/api/tidbyt');
  });

  it('uses the same-origin bridge when the dev server is opened over plain HTTP on the wifi', () => {
    expect(typingEndpoint({ hostname: '192.168.1.201', protocol: 'http:', search: '' }))
      .toBe('/api/tidbyt');
  });

  it('does not enable localhost for unrelated query values', () => {
    expect(typingEndpoint({ hostname: 'typey.site', protocol: 'https:', search: '?tidbyt=cloud' }))
      .toBe('/.netlify/functions/submit-entry');
  });
});

describe('submitEntry', () => {
  const originalFetch = globalThis.fetch;
  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  // The JSON body the line was sent with.
  const sentBody = async text => {
    const fetchMock = jest.fn(async () => ({ ok: true, status: 202 }));
    globalThis.fetch = fetchMock;
    await useTypingAPI().submitEntry(text);
    return JSON.parse(fetchMock.mock.calls[0][1].body);
  };

  it('sends the line with the picture for each of its words', async () => {
    expect(await sentBody('moon zzzz')).toEqual({ text: 'moon zzzz', emojis: { moon: WORD_EMOJI.moon } });
  });

  it('sends only the text when no word has a picture', async () => {
    expect(await sentBody('zzzz')).toEqual({ text: 'zzzz' });
  });
});
