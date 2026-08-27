// src/game/SessionDNA.js

export const MUTATION_POOL = {
  // Positive (+)
  rapid_mitosis: {
    id: 'rapid_mitosis',
    type: 'positive',
    revealAt: 0,
    nameKey: 'mutation.rapid_mitosis.name',
    descKey: 'mutation.rapid_mitosis.desc',
  },
  golden_age: {
    id: 'golden_age',
    type: 'positive',
    revealAt: 50,
    nameKey: 'mutation.golden_age.name',
    descKey: 'mutation.golden_age.desc',
  },
  thick_membrane: {
    id: 'thick_membrane',
    type: 'positive',
    revealAt: 100,
    nameKey: 'mutation.thick_membrane.name',
    descKey: 'mutation.thick_membrane.desc',
  },
  hyper_click: {
    id: 'hyper_click',
    type: 'positive',
    revealAt: 0,
    nameKey: 'mutation.hyper_click.name',
    descKey: 'mutation.hyper_click.desc',
  },
  neural_bloom: {
    id: 'neural_bloom',
    type: 'positive',
    revealAt: 300,
    nameKey: 'mutation.neural_bloom.name',
    descKey: 'mutation.neural_bloom.desc',
  },
  spore_feast: {
    id: 'spore_feast',
    type: 'positive',
    revealAt: 200,
    nameKey: 'mutation.spore_feast.name',
    descKey: 'mutation.spore_feast.desc',
  },

  // Negative (-)
  cell_rot: {
    id: 'cell_rot',
    type: 'negative',
    revealAt: 30,
    nameKey: 'mutation.cell_rot.name',
    descKey: 'mutation.cell_rot.desc',
  },
  brittle_walls: {
    id: 'brittle_walls',
    type: 'negative',
    revealAt: 40,
    nameKey: 'mutation.brittle_walls.name',
    descKey: 'mutation.brittle_walls.desc',
  },
  spore_drought: {
    id: 'spore_drought',
    type: 'negative',
    revealAt: 80,
    nameKey: 'mutation.spore_drought.name',
    descKey: 'mutation.spore_drought.desc',
  },
  pixel_leak: {
    id: 'pixel_leak',
    type: 'negative',
    revealAt: 50,
    nameKey: 'mutation.pixel_leak.name',
    descKey: 'mutation.pixel_leak.desc',
  },
  slow_division: {
    id: 'slow_division',
    type: 'negative',
    revealAt: 150,
    nameKey: 'mutation.slow_division.name',
    descKey: 'mutation.slow_division.desc',
  },
  trap_magnet: {
    id: 'trap_magnet',
    type: 'negative',
    revealAt: 200,
    nameKey: 'mutation.trap_magnet.name',
    descKey: 'mutation.trap_magnet.desc',
  },

  // Weird / Neutral (~)
  mirror_growth: {
    id: 'mirror_growth',
    type: 'neutral',
    revealAt: 0,
    nameKey: 'mutation.mirror_growth.name',
    descKey: 'mutation.mirror_growth.desc',
  },
  pulse_economy: {
    id: 'pulse_economy',
    type: 'neutral',
    revealAt: 80,
    nameKey: 'mutation.pulse_economy.name',
    descKey: 'mutation.pulse_economy.desc',
  },
  chromatic_drift: {
    id: 'chromatic_drift',
    type: 'neutral',
    revealAt: 0,
    nameKey: 'mutation.chromatic_drift.name',
    descKey: 'mutation.chromatic_drift.desc',
  },
  silent_run: {
    id: 'silent_run',
    type: 'neutral',
    revealAt: 0,
    nameKey: 'mutation.silent_run.name',
    descKey: 'mutation.silent_run.desc',
  },
  gigantism: {
    id: 'gigantism',
    type: 'neutral',
    revealAt: 20,
    nameKey: 'mutation.gigantism.name',
    descKey: 'mutation.gigantism.desc',
  },
  echo_clicks: {
    id: 'echo_clicks',
    type: 'neutral',
    revealAt: 0,
    nameKey: 'mutation.echo_clicks.name',
    descKey: 'mutation.echo_clicks.desc',
  },
};

