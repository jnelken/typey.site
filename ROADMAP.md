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

Shipped 2026-09-06. Typing "silly" on its own line starts a run of random words
landing in the input, one a second, so a nonsense line builds itself and can be
sent with Enter for the usual animation. The words come from the emoji library,
so each one has a picture behind it, and they match caps lock. The run stops on
"silly" again, on Escape, or by itself after `SILLY_MAX_WORDS` (20) so a
forgotten tab stays quiet. See `src/features/easter-eggs/utils/sillyMode.js`.

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

## Upcoming Features

### 🌐 Unicode Mode

- **Description**: Maps each alphanumeric and symbol character to a random Unicode item
- **Status**: Planning
- **Implementation**: Character mapping system, random Unicode selection algorithm

## 🥚 Easter Egg Ideas

### 🌙 Dark Theme Trigger

- **Trigger**: Typing the word "goodnight"
- **Effect**: Automatically switches to a dark theme with stars and moon
- **Implementation**: Word detection in input, theme switching logic

### 🎭 Additional Easter Egg Concepts

- **Rainbow Mode**: Typing "rainbow" cycles through color themes
- **Party Mode**: Typing "party" adds confetti animations

## 🔍 Research Needed

- VoiceOver support for Unicode character names
- Accessibility considerations for all new modes

## 📊 User Analytics

### **Core Metrics to Track**

- **Time Spent**: How long users interact with the typing page
- **Settings Used**: Which buttons/controls at the top were clicked
- **Easter Egg Discovery**: Which easter eggs were triggered and how oftengs

### **Analytics Implementation**

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
