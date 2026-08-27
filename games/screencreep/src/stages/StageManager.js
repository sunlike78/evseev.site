// src/stages/StageManager.js
export const STAGE_THRESHOLDS = {
  2: 20,
  3: 250,
  4: 5000,
  5: 20000,
};

export const MILESTONES = {
  cellGrow: 5,
  firstCytoplasm: 10,
  membraneWobble: 15,
  cyanCell: 30,
  purpleOrganelle: 60,
  membraneBridges: 100,
  goldOrganelle: 150,
  firstTendril: 300,
  backgroundShift: 500,
  halfViewport: 1000,
  firstNeural: 3000,
  apexForm: 15000,
};

const MAX_STAGE = 5;

export function checkStageTransition(state) {
  const nextStage = state.stage + 1;
  if (nextStage > MAX_STAGE) return false;
  const threshold = STAGE_THRESHOLDS[nextStage];
  if (threshold === undefined) return false;
  if (state.totalPixelsEarned >= threshold) {
    state.stage = nextStage;
    return true;
  }
  return false;
}

export function checkMilestones(state) {
  const reached = [];
  for (const [name, threshold] of Object.entries(MILESTONES)) {
    if (state.totalPixelsEarned >= threshold && !state.milestones[name]) {
      state.milestones[name] = true;
      reached.push(name);
    }
  }
  return reached;
}
