# Produce Splatter and the Colour It Leaves Behind

> **Suggested execution:** Sonnet 5 with medium reasoning — the plan is detailed and the blast radius is small (one new component, five edited files, CSS keyframe work with the timing fractions already derived from the existing keyframes). Step up to Opus 5 if the impact timing reads wrong on real hardware and the fractions need re-deriving from feel rather than from the keyframes. Don't step down: the four-layer transform rules in `EmojiEffect.vue` punish a careless edit.

## How to run this: delegate to the Cursor CLI

**Important.** This repo is in scope for `~/dotfiles/claude/MODEL_ROUTER.md`, and all three of its preconditions hold (verified 2026-09-07): `agent` resolves at `/Users/jake/.local/bin/agent`, `agent status` reports an authenticated account, and `origin` is `git@github.com:jnelken/typey.site.git` — a `jnelken` repo. So the implementation work must run **through the Cursor CLI**, not as a native Claude sub-agent, so Cursor-billed usage is spent first.

The planning half is already done — this document is it — so there is no thinking-class call to make. Every remaining step is execution class and runs on `auto`:

```bash
agent -p --force --trust \
  --model auto \
  --workspace /Users/jake/Dropbox/code/typey.site \
  --output-format text \
  "<task prompt>"
```

Only re-enter thinking class (`--model gpt-5.6-sol-medium --mode ask`) if something here turns out to be wrong and the approach genuinely needs redesigning — not for ordinary implementation questions.

**Split it across calls rather than sending the whole plan at once.** Three natural units, in dependency order, each verifiable on its own:

1. **Data and derivation** — steps 1–5 (`screenColor.js`, `wordMotion.js`, `wordEffect.js`, `useEmojis.js`). Pure logic and constants, no CSS. Run `npm test` after.
2. **The visual layer** — steps 6–7 (`Splatter.vue`, `EmojiEffect.vue`). This is where the transform-collision traps live; keep it in its own call so the reasoning isn't diluted by step 1's bookkeeping.
3. **Tests and docs** — the Verification section plus `FILE_STRUCTURE.md`.

Keep follow-ups for a given unit on the same model rather than reclassifying each turn.

Every prompt must carry, per the router's prompt contract: the absolute repo path and current branch, the task statement in full, the instruction to **follow the repo's own `CLAUDE.md`**, and a closing request for the list of files changed.

**Hard constraints on the delegated runner** — state these in each prompt. It must not `git commit`, must not `git push`, must not switch branches, and must not edit files outside the stated task. The calling agent owns all git operations.

**If the CLI can't do the work** — not installed, unauthenticated, a non-zero exit, a quota or model refusal, or a clean `git diff` after it reports success — retry once on `auto`, then fall back to a native Claude sub-agent under the unchanged Opus/Sonnet rules in `CLAUDE.md`. **Say so in the run summary whenever the fallback fires**; a silent fallback defeats the point of routing here at all.

The Suggested execution block above describes what to use *if* this is ever run natively — for example in a clone where the router's preconditions don't hold. It does not override this section for this repo.

## Why this exists

Typing a word already spawns a full-screen emoji animation chosen by what the word *is* — animals run, weather rains, and **produce is thrown on gravity paths** (`lob`, `bounce`, `arc`) that land at `bottom: 8vh`. Today a thrown apple just fades out when it lands. There is no impact and no payoff, which is the one place the motion system promises something it doesn't deliver.

Two things are added:

1. **Produce splatters.** A thrown fruit or vegetable bursts into a spray of coloured droplets — some mid-air at the top of their arc, some on hitting the ground.
2. **The produce's colour washes the page.** Typing "grapes" tints the background pale purple; it lasts until the next submission, then clears.

Both hang off machinery that already exists. The wash is the same mechanism that makes typing "purple" turn the screen purple, and its clear-on-next-submission behaviour is already guaranteed. The splatter is a new leaf on the existing DOM particle system.

### Decision: no fruit-ninja library

The repo has exactly one runtime dependency (`vue`); every animation is CSS keyframes on DOM nodes, and there is no canvas anywhere in `src/`. Fruit-ninja libraries are canvas- or Phaser-based and slice-input-driven. Adopting one would add a second rendering layer that couldn't reuse `EmojiEffect.vue`'s lob/bounce/arc paths, couldn't be driven by the word dictionary, and would bring a build-size and accessibility cost to an app that currently ships almost nothing. Build it natively.

