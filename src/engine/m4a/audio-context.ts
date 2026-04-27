/**
 * Singleton AudioContext partagé pour tout le M4A engine.
 *
 * Web Audio interdit la création/resume d'AudioContext sans user gesture
 * (autoplay policy). Notre BootScene appelle `primeAudio()` au premier click
 * — on hooke `getAudioContext()` à ce primer.
 */

let _ctx: AudioContext | null = null;
let _masterGain: GainNode | null = null;

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
  _masterGain.gain.value = 1.0;  // 0 dB plein volume (clipping évité par velocity scaling)
  _masterGain.connect(_ctx.destination);
  return _ctx;
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
