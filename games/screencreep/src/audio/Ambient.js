// src/audio/Ambient.js
import { BiomassDroneEngine } from './BiomassDroneEngine.js';

export function createAmbient(soundEngine) {
  let droneEngine = null;
  let heartbeatOsc = null;
  let heartbeatGain = null;
  let running = false;
  let lastProgress = -1;
  let lastStage = -1;
  let lastUpdateTime = 0;

  function startHeartbeat(ctx, output) {
    heartbeatOsc = ctx.createOscillator();
    heartbeatOsc.type = 'sine';
    heartbeatOsc.frequency.value = 40;

    heartbeatGain = ctx.createGain();
    heartbeatGain.gain.value = 0.02;

    heartbeatOsc.connect(heartbeatGain);
    heartbeatGain.connect(output);
    heartbeatOsc.start();
  }

  return {
    start() {
      const ctx = soundEngine.getContext();
      const output = soundEngine.getOutput();
      if (!ctx || !output || running) return;
      running = true;

      droneEngine = new BiomassDroneEngine(soundEngine);
      droneEngine.start();
      startHeartbeat(ctx, output);
    },

    stop() {
      running = false;
      if (heartbeatOsc) {
        try { heartbeatOsc.stop(); heartbeatOsc.disconnect(); } catch (_) {}
        heartbeatOsc = null;
      }
      if (heartbeatGain) {
        try { heartbeatGain.disconnect(); } catch (_) {}
        heartbeatGain = null;
      }
      if (droneEngine) {
        droneEngine.stop();
        droneEngine = null;
      }
    },

    update(progress, stage = 1) {
      const now = performance.now();
      // Throttle updates to at most once per 1000ms unless stage changes
      if (now - lastUpdateTime < 1000 && Math.abs(progress - lastProgress) < 0.03 && stage === lastStage) {
        return;
      }
      lastUpdateTime = now;
      lastProgress = progress;
      lastStage = stage;

      if (droneEngine) {
        droneEngine.setStage(stage, progress);
      }
      if (heartbeatGain) {
        heartbeatGain.gain.value = 0.02 + progress * 0.04;
      }
      if (heartbeatOsc) {
        heartbeatOsc.frequency.value = 40 + progress * 15;
      }
    },
  };
}
