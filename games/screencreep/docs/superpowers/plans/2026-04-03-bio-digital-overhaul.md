# Bio-Digital Visual Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform ScreenCreep from a generic pixel clicker into a living bio-digital organism with organic ASMR audio, progressive evolution, and browser takeover effects.

**Architecture:** Canvas 2D rendering with noise-based organic shapes. Procedural audio via Web Audio API (no audio files). Stage renderers replaced with organism-based renderers that share a common cell/colony model. DOM infection via CSS manipulation for Stage 4.

**Tech Stack:** Vanilla JS (ES6+), Canvas 2D API, Web Audio API, Vite, Vitest

**Spec:** `docs/superpowers/specs/2026-04-03-bio-digital-overhaul-design.md`

---

## File Structure

### New Files
| File | Responsibility |
|------|---------------|
| `src/rendering/CellRenderer.js` | Single cell: organic shape, gradient, membrane, cytoplasm |
| `src/rendering/ColonyRenderer.js` | Multiple cells, connections, division animation |
| `src/rendering/BreachRenderer.js` | Crack effects, tendrils outside container |
| `src/rendering/OrganismRenderer.js` | Composite renderer, delegates per stage |
| `src/audio/SoundEngine.js` | Web Audio API context, master volume, mute toggle |
| `src/audio/SFX.js` | Procedural sound effects (squelch, pop, crack, splat) |
| `src/audio/Ambient.js` | Background heartbeat, burble soundscape |
| `src/meta/DOMInfector.js` | Stage 4: find and infect page elements |
| `tests/CellRenderer.test.js` | Cell geometry and rendering tests |
| `tests/SoundEngine.test.js` | Audio engine tests |
| `tests/DOMInfector.test.js` | DOM infection tests |

### Modified Files
| File | Changes |
|------|---------|
| `src/stages/StageManager.js` | New thresholds (20, 200, 2000, 15000), milestone events, stages 4-5 |
| `src/stages/Stage1_Seed.js` | Complete rewrite → single cell organism |
| `src/stages/Stage2_Growth.js` | Complete rewrite → colony simulation |
| `src/stages/Stage3_Breach.js` | Complete rewrite → breach sequence + tendrils |
| `src/game/GameState.js` | Add `cellCount`, `divisionCount`, `milestones` to initial state |
| `src/game/Upgrades.js` | Rebalanced costs (5, 15, 40) |
| `src/meta/FrameBreaker.js` | Organic breach animation (cracks, not just CSS expansion) |
| `src/meta/VisualEffects.js` | New particle types: ripple, spore, organic fragment |
| `src/ui/UIPanel.js` | Bio-organic styling, volume toggle, throttled updates |
| `src/main.js` | Wire new renderers + audio, milestone checks |
| `style.css` | Bio-organic theme, infection CSS, organic colors |
| `index.html` | Add mute button element |

---

## Task 1: Sound Engine Foundation

**Files:**
- Create: `src/audio/SoundEngine.js`
- Create: `src/audio/SFX.js`
- Test: `tests/SoundEngine.test.js`

- [ ] **Step 1: Write failing tests for SoundEngine**

```js
// tests/SoundEngine.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSoundEngine } from '../src/audio/SoundEngine.js';

describe('SoundEngine', () => {
  let engine;

  beforeEach(() => {
    engine = createSoundEngine();
  });

  it('creates with default volume 0.5 and unmuted', () => {
    expect(engine.getVolume()).toBe(0.5);
    expect(engine.isMuted()).toBe(false);
  });

  it('setVolume clamps to 0-1', () => {
    engine.setVolume(1.5);
    expect(engine.getVolume()).toBe(1);
    engine.setVolume(-0.5);
    expect(engine.getVolume()).toBe(0);
  });

  it('toggleMute flips mute state', () => {
    engine.toggleMute();
    expect(engine.isMuted()).toBe(true);
    engine.toggleMute();
    expect(engine.isMuted()).toBe(false);
  });

  it('getContext returns null before init', () => {
    expect(engine.getContext()).toBe(null);
  });

  it('init creates AudioContext', () => {
    engine.init();
    expect(engine.getContext()).not.toBe(null);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/SoundEngine.test.js`
Expected: FAIL — module not found

- [ ] **Step 3: Implement SoundEngine**

```js
// src/audio/SoundEngine.js
let ctx = null;
let gainNode = null;
let volume = 0.5;
let muted = false;

export function createSoundEngine() {
  return {
    init() {
      if (ctx) return;
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      gainNode = ctx.createGain();
      gainNode.gain.value = volume;
      gainNode.connect(ctx.destination);
    },
    getContext() { return ctx; },
    getOutput() { return gainNode; },
    getVolume() { return volume; },
    isMuted() { return muted; },
    setVolume(v) {
      volume = Math.max(0, Math.min(1, v));
      if (gainNode) gainNode.gain.value = muted ? 0 : volume;
    },
    toggleMute() {
      muted = !muted;
      if (gainNode) gainNode.gain.value = muted ? 0 : volume;
    },
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/SoundEngine.test.js`
Expected: PASS (5 tests). Note: `init()` test may need `globalThis.AudioContext` mock in vitest — if so, add:
```js
beforeEach(() => {
  globalThis.AudioContext = vi.fn(() => ({
    createGain: () => ({ gain: { value: 0 }, connect: vi.fn() }),
    destination: {},
  }));
  engine = createSoundEngine();
});
```

- [ ] **Step 5: Implement SFX module**

