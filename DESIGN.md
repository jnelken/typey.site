---
name: Typey Site
description: A bright, spacious word playground where typing becomes action.
colors:
  primary: "#ff6b6b"
  secondary: "#4ecdc4"
  tertiary: "#feca57"
  success: "#48e5a3"
  background: "#f8f9fa"
  surface: "#ffffff"
  text-primary: "#2f3640"
  text-secondary: "#57606f"
  text-light: "#a4b0be"
  mistake: "#2f6fed"
  night-background: "#0b1026"
  night-surface: "#141a35"
  night-text-primary: "#f4f6ff"
  night-text-secondary: "#d8ddf5"
  night-text-light: "#a7b0d8"
  night-primary: "#ffd88a"
  night-moon: "#fdf6d8"
  blackout: "#000000"
  group-vermillion: "#D55E00"
  group-orange: "#E69F00"
  group-yellow: "#F0E442"
  group-green: "#009E73"
  group-blue: "#0072B2"
typography:
  display:
    fontFamily: "Courier New, monospace"
    fontSize: "clamp(2.25rem, 11vw, 5rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "0.02em"
  headline:
    fontFamily: "Courier New, monospace"
    fontSize: "4rem"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "normal"
  title:
    fontFamily: "Comic Sans MS, Comic Neue, Chalkboard SE, Segoe UI, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.5
    letterSpacing: "normal"
  body:
    fontFamily: "Comic Sans MS, Comic Neue, Chalkboard SE, Segoe UI, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Courier New, monospace"
    fontSize: "0.875rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "normal"
rounded:
  sm: "4px"
  md: "8px"
  lg: "16px"
  xl: "24px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  "2xl": "48px"
  "3xl": "64px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: "16px 24px"
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.surface}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: "16px 24px"
  button-tertiary:
    backgroundColor: "{colors.tertiary}"
    textColor: "{colors.text-primary}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: "16px 24px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    padding: "8px 16px"
  toolbar-action:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "4px 16px"
  input-default:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: "16px 24px"
    width: "100%"
  modal-panel:
    backgroundColor: "rgba(255, 255, 255, 0.97)"
    textColor: "{colors.text-primary}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: "16px 20px 24px"
    width: "min(720px, 92vw)"
  word-card:
    backgroundColor: "#f4f7fb"
    textColor: "{colors.text-primary}"
    typography: "{typography.body}"
    rounded: "12px"
    padding: "12px 8px"
  typing-dock:
    backgroundColor: "{colors.background}"
    textColor: "{colors.text-primary}"
    typography: "{typography.headline}"
    padding: "24px"
    width: "100%"
---

# Design System: Typey Site

## Overview

**Creative North Star: "The Word Playground"**

Typey Site is a bright, spacious, and gently playful environment where language becomes action. The default stage is calm enough for a five-year-old to understand immediately: a pale open canvas, one enormous line of type, a single practice prompt, and rounded controls that feel welcoming rather than technical. Emoji and expressive motion supply the surprise; the learning surface itself stays direct and legible.

The system is softly layered throughout. Tonal changes establish the page, cards, dock, and modal; shadows reinforce those layers and respond to interaction without making every surface float. Rounded silhouettes and large type keep the interface approachable, while Courier New gives typed letters the steady rhythm of a friendly typewriter.

Energy is responsive rather than constant. Slow or tentative input receives a quiet environment with ample negative space. As speed and accuracy increase, reward effects may accumulate into a denser, more thrilling scene. Worksheet, nursery, and arcade references are all available when a specific moment earns them; none is a permanent costume for the product chrome.

**Key Characteristics:**

- A calm, open baseline that protects the live typing task.
- Oversized monospaced letters for prompts, input, history, and child-facing labels.
- Strawberry Coral controls and feedback against Cloud White surfaces.
- Rounded, approachable controls supported by soft tonal and shadow layers.
- Emoji, sound, speech, and motion that make typed meaning visible.
- Reward density that grows with demonstrated speed and accuracy.

**The Responsive Energy Rule.** Keep the interface calm for slower input; increase the density and thrill of reward effects as speed and accuracy rise, without covering or destabilizing the letters being learned.

## Colors

The daytime palette pairs Strawberry Coral, Mint Teal, and Sunny Yellow with Cloud White and Pencil Graphite; special modes may temporarily repoint the same semantic roles.

### Primary

