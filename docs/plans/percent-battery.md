# Percent Battery — what `%` does

> **Suggested execution:** Sonnet 5 with medium reasoning — the slice is a near-copy of `src/features/math/`, so most of the work is mechanical, and the two decisions that needed judgment (battery over pizza, two colour bands) are already made and measured below. Step up to Opus 5 only if the battery needs real visual iteration once it's on screen. Don't step down: the `0%` guard and the `% 50` interception are both easy to get subtly wrong.

## ⚠️ Delegate the implementation to the Cursor CLI

**This is not optional, and it is the detail most likely to be missed** — a detailed plan
reads like something to just start editing against, which is exactly the wrong instinct
here.

`~/dotfiles/claude/MODEL_ROUTER.md` governs this repo, and its three preconditions were
verified on 2026-09-07 and all hold: `agent` resolves at `/Users/jake/.local/bin/agent`,
`agent status` reports an authenticated account, and `origin` is
`git@github.com:jnelken/typey.site.git` (owner `jnelken`). So every unit of implementation
work below goes through the Cursor CLI, so Cursor-billed usage is spent before native Claude
sub-agent quota.

**Class this as Execution, not Composite.** The router splits a large or ambiguous
implementation task into a Sol planning call followed by an execution call. That split has
already happened — this document *is* the Sol-equivalent output, and §1–§10 are unambiguous.
Do not spend a thinking-class call re-planning it. Every call below is
`--model auto`.

```bash
agent -p --force --trust \
  --model auto \
  --workspace /Users/jake/Dropbox/code/typey.site \
  --output-format text \
  "<task prompt>"
```

Split it into four calls rather than one, so a failure is recoverable and each diff is
reviewable:

1. **§1, §2, §4** — `parsePercent.js`, `usePercentAnimation.js`, the `palette.js` lift, and
   their unit tests. Pure logic, no rendering.
2. **§3** — `BatteryAnimation.vue` alone. The only call needing visual judgment.
3. **§5–§8** — wiring, the secret word, the prompts, and the remaining tests.
4. **§10** — the doc updates.

Every prompt must carry, per the router's prompt contract: the absolute repo path, the
current branch name, the task statement **in full** (paste the relevant section of this
document — don't summarise it), the line "Follow the repo's own `CLAUDE.md`", and a closing
request for the list of files changed.

**Hard constraints on the delegated runner.** It must not `git commit`, `git push`, switch
branches, or edit files outside the stated task. The calling agent owns the branch, the
commits and the merge — this deliberately overrides any "commit proactively" habit for the
duration of the delegated run.

**Fallback, and say so out loud if it fires.** If the CLI is unavailable, exits non-zero,
refuses, or reports success while leaving a clean `git diff`: retry once on `auto`, then
hand off to a native Claude sub-agent under the unchanged Opus/Sonnet rules in
`~/.claude/CLAUDE.md`. The **Suggested execution** block above describes *that* fallback
path — Sonnet 5 is what to use when the router isn't carrying the work, not the first
choice. Silent fallback defeats the point of the router, so name it in the run summary.

> **Note on the router's model pool.** `agent models` on 2026-09-07 does not list
> `gpt-5.6-sol-medium`, the slug in `MODEL_ROUTER.md`'s Thinking row. The available Sol
> variants are `gpt-5.6-sol-high`, `-high-fast`, `-xhigh` and `-xhigh-fast`. This plan
> doesn't need a thinking-class call, so it isn't blocked — but the router's Thinking row is
> stale and will fail the next time something does.

## Why this exists

The app has exactly one effect triggered by punctuation rather than by a dictionary word:
`$5` rains five bills (`SPECIAL_EFFECTS` in `src/constants/emojiEasterEggs.js`).

Typing `%` today does nothing at all. `50%` doesn't match the money regex, doesn't match
`parseEquation`, and doesn't match the bare-number balloon check (`/^\d+$/`, which is tested
per whitespace-separated token) — so the line falls all the way through every branch of
`evaluateEasterEggs` and lands silently. A child who types it gets no answer.

This adds the second punctuation trigger: **typing `50%` draws a battery charged to half**,
a horizontal bar filling left to right, looping so it can be watched more than once.

### Decision: a battery, not a pizza with a slice eaten

The first sketch was a pizza with the typed percentage eaten out of it. It's the more
charming picture and it's the wrong one.

