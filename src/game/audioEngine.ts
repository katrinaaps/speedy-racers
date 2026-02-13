// Synthesized audio using Web Audio API — no external files needed

let audioCtx: AudioContext | null = null;

function getAudioCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

// ==================== ENGINE SOUND ====================

let engineOsc: OscillatorNode | null = null;
let engineGain: GainNode | null = null;
let engineOsc2: OscillatorNode | null = null;
let engineRunning = false;

export function startEngine() {
  if (engineRunning) return;
  const ctx = getAudioCtx();
  if (ctx.state === "suspended") ctx.resume();

  // Main engine drone (sawtooth for gritty engine feel)
  engineOsc = ctx.createOscillator();
  engineOsc.type = "sawtooth";
  engineOsc.frequency.value = 80;

  // Secondary harmonic
  engineOsc2 = ctx.createOscillator();
  engineOsc2.type = "square";
  engineOsc2.frequency.value = 120;

  engineGain = ctx.createGain();
  engineGain.gain.value = 0.06;

  const gain2 = ctx.createGain();
  gain2.gain.value = 0.02;

  // Low-pass filter for muffled engine sound
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 600;
  filter.Q.value = 2;

  engineOsc.connect(filter);
  engineOsc2.connect(gain2);
  gain2.connect(filter);
  filter.connect(engineGain);
  engineGain.connect(ctx.destination);

  engineOsc.start();
  engineOsc2.start();
  engineRunning = true;
}

export function updateEngineSound(speed: number) {
  if (!engineOsc || !engineGain || !engineOsc2) return;
  // Map speed (0 to ~0.045) to frequency (80 to 400 Hz)
  const normalizedSpeed = Math.min(speed / 0.045, 1);
  const freq = 80 + normalizedSpeed * 320;
  engineOsc.frequency.value = freq;
  engineOsc2.frequency.value = freq * 1.5;
  // Volume increases slightly with speed
  engineGain.gain.value = 0.04 + normalizedSpeed * 0.06;
}

export function stopEngine() {
  if (engineOsc) { try { engineOsc.stop(); } catch {} engineOsc = null; }
  if (engineOsc2) { try { engineOsc2.stop(); } catch {} engineOsc2 = null; }
  engineGain = null;
  engineRunning = false;
}

// ==================== CROWD CHEER ====================

export function playCrowdCheer() {
  const ctx = getAudioCtx();
  if (ctx.state === "suspended") ctx.resume();

  const duration = 3;
  const sampleRate = ctx.sampleRate;
  const buffer = ctx.createBuffer(2, sampleRate * duration, sampleRate);

  // Generate crowd noise (filtered white noise with modulation)
  for (let channel = 0; channel < 2; channel++) {
    const data = buffer.getChannelData(channel);
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      // White noise base
      let sample = (Math.random() * 2 - 1);
      // Envelope: swell up then fade
      const envelope = Math.sin(t / duration * Math.PI) * Math.min(t * 4, 1);
      // Add some tonal "woo" elements
      sample += Math.sin(t * 800 + Math.sin(t * 3) * 200) * 0.15;
      sample += Math.sin(t * 1200 + Math.sin(t * 5) * 300) * 0.1;
      // Rhythmic clapping pattern
      const clapPhase = (t * 6) % 1;
      if (clapPhase < 0.05) {
        sample += (Math.random() * 2 - 1) * 2;
      }
      data[i] = sample * envelope * 0.15;
    }
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  // Band-pass for crowd-like frequency range
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 1500;
  filter.Q.value = 0.5;

  const gain = ctx.createGain();
  gain.gain.value = 0.4;

  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  source.start();
}

// ==================== COUNTDOWN BEEP ====================

export function playCountdownBeep(final = false) {
  const ctx = getAudioCtx();
  if (ctx.state === "suspended") ctx.resume();

  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.value = final ? 880 : 440;

  const gain = ctx.createGain();
  gain.gain.value = 0.15;
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (final ? 0.5 : 0.2));

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + (final ? 0.5 : 0.2));
}