### Scope, as decided

Background wash only — no accent tinting. Both mid-air and on-landing bursts. All produce, vegetables included.

---

## 1. `src/features/effects/utils/screenColor.js` — produce to colour

Add a map from produce word to an **existing `SCREEN_COLORS` key name**, not to a new hex:

```js
export const PRODUCE_COLORS = Object.freeze({
  apple: 'red', strawberry: 'red', cherry: 'red', tomato: 'red', pepper: 'red',
  banana: 'yellow', lemon: 'yellow', pineapple: 'yellow', corn: 'yellow',
  grapes: 'purple', onion: 'purple',
  blueberry: 'blue',
  watermelon: 'pink', peach: 'pink',
  kiwi: 'green', pear: 'green', avocado: 'green', broccoli: 'green',
  cucumber: 'green', melon: 'green',
  orange: 'orange', mango: 'orange', carrot: 'orange',
  coconut: 'brown', potato: 'brown', mushroom: 'brown', peanut: 'brown',
  garlic: 'brown',
});
```

Using colour *names* rather than hexes means every value resolves through `SCREEN_COLORS`, so the existing contrast test in `tests/unit/screenColor.spec.js` covers the new feature for free — no new value can slip past the readability bar that file's header comment describes.

`garlic` maps to brown rather than the literal white: `SCREEN_COLORS.white` on a near-white page is invisible, and an invisible splatter reads as a bug.

Extend `screenColorForText`: run the existing colour-word loop to completion first, and only if it finds nothing, fall back to `findWordEmoji(text)` and look the matched word up in `PRODUCE_COLORS`.

- **Precedence is explicit: a named colour beats a produce word regardless of order.** "purple banana" is purple, not yellow.
- Going through `findWordEmoji` inherits plural-to-singular fallback and phrase matching, so "apples" works.
- `orange` is both a colour word and a fruit. It hits the colour loop first and is unaffected.
- **Import direction is safe**: `wordEmoji.js` imports nothing, so `screenColor.js → wordEmoji.js` creates no cycle.

`useScreenColor.js` needs **no changes** — it already applies whatever `screenColorForText` returns, and `DEFAULT_SCREEN_COLOR` when that is null.

**The disappears-on-next-submission requirement is already satisfied.** `setScreenColorFromText` is called unconditionally near the top of `handleEnterKey` (`src/composables/useTypingApp.js`) *before* every early return. Verify it with a test; do not build lifecycle for it.

## 2. `screenColor.js` — the droplet palette

Add a saturated `SPLAT_COLORS`, keyed by the **same ten colour names**, for droplets only:

```js
export const SPLAT_COLORS = Object.freeze({
  red: '#e33e3e', orange: '#f08a24', yellow: '#f5c518', green: '#3fa85a',
  blue: '#3d7fe0', purple: '#8a5fd6', pink: '#e35b9a', brown: '#a8703f',
  black: '#5b6270', white: '#dfe3e8',
});
```

Do **not** reuse `COLOR_PALETTE` from `easter-eggs/utils/colorMode.js` — those hues are AA-darkened for use as *text* and read muddy as splatter. Droplets are `pointer-events: none` decoration with no text on them, so they carry no contrast constraint. Say so in a comment, so a future reader doesn't "fix" them to match the washes.

## 3. `src/features/effects/utils/wordMotion.js` — impact fractions

The keyframes already define the exact moment of impact for each gravity path. Export them rather than hardcoding them in the component:

```js
// When a thrown thing is at its most hittable, as a fraction of its own
// duration. Read straight off the keyframes in EmojiEffect.vue: lob peaks at
// 55%, arc at 50%, and bounce makes first ground contact at 40% — its later
// hops are smaller and read as settling, not impact.
export const IMPACT_AT = Object.freeze({ lob: 0.55, arc: 0.50, bounce: 0.40 });

// How long the droplet burst lasts. Lives here so the component that plays it
// and the composable that decides when to unmount it read one number.
export const SPLAT_DURATION = 900;
```

