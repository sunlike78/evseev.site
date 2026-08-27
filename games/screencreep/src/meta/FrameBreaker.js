// src/meta/FrameBreaker.js
export function activateBreach(container, canvas) {
  container.classList.add('breached');
  canvas.style.position = 'absolute';
  canvas.style.top = '-120px';
  canvas.style.left = '-120px';
  canvas.style.width = 'calc(100% + 240px)';
  canvas.style.height = 'calc(100% + 240px)';
  canvas.style.zIndex = '10';
}

export function updateBreachSize(container, canvas, progress) {
  const expand = Math.floor(120 + progress * 350);
  canvas.style.top = `-${expand}px`;
  canvas.style.left = `-${expand}px`;
  canvas.style.width = `calc(100% + ${expand * 2}px)`;
  canvas.style.height = `calc(100% + ${expand * 2}px)`;
}
