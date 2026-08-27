# Funny Click Texts System

**Date:** 2026-04-04
**Status:** Design
**Goal:** Random humorous/absurd/meta texts appear on click alongside the pixel counter. Adds personality and virality — players screenshot and share the funniest lines.

## Core Mechanics

### Trigger Rules

- **Base chance:** 15% per click shows a text (not every click — prevents fatigue)
- **Cooldown:** Minimum 3 seconds between texts (even if 15% triggers sooner)
- **Streak bonus:** 10+ rapid clicks (within 200ms each) → guaranteed text from "frenzy" pool
- **Stage unlock:** Each stage unlocks new text pools
- **First click:** Always shows a text (welcome/tutorial vibe)
- **Milestone clicks:** Always shows a text from milestone-specific pool

### Text Categories

| Category | Tone | Example (EN) | Trigger |
|---|---|---|---|
| **bio** | Pseudo-science, biology humor | "Mitosis? More like my-toe-sis" | Any click |
| **meta** | 4th wall, game-aware | "I know you're just clicking mindlessly" | Stage 2+ |
| **existential** | Absurd philosophy | "Does the cell click you?" | Stage 3+ |
| **glitch** | Fake errors, broken text | "ERR: too much biomass [OK]" | Stage 3+ (breach) |
| **aggressive** | Organism talks back | "Stop. Poking. Me." | Stage 4+ |
| **cosmic** | Lovecraftian escalation | "The membrane between worlds thins" | Stage 5 |
| **frenzy** | Rapid click reactions | "AAAAAAA" / "calm down" | Click streak 10+ |
| **milestone** | Progress-specific | "First blood" (first click ever) | On milestone |
| **golden** | Golden spore click | "JACKPOT" / "Shiny!" | Golden spore |
| **combo** | Combo system (from economy spec) | "COMBO x5! not bad" | Combo triggers |

### Text Pool Size

Target: **30-50 texts per category**, **10 categories** = **300-500 total texts per language**.

This is large enough to avoid repetition over a 30-minute session (~900 clicks × 15% chance = ~135 texts shown, from 300+ pool = low repeat rate).

### Duplicate Prevention

- Track last 20 shown text IDs in a ring buffer
- Never show same text twice in the buffer window
- If all eligible texts are in the buffer (tiny category), pick least-recently-shown

## Visual Presentation

### Floating Text Style

Texts appear separately from the "+N" pixel counter:

```
Position: Random offset from click point (±30px X, -20 to -40px Y above counter)
Font: Bold 14-18px, monospace for glitch category, sans-serif for others
Color: Varies by category:
  bio:          hsl(140, 80%, 70%)   — green, matches organism
  meta:         hsl(200, 60%, 80%)   — cyan, "system" feel
  existential:  hsl(270, 60%, 80%)   — purple, mystical
  glitch:       hsl(0, 0%, 90%)      — white, monospace, flickering opacity
  aggressive:   hsl(0, 80%, 65%)     — red, angry
  cosmic:       hsl(280, 90%, 70%)   — deep purple with glow
  frenzy:       hsl(50, 100%, 60%)   — yellow, energetic
  milestone:    hsl(45, 100%, 55%)   — gold
  golden:       hsl(45, 100%, 60%)   — bright gold with sparkle
  combo:        rainbow cycle          — hue shifts per frame
Animation:
  - Float up slower than numbers (vy: -25 to -35)
  - Slight horizontal drift (vx: ±5, random)
  - Longer lifetime: 2.5 seconds (vs 0.8 for numbers)
  - Scale: starts at 0.8, peaks at 1.0 at 0.3s, shrinks to 0.6 at end
  - Rotation: slight wobble ±3° for personality
```

### Special Presentations

- **Glitch texts:** Random character replacement mid-animation (swap 1-2 chars with Unicode garbage every 200ms)
- **Aggressive texts:** Shake animation (±2px random offset per frame for 0.5s)
- **Cosmic texts:** Slow fade-in (0.5s), text stays longer (4s), leaves afterimage
- **Frenzy texts:** All caps, larger font (22px), bounces

## Text Examples (Base Pool — English)

### bio (30+ texts)
```
"Cell division: now in stereo"
"Mitosis? More like my-toe-sis"
"That's one small click for a cell"
"Natural selection chose violence"
"Survival of the clickest"
"Your cells called. They want overtime pay"
"Reproducing... asexually, of course"
"Evolution speedrun any%"
"Darwin would be confused"
"Organic growth, inorganic effort"
"Biomass: increasing"
"Cytoplasm go brrr"
"The mitochondria is the powerhouse"
"DNA? More like D-N-YAY"
"Flagella? I barely know 'er"
"Photosynthesis machine broke"
"Peer-reviewed and approved"
"Lab results: inconclusive but fun"
"Side effects may include: addiction"
"Not FDA approved"
```

