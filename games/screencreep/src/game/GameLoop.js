// src/game/GameLoop.js
export function createGameLoop(updateFn, renderFn) {
  let lastTime = 0;
  let running = false;
  let rafId = null;

  function tick(timestamp) {
    if (!running) return;
    const rawDt = lastTime ? (timestamp - lastTime) / 1000 : 0.016;
    // Hard clamp dt to prevent physics explosion on lag spikes or tab switching
    const dt = Math.min(0.05, Math.max(0.001, rawDt));
    lastTime = timestamp;

    updateFn(dt);
    renderFn();

    rafId = requestAnimationFrame(tick);
  }

  return {
    start() {
      if (running) return;
      running = true;
      lastTime = 0;
      rafId = requestAnimationFrame(tick);
    },
    stop() {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
    },
  };
}
