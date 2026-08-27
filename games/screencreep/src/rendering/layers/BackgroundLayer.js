// src/rendering/layers/BackgroundLayer.js
import { Container, Graphics } from 'pixi.js';
import { hslToHex } from '../sprites/CellSprite.js';

export class BackgroundLayer extends Container {
  constructor() {
    super();
    this.bgGfx = new Graphics();
    this.veinsGfx = new Graphics();
    this.sporesGfx = new Graphics();
    this.addChild(this.bgGfx);
    this.addChild(this.veinsGfx);
    this.addChild(this.sporesGfx);

    this.currentStage = 1;
    this.spores = [];
    this.veins = [];
  }

  setStage(stage, canvasW, canvasH) {
    this.currentStage = stage;
    if (stage >= 4) {
      this.initStage5(canvasW, canvasH);
    }
  }

  initStage5(canvasW, canvasH) {
    this.spores = [];
    for (let i = 0; i < 12; i++) {
      this.spores.push({
        x: Math.random() * canvasW,
        y: Math.random() * canvasH,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        radius: 2 + Math.random() * 2,
        phase: Math.random() * Math.PI * 2,
        hue: 140 + Math.random() * 40,
      });
    }

    this.veins = [];
    for (let i = 0; i < 4; i++) {
      const points = [{ x: Math.random() * canvasW, y: Math.random() * canvasH }];
      for (let j = 0; j < 3; j++) {
        const prev = points[points.length - 1];
        points.push({
          x: prev.x + (Math.random() - 0.5) * 150,
          y: prev.y + (Math.random() - 0.5) * 150,
        });
      }
      this.veins.push({ points, hue: 140 + Math.random() * 30, phase: Math.random() * Math.PI * 2 });
    }
  }

  update(dt, gameTime, canvasW, canvasH) {
    const stage = this.currentStage;
    if (stage < 4) {
      this.bgGfx.clear();
      this.veinsGfx.clear();
      this.sporesGfx.clear();
      return;
    }

    this.bgGfx.clear();
    this.veinsGfx.clear();
    this.sporesGfx.clear();

    // Subtle background ambient veins
    for (const vein of this.veins) {
      vein.phase += dt * 0.2;
      if (vein.points.length < 2) continue;
      this.veinsGfx.moveTo(vein.points[0].x, vein.points[0].y);
      for (let i = 1; i < vein.points.length; i++) {
        const p = vein.points[i];
        this.veinsGfx.lineTo(
          p.x + Math.sin(vein.phase + i) * 6,
          p.y + Math.cos(vein.phase + i * 0.7) * 6
        );
      }
      this.veinsGfx.stroke({ color: hslToHex(vein.hue, 40, 20), width: 1.0, alpha: 0.15 });
    }

    // Ambient micro-spores
    for (const s of this.spores) {
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.phase += dt * 2;
      if (s.x < -20) s.x = canvasW + 20;
      if (s.x > canvasW + 20) s.x = -20;
      if (s.y < -20) s.y = canvasH + 20;
      if (s.y > canvasH + 20) s.y = -20;

      const pulse = 1 + 0.2 * Math.sin(s.phase);
      this.sporesGfx.circle(s.x, s.y, s.radius * pulse);
      this.sporesGfx.fill({ color: hslToHex(s.hue, 60, 45), alpha: 0.2 });
    }
  }
}
