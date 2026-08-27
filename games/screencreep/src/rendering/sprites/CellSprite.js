// src/rendering/sprites/CellSprite.js
import { Container, Graphics } from 'pixi.js';

const TWO_PI = Math.PI * 2;

export class CellSprite extends Container {
  constructor(cellData) {
    super();
    this.data = cellData;

    // Layered Visual Hierarchy
    this.haloContainer = new Container();
    this.bodyContainer = new Container();
    this.nucleusContainer = new Container();
    this.cytoplasmContainer = new Container();

    this.glowGfx = new Graphics();
    this.bodyGfx = new Graphics();
    this.nucleusGfx = new Graphics();
    this.detailsGfx = new Graphics();

    this.haloContainer.addChild(this.glowGfx);
    this.bodyContainer.addChild(this.bodyGfx);
    this.nucleusContainer.addChild(this.nucleusGfx);
    this.cytoplasmContainer.addChild(this.detailsGfx);

    this.addChild(this.haloContainer);
    this.addChild(this.bodyContainer);
    this.addChild(this.cytoplasmContainer);
    this.addChild(this.nucleusContainer);

    this.squashX = 1;
    this.squashY = 1;
    this.squashVelocity = 0;
    this.currentGeneration = -1;
    this.currentHue = -1;

    this.position.set(cellData.x, cellData.y);
    this.buildStaticGeometry();
  }

  update(dt, sessionDNA = null) {
    const d = this.data;
    d.phase += d.wobbleSpeed * dt;

    if (d.pulseAmount > 0) {
      d.pulseAmount = Math.max(0, d.pulseAmount - dt * 3.5);
    }

    // Squash & Stretch Spring Physics with strict damping
    const targetScale = 1;
    const force = (targetScale - this.squashX) * 24;
    this.squashVelocity += force * dt;
    this.squashVelocity *= 0.86;
    this.squashX += this.squashVelocity * dt;

    if (!Number.isFinite(this.squashX) || this.squashX < 0.72 || this.squashX > 1.38) {
      this.squashX = Math.max(0.72, Math.min(1.38, Number.isFinite(this.squashX) ? this.squashX : 1));
      this.squashVelocity = 0;
    }
    this.squashY = Math.max(0.72, Math.min(1.38, 1 / this.squashX));

    // Dynamic amoeba organic breathing & wobble (Pure GPU Matrix Transform)
    const wobbleX = 1 + 0.04 * Math.sin(d.phase * 1.2) + d.pulseAmount * 0.22;
    const wobbleY = 1 + 0.04 * Math.cos(d.phase * 0.9) + d.pulseAmount * 0.22;

    this.scale.set(this.squashX * wobbleX, this.squashY * wobbleY);
    this.rotation = Math.sin(d.phase * 0.4) * 0.08;
    this.position.set(d.x, d.y);

    // Living internal cytoplasm rotation (0ms CPU cost!)
    this.cytoplasmContainer.rotation += 0.8 * dt;

    // Floating nucleus micro-drift
    this.nucleusContainer.position.set(
      Math.sin(d.phase * 0.7) * (d.radius * 0.08),
      Math.cos(d.phase * 0.6) * (d.radius * 0.08)
    );

    // Pulsing halo alpha
    this.glowGfx.alpha = 0.7 + 0.3 * Math.sin(d.phase * 2) + d.pulseAmount * 0.5;

    // Rebuild geometry ONLY if generation evolutions or significant hue mutations occur
    if (d.generation !== this.currentGeneration || Math.abs(d.hue - this.currentHue) > 5) {
      this.buildStaticGeometry(sessionDNA);
    }
  }

  pulse(intensity = 1.0) {
    this.data.pulseAmount = intensity;
    this.squashX = Math.max(0.72, 1.0 - 0.24 * intensity);
    this.squashVelocity = 2.6 * intensity;
  }

  testHitZone(localX, localY) {
    const d = this.data;
    const dx = localX - d.x;
    const dy = localY - d.y;
    const dist = Math.hypot(dx, dy);

    // 1. Nucleus Bullseye (+18% generous hitbox for good game feel)
    const nX = d.x + this.nucleusContainer.position.x;
    const nY = d.y + this.nucleusContainer.position.y;
    const nDist = Math.hypot(localX - nX, localY - nY);
    const nRadius = Math.max(14, d.radius * 0.35);

    if (nDist <= nRadius * 1.18) {
      return {
        zone: 'nucleus',
        cell: this.data,
        distance: nDist,
        mult: 3.0,
        isCrit: true,
        normalX: dist > 0 ? dx / dist : 0,
        normalY: dist > 0 ? dy / dist : -1,
      };
    }

    // 2. Cytoplasm Body Zone
    const bodyR = d.radius;
    if (dist <= bodyR * 0.85) {
      return {
        zone: 'cytoplasm',
        cell: this.data,
        distance: dist,
        mult: 1.0,
        isCrit: false,
        normalX: dx / dist,
        normalY: dy / dist,
      };
    }

    // 3. Glancing Membrane Zone
    const membraneR = bodyR * 1.10;
    if (dist <= membraneR) {
      return {
        zone: 'membrane',
        cell: this.data,
        distance: dist,
        mult: 0.5,
        isCrit: false,
        normalX: dx / dist,
        normalY: dy / dist,
      };
    }

    return null;
  }

