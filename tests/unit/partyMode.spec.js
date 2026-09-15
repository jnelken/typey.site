import {
  CONFETTI_COLORS,
  CONFETTI_COLOR_NAMES,
  EDGE_BURSTS_PER_SIDE,
  MIN_BURST_INTERVAL_MS,
  PARTY_TRIGGERS,
  edgeBurstPositions,
  isPartyTrigger,
  shouldBurst,
} from '@/features/party/utils/partyMode';
import { SPLAT_COLORS } from '@/features/effects/utils/screenColor';
import { SILLY_WORDS } from '@/features/easter-eggs/utils/sillyMode';

describe('isPartyTrigger', () => {
  it('matches the word on its own line, in any case, with space around it', () => {
    expect(isPartyTrigger('party')).toBe(true);
    expect(isPartyTrigger('PARTY')).toBe(true);
    expect(isPartyTrigger('  Party  ')).toBe(true);
  });

  it('does not fire mid-sentence, the way every other mode switch does not', () => {
    expect(isPartyTrigger('a party hat')).toBe(false);
    expect(isPartyTrigger('parties')).toBe(false);
    expect(isPartyTrigger('')).toBe(false);
  });

  it('ignores a non-string', () => {
    expect(isPartyTrigger(null)).toBe(false);
    expect(isPartyTrigger(42)).toBe(false);
  });
});

describe('the confetti palette', () => {
  // The whole point of naming SPLAT_COLORS keys instead of writing hexes: a
  // colour that drifted out of that map would be one screenColor.spec.js no
  // longer covers.
  it('is drawn entirely from the produce splatter palette', () => {
    const known = Object.values(SPLAT_COLORS);
    CONFETTI_COLORS.forEach(color => {
      expect(known).toContain(color);
    });
  });

  it('resolves every name it lists', () => {
    expect(CONFETTI_COLORS).toHaveLength(CONFETTI_COLOR_NAMES.length);
    CONFETTI_COLORS.forEach(color => {
      expect(color).toMatch(/^#[0-9a-f]{6}$/i);
    });
  });

  it('leaves out the two that cannot be seen as a fleck on a near-white page', () => {
    expect(CONFETTI_COLORS).not.toContain(SPLAT_COLORS.white);
    expect(CONFETTI_COLORS).not.toContain(SPLAT_COLORS.black);
  });
});

describe('shouldBurst', () => {
  it('fires the first burst, with nothing before it', () => {
    expect(shouldBurst(null, 1000)).toBe(true);
  });

  it('holds a second burst inside the interval', () => {
    expect(shouldBurst(1000, 1000 + MIN_BURST_INTERVAL_MS - 1)).toBe(false);
  });

  it('allows one exactly at the interval', () => {
    expect(shouldBurst(1000, 1000 + MIN_BURST_INTERVAL_MS)).toBe(true);
  });

  it('caps the rate under three a second, the flash ceiling', () => {
    // WCAG 2.3.1's general flash threshold is three a second; the interval has
    // to be strictly above a third of a second to stay under it.
    expect(MIN_BURST_INTERVAL_MS).toBeGreaterThan(1000 / 3);
  });

  it('ignores a clock it cannot read', () => {
    expect(shouldBurst(1000, undefined)).toBe(false);
    expect(shouldBurst(1000, Number.NaN)).toBe(false);
  });
});

describe('edgeBurstPositions', () => {
  it('puts the same number down each edge', () => {
    const positions = edgeBurstPositions();
    expect(positions).toHaveLength(EDGE_BURSTS_PER_SIDE * 2);
    expect(positions.filter(p => p.side === 'left')).toHaveLength(EDGE_BURSTS_PER_SIDE);
    expect(positions.filter(p => p.side === 'right')).toHaveLength(EDGE_BURSTS_PER_SIDE);
  });

  it('insets from both ends so nothing fires half off-screen', () => {
    edgeBurstPositions().forEach(({ top }) => {
      expect(top).toBeGreaterThan(0);
      expect(top).toBeLessThan(1);
    });
  });

  it('spaces them evenly — three a side lands on quarters', () => {
    expect(edgeBurstPositions(3).filter(p => p.side === 'left').map(p => p.top)).toEqual([
      0.25, 0.5, 0.75,
    ]);
  });

  it('pairs each left with a right at the same height', () => {
    const positions = edgeBurstPositions(2);
    expect(positions.map(p => p.side)).toEqual(['left', 'right', 'left', 'right']);
    expect(positions[0].top).toBe(positions[1].top);
  });

  it('returns nothing for a count that makes no sense', () => {
    expect(edgeBurstPositions(0)).toEqual([]);
    expect(edgeBurstPositions(-1)).toEqual([]);
    expect(edgeBurstPositions(1.5)).toEqual([]);
  });
});

describe('the trigger word and the silly run', () => {
  // A trigger returns early from the send handler and plays no animation, so a
  // silly run that sent "party" would both waste a word and start a party.
  it('is never one of the words a silly run can send', () => {
    PARTY_TRIGGERS.forEach(trigger => {
      expect(SILLY_WORDS).not.toContain(trigger);
    });
  });
});
