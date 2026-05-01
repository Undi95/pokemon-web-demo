/**
 * M4A MIDI player — implémenté via spessasynth_lib + SoundFont Pokemon Emerald.
 *
 * Pipeline :
 *   - SF2 (`/audio/emerald.sf2`) = SoundFont 1:1 rippé de la ROM Pokemon Emerald
 *     (= contient tous les voicegroups + samples + ADSR + loops corrects).
 *   - MIDI files (`/decomp/em/music/*.mid`) = pré-extraits depuis le décomp.
 *   - spessasynth_lib WorkletSynthesizer joue les MIDI via le SF2 en Web Audio.
 *
 * Multi-slot (BGM/SE1/SE2 1:1 décomp `gMPlayInfo_*`) :
 *   - 1 WorkletSynthesizer par slot (instance dédiée → channels indépendants,
 *     SE n'arrête PAS la BGM).
 *   - Le SF2 buffer est fetché 1 fois et partagé entre les synths.
 *
 * API publique conservée vs ancien player M4A custom :
 *   - `loadMidi(url)` retourne un Midi (parsed @tonejs/midi) + cache son ArrayBuffer
 *     en interne pour spessasynth_lib via WeakMap.
 *   - `playSong(song, voicegroup, vgLookup, loop, slot, songVolume)` — les args
 *     `voicegroup`/`vgLookup` sont ignorés (= le SF2 contient les voicegroups).
 *   - `stopSong(slot)` / `stopAllSongs()` / `isPlaying(slot)` inchangés.
 *   - `detectLoopStart` retourne null (loops gérés par spessasynth via marker MIDI).
 */
import { Midi } from '@tonejs/midi';
import { WorkletSynthesizer, Sequencer } from 'spessasynth_lib';
import type { VoiceGroup } from './voice-types';
import type { VoiceGroupLookup } from './voice-resolver';
import { getAudioContext, getMasterGain } from './audio-context';

export type SlotKind = 'bgm' | 'se1' | 'se2';

const SF2_URL = '/audio/emerald.sf2';
const WORKLET_URL = '/spessasynth_processor.min.js';

// ─── Singletons partagés ────────────────────────────────────────────────────

let _sfBuffer: ArrayBuffer | null = null;
let _sfFetchPromise: Promise<ArrayBuffer> | null = null;
let _workletModuleAdded = false;
let _workletModulePromise: Promise<void> | null = null;

async function ensureSfBuffer(): Promise<ArrayBuffer> {
  if (_sfBuffer) return _sfBuffer;
  if (_sfFetchPromise) return _sfFetchPromise;
  _sfFetchPromise = fetch(SF2_URL).then(async r => {
    if (!r.ok) throw new Error(`SF2 fetch failed: ${SF2_URL} → ${r.status}`);
    const buf = await r.arrayBuffer();
    _sfBuffer = buf;
    console.log(`[m4a] SoundFont loaded (${(buf.byteLength / (1024 * 1024)).toFixed(1)} MiB)`);
    return buf;
  });
  return _sfFetchPromise;
}

async function ensureWorkletModule(ctx: BaseAudioContext): Promise<void> {
  if (_workletModuleAdded) return;
  if (_workletModulePromise) return _workletModulePromise;
  _workletModulePromise = ctx.audioWorklet.addModule(WORKLET_URL).then(() => {
    _workletModuleAdded = true;
  });
  return _workletModulePromise;
}

// ─── Per-slot synth + sequencer ─────────────────────────────────────────────

interface SlotState {
  synth: WorkletSynthesizer;
  sequencer: Sequencer | null;  // créé à la 1ère playSong
  generation: number;            // bumped par stopSong/playSong → invalide les awaits pending
}

const _slots: Partial<Record<SlotKind, SlotState>> = {};
const _slotInitPromises: Partial<Record<SlotKind, Promise<SlotState>>> = {};

