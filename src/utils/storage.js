// Tiny, crash-proof wrapper around localStorage for user settings.
// All keys are namespaced; any storage error (private mode, quota, bad JSON)
// falls back gracefully so the app never breaks because of persistence.

const PREFIX = 'typey:';

export function loadSetting(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw === null || raw === undefined) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function saveSetting(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Ignore write failures (e.g. storage disabled or full).
  }
}