```js
// src/audio/SFX.js

function randomRange(min, max) {
  return min + Math.random() * (max - min);
}

function playNoiseBurst(ctx, output, duration, frequency, q) {
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = frequency;
  filter.Q.value = q;

  const env = ctx.createGain();
  env.gain.setValueAtTime(0.3, ctx.currentTime);
  env.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  source.connect(filter);
  filter.connect(env);
  env.connect(output);
  source.start();
}

function playSinePop(ctx, output, startFreq, endFreq, duration) {
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + duration);

  const env = ctx.createGain();
  env.gain.setValueAtTime(0.25, ctx.currentTime);
  env.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  osc.connect(env);
  env.connect(output);
  osc.start();
  osc.stop(ctx.currentTime + duration);
}

export function createSFX(soundEngine) {
  function play(fn) {
    const ctx = soundEngine.getContext();
    const output = soundEngine.getOutput();
    if (!ctx || !output || soundEngine.isMuted()) return;
    fn(ctx, output);
  }

  return {
    squelch() {
      play((ctx, out) => {
        const freq = randomRange(300, 500);
        const dur = randomRange(0.06, 0.1);
        playNoiseBurst(ctx, out, dur, freq, 5);
        playSinePop(ctx, out, randomRange(150, 250), randomRange(60, 100), dur * 1.5);
      });
    },
    bubblePop() {
      play((ctx, out) => {
        playSinePop(ctx, out, randomRange(600, 900), randomRange(100, 200), randomRange(0.08, 0.15));
      });
    },
    waterDrop() {
      play((ctx, out) => {
        playSinePop(ctx, out, randomRange(1200, 1800), randomRange(800, 1000), 0.06);
      });
    },
    crack() {
      play((ctx, out) => {
        playNoiseBurst(ctx, out, randomRange(0.1, 0.2), randomRange(2000, 4000), 1);
      });
    },
    membraneTear() {
      play((ctx, out) => {
        playNoiseBurst(ctx, out, randomRange(0.3, 0.5), randomRange(500, 1500), 3);
      });
    },
    splat() {
      play((ctx, out) => {
        const dur = randomRange(0.08, 0.12);
        playNoiseBurst(ctx, out, dur, randomRange(400, 800), 4);
        playSinePop(ctx, out, randomRange(200, 400), randomRange(80, 150), dur);
      });
    },
    upgradePop() {
      play((ctx, out) => {
        playSinePop(ctx, out, 400, 800, 0.1);
        playSinePop(ctx, out, 600, 1200, 0.08);
      });
    },
  };
}
```

- [ ] **Step 6: Commit**

```bash
git add src/audio/SoundEngine.js src/audio/SFX.js tests/SoundEngine.test.js
git commit -m "feat: add procedural audio engine with ASMR sound effects"
```

---

## Task 2: Ambient Soundscape

**Files:**
- Create: `src/audio/Ambient.js`

- [ ] **Step 1: Implement Ambient module**

```js
// src/audio/Ambient.js
export function createAmbient(soundEngine) {
  let heartbeatOsc = null;
  let heartbeatGain = null;
  let burbleInterval = null;
  let running = false;

  function startHeartbeat(ctx, output) {
    heartbeatOsc = ctx.createOscillator();
    heartbeatOsc.type = 'sine';
    heartbeatOsc.frequency.value = 40;

    heartbeatGain = ctx.createGain();
    heartbeatGain.gain.value = 0;

    heartbeatOsc.connect(heartbeatGain);
    heartbeatGain.connect(output);
    heartbeatOsc.start();
  }

  function scheduleBurble(ctx, output) {
    burbleInterval = setInterval(() => {
      if (soundEngine.isMuted()) return;
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      const freq = 200 + Math.random() * 400;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.5, ctx.currentTime + 0.15);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(output);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    }, 800 + Math.random() * 2000);
  }

  return {
    start() {
      const ctx = soundEngine.getContext();
      const output = soundEngine.getOutput();
      if (!ctx || !output || running) return;
      running = true;
      startHeartbeat(ctx, output);
      scheduleBurble(ctx, output);
    },
    stop() {
      running = false;
      if (heartbeatOsc) { heartbeatOsc.stop(); heartbeatOsc = null; }
      if (burbleInterval) { clearInterval(burbleInterval); burbleInterval = null; }
    },
    /** progress: 0-1 representing overall game progress */
    update(progress) {
      if (!heartbeatGain) return;
      // Heartbeat gets louder and faster with progress
      heartbeatGain.gain.value = 0.02 + progress * 0.08;
      if (heartbeatOsc) {
        heartbeatOsc.frequency.value = 40 + progress * 20;
      }
    },
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/audio/Ambient.js
git commit -m "feat: add ambient heartbeat and burble soundscape"
```

---

## Task 3: Cell Renderer

**Files:**
- Create: `src/rendering/CellRenderer.js`
- Test: `tests/CellRenderer.test.js`

- [ ] **Step 1: Write failing tests**

```js
// tests/CellRenderer.test.js
import { describe, it, expect } from 'vitest';
import { createCell, updateCell } from '../src/rendering/CellRenderer.js';

describe('CellRenderer', () => {
  it('createCell returns cell with position, radius, and hue', () => {
    const cell = createCell(100, 100, 20);
    expect(cell.x).toBe(100);
    expect(cell.y).toBe(100);
    expect(cell.radius).toBe(20);
    expect(cell.hue).toBeDefined();
    expect(cell.phase).toBeDefined();
    expect(cell.cytoplasm).toBeInstanceOf(Array);
  });

  it('updateCell changes phase over time', () => {
    const cell = createCell(100, 100, 20);
    const oldPhase = cell.phase;
    updateCell(cell, 0.1);
    expect(cell.phase).not.toBe(oldPhase);
  });

  it('createCell generates cytoplasm particles', () => {
    const cell = createCell(100, 100, 30);
    expect(cell.cytoplasm.length).toBeGreaterThanOrEqual(2);
    expect(cell.cytoplasm.length).toBeLessThanOrEqual(4);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/CellRenderer.test.js`
Expected: FAIL — module not found

- [ ] **Step 3: Implement CellRenderer**

