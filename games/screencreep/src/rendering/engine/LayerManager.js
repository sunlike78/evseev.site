// src/rendering/engine/LayerManager.js
import { Container } from 'pixi.js';

const LAYER_NAMES = ['background', 'deep', 'mid', 'main', 'front', 'overlay', 'ui'];

export function createLayerManager(stage) {
  const layers = {};

  for (const name of LAYER_NAMES) {
    const container = new Container();
    container.label = name;
    layers[name] = container;
    stage.addChild(container);
  }

  return {
    get(name) { return layers[name]; },
    all() { return layers; },
    names: LAYER_NAMES,
  };
}
