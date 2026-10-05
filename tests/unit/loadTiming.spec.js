import { describe, it, expect, jest, afterEach } from '@jest/globals';
import { loadTimingProperties, trackLoadTiming } from '@/features/analytics/loadTiming';

const entry = {
  startTime: 0,
  responseStart: 120.4,
  domContentLoadedEventEnd: 480.6,
  loadEventEnd: 910.2,
};

describe('loadTimingProperties', () => {
  it('rounds each milestone to whole milliseconds from navigation start', () => {
    expect(loadTimingProperties(entry)).toEqual({
      ttfb_ms: 120,
      dom_content_loaded_ms: 481,
      load_ms: 910,
    });
  });

  it('is null until the load event has ended', () => {
    expect(loadTimingProperties({ ...entry, loadEventEnd: 0 })).toBeNull();
    expect(loadTimingProperties(undefined)).toBeNull();
  });
});

describe('trackLoadTiming', () => {
  afterEach(() => jest.useRealTimers());

  const fakeWindow = readyState => {
    const win = new EventTarget();
    win.document = { readyState };
    win.performance = { getEntriesByType: jest.fn(() => [entry]) };
    return win;
  };

  it('reports straight away on a page that has already loaded', () => {
    jest.useFakeTimers();
    const capture = jest.fn();
    trackLoadTiming({ capture, win: fakeWindow('complete') });

    jest.runAllTimers();
    expect(capture).toHaveBeenCalledWith('page_load_timing', {
      ttfb_ms: 120,
      dom_content_loaded_ms: 481,
      load_ms: 910,
    });
  });

  it('waits for the load event otherwise, and reports once', () => {
    jest.useFakeTimers();
    const capture = jest.fn();
    const win = fakeWindow('loading');
    trackLoadTiming({ capture, win });

    jest.runAllTimers();
    expect(capture).not.toHaveBeenCalled();

    win.dispatchEvent(new Event('load'));
    win.dispatchEvent(new Event('load'));
    jest.runAllTimers();
    expect(capture).toHaveBeenCalledTimes(1);
  });

  it('stays quiet in a browser without navigation timing', () => {
    jest.useFakeTimers();
    const capture = jest.fn();
    const win = fakeWindow('complete');
    win.performance = undefined;
    trackLoadTiming({ capture, win });

    jest.runAllTimers();
    expect(capture).not.toHaveBeenCalled();
  });
});
