# Graphics Engine: PixiJS + Custom Shaders

**Date:** 2026-04-04
**Status:** Design
**Goal:** Replace Canvas 2D rendering with PixiJS WebGL + custom GLSL shaders for 2.5D visual quality and faster development of effects.

## Motivation

- **Visual quality:** GPU-powered effects (bloom, displacement, bioluminescence shaders) that Canvas 2D cannot deliver
- **Development speed:** Built-in particle systems, filters, sprite batching instead of manual Canvas code
- **2.5D depth:** Layered parallax, blur-based depth, rim lighting — flat game with depth illusion

## Architecture: Layered 2.5D Scene

Scene is split into depth layers, each a PixiJS Container:

| Layer (bottom→top) | Content | Depth Effects |
|---|---|---|
| **Background** | Stage backgrounds (tissue, veins, stripes) | Blur 4-8px, slow parallax |
| **Deep** | Cell shadows, distant spores | Blur 2px, 60% opacity, scale 0.9 |
| **Mid** | Tendrils, web networks, bridges | Light blur 1px |
| **Main** | Colony cells | No blur, full clarity |
| **Front** | Click particles, golden spores | Scale 1.05, increased brightness |
| **Overlay** | Breach effects, cracks | Blend mode: additive |
| **UI** | Floating numbers, toasts | No filters, always on top |

Layers shift at different speeds during organism "breathing" — creates depth illusion without 3D.

## Custom GLSL Shaders

| Shader | Target | Effect |
|---|---|---|
| `membrane.frag` | Cells | Organic membrane — sin/noise wobble, pulsating thickness, fresnel-like rim light |
| `cytoplasm.frag` | Cell interiors | Liquid motion — simplex noise with slow flow, color iridescence |
| `bioluminescence.frag` | Cell glow | Soft pulsating glow, color tied to cell hue. Replaces radial gradient |
| `tissue.frag` | Stage 4-5 background | Living tissue — noise texture with slow deformation, veins via flow field |
| `displacement.frag` | Breach transition | Screen "tears" — displacement map with animated noise |

## Built-in PixiJS Filters

- **BloomFilter** — cell glow, golden spores, bioluminescence halos
- **BlurFilter** — layer depth (background blur, shadow layer)
- **ColorMatrixFilter** — hue-shift on stage transitions, DOM "infection" overlay
- **DisplacementFilter** — organism breathing, breach distortion

## Particle Systems (PixiJS ParticleContainer)

| Type | Count | Behavior |
|---|---|---|
| Spores (Stage 5) | 50-100 | Drift, trails, soft glow |
| Cytoplasm | 3-5 per cell | Orbit inside membrane |
| Click burst | 10-20 per click | Radial burst from click point, fadeout |
| Breach particles | 30-50 | Eject from cracks during breach |
| Ambient dust | 20-30 | Background slow drift |

ParticleContainer renders thousands of sprites in one draw call.

## File Structure

```
src/rendering/
├── engine/
│   ├── RenderEngine.js      — PixiJS Application init, resize, RAF
│   ├── LayerManager.js       — Create and manage 7 depth layers
│   └── ParticlePool.js       — Reusable particle sprite pool
│
├── shaders/
│   ├── membrane.frag         — Organic cell membrane
│   ├── cytoplasm.frag        — Liquid cell interiors
│   ├── bioluminescence.frag  — Pulsating glow
│   ├── tissue.frag           — Living tissue background
│   └── displacement.frag     — Screen tear for breach
│
├── sprites/
│   ├── CellSprite.js         — Cell: mesh + membrane shader + cytoplasm
│   ├── TendrilMesh.js        — Tendril as mesh strip with wobble
│   ├── WebNetwork.js         — Node network with rope geometry
│   └── BridgeGraphics.js     — Bridges between cells
│
├── layers/
│   ├── BackgroundLayer.js    — Stage backgrounds with tissue shader
│   ├── ColonyLayer.js        — Cells + bridges + shadows
│   ├── BreachLayer.js        — Tendrils + webs + cracks
│   ├── ParticleLayer.js      — All particle systems
│   └── OverlayLayer.js       — Post-processing, bloom, displacement
│
└── OrganismScene.js          — Root container, assembles everything
```

## What Does NOT Change

- `src/game/` — GameState, GameLoop, Resources, Upgrades, ClickHandler (logic only)
- `src/audio/` — SoundEngine, SFX, Ambient
- `src/ui/` — UIPanel, FloatingNumbers, AchievementToast (DOM-based, on top of canvas)
- `src/save/` — SaveManager
- `src/meta/` — DOMInfector, FrameBreaker, GoldenSpore (logic stays, rendering migrates)
- `src/stages/` — StageManager (threshold logic). Stage1-5 renderers replaced by BackgroundLayer

## Integration with main.js

- `GameLoop.js` calls `RenderEngine.update(dt)` instead of direct `ctx.` calls
- `ClickHandler.js` hit-tests via `OrganismScene.hitTest(x, y)`
- Canvas element replaced by PixiJS `app.canvas` (still a canvas, but WebGL context)

## Migration Order

1. RenderEngine + LayerManager (scaffold)
2. CellSprite + membrane shader (core visual)
3. ColonyLayer + bridges (colony)
4. BreachLayer + tendrils/webs (breach)
5. BackgroundLayer + stage backgrounds
6. ParticleLayer + all particle systems
7. OverlayLayer + post-processing (final effects)

## Performance

- **Target:** 60 FPS on mid-range hardware
- **Draw calls budget:** <50 per frame
- **WebGL fallback:** PixiJS auto-falls back to Canvas 2D if WebGL unavailable; shaders won't work but basic rendering preserved
- **Optimization:** Filters applied to containers (not individual sprites). Shader animations via uniforms (time, pulse), no geometry recreation per frame.

## Dependencies

- `pixi.js` v8
- `@pixi/filter-bloom` (or custom bloom shader)
- `@pixi/filter-displacement`

No other libraries. GLSL shaders written by hand.
