/** A stopwatch that only runs while started, and hands back what it has counted. */
export function createVisibleTimer(now = () => Date.now()) {
  let startedAt = null;
  let elapsed = 0;

  const pause = () => {
    if (startedAt === null) return;
    elapsed += now() - startedAt;
    startedAt = null;
  };

  return {
    start() {
      if (startedAt === null) startedAt = now();
    },
    pause,
    /** Stop the clock and return the milliseconds counted since the last take. */
    take() {
      pause();
      const counted = elapsed;
      elapsed = 0;
      return counted;
    },
  };
}

/**
 * Time on the typing page, counted only while the tab is visible. Each time the
 * page is hidden or unloaded, the visible stretch since the last report goes out
 * as `page_engagement`. Sent by beacon, since the page may be going away.
 */
export function trackEngagement({ capture, doc = document, win = window, now } = {}) {
  const timer = createVisibleTimer(now);
  if (doc.visibilityState === 'visible') timer.start();

  const report = reason => {
    const seconds = Math.round(timer.take() / 1000);
    if (seconds < 1) return;
    capture('page_engagement', { visible_seconds: seconds, reason }, { transport: 'sendBeacon' });
  };

  const onVisibilityChange = () => {
    if (doc.visibilityState === 'hidden') report('hidden');
    else timer.start();
  };
  const onPageHide = () => report('pagehide');
  const onPageShow = () => {
    if (doc.visibilityState === 'visible') timer.start();
  };

  doc.addEventListener('visibilitychange', onVisibilityChange);
  win.addEventListener('pagehide', onPageHide);
  win.addEventListener('pageshow', onPageShow);

  return () => {
    doc.removeEventListener('visibilitychange', onVisibilityChange);
    win.removeEventListener('pagehide', onPageHide);
    win.removeEventListener('pageshow', onPageShow);
  };
}
