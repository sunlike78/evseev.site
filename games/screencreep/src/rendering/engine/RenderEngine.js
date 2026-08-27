// src/rendering/engine/RenderEngine.js
import { Application } from 'pixi.js';
import { createLayerManager } from './LayerManager.js';

let app = null;
let layers = null;

export async function initRenderEngine(containerEl) {
  app = new Application();
  await app.init({
    background: 0x050510,
    resizeTo: containerEl,
    antialias: true,
    autoDensity: true,
    resolution: window.devicePixelRatio || 1,
  });

  // Replace or append canvas
  const oldCanvas = containerEl.querySelector('canvas');
  if (oldCanvas) oldCanvas.remove();
  containerEl.appendChild(app.canvas);
  app.canvas.id = 'game-canvas';

  layers = createLayerManager(app.stage);

  return { app, layers, canvas: app.canvas };
}

export function getRenderEngine() {
  return { app, layers };
}

export function resizeRenderer(width, height) {
  if (!app) return;
  app.renderer.resize(width, height);
}
