// tests/SessionDNA.test.js
import { describe, it, expect } from 'vitest';
import { generateSessionDNA, checkMutationReveals, getRunHealthLabel } from '../src/game/SessionDNA.js';
import { createInitialState } from '../src/game/GameState.js';

describe('SessionDNA', () => {
  it('generates session DNA with seed and mutations', () => {
    const dna = generateSessionDNA();
    expect(dna.seed).toBeDefined();
    expect(dna.seedHex.length).toBe(4);
    expect(dna.mutations.length).toBeGreaterThanOrEqual(3);
    expect(dna.mutations.length).toBeLessThanOrEqual(5);
    expect(dna.hueShift).toBeGreaterThanOrEqual(-30);
    expect(dna.hueShift).toBeLessThanOrEqual(30);
  });

  it('generates reproducible mutations for the same seed', () => {
    const seed = 12345678;
    const dna1 = generateSessionDNA(seed);
    const dna2 = generateSessionDNA(seed);
    expect(dna1.seedHex).toBe(dna2.seedHex);
    expect(dna1.mutations.map((m) => m.id)).toEqual(dna2.mutations.map((m) => m.id));
  });

  it('checkMutationReveals activates mutations as totalPixelsEarned grows', () => {
    const state = createInitialState();
    state.sessionDNA = generateSessionDNA();
    state.sessionDNA.activeMutations = [];
    state.totalPixelsEarned = 500;

    const revealed = checkMutationReveals(state);
    expect(revealed.length).toBeGreaterThan(0);
    expect(state.sessionDNA.activeMutations.length).toBeGreaterThan(0);
  });

  it('getRunHealthLabel categorizes run correctly', () => {
    const dna = {
      mutations: [
        { type: 'positive' },
        { type: 'positive' },
        { type: 'positive' },
      ],
    };
    expect(getRunHealthLabel(dna)).toBe('Thriving');
  });
});
