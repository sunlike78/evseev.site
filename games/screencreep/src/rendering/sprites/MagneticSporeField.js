// src/rendering/sprites/MagneticSporeField.js
import { Container, Graphics } from 'pixi.js';

export class MagneticSporeField extends Container {
  constructor(maxSpores = 40) {
    super();
    this.spores = [];
    this.maxSpores = maxSpores;
    this.gfx = new Graphics();
    this.addChild(this.gfx);
  }

  spawn(x, y, value = 1) {
    if (this.spores.length >= this.maxSpores) return;
    this.spores.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 50,
      vy: (Math.random() - 0.5) * 50,
      radius: 2.5 + Math.min(value, 4),
      value,
      hue: 130 + Math.random() * 50,
      pulse: Math.random() * Math.PI * 2,
    });
  }

  update(dt, cursorX, cursorY, onAbsorb) {
    const G = 40000;
    const vortexK = 1800;
    const captureRadius = 18;

    for (let i = this.spores.length - 1; i >= 0; i--) {
      const s = this.spores[i];
      const dx = cursorX - s.x;
      const dy = cursorY - s.y;
      const distSq = dx * dx + dy * dy + 300;
      const dist = Math.sqrt(distSq);

      if (dist < captureRadius && cursorX > 0) {
        if (onAbsorb) onAbsorb(s.x, s.y, s.value);
        this.spores.splice(i, 1);
        continue;
      }

      if (cursorX > 0 && cursorY > 0) {
        // Gravitational attraction + spiral vortex
        const fg = G / distSq;
        const nx = dx / dist;
        const ny = dy / dist;
        const tx = -ny;
        const ty = nx;
        const fv = vortexK / dist;

        s.vx += (nx * fg + tx * fv) * dt;
        s.vy += (ny * fg + ty * fv) * dt;
      }

      s.vx *= 0.94;
      s.vy *= 0.94;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.pulse += dt * 5.0;
    }

    this.redraw();
  }

  redraw() {
    this.gfx.clear();
    for (const s of this.spores) {
      const r = s.radius + Math.sin(s.pulse) * 0.6;
      this.gfx.circle(s.x, s.y, r);
      this.gfx.fill({ color: 0x00ff88, alpha: 0.8 });
      this.gfx.circle(s.x, s.y, r * 0.45);
      this.gfx.fill({ color: 0xffffff, alpha: 0.9 });
    }
  }
}
