// src/rendering/sprites/BridgeGraphics.js
import { Graphics } from 'pixi.js';
import { hslToHex } from './CellSprite.js';

export class BridgeGraphics extends Graphics {
  drawBridges(cells, connections, gameTime = 0) {
    this.clear();
    for (const conn of connections) {
      const a = cells[conn.a];
      const b = cells[conn.b];
      if (!a || !b) continue;

      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = (a.radius + b.radius) * 3.5;
      if (dist < 5.0 || dist > maxDist || !Number.isFinite(dist)) continue;

      const minGen = Math.min(a.generation || 1, b.generation || 1);
      const avgHue = (a.hue + b.hue) / 2;

      if (minGen >= 5) {
        // 4. Energy arc (crackling zigzag with flash)
        const steps = 6;
        let prevX = a.x;
        let prevY = a.y;
        this.moveTo(prevX, prevY);
        for (let i = 1; i <= steps; i++) {
          const t = i / steps;
          const targetX = a.x + dx * t;
          const targetY = a.y + dy * t;
          const jitter = (i === steps) ? 0 : (Math.sin(gameTime * 20 + i * 5) * 6);
          const px = targetX - (dy / dist) * jitter;
          const py = targetY + (dx / dist) * jitter;
          if (Number.isFinite(px) && Number.isFinite(py)) {
            this.lineTo(px, py);
          }
        }
        this.stroke({ color: 0x88ffff, width: 2, alpha: 0.85 });
      } else if (minGen >= 4) {
        // 3. Neural link (glowing laser thin line)
        const pulse = 0.5 + 0.5 * Math.sin(gameTime * 6 - dist * 0.05);
        this.moveTo(a.x, a.y);
        this.lineTo(b.x, b.y);
        this.stroke({ color: hslToHex(avgHue + 40, 90, 70), width: 1.5, alpha: 0.4 + pulse * 0.4 });
      } else if (minGen >= 2) {
        // 2. Nutrient channel (thick membrane with moving beads)
        const midX = (a.x + b.x) / 2 + Math.sin(a.phase || 0) * 4;
        const midY = (a.y + b.y) / 2 + Math.cos(a.phase || 0) * 4;
        this.moveTo(a.x, a.y);
        this.quadraticCurveTo(midX, midY, b.x, b.y);
        this.stroke({ color: hslToHex(avgHue, 70, 45), width: 3, alpha: 0.35 });

        // Moving nutrient bead
        const beadT = (gameTime * 0.8 + (conn.a * 0.3)) % 1;
        const bx = (1 - beadT) * (1 - beadT) * a.x + 2 * (1 - beadT) * beadT * midX + beadT * beadT * b.x;
        const by = (1 - beadT) * (1 - beadT) * a.y + 2 * (1 - beadT) * beadT * midY + beadT * beadT * b.y;
        if (Number.isFinite(bx) && Number.isFinite(by)) {
          this.circle(bx, by, 2.5);
          this.fill({ color: hslToHex(avgHue + 50, 90, 75), alpha: 0.8 });
        }
      } else {
        // 1. Basic membrane bridge
        const midX = (a.x + b.x) / 2 + Math.sin(a.phase || 0) * 3;
        const midY = (a.y + b.y) / 2 + Math.cos(a.phase || 0) * 3;
        this.moveTo(a.x, a.y);
        this.quadraticCurveTo(midX, midY, b.x, b.y);
        this.stroke({ color: hslToHex(avgHue, 60, 40), width: 1.5, alpha: 0.22 });
      }
    }
  }
}
