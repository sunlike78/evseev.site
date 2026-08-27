// src/ui/AchievementToast.js
export function createToastSystem() {
  const toasts = [];
  const MAX_VISIBLE = 2;

  return {
    show(message, color = '#00ff88') {
      if (toasts.length >= MAX_VISIBLE) {
        toasts[0].life = Math.min(toasts[0].life, 0.3);
      }

      toasts.push({
        message,
        color,
        life: 2.2,
        y: 10,
      });
    },

    update(dt) {
      for (let i = toasts.length - 1; i >= 0; i--) {
        const t = toasts[i];
        const targetY = 28 + i * 36;
        t.y += (targetY - t.y) * dt * 10;
        t.life -= dt;
        if (t.life <= 0) toasts.splice(i, 1);
      }
    },

    render(ctx, canvasW) {
      for (let i = 0; i < toasts.length; i++) {
        const t = toasts[i];
        const alpha = Math.min(1, t.life * 1.5);
        const fadeIn = Math.min(1, (2.2 - t.life) * 5);
        const a = Math.max(0, alpha * fadeIn);

        // Background pill
        const barW = Math.min(340, canvasW * 0.8);
        const barX = (canvasW - barW) / 2;

        ctx.fillStyle = `rgba(5, 10, 15, ${a * 0.92})`;
        ctx.beginPath();
        ctx.roundRect(barX, t.y - 12, barW, 26, 6);
        ctx.fill();

        ctx.strokeStyle = `${t.color}${Math.floor(a * 160).toString(16).padStart(2, '0')}`;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Text
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = `${t.color}${Math.floor(a * 255).toString(16).padStart(2, '0')}`;
        ctx.fillText(t.message, canvasW / 2, t.y + 5);
      }
    },
  };
}
