# 🚀 Typey Site Roadmap

## ✅ Shipped

### 🎨 Emoji Mode

Shipped 2026-09-06. Every letter, digit and common symbol renders as a matching
emoji — letters map to an object whose spoken name starts with that letter (A → 🍎,
B → 🐻), digits use keycap emoji, so VoiceOver reads the line naturally. Off by
default, toggled from the settings menu, persisted across refreshes. The mapping
is display-only, so speech, easter eggs and word suggestions still work on the
real text. See `src/features/typing/utils/emojiMode.js`.

### 🤪 Silly Mode

Shipped 2026-09-06, and changed on 2026-09-07 to send its words rather than
stack them — see **Silly Mode Sends Its Own Words** below. Typing "silly" on its
own line starts a run of random words from the emoji library, so each one has a
picture behind it, and they match caps lock. The run stops on "silly" again, on
Escape, or by itself at `SILLY_MAX_WORDS` so a forgotten tab stays quiet. See
`src/features/easter-eggs/utils/sillyMode.js`.

### 🌈 Color Mode

Shipped 2026-09-06. Typing "color" (or "colour") on its own line paints every
character a different color, cycling a seven-hue rainbow across the line and on
through the history; typing it again puts the text back. Like emoji mode it is
display-only, so a screen reader still gets the letters that were typed, and
the read-aloud highlight keeps its own color on the word being spoken. Every
hue is contrast-checked against the page background in
`tests/unit/colorMode.spec.js`, which is why "yellow" lands as a deep gold — a
bright yellow cannot reach WCAG AA on a near-white page. See
`src/features/easter-eggs/utils/colorMode.js`.

**Decisions this made that the concept left open**, all cheap to change: the
palette is seven fixed hues rather than a generated spectrum; the color follows
the raw character index, so spaces take a turn in the cycle; the mode is
ephemeral like the other easter eggs rather than persisted like emoji mode; and
history lines drop their usual 0.7 fade while it is on, so the checked contrast
actually holds there.

### 🎬 Motion That Matches Meaning

Shipped 2026-09-07. Which animation a word gets is now a property of the word
rather than a hash of its spelling: the dictionary's own categories decide, so
animals and vehicles run across the screen, food and fruit are thrown and fall
back, weather rains and space floats. A travelling glyph turns to face the way
it's going, and each word also carries a flourish — spin, bobble, grow, pulse or
throb — layered on top of its path. See
`src/features/effects/utils/wordMotion.js`.

The rendering is four nested elements, one per concern (travel, gravity height,
flourish, facing), because the flourish and the flip both used to be written as
`transform` on the element whose keyframes already animated `transform`, where
they were silently overwritten. The inner two use the individual `rotate` and
`scale` properties instead, which compose independently.

**Facing is a font fact, not a code fact.** Every travelling glyph was rendered
and looked at before being classified; the defaults that survived are recorded
in `FRONT_FACING` and the per-word `facing` overrides. A glyph drawn head-on
(🐱, 🚌) is marked so it never flips, since turning it around only moves its
whiskers.

### 📖 One Dictionary

Shipped 2026-09-07. The app had three overlapping vocabularies: 28 hand-written
"magic words", ~600 dictionary words the practice prompts drew on, and a
typeahead that previewed only the first list — so typing "cook" hinted at
nothing even though 🍪 was already in the library. There is one list now.
`wordEmoji.js` is the source of truth for vocabulary, category and motion, and
the guide, the typeahead, the prompts and the ghost text all read it. What's
left in `emojiEasterEggs.js` is the one effect no word can carry: `$5` raining
five bills. Counting ("5 lions") generalised along the way, so it works for
every word rather than the fifteen that had a hand-written regex.

### ✍️ Spelling Feedback and a Slimmer Header

Shipped 2026-09-07. The title and toolbar collapse into one slim row and the
prompt takes the space they gave up, at display size in the typing font. Each of
its letters turns red as it's spelled correctly and blue where it isn't — with
the untyped letters dimmed, which is what makes the change visible at all, since
the prompt's own colour was already the "correct" red. The line being typed is
coloured the same way, but only while it's plainly an attempt at the prompt
(`isAttemptingPrompt` in `src/features/typing/utils/spelling.js`). Color Mode
wins over both while it's on. `↑` on an empty input brings the last line back
for editing.

