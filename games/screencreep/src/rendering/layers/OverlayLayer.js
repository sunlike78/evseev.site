// src/rendering/layers/OverlayLayer.js
import { Container, BlurFilter } from 'pixi.js';

export class OverlayLayer extends Container {
  constructor() {
    super();
  }

  applyDepthBlur(backgroundContainer, amount = 1.5) {
    if (backgroundContainer) {
      const blur = new BlurFilter({ strength: amount, quality: 1 });
      backgroundContainer.filters = [blur];
    }
  }

  applyDeepBlur(deepContainer, amount = 1.0) {
    if (deepContainer) {
      const blur = new BlurFilter({ strength: amount, quality: 1 });
      deepContainer.filters = [blur];
    }
  }

  applyMidBlur(midContainer, amount = 0.5) {
    if (midContainer) {
      const blur = new BlurFilter({ strength: amount, quality: 1 });
      midContainer.filters = [blur];
    }
  }
}
