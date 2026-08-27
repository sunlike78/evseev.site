// tests/ComboTracker.test.js
import { describe, it, expect } from 'vitest';
import { createComboTracker } from '../src/game/ComboTracker.js';

describe('ComboTracker', () => {
  it('starts at 1.0 multiplier with no clicks', () => {
    const tracker = createComboTracker();
    expect(tracker.getMultiplier()).toBe(1.0);
    expect(tracker.getCPS()).toBe(0);
  });

  it('increases multiplier with rapid clicks within 3s window', () => {
    const tracker = createComboTracker();
    // 15 clicks at t = 1.0s (15 clicks / 3s = 5 CPS -> >=4 CPS is 1.2x)
    for (let i = 0; i < 15; i++) {
      tracker.registerClick(1.0);
    }
    expect(tracker.getCPS()).toBe(5.0);
    expect(tracker.getMultiplier()).toBe(1.2);
  });

  it('reaches frenzy multiplier for high CPS', () => {
    const tracker = createComboTracker();
    // 40 clicks in 3s window = 13.33 CPS -> x2.8 FRENZY
    for (let i = 0; i < 40; i++) {
      tracker.registerClick(1.0);
    }
    expect(tracker.getMultiplier()).toBe(2.8);
    expect(tracker.getLabel()).toContain('FRENZY');
  });

  it('resets or decays when window passes', () => {
    const tracker = createComboTracker();
    for (let i = 0; i < 20; i++) {
      tracker.registerClick(1.0);
    }
    expect(tracker.getMultiplier()).toBeGreaterThan(1.0);

    // Update at t = 5.0s (4 seconds later -> all clicks pruned)
    tracker.update(5.0);
    expect(tracker.getCPS()).toBe(0);
    expect(tracker.getMultiplier()).toBe(1.0);
  });
});
