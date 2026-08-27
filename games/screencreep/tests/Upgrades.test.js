// tests/Upgrades.test.js
import { describe, it, expect } from 'vitest';
import { UPGRADE_DEFS, getUpgradeCost, purchaseUpgrade } from '../src/game/Upgrades.js';
import { createInitialState } from '../src/game/GameState.js';

describe('Upgrades', () => {
  it('has 8 upgrade types', () => {
    expect(Object.keys(UPGRADE_DEFS).length).toBe(8);
  });

  it('UPGRADE_DEFS has autoClicker and clickMultiplier', () => {
    expect(UPGRADE_DEFS.autoClicker).toBeDefined();
    expect(UPGRADE_DEFS.clickMultiplier).toBeDefined();
    expect(UPGRADE_DEFS.autoSpeed).toBeDefined();
  });

  it('getUpgradeCost scales with level', () => {
    const cost0 = getUpgradeCost('autoClicker', 0);
    const cost1 = getUpgradeCost('autoClicker', 1);
    const cost2 = getUpgradeCost('autoClicker', 2);
    expect(cost0).toBe(UPGRADE_DEFS.autoClicker.baseCost);
    expect(cost1).toBeGreaterThan(cost0);
    expect(cost2).toBeGreaterThan(cost1);
  });

  it('purchaseUpgrade deducts pixels and increments level', () => {
    const state = createInitialState();
    state.pixels = 1000;
    const result = purchaseUpgrade(state, 'autoClicker');
    expect(result).toBe(true);
    expect(state.upgrades.autoClicker).toBe(1);
    expect(state.pixels).toBeLessThan(1000);
    expect(state.autoClickRate).toBeGreaterThan(0);
  });

  it('purchaseUpgrade fails if not enough pixels', () => {
    const state = createInitialState();
    state.pixels = 0;
    const result = purchaseUpgrade(state, 'autoClicker');
    expect(result).toBe(false);
    expect(state.upgrades.autoClicker).toBeUndefined();
  });

  it('clickMultiplier upgrade scales linearly (1 + level * 1.5)', () => {
    const state = createInitialState();
    state.pixels = 10000;
    purchaseUpgrade(state, 'clickMultiplier');
    expect(state.clickMultiplier).toBe(2.5);
    purchaseUpgrade(state, 'clickMultiplier');
    expect(state.clickMultiplier).toBe(4.0);
  });

  it('autoSpeed upgrade increases autoClickRate for existing autoclickers', () => {
    const state = createInitialState();
    state.pixels = 100000;
    state.stage = 2; // Unlock stage 2 for autoSpeed
    purchaseUpgrade(state, 'autoClicker');
    const rateAfterAuto = state.autoClickRate;
    purchaseUpgrade(state, 'autoSpeed');
    expect(state.autoClickRate).toBeGreaterThan(rateAfterAuto);
  });
});
