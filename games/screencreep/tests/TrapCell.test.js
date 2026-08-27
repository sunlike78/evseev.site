// tests/TrapCell.test.js
import { describe, it, expect } from 'vitest';
import { createTrapManager, calcTrapPenalty } from '../src/game/TrapCell.js';
import { createInitialState } from '../src/game/GameState.js';

describe('TrapCell', () => {
  it('calcTrapPenalty calculates penalty capped at hardCap', () => {
    const state = createInitialState();
    state.pixels = 1000;
    const penalty = calcTrapPenalty(state, 2);
    expect(penalty).toBeGreaterThanOrEqual(100);
    expect(penalty).toBeLessThanOrEqual(250); // hardCap 25%
  });

  it('calcTrapPenalty respects Membrane upgrade discount', () => {
    const state = createInitialState();
    state.pixels = 1000;
    state.upgrades.membrane = 3; // 45% reduction
    const penalty = calcTrapPenalty(state, 2);
    expect(penalty).toBeLessThan(150);
  });

  it('spawnTrap adds trap to manager', () => {
    const manager = createTrapManager();
    const trap = manager.spawnTrap(50, 50, 16, 2);
    expect(trap).toBeDefined();
    expect(manager.getTraps().length).toBe(1);
    expect(trap.isWarning).toBe(true);
  });

  it('tryClick detects hit on trap and deducts pixels', () => {
    const manager = createTrapManager();
    const state = createInitialState();
    state.pixels = 500;
    manager.spawnTrap(50, 50, 16, 2);

    const hit = manager.tryClick(52, 52, state);
    expect(hit).toBeDefined();
    expect(hit.hit).toBe(true);
    expect(state.pixels).toBeLessThan(500);
    expect(manager.getTraps().length).toBe(0);
  });
});
