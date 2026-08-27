# ScreenCreep — Bio-Digital Visual Overhaul

## Overview

Full visual and audio rework of ScreenCreep from generic pixel clicker to a living bio-digital organism that grows, divides, breaches its container, and infects the browser. Organic/ASMR aesthetic throughout.

**Visual direction:** Bio-Digital — living organism that mutates and evolves. Smooth shapes, cell division, pulsation. Spore meets Agar.io.

**Audio direction:** Organic ASMR — soft squelches, bubble pops, membrane sounds. Satisfying tactile feedback on every interaction.

**Wow strategy:** Beautiful AND surprising. Constant stream of small visual rewards + major surprises at milestones.

---

## 1. Evolution Timeline

Aggressive pacing — first wow at 30 seconds, major wow at 3-5 minutes.

| Time | Event | Visual | Sound |
|------|-------|--------|-------|
| 0 sec | First click | Single cell pulses, ripple across membrane | Soft "squelch" |
| 0-30 sec | Clicking | Cell reacts to each click, cytoplasm moves | Varied squelch tones |
| 30 sec | First division | Cell stretches and splits in two | Bubble "pop-blurp" |
| 30s-3min | Colony growth | Cells multiply, form structures, new colors appear | Drops-in-water "psh", ambient pulse |
| 3-5 min | **BREACH** | Organism breaks container frame, tendrils escape | Shell crack + wet membrane tear |
| 5-15 min | Takeover | Organism infects page elements (buttons, text, ads) | Slime "splat" per element |
| 15+ min | Domination | Entire screen is the organism | Full ambient soundscape |
| Prestige | Rebirth | Organism releases spores, restarts with new color skin | Deep exhale + scatter sound |

---

## 2. Visual Design Per Stage

### Stage 1: Seed (0-30 sec)

**What the player sees:** A single cell in a small container, centered on screen.