Only the *first* mismatch goes blue. Past that point the spelling and the word
have come apart, so the letters no longer line up with the positions they'd be
marked against; the rest of the word goes quiet instead. And a wrong *first*
letter turns the whole thing off — a child typing "dinosaur" while the prompt
says "cookie" isn't spelling it wrong, they're spelling something else.

### 🎨 The Screen Takes the Colour You Type

Shipped 2026-09-07. Sending a line that names a colour washes the whole page in
it — the ground, the input strip along the bottom, the help pill — and it holds
until the next line is sent, whatever that line says. It works by re-pointing
`--color-background` on the document root, so every surface that already read
that variable follows without being told.

The washes are pale rather than saturated. The app draws text in one near-black
everywhere, and a full-strength ground would leave a child reading their own
typing against nothing; every value is contrast-checked against both that text
and the dimmed prompt letters in `tests/unit/screenColor.spec.js`. That check is
also why "black" lands as a slate grey — on actual black there is nothing left
to read. See `src/features/effects/utils/screenColor.js`.

### 🌈 Rainbow, and a List You Can Find Again

Shipped 2026-09-07. "rainbow" was planned as an easter egg of its own, cycling
whole colour themes; there is one palette by design, so the word now lands on
Color Mode instead of being a second mode that does nearly the same thing. It
is a trigger alias in `COLOR_TRIGGERS`, nothing more.

The other half is remembering any of this. Every typed trigger — `$5`, a sum,
`silly`, `color` / `rainbow`, a colour name, `qwerty` — is listed with a line
saying what it does, and **Settings → Secret Words** opens that list on its
own. The words were already in the guide, but underneath six hundred dictionary
cards, which is not somewhere you find them. Typing "qwerty" still opens the
full guide. See `SECRET_WORDS` in
`src/features/typing/composables/useWordGuide.js`.

### 🤪 Silly Mode Sends Its Own Words

Shipped 2026-09-07. A silly run used to type its words into the input and leave
them there, so twenty words piled into one line that only animated if the child
happened to press Enter. Each word is now **sent on its own** — one dictionary
word per line, with its animation — five of them, three seconds apart, which is
about how long a word takes to cross the screen and land.

The word **replaces** the line rather than joining it. The send handler clears
the input only after awaiting the API call, so a word left in the box would ride
along with the next one on a slow network — which is the pile-up this change
exists to stop. The cost is that a half-typed word is overwritten while a run is
going; the run is five words and Escape stops it.

A run also never sends a word that is itself a mode trigger, even though
`silly` and `rainbow` are perfectly good dictionary words with pictures: a
trigger returns early from the send handler, so it plays no animation — and
those two would stop the run and switch Color Mode on respectively. `SILLY_WORDS`
in `src/features/easter-eggs/utils/sillyMode.js` is the library minus that set.

### 🔋 Percent Battery

Shipped 2026-09-09, extended 2026-09-11 and 2026-09-13. Typing `50%` charges a
battery to half: it fills big in the middle of the screen, then flies up and
parks in the corner as a menubar-style indicator — percent on the left, battery
on the right — and stays there, losing a point of charge with every key pressed
until it reads 0% or Escape clears it. Values run 0–9999; anything over 100%
bursts a jagged jet of charge out past the terminal and sets off a
screen-filling electrical storm, and anything over 1000% is dangerous to type
against — see **Overcharged, the screen bites back** below.
Percent joins the practice prompts across 1–100. Built as a sibling of
`src/features/math/` rather than another emoji spawn. See `src/features/percent/`.

