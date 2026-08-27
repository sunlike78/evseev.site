# ScreenCreep Economy Balance Model v2

## Executive Summary

Complete rebalance of the 8-upgrade economy with new systems: combo clicking, trap cells, idle decay, and prestige. All numbers below are implementation-ready.

---

## 1. Core Constants

```javascript
const BASE_CLICK_VALUE = 1;        // Base pixels per click
const CLICK_RATE_HUMAN = 5;        // Assumed average CPS (clicks per second)
const CLICK_RATE_FAST = 10;        // Fast clicker CPS
const DECAY_RATE = 0.005;          // 0.5% per minute = 0.00833% per second
const DECAY_IDLE_THRESHOLD = 10;   // seconds of no input before decay starts
const BURST_CHANCE = 0.05;         // 5% chance of burst click
const BURST_MIN = 3;               // Burst multiplier range
const BURST_MAX = 10;
```

---

## 2. Stage Thresholds (totalPixelsEarned)

| Stage | Name | Threshold | Target Time | Rationale |
|-------|------|-----------|-------------|-----------|
| 1 | Seed | 0 | 0-30s | Pure clicking, learn mechanics |
| 2 | Growth | 20 | ~30s | 20 clicks at 1px = 20s at 1 CPS, ~4s at 5 CPS |
| 3 | Breach | 250 | ~3-5 min | With auto-clicker + click power |
| 4 | Takeover | 3000 | ~10-15 min | Multiple upgrades stacking |
| 5 | Domination | 20000 | ~20-30 min | Full upgrade synergies |

**Changed from current:** Stage 3: 200->250, Stage 4: 2000->3000, Stage 5: 15000->20000. Slight increase to accommodate stronger upgrade curves.

---

## 3. Upgrade Rebalance

### 3.1 Upgrade Definitions

All upgrades use: `cost(level) = floor(baseCost * costScale^level)`

#### Tier 1: Starter Upgrades (available immediately)

**Auto Clicker** — Passive income backbone
```
baseCost: 8
costScale: 1.4
effect: autoClickRate += 0.5 * (1 + autoSpeed_level * 0.4)
  Level 1: 0.5 px/s base
  Level 2: 1.0 px/s base
  Level 3: 1.5 px/s base
  ...
  Level N: N * 0.5 px/s base (before autoSpeed multiplier)

Cost progression: 8, 11, 15, 22, 30, 43, 60, 84, 117, 164
```

**Click Power** — Active play scaling
```
baseCost: 12
costScale: 1.7
effect: clickMultiplier = 1 + level * 1.5
  Level 0: 1x
  Level 1: 2.5x
  Level 2: 4x
  Level 3: 5.5x
  Level 4: 7x

Cost progression: 12, 20, 34, 58, 99, 169, 287, 488
```
*Changed from 2^level (exponential) to linear scaling. Old formula gave 2x, 4x, 8x, 16x — too explosive. New gives 2.5x, 4x, 5.5x, 7x — meaningful but controlled.*

**Cell Division** — Click synergy (visual + bonus)
```
baseCost: 15
costScale: 1.6
effect: cellsPerClick = level; each extra cell = +0.3 * clickMultiplier bonus pixels
  Level 1: +0.3x per click (30% bonus)
  Level 2: +0.6x per click (60% bonus)
  Level 3: +0.9x per click

Cost progression: 15, 24, 38, 61, 98, 157, 251
```
*Synergy: scales with clickMultiplier, making click-focused builds stronger.*

#### Tier 2: Mid-game Upgrades (unlock at Stage 2 / 20px earned)

**Auto Speed** — Auto-clicker enhancer
```
baseCost: 30
costScale: 1.6
effect: multiplies autoClicker output by (1 + level * 0.4)
  Level 1: 1.4x auto rate
  Level 2: 1.8x auto rate
  Level 3: 2.2x auto rate
unlock: requires autoClicker >= 1

Cost progression: 30, 48, 77, 123, 196, 314, 503
```
*Synergy: multiplicative with autoClicker levels. autoClicker Lv3 + autoSpeed Lv2 = 1.5 * 1.8 = 2.7 px/s base.*

