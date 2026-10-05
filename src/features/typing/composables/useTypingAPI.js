/**
 * API integration for external services
 */
const LOCAL_TIDBYT_ENDPOINT = 'http://localhost:5173/api/tidbyt';
const NETLIFY_ENTRY_ENDPOINT = '/.netlify/functions/submit-entry';

export function typingEndpoint({
  hostname = window.location.hostname,
  search = window.location.search,
} = {}) {
  const isLocalSite = ['localhost', '127.0.0.1'].includes(hostname);
  if (isLocalSite) return '/api/tidbyt';

  const useLocalTidbyt = new URLSearchParams(search).get('tidbyt') === 'local';
  return useLocalTidbyt ? LOCAL_TIDBYT_ENDPOINT : NETLIFY_ENTRY_ENDPOINT;
}

export function useTypingAPI() {
  const submitEntry = async (text) => {
    const endpoint = typingEndpoint();
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    };

    // This emerging fetch option lets supporting browsers identify an
    // intentional HTTPS-to-loopback request. Browsers that do not implement
    // it ignore the extra option and fall back to their normal CORS policy.
    if (endpoint === LOCAL_TIDBYT_ENDPOINT) {
      options.targetAddressSpace = 'loopback';
    }

    try {
      const response = await fetch(endpoint, options);

      if (!response.ok) {
        console.warn('Failed to submit entry:', response.status);
      }
    } catch (error) {
      console.warn('Error submitting entry:', error);
    }
  };

  return {
    submitEntry,
  };
}
