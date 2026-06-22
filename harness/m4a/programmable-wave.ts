/**
 * Programmable wave (GBA Sound Channel 3) — 1:1 décomp.
 *
 * Chaque sample 32 points est un cycle complet de la wave shape. On convertit en
 * Web Audio `PeriodicWave` via DFT (32-point Fourier transform) pour obtenir les
 * harmoniques `real[]` / `imag[]` qui permettent à `OscillatorNode` de
 * resynthétiser la même forme à n'importe quelle fréquence.
 *
 * Cache par symbole pour éviter de recalculer la DFT à chaque note.
 */
import { PROGRAMMABLE_WAVES } from '../../src/engine/decomp-data/src/programmable-waves';
import { getAudioContext } from './audio-context';

const _periodicWaveCache = new Map<string, PeriodicWave>();

/** DFT d'un signal 32 samples → harmoniques (real[N+1], imag[N+1]).
 *  N = 16 (Nyquist du signal 32 samples = 16e harmonique).
 *  Web Audio convention : real[n] et imag[n] sont les coefficients de cos(n×θ) et sin(n×θ).
 *  PeriodicWave : `real` = composantes cosinus, `imag` = composantes sinus. */
function computeDft(samples: Float32Array): { real: Float32Array; imag: Float32Array } {
  const N = samples.length;            // 32
  const halfN = N / 2;                 // 16 harmoniques significatives (Nyquist)
  const real = new Float32Array(halfN + 1);  // index 0 = DC, 1..halfN = harmonics
  const imag = new Float32Array(halfN + 1);
  for (let k = 0; k <= halfN; k++) {
    let sumCos = 0;
    let sumSin = 0;
    for (let n = 0; n < N; n++) {
      const angle = (2 * Math.PI * k * n) / N;
      sumCos += samples[n] * Math.cos(angle);
      sumSin -= samples[n] * Math.sin(angle);  // négatif car convention Web Audio
    }
    // Normalisation : 2/N pour les harmoniques, 1/N pour DC (k=0). DC = 0 idéalement.
    const norm = k === 0 ? 1 / N : 2 / N;
    real[k] = sumCos * norm;
    imag[k] = sumSin * norm;
  }
  // Force DC à 0 (Web Audio aime mieux pas de DC offset).
  real[0] = 0;
  imag[0] = 0;
  return { real, imag };
}

/** Récupère (ou construit) la PeriodicWave Web Audio pour un symbole programmable wave.
 *  Retourne null si le symbole n'existe pas dans la décomp. */
export function getProgrammableWavePeriodic(symbol: string): PeriodicWave | null {
  const cached = _periodicWaveCache.get(symbol);
  if (cached) return cached;
  const samples = PROGRAMMABLE_WAVES[symbol];
  if (!samples) return null;
  const ctx = getAudioContext();
  const { real, imag } = computeDft(samples);
  const pw = ctx.createPeriodicWave(real, imag, { disableNormalization: false });
  _periodicWaveCache.set(symbol, pw);
  return pw;
}