The mid-air versus landing split falls out of the path with no new randomness: **`lob` and `arc` burst at their apex, `bounce` splats on first ground contact.** Because `motionForWord` is deterministic, a given produce word always gets the same one — a child learns that the watermelon bursts in the air and the potato splats on the floor, and it stays true.

## 4. `src/features/effects/utils/wordEffect.js` — derive the impact

In `effectForWord`, when the word is in `PRODUCE_COLORS` **and** its resolved path is in `GRAVITY_PATHS` (already defined at the top of the file), set:

```js
options.impact = motion.path === 'bounce' ? 'splat' : 'burst';
options.splatColor = SPLAT_COLORS[PRODUCE_COLORS[word]];
options.impactAt = IMPACT_AT[motion.path];
```

Deriving membership from `PRODUCE_COLORS` keeps one source of truth and settles fruit-versus-vegetable without a new emoji group or a parallel flag in `CATEGORY_MOTION`.

`apple` is the only produce word with a `WORD_MOTION` override (`['lob','bounce']`) — still gravity, so it is fine. Its `emojiSet` is `['🍎','🍏']`, so roughly half the apples are green while all of them splatter red. **Accepted**: the colour is a property of the word, not of which glyph variant got drawn. Don't drop 🍏 to force consistency.

## 5. `src/features/effects/composables/useEmojis.js` — thread it through

Pass `impact`, `splatColor` and `impactAt` from `options` onto each spawned effect object, alongside the existing randomized `left` / `duration` / `delay` / `size`.

On the expiry timeout: the current `duration + delay + 500` is already long enough, because impact fires at 40–55% of duration and gravity paths run 2400–4600ms, so the splat finishes well before cleanup. Rather than rely on that coincidence, make it explicit:

```js
const life = Math.max(duration, duration * (impactAt ?? 1) + SPLAT_DURATION) + delay + 500;
```

so retuning `IMPACT_AT` later can't silently splice an effect out mid-splat.

## 6. `src/ui/Splatter.vue` — new component

A burst of droplets from a point. Eight to twelve `<span>`s, each a radial-gradient dot, each given a randomized angle and distance as CSS custom properties at setup time, all driven by one `splat-fly` keyframe: fly outward, scale down, fade. Props: `color`, `count`, `size`.

Keep it a **separate component**, not more markup inside `EmojiEffect.vue` — that file is already 286 lines, and its four-nested-span structure exists precisely so transforms don't collide, so droplets need their own elements regardless.

Design it so **Party Mode can reuse it**: accept an optional `colors` array, falling back to the single `color`, so the same primitive can throw multi-coloured confetti. The Party Mode idea under Easter Egg Ideas wants confetti bursting from each character as it lands — that is this primitive with a different palette, and it should not need a rewrite.

## 7. `src/ui/EmojiEffect.vue` — the impact hook

**Use a `setTimeout`, not `@animationend`.** The impact for `bounce` is at 40% — not at the end — and `.emoji-lift` only carries an animation on `arc` and `lob` (bounce animates `.emoji` itself), so `animationend` fires inconsistently across the three paths and never at the right moment for two of them. The component already knows its own `delay` and `duration`, so a timer at `delay + duration * impactAt` is both exact and trivially testable with fake timers.

On impact, when `effect.impact` is set:

1. Set an `impacted` flag.
2. Add a class that **pauses the motion** — `animation-play-state: paused` on `.emoji` and `.emoji-lift` — freezing the fruit at the exact point of impact. Rendering `<Splatter>` as a child of `.emoji-lift` then places it precisely on the fruit for free, inheriting both the horizontal travel and the height with no coordinate maths. **`.emoji-lift` needs `position: relative` added** — it is bare `display: inline-block` today — or the absolutely-positioned droplets will anchor to the viewport instead of the fruit.
3. Kill the flair (`.impacted .emoji-flair { animation: none; }`). `flair-spin` is `infinite` and won't stop on its own.
4. Replace the glyph's exit with a fast `splat-pop` squash-to-zero, around 180ms, so the fruit visibly *pops* rather than continuing to fade. This matters: pausing `.emoji` also freezes its opacity keyframes, so without an explicit pop the glyph would hang at full opacity until the effect unmounts.
   **Put `splat-pop` on `.emoji-flair`, not `.emoji-glyph`.** `.emoji-glyph.flipped` sets `scale: -1 1`, and an animation touching `scale` would override it and un-flip the glyph mid-pop — exactly the collision the file's header comment warns about. `.emoji-flair` already owns `scale`, via `flair-grow` and `flair-pulse`, and step 3 has already cleared its animation.