**Decisions this made that the concept left open.** **A battery rather than a
pizza with a slice eaten**: every numeric trigger here maps the number to what
*appears* — `$5` gives five bills, `5` gives five balloons, `2 + 3` gives five
dots — and "50% eaten" would invert that rule exactly once, for the most abstract
quantity in the app. A battery at 50% keeps the rule, and it is a proportion a
four-year-old has already seen an adult worry about. **An exact-fill bar with
ticks, not discrete segments**: the fill width is `percent / 100` of the inner
body, with marks at 25 / 50 / 75 drawn over it — a bar with no scale can't be
read, the same argument `dotLayout.js` makes for grouping dots into fives.
**Two colour bands, not three**: this is measured, not taste. Fill has to clear
WCAG 3:1 non-text contrast, and the harshest ground is the `black` wash
`#d4d8dd`, not white. Against that wash only Okabe-Ito blue clears unaided; no
palette colour can carry a low/high distinction on its own. The fill is stroked
in `COLOR_TEXT` `#2b2d42` instead, so WCAG 1.4.11 is satisfied by the boundary,
and both bands clear 3:1 against that outline — vermillion ≤20%, green above.
There is no amber middle because there is no darker amber in the palette that
reaches the floor; the same wall that made the "yellow" wash a deep gold. And
`% 50` **changes** rather than gains a behaviour: it floated fifty balloons
before, and now charges a battery instead.

**Decisions the persistent-battery extension made.** **It docks instead of
staying big**: a charge that drains per keystroke is only legible if the child
can see the input line and the number at the same time, and the hero-sized bar
sat directly over `TypingArea` and `InputSection`. The arrival animation keeps
the drama; the parked indicator keeps the app usable. It parks lower and smaller
below 640px, where the word prompt owns the band the corner would otherwise use.
**A drain keeps the same `id`**: `id` means "a new battery, replay the arrival",
so `drain()` changes only `percent` and the draw loop eases to the new value —
otherwise every keystroke would restart the 0→n fill. The old looping replay is
gone for the same reason: a bar that re-fills on a timer can't also report a
live value. **The storm is capped, not maximal**: flashes are held to three a
second at partial opacity rather than a white-out (WCAG 2.3.1, photosensitivity),
and the whole storm is skipped under `prefers-reduced-motion`. **The spill is
capped at `MAX_SPILL`**: at 999% an honest `percent / 100` bar would be ten
screens wide, so the jet caps its reach and the parked indicator shifts left by
however far it currently extends, sliding back as the charge drains.

### ⚡ Overcharged, the Screen Bites Back

Shipped 2026-09-13. Past 1000% the battery stops being an indicator and becomes
a hazard: the screen's own frame runs with electricity — a rail around the edge
with arcs travelling round it — and every letter typed is struck by a bolt off
that frame, which eats the letter and 1000% of charge with it. So a 3000% charge
is three letters the child will not get to keep, and the typing goes back to
normal (and the frame goes dark) the moment a zap drops the charge under the
line. Escape still clears everything. The typed range grows to four digits to
make the charge worth spending, and `900 + 900%` is the other way in. See
`src/features/percent/utils/electricFrame.js` and `useZaps.js`.

**Decisions this made that the concept left open.** **The letter lands before it
is eaten**: the bolt is fired on the keystroke but the line is cut ~260ms later,
because a letter that never appears is a dead key, not a joke — the child has to
watch it get hit. **1000% a zap, which is also the threshold**: charge is spent
in whole bolts rather than a percentage, so the indicator reads as "three shots
left" and a child can predict the next one. **The bolt aims at the last glyph on
the line**, measured once on the frame it is fired and remembered after that,
since by the time it lands the letter is gone; typing faster than the bolt is
harmless, each bolt just eats whatever is last when it arrives. **The frame is
travel, not flashing**: arcs move round the perimeter and the rail swells at
about 0.6Hz, nowhere near a flash rate (WCAG 2.3.1), and under
`prefers-reduced-motion` the rail stays lit while the travelling stops — the
state has to remain visible even when nothing may move. **Bolts wear a dark
casing**: yellow on a near-white page is the wall the battery's fill already hit,
so every jagged line is drawn `COLOR_TEXT` → yellow → white core. **Every
printable key is fair game, space included**: a keystroke always costs the
battery something, and charging 1000% for a letter but a single point for a
space would be both inconsistent and gameable. **Escape still eats the letter a
bolt already paid for**: the charge is spent at the keystroke, so cancelling the
bite would be the one place the accounting visibly failed.

**A known trade.** A wide equation and a docked battery share the top band, so
something like `900 + 900%` draws its `= 1800` under the indicator's own pill.
The pill keeps the charge legible and the dots still carry the answer; nudging
either one only moves the collision, so it stays as it is.

