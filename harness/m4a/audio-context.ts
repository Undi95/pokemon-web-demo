/**
 * Singleton AudioContext partagé pour tout le M4A engine.
 *
 * Web Audio interdit la création/resume d'AudioContext sans user gesture
 * (autoplay policy). Notre BootScene appelle `primeAudio()` au premier click
 * — on hooke `getAudioContext()` à ce primer.
 */

let _ctx: AudioContext | null = null;
let _masterGain: GainNode | null = null;
let _reverbNode: { dry: GainNode; wet: GainNode; delay: DelayNode; feedback: GainNode } | null = null;
// Gain d'arbitrage multi-instance (audio-arbiter.ts) : dernier étage avant
// destination, coupé quand UNE AUTRE instance du jeu a pris le focus.
let _arbiterGain: GainNode | null = null;
let _arbiterMuted = false;
// Sortie du moteur NATIF : gain dédié → arbiterGain, SANS traverser l'étage
// shim (dacFilter ×2 + reverb WebAudio + limiter) — le moteur 1:1 fait déjà
// DAC (ZOH 13379 Hz), reverb (SoundMainRAM) et saturation (clip hardware
// ±0x200 dans le processor). 🩸 payé : double reverb + double lowpass.
let _nativeOut: GainNode | null = null;
let _masterVolume = 1.0;

/** Initialise (ou retourne) l'AudioContext singleton. À appeler après un user gesture. */
export function getAudioContext(): AudioContext {
  if (_ctx) {
    if (_ctx.state === 'suspended') void _ctx.resume();
    return _ctx;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Ctor: typeof AudioContext = (window.AudioContext || (window as any).webkitAudioContext);
  if (!Ctor) throw new Error('Web Audio API not supported in this browser');
  _ctx = new Ctor();
  _masterGain = _ctx.createGain();
  _masterGain.gain.value = 1.0;

  // GBA DAC simulation 1:1 hardware :
  //   SOUND_MODE_FREQ_13379 = 13 379 Hz (default GBA mixer rate)
  //   Nyquist = 13 379 / 2 ≈ 6 690 Hz
  //   → tout au-dessus de ~6.7 kHz est aliasé/filtré par le DAC.
  // Notre Web Audio rate = 48 000 Hz (8x plus propre). Pour matcher le grain
  // « vintage » : double cascade de biquads à 6 500 Hz (= -12 dB/oct devient
  // -24 dB/oct, plus proche d'un brick-wall analog DAC).
  const dacFilter = _ctx.createBiquadFilter();
  dacFilter.type = 'lowpass';
  dacFilter.frequency.value = 6500;
  dacFilter.Q.value = 0.7071;             // Butterworth flat
  const dacFilter2 = _ctx.createBiquadFilter();
  dacFilter2.type = 'lowpass';
  dacFilter2.frequency.value = 6500;
  dacFilter2.Q.value = 0.7071;
  _masterGain.connect(dacFilter);
  dacFilter.connect(dacFilter2);

  // Reverb chain 1:1 décomp m4a_1.s SoundMainRAM_Reverb :
  //   simple delay 1 frame (16.74ms à 59.7275Hz V-blank) + feedback gain (reverb/256)
  //   formule asm : output = (sample_now + sample_prev) × reverb >> 9
  //   = ~50% mix + ~25% gain effectif
  // Routing : masterGain → dacFilter → dacFilter2 → [dry + (delay→feedback→delay)] → limiter → destination
  const dry = _ctx.createGain();
  const wet = _ctx.createGain();
  const delay = _ctx.createDelay(0.1);
  const feedback = _ctx.createGain();
  // Defaults : reverb level ~50 (typical Pokemon Emerald)
  delay.delayTime.value = 1 / 59.7275;  // V-blank GBA exact (cf. m4a.c:409)
  feedback.gain.value = 50 / 256;       // ~20% feedback
  wet.gain.value = 0.4;                  // wet/dry mix
  dry.gain.value = 1.0;

  // Master limiter (DynamicsCompressorNode) : absorbe les peaks SE + BGM combinés
  // qui sinon clip à ±1.0 en sortie destination → distortion entendue comme
  // "ticks". Réglages limiter strict : ratio élevé, attack rapide, threshold haut.
  const limiter = _ctx.createDynamicsCompressor();
  limiter.threshold.value = -3;     // dB : commence à comprimer au-dessus de -3 dB
  limiter.knee.value = 0;           // dB : hard knee (= comportement limiter strict)
  limiter.ratio.value = 20;         // 20:1 = quasi-limiter
  limiter.attack.value = 0.001;     // 1 ms : très rapide pour capturer les transients
  limiter.release.value = 0.05;     // 50 ms : retour rapide pour pas tasser le mix

  dacFilter2.connect(dry);
  dry.connect(limiter);
  dacFilter2.connect(delay);
  delay.connect(feedback);
  feedback.connect(delay);    // feedback loop
  delay.connect(wet);
  wet.connect(limiter);
  _arbiterGain = _ctx.createGain();
  _arbiterGain.gain.value = _arbiterMuted ? 0 : 1;
  limiter.connect(_arbiterGain);
  _arbiterGain.connect(_ctx.destination);

  _reverbNode = { dry, wet, delay, feedback };
  return _ctx;
}

/** Mute/unmute d'arbitrage multi-instance (audio-arbiter.ts). Indépendant du
 *  master volume du jeu ; l'état survit si l'AudioContext n'existe pas encore. */
export function setArbiterMuted(muted: boolean): void {
  _arbiterMuted = muted;
  if (!_arbiterGain || !_ctx) return;
  // Rampe courte anti-clic.
  _arbiterGain.gain.cancelScheduledValues(_ctx.currentTime);
  _arbiterGain.gain.setTargetAtTime(muted ? 0 : 1, _ctx.currentTime, 0.02);
}

/** Set reverb value (0-127, 1:1 décomp `m4aSoundMode(songHeader->reverb)`).
 *  0 = no reverb, 50 = default Pokemon Emerald, 90 = strong. */
export function setReverb(value: number): void {
  if (!_reverbNode) getAudioContext();
  if (!_reverbNode) return;
  const v = Math.max(0, Math.min(127, value));
  _reverbNode.feedback.gain.value = v / 256;
  _reverbNode.wet.gain.value = v > 0 ? 0.4 : 0;
}

/** Master gain node — toutes les voices doivent se connecter ici (pas direct destination). */
export function getMasterGain(): GainNode {
  if (!_masterGain) getAudioContext();
  return _masterGain!;
}

/** Prime audio context : await resume + play silent buffer pour warm-up DAC.
 *  Évite le "PTCH" + garbage au 1er SE après reload (= AudioContext suspended
 *  glitch quand on schedule un buffer pendant qu'il se réveille). À call après
 *  user gesture (= dans m4aPrime). */
export async function primeAudioContext(): Promise<void> {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    try { await ctx.resume(); } catch { /* ignore */ }
  }
  // Play a tiny silent buffer (= 50ms) to flush DAC warmup + ensure pipeline OK
  const silentBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.05), ctx.sampleRate);
  // (channel data already zero-init = silence)
  const src = ctx.createBufferSource();
  src.buffer = silentBuf;
  src.connect(ctx.destination);
  src.start();
  await new Promise(r => setTimeout(r, 60));
}

