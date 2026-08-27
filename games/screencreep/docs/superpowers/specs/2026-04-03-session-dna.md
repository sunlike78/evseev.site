# Session DNA System

## Data Structure

```js
// src/game/SessionDNA.js
sessionDNA = {
  seed: uint32,           // RNG seed, shown to player as hex
  mutations: [],          // 3-5 Mutation objects
  revealedCount: 0,       // how many revealed so far
  hueShift: -30..+30,     // base colony color offset
  dnaYieldMod: 1.0,       // prestige multiplier (product of mutation effects)
}
```

## Run Generation

On new session / prestige reset:
1. Generate random seed. Derive PRNG from it.
2. Roll `mutationCount = 3 + floor(random * 3)` (3-5 mutations).
3. Pick mutations without replacement from the pool. Distribution: guarantee at least 1 positive and 1 negative. Remaining slots are unconstrained random.
4. Sort by `revealAt` ascending. First mutation reveals at 0 pixels (immediate). Others reveal at thresholds.
5. `hueShift = floor(random * 61) - 30`.

## Mutation Pool (18 mutations)

### Positive (+)
| ID | Name | Effect | Reveal At | Visual |
|----|------|--------|-----------|--------|
| `rapid_mitosis` | Rapid Mitosis | autoClickRate x1.5 | 0 | Cells pulse 2x faster |
| `golden_age` | Golden Age | Golden Spore cooldown x0.5 | 50 px | Gold tint on membrane bridges |
| `thick_membrane` | Thick Membrane | Upgrade costs x0.8 | 100 px | Thicker cell outlines (+1px stroke) |
| `hyper_click` | Hyper Click | clickMultiplier +3 flat bonus | 0 | Brighter click flash |
| `neural_bloom` | Neural Bloom | globalMultiplier +0.5 | 300 px | Extra sparkle particles on cells |
| `spore_feast` | Spore Feast | Golden Spore reward x2 | first spore click | Spore turns green-gold |

### Negative (-)
| ID | Name | Effect | Reveal At | Visual |
|----|------|--------|-----------|--------|
| `cell_rot` | Cell Rot | autoClickRate x0.6 | 30 px | Brownish cell hue (+40 toward brown) |
| `brittle_walls` | Brittle Walls | Upgrade costs x1.4 | first purchase | Red flash on buy |
| `spore_drought` | Spore Drought | Golden Spore cooldown x2.0 | 90s elapsed | Desaturated background |
| `pixel_leak` | Pixel Leak | Lose 2% pixels/sec (capped at 5/s early) | 50 px | Dripping particles fall from colony |
| `slow_division` | Slow Division | cellsPerClick max 1 regardless of upgrades | 150 px | Cells spawn smaller (radius x0.7) |
| `trap_magnet` | Trap Magnet | Trap cells spawn 2x more often | 200 px | Faint red pulse on canvas edge |

### Weird / Neutral (~)
| ID | Name | Effect | Reveal At | Visual |
|----|------|--------|-----------|--------|
| `mirror_growth` | Mirror Growth | Colony grows left instead of expanding outward | 0 | Mirrored colony shape |
| `pulse_economy` | Pulse Economy | All income oscillates x0.5..x2.0 on 10s sine wave | 80 px | Colony brightness oscillates |
| `chromatic_drift` | Chromatic Drift | Colony hue rotates +60 deg/min continuously | 0 | Obvious color cycling |
| `silent_run` | Silent Run | All SFX pitch shifted -30% | 0 | (audible, not visual) |
| `gigantism` | Gigantism | All cell radii x1.8 but colony drift speed x0.5 | 20 px | Large cells, slow expansion |
| `echo_clicks` | Echo Clicks | Each click registers twice but 0.5s delayed | 0 | Double pulse animation |

## Reveal Mechanic

Mutations have `revealAt` (pixel threshold or time/event trigger). When triggered:
1. Mutation activates immediately.
2. Toast notification: mutation name + one-line hint (e.g. "MUTATION: Cell Rot -- something feels... off").
3. Mutation icon appears in UI panel sidebar (small colored dot: green=+, red=-, purple=~).

## Visual Differentiation

- `hueShift` offsets the base hue (140) of the first cell by -30..+30 per run.
- Each mutation adds its own visual indicator (see table).
- Cumulative effect: a run with `cell_rot` + `chromatic_drift` + `gigantism` looks drastically different from `rapid_mitosis` + `golden_age` + `thick_membrane`.
- The session seed is displayed as a small hex string in the corner (e.g. `DNA: 4F2A`) so players can share/compare runs.

## Run Rating (Emergent)

No explicit rating number. Instead:
- The ratio of green/red/purple dots in the sidebar tells the story.
- The organism's visual health (bright + fast = good; brown + slow = rough).
- Toast messages use different tones: positive = "Excellent.", negative = "Hmm...", weird = "Interesting."
- After all mutations revealed, a one-word label fades in under the DNA hex: "Thriving" (>=3 positive), "Struggling" (>=3 negative), "Unstable" (>=2 weird), "Balanced" (else).

## Prestige Integration

```
dnaYield = floor(totalPixelsEarned / 1000) * sessionDNA.dnaYieldMod

dnaYieldMod calculation:
  - Each active negative mutation: +15% bonus to dnaYieldMod
  - Each active positive mutation: -5% to dnaYieldMod (min 0.8)
  - Weird mutations: no change
```

Bad runs yield more DNA, incentivizing pushing through.

### DNA Unlocks (post-prestige, future feature)
- **Ban Mutation** (cost: 50 DNA): permanently remove one mutation from the pool.
- **Lock Mutation** (cost: 100 DNA): guarantee one mutation appears every run.
- **Reroll** (cost: 10 DNA): regenerate all unrevealed mutations mid-run.

## Integration Points

| File | Change |
|------|--------|
| `GameState.js` | Add `sessionDNA` field to initial state |
| `GameLoop.js` | Call `revealMutations()` each tick, apply active mutation effects |
| `Upgrades.js` | `getUpgradeCost` checks `thick_membrane` / `brittle_walls` modifier |
| `GoldenSpore.js` | Cooldown and reward modified by `golden_age` / `spore_drought` / `spore_feast` |
| `ColonyRenderer.js` | Apply `hueShift`, `gigantism` radius scale, `chromatic_drift` rotation |
| `CellRenderer.js` | `cell_rot` hue offset, `thick_membrane` stroke width |
| `UIPanel.js` | Render mutation dots, DNA hex label, run label |
| `SoundEngine.js` | `silent_run` pitch shift via detune parameter |
| New: `src/game/SessionDNA.js` | All generation, reveal, and query logic |
