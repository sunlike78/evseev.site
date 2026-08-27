// tests/PrestigeManager.test.js
import { describe, it, expect } from 'vitest';
import { calcDNAPoints, canPrestige, sporulate, purchaseDNAUpgrade, DNA_UPGRADES } from '../src/game/PrestigeManager.js';
import { createInitialState } from '../src/game/GameState.js';

describe('PrestigeManager', () => {
  it('cannot prestige before 20,000 pixels earned', () => {
    const state = createInitialState();
    state.totalPixelsEarned = 15000;
    expect(canPrestige(state)).toBe(false);
    expect(calcDNAPoints(15000, state)).toBe(0);
  });

  it('can prestige at 20,000+ pixels earned and calculates DNA', () => {
    const state = createInitialState();
    state.totalPixelsEarned = 25000;
    expect(canPrestige(state)).toBe(true);
    const dna = calcDNAPoints(25000, state);
    expect(dna).toBeGreaterThanOrEqual(2);
  });

  it('sporulate resets biomass progress and awards DNA points', () => {
    const state = createInitialState();
    state.totalPixelsEarned = 30000;
    state.pixels = 5000;
    state.stage = 5;
    state.upgrades = { autoClicker: 5 };

    const result = sporulate(state);
    expect(result).toBeDefined();
    expect(result.earnedDNA).toBeGreaterThanOrEqual(2);
    expect(state.dnaPoints).toBe(result.earnedDNA);
    expect(state.stage).toBe(1);
    expect(state.pixels).toBe(0);
    expect(state.totalPixelsEarned).toBe(0);
    expect(state.prestigeCount).toBe(1);
  });

  it('purchaseDNAUpgrade spends DNA points and increases level', () => {
    const state = createInitialState();
    state.dnaPoints = 5;

    const bought = purchaseDNAUpgrade(state, 'strongerSeed');
    expect(bought).toBe(true);
    expect(state.dnaUpgrades.strongerSeed).toBe(1);
    expect(state.dnaPoints).toBeLessThan(5);
  });
});
