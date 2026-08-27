// src/save/SaveManager.js
import { createInitialState } from '../game/GameState.js';

export const SAVE_KEY = 'screencreep_save';

export function saveGame(state, storage = localStorage) {
  state.lastSaveTime = Date.now();
  storage.setItem(SAVE_KEY, JSON.stringify(state));
}

export function loadGame(storage = localStorage) {
  const raw = storage.getItem(SAVE_KEY);
  if (!raw) return null;
  try {
    const saved = JSON.parse(raw);
    const defaults = createInitialState();
    return { ...defaults, ...saved };
  } catch {
    return null;
  }
}

export function resetGame(storage = localStorage) {
  storage.removeItem(SAVE_KEY);
}
