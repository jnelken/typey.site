# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The primary user today is the creator's five-year-old child, who is beginning to learn how to type. The intended next users are the child's friends and other family members at a similar stage.

Parents are a secondary audience: they decide whether the activity is worthwhile and should be able to recognize that the child is actively learning while having fun.

## Product Purpose

Typey Site is an open-ended typing playground that helps young children learn by choosing words, copying prompts, typing freely, hearing letters and lines, and seeing their input produce immediate playful feedback.

Success means children choose to keep typing and are learning through that use. It also means parents appreciate the product as a genuinely useful activity, not only passive entertainment.

## Positioning

Typey Site turns the act of typing into the interaction: letters are spoken, completed lines can be read aloud, and words, numbers, equations, and secret triggers produce effects related to their meaning. Discovery and direct cause-and-effect motivate practice without requiring a structured curriculum, an account, or progress tracking.

## Operating Context

- Children use the web app on desktop or mobile, with a keyboard or the available device input.
- A child can copy a practice prompt or type freely, press Enter to complete a line, revisit recent lines, and replay speech.
- Words can be browsed and selected from the in-app guide; some behaviors are intentionally discovered through secret words and experimentation.
- Sound, speech, automatic read-aloud, emoji rendering, prompts, and capitalization can be adjusted without creating an account. These preferences persist locally in the browser.
- In the creator's local setup, completed lines can optionally appear on a Tidbyt display. This integration is not required for the public web experience.

## Capabilities and Constraints

- The product provides large live typing, word prompts, spelling feedback, line history, keystroke sounds, browser speech synthesis, ghost-word completion, and word-driven visual effects.
- The experience includes playful modes and typed interactions for emoji, color, night, parties, arithmetic, percentages, and food.
- The product is privacy-first and has no user accounts or learning-progress tracking. Its only analytics are anonymous, per-page-load PostHog events about which easter eggs, settings, and controls are used, visible time on the page, and load performance; they never include what a child typed or any identifier that persists between visits.
- Browser speech support varies by platform and can require user interaction, especially on mobile browsers and Safari.
- The local Tidbyt bridge (the separate tidbyt-api service) must keep its device ID and API key to itself rather than exposing them to the browser.
- The current production submission endpoint receives completed text and derives a request IP even though it has no persistent database. This is an implementation gap against the privacy-first product commitment and must not become durable storage or tracking without an explicit product decision.

## Brand Commitments

- The product name is **Typey Site**.
- The voice is playful, direct, encouraging, and understandable to a young child.
- Typing remains the center of the experience; delight should reward the child's input rather than replace it.
- Large, plainly legible text is a durable requirement for beginner readers and typists.

## Evidence on Hand

- The runnable Vue application and its automated tests demonstrate the current typing, speech, prompting, settings, word-guide, animation, and local Tidbyt capabilities.
- [README.md](README.md) documents the current usage model and feature set.
- [FILE_STRUCTURE.md](FILE_STRUCTURE.md) identifies the word dictionary as the source of truth shared by prompts, the guide, spelling suggestions, previews, and effects.
- The current primary user is the creator's five-year-old child. There is not yet confirmed broader usage, formal learning-efficacy evidence, usage analytics, testimonials, or a structured curriculum; future work must not fabricate those claims.

## Product Principles

1. **Learning happens through active typing.** Every major reward should follow from the child pressing keys, spelling, correcting, or completing a line.
2. **Give immediate, understandable feedback.** Large text, speech, sound, and visual reactions should make the relationship between input and result obvious to a five-year-old.
3. **Use discovery to sustain practice.** Prompts offer a clear starting point while free typing, word effects, and secret behaviors reward curiosity.
4. **Keep the experience simple and private.** A child should be able to begin immediately without an account, consent prompt, or progress-tracking machinery, and nothing measured about play should identify the child or carry their words.
5. **Let play support legibility.** Effects may be surprising and expressive, but they must preserve the child's ability to read and understand what they typed.

## Accessibility & Inclusion

- Preserve the large, legible typing display and clear keyboard focus behavior.
- Do not rely on color alone for essential feedback. Where color is used, maintain the existing color-blind-aware approach and sufficient contrast.
- Speech and sound are supportive channels, not prerequisites; the core typing experience must remain usable when either is unavailable or disabled.
- Keep controls and layouts usable on both desktop and mobile web.
