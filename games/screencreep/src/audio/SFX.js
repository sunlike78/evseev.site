// src/audio/SFX.js
// Procedural Web Audio API sound synthesis with shared buffers and node lifecycle cleanup
import { ProceduralSlimeSynth } from './ProceduralSlimeSynth.js';
import { ModalCrystalPing } from './ModalCrystalPing.js';
import { ComboHarmonicsQuantizer } from './ComboHarmonicsQuantizer.js';
import { OrganismPurrEngine } from './OrganismPurrEngine.js';

let sharedNoiseBuffer = null;

function getNoiseBuffer(ctx) {
  if (sharedNoiseBuffer && sharedNoiseBuffer.sampleRate === ctx.sampleRate) {
    return sharedNoiseBuffer;
  }
  const size = Math.floor(ctx.sampleRate * 0.5); // 500ms pre-allocated noise buffer
  sharedNoiseBuffer = ctx.createBuffer(1, size, ctx.sampleRate);
  const data = sharedNoiseBuffer.getChannelData(0);
  for (let i = 0; i < size; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return sharedNoiseBuffer;
}

function randomRange(min, max) {
  return min + Math.random() * (max - min);
}

function playNoiseBurst(ctx, output, duration, frequency, q) {
  const noiseBuf = getNoiseBuffer(ctx);
  const source = ctx.createBufferSource();
  source.buffer = noiseBuf;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = frequency;
  filter.Q.value = q;

  const env = ctx.createGain();
  env.gain.setValueAtTime(0.25, ctx.currentTime);
  env.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  source.connect(filter);
  filter.connect(env);
  env.connect(output);

  source.onended = () => {
    try {
      source.disconnect();
      filter.disconnect();
      env.disconnect();
    } catch (_) {}
  };

  source.start();
  source.stop(ctx.currentTime + duration);
}

function playSinePop(ctx, output, startFreq, endFreq, duration) {
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + duration);

  const env = ctx.createGain();
  env.gain.setValueAtTime(0.22, ctx.currentTime);
  env.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  osc.connect(env);
  env.connect(output);

  osc.onended = () => {
    try {
      osc.disconnect();
      env.disconnect();
    } catch (_) {}
  };

  osc.start();
  osc.stop(ctx.currentTime + duration);
}

