// Procedural sound effects using Web Audio API
// No external audio files needed

class SoundManager {
  constructor() {
    this.audioContext = null;
    this.masterGain = null;
    this.engineOscillator = null;
    this.engineGain = null;
    this.enabled = true;
  }

  init() {
    if (this.audioContext) return;

    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = 0.3;
      this.masterGain.connect(this.audioContext.destination);
    } catch (e) {
      console.warn('Web Audio API not supported');
      this.enabled = false;
    }
  }

  resume() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  // Engine hum - continuous low frequency with variation based on speed
  startEngine(speed = 50) {
    if (!this.enabled || !this.audioContext) return;
    this.resume();

    // Stop existing engine sound
    this.stopEngine();

    // Create oscillator for engine
    this.engineOscillator = this.audioContext.createOscillator();
    this.engineGain = this.audioContext.createGain();

    // Base frequency varies with speed
    const baseFreq = 60 + (speed * 0.3);
    this.engineOscillator.type = 'sawtooth';
    this.engineOscillator.frequency.value = baseFreq;

    // Add slight detune for richness
    this.engineOscillator.detune.value = Math.random() * 10 - 5;

    this.engineGain.gain.value = 0.08;

    this.engineOscillator.connect(this.engineGain);
    this.engineGain.connect(this.masterGain);

    this.engineOscillator.start();
  }

  updateEngine(speed, isBraking) {
    if (!this.enabled || !this.engineOscillator) return;

    // Adjust frequency based on speed
    const baseFreq = 50 + (speed * 0.4);
    this.engineOscillator.frequency.setTargetAtTime(baseFreq, this.audioContext.currentTime, 0.1);

    // Reduce volume when braking
    const targetGain = isBraking ? 0.03 : 0.08;
    this.engineGain.gain.setTargetAtTime(targetGain, this.audioContext.currentTime, 0.1);
  }

  stopEngine() {
    if (this.engineOscillator) {
      try {
        this.engineOscillator.stop();
        this.engineOscillator.disconnect();
      } catch (e) {}
      this.engineOscillator = null;
    }
    if (this.engineGain) {
      this.engineGain.disconnect();
      this.engineGain = null;
    }
  }

  // Brake screech - filtered noise burst
  playBrake() {
    if (!this.enabled || !this.audioContext) return;
    this.resume();

    const duration = 0.8;
    const now = this.audioContext.currentTime;

    // Create noise buffer
    const bufferSize = this.audioContext.sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.audioContext.createBufferSource();
    noise.buffer = buffer;

    // High-pass filter for screech
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 2000;
    filter.Q.value = 5;

    // Envelope
    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialDecayTo = 0.01;
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(now);
    noise.stop(now + duration);
  }

  // Fall whoosh - descending pitch
  playFall() {
    if (!this.enabled || !this.audioContext) return;
    this.resume();

    const duration = 1.2;
    const now = this.audioContext.currentTime;

    // Oscillator with descending pitch
    const osc = this.audioContext.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + duration);

    // Add some noise
    const bufferSize = this.audioContext.sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.audioContext.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = this.audioContext.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(1000, now);
    noiseFilter.frequency.exponentialRampToValueAtTime(100, now + duration);

    const noiseGain = this.audioContext.createGain();
    noiseGain.gain.setValueAtTime(0.1, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    const oscGain = this.audioContext.createGain();
    oscGain.gain.setValueAtTime(0.2, now);
    oscGain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    osc.connect(oscGain);
    oscGain.connect(this.masterGain);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + duration);
    noise.start(now);
    noise.stop(now + duration);
  }

  // Success chime - pleasant two-tone
  playSuccess() {
    if (!this.enabled || !this.audioContext) return;
    this.resume();

    const now = this.audioContext.currentTime;

    // First tone
    const osc1 = this.audioContext.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.value = 523.25; // C5

    const gain1 = this.audioContext.createGain();
    gain1.gain.setValueAtTime(0.2, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    osc1.connect(gain1);
    gain1.connect(this.masterGain);
    osc1.start(now);
    osc1.stop(now + 0.3);

    // Second tone (higher)
    const osc2 = this.audioContext.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.value = 659.25; // E5

    const gain2 = this.audioContext.createGain();
    gain2.gain.setValueAtTime(0.2, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

    osc2.connect(gain2);
    gain2.connect(this.masterGain);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.5);
  }

  // High score fanfare
  playHighScore() {
    if (!this.enabled || !this.audioContext) return;
    this.resume();

    const now = this.audioContext.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

    notes.forEach((freq, i) => {
      const osc = this.audioContext.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;

      const gain = this.audioContext.createGain();
      const startTime = now + i * 0.12;
      gain.gain.setValueAtTime(0.15, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(startTime);
      osc.stop(startTime + 0.4);
    });
  }

  // Click/UI sound
  playClick() {
    if (!this.enabled || !this.audioContext) return;
    this.resume();

    const now = this.audioContext.currentTime;

    const osc = this.audioContext.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 800;

    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.05);
  }

  setVolume(value) {
    if (this.masterGain) {
      this.masterGain.gain.value = value;
    }
  }

  mute() {
    this.setVolume(0);
  }

  unmute() {
    this.setVolume(0.3);
  }
}

// Singleton instance
export const soundManager = new SoundManager();
export default soundManager;
