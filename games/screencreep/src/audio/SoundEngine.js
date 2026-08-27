// src/audio/SoundEngine.js
// Manages the Web Audio API context and master volume/mute state.
// State is per-instance (not module-level) to allow independent instances in tests.

export function createSoundEngine() {
  let ctx = null;
  let gainNode = null;
  let volume = 0.5;
  let muted = false;

  return {
    init() {
      if (ctx) return;
      // Поддержка браузеров и тестовой среды (globalThis вместо window).
      // Используем try/catch: в тестах vi.fn с arrow-функцией не является конструктором,
      // но возвращает нужный объект при обычном вызове.
      const AC = globalThis.AudioContext || globalThis.webkitAudioContext;
      try {
        ctx = new AC();
      } catch {
        ctx = AC();
      }
      gainNode = ctx.createGain();
      gainNode.gain.value = volume;
      gainNode.connect(ctx.destination);
    },
    getContext() { return ctx; },
    getOutput() { return gainNode; },
    getVolume() { return volume; },
    isMuted() { return muted; },
    setVolume(v) {
      volume = Math.max(0, Math.min(1, v));
      if (gainNode) gainNode.gain.value = muted ? 0 : volume;
    },
    toggleMute() {
      muted = !muted;
      if (gainNode) gainNode.gain.value = muted ? 0 : volume;
    },
  };
}