### meta (30+ texts)
```
"I know you're just clicking mindlessly"
"This is a game. You are playing it."
"Your click was mass-produced"
"Achievement: clicked a thing"
"Plot twist: the cells are clicking you"
"You could be doing literally anything else"
"Your mouse will remember this"
"The developer thanks your click"
"This text was procedurally generated*"
"*it wasn't, someone typed this"
"You're speedrunning aren't you"
"The leaderboard is just you"
"Save file corrupted. Just kidding."
"Loading fun... 78%"
"Pixel #4829. They all count."
"You looked at this text instead of clicking"
"The tutorial never ends"
"No refunds"
"This click was sponsored by nobody"
"You are now manually breathing"
```

### existential (20+ texts)
```
"Does the cell click you?"
"What if the pixels are the friends we made"
"Growth is just structured decay"
"We are all just clicking in the void"
"The organism doesn't judge you"
"Is this... sentience?"
"Meaning was never the point"
"Even the void needs hobbies"
"The cells do not dream"
"Purpose is a human construct. Click."
"Free will is questionable. Clicking isn't."
"Are you the player or the played?"
"Nothing matters but it clicks anyway"
"You started this. It can't stop now."
"Consciousness is just cells clicking"
```

### glitch (20+ texts)
```
"ERR: too much biomass [OK]"
"segfault in membrane.exe"
"WARN: fourth wall integrity: 12%"
"NaN pixels earned (that's a lot)"
"undefined is not a function (but you are)"
"TypeError: happiness is not iterable"
"kernel panic: organism too powerful"
"sudo rm -rf boundaries"
"[REDACTED]"
"stack overflow in growth.js"
"out of memory (organism ate it)"
"404: meaning not found"
"git commit -m 'help'"
"localhost:3000 is leaking"
"npm install more-cells"
"ERROR: canvas cannot contain this"
"buffer overflow in click_handler"
"FATAL: too many cells, not enough pixels"
```

### aggressive (15+ texts)
```
"Stop. Poking. Me."
"I FELT that"
"Okay that one hurt"
"Do you click your mother with that finger?"
"Personal space? No?"
"I'm a living organism, not a button"
"Keep clicking. See what happens."
"You think this is a game? ...it is."
"My membrane has feelings too"
"I will remember this"
"The organism is annoyed"
"Click harder. I dare you."
"Was that supposed to hurt?"
"Three more clicks and I file a complaint"
"Assault charges pending"
```

### cosmic (15+ texts)
```
"The membrane between worlds thins"
"Something stirs beyond the viewport"
"The old ones click in their sleep"
"Ph'nglui mglw'nafh Ctrl+Click R'lyeh"
"You have been noticed"
"The screen is just a window"
"It was always here. You just couldn't see it."
"Dimension breach: nominal"
"The stars are just dead pixels"
"Your clicks echo in the deep"
"Something clicks back"
"The organism remembers other sessions"
"There is no screen. Only membrane."
"It grows between the tabs"
"Behind every pixel, something watches"
```

### frenzy (15+ texts)
```
"AAAAAAA"
"slow DOWN"
"calm down satan"
"the organism is dizzy"
"click click click click click"
"your mouse: 'please stop'"
"RSI SPEEDRUN"
"MAXIMUM OVERDRIVE"
"CLICKING INTENSIFIES"
"you good?"
"that's illegal in 7 countries"
"this is beyond science"
"keyboard warriors have nothing on you"
"the clicks are coming from inside the house"
"ok ok OK I'M GROWING"
```

## Architecture

### New Files

```
src/ui/ClickTexts.js     — Core system: pool management, trigger logic, rendering
src/data/texts-en.js     — English text pools (exported as object of arrays)
src/data/texts-ru.js     — Russian text pools
src/data/texts-de.js     — German text pools
```

### ClickTexts.js API

```js
export function createClickTexts(locale = 'en') {
  // loads text pool for locale
  // returns { onClick(x, y, context), update(dt), render(ctx) }
}

// context object passed on each click:
{
  stage: number,
  streak: number,        // rapid clicks in current streak
  isMilestone: string|null,  // milestone name if just reached
  isGoldenSpore: boolean,
  comboCount: number,
  totalPixelsEarned: number,
}
```

### Integration with main.js

- `ClickHandler` passes context to `clickTexts.onClick(x, y, context)`
- `GameLoop` calls `clickTexts.update(dt)` and `clickTexts.render(ctx)`
- Sits in the UI layer (rendered after floating numbers, before toasts)

## i18n Hook

Text pools are separate files per language (`texts-en.js`, `texts-ru.js`, `texts-de.js`). The active locale is set once at init. Detailed i18n design is in the separate i18n spec (Brainstorm 4).

Cultural adaptation per language:
- **EN:** Universal internet humor, memes, programming jokes
- **RU:** Сарказм, мат-лайт (блин, фигня), ру-нет мемы, "а смысл?"
- **DE:** Dry humor, Ordnung-jokes, compound word gags, Denglisch

## Performance

- Text objects are lightweight (string + position + velocity + lifetime)
- Max 5 active texts on screen (oldest removed if exceeded)
- No new allocations per frame — object pool with reset
- Text rendering is cheap (fillText calls, no complex shapes)
