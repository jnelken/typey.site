// The only property names an analytics event may carry. Anything else is
// dropped before it reaches PostHog, so a call site can't leak what a child
// typed by adding a field — it would have to be added here, on purpose.
export const ALLOWED_PROPERTIES = Object.freeze([
  'egg',
  'setting',
  'control',
  'enabled',
  'operation',
  'modifier',
  'visible_seconds',
  'reason',
  'ttfb_ms',
  'dom_content_loaded_ms',
  'load_ms',
  'error_type',
]);

// Values are short identifiers chosen by the app, never sentences.
const SAFE_STRING = /^[A-Za-z0-9_$%+-]{1,40}$/;

const isSafeValue = value =>
  typeof value === 'boolean' ||
  (typeof value === 'number' && Number.isFinite(value)) ||
  (typeof value === 'string' && SAFE_STRING.test(value));

/** Keep only allowlisted keys whose values are booleans, numbers or short identifiers. */
export function sanitizeProperties(properties) {
  if (!properties || typeof properties !== 'object') return {};
  return Object.fromEntries(
    Object.entries(properties).filter(
      ([key, value]) => ALLOWED_PROPERTIES.includes(key) && isSafeValue(value),
    ),
  );
}
