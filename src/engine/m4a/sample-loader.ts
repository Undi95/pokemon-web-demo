/**
 * Sample loader pour M4A audio engine.
 *
 * Charge les WAV samples (DirectSoundWaveData_X) en AudioBuffer Web Audio.
 * Cache pour éviter de re-décoder à chaque note.
 *
 * Le manifest est généré par `scripts/extract-direct-sound-samples.mjs` et
 * mappe les symboles asm → URL WAV. Plusieurs symboles peuvent pointer vers
 * la même URL (préfixes variables sc88pro_/drums_/etc).
 */
import { getAudioContext } from './audio-context';

interface SampleManifest {
  generatedAt: string;
  sampleCount: number;
  samples: Record<string, string>;  // symbol → URL
}

let _manifest: SampleManifest | null = null;
const _bufferCache = new Map<string, AudioBuffer>();         // URL → buffer
const _loadingPromises = new Map<string, Promise<AudioBuffer | null>>();

/** Fetch + cache le manifest. À appeler une fois au démarrage. */
export async function loadSampleManifest(): Promise<void> {
  if (_manifest) return;
  const res = await fetch('/decomp/em/sound/direct_sound_samples/_manifest.json');
  if (!res.ok) throw new Error(`Sample manifest fetch failed: ${res.status}`);
  _manifest = await res.json();
  console.log(`[m4a] Sample manifest loaded: ${_manifest!.sampleCount} samples, ${Object.keys(_manifest!.samples).length} symbols`);
}

/** Résoud un symbole asm → URL WAV. Retourne null si non trouvé. */
export function resolveSymbolUrl(symbol: string): string | null {
  if (!_manifest) return null;
  return _manifest.samples[symbol] ?? null;
}

/** Charge un sample par symbole asm (DirectSoundWaveData_X) → AudioBuffer.
 *  Cache hit si déjà chargé. Fetch + decode si nouveau.
 *  Retourne null si symbole inconnu ou décodage échoué. */
export async function loadSample(symbol: string): Promise<AudioBuffer | null> {
  const url = resolveSymbolUrl(symbol);
  if (!url) {
    console.warn(`[m4a] Sample symbol not found in manifest: ${symbol}`);
    return null;
  }
  // Check cache
  const cached = _bufferCache.get(url);
  if (cached) return cached;
  // Check in-flight
  const inFlight = _loadingPromises.get(url);
  if (inFlight) return inFlight;
  // Fetch + decode
  const promise = (async () => {
    try {
      const ctx = getAudioContext();
      const arrBuf = await fetch(url).then(r => r.arrayBuffer());
      const buf = await ctx.decodeAudioData(arrBuf);
      _bufferCache.set(url, buf);
      return buf;
    } catch (e) {
      console.error(`[m4a] Sample load failed for ${symbol} (${url}):`, e);
      return null;
    } finally {
      _loadingPromises.delete(url);
    }
  })();
  _loadingPromises.set(url, promise);
  return promise;
}

/** Pré-charge plusieurs samples en parallèle. Utile pour préparer un song. */
export async function preloadSamples(symbols: string[]): Promise<void> {
  await Promise.all(symbols.map(s => loadSample(s)));
}

/** Génère un AudioBuffer de white noise (durée 1s, mono) pour les voices PSG noise.
 *  Cache global pour réutilisation. */
let _noiseBuffer: AudioBuffer | null = null;
export function getNoiseBuffer(): AudioBuffer {
  if (_noiseBuffer) return _noiseBuffer;
  const ctx = getAudioContext();
  const lengthSec = 1;
  const buf = ctx.createBuffer(1, ctx.sampleRate * lengthSec, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  _noiseBuffer = buf;
  return buf;
}