/** Volume master 0.0 - 1.0 (s'applique au shim ET à la sortie native). */
export function setMasterVolume(v: number): void {
  if (!_masterGain) getAudioContext();
  _masterVolume = Math.max(0, Math.min(1, v));
  _masterGain!.gain.value = _masterVolume;
  if (_nativeOut) _nativeOut.gain.value = _masterVolume;
}

/** Currently primed ? */
export function isAudioReady(): boolean {
  return _ctx !== null && _ctx.state === 'running';
}

/** Point de branchement du worklet natif : gain volume → arbiterGain →
 *  destination (bypass complet de l'étage shim, cf. bandeau _nativeOut). */
export function getNativeOut(): GainNode {
  const ctx = getAudioContext();
  if (!_nativeOut) {
    _nativeOut = ctx.createGain();
    _nativeOut.gain.value = _masterVolume;
    _nativeOut.connect(_arbiterGain!);
  }
  return _nativeOut;
}

/** État du graphe de sortie pour le devtool audio (diagnostic live). */
export function getAudioDebugState(): {
  ctxState: string; sampleRate: number; masterVolume: number; arbiterGain: number; arbiterMuted: boolean;
} {
  return {
    ctxState: _ctx ? _ctx.state : 'non créé',
    sampleRate: _ctx ? _ctx.sampleRate : 0,
    masterVolume: _masterVolume,
    arbiterGain: _arbiterGain ? _arbiterGain.gain.value : -1,
    arbiterMuted: _arbiterMuted,
  };
}
