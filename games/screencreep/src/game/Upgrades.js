// src/game/Upgrades.js
import { spendPixels } from './Resources.js';

export const UPGRADE_DEFS = {
  autoClicker: {
    baseCost: 8,
    costScale: 1.4,
    minStage: 1,
    apply(state, level) {
      const autoSpeedLvl = state.upgrades.autoSpeed || 0;
      state.autoClickRate = level * 0.5 * (1 + autoSpeedLvl * 0.4);
    },
  },
  clickMultiplier: {
    baseCost: 12,
    costScale: 1.7,
    minStage: 1,
    apply(state, level) {
      const startSeedBonus = (state.dnaUpgrades?.strongerSeed || 0) * 0.5;
      state.clickMultiplier = 1 + startSeedBonus + level * 1.5;
    },
  },
  cellDivision: {
    baseCost: 15,
    costScale: 1.6,
    minStage: 1,
    apply(state, level) {
      state.cellsPerClick = level;
    },
  },
  autoSpeed: {
    baseCost: 30,
    costScale: 1.6,
    minStage: 2,
    requires: { upgrade: 'autoClicker', minLevel: 1 },
    apply(state, level) {
      const autoClickerLvl = state.upgrades.autoClicker || 0;
      state.autoClickRate = autoClickerLvl * 0.5 * (1 + level * 0.4);
    },
  },
  organGrowth: {
    baseCost: 60,
    costScale: 1.8,
    minStage: 2,
    apply(state, level) {
      state.organMultiplier = 1 + level * 0.8;
    },
  },
  sporeChance: {
    baseCost: 150,
    costScale: 2.0,
    minStage: 3,
    apply(state, level) {
      state.sporeCooldownMultiplier = 1 / (1 + level * 0.35);
    },
  },
  neuralLink: {
    baseCost: 400,
    costScale: 2.2,
    minStage: 3,
    apply(state, level) {
      state.globalMultiplier = 1 + level * 0.5;
    },
  },
  membrane: {
    baseCost: 800,
    costScale: 2.5,
    minStage: 4,
    apply(state, level) {
      state.offlineMultiplier = 1 + level * 0.15;
    },
  },
};

export function getUpgradeCost(upgradeId, currentLevel, state = null) {
  const def = UPGRADE_DEFS[upgradeId];
  if (!def) return 0;
  let base = Math.floor(def.baseCost * Math.pow(def.costScale, currentLevel));

  if (state) {
    // DNA upgrade: deepRoots (-5% per level, max 25%)
    const deepRootsLevel = state.dnaUpgrades?.deepRoots || 0;
    if (deepRootsLevel > 0) {
      base = Math.floor(base * Math.max(0.5, 1 - deepRootsLevel * 0.05));
    }
    // Session DNA mutations
    if (state.sessionDNA?.activeMutations?.includes('thick_membrane')) {
      base = Math.floor(base * 0.8);
    }
    if (state.sessionDNA?.activeMutations?.includes('brittle_walls')) {
      base = Math.floor(base * 1.4);
    }
  }

  return Math.max(1, base);
}

export function isUpgradeLocked(upgradeId, state) {
  const def = UPGRADE_DEFS[upgradeId];
  if (!def) return true;

  if (def.minStage && (state.stage || 1) < def.minStage) {
    return true;
  }

  if (def.requires) {
    const parentLevel = state.upgrades?.[def.requires.upgrade] || 0;
    if (parentLevel < def.requires.minLevel) return true;
  }

  return false;
}

export function purchaseUpgrade(state, upgradeId) {
  if (isUpgradeLocked(upgradeId, state)) return false;

  const currentLevel = state.upgrades[upgradeId] || 0;
  const cost = getUpgradeCost(upgradeId, currentLevel, state);

  if (!spendPixels(state, cost)) return false;

  state.upgrades[upgradeId] = currentLevel + 1;
  UPGRADE_DEFS[upgradeId].apply(state, currentLevel + 1);

  // If autoSpeed was bought, recalculate autoClicker rate and vice versa
  if (upgradeId === 'autoSpeed') {
    UPGRADE_DEFS.autoClicker.apply(state, state.upgrades.autoClicker || 0);
  }
  return true;
}

export function recalculateAllUpgrades(state) {
  for (const [id, def] of Object.entries(UPGRADE_DEFS)) {
    const level = state.upgrades?.[id] || 0;
    def.apply(state, level);
  }
}
