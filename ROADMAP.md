# 🚀 Typey Site Roadmap

## ✅ Shipped

### 🎨 Emoji Mode

Shipped 2026-09-06. Every letter, digit and common symbol renders as a matching
emoji — letters map to an object whose spoken name starts with that letter (A → 🍎,
B → 🐻), digits use keycap emoji, so VoiceOver reads the line naturally. Off by
default, toggled from the settings menu, persisted across refreshes. The mapping
is display-only, so speech, easter eggs and word suggestions still work on the
real text. See `src/features/typing/utils/emojiMode.js`.

### 🤪 Silly Mode

Shipped 2026-09-06, and changed on 2026-09-07 to send its words rather than
stack them — see **Silly Mode Sends Its Own Words** below. Typing "silly" on its
own line starts a run of random words from the emoji library, so each one has a
picture behind it, and they match caps lock. The run stops on "silly" again, on
Escape, or by itself at `SILLY_MAX_WORDS` so a forgotten tab stays quiet. See
`src/features/easter-eggs/utils/sillyMode.js`.

### 🌈 Color Mode

Shipped 2026-09-06. Typing "color" (or "colour") on its own line paints every
character a different color, cycling a seven-hue rainbow across the line and on
through the history; typing it again puts the text back. Like emoji mode it is
display-only, so a screen reader still gets the letters that were typed, and
the read-aloud highlight keeps its own color on the word being spoken. Every
hue is contrast-checked against the page background in
`tests/unit/colorMode.spec.js`, which is why "yellow" lands as a deep gold — a
bright yellow cannot reach WCAG AA on a near-white page. See
`src/features/easter-eggs/utils/colorMode.js`.

**Decisions this made that the concept left open**, all cheap to change: the
palette is seven fixed hues rather than a generated spectrum; the color follows
the raw character index, so spaces take a turn in the cycle; the mode is
ephemeral like the other easter eggs rather than persisted like emoji mode; and
history lines drop their usual 0.7 fade while it is on, so the checked contrast
actually holds there.

### 🎬 Motion That Matches Meaning

Shipped 2026-09-07. Which animation a word gets is now a property of the word
rather than a hash of its spelling: the dictionary's own categories decide, so
animals and vehicles run across the screen, food and fruit are thrown and fall
back, weather rains and space floats. A travelling glyph turns to face the way
it's going, and each word also carries a flourish — spin, bobble, grow, pulse or
throb — layered on top of its path. See
`src/features/effects/utils/wordMotion.js`.

The rendering is four nested elements, one per concern (travel, gravity height,
flourish, facing), because the flourish and the flip both used to be written as
`transform` on the element whose keyframes already animated `transform`, where
they were silently overwritten. The inner two use the individual `rotate` and
`scale` properties instead, which compose independently.

**Facing is a font fact, not a code fact.** Every travelling glyph was rendered
and looked at before being classified; the defaults that survived are recorded
in `FRONT_FACING` and the per-word `facing` overrides. A glyph drawn head-on
(🐱, 🚌) is marked so it never flips, since turning it around only moves its
whiskers.

### 📖 One Dictionary

Shipped 2026-09-07. The app had three overlapping vocabularies: 28 hand-written
"magic words", ~600 dictionary words the practice prompts drew on, and a
typeahead that previewed only the first list — so typing "cook" hinted at
nothing even though 🍪 was already in the library. There is one list now.
`wordEmoji.js` is the source of truth for vocabulary, category and motion, and
the guide, the typeahead, the prompts and the ghost text all read it. What's
left in `emojiEasterEggs.js` is the one effect no word can carry: `$5` raining
five bills. Counting ("5 lions") generalised along the way, so it works for
every word rather than the fifteen that had a hand-written regex.

### ✍️ Spelling Feedback and a Slimmer Header

Shipped 2026-09-07. The title and toolbar collapse into one slim row and the
prompt takes the space they gave up, at display size in the typing font. Each of
its letters turns red as it's spelled correctly and blue where it isn't — with
the untyped letters dimmed, which is what makes the change visible at all, since
the prompt's own colour was already the "correct" red. The line being typed is
coloured the same way, but only while it's plainly an attempt at the prompt
(`isAttemptingPrompt` in `src/features/typing/utils/spelling.js`). Color Mode
wins over both while it's on. `↑` on an empty input brings the last line back
for editing.

Only the *first* mismatch goes blue. Past that point the spelling and the word
have come apart, so the letters no longer line up with the positions they'd be
marked against; the rest of the word goes quiet instead. And a wrong *first*
letter turns the whole thing off — a child typing "dinosaur" while the prompt
says "cookie" isn't spelling it wrong, they're spelling something else.

