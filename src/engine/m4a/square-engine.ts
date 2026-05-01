/**
 * Helpers GBA square wave (PSG channels 1/2) — 1:1 hardware behavior.
 *
 * Génère un square wave RAW non band-limited via AudioWorklet, pour préserver
 * l'aliasing caractéristique du DAC GBA à 13.379 kHz. Le PeriodicWave Fourier
 * 32-harmoniques précédent était propre = trop "moderne".
 *
 * Le double lowpass à 6.5 kHz dans audio-context.ts simule ensuite le filtrage
 * DAC analog pour atténuer (mais pas supprimer) les harmoniques très aigues.
 */
import { getAudioContext } from './audio-context';

let _workletLoaded = false;
let _workletLoadPromise: Promise<void> | null = null;

/** Charge le module worklet `m4a-square-processor.js` (lazy, une seule fois). */
export async function ensureSquareWorklet(): Promise<void> {
  if (_workletLoaded) return;
  if (_workletLoadPromise) return _workletLoadPromise;
  const ctx = getAudioContext();
  _workletLoadPromise = ctx.audioWorklet.addModule('/m4a-square-processor.js')
    .then(() => { _workletLoaded = true; })
    .catch((err) => {
      console.error('[m4a-square] failed to load worklet:', err);
      _workletLoadPromise = null;
      throw err;
    });
  return _workletLoadPromise;
}

/** Crée un AudioWorkletNode square pour une note CGB (channel 1 ou 2).
 *  Retourne null si le worklet n'est pas encore chargé. */
export function createSquareNode(freqHz: number, duty: number): AudioWorkletNode | null {
  if (!_workletLoaded) return null;
  const ctx = getAudioContext();
  const node = new AudioWorkletNode(ctx, 'm4a-square-processor', {
    numberOfInputs: 0,
    numberOfOutputs: 1,
    outputChannelCount: [1],
  });
  const freqParam = node.parameters.get('frequency');
  const dutyParam = node.parameters.get('duty');
  if (freqParam) freqParam.value = freqHz;
  if (dutyParam) dutyParam.value = Math.max(0.01, Math.min(0.99, duty));
  return node;
}
