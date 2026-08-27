# Visual Evolution Mechanic

**Date:** 2026-04-04
**Status:** Design
**Goal:** Cells and the organism visually evolve as the player progresses — from primitive blobs to complex, specialized organisms. Each run looks unique through generation-based morphology + Session DNA hue shifts.

## Problem

Currently all cells look identical — wobble membrane + radial gradient + cytoplasm particles. A cell born at 5 pixels looks the same as one born at 15,000. The organism grows in size but not in visual complexity. Evolution should be visible and satisfying.

## Core Concept: Cell Generations

Every cell is born with a **generation** number based on current totalPixelsEarned at time of birth. Generation determines the cell's visual tier — its morphology, complexity, internal structures, and behavior.

### Generation Tiers

| Gen | Name | Earned Range | Visual Description |
|-----|------|-------------|-------------------|
| 0 | **Protocell** | 0-19 | Simple circle, no wobble, single color fill, no cytoplasm. Just a dot. |
| 1 | **Membrane Cell** | 20-99 | Current look: wobble membrane (32 segments), radial gradient, 2-3 cytoplasm particles |
| 2 | **Organelle Cell** | 100-499 | Thicker membrane with double outline. Nucleus visible (darker inner circle). 4-5 cytoplasm with distinct colors (mitochondria=orange, ribosome=blue) |
| 3 | **Specialized Cell** | 500-2999 | Asymmetric membrane (some lobes larger). Visible internal structures: nucleus + ER (wavy lines). Cilia on outer edge (short animated hair-like projections). 6-8 organelles |
| 4 | **Neural Cell** | 3000-14999 | Star-shaped membrane (5-7 dendrite extensions). Axon connection points (glow at tips). Internal signaling pulses (light traveling along dendrites). Bioluminescent core |
| 5 | **Apex Cell** | 15000+ | Fractal membrane (recursive wobble on wobble). Multiple nuclei (2-3). Internal flow currents visible (animated noise). Pulsating aura. Connected to all nearby cells with energy arcs |

### Cell Birth Rules

- New cells inherit generation based on `totalPixelsEarned` at moment of division
- Existing cells do NOT upgrade — a Gen 1 cell stays Gen 1 forever
- This creates **visible history** in the colony: old primitive cells surrounded by newer evolved ones
- Old cells gradually shrink (5% per minute, minimum 60% of original radius) — naturally ceding visual space to evolved cells

### Visual Diversity Within Generations

Each cell within a generation has randomized traits:

```
Gen 2+ traits:
  nucleusSize: 0.2-0.4 × radius
  nucleusOffset: random within 30% of center
  organelleTypes: random subset of [mitochondria, ribosome, vacuole, golgi]
  organelleCount: gen + 1 ± 1

Gen 3+ traits:
  lobeCount: 2-4 (asymmetric membrane bulges)
  ciliaCount: 8-16
  ciliaLength: 3-8px
  ciliaSpeed: 2-4 rad/sec

Gen 4+ traits:
  dendriteCount: 5-7
  dendriteLength: 1.5-3 × radius
  pulseRate: 0.5-1.5 Hz
  biolumIntensity: 0.3-0.8

Gen 5+ traits:
  fractalDepth: 2-3 (levels of recursive wobble)
  nucleiCount: 2-3
  flowSpeed: 0.2-0.5
  auraRadius: 2-3 × radius
```

## Colony-Level Evolution

As the colony accumulates diverse generations, emergent patterns appear:

### Connection Types (between cells)

| Connection | Condition | Visual |
|---|---|---|
| **Membrane bridge** | Gen 1+ neighbors | Current: curved line between cells |
| **Nutrient channel** | Gen 2+ neighbors | Thicker bridge with animated particles flowing along it |
| **Neural link** | Gen 4+ neighbors | Thin glowing line with traveling light pulses |
| **Energy arc** | Gen 5+ neighbors | Crackling electric arc (animated jagged line with glow) |

Connection type = minimum generation of the two connected cells.

### Colony Aura

The colony as a whole emits an aura based on the average generation:

| Avg Gen | Aura Effect |
|---------|------------|
| 0-1 | None |
| 1-2 | Subtle green haze (low opacity radial gradient around colony center) |
| 2-3 | Bioluminescent pulse (expanding ring every 3 seconds) |
| 3-4 | Organic mist (particle system, slow-moving translucent circles) |
| 4+ | Energy field (displacement shader distortion around colony edge) |

## Interaction with Existing Systems

### Stage Transitions
Stages still gate on `totalPixelsEarned` thresholds. Evolution tiers naturally align:
- Stage 1 (0-19px): Only Gen 0 protocells exist
- Stage 2 (20-199px): Gen 0-1 mix
- Stage 3 (200-1999px): Gen 0-2 mix, first organelle cells appear
- Stage 4 (2000-14999px): Gen 0-3 mix, specialized cells with cilia
- Stage 5 (15000+): Gen 0-5 full diversity, apex cells emerge

### Milestones
Existing milestones trigger visual one-time events. New milestone additions:

| Milestone | Threshold | Event |
|---|---|---|
| `firstOrganelle` | 100 px | Toast: "Organelles forming..." — first Gen 2 cell spawns with zoom-in flash |
| `firstSpecialized` | 500 px | Toast: "Specialization detected" — first Gen 3 cell with cilia animation |
| `firstNeural` | 3000 px | Toast: "Neural activity!" — first Gen 4 cell, dendrite growth animation |
| `firstApex` | 15000 px | Toast: "APEX FORM" — dramatic spawn with screen flash and energy wave |

### Session DNA Integration
- `hueShift` applies to ALL generations (base hue offset)
- `gigantism` mutation: radius scale applies to all gens
- `chromatic_drift`: hue rotation affects all gens
- `cell_rot`: shifts hue toward brown for all gens, also reduces organelle glow opacity by 50%
- `rapid_mitosis`: cells born faster = colony evolves faster visually

### Upgrades
- `cellDivision` upgrade: spawns cells at current generation tier
- Higher gen cells cost more visual resources (more particles, more shader passes) — naturally balanced by cell count cap (50)

## Performance Considerations

- Gen 0-1 cells are cheapest to render (simple shapes)
- Gen 4-5 cells are most expensive (dendrites, fractals, auras)
- With 50 cell cap: worst case ~10-15 Gen 5 cells + 35 older cells
- PixiJS ParticleContainer handles organelle/cilia particles efficiently
- Shader-based effects (bioluminescence, flow) use uniforms, not per-pixel CPU calculation
- Cell shrinking gradually reduces old cell render cost

## Data Structure

```js
function createCell(x, y, radius, hue, generation) {
  return {
    x, y, radius, hue, generation,
    birthTime: Date.now(),
    phase: random() * TWO_PI,
    wobbleSpeed: 1.5 + random() * 0.5,
    // Gen-specific traits populated by factory function per tier
    traits: generateTraits(generation),
    // Shrink tracking
    ageShrink: 1.0, // decreases over time for old cells
  };
}
```

Each generation tier has its own render function in the new PixiJS CellSprite system — the sprite delegates to the appropriate visual tier based on `cell.generation`.