**Organ Growth** — Passive income multiplier
```
baseCost: 60
costScale: 1.8
effect: organMultiplier = 1 + level * 0.8
  Level 1: 1.8x passive
  Level 2: 2.6x passive
  Level 3: 3.4x passive
unlock: requires stage >= 2

Cost progression: 60, 108, 194, 350, 630, 1134
```
*Changed from 3^level to linear. Old: 3x, 9x, 27x. New: 1.8x, 2.6x, 3.4x. Much more controlled.*

#### Tier 3: Late-game Upgrades (unlock at Stage 3 / 250px earned)

**Spore Magnet** — Golden spore frequency
```
baseCost: 150
costScale: 2.0
effect: sporeCooldownMultiplier = 1 / (1 + level * 0.35)
  Level 0: cooldown 30-90s (base)
  Level 1: cooldown 22-67s (74% of base)
  Level 2: cooldown 18-53s (59% of base)
  Level 3: cooldown 14-43s (47% of base)
unlock: requires stage >= 3

Cost progression: 150, 300, 600, 1200, 2400
```

**Neural Link** — Global multiplier
```
baseCost: 400
costScale: 2.2
effect: globalMultiplier = 1 + level * 0.5
  Level 1: 1.5x everything
  Level 2: 2.0x everything
  Level 3: 2.5x everything
unlock: requires stage >= 3

Cost progression: 400, 880, 1936, 4259, 9370
```
*Changed from 2^level to linear. Old: 2x, 4x, 8x. New: 1.5x, 2.0x, 2.5x. Applies to BOTH clicks AND passive.*

**Membrane** — Anti-decay + offline
```
baseCost: 800
costScale: 2.5
effect:
  - offlineMultiplier = 1 + level * 0.15
  - decayReduction = level * 0.15 (reduces decay rate by 15% per level)
  Level 1: 15% offline, 15% less decay
  Level 2: 30% offline, 30% less decay
  Level 3: 45% offline, 45% less decay
unlock: requires stage >= 4

Cost progression: 800, 2000, 5000, 12500
```

### 3.2 Synergy Matrix

| Upgrade A | Upgrade B | Interaction |
|-----------|-----------|-------------|
| Auto Clicker | Auto Speed | Multiplicative: rate = AC_level * 0.5 * (1 + AS_level * 0.4) |
| Auto Clicker | Organ Growth | Multiplicative: passive = rate * organMult |
| Click Power | Cell Division | Additive synergy: cells add 0.3 * clickMult per cell |
| Click Power | Neural Link | Multiplicative: click = clickMult * globalMult |
| Organ Growth | Neural Link | Multiplicative: passive = rate * organMult * globalMult |
| Spore Magnet | Neural Link | More frequent spores + bigger frenzy impact |
| Membrane | Auto Clicker | Offline earnings = autoRate * offlineMult |

### 3.3 Decision Points

The player faces meaningful choices:

**At ~15-30 px (early Stage 2):**
- Auto Clicker Lv1 (8 px) — start passive income
- Click Power Lv1 (12 px) — 2.5x clicks immediately
- Cell Division Lv1 (15 px) — 1.3x effective clicks + visual

**At ~60-120 px (mid Stage 2):**
- Auto Speed Lv1 (30 px) — boost passive
- More Auto Clicker levels — broaden passive base
- Organ Growth Lv1 (60 px) — multiply all passive

**At ~300-600 px (early Stage 3):**
- Spore Magnet (150 px) — gamble on golden spores
- Neural Link Lv1 (400 px) — save up for universal 1.5x
- Stack more passive upgrades

### 3.4 Expected Income at Key Milestones

**At 100 px earned (mid Stage 2):**
Typical upgrades owned: AC Lv2, CP Lv1, CD Lv1, AS Lv1
- Click value: 2.5 * 1 (globalMult) * 1.3 (cellDiv) = 3.25 px/click
- Active income (5 CPS): ~16.25 px/s
- Passive income: 1.0 * 1.4 * 1 * 1 = 1.4 px/s
- Combined: ~17.65 px/s