### 🎨 The Screen Takes the Colour You Type

Shipped 2026-09-07. Sending a line that names a colour washes the whole page in
it — the ground, the input strip along the bottom, the help pill — and it holds
until the next line is sent, whatever that line says. It works by re-pointing
`--color-background` on the document root, so every surface that already read
that variable follows without being told.

The washes are pale rather than saturated. The app draws text in one near-black
everywhere, and a full-strength ground would leave a child reading their own
typing against nothing; every value is contrast-checked against both that text
and the dimmed prompt letters in `tests/unit/screenColor.spec.js`. That check is
also why "black" lands as a slate grey — on actual black there is nothing left
to read. See `src/features/effects/utils/screenColor.js`.

### 🌈 Rainbow, and a List You Can Find Again

Shipped 2026-09-07. "rainbow" was planned as an easter egg of its own, cycling
whole colour themes; there is one palette by design, so the word now lands on
Color Mode instead of being a second mode that does nearly the same thing. It
is a trigger alias in `COLOR_TRIGGERS`, nothing more.

The other half is remembering any of this. Every typed trigger — `$5`, a sum,
`silly`, `color` / `rainbow`, a colour name, `qwerty` — is listed with a line
saying what it does, and **Settings → Secret Words** opens that list on its
own. The words were already in the guide, but underneath six hundred dictionary
cards, which is not somewhere you find them. Typing "qwerty" still opens the
full guide. See `SECRET_WORDS` in
`src/features/typing/composables/useWordGuide.js`.

### 🤪 Silly Mode Sends Its Own Words

Shipped 2026-09-07. A silly run used to type its words into the input and leave
them there, so twenty words piled into one line that only animated if the child
happened to press Enter. Each word is now **sent on its own** — one dictionary
word per line, with its animation — five of them, three seconds apart, which is
about how long a word takes to cross the screen and land.

The word **replaces** the line rather than joining it. The send handler clears
the input only after awaiting the API call, so a word left in the box would ride
along with the next one on a slow network — which is the pile-up this change
exists to stop. The cost is that a half-typed word is overwritten while a run is
going; the run is five words and Escape stops it.

A run also never sends a word that is itself a mode trigger, even though
`silly` and `rainbow` are perfectly good dictionary words with pictures: a
trigger returns early from the send handler, so it plays no animation — and
those two would stop the run and switch Color Mode on respectively. `SILLY_WORDS`
in `src/features/easter-eggs/utils/sillyMode.js` is the library minus that set.

## 📐 Planned

### 🍉 Produce Splatter and the Colour It Leaves Behind

Designed, not yet built — the full plan is in
[`docs/plans/produce-splatter.md`](docs/plans/produce-splatter.md).

Produce is already thrown on the gravity paths and lands at the bottom of the
screen, where it currently just fades out. It should **burst** instead: fruit on
`lob` and `arc` splits at the top of its arc, fruit on `bounce` splats on first
ground contact, both spraying coloured droplets. The word's colour then washes
the page the same way typing a colour does, lasting until the next line is sent.

Two decisions worth knowing without opening the plan. **No fruit-ninja library**
— they are canvas- or Phaser-based, and everything here is CSS keyframes on DOM
nodes, so one could not reuse the existing paths or be driven by the dictionary.
And the produce-to-colour map holds *colour names*, not hexes, so every wash
resolves through `SCREEN_COLORS` and the contrast test in
`tests/unit/screenColor.spec.js` covers the feature for free.

The droplet burst lands as `src/ui/Splatter.vue`, built to take a palette rather
than a single colour so Party Mode below can reuse it as-is.

### 🔋 What `%` Does

Designed, not yet built — the full plan is in
[`docs/plans/percent-battery.md`](docs/plans/percent-battery.md).

`$5` is the app's only punctuation trigger; `%` currently does nothing at all,
falling through every branch of `evaluateEasterEggs` and landing silently. Typing
`50%` should draw a **battery charged to half** — a horizontal bar filling left to
right on a looping full-screen canvas, built as a sibling of `src/features/math/`
rather than as another emoji spawn.

Three decisions worth knowing without opening the plan. **A battery rather than a
pizza with a slice eaten**: every numeric trigger here maps the number to what
*appears* — `$5` gives five bills, `5` gives five balloons, `2 + 3` gives five
dots — and "50% eaten" would invert that rule exactly once, for the most abstract
quantity in the app. **Two colour bands, not three**: a red/amber/green fill can't
be drawn, because Okabe-Ito orange measures 2.25:1 against white and the palette
has no darker amber, so it is vermillion below 20% and green above — the same wall
that made the "yellow" wash a deep gold. And `% 50` **changes** rather than gains a
behaviour: it floats fifty balloons today, and will charge a battery instead.