async function ensureSlotState(slot: SlotKind): Promise<SlotState> {
  const existing = _slots[slot];
  if (existing) return existing;
  const pending = _slotInitPromises[slot];
  if (pending) return pending;
  const promise = (async () => {
    const ctx = getAudioContext();
    await ensureWorkletModule(ctx);
    const synth = new WorkletSynthesizer(ctx);
    // Route via masterGain pour respecter le master volume du jeu (cf audio-context.ts)
    synth.connect(getMasterGain());
    const sfBuf = await ensureSfBuffer();
    // addSoundBank consomme le buffer (transferable). On en clone un slice à chaque
    // appel pour éviter le neutering du buffer partagé entre slots.
    await synth.soundBankManager.addSoundBank(sfBuf.slice(0), 'emerald');
    await synth.isReady;
    const state: SlotState = { synth, sequencer: null, generation: 0 };
    _slots[slot] = state;
    console.log(`[m4a] spessasynth synth ready for slot=${slot}`);
    return state;
  })();
  _slotInitPromises[slot] = promise;
  return promise;
}

// ─── MIDI buffer cache (pour passer au Sequencer) ───────────────────────────

const _bufferByMidi = new WeakMap<Midi, ArrayBuffer>();
const _midiCache = new Map<string, Midi>();

/** Précharge les 3 slots synth (bgm/se1/se2) en parallèle.
 *  À appeler au boot du jeu (= idem `m4aPrime`) pour que le 1er PlaySE
 *  ne souffre PAS d'une latence de 1-2s (load SF2 + worklet init).
 *  Chaque slot reste indépendant (= 1:1 décomp gMPlayInfo_BGM/SE1/SE2). */
export async function preloadAllSlots(): Promise<void> {
  await Promise.all([
    ensureSlotState('bgm'),
    ensureSlotState('se1'),
    ensureSlotState('se2'),
  ]);
}

/** Charge un MIDI depuis URL → Midi parsed. Cached. Le buffer brut est aussi
 *  caché pour pouvoir le passer à spessasynth Sequencer.loadNewSongList. */
export async function loadMidi(url: string): Promise<Midi> {
  const cached = _midiCache.get(url);
  if (cached) return cached;
  const arrBuf = await fetch(url).then(r => {
    if (!r.ok) throw new Error(`MIDI fetch failed: ${url} → ${r.status}`);
    return r.arrayBuffer();
  });
  const midi = new Midi(arrBuf);
  _bufferByMidi.set(midi, arrBuf);
  _midiCache.set(url, midi);
  return midi;
}

/** Démarre la lecture d'un MIDI sur un slot.
 *  Args `_voicegroup` et `_vgLookup` ignorés (= SF2 contient les voicegroups).
 *  songVolume 0-128 (1:1 décomp `mid2agb -Vxxx`) → mappé au master volume du synth. */