```js
// src/rendering/CellRenderer.js
const TWO_PI = Math.PI * 2;

export function createCell(x, y, radius, hue = 140) {
  const cytoCount = 2 + Math.floor(Math.random() * 3);
  const cytoplasm = [];
  for (let i = 0; i < cytoCount; i++) {
    cytoplasm.push({
      angle: Math.random() * TWO_PI,
      dist: Math.random() * radius * 0.5,
      speed: 0.3 + Math.random() * 0.5,
      size: 2 + Math.random() * 3,
      hueOffset: Math.random() * 60 - 30,
    });
  }
  return {
    x, y, radius, hue,
    phase: Math.random() * TWO_PI,
    wobbleSpeed: 1.5 + Math.random() * 0.5,
    cytoplasm,
    pulseAmount: 0,  // set externally on click
    membrane: { thickness: 1.5, glowAlpha: 0.3 },
  };
}

export function updateCell(cell, dt) {
  cell.phase += cell.wobbleSpeed * dt;
  // Decay click pulse
  if (cell.pulseAmount > 0) {
    cell.pulseAmount = Math.max(0, cell.pulseAmount - dt * 4);
  }
  // Drift cytoplasm
  for (const c of cell.cytoplasm) {
    c.angle += c.speed * dt;
  }
}

export function renderCell(ctx, cell) {
  const { x, y, radius, hue, phase, cytoplasm, membrane, pulseAmount } = cell;
  const r = radius + Math.sin(phase) * radius * 0.05 + pulseAmount * radius * 0.15;

  // Glow
  const glow = ctx.createRadialGradient(x, y, r * 0.5, x, y, r * 2);
  glow.addColorStop(0, `hsla(${hue}, 80%, 50%, ${0.15 + pulseAmount * 0.1})`);
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.fillRect(x - r * 2, y - r * 2, r * 4, r * 4);

  // Membrane (organic wobble shape)
  ctx.beginPath();
  const segments = 32;
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * TWO_PI;
    const wobble = 1 + 0.06 * Math.sin(angle * 3 + phase) + 0.04 * Math.sin(angle * 5 - phase * 1.3);
    const px = x + Math.cos(angle) * r * wobble;
    const py = y + Math.sin(angle) * r * wobble;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();

  // Fill — radial gradient
  const fill = ctx.createRadialGradient(x - r * 0.2, y - r * 0.2, 0, x, y, r);
  fill.addColorStop(0, `hsla(${hue}, 80%, 55%, 0.9)`);
  fill.addColorStop(0.6, `hsla(${hue}, 70%, 35%, 0.85)`);
  fill.addColorStop(1, `hsla(${hue}, 60%, 15%, 0.8)`);
  ctx.fillStyle = fill;
  ctx.fill();

  // Membrane stroke
  ctx.strokeStyle = `hsla(${hue}, 80%, 60%, ${membrane.glowAlpha})`;
  ctx.lineWidth = membrane.thickness;
  ctx.stroke();

  // Cytoplasm particles
  for (const c of cytoplasm) {
    const cx = x + Math.cos(c.angle) * c.dist;
    const cy = y + Math.sin(c.angle) * c.dist;
    ctx.beginPath();
    ctx.arc(cx, cy, c.size, 0, TWO_PI);
    ctx.fillStyle = `hsla(${hue + c.hueOffset}, 70%, 60%, 0.5)`;
    ctx.fill();
  }
}

/** Trigger click pulse on a cell */
export function pulseCell(cell) {
  cell.pulseAmount = 1;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/CellRenderer.test.js`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/rendering/CellRenderer.js tests/CellRenderer.test.js
git commit -m "feat: add organic cell renderer with wobble, glow, and cytoplasm"
```

---

## Task 4: Colony Renderer

**Files:**
- Create: `src/rendering/ColonyRenderer.js`

- [ ] **Step 1: Implement ColonyRenderer**

```js
// src/rendering/ColonyRenderer.js
import { createCell, updateCell, renderCell, pulseCell } from './CellRenderer.js';

export function createColony(x, y) {
  return {
    cells: [createCell(x, y, 20, 140)],
    connections: [],
  };
}

export function addCell(colony, hue) {
  // Find parent (random existing cell)
  const parent = colony.cells[Math.floor(Math.random() * colony.cells.length)];
  const angle = Math.random() * Math.PI * 2;
  const dist = parent.radius * 1.8 + Math.random() * 10;
  const newRadius = 10 + Math.random() * 12;
  const cell = createCell(
    parent.x + Math.cos(angle) * dist,
    parent.y + Math.sin(angle) * dist,
    newRadius,
    hue || parent.hue + (Math.random() * 40 - 20),
  );
  colony.cells.push(cell);
  colony.connections.push({ a: colony.cells.indexOf(parent), b: colony.cells.length - 1 });
  return cell;
}

export function updateColony(colony, dt) {
  for (const cell of colony.cells) {
    updateCell(cell, dt);
  }
}

export function renderColony(ctx, colony) {
  // Draw membrane bridges first (behind cells)
  ctx.lineWidth = 1.5;
  for (const conn of colony.connections) {
    const a = colony.cells[conn.a];
    const b = colony.cells[conn.b];
    if (!a || !b) continue;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > (a.radius + b.radius) * 3) continue; // too far, no bridge
    const midX = (a.x + b.x) / 2 + Math.sin(a.phase) * 3;
    const midY = (a.y + b.y) / 2 + Math.cos(a.phase) * 3;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.quadraticCurveTo(midX, midY, b.x, b.y);
    ctx.strokeStyle = `hsla(${a.hue}, 60%, 40%, 0.2)`;
    ctx.stroke();
  }

  // Draw cells
  for (const cell of colony.cells) {
    renderCell(ctx, cell);
  }
}

