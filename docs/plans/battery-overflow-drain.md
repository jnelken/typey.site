# Battery overflow drain

> **Suggested execution:** Sonnet with medium reasoning — this is a focused state change with existing regression coverage. Step up to Opus for broader input-event redesign; step down to Haiku for documentation-only changes.

## Status
Complete.

## Decisions
- Remove the overflow lock at the user's request while retaining the million-percent cap and falling-number effect.

## Findings
- Charges above one million were marked locked, preventing drain, bolts, and Escape from clearing them.
- Ordinary overcharges spend 100 charge per printable keystroke and strike on roughly one in five attempts.

## Open threads
- [x] Verified overflow draining, hits, misses, and Escape; all 926 tests and the production build passed.

## Approach
Apply the existing overcharge behavior to capped overflow charges and update its regression tests and stale comments.
