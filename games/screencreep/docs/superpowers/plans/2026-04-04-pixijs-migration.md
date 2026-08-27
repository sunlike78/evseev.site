# PixiJS Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Canvas 2D rendering with PixiJS WebGL for 2.5D effects, shaders, particles, and post-processing.

**Architecture:** PixiJS Application replaces manual canvas context. 7-layer depth system. Custom GLSL shaders for organic visuals. Game logic untouched.

**Tech Stack:** PixiJS v8, @pixi/filter-bloom, custom GLSL fragment shaders, Vite

---

## Migration Strategy

Incremental replacement: each task produces a working game. Old renderers removed only after PixiJS equivalents are verified.

## File Structure

```
src/rendering/
├── engine/
│   ├── RenderEngine.js       — PixiJS Application, resize, layer setup
│   └── LayerManager.js        — 7 depth layers as PixiJS Containers
├── shaders/
│   ├── membrane.frag          — Cell membrane wobble + rim light
│   └── bioluminescence.frag   — Pulsating glow
├── sprites/
│   ├── CellSprite.js          — Cell as PixiJS Graphics + shader filter
│   ├── TendrilMesh.js         — Tendril as animated line strip
│   ├── WebNetwork.js          — Web node connections
│   └── BridgeGraphics.js      — Colony bridges
├── layers/
│   ├── BackgroundLayer.js     — Stage-specific backgrounds
│   ├── ColonyLayer.js         — Cells + bridges + shadows
│   ├── BreachLayer.js         — Tendrils + webs + cracks
│   ├── ParticleLayer.js       — All particle systems
│   └── OverlayLayer.js        — Post-processing filters
└── OrganismScene.js           — Root container, hit testing, public API
```

---

### Task 1: Install PixiJS and Create RenderEngine Scaffold

**Files:**
- Modify: `package.json`
- Create: `src/rendering/engine/RenderEngine.js`
- Create: `src/rendering/engine/LayerManager.js`

- [ ] Install pixi.js v8
- [ ] Create RenderEngine.js: init PixiJS Application, handle resize, expose app/stage/canvas
- [ ] Create LayerManager.js: create 7 named containers (background, deep, mid, main, front, overlay, ui), add to stage in order
- [ ] Verify PixiJS canvas renders (blank green tinted background)
- [ ] Commit

---

### Task 2: CellSprite — Port Cell Rendering

**Files:**
- Create: `src/rendering/sprites/CellSprite.js`

- [ ] Create CellSprite class extending PixiJS Container
- [ ] Draw wobble membrane using PixiJS Graphics (32-segment polygon, same algorithm as CellRenderer)
- [ ] Draw radial gradient fill (PixiJS radial gradient or shader)
- [ ] Draw cytoplasm particles as small circles
- [ ] Draw glow as blurred circle behind cell
- [ ] Implement update(dt) for wobble phase, cytoplasm orbit, pulse decay
- [ ] Implement pulse() method
- [ ] Commit

---

### Task 3: ColonyLayer — Port Colony Rendering

**Files:**
- Create: `src/rendering/sprites/BridgeGraphics.js`
- Create: `src/rendering/layers/ColonyLayer.js`

- [ ] Create BridgeGraphics: draws quadratic bezier bridges between cell positions using PixiJS Graphics
- [ ] Create ColonyLayer extending Container: manages array of CellSprites + BridgeGraphics
- [ ] Implement addCell(cellData): creates CellSprite, adds to layer
- [ ] Implement update(dt): updates all CellSprites positions/phases, redraws bridges
- [ ] Implement pulseNearest(x, y): finds closest cell, calls pulse()
- [ ] Add shadow copies of cells in Deep layer (blur, lower opacity, scale 0.9)
- [ ] Commit

---

### Task 4: BreachLayer — Port Tendril and Web Rendering

**Files:**
- Create: `src/rendering/sprites/TendrilMesh.js`
- Create: `src/rendering/sprites/WebNetwork.js`
- Create: `src/rendering/layers/BreachLayer.js`

- [ ] Create TendrilMesh: draws animated tendril using PixiJS Graphics (line strip with wobble, tip bulb, sub-branches — same algorithm as BreachRenderer)
- [ ] Create WebNetwork: draws node connections with animated positions
- [ ] Create BreachLayer: manages cracks (simple lines), TendrilMesh array, WebNetwork array
- [ ] Implement triggerBreach(), addTendril(cell, angle), addWeb(cell, radius)
- [ ] Implement update(dt) for all breach elements
- [ ] Commit

