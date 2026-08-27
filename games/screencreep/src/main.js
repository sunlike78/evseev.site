// src/main.js
import { createInitialState, calcOfflinePixels } from './game/GameState.js';
import { addRawPixels, calculateClick, formatNumber } from './game/Resources.js';
import { setupClickHandler } from './game/ClickHandler.js';
import { checkStageTransition, checkMilestones, STAGE_THRESHOLDS } from './stages/StageManager.js';
import { createComboTracker } from './game/ComboTracker.js';
import { createTrapManager } from './game/TrapCell.js';
import { createCystManager } from './game/CystSystem.js';
import { createDecayTracker } from './game/DecaySystem.js';
import { checkMutationReveals, generateSessionDNA } from './game/SessionDNA.js';
import { createInfector } from './meta/DOMInfector.js';
import { activateBreach, updateBreachSize } from './meta/FrameBreaker.js';
import { initRenderEngine } from './rendering/engine/RenderEngine.js';
import {
  initOrganismScene, initOrganismData, getOrganismScene,
  updateOrganismScene, hitTestScene, onSceneClick,
  triggerSceneDivision, triggerSceneBreachSequence,
  addSceneTendril, addSceneWeb, recenterScene,
  setSceneStage, getSceneTendrils, getSceneCells,
  spawnSceneSpore, resolveSceneHit, tryPluckScene,
} from './rendering/OrganismScene.js';
import { createUIPanel } from './ui/UIPanel.js';
import { createFloatingNumbers } from './ui/FloatingNumbers.js';
import { createToastSystem } from './ui/AchievementToast.js';
import { createGoldenSpore } from './meta/GoldenSpore.js';
import { saveGame, loadGame } from './save/SaveManager.js';
import { initAds } from './monetization/MonetizationManager.js';
import { createSoundEngine } from './audio/SoundEngine.js';
import { createSFX } from './audio/SFX.js';
import { createAmbient } from './audio/Ambient.js';
import { initI18n, t } from './i18n/i18n.js';
import { createLanguageSwitcher } from './ui/LanguageSwitcher.js';
import { createClickTexts } from './ui/ClickTexts.js';
import { createDropSystem } from './game/drops/DropSystem.js';
import { createPowerupManager } from './game/drops/PowerupManager.js';
import { createFeverManager } from './game/fever/FeverManager.js';

// i18n
await initI18n();

// DOM Elements
const container = document.getElementById('game-container');
const uiPanelEl = document.getElementById('ui-panel');
const adSlotEl = document.getElementById('ad-slot');
const muteBtn = document.getElementById('mute-btn');

// Init PixiJS Application
const { app, layers, canvas: pixiCanvas } = await initRenderEngine(container);

// Fullscreen Overlay Canvas for UI effects
const overlayCanvas = document.createElement('canvas');
overlayCanvas.id = 'overlay-canvas';
overlayCanvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:90;';
document.body.appendChild(overlayCanvas);
const ctx = overlayCanvas.getContext('2d');

// State
const saved = loadGame();
const state = saved || createInitialState();
if (!state.milestones) state.milestones = {};
if (!state.sessionDNA) state.sessionDNA = generateSessionDNA();
if (!state.dnaUpgrades) state.dnaUpgrades = {};
if (!state.whisperArchive) state.whisperArchive = [];
if (!state.sacrifices) state.sacrifices = {};

// Offline earnings
if (saved) {
  const offlineEarned = calcOfflinePixels(state);
  if (offlineEarned > 0) addRawPixels(state, offlineEarned);
}
state.lastSaveTime = Date.now();

// Audio
const soundEngine = createSoundEngine();
const sfx = createSFX(soundEngine);
const ambient = createAmbient(soundEngine);

let audioStarted = false;
function ensureAudio() {
  if (audioStarted) return;
  audioStarted = true;
  soundEngine.init();
  ambient.start();
}

// Mute button
if (muteBtn) {
  muteBtn.addEventListener('click', () => {
    ensureAudio();
    soundEngine.toggleMute();
    muteBtn.textContent = soundEngine.isMuted() ? t('sound.off') : t('sound.on');
  });
}

// Subsystems
const comboTracker = createComboTracker();
const trapManager = createTrapManager();
const cystManager = createCystManager();
const decayTracker = createDecayTracker();
const floatingNumbers = createFloatingNumbers();
const toasts = createToastSystem();
const goldenSpore = createGoldenSpore();
const clickTexts = createClickTexts(state);
const dropSystem = createDropSystem();
const powerupManager = createPowerupManager();
const feverManager = createFeverManager();
let consecutivePowerups = 0;