**At 500 px earned (mid Stage 3):**
Typical upgrades: AC Lv4, CP Lv2, CD Lv2, AS Lv2, OG Lv1, SM Lv1
- Click value: 4.0 * 1 * 1.6 = 6.4 px/click
- Active income (5 CPS): ~32 px/s
- Passive income: 2.0 * 1.8 * 1.8 * 1 = 6.48 px/s
- Combined: ~38.48 px/s

**At 2000 px earned (late Stage 3 / early Stage 4):**
Typical upgrades: AC Lv6, CP Lv3, CD Lv3, AS Lv3, OG Lv2, SM Lv1, NL Lv1
- Click value: 5.5 * 1.5 * 1.9 = 15.675 px/click
- Active income (5 CPS): ~78.4 px/s
- Passive income: 3.0 * 2.2 * 2.6 * 1.5 = 25.74 px/s
- Combined: ~104.1 px/s

**At 10000 px earned (mid Stage 4 / approaching Stage 5):**
Typical upgrades: AC Lv9, CP Lv5, CD Lv4, AS Lv4, OG Lv3, SM Lv2, NL Lv2, MB Lv1
- Click value: 8.5 * 2.0 * 2.2 = 37.4 px/click
- Active income (5 CPS): ~187 px/s
- Passive income: 4.5 * 2.6 * 3.4 * 2.0 = 79.56 px/s
- Combined: ~266.6 px/s

---

## 4. Variable Click Rewards (Burst System)

```javascript
function rollClickValue(baseValue) {
  const roll = Math.random();
  if (roll < 0.05) {
    // 5% burst: 3-10x
    const burstMult = 3 + Math.random() * 7; // uniform 3-10
    return { value: baseValue * burstMult, isBurst: true, mult: burstMult };
  }
  return { value: baseValue, isBurst: false, mult: 1 };
}
```

**Expected value per click:** `1.0 * 0.95 + 6.5 * 0.05 = 0.95 + 0.325 = 1.275` (27.5% average boost from bursts)

**Visual feedback for bursts:**
- 3-5x: Yellow floating number, slightly larger
- 5-8x: Orange floating number, shakes
- 8-10x: Red floating number with particle burst, screen flash

---

## 5. Combo System

### 5.1 Mechanics

The combo tracks click speed over a rolling 3-second window. Higher sustained CPS = higher multiplier.

```javascript
const COMBO_WINDOW = 3.0;         // seconds
const COMBO_THRESHOLDS = [
  { cps: 3,  mult: 1.0, label: '' },          // Below 3 CPS = no combo
  { cps: 4,  mult: 1.2, label: 'x1.2' },      // Casual clicking
  { cps: 6,  mult: 1.5, label: 'x1.5' },      // Active clicking
  { cps: 8,  mult: 1.8, label: 'x1.8' },      // Fast clicking
  { cps: 10, mult: 2.2, label: 'x2.2' },      // Very fast
  { cps: 13, mult: 2.8, label: 'x2.8 FRENZY' }, // Extreme (approaching human limit)
];
const COMBO_DECAY_GRACE = 1.0;    // seconds after last click before combo starts decaying
const COMBO_DECAY_RATE = 2.0;     // CPS lost per second of no clicking
```

### 5.2 Implementation

```javascript
function createComboTracker() {
  const clickTimestamps = [];
  let currentMult = 1.0;
  let currentLabel = '';

  return {
    registerClick(time) {
      clickTimestamps.push(time);
      // Prune old timestamps
      while (clickTimestamps.length > 0 && clickTimestamps[0] < time - COMBO_WINDOW) {
        clickTimestamps.shift();
      }
      this.recalc(time);
    },

    update(time) {
      // Prune old timestamps
      while (clickTimestamps.length > 0 && clickTimestamps[0] < time - COMBO_WINDOW) {
        clickTimestamps.shift();
      }
      this.recalc(time);
    },

    recalc(time) {
      const cps = clickTimestamps.length / COMBO_WINDOW;
      let best = COMBO_THRESHOLDS[0];
      for (const t of COMBO_THRESHOLDS) {
        if (cps >= t.cps) best = t;
      }
      currentMult = best.mult;
      currentLabel = best.label;
    },

    getMultiplier() { return currentMult; },
    getLabel() { return currentLabel; },
    getCPS() { return clickTimestamps.length / COMBO_WINDOW; },
  };
}
```