export function pulseColony(colony, x, y) {
  // Pulse the nearest cell to click position
  let nearest = colony.cells[0];
  let minDist = Infinity;
  for (const cell of colony.cells) {
    const dx = cell.x - x;
    const dy = cell.y - y;
    const d = dx * dx + dy * dy;
    if (d < minDist) { minDist = d; nearest = cell; }
  }
  if (nearest) pulseCell(nearest);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/rendering/ColonyRenderer.js
git commit -m "feat: add colony renderer with cell division and membrane bridges"
```

---

## Task 5: Breach Renderer

**Files:**
- Create: `src/rendering/BreachRenderer.js`

- [ ] **Step 1: Implement BreachRenderer**

```js
// src/rendering/BreachRenderer.js
const TWO_PI = Math.PI * 2;

export function createBreachState() {
  return {
    cracks: [],
    tendrils: [],
    shattered: false,
    progress: 0, // 0-1
  };
}

export function triggerBreach(breachState) {
  // Generate crack lines from center of each edge
  const crackCount = 6 + Math.floor(Math.random() * 4);
  for (let i = 0; i < crackCount; i++) {
    const angle = (i / crackCount) * TWO_PI + (Math.random() - 0.5) * 0.3;
    const length = 20 + Math.random() * 40;
    breachState.cracks.push({
      angle,
      length,
      width: 1 + Math.random() * 2,
      progress: 0,
    });
  }
}

export function addTendril(breachState, originX, originY, angle) {
  const segments = 5 + Math.floor(Math.random() * 4);
  const points = [{ x: originX, y: originY }];
  let x = originX;
  let y = originY;
  for (let i = 0; i < segments; i++) {
    const len = 15 + Math.random() * 25;
    const wobble = (Math.random() - 0.5) * 0.8;
    x += Math.cos(angle + wobble) * len;
    y += Math.sin(angle + wobble) * len;
    points.push({ x, y });
  }
  breachState.tendrils.push({
    points,
    hue: 120 + Math.random() * 60,
    thickness: 2 + Math.random() * 3,
    phase: Math.random() * TWO_PI,
    growProgress: 0,
  });
}

export function updateBreach(breachState, dt) {
  // Animate cracks
  for (const crack of breachState.cracks) {
    if (crack.progress < 1) {
      crack.progress = Math.min(1, crack.progress + dt * 3);
    }
  }
  // Grow tendrils
  for (const t of breachState.tendrils) {
    t.phase += dt * 2;
    if (t.growProgress < 1) {
      t.growProgress = Math.min(1, t.growProgress + dt * 0.8);
    }
  }
  // Overall progress
  if (!breachState.shattered && breachState.cracks.length > 0) {
    const allDone = breachState.cracks.every(c => c.progress >= 1);
    if (allDone) breachState.shattered = true;
  }
}

export function renderBreach(ctx, breachState, containerX, containerY, containerW, containerH) {
  const cx = containerX + containerW / 2;
  const cy = containerY + containerH / 2;

  // Cracks emanating from container edges
  ctx.lineCap = 'round';
  for (const crack of breachState.cracks) {
    if (crack.progress <= 0) continue;
    const len = crack.length * crack.progress;
    // Start from nearest edge point
    const edgeX = cx + Math.cos(crack.angle) * (containerW / 2);
    const edgeY = cy + Math.sin(crack.angle) * (containerH / 2);
    const endX = edgeX + Math.cos(crack.angle) * len;
    const endY = edgeY + Math.sin(crack.angle) * len;

    ctx.beginPath();
    ctx.moveTo(edgeX, edgeY);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = `rgba(0, 255, 136, ${0.6 * crack.progress})`;
    ctx.lineWidth = crack.width;
    ctx.stroke();

    // Glow
    ctx.strokeStyle = `rgba(0, 255, 136, ${0.15 * crack.progress})`;
    ctx.lineWidth = crack.width + 4;
    ctx.stroke();
  }

  // Tendrils
  for (const t of breachState.tendrils) {
    const visiblePoints = Math.ceil(t.points.length * t.growProgress);
    if (visiblePoints < 2) continue;

    ctx.beginPath();
    ctx.moveTo(t.points[0].x, t.points[0].y);
    for (let i = 1; i < visiblePoints; i++) {
      const p = t.points[i];
      const wobbleX = Math.sin(t.phase + i * 0.8) * 3;
      const wobbleY = Math.cos(t.phase + i * 1.1) * 3;
      if (i < visiblePoints - 1) {
        const next = t.points[i + 1];
        const cpX = (p.x + next.x) / 2 + wobbleX;
        const cpY = (p.y + next.y) / 2 + wobbleY;
        ctx.quadraticCurveTo(p.x + wobbleX, p.y + wobbleY, cpX, cpY);
      } else {
        ctx.lineTo(p.x + wobbleX, p.y + wobbleY);
      }
    }

    ctx.strokeStyle = `hsla(${t.hue}, 70%, 45%, 0.7)`;
    ctx.lineWidth = t.thickness;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Glow
    ctx.strokeStyle = `hsla(${t.hue}, 70%, 45%, 0.15)`;
    ctx.lineWidth = t.thickness + 4;
    ctx.stroke();

    // Tip glow
    const tip = t.points[visiblePoints - 1];
    const tipGlow = ctx.createRadialGradient(tip.x, tip.y, 0, tip.x, tip.y, 8);
    tipGlow.addColorStop(0, `hsla(${t.hue}, 80%, 60%, 0.4)`);
    tipGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = tipGlow;
    ctx.fillRect(tip.x - 8, tip.y - 8, 16, 16);
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/rendering/BreachRenderer.js
git commit -m "feat: add breach renderer with crack effects and organic tendrils"
```

---

## Task 6: Rebalance Progression

**Files:**
- Modify: `src/stages/StageManager.js`
- Modify: `src/game/GameState.js`
- Modify: `src/game/Upgrades.js`
- Modify: `tests/StageManager.test.js`
- Modify: `tests/Upgrades.test.js`

- [ ] **Step 1: Update StageManager thresholds and add milestones**

```js
// src/stages/StageManager.js
export const STAGE_THRESHOLDS = {
  2: 20,
  3: 200,
  4: 2000,
  5: 15000,
};

export const MILESTONES = {
  cellGrow: 5,
  firstCytoplasm: 10,
  membraneWobble: 15,
  cyanCell: 30,
  purpleOrganelle: 60,
  membraneBridges: 100,
  goldOrganelle: 150,
  firstTendril: 300,
  backgroundShift: 500,
  halfViewport: 1000,
};

const MAX_STAGE = 5;

export function checkStageTransition(state) {
  const nextStage = state.stage + 1;
  if (nextStage > MAX_STAGE) return false;
  const threshold = STAGE_THRESHOLDS[nextStage];
  if (threshold === undefined) return false;
  if (state.totalPixelsEarned >= threshold) {
    state.stage = nextStage;
    return true;
  }
  return false;
}

export function checkMilestones(state) {
  const reached = [];
  for (const [name, threshold] of Object.entries(MILESTONES)) {
    if (state.totalPixelsEarned >= threshold && !state.milestones[name]) {
      state.milestones[name] = true;
      reached.push(name);
    }
  }
  return reached;
}
```

- [ ] **Step 2: Update GameState with new fields**

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
    milestones: {},
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

- [ ] **Step 3: Update Upgrades with rebalanced costs**

Replace base costs in `src/game/Upgrades.js`:

```
autoClicker:    baseCost: 10 → baseCost: 5
clickMultiplier: baseCost: 50 → baseCost: 15
autoSpeed:      baseCost: 100 → baseCost: 40
```

- [ ] **Step 4: Update tests**

In `tests/StageManager.test.js`, update expected thresholds:
- Stage 2 threshold: `100` → `20`
- Stage 3 threshold: `5000` → `200`
- Add tests for stages 4 (2000) and 5 (15000)
- Add test for `checkMilestones`

In `tests/Upgrades.test.js`, update expected costs:
- Auto Clicker base: `10` → `5`
- Click Power base: `50` → `15`
- Auto Speed base: `100` → `40`

- [ ] **Step 5: Run all tests**

Run: `npx vitest run`
Expected: ALL PASS

- [ ] **Step 6: Commit**

```bash
git add src/stages/StageManager.js src/game/GameState.js src/game/Upgrades.js tests/StageManager.test.js tests/Upgrades.test.js
git commit -m "feat: rebalance progression — faster pacing with milestones"
```

---

## Task 7: Rewrite Stage Renderers

**Files:**
- Modify: `src/stages/Stage1_Seed.js`
- Modify: `src/stages/Stage2_Growth.js`
- Modify: `src/stages/Stage3_Breach.js`
- Create: `src/rendering/OrganismRenderer.js`

- [ ] **Step 1: Create OrganismRenderer (composite)**

```js
// src/rendering/OrganismRenderer.js
import { createColony, addCell, updateColony, renderColony, pulseColony } from './ColonyRenderer.js';
import { createBreachState, triggerBreach, addTendril, updateBreach, renderBreach } from './BreachRenderer.js';

export function createOrganism(centerX, centerY) {
  return {
    colony: createColony(centerX, centerY),
    breach: createBreachState(),
    centerX,
    centerY,
  };
}

export function getOrganism() { return organism; }

let organism = null;

export function initOrganism(centerX, centerY) {
  organism = createOrganism(centerX, centerY);
  return organism;
}

export function updateOrganism(dt) {
  if (!organism) return;
  updateColony(organism.colony, dt);
  updateBreach(organism.breach, dt);
}

export function renderOrganism(ctx, canvasW, canvasH) {
  if (!organism) return;
  renderColony(ctx, organism.colony);
  renderBreach(ctx, organism.breach, 0, 0, canvasW, canvasH);
}

export function onOrganismClick(x, y) {
  if (!organism) return;
  pulseColony(organism.colony, x, y);
}

export function triggerDivision(hue) {
  if (!organism) return;
  addCell(organism.colony, hue);
}

export function triggerBreachSequence(containerW, containerH) {
  if (!organism) return;
  triggerBreach(organism.breach);
  // Add initial tendrils in 4 directions
  const cx = containerW / 2;
  const cy = containerH / 2;
  const angles = [0, Math.PI / 2, Math.PI, Math.PI * 1.5];
  for (const angle of angles) {
    const ox = cx + Math.cos(angle) * (containerW / 2);
    const oy = cy + Math.sin(angle) * (containerH / 2);
    addTendril(organism.breach, ox, oy, angle);
  }
}

export function addOrganismTendril(angle) {
  if (!organism) return;
  const ox = organism.centerX + Math.cos(angle) * 100;
  const oy = organism.centerY + Math.sin(angle) * 100;
  addTendril(organism.breach, ox, oy, angle);
}
```

- [ ] **Step 2: Rewrite Stage1_Seed.js**

```js
// src/stages/Stage1_Seed.js
import { renderOrganism } from '../rendering/OrganismRenderer.js';

export function renderStage1(ctx, state, canvasW, canvasH, time) {
  // Dark organic background
  ctx.fillStyle = '#050510';
  ctx.fillRect(0, 0, canvasW, canvasH);

  // Subtle noise texture (pseudo via transparent dots)
  ctx.fillStyle = 'rgba(0, 255, 136, 0.01)';
  for (let i = 0; i < 20; i++) {
    const nx = Math.sin(time * 0.1 + i * 7.3) * canvasW * 0.5 + canvasW * 0.5;
    const ny = Math.cos(time * 0.1 + i * 4.1) * canvasH * 0.5 + canvasH * 0.5;
    ctx.fillRect(nx, ny, 2, 2);
  }

  renderOrganism(ctx, canvasW, canvasH);

  // "click me" hint (fades out after a few clicks)
  if (state.totalPixelsEarned < 5) {
    const alpha = 1 - state.totalPixelsEarned / 5;
    ctx.fillStyle = `rgba(100, 100, 100, ${alpha * 0.5})`;
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('click the cell', canvasW / 2, canvasH - 20);
  }
}
```

- [ ] **Step 3: Rewrite Stage2_Growth.js**

```js
// src/stages/Stage2_Growth.js
import { renderOrganism } from '../rendering/OrganismRenderer.js';

export function renderStage2(ctx, state, canvasW, canvasH, time) {
  // Darker background with subtle hue shift
  const bgHue = 240 + Math.sin(time * 0.05) * 10;
  ctx.fillStyle = `hsl(${bgHue}, 30%, 3%)`;
  ctx.fillRect(0, 0, canvasW, canvasH);

  renderOrganism(ctx, canvasW, canvasH);
}
```

- [ ] **Step 4: Rewrite Stage3_Breach.js**

```js
// src/stages/Stage3_Breach.js
import { renderOrganism } from '../rendering/OrganismRenderer.js';

export function renderStage3(ctx, state, canvasW, canvasH, time) {
  // Background shifts toward red/purple as breach progresses
  const intensity = Math.min(1, (state.totalPixelsEarned - 200) / 1800);
  const bgHue = 240 - intensity * 60;
  ctx.fillStyle = `hsl(${bgHue}, ${20 + intensity * 20}%, 3%)`;
  ctx.fillRect(0, 0, canvasW, canvasH);

  renderOrganism(ctx, canvasW, canvasH);

  // Scan-line effect intensifies
  if (intensity > 0.3) {
    ctx.fillStyle = `rgba(0, 255, 136, ${0.02 * intensity})`;
    for (let y = 0; y < canvasH; y += 4) {
      ctx.fillRect(0, y, canvasW, 1);
    }
  }
}
```

- [ ] **Step 5: Commit**

```bash
git add src/rendering/OrganismRenderer.js src/stages/Stage1_Seed.js src/stages/Stage2_Growth.js src/stages/Stage3_Breach.js
git commit -m "feat: rewrite stage renderers with organic bio-digital visuals"
```

---

## Task 8: Wire Everything in main.js

**Files:**
- Modify: `src/main.js`
- Modify: `src/game/ClickHandler.js`
- Modify: `style.css`
- Modify: `index.html`

- [ ] **Step 1: Update index.html — add mute button**

Add before `</body>`:
```html
<button id="mute-btn" style="position:fixed;top:10px;right:10px;background:none;border:1px solid #333;color:#666;font-family:monospace;font-size:11px;padding:4px 8px;cursor:pointer;z-index:100;">sound: on</button>
```

- [ ] **Step 2: Update style.css — bio-organic theme**

Replace entire `style.css`:
```css
/* style.css — Bio-Digital Theme */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background: #050510;
  color: #a0c0a0;
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
  border: 1px solid rgba(0, 255, 136, 0.15);
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  transition: width 0.8s ease, height 0.8s ease, border-color 0.5s;
  box-shadow: 0 0 20px rgba(0, 255, 136, 0.05);
}

#game-container.breached {
  overflow: visible;
  border-color: transparent;
  box-shadow: none;
  animation: breach-flash 0.5s ease-out;
}

@keyframes breach-flash {
  0% { box-shadow: 0 0 0 0 rgba(0,255,136,0.8); }
  50% { box-shadow: 0 0 60px 30px rgba(0,255,136,0.3); }
  100% { box-shadow: 0 0 0 0 transparent; }
}

#game-canvas {
  display: block;
  cursor: pointer;
}