export async function playSong(
  song: Midi,
  _voicegroup: VoiceGroup,
  _vgLookup: VoiceGroupLookup,
  loop = false,
  slot: SlotKind = 'bgm',
  songVolume: number | null = null,
): Promise<void> {
  // Stop la song courante DANS CE SLOT
  stopSong(slot);

  const state = await ensureSlotState(slot);
  const myGen = ++state.generation;

  const buffer = _bufferByMidi.get(song);
  if (!buffer) {
    console.error('[m4a] playSong: MIDI buffer not found in cache (was loadMidi() called?)');
    return;
  }

  // Si stopSong a été appelé entre temps (await ensureSlotState yield), abort.
  if (myGen !== state.generation) return;

  // songVolume 0-128 → 0-1 master gain. Default 128 = full.
  const songVolNorm = songVolume !== null ? Math.max(0, Math.min(1, songVolume / 128)) : 1.0;

  // Pour les SE : bypass le Sequencer (qui reset bank select cross-track et
  // gâche les SE) → fire les events MIDI directement via synth API. Pour les
  // BGM : utiliser le Sequencer (= loops + tempo + features pleins).
  if (slot === 'se1' || slot === 'se2') {
    const ctx = getAudioContext();
    const startTime = ctx.currentTime + 0.005;
    for (const t of song.tracks) {
      const ch = t.channel;
      // 1. Bank select (CC 0 MSB + CC 32 LSB) à t=0 — précède le program change.
      const cc0First = t.controlChanges?.[0]?.[0];
      if (cc0First !== undefined) {
        try { state.synth.controllerChange(ch, 0, Math.round(cc0First.value * 127), { time: startTime }); } catch { /* ignore */ }
      }
      const cc32First = t.controlChanges?.[32]?.[0];
      if (cc32First !== undefined) {
        try { state.synth.controllerChange(ch, 32, Math.round(cc32First.value * 127), { time: startTime }); } catch { /* ignore */ }
      }
      // 2. Program change.
      if (t.instrument?.number !== undefined) {
        try { state.synth.programChange(ch, t.instrument.number, { time: startTime + 0.001 }); } catch { /* ignore */ }
      }
      // 3. Autres CCs (volume CC 7, pan CC 10, expression CC 11, etc.).
      for (const ccNumStr in t.controlChanges) {
        const ccNum = parseInt(ccNumStr);
        if (ccNum === 0 || ccNum === 32) continue;
        const ccs = t.controlChanges[ccNumStr];
        if (!ccs) continue;
        for (const cc of ccs) {
          try { state.synth.controllerChange(ch, ccNum as never, Math.round(cc.value * 127), { time: startTime + cc.time + 0.002 }); } catch { /* ignore */ }
        }
      }
      // 4. Notes.
      for (const note of t.notes) {
        try { state.synth.noteOn(ch, note.midi, Math.round(note.velocity * 127), { time: startTime + note.time + 0.003 }); } catch { /* ignore */ }
        try { state.synth.noteOff(ch, note.midi, { time: startTime + note.time + note.duration }); } catch { /* ignore */ }
      }
      // 5. Pitch bends (rare pour SE mais on les supporte).
      for (const bend of t.pitchBends || []) {
        const val = Math.round((bend.value + 1) * 8192);
        try { state.synth.pitchWheel(ch, val, { time: startTime + bend.time }); } catch { /* ignore */ }
      }
    }
    // Marker pour stopSong : on n'a pas de Sequencer à pause, mais on peut
    // simuler via state.sequencer = null et un dummy stop function plus tard.
    state.sequencer = null;
    return;
  }

  const seq = new Sequencer(state.synth);
  // loadNewSongList prend un tableau de MIDI. On joue 1 song à la fois.
  // Le clone .slice(0) protège le buffer partagé entre playSong successifs.
  seq.loadNewSongList([{ binary: buffer.slice(0), fileName: 'song.mid' }]);
  seq.loopCount = loop ? Infinity : 0;
  seq.play();

  // Master volume scaling : appliqué via le synth's master gain (1:1 décomp masterVolume).
  // spessasynth ne gère pas un volume per-sequencer ; on règle au synth-level.
  // Cf m4a.c:80 default masterVolume = 12 → ~0.8125 ; ici on multiplie par songVolNorm.
  const synthMasterVol = 0.8125 * songVolNorm;
  try {
    state.synth.setMasterParameter('masterGain' as any, synthMasterVol);
  } catch {
    // Fallback : set audio-context master gain (= getMasterGain) à ce niveau ?
    // Skip silently, default volume utilisé.
  }

  state.sequencer = seq;
}

/** Stop immédiat de la song courante du slot. */
export function stopSong(slot: SlotKind = 'bgm'): void {
  const state = _slots[slot];
  if (!state) return;
  state.generation++;
  if (state.sequencer) {
    try {
      state.sequencer.pause();
      // spessasynth Sequencer n'a pas de "destroy" exposé ; pause + GC suffit.
    } catch { /* already stopped */ }
    state.sequencer = null;
  }
}

/** Stop TOUS les slots (BGM + SE1 + SE2). 1:1 décomp `m4aMPlayAllStop()`. */
export function stopAllSongs(): void {
  stopSong('bgm');
  stopSong('se1');
  stopSong('se2');
}

/** Détection loopStart : non implémenté (spessasynth gère les markers MIDI lui-même). */
export function detectLoopStart(_song: Midi): number | null {
  return null;
}

/** Vrai si une song est en cours sur le slot donné. */
export function isPlaying(slot: SlotKind = 'bgm'): boolean {
  const state = _slots[slot];
  return state?.sequencer != null;
}
