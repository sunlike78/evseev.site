// src/game/CystSystem.js
export const CYST_CONFIG = {
  minStage: 3,
  maxActive: 4,
  siphonPercent: 0.10, // 10% CpS siphoned per cyst
  burstMultiplier: 2.5, // 250% returned on pop
  clicksToPop: 3,
  spawnIntervalMin: 25,
  spawnIntervalMax: 50,
};

let cystIdCounter = 0;

export function createCystManager() {
  const cysts = [];
  let nextSpawnTimer = 20;

  function getRandomSpawnInterval() {
    return CYST_CONFIG.spawnIntervalMin + Math.random() * (CYST_CONFIG.spawnIntervalMax - CYST_CONFIG.spawnIntervalMin);
  }

  return {
    getCysts() {
      return cysts;
    },

    spawnCyst(x, y) {
      if (cysts.length >= CYST_CONFIG.maxActive) return null;
      const cyst = {
        id: ++cystIdCounter,
        x,
        y,
        radius: 12,
        storedBiomass: 0,
        clicksLeft: CYST_CONFIG.clicksToPop,
        pulseSpeed: 2.5,
        phase: Math.random() * Math.PI * 2,
        scale: 1,
      };
      cysts.push(cyst);
      return cyst;
    },

    update(dt, stage, effectiveCpS, canvasW = 200, canvasH = 200) {
      if (stage < CYST_CONFIG.minStage) {
        cysts.length = 0;
        return;
      }

      // Siphon biomass
      if (effectiveCpS > 0 && cysts.length > 0) {
        const siphonPerCyst = (effectiveCpS * CYST_CONFIG.siphonPercent * dt);
        for (const cyst of cysts) {
          cyst.storedBiomass += siphonPerCyst;
          cyst.phase += (cyst.pulseSpeed + Math.min(3, cyst.storedBiomass * 0.01)) * dt;
          // Scale grows with stored biomass (capped at 2.0x)
          cyst.scale = 1 + Math.min(1.0, Math.log10(1 + cyst.storedBiomass / 50) * 0.5);
        }
      }

      // Spawn logic
      nextSpawnTimer -= dt;
      if (nextSpawnTimer <= 0 && cysts.length < CYST_CONFIG.maxActive) {
        nextSpawnTimer = getRandomSpawnInterval();
        const angle = Math.random() * Math.PI * 2;
        const dist = 60 + Math.random() * 50;
        const cx = canvasW / 2;
        const cy = canvasH / 2;
        const x = Math.max(25, Math.min(canvasW - 25, cx + Math.cos(angle) * dist));
        const y = Math.max(25, Math.min(canvasH - 25, cy + Math.sin(angle) * dist));
        this.spawnCyst(x, y);
      }
    },

    tryClick(x, y) {
      for (let i = cysts.length - 1; i >= 0; i--) {
        const cyst = cysts[i];
        const r = cyst.radius * cyst.scale * 1.4;
        const dx = x - cyst.x;
        const dy = y - cyst.y;
        if (dx * dx + dy * dy <= r * r) {
          cyst.clicksLeft--;
          cyst.scale *= 0.85; // Visual squash on hit

          if (cyst.clicksLeft <= 0) {
            // Burst!
            const returnedBiomass = Math.max(10, Math.floor(cyst.storedBiomass * CYST_CONFIG.burstMultiplier));
            const droppedDNA = Math.random() < 0.15 ? 1 : 0;
            cysts.splice(i, 1);
            return {
              burst: true,
              returnedBiomass,
              droppedDNA,
              x: cyst.x,
              y: cyst.y,
            };
          }

          return {
            burst: false,
            clicksLeft: cyst.clicksLeft,
            x: cyst.x,
            y: cyst.y,
          };
        }
      }
      return null;
    },

    clear() {
      cysts.length = 0;
      nextSpawnTimer = 20;
    },
  };
}