export function createSFX(soundEngine) {
  let slimeSynth = null;
  let crystalPing = null;
  let comboHarmonics = null;
  let purrEngine = null;
  let activeVoices = 0;
  const MAX_CONCURRENT_VOICES = 12;

  function initEngines() {
    const ctx = soundEngine.getContext();
    const out = soundEngine.getOutput();
    if (ctx && out && !slimeSynth) {
      slimeSynth = new ProceduralSlimeSynth(ctx, out);
      crystalPing = new ModalCrystalPing(ctx, out);
      comboHarmonics = new ComboHarmonicsQuantizer(soundEngine);
      purrEngine = new OrganismPurrEngine(soundEngine);
    }
  }

  function play(fn) {
    const ctx = soundEngine.getContext();
    const output = soundEngine.getOutput();
    if (!ctx || !output || soundEngine.isMuted() || ctx.state === 'suspended') return;
    if (activeVoices >= MAX_CONCURRENT_VOICES) return; // Voice cap

    initEngines();
    activeVoices++;
    try {
      fn(ctx, output);
    } finally {
      setTimeout(() => { activeVoices = Math.max(0, activeVoices - 1); }, 150);
    }
  }

  return {
    squelch(comboMult = 1, isCrit = false) {
      play(() => {
        if (slimeSynth) {
          slimeSynth.playSquelch(comboMult, isCrit);
        } else {
          const pitchMod = Math.min(1.8, 1 + (comboMult - 1) * 0.35);
          playSinePop(soundEngine.getContext(), soundEngine.getOutput(), 220 * pitchMod, 60 * pitchMod, 0.08);
        }
      });
    },

    playComboTone(comboCount) {
      play(() => {
        if (comboHarmonics) comboHarmonics.playComboTone(comboCount);
      });
    },

    crystalPing(freq = 880, intensity = 0.6) {
      play(() => {
        if (crystalPing) crystalPing.play(freq, intensity);
      });
    },

    updatePetting(velocity, proximity) {
      initEngines();
      if (purrEngine) purrEngine.updatePetting(velocity, proximity);
    },

    critChord() {
      play((ctx, out) => {
        if (crystalPing) crystalPing.play(1100, 0.7);
        playSinePop(ctx, out, 550, 1100, 0.12);
        playSinePop(ctx, out, 880, 1760, 0.15);
      });
    },

    hazardBuzz() {
      play((ctx, out) => {
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(70, ctx.currentTime + 0.2);

        const env = ctx.createGain();
        env.gain.setValueAtTime(0.35, ctx.currentTime);
        env.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

        osc.connect(env);
        env.connect(out);

        osc.onended = () => {
          try { osc.disconnect(); env.disconnect(); } catch (_) {}
        };

        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      });
    },

    retroFanfare() {
      play((ctx, out) => {
        const notes = [261.63, 329.63, 392.0, 523.25, 659.25, 783.99];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          osc.type = 'square';
          osc.frequency.value = freq;
          const gain = ctx.createGain();
          const t = ctx.currentTime + idx * 0.08;
          gain.gain.setValueAtTime(0.18, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

          osc.connect(gain);
          gain.connect(out);

          osc.onended = () => {
            try { osc.disconnect(); gain.disconnect(); } catch (_) {}
          };

          osc.start(t);
          osc.stop(t + 0.15);
        });
      });
    },

    bubblePop() {
      play((ctx, out) => {
        playSinePop(ctx, out, randomRange(600, 900), randomRange(100, 200), randomRange(0.06, 0.1));
      });
    },

    waterDrop() {
      play((ctx, out) => {
        playSinePop(ctx, out, randomRange(1200, 1800), randomRange(800, 1000), 0.05);
      });
    },

    crack() {
      play((ctx, out) => {
        playNoiseBurst(ctx, out, randomRange(0.08, 0.15), randomRange(2000, 4000), 1);
      });
    },

    membraneTear() {
      play((ctx, out) => {
        playNoiseBurst(ctx, out, randomRange(0.2, 0.35), randomRange(500, 1500), 2.5);
      });
    },

    splat() {
      play((ctx, out) => {
        const dur = randomRange(0.06, 0.1);
        playNoiseBurst(ctx, out, dur, randomRange(400, 800), 3);
        playSinePop(ctx, out, randomRange(200, 400), randomRange(80, 150), dur);
      });
    },

    upgradePop() {
      play((ctx, out) => {
        playSinePop(ctx, out, 400, 800, 0.08);
      });
    },

    thud() {
      play((ctx, out) => {
        playSinePop(ctx, out, randomRange(110, 140), randomRange(45, 65), 0.07);
        playNoiseBurst(ctx, out, 0.04, 180, 1.2);
      });
    },

    tendrilPluck(freq = 320) {
      play((ctx, out) => {
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.96, ctx.currentTime + 0.18);

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = freq * 1.5;
        filter.Q.value = 3.0;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.24, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(out);

        osc.onended = () => {
          try {
            osc.disconnect();
            filter.disconnect();
            gain.disconnect();
          } catch (_) {}
        };

        osc.start();
        osc.stop(ctx.currentTime + 0.23);
      });
    },

    playPentatonicNote(step = 0) {
      play((ctx, out) => {
        const scale = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66, 1318.51];
        const freq = scale[Math.min(scale.length - 1, Math.max(0, step))];

        const osc = ctx.createOscillator();
        const harm = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        harm.type = 'triangle';
        harm.frequency.setValueAtTime(freq * 2.01, ctx.currentTime);

        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);

        osc.connect(gain);
        harm.connect(gain);
        gain.connect(out);

        osc.onended = () => {
          try {
            osc.disconnect();
            harm.disconnect();
            gain.disconnect();
          } catch (_) {}
        };

        osc.start();
        harm.start();
        osc.stop(ctx.currentTime + 0.46);
        harm.stop(ctx.currentTime + 0.46);
      });
    },

    feverFanfare() {
      play((ctx, out) => {
        const chordNotes = [261.63, 329.63, 392.0, 523.25, 659.25, 783.99, 1046.5];
        const now = ctx.currentTime;

        chordNotes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const t = now + i * 0.055;

          osc.type = i >= 4 ? 'triangle' : 'sawtooth';
          osc.frequency.setValueAtTime(freq, t);
          osc.frequency.exponentialRampToValueAtTime(freq * 1.01, t + 0.35);

          gain.gain.setValueAtTime(0, t);
          gain.gain.linearRampToValueAtTime(0.18, t + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.75);

          osc.connect(gain);
          gain.connect(out);

          osc.start(t);
          osc.stop(t + 0.8);
        });
      });
    },
  };
}
