/**
 * API integration for external services
 */
import posthog from 'posthog-js';

const posthogConfigured = Boolean(
  import.meta.env.VITE_POSTHOG_PROJECT_TOKEN && import.meta.env.VITE_POSTHOG_HOST
);

const tidbytSubmissionLogger = {
  info(message, attributes) {
    if (posthogConfigured) {
      posthog.logger.info(message, { log_source: 'tidbyt_submission', ...attributes });
    }
  },
  warn(message, attributes) {
    if (posthogConfigured) {
      posthog.logger.warn(message, { log_source: 'tidbyt_submission', ...attributes });
    }
  },
};

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

    const deliveryTarget = endpoint === NETLIFY_ENTRY_ENDPOINT ? 'netlify' : 'local_tidbyt';
    tidbytSubmissionLogger.info('tidbyt submission started', { delivery_target: deliveryTarget });

    try {
      const response = await fetch(endpoint, options);

      if (!response.ok) {
        tidbytSubmissionLogger.warn('tidbyt submission failed', {
          delivery_target: deliveryTarget,
          response_status: response.status,
        });
        console.warn('Failed to submit entry:', response.status);
        return;
      }

      tidbytSubmissionLogger.info('tidbyt submission completed', {
        delivery_target: deliveryTarget,
        response_status: response.status,
      });
    } catch (error) {
      tidbytSubmissionLogger.warn('tidbyt submission failed', {
        delivery_target: deliveryTarget,
        failure_type: 'network_error',
      });
      console.warn('Error submitting entry:', error);
    }
  };

  return {
    submitEntry,
  };
}
