# Emoji Families: Related Glyphs in One Animation

> **Suggested execution:** Sonnet 5 with medium reasoning — the design is settled and the work is a large, well-specified data table plus a small mechanical refactor across three files. Step up to Opus 5 if the `facing` audit turns up more mixed-orientation families than the two recorded here; don't step down, because the family table is a judgment call on every row and Haiku will pad it with members that aren't pictures of the word.

## ⚠️ Delegate the implementation to the Cursor CLI

**This is not optional, and it is the detail most likely to be missed** — a plan this
specific reads like something to just start editing against, which is exactly the wrong
instinct here. Do not open `wordEmoji.js` in this session.

`~/dotfiles/claude/MODEL_ROUTER.md` governs this repo, and its three preconditions were
verified on 2026-09-07 and all hold: `agent` resolves at `/Users/jake/.local/bin/agent`,
`agent status` reports an authenticated account, and `origin` is
`git@github.com:jnelken/typey.site.git` (owner `jnelken`). So every unit of implementation
work below goes through the Cursor CLI, so Cursor-billed usage is spent before native
Claude sub-agent quota.

**Class this as Execution, not Composite.** The router splits a large or ambiguous
implementation task into a Sol planning call followed by an execution call. That split has
already happened — this document *is* the Sol-equivalent output, and §1–§5 are unambiguous.
So there is no thinking-class call to make, and every remaining step runs on `auto`:

```bash
agent -p --force --trust \
  --model auto \
  --workspace /Users/jake/Dropbox/code/typey.site \
  --output-format text \
  "<task prompt>"
```

Only re-enter thinking class (`--model gpt-5.6-sol-medium --mode ask`) if something here
turns out to be wrong and the approach genuinely needs redesigning — not for ordinary
implementation questions.

**Split it across two calls**, in dependency order, each verifiable on its own:

1. **The mechanism** — §1–§4: the `WORD_FAMILY` table and `familyForWord()` in
   `wordEmoji.js`, the migration of the fourteen existing `emojiSet` entries out of
   `wordMotion.js`, the pool construction in `wordEffect.js`, and the `FRONT_FACING` fix.
   Paste §4's family table into the prompt verbatim — it is a judgment call on every row,
   and a runner asked to "add related emoji" will invent members that fail the authoring
   rule. Run `npm test` after.
2. **Tests and docs** — §5 plus `ROADMAP.md` and `README.md`.

Keep follow-ups for a given unit on the same model rather than reclassifying each turn.

Every prompt must carry, per the router's prompt contract: the absolute repo path and
current branch, the task statement in full, the instruction to **follow the repo's own
`CLAUDE.md`**, and a closing request for the list of files changed.

**Hard constraints on the delegated runner** — state these in each prompt. It must not
`git commit`, must not `git push`, must not switch branches, and must not edit files
outside the stated task. The calling agent owns all git operations. That matters more than
usual here: the working tree already carries in-flight work from a parallel session
(`docs/plans/produce-splatter.md`, `docs/plans/percent-battery.md`, and their `ROADMAP.md`
edits), which must not be swept into this change's commit.

**If the CLI can't do the work** — not installed, unauthenticated, a non-zero exit, a quota
or model refusal, or a clean `git diff` after it reports success — retry once on `auto`,
then fall back to a native Claude sub-agent under the unchanged Opus/Sonnet rules in
`CLAUDE.md`. **Say so in the run summary whenever the fallback fires**; a silent fallback
defeats the point of routing here at all.

The Suggested execution block above describes what to use *if* this is ever run natively —
for example in a clone where the router's preconditions don't hold. It does not override
this section for this repo.

## Why this exists

Typing a word spawns a swarm of one emoji — eight identical ⚽ arcing across the screen for "ball". The dictionary already supports a *pool* of glyphs (`emojiSet`, used by 14 words such as `fish` → 🐠🐟🐡), but it is used sparsely and it lives in the wrong file.

"Ball" is the clearest miss. A ball is not only a soccer ball; it is ⚽🏀🏈⚾🎾🏐, and a child typing "ball" should see all of them fly. This plan sweeps the whole 489-word dictionary for the same opportunity and gives the mechanism a home next to the words it describes.

### The authoring rule that governs the sweep

