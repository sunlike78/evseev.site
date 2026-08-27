// src/audio/OrganismPurrEngine.js
export class OrganismPurrEngine {
  constructor(soundEngine) {
    this.soundEngine = soundEngine;
    this.carrier = null;
    this.modulator = null;
    this.modGain = null;
    this.gain = null;
    this.filter = null;
    this.active = false;
    this.lastProximity = 0;
    this.lastGain = 0;
  }

  start() {
    if (this.active) return;
    const ctx = this.soundEngine.getContext();
    const out = this.soundEngine.getOutput();
    if (!ctx || !out || ctx.state === 'suspended') return;
    const now = ctx.currentTime;

    this.carrier = ctx.createOscillator();
    this.modulator = ctx.createOscillator();
    this.modGain = ctx.createGain();
    this.gain = ctx.createGain();
    this.filter = ctx.createBiquadFilter();

    this.carrier.type = 'triangle';
    this.carrier.frequency.value = 46.0;

    this.modulator.type = 'sine';
    this.modulator.frequency.value = 24.0;

    this.modGain.gain.value = 28.0;
    this.filter.type = 'lowpass';
    this.filter.frequency.value = 220;
    this.filter.Q.value = 3.0;

    this.gain.gain.setValueAtTime(0.0001, now);

    this.modulator.connect(this.modGain);
    this.modGain.connect(this.carrier.frequency);
    this.carrier.connect(this.filter);
    this.filter.connect(this.gain);
    this.gain.connect(out);

    this.carrier.start(now);
    this.modulator.start(now);
    this.active = true;
  }

  updatePetting(velocity, proximity) {
    const ctx = this.soundEngine.getContext();
    if (!ctx || this.soundEngine.isMuted() || ctx.state === 'suspended') return;
    if (!this.active && proximity > 0.1) this.start();
    if (!this.active) return;

    const now = ctx.currentTime;
    const speed = Math.min(1.0, velocity / 500);
    const targetGain = proximity > 0.1 ? (0.02 + speed * 0.14) * proximity : 0.0001;

    // Skip redundant updates if gain hasn't changed noticeably
    if (Math.abs(targetGain - this.lastGain) < 0.001 && proximity === this.lastProximity) return;
    this.lastGain = targetGain;
    this.lastProximity = proximity;

    const targetPitch = 46 + speed * 25;
    const targetFlutter = 22 + speed * 12;

    this.gain.gain.setTargetAtTime(targetGain, now, 0.05);
    if (proximity > 0.1) {
      this.carrier.frequency.setTargetAtTime(targetPitch, now, 0.05);
      this.modulator.frequency.setTargetAtTime(targetFlutter, now, 0.05);
      this.filter.frequency.setTargetAtTime(180 + speed * 300, now, 0.05);
    }
  }
}