- **Strawberry Coral** (#ff6b6b): The main action, focus, caret, border, and correct-letter color. Its warmth carries encouragement without borrowing the semantics of an error red.

### Secondary

- **Mint Teal** (#4ecdc4): Secondary actions and hover feedback that need to remain clearly distinct from the main coral signal.
- **Success Mint** (#48e5a3): Discovered and successful states, used as a fresh confirmation rather than a competing primary action.

### Tertiary

- **Sunny Yellow** (#feca57): Tertiary actions and warm highlights that need dark foreground text.
- **Counting Vermillion** (#D55E00): The first step in the luminance-separated math-dot and battery sequence.
- **Counting Orange** (#E69F00): The second step in the shared counting sequence.
- **Counting Yellow** (#F0E442): The bright midpoint of the shared counting sequence.
- **Counting Green** (#009E73): The fourth, color-blind-aware counting group.
- **Counting Blue** (#0072B2): The final counting group and coolest end of the sequence.

### Neutral

- **Cloud White** (#f8f9fa): The slightly cool page ground that creates space without the glare of pure white.
- **Surface White** (#ffffff): The clean layer used for controls, fields, and elevated panels.
- **Pencil Graphite** (#2f3640): Primary text and the default typed-letter color.
- **Slate Pencil** (#57606f): Supporting text and section labels.
- **Mist Gray** (#a4b0be): De-emphasized prompts, placeholders, and letters that have not been typed yet.
- **Mistake Blue** (#2f6fed): Incorrect-letter feedback, deliberately distinct from Strawberry Coral's positive role.
- **Bedtime Indigo** (#0b1026): The page ground used by Goodnight mode.
- **Night Surface** (#141a35): The raised surface used on the bedtime palette.
- **Moonlit White** (#f4f6ff): Primary text against the bedtime ground.
- **Lavender Mist** (#d8ddf5): Supporting night-mode text.
- **Night Slate** (#a7b0d8): De-emphasized night-mode text.
- **Moon Gold** (#ffd88a): Night-mode actions and warm highlights.
- **Moon Cream** (#fdf6d8): The celestial accent used for the moon.
- **Blackout** (#000000): A literal loss-of-power state, not a general dark theme.

**The Feedback Color Rule.** Strawberry Coral marks correct or primary states and Mistake Blue marks incorrect letters; essential feedback must also remain understandable from position, copy, or behavior rather than color alone.

**The Semantic Night Rule.** Special modes repoint semantic color roles together. Do not place daytime rainbow text or pale screen-color washes on the night palette when their contrast has not been verified there.

## Typography

**Display Font:** Courier New (with monospace fallback)  
**Body Font:** Comic Sans MS (with Comic Neue, Chalkboard SE, Segoe UI, system UI, and sans-serif fallbacks)  
**Label/Mono Font:** Courier New (with monospace fallback)

**Character:** Courier New makes individual letterforms, spacing, and caret position predictable for a beginning typist. The rounded primary stack softens supporting instructions and settings without letting ornamental script fallbacks compromise legibility.

### Hierarchy

- **Display** (700, fluid 2.25rem–5rem, 1.1): The centered word or amount a child is copying; long prompts step down to a smaller fluid range.
- **Headline** (400, 4rem, 1.2): The live input and completed-line history. This is the fixed beginner-reading scale and should not be reduced to solve layout problems.
- **Title** (700, 1.5rem, 1.5): Modal titles and the strongest supporting headings.
- **Body** (400, 1rem, 1.5): Instructions, descriptions, and supporting prose.
- **Label** (700, 0.875rem, 1.2): Toolbar actions, prompt labels, and compact child-facing controls; capitalization follows the typing setting where relevant.

**The Letters Lead Rule.** Anything the child copies, types, or recognizes as a word uses the monospaced voice; the rounded primary voice explains and supports.

**The Beginner Scale Rule.** Preserve the 4rem live typing scale. Adapt the container, wrapping, or surrounding density before shrinking the letters.

## Layout

The main app is a centered single-column stage capped at 1200px with 24px outer padding. A compact title-and-toolbar row sits above the centered prompt. History expands through the middle, while the live typing dock is fixed to the bottom edge and the short instruction floats immediately above it.

Spacing follows a 4px-based scale with deliberate jumps from compact control gaps to generous stage spacing. The base screen favors negative space so the word prompt and live input remain the only strong anchors. Word-guide content switches to an auto-filling card grid, while settings remain a single vertical stack.

At 560px and below, toolbar labels disappear and the emoji icons carry the actions. At 480px and below, the title steps down and large decorative night elements reduce. The word prompt uses viewport-aware type clamps, and the fixed input preserves the same large typing scale across breakpoints.

**The Calm Baseline Rule.** Empty space is functional: it gives a beginning typist one obvious place to look and leaves room for meaning-driven effects.

**The Earned Density Rule.** Increase animation count, overlap, and environmental activity in response to fast, accurate input; do not increase permanent control density or reduce reading space as a reward.

## Elevation & Depth

The system uses soft layering: Cloud White, Surface White, translucent panels, and pale card fills establish most depth, then shadows clarify floating or interactive states. The bottom input dock casts upward into the page, modals use the strongest ambient shadow, and buttons or word cards lift only in response to hover. Small through extra-large ambient shadow tokens provide a shared vocabulary, while focus rings remain crisp and low-spread.

### Shadow Vocabulary

- **Low Ambient** (`0 1px 2px rgba(0, 0, 0, 0.05)`): The quietest separation for small elements when tonal contrast is insufficient.
- **Medium Ambient** (`0 4px 6px rgba(0, 0, 0, 0.1)`): Modest raised regions.
- **Interactive Lift** (`0 10px 15px rgba(0, 0, 0, 0.1)`): Hovered buttons and toolbar actions.
- **Modal Float** (`0 10px 30px rgba(0, 0, 0, 0.2)`): Dialogs above the darkened page.
- **Typing Dock Edge** (`0 -4px 12px rgba(0, 0, 0, 0.1)`): Upward separation for the fixed input region.

**The Soft Layer Rule.** Establish hierarchy with surface tone first, then use ambient shadows to confirm a floating, fixed, or interactive relationship.

## Shapes

Corners are friendly and visibly rounded. The 16px radius is the dominant control and panel shape; 8px supports compact instructional surfaces, 24px is reserved for especially soft large containers, and full pills belong to small toolbar actions. Word cards use a deliberate 12px midpoint. Circular and organic silhouettes are reserved for balloons, dots, celestial elements, and other effects whose subject supplies the geometry.

Borders are usually two pixels where a control needs a large, child-readable outline. Focus and hover states change color or lift rather than adding decorative lines to unrelated surfaces.

**The Approachable Edge Rule.** Interactive chrome uses generous curves and clear outlines; content effects may use circles or organic silhouettes when they depict a recognizable thing.

## Components

### Buttons

Buttons are rounded, readable, and physically responsive without becoming heavy.

- **Shape:** Dominant 16px corners; compact toolbar actions use a full pill.
- **Primary:** Strawberry Coral fill, white text, two-pixel matching border, and size-based padding.
- **Secondary:** Mint Teal fill with white text.
- **Tertiary:** Sunny Yellow fill with Pencil Graphite text.
- **Ghost:** Transparent surface with Strawberry Coral text and border; hover inverts to a coral fill.
- **Hover / Focus:** Hover rises 2px and gains Interactive Lift. Active returns to the baseline. Global keyboard focus uses a visible coral outline.
- **Disabled:** Sixty-percent opacity, no lift, and a not-allowed cursor.

### Cards / Containers

Word cards are soft, discoverable tiles inside the guide rather than the main page structure.

- **Corner Style:** A 12px midpoint radius.
- **Background:** Pale cool card fill; discovered cards switch to a pale success tint and green border.
- **Shadow Strategy:** Flat at rest, then a small upward move and ambient shadow on hover.
- **Internal Padding:** 12px vertically and 8px horizontally, with a 6px icon-to-word gap.

### Inputs / Fields

Standard fields are white, fully rounded, and outlined with the light neutral token. Hover moves the border to Mint Teal; focus moves it to Strawberry Coral and adds a subtle coral ring. Disabled fields dim and return to the page ground.

The typing input is a special transparent native field precisely overlaid on the visible animated text. It owns the native caret and interaction while the display layer owns color, ghost completion, speech highlighting, and effects; both layers must share font, line height, inset, and geometry exactly.

### Navigation

The top toolbar is a compact pair of Strawberry Coral pill outlines set in bold Courier New. Labels follow the capitalization setting and disappear below 560px, leaving the emoji icons as the mobile treatment. Hover fills the pills, reverses text to white, and adds the shared lift.

### Modal

Dialogs use a half-black overlay and a nearly opaque white panel, constrained to 720px or 92vw and 80vh. A 16px radius, generous padding, and the strongest ambient shadow create a soft, unmistakable layer above the playground.

### Word Prompt

The prompt is the largest element on the page: a centered bold monospaced word paired with one meaning-bearing emoji. Correct letters turn Strawberry Coral, the first relevant mismatch turns Mistake Blue, and remaining letters stay Mist Gray. Tapping the prompt previews its effect.

### Typing Dock

The fixed bottom dock is the child's primary work surface. It uses the page ground, a two-pixel Strawberry Coral top edge, an upward shadow, 24px padding, and 4rem Courier New. The dock remains calm and stable even when reward effects elsewhere become dense.

## Do's and Don'ts

### Do:

- **Do** keep the default stage spacious enough that the prompt and live input are immediately obvious.
- **Do** use Courier New for words the child copies, types, or revisits.
- **Do** preserve 4rem live typing and solve fit through layout or wrapping.
- **Do** scale reward density with speed and accuracy while leaving core controls stable.
- **Do** use semantic color roles so Goodnight and blackout modes can repoint the full system safely.
- **Do** pair essential color feedback with position, text, motion, or another non-color cue.

### Don't:

- **Don't** let animations, emoji, or accumulated rewards cover the active letters or caret.
- **Don't** make sustained arcade density the baseline chrome; reserve that intensity for earned effects and special moments.
- **Don't** use ornamental script fallbacks for beginner-facing text.
- **Don't** mix daytime rainbow or screen-wash colors into the night palette without verifying contrast.
- **Don't** add account, progress, or analytics visuals that imply product capabilities Typey Site does not have.
