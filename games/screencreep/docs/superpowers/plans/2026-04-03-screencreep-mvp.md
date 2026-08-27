# ScreenCreep MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a playable browser meta-clicker (stages 1-3) with ad monetization — from pixel seed to frame breach.

**Architecture:** Single-page Vite app. Canvas 2D renders the game area inside a constrained div. Game loop runs via requestAnimationFrame. State is a plain JS object persisted to localStorage. Stage 3 "breach" effect achieved by toggling CSS overflow on the container. Modules communicate through a shared game state object passed by reference.

**Tech Stack:** Vanilla JS (ES6+), Canvas 2D API, CSS3, Vite, Google AdSense

---

## File Map

```
ScreenCreep/
├── index.html                  # Page shell: game container, ad slot, UI overlay
├── style.css                   # Layout, container, UI panel, ad slot styles
├── vite.config.js              # Vite config (minimal)
├── package.json                # Project metadata, scripts
├── src/
│   ├── main.js                 # Entry: init game, mount to DOM
│   ├── game/
│   │   ├── GameState.js        # Central state object (pixels, upgrades, stage, timestamps)
│   │   ├── GameLoop.js         # rAF loop: update(dt) → render(ctx)
│   │   ├── ClickHandler.js     # Click events, pixel increment with multiplier
│   │   ├── Resources.js        # Pixel math: add, spend, canAfford, format display
│   │   └── Upgrades.js         # Upgrade definitions, costs, purchase logic
│   ├── stages/
│   │   ├── StageManager.js     # Check thresholds, trigger transitions
│   │   ├── Stage1_Seed.js      # Render: small pixel square, click feedback
│   │   ├── Stage2_Growth.js    # Render: growing area, colors, particles
│   │   └── Stage3_Breach.js    # Render: overflow effect, canvas beyond container
│   ├── meta/
│   │   ├── FrameBreaker.js     # Toggle container overflow, animate expansion
│   │   └── VisualEffects.js    # Particle system, glow, color shifts
│   ├── ui/
│   │   └── UIPanel.js          # HUD: pixel counter, upgrade buttons, stage indicator
│   ├── save/
│   │   └── SaveManager.js      # Save/load/reset via localStorage
│   └── ads/
│       └── AdManager.js        # AdSense banner init, placeholder for future ad types
└── tests/
    ├── Resources.test.js       # Unit tests for pixel math
    ├── Upgrades.test.js        # Unit tests for upgrade purchase logic
    ├── GameState.test.js       # Unit tests for state transitions
    ├── StageManager.test.js    # Unit tests for stage thresholds
    └── SaveManager.test.js     # Unit tests for save/load
```

---

## Task 1: Project Scaffold (Vite + HTML shell)

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `index.html`
- Create: `style.css`
- Create: `src/main.js`

- [ ] **Step 1: Initialize npm and install Vite**

```bash
cd C:/AI/Games/ScreenCreep
npm init -y
npm install --save-dev vite
```

- [ ] **Step 2: Create vite.config.js**

```js
// vite.config.js
export default {
  root: '.',
  build: {
    outDir: 'dist',
  },
};
```

- [ ] **Step 3: Update package.json scripts**

Add to `package.json`:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "type": "module"
}
```

- [ ] **Step 4: Create index.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ScreenCreep</title>
  <link rel="stylesheet" href="/style.css">
</head>
<body>
  <div id="game-wrapper">
    <div id="game-container">
      <canvas id="game-canvas"></canvas>
    </div>
    <div id="ui-panel"></div>
  </div>
  <div id="ad-slot"></div>
  <script type="module" src="/src/main.js"></script>
</body>
</html>
```

- [ ] **Step 5: Create style.css**

```css
/* style.css */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background: #0a0a0a;
  color: #e0e0e0;
  font-family: 'Courier New', monospace;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  overflow: hidden;
}

#game-wrapper {
  position: relative;
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

#game-container {
  width: 200px;
  height: 200px;
  border: 1px solid #333;
  overflow: hidden;
  position: relative;
  transition: width 0.5s ease, height 0.5s ease;
}

#game-container.breached {
  overflow: visible;
  border-color: transparent;
}

#game-canvas {
  display: block;
}

#ui-panel {
  width: 220px;
  padding: 12px;
  background: #111;
  border: 1px solid #222;
  border-radius: 4px;
  font-size: 13px;
}

#ad-slot {
  position: fixed;
  bottom: 10px;
  right: 10px;
  width: 300px;
  height: 250px;
  background: #1a1a1a;
  border: 1px dashed #333;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #444;
  font-size: 12px;
}

#ad-slot::after {
  content: 'AD SPACE';
}
```

- [ ] **Step 6: Create src/main.js with placeholder**

```js
// src/main.js
console.log('ScreenCreep initializing...');
```

- [ ] **Step 7: Verify dev server starts**