Every numeric trigger in this app maps the typed number to **what appears**: `$5` gives you
five bills, `5` gives you five balloons, `5 lions` gives you five lions, `2 + 3` gives you
five dots. A child using this app has been taught one rule — the number is how many you
get. "50% eaten" inverts that rule exactly once, and the thing it inverts it for is the
most abstract quantity in the app.

A battery at 50% keeps the rule: the number is how much is there. It also has the rare
property of being a proportion a four-year-old has already seen an adult worry about.

### Decision: two colour bands, not three — this is measured, not taste

The obvious design is red / amber / green. The palette can't do it.

Fill colour has to clear the WCAG **3:1 non-text contrast** minimum. The screen-colour wash
can repaint the ground to any of ten pale colours, and **the worst case is the `black` wash
`#d4d8dd`, not white** — for a dark fill on a light ground, contrast *falls* as the ground
darkens, so white is the friendliest ground, not the harshest. Measured against `#d4d8dd`:

| Colour | vs `#d4d8dd` | vs `#ffffff` | |
| --- | --- | --- | --- |
| Vermillion `#D55E00` | **2.70** | 3.87 | ❌ |
| Green `#009E73` | **2.39** | 3.42 | ❌ |
| Orange `#E69F00` | 1.57 | 2.25 | ❌ |
| Yellow `#F0E442` | 1.01 | 1.32 | ❌ |
| Blue `#0072B2` | 3.62 | 5.19 | ✅ |

**Only blue clears it unaided — so no palette colour can carry a low/high distinction on its
own.** Rather than collapse to one colour, the fill rect is **stroked in `COLOR_TEXT`
`#2b2d42`** (9.42 against the worst wash). WCAG 1.4.11 is satisfied by the boundary rather
than by the fill against the page, and both bands clear 3:1 against that outline —
vermillion 3.49, green 3.94. The stroke also gives the charge edge — the one edge that
carries the meaning — a hard boundary at every percent below 100, which it otherwise
wouldn't have.

So: **`≤20%` vermillion, above that green, both outlined.** Low charge is red, like every
battery indicator a child has already seen; there is no middle, because there is no darker
amber in Okabe-Ito to draw one in. This is the same wall `screenColor.js` hit, and the
reason its "yellow" wash landed as a deep gold.

Note that vermillion and green contrast only 1.13 against *each other* — they differ in hue,
not luminance, so `dotLayout.js`'s "differ in luminance" comment doesn't hold for this pair.
It doesn't need to: the two bands never appear at the same time, and the bar length and the
numeric label both carry the same information.

---

## 1. `src/features/percent/utils/parsePercent.js` — new

Pure and strict, mirroring `src/features/math/utils/parseEquation.js`.

```js
const PERCENT_PATTERN = /^(\d{1,3})\s*%$|^%\s*(\d{1,3})$/;
```

Returns `{ percent }` or `null`.

- **Both orders**, the way the money regex accepts `$5` and `5$` — a child may well type
  the sign first.
- **The whole trimmed string must match**, so sentences and `50% cookie` fall through to
  the existing behaviour untouched.
- **Above 100 clamps to 100.** A full battery is a friendlier answer to `200%` than
  silence. The three-digit cap means `1000%` doesn't match at all and falls through.
- **A bare `%` returns `null`**, mirroring the money effect's `mustAlsoMatch: [/\d+/]`.

### `% 50` is an existing behaviour changing, not just a new one

Today `evaluateEasterEggs` splits on whitespace, sees the token `"50"`, and floats fifty
balloons. The `/^%\s*(\d{1,3})$/` half of the pattern intercepts that line, so it becomes a
battery instead. That's the right outcome — but it is a swap, not an addition. Pin it with a
test and name it in the ROADMAP entry.

## 2. `src/features/percent/composables/usePercentAnimation.js` — new

A near-copy of `useMathAnimation.js`: a `current` ref holding `{ percent, id }`, plus `play`
and `clear`. The incrementing `id` is what restarts the loop in the component. It stays up
until cleared rather than vanishing on a timer, so it's replayable.

**Guard on the type, not on truthiness:**

```js
const play = data => {
  if (!data || typeof data.percent !== 'number') return;
  current.value = { percent: data.percent, id: ++percentIdCounter };
};
```

`useMathAnimation` guards with `typeof equation.result !== 'number'` for the same reason.
Written as `if (!data?.percent) return`, `0%` would silently do nothing — and `0%` is a
legitimate value a child will absolutely type.