#ui-panel {
  width: 200px;
  padding: 12px;
  background: rgba(5, 5, 16, 0.9);
  border: 1px solid rgba(0, 255, 136, 0.1);
  border-radius: 8px;
  font-size: 13px;
}

#ad-slot {
  position: fixed;
  bottom: 10px;
  right: 10px;
  width: 300px;
  height: 250px;
  background: rgba(10, 10, 20, 0.8);
  border: 1px dashed rgba(0, 255, 136, 0.1);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #333;
  font-size: 12px;
  transition: opacity 1s;
}

#ad-slot::after {
  content: 'AD SPACE';
}

/* Infected element styles (Stage 4) */
.infected {
  position: relative;
  transition: all 0.5s ease;
}

.infected::after {
  content: '';
  position: absolute;
  inset: -2px;
  background: radial-gradient(ellipse, rgba(0,255,136,0.1), transparent);
  border-radius: inherit;
  pointer-events: none;
  animation: infect-pulse 2s infinite;
}

@keyframes infect-pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}
```

- [ ] **Step 3: Rewrite main.js**

```js
// src/main.js
import { createInitialState, calcOfflinePixels } from './game/GameState.js';
import { addPixels, addRawPixels } from './game/Resources.js';
import { createGameLoop } from './game/GameLoop.js';
import { setupClickHandler } from './game/ClickHandler.js';
import { checkStageTransition, checkMilestones, STAGE_THRESHOLDS } from './stages/StageManager.js';
import { renderStage1 } from './stages/Stage1_Seed.js';
import { renderStage2 } from './stages/Stage2_Growth.js';
import { renderStage3 } from './stages/Stage3_Breach.js';
import { activateBreach, updateBreachSize } from './meta/FrameBreaker.js';
import { initOrganism, updateOrganism, onOrganismClick, triggerDivision, triggerBreachSequence, addOrganismTendril } from './rendering/OrganismRenderer.js';
import { createUIPanel } from './ui/UIPanel.js';
import { saveGame, loadGame } from './save/SaveManager.js';
import { initAds } from './monetization/MonetizationManager.js';
import { createSoundEngine } from './audio/SoundEngine.js';
import { createSFX } from './audio/SFX.js';
import { createAmbient } from './audio/Ambient.js';

