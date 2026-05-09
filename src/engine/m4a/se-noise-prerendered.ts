/**
 * Pre-rendered noise SE loader/player.
 *
 * Lit les WAVs générés offline par scripts/render-se-noise-reference.mjs
 * (rendered à 192 kHz internal + low-pass 6kHz cascade + downsampled à 48 kHz
 * + normalized → écrit en `public/audio/se_noise/<name>.wav`).
 *
 * Pourquoi pre-render au lieu d'un engine runtime ?
 *   - LFSR hardware GBA tick rate up to 524288 Hz = 22x au-dessus de la
 *     Nyquist du browser AudioContext (24 kHz). Le runtime LFSR worklet alias
 *     massivement → "souffle dans le micro à 1cm" (= signal saturé d'aliasing
 *     dans la bande audible 0-24 kHz).
 *   - Render OFFLINE à 192 kHz Nyquist = 96 kHz, low-pass 6kHz cascade avant
 *     downsample → aliasing résiduel dans la bande de sortie 0-24 kHz est
 *     atténué à <-50 dB.
 *   - Bonus : zéro coût CPU runtime pour ces SE (= simple sample playback).
 *
 * Liste hardcodée des SE pré-rendus (= ceux qui utilisent vraiment voice noise
 * ou noise_alt, vérifiés dans rs_sfx_1.inc / rs_sfx_2.inc) :
 *   - se_intro_blast (= SE_INTRO_BLAST 103, blast laser Rayquaza title screen)
 *   - se_effective   (= SE_EFFECTIVE 13, hit "super effective")
 *   - se_faint       (= SE_FAINT 16, sortie pokemon ko)
 */
import { getAudioContext, getMasterGain } from './audio-context';

export type SlotKind = 'bgm' | 'se1' | 'se2';

// Auto-loaded from /audio/se_prerendered/pre-rendered-list.json at first SE play.
// Populated by scripts/auto-classify-and-render-se.mjs.
// Strategy : tous les SE qui ont un noise track → pre-render (= notre LFSR + mix
// supérieur à spessasynth). Les SE directsound-pur restent sur spessasynth (=
// sinc interp + SF2 exponential envelope + clean loop handling).
let PRERENDERED_SE_NAMES: Set<string> | null = null;
let _listLoadPromise: Promise<Set<string>> | null = null;

async function loadPrerenderedList(): Promise<Set<string>> {
  if (PRERENDERED_SE_NAMES) return PRERENDERED_SE_NAMES;
  if (_listLoadPromise) return _listLoadPromise;
  _listLoadPromise = (async () => {
    try {
      const r = await fetch('/audio/se_prerendered/pre-rendered-list.json');
      if (!r.ok) {
        console.warn('[se-prerendered] list fetch failed, fallback to empty');
        PRERENDERED_SE_NAMES = new Set();
        return PRERENDERED_SE_NAMES;
      }
      const arr: string[] = await r.json();
      PRERENDERED_SE_NAMES = new Set(arr);
      console.log(`[se-prerendered] loaded ${arr.length} SE names from list`);
      return PRERENDERED_SE_NAMES;
    } catch (e) {
      console.warn('[se-prerendered] list load error:', e);
      PRERENDERED_SE_NAMES = new Set();
      return PRERENDERED_SE_NAMES;
    }
  })();
  return _listLoadPromise;
}

const _bufferCache = new Map<string, AudioBuffer>();
const _fetchPromises = new Map<string, Promise<AudioBuffer>>();
const _slotActive: Partial<Record<SlotKind, AudioBufferSourceNode[]>> = {};

/** Vrai si le SE name est pré-rendu. Lazy-loads list au 1er appel.
 *  Returns false si la list n'est pas encore loaded (= caller tombe sur spessasynth). */
export function hasPrerenderedSE(songName: string): boolean {
  if (!PRERENDERED_SE_NAMES) {
    void loadPrerenderedList();
    return false;
  }
  return PRERENDERED_SE_NAMES.has(songName);
}

/** Pre-load la list (call at boot pour avoir la liste dispo de suite). */
export function preloadPrerenderedList(): Promise<void> {
  return loadPrerenderedList().then(() => undefined);
}

/**
 * Force pre-load de N samples SE en parallèle. Returns Promise qui resolve
 * quand tous sont cachés en memory. Utile avant cinematics où la latence du
 * 1er play matche pas le timing désiré (= truck cinematic).
 *
 * Session 124 fix Bug 2 : pre-load SE_TRUCK_MOVE / STOP / UNLOAD / DOOR avant
 * lancer la cinematic → quand state 2→3 fire PlaySE(SE_TRUCK_STOP), le
 * buffer est déjà décodé → start instantané, pas de gap audible.
 */
export function preloadPrerenderedSEs(songNames: string[]): Promise<void> {
  return Promise.all(songNames.map(n => loadBuffer(n).catch(() => null))).then(() => undefined);
}

async function loadBuffer(songName: string): Promise<AudioBuffer> {
  const cached = _bufferCache.get(songName);
  if (cached) return cached;
  const pending = _fetchPromises.get(songName);
  if (pending) return pending;
  const promise = (async () => {
    const url = `/audio/se_prerendered/${songName}.wav`;
    const r = await fetch(url);
    if (!r.ok) throw new Error(`Pre-rendered SE fetch failed: ${url} → ${r.status}`);
    const arrBuf = await r.arrayBuffer();
    const ctx = getAudioContext();
    const audioBuf = await ctx.decodeAudioData(arrBuf);
    _bufferCache.set(songName, audioBuf);
    console.log(`[se-prerendered] loaded ${songName}.wav (${audioBuf.duration.toFixed(2)}s, ${audioBuf.numberOfChannels}ch)`);
    return audioBuf;
  })();
  _fetchPromises.set(songName, promise);
  return promise;
}

