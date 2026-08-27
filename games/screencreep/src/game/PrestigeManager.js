// src/game/PrestigeManager.js
import { generateSessionDNA } from './SessionDNA.js';
import { UPGRADE_DEFS } from './Upgrades.js';

export const PRESTIGE_THRESHOLD = 20000;

export const DNA_UPGRADES = {
  strongerSeed: {
    id: 'strongerSeed',
    maxLevel: 5,
    cost: [1, 1, 2, 3, 5],
    nameKey: 'dna.strongerSeed.name',
    descKey: 'dna.strongerSeed.desc',
  },
  quickStart: {
    id: 'quickStart',
    maxLevel: 3,
    cost: [1, 2, 4],
    nameKey: 'dna.quickStart.name',
    descKey: 'dna.quickStart.desc',
  },
  deepRoots: {
    id: 'deepRoots',
    maxLevel: 5,
    cost: [1, 2, 2, 3, 5],
    nameKey: 'dna.deepRoots.name',
    descKey: 'dna.deepRoots.desc',
  },
  goldenAffinity: {
    id: 'goldenAffinity',
    maxLevel: 3,
    cost: [2, 3, 5],
    nameKey: 'dna.goldenAffinity.name',
    descKey: 'dna.goldenAffinity.desc',
  },
  resilientMembrane: {
    id: 'resilientMembrane',
    maxLevel: 3,
    cost: [2, 3, 5],
    nameKey: 'dna.resilientMembrane.name',
    descKey: 'dna.resilientMembrane.desc',
  },
  sporulation: {
    id: 'sporulation',
    maxLevel: 5,
    cost: [2, 3, 4, 6, 10],
    nameKey: 'dna.sporulation.name',
    descKey: 'dna.sporulation.desc',
  },
  cosmicSkin: {
    id: 'cosmicSkin',
    maxLevel: 10,
    cost: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    nameKey: 'dna.cosmicSkin.name',
    descKey: 'dna.cosmicSkin.desc',
  },
};

export function calcDNAPoints(totalPixelsEarned, state = null) {
  if (totalPixelsEarned < PRESTIGE_THRESHOLD) return 0;

  const baseDNA = Math.pow(totalPixelsEarned / 5000, 0.55);
  const sessionMod = state?.sessionDNA?.dnaYieldMod || 1.0;
  const sporulationLvl = state?.dnaUpgrades?.sporulation || 0;
  const sporulationMult = 1 + sporulationLvl * 0.15;

  return Math.max(1, Math.floor(baseDNA * sessionMod * sporulationMult));
}

export function canPrestige(state) {
  return (state.totalPixelsEarned || 0) >= PRESTIGE_THRESHOLD;
}

export function purchaseDNAUpgrade(state, upgradeId) {
  const def = DNA_UPGRADES[upgradeId];
  if (!def) return false;

  if (!state.dnaUpgrades) state.dnaUpgrades = {};
  const curLevel = state.dnaUpgrades[upgradeId] || 0;

  if (curLevel >= def.maxLevel) return false;

  const cost = def.cost[curLevel];
  if ((state.dnaPoints || 0) < cost) return false;

  state.dnaPoints -= cost;
  state.dnaUpgrades[upgradeId] = curLevel + 1;
  return true;
}

export function sporulate(state) {
  if (!canPrestige(state)) return null;

  const earnedDNA = calcDNAPoints(state.totalPixelsEarned, state);
  state.dnaPoints = (state.dnaPoints || 0) + earnedDNA;
  state.totalDNAEarned = (state.totalDNAEarned || 0) + earnedDNA;
  state.prestigeCount = (state.prestigeCount || 0) + 1;

  // Reset Run State
  state.pixels = 0;
  state.totalPixelsEarned = 0;
  state.stage = 1;
  state.upgrades = {};
  state.milestones = {};
  state.clickMultiplier = 1;
  state.autoClickRate = 0;
  state.cellsPerClick = 0;
  state.organMultiplier = 1;
  state.globalMultiplier = 1;
  state.sporeCooldownMultiplier = 1;
  state.offlineMultiplier = 1;
  state.sacrifices = {};
  state.sacrificeMultiplier = 1;

  // Generate New Session DNA
  state.sessionDNA = generateSessionDNA();

  // Apply quickStart DNA upgrade
  const quickStartLvl = state.dnaUpgrades?.quickStart || 0;
  if (quickStartLvl > 0) {
    state.upgrades.autoClicker = quickStartLvl;
    UPGRADE_DEFS.autoClicker.apply(state, quickStartLvl);
  }

  // Apply strongerSeed DNA upgrade
  const strongerSeedLvl = state.dnaUpgrades?.strongerSeed || 0;
  if (strongerSeedLvl > 0) {
    state.clickMultiplier = 1 + strongerSeedLvl * 0.5;
  }

  return {
    earnedDNA,
    totalDNA: state.dnaPoints,
    seed: state.sessionDNA.seedHex,
  };
}
