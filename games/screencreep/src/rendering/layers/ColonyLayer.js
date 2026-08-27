// src/rendering/layers/ColonyLayer.js
import { Container } from 'pixi.js';
import { CellSprite } from '../sprites/CellSprite.js';
import { TrapCellSprite } from '../sprites/TrapCellSprite.js';
import { CystSprite } from '../sprites/CystSprite.js';
import { BridgeGraphics } from '../sprites/BridgeGraphics.js';

export class ColonyLayer extends Container {
  constructor() {
    super();
    this.cellSprites = [];
    this.trapSpritesMap = new Map(); // id -> TrapCellSprite
    this.cystSpritesMap = new Map(); // id -> CystSprite
    this.connections = [];
    this.bridges = new BridgeGraphics();
    this.addChild(this.bridges);
  }

  addCell(cellData) {
    const sprite = new CellSprite(cellData);
    this.cellSprites.push(sprite);
    this.addChild(sprite);
    return sprite;
  }

  addConnection(indexA, indexB) {
    this.connections.push({ a: indexA, b: indexB });
  }

  getCells() {
    return this.cellSprites.map((s) => s.data);
  }

  syncTraps(trapsData) {
    const activeIds = new Set();
    for (const td of trapsData) {
      activeIds.add(td.id);
      let sprite = this.trapSpritesMap.get(td.id);
      if (!sprite) {
        sprite = new TrapCellSprite(td);
        this.trapSpritesMap.set(td.id, sprite);
        this.addChild(sprite);
      } else {
        sprite.data = td;
      }
    }

    // Cleanup expired trap sprites with explicit destroy()
    for (const [id, sprite] of this.trapSpritesMap.entries()) {
      if (!activeIds.has(id)) {
        this.removeChild(sprite);
        sprite.destroy({ children: true });
        this.trapSpritesMap.delete(id);
      }
    }
  }

  syncCysts(cystsData) {
    const activeIds = new Set();
    for (const cd of cystsData) {
      activeIds.add(cd.id);
      let sprite = this.cystSpritesMap.get(cd.id);
      if (!sprite) {
        sprite = new CystSprite(cd);
        this.cystSpritesMap.set(cd.id, sprite);
        this.addChild(sprite);
      } else {
        sprite.data = cd;
      }
    }

    // Cleanup expired cyst sprites with explicit destroy()
    for (const [id, sprite] of this.cystSpritesMap.entries()) {
      if (!activeIds.has(id)) {
        this.removeChild(sprite);
        sprite.destroy({ children: true });
        this.cystSpritesMap.delete(id);
      }
    }
  }

  update(dt, gameTime = 0, sessionDNA = null, canvasW = 200, canvasH = 200, pointerX = -1, pointerY = -1) {
    const cells = this.cellSprites;
    const targetCX = canvasW / 2;
    const targetCY = canvasH / 2;

    // 1. Soft Cell-Cell Overlap Repulsion (clamped)
    for (let i = 0; i < cells.length; i++) {
      for (let j = i + 1; j < cells.length; j++) {
        const c1 = cells[i].data;
        const c2 = cells[j].data;
        const dx = c2.x - c1.x;
        const dy = c2.y - c1.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const minDist = (c1.radius + c2.radius) * 1.1;
        if (dist < minDist) {
          const overlap = Math.min(15, (minDist - dist) * 0.4);
          const nx = (dx / dist) * overlap;
          const ny = (dy / dist) * overlap;
          c1.x -= nx * 4 * dt;
          c1.y -= ny * 4 * dt;
          c2.x += nx * 4 * dt;
          c2.y += ny * 4 * dt;
        }
      }
    }

    // 2. Center Anchor Force + Boundary Containment
    for (const s of cells) {
      s.data.x += (targetCX - s.data.x) * 1.8 * dt;
      s.data.y += (targetCY - s.data.y) * 1.8 * dt;

      const margin = s.data.radius + 12;
      s.data.x = Math.max(margin, Math.min(canvasW - margin, s.data.x));
      s.data.y = Math.max(margin, Math.min(canvasH - margin, s.data.y));

      s.update(dt, sessionDNA);
    }

    // 3. Update trap sprites
    for (const ts of this.trapSpritesMap.values()) {
      ts.update(dt);
    }

    // 4. Update cyst sprites
    for (const cs of this.cystSpritesMap.values()) {
      cs.update(dt);
    }

    // 5. Redraw bridges
    const cellDataArr = cells.map((s) => s.data);
    this.bridges.drawBridges(cellDataArr, this.connections, gameTime);
  }

  pulseNearest(x, y, intensity = 1.0) {
    let nearest = null;
    let minDist = Infinity;
    for (const s of this.cellSprites) {
      const dx = s.data.x - x;
      const dy = s.data.y - y;
      const d = dx * dx + dy * dy;
      if (d < minDist) {
        minDist = d;
        nearest = s;
      }
    }
    if (nearest) {
      nearest.pulse(intensity);
      const targetIdx = this.cellSprites.indexOf(nearest);
      for (const [a, b] of this.connections) {
        let neighborIdx = -1;
        if (a === targetIdx) neighborIdx = b;
        else if (b === targetIdx) neighborIdx = a;
        if (neighborIdx >= 0 && this.cellSprites[neighborIdx]) {
          this.cellSprites[neighborIdx].pulse(intensity * 0.35);
        }
      }
    }
  }

  resolveHit(x, y) {
    if (this.cellSprites.length === 0) return null;
    let bestHit = null;
    for (const s of this.cellSprites) {
      const hit = s.testHitZone(x, y);
      if (hit) {
        if (hit.zone === 'nucleus') return hit;
        if (!bestHit || (hit.zone === 'cytoplasm' && bestHit.zone === 'membrane')) {
          bestHit = hit;
        }
      }
    }
    return bestHit;
  }

  hitTest(x, y) {
    return this.resolveHit(x, y) !== null;
  }

  clear() {
    for (const s of this.cellSprites) {
      this.removeChild(s);
      s.destroy({ children: true });
    }
    for (const cs of this.cystSpritesMap.values()) {
      this.removeChild(cs);
      cs.destroy({ children: true });
    }
    for (const ts of this.trapSpritesMap.values()) {
      this.removeChild(ts);
      ts.destroy({ children: true });
    }
    this.cellSprites.length = 0;
    this.cystSpritesMap.clear();
    this.trapSpritesMap.clear();
    this.connections.length = 0;
    this.bridges.clear();
  }
}
