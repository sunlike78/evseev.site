// src/game/ComboTracker.js

export const COMBO_WINDOW = 3.0; // rolling window in seconds

export const COMBO_THRESHOLDS = [
  { cps: 3, mult: 1.0, label: '' },
  { cps: 4, mult: 1.2, label: 'x1.2' },
  { cps: 6, mult: 1.5, label: 'x1.5' },
  { cps: 8, mult: 1.8, label: 'x1.8' },
  { cps: 10, mult: 2.2, label: 'x2.2' },
  { cps: 13, mult: 2.8, label: 'x2.8 FRENZY' },
];

export function createComboTracker() {
  const clickTimestamps = [];
  let currentMult = 1.0;
  let currentLabel = '';

  function prune(time) {
    while (clickTimestamps.length > 0 && clickTimestamps[0] < time - COMBO_WINDOW) {
      clickTimestamps.shift();
    }
  }

  function recalc(time) {
    prune(time);
    const cps = clickTimestamps.length / COMBO_WINDOW;
    let best = COMBO_THRESHOLDS[0];
    for (const t of COMBO_THRESHOLDS) {
      if (cps >= t.cps) {
        best = t;
      }
    }
    currentMult = best.mult;
    currentLabel = best.label;
  }

  return {
    registerClick(time) {
      clickTimestamps.push(time);
      recalc(time);
      return currentMult;
    },
    update(time) {
      recalc(time);
    },
    getMultiplier() {
      return currentMult;
    },
    getLabel() {
      return currentLabel;
    },
    getCPS() {
      return clickTimestamps.length / COMBO_WINDOW;
    },
    reset() {
      clickTimestamps.length = 0;
      currentMult = 1.0;
      currentLabel = '';
    },
  };
}
