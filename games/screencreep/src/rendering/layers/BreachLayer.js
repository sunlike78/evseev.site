// src/rendering/layers/BreachLayer.js
import { Container, Graphics } from 'pixi.js';
import { TendrilMesh } from '../sprites/TendrilMesh.js';
import { WebNetwork } from '../sprites/WebNetwork.js';

const TWO_PI = Math.PI * 2;

export class BreachLayer extends Container {
  constructor() {
    super();
    this.cracksGfx = new Graphics();
    this.addChild(this.cracksGfx);
    this.cracks = [];
    this.tendrilMeshes = [];
    this.webMeshes = [];
    this.shattered = false;
    this.stage = 1;
  }

  setStage(stage) {
    this.stage = stage;
  }

  triggerBreach(centerX, centerY, containerW, containerH) {
    const crackCount = 6 + Math.floor(Math.random() * 4);
    for (let i = 0; i < crackCount; i++) {
      const angle = (i / crackCount) * TWO_PI + (Math.random() - 0.5) * 0.3;
      const length = 20 + Math.random() * 40;
      this.cracks.push({
        angle, length,
        width: 1 + Math.random() * 2,
        progress: 0,
        centerX, centerY, containerW, containerH,
      });
    }
  }

  addCrack(centerX, centerY, length = 40) {
    this.triggerBreach(centerX, centerY, length * 2, length * 2);
  }

  addTendril(anchorCell, angle = 0) {
    const segments = 8 + Math.floor(Math.random() * 4);
    const offsets = [{ dx: 0, dy: 0 }];
    let dx = 0, dy = 0;
    for (let i = 0; i < segments; i++) {
      const len = 12 + Math.random() * 25;
      const wobble = (Math.random() - 0.5) * 0.8;
      dx += Math.cos(angle + wobble) * len;
      dy += Math.sin(angle + wobble) * len;
      offsets.push({ dx, dy });
    }

    const anchor = (anchorCell && typeof anchorCell.x === 'number') ? anchorCell : { x: 100, y: 100 };
    const data = {
      anchor,
      offsets,
      hue: 120 + Math.random() * 60,
      thickness: 3 + Math.random() * 4,
      phase: Math.random() * TWO_PI,
      phaseSpeed: 1.5 + Math.random() * 2,
      growProgress: 0,
      recoilAmount: 0,
      recoilTarget: 0,
    };
    const mesh = new TendrilMesh(data);
    this.tendrilMeshes.push(mesh);
    this.addChild(mesh);
    return data;
  }

  addRandomTendril(cx = 100, cy = 100) {
    const angle = Math.random() * TWO_PI;
    return this.addTendril({ x: cx, y: cy }, angle);
  }

  addWeb(anchorOrX, radiusOrY, radius = 80) {
    let anchor = { x: 100, y: 100 };
    let r = radius;
    if (typeof anchorOrX === 'number' && typeof radiusOrY === 'number') {
      anchor = { x: anchorOrX, y: radiusOrY };
      r = radius;
    } else if (anchorOrX && typeof anchorOrX.x === 'number') {
      anchor = anchorOrX;
      r = typeof radiusOrY === 'number' ? radiusOrY : 80;
    }

    const nodeCount = 6 + Math.floor(Math.random() * 4);
    const nodeOffsets = [];
    for (let i = 0; i < nodeCount; i++) {
      const angle = Math.random() * TWO_PI;
      const dist = r * (0.3 + Math.random() * 0.7);
      nodeOffsets.push({
        dx: Math.cos(angle) * dist,
        dy: Math.sin(angle) * dist,
        phase: Math.random() * TWO_PI,
      });
    }
    const connections = [];
    for (let i = 0; i < nodeOffsets.length; i++) {
      for (let j = i + 1; j < nodeOffsets.length; j++) {
        const ddx = nodeOffsets[j].dx - nodeOffsets[i].dx;
        const ddy = nodeOffsets[j].dy - nodeOffsets[i].dy;
        if (ddx * ddx + ddy * ddy < (r * 0.8) ** 2) {
          connections.push({ a: i, b: j });
        }
      }
    }
    const data = {
      anchor,
      nodeOffsets,
      connections,
      hue: 130 + Math.random() * 50,
      growProgress: 0,
      phase: Math.random() * TWO_PI,
    };
    const mesh = new WebNetwork(data);
    this.webMeshes.push(mesh);
    this.addChild(mesh);
    return data;
  }

  getTendrils() {
    return this.tendrilMeshes.map(m => m.data);
  }

  update(dt) {
    // Cracks
    for (const crack of this.cracks) {
      if (crack.progress < 1) crack.progress = Math.min(1, crack.progress + dt * 3);
    }
    if (!this.shattered && this.cracks.length > 0) {
      if (this.cracks.every(c => c.progress >= 1)) this.shattered = true;
    }
    this.redrawCracks();

    // Tendrils
    for (const mesh of this.tendrilMeshes) mesh.update(dt);

    // Webs
    for (const mesh of this.webMeshes) mesh.update(dt);
  }

  redrawCracks() {
    this.cracksGfx.clear();
    for (const crack of this.cracks) {
      if (crack.progress <= 0) continue;
      const cx = crack.centerX;
      const cy = crack.centerY;
      const len = crack.length * crack.progress;
      const edgeX = cx + Math.cos(crack.angle) * (crack.containerW / 2);
      const edgeY = cy + Math.sin(crack.angle) * (crack.containerH / 2);
      const endX = edgeX + Math.cos(crack.angle) * len;
      const endY = edgeY + Math.sin(crack.angle) * len;

      this.cracksGfx.moveTo(edgeX, edgeY);
      this.cracksGfx.lineTo(endX, endY);
      this.cracksGfx.stroke({ color: 0x00ff88, width: crack.width, alpha: 0.6 * crack.progress, cap: 'round' });
    }
  }
  tryPluck(x, y) {
    for (let i = 0; i < this.tendrilMeshes.length; i++) {
      const mesh = this.tendrilMeshes[i];
      const t = mesh.data;
      if (t.growProgress < 0.2) continue;

      let currX = t.anchor.x;
      let currY = t.anchor.y;
      const count = Math.ceil(t.offsets.length * t.growProgress);

      for (let j = 0; j < count; j++) {
        currX += t.offsets[j].dx;
        currY += t.offsets[j].dy;
        const dist = Math.hypot(x - currX, y - currY);
        if (dist <= 28) {
          mesh.triggerRecoil(1.2);
          return {
            plucked: true,
            type: 'tendril',
            index: i,
            x: currX,
            y: currY,
            hue: t.hue,
          };
        }
      }
    }
    return null;
  }
}
