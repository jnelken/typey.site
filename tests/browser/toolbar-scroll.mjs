#!/usr/bin/env node
/**
 * DEV-207 regression — the Words and Settings buttons stay reachable while the
 * typing page is scrolled.
 *
 * Standalone (`node tests/browser/toolbar-scroll.mjs`) rather than a Jest spec:
 * jsdom has no layout, so nothing in `tests/unit` or `tests/integration` can
 * see a button leave the viewport. This drives a real Chromium against a real
 * Vite server.
 *
 * Two things this file is careful about, because either would quietly make it
 * pass against the broken layout:
 *
 *  - It never uses `locator.click()`. Playwright's actionability check scrolls
 *    an element into view first, which is exactly the symptom under test. Every
 *    interaction here is `page.mouse.click(x, y)` at a measured coordinate, and
 *    the scroll position is re-asserted afterwards.
 *  - It refuses to run a viewport where the document cannot scroll far enough
 *    to carry the buttons off-screen (`maxScroll > docTop`), so a layout change
 *    that merely removed the page's overflow could not make the check vacuous.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import { chromium } from 'playwright';

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
);

const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'tablet', width: 1024, height: 768 },
  // Below the 560px breakpoint, where the toolbar drops its text labels.
  { name: 'narrow phone', width: 375, height: 667 },
  // A short landscape phone — the least headroom the header ever gets.
  { name: 'short landscape', width: 667, height: 375 },
];

const BUTTONS = ['Words', 'Settings'];

const failures = [];
let checks = 0;

const check = (label, ok, detail = '') => {
  checks += 1;
  if (ok) {
    console.log(`  ✓ ${label}`);
    return true;
  }
  const line = `${label}${detail ? ` — ${detail}` : ''}`;
  console.log(`  ✗ ${line}`);
  failures.push(line);
  return false;
};

/** Settle a frame so a scroll or a Vue re-render has landed before measuring. */
const settle = page =>
  page.evaluate(
    () =>
      new Promise(resolve =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );

const scrollTo = async (page, y) => {
  await page.evaluate(top => window.scrollTo(0, top), y);
  await settle(page);
  return page.evaluate(() => window.scrollY);
};

const metrics = page =>
  page.evaluate(() => ({
    scrollY: window.scrollY,
    maxScroll: Math.max(
      0,
      document.documentElement.scrollHeight - window.innerHeight,
    ),
    innerHeight: window.innerHeight,
    innerWidth: window.innerWidth,
  }));

/** Viewport-relative box of a toolbar button, found by its visible label. */
const buttonBox = (page, label) =>
  page.evaluate(name => {
    const button = Array.from(document.querySelectorAll('.toolbar-btn')).find(
      candidate => candidate.textContent.includes(name),
    );
    if (!button) return null;
    const rect = button.getBoundingClientRect();
    return {
      top: rect.top,
      bottom: rect.bottom,
      left: rect.left,
      right: rect.right,
      width: rect.width,
      height: rect.height,
      cx: rect.left + rect.width / 2,
      cy: rect.top + rect.height / 2,
    };
  }, label);

/** What the user's finger would actually land on at this point. */
const hitAt = (page, x, y) =>
  page.evaluate(
    ({ px, py }) => {
      const el = document.elementFromPoint(px, py);
      if (!el) return { found: false, description: 'nothing' };
      const button = el.closest('.toolbar-btn');
      return {
        found: true,
        button: button ? button.textContent.replace(/\s+/g, ' ').trim() : null,
        description: `${el.tagName.toLowerCase()}${
          el.className && typeof el.className === 'string'
            ? `.${el.className.trim().split(/\s+/).join('.')}`
            : ''
        }`,
      };
    },
    { px: x, py: y },
  );

const openOverlayTitle = page =>
  page.evaluate(() => {
    const overlay = document.querySelector('.modal-overlay');
    if (!overlay) return null;
    const heading = overlay.querySelector('.modal-header h2');
    return heading ? heading.textContent.trim() : '';
  });

/** Coordinate click on text inside the open overlay (the close ✕, an action). */
const overlayControlBox = (page, selector, text) =>
  page.evaluate(
    ({ sel, needle }) => {
      const overlay = document.querySelector('.modal-overlay');
      if (!overlay) return null;
      const target = Array.from(overlay.querySelectorAll(sel)).find(candidate =>
        needle ? candidate.textContent.includes(needle) : true,
      );
      if (!target) return null;
      const rect = target.getBoundingClientRect();
      return { cx: rect.left + rect.width / 2, cy: rect.top + rect.height / 2 };
    },
    { sel: selector, needle: text },
  );

const typingInputFocused = page =>
  page.evaluate(() => {
    const input = document.querySelector('.input-section input');
    return Boolean(input) && document.activeElement === input;
  });

/**
 * The header's own geometry at every scroll position that matters, plus a
 * hit test, so a button that is drawn in the viewport but covered still fails.
 */
const assertReachable = async (page, when) => {
  const { innerHeight, innerWidth, scrollY } = await metrics(page);

  for (const label of BUTTONS) {
    const box = await buttonBox(page, label);
    if (!check(`${label} button exists (${when})`, box !== null)) continue;

    check(
      `${label} is inside the viewport (${when})`,
      box.top >= 0 &&
        box.bottom <= innerHeight &&
        box.left >= 0 &&
        box.right <= innerWidth,
      `rect top=${box.top.toFixed(1)} bottom=${box.bottom.toFixed(1)} ` +
        `left=${box.left.toFixed(1)} right=${box.right.toFixed(1)}, ` +
        `viewport ${innerWidth}x${innerHeight}, scrollY=${scrollY.toFixed(1)}`,
    );

    check(
      `${label} has a real hit target (${when})`,
      box.width > 0 && box.height > 0,
      `${box.width}x${box.height}`,
    );

    const hit = await hitAt(page, box.cx, box.cy);
    check(
      `${label} is the topmost element at its own centre (${when})`,
      hit.found && hit.button !== null && hit.button.includes(label),
      `point (${box.cx.toFixed(1)}, ${box.cy.toFixed(1)}) hit ${
        hit.description
      }`,
    );
  }
};

/** Open a menu by clicking the button where it is now, and check it opened. */
const openFromToolbar = async (page, label, expectedTitle, when) => {
  const before = await metrics(page);
  const box = await buttonBox(page, label);
  if (!check(`${label} button measurable (${when})`, box !== null)) return false;

  await page.mouse.click(box.cx, box.cy);
  await settle(page);

  const title = await openOverlayTitle(page);
  const opened = check(
    `clicking ${label} while scrolled opens ${expectedTitle} (${when})`,
    title === expectedTitle,
    `overlay title was ${title === null ? 'absent' : `"${title}"`}`,
  );

  const after = await metrics(page);
  check(
    `opening ${label} did not scroll the page (${when})`,
    Math.abs(after.scrollY - before.scrollY) < 1,
    `${before.scrollY.toFixed(1)} → ${after.scrollY.toFixed(1)}`,
  );

  return opened;
};

const closeOverlay = async (page, when) => {
  const closeBox = await overlayControlBox(page, '.modal-close');
  if (!check(`overlay has a close button (${when})`, closeBox !== null)) return;

  await page.mouse.click(closeBox.cx, closeBox.cy);
  await settle(page);

  check(
    `overlay closes while scrolled (${when})`,
    (await openOverlayTitle(page)) === null,
  );
};

const runViewport = async (browser, viewport) => {
  console.log(`\n${viewport.name} (${viewport.width}x${viewport.height})`);

  const page = await browser.newPage({
    viewport: { width: viewport.width, height: viewport.height },
  });

  // Typed lines go to the Tidbyt bridge and the Netlify functions; neither is
  // running here and neither is what this test is about.
  await page.route('**/api/tidbyt**', route =>
    route.fulfill({ status: 200, body: '{}' }),
  );
  await page.route('**/.netlify/functions/**', route =>
    route.fulfill({ status: 200, body: '{}' }),
  );
  // Anything off localhost (analytics) never leaves the machine.
  await page.route('**/*', route => {
    const url = new URL(route.request().url());
    if (url.hostname === '127.0.0.1' || url.hostname === 'localhost') {
      return route.continue();
    }
    return route.abort();
  });

  try {
    await page.goto(pageUrl, { waitUntil: 'load' });
    await page.waitForSelector('.toolbar-btn');
    await settle(page);

    const baseline = await metrics(page);
    const wordsBox = await buttonBox(page, 'Words');
    const docTop = wordsBox ? wordsBox.top + baseline.scrollY : 0;

    // Guard against a vacuous run: if the document cannot scroll past the
    // header, nothing below proves anything.
    if (
      !check(
        'document scrolls far enough to carry the toolbar off-screen',
        baseline.maxScroll > docTop,
        `maxScroll=${baseline.maxScroll.toFixed(1)}px, toolbar top in the ` +
          `document=${docTop.toFixed(1)}px`,
      )
    ) {
      return;
    }

    await assertReachable(page, 'unscrolled');

    const mid = await scrollTo(page, Math.round(baseline.maxScroll / 2));
    check('page is scrolled at the midpoint', mid > 0, `scrollY=${mid}`);
    await assertReachable(page, 'mid scroll');

    const bottom = await scrollTo(page, baseline.maxScroll + 1000);
    check(
      'page is scrolled to the bottom',
      bottom > 0 && bottom >= baseline.maxScroll - 1,
      `scrollY=${bottom}, maxScroll=${baseline.maxScroll}`,
    );
    await assertReachable(page, 'max scroll');

    // Settings, opened and used from the scrolled page.
    if (await openFromToolbar(page, 'Settings', '⚙️ Settings', 'max scroll')) {
      const { innerWidth, innerHeight } = await metrics(page);
      const overTheInput = await hitAt(page, innerWidth / 2, innerHeight - 10);
      check(
        'the settings overlay sits above the fixed input bar',
        overTheInput.found &&
          (await page.evaluate(
            ({ px, py }) =>
              Boolean(document.elementFromPoint(px, py)?.closest('.modal-overlay')),
            { px: innerWidth / 2, py: innerHeight - 10 },
          )),
        `bottom of the screen hit ${overTheInput.description}`,
      );

      const toggleBox = await overlayControlBox(page, 'button', 'Sound');
      check('a settings toggle is measurable', toggleBox !== null);
      if (toggleBox) {
        const onToggle = await page.evaluate(
          ({ px, py }) =>
            Boolean(
              document.elementFromPoint(px, py)?.closest('.modal-overlay'),
            ),
          { px: toggleBox.cx, py: toggleBox.cy },
        );
        check(
          'the Sound toggle is clickable where it is drawn',
          onToggle,
          'its centre is covered by something outside the overlay',
        );
      }

      await closeOverlay(page, 'max scroll');
      check(
        'closing settings left the page scrolled',
        (await metrics(page)).scrollY > 0,
      );
      await page.waitForTimeout(700);
      check(
        'the typing input gets focus back after settings closes',
        await typingInputFocused(page),
      );
    }

    // Words, opened and used from the scrolled page.
    if (
      await openFromToolbar(page, 'Words', '✨ Words to Type ✨', 'max scroll')
    ) {
      await closeOverlay(page, 'max scroll');
      await page.waitForTimeout(700);
      check(
        'the typing input gets focus back after the word list closes',
        await typingInputFocused(page),
      );
    }

    // Settings → Secret Words still hands over to the word list.
    await scrollTo(page, baseline.maxScroll + 1000);
    if (await openFromToolbar(page, 'Settings', '⚙️ Settings', 'secret words')) {
      const secretBox = await overlayControlBox(page, 'button', 'Secret Words');
      if (check('Secret Words is measurable', secretBox !== null)) {
        await page.mouse.click(secretBox.cx, secretBox.cy);
        await settle(page);
        check(
          'Secret Words replaces settings with the secret word list',
          (await openOverlayTitle(page)) === '🤫 Secret Words 🤫',
          `overlay title was ${await openOverlayTitle(page)}`,
        );
        await closeOverlay(page, 'secret words');
      }
    }

    await assertReachable(page, 'after using both menus');
  } finally {
    await page.close();
  }
};

let pageUrl;

const main = async () => {
  const server = await createServer({
    configFile: path.join(repoRoot, 'vite.config.js'),
    root: repoRoot,
    logLevel: 'warn',
    // Override the config's `host: true`; this test has no business on the LAN.
    server: { host: '127.0.0.1', port: 0, strictPort: false },
  });

  let browser;
  try {
    await server.listen();
    const address = server.httpServer.address();
    pageUrl = `http://127.0.0.1:${address.port}/`;
    console.log(`Serving ${pageUrl}`);

    browser = await chromium.launch();
    for (const viewport of VIEWPORTS) {
      await runViewport(browser, viewport);
    }
  } finally {
    if (browser) await browser.close();
    await server.close();
  }

  console.log(`\n${checks - failures.length}/${checks} checks passed`);
  if (failures.length) {
    console.error(`\n${failures.length} failing check(s):`);
    failures.forEach(line => console.error(`  - ${line}`));
    process.exitCode = 1;
    return;
  }
  console.log('Toolbar stays reachable at every scroll position.');
};

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
