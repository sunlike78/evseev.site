// src/game/ClickHandler.js
export function setupClickHandler(canvas, state, onClickCallback) {
  let lastTriggerTime = 0;

  function handleTrigger(e) {
    if (!onClickCallback) return;
    const now = performance.now();
    if (now - lastTriggerTime < 8) return; // Debounce double trigger from pointerdown + click
    lastTriggerTime = now;

    const rect = canvas.getBoundingClientRect();
    let localX = rect.width / 2;
    let localY = rect.height / 2;

    if (typeof e.clientX === 'number' && e.clientX > 0) {
      localX = e.clientX - rect.left;
      localY = e.clientY - rect.top;
    } else if (typeof e.offsetX === 'number' && e.offsetX > 0) {
      localX = e.offsetX;
      localY = e.offsetY;
    }

    const screenX = (typeof e.clientX === 'number' && e.clientX > 0) ? e.clientX : (rect.left + localX);
    const screenY = (typeof e.clientY === 'number' && e.clientY > 0) ? e.clientY : (rect.top + localY);

    onClickCallback(localX, localY, screenX, screenY);
  }

  canvas.addEventListener('pointerdown', handleTrigger, { passive: true });
  canvas.addEventListener('click', handleTrigger, { passive: true });
}
