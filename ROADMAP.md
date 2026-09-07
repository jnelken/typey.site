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
