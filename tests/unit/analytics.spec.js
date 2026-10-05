import { describe, it, expect, jest } from '@jest/globals';
import { createAnalytics, isAnalyticsConfigured } from '@/features/analytics/analytics';
import { POSTHOG_OPTIONS, scrubPostHogEvent } from '@/features/analytics/posthogOptions';

const config = { token: 'phc_test', host: 'https://eu.i.posthog.com' };

const fakePostHog = () => ({ init: jest.fn(), capture: jest.fn() });

describe('isAnalyticsConfigured', () => {
  it('needs both a token and a host', () => {
    expect(isAnalyticsConfigured(config)).toBe(true);
    expect(isAnalyticsConfigured({ token: 'phc_test' })).toBe(false);
    expect(isAnalyticsConfigured({ host: config.host })).toBe(false);
    expect(isAnalyticsConfigured({ token: '', host: '' })).toBe(false);
    expect(isAnalyticsConfigured()).toBe(false);
  });
});

describe('createAnalytics', () => {
  it('does nothing before init', () => {
    const loadClient = jest.fn();
    const analytics = createAnalytics({ loadClient });
    expect(() => analytics.capture('setting_changed', { setting: 'sound' })).not.toThrow();
    expect(loadClient).not.toHaveBeenCalled();
  });

  it('stays off, and never loads posthog-js, when unconfigured', async () => {
    const loadClient = jest.fn();
    const analytics = createAnalytics({ loadClient });

    await expect(analytics.init({ token: undefined, host: undefined })).resolves.toBe(false);
    analytics.capture('setting_changed', { setting: 'sound' });

    expect(loadClient).not.toHaveBeenCalled();
  });

  it('initialises PostHog with the privacy options and the configured host', async () => {
    const posthog = fakePostHog();
    const analytics = createAnalytics({ loadClient: async () => posthog });

    await expect(analytics.init(config)).resolves.toBe(true);

    expect(posthog.init).toHaveBeenCalledWith('phc_test', {
      ...POSTHOG_OPTIONS,
      api_host: 'https://eu.i.posthog.com',
    });
  });

  it('forwards captures, with their options, once ready', async () => {
    const posthog = fakePostHog();
    const analytics = createAnalytics({ loadClient: async () => posthog });
    await analytics.init(config);

    analytics.capture('page_engagement', { visible_seconds: 12 }, { transport: 'sendBeacon' });

    expect(posthog.capture).toHaveBeenCalledWith(
      'page_engagement',
      { visible_seconds: 12 },
      { transport: 'sendBeacon' },
    );
  });

  it('holds captures made while posthog-js loads and sends them in order', async () => {
    const posthog = fakePostHog();
    let finishLoading;
    const analytics = createAnalytics({
      loadClient: () => new Promise(resolve => (finishLoading = () => resolve(posthog))),
    });

    const ready = analytics.init(config);
    analytics.capture('control_used', { control: 'settings' });
    analytics.capture('control_used', { control: 'word_guide' });
    expect(posthog.capture).not.toHaveBeenCalled();

    finishLoading();
    await ready;

    expect(posthog.capture.mock.calls.map(([, props]) => props.control)).toEqual([
      'settings',
      'word_guide',
    ]);
  });

  it('never sends a property outside the allowlist, whatever the call site passes', async () => {
    const posthog = fakePostHog();
    const analytics = createAnalytics({ loadClient: async () => posthog });
    await analytics.init(config);

    analytics.capture('easter_egg_triggered', {
      egg: 'math',
      text: 'MY NAME IS SAM',
      result: 5,
      percent: 50,
    });

    expect(posthog.capture).toHaveBeenCalledWith('easter_egg_triggered', { egg: 'math' }, undefined);
  });

  it('turns itself off if posthog-js fails to load', async () => {
    const debug = jest.spyOn(console, 'debug').mockImplementation(() => {});
    const analytics = createAnalytics({ loadClient: () => Promise.reject(new Error('offline')) });

    await expect(analytics.init(config)).resolves.toBe(false);
    expect(() => analytics.capture('control_used', { control: 'settings' })).not.toThrow();
    debug.mockRestore();
  });

  it('initialises only once', async () => {
    const posthog = fakePostHog();
    const analytics = createAnalytics({ loadClient: async () => posthog });

    await analytics.init(config);
    await analytics.init(config);

    expect(posthog.init).toHaveBeenCalledTimes(1);
  });
});

describe('scrubPostHogEvent', () => {
  const pageview = {
    uuid: 'u1',
    event: '$pageview',
    properties: {
      $current_url: 'https://typey.site/?tidbyt=local#top',
      $session_entry_url: 'https://typey.site/?name=sam',
      $pathname: '/',
      $browser: 'Chrome',
      $raw_user_agent: 'Mozilla/5.0 (Macintosh) Chrome/141',
      egg: 'party',
    },
    $set: { $current_url: 'https://typey.site/?tidbyt=local' },
    $set_once: { $initial_current_url: 'https://typey.site/?name=sam' },
  };

  it('strips query strings and hashes from every URL property', () => {
    const { properties } = scrubPostHogEvent(pageview);
    expect(properties.$current_url).toBe('https://typey.site/');
    expect(properties.$session_entry_url).toBe('https://typey.site/');
  });

  it('drops the raw user agent but keeps the parsed browser and app properties', () => {
    const { properties } = scrubPostHogEvent(pageview);
    expect(properties).not.toHaveProperty('$raw_user_agent');
    expect(properties).toMatchObject({ $browser: 'Chrome', $pathname: '/', egg: 'party' });
  });

  it('never sets person properties', () => {
    const scrubbed = scrubPostHogEvent(pageview);
    expect(scrubbed).not.toHaveProperty('$set');
    expect(scrubbed).not.toHaveProperty('$set_once');
    expect(scrubbed).toMatchObject({ uuid: 'u1', event: '$pageview' });
  });

  it('passes a dropped event through as dropped', () => {
    expect(scrubPostHogEvent(null)).toBeNull();
  });
});

describe('POSTHOG_OPTIONS', () => {
  it('keeps identity anonymous and per page load', () => {
    expect(POSTHOG_OPTIONS.persistence).toBe('memory');
    expect(POSTHOG_OPTIONS.person_profiles).toBe('never');
    expect(POSTHOG_OPTIONS.respect_dnt).toBe(true);
  });

  it('never records sessions or reads what is on the page', () => {
    expect(POSTHOG_OPTIONS.disable_session_recording).toBe(true);
    expect(POSTHOG_OPTIONS.autocapture).toBe(false);
    expect(POSTHOG_OPTIONS.rageclick).toBe(false);
    expect(POSTHOG_OPTIONS.capture_heatmaps).toBe(false);
    expect(POSTHOG_OPTIONS.capture_exceptions).toBe(false);
    expect(POSTHOG_OPTIONS.session_recording.maskAllInputs).toBe(true);
    expect(POSTHOG_OPTIONS.mask_all_text).toBe(true);
  });

  it('keeps referring pages out of every event', () => {
    expect(POSTHOG_OPTIONS.property_denylist).toEqual(
      expect.arrayContaining(['$referrer', '$initial_referrer', '$session_entry_referrer']),
    );
  });

  it('scrubs every outgoing event, the SDK’s own included', () => {
    expect(POSTHOG_OPTIONS.before_send).toBe(scrubPostHogEvent);
  });

  it('loads nothing from PostHog beyond the core SDK', () => {
    expect(POSTHOG_OPTIONS.disable_external_dependency_loading).toBe(true);
    expect(POSTHOG_OPTIONS.disable_surveys).toBe(true);
  });
});
