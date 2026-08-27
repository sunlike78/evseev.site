// tests/SaveManager.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import { saveGame, loadGame, resetGame, SAVE_KEY } from '../src/save/SaveManager.js';
import { createInitialState } from '../src/game/GameState.js';

// Mock localStorage
const mockStorage = {};
const localStorageMock = {
  getItem: (key) => mockStorage[key] || null,
  setItem: (key, value) => { mockStorage[key] = value; },
  removeItem: (key) => { delete mockStorage[key]; },
};

describe('SaveManager', () => {
  beforeEach(() => {
    Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
  });

  it('saveGame stores state as JSON', () => {
    const state = createInitialState();
    state.pixels = 42;
    saveGame(state, localStorageMock);
    const raw = localStorageMock.getItem(SAVE_KEY);
    expect(raw).toBeDefined();
    const parsed = JSON.parse(raw);
    expect(parsed.pixels).toBe(42);
  });

  it('loadGame returns null when no save exists', () => {
    const result = loadGame(localStorageMock);
    expect(result).toBeNull();
  });

  it('loadGame restores saved state', () => {
    const state = createInitialState();
    state.pixels = 999;
    state.stage = 2;
    saveGame(state, localStorageMock);
    const loaded = loadGame(localStorageMock);
    expect(loaded.pixels).toBe(999);
    expect(loaded.stage).toBe(2);
  });

  it('resetGame removes save data', () => {
    const state = createInitialState();
    saveGame(state, localStorageMock);
    resetGame(localStorageMock);
    expect(loadGame(localStorageMock)).toBeNull();
  });
});