5. Clear the timer in `onUnmounted`.

Respect `prefers-reduced-motion` if the repo has an existing convention for it. If not, note it as a follow-up rather than inventing one here.

## 8. Guide-tap parity — a deliberate split

`previewWord()` in `useTypingApp.js` calls `spawnForWord()` directly, bypassing `handleEnterKey`. Two consequences, both correct as they stand:

- **The splatter fires on a guide tap** — it lives inside the effect pipeline, so a tapped card looks identical to a typed word. This is the parity `previewWord` exists to guarantee.
- **The wash does not fire on a guide tap** — it is driven by `handleEnterKey`, matching exactly how screen colour behaves today.

Do not wire the wash into `spawnForWord` to "restore parity."

---

## Files

| File | Change |
| --- | --- |
| `src/features/effects/utils/screenColor.js` | add `PRODUCE_COLORS`, `SPLAT_COLORS`; extend `screenColorForText` |
| `src/features/effects/utils/wordMotion.js` | add `IMPACT_AT`, `SPLAT_DURATION` |
| `src/features/effects/utils/wordEffect.js` | derive `impact` / `splatColor` / `impactAt` in `effectForWord` |
| `src/features/effects/composables/useEmojis.js` | thread the new options through; explicit lifetime maths |
| `src/ui/Splatter.vue` | **new** — the droplet burst primitive |
| `src/ui/EmojiEffect.vue` | impact timer, `impacted` state, `splat-pop`, render `<Splatter>` |
| `FILE_STRUCTURE.md` | add `Splatter.vue` to the repo map |
| `ROADMAP.md` | move to Shipped once done |

## Verification

Tests — the suite is 262 tests across 22 suites and must stay green:

- **Drift guard**: assert `Object.keys(WORD_CATEGORIES.produce)` and `Object.keys(PRODUCE_COLORS)` are the *same set*, derived rather than counted. Adding a produce word without a colour, or a colour without a word, then fails CI instead of silently not splattering.
- `tests/unit/screenColor.spec.js`: every `PRODUCE_COLORS` value is a valid `SCREEN_COLORS` key — this is what makes the existing contrast assertions cover the feature; "grapes" gives pale purple; plural "apples" gives red; precedence holds both ways round ("purple banana" and "banana purple" are both purple); a line with neither gives `DEFAULT_SCREEN_COLOR`.
- `tests/unit/wordEffect.spec.js`: every produce word resolves to a gravity path and gets an `impact`; `bounce` words get `'splat'`, `lob` and `arc` words get `'burst'`; a non-produce word such as "lion" or "pizza" gets no `impact`.
- `tests/unit/wordMotion.spec.js`: `IMPACT_AT` covers exactly the gravity paths.
- `useEmojis` lifetime: an effect survives past its impact moment.
- Component test with fake timers: `EmojiEffect` renders no `Splatter` before `delay + duration * impactAt`, and one after.

Commands: `npm test` and `npm run build` must both pass.

Manual QA — `npm run dev`, then in the browser:

- [ ] Type `grapes` and Enter: purple droplets, background washes pale purple.
- [ ] Type `hello` and Enter: the purple wash clears back to default.
- [ ] Type `purple banana`: purple wash, not yellow; the banana still splatters yellow.
- [ ] Type `apples`: red splatter, confirming the plural fallback.
- [ ] Type one `lob` or `arc` word and one `bounce` word: confirm one bursts mid-air and the other splats on the ground, and that each stays consistent across repeats.
- [ ] Type `carrot` and `potato`: vegetables splatter too.
- [ ] Type `5 apples`: the count is still respected and every copy splatters. Use `apples` rather than an `-es` plural like `tomatoes`; the fallback is a trailing-`s` strip, so a failure there would be pre-existing rather than caused by this change.
- [ ] Tap a produce card in the word guide (`qwerty`): it splatters identically, and the background does **not** wash.
- [ ] Watch for a frozen glyph left on screen after a splat — the step 7.4 failure mode.
- [ ] Check the droplets read as juice against the pale wash: not muddy, and not so loud they compete with the child's own typing.