Percent joins the practice prompts across the full 1–100 range. `'%': '💯'` is
already in `emojiMode.js`, so those prompts render whole with Emoji Mode on.

### 🎨 Emoji Families

Designed, not yet built — the full plan is in
[`docs/plans/emoji-families.md`](docs/plans/emoji-families.md).

Typing a word spawns a swarm of one emoji: eight identical ⚽ arcing across the
screen for "ball". A ball is not only a soccer ball, though — it is
⚽🏀🏈⚾🎾🏐, and all of them should fly. The dictionary already supports a pool
of glyphs (`emojiSet`, used by fourteen words such as `fish` → 🐠🐟🐡); this
sweeps all 489 words for the same opportunity, landing about twenty-eight
families, and moves the mechanism next to the words it describes.

Three decisions worth knowing without opening the plan. **Every member of a
family must itself be a correct picture of the word** — 🏈 is a ball, 🎳 and ⛳
are not — which is what keeps a spelling app honest: generic words get families,
so `ball` mixes but `basketball` stays 🏀. Because the rule is about correctness
of the picture, selection stays uniform and no weighting is needed. **A family
belongs to the word, not to its number**: `star` gets the same mix as `stars`,
which retires today's deliberate singular/plural split for star, heart and
flower — the plan's one intentional regression. And **families move out of
`wordMotion.js` into `wordEmoji.js`**, because which glyphs a word can be drawn
as is a dictionary fact, not a motion fact.

The sweep also turns up a live bug. `facing` applies to every glyph in a swarm,
so a family that mixes a head-on glyph with a side-on one on a travelling path
sends the side-on member backwards half the time — which is what `dog`
(🐶 + 🐕) and `cat` (🐱 + 🐈) do today, since both sit in `FRONT_FACING` and
never flip. Dropping those four words from that list fixes it, because flipping
a head-on glyph is a no-op; `FRONT_FACING` is an optimisation, not a
correctness guard.

## 🥚 Easter Egg Ideas

### 🌙 Dark Theme Trigger

- **Trigger**: Typing the word "goodnight"
- **Effect**: Automatically switches to a dark theme with stars and moon
- **Implementation**: Word detection in input, theme switching logic
- **Decided**: Color Mode is **off while the dark theme is on**, rather than
  growing a second palette. The seven hues in `colorMode.js` are contrast-checked
  against the light background only (`tests/unit/colorMode.spec.js`) and would
  fail AA on a dark ground; the same goes for the screen-colour washes in
  `screenColor.js`.

### 🎭 Additional Easter Egg Concepts

- **Party Mode**: Typing "party" bursts confetti from each character as it lands,
  and from the sides of the screen when the line is sent. Confetti and produce
  splatter are the same primitive — a burst of small coloured particles from a
  point — so this should be built on `Splatter.vue` from **Produce Splatter**
  above rather than as a second particle system.
- **`50% cookie`**: eat a proportion of any dictionary word's picture, reusing
  `findWordEmoji` the way `5 lions` already does. Needs **What `%` Does** above
  first, and needs one constraint decided before it's built: a wedge cut through
  🍪 reads as *eaten*, but the same wedge through 🦁 reads as *broken*, so it has
  to be restricted to the food and fruit categories with a fallback for the rest.

## 🔍 Research Needed

- Accessibility considerations for all new modes

## 📊 User Analytics

### **Core Metrics to Track**

- **Time Spent**: How long users interact with the typing page
- **Settings Used**: Which buttons/controls at the top were clicked
- **Easter Egg Discovery**: Which easter eggs were triggered and how oftengs

### **Analytics Implementation**

- **Tool**: PostHog — decided, so this no longer needs a vendor call, only an
  account, a project key and the client wiring.
- **Privacy-First Approach**: No personal data collection
- **Anonymous Tracking**: Session-based analytics without user identification
- **Performance Monitoring**: Load times, responsiveness metrics
- **A/B Testing Framework**: Test different UI variations and features

### **Dashboard & Insights**

- **Simple Stats View**: Time spent, popular settings, easter egg usage
- **Easter Egg Popularity**: See which ones users discover and enjoy most
- **Settings Usage**: Understand which controls are most valuable to users

## 🎯 Success Metrics

- User engagement with easter eggs
- Accessibility compliance
- Performance impact of new features
- User feedback and feature requests
