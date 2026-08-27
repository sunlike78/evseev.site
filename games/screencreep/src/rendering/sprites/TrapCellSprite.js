// src/rendering/sprites/TrapCellSprite.js
import { Container, Graphics } from 'pixi.js';
import { hslToHex } from './CellSprite.js';

const TWO_PI = Math.PI * 2;

export class TrapCellSprite extends Container {
  constructor(trapData) {
    super();
    this.data = trapData;
    this.glowGfx = new Graphics();
    this.bodyGfx = new Graphics();
    this.warningGfx = new Graphics();

    this.addChild(this.glowGfx);
    this.addChild(this.bodyGfx);
    this.addChild(this.warningGfx);

    this.lastWarningState = null;
    this.position.set(trapData.x, trapData.y);
    this.redraw();
  }

  update(dt) {
    const d = this.data;
    d.phase += d.pulseSpeed * dt;
    this.position.set(d.x, d.y);

    const pulse = 1 + 0.14 * Math.sin(d.phase);
    this.scale.set(pulse, pulse);

    if (d.isWarning !== this.lastWarningState) {
      this.redraw();
    }
  }

  redraw() {
    const { radius = 14, isWarning } = this.data;
    this.lastWarningState = isWarning;
    const r = radius;

    const hue = isWarning ? 35 : 5;

    // 1. Soft glowing rings
    this.glowGfx.clear();
    this.glowGfx.circle(0, 0, r * 1.4);
    this.glowGfx.stroke({ color: hslToHex(hue, 100, 50), width: 2.5, alpha: 0.35 });
    this.glowGfx.circle(0, 0, r * 1.8);
    this.glowGfx.stroke({ color: hslToHex(hue, 100, 50), width: 3.5, alpha: 0.15 });

    // 2. Unstable spiky membrane body
    this.bodyGfx.clear();
    const spikes = 8;
    const points = [];
    for (let i = 0; i < spikes * 2; i++) {
      const angle = (i / (spikes * 2)) * TWO_PI;
      const dist = (i % 2 === 0) ? r * 1.2 : r * 0.75;
      points.push(Math.cos(angle) * dist, Math.sin(angle) * dist);
    }

    this.bodyGfx.poly(points);
    this.bodyGfx.fill({ color: hslToHex(hue, 95, 25), alpha: 0.95 });
    this.bodyGfx.stroke({ color: hslToHex(hue + 20, 100, 60), width: 2, alpha: 0.95 });

    // Inner fiery core
    this.bodyGfx.circle(0, 0, r * 0.45);
    this.bodyGfx.fill({ color: hslToHex(hue + 35, 100, 65), alpha: 0.9 });

    // 3. Warning Symbol
    this.warningGfx.clear();
    if (isWarning) {
      this.warningGfx.circle(0, 0, r * 1.5);
      this.warningGfx.stroke({ color: 0xffcc00, width: 1.5, alpha: 0.85 });

      this.warningGfx.rect(-1.5, -r * 0.45, 3, r * 0.5);
      this.warningGfx.fill({ color: 0xffffff, alpha: 0.95 });
      this.warningGfx.circle(0, r * 0.35, 2);
      this.warningGfx.fill({ color: 0xffffff, alpha: 0.95 });
    } else {
      this.warningGfx.circle(0, 0, 3);
      this.warningGfx.fill({ color: 0xffffff, alpha: 0.95 });
    }
  }
}
