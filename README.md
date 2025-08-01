# 🎯 Typey Site

A fun, interactive typing application designed for kids with sound effects, text-to-speech, and visual feedback. Built with Vue 3 and modern web technologies.

## ✨ Features

### 🎹 **Interactive Typing**

- **Real-time typing** with visual feedback
- **Sound effects** for each keystroke
- **Caps Lock mode** for uppercase typing
- **Auto-scroll** to keep content in view

### 🔊 **Speech Synthesis**

- **Letter-by-letter speech** as you type
- **Line-by-line speech** when you press Enter
- **Historical line playback** - click any completed line to hear it spoken
- **Progressive highlighting** - see words highlight as they're spoken
- **Cross-platform compatibility** - works on macOS, Windows, and mobile

### 🎨 **Visual Design**

- **Modern, clean interface** with smooth animations
- **Responsive design** that works on all devices
- **Accessibility features** for inclusive use
- **Customizable themes** and styling

### 🎮 **User Experience**

- **Intuitive controls** with clear visual feedback
- **Hover effects** and smooth transitions
- **Keyboard navigation** support
- **Mobile-friendly** touch interactions

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/typey.site.git
   cd typey.site
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory, ready for deployment.

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests with verbose output
npm run test:ui
```

### Test Structure

- **Unit Tests** (`tests/unit/`) - Test individual composables and functions
- **Integration Tests** (`tests/integration/`) - Test component interactions and user flows
- **Test Setup** (`tests/setup.js`) - Global test configuration and mocks

### Test Coverage

The test suite covers:

- ✅ Speech synthesis functionality
- ✅ Typing app state management
- ✅ Component rendering and interactions
- ✅ User input handling
- ✅ Accessibility features
- ✅ Visual feedback systems

## 🏗️ Project Structure

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

## 🎯 Usage

### Basic Typing

1. **Start typing** in the input field at the bottom
2. **Hear each letter** as you type (if speech is enabled)
3. **Press Enter** to complete a line and hear it spoken
4. **View your history** in the scrolling area above

### Controls

- **🎵 Sound Toggle** - Enable/disable keystroke sounds
- **🗣️ Speech Toggle** - Enable/disable text-to-speech
- **🔄 Auto-Speak Toggle** - Automatically speak completed lines
- **⇪ Caps Lock** - Force uppercase typing

### Historical Lines

- **Click any completed line** to hear it spoken again
- **Watch progressive highlighting** as words are spoken
- **Scroll through your typing history**

## 🔧 Configuration

### Layout Constants

Edit `src/constants/layout.js` to customize:

- Bottom margin spacing
- Maximum height for typing area
- Spacing values throughout the app

### Speech Settings

The speech synthesis can be customized in `src/composables/useSpeech.js`:

- Speech rate (speed)
- Speech pitch
- Voice selection preferences
- Highlighting timing

## 🌐 Browser Compatibility

- **Chrome** 88+ ✅
- **Firefox** 85+ ✅
- **Safari** 14+ ✅
- **Edge** 88+ ✅
- **Mobile browsers** ✅

### Speech API Support

- **Desktop browsers** - Full speech synthesis support
- **Mobile browsers** - Limited but functional
- **macOS Safari** - Requires user interaction for speech

## 🚀 Deployment

### Netlify (Recommended)

1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Deploy automatically on push to main branch

### Other Platforms

The built files in `dist/` can be deployed to any static hosting service:

- Vercel
- GitHub Pages
- AWS S3
- Firebase Hosting

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines

- Write tests for new features
- Follow Vue 3 Composition API patterns
- Use TypeScript for type safety (optional)
- Maintain accessibility standards
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Vue 3** for the amazing reactive framework
- **Web Speech API** for text-to-speech functionality
- **Web Audio API** for sound effects
- **Vite** for fast development and building
- **Jest** and **Testing Library** for comprehensive testing

## 📞 Support

If you have questions or need help:

- Open an issue on GitHub
- Check the documentation
- Review the test examples

---

**Made with ❤️ for kids learning to type!**
