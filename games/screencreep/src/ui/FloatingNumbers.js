// src/ui/FloatingNumbers.js
export function createFloatingNumbers() {
  const numbers = [];

  return {
    add(x, y, amount, options = {}) {
      const isCrit = options.isCrit || false;
      const isPenalty = options.isPenalty || false;
      const isGlance = options.isGlance || false;
      const isPluck = options.isPluck || false;
      const burstMult = options.burstMult || 1;

      let text = (isPenalty ? '-' : '+') + formatShort(Math.abs(amount));
      if (isCrit) {
        text += ' ★ CRIT!';
      } else if (isGlance) {
        text += ' (edge)';
      } else if (isPluck) {
        text += ' ♫';
      }

      if (numbers.length >= 25) numbers.shift();
      numbers.push({
        x: x + (Math.random() - 0.5) * 20,
        y,
        text,
        life: isCrit ? 1.3 : (isGlance ? 0.8 : 1.0),
        vy: isCrit ? -65 : (isGlance ? -30 : (-45 - Math.random() * 15)),
        size: isCrit
          ? Math.min(26, 17 + Math.log2(Math.max(1, amount)) * 2.2)
          : (isGlance ? 12 : Math.min(20, 13 + Math.log2(Math.max(1, amount)) * 1.8)),
        isCrit,
        isPenalty,
        isGlance,
        isPluck,
      });
    },

    update(dt) {
      for (let i = numbers.length - 1; i >= 0; i--) {
        const n = numbers[i];
        n.y += n.vy * dt;
        n.vy *= 0.96;
        n.life -= dt * (n.isCrit ? 0.9 : 1.3);
        if (n.life <= 0) numbers.splice(i, 1);
      }
    },

    render(ctx) {
      for (const n of numbers) {
        const alpha = Math.max(0, n.life);
        ctx.font = `bold ${Math.floor(n.size)}px monospace`;
        ctx.textAlign = 'center';

        if (n.isPenalty) {
          // Red Hazard Penalty
          ctx.fillStyle = `rgba(255, 50, 50, ${alpha * 0.4})`;
          ctx.fillText(n.text, n.x + 1, n.y + 1);
          ctx.fillStyle = `rgba(255, 120, 120, ${alpha})`;
          ctx.fillText(n.text, n.x, n.y);
        } else if (n.isCrit) {
          // Gold / Diamond Critical Bullseye Hit
          ctx.fillStyle = `rgba(0, 240, 255, ${alpha * 0.6})`;
          ctx.fillText(n.text, n.x + 1, n.y + 1);
          ctx.fillStyle = `rgba(255, 240, 100, ${alpha})`;
          ctx.fillText(n.text, n.x, n.y);
        } else if (n.isGlance) {
          // Subtle Cyan Glancing Edge
          ctx.fillStyle = `rgba(100, 200, 220, ${alpha * 0.75})`;
          ctx.fillText(n.text, n.x, n.y);
        } else if (n.isPluck) {
          // Emerald Pluck
          ctx.fillStyle = `rgba(0, 255, 180, ${alpha})`;
          ctx.fillText(n.text, n.x, n.y);
        } else {
          // Standard Green Bio Biomass
          ctx.fillStyle = `rgba(0, 255, 136, ${alpha * 0.3})`;
          ctx.fillText(n.text, n.x + 1, n.y + 1);
          ctx.fillStyle = `rgba(200, 255, 220, ${alpha})`;
          ctx.fillText(n.text, n.x, n.y);
        }
      }
    },
  };
}

function formatShort(n) {
  if (n < 1000) return String(Math.floor(n));
  if (n < 1000000) return (n / 1000).toFixed(1) + 'K';
  if (n < 1000000000) return (n / 1000000).toFixed(1) + 'M';
  return (n / 1000000000).toFixed(1) + 'B';
}
