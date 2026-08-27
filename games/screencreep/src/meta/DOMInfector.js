// src/meta/DOMInfector.js
const INFECTABLE_SELECTORS = [
  '#ad-slot',
  '#ui-panel button',
  '#ui-panel',
  'h1', 'h2', 'h3',
  '#mute-btn',
];

export function getInfectableElements() {
  const found = [];
  const seen = new Set();
  for (const sel of INFECTABLE_SELECTORS) {
    const els = document.querySelectorAll(sel);
    for (const el of els) {
      if (!seen.has(el) && !el.classList.contains('infected')) {
        found.push(el);
        seen.add(el);
      }
    }
  }
  return found;
}

export function createInfector() {
  let queue = [];
  let infectedCount = 0;

  return {
    getInfectedCount() { return infectedCount; },
    refresh() {
      queue = getInfectableElements();
    },
    infectNext() {
      if (queue.length === 0) this.refresh();
      if (queue.length === 0) return null;
      const el = queue.shift();
      el.classList.add('infected');
      el.style.filter = `hue-rotate(${90 + Math.random() * 40}deg) brightness(1.1)`;
      infectedCount++;
      return el;
    },
  };
}
