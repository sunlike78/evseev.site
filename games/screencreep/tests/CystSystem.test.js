// tests/CystSystem.test.js
import { describe, it, expect } from 'vitest';
import { createCystManager } from '../src/game/CystSystem.js';

describe('CystSystem', () => {
  it('does not spawn or keep cysts below Stage 3', () => {
    const cm = createCystManager();
    cm.spawnCyst(100, 100);
    expect(cm.getCysts().length).toBe(1);

    cm.update(1.0, 2, 10, 200, 200); // Stage 2 < 3
    expect(cm.getCysts().length).toBe(0);
  });

  it('siphons biomass and grows scale in Stage 3+', () => {
    const cm = createCystManager();
    const cyst = cm.spawnCyst(100, 100);
    expect(cyst.storedBiomass).toBe(0);

    cm.update(1.0, 3, 50, 200, 200); // 50 CpS * 10% * 1s = 5 px
    expect(cyst.storedBiomass).toBe(5);
    expect(cyst.scale).toBeGreaterThanOrEqual(1);
  });

  it('tryClick deals damage and bursts after 3 clicks with 250% payout', () => {
    const cm = createCystManager();
    const cyst = cm.spawnCyst(100, 100);
    cyst.storedBiomass = 100;

    const hit1 = cm.tryClick(100, 100);
    expect(hit1.burst).toBe(false);
    expect(hit1.clicksLeft).toBe(2);

    const hit2 = cm.tryClick(100, 100);
    expect(hit2.burst).toBe(false);
    expect(hit2.clicksLeft).toBe(1);

    const hit3 = cm.tryClick(100, 100);
    expect(hit3.burst).toBe(true);
    expect(hit3.returnedBiomass).toBe(250); // 100 * 2.5 = 250
    expect(cm.getCysts().length).toBe(0);
  });
});