**Every member of a family must itself be a correct picture of the word.** 🏈 is a ball, so it belongs in `ball`. 🎳 and ⛳ are not balls, so they do not. This is what keeps the app pedagogically honest: it is a spelling app, and a child typing "basketball" must see basketballs. Generic words (`ball`, `car`, `tree`, `candy`) get families; specific words (`soccer`, `basketball`, `poodle`, `rose`) stay single.

Because the rule is about *correctness of the picture*, uniform random selection across the family is right — no weighting is needed, and none is added.

### Decision: a family belongs to the word, not to its number

Today the singular and the plural differ deliberately: `stars` mixes ⭐✨ but `star` spawns 24 identical ⭐, and the same split holds for heart/hearts and flower/flowers. That split goes. 🌼 is a correct picture of "flower", so `flower` gets the mix too.

This changes existing behaviour for three words (`star`, `heart`, `flower`) and is the only intentional regression in the plan.

### Decision: families live in the dictionary, not the motion table

`emojiSet` sits in `WORD_MOTION` today, interleaved with paths and flairs. Which glyphs a word can be drawn as is a *dictionary* fact, not a *motion* fact — `wordMotion.js`'s own header says the file is about motion. With ~28 more families arriving, the table wants one home, and a word that needs a family but no motion override should not have to invent one.

## 1. `src/features/typing/utils/wordEmoji.js` — the family table

Add, alongside `WORD_CATEGORIES`:

```js
export const WORD_FAMILY = Object.freeze({ ball: ['⚽','🏀','🏈','⚾','🎾','🏐'], … });

/** The related glyphs a word can also be drawn as, or null. */
export function familyForWord(word) {
  if (typeof word !== 'string') return null;
  return WORD_FAMILY[word.trim().toLowerCase()] ?? null;
}
```

Aliases (`music`/`note`/`song`, `dog`/`puppy`, `star`/`stars`, `house`/`home`, …) are written as **explicit duplicate keys**. `wordMotion.js`'s `fill()` helper stays module-private: the table stays greppable by word, and the migration below is already the one structural change this plan makes.

Document both authoring rules above the table, plus the facing rule from step 3 — those are the three facts a future editor needs and cannot infer from the data.

## 2. `src/features/effects/utils/wordEffect.js` — the word's own emoji leads the pool

`wordEffect.js:56-58` currently sets *either* `emoji` *or* `emojiSet`, so a word with a set has no `options.emoji` at all. Set both:

```js
const options = { ...pathOptions, flair: motion.flair, facing: motion.facing, emoji };
const family = familyForWord(word);
if (family) options.emojiSet = [...new Set([emoji, ...family])];
```

`Set` preserves first occurrence, so the dictionary glyph stays first in the pool even when the table happens to list it mid-array. This preserves every existing `options.emoji` assertion in the suite, and needs no change to `useEmojis.js` — `options.emojiSet || [options.emoji || '✨']` at `useEmojis.js:32` already does the right thing.

One behaviour change falls out. `hearts` is the only current set that *excludes* its dictionary glyph (💕 against `['💖','💗','💞']`). Under the new rule 💕 rejoins the swarm. Accept it; it is a heart.

The plural fallback needs no work: `findWordEmoji('balls')` already returns `word: 'ball'`, so the family lookup hits.

## 3. `src/features/effects/utils/wordMotion.js` — motion only, and a facing fix

Delete every `emojiSet:` entry (lines 85, 95, 103, 107, 120, 124, 125, 129–132, 137, 143, 144), the `if (motion.emojiSet)` copy at `:195`, and the mention of `emojiSet` in the `motionForWord` JSDoc at `:176`. **Run `grep -rn emojiSet src tests` before deleting** — three sites are known (`wordMotion.js:195`, `wordEffect.js:57`, `useEmojis.js:32`) and a stray read elsewhere would break silently.

Then the facing fix. `facing` is per-word and applies to every glyph in the swarm (`useEmojis.js:67-70`). For the travelling paths (`run` and `arc`) a family that mixes a head-on glyph with a side-on one makes the side-on member run backwards half the time.

`dog` (🐶 head-on + 🐕 side-on) and `cat` (🐱 + 🐈) have this bug **today**: both are in `FRONT_FACING` (`wordMotion.js:67-74`), so they resolve to `facing: 'any'` and never flip, and 🐕 runs tail-first half the time.

