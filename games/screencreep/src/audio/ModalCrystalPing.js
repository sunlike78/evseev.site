// src/audio/ModalCrystalPing.js
export class ModalCrystalPing {
  constructor(audioCtx, masterOutput) {
    this.ctx = audioCtx;
    this.output = masterOutput;
    this.lastPlayTime = 0;
  }

  play(fundamental = 880, intensity = 0.5) {
    const ctx = this.ctx;
    if (!ctx || ctx.state === 'suspended') return;
    const now = ctx.currentTime;
    if (now - this.lastPlayTime < 0.05) return;
    this.lastPlayTime = now;

    // 2-tone clean inharmonic chime
    const freqs = [fundamental, fundamental * 2.76];
    const amps = [intensity * 0.3, intensity * 0.12];

    freqs.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now);

      gain.gain.setValueAtTime(amps[idx], now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (idx === 0 ? 0.35 : 0.2));

      osc.connect(gain);
      gain.connect(this.output);

      osc.start(now);
      osc.stop(now + 0.36);
    });
  }
}
