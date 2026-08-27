// src/rendering/sprites/WebNetwork.js
import { Graphics } from 'pixi.js';
import { hslToHex } from './CellSprite.js';

const TWO_PI = Math.PI * 2;

export class WebNetwork extends Graphics {
  constructor(webData) {
    super();
    this.data = webData;
  }

  update(dt) {
    const w = this.data;
    w.phase += dt * 0.8;
    if (w.growProgress < 1) w.growProgress = Math.min(1, w.growProgress + dt * 0.4);
    for (const n of w.nodeOffsets) n.phase += dt * 1.2;
    this.redraw();
  }

  redraw() {
    const w = this.data;
    this.clear();
    if (w.growProgress <= 0) return;

    const alpha = w.growProgress * 0.5;
    const ax = w.anchor.x;
    const ay = w.anchor.y;

    // Connections
    const visibleConns = Math.ceil(w.connections.length * w.growProgress);
    for (let ci = 0; ci < visibleConns; ci++) {
      const conn = w.connections[ci];
      const a = w.nodeOffsets[conn.a];
      const b = w.nodeOffsets[conn.b];
      const aX = ax + a.dx + Math.sin(a.phase) * 4;
      const aY = ay + a.dy + Math.sin(a.phase) * 4;
      const bX = ax + b.dx + Math.sin(b.phase) * 4;
      const bY = ay + b.dy + Math.sin(b.phase) * 4;
      const midX = (aX + bX) / 2 + Math.sin(w.phase + ci) * 8;
      const midY = (aY + bY) / 2 + Math.cos(w.phase + ci * 0.7) * 8;

      // Glow
      this.moveTo(aX, aY);
      this.quadraticCurveTo(midX, midY, bX, bY);
      this.stroke({ color: hslToHex(w.hue, 50, 50), width: 3, alpha: alpha * 0.15 });

      // Line
      this.moveTo(aX, aY);
      this.quadraticCurveTo(midX, midY, bX, bY);
      this.stroke({ color: hslToHex(w.hue, 50, 40), width: 0.8, alpha: alpha * 0.6 });
    }

    // Nodes
    const visibleNodes = Math.ceil(w.nodeOffsets.length * w.growProgress);
    for (let ni = 0; ni < visibleNodes; ni++) {
      const n = w.nodeOffsets[ni];
      const pulse = 1 + 0.3 * Math.sin(n.phase);
      const nr = 2 * pulse;
      this.circle(
        ax + n.dx + Math.sin(n.phase) * 3,
        ay + n.dy + Math.cos(n.phase) * 3,
        nr
      );
      this.fill({ color: hslToHex(w.hue, 70, 55), alpha: alpha * 0.8 });
    }
  }
}
