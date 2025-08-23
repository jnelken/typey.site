# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `npm run dev` - Starts Vite dev server on port 5173
- **Build**: `npm run build` - Creates production build in `dist/` directory  
- **Preview**: `npm run preview` - Preview production build locally
- **Tests**: `npm test` - Run Jest test suite
- **Test with watch**: `npm run test:watch` - Run tests in watch mode
- **Test coverage**: `npm run test:coverage` - Generate test coverage reports
- **Test UI**: `npm run test:ui` - Run tests with verbose output

## Project Architecture

### Technology Stack
- **Vue 3** with Composition API and `<script setup>` syntax
- **Vite** for build tooling and development server
- **Jest** with Vue Testing Library for testing
- **Netlify** for hosting with serverless functions
- **Web APIs**: Speech Synthesis API, Web Audio API

### Application Structure

This is a Vue 3 single-page application built around a typing interface for kids. The architecture follows Vue 3 composition patterns with clear separation of concerns:

#### Core State Management
- **`useTypingApp.js`**: Central composable that manages all application state using Vue's provide/inject pattern
- State includes: current text, completed lines, toggle states for caps lock, auto-speak, sound, and speech
- Handles keyboard events, text processing, and integration with audio/speech systems

#### Key Composables
- **`useSound.js`**: Manages Web Audio API for keystroke and enter key sound effects
- **`useSpeech.js`**: Handles Speech Synthesis API for text-to-speech functionality with word-by-word highlighting
- **`useTypingApp.js`**: Main application logic and state management

#### Component Hierarchy
- **`App.vue`**: Root component that provides typing app context and handles global focus management
- **`Controls.vue`**: Toggle buttons for sound, speech, auto-speak, and caps lock features
- **`TypingArea.vue`**: Displays completed lines with click-to-speak and animated highlighting during speech
- **`InputSection.vue`**: Main typing input with keyboard event handling

#### UI Component System
Located in `src/ui/`, provides reusable components:
- **`Container.vue`**: Layout wrapper with responsive design
- **`Text.vue`**: Typography component with size, color, and alignment props
- **`Button.vue`**: Interactive button with hover effects
- **`ToggleButton.vue`**: Specialized toggle control
- **`Input.vue`**: Form input component
- **`AnimatedText.vue`**: Text with animation capabilities

#### API Integration
- **Netlify Functions**: Two serverless functions in `netlify/functions/`
  - `submit-entry.js`: Stores typing entries for external companion app
  - `latest-entry.js`: Retrieves most recent entry
- **Tidbyt Integration**: Companion app in `tidbyt-companion/` displays recent typing on Tidbyt displays

### Code Patterns

#### Vue 3 Composition API
- All components use `<script setup>` syntax
- State management through composables with provide/inject
- Reactive references using `ref()` and `reactive()`

#### Event Handling
- Keyboard events processed in `useTypingApp.js` with caps lock transformation
- Global click handling for input focus management
- Speech synthesis with progressive word highlighting

#### Testing Structure
- **Unit tests**: Individual composables and utilities in `tests/unit/`
- **Integration tests**: Component interactions in `tests/integration/`
- **Test setup**: Custom matchers and global setup in `tests/setup.js`

## Development Notes

### Deployment
- Builds to `dist/` directory for Netlify static hosting
- Serverless functions deployed to `/.netlify/functions/`
- Uses Vite's build optimization with manual Vue.js chunk splitting

### Browser Compatibility
- Speech Synthesis API requires user interaction on some browsers (especially mobile Safari)
- Web Audio API used for sound effects with fallback handling
- Responsive design works across desktop and mobile devices

### State Persistence
- Application state is ephemeral (resets on page refresh)
- Completed lines are submitted to Netlify functions for external display
- No local storage or session persistence implemented