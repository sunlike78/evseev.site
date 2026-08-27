// src/game/drops/powerupCatalog.js

export const POWERUPS = {
  BIO_LASER: {
    id: 'BIO_LASER',
    label: 'Bio-Laser',
    subtext: 'Auto-burns cell nuclei at 25Hz',
    icon: '⚡',
    capsuleColor: '#00f0ff',
    glowColor: '0, 240, 255',
    rarity: 'rare',
    duration: 8.0, // seconds
    collectionRadius: 42,
  },

  MITOSIS_NOVA: {
    id: 'MITOSIS_NOVA',
    label: 'Mitosis Nova',
    subtext: 'Splits all colony cells & bursts spores',
    icon: '💥',
    capsuleColor: '#ff2d78',
    glowColor: '255, 45, 120',
    rarity: 'epic',
    instant: true,
    collectionRadius: 44,
  },

  SPORE_VORTEX: {
    id: 'SPORE_VORTEX',
    label: 'Spore Vortex',
    subtext: 'Black hole vacuums all spores with 5x value',
    icon: '🧲',
    capsuleColor: '#b464ff',
    glowColor: '180, 100, 255',
    rarity: 'epic',
    duration: 4.0,
    collectionRadius: 45,
  },

  DNA_MUTAGEN: {
    id: 'DNA_MUTAGEN',
    label: 'DNA Mutagen',
    subtext: '+1 Genome DNA token + 15x Jackpot',
    icon: '🧬',
    capsuleColor: '#00ff88',
    glowColor: '0, 255, 136',
    rarity: 'legendary',
    instant: true,
    collectionRadius: 44,
  },

  HYPER_FRENZY: {
    id: 'HYPER_FRENZY',
    label: 'Hyper-Frenzy',
    subtext: 'All production x10 for 10s',
    icon: '⏱️',
    capsuleColor: '#ffd700',
    glowColor: '255, 215, 0',
    rarity: 'legendary',
    duration: 10.0,
    collectionRadius: 46,
  },

  GOLDEN_CASCADE: {
    id: 'GOLDEN_CASCADE',
    label: 'Golden Cascade',
    subtext: 'Rains 12 golden biomass orbs into bank',
    icon: '✦',
    capsuleColor: '#ff9900',
    glowColor: '255, 153, 0',
    rarity: 'rare',
    instant: true,
    collectionRadius: 42,
  },
};

export const DROP_TABLE = [
  { id: 'BIO_LASER', weight: 22 },
  { id: 'MITOSIS_NOVA', weight: 20 },
  { id: 'GOLDEN_CASCADE', weight: 22 },
  { id: 'SPORE_VORTEX', weight: 16 },
  { id: 'DNA_MUTAGEN', weight: 12 },
  { id: 'HYPER_FRENZY', weight: 8 },
];

export function getRandomPowerup() {
  const total = DROP_TABLE.reduce((sum, item) => sum + item.weight, 0);
  let roll = Math.random() * total;
  for (const item of DROP_TABLE) {
    if (roll < item.weight) return POWERUPS[item.id];
    roll -= item.weight;
  }
  return POWERUPS.BIO_LASER;
}
