import { describe, it, expect } from '@jest/globals';
import { parseBell } from '@/features/bell/utils/parseBell';

describe('parseBell', () => {
  it.each([
    ['1:15pm bell', 1, 15],
    ['1 o clock bell', 1, 0],
    ['1pm bell', 1, 0],
    ["1 o'clock bell", 1, 0],
    ['1 oclock bell', 1, 0],
    ['1:30 bell', 1, 30],
    ['2:45 pm bell', 2, 45],
    ['12:00 bell', 12, 0],
    ['12am bell', 12, 0],
    ['12:30am bell', 12, 30],
    ['  3PM BELL  ', 3, 0],
    ['13:00 bell', 1, 0],
    ['0:15 bell', 12, 15],
    ['24:00 bell', 12, 0],
  ])('%s', (text, hour, minute) => {
    expect(parseBell(text)).toMatchObject({ hour, minute });
  });

  it.each([
    'bell', '1:20 bell', '1:15', '1pm', '13pm bell', '0pm bell', '25 bell',
    '24:15 bell', '1:15 o clock bell', 'ring the bell', '1:15pm belly',
    '1:5 bell', '1.15 bell', '3 bell', '1 bell', '', '   ', null, undefined, 5,
  ])('rejects %p', text => {
    expect(parseBell(text)).toBeNull();
  });
});