// Seeded Mulberry32 PRNG
function createPRNG(seed) {
  let s = seed >>> 0;
  return function () {
    let t = (s += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateSessionDNA(customSeed = null) {
  const seed = customSeed !== null ? customSeed >>> 0 : Math.floor(Math.random() * 0xffffffff);
  const prng = createPRNG(seed);

  const seedHex = seed.toString(16).toUpperCase().padStart(8, '0').slice(-4);
  const hueShift = Math.floor(prng() * 61) - 30; // -30..+30

  // 3-5 mutations
  const mutationCount = 3 + Math.floor(prng() * 3);

  const posKeys = Object.keys(MUTATION_POOL).filter((k) => MUTATION_POOL[k].type === 'positive');
  const negKeys = Object.keys(MUTATION_POOL).filter((k) => MUTATION_POOL[k].type === 'negative');
  const allKeys = Object.keys(MUTATION_POOL);

  const picked = new Set();

  // Guarantee at least 1 positive and 1 negative
  const firstPos = posKeys[Math.floor(prng() * posKeys.length)];
  picked.add(firstPos);

  const firstNeg = negKeys[Math.floor(prng() * negKeys.length)];
  picked.add(firstNeg);

  while (picked.size < mutationCount) {
    const nextKey = allKeys[Math.floor(prng() * allKeys.length)];
    picked.add(nextKey);
  }

  const mutations = Array.from(picked)
    .map((k) => ({ ...MUTATION_POOL[k] }))
    .sort((a, b) => a.revealAt - b.revealAt);

  const initialActive = mutations.filter((m) => m.revealAt === 0).map((m) => m.id);

  const sessionDNA = {
    seed,
    seedHex,
    hueShift,
    mutations,
    activeMutations: initialActive,
    revealedCount: initialActive.length,
    dnaYieldMod: 1.0,
  };

  sessionDNA.dnaYieldMod = calcDNAYieldMod(sessionDNA);
  return sessionDNA;
}

export function calcDNAYieldMod(sessionDNA) {
  if (!sessionDNA?.activeMutations) return 1.0;
  let mod = 1.0;
  for (const mutId of sessionDNA.activeMutations) {
    const def = MUTATION_POOL[mutId];
    if (def?.type === 'negative') {
      mod += 0.15; // Harder runs yield +15% DNA
    } else if (def?.type === 'positive') {
      mod -= 0.05; // Easier runs yield -5% DNA
    }
  }
  return Math.max(0.8, +mod.toFixed(2));
}

export function checkMutationReveals(state) {
  const dna = state.sessionDNA;
  if (!dna || !dna.mutations) return [];

  const newlyRevealed = [];
  const earned = state.totalPixelsEarned || 0;

  for (const mut of dna.mutations) {
    if (!dna.activeMutations.includes(mut.id)) {
      if (earned >= mut.revealAt) {
        dna.activeMutations.push(mut.id);
        dna.revealedCount++;
        newlyRevealed.push(mut);
      }
    }
  }

  if (newlyRevealed.length > 0) {
    dna.dnaYieldMod = calcDNAYieldMod(dna);
  }

  return newlyRevealed;
}

export function getRunHealthLabel(sessionDNA) {
  if (!sessionDNA?.mutations) return 'Balanced';
  const pos = sessionDNA.mutations.filter((m) => m.type === 'positive').length;
  const neg = sessionDNA.mutations.filter((m) => m.type === 'negative').length;
  const neu = sessionDNA.mutations.filter((m) => m.type === 'neutral').length;

  if (pos >= 3) return 'Thriving';
  if (neg >= 3) return 'Struggling';
  if (neu >= 2) return 'Unstable';
  return 'Balanced';
}
