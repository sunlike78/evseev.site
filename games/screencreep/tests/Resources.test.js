// tests/Resources.test.js
import { describe, it, expect } from 'vitest';
import { addPixels, addRawPixels, spendPixels, canAfford, formatNumber } from '../src/game/Resources.js';

describe('Resources', () => {
  it('addPixels increases state.pixels and totalPixelsEarned', () => {
    const state = { pixels: 0, totalPixelsEarned: 0 };
    addPixels(state, 10);
    expect(state.pixels).toBe(10);
    expect(state.totalPixelsEarned).toBe(10);
  });

  it('addPixels respects multiplier', () => {
    const state = { pixels: 0, totalPixelsEarned: 0, clickMultiplier: 3 };
    addPixels(state, 1);
    expect(state.pixels).toBe(3);
    expect(state.totalPixelsEarned).toBe(3);
  });

  it('addRawPixels adds without multiplier', () => {
    const state = { pixels: 0, totalPixelsEarned: 0, clickMultiplier: 5 };
    addRawPixels(state, 10);
    expect(state.pixels).toBe(10);
    expect(state.totalPixelsEarned).toBe(10);
  });

  it('spendPixels subtracts from state.pixels', () => {
    const state = { pixels: 100 };
    const ok = spendPixels(state, 40);
    expect(ok).toBe(true);
    expect(state.pixels).toBe(60);
  });

  it('spendPixels returns false if not enough', () => {
    const state = { pixels: 10 };
    const ok = spendPixels(state, 50);
    expect(ok).toBe(false);
    expect(state.pixels).toBe(10);
  });

  it('canAfford checks correctly', () => {
    const state = { pixels: 25 };
    expect(canAfford(state, 25)).toBe(true);
    expect(canAfford(state, 26)).toBe(false);
  });

  it('formatNumber abbreviates large numbers', () => {
    expect(formatNumber(999)).toBe('999');
    expect(formatNumber(1000)).toBe('1.0K');
    expect(formatNumber(1500000)).toBe('1.5M');
    expect(formatNumber(2300000000)).toBe('2.3B');
  });
});
