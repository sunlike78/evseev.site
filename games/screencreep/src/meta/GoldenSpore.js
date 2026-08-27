// src/meta/GoldenSpore.js
import { t } from '../i18n/i18n.js';

const TWO_PI = Math.PI * 2;

export function createGoldenSpore() {
  let spore = null;
  let cooldown = 25 + Math.random() * 35; // base cooldown 25-60s
  let activeBonus = null;

  function getEffectiveCooldown(state) {
    let base = 30 + Math.random() * 40;
    const upgradeMult = state?.sporeCooldownMultiplier || 1;
    base *= upgradeMult;

    // Session DNA mutations
    if (state?.sessionDNA?.activeMutations?.includes('golden_age')) {
      base *= 0.5;
    }
    if (state?.sessionDNA?.activeMutations?.includes('spore_drought')) {
      base *= 2.0;
    }
    return Math.max(10, base);
  }

  return {
    getActiveBonus() {
      return activeBonus;
    },

    update(dt, canvasW, canvasH, state) {
      // Bonus timer
      if (activeBonus) {
        activeBonus.timeLeft -= dt;
        if (activeBonus.timeLeft <= 0) activeBonus = null;
      }

      // Spawn logic
      if (!spore) {
        cooldown -= dt;
        if (cooldown <= 0) {
          spore = {
            x: 50 + Math.random() * Math.max(100, canvasW - 100),
            y: 50 + Math.random() * Math.max(100, canvasH - 100),
            life: 10,
            phase: 0,
            radius: 15,
          };
        }
        return;
      }

      // Active spore floating motion
      spore.phase += dt * 4;
      spore.life -= dt;
      spore.x += Math.cos(spore.phase * 0.6) * 18 * dt;
      spore.y += Math.sin(spore.phase * 0.8) * 18 * dt;
      spore.x = Math.max(30, Math.min(canvasW - 30, spore.x));
      spore.y = Math.max(30, Math.min(canvasH - 30, spore.y));

      if (spore.life <= 0) {
        spore = null;
        cooldown = getEffectiveCooldown(state);
      }
    },

    render(ctx) {
      if (!spore) return;
      const { x, y, phase, life, radius } = spore;
      const pulse = 1 + 0.2 * Math.sin(phase);
      const r = radius * pulse;
      const urgency = life < 3 ? (1 + Math.sin(phase * 3) * 0.5) : 1;

      // Outer glow
      const glow = ctx.createRadialGradient(x, y, 0, x, y, r * 4);
      glow.addColorStop(0, `rgba(255, 215, 0, ${0.35 * urgency})`);
      glow.addColorStop(0.5, `rgba(255, 180, 0, ${0.15 * urgency})`);
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.fillRect(x - r * 4, y - r * 4, r * 8, r * 8);

      // Core
      ctx.beginPath();
      const segments = 16;
      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * TWO_PI;
        const wobble = 1 + 0.12 * Math.sin(angle * 3 + phase);
        const px = x + Math.cos(angle) * r * wobble;
        const py = y + Math.sin(angle) * r * wobble;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();

      const fill = ctx.createRadialGradient(x - r * 0.2, y - r * 0.2, 0, x, y, r);
      fill.addColorStop(0, `rgba(255, 245, 160, ${0.95 * urgency})`);
      fill.addColorStop(0.5, `rgba(255, 200, 50, ${0.85 * urgency})`);
      fill.addColorStop(1, `rgba(200, 140, 0, ${0.7 * urgency})`);
      ctx.fillStyle = fill;
      ctx.fill();

      // Sparkle particles
      for (let i = 0; i < 6; i++) {
        const sa = phase + i * (TWO_PI / 6);
        const sd = r * 1.8 + Math.sin(phase * 2 + i) * 6;
        const sx = x + Math.cos(sa) * sd;
        const sy = y + Math.sin(sa) * sd;
        ctx.beginPath();
        ctx.arc(sx, sy, 2, 0, TWO_PI);
        ctx.fillStyle = `rgba(255, 255, 220, ${0.6 * urgency})`;
        ctx.fill();
      }

      // Timer text
      if (life < 5) {
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = `rgba(255, 220, 100, ${0.8})`;
        ctx.fillText(Math.ceil(life) + 's', x, y + r + 14);
      }
    },

    tryClick(clickX, clickY, state) {
      if (!spore) return null;
      const dx = clickX - spore.x;
      const dy = clickY - spore.y;
      if (dx * dx + dy * dy < (spore.radius * 3) ** 2) {
        spore = null;
        cooldown = getEffectiveCooldown(state);

        const affinityLvl = state?.dnaUpgrades?.goldenAffinity || 0;
        const extraDuration = affinityLvl * 5;
        const rewardMult = (1 + affinityLvl * 0.25) * (state?.sessionDNA?.activeMutations?.includes('spore_feast') ? 2 : 1);

        const roll = Math.random();

        if (roll < 0.45) {
          // Frenzy: 5x for (20 + extra)s
          const duration = 20 + extraDuration;
          activeBonus = { type: 'frenzy', multiplier: 5, timeLeft: duration };
          return { type: 'frenzy', message: t('spore.frenzy') || `FRENZY! x5 for ${duration}s` };
        } else if (roll < 0.85) {
          // Lucky: instant pixels
          const baseBonus = Math.max(50, Math.floor((state.totalPixelsEarned || 0) * 0.08));
          const totalBonus = Math.floor(baseBonus * rewardMult);
          return {
            type: 'lucky',
            amount: totalBonus,
            message: t('spore.lucky', { n: formatShort(totalBonus) }),
          };
        } else {
          // Click Storm: 3x clicks for (10 + extra)s
          const duration = 10 + extraDuration;
          activeBonus = { type: 'clickStorm', multiplier: 1, stormMultiplier: 3, timeLeft: duration };
          return {
            type: 'clickStorm',
            message: t('spore.storm') || `CLICK STORM! 3x Clicks for ${duration}s`,
          };
        }
      }
      return null;
    },
  };
}

function formatShort(n) {
  if (n < 1000) return String(Math.floor(n));
  if (n < 1000000) return (n / 1000).toFixed(1) + 'K';
  return (n / 1000000).toFixed(1) + 'M';
}
