// tests/DecaySystem.test.js
import { describe, it, expect } from 'vitest';
import { createDecayTracker, calcDecay } from '../src/game/DecaySystem.js';
import { createInitialState } from '../src/game/GameState.js';

describe('DecaySystem', () => {
  it('does not decay before idle threshold', () => {
    const state = createInitialState();
    state.pixels = 500;
    const decay = calcDecay(state, 1.0, 5); // 5s idle < 10s threshold
    expect(decay).toBe(0);
  });

  it('decays after idle threshold is exceeded', () => {
    const state = createInitialState();
    state.pixels = 1000;
    const decay = calcDecay(state, 1.0, 15); // 15s idle > 10s threshold
    expect(decay).toBeGreaterThan(0);
  });

  it('auto-clicker halves decay rate', () => {
    const state1 = createInitialState();
    state1.pixels = 1000;
    state1.autoClickRate = 0;

    const state2 = createInitialState();
    state2.pixels = 1000;
    state2.autoClickRate = 5;

    const decay1 = calcDecay(state1, 1.0, 20);
    const decay2 = calcDecay(state2, 1.0, 20);

    expect(decay2).toBeCloseTo(decay1 * 0.5, 5);
  });

  it('does not decay below minPixelsForDecay (10 px)', () => {
    const state = createInitialState();
    state.pixels = 8;
    const decay = calcDecay(state, 1.0, 20);
    expect(decay).toBe(0);
  });
});
