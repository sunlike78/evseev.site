// src/audio/ComboHarmonicsQuantizer.js
export class ComboHarmonicsQuantizer {
  constructor(soundEngine) {
    this.soundEngine = soundEngine;
    // Lydian mode intervals in semitones: [Root, 2nd, 3rd, #4th, 5th, 6th, 7th]
    this.scaleSemitones = [0, 2, 4, 6, 7, 9, 11];
    this.rootFreq = 164.81; // E3 base
  }

  getStreakFrequency(comboCount) {
    const count = Math.max(1, comboCount);
    const scaleLen = this.scaleSemitones.length;
    const noteIndex = (count - 1) % scaleLen;
    const octave = Math.floor((count - 1) / scaleLen);
    const semitones = this.scaleSemitones[noteIndex] + octave * 12;
    return this.rootFreq * Math.pow(2, semitones / 12);
  }

  playComboTone(comboCount) {
    const ctx = this.soundEngine.getContext();
    const out = this.soundEngine.getOutput();
    if (!ctx || !out || this.soundEngine.isMuted() || ctx.state === 'suspended') return;

    const freq = this.getStreakFrequency(comboCount);
    const now = ctx.currentTime;

    // Primary Tone
    const osc = ctx.createOscillator();
    osc.type = comboCount > 10 ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.96, now + 0.12);

    const gain = ctx.createGain();
    const baseAmp = Math.min(0.25, 0.12 + comboCount * 0.008);
    gain.gain.setValueAtTime(baseAmp, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(gain);
    gain.connect(out);
    osc.start(now);
    osc.stop(now + 0.15);

    // 5th overtone harmonic chime for higher combos
    if (comboCount >= 4) {
      const overtone = ctx.createOscillator();
      overtone.type = 'sine';
      overtone.frequency.setValueAtTime(freq * 1.5, now);
      const otGain = ctx.createGain();
      otGain.gain.setValueAtTime(baseAmp * 0.35, now);
      otGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      overtone.connect(otGain);
      otGain.connect(out);
      overtone.start(now);
      overtone.stop(now + 0.19);
    }
  }
}
