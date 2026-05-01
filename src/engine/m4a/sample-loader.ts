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

/** Sample chargé : AudioBuffer + loop points optionnels (depuis smpl chunk WAV). */
export interface LoadedSample {
  buffer: AudioBuffer;
  /** Loop start en seconds (0 = pas de loop défini). */
  loopStart: number;
  /** Loop end en seconds (0 = pas de loop défini). */
  loopEnd: number;
  /** True si le smpl chunk contient au moins 1 loop point valide. */
  hasLoop: boolean;
}

let _manifest: SampleManifest | null = null;
const _sampleCache = new Map<string, LoadedSample>();
const _loadingPromises = new Map<string, Promise<LoadedSample | null>>();
const _reportedFailures = new Set<string>();

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

/** Parse le smpl chunk d'un WAV pour extraire les loop points.
 *  Format : RIFF header + fmt chunk + smpl chunk + data chunk.
 *  smpl chunk : 36 bytes header + 24 bytes per loop point.
 *  Loop point fields : cue_id, type, start_sample, end_sample, fraction, play_count.
 *
 *  Retour : { loopStartSample, loopEndSample, sampleRate } ou null si pas de loop. */
function parseWavSmplChunk(arrBuf: ArrayBuffer): { startSample: number; endSample: number; sampleRate: number } | null {
  const view = new DataView(arrBuf);
  // Verify RIFF/WAVE
  if (view.getUint32(0, false) !== 0x52494646) return null; // 'RIFF'
  if (view.getUint32(8, false) !== 0x57415645) return null; // 'WAVE'

  // Walk chunks (start at offset 12)
  let offset = 12;
  let sampleRate = 0;
  while (offset + 8 < arrBuf.byteLength) {
    const chunkId = view.getUint32(offset, false);  // big-endian (4 chars)
    const chunkSize = view.getUint32(offset + 4, true);  // little-endian
    const dataOffset = offset + 8;

    if (chunkId === 0x666d7420) {  // 'fmt '
      sampleRate = view.getUint32(dataOffset + 4, true);
    } else if (chunkId === 0x736d706c) {  // 'smpl'
      // Loop points : header 36 bytes, then 24 bytes per loop
      const numLoops = view.getUint32(dataOffset + 28, true);
      if (numLoops > 0) {
        const loopOffset = dataOffset + 36;
        // Loop fields : cue_id (4), type (4), start (4), end (4), fraction (4), play_count (4)
        const startSample = view.getUint32(loopOffset + 8, true);
        const endSample = view.getUint32(loopOffset + 12, true);
        return { startSample, endSample, sampleRate: sampleRate || 13379 };
      }
    }
    // Move to next chunk (8 byte header + chunkSize, padded to even)
    offset = dataOffset + chunkSize + (chunkSize & 1);
  }
  return null;
}

/** Charge un sample par symbole asm (DirectSoundWaveData_X) → LoadedSample
 *  (AudioBuffer + loop points depuis smpl chunk WAV).
 *  Cache hit si déjà chargé. Fetch + parse smpl + decode si nouveau. */
export async function loadSample(symbol: string): Promise<LoadedSample | null> {
  const url = resolveSymbolUrl(symbol);
  if (!url) {
    console.warn(`[m4a] Sample symbol not found in manifest: ${symbol}`);
    return null;
  }
  const cached = _sampleCache.get(url);
  if (cached) return cached;
  const inFlight = _loadingPromises.get(url);
  if (inFlight) return inFlight;
  const promise = (async () => {
    try {
      const ctx = getAudioContext();
      const arrBuf = await fetch(url).then(r => r.arrayBuffer());
      // Parse smpl chunk AVANT decodeAudioData (qui ignore les chunks meta)
      const smpl = parseWavSmplChunk(arrBuf.slice(0));
      const buf = await ctx.decodeAudioData(arrBuf);
      // Convert sample indices → seconds
      const sampleRate = smpl?.sampleRate || buf.sampleRate;
      const loaded: LoadedSample = {
        buffer: buf,
        loopStart: smpl ? smpl.startSample / sampleRate : 0,
        loopEnd: smpl ? smpl.endSample / sampleRate : 0,
        hasLoop: !!smpl,
      };
      _sampleCache.set(url, loaded);
      return loaded;
    } catch (e) {
      if (!_reportedFailures.has(symbol)) {
        _reportedFailures.add(symbol);
        console.warn(`[m4a] Sample load failed for ${symbol} (${url}):`, e);
      }
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

// Le helper `getNoiseBuffer()` (white noise approximatif) a été remplacé par
// le LFSR-accurate buffer dans `noise-engine.ts`. Cf. `getNoiseLfsrBuffer()`.
