# Keep Words and Settings reachable (DEV-207)

> **Status:** Implemented before 2026-11-18; archived by advance-roadmap. Evidence: sticky toolbar work in `src/App.vue` / `src/style.css`, `tests/browser/toolbar-scroll.mjs`; ROADMAP.md “📌 Reachable Words and Settings”.

The Words and Settings controls are part of the page header, so they scroll out
of view as a child moves through typing history. Keep the header sticky at the
top of the viewport, with theme-aware surfaces behind its readable controls.

The sticky header creates a stacking context. Its layer (`1450`) stays above the
fixed typing input (`100`) and animations (`1000`–`1400`), but below the global
modal overlay (`1500`). Only the title and toolbar receive a translucent
day-theme surface; the empty header space passes pointer events through so it
neither hides scenery nor swallows an effect tap. In Goodnight, those control
surfaces are transparent so the moon and stars remain visible. The Settings
modal remains owned by the toolbar and can still cover those interactive layers;
the Words modal can cover the header too.

The browser regression in `tests/browser/toolbar-scroll.mjs` creates a taller
in-app test surface and verifies document scrolling past the entire toolbar,
viewport bounds, hit targets, both menus, focus restoration, Goodnight scenery,
and the Settings → Secret Words transition at desktop, tablet, phone, and short
landscape sizes. External requests are blocked; local API requests are mocked.
