// src/game/drops/PowerupManager.js
import { POWERUPS } from './powerupCatalog.js';

export function createPowerupManager() {
  const activeBuffs = new Map(); // id -> { powerup, timer, maxTimer, alpha }
  let laserTarget = null;
  let laserCooldown = 0;

  return {
    activate(powerup, { state, onNova, onCascade, onSporeVortex, addRawPixels, toasts, sfx }) {
      if (powerup.instant) {
        if (powerup.id === 'MITOSIS_NOVA') {
          if (onNova) onNova();
        } else if (powerup.id === 'DNA_MUTAGEN') {
          state.dnaPoints = (state.dnaPoints || 0) + 1;
          const jackpot = Math.max(150, Math.round((state.clickYield || 1) * 35));
          addRawPixels(state, jackpot);
          toasts.show(`🧬 DNA MUTAGEN: +1 DNA TOKEN & +${jackpot} px JACKPOT!`, '#00ff88');
          sfx?.critChord();
        } else if (powerup.id === 'GOLDEN_CASCADE') {
          if (onCascade) onCascade();
        }
        return;
      }

      // Timed Buff
      const duration = powerup.duration || 8.0;
      activeBuffs.set(powerup.id, {
        powerup,
        timer: duration,
        maxTimer: duration,
      });

      toasts.show(`⚡ POWER-UP ACTIVATED: ${powerup.label.toUpperCase()} (${duration}s)!`, powerup.capsuleColor);
    },

    update(dt, { pointerX, pointerY, cells, triggerLaserHit }) {
      // 1. Update timers
      for (const [id, buff] of activeBuffs.entries()) {
        buff.timer -= dt;
        if (buff.timer <= 0) {
          activeBuffs.delete(id);
        }
      }

      // 2. Bio-Laser Auto-Firing
      if (activeBuffs.has('BIO_LASER') && pointerX > 0 && pointerY > 0 && cells && cells.length > 0) {
        laserCooldown -= dt;
        // Find nearest cell
        let nearest = null;
        let minDist = Infinity;
        for (const c of cells) {
          const d = Math.hypot(pointerX - c.x, pointerY - c.y);
          if (d < minDist) {
            minDist = d;
            nearest = c;
          }
        }
        laserTarget = nearest;

        if (laserCooldown <= 0 && nearest && triggerLaserHit) {
          laserCooldown = 0.08; // 12.5 Hz auto laser burn
          triggerLaserHit(nearest.x, nearest.y);
        }
      } else {
        laserTarget = null;
      }
    },

    getIncomeMultiplier() {
      let mult = 1.0;
      if (activeBuffs.has('HYPER_FRENZY')) mult *= 10.0;
      return mult;
    },

    has(id) {
      return activeBuffs.has(id);
    },

    getLaserTarget() {
      return laserTarget;
    },

    renderHUD(ctx, screenW, screenH) {
      const buffs = Array.from(activeBuffs.values());
      if (buffs.length === 0) return;

      const totalW = buffs.length * 60;
      let startX = screenW / 2 - totalW / 2;
      const topY = 24;

      for (const buff of buffs) {
        const p = buff.powerup;
        const progress = Math.max(0, buff.timer / buff.maxTimer);

        ctx.save();
        ctx.translate(startX + 25, topY);

        // Circular Timer Arc
        ctx.beginPath();
        ctx.arc(0, 0, 18, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(5, 10, 25, 0.85)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Progress Arc
        ctx.beginPath();
        ctx.arc(0, 0, 18, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2);
        ctx.strokeStyle = p.capsuleColor;
        ctx.lineWidth = 3;
        ctx.stroke();

        // Icon
        ctx.font = 'bold 13px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(p.icon, 0, 0);

        // Seconds text
        ctx.font = 'bold 10px monospace';
        ctx.fillStyle = p.capsuleColor;
        ctx.fillText(`${Math.ceil(buff.timer)}s`, 0, 26);

        ctx.restore();
        startX += 55;
      }
    },

    renderLaserBeam(ctx, pointerX, pointerY) {
      if (!activeBuffs.has('BIO_LASER') || !laserTarget || pointerX < 0 || pointerY < 0) return;

      ctx.save();
      const tx = laserTarget.x;
      const ty = laserTarget.y;

      // Outer plasma glow
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.35)';
      ctx.lineWidth = 14;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(pointerX, pointerY);
      ctx.lineTo(tx, ty);
      ctx.stroke();

      // Middle beam
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.85)';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(pointerX, pointerY);
      ctx.lineTo(tx, ty);
      ctx.stroke();

      // Core white laser
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(pointerX, pointerY);
      ctx.lineTo(tx, ty);
      ctx.stroke();

      // Target impact spark ring
      ctx.beginPath();
      ctx.arc(tx, ty, 8 + Math.random() * 6, 0, Math.PI * 2);
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.restore();
    },

    getActiveBuffs() {
      return Array.from(activeBuffs.values());
    },

    clear() {
      activeBuffs.clear();
      laserTarget = null;
    },
  };
}
