// src/audio/ProceduralSlimeSynth.js
export class ProceduralSlimeSynth {
  constructor(audioCtx, masterOutput) {
    this.ctx = audioCtx;
    this.output = masterOutput;
    this.lastPlayTime = 0;
  }

  playSquelch(comboMultiplier = 1.0, isCrit = false) {
    const ctx = this.ctx;
    if (!ctx || ctx.state === 'suspended') return;
    const now = ctx.currentTime;
    if (now - this.lastPlayTime < 0.035) return; // 35ms audio throttle
    this.lastPlayTime = now;

    const pitchMod = Math.min(2.0, 1.0 + (comboMultiplier - 1) * 0.08) * (isCrit ? 1.3 : 1.0);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = isCrit ? 'triangle' : 'sine';
    const startFreq = (240 + Math.random() * 50) * pitchMod;
    const endFreq = 45 * pitchMod;

    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.09);

    const amp = isCrit ? 0.35 : 0.22;
    gain.gain.setValueAtTime(amp, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(this.output);

    osc.start(now);
    osc.stop(now + 0.1);
  }
}