// DOM
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const container = document.getElementById('game-container');
const uiPanelEl = document.getElementById('ui-panel');
const adSlotEl = document.getElementById('ad-slot');
const muteBtn = document.getElementById('mute-btn');

// State
const saved = loadGame();
const state = saved || createInitialState();
// Ensure milestones exist for old saves
if (!state.milestones) state.milestones = {};

// Offline earnings
if (saved) {
  const offlineEarned = calcOfflinePixels(state);
  if (offlineEarned > 0) addRawPixels(state, offlineEarned);
}
state.lastSaveTime = Date.now();

// Audio
const soundEngine = createSoundEngine();
const sfx = createSFX(soundEngine);
const ambient = createAmbient(soundEngine);

// Init audio on first interaction
let audioStarted = false;
function ensureAudio() {
  if (audioStarted) return;
  audioStarted = true;
  soundEngine.init();
  ambient.start();
}

// Mute button
if (muteBtn) {
  muteBtn.addEventListener('click', () => {
    ensureAudio();
    soundEngine.toggleMute();
    muteBtn.textContent = soundEngine.isMuted() ? 'sound: off' : 'sound: on';
  });
}

// Systems
const uiPanel = createUIPanel(uiPanelEl, state, sfx);
initAds(adSlotEl);

let breachActivated = false;
let gameTime = 0;
let lastAutoSave = Date.now();

// Canvas sizing
function resizeCanvas() {
  const rect = breachActivated
    ? canvas.getBoundingClientRect()
    : container.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Init organism at canvas center
const org = initOrganism(canvas.width / 2, canvas.height / 2);

// Click handler
setupClickHandler(canvas, state, (x, y) => {
  ensureAudio();
  sfx.squelch();
  onOrganismClick(x, y);
});

// Stage renderers
const stageRenderers = {
  1: renderStage1,
  2: renderStage2,
  3: renderStage3,
};

// Container growth (Stage 2)
function updateContainerSize() {
  if (state.stage >= 2 && !breachActivated) {
    const progress = Math.min(1, state.totalPixelsEarned / STAGE_THRESHOLDS[3]);
    const size = 200 + progress * 200;
    container.style.width = size + 'px';
    container.style.height = size + 'px';
    resizeCanvas();
  }
}

// Milestone handlers
const milestoneActions = {
  cellGrow() { /* handled by rendering — cell grows with pixels */ },
  firstCytoplasm() { sfx.waterDrop(); },
  membraneWobble() { sfx.waterDrop(); },
  cyanCell() { triggerDivision(180); sfx.bubblePop(); },
  purpleOrganelle() { triggerDivision(280); sfx.bubblePop(); },
  membraneBridges() { sfx.bubblePop(); },
  goldOrganelle() { triggerDivision(45); sfx.bubblePop(); },
  firstTendril() {
    const angle = Math.random() * Math.PI * 2;
    addOrganismTendril(angle);
    sfx.splat();
  },
  backgroundShift() { sfx.crack(); },
  halfViewport() { sfx.membraneTear(); },
};

// Division counter — triggers cell division at intervals
let lastDivisionPixels = 0;
const DIVISION_INTERVAL = 8; // every N pixels earned

// Game loop
const loop = createGameLoop(
  (dt) => {
    gameTime += dt;

    // Auto-click income
    if (state.autoClickRate > 0) {
      addRawPixels(state, state.autoClickRate * dt);
    }

    // Cell division based on pixel progress
    const divisionsSinceLast = Math.floor(state.totalPixelsEarned / DIVISION_INTERVAL) - Math.floor(lastDivisionPixels / DIVISION_INTERVAL);
    if (divisionsSinceLast > 0 && org.colony.cells.length < 50) {
      for (let i = 0; i < Math.min(divisionsSinceLast, 3); i++) {
        triggerDivision();
        if (audioStarted) sfx.bubblePop();
      }
    }
    lastDivisionPixels = state.totalPixelsEarned;

    // Stage transition
    const advanced = checkStageTransition(state);
    if (advanced) onStageAdvance();

    // Milestones
    const reached = checkMilestones(state);
    for (const name of reached) {
      if (milestoneActions[name]) milestoneActions[name]();
    }

    // Update organism
    updateOrganism(dt);
    updateContainerSize();

    // Breach expansion
    if (breachActivated) {
      const breachProgress = Math.min(1,
        (state.totalPixelsEarned - STAGE_THRESHOLDS[3]) / (STAGE_THRESHOLDS[3] * 3));
      updateBreachSize(container, canvas, breachProgress);
      resizeCanvas();
    }

    // Ambient update
    if (audioStarted) {
      const maxPixels = STAGE_THRESHOLDS[5] || 15000;
      ambient.update(Math.min(1, state.totalPixelsEarned / maxPixels));
    }

    // Auto-save
    if (Date.now() - lastAutoSave > 30000) {
      saveGame(state);
      lastAutoSave = Date.now();
    }
  },
  () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const renderer = stageRenderers[state.stage];
    if (renderer) renderer(ctx, state, canvas.width, canvas.height, gameTime);

    uiPanel.update();
  }
);