**Fix:** remove `dog`, `puppy`, `cat`, `kitty` from `FRONT_FACING` so they take the animal default `facing: 'left'`. Flipping a head-on glyph is a no-op — `FRONT_FACING`'s own comment says so, that it "changes nothing except which whisker is on the left" — so the list is an optimisation, not a correctness guard, and 🐶 is unharmed while 🐕 now turns around properly.

**The rule, stated once:** when a family mixes orientations on a travelling path, take the side-on member's orientation. Families on `float`/`rain`/`burst`/`lob`/`bounce`, and on any category with `facing: 'any'` (play, food, produce, clothes, place, thing, symbol, body), are unconstrained. `boat` was rejected as a family for exactly this reason — 🚤 faces left and ⛵ does not, and there is no third glyph to break the tie.

## 4. The family table

New and changed entries. Aliases share a family.

**Play** — `ball`: ⚽🏀🏈⚾🎾🏐 · `book`: 📚📖📕📗📘 · `toy`: 🧸🪀🧩 · `game`: 🎮🕹️ · `cards`: 🃏🎴 · `medal`: 🏅🎖️ · `music`/`note`/`song`: 🎵🎶

**Symbol** — `heart`/`hearts`: ❤️💕💖💗💞🧡💛💚💙💜 · `check`/`yes`: ✅☑️✔️ · `sparkles`: ✨💫

**Nature** — `tree`: 🌳🌲🌴 · `leaf`: 🍃🍂🍁 · `earth`/`world`: 🌍🌎🌏 · `mountain`: ⛰️🏔️🗻 · `plant`: 🪴🌱🌿 · `rain`: 🌧️💧 · `star`/`stars`: ⭐🌟✨ · `flower`/`flowers`: 🌸🌼🌷🌺

**Food and produce** — `cake`: 🎂🍰 · `candy`: 🍬🍭🍫 · `bread`/`toast`: 🍞🥖 · `meat`: 🍖🍗 · `pepper`: 🌶️🫑 · `apple`: 🍎🍏 *(existing)* · `icecream`/`ice cream`: 🍦🍨 *(existing)*

**Animals** — `dog`/`puppy`: 🐶🐕🐩 *(extends existing, plus the facing fix)* · `cat`/`kitty`: 🐱🐈 *(plus the facing fix)* · `bear`: 🐻🐻‍❄️ · `bird`: 🐦🕊️ · `fish`: 🐠🐟🐡 *(existing)* · `dino`/`dinosaur`, `dragon`, `unicorn` *(existing, unchanged)*

**Vehicles** — `car`/`cars`: 🚗🚙 · `truck`: 🚚🚛 · `plane`/`airplane`: ✈️🛩️ · `train`/`choo`: 🚂🚃 *(existing)*

**Clothes** — `hat`: 🎩🧢👒 · `shoe`/`shoes`: 👟👞🥾 · `shirt`: 👕👚

**Places and things** — `house`/`home`: 🏠🏡 · `castle`: 🏰🏯 · `key`: 🔑🗝️ · `money`: 💵💸💰 *(extends existing)*

**Body** — `hand`: 🖐️✋🤚

**Party** — `party`/`yay`/`hooray`/`congrats`/`fun`: 🎉🎊 *(existing, unchanged)*

### Deliberately not given families

A record of the rule working, so nobody re-proposes these:

- `soccer`, `basketball`, `football`, `baseball`, `tennis`, `volleyball`, `rose`, `tulip`, `poodle` — specific words. The whole point of the generic/specific split.
- `boat` — mixed facing on a `run` path, no third glyph (see step 3).
- `cloud` — 🌤️⛅🌥️ read as "partly cloudy", not as "a cloud".
- `pizza`, `cookie`, `egg`, `donut`, `rock`, `coin`, `gem`, `trophy` — one true glyph each.
- `red`, `blue`, `green`, … — a colour word washes the screen; it never reaches the emoji swarm.
- `monster` — 👹🧌 skew scarier than this app's tone.
- `bunny`/`rabbit`, `mouse`, `cow`, `pig`, `tiger` — 🐇🐁🐄🐖🐅 exist, but each pairs a head-on primary with a side-on sibling on a `run` path. Available later if the facing fix from step 3 is extended to them; out of scope here, where the fix is applied only to the two words that already carry the bug.

