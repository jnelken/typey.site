import { capture, initAnalytics, isAnalyticsConfigured } from './analytics';
import { trackEngagement } from './engagement';
import { trackLoadTiming } from './loadTiming';

/**
 * Turn analytics on for the app, or quietly leave it off when the PostHog
 * token or host is missing. Never throws: a build without keys is a normal
 * build, not a broken one.
 */
export function setupAnalytics(app, config) {
  if (!isAnalyticsConfigured(config)) {
    console.debug('[analytics] PostHog is not configured; analytics is off.');
    return false;
  }

  void initAnalytics(config);
  trackEngagement({ capture });
  trackLoadTiming({ capture });

  // Only the error's class name goes out. Messages and stacks can quote the
  // values involved, and on this page those values are what a child typed.
  app.config.errorHandler = error => {
    console.error(error);
    capture('app_error', { error_type: error?.name || 'unknown' });
  };

  return true;
}
