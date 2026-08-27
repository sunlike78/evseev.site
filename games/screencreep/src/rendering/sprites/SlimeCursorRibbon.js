// src/rendering/sprites/SlimeCursorRibbon.js
import { Container, Graphics } from 'pixi.js';

export class SlimeCursorRibbon extends Container {
  constructor(numPoints = 14, segmentLength = 7) {
    super();
    this.numPoints = numPoints;
    this.segmentLength = segmentLength;
    this.gfx = new Graphics();
    this.addChild(this.gfx);

    this.points = [];
    for (let i = 0; i < numPoints; i++) {
      this.points.push({
        x: -100, y: -100,
        oldX: -100, oldY: -100,
        radius: Math.max(1.2, 8 * (1 - (i / numPoints) ** 1.2)),
      });
    }

    this.mouseX = -100;
    this.mouseY = -100;
    this.active = false;
  }

  setPointer(x, y) {
    if (!this.active && x > 0 && y > 0) {
      this.active = true;
      for (const p of this.points) {
        p.x = x; p.y = y;
        p.oldX = x; p.oldY = y;
      }
    }
    this.mouseX = x;
    this.mouseY = y;
  }

  update(dt, hue = 140) {
    if (!this.active || this.mouseX < 0) return;

    // 1. Anchor head to cursor
    const head = this.points[0];
    head.oldX = head.x;
    head.oldY = head.y;
    head.x = this.mouseX;
    head.y = this.mouseY;

    // 2. Verlet Physics for trailing nodes
    for (let i = 1; i < this.numPoints; i++) {
      const p = this.points[i];
      const vx = (p.x - p.oldX) * 0.82;
      const vy = (p.y - p.oldY) * 0.82;

      p.oldX = p.x;
      p.oldY = p.y;
      p.x += vx;
      p.y += vy + 8.0 * dt;
    }

    // 3. Distance Constraints Solver
    for (let iter = 0; iter < 3; iter++) {
      for (let i = 0; i < this.numPoints - 1; i++) {
        const p1 = this.points[i];
        const p2 = this.points[i + 1];
        const segDX = p2.x - p1.x;
        const segDY = p2.y - p1.y;
        const dist = Math.sqrt(segDX * segDX + segDY * segDY) || 1;
        const diff = (dist - this.segmentLength) / dist;

        if (i !== 0) {
          p1.x += segDX * 0.5 * diff;
          p1.y += segDY * 0.5 * diff;
        }
        p2.x -= segDX * 0.5 * diff;
        p2.y -= segDY * 0.5 * diff;
      }
    }

    // 4. Render Slime Ribbon with organic fluid hulls
    this.gfx.clear();
    for (let i = 0; i < this.numPoints - 1; i++) {
      const p1 = this.points[i];
      const p2 = this.points[i + 1];
      const alpha = 0.65 * (1 - i / this.numPoints);

      this.gfx.circle(p1.x, p1.y, p1.radius);
      this.gfx.fill({ color: 0x00ff88, alpha });

      this.gfx.moveTo(p1.x, p1.y);
      this.gfx.lineTo(p2.x, p2.y);
      this.gfx.stroke({ width: p1.radius * 1.5, color: 0x00ff88, alpha: alpha * 0.7 });
    }
  }
}