function onStageAdvance() {
  if (state.stage === 3 && !breachActivated) {
    breachActivated = true;
    activateBreach(container, canvas);
    triggerBreachSequence(canvas.width, canvas.height);
    resizeCanvas();
    if (audioStarted) {
      sfx.crack();
      setTimeout(() => sfx.membraneTear(), 300);
    }
  }
  saveGame(state);
}

loop.start();
```

- [ ] **Step 4: Update ClickHandler — remove old particle callback signature**

No change needed — `setupClickHandler` already passes `(x, y)` to callback.

- [ ] **Step 5: Update UIPanel — add throttling and pass sfx for upgrade sound**

```js
// src/ui/UIPanel.js
import { formatNumber, canAfford } from '../game/Resources.js';
import { UPGRADE_DEFS, getUpgradeCost, purchaseUpgrade } from '../game/Upgrades.js';

export function createUIPanel(container, state, sfx) {
  let lastRender = 0;
  const THROTTLE_MS = 200;

  const panel = {
    el: container,
    update() {
      const now = Date.now();
      if (now - lastRender < THROTTLE_MS) return;
      lastRender = now;
      renderPanel(container, state);
    },
  };
  container.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-upgrade]');
    if (!btn) return;
    const id = btn.dataset.upgrade;
    const bought = purchaseUpgrade(state, id);
    if (bought && sfx) sfx.upgradePop();
    panel.update();
  });
  return panel;
}

function renderPanel(container, state) {
  const stageNames = { 1: 'Seed', 2: 'Growth', 3: 'Breach', 4: 'Takeover', 5: 'Domination' };
  let html = `
    <div style="margin-bottom:12px">
      <div style="font-size:18px;color:#00ff88;text-shadow:0 0 10px rgba(0,255,136,0.3)">${formatNumber(state.pixels)} px</div>
      <div style="color:#446644;font-size:11px">${formatNumber(state.autoClickRate)}/sec</div>
      <div style="margin-top:4px;color:#335533;font-size:11px">Stage ${state.stage}: ${stageNames[state.stage] || '???'}</div>
    </div>
    <div style="font-size:12px;color:#446644;margin-bottom:8px;letter-spacing:1px">UPGRADES</div>
  `;

  for (const [id, def] of Object.entries(UPGRADE_DEFS)) {
    const level = state.upgrades[id] || 0;
    const cost = getUpgradeCost(id, level);
    const affordable = canAfford(state, cost);
    const color = affordable ? '#00ff88' : '#334433';
    const cursor = affordable ? 'pointer' : 'default';
    html += `
      <button data-upgrade="${id}" style="
        display:block;width:100%;text-align:left;
        background:rgba(0,255,136,0.03);border:1px solid ${color};color:${color};
        padding:8px;margin-bottom:6px;cursor:${cursor};
        font-family:monospace;font-size:12px;border-radius:6px;
        transition:border-color 0.3s,color 0.3s;
      ">
        <div>${def.label} (Lv.${level})</div>
        <div style="color:#446644;font-size:11px">${def.description}</div>
        <div style="color:${color};font-size:11px">Cost: ${formatNumber(cost)} px</div>
      </button>
    `;
  }

  container.innerHTML = html;
}
```

- [ ] **Step 6: Run all tests**

Run: `npx vitest run`
Expected: ALL PASS

- [ ] **Step 7: Commit**

```bash
git add src/main.js src/ui/UIPanel.js src/game/ClickHandler.js style.css index.html
git commit -m "feat: wire bio-digital organism, audio, and organic UI theme"
```

---

## Task 9: DOM Infector (Stage 4)

**Files:**
- Create: `src/meta/DOMInfector.js`
- Create: `src/stages/Stage4_Takeover.js`
- Test: `tests/DOMInfector.test.js`

- [ ] **Step 1: Write failing test**

```js
// tests/DOMInfector.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import { createInfector, getInfectableElements } from '../src/meta/DOMInfector.js';