window.state = state;
window.dropSystem = dropSystem;
window.powerupManager = powerupManager;
window.feverManager = feverManager;

let breachActivated = false;
let gameTime = 0;
let clickStreak = 0;
let lastClickTime = 0;
let lastAutoSave = Date.now();
const infector = createInfector();
let lastInfectionTime = 0;
const INFECTION_INTERVAL = 5;

// Lightweight 2D Canvas Shockwave System
const shockwaves = [];
function addShockwave(screenX, screenY, maxRadius = 140, color = '0, 255, 136') {
  shockwaves.push({ x: screenX, y: screenY, r: 5, maxR: maxRadius, alpha: 0.85, color });
}

function updateAndRenderShockwaves(ctx, dt) {
  for (let i = shockwaves.length - 1; i >= 0; i--) {
    const sw = shockwaves[i];
    sw.r += dt * 320;
    sw.alpha -= dt * 2.0;
    if (sw.alpha <= 0 || sw.r >= sw.maxR) {
      shockwaves.splice(i, 1);
      continue;
    }
    ctx.save();
    ctx.beginPath();
    ctx.arc(sw.x, sw.y, sw.r, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${sw.color}, ${Math.max(0, sw.alpha).toFixed(2)})`;
    ctx.lineWidth = Math.max(1, 3.5 * (1 - sw.r / sw.maxR));
    ctx.stroke();
    ctx.restore();
  }
}

// Fast Pointer Tracking
let mouseX = -1;
let mouseY = -1;
let lastPointerTime = 0;
let pointerSpeed = 0;

window.addEventListener('pointermove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  const now = performance.now();
  const dt = Math.max(1, now - lastPointerTime);
  lastPointerTime = now;
  pointerSpeed = (Math.abs(e.movementX) + Math.abs(e.movementY)) / dt * 1000;
}, { passive: true });

// Sporulation Reset Handler
function onSporulate(result) {
  toasts.show(`REBORN! +${result.earnedDNA} DNA (Seed: ${result.seed})`, '#ffd700');
  initOrganismData(canvasW() / 2, canvasH() / 2, 0);
  trapManager.clear();
  cystManager.clear();
  comboTracker.reset();
  breachActivated = false;
  pixiCanvas.removeAttribute('style');
  container.classList.remove('breached');
  container.removeAttribute('style');
  resizeCanvases();
  recenterScene(canvasW() / 2, canvasH() / 2);
  saveGame(state);
}

const uiPanel = createUIPanel(uiPanelEl, state, sfx, onSporulate);
createLanguageSwitcher(() => uiPanel.forceUpdate());
initAds(adSlotEl);

// Stage 4 UI Cannibalism (Eating the Ad Slot)
if (adSlotEl) {
  adSlotEl.addEventListener('click', () => {
    if (state.stage >= 4) {
      ensureAudio();
      sfx.splat();
      sfx.critChord();
      addRawPixels(state, 250);
      floatingNumbers.add(adSlotEl.offsetLeft + 100, adSlotEl.offsetTop + 40, 250, { isCrit: true, burstMult: 2 });
      toasts.show('AD DIGESTED! +250 px', '#ccff00');
      addShockwave(adSlotEl.offsetLeft + 100, adSlotEl.offsetTop + 40, 160, '204, 255, 0');
      adSlotEl.style.transform = 'scale(0.95)';
      setTimeout(() => { adSlotEl.style.transform = 'scale(1)'; }, 150);
    }
  });
}

// Canvas sizing
let lastRendererW = 0;
let lastRendererH = 0;

function resizeCanvases() {
  if (overlayCanvas.width !== window.innerWidth || overlayCanvas.height !== window.innerHeight) {
    overlayCanvas.width = window.innerWidth;
    overlayCanvas.height = window.innerHeight;
  }

  let w, h;
  if (state.stage >= 4) {
    w = window.innerWidth;
    h = window.innerHeight;
  } else {
    const rect = breachActivated
      ? pixiCanvas.getBoundingClientRect()
      : container.getBoundingClientRect();
    w = Math.round(rect.width);
    h = Math.round(rect.height);
  }

  if (w > 0 && h > 0 && (w !== lastRendererW || h !== lastRendererH)) {
    lastRendererW = w;
    lastRendererH = h;
    app.renderer.resize(w, h);
  }
}
resizeCanvases();
window.addEventListener('resize', resizeCanvases);

// Init organism scene
initOrganismScene(layers);
initOrganismData(app.screen.width / 2, app.screen.height / 2, state.totalPixelsEarned < 20 ? 0 : 1);

// Apply current stage environment on startup
setSceneStage(state.stage, canvasW(), canvasH());
if (state.stage === 3) {
  breachActivated = true;
  activateBreach(container, pixiCanvas);
  resizeCanvases();
  recenterScene(canvasW() / 2, canvasH() / 2);
} else if (state.stage >= 4) {
  breachActivated = false;
  pixiCanvas.removeAttribute('style');
  pixiCanvas.style.display = 'block';
  pixiCanvas.style.width = '100%';
  pixiCanvas.style.height = '100%';
  container.classList.remove('breached');
  container.removeAttribute('style');
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.left = '0';
  container.style.width = '100vw';
  container.style.height = '100vh';
  container.style.border = 'none';
  container.style.borderRadius = '0';
  container.style.overflow = 'hidden';
  container.style.zIndex = '20';
  setTimeout(() => {
    resizeCanvases();
    recenterScene(window.innerWidth / 2, window.innerHeight / 2);
  }, 50);
}

// Effective auto rate with all multipliers & mutations & sacrifices & power-ups
function getEffectiveAutoRate() {
  const base = state.autoClickRate || 0;
  const organ = state.organMultiplier || 1;
  const global = (state.globalMultiplier || 1) * (state.sacrificeMultiplier || 1);
  const activeBonus = goldenSpore.getActiveBonus();
  const frenzy = activeBonus?.type === 'frenzy' ? (activeBonus.multiplier || 5) : 1;
  const powerupMult = powerupManager.getIncomeMultiplier();
  const feverMult = feverManager.getIncomeMultiplier();

  let rate = base * organ * global * frenzy * powerupMult * feverMult;

  if (state.sessionDNA?.activeMutations?.includes('rapid_mitosis')) rate *= 1.5;
  if (state.sessionDNA?.activeMutations?.includes('cell_rot')) rate *= 0.6;
  if (state.sessionDNA?.activeMutations?.includes('neural_bloom')) rate *= 1.5;

  return rate;
}

let consecutiveMisses = 0;

// Click handler (Instant pointerdown & click dispatch with tactile zone physics and Arkanoid drops)
setupClickHandler(pixiCanvas, state, (localX, localY, screenX, screenY) => {
  ensureAudio();

  // 1. Check Falling Bio-Capsule Collection (Arkanoid Pill Catch)
  const caughtDrop = dropSystem.tryCollect(screenX, screenY);
  if (caughtDrop) {
    consecutivePowerups++;
    sfx.playPentatonicNote(consecutivePowerups % 8);
    addShockwave(screenX, screenY, 150, '0, 240, 255');
    powerupManager.activate(caughtDrop.powerup, {
      state,
      onNova: () => {
        for (let i = 0; i < 4; i++) triggerSceneDivision(null, state.totalPixelsEarned);
        spawnSceneSpore(localX, localY, 12);
        sfx.splat();
      },
      onCascade: () => {
        feverManager.spawnCascade(screenX, screenY, Math.max(200, (state.clickYield || 1) * 45), window.innerWidth - 120, 80);
      },
      addRawPixels,
      toasts,
      sfx,
    });
    return;
  }

  // 2. Golden Spore click
  const sporeResult = goldenSpore.tryClick(screenX, screenY, state) || goldenSpore.tryClick(localX, localY, state);
  if (sporeResult) {
    consecutiveMisses = 0;
    if (sporeResult.type === 'lucky') {
      addRawPixels(state, sporeResult.amount);
      floatingNumbers.add(screenX, screenY - 30, sporeResult.amount, { isCrit: true, burstMult: 1 });
    }
    toasts.show(sporeResult.message, '#ffd700');
    sfx.crystalPing(1200, 0.7);
    sfx.upgradePop();
    addShockwave(screenX, screenY, 150, '255, 215, 0');
    clickTexts.onClick(screenX, screenY, {
      stage: state.stage, streak: 0,
      isGoldenSpore: true, comboCount: 0, totalPixelsEarned: state.totalPixelsEarned,
    });
    return;
  }

  // 3. Cyst Parasite click (Prioritized over cell)
  const cystResult = cystManager.tryClick(localX, localY);
  if (cystResult) {
    consecutiveMisses = 0;
    sfx.squelch(1.4, true);
    if (cystResult.burst) {
      addRawPixels(state, cystResult.returnedBiomass);
      sfx.critChord();
      sfx.crystalPing(1400, 0.8);
      floatingNumbers.add(screenX, screenY - 30, cystResult.returnedBiomass, { isCrit: true, burstMult: 2.5 });
      toasts.show(t('ui.cyst_burst', { n: cystResult.returnedBiomass }), '#00ff88');
      addShockwave(screenX, screenY, 160, '0, 255, 136');

      // 100% Guaranteed Bio-Capsule Drop from Cyst Burst!
      dropSystem.spawn(screenX, screenY);

      if (cystResult.droppedDNA) {
        state.dnaPoints = (state.dnaPoints || 0) + 1;
        toasts.show('+1 GENOME DNA TOKEN!', '#ffd700');
      }
    }
    return;
  }

  // 4. Trap / Hazard Cell click
  const trapResult = trapManager.tryClick(localX, localY, state);
  if (trapResult) {
    consecutiveMisses = 0;
    sfx.hazardBuzz();
    container.classList.add('hazard-shake');
    setTimeout(() => container.classList.remove('hazard-shake'), 300);
    floatingNumbers.add(screenX, screenY, trapResult.penalty, { isPenalty: true });
    toasts.show(t('ui.trap_hit', { n: trapResult.penalty }), '#ff4444');
    clickStreak = 0;
    return;
  }

  // 5. Tendril & Web string pluck interaction
  const pluckResult = tryPluckScene(localX, localY);
  if (pluckResult) {
    consecutiveMisses = 0;
    const noteFreq = 220 + ((pluckResult.index || 0) % 6) * 55;
    sfx.tendrilPluck(noteFreq);
    spawnSceneSpore(localX, localY, 3);
    addShockwave(screenX, screenY, 120, '0, 255, 180');
    const pluckGain = Math.max(1, Math.round(calculateClick(state, 1.2, null).value * 1.5));
    addRawPixels(state, pluckGain);
    floatingNumbers.add(screenX, screenY, pluckGain, { isPluck: true });
    return;
  }

  // 6. Unified Cell Zone Classification (Nucleus 3.0x / Cytoplasm 1.0x / Membrane 0.5x / Void 0x)
  const hitResult = resolveSceneHit(localX, localY);

  if (!hitResult) {
    // VOID / MISS CLICK: 0 biomass, subtle dull thud, consecutive miss combo drop
    consecutiveMisses++;
    sfx.thud();
    addShockwave(screenX, screenY, 35, '120, 100, 160');
    if (consecutiveMisses >= 2) {
      clickStreak = 0;
    }
    return;
  }

  // VALID CELL HIT
  consecutiveMisses = 0;
  decayTracker.registerClick();
  const comboMult = comboTracker.registerClick(gameTime);
  const activeBonus = goldenSpore.getActiveBonus();

  const clickCalc = calculateClick(state, comboMult, activeBonus);
  const zoneMult = hitResult.mult || 1.0;
  const powerupClickMult = powerupManager.getIncomeMultiplier();
  const feverClickMult = feverManager.getIncomeMultiplier();
  const finalValue = Math.max(1, Math.round(clickCalc.value * zoneMult * powerupClickMult * feverClickMult));
  addRawPixels(state, finalValue);

  // Check Peggle Extreme Fever trigger on high CPS / Combo!
  if (comboTracker.getCPS() >= 8) {
    feverManager.tryTrigger({
      reason: 'comboX8',
      originX: screenX,
      originY: screenY,
      onStart: () => sfx.feverFanfare(),
      sfx,
    });
  }

  // ASMR Audio, VFX and Haptics per zone
  if (hitResult.zone === 'nucleus') {
    // PERFECT BULLSEYE HIT (+300%)
    sfx.critChord();
    sfx.crystalPing(1300, 0.85);
    addShockwave(screenX, screenY, 160, '0, 240, 255');
    onSceneClick(localX, localY, true);
    spawnSceneSpore(localX, localY, 6);
    floatingNumbers.add(screenX, screenY, finalValue, { isCrit: true, burstMult: 3.0 });
    clickStreak += 2;

    // 18% Chance to spawn a physical falling Bio-Capsule on Nucleus Crit!
    if (Math.random() < 0.18) {
      dropSystem.spawn(screenX, screenY);
    }
  } else if (hitResult.zone === 'cytoplasm') {
    // NORMAL BODY SQUISH (+100%)
    sfx.squelch(comboMult);
    sfx.playComboTone(Math.floor(comboTracker.getCPS()));
    addShockwave(screenX, screenY, 90, '0, 255, 136');
    onSceneClick(localX, localY, false);
    spawnSceneSpore(localX, localY, 2);
    floatingNumbers.add(screenX, screenY, finalValue, { isCrit: false });
    clickStreak++;
  } else {
    // GLANCING MEMBRANE EDGE (+50%)
    sfx.waterDrop();
    addShockwave(screenX, screenY, 60, '80, 200, 220');
    onSceneClick(localX, localY, false);
    spawnSceneSpore(localX, localY, 1);
    floatingNumbers.add(screenX, screenY, finalValue, { isGlance: true });
  }

  lastClickTime = Date.now();

  // Rare emotional reward texts in screen space
  clickTexts.onClick(screenX, screenY, {
    stage: state.stage, streak: clickStreak,
    isGoldenSpore: false, comboCount: Math.floor(comboTracker.getCPS()), totalPixelsEarned: state.totalPixelsEarned,
  });

  // Cell division from upgrade
  let cellsPerClick = state.cellsPerClick || 0;
  if (state.sessionDNA?.activeMutations?.includes('slow_division')) {
    cellsPerClick = Math.min(1, cellsPerClick);
  }
  if (cellsPerClick > 0) {
    for (let i = 0; i < Math.min(cellsPerClick, 3); i++) {
      triggerSceneDivision(null, state.totalPixelsEarned);
    }
  }
});

// Container growth (Stage 2)
let lastContainerSize = 0;
let lastBreachInt = -1;

function updateContainerSize() {
  if (state.stage >= 2 && state.stage < 4 && !breachActivated) {
    const isMobile = window.innerWidth <= 768;
    const baseSize = isMobile ? Math.min(320, window.innerWidth * 0.86) : 480;
    const growth = isMobile ? 40 : 120;
    const progress = Math.min(1, state.totalPixelsEarned / STAGE_THRESHOLDS[3]);
    const size = Math.round(baseSize + progress * growth);
    if (size !== lastContainerSize) {
      lastContainerSize = size;
      container.style.width = size + 'px';
      container.style.height = size + 'px';
      resizeCanvases();
      recenterScene(canvasW() / 2, canvasH() / 2);
    }
  }
}

// Stage names for i18n
const STAGE_KEYS = ['', 'seed', 'growth', 'breach', 'takeover', 'domination'];

// Milestone handlers
const milestoneActions = {
  cellGrow() {},
  firstCytoplasm() { sfx.waterDrop(); },
  membraneWobble() { sfx.waterDrop(); },
  cyanCell() { triggerSceneDivision(180, state.totalPixelsEarned); sfx.bubblePop(); },
  purpleOrganelle() { triggerSceneDivision(280, state.totalPixelsEarned); sfx.bubblePop(); },
  membraneBridges() { sfx.bubblePop(); },
  goldOrganelle() { triggerSceneDivision(45, state.totalPixelsEarned); sfx.bubblePop(); },
  firstTendril() {
    addSceneTendril();
    sfx.splat();
  },
  backgroundShift() { sfx.crack(); addSceneWeb(); },
  halfViewport() { sfx.membraneTear(); addSceneWeb(); addSceneTendril(); },
  firstNeural() { sfx.critChord(); addSceneTendril(); },
  apexForm() { sfx.membraneTear(); addSceneWeb(); },
};

let lastDivisionPixels = 0;
const DIVISION_INTERVAL = 8;

const canvasW = () => app.screen.width;
const canvasH = () => app.screen.height;

let pettingTimer = 0;
let lastTitleUpdate = 0;

// Master Ticker with Death-Spiral Guard (Opus 5 Architecture Spec)
app.ticker.add((ticker) => {
  const rawDt = typeof ticker === 'number' ? (ticker / 60) : (ticker?.deltaTime ? ticker.deltaTime / 60 : 1 / 60);
  const dt = Math.min(0.05, Math.max(0.001, rawDt));

  stepSimulation(dt);
  renderFrame(dt);
});

function stepSimulation(dt) {
  gameTime += dt;

  // Auto-click income
  const effectiveRate = getEffectiveAutoRate();
  if (effectiveRate > 0) {
    addRawPixels(state, effectiveRate * dt);
  }

  // Decay system
  decayTracker.update(dt, state);

  // Combo system update
  comboTracker.update(gameTime);

  // Check Mutation reveals
  const newMutations = checkMutationReveals(state);
  for (const mut of newMutations) {
    toasts.show(`MUTATION: ${t(mut.nameKey)}`, mut.type === 'positive' ? '#00ff88' : (mut.type === 'negative' ? '#ff4444' : '#b464ff'));
    if (audioStarted) {
      sfx.waterDrop();
      sfx.crystalPing(1100, 0.6);
    }
  }

  // Cell division based on pixel progress
  const divisionsSinceLast = Math.floor(state.totalPixelsEarned / DIVISION_INTERVAL) - Math.floor(lastDivisionPixels / DIVISION_INTERVAL);
  if (divisionsSinceLast > 0) {
    const cells = getSceneCells();
    const maxCells = 25;
    if (cells.length < maxCells) {
      for (let i = 0; i < Math.min(divisionsSinceLast, 3); i++) {
        triggerSceneDivision(null, state.totalPixelsEarned);
        if (audioStarted) sfx.bubblePop();
      }
    }
  }
  lastDivisionPixels = state.totalPixelsEarned;

  // Stage transition
  const advanced = checkStageTransition(state);
  if (advanced) onStageAdvance();

  // Milestones
  const reached = checkMilestones(state);
  for (const name of reached) {
    if (milestoneActions[name]) {
      try { milestoneActions[name](); } catch (e) { console.error('Milestone error:', e); }
    }
    const displayName = t(`milestone.${name}`);
    toasts.show(t('ui.achievement', { name: displayName }), '#00ff88');
    const rect = pixiCanvas.getBoundingClientRect();
    addShockwave(rect.left + rect.width / 2, rect.top + rect.height / 2, 180, '0, 255, 136');
  }

  // Update Trap cells
  trapManager.update(dt, state.stage, () => {
    const cells = getSceneCells();
    if (cells.length === 0) return { x: canvasW() / 2, y: canvasH() / 2, radius: 40 };
    let cx = 0, cy = 0;
    for (const c of cells) { cx += c.x; cy += c.y; }
    return { x: cx / cells.length, y: cy / cells.length, radius: 40 + cells.length * 2, canvasW: canvasW(), canvasH: canvasH() };
  });

  // Update Cysts
  cystManager.update(dt, state.stage, effectiveRate, canvasW(), canvasH());

  // Throttled Petting Audio & pointer calculation
  let localPX = -1;
  let localPY = -1;
  if (mouseX > 0 && mouseY > 0) {
    const rect = pixiCanvas.getBoundingClientRect();
    localPX = mouseX - rect.left;
    localPY = mouseY - rect.top;

    pettingTimer += dt;
    if (pettingTimer > 0.08) {
      pettingTimer = 0;
      if (audioStarted && localPX >= 0 && localPX <= rect.width && localPY >= 0 && localPY <= rect.height) {
        const isOver = hitTestScene(localPX, localPY);
        sfx.updatePetting(pointerSpeed, isOver ? 1.0 : 0.0);
      }
    }
  }

  // Update Pixi organism scene
  updateOrganismScene(
    dt,
    gameTime,
    canvasW(),
    canvasH(),
    state.sessionDNA,
    trapManager.getTraps(),
    cystManager.getCysts(),
    localPX,
    localPY,
    (x, y, val) => {
      addRawPixels(state, val);
      if (audioStarted) sfx.waterDrop();
    }
  );

  updateContainerSize();
  floatingNumbers.update(dt);
  toasts.update(dt);
  clickTexts.update(dt);
  goldenSpore.update(dt, window.innerWidth, window.innerHeight, state);

  // Update Falling Bio-Capsules
  dropSystem.update(dt, window.innerHeight);

  // Update Powerup Manager (Laser beams, buff timers)
  powerupManager.update(dt, {
    pointerX: localPX,
    pointerY: localPY,
    cells: getSceneCells(),
    triggerLaserHit: (tx, ty) => {
      decayTracker.registerClick();
      const clickCalc = calculateClick(state, 1.5, null);
      const laserValue = Math.max(1, Math.round(clickCalc.value * 0.35));
      addRawPixels(state, laserValue);
      if (audioStarted) sfx.crystalPing(1800, 0.35);
      spawnSceneSpore(tx, ty, 1);
      onSceneClick(tx, ty, true);
    },
  });

  // Update Extreme Fever Manager & Golden Cascades
  feverManager.update(dt, {
    onCollectOrb: (amount, ox, oy) => {
      addRawPixels(state, amount);
      floatingNumbers.add(ox, oy, amount, { isCrit: true });
      if (audioStarted) sfx.bubblePop();
    },
  });

  // Stage 4+ infection
  if (state.stage >= 4) {
    lastInfectionTime += dt;
    if (lastInfectionTime >= INFECTION_INTERVAL) {
      lastInfectionTime = 0;
      const infected = infector.infectNext();
      if (infected && audioStarted) sfx.splat();
    }
  }

  // Breach expansion
  if (breachActivated && state.stage < 5) {
    const breachProgress = Math.min(1,
      (state.totalPixelsEarned - STAGE_THRESHOLDS[3]) / (STAGE_THRESHOLDS[3] * 3));
    const breachInt = Math.round(breachProgress * 300);
    if (breachInt !== lastBreachInt) {
      lastBreachInt = breachInt;
      updateBreachSize(container, pixiCanvas, breachProgress);
      resizeCanvases();
    }
  }

  // Ambient update with stage & binaural drone
  if (audioStarted) {
    const maxPixels = STAGE_THRESHOLDS[5] || 20000;
    ambient.update(Math.min(1, state.totalPixelsEarned / maxPixels), state.stage);
  }

  // Living Tab (Breathing document.title)
  if (gameTime - lastTitleUpdate > 0.8) {
    lastTitleUpdate = gameTime;
    const activeBonus = goldenSpore.getActiveBonus();
    if (activeBonus?.type === 'frenzy') {
      document.title = `⚡ FRENZY! [${formatNumber(state.pixels)} px]`;
    } else if (feverManager.isActive()) {
      document.title = `🌟 EXTREME FEVER! [${formatNumber(state.pixels)} px]`;
    } else if (state.stage >= 4) {
      document.title = `👁️ ASSIMILATING... [${formatNumber(state.pixels)} px]`;
    } else if (state.stage === 3) {
      document.title = `☣️ BREACH ACTIVE [${formatNumber(state.pixels)} px]`;
    } else {
      document.title = `🧬 ScreenCreep [${formatNumber(state.pixels)} px]`;
    }
  }

  // Auto-save
  if (Date.now() - lastAutoSave > 30000) {
    saveGame(state);
    lastAutoSave = Date.now();
  }
}

function renderFrame(dt) {
  // -------------------------------------------------------------
  // 2D Fullscreen Overlay Canvas Rendering in same master tick
  // -------------------------------------------------------------
  ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

  updateAndRenderShockwaves(ctx, dt);
  goldenSpore.render(ctx);

  // Render Arkanoid Falling Bio-Capsules, Laser Beams, HUD Buff Bar, and Extreme Fever
  dropSystem.render(ctx);
  powerupManager.renderLaserBeam(ctx, mouseX, mouseY);
  powerupManager.renderHUD(ctx, overlayCanvas.width, overlayCanvas.height);
  feverManager.render(ctx, overlayCanvas.width, overlayCanvas.height);

  floatingNumbers.render(ctx);
  toasts.render(ctx, overlayCanvas.width);
  clickTexts.render(ctx);

  // Bonus HUD (Frenzy / Storm)
  const bonus = goldenSpore.getActiveBonus();
  if (bonus) {
    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'center';
    if (bonus.type === 'frenzy') {
      ctx.fillStyle = `rgba(255, 215, 0, ${0.8 + 0.2 * Math.sin(gameTime * 6)})`;
      ctx.fillText(t('ui.frenzy', { mult: bonus.multiplier, time: Math.ceil(bonus.timeLeft) }), overlayCanvas.width / 2, 24);
    } else if (bonus.type === 'clickStorm') {
      ctx.fillStyle = `rgba(100, 220, 255, ${0.8 + 0.2 * Math.sin(gameTime * 8)})`;
      ctx.fillText(t('ui.storm', { mult: bonus.stormMultiplier, time: Math.ceil(bonus.timeLeft) }), overlayCanvas.width / 2, 24);
    }
  }

  // Combo Meter HUD at Bottom Left
  const comboMult = comboTracker.getMultiplier();
  if (comboMult > 1.0) {
    const label = comboTracker.getLabel();
    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = comboMult >= 2.2 ? '#ff5500' : (comboMult >= 1.5 ? '#ffbb00' : '#00ff88');
    ctx.fillText(`⚡ COMBO ${label} (${comboTracker.getCPS().toFixed(1)} CPS)`, 20, overlayCanvas.height - 20);
  }

  uiPanel.update();
}

function onStageAdvance() {
  try {
    toasts.show(t('ui.stage_format', { n: state.stage, name: t(`stage.${STAGE_KEYS[state.stage]}`) }), '#ffcc00');
    setSceneStage(state.stage, canvasW(), canvasH());
    const rect = pixiCanvas.getBoundingClientRect();
    addShockwave(rect.left + rect.width / 2, rect.top + rect.height / 2, 220, '255, 204, 0');

    // Trigger Peggle Extreme Fever Fanfare on Stage advance!
    feverManager.tryTrigger({
      reason: 'stageClear',
      originX: window.innerWidth / 2,
      originY: window.innerHeight / 2,
      onStart: () => sfx.feverFanfare(),
      sfx,
    });

    if (state.stage === 3 && !breachActivated) {
      breachActivated = true;
      activateBreach(container, pixiCanvas);
      resizeCanvases();
      recenterScene(canvasW() / 2, canvasH() / 2);
      triggerSceneBreachSequence(canvasW(), canvasH());
      if (audioStarted) {
        sfx.crack();
        setTimeout(() => sfx.membraneTear(), 300);
      }
    }
    if (state.stage >= 4) {
      breachActivated = false;
      pixiCanvas.removeAttribute('style');
      pixiCanvas.style.display = 'block';
      pixiCanvas.style.width = '100%';
      pixiCanvas.style.height = '100%';
      container.classList.remove('breached');
      container.removeAttribute('style');
      container.style.position = 'fixed';
      container.style.top = '0';
      container.style.left = '0';
      container.style.width = '100vw';
      container.style.height = '100vh';
      container.style.border = 'none';
      container.style.borderRadius = '0';
      container.style.overflow = 'hidden';
      container.style.zIndex = '20';
      if (state.stage === 4) infector.refresh();
      setTimeout(() => {
        resizeCanvases();
        recenterScene(window.innerWidth / 2, window.innerHeight / 2);
      }, 50);
      if (audioStarted) sfx.membraneTear();
    }
    saveGame(state);
  } catch (err) {
    console.error('Error in onStageAdvance:', err);
  }
}

// -------------------------------------------------------------
// SECRET EASTER EGGS & DEVTOOLS ARG
// -------------------------------------------------------------
const konamiSeq = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let konamiIdx = 0;
let gattacaBuf = '';

window.addEventListener('keydown', (e) => {
  ensureAudio();

  // 1. Konami Code
  if (e.key === konamiSeq[konamiIdx] || e.key.toLowerCase() === konamiSeq[konamiIdx]) {
    konamiIdx++;
    if (konamiIdx === konamiSeq.length) {
      konamiIdx = 0;
      sfx.retroFanfare();
      const rect = pixiCanvas.getBoundingClientRect();
      addShockwave(rect.left + rect.width / 2, rect.top + rect.height / 2, 240, '204, 255, 0');
      toasts.show(t('ui.easter_konami'), '#ccff00');
      addRawPixels(state, 1000);
    }
  } else {
    konamiIdx = 0;
  }

  // 2. GATTACA sequence
  gattacaBuf = (gattacaBuf + e.key.toLowerCase()).slice(-7);
  if (gattacaBuf === 'gattaca') {
    gattacaBuf = '';
    sfx.critChord();
    sfx.crystalPing(1600, 0.9);
    toasts.show(t('ui.easter_gattaca'), '#ffd700');
    for (let i = 0; i < 10; i++) {
      spawnSceneSpore(Math.random() * canvasW(), Math.random() * canvasH(), 5);
    }
    const rect = pixiCanvas.getBoundingClientRect();
    addShockwave(rect.left + rect.width / 2, rect.top + rect.height / 2, 200, '255, 215, 0');
  }

  // Debug Hotkeys
  if (e.key === '1') { addRawPixels(state, 50); }
  if (e.key === '2') { addRawPixels(state, 500); }
  if (e.key === '3') { addRawPixels(state, 5000); }
  if (e.key === '4') { addRawPixels(state, 50000); }
  if (e.key === '0') {
    localStorage.removeItem('screencreep_save');
    location.reload();
  }
});

// Console Diagnostics & Commands
console.log(
  `%c[SCREENCREEP BIOHAZARD SPECIMEN v2.0]\n%cSpecimen tissue active in memory.\nType feed("glucose") or mutate() in console.`,
  'color: #00ff88; font-weight: bold; font-size: 14px;',
  'color: #94a3b8; font-family: monospace;'
);

window.feed = (nutrient = 'glucose') => {
  ensureAudio();
  sfx.waterDrop();
  addRawPixels(state, 500);
  toasts.show(`Fed ${nutrient}! +500 px`, '#00ff88');
  return `Specimen digested ${nutrient}. Biomass increased by 500 px.`;
};

window.mutate = () => {
  ensureAudio();
  sfx.bubblePop();
  triggerSceneDivision(Math.random() * 360, state.totalPixelsEarned);
  return 'Cellular mutation forced!';
};

window.state = state;
window.uiPanel = uiPanel;
window.dropSystem = dropSystem;
window.powerupManager = powerupManager;
window.feverManager = feverManager;