## 3. `src/features/percent/components/BatteryAnimation.vue` — new

Canvas, `position: fixed`, `inset: 0`, `pointer-events: none`, `aria-hidden="true"`,
`z-index: 1400` — the same layer as `MathAnimation.vue`: above Emojis (1001), below
`Modal.vue` (1500) so it can never cover the word guide.

Copy from `MathAnimation.vue` verbatim: the DPR/resize handling, the
`requestAnimationFrame` loop, the `PLAY_MS = 2200` / `HOLD_MS = 2000` cycle, the
`clamp01` / `smoothstep` / `lerp` helpers, and `COLOR_TEXT = '#2b2d42'`. The two features
should share a rhythm, and that text colour is already contrast-checked against every wash.

Per frame:

- **Shell** — rounded rect, `bodyW = min(w * 0.62, 760)`, `bodyH = bodyW * 0.46`, centred
  at `h * 0.58`. Stroked in `COLOR_TEXT` at `bodyH * 0.06`, with a terminal nub on the
  right `bodyH * 0.34` tall and `bodyW * 0.045` wide.
- **Fill** — rounded rect inset by `bodyH * 0.12`, width `innerW * (percent / 100)`,
  animated `0 → percent` with `smoothstep` across `PLAY_MS`. Colour picked from the
  **final** percent, not the animating value, so it doesn't change colour mid-fill.
  **Stroked in `COLOR_TEXT` at `bodyH * 0.03`** — half the shell's weight, so it reads as
  an edge rather than a second shell. This stroke is what carries the WCAG 1.4.11 boundary
  (see the colour-band decision above); without it the charge edge has no contrast against
  a dark wash. Skip the stroke only when `percent` is 0 and there is no rect to draw.
- **Ticks** at 25 / 50 / 75, drawn *over* the fill in `rgba(0,0,0,0.18)` — the alpha the
  dots already use for their stroke. A bar with no scale can't be read; this is the same
  argument `dotLayout.js` makes for grouping dots into fives.
- **Label** — `${percent}%` at `h * 0.28`, in the font and size formula `drawEquation` uses.
- **Full charge** — at 100%, a ⚡ inside the bar and a gentle pulse, reusing math's `pop`.

## 4. `src/constants/palette.js` — new, and `dotLayout.js` edited

Lift the Okabe-Ito hexes out of `GROUP_COLORS` in `src/features/math/utils/dotLayout.js`
into a shared constant, so the battery and the dots read one source. Keep the
colourblind-safety comment with the palette rather than with the dots.

`dotLayout.js` re-exports `GROUP_COLORS` from it, so nothing that imports it today changes.
This is the one edit in the plan that touches an existing feature — which is why the
verification step below runs the whole suite, not just the new specs.

## 5. `src/composables/useTypingApp.js` — edited

- Instantiate `usePercentAnimation()` beside `useMathAnimation()`.
- Add a branch in `handleEnterKey` **immediately after the equation branch** — both are
  strict whole-string parsers, so they can't collide. It plays, awaits
  `typingAPI.submitEntry(...)`, clears the input, speaks `` `${percent} percent` `` when
  auto-speak is on, and `return`s. The early return is what stops the usual emoji/balloon
  evaluation from also firing.
- Add `percentSystem.clear()` alongside `mathSystem.clear()` in `onPrintableKey`. Without
  it the battery survives into the next line and stacks under the next animation.
- Expose `batteryCharge: percentSystem.current` on the context object — named for the
  object it holds, matching `mathEquation`'s shape rather than suggesting a bare number.

## 6. `src/App.vue` — edited

Import and render `<BatteryAnimation />` next to `<MathAnimation />`.

## 7. `src/features/typing/composables/useWordGuide.js` — edited

Add to `SECRET_WORDS`:

```js
{ word: '50%', emoji: '🔋', description: 'Charges a battery that much' },
```

This is the whole of what makes the trigger findable again from **Settings → 🤫 Secret
Words**.

## 8. `src/features/typing/utils/promptWords.js` — edited

Percent joins the practice prompts across the full **1–100** range.

- `PROMPT_PERCENTS` — `` `${i + 1}%` `` for 1–100, added to `ALL_PROMPTS`.
- `promptKind` — returns `'percent'` for `/^\d{1,3}%$/`, tested **before** the bare-number
  branch.
