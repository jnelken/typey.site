/**
 * The three numbers worth knowing about a page load, in whole milliseconds from
 * navigation start. Null until the load event has finished.
 */
export function loadTimingProperties(entry) {
  if (!entry || !(entry.loadEventEnd > 0)) return null;
  const since = time => Math.round(time - entry.startTime);
  return {
    ttfb_ms: since(entry.responseStart),
    dom_content_loaded_ms: since(entry.domContentLoadedEventEnd),
    load_ms: since(entry.loadEventEnd),
  };
}

/** Capture `page_load_timing` once, after the load event has had a chance to end. */
export function trackLoadTiming({ capture, win = window } = {}) {
  const report = () => {
    const [entry] = win.performance?.getEntriesByType?.('navigation') ?? [];
    const properties = loadTimingProperties(entry);
    if (properties) capture('page_load_timing', properties);
  };
  // `loadEventEnd` is only set once every load listener has returned.
  const reportSoon = () => setTimeout(report, 0);

  if (win.document.readyState === 'complete') reportSoon();
  else win.addEventListener('load', reportSoon, { once: true });
}
