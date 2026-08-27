// src/rendering/layers/ParticleLayer.js
import { Container, Graphics } from 'pixi.js';
import { hslToHex } from '../sprites/CellSprite.js';
import { MagneticSporeField } from '../sprites/MagneticSporeField.js';

const TWO_PI = Math.PI * 2;

class ParticlePool {
  constructor(maxSize) {
    this.particles = [];
    this.maxSize = maxSize;
  }

  emit(x, y, options = {}) {
    if (this.particles.length >= this.maxSize) return;
    this.particles.push({
      x, y,
      vx: options.vx || 0,
      vy: options.vy || 0,
      life: options.life || 1,
      maxLife: options.life || 1,
      radius: options.radius || 2,
      hue: options.hue || 140,
      sat: options.sat || 60,
      light: options.light || 50,
      alpha: options.alpha || 0.6,
      decay: options.decay || 1,
      gravity: options.gravity || 0,
    });
  }

  update(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += p.gravity * dt;
      p.life -= dt * p.decay;
      if (p.life <= 0) this.particles.splice(i, 1);
    }
  }

  draw(gfx) {
    for (const p of this.particles) {
      const t = p.life / p.maxLife;
      const r = p.radius * t;
      if (r < 0.5) continue;
      gfx.circle(p.x, p.y, r);
      gfx.fill({ color: hslToHex(p.hue, p.sat, p.light), alpha: p.alpha * t });
    }
  }
}

export class ParticleLayer extends Container {
  constructor() {
    super();
    this.gfx = new Graphics();
    this.addChild(this.gfx);

    this.sporeField = new MagneticSporeField(30);
    this.addChild(this.sporeField);

    this.clickBurst = new ParticlePool(120);
    this.ambientDust = new ParticlePool(20);
    this.breachParticles = new ParticlePool(40);
    this.sporeTrails = new ParticlePool(60);

    this.dustTimer = 0;
  }

  spawnSpore(x, y, value = 1) {
    this.sporeField.spawn(x, y, value);
  }

  emitClickBurst(x, y, hue = 140) {
    const count = 8 + Math.floor(Math.random() * 6);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * TWO_PI;
      const speed = 30 + Math.random() * 70;
      this.clickBurst.emit(x, y, {
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.35 + Math.random() * 0.35,
        radius: 1.5 + Math.random() * 2.5,
        hue: hue + (Math.random() - 0.5) * 30,
        sat: 70,
        light: 55,
        alpha: 0.7,
        decay: 1.8,
      });
    }
  }

  emitBreachBurst(x, y) {
    const count = 12 + Math.floor(Math.random() * 12);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * TWO_PI;
      const speed = 40 + Math.random() * 80;
      this.breachParticles.emit(x, y, {
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.7 + Math.random() * 0.4,
        radius: 1 + Math.random() * 2,
        hue: 120 + Math.random() * 40,
        sat: 80,
        light: 50,
        alpha: 0.6,
        decay: 1.2,
        gravity: 20,
      });
    }
  }

  update(dt, canvasW, canvasH, pointerX = -1, pointerY = -1, onAbsorbSpore = null) {
    this.dustTimer += dt;
    if (this.dustTimer > 0.6 && this.ambientDust.particles.length < 15) {
      this.dustTimer = 0;
      this.ambientDust.emit(
        Math.random() * canvasW,
        Math.random() * canvasH,
        {
          vx: (Math.random() - 0.5) * 6,
          vy: (Math.random() - 0.5) * 6,
          life: 3 + Math.random() * 3,
          radius: 1 + Math.random() * 1.5,
          hue: 130 + Math.random() * 30,
          sat: 30,
          light: 40,
          alpha: 0.15,
          decay: 0.25,
        }
      );
    }

    if (pointerX >= 0 && pointerY >= 0) {
      this.sporeField.update(dt, pointerX, pointerY, onAbsorbSpore);
    }

    this.clickBurst.update(dt);
    this.ambientDust.update(dt);
    this.breachParticles.update(dt);
    this.sporeTrails.update(dt);

    // Redraw
    this.gfx.clear();
    this.ambientDust.draw(this.gfx);
    this.breachParticles.draw(this.gfx);
    this.clickBurst.draw(this.gfx);
    this.sporeTrails.draw(this.gfx);
  }
}