### 5.3 Balance Notes

- At 5 CPS (average player): 1.5x combo = 50% boost. Rewards engagement without punishing casual play.
- At 10 CPS (fast player): 2.2x combo. Significant but not game-breaking since it requires sustained effort.
- Combo does NOT apply to passive income. Active play only.
- Combo multiplier stacks multiplicatively with clickMultiplier, globalMultiplier, and frenzy.
- Full click formula: `BASE_CLICK * clickMult * globalMult * comboMult * frenzyMult * burstMult * (1 + cellDivision * 0.3)`

---

## 6. Trap Cells

### 6.1 Spawn Rules

```javascript
const TRAP_CONFIG = {
  minStage: 2,                    // First appear in Stage 2
  spawnInterval: {                // Seconds between trap spawns
    2: [15, 25],                  // Stage 2: every 15-25s
    3: [10, 20],                  // Stage 3: every 10-20s
    4: [8, 15],                   // Stage 4: every 8-15s
    5: [6, 12],                   // Stage 5: every 6-12s
  },
  maxActive: {                    // Max traps on screen at once
    2: 1,
    3: 2,
    4: 3,
    5: 4,
  },
  lifetime: [8, 15],             // Seconds before trap despawns (harmlessly)
  warningTime: 1.5,              // Seconds of visual warning before trap becomes active
  penaltyPercent: {              // % of CURRENT pixels lost
    2: [0.10, 0.15],            // Stage 2: 10-15% loss
    3: [0.12, 0.20],            // Stage 3: 12-20% loss
    4: [0.15, 0.22],            // Stage 4: 15-22% loss
    5: [0.15, 0.25],            // Stage 5: 15-25% loss
  },
  hardCap: 0.25,                // NEVER take more than 25% of current pixels
  minPenalty: 2,                 // Minimum penalty in pixels (avoid 0-loss traps early)
};
```

### 6.2 Visual Design

**Warning phase (1.5s):**
- Cell appears with reddish tint, slight pulsing
- Small "!" icon or red glow grows over 1.5s
- Cell wobbles more aggressively than normal cells

**Active phase:**
- Cell is clearly red/orange, distinct from normal green/cyan cells
- Pulsates with warning pattern
- Slight particle emission (red-orange sparks)

**Click penalty:**
- Screen flashes red briefly (100ms)
- Negative floating number in red: "-X px"
- Affected area "withers" visually for a moment
- Sound: discordant buzz/squelch

**Despawn (not clicked):**
- Cell shrivels and fades out over 1s
- No penalty

### 6.3 Penalty Calculation

```javascript
function calcTrapPenalty(state, stage) {
  const [minPct, maxPct] = TRAP_CONFIG.penaltyPercent[stage];
  const pct = minPct + Math.random() * (maxPct - minPct);
  const rawPenalty = Math.floor(state.pixels * pct);
  const cappedPenalty = Math.min(rawPenalty, Math.floor(state.pixels * TRAP_CONFIG.hardCap));
  return Math.max(TRAP_CONFIG.minPenalty, cappedPenalty);
}
```

### 6.4 Balance Notes

- Trap cells are **visually distinguishable** after the 1.5s warning phase. The point is risk/reward when clicking fast, not unfair surprise.
- Penalty is on CURRENT pixels (balance), not total earned. Losing progress is frustrating; losing savings is strategic.
- Average expected loss per trap: ~15% of balance if clicked. Over a minute, this is roughly 1-2 traps in Stage 3, so 0-30% loss if careless.
- Players learn to be more careful -> skill expression.
- Membrane upgrade reduces trap penalty by 15% per level (stacks with the decay reduction).

---

## 7. Idle Decay System

### 7.1 Rules

