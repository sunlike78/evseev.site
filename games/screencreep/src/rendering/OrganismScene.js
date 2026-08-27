// src/rendering/OrganismScene.js
import { ColonyLayer } from './layers/ColonyLayer.js';
import { BreachLayer } from './layers/BreachLayer.js';
import { BackgroundLayer } from './layers/BackgroundLayer.js';
import { ParticleLayer } from './layers/ParticleLayer.js';
import { OverlayLayer } from './layers/OverlayLayer.js';

let colony = null;
let breach = null;
let background = null;
let particles = null;
let overlay = null;
let layers = null;
let centerX = 0;
let centerY = 0;

export function initOrganismScene(layerManager) {
  layers = layerManager;

  background = new BackgroundLayer();
  layers.get('background').addChild(background);

  colony = new ColonyLayer();
  layers.get('main').addChild(colony);

  breach = new BreachLayer();
  layers.get('mid').addChild(breach);

  particles = new ParticleLayer();
  layers.get('front').addChild(particles);

  overlay = new OverlayLayer();
  overlay.applyDepthBlur(layers.get('background'), 2);
  overlay.applyMidBlur(layers.get('mid'), 0.5);
}

export function initOrganismData(cx, cy, initialGen = 0) {
  centerX = cx;
  centerY = cy;
  if (colony) {
    colony.clear();
    const cellData = createCell(cx, cy, 22, 140, initialGen);
    colony.addCell(cellData);
  }
}

export function getOrganismScene() {
  return { colony, breach, background, particles, overlay };
}

export function updateOrganismScene(
  dt,
  gameTime,
  canvasW,
  canvasH,
  sessionDNA = null,
  trapsData = [],
  cystsData = [],
  pointerX = -1,
  pointerY = -1,
  onAbsorbSpore = null
) {
  if (colony) {
    if (trapsData) colony.syncTraps(trapsData);
    if (cystsData) colony.syncCysts(cystsData);
    colony.update(dt, gameTime, sessionDNA, canvasW, canvasH, pointerX, pointerY);
  }
  if (breach) breach.update(dt);
  if (background) background.update(dt, gameTime, canvasW, canvasH);
  if (particles) {
    particles.update(dt, canvasW, canvasH, pointerX, pointerY, onAbsorbSpore);
  }
}

export function triggerSceneShockwave(x, y, canvasW, canvasH, intensity = 0.05) {
  if (overlay && canvasW > 0 && canvasH > 0) {
    overlay.triggerShockwave(x / canvasW, y / canvasH, intensity);
  }
}

export function setSceneGlitch(intensity) {
  if (overlay) overlay.setGlitch(intensity);
}

export function spawnSceneSpore(x, y, value = 1) {
  if (particles) particles.spawnSpore(x, y, value);
}

export function hitTestScene(x, y) {
  return colony ? colony.hitTest(x, y) : false;
}

export function onSceneClick(x, y, isCrit = false) {
  if (colony) colony.pulseNearest(x, y);
  if (particles) {
    particles.emitClickBurst(x, y);
    if (isCrit) {
      particles.emitBreachBurst(x, y);
    }
  }
}

export function triggerSceneDivision(hue, totalPixelsEarned = 0) {
  if (!colony) return;
  const cells = colony.getCells();
  if (cells.length === 0 || cells.length >= 25) return;

  const parent = cells[Math.floor(Math.random() * cells.length)];
  const angle = Math.random() * Math.PI * 2;
  const spread = Math.min(cells.length * 0.5, 30);
  const dist = parent.radius * 0.9 + Math.random() * spread;
  const x = parent.x + Math.cos(angle) * dist;
  const y = parent.y + Math.sin(angle) * dist;

  const cellHue = hue !== undefined && hue !== null ? hue : parent.hue + (Math.random() - 0.5) * 25;
  const radius = Math.max(10, parent.radius * (0.85 + Math.random() * 0.15));

  let gen = 0;
  if (totalPixelsEarned >= 15000) gen = 5;
  else if (totalPixelsEarned >= 3000) gen = 4;
  else if (totalPixelsEarned >= 500) gen = 3;
  else if (totalPixelsEarned >= 100) gen = 2;
  else if (totalPixelsEarned >= 20) gen = 1;

  const newCell = createCell(x, y, radius, cellHue, gen);
  colony.addCell(newCell);

  const parentIdx = cells.indexOf(parent);
  const newIdx = cells.length;
  colony.addConnection(parentIdx, newIdx);
}

export function triggerSceneBreachSequence(canvasW, canvasH) {
  if (breach) {
    breach.addCrack(canvasW / 2, canvasH / 2, Math.min(canvasW, canvasH) * 0.4);
  }
  if (particles) {
    particles.emitBreachBurst(canvasW / 2, canvasH / 2);
  }
}

export function addSceneTendril() {
  if (breach) breach.addRandomTendril(centerX, centerY);
}

export function addSceneWeb() {
  if (breach) breach.addWeb(centerX, centerY, 80 + Math.random() * 60);
}

export function recenterScene(cx, cy) {
  centerX = cx;
  centerY = cy;
  if (colony) {
    const cells = colony.getCells();
    if (cells.length === 0) return;
    let avgX = 0, avgY = 0;
    for (const c of cells) { avgX += c.x; avgY += c.y; }
    avgX /= cells.length;
    avgY /= cells.length;
    const dx = cx - avgX;
    const dy = cy - avgY;
    for (const c of cells) { c.x += dx; c.y += dy; }
  }
}

export function setSceneStage(stage, canvasW, canvasH) {
  if (background) background.setStage(stage, canvasW, canvasH);
  if (breach) breach.setStage(stage);
}

export function getSceneTendrils() {
  return breach ? breach.getTendrils() : [];
}

export function getSceneCells() {
  return colony ? colony.getCells() : [];
}

export function resolveSceneHit(x, y) {
  return colony ? colony.resolveHit(x, y) : null;
}

export function tryPluckScene(x, y) {
  return breach ? breach.tryPluck(x, y) : null;
}

function createCell(x, y, radius = 22, hue = 140, generation = 0) {
  const cytoCount = 3 + Math.floor(Math.random() * 4);
  const cytoplasm = [];
  for (let i = 0; i < cytoCount; i++) {
    cytoplasm.push({
      angle: Math.random() * Math.PI * 2,
      dist: Math.random() * radius * 0.55,
      size: 1.5 + Math.random() * 2.5,
      speed: (Math.random() - 0.5) * 1.5,
      hueOffset: (Math.random() - 0.5) * 30,
    });
  }

  return {
    x,
    y,
    radius,
    hue,
    phase: Math.random() * Math.PI * 2,
    wobbleSpeed: 1.8 + Math.random() * 1.2,
    pulseAmount: 0,
    generation,
    cytoplasm,
    membrane: {
      thickness: 2.0,
    },
  };
}
