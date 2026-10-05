import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';

jest.mock('@/features/analytics/analytics', () => ({
  ...jest.requireActual('@/features/analytics/analytics'),
  initAnalytics: jest.fn(() => Promise.resolve(true)),
  capture: jest.fn(),
}));
jest.mock('@/features/analytics/engagement', () => ({ trackEngagement: jest.fn() }));
jest.mock('@/features/analytics/loadTiming', () => ({ trackLoadTiming: jest.fn() }));

import { setupAnalytics } from '@/features/analytics/setupAnalytics';
import { capture, initAnalytics } from '@/features/analytics/analytics';
import { trackEngagement } from '@/features/analytics/engagement';
import { trackLoadTiming } from '@/features/analytics/loadTiming';

const makeApp = () => ({ config: {} });

describe('setupAnalytics', () => {
  let debug;
  let error;

  beforeEach(() => {
    jest.clearAllMocks();
    debug = jest.spyOn(console, 'debug').mockImplementation(() => {});
    error = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    debug.mockRestore();
    error.mockRestore();
  });

  it('is a quiet no-op without a token and host', () => {
    const app = makeApp();
    expect(() => setupAnalytics(app, { token: undefined, host: undefined })).not.toThrow();

    expect(setupAnalytics(app, { token: 'phc_test', host: '' })).toBe(false);
    expect(initAnalytics).not.toHaveBeenCalled();
    expect(trackEngagement).not.toHaveBeenCalled();
    expect(trackLoadTiming).not.toHaveBeenCalled();
    expect(app.config.errorHandler).toBeUndefined();
  });

  it('starts PostHog, engagement and load timing when configured', () => {
    const config = { token: 'phc_test', host: 'https://eu.i.posthog.com' };
    expect(setupAnalytics(makeApp(), config)).toBe(true);

    expect(initAnalytics).toHaveBeenCalledWith(config);
    expect(trackEngagement).toHaveBeenCalledWith({ capture });
    expect(trackLoadTiming).toHaveBeenCalledWith({ capture });
  });

  it('still logs errors to the console, and reports only their class name', () => {
    const app = makeApp();
    setupAnalytics(app, { token: 'phc_test', host: 'https://eu.i.posthog.com' });

    const thrown = new TypeError('Cannot read "MY NAME IS SAM"');
    app.config.errorHandler(thrown, null, 'render function');

    expect(error).toHaveBeenCalledWith(thrown);
    expect(capture).toHaveBeenCalledWith('app_error', { error_type: 'TypeError' });
  });
});
