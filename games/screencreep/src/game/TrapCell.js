// src/game/TrapCell.js

export const TRAP_CONFIG = {
  minStage: 2,
  spawnInterval: {
    2: [15, 25],
    3: [10, 20],
    4: [8, 15],
    5: [6, 12],
  },
  maxActive: {
    2: 1,
    3: 2,
    4: 3,
    5: 4,
  },
  lifetime: [8, 14],
  warningTime: 1.5,
  penaltyPercent: {
    2: [0.10, 0.15],
    3: [0.12, 0.20],
    4: [0.15, 0.22],
    5: [0.15, 0.25],
  },
  hardCap: 0.25,
  minPenalty: 2,
};

export function calcTrapPenalty(state, stage) {
  const range = TRAP_CONFIG.penaltyPercent[stage] || [0.10, 0.15];
  const [minPct, maxPct] = range;
  const pct = minPct + Math.random() * (maxPct - minPct);
  let rawPenalty = Math.floor((state.pixels || 0) * pct);
  rawPenalty = Math.min(rawPenalty, Math.floor((state.pixels || 0) * TRAP_CONFIG.hardCap));

  // Membrane upgrade reduction (15% per level)
  const membraneLevel = state.upgrades?.membrane || 0;
  const membraneReduction = Math.max(0, 1 - membraneLevel * 0.15);

  // DNA upgrade reduction (resilientMembrane: 10% per level)
  const dnaResilientLevel = state.dnaUpgrades?.resilientMembrane || 0;
  const dnaReduction = Math.max(0, 1 - dnaResilientLevel * 0.10);

  const finalPenalty = Math.floor(rawPenalty * membraneReduction * dnaReduction);
  return Math.max(TRAP_CONFIG.minPenalty, finalPenalty);
}

export function createTrapManager() {
  const traps = [];
  let nextSpawnTimer = 10 + Math.random() * 10;
  let trapIdCounter = 0;

  function getRandomSpawnInterval(stage) {
    const [min, max] = TRAP_CONFIG.spawnInterval[stage] || [15, 25];
    return min + Math.random() * (max - min);
  }

  function getRandomLifetime() {
    const [min, max] = TRAP_CONFIG.lifetime;
    return min + Math.random() * (max - min);
  }

  return {
    getTraps() {
      return traps;
    },

    spawnTrap(x, y, radius = 16, stage = 2) {
      const trap = {
        id: ++trapIdCounter,
        x,
        y,
        radius,
        age: 0,
        lifetime: getRandomLifetime(),
        warningDuration: TRAP_CONFIG.warningTime,
        isWarning: true,
        phase: Math.random() * Math.PI * 2,
        pulseSpeed: 4.0,
      };
      traps.push(trap);
      return trap;
    },

    update(dt, stage, getColonyCenter) {
      if (stage < TRAP_CONFIG.minStage) {
        traps.length = 0;
        return;
      }

      // Update existing traps
      for (let i = traps.length - 1; i >= 0; i--) {
        const trap = traps[i];
        trap.age += dt;
        trap.isWarning = trap.age < trap.warningDuration;

        if (trap.age >= trap.lifetime) {
          traps.splice(i, 1);
        }
      }

      // Spawn timer
      nextSpawnTimer -= dt;
      const maxAllowed = TRAP_CONFIG.maxActive[stage] || 1;
      if (nextSpawnTimer <= 0 && traps.length < maxAllowed) {
        nextSpawnTimer = getRandomSpawnInterval(stage);
        const center = getColonyCenter ? getColonyCenter() : { x: 100, y: 100, radius: 50 };
        const angle = Math.random() * Math.PI * 2;
        const dist = 20 + Math.random() * (center.radius || 40);
        const spawnX = center.x + Math.cos(angle) * dist;
        const spawnY = center.y + Math.sin(angle) * dist;
        const margin = 30;
        const maxW = center.canvasW || 200;
        const maxH = center.canvasH || 200;
        const clampedX = Math.max(margin, Math.min(maxW - margin, spawnX));
        const clampedY = Math.max(margin, Math.min(maxH - margin, spawnY));
        this.spawnTrap(clampedX, clampedY, 11 + Math.random() * 3, stage);
      }
    },

    tryClick(x, y, state) {
      for (let i = traps.length - 1; i >= 0; i--) {
        const trap = traps[i];
        const dx = x - trap.x;
        const dy = y - trap.y;
        const hitRadius = trap.radius * 1.3;
        if (dx * dx + dy * dy <= hitRadius * hitRadius) {
          // If clicked during warning phase or active phase:
          const penalty = calcTrapPenalty(state, state.stage || 2);
          const actualLost = Math.min(state.pixels || 0, penalty);
          state.pixels = Math.max(0, (state.pixels || 0) - actualLost);
          traps.splice(i, 1);
          return {
            hit: true,
            penalty: actualLost,
            x: trap.x,
            y: trap.y,
            wasWarning: trap.isWarning,
          };
        }
      }
      return null;
    },

    clear() {
      traps.length = 0;
      nextSpawnTimer = 10;
    },
  };
}