  buildStaticGeometry(sessionDNA = null) {
    this.currentGeneration = this.data.generation || 1;
    this.currentHue = this.data.hue || 140;

    let { radius, hue, cytoplasm, membrane, generation = 1 } = this.data;

    if (sessionDNA) {
      if (sessionDNA.hueShift) hue += sessionDNA.hueShift;
      if (sessionDNA.activeMutations?.includes('cell_rot')) {
        hue = 80 + (hue % 30);
      }
    }

    const r = Math.max(14, radius);
    const glowColor = hslToHex(hue, 95, 60);

    // 1. Soft Bioluminescent Halo
    this.glowGfx.clear();
    const haloAlpha = 0.22 + (generation >= 4 ? 0.1 : 0);
    this.glowGfx.circle(0, 0, r * 1.35);
    this.glowGfx.stroke({ color: glowColor, width: 2.5, alpha: haloAlpha });
    this.glowGfx.circle(0, 0, r * 1.7);
    this.glowGfx.stroke({ color: glowColor, width: 3.5, alpha: haloAlpha * 0.4 });

    // 2. Organic Amoeba Membrane Shape
    this.bodyGfx.clear();
    const segments = 24;
    const points = [];

    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * TWO_PI;
      let wobble = 1.0;
      if (generation >= 1) wobble += 0.05 * Math.sin(angle * 3);
      if (generation >= 3) wobble += 0.06 * Math.sin(angle * 2 + 0.8);
      points.push(Math.cos(angle) * r * wobble, Math.sin(angle) * r * wobble);
    }

    // Outer membrane body fill
    this.bodyGfx.poly(points);
    this.bodyGfx.fill({
      color: hslToHex(hue, 85, 30),
      alpha: 0.94,
    });

    // Outer glowing membrane edge
    const strokeWidth = (membrane?.thickness || 2.5);
    this.bodyGfx.stroke({
      color: hslToHex(hue, 95, 70),
      width: strokeWidth,
      alpha: 0.95,
    });

    // Inner cytoplasmic fluid pool
    this.bodyGfx.circle(-r * 0.12, -r * 0.12, r * 0.58);
    this.bodyGfx.fill({ color: hslToHex(hue, 95, 52), alpha: 0.42 });

    // Specular light reflection
    this.bodyGfx.circle(-r * 0.28, -r * 0.28, r * 0.24);
    this.bodyGfx.fill({ color: 0xffffff, alpha: 0.45 });

    // 3. Nucleus (Visible in all generations for hitting precision)
    this.nucleusGfx.clear();
    const nRadius = Math.max(8, r * 0.35);
    this.nucleusGfx.circle(0, 0, nRadius);
    this.nucleusGfx.fill({ color: hslToHex(hue - 35, 95, 18), alpha: 0.92 });
    this.nucleusGfx.stroke({ color: hslToHex(hue + 25, 100, 68), width: 2.0, alpha: 0.95 });

    // Jewel Glowing Nucleolus Core (Bullseye target indicator)
    this.nucleusGfx.circle(0, 0, nRadius * 0.45);
    this.nucleusGfx.fill({ color: hslToHex(hue + 55, 100, 85), alpha: 0.98 });
    this.nucleusGfx.stroke({ color: 0xffffff, width: 1.0, alpha: 0.9 });

    // 4. Cytoplasm Organelles
    this.detailsGfx.clear();
    if (cytoplasm && cytoplasm.length > 0) {
      for (let i = 0; i < cytoplasm.length; i++) {
        const c = cytoplasm[i];
        const cx = Math.cos(c.angle) * (r * 0.5);
        const cy = Math.sin(c.angle) * (r * 0.5);
        this.detailsGfx.circle(cx, cy, Math.max(2, c.size * 0.8));
        this.detailsGfx.fill({ color: hslToHex(hue + c.hueOffset, 90, 70), alpha: 0.85 });
      }
    } else {
      // Default organelles for visual richness
      for (let i = 0; i < 4; i++) {
        const ang = (i / 4) * TWO_PI + 0.3;
        const cx = Math.cos(ang) * (r * 0.45);
        const cy = Math.sin(ang) * (r * 0.45);
        this.detailsGfx.circle(cx, cy, 2.2);
        this.detailsGfx.fill({ color: hslToHex(hue + 30 * i, 90, 75), alpha: 0.8 });
      }
    }
  }
}

function hslToHex(h, s, l) {
  h = ((h % 360) + 360) % 360;
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color);
  };
  return (f(0) << 16) | (f(8) << 8) | f(4);
}

export { hslToHex };
