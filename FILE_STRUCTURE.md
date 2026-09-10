# 🏗️ Project Structure

Code is organised by feature. Anything shared across features lives in `src/ui`
(presentational components) or `src/constants`; anything that belongs to one
feature lives under `src/features/<feature>/`, split into `components/`,
`composables/` and `utils/`.

```
typey.site/
├── src/
│   ├── features/
│   │   ├── typing/                       # The typing surface itself
│   │   │   ├── components/
│   │   │   │   ├── InputSection.vue       # The line being typed, plus the input
│   │   │   │   ├── SettingsMenu.vue       # Settings modal
│   │   │   │   ├── Toolbar.vue            # Words / Settings buttons
│   │   │   │   ├── TypingArea.vue         # Completed lines, click to speak
│   │   │   │   ├── WordGuide.vue          # The whole dictionary, browsable
│   │   │   │   └── WordPrompt.vue         # The word to copy, lit letter by letter
│   │   │   ├── composables/
│   │   │   │   ├── useTypingAPI.js        # Submits lines to the Tidbyt companion
│   │   │   │   ├── useTypingEvents.js     # Keyboard handling
│   │   │   │   ├── useTypingSettings.js   # Persisted toggles
│   │   │   │   ├── useTypingState.js      # Current line and history
│   │   │   │   ├── useWordGuide.js        # Guide visibility, search, discovery
│   │   │   │   └── useWordPrompt.js       # Prompt history and matching
│   │   │   └── utils/
│   │   │       ├── emojiMode.js           # Character → emoji rendering
│   │   │       ├── promptWords.js         # Words, numbers and amounts to practise
│   │   │       ├── spelling.js            # Letter-by-letter feedback
│   │   │       ├── wordEmoji.js           # THE DICTIONARY — words, emoji, categories
│   │   │       └── wordSuggest.js         # Ghost-text completion
│   │   ├── effects/                       # What happens when a line lands
│   │   │   ├── components/                # Balloons.vue, Emojis.vue
│   │   │   ├── composables/               # useBalloons, useEmojis, useScreenColor
│   │   │   └── utils/
│   │   │       ├── wordMotion.js          # How each word moves: path, flair, facing
│   │   │       ├── wordEffect.js          # Turns that into spawn arguments
│   │   │       └── screenColor.js         # A colour word washes the whole page
│   │   ├── easter-eggs/                   # Hidden modes and their triggers
│   │   │   ├── composables/               # useEasterEggs, useColorMode, useSillyMode
│   │   │   └── utils/                     # colorMode.js, sillyMode.js, typeahead.js
│   │   ├── math/                          # "2 + 3" count-up animation
│   │   │   ├── components/MathAnimation.vue
│   │   │   ├── composables/useMathAnimation.js
│   │   │   └── utils/                     # dotLayout.js, parseEquation.js
│   │   ├── percent/                       # "50%" battery charge animation
│   │   │   ├── components/BatteryAnimation.vue
│   │   │   ├── composables/usePercentAnimation.js
│   │   │   └── utils/parsePercent.js
│   │   └── audio/
│   │       └── composables/               # useSound.js, useSpeech.js
│   ├── composables/
│   │   └── useTypingApp.js                # Wires every feature together (provide/inject)
│   ├── constants/
│   │   ├── balloons.js
│   │   ├── emojiEasterEggs.js             # Effects no dictionary word can carry ($5)
│   │   ├── layout.js
│   │   └── palette.js                     # Shared Okabe-Ito colours (dots + battery)
│   ├── ui/                                # Shared presentational components
│   │   ├── AnimatedText.vue               # Per-character text: speech, colour, feedback
│   │   ├── Balloon.vue
│   │   ├── Button.vue
│   │   ├── Container.vue
│   │   ├── EmojiEffect.vue                # One animated emoji, in four layers
│   │   ├── Input.vue
│   │   ├── Modal.vue
│   │   ├── Text.vue
│   │   └── ToggleButton.vue
│   ├── utils/storage.js
│   ├── App.vue
│   ├── main.js
│   └── style.css
├── docs/plans/                            # Design docs for in-flight work
├── netlify/functions/                     # submit-entry.js, latest-entry.js
├── tidbyt-companion/                      # Tidbyt display app
├── tests/
│   ├── unit/
│   ├── integration/
│   └── setup.js
├── public/
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Where things belong

| If you're adding… | It goes… |
| --- | --- |
| A word a child can type | `src/features/typing/utils/wordEmoji.js`, in the right category |
| A different way a word should move | `src/features/effects/utils/wordMotion.js` |
| A new animation path or flourish | `src/ui/EmojiEffect.vue`, then name it in `wordMotion.js` |
| A hidden mode with its own trigger word | `src/features/easter-eggs/` |
| A punctuation-triggered canvas animation (like `%` or `+`) | `src/features/percent/` or `src/features/math/`, sibling feature slices |
| A component two features both need | `src/ui/` |

The dictionary is the source of truth. Adding a word there puts it into the
practice prompts, the word guide, ghost-text spelling help and the typeahead
preview, and gives it an animation — no other file needs to know about it.
