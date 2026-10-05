import { POSTHOG_OPTIONS } from './posthogOptions';
import { sanitizeProperties } from './properties';

// Events captured while posthog-js is still downloading are held this long,
// then dropped — a slow network shouldn't grow an unbounded queue.
const MAX_QUEUED = 50;

const loadPostHog = () => import('posthog-js').then(module => module.default);

export const isAnalyticsConfigured = ({ token, host } = {}) => Boolean(token && host);

/**
 * The app's one way into PostHog. Until `init` is called with a token and a
 * host, `capture` does nothing — which is the state tests, local dev without
 * keys, and a production build without its env vars all run in.
 *
 * posthog-js is loaded on demand, so it never enters the main bundle and
 * never loads at all when analytics is unconfigured.
 */
export function createAnalytics({ loadClient = loadPostHog } = {}) {
  let state = 'idle'; // idle → loading → ready, or idle → disabled
  let client = null;
  let queue = [];

  const send = ([event, properties, options]) => client.capture(event, properties, options);

  const init = async config => {
    if (state !== 'idle') return state === 'ready';
    if (!isAnalyticsConfigured(config)) {
      state = 'disabled';
      return false;
    }

    state = 'loading';
    try {
      const posthog = await loadClient();
      posthog.init(config.token, { ...POSTHOG_OPTIONS, api_host: config.host });
      client = posthog;
      state = 'ready';
      queue.forEach(send);
      return true;
    } catch (error) {
      state = 'disabled';
      console.debug('[analytics] PostHog failed to load; analytics disabled.', error);
      return false;
    } finally {
      queue = [];
    }
  };

  const capture = (event, properties, options) => {
    if (state !== 'loading' && state !== 'ready') return;
    const args = [event, sanitizeProperties(properties), options];
    if (state === 'ready') send(args);
    else if (queue.length < MAX_QUEUED) queue.push(args);
  };

  return { init, capture };
}

const analytics = createAnalytics();

export const initAnalytics = analytics.init;
export const capture = analytics.capture;