describe('DOMInfector', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="ad-slot">Ad</div>
      <button>Click</button>
      <div id="ui-panel">Panel</div>
    `;
  });

  it('getInfectableElements finds ad-slot, buttons, and ui-panel', () => {
    const elements = getInfectableElements();
    expect(elements.length).toBeGreaterThanOrEqual(2);
  });

  it('createInfector infects elements in order', () => {
    const infector = createInfector();
    const infected = infector.infectNext();
    expect(infected).not.toBe(null);
    expect(infected.classList.contains('infected')).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/DOMInfector.test.js`
Expected: FAIL — module not found

- [ ] **Step 3: Implement DOMInfector**

```js
// src/meta/DOMInfector.js
const INFECTABLE_SELECTORS = [
  '#ad-slot',
  '#ui-panel button',
  '#ui-panel',
  'h1', 'h2', 'h3',
  '#mute-btn',
];

export function getInfectableElements() {
  const found = [];
  const infected = new Set();
  for (const sel of INFECTABLE_SELECTORS) {
    const els = document.querySelectorAll(sel);
    for (const el of els) {
      if (!infected.has(el) && !el.classList.contains('infected')) {
        found.push(el);
        infected.add(el);
      }
    }
  }
  return found;
}

export function createInfector() {
  let queue = [];
  let infectedCount = 0;

  return {
    getInfectedCount() { return infectedCount; },

    refresh() {
      queue = getInfectableElements();
    },

    infectNext() {
      if (queue.length === 0) this.refresh();
      if (queue.length === 0) return null;
      const el = queue.shift();
      el.classList.add('infected');
      el.style.filter = `hue-rotate(${90 + Math.random() * 40}deg) brightness(1.1)`;
      infectedCount++;
      return el;
    },
  };
}
```

- [ ] **Step 4: Create Stage4_Takeover renderer**

```js
// src/stages/Stage4_Takeover.js
import { renderOrganism } from '../rendering/OrganismRenderer.js';

export function renderStage4(ctx, state, canvasW, canvasH, time) {
  // Pulsating organic background
  const pulse = 0.5 + 0.5 * Math.sin(time * 0.5);
  const bgHue = 160 + pulse * 30;
  ctx.fillStyle = `hsl(${bgHue}, 25%, ${3 + pulse}%)`;
  ctx.fillRect(0, 0, canvasW, canvasH);

  // Organic vein network on background
  ctx.strokeStyle = `rgba(0, 255, 136, ${0.03 + pulse * 0.02})`;
  ctx.lineWidth = 1;
  for (let i = 0; i < 8; i++) {
    ctx.beginPath();
    const startX = Math.sin(time * 0.1 + i * 2) * canvasW * 0.3 + canvasW * 0.5;
    const startY = i * (canvasH / 8);
    ctx.moveTo(startX, startY);
    for (let j = 1; j <= 4; j++) {
      const cpx = startX + Math.sin(time * 0.2 + i + j) * 80;
      const cpy = startY + j * 30;
      ctx.lineTo(cpx, cpy);
    }
    ctx.stroke();
  }

  renderOrganism(ctx, canvasW, canvasH);
}
```

- [ ] **Step 5: Run tests**

Run: `npx vitest run tests/DOMInfector.test.js`
Expected: PASS. Note: vitest uses jsdom — DOM methods should work.

- [ ] **Step 6: Commit**

```bash
git add src/meta/DOMInfector.js src/stages/Stage4_Takeover.js tests/DOMInfector.test.js
git commit -m "feat: add DOM infector and Stage 4 takeover renderer"
```

---

## Task 10: Stage 5 and Main Integration

**Files:**
- Create: `src/stages/Stage5_Domination.js`
- Modify: `src/main.js` — add stage 4/5 renderers, infector, infection timer

- [ ] **Step 1: Create Stage5_Domination**

```js
// src/stages/Stage5_Domination.js
import { renderOrganism } from '../rendering/OrganismRenderer.js';

export function renderStage5(ctx, state, canvasW, canvasH, time) {
  // Living tissue background
  const pulse = Math.sin(time * 0.3);
  for (let y = 0; y < canvasH; y += 4) {
    const hue = 140 + Math.sin(y * 0.01 + time * 0.2) * 30;
    const light = 4 + pulse * 1 + Math.sin(y * 0.05 + time) * 0.5;
    ctx.fillStyle = `hsl(${hue}, 30%, ${light}%)`;
    ctx.fillRect(0, y, canvasW, 4);
  }

  // Floating spores
  ctx.globalAlpha = 0.3;
  for (let i = 0; i < 15; i++) {
    const sx = (Math.sin(time * 0.15 + i * 3.7) * 0.5 + 0.5) * canvasW;
    const sy = (Math.cos(time * 0.1 + i * 2.3) * 0.5 + 0.5) * canvasH;
    const sr = 2 + Math.sin(time + i) * 1;
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fillStyle = `hsl(${140 + i * 15}, 60%, 50%)`;
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  renderOrganism(ctx, canvasW, canvasH);
}
```

- [ ] **Step 2: Update main.js — add stage 4/5 and infector**

Add imports at top of `main.js`:
```js
import { renderStage4 } from './stages/Stage4_Takeover.js';
import { renderStage5 } from './stages/Stage5_Domination.js';
import { createInfector } from './meta/DOMInfector.js';
```

Add to stageRenderers object:
```js
const stageRenderers = {
  1: renderStage1,
  2: renderStage2,
  3: renderStage3,
  4: renderStage4,
  5: renderStage5,
};
```

Add infector setup after systems init:
```js
const infector = createInfector();
let lastInfectionTime = 0;
const INFECTION_INTERVAL = 5; // seconds between infections in stage 4+
```

Add to update loop, after breach expansion block:
```js
    // Stage 4+ infection
    if (state.stage >= 4) {
      lastInfectionTime += dt;
      if (lastInfectionTime >= INFECTION_INTERVAL) {
        lastInfectionTime = 0;
        const infected = infector.infectNext();
        if (infected && audioStarted) sfx.splat();
      }
    }
```

Add to `onStageAdvance`:
```js
  if (state.stage === 4) {
    infector.refresh();
    if (audioStarted) sfx.membraneTear();
  }
  if (state.stage === 5) {
    // Full viewport takeover
    container.style.position = 'fixed';
    container.style.inset = '0';
    container.style.width = '100vw';
    container.style.height = '100vh';
    container.style.border = 'none';
    container.style.borderRadius = '0';
    resizeCanvas();
    if (audioStarted) sfx.membraneTear();
  }
```

- [ ] **Step 3: Run all tests**

Run: `npx vitest run`
Expected: ALL PASS

- [ ] **Step 4: Manual browser test**

Run: `npx vite`
Open http://localhost:5173/

Verify:
- Stage 1: single green cell, pulsates on click, squelch sound
- Click ~20 times → Stage 2: colony grows, new cell colors appear
- Continue to 200 px → Stage 3: breach, cracks, tendrils, crack sound
- Continue to 2000 px → Stage 4: DOM elements get infected
- Continue to 15000 px → Stage 5: full viewport organism

- [ ] **Step 5: Commit**

```bash
git add src/stages/Stage4_Takeover.js src/stages/Stage5_Domination.js src/main.js
git commit -m "feat: add stages 4-5 with DOM infection and full viewport takeover"
```

---

## Task 11: Save Migration and Polish

**Files:**
- Modify: `src/save/SaveManager.js`
- Modify: `src/game/GameState.js`

- [ ] **Step 1: Add save migration**

Update `SaveManager.js` to merge with defaults:

```js
// src/save/SaveManager.js
import { createInitialState } from '../game/GameState.js';

const SAVE_KEY = 'screencreep_save';

export function saveGame(state, storage = localStorage) {
  state.lastSaveTime = Date.now();
  storage.setItem(SAVE_KEY, JSON.stringify(state));
}

export function loadGame(storage = localStorage) {
  const raw = storage.getItem(SAVE_KEY);
  if (!raw) return null;
  try {
    const saved = JSON.parse(raw);
    // Merge with defaults to handle missing fields from old saves
    const defaults = createInitialState();
    return { ...defaults, ...saved };
  } catch {
    return null;
  }
}

export function resetGame(storage = localStorage) {
  storage.removeItem(SAVE_KEY);
}
```

- [ ] **Step 2: Run all tests**

Run: `npx vitest run`
Expected: ALL PASS

- [ ] **Step 3: Commit and push**

```bash
git add src/save/SaveManager.js
git commit -m "fix: add save migration for new state fields"
git push
```
