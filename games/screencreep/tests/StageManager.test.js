// tests/StageManager.test.js
import { describe, it, expect } from 'vitest';
import { STAGE_THRESHOLDS, MILESTONES, checkStageTransition, checkMilestones } from '../src/stages/StageManager.js';
import { createInitialState } from '../src/game/GameState.js';

describe('StageManager', () => {
  it('STAGE_THRESHOLDS defines thresholds for stages 2-5', () => {
    expect(STAGE_THRESHOLDS[2]).toBe(20);
    expect(STAGE_THRESHOLDS[3]).toBe(250);
    expect(STAGE_THRESHOLDS[4]).toBe(5000);
    expect(STAGE_THRESHOLDS[5]).toBe(20000);
  });

  it('stays at stage 1 when below threshold', () => {
    const state = createInitialState();
    state.totalPixelsEarned = 0;
    const advanced = checkStageTransition(state);
    expect(advanced).toBe(false);
    expect(state.stage).toBe(1);
  });

  it('advances to stage 2 at threshold', () => {
    const state = createInitialState();
    state.totalPixelsEarned = STAGE_THRESHOLDS[2];
    const advanced = checkStageTransition(state);
    expect(advanced).toBe(true);
    expect(state.stage).toBe(2);
  });

  it('advances to stage 3 at threshold', () => {
    const state = createInitialState();
    state.stage = 2;
    state.totalPixelsEarned = STAGE_THRESHOLDS[3];
    const advanced = checkStageTransition(state);
    expect(advanced).toBe(true);
    expect(state.stage).toBe(3);
  });

  it('advances to stage 4 at threshold', () => {
    const state = createInitialState();
    state.stage = 3;
    state.totalPixelsEarned = STAGE_THRESHOLDS[4];
    const advanced = checkStageTransition(state);
    expect(advanced).toBe(true);
    expect(state.stage).toBe(4);
  });

  it('advances to stage 5 at threshold', () => {
    const state = createInitialState();
    state.stage = 4;
    state.totalPixelsEarned = STAGE_THRESHOLDS[5];
    const advanced = checkStageTransition(state);
    expect(advanced).toBe(true);
    expect(state.stage).toBe(5);
  });

  it('does not advance beyond stage 5', () => {
    const state = createInitialState();
    state.stage = 5;
    state.totalPixelsEarned = 999999;
    const advanced = checkStageTransition(state);
    expect(advanced).toBe(false);
    expect(state.stage).toBe(5);
  });

  it('does not skip stages', () => {
    const state = createInitialState();
    state.totalPixelsEarned = STAGE_THRESHOLDS[3] * 10;
    const advanced = checkStageTransition(state);
    expect(advanced).toBe(true);
    expect(state.stage).toBe(2);
  });

  it('checkMilestones returns reached milestones', () => {
    const state = createInitialState();
    state.totalPixelsEarned = 15;
    const reached = checkMilestones(state);
    expect(reached).toContain('cellGrow');
    expect(reached).toContain('firstCytoplasm');
    expect(reached).toContain('membraneWobble');
  });

  it('checkMilestones does not return already-reached milestones', () => {
    const state = createInitialState();
    state.totalPixelsEarned = 15;
    checkMilestones(state);
    const reached2 = checkMilestones(state);
    expect(reached2.length).toBe(0);
  });
});
