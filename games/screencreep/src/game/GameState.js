// src/game/GameState.js
import { generateSessionDNA } from './SessionDNA.js';

export function createInitialState() {
  const sessionDNA = generateSessionDNA();

  return {
    pixels: 0,
    totalPixelsEarned: 0,
    stage: 1,
    clickMultiplier: 1,
    autoClickRate: 0,
    upgrades: {},
    milestones: {},
    lastSaveTime: Date.now(),

    // Upgrade scalars
    cellsPerClick: 0,
    organMultiplier: 1,
    sporeCooldownMultiplier: 1,
    globalMultiplier: 1,
    offlineMultiplier: 1,

    // Appetite Sacrifices (Permanent UI Cannibalism in run)
    sacrifices: {},
    sacrificeMultiplier: 1,

    // Prestige & DNA
    dnaPoints: 0,
    totalDNAEarned: 0,
    prestigeCount: 0,
    dnaUpgrades: {},

    // Permanent Lore Archive across all runs
    whisperArchive: [],

    // Roguelite Session
    sessionDNA,
  };
}

export function calcOfflinePixels(state) {
  if ((state.autoClickRate || 0) <= 0) return 0;
  const now = Date.now();
  const elapsed = Math.min(86400 * 3, (now - (state.lastSaveTime || now)) / 1000); // capped at 3 days
  if (elapsed <= 0) return 0;

  const mult = state.offlineMultiplier || 1;
  const organ = state.organMultiplier || 1;
  const global = (state.globalMultiplier || 1) * (state.sacrificeMultiplier || 1);

  const effectiveRate = state.autoClickRate * organ * global;
  return Math.floor(effectiveRate * elapsed * mult);
}
