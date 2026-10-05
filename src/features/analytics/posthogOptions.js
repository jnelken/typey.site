// PostHog configuration for a children's typing app. Every option here leans
// towards collecting less: no stored identity, no person profiles, no recording,
// no autocapture (which would read element text — including the lines a child
// has typed), and nothing loaded from PostHog beyond the core SDK. The only
// events that leave the page are the ones the app captures by name through
// `analytics.js`, plus PostHog's own pageview.
//
// Two things the client cannot do and the PostHog project has to: discard IP
// addresses ("Discard client IP data"), and keep session replay off for the
// project. `disable_session_recording` keeps it off here regardless.
export const POSTHOG_OPTIONS = Object.freeze({
  // Identity lives in memory for one page load only: no cookie, no
  // localStorage, nothing that recognises a returning child.
  persistence: 'memory',
  person_profiles: 'never',
  respect_dnt: true,

  autocapture: false,
  rageclick: false,
  capture_dead_clicks: false,
  capture_heatmaps: false,
  enable_heatmaps: false,
  capture_exceptions: false,
  capture_performance: false,
  capture_pageview: true,
  capture_pageleave: false,

  disable_session_recording: true,
  session_recording: { maskAllInputs: true, maskTextSelector: '*' },
  mask_all_text: true,
  mask_all_element_attributes: true,

  // The referring page's full URL can carry another site's query string.
  save_referrer: false,
  save_campaign_params: false,
  property_denylist: ['$referrer', '$initial_referrer', '$session_entry_referrer'],

  disable_surveys: true,
  disable_product_tours: true,
  disable_conversations: true,
  disable_web_experiments: true,
  disable_external_dependency_loading: true,
});
