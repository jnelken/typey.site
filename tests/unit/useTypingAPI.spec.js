import { describe, it, expect } from '@jest/globals';
import { typingEndpoint } from '@/features/typing/composables/useTypingAPI';

describe('useTypingAPI', () => {
  it('uses the same-origin bridge on the local site', () => {
    expect(typingEndpoint({ hostname: 'localhost', search: '' })).toBe('/api/tidbyt');
    expect(typingEndpoint({ hostname: '127.0.0.1', search: '' })).toBe('/api/tidbyt');
  });

  it('uses the existing endpoint for ordinary production visitors', () => {
    expect(typingEndpoint({ hostname: 'typey.site', search: '' }))
      .toBe('/.netlify/functions/submit-entry');
  });

  it('uses the local bridge when production explicitly opts in', () => {
    expect(typingEndpoint({ hostname: 'typey.site', search: '?tidbyt=local' }))
      .toBe('http://localhost:5173/api/tidbyt');
  });

  it('does not enable localhost for unrelated query values', () => {
    expect(typingEndpoint({ hostname: 'typey.site', search: '?tidbyt=cloud' }))
      .toBe('/.netlify/functions/submit-entry');
  });
});