## 5. Tests

`tests/unit/wordEmoji.spec.js`:

- Every `WORD_FAMILY` key exists in `WORD_EMOJI` — catches typos and dictionary drift.
- Every value is a non-empty array of non-empty strings, with no duplicates inside a family.
- `familyForWord` is case-insensitive, and returns `null` for a word it does not hold.

`tests/unit/wordEffect.spec.js`:

- `resolveWordEffect('ball').options.emojiSet` contains ⚽, 🏀 and 🏈.
- `resolveWordEffect('soccer').options.emojiSet` is `undefined` and `options.emoji` is still ⚽ — the generic/specific rule, asserted rather than assumed.
- The word's own emoji is first in the pool, for every word that has a family.
- `options.emoji` is set for every word in the dictionary — the invariant the old `if`/`else` broke.

`tests/unit/wordMotion.spec.js`:

- `motionForWord('dog').facing` and `motionForWord('cat').facing` are `'left'`; the remaining `FRONT_FACING` words (`lion`, `bus`, `robot`) still assert `'any'`. This updates existing assertions.
- `motionForWord()` returns no `emojiSet` for any word.

## Files

| File | Change |
|---|---|
| `src/features/typing/utils/wordEmoji.js` | Add `WORD_FAMILY` and `familyForWord()`; document the three rules |
| `src/features/effects/utils/wordMotion.js` | Delete the `emojiSet` entries and plumbing; drop dog/puppy/cat/kitty from `FRONT_FACING` |
| `src/features/effects/utils/wordEffect.js` | Always set `options.emoji`; build `options.emojiSet` as `[emoji, ...family]`, deduped |
| `tests/unit/wordEmoji.spec.js` | Family-table integrity |
| `tests/unit/wordEffect.spec.js` | Pool composition |
| `tests/unit/wordMotion.spec.js` | Update the dog/cat facing assertions |
| `ROADMAP.md` | Move this entry from Planned to Shipped |
| `README.md` | List the feature, per the precedent in commits `16b828e` and `5911ee5` |

No new file, so `FILE_STRUCTURE.md` is untouched. `useEmojis.js`, `Emojis.vue`, `EmojiEffect.vue`, `WordGuide.vue`, `useWordGuide.js` and `emojiEasterEggs.js` are untouched.

## Verification

1. `grep -rn emojiSet src tests` before the deletion in step 3, to confirm the three known sites are the only ones.
2. `npm test` — the suite plus the new cases. The existing "every word in the library animates" sweep and the "carries the ball emoji into the effect" assertion are the regression net for the `wordEffect.js` change.
3. `npm run build` — the typecheck gate, per this repo's `CLAUDE.md`.
4. `npm run dev`, and type in one session: **ball** (mixed balls arcing, none floating off the top), **heart** (mixed hearts throbbing), **star**, **tree**, **hearts** (💕 now present), and **soccer** — which must be ⚽ only, the control case for the whole generic/specific rule.
5. Then the five **travelling families**, whose members must all be drawn pointing the same way. This is a font fact no test can check, and the standard set by *Motion That Matches Meaning* is that every travelling glyph is rendered and looked at before being classified. Type each and watch a swarm going both directions: **dog** (🐶🐕🐩), **cat** (🐱🐈), **car** (🚗🚙), **truck** (🚚🚛), **plane** (✈️🛩️). If a member points the other way, drop that member from the family rather than fighting `facing`.
6. Tap the same words in the word guide. `effectForWord` is shared, so a tap must look identical to typing the word.

## Out of scope, worth a roadmap line

- **The guide could show the family.** A card shows one glyph today. Showing four may weaken the word→picture association the guide exists for, so it is a product call, not a follow-through.
- **`useEasterEggs.js:28-32`** still converts `emojis` → `emojiSet` for the `$5` special. Left alone: it is the one effect no dictionary word carries.
- **The rejected animal pairs** (`bunny`, `mouse`, `cow`, `pig`, `tiger`) become available if the step-3 facing fix is applied to them too. Cheap, but it is five more words changing how they flip, and this plan keeps that change to the two words that already have the bug.