/**
 * Play un noise SE pré-rendu sur le slot donné. One-shot (pas de loop).
 * Mono-cut : kill le précédent SE actif sur le slot avant de scheduler le nouveau.
 */
// Debug verbose : enable via `globalThis.__SE_DEBUG = true` (= dev console).
// Off par défaut pour réduire bruit logs (chaque SE = 3 logs minimum).
const SE_DEBUG = (): boolean =>
  Boolean((globalThis as { __SE_DEBUG?: boolean }).__SE_DEBUG);

/**
 * Returns la durée du buffer pré-rendu pour `songName` si déjà chargé en cache,
 * sinon `null`. Utilisé pour timer précis de fin de SE (cf. truck-cinematic).
 */
export function getPrerenderedSEDuration(songName: string): number | null {
  const buf = _bufferCache.get(songName);
  return buf ? buf.duration : null;
}

/**
 * Play un SE pré-rendu en LOOP infini sur le slot donné. Boucles jusqu'à ce
 * que `stopPrerenderedSE(slot)` soit appelé.
 *
 * Use case (session 124 fix Bug 2) : SE_TRUCK_MOVE qui doit jouer continu
 * pendant toute la cinématique du camion (= 1:1 ROM behavior). Notre WAV
 * pre-rendered = 8s one-shot → sans loop, gap entre fin du WAV et SE_STOP.
 */
export async function playPrerenderedSEWithLoop(
  songName: string,
  slot: SlotKind,
  songVolume: number | null = null,
): Promise<void> {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    try { await ctx.resume(); } catch { /* ignore */ }
  }
  const buf = await loadBuffer(songName);
  stopPrerenderedSE(slot);

  const source = ctx.createBufferSource();
  source.buffer = buf;
  source.loop = true;  // ← KEY DIFFERENCE vs playPrerenderedSE

  const songVolNorm = songVolume !== null ? Math.max(0, Math.min(1, songVolume / 128)) : 1.0;
  const gainNode = ctx.createGain();
  gainNode.gain.value = songVolNorm;

  source.connect(gainNode);
  gainNode.connect(getMasterGain());
  source.start();

  if (!_slotActive[slot]) _slotActive[slot] = [];
  _slotActive[slot]!.push(source);

  source.onended = () => {
    const list = _slotActive[slot];
    if (list) {
      const idx = list.indexOf(source);
      if (idx >= 0) list.splice(idx, 1);
    }
    try { gainNode.disconnect(); } catch { /* ignore */ }
  };
  console.log(`[se-prerendered] LOOP ${songName} (${buf.duration.toFixed(2)}s) on slot ${slot}`);
}

export async function playPrerenderedSE(
  songName: string,
  slot: SlotKind,
  songVolume: number | null = null,
): Promise<void> {
  const ctx = getAudioContext();
  const t0 = ctx.currentTime;
  if (SE_DEBUG()) console.log(`[SE-DEBUG] play ${songName} slot=${slot} ctxState=${ctx.state} ctxTime=${t0.toFixed(3)} ctxSR=${ctx.sampleRate}`);
  if (ctx.state === 'suspended') {
    if (SE_DEBUG()) console.log(`[SE-DEBUG]   ctx was suspended, awaiting resume...`);
    try { await ctx.resume(); } catch { /* ignore */ }
    if (SE_DEBUG()) console.log(`[SE-DEBUG]   resumed, state=${ctx.state}`);
  }
  const tBeforeBuf = ctx.currentTime;
  const buf = await loadBuffer(songName);
  const tAfterBuf = ctx.currentTime;
  if (SE_DEBUG()) console.log(`[SE-DEBUG]   buffer: ${buf.duration.toFixed(2)}s ${buf.numberOfChannels}ch @ ${buf.sampleRate}Hz, fetch+decode took ${((tAfterBuf - tBeforeBuf) * 1000).toFixed(1)}ms`);

  const activeBefore = (_slotActive[slot] || []).length;
  stopPrerenderedSE(slot);
  if (SE_DEBUG() && activeBefore > 0) console.log(`[SE-DEBUG]   mono-cut: stopped ${activeBefore} previous source(s) on slot ${slot}`);

  const source = ctx.createBufferSource();
  source.buffer = buf;

  const songVolNorm = songVolume !== null ? Math.max(0, Math.min(1, songVolume / 128)) : 1.0;
  const gainNode = ctx.createGain();
  gainNode.gain.value = songVolNorm;

  source.connect(gainNode);
  gainNode.connect(getMasterGain());
  const tStart = ctx.currentTime;
  source.start();
  if (SE_DEBUG()) console.log(`[SE-DEBUG]   source.start() called at ctxTime=${tStart.toFixed(3)} (delta from t0=${((tStart - t0) * 1000).toFixed(1)}ms)`);

  if (!_slotActive[slot]) _slotActive[slot] = [];
  _slotActive[slot]!.push(source);

  source.onended = () => {
    const list = _slotActive[slot];
    if (list) {
      const idx = list.indexOf(source);
      if (idx >= 0) list.splice(idx, 1);
    }
    try { gainNode.disconnect(); } catch { /* ignore */ }
  };
}

/** Stop tous les SE pré-rendus actifs sur le slot. */
export function stopPrerenderedSE(slot: SlotKind): void {
  const list = _slotActive[slot];
  if (!list || list.length === 0) return;
  for (const source of list) {
    try { source.stop(); } catch { /* already stopped */ }
  }
  _slotActive[slot] = [];
}
