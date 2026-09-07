# Product Audit — Motion, Layout and Prompt Feedback

> **Suggested execution:** Opus 5 with high reasoning — the work spans a data-model
> refactor (one dictionary replacing three overlapping datasets), CSS animation
> composition traps that are invisible until rendered, and visual-design judgment on
> the header/prompt hierarchy. Step down to Sonnet 5 once the dictionary shape below
> is settled and only the per-word motion table is being filled in; Haiku 4.5 is not
> a fit for any part of this.

## Why this doc exists

A manual pass over the running app surfaced five problems. Four of them are really
one problem wearing different hats: **the app has three overlapping vocabularies**
(`EASTER_EGGS`, `WORD_EMOJI`, and the typeahead `HINTS` derived from the first), and
motion is assigned by hashing a word rather than by knowing what the word *is*. So a
cookie floats away like a balloon, a dinosaur runs backwards, and typing "cook"
previews nothing even though 🍪 is in the library.

Fixing the symptoms word-by-word would be undone by the dictionary consolidation, so
the dictionary goes first.

## Findings

### 1. Motion doesn't match meaning

`animationTypeForWord()` in `src/features/effects/utils/wordEffect.js` hashes the
word and picks from `['float', 'rain', 'burst']` — deterministic, but arbitrary.
Meaning only enters through a hand-written 30-word `HEAVY_WORDS` set. `cookie` isn't
in it, so a cookie drifts up and off the top of the screen.

`lob` (thrown up, falls back) already exists and is already correct — the cookie
simply was never classified. This is a classification bug, not a missing animation.

### 2. Travelling emoji face the wrong way

`run` and `arc` translate the glyph from `-120vw` to `+120vw` (or the reverse) and
never flip it. A 🦕 always faces left, so half of all runs are backwards. This
affects every `run` entry, not just dinosaurs.

**Trap:** the obvious fix — `transform: scaleX(-1)` on `.emoji-inner` — silently
fails on `arc`/`lob`, whose keyframes animate `transform: translateY` on that same
element and overwrite it. Same collision applies to the existing
`.emoji-inner.rotate` spin.

### 3. Only one motion modifier exists

Rotation is the sole flourish, hardcoded for snowflakes. Nothing bobbles, pulses,
grows as it fades, or bounces its size.

### 4. Chrome outweighs content

The title block (h1 + subtitle) and toolbar occupy the top third; the word the child
is meant to copy renders at `3xl` (1.875rem) — smaller than the input's 4rem. Title,
toolbar and prompt label all use Comic Sans, not the mono typing font, and ignore the
caps-lock setting the child is typing under.

### 5. No per-letter feedback on the prompt

The prompt renders as one string. A child gets no signal that letters 1–3 of `cookie`
are right until they press Enter.

### 6. Up key is unbound

`ArrowUp` does nothing. A mistyped line can only be retyped from scratch.

### 7. "Magic Words" is a separate dataset

The guide lists 28 `EASTER_EGGS` labels; prompts draw from ~600 `EMOJI_WORDS`;
typeahead previews only the 28. Three lists, one concept.

## Plan

Ordered by dependency — each step assumes the one before it.

### Step 1 — One dictionary

**What:** `wordEmoji.js` becomes the single source of truth for vocabulary *and*
motion. Its 17 existing category maps are exported as categories; a new
`wordMotion.js` maps each category to the paths and flair that suit it (animals and
vehicles `run`, produce and food `lob`/`bounce`, space `float`, weather `rain`), with
a per-word override table for the exceptions.

`EASTER_EGGS` shrinks to genuine specials — `$N` money rain, which is triggered by
punctuation and has no dictionary word. Its word-triggered entries fold into the
dictionary as aliases (`sunny`→`sun`, `dino`→`dinosaur`, `yay`→`party`) plus
overrides carrying their emoji sets and counts.

The `"5 lions"` count pattern generalizes into `resolveWordEffect` as
`/(\d+)\s*<word>/` so counting keeps working for every word, not 15 of them.

Guide, typeahead and prompts then all read one list.

**Why:** items 1, 3 and 7 all want motion to be a property of the word. Doing them in
any other order means writing the same table twice.

**Touchpoints:** `src/features/typing/utils/wordEmoji.js`,
`src/features/effects/utils/wordMotion.js` (new),
`src/features/effects/utils/wordEffect.js`, `src/constants/emojiEasterEggs.js`,
`src/features/easter-eggs/utils/typeahead.js`,
`src/features/easter-eggs/composables/useEasterEggGuide.js`,
`src/features/easter-eggs/components/EasterEggGuide.vue`.

### Step 2 — Facing and flair

**What:** `EmojiEffect.vue` gains a nesting of four elements so each concern owns its
own property and nothing collides: the outer element travels (`transform`), a lift
span carries gravity height (`transform`), a flair span animates `rotate:`/`scale:`
(the individual properties, which compose independently of `transform`), and the
innermost glyph span carries the horizontal flip as `scale: -1 1`.

Flairs: `spin`, `bobble`, `grow`, `pulse`, `throb`. Each is a modifier that layers on
any path.

**Scope:** facing defaults to `left` for travelling categories, with `any` for
front-facing glyphs (🐱🐶🦁 and the rest of the "-face" codepoints, which read the
same either way) and per-word overrides where a glyph points right. Verified in the
browser, not derived — glyph orientation is a font fact, not a code fact.

**Caveat:** `spawnEmojis` already multiplies base size by 1.5–3×. Scale flairs stay
relative so sizes don't compound.

### Step 3 — Layout and typography

**What:** header and toolbar collapse into one slim bar (title left, buttons right),
freeing the vertical space for the prompt, which grows to a `clamp()`ed display size.
Title, prompt and settings labels switch to the mono typing font and follow caps lock
via a new `caps` prop on `Text.vue`.

**Caveat:** two-word prompts ("traffic light") at display size overflow narrow
screens — size is clamped against viewport width and stepped down by length.

### Step 4 — Per-letter prompt feedback

**What:** the prompt renders per-character. Characters typed correctly go red,
mistyped go blue, untyped stay dim — the dim state is load-bearing, since the prompt
is *already* red and "lights up red" reads as nothing otherwise.

The same colouring applies to the input line when the typed text plainly belongs to
the prompt (first letter matches, not longer than the prompt).

**Refined after review:** only the first mismatch is marked blue — past it the
letters no longer line up with the positions they'd be judged against — and a
wrong first letter suppresses the colouring entirely on both the prompt and the
input.

**Precedence:** Color Mode wins while it's on. It's a mode the child deliberately
turned on, and two per-character colour schemes can't both render.

**Touchpoints:** `src/features/typing/components/WordPrompt.vue`,
`src/ui/AnimatedText.vue`, `src/features/typing/composables/useWordPrompt.js`.

### Step 5 — Up key edits the last entry

**What:** `ArrowUp` on an empty input pops the last completed line back into the
input and removes it from history, so Enter replaces it rather than duplicating it.

**Non-goals:** full shell-style history navigation. One step back only.

**Caveat:** the popped line already fired its animation and was already submitted to
the Tidbyt API. Neither is undone — the edit produces a second submission.

## Verification

- `npm run build` (typecheck/bundle) and `npm test` — 262 tests before this work.
- Several unit tests pin the old shapes (`animationTypeForWord`, `EASTER_EGGS`,
  typeahead hints, guide items). They are expected to change and are updated
  deliberately, not repaired at the end.
- Facing and flair are checked in a browser against real glyphs.