### 🎨 Emoji Families

Shipped 2026-09-09. Typing a word spawned a swarm of one emoji — eight identical
⚽ for "ball". A ball is not only a soccer ball, so `ball` now flies as
⚽🏀🏈⚾🎾🏐, and sixty-six words carry a family like it. The dictionary already
had the mechanism (`emojiSet`, used by fourteen entries such as `fish` → 🐠🐟🐡),
but it lived in the motion table; the whole 489-word dictionary is swept for the
same opportunity and the table moves into `wordEmoji.js`, next to the words it
describes, because which glyphs a word can be drawn as is a dictionary fact
rather than a motion fact. See `WORD_FAMILY` and `familyForWord` in
`src/features/typing/utils/wordEmoji.js`.

**The authoring rule.** Every member of a family must itself be a correct picture
of the word — 🏈 is a ball, 🎳 and ⛳ are not — which is what keeps a spelling app
honest. Generic words get families, so `ball` mixes but `basketball` stays 🏀;
`soccer` is the control case, asserted in `tests/unit/wordEffect.spec.js` rather
than assumed. Because the rule is about correctness of the picture, selection
stays uniform and no weighting is needed.

**A family belongs to the word, not to its number.** `star` gets the same mix as
`stars`, which retires the deliberate singular/plural split for star, heart and
flower — the one intentional regression. `hearts` also stops excluding its own
💕, which rejoins the swarm; it is a heart.

**The sweep fixed a live bug.** `facing` is per-word and applies to every glyph
in a swarm, so a family mixing a head-on glyph with a side-on one on a travelling
path sent the side-on member backwards half the time — which is what `dog`
(🐶 + 🐕) and `cat` (🐱 + 🐈) did, since both sat in `FRONT_FACING` and never
flipped. Dropping those four words from that list fixes it: flipping a head-on
glyph is a no-op, so the list is an optimisation and not a correctness guard.
The rule it leaves behind is that when a family mixes orientations on a
travelling path, take the side-on member's orientation. `boat` was rejected as a
family for exactly that reason — 🚤 faces left, ⛵ does not, and there is no third
glyph to break the tie.

### 💲 Equation Modifiers

Shipped 2026-09-13. An equation's answer can now be given units: a `$` or `%`
written against either number says what the total *is*, and the answer plays
that effect on top of the dot count-up. `2 + 3$` counts five dots and rains five
bills; `20 + 30%` counts to fifty and charges the battery to 50%; the spoken
line follows ("two plus three equals five dollars"), and the answer on screen is
drawn wearing its sign — `$5`, `5%`. Written either side of the number, the way
the money egg already took `$5` or `5$` and the battery took `50%` or `%50`. See
`modifier` in `src/features/math/utils/parseEquation.js`.

**Decisions this made that the concept left open.** **The modifier is additive,
not a replacement**: the dots still count, because the child's question is still
"what is two plus three" — the modifier only says what the five are worth. That
also keeps the app's standing rule that a number maps to what appears.
**Conflicts resolve to the last one typed** (`2% + 3$` rains bills): stated by
position in the line, so it reads left to right the way the child wrote it, and a
modifier on the ignored `=answer` counts too, since it is the most recent thing
they asked for. **Only the answer wears the sign** in the drawn equation; the
operands stay bare numbers, because they are the things being counted as dots.
**A modifier buys no new arithmetic**: `$2 - $5` is still `null`, the same
age-safe floor subtraction always had.

### 🌸 Things That Don't Travel Stay Put

Shipped 2026-09-14. **Motion That Matches Meaning** gave every word a path, but
a path was still assumed even for words naming things that never go anywhere: a
flower drifted up off the top of the screen like a balloon. There is now a path
that goes nowhere — `bloom` opens the glyph where it was planted, swelling it
over the effect's own life while a `spin` flair turns it. `flower`, `flowers`,
`rose`, `sunflower` and `tulip` take it. See `PATH_OPTIONS.bloom` in
`src/features/effects/utils/wordMotion.js` and `.effect-bloom` in
`src/ui/EmojiEffect.vue`.

