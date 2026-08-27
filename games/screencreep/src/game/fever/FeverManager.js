// src/game/fever/FeverManager.js

export function createFeverManager() {
  let isFeverActive = false;
  let feverTimer = 0;
  let slowMoTimer = 0;
  let jackpotAccumulator = 0;
  let lastTriggerTime = 0;
  const goldenOrbs = []; // Flying jackpot coins

  return {
    tryTrigger({ reason, originX, originY, onStart, sfx }) {
      const now = Date.now();
      if (now - lastTriggerTime < 12000) return false; // 12s cooldown

      lastTriggerTime = now;
      isFeverActive = true;
      feverTimer = 6.0; // 6 seconds of euphoric fever
      slowMoTimer = 0.35; // 350ms bullet-time slow-mo
      jackpotAccumulator = 0;

      if (sfx) {
        sfx.critChord();
        sfx.crystalPing(1600, 1.0);
      }
      if (onStart) onStart();
      return true;
    },

    spawnCascade(startX, startY, totalAmount, targetX, targetY) {
      const count = 12;
      const piece = Math.max(1, Math.round(totalAmount / count));

      for (let i = 0; i < count; i++) {
        goldenOrbs.push({
          x: startX + (Math.random() - 0.5) * 40,
          y: startY + (Math.random() - 0.5) * 40,
          targetX,
          targetY,
          amount: piece,
          delay: i * 0.05,
          speed: 400 + Math.random() * 200,
          progress: 0,
          scale: 1.0 + Math.random() * 0.4,
          life: 1.2,
        });
      }
    },

    update(dt, { onCollectOrb }) {
      if (slowMoTimer > 0) {
        slowMoTimer -= dt;
      }

      if (isFeverActive) {
        feverTimer -= dt;
        if (feverTimer <= 0) {
          isFeverActive = false;
        }
      }

      // Update golden cascade orbs
      for (let i = goldenOrbs.length - 1; i >= 0; i--) {
        const orb = goldenOrbs[i];
        if (orb.delay > 0) {
          orb.delay -= dt;
          continue;
        }

        orb.progress += dt * 1.8;
        const t = Math.min(1, orb.progress);
        // Quadratic arc towards HUD wallet
        const currentX = orb.x + (orb.targetX - orb.x) * t;
        const currentY = orb.y + (orb.targetY - orb.y) * t - Math.sin(t * Math.PI) * 60;

        if (t >= 1) {
          if (onCollectOrb) onCollectOrb(orb.amount, orb.targetX, orb.targetY);
          goldenOrbs.splice(i, 1);
        }
      }
    },

    getTimeScale() {
      if (slowMoTimer > 0) return 0.25; // 4x slow-mo during bullet-time ignition
      return 1.0;
    },

    isActive() {
      return isFeverActive;
    },

    getIncomeMultiplier() {
      return isFeverActive ? 2.5 : 1.0;
    },

    render(ctx, screenW, screenH) {
      // 1. Fever Screen Edge Glow (Rainbow chromatic pulse)
      if (isFeverActive) {
        const pulse = Math.sin(Date.now() * 0.008);
        const hue = (Date.now() * 0.1) % 360;

        ctx.save();
        ctx.strokeStyle = `hsla(${hue}, 100%, 65%, ${0.25 + 0.15 * pulse})`;
        ctx.lineWidth = 16;
        ctx.strokeRect(0, 0, screenW, screenH);

        // FEVER CLIMAX Title Banner
        ctx.font = 'bold 22px monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = `hsl(${hue}, 100%, 75%)`;
        ctx.shadowColor = `hsl(${hue}, 100%, 50%)`;
        ctx.shadowBlur = 12;
        ctx.fillText('⚡ EXTREME FEVER CLIMAX ⚡', screenW / 2, 60);
        ctx.restore();
      }

      // 2. Golden Cascade Orbs
      for (const orb of goldenOrbs) {
        if (orb.delay > 0) continue;
        const t = Math.min(1, orb.progress);
        const currentX = orb.x + (orb.targetX - orb.x) * t;
        const currentY = orb.y + (orb.targetY - orb.y) * t - Math.sin(t * Math.PI) * 60;

        ctx.save();
        ctx.translate(currentX, currentY);

        // Gold Sparkle
        ctx.fillStyle = 'rgba(255, 230, 80, 0.95)';
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(0, 0, 7 * orb.scale, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }
    },
  };
}
