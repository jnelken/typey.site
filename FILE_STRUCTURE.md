# 🏗️ Project Structure

```
typey.site/
├── src/
│   ├── components/          # Vue components
│   │   ├── Controls.vue     # Control panel (speech, sound toggles)
│   │   ├── InputSection.vue # Main typing input area
│   │   └── TypingArea.vue   # Historical lines display
│   ├── composables/         # Vue 3 composables
│   │   ├── useSound.js      # Audio/sound management
│   │   ├── useSpeech.js     # Speech synthesis
│   │   └── useTypingApp.js  # Main app state and logic
│   ├── constants/           # Application constants
│   │   └── layout.js        # Layout and spacing constants
│   ├── ui/                  # Reusable UI components
│   │   ├── AnimatedText.vue # Text with animations
│   │   ├── Button.vue       # Button component
│   │   ├── Container.vue    # Layout container
│   │   ├── Input.vue        # Input field component
│   │   ├── Text.vue         # Text display component
│   │   └── ToggleButton.vue # Toggle button component
│   ├── App.vue              # Main application component
│   ├── main.js              # Application entry point
│   └── style.css            # Global styles
├── tests/                   # Test files
│   ├── unit/                # Unit tests
│   ├── integration/         # Integration tests
│   └── setup.js             # Test configuration
├── public/                  # Static assets
├── index.html               # HTML template
├── package.json             # Dependencies and scripts
├── vite.config.js           # Vite configuration
└── README.md                # This file
```
