// src/rendering/sprites/CystSprite.js
import { Container, Graphics } from 'pixi.js';

export class CystSprite extends Container {
  constructor(cystData) {
    super();
    this.data = cystData;
    this.bodyGfx = new Graphics();
    this.veinsGfx = new Graphics();
    this.vacuolesGfx = new Graphics();

    this.addChild(this.veinsGfx);
    this.addChild(this.bodyGfx);
    this.addChild(this.vacuolesGfx);

    this.lastClicksLeft = -1;
    this.lastFullnessTier = -1;

    this.position.set(cystData.x, cystData.y);
    this.redraw();
  }

  update(dt) {
    const d = this.data;
    this.position.set(d.x, d.y);

    const pulse = (1 + 0.12 * Math.sin(d.phase)) * (d.scale || 1);
    this.scale.set(pulse, pulse);

    const fullnessTier = Math.floor(Math.min(1.0, (d.storedBiomass || 0) / 300) * 5);
    if (d.clicksLeft !== this.lastClicksLeft || fullnessTier !== this.lastFullnessTier) {
      this.redraw();
    }
  }

  redraw() {
    const { radius = 12, storedBiomass = 0, clicksLeft = 3 } = this.data;
    this.lastClicksLeft = clicksLeft;
    this.lastFullnessTier = Math.floor(Math.min(1.0, storedBiomass / 300) * 5);
    const r = radius;

    // 1. Anchoring Veins
    this.veinsGfx.clear();
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 + 0.4;
      const vx = Math.cos(angle) * r * 1.5;
      const vy = Math.sin(angle) * r * 1.5;
      this.veinsGfx.moveTo(0, 0);
      this.veinsGfx.lineTo(vx, vy);
      this.veinsGfx.stroke({ color: 0x8822bb, width: 1.5, alpha: 0.6 });
    }

    // 2. Translucent Cyst Body
    this.bodyGfx.clear();
    this.bodyGfx.circle(0, 0, r * 1.3);
    this.bodyGfx.stroke({ color: 0xb464ff, width: 2, alpha: 0.35 });

    this.bodyGfx.circle(0, 0, r);
    this.bodyGfx.fill({ color: 0x4a1572, alpha: 0.88 });
    this.bodyGfx.stroke({ color: 0xd97706, width: 2, alpha: 0.9 });

    // 3. Stored Biomass Vacuoles
    this.vacuolesGfx.clear();
    const fullness = Math.min(1.0, storedBiomass / 300);
    const coreR = r * (0.3 + fullness * 0.45);

    this.vacuolesGfx.circle(0, 0, coreR);
    this.vacuolesGfx.fill({ color: 0x00ff88, alpha: 0.6 });
    this.vacuolesGfx.circle(0, 0, coreR * 0.4);
    this.vacuolesGfx.fill({ color: 0xffffff, alpha: 0.8 });

    if (clicksLeft < 3) {
      this.vacuolesGfx.moveTo(-r * 0.5, -r * 0.3);
      this.vacuolesGfx.lineTo(r * 0.4, r * 0.4);
      this.vacuolesGfx.stroke({ color: 0xffdd44, width: 2, alpha: 0.95 });
    }
  }
}
