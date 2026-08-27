import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSoundEngine } from '../src/audio/SoundEngine.js';

describe('SoundEngine', () => {
  let engine;

  beforeEach(() => {
    globalThis.AudioContext = vi.fn(() => ({
      createGain: () => ({ gain: { value: 0 }, connect: vi.fn() }),
      destination: {},
      sampleRate: 44100,
      currentTime: 0,
      createBuffer: vi.fn(() => ({ getChannelData: () => new Float32Array(100) })),
      createBufferSource: vi.fn(() => ({ connect: vi.fn(), start: vi.fn(), buffer: null })),
      createBiquadFilter: vi.fn(() => ({ connect: vi.fn(), frequency: { value: 0 }, Q: { value: 0 }, type: '' })),
      createOscillator: vi.fn(() => ({ connect: vi.fn(), start: vi.fn(), stop: vi.fn(), frequency: { value: 0, setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() }, type: '' })),
    }));
    engine = createSoundEngine();
  });

  it('creates with default volume 0.5 and unmuted', () => {
    expect(engine.getVolume()).toBe(0.5);
    expect(engine.isMuted()).toBe(false);
  });

  it('setVolume clamps to 0-1', () => {
    engine.setVolume(1.5);
    expect(engine.getVolume()).toBe(1);
    engine.setVolume(-0.5);
    expect(engine.getVolume()).toBe(0);
  });

  it('toggleMute flips mute state', () => {
    engine.toggleMute();
    expect(engine.isMuted()).toBe(true);
    engine.toggleMute();
    expect(engine.isMuted()).toBe(false);
  });

  it('getContext returns null before init', () => {
    expect(engine.getContext()).toBe(null);
  });

  it('init creates AudioContext', () => {
    engine.init();
    expect(engine.getContext()).not.toBe(null);
  });
});