```javascript
const DECAY_CONFIG = {
  idleThreshold: 10,            // Seconds of no clicks before decay starts
  ratePerMinute: 0.005,         // 0.5% of current pixels per minute
  ratePerSecond: 0.005 / 60,    // ~0.0000833 per second
  pausedByAutoClicker: true,    // If autoClickRate > 0, decay is halved (not eliminated)
  autoClickerReduction: 0.5,    // Auto-clicker reduces decay by 50%
  membraneReduction: 0.15,      // Per Membrane level
  minPixelsForDecay: 10,        // Don't decay below this
  maxDecayPerSecond: 50,        // Hard cap on per-second decay (prevents huge losses)
};
```

### 7.2 Implementation

```javascript
function calcDecay(state, dt, timeSinceLastClick) {
  if (timeSinceLastClick < DECAY_CONFIG.idleThreshold) return 0;
  if (state.pixels <= DECAY_CONFIG.minPixelsForDecay) return 0;

  let rate = DECAY_CONFIG.ratePerSecond;

  // Auto-clicker halves decay
  if (state.autoClickRate > 0) {
    rate *= (1 - DECAY_CONFIG.autoClickerReduction);
  }

  // Membrane reduces decay
  const membraneLevel = state.upgrades.membrane || 0;
  rate *= (1 - membraneLevel * DECAY_CONFIG.membraneReduction);
  rate = Math.max(0, rate);

  const decayAmount = state.pixels * rate * dt;
  return Math.min(decayAmount, DECAY_CONFIG.maxDecayPerSecond * dt);
}
```

### 7.3 Balance Notes

- Decay is gentle: 0.5%/min = 3% in 6 minutes of pure idling. It nudges players to stay active without punishing bathroom breaks.
- Auto-clicker reduces decay by 50% (0.25%/min). This gives auto-clicker additional hidden value.
- Membrane Lv2 + auto-clicker: rate = 0.5% * 0.5 * 0.7 = 0.175%/min. Barely noticeable.
- Decay never reduces below 10px. New players who walk away don't come back to zero.
- Decay does NOT affect totalPixelsEarned, only current balance.

---

## 8. Prestige System (Sporulation)

### 8.1 DNA Points Formula

```javascript
function calcDNAPoints(totalPixelsEarned) {
  if (totalPixelsEarned < 20000) return 0; // Must reach Stage 5
  return Math.floor(Math.pow(totalPixelsEarned / 5000, 0.55));
}
```

**DNA yield at key milestones:**
| Total Pixels Earned | DNA Points |
|---------------------|------------|
| 20,000 | 2 |
| 30,000 | 2 |
| 50,000 | 3 |
| 75,000 | 3 |
| 100,000 | 4 |
| 200,000 | 5 |
| 500,000 | 8 |
| 1,000,000 | 11 |

First prestige (45-60 min target) yields ~2-3 DNA. Each subsequent run is faster due to DNA upgrades, yielding more DNA per hour.

### 8.2 DNA Upgrades

DNA upgrades are permanent across prestiges.

```javascript
const DNA_UPGRADES = {
  strongerSeed: {
    maxLevel: 5,
    cost: [1, 1, 2, 3, 5],       // Cost per level
    effect: 'Start with clickMultiplier = 1 + level * 0.5',
    description: '+0.5 base click power per level',
  },
  quickStart: {
    maxLevel: 3,
    cost: [1, 2, 4],
    effect: 'Start with autoClicker = level',
    description: 'Start with auto-clicker levels',
  },
  deepRoots: {
    maxLevel: 5,
    cost: [1, 2, 2, 3, 5],
    effect: 'All upgrade costs reduced by level * 5%',
    description: '-5% upgrade costs per level',
  },
  goldenAffinity: {
    maxLevel: 3,
    cost: [2, 3, 5],
    effect: 'Golden spore reward +level*25%. Frenzy duration +level*5s',
    description: 'Better golden spore rewards',
  },
  resilientMembrane: {
    maxLevel: 3,
    cost: [2, 3, 5],
    effect: 'Trap penalty reduced by level*10%. Decay rate reduced by level*10%',
    description: 'Reduced penalties',
  },
  sporulation: {
    maxLevel: 5,
    cost: [2, 3, 4, 6, 10],
    effect: 'DNA earned multiplier = 1 + level * 0.15',
    description: '+15% DNA per prestige per level',
  },
  cosmicSkin: {
    maxLevel: 10,
    cost: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    effect: 'Unlocks color skin for the organism',
    description: 'New visual theme',
  },
};
```

