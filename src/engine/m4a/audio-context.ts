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

  // Reverb chain 1:1 décomp m4a_1.s SoundMainRAM_Reverb :
  //   simple delay 1 frame (16.67ms) + feedback gain (reverb/256)
  //   formule asm : output = (sample_now + sample_prev) × reverb >> 9
  //   = ~50% mix + ~25% gain effectif
  // Routing : voicesGain → masterGain → [dry + (delay→feedback→delay)] → destination
  const dry = _ctx.createGain();
  const wet = _ctx.createGain();
  const delay = _ctx.createDelay(0.1);
  const feedback = _ctx.createGain();
  // Defaults : reverb level ~50 (typical Pokemon Emerald)
  delay.delayTime.value = 1 / 60;       // 1 GBA frame
  feedback.gain.value = 50 / 256;       // ~20% feedback
  wet.gain.value = 0.4;                  // wet/dry mix
  dry.gain.value = 1.0;
  // Connect
  _masterGain.connect(dry);
  dry.connect(_ctx.destination);
  _masterGain.connect(delay);
  delay.connect(feedback);
  feedback.connect(delay);    // feedback loop
  delay.connect(wet);
  wet.connect(_ctx.destination);

  _reverbNode = { dry, wet, delay, feedback };
  return _ctx;
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

/** Volume master 0.0 - 1.0. */
export function setMasterVolume(v: number): void {
  if (!_masterGain) getAudioContext();
  _masterGain!.gain.value = Math.max(0, Math.min(1, v));
}

/** Currently primed ? */
export function isAudioReady(): boolean {
  return _ctx !== null && _ctx.state === 'running';
}
