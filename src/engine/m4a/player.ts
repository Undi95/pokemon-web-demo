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
import { resolveVoice } from './voice-resolver';
import { playNote } from './synth';
import { getNoiseLfsrBuffer, midiNoteToNoiseFreq } from './noise-engine';
import { getAudioContext, getMasterGain } from './audio-context';

export type SlotKind = 'bgm' | 'se1' | 'se2';

const SF2_URL = '/audio/emerald.sf2';
const WORKLET_URL = '/spessasynth_processor.min.js';
const NOISE_WORKLET_URL = '/m4a-noise-lfsr-processor.js';

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

let _noiseWorkletAdded = false;
let _noiseWorkletPromise: Promise<void> | null = null;
async function ensureNoiseWorklet(ctx: BaseAudioContext): Promise<void> {
  if (_noiseWorkletAdded) return;
  if (_noiseWorkletPromise) return _noiseWorkletPromise;
  _noiseWorkletPromise = ctx.audioWorklet.addModule(NOISE_WORKLET_URL).then(() => {
    _noiseWorkletAdded = true;
  });
  return _noiseWorkletPromise;
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

  // SE et BGM passent par le Sequencer. Les SE/PH .mid ont été pre-process
  // (scripts/fix-se-banks.mjs) pour que le CC 0 (bank MSB) soit inline sur
  // la track avec program change, garantissant la propagation cross-track.
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

  // HYBRID FINAL : SE qui utilisent noise voices = AudioWorklet LFSR temps-réel
  // au lieu du SF2 sample pré-enregistré (qui loop → bruit blanc répétitif).
  // Le worklet génère 1 bit pseudo-random par sample audio → pas de loop, pas
  // de resampling artefact, 1:1 hardware GBA noise channel.
  // Pour chaque noise note : tronquer noteOff dans spessasynth (= mute la
  // version SF2) + jouer en parallèle via AudioWorklet (= vraie LFSR).
  if (!loop && (slot === 'se1' || slot === 'se2') && songUsesNoiseVoice(song, _voicegroup, _vgLookup)) {
    const ctx = getAudioContext();
    const sequencerStartTime = ctx.currentTime + 0.005;
    // Lazy-load le noise worklet (= 1ère fois). Idempotent.
    void ensureNoiseWorklet(ctx).then(() => {
      for (const track of song.tracks) {
        const programNumber = track.instrument?.number ?? 0;
        for (const note of track.notes) {
          const noteVoice = resolveVoice(_voicegroup, programNumber, note.midi, _vgLookup);
          if (noteVoice?.type === 'noise' || noteVoice?.type === 'noise_alt') {
            const when = sequencerStartTime + note.time;
            const velocity = Math.round(note.velocity * 127);
            // 1. Mute spessasynth pour CETTE note (= force noteOff immédiat).
            try {
              state.synth.noteOff(track.channel, note.midi, { time: when + 0.001 });
            } catch { /* ignore */ }
            // 2. Joue la vraie LFSR via AudioWorklet temps-réel.
            playNoteNoiseWorklet(noteVoice, note.midi, velocity, when, note.duration, 1.0);
          }
        }
      }
    });
  }

  // Force-stop SE après song duration (= safety net pour notes stuck).
  if (!loop && (slot === 'se1' || slot === 'se2')) {
    const totalSec = song.duration + 0.05;
    window.setTimeout(() => {
      try { state.synth.stopAll(true); } catch { /* ignore */ }
    }, totalSec * 1000);
  }
}

/** Track des LFSR sources per-slot (= bs + env GainNode) pour mono-cut entre
 *  notes successives sur le même slot (= 1:1 hardware GBA noise channel mono).
 *  bs.stop ne peut être appelé qu'une fois → on cancel via env.gain à 0. */