### 8.3 Prestige Flow

1. Player reaches Stage 5 (20,000 totalPixelsEarned minimum)
2. "Sporulate" button appears in UI
3. On click: show DNA preview (how many DNA points they'll earn)
4. Confirm -> sporulation animation plays
5. Reset: pixels, totalPixelsEarned, upgrades, stage -> all to initial
6. Keep: DNA points, DNA upgrades, skins, achievements
7. Apply DNA upgrade effects to new initial state

### 8.4 Scaling Across Prestiges

| Prestige # | Expected DNA Earned | Cumulative DNA | Run Time | Key Unlock |
|------------|--------------------|----|----------|------------|
| 1 | 2-3 | 2-3 | 45-60 min | strongerSeed Lv1, deepRoots Lv1 |
| 2 | 3-4 | 5-7 | 30-40 min | quickStart Lv1, goldenAffinity Lv1 |
| 3 | 4-5 | 9-12 | 20-30 min | sporulation Lv1, resilientMembrane Lv1 |
| 5 | 5-7 | 20-25 | 15-20 min | Multiple Lv2-3 upgrades |
| 10 | 8-12 | 50-60 | 10-15 min | Most upgrades at Lv3+ |

---

## 9. Golden Spore Rebalance

```javascript
const GOLDEN_SPORE_CONFIG = {
  baseCooldown: [30, 70],          // seconds (reduced from [30, 90])
  lifetime: 10,                     // seconds to click
  rewards: {
    frenzy: {
      chance: 0.45,                 // 45% chance
      multiplier: 5,                // Reduced from 7x to 5x (economy is stronger now)
      duration: 20,                 // Reduced from 30s to 20s
    },
    lucky: {
      chance: 0.40,                 // 40% chance
      bonusPercent: 0.08,           // 8% of totalPixelsEarned (reduced from 10%)
      minBonus: 50,                 // Minimum bonus (reduced from 100)
    },
    clickStorm: {                   // NEW reward type
      chance: 0.15,                 // 15% chance
      duration: 10,                 // 10 seconds
      effect: 'All clicks count as 3 clicks for 10s',
      multiplier: 3,
    },
  },
  // DNA upgrade: goldenAffinity
  affinityBonusPerLevel: 0.25,      // +25% to lucky bonus, +5s to frenzy/storm duration
};
```

---

## 10. Complete Click Value Formula

```javascript
function calculateClickValue(state, comboTracker, goldenSpore) {
  const base = BASE_CLICK_VALUE;
  const clickMult = state.clickMultiplier || 1;          // From Click Power upgrade
  const globalMult = state.globalMultiplier || 1;         // From Neural Link upgrade
  const comboMult = comboTracker.getMultiplier();          // From combo system
  const frenzyMult = goldenSpore.getActiveBonus()?.multiplier || 1;
  const cellBonus = 1 + (state.cellsPerClick || 0) * 0.3; // From Cell Division

  // Roll burst
  const { value: burstBase, isBurst, mult: burstMult } = rollClickValue(base);

  const totalValue = burstBase * clickMult * globalMult * comboMult * frenzyMult * cellBonus;

  return {
    value: Math.floor(Math.max(1, totalValue)),
    isBurst,
    burstMult,
    comboMult,
  };
}
```

**Passive income formula (per second):**
```javascript
function calculatePassiveIncome(state, goldenSpore) {
  const autoRate = (state.upgrades.autoClicker || 0) * 0.5;
  const autoSpeedMult = 1 + (state.upgrades.autoSpeed || 0) * 0.4;
  const organMult = state.organMultiplier || 1;
  const globalMult = state.globalMultiplier || 1;
  const frenzyMult = goldenSpore.getActiveBonus()?.multiplier || 1;

  return autoRate * autoSpeedMult * organMult * globalMult * frenzyMult;
}
```

---

## 11. Sample Progression Timeline

Assumes: average 5 CPS, average combo ~1.2x, no golden spores (conservative baseline).

### Minute 0-1 (Stage 1: Seed)

| Time | Action | Pixels Earned | Balance | Income/s |
|------|--------|---------------|---------|----------|
| 0:00 | Start clicking | 0 | 0 | 0 |
| 0:05 | 25 clicks | 25 | 25 | ~6/s click |
| 0:05 | Auto Clicker Lv1 (8px) | 25 | 17 | 0.5/s + 6/s click |
| 0:10 | Stage 2 at 20px earned | 50 | 42 | 0.5/s + 6/s click |
| 0:15 | Click Power Lv1 (12px) | 80 | 56 | 0.5/s + 15/s click |
| 0:25 | Cell Division Lv1 (15px) | 155 | 65 | 0.5/s + 19.5/s click |
| 0:30 | Auto Clicker Lv2 (11px) | 200 | 73 | 1.0/s + 19.5/s click |

**Stage 2 reached at ~10 seconds. On track.**

### Minutes 1-3 (Stage 2: Growth)

| Time | Action | Total Earned | Balance | Passive/s | Click/s (5CPS) |
|------|--------|-------------|---------|-----------|-----------------|
| 1:00 | Auto Speed Lv1 (30px) | 340 | 58 | 1.4/s | 19.5 |
| 1:30 | Auto Clicker Lv3 (15px) | 560 | 88 | 2.1/s | 19.5 |
| 2:00 | Click Power Lv2 (20px) | 810 | 118 | 2.1/s | 31.2 |
| 2:30 | Organ Growth Lv1 (60px) | 1100 | 107 | 3.78/s | 31.2 |
| 3:00 | Auto Clicker Lv4 (22px) | 1400 | 136 | 5.04/s | 31.2 |

### Minutes 3-5 (Stage 3: Breach)

| Time | Action | Total Earned | Balance | Passive/s | Click/s |
|------|--------|-------------|---------|-----------|---------|
| 3:00 | **Stage 3 at 250px earned** (reached ~1:15) | 1400 | 136 | 5.04 | 31.2 |
| 3:30 | Spore Magnet Lv1 (150px) | 1800 | 192 | 5.04 | 31.2 |
| 4:00 | Auto Speed Lv2 (48px) | 2200 | 260 | 5.76 | 31.2 |
| 4:30 | Cell Division Lv2 (24px) | 2750 | 360 | 5.76 | 41.6 |
| 5:00 | Neural Link Lv1 (400px) | 3300 | 35 | 8.64 | 62.4 |

### Minutes 5-10 (Stage 3-4 transition)

| Time | Action | Total Earned | Balance | Passive/s | Click/s |
|------|--------|-------------|---------|-----------|---------|
| 5:00 | Saving up after NL purchase | 3300 | 35 | 8.64 | 62.4 |
| 6:00 | Organ Growth Lv2 (108px) | 4050 | 420 | 11.23 | 62.4 |
| 7:00 | Click Power Lv3 (34px) | 5100 | 690 | 11.23 | 85.8 |
| 8:00 | Auto Clicker Lv5-6, AS Lv3 | 6500 | 500 | 19.8 | 85.8 |
| 9:00 | Neural Link Lv2 (880px) | 8100 | 380 | 26.4 | 114.4 |
| 10:00 | Various upgrades | 10000 | 600 | 26.4 | 114.4 |

**Stage 4 reached at ~5:00 (3000 px total). On track for 10-15 min target? Actually faster than target. Let me adjust...**

*Note: The above shows Stage 4 is reached around minute 5 with aggressive play. For 10-15 minutes, we should adjust the Stage 4 threshold:*

**REVISED Stage 4 threshold: 5000 px** (instead of 3000). This better matches the 10-15 minute target.

### Minutes 10-20 (Stage 4: Takeover)

| Time | Total Earned | Balance | Passive/s | Active+Passive/s | Key Purchases |
|------|-------------|---------|-----------|-------------------|---------------|
| 10:00 | 5200 | 600 | 26.4 | 141 | Stage 4 just reached |
| 12:00 | 7800 | 1200 | 35 | 175 | Membrane Lv1, more AC/AS |
| 15:00 | 12000 | 2000 | 52 | 260 | NL Lv3, OG Lv3 |
| 18:00 | 17000 | 3500 | 72 | 340 | Spore Magnet Lv2 |
| 20:00 | 22000 | 4000 | 85 | 400 | Approaching Domination |

**Stage 5 reached at ~18-22 minutes. Close to 20-30 min target.**

### Minutes 20-45 (Stage 5: Domination -> Prestige)

| Time | Total Earned | Balance | Passive/s | Active+Passive/s | DNA if Prestige |
|------|-------------|---------|-----------|-------------------|-----------------|
| 20:00 | 22,000 | 4000 | 85 | 400 | 2 DNA |
| 25:00 | 32,000 | 6000 | 110 | 520 | 2 DNA |
| 30:00 | 44,000 | 8000 | 140 | 650 | 3 DNA |
| 40:00 | 72,000 | 12000 | 190 | 900 | 3 DNA |
| 45:00 | 90,000 | 15000 | 210 | 1050 | 4 DNA |
| 60:00 | 150,000 | 22000 | 280 | 1400 | 5 DNA |

**Sweet spot for first prestige: 30-45 min for 2-3 DNA. Can push to 60 min for 4-5 DNA but diminishing returns encourage resetting.**

---

## 12. Revised Stage Thresholds (Final)

Based on the simulation above:

```javascript
export const STAGE_THRESHOLDS = {
  2: 20,         // ~10 seconds   (unchanged)
  3: 250,        // ~1-2 minutes  (was 200)
  4: 5000,       // ~8-12 minutes (was 2000)
  5: 20000,      // ~18-25 minutes (was 15000)
};
```

---

## 13. "Something to Buy" Verification

Checking that at no point does the player wait >30s with nothing affordable:

| Balance Range | Available Upgrades (approximate cost) |
|---------------|--------------------------------------|
| 0-8 | Nothing (pure clicking, only ~2-5 seconds) |
| 8-12 | Auto Clicker Lv1 (8) |
| 12-15 | Click Power Lv1 (12) |
| 15-30 | Cell Division Lv1 (15), AC Lv2 (11) |
| 30-60 | Auto Speed Lv1 (30), AC Lv3 (15), CP Lv2 (20) |
| 60-150 | Organ Growth Lv1 (60), various Lv2-4 upgrades |
| 150-400 | Spore Magnet (150), many mid-tier upgrades |
| 400-800 | Neural Link Lv1 (400), stacking cheaper upgrades |
| 800+ | Membrane Lv1 (800), NL Lv2 (880), many options |

At all points post-20px, there are multiple upgrades within 10-30 seconds of income. The cost curves interleave well.

---

## 14. Implementation Checklist

Files to modify:
1. `src/game/Upgrades.js` — New baseCost, costScale, effects, unlock conditions
2. `src/stages/StageManager.js` — New thresholds (250, 5000, 20000)
3. `src/meta/GoldenSpore.js` — Rebalanced rewards, new clickStorm type
4. `src/game/GameState.js` — Add prestige fields, combo state, decay tracking
5. `src/game/Resources.js` — Add burst roll, combo multiplier to addPixels
6. `src/main.js` — Wire combo tracker, trap cells, decay system, prestige flow
7. `src/ui/UIPanel.js` — Prestige button, combo indicator, trap warning, DNA shop

New files to create:
1. `src/game/ComboTracker.js` — Combo system
2. `src/game/TrapCell.js` — Trap cell spawning and penalty
3. `src/game/DecaySystem.js` — Idle decay
4. `src/game/PrestigeManager.js` — DNA calculation, reset, DNA upgrades
