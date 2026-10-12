import { describe, it, expect } from '@jest/globals';
import { typingEndpoint } from '@/features/typing/composables/useTypingAPI';

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
