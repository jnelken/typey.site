# Clock tower bell (DEV-211)

Typing a quarter-hour time followed by `bell` rings a clock-tower bell: the
Westminster Quarters for `:15`, `:30`, `:45` and `:00`, then one toll per hour
on the hour. A swinging bell animates from the same deterministic schedule.

Scope guard: independent of DEV-210 (cuckoo clock). No wooden clock, no bird.

## Sourced facts (the "map")

Sources (both fetched 2026-11-11):

1. Wikipedia, *Westminster Quarters* — https://en.wikipedia.org/wiki/Westminster_Quarters
2. Wikipedia, *Big Ben* — https://en.wikipedia.org/wiki/Big_Ben

parliament.uk and Britannica returned HTTP 403 to the fetch tool, so the map is
confirmed against these two articles only (they agree with each other). The
directive accepts automated checks for acceptance: `tests/unit/bellSchedule.spec.js`
pins every sequence below, so a change to the map fails the suite.

### Key and pitches

Key of E major. Pitches in scientific notation, equal temperament, A4 = 440 Hz:

| Note | Hz     | Role |
|------|--------|------|
| B3   | 246.94 | fourth quarter bell (4.0 t) |
| E4   | 329.63 | third quarter bell (1.7 t) |
| F♯4  | 369.99 | second quarter bell (1.3 t) |
| G♯4  | 415.30 | first quarter bell (1.1 t) |
| E3   | 164.81 | Great Bell ("Big Ben") hour strike; Wikipedia: "E-natural", sounded on E3 |

### The five changes (each is 3 crotchets + 1 minim)

| Change | Notes |
|--------|-------|
| 1 | G♯4 F♯4 E4 B3 |
| 2 | E4 G♯4 F♯4 B3 |
| 3 | E4 F♯4 G♯4 E4 |
| 4 | G♯4 E4 F♯4 B3 |
| 5 | B3 F♯4 G♯4 E4 |

### Which changes play when

| Time | Changes | Bell numbers (Big Ben article) |
|------|---------|-------------------------------|
| :15  | 1 | 1–4 |
| :30  | 2, 3 | 5–12 |
| :45  | 4, 5, 1 | 13–20, then 1–4 |
| :00  | 2, 3, 4, 5, then the hour strike | 5–20 |

### Hour strike

The Great Bell tolls once per hour on a 12-hour clock: 1 o'clock is one toll,
12 o'clock (noon or midnight) is twelve. At Westminster the hour bell sounds
25 seconds after the last chime note (Big Ben article). Quarters have no toll.

## Design choices NOT in the sources

The sources give no tempo. These are ours, chosen so a child at the keyboard is
not kept waiting, and they live in one place (`westminster.js` `TIMING`):

- crotchet: 0.5 s, minim: 1.0 s (a change is 2.5 s); changes follow back to back.
- pause from the end of the last minim to the first toll: 1.5 s (real: 25 s).
- toll spacing: 1.4 s; each toll decays ~3 s. 12 o'clock is about 10 s + 16.8 s.
- The longest schedule (12:00) is ~30 s; Escape, a retrigger or unmount cancels it.

## Parser (`parseBell`)

The whole trimmed line must be `<time> bell`, case-insensitive:

- `1:15pm bell`, `1:15 pm bell`, `1:15 bell` (colon only; `1.15pm bell` is not accepted)
- `1 o clock bell`, `1 o'clock bell`, `1 oclock bell`, `1pm bell`, `1 bell`
- 24-hour hours accepted (`13:00 bell` = 1 o'clock); `0`/`24` and `12am/pm` = 12
- minutes must be 00, 15, 30 or 45 — anything else returns null (falls through
  to normal behaviour); hour out of range, `0pm`, `13pm`, bare `bell` -> null