const _slotLfsrSources: Partial<Record<SlotKind, { bs: AudioBufferSourceNode; env: GainNode }[]>> = {};

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
  // Stop les LFSR sources actives sur ce slot via env.gain → 0 immédiat.
  const lfsrs = _slotLfsrSources[slot];
  if (lfsrs && lfsrs.length > 0) {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    for (const { env } of lfsrs) {
      try {
        env.gain.cancelScheduledValues(now);
        env.gain.setValueAtTime(0, now);
      } catch { /* ignore */ }
    }
    _slotLfsrSources[slot] = [];
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

/** Détermine si un MIDI utilise au moins une noise voice (Type 12/4 dans M4A
 *  format = LFSR PSG channel sur GBA). spessasynth/SF2 ne reproduit PAS
 *  correctement les noise voices : il pitch-shift le sample sf2 → résultat
 *  tonal au lieu de crash/blast LFSR authentique. */
export function songUsesNoiseVoice(
  song: Midi,
  voicegroup: VoiceGroup,
  vgLookup: VoiceGroupLookup,
): boolean {
  for (const track of song.tracks) {
    const program = track.instrument?.number ?? 0;
    if (track.notes.length === 0) continue;
    const voice = resolveVoice(voicegroup, program, track.notes[0].midi, vgLookup);
    if (voice?.type === 'noise' || voice?.type === 'noise_alt') return true;
  }
  return false;
}

/** Joue 1 note noise via AudioWorklet LFSR temps-réel (= 1:1 hardware GBA).
 *  Génère 1 bit pseudo-random par audio sample → pas de loop, pas de
 *  resampling artefact. Stop via env.gain à 0 + node.disconnect après duration. */
function playNoteNoiseWorklet(
  voice: { period?: number; envelope: { attack: number; decay: number; sustain: number; release: number } },
  midiNote: number,
  velocity: number,
  when: number,
  duration: number,
  trackVolume: number,
): void {
  const ctx = getAudioContext();
  if (!_noiseWorkletAdded) {
    console.warn('[m4a-noise] worklet not loaded yet — skip note');
    return;
  }
  const periodVal = voice.period ?? 0;
  const is7bit = (periodVal & 1) === 1;
  const node = new AudioWorkletNode(ctx, 'm4a-noise-lfsr', {
    numberOfInputs: 0,
    numberOfOutputs: 1,
    outputChannelCount: [1],
  });
  const freqParam = node.parameters.get('frequency');
  const is7bitParam = node.parameters.get('is7bit');
  if (freqParam) freqParam.setValueAtTime(midiNoteToNoiseFreq(midiNote), when);
  if (is7bitParam) is7bitParam.setValueAtTime(is7bit ? 1 : 0, when);

  // ADSR — CGB scale (attack/decay/release 0-7, sustain 0-15) en steps 1/60s.
  const env = ctx.createGain();
  const velNorm = (velocity / 127) * trackVolume;
  const sustainNorm = (voice.envelope.sustain / 15) * velNorm * 0.4;
  const attackSec = voice.envelope.attack > 0 ? voice.envelope.attack * (1 / 60) : 0;
  const decaySec = voice.envelope.decay > 0 ? voice.envelope.decay * (1 / 60) : 0.005;
  const releaseSec = voice.envelope.release > 0 ? voice.envelope.release * (1 / 60) : 0.04;

  // Pré-noteOn : silent.
  env.gain.setValueAtTime(0, when - 0.001);
  // Attack : ramp 0 → velNorm.
  if (attackSec > 0) {
    env.gain.setValueAtTime(0, when);
    env.gain.linearRampToValueAtTime(velNorm, when + attackSec);
  } else {
    env.gain.setValueAtTime(velNorm, when);
  }
  // Decay : velNorm → sustainNorm.
  env.gain.linearRampToValueAtTime(sustainNorm, when + attackSec + decaySec);
  // Sustain hold jusqu'à noteOff.
  const noteOff = when + duration;
  env.gain.setValueAtTime(sustainNorm, noteOff);
  // Release : ramp linéaire à 0.
  env.gain.linearRampToValueAtTime(0, noteOff + releaseSec);

  node.connect(env);
  env.connect(getMasterGain());

  // Cleanup : disconnect node après que le gain atteint 0 (sinon le worklet
  // continue à tourner CPU pour rien). AudioWorkletNode n'a pas de stop().
  const stopMs = Math.max(50, (noteOff + releaseSec + 0.05 - ctx.currentTime) * 1000);
  window.setTimeout(() => {
    try { node.disconnect(); } catch { /* already disconnected */ }
    try { env.disconnect(); } catch { /* already disconnected */ }
  }, stopMs);
}

/** Joue 1 note noise via LFSR-accurate Phase 8 (noise-engine.ts).
 *  Reproduit le LFSR pseudo-random hardware GBA (NR43 register + 15/7-bit shift).
 *  Le buffer LFSR est cached après 1ère création.
 *  Connecte directement à getMasterGain() — INDEPENDANT du spessasynth synth path,
 *  donc n'affecte PAS la BGM en cours. */
function playNoteNoiseLFSR(
  voice: { period?: number; envelope: { attack: number; decay: number; sustain: number; release: number } },
  midiNote: number,
  velocity: number,
  when: number,
  duration: number,
  trackVolume: number,
  slot: SlotKind = 'se1',
): void {
  const ctx = getAudioContext();
  const periodVal = voice.period ?? 0;
  const is7bit = (periodVal & 1) === 1;
  const bs = ctx.createBufferSource();
  bs.buffer = getNoiseLfsrBuffer(is7bit);
  bs.loop = true;
  bs.playbackRate.value = midiNoteToNoiseFreq(midiNote) / ctx.sampleRate;

  // ADSR — CGB scale (attack/decay/release 0-7, sustain 0-15) en steps de 1/60s.
  const env = ctx.createGain();
  const velNorm = (velocity / 127) * trackVolume;
  const sustainGain = (voice.envelope.sustain / 15) * velNorm * 0.4;
  const attackSec = voice.envelope.attack > 0 ? voice.envelope.attack * (1 / 60) : 0;
  const decaySec = voice.envelope.decay > 0 ? voice.envelope.decay * (1 / 60) : 0.005;
  if (attackSec > 0) {
    env.gain.setValueAtTime(0, when);
    env.gain.linearRampToValueAtTime(velNorm, when + attackSec);
  } else {
    env.gain.setValueAtTime(velNorm, when);
  }
  env.gain.linearRampToValueAtTime(sustainGain, when + attackSec + decaySec);
  const noteOff = when + duration;
  // RELEASE : linear ramp à 0 (pas setTargetAtTime exponential qui n'atteint
  // jamais 0 et fait sortir du bruit blanc fort quand bs.stop cut hard).
  const releaseSec = voice.envelope.release > 0 ? voice.envelope.release * (1 / 60) : 0.04;
  env.gain.cancelScheduledValues(noteOff);
  // Sustain niveau au noteOff puis decay linéaire vers 0.
  env.gain.setValueAtTime(sustainGain, noteOff);
  env.gain.linearRampToValueAtTime(0, noteOff + releaseSec);

  bs.connect(env);
  env.connect(getMasterGain());
  bs.start(when);
  // Stop bs juste après que le gain atteint 0 (= silence garanti).
  bs.stop(noteOff + releaseSec + 0.005);
  // Track le source + env pour cleanup via stopSong + mono-cut entre notes.
  if (!_slotLfsrSources[slot]) _slotLfsrSources[slot] = [];
  const entry = { bs, env };
  _slotLfsrSources[slot]!.push(entry);
  bs.onended = () => {
    const list = _slotLfsrSources[slot];
    if (list) {
      const idx = list.indexOf(entry);
      if (idx >= 0) list.splice(idx, 1);
    }
  };
}

/** Joue une song via le custom synth (LFSR pour noise voices, playNote pre-P8
 *  fallback). Utilisé pour les SE noise (SF2/spessasynth pitch-shift le sample
 *  noise → "Bird Tweet" tonal au lieu d'un crash LFSR pseudo-random). */
export async function playSongCustomSynth(
  song: Midi,
  voicegroup: VoiceGroup,
  vgLookup: VoiceGroupLookup,
  slot: SlotKind = 'se1',
  songVolume: number | null = null,
): Promise<void> {
  stopSong(slot);
  const ctx = getAudioContext();
  const startTime = ctx.currentTime + 0.005;
  const trackVolNorm = songVolume !== null ? Math.max(0, Math.min(1, songVolume / 128)) : 1.0;
  for (const track of song.tracks) {
    const programNumber = track.instrument?.number ?? 0;
    for (const note of track.notes) {
      const noteVoice = resolveVoice(voicegroup, programNumber, note.midi, vgLookup);
      if (!noteVoice) continue;
      const when = startTime + note.time;
      const velocity = Math.round(note.velocity * 127);
      // NOISE → LFSR Phase 8 hardware-accurate. Sur GBA hardware le canal
      // noise est monophonique : chaque nouvelle note CUT la précédente.
      // Notre playSongCustomSynth schedule toutes les notes en avance ; la
      // précédente peut overlap avec la suivante → bruit blanc cumulatif.
      // Fix : force-stop chaque source LFSR active au timestamp `when`
      // (= la nouvelle note prend la priorité 1:1 hardware).
      if (noteVoice.type === 'noise' || noteVoice.type === 'noise_alt') {
        // Mono-cut : cancel les ramps + setValueAtTime(0) au timestamp `when`
        // sur l'env GainNode de chaque LFSR source précédent (bs.stop déjà
        // schedulé et ne peut pas être ré-appelé). Gain à 0 = silence audio.
        const prevList = _slotLfsrSources[slot];
        if (prevList) {
          for (const { env: prevEnv } of prevList) {
            try {
              prevEnv.gain.cancelScheduledValues(when);
              prevEnv.gain.setValueAtTime(0, when);
            } catch { /* ignore */ }
          }
        }
        playNoteNoiseLFSR(noteVoice, note.midi, velocity, when, note.duration, trackVolNorm, slot);
        continue;
      }
      // Fallback : playNote pre-P8 pour autres types
      const panMidi = 64;
      void (async () => {
        const active = await playNote(noteVoice, note.midi, velocity, panMidi, when, trackVolNorm);
        if (active) {
          window.setTimeout(() => {
            try { active.stop(when + note.duration); } catch { /* ignore */ }
          }, Math.max(0, (when + note.duration - ctx.currentTime) * 1000));
        }
      })();
    }
  }
}

/** Vrai si une song est en cours sur le slot donné. */
export function isPlaying(slot: SlotKind = 'bgm'): boolean {
  const state = _slots[slot];
  return state?.sequencer != null;
}
