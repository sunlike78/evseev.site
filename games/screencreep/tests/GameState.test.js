// tests/GameState.test.js
import { describe, it, expect } from 'vitest';
import { createInitialState, calcOfflinePixels } from '../src/game/GameState.js';

describe('GameState', () => {
  it('creates initial state with correct defaults', () => {
    const state = createInitialState();
    expect(state.pixels).toBe(0);
    expect(state.stage).toBe(1);
    expect(state.clickMultiplier).toBe(1);
    expect(state.autoClickRate).toBe(0);
    expect(state.upgrades).toEqual({});
    expect(state.totalPixelsEarned).toBe(0);
  });

  it('calcOfflinePixels computes idle earnings', () => {
    const state = createInitialState();
    state.autoClickRate = 5;
    state.lastSaveTime = Date.now() - 60000;
    const earned = calcOfflinePixels(state);
    expect(earned).toBeGreaterThanOrEqual(295);
    expect(earned).toBeLessThanOrEqual(305);
  });

  it('calcOfflinePixels returns 0 with no auto rate', () => {
    const state = createInitialState();
    state.lastSaveTime = Date.now() - 60000;
    const earned = calcOfflinePixels(state);
    expect(earned).toBe(0);
  });
});
