import { describe, it, expect, jest } from '@jest/globals';
import { useEasterEggs } from '@/features/easter-eggs/composables/useEasterEggs';

// The count the money egg spawned for a line, or null if it never fired.
const billsFor = text => {
  const spawnEmojis = jest.fn();
  const { evaluateEasterEggs } = useEasterEggs({ spawnBalloons: jest.fn() });
  evaluateEasterEggs(text, spawnEmojis);

  const call = spawnEmojis.mock.calls.find(
    ([, , options]) => options?.emojiSet?.includes('💵'),
  );
  return call ? call[1] : null;
};

describe('money rain', () => {
  it('rains one bill per dollar typed', () => {
    expect(billsFor('$5')).toBe(5);
    expect(billsFor('$1')).toBe(1);
    expect(billsFor('$12')).toBe(12);
  });

  it('counts the amount with the sign written after the number', () => {
    expect(billsFor('5$')).toBe(5);
  });

  it('counts the amount with a space around the sign', () => {
    expect(billsFor('$ 7')).toBe(7);
  });

  it('reads the dollars out of a longer line', () => {
    expect(billsFor('i want $3 please')).toBe(3);
  });

  it('takes the whole number of a big amount', () => {
    expect(billsFor('$100')).toBe(100);
  });

  it('takes the dollars before the cents', () => {
    expect(billsFor('$4.50')).toBe(4);
  });

  it('does not rain money without a number', () => {
    expect(billsFor('$')).toBeNull();
  });

  it('does not rain money without a dollar sign', () => {
    expect(billsFor('5')).toBeNull();
  });
});
