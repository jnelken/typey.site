# Repository Guidelines

## Project Structure & Module Organization

- Source: `src/` (Vue 3 app). Key areas: `src/components/`, `src/composables/` (e.g., `useTypingApp.js`, `useSpeech.js`), `src/ui/`, `src/constants/`.
- Tests: `tests/unit/`, `tests/integration/`, with `tests/setup.js` for jsdom and Web API mocks.
- Static/Build: `public/`, output in `dist/`.
- Serverless: `netlify/functions/` (e.g., `latest-entry.js`, `submit-entry.js`).
- Companion: `tidbyt-companion/` (Pixlet app). See `FILE_STRUCTURE.md` for a tree view.

## Build, Test, and Development Commands

- `npm run dev`: Start Vite dev server.
- `npm run build`: Production build to `dist/`.
- `npm run preview` or `npm run serve`: Preview the built app locally.
- `npm test`: Run Jest test suite.
- `npm run test:watch`: Watch mode for rapid feedback.
- `npm run test:coverage`: Generate coverage (text, lcov, html).

## Coding Style & Naming Conventions

- Indentation: 2 spaces; single quotes; end statements with semicolons.
- Vue: Composition API with `<script setup>`. Components in PascalCase (e.g., `TypingArea.vue`).
- Composables: camelCase starting with `use` (e.g., `useSound.js`).
- Constants: lower camel or descriptive (e.g., `constants/layout.js`).
- Functions (Netlify): kebab-case filenames (e.g., `submit-entry.js`).
- Imports: use alias `@` for `src` (e.g., `@/composables/useTypingApp`).

## Testing Guidelines

- Frameworks: Jest, @testing-library/vue, jsdom environment.
- Locations/Names: `tests/**/**.spec.js` under `unit/` or `integration/`.
- Coverage: collected from `src/**/*.{js,vue}` (excluding `src/main.js` and config/index files). Keep/raise coverage when adding features.
- Run locally: `npm test` or `npm run test:watch` before pushing.

## Commit & Pull Request Guidelines

- Commits: Imperative mood, concise (“Add”, “Fix”, “Update …”), scope optional; keep < 72 chars when possible.
- PRs: Clear description, linked issues, steps to test, and screenshots/GIFs for UI changes. Note any Netlify Function or `tidbyt-companion` impacts. Ensure `npm run build` and tests pass.

## Security & Configuration Tips

- Do not commit secrets. Use Netlify environment variables for serverless needs.
- Node 20 is used in deploy (`netlify.toml`).
- CORS/redirects configured in `netlify.toml`; prefer `/api/*` -> functions.
- Serverless storage is non-persistent here; integrate a DB before relying on stored entries.