**Decisions this made that the concept left open.** **The growth is a path, not
a flair**: a word gets exactly one flair and this effect needs two things at
once, so the swelling went on the path layer and left the flair slot free for
`spin` — which animates `rotate` on an inner element and so composes with it
rather than overwriting it, the same four-layer rule the travelling paths
already live by. Reusing the existing `grow` flair would have fought itself: it
fades to nothing *and* scales, so the bloom would have double-faded and lost its
turn. **A patch runs fewer and smaller**: twelve glyphs rather than float's
twenty, and a smaller size band, because a travelling glyph shares the screen
with its crowd for a moment while a stationary one sits in its patch for the
whole effect and keeps growing — the same twenty would have piled up rather than
read as flowers. **It opens and holds rather than popping**: `burst` was the
nearest existing path and was rejected, because a burst is an event and a bloom
is a thing that is *there*. **A `bloom` needs a `top` of its own**: every other
path is anchored to a screen edge in CSS and animates away from it, so only
`burst` was ever handed a vertical position; a path that never leaves its spawn
point needs one too, or the whole patch stacks into a single band. That rule is
now `PLACED_PATHS` rather than a check for one path by name. **The named flowers
came along**: `rose`, `sunflower` and `tulip` are the same thing said more
precisely, and `flower`'s own family already spawns 🌷 — a tulip that drifted
away when typed by name would have contradicted the tulip blooming beside it.

**Left deliberately undone.** The ticket also invited an audit of other rooted
words — `sun`, `tree`, `star`, and `plant` / `seed` / `grass` / `clover` beside
them. Those are a taste call rather than the same fix: `WORD_MOTION` records "the
sun and the moon just hang" as a decision and a spec asserts that sun, star and
moon float, so changing them means overruling a call already made, not filling a
gap. Raised on DEV-51 for a separate pass.

### 🍉 Produce Splatters, and the Colour It Leaves Behind

Shipped 2026-09-14. **Motion That Matches Meaning** already threw produce on the
gravity paths, but a thrown apple just faded out where it landed — the one place
the motion system promised an impact and didn't deliver one. Produce now
**bursts**: `lob` and `arc` split at the top of the arc, `bounce` splats on first
ground contact, both spraying coloured droplets from the glyph's own position.
The word's colour then washes the page exactly the way typing a colour does, and
clears on the next line sent. See `PRODUCE_COLORS` in
`src/features/effects/utils/screenColor.js` and `src/ui/Splatter.vue`.

**Decisions this made that the concept left open.** **The map holds colour
names, not hexes**: every wash resolves through `SCREEN_COLORS`, so the contrast
check in `tests/unit/screenColor.spec.js` covers the new feature for free and no
value can slip past the readability bar that file exists to hold. That is also
why `garlic` is brown rather than its literal white — `SCREEN_COLORS.white` on a
near-white page is an invisible splatter, which reads as a bug rather than as a
vegetable. **A named colour beats a produce word regardless of order**: "purple
banana" and "banana purple" are both purple, because the colour loop runs to
completion before produce gets a look in; the banana still splatters yellow.
**The droplets are not the text palette**: `SPLAT_COLORS` is saturated where
`COLOR_PALETTE` is AA-darkened, because droplets are `pointer-events: none`
decoration with no text on them and carry no contrast constraint — matching them
to the washes would only read muddy. **Which produce bursts mid-air and which
splats on the floor falls out of the path**, with no new randomness: `motionForWord`
is deterministic, so the watermelon always bursts in the air and the potato
always splats on the floor, and a child can learn that rather than re-guess it.
**Impact is timed, not event-driven**: a `bounce` impacts at 40% of its own
duration and `.emoji-lift` only animates on `arc` and `lob`, so `animationend`
fires at the wrong moment for two of the three paths — the component times off
`IMPACT_AT` instead, which is also what makes it testable with fake timers.
**No fruit-ninja library**: they are canvas- or Phaser-based, and every animation
here is CSS keyframes on DOM nodes, so one could neither reuse the existing paths
nor be driven by the dictionary. **The splatter fires on a guide tap but the wash
does not** — the burst lives in the effect pipeline `previewWord` shares, while
the wash is driven by `handleEnterKey`, which is exactly how screen colour
already behaves.

