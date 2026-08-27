// src/rendering/sprites/TendrilMesh.js
import { Graphics } from 'pixi.js';
import { hslToHex } from './CellSprite.js';

const TWO_PI = Math.PI * 2;

export class TendrilMesh extends Graphics {
  constructor(tendrilData) {
    super();
    this.data = tendrilData;
  }

  triggerRecoil(amount = 1.0) {
    this.data.recoilTarget = amount;
    this.data.phaseSpeed += 3.0 * amount;
  }

  update(dt) {
    const t = this.data;
    t.phase += t.phaseSpeed * dt;
    if (t.growProgress < 1) t.growProgress = Math.min(1, t.growProgress + dt * 0.6);
    t.recoilAmount += (t.recoilTarget - t.recoilAmount) * dt * 3;
    if (Math.abs(t.recoilTarget) > 0.01) t.recoilTarget *= (1 - dt * 2);
    this.redraw();
  }

  redraw() {
    const t = this.data;
    this.clear();

    // Resolve offsets to absolute positions
    const ax = t.anchor.x;
    const ay = t.anchor.y;
    const points = t.offsets.map(o => ({ x: ax + o.dx, y: ay + o.dy }));
    const visiblePoints = Math.ceil(points.length * t.growProgress);
    if (visiblePoints < 2) return;

    const animPoints = points.slice(0, visiblePoints).map((p, i) => {
      const intensity = i / points.length;
      const wobbleScale = 5 + intensity * 15 + t.recoilAmount * 30;
      const wx = Math.sin(t.phase + i * 0.9) * wobbleScale;
      const wy = Math.cos(t.phase * 1.3 + i * 1.1) * wobbleScale;
      const twitch = Math.sin(t.phase * 4 + i * 2.5) * intensity * 3;
      return { x: p.x + wx + twitch, y: p.y + wy + twitch };
    });

    // Outer glow
    this.moveTo(animPoints[0].x, animPoints[0].y);
    for (let i = 1; i < animPoints.length; i++) {
      if (i < animPoints.length - 1) {
        const curr = animPoints[i];
        const next = animPoints[i + 1];
        this.quadraticCurveTo(curr.x, curr.y, (curr.x + next.x) / 2, (curr.y + next.y) / 2);
      } else {
        this.lineTo(animPoints[i].x, animPoints[i].y);
      }
    }
    this.stroke({ color: hslToHex(t.hue, 60, 45), width: t.thickness + 8, alpha: 0.1, cap: 'round', join: 'round' });

    // Main body
    this.moveTo(animPoints[0].x, animPoints[0].y);
    for (let i = 1; i < animPoints.length; i++) {
      if (i < animPoints.length - 1) {
        const curr = animPoints[i];
        const next = animPoints[i + 1];
        this.quadraticCurveTo(curr.x, curr.y, (curr.x + next.x) / 2, (curr.y + next.y) / 2);
      } else {
        this.lineTo(animPoints[i].x, animPoints[i].y);
      }
    }
    this.stroke({ color: hslToHex(t.hue, 70, 40), width: t.thickness, alpha: 0.8, cap: 'round', join: 'round' });

    // Inner highlight
    this.moveTo(animPoints[0].x, animPoints[0].y);
    for (let i = 1; i < animPoints.length; i++) {
      if (i < animPoints.length - 1) {
        const curr = animPoints[i];
        const next = animPoints[i + 1];
        this.quadraticCurveTo(curr.x, curr.y, (curr.x + next.x) / 2, (curr.y + next.y) / 2);
      } else {
        this.lineTo(animPoints[i].x, animPoints[i].y);
      }
    }
    this.stroke({ color: hslToHex(t.hue, 80, 60), width: t.thickness * 0.4, alpha: 0.4, cap: 'round', join: 'round' });

    // Tip bulb
    const tip = animPoints[animPoints.length - 1];
    const tipPulse = 1 + 0.3 * Math.sin(t.phase * 3);
    const tipR = (t.thickness * 0.8) * tipPulse;
    this.circle(tip.x, tip.y, tipR);
    this.fill({ color: hslToHex(t.hue, 80, 55), alpha: 0.6 });
    // Tip glow
    this.circle(tip.x, tip.y, tipR * 3);
    this.fill({ color: hslToHex(t.hue, 80, 60), alpha: 0.15 });

    // Sub-branches
    if (visiblePoints > 4) {
      for (let i = 2; i < visiblePoints - 1; i += 2) {
        const bp = animPoints[i];
        const ba = t.phase + i * 1.5;
        const bl = 10 + Math.sin(t.phase + i) * 8;
        const bx = bp.x + Math.cos(ba) * bl;
        const by = bp.y + Math.sin(ba) * bl;
        this.moveTo(bp.x, bp.y);
        this.lineTo(bx, by);
        this.stroke({ color: hslToHex(t.hue, 60, 45), width: 1.5, alpha: 0.4 });
        this.circle(bx, by, 2);
        this.fill({ color: hslToHex(t.hue, 70, 55), alpha: 0.5 });
      }
    }
  }
}