---

### Task 5: BackgroundLayer — Port Stage Backgrounds

**Files:**
- Create: `src/rendering/layers/BackgroundLayer.js`

- [ ] Create BackgroundLayer extending Container
- [ ] Implement setStage(n) to switch between background rendering modes:
  - Stage 1: Dark fill + noise dots (PixiJS Graphics)
  - Stage 2: Same as stage 1 (container visual handled externally)
  - Stage 3: Subtle cracks overlay
  - Stage 4: Shifting hue background + organic veins (PixiJS Graphics with tint animation)
  - Stage 5: Living tissue stripes + vein web + floating spores
- [ ] Add blur filter to background layer (BlurFilter, 4px)
- [ ] Implement update(dt, gameTime) for animations
- [ ] Commit

---

### Task 6: OrganismScene — Root Container and Public API

**Files:**
- Create: `src/rendering/OrganismScene.js`

- [ ] Create OrganismScene: holds LayerManager reference, ColonyLayer, BreachLayer, BackgroundLayer
- [ ] Expose same public API as current OrganismRenderer:
  - init(centerX, centerY)
  - update(dt)
  - render() — no-op, PixiJS auto-renders
  - hitTest(x, y) — check cell positions
  - onClick(x, y) — pulse nearest cell
  - triggerDivision(hue)
  - triggerBreachSequence()
  - addTendril() / addWeb()
  - recenter(x, y)
- [ ] Stage background changes via setStage()
- [ ] Commit

---

### Task 7: Wire PixiJS into main.js

**Files:**
- Modify: `src/main.js`
- Modify: `src/stages/Stage1_Seed.js` through `Stage5_Domination.js`

- [ ] Replace canvas 2d context with RenderEngine initialization
- [ ] Replace OrganismRenderer imports with OrganismScene
- [ ] Replace stage renderer functions: stage backgrounds now handled by BackgroundLayer.setStage()
- [ ] Update game loop: call OrganismScene.update(dt) instead of updateOrganism + stage renderers
- [ ] Remove ctx.clearRect — PixiJS handles clearing
- [ ] Move overlay rendering (golden spore, floating numbers, toasts, click texts) to PixiJS UI layer or keep as Canvas overlay
- [ ] Update resize handling for PixiJS app.renderer.resize()
- [ ] Update FrameBreaker to work with PixiJS canvas
- [ ] Verify game plays identically
- [ ] Commit

---

### Task 8: Particle Systems

**Files:**
- Create: `src/rendering/layers/ParticleLayer.js`

- [ ] Create ParticleLayer with particle pools for:
  - Click burst (10-20 particles on click, radial spread, fadeout)
  - Ambient dust (20-30 slow drifting particles)
  - Breach particles (30-50 ejecting from cracks)
  - Spore trails (for Stage 5 floating spores)
- [ ] Use PixiJS ParticleContainer for batched rendering
- [ ] Wire into OrganismScene
- [ ] Commit

---

### Task 9: Post-Processing and Shaders

**Files:**
- Create: `src/rendering/shaders/membrane.frag`
- Create: `src/rendering/shaders/bioluminescence.frag`
- Create: `src/rendering/layers/OverlayLayer.js`

- [ ] Create membrane.frag: organic wobble shader with rim light (applied as filter on cells)
- [ ] Create bioluminescence.frag: pulsating glow shader (applied on glow sprites)
- [ ] Create OverlayLayer: applies BloomFilter to main+front layers, DisplacementFilter for breach
- [ ] Wire filters into layer system
- [ ] Commit

---

### Task 10: Cleanup Old Renderers

**Files:**
- Remove: `src/rendering/CellRenderer.js` (old)
- Remove: `src/rendering/ColonyRenderer.js` (old)
- Remove: `src/rendering/BreachRenderer.js` (old)
- Remove: `src/rendering/OrganismRenderer.js` (old)
- Remove: `src/stages/Stage1_Seed.js` through `Stage5_Domination.js` (rendering parts)

- [ ] Verify no code references old renderers
- [ ] Remove old files
- [ ] Final build + test
- [ ] Commit