- `emojiForPrompt` — `🔋` for that kind.
- `randomPrompt` — add `PERCENT_CHANCE = 0.05` as a third band in the existing cumulative
  ternary (`roll < NUMBER_CHANCE + DOLLAR_CHANCE + PERCENT_CHANCE`). It's a fixed share
  rather than a pooled draw, so the 100-entry list doesn't crowd out the six hundred words.

**Nothing to do in `emojiMode.js`** — already checked: `'%': '💯'` is in `SYMBOL_EMOJI`
alongside `$`, so all hundred new prompts render whole with Emoji Mode on.

## 9. Tests

New:

- `tests/unit/parsePercent.spec.js` — both orders, `% 50` with a space, surrounding
  whitespace, `0%` → `{ percent: 0 }`, `>100` clamps, and `%` alone / `50% cookie` /
  `5 + 5` all returning `null`.
- `tests/unit/usePercentAnimation.spec.js` — mirror `tests/unit/useMathAnimation.spec.js`
  case for case, **plus a `play({ percent: 0 })` case** asserting `current` becomes
  non-null.
- `tests/unit/batteryColor.spec.js` — both fill colours clear 3:1 **against the
  `COLOR_TEXT` outline they are stroked with**, and that outline itself clears 3:1 against
  every wash in `screenColor.js` (plus `DEFAULT_SCREEN_COLOR`). Copy the inline `luminance`
  / `contrast` helpers from `tests/unit/screenColor.spec.js`, which is where that pattern
  already lives. **Do not assert the fills against the washes directly — they do not clear
  3:1 there and are not required to; the outline is the boundary.**

Extended:

- `tests/unit/promptWords.spec.js` — the new kind, its emoji, `ALL_PROMPTS` contains `'75%'`.
- `tests/integration/SecretWords.spec.js` — the new row renders.
- `tests/unit/useTypingApp.spec.js` — `50%` sets `batteryCharge` and floats **no** balloons;
  `% 50` does the same rather than floating fifty balloons as it does today; a printable key
  clears it.

## 10. Docs

- `ROADMAP.md` — move this from **Planned** to a **Shipped** entry in the voice of the ones
  above it, recording the decisions: battery over pizza and why, the exact-fill bar with
  ticks over discrete segments, two colour bands because the palette has no mid-tone that
  reaches 3:1, and the one behaviour that *changed* — `% 50`.
- `README.md` — one bullet under **Interactive Typing**.
- `FILE_STRUCTURE.md` — the `percent/` slice in the tree, and a "Where things belong" row.

---

## Out of scope, worth a roadmap line

**`50% cookie`** — eating a proportion of any dictionary word's emoji, reusing
`findWordEmoji` the way `5 lions` does. It's a good idea and it generalises the same way
counting did, but it needs a constraint stated before it's built: a wedge through 🍪 reads
as *eaten*, and the same wedge through 🦁 reads as *broken*. It would have to be restricted
to the dictionary's food and fruit categories with a fallback for everything else.

Note that this variant is also what makes the early return genuinely load-bearing. Bare
`50%` can't reach the counting path anyway; `50% cookie` would hit `findWordEmoji` and
`countForWord` and claim the line first.

## Verification

Work on a branch off `main`; this is a personal repo, so no PR — merge locally when it's
done.

1. `npm test` — the whole suite, not just the new specs (see §4).
2. `npm run build` — the repo's typecheck.
3. `npm run dev`, then type each of these and press Enter:
   - `50%` → fills to half, loops, label reads `50%`, speech says "fifty percent"
   - `7%` → a sliver in vermillion; `100%` → full, green, ⚡
   - `0%` → an empty shell, **not nothing at all**
   - `250%` → clamps to full; `%50` and `% 50` → same as `50%`
   - `50` with no sign → still floats fifty balloons, unchanged
   - `50% cookie` → falls through to the existing counting behaviour, no battery
4. Press any letter afterwards — the battery clears, and doesn't linger under whatever
   animates next.
5. **Settings → 🤫 Secret Words** lists `50%`. Type `qwerty` while a battery is running and
   confirm the guide renders **over** it, not under.
6. Shuffle prompts with ⌘→ until a `%` prompt appears; confirm it shows 🔋 and that the
   spelling feedback lights the digits as they're typed. Turn on Emoji Mode and confirm the
   same prompt renders whole (`7️⃣5️⃣💯`) with no gap where the `%` is.
