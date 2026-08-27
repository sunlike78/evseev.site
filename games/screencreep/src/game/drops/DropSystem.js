// src/game/drops/DropSystem.js
import { getRandomPowerup, POWERUPS } from './powerupCatalog.js';

export function createDropSystem() {
  const drops = [];
  let nextId = 1;

  return {
    spawn(x, y, specificType = null) {
      if (drops.length >= 8) return null; // Max 8 on screen to prevent chaos

      const powerup = specificType ? POWERUPS[specificType] : getRandomPowerup();
      const drop = {
        id: nextId++,
        powerup,
        x,
        y,
        startX: x,
        vx: (Math.random() - 0.5) * 60,
        vy: -70 - Math.random() * 50, // Initial gentle pop upward
        phase: Math.random() * Math.PI * 2,
        phaseSpeed: 2.0 + Math.random() * 1.5,
        life: 7.0, // 7 seconds on screen
        maxLife: 7.0,
        radius: 20,
        collected: false,
      };
      drops.push(drop);
      return drop;
    },

    tryCollect(pointerX, pointerY) {
      for (let i = drops.length - 1; i >= 0; i--) {
        const d = drops[i];
        if (d.collected) continue;

        const dist = Math.hypot(pointerX - d.x, pointerY - d.y);
        const catchRadius = d.powerup.collectionRadius || 42;

        if (dist <= catchRadius) {
          d.collected = true;
          const collectedPowerup = d.powerup;
          const collectX = d.x;
          const collectY = d.y;
          drops.splice(i, 1);
          return {
            powerup: collectedPowerup,
            x: collectX,
            y: collectY,
          };
        }
      }
      return null;
    },

    update(dt, canvasH = 1080) {
      for (let i = drops.length - 1; i >= 0; i--) {
        const d = drops[i];
        d.life -= dt;
        d.phase += d.phaseSpeed * dt;

        // Viscous buoyant gravity (Arkanoid pill feel)
        d.vy += 85 * dt;
        if (d.vy > 75) d.vy = 75; // Slow float speed

        d.y += d.vy * dt;
        d.x = d.startX + Math.sin(d.phase) * 22;

        // Despawn if fallen past bottom or timeout
        if (d.life <= 0 || d.y > canvasH + 40) {
          drops.splice(i, 1);
        }
      }
    },

    render(ctx) {
      for (const d of drops) {
        const p = d.powerup;
        const alpha = d.life < 1.5 ? (Math.sin(d.life * 12) > 0 ? 0.9 : 0.3) : 0.95;
        const x = d.x;
        const y = d.y;

        ctx.save();
        ctx.translate(x, y);

        // Tilt with horizontal drift
        const tilt = Math.sin(d.phase) * 0.2;
        ctx.rotate(tilt);

        // 1. Bioluminescent Glow
        const glowRad = 26 + Math.sin(d.phase * 2) * 4;
        const glowGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, glowRad);
        glowGrad.addColorStop(0, `rgba(${p.glowColor}, ${0.55 * alpha})`);
        glowGrad.addColorStop(1, `rgba(${p.glowColor}, 0)`);
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(0, 0, glowRad, 0, Math.PI * 2);
        ctx.fill();

        // 2. Pill Capsule Body (Arkanoid rounded capsule)
        const w = 34;
        const h = 18;
        const r = 9;

        // Capsule Background / Glass
        ctx.fillStyle = `rgba(10, 15, 30, ${0.9 * alpha})`;
        ctx.strokeStyle = p.capsuleColor;
        ctx.lineWidth = 2.0;

        ctx.beginPath();
        ctx.roundRect(-w / 2, -h / 2, w, h, r);
        ctx.fill();
        ctx.stroke();

        // 3. Liquid Mutagen Core
        ctx.fillStyle = p.capsuleColor;
        ctx.beginPath();
        ctx.roundRect(-w / 2 + 3, -h / 2 + 3, w - 6, h - 6, r - 2);
        ctx.globalAlpha = 0.65 * alpha;
        ctx.fill();
        ctx.globalAlpha = 1.0;

        // 4. Glass Specular Highlight
        ctx.fillStyle = `rgba(255, 255, 255, ${0.75 * alpha})`;
        ctx.beginPath();
        ctx.ellipse(-w / 4, -h / 4, 6, 2, -0.2, 0, Math.PI * 2);
        ctx.fill();

        // 5. Center Icon
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(p.icon, 0, 1);

        ctx.restore();
      }
    },

    getDrops() {
      return drops;
    },

    clear() {
      drops.length = 0;
    },
  };
}