Run: `cd C:/AI/Games/ScreenCreep && npm run dev`
Expected: Vite dev server starts, opens page with dark background, game container box, and ad slot placeholder.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json vite.config.js index.html style.css src/main.js
git commit -m "feat: scaffold project with Vite, HTML shell, and base styles"
```

---

## Task 2: Game State and Resources

**Files:**
- Create: `src/game/GameState.js`
- Create: `src/game/Resources.js`
- Create: `tests/Resources.test.js`
- Create: `tests/GameState.test.js`

- [ ] **Step 1: Install vitest**

```bash
cd C:/AI/Games/ScreenCreep
npm install --save-dev vitest
```

- [ ] **Step 2: Write failing tests for Resources**

```js
// tests/Resources.test.js
import { describe, it, expect } from 'vitest';
import { addPixels, spendPixels, canAfford, formatNumber } from '../src/game/Resources.js';

describe('Resources', () => {
  it('addPixels increases state.pixels', () => {
    const state = { pixels: 0 };
    addPixels(state, 10);
    expect(state.pixels).toBe(10);
  });

  it('addPixels respects multiplier', () => {
    const state = { pixels: 0, clickMultiplier: 3 };
    addPixels(state, 1);
    expect(state.pixels).toBe(3);
  });

  it('spendPixels subtracts from state.pixels', () => {
    const state = { pixels: 100 };
    const ok = spendPixels(state, 40);
    expect(ok).toBe(true);
    expect(state.pixels).toBe(60);
  });

  it('spendPixels returns false if not enough', () => {
    const state = { pixels: 10 };
    const ok = spendPixels(state, 50);
    expect(ok).toBe(false);
    expect(state.pixels).toBe(10);
  });

  it('canAfford checks correctly', () => {
    const state = { pixels: 25 };
    expect(canAfford(state, 25)).toBe(true);
    expect(canAfford(state, 26)).toBe(false);
  });

  it('formatNumber abbreviates large numbers', () => {
    expect(formatNumber(999)).toBe('999');
    expect(formatNumber(1000)).toBe('1.0K');
    expect(formatNumber(1500000)).toBe('1.5M');
    expect(formatNumber(2300000000)).toBe('2.3B');
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npx vitest run tests/Resources.test.js`
Expected: FAIL — module not found

- [ ] **Step 4: Implement Resources.js**

```js
// src/game/Resources.js
const SUFFIXES = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi'];

export function addPixels(state, amount) {
  const multiplier = state.clickMultiplier || 1;
  state.pixels += amount * multiplier;
}

export function spendPixels(state, amount) {
  if (state.pixels < amount) return false;
  state.pixels -= amount;
  return true;
}

export function canAfford(state, amount) {
  return state.pixels >= amount;
}

export function formatNumber(n) {
  if (n < 1000) return String(Math.floor(n));
  let tier = 0;
  let scaled = n;
  while (scaled >= 1000 && tier < SUFFIXES.length - 1) {
    scaled /= 1000;
    tier++;
  }
  return scaled.toFixed(1) + SUFFIXES[tier];
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run tests/Resources.test.js`
Expected: All 6 tests PASS

- [ ] **Step 6: Write failing tests for GameState**

```js
// tests/GameState.test.js
import { describe, it, expect } from 'vitest';
import { createInitialState, calcOfflinePixels } from '../src/game/GameState.js';

describe('GameState', () => {
  it('creates initial state with correct defaults', () => {
    const state = createInitialState();
    expect(state.pixels).toBe(0);
    expect(state.stage).toBe(1);
    expect(state.clickMultiplier).toBe(1);
    expect(state.autoClickRate).toBe(0);
    expect(state.upgrades).toEqual({});
    expect(state.totalPixelsEarned).toBe(0);
  });

  it('calcOfflinePixels computes idle earnings', () => {
    const state = createInitialState();
    state.autoClickRate = 5; // 5 pixels per second
    state.lastSaveTime = Date.now() - 60000; // 60 seconds ago
    const earned = calcOfflinePixels(state);
    expect(earned).toBeGreaterThanOrEqual(295);
    expect(earned).toBeLessThanOrEqual(305);
  });

  it('calcOfflinePixels returns 0 with no auto rate', () => {
    const state = createInitialState();
    state.lastSaveTime = Date.now() - 60000;
    const earned = calcOfflinePixels(state);
    expect(earned).toBe(0);
  });
});
```

- [ ] **Step 7: Run tests to verify they fail**

Run: `npx vitest run tests/GameState.test.js`
Expected: FAIL — module not found

- [ ] **Step 8: Implement GameState.js**

```js
// src/game/GameState.js
export function createInitialState() {
  return {
    pixels: 0,
    totalPixelsEarned: 0,
    stage: 1,
    clickMultiplier: 1,
    autoClickRate: 0,
    upgrades: {},
    lastSaveTime: Date.now(),
  };
}

export function calcOfflinePixels(state) {
  if (state.autoClickRate <= 0) return 0;
  const now = Date.now();
  const elapsed = (now - state.lastSaveTime) / 1000;
  return Math.floor(state.autoClickRate * elapsed);
}
```

- [ ] **Step 9: Run tests to verify they pass**

Run: `npx vitest run tests/GameState.test.js`
Expected: All 3 tests PASS

- [ ] **Step 10: Commit**

```bash
git add src/game/GameState.js src/game/Resources.js tests/Resources.test.js tests/GameState.test.js
git commit -m "feat: add GameState and Resources with unit tests"
```

---

## Task 3: Upgrades System

**Files:**
- Create: `src/game/Upgrades.js`
- Create: `tests/Upgrades.test.js`

- [ ] **Step 1: Write failing tests for Upgrades**

```js
// tests/Upgrades.test.js
import { describe, it, expect } from 'vitest';
import { UPGRADE_DEFS, getUpgradeCost, purchaseUpgrade } from '../src/game/Upgrades.js';
import { createInitialState } from '../src/game/GameState.js';

describe('Upgrades', () => {
  it('UPGRADE_DEFS has autoClicker and clickMultiplier', () => {
    expect(UPGRADE_DEFS.autoClicker).toBeDefined();
    expect(UPGRADE_DEFS.clickMultiplier).toBeDefined();
    expect(UPGRADE_DEFS.autoSpeed).toBeDefined();
  });

  it('getUpgradeCost scales with level', () => {
    const cost0 = getUpgradeCost('autoClicker', 0);
    const cost1 = getUpgradeCost('autoClicker', 1);
    const cost2 = getUpgradeCost('autoClicker', 2);
    expect(cost0).toBe(UPGRADE_DEFS.autoClicker.baseCost);
    expect(cost1).toBeGreaterThan(cost0);
    expect(cost2).toBeGreaterThan(cost1);
  });

  it('purchaseUpgrade deducts pixels and increments level', () => {
    const state = createInitialState();
    state.pixels = 1000;
    const result = purchaseUpgrade(state, 'autoClicker');
    expect(result).toBe(true);
    expect(state.upgrades.autoClicker).toBe(1);
    expect(state.pixels).toBeLessThan(1000);
    expect(state.autoClickRate).toBeGreaterThan(0);
  });

  it('purchaseUpgrade fails if not enough pixels', () => {
    const state = createInitialState();
    state.pixels = 0;
    const result = purchaseUpgrade(state, 'autoClicker');
    expect(result).toBe(false);
    expect(state.upgrades.autoClicker).toBeUndefined();
  });

  it('clickMultiplier upgrade doubles multiplier', () => {
    const state = createInitialState();
    state.pixels = 10000;
    purchaseUpgrade(state, 'clickMultiplier');
    expect(state.clickMultiplier).toBe(2);
    purchaseUpgrade(state, 'clickMultiplier');
    expect(state.clickMultiplier).toBe(4);
  });

  it('autoSpeed upgrade increases autoClickRate for existing autoclickers', () => {
    const state = createInitialState();
    state.pixels = 100000;
    purchaseUpgrade(state, 'autoClicker');
    const rateAfterAuto = state.autoClickRate;
    purchaseUpgrade(state, 'autoSpeed');
    expect(state.autoClickRate).toBeGreaterThan(rateAfterAuto);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/Upgrades.test.js`
Expected: FAIL — module not found

- [ ] **Step 3: Implement Upgrades.js**

```js
// src/game/Upgrades.js
import { spendPixels } from './Resources.js';

export const UPGRADE_DEFS = {
  autoClicker: {
    baseCost: 10,
    costScale: 1.5,
    label: 'Auto Clicker',
    description: '+1 pixel/sec',
    apply(state, level) {
      state.autoClickRate = level * (1 + (state.upgrades.autoSpeed || 0) * 0.5);
    },
  },
  clickMultiplier: {
    baseCost: 50,
    costScale: 2.0,
    label: 'Click Power',
    description: 'x2 per click',
    apply(state, level) {
      state.clickMultiplier = Math.pow(2, level);
    },
  },
  autoSpeed: {
    baseCost: 100,
    costScale: 1.8,
    label: 'Auto Speed',
    description: '+50% auto rate',
    apply(state, level) {
      const autoLevel = state.upgrades.autoClicker || 0;
      state.autoClickRate = autoLevel * (1 + level * 0.5);
    },
  },
};

export function getUpgradeCost(upgradeId, currentLevel) {
  const def = UPGRADE_DEFS[upgradeId];
  return Math.floor(def.baseCost * Math.pow(def.costScale, currentLevel));
}

export function purchaseUpgrade(state, upgradeId) {
  const currentLevel = state.upgrades[upgradeId] || 0;
  const cost = getUpgradeCost(upgradeId, currentLevel);
  if (!spendPixels(state, cost)) return false;
  state.upgrades[upgradeId] = currentLevel + 1;
  UPGRADE_DEFS[upgradeId].apply(state, currentLevel + 1);
  return true;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/Upgrades.test.js`
Expected: All 6 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/game/Upgrades.js tests/Upgrades.test.js
git commit -m "feat: add upgrade system with auto-clicker, click multiplier, auto speed"
```

---

## Task 4: Save Manager

**Files:**
- Create: `src/save/SaveManager.js`
- Create: `tests/SaveManager.test.js`

- [ ] **Step 1: Write failing tests for SaveManager**

```js
// tests/SaveManager.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import { saveGame, loadGame, resetGame, SAVE_KEY } from '../src/save/SaveManager.js';
import { createInitialState } from '../src/game/GameState.js';

// Mock localStorage
const mockStorage = {};
const localStorageMock = {
  getItem: (key) => mockStorage[key] || null,
  setItem: (key, value) => { mockStorage[key] = value; },
  removeItem: (key) => { delete mockStorage[key]; },
};

describe('SaveManager', () => {
  beforeEach(() => {
    Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
  });

  it('saveGame stores state as JSON', () => {
    const state = createInitialState();
    state.pixels = 42;
    saveGame(state, localStorageMock);
    const raw = localStorageMock.getItem(SAVE_KEY);
    expect(raw).toBeDefined();
    const parsed = JSON.parse(raw);
    expect(parsed.pixels).toBe(42);
  });

  it('loadGame returns null when no save exists', () => {
    const result = loadGame(localStorageMock);
    expect(result).toBeNull();
  });

  it('loadGame restores saved state', () => {
    const state = createInitialState();
    state.pixels = 999;
    state.stage = 2;
    saveGame(state, localStorageMock);
    const loaded = loadGame(localStorageMock);
    expect(loaded.pixels).toBe(999);
    expect(loaded.stage).toBe(2);
  });

  it('resetGame removes save data', () => {
    const state = createInitialState();
    saveGame(state, localStorageMock);
    resetGame(localStorageMock);
    expect(loadGame(localStorageMock)).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/SaveManager.test.js`
Expected: FAIL — module not found

- [ ] **Step 3: Implement SaveManager.js**

```js
// src/save/SaveManager.js
export const SAVE_KEY = 'screencreep_save';

export function saveGame(state, storage = localStorage) {
  const data = { ...state, lastSaveTime: Date.now() };
  storage.setItem(SAVE_KEY, JSON.stringify(data));
}

export function loadGame(storage = localStorage) {
  const raw = storage.getItem(SAVE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function resetGame(storage = localStorage) {
  storage.removeItem(SAVE_KEY);
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/SaveManager.test.js`
Expected: All 4 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/save/SaveManager.js tests/SaveManager.test.js
git commit -m "feat: add save/load/reset via localStorage"
```

---

## Task 5: Stage Manager

**Files:**
- Create: `src/stages/StageManager.js`
- Create: `tests/StageManager.test.js`

- [ ] **Step 1: Write failing tests for StageManager**

```js
// tests/StageManager.test.js
import { describe, it, expect } from 'vitest';
import { STAGE_THRESHOLDS, checkStageTransition } from '../src/stages/StageManager.js';
import { createInitialState } from '../src/game/GameState.js';

describe('StageManager', () => {
  it('STAGE_THRESHOLDS defines thresholds for stages 2 and 3', () => {
    expect(STAGE_THRESHOLDS[2]).toBeDefined();
    expect(STAGE_THRESHOLDS[3]).toBeDefined();
  });

  it('stays at stage 1 when below threshold', () => {
    const state = createInitialState();
    state.totalPixelsEarned = 0;
    const advanced = checkStageTransition(state);
    expect(advanced).toBe(false);
    expect(state.stage).toBe(1);
  });

  it('advances to stage 2 at threshold', () => {
    const state = createInitialState();
    state.totalPixelsEarned = STAGE_THRESHOLDS[2];
    const advanced = checkStageTransition(state);
    expect(advanced).toBe(true);
    expect(state.stage).toBe(2);
  });

  it('advances to stage 3 at threshold', () => {
    const state = createInitialState();
    state.stage = 2;
    state.totalPixelsEarned = STAGE_THRESHOLDS[3];
    const advanced = checkStageTransition(state);
    expect(advanced).toBe(true);
    expect(state.stage).toBe(3);
  });

  it('does not skip stages', () => {
    const state = createInitialState();
    state.totalPixelsEarned = STAGE_THRESHOLDS[3] * 10;
    const advanced = checkStageTransition(state);
    expect(advanced).toBe(true);
    expect(state.stage).toBe(2); // goes to 2 first, not 3
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/StageManager.test.js`
Expected: FAIL — module not found

- [ ] **Step 3: Implement StageManager.js**

```js
// src/stages/StageManager.js

// Thresholds in total pixels earned to unlock next stage
export const STAGE_THRESHOLDS = {
  2: 100,      // ~5 min of clicking
  3: 5000,     // ~20-30 min with auto-clickers
};

const MAX_MVP_STAGE = 3;

export function checkStageTransition(state) {
  const nextStage = state.stage + 1;
  if (nextStage > MAX_MVP_STAGE) return false;

  const threshold = STAGE_THRESHOLDS[nextStage];
  if (threshold === undefined) return false;

  if (state.totalPixelsEarned >= threshold) {
    state.stage = nextStage;
    return true;
  }

  return false;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/StageManager.test.js`
Expected: All 5 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/stages/StageManager.js tests/StageManager.test.js
git commit -m "feat: add stage manager with progression thresholds"
```

---

## Task 6: Game Loop and Click Handler

**Files:**
- Create: `src/game/GameLoop.js`
- Create: `src/game/ClickHandler.js`

- [ ] **Step 1: Implement GameLoop.js**

```js
// src/game/GameLoop.js
export function createGameLoop(updateFn, renderFn) {
  let lastTime = 0;
  let running = false;
  let rafId = null;

  function tick(timestamp) {
    if (!running) return;
    const dt = lastTime ? (timestamp - lastTime) / 1000 : 0;
    lastTime = timestamp;
    updateFn(dt);
    renderFn();
    rafId = requestAnimationFrame(tick);
  }

  return {
    start() {
      if (running) return;
      running = true;
      lastTime = 0;
      rafId = requestAnimationFrame(tick);
    },
    stop() {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
    },
  };
}
```

- [ ] **Step 2: Implement ClickHandler.js**

```js
// src/game/ClickHandler.js
import { addPixels } from './Resources.js';

export function setupClickHandler(canvas, state, onClickCallback) {
  canvas.addEventListener('click', (e) => {
    const amount = 1;
    addPixels(state, amount);
    state.totalPixelsEarned += amount * (state.clickMultiplier || 1);
    if (onClickCallback) {
      onClickCallback(e.offsetX, e.offsetY);
    }
  });
}
```

- [ ] **Step 3: Verify no import errors**

Run: `npx vitest run`
Expected: All existing tests still PASS (no broken imports)

- [ ] **Step 4: Commit**

```bash
git add src/game/GameLoop.js src/game/ClickHandler.js
git commit -m "feat: add game loop and click handler"
```

---

## Task 7: Visual Effects and Stage Renderers

**Files:**
- Create: `src/meta/VisualEffects.js`
- Create: `src/stages/Stage1_Seed.js`
- Create: `src/stages/Stage2_Growth.js`
- Create: `src/stages/Stage3_Breach.js`
- Create: `src/meta/FrameBreaker.js`

- [ ] **Step 1: Implement VisualEffects.js (particle system)**

```js
// src/meta/VisualEffects.js
export class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  emit(x, y, count = 5, color = '#0f0') {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 60,
        vy: (Math.random() - 0.5) * 60,
        life: 0.5 + Math.random() * 0.5,
        maxLife: 0.5 + Math.random() * 0.5,
        size: 2 + Math.random() * 3,
        color,
      });
    }
  }

  update(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  render(ctx) {
    for (const p of this.particles) {
      const alpha = Math.max(0, p.life / p.maxLife);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
    ctx.globalAlpha = 1;
  }
}
```

- [ ] **Step 2: Implement Stage1_Seed.js**

```js
// src/stages/Stage1_Seed.js
// Stage 1: Small pixel square in corner, click for +1

const SQUARE_SIZE = 20;
const PULSE_SPEED = 2;

export function renderStage1(ctx, state, canvasW, canvasH, time) {
  // Pulsing pixel square in bottom-right of canvas
  const pulse = 1 + 0.15 * Math.sin(time * PULSE_SPEED);
  const size = SQUARE_SIZE * pulse;
  const x = canvasW - size - 10;
  const y = canvasH - size - 10;

  ctx.fillStyle = '#00ff41';
  ctx.fillRect(x, y, size, size);

  // Tiny text hint
  ctx.fillStyle = '#555';
  ctx.font = '10px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('click me', canvasW / 2, canvasH / 2);
}
```

- [ ] **Step 3: Implement Stage2_Growth.js**

```js
// src/stages/Stage2_Growth.js
// Stage 2: Growing area with colors and more activity

export function renderStage2(ctx, state, canvasW, canvasH, time) {
  // Background gradient effect
  const hue = (time * 20) % 360;
  ctx.fillStyle = `hsl(${hue}, 80%, 5%)`;
  ctx.fillRect(0, 0, canvasW, canvasH);

  // Growing central mass — size based on pixels
  const maxRadius = Math.min(canvasW, canvasH) * 0.4;
  const progress = Math.min(1, state.totalPixelsEarned / 5000);
  const radius = 15 + progress * maxRadius;

  const cx = canvasW / 2;
  const cy = canvasH / 2;

  // Pulsing glow
  const pulse = 1 + 0.1 * Math.sin(time * 3);
  const glowRadius = radius * pulse;

  ctx.beginPath();
  ctx.arc(cx, cy, glowRadius, 0, Math.PI * 2);
  ctx.fillStyle = `hsla(${hue}, 70%, 50%, 0.3)`;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.7, 0, Math.PI * 2);
  ctx.fillStyle = `hsl(${(hue + 60) % 360}, 80%, 45%)`;
  ctx.fill();

  // Orbiting pixels
  for (let i = 0; i < 6; i++) {
    const angle = (time * 1.5) + (i * Math.PI * 2 / 6);
    const orbitR = radius * 1.2;
    const px = cx + Math.cos(angle) * orbitR;
    const py = cy + Math.sin(angle) * orbitR;
    ctx.fillStyle = `hsl(${(hue + i * 60) % 360}, 90%, 60%)`;
    ctx.fillRect(px - 3, py - 3, 6, 6);
  }
}
```

- [ ] **Step 4: Implement FrameBreaker.js**

```js
// src/meta/FrameBreaker.js
// Handles the stage 3 "breach" effect — canvas breaks out of its container

export function activateBreach(container, canvas) {
  container.classList.add('breached');
  // Expand canvas beyond container bounds
  canvas.style.position = 'absolute';
  canvas.style.top = '-50px';
  canvas.style.left = '-50px';
  canvas.style.width = 'calc(100% + 100px)';
  canvas.style.height = 'calc(100% + 100px)';
  canvas.style.zIndex = '10';
}

export function updateBreachSize(container, canvas, progress) {
  // progress: 0..1 — how much the breach has expanded
  const expand = Math.floor(50 + progress * 150); // 50px to 200px overflow
  canvas.style.top = `-${expand}px`;
  canvas.style.left = `-${expand}px`;
  canvas.style.width = `calc(100% + ${expand * 2}px)`;
  canvas.style.height = `calc(100% + ${expand * 2}px)`;
}
```

- [ ] **Step 5: Implement Stage3_Breach.js**

```js
// src/stages/Stage3_Breach.js
// Stage 3: Game breaks its frame, visual chaos

export function renderStage3(ctx, state, canvasW, canvasH, time) {
  // Glitch background
  ctx.fillStyle = '#050505';
  ctx.fillRect(0, 0, canvasW, canvasH);

  // Glitch lines
  for (let i = 0; i < 8; i++) {
    const y = (time * 50 + i * 47) % canvasH;
    const w = 30 + Math.random() * (canvasW * 0.6);
    const x = Math.random() * canvasW;
    ctx.fillStyle = `hsla(${120 + Math.random() * 40}, 100%, 50%, 0.15)`;
    ctx.fillRect(x, y, w, 2);
  }

  // Central breach point — cracking outward
  const cx = canvasW / 2;
  const cy = canvasH / 2;

  // Cracks radiating from center
  ctx.strokeStyle = '#0f0';
  ctx.lineWidth = 2;
  const crackCount = 12;
  for (let i = 0; i < crackCount; i++) {
    const angle = (i * Math.PI * 2 / crackCount) + Math.sin(time + i) * 0.2;
    const len = 30 + Math.sin(time * 2 + i) * 20 + 50;
    ctx.beginPath();
    ctx.moveTo(cx, cy);

    // Jagged crack path
    let px = cx;
    let py = cy;
    const segments = 4;
    for (let s = 1; s <= segments; s++) {
      const t = s / segments;
      const jitter = (Math.random() - 0.5) * 15;
      px = cx + Math.cos(angle + jitter * 0.05) * len * t;
      py = cy + Math.sin(angle + jitter * 0.05) * len * t;
      ctx.lineTo(px + jitter, py + jitter);
    }
    ctx.stroke();
  }

  // Pulsing core
  const pulse = 1 + 0.3 * Math.sin(time * 5);
  ctx.beginPath();
  ctx.arc(cx, cy, 8 * pulse, 0, Math.PI * 2);
  ctx.fillStyle = '#0f0';
  ctx.fill();
}
```

- [ ] **Step 6: Verify no import errors**

Run: `npx vitest run`
Expected: All existing tests still PASS

- [ ] **Step 7: Commit**

```bash
git add src/meta/VisualEffects.js src/meta/FrameBreaker.js src/stages/Stage1_Seed.js src/stages/Stage2_Growth.js src/stages/Stage3_Breach.js
git commit -m "feat: add stage renderers (seed, growth, breach) and visual effects"
```

---

## Task 8: UI Panel

**Files:**
- Create: `src/ui/UIPanel.js`

- [ ] **Step 1: Implement UIPanel.js**

```js
// src/ui/UIPanel.js
import { formatNumber, canAfford } from '../game/Resources.js';
import { UPGRADE_DEFS, getUpgradeCost, purchaseUpgrade } from '../game/Upgrades.js';

export function createUIPanel(container, state) {
  const panel = {
    el: container,
    update() {
      renderPanel(container, state);
    },
  };
  container.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-upgrade]');
    if (!btn) return;
    const id = btn.dataset.upgrade;
    purchaseUpgrade(state, id);
    panel.update();
  });
  return panel;
}

function renderPanel(container, state) {
  const stageNames = { 1: 'Seed', 2: 'Growth', 3: 'Breach' };
  let html = `
    <div style="margin-bottom:12px">
      <div style="font-size:18px;color:#0f0">${formatNumber(state.pixels)} px</div>
      <div style="color:#666;font-size:11px">${formatNumber(state.autoClickRate)}/sec</div>
      <div style="margin-top:4px;color:#555;font-size:11px">Stage ${state.stage}: ${stageNames[state.stage] || '???'}</div>
    </div>
    <div style="font-size:12px;color:#888;margin-bottom:8px">UPGRADES</div>
  `;

  for (const [id, def] of Object.entries(UPGRADE_DEFS)) {
    const level = state.upgrades[id] || 0;
    const cost = getUpgradeCost(id, level);
    const affordable = canAfford(state, cost);
    const color = affordable ? '#0f0' : '#555';
    const cursor = affordable ? 'pointer' : 'default';
    html += `
      <button data-upgrade="${id}" style="
        display:block;width:100%;text-align:left;
        background:#1a1a1a;border:1px solid ${color};color:${color};
        padding:8px;margin-bottom:6px;cursor:${cursor};
        font-family:monospace;font-size:12px;border-radius:3px;
      ">
        <div>${def.label} (Lv.${level})</div>
        <div style="color:#888;font-size:11px">${def.description}</div>
        <div style="color:${color};font-size:11px">Cost: ${formatNumber(cost)} px</div>
      </button>
    `;
  }

  container.innerHTML = html;
}
```

- [ ] **Step 2: Verify no import errors**

Run: `npx vitest run`
Expected: All existing tests still PASS

- [ ] **Step 3: Commit**

```bash
git add src/ui/UIPanel.js
git commit -m "feat: add UI panel with pixel counter and upgrade buttons"
```

---

## Task 9: Ad Manager (placeholder for AdSense)

**Files:**
- Create: `src/ads/AdManager.js`

- [ ] **Step 1: Implement AdManager.js**

```js
// src/ads/AdManager.js
// MVP: placeholder for AdSense integration.
// In production, replace initAds() body with real AdSense script injection.

let adSlot = null;

export function initAds(slotElement) {
  adSlot = slotElement;
  // In production:
  // - inject <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js">
  // - create <ins class="adsbygoogle"> inside slotElement
  // - call (adsbygoogle = window.adsbygoogle || []).push({})
  adSlot.innerHTML = '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#444;font-size:11px;">AD SPACE<br>(AdSense goes here)</div>';
}

export function hideAd() {
  if (adSlot) {
    adSlot.style.transition = 'opacity 1s ease';
    adSlot.style.opacity = '0';
    setTimeout(() => {
      adSlot.style.display = 'none';
    }, 1000);
  }
}

export function isAdVisible() {
  return adSlot && adSlot.style.display !== 'none';
}
```

- [ ] **Step 2: Commit**

```bash
git add src/ads/AdManager.js
git commit -m "feat: add ad manager placeholder for AdSense integration"
```

---

## Task 10: Wire Everything Together in main.js

**Files:**
- Modify: `src/main.js`

- [ ] **Step 1: Implement main.js — full wiring**

```js
// src/main.js
import { createInitialState, calcOfflinePixels } from './game/GameState.js';
import { addPixels } from './game/Resources.js';
import { createGameLoop } from './game/GameLoop.js';
import { setupClickHandler } from './game/ClickHandler.js';
import { checkStageTransition } from './stages/StageManager.js';
import { renderStage1 } from './stages/Stage1_Seed.js';
import { renderStage2 } from './stages/Stage2_Growth.js';
import { renderStage3 } from './stages/Stage3_Breach.js';
import { activateBreach, updateBreachSize } from './meta/FrameBreaker.js';
import { ParticleSystem } from './meta/VisualEffects.js';
import { createUIPanel } from './ui/UIPanel.js';
import { saveGame, loadGame } from './save/SaveManager.js';
import { initAds } from './ads/AdManager.js';

// DOM elements
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const container = document.getElementById('game-container');
const uiPanelEl = document.getElementById('ui-panel');
const adSlotEl = document.getElementById('ad-slot');

// State
const saved = loadGame();
const state = saved || createInitialState();

// Handle offline earnings
if (saved) {
  const offlineEarned = calcOfflinePixels(state);
  if (offlineEarned > 0) {
    state.pixels += offlineEarned;
    state.totalPixelsEarned += offlineEarned;
  }
}
state.lastSaveTime = Date.now();

// Systems
const particles = new ParticleSystem();
const uiPanel = createUIPanel(uiPanelEl, state);
initAds(adSlotEl);

let breachActivated = false;
let gameTime = 0;

// Resize canvas to match container
function resizeCanvas() {
  const rect = container.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Click handler — emit particles on click
setupClickHandler(canvas, state, (x, y) => {
  particles.emit(x, y, 3 + state.stage * 2, '#0f0');
});

// Stage renderers
const stageRenderers = {
  1: renderStage1,
  2: renderStage2,
  3: renderStage3,
};

// Growth: expand container in stage 2
function updateContainerSize() {
  if (state.stage >= 2 && !breachActivated) {
    const progress = Math.min(1, state.totalPixelsEarned / 5000);
    const size = 200 + progress * 200; // 200px → 400px
    container.style.width = size + 'px';
    container.style.height = size + 'px';
    resizeCanvas();
  }
}

// Auto-save every 30 seconds
let lastAutoSave = Date.now();

// Game loop
const loop = createGameLoop(
  // update
  (dt) => {
    gameTime += dt;

    // Auto-click income
    if (state.autoClickRate > 0) {
      const earned = state.autoClickRate * dt;
      state.pixels += earned;
      state.totalPixelsEarned += earned;
    }

    // Check stage transition
    const advanced = checkStageTransition(state);
    if (advanced) {
      onStageAdvance();
    }

    // Update systems
    particles.update(dt);
    updateContainerSize();

    // Auto-save
    if (Date.now() - lastAutoSave > 30000) {
      saveGame(state);
      lastAutoSave = Date.now();
    }
  },
  // render
  () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const renderer = stageRenderers[state.stage];
    if (renderer) {
      renderer(ctx, state, canvas.width, canvas.height, gameTime);
    }

    particles.render(ctx);
    uiPanel.update();
  }
);

function onStageAdvance() {
  if (state.stage === 3 && !breachActivated) {
    breachActivated = true;
    activateBreach(container, canvas);
    resizeCanvas();
  }
  saveGame(state);
}

// Start
loop.start();
```

- [ ] **Step 2: Open browser and verify the game works**

Run: `cd C:/AI/Games/ScreenCreep && npm run dev`
Expected:
- Dark page with small green square pulsing in corner of game container
- Clicking the canvas increments pixel counter in UI panel
- Upgrade buttons appear with costs
- Buying auto-clicker starts passive income
- At 100 totalPixelsEarned → stage transitions to 2 (colors, growth)
- At 5000 totalPixelsEarned → stage transitions to 3 (breach, canvas breaks out)
- Ad placeholder visible in bottom-right corner

- [ ] **Step 3: Commit**

```bash
git add src/main.js
git commit -m "feat: wire all modules together — playable game loop"
```

---

## Task 11: Polish and Final Touches

**Files:**
- Modify: `style.css` (transition polish)
- Modify: `index.html` (meta tags, favicon placeholder)

- [ ] **Step 1: Add meta tags and title to index.html**

Replace `<head>` content in `index.html`:
```html
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="ScreenCreep — a meta-clicker that takes over your browser. Click. Grow. Breach.">
  <meta property="og:title" content="ScreenCreep">
  <meta property="og:description" content="A meta-clicker that takes over your browser">
  <title>ScreenCreep</title>
  <link rel="stylesheet" href="/style.css">
</head>
```

- [ ] **Step 2: Add stage transition animation to style.css**

Append to `style.css`:
```css
#game-container.breached {
  animation: breach-pulse 0.5s ease-out;
}

@keyframes breach-pulse {
  0% { box-shadow: 0 0 0 0 rgba(0,255,65,0.7); }
  50% { box-shadow: 0 0 40px 20px rgba(0,255,65,0.3); }
  100% { box-shadow: 0 0 0 0 rgba(0,255,65,0); }
}
```

- [ ] **Step 3: Run all tests one final time**

Run: `npx vitest run`
Expected: All tests PASS (Resources: 6, GameState: 3, Upgrades: 6, SaveManager: 4, StageManager: 5 — total 24)

- [ ] **Step 4: Verify game plays end-to-end in browser**

Run: `npm run dev`
Manual check:
- [ ] Click → pixels increment
- [ ] Buy auto-clicker → passive income starts
- [ ] Stage 1→2 transition at 100px
- [ ] Container grows in stage 2
- [ ] Stage 2→3 transition at 5000px
- [ ] Breach effect — canvas overflows container
- [ ] Refresh page → progress saved

- [ ] **Step 5: Commit**

```bash
git add index.html style.css
git commit -m "feat: add meta tags, OG tags, and breach transition animation"
```

- [ ] **Step 6: Build production bundle**

Run: `npm run build`
Expected: `dist/` folder created, total size < 500KB

---

## Summary

| Task | What it builds | Tests |
|------|---------------|-------|
| 1 | Project scaffold (Vite + HTML) | — |
| 2 | GameState + Resources | 9 |
| 3 | Upgrades system | 6 |
| 4 | Save/Load | 4 |
| 5 | Stage Manager | 5 |
| 6 | Game Loop + Click Handler | — |
| 7 | Stage renderers + Visual FX | — |
| 8 | UI Panel | — |
| 9 | Ad Manager placeholder | — |
| 10 | Wire everything together | — |
| 11 | Polish + final verification | — |

**Total: 11 tasks, ~24 unit tests, estimated 2-4 hours of AI-assisted implementation.**