`Splatter.vue` takes a palette rather than a single colour, so Party Mode
(DEV-55) can reuse it for multi-coloured confetti without a rewrite — which is
what unblocked that ticket. A drift guard asserts `WORD_CATEGORIES.produce` and
`PRODUCE_COLORS` hold the same set, so a produce word added without a colour
fails the suite instead of silently not splattering.

### 🍪 A Bite Out of It

Shipped 2026-09-14. A percent written against something edible eats that much
of it: `50% cookie` leaves half a cookie on screen, `90% pizza` leaves a sliver,
`100% watermelon` leaves the ghost of one. The bite is a wedge out of the top,
running clockwise from twelve o'clock — the shape a missing slice of pie makes —
and what was eaten stays on screen faded back to an outline, so the proportion
reads as *this much is gone* rather than as an oddly shaped glyph. It generalises
the same way counting did: every one of the seventy-odd words in the dictionary's
`food` and `produce` categories works, with no per-word authoring. See
`src/features/eaten/`.

**Decisions this made that the concept left open.** **Only food gets bitten**,
which is the constraint the item said had to be stated before it could be built:
the wedge that reads as a bite out of 🍪 reads as *broken* through 🦁, so the gate
is the dictionary's own `food` and `produce` categories and everything else falls
through to the animation it already had — `50% lion` is still a pride of lions.
**The line's first picture-word decides, not its first food word**: `50% lion
cookie` is a lion line, because "which word is this line about" is one rule the
whole app shares (`findWordEmoji`, phrases first, plurals folded back) and a
second rule only this feature knew would be worse than the edge case it fixes.
**Over 100% goes back to the swarm**: there is no eating more than all of it, and
the four-digit range belongs to the battery, where an overcharge is the joke — so
`150% cookie` flies cookies the way it always did. **The proportion is carried by
angle, not by area of the clipping box**: food glyphs are drawn round inside their
square, so an angular wedge on a cookie is an area-proportional bite *of the
cookie*, which an area-proportional bite of the square would not be. Same
convention a pie chart uses, for the same reason. **No new paint on the page**:
the eaten part is the same glyph at low opacity and the label uses
`--color-text-primary`, so the feature introduces no colour that
`tests/unit/screenColor.spec.js` would have to start checking. **The number says "eaten"**: it is the
amount *gone* while the picture is what is *left*, which is the opposite of what
the battery's number means, so the word is what keeps the two from contradicting
each other. **A whole thing eaten fades less far** than a bitten one — at 100%
there is no full-opacity glyph beside the ghost to read it against, and at the
regular ghost opacity the page would just look like nothing happened. **It holds
rather than vanishing**, like the equation and unlike the battery: the plate
stays up until the next key is pressed, so a child can look at it, and Escape
clears it.

**Nothing was taken away from counting.** A percent never reached `countForWord`
in the first place — its pattern is `(\d+)\s*word` and the `%` sits between the
two — so `5 cookies` is still five cookies and `50% cookie` was previously just an
ordinary cookie swarm with the number ignored.

## 📐 Linear roadmap

Linear is the source of truth for live scope, status, and blockers. All tickets use the
`repo/typey.site` label.

| Order | Ticket | Blocked by | Demonstrable outcome |
| --- | --- | --- | --- |
| 1 | [DEV-54: Add the goodnight dark-theme trigger](https://linear.app/jnelken/issue/DEV-54) | None | Typing `goodnight` activates an accessible moon-and-stars theme with Color Mode disabled. |
| 2 | [DEV-55: Burst confetti in Party Mode](https://linear.app/jnelken/issue/DEV-55) | None | Typing `party` reuses the splatter primitive for character and edge confetti. |
| 3 | [DEV-56: Add privacy-first product analytics](https://linear.app/jnelken/issue/DEV-56) | PostHog account and project key | Anonymous analytics report time spent, settings use, easter-egg discovery, and performance. |

## Cross-cutting success criteria

- Preserve accessibility across every new mode, including contrast and reduced-motion behavior.
- Keep effects within the app's performance budget.
- Measure engagement without collecting personal data.
- Use feedback and usage data to decide which easter eggs and settings deserve more work.