**Cell rendering (Canvas 2D):**
- Circular base shape with organic wobble (noise-based radius variation)
- Radial gradient: bright center (#00ff88) fading to dark edge (#003318)
- Outer membrane: semi-transparent ring that pulses
- Inner cytoplasm: 2-3 small circles drifting slowly inside
- Glow: box-shadow-like effect via radial gradient behind cell

**Click feedback:**
- Ripple wave expands from click point across cell membrane
- Cell briefly squashes in click direction, then springs back
- Small particles (organelle fragments) fly outward
- Cell grows slightly with each click (visual progress)

**Background:** Near-black (#050510) with very subtle organic noise texture.

**Container:** 200x200px, thin border with slight bio-luminescent glow (rgba(0,255,136,0.1)).

### Stage 2: Growth (30 sec - 3 min)

**What the player sees:** Colony of cells that divide and form structures.

**Colony rendering:**
- Multiple cells, each with slightly different hue (green, cyan, purple, yellow)
- Cells connected by thin membrane bridges (lines between nearby cells)
- New cell appears via division animation: parent stretches, pinches, splits
- Organelles appear inside larger cells (small colored dots orbiting)

**Container behavior:**
- Slowly grows from 200px toward 400px as colony expands
- Border gets more "alive" — subtle pulsing glow that follows organism heartbeat

**Auto-clicker visual:** When purchased, cells divide on their own with the same animation. Player sees the colony growing without clicking.

**Color palette evolution:**
- Start: monochrome green
- As colony grows: introduce cyan, purple, gold organelles
- Each new color type = visual milestone (mini-wow)

### Stage 3: Breach (3-5 min) — Primary Wow Moment

**The breach sequence (scripted animation, ~3 seconds):**
1. Organism presses against container walls — cells flatten at edges
2. Container border cracks — fracture lines appear (CSS + Canvas overlay)
3. Tendrils push through cracks — organic tentacles emerge outside container
4. Container "shatters" — border fragments fly outward (particle effect)
5. Organism floods outward — canvas expands beyond container bounds

**Post-breach:**
- Canvas grows progressively (via updateBreachSize)
- Tendrils/roots spread across the page background
- Organism is no longer contained — it moves freely
- Background of page starts shifting color subtly

**Key detail:** The container border doesn't just disappear — it visibly cracks and breaks apart. This is the moment that makes players screenshot and share.

### Stage 4: Takeover (5-15 min)

**DOM infection mechanic:**
- Organism sends "spores" (animated particles) toward page elements
- When a spore reaches an element (button, text, ad slot):
  - Element gets a bio-organic overlay (CSS filter + pseudo-element)
  - Text mutates letter by letter (random character replacement, then settles)
  - Background gets organic texture
  - Element becomes clickable for bonus resources
- Ad slot gets "consumed" — organism visually engulfs it with spreading tendrils

**Infection priority:**
1. Ad slot (first — biggest wow, "the game ate the ad")
2. UI panel buttons (get organic styling)
3. Page title
4. Body background

### Stage 5: Domination (15+ min)

**Full screen takeover:**
- Entire viewport is organism tissue
- Background: living, pulsating organic surface
- All UI elements are organically styled
- Particle effects everywhere — spores, floating organelles

**Prestige mechanic visual:**
- "Sporulation" — organism contracts, releases cloud of spores
- Screen fades to black through spore cloud
- New cycle begins with different color palette (skin):
  - Cycle 1: Green (default)
  - Cycle 2: Cyan/Blue
  - Cycle 3: Purple/Magenta
  - Cycle 4: Gold/Orange
  - Cycle 5+: Random combinations

---

## 3. Sound Design (Web Audio API)

All sounds generated procedurally via Web Audio API — no audio files needed. This keeps bundle size tiny and allows dynamic variation.

### Sound Library

| Sound | Trigger | Generation Method |
|-------|---------|-------------------|
| Squelch (click) | Player clicks cell | Short noise burst + low-pass filter + pitch envelope down |
| Bubble pop (division) | Cell divides | Sine oscillator pitch sweep (high→low) + noise pop |
| Water drop (organelle) | New organelle appears | High sine ping + short reverb |
| Shell crack (breach) | Container breaks | Noise burst + band-pass filter sweep |
| Membrane tear (breach) | Organism escapes | Long filtered noise with pitch modulation |
| Slime splat (infection) | Element infected | Noise burst + low-pass + short decay |
| Upgrade pop | Upgrade purchased | Sine pop with harmonics |
| Heartbeat (ambient) | Continuous background | Low sine pulse, rate increases with progress |
| Burble (ambient) | Stage 2+ background | Filtered noise, random bubble events |

### Variation

Each sound type has randomized parameters on each play:
- Pitch: +/- 10% random
- Duration: +/- 15% random
- Filter cutoff: +/- 20% random

This prevents repetitive "machine gun" effect on rapid clicks.

### Volume Progression

- Stage 1: Quiet, minimal — just click sounds + subtle heartbeat
- Stage 2: Heartbeat louder, division sounds, ambient burble fades in
- Stage 3: Dramatic breach sounds, ambient becomes richer
- Stage 4: Full soundscape, infection sounds layer on top
- Stage 5: Dense ambient, like being inside the organism

Player can mute/adjust volume via UI toggle.

---

## 4. Progression Rebalance

Current thresholds are too slow for the new timeline.

### New Thresholds

| Transition | Old Threshold | New Threshold | Target Time |
|------------|--------------|---------------|-------------|
| 1 → 2 | 100 pixels | 20 pixels | ~30 seconds |
| 2 → 3 | 5000 pixels | 200 pixels | ~3-5 minutes |
| 3 → 4 | N/A (not impl) | 2000 pixels | ~5-15 minutes |
| 4 → 5 | N/A (not impl) | 15000 pixels | ~15-30 minutes |

### Upgrade Cost Rebalance

| Upgrade | Old Base Cost | New Base Cost |
|---------|--------------|---------------|
| Auto Clicker | 10 | 5 |
| Click Power | 50 | 15 |
| Auto Speed | 100 | 40 |

### Visual Milestones (mini-wows between stages)

These trigger at pixel thresholds within each stage:

**Stage 1:**
- 5 px: Cell starts visibly growing
- 10 px: First cytoplasm particle appears inside cell
- 15 px: Cell membrane starts wobbling more

**Stage 2:**
- 30 px: First cyan cell appears (new color)
- 60 px: Purple organelle appears
- 100 px: Membrane bridges form between cells
- 150 px: Gold organelle, colony pulsates in sync

**Stage 3:**
- 300 px: First tendril reaches a page element
- 500 px: Background starts shifting
- 1000 px: Organism covers 50% of viewport

---

## 5. Architecture Changes

### New Modules

```
src/
├── rendering/
│   ├── CellRenderer.js      # Single cell: shape, gradient, membrane, cytoplasm
│   ├── ColonyRenderer.js    # Multiple cells, connections, division animation
│   ├── BreachRenderer.js    # Crack effects, tendril rendering
│   └── OrganismRenderer.js  # Full organism composite, delegates to above
├── audio/
│   ├── SoundEngine.js       # Web Audio API context, master volume
│   ├── SFX.js               # Procedural sound effects (squelch, pop, crack)
│   └── Ambient.js           # Background soundscape, heartbeat, burble
├── meta/
│   ├── DOMInfector.js       # Stage 4: infect page elements
│   ├── FrameBreaker.js      # Stage 3: breach animation sequence (existing, reworked)
│   └── VisualEffects.js     # Particles, ripples, spores (existing, extended)
```

### Modified Modules

- `stages/Stage1_Seed.js` → Complete rewrite: single cell with organic rendering
- `stages/Stage2_Growth.js` → Complete rewrite: colony simulation
- `stages/Stage3_Breach.js` → Complete rewrite: breach sequence + tendrils
- `stages/StageManager.js` → New thresholds, visual milestone events
- `game/Resources.js` → No change (logic stays the same)
- `game/Upgrades.js` → New base costs
- `ui/UIPanel.js` → Organic styling, volume toggle, throttled updates (fix from review)
- `main.js` → Wire new renderers + audio, add milestone checks
- `style.css` → Bio-organic theme, infection CSS classes

### Rendering Approach

All organism rendering via Canvas 2D:
- Cells: radial gradients + noise-based radius for organic wobble
- Membranes: arc() with varying radius per angle
- Cytoplasm: small circles with brownian motion
- Tendrils: quadratic bezier curves with animated control points
- Particles: existing ParticleSystem extended with new particle types

No WebGL — Canvas 2D is sufficient and simpler. Organic shapes don't need 3D.

---

## 6. Technical Constraints

- **Bundle size:** < 500KB total (no audio files — all procedural)
- **Performance:** 60fps on mid-range hardware. Cell count capped at ~50 rendered simultaneously
- **Browser support:** Chrome primary, Firefox/Safari secondary
- **Mobile:** Not in scope for this iteration (noted in original design)
- **Save compatibility:** New thresholds mean old saves may be at wrong stage. Add migration: recalculate stage from totalPixelsEarned on load.
