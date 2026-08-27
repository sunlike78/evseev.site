// src/game/DecaySystem.js

export const DECAY_CONFIG = {
  idleThreshold: 10,           // Seconds without click before decay starts
  ratePerMinute: 0.005,        // 0.5% of current pixels per minute
  ratePerSecond: 0.005 / 60,   // ~0.0000833 per second
  autoClickerReduction: 0.5,   // Auto-clicker reduces decay by 50%
  membraneReduction: 0.15,     // Per Membrane level
  minPixelsForDecay: 10,       // Never decay below this balance
  maxDecayPerSecond: 50,       // Hard cap on decay rate
};

export function calcDecay(state, dt, timeSinceLastClick) {
  if (timeSinceLastClick < DECAY_CONFIG.idleThreshold) return 0;
  if ((state.pixels || 0) <= DECAY_CONFIG.minPixelsForDecay) return 0;

  let rate = DECAY_CONFIG.ratePerSecond;

  // Auto-clicker halves decay
  if ((state.autoClickRate || 0) > 0) {
    rate *= (1 - DECAY_CONFIG.autoClickerReduction);
  }

  // Membrane upgrade reduces decay
  const membraneLevel = state.upgrades?.membrane || 0;
  rate *= Math.max(0, 1 - membraneLevel * DECAY_CONFIG.membraneReduction);

  // DNA resilientMembrane reduces decay
  const dnaResilient = state.dnaUpgrades?.resilientMembrane || 0;
  rate *= Math.max(0, 1 - dnaResilient * 0.10);

  const rawDecay = (state.pixels || 0) * rate * dt;
  const cappedDecay = Math.min(rawDecay, DECAY_CONFIG.maxDecayPerSecond * dt);

  return Math.min(state.pixels - DECAY_CONFIG.minPixelsForDecay, cappedDecay);
}

export function createDecayTracker() {
  let timeSinceLastClick = 0;

  return {
    registerClick() {
      timeSinceLastClick = 0;
    },
    update(dt, state) {
      timeSinceLastClick += dt;
      const decay = calcDecay(state, dt, timeSinceLastClick);
      if (decay > 0) {
        state.pixels = Math.max(DECAY_CONFIG.minPixelsForDecay, state.pixels - decay);
      }
      return decay;
    },
    getTimeSinceLastClick() {
      return timeSinceLastClick;
    },
    isDecaying() {
      return timeSinceLastClick >= DECAY_CONFIG.idleThreshold;
    },
  };
}
