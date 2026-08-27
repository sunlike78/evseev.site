// src/audio/BiomassDroneEngine.js
export class BiomassDroneEngine {
  constructor(soundEngine) {
    this.soundEngine = soundEngine;
    this.running = false;

    this.stageChords = [
      [55.0],                                // Stage 0/1: Primitive Sub Drone (A1)
      [55.0, 110.0],                         // Stage 2: Octave emergence (A1, A2)
      [55.0, 82.41, 110.0],                  // Stage 3: Minor 5th (A1, E2, A2)
      [55.0, 82.41, 110.0, 146.83],          // Stage 4: Organic 4th chord (A1, E2, A2, D3)
      [55.0, 82.41, 123.47, 164.81, 246.94], // Stage 5: Cosmic Apex Cyber-Lydian (A1, E2, B2, E3, B3)
    ];

    this.oscillators = [];
    this.masterGain = null;
    this.filter = null;
    this.currentStage = 0;
  }

  start() {
    if (this.running) return;
    const ctx = this.soundEngine.getContext();
    const out = this.soundEngine.getOutput();
    if (!ctx || !out || ctx.state === 'suspended') return;
    const now = ctx.currentTime;

    this.masterGain = ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.001, now);
    this.masterGain.gain.linearRampToValueAtTime(0.06, now + 2.0);

    this.filter = ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.setValueAtTime(140, now);
    this.filter.Q.value = 2.0;

    // Binaural Theta Beat (42Hz Left / 43.5Hz Right)
    const binauralL = ctx.createOscillator();
    const binauralR = ctx.createOscillator();
    binauralL.frequency.value = 42.0;
    binauralR.frequency.value = 43.5;

    binauralL.connect(this.filter);
    binauralR.connect(this.filter);

    binauralL.start(now);
    binauralR.start(now);
    this.oscillators.push({ osc: binauralL }, { osc: binauralR });

    // Generative chord oscillators
    const apexChords = this.stageChords[4];
    apexChords.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(idx === 0 ? 0.2 : 0.0, now);

      osc.connect(gain);
      gain.connect(this.filter);
      osc.start(now);

      this.oscillators.push({ osc, gain, baseFreq: freq, idx });
    });

    this.filter.connect(this.masterGain);
    this.masterGain.connect(out);
    this.running = true;
  }

  stop() {
    if (!this.running) return;
    this.running = false;
    for (const item of this.oscillators) {
      try {
        if (item.osc) { item.osc.stop(); item.osc.disconnect(); }
        if (item.gain) { item.gain.disconnect(); }
      } catch (_) {}
    }
    this.oscillators = [];
    try {
      if (this.filter) this.filter.disconnect();
      if (this.masterGain) this.masterGain.disconnect();
    } catch (_) {}
    this.filter = null;
    this.masterGain = null;
  }

  setStage(stageIndex, progress = 0.0) {
    if (!this.running) return;
    const ctx = this.soundEngine.getContext();
    if (!ctx || ctx.state === 'suspended') return;

    this.currentStage = Math.max(1, Math.min(5, stageIndex));
    const now = ctx.currentTime;

    const targetCutoff = 120 + this.currentStage * 100 + progress * 50;
    this.filter.frequency.setValueAtTime(targetCutoff, now);

    this.oscillators.forEach((item) => {
      if (!item.gain) return;
      const activeInStage = item.idx <= Math.min(this.currentStage - 1, 4);
      const targetGain = activeInStage ? (0.18 / (item.idx + 1)) : 0.0;
      item.gain.gain.setValueAtTime(targetGain, now);
    });
  }
}
