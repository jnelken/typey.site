# Keep Words and Settings reachable (DEV-207)

The Words and Settings controls are part of the page header, so they scroll out
of view as a child moves through typing history. Keep the header sticky at the
top of the viewport, with an opaque theme-aware background so history remains
readable beneath it.

The sticky header creates a stacking context. Its layer (`1450`) stays above the
fixed typing input (`100`) and animations (`1000`–`1400`), but below the global
modal overlay (`1500`). The Settings modal remains owned by the toolbar and can
still cover those interactive layers; the Words modal can cover the header too.

The browser regression in `tests/browser/toolbar-scroll.mjs` checks actual page
scrolling, viewport bounds, hit targets, both menus, focus restoration, and the
Settings → Secret Words transition at desktop, tablet, phone, and short
landscape sizes. External requests are blocked; local API requests are mocked.
