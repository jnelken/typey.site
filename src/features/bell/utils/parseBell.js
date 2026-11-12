// Pure utility: parse "<quarter-hour time> bell" the way a child types it.
// Returns { hour (1-12), minute (0|15|30|45), label } or null. Strict: the
// whole trimmed line must be the time plus the word "bell", so sentences and
// other times ("1:20 bell") fall through to normal behaviour.

const QUARTERS = new Set([0, 15, 30, 45]);

// 1:15pm | 1:15 pm | 1pm | 1 o clock | 1 o'clock | 1 oclock | 1 | 13:00
const PATTERN =
  /^(\d{1,2})(?::(\d{2}))?\s*(?:(am|pm)|(?:o['’]?\s?clock))?\s+bell$/i;

export function parseBell(input) {
  if (typeof input !== 'string') return null;

  const match = input.trim().match(PATTERN);
  if (!match) return null;

  const [, rawHour, rawMinute, meridiem] = match;
  const isOClock = /o['’]?\s?clock/i.test(input);
  const hour = parseInt(rawHour, 10);
  const minute = rawMinute === undefined ? 0 : parseInt(rawMinute, 10);

  if (!QUARTERS.has(minute)) return null;
  // "1:15 o clock" is not a thing; o'clock means on the hour.
  if (isOClock && rawMinute !== undefined) return null;

  let hour12;
  if (meridiem) {
    if (hour < 1 || hour > 12) return null; // 0pm, 13pm
    hour12 = hour;
  } else if (hour >= 0 && hour <= 24) {
    hour12 = hour % 12 || 12; // 24-hour clock; 0 and 24 are midnight
  } else {
    return null;
  }

  if (hour === 24 && minute !== 0) return null;

  return { hour: hour12, minute, label: formatLabel(hour12, minute) };
}

function formatLabel(hour, minute) {
  return minute === 0 ? `${hour} o'clock` : `${hour}:${String(minute).padStart(2, '0')}`;
}
