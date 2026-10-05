import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { createVisibleTimer, trackEngagement } from '@/features/analytics/engagement';

describe('createVisibleTimer', () => {
  it('counts only while started', () => {
    let time = 0;
    const timer = createVisibleTimer(() => time);

    timer.start();
    time = 3000;
    timer.pause();
    time = 10000; // paused: not counted
    timer.start();
    time = 12000;

    expect(timer.take()).toBe(5000);
  });

  it('resets after each take', () => {
    let time = 0;
    const timer = createVisibleTimer(() => time);
    timer.start();
    time = 1000;
    expect(timer.take()).toBe(1000);
    time = 5000;
    expect(timer.take()).toBe(0);
  });

  it('ignores a second start while already running', () => {
    let time = 0;
    const timer = createVisibleTimer(() => time);
    timer.start();
    time = 2000;
    timer.start();
    time = 4000;
    expect(timer.take()).toBe(4000);
  });
});

describe('trackEngagement', () => {
  let time;
  let doc;
  let win;
  let capture;
  let stop;

  const setVisibility = state => {
    doc.visibilityState = state;
    doc.dispatchEvent(new Event('visibilitychange'));
  };

  beforeEach(() => {
    time = 0;
    doc = new EventTarget();
    doc.visibilityState = 'visible';
    win = new EventTarget();
    capture = jest.fn();
    stop?.();
    stop = trackEngagement({ capture, doc, win, now: () => time });
  });

  it('reports visible time when the page is hidden, by beacon', () => {
    time = 42400;
    setVisibility('hidden');

    expect(capture).toHaveBeenCalledWith(
      'page_engagement',
      { visible_seconds: 42, reason: 'hidden' },
      { transport: 'sendBeacon' },
    );
  });

  it('does not count time spent hidden', () => {
    time = 10000;
    setVisibility('hidden');
    time = 70000;
    setVisibility('visible');
    time = 75000;
    win.dispatchEvent(new Event('pagehide'));

    expect(capture).toHaveBeenLastCalledWith(
      'page_engagement',
      { visible_seconds: 5, reason: 'pagehide' },
      { transport: 'sendBeacon' },
    );
  });

  it('does not report the same stretch twice when hide is followed by pagehide', () => {
    time = 8000;
    setVisibility('hidden');
    win.dispatchEvent(new Event('pagehide'));

    expect(capture).toHaveBeenCalledTimes(1);
  });

  it('skips stretches under a second', () => {
    time = 400;
    setVisibility('hidden');
    expect(capture).not.toHaveBeenCalled();
  });

  it('does not start counting for a page that loads in the background', () => {
    stop();
    doc.visibilityState = 'hidden';
    stop = trackEngagement({ capture, doc, win, now: () => time });

    time = 30000;
    win.dispatchEvent(new Event('pagehide'));
    expect(capture).not.toHaveBeenCalled();
  });

  it('starts counting again when a page comes back from the back-forward cache', () => {
    time = 2000;
    win.dispatchEvent(new Event('pagehide'));
    time = 50000;
    win.dispatchEvent(new Event('pageshow'));
    time = 53000;
    setVisibility('hidden');

    expect(capture).toHaveBeenLastCalledWith(
      'page_engagement',
      { visible_seconds: 3, reason: 'hidden' },
      { transport: 'sendBeacon' },
    );
  });

  it('stops listening when torn down', () => {
    stop();
    time = 20000;
    setVisibility('hidden');
    expect(capture).not.toHaveBeenCalled();
  });
});
