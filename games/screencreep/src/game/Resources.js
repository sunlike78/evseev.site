// src/game/Resources.js
const SUFFIXES = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi'];

export const BURST_CHANCE = 0.05; // 5% chance of burst/crit click
export const BURST_MIN = 3;
export const BURST_MAX = 10;

export function rollBurstClick() {
  if (Math.random() < BURST_CHANCE) {
    const mult = +(BURST_MIN + Math.random() * (BURST_MAX - BURST_MIN)).toFixed(1);
    return { isBurst: true, mult };
  }
  return { isBurst: false, mult: 1 };
}

export function calculateClick(state, comboMult = 1, activeBonus = null) {
  let baseClick = 1;

  // Session DNA mutation: hyper_click (+3 flat click)
  if (state.sessionDNA?.activeMutations?.includes('hyper_click')) {
    baseClick += 3;
  }

  const clickMult = state.clickMultiplier || 1;
  const globalMult = (state.globalMultiplier || 1) * (state.sacrificeMultiplier || 1);

  // Golden Spore bonuses
  let frenzyMult = 1;
  let stormMult = 1;
  if (activeBonus) {
    if (activeBonus.type === 'frenzy') frenzyMult = activeBonus.multiplier || 5;
    if (activeBonus.type === 'clickStorm') stormMult = activeBonus.stormMultiplier || 3;
  }

  // Cell Division synergy: +30% click power per extra cell
  const cellBonus = 1 + (state.cellsPerClick || 0) * 0.3;

  // Critical / Burst roll
  const { isBurst, mult: burstMult } = rollBurstClick();

  // Session DNA mutation: pulse_economy (oscillates 0.5x..2.0x on 10s wave)
  let pulseMod = 1;
  if (state.sessionDNA?.activeMutations?.includes('pulse_economy')) {
    const t = (Date.now() / 1000) % 10;
    pulseMod = 0.5 + 1.5 * (0.5 + 0.5 * Math.sin((t / 10) * Math.PI * 2));
  }

  const totalValue = Math.max(
    1,
    Math.floor(baseClick * clickMult * globalMult * comboMult * frenzyMult * stormMult * cellBonus * burstMult * pulseMod)
  );

  return {
    value: totalValue,
    isBurst,
    burstMult,
    comboMult,
    stormMult,
  };
}

export function addPixels(state, amount) {
  const clickMult = state.clickMultiplier || 1;
  const globalMult = (state.globalMultiplier || 1) * (state.sacrificeMultiplier || 1);
  const earned = amount * clickMult * globalMult;
  state.pixels = (state.pixels || 0) + earned;
  state.totalPixelsEarned = (state.totalPixelsEarned || 0) + earned;
}

export function addRawPixels(state, amount) {
  state.pixels = (state.pixels || 0) + amount;
  state.totalPixelsEarned = (state.totalPixelsEarned || 0) + amount;
}

export function spendPixels(state, amount) {
  if ((state.pixels || 0) < amount) return false;
  state.pixels -= amount;
  return true;
}

export function canAfford(state, amount) {
  return (state.pixels || 0) >= amount;
}

export function formatNumber(n) {
  if (n === undefined || n === null || isNaN(n)) return '0';
  if (n < 1000) return String(Math.floor(n));
  let tier = 0;
  let scaled = n;
  while (scaled >= 1000 && tier < SUFFIXES.length - 1) {
    scaled /= 1000;
    tier++;
  }
  return scaled.toFixed(1) + SUFFIXES[tier];
}
