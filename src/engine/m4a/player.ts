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
import { songHasNoiseTrack, scheduleNoiseSE, stopNoiseSE } from './se-noise-engine';
import { stopPrerenderedSE } from './se-noise-prerendered';

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

/** Scan brut le buffer MIDI à la recherche de markers meta `loopStart` /
 *  `loopEnd` (= FF 06 <len> <text>). Retourne true si AU MOINS un loopStart
 *  ou loopEnd est trouvé. C'est la convention utilisée par les .mid Pokémon
 *  (= mid2agb les convertit en `ply_goto` côté ROM). */
function midiHasLoopMarkers(buf: Uint8Array): boolean {
  const td = new TextDecoder('utf-8', { fatal: false });
  for (let i = 0; i < buf.length - 3; i++) {
    if (buf[i] === 0xFF && buf[i + 1] === 0x06) {
      // FF 06 = MIDI meta marker. Length encoded as variable-length quantity, but
      // for typical < 128 byte text it's just 1 byte. Stay conservative.
      const len = buf[i + 2];
      if (len > 0 && len < 64 && i + 3 + len <= buf.length) {
        const text = td.decode(buf.subarray(i + 3, i + 3 + len)).trim().toLowerCase();
        if (text === 'loopstart' || text === 'loopend' || text === 'start') return true;
      }
    }
  }
  return false;
}

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
 *  caché pour pouvoir le passer à spessasynth Sequencer.loadNewSongList.
 *  Aussi : attache `midi.loop = { start, end }` (= info parsée par BasicMIDI
 *  spessasynth qui détecte les markers `[` / `]` de mid2agb-style). @tonejs/midi
 *  n'expose pas cette info → on la patche ici pour que m4aSongNumStart puisse
 *  auto-detecter les BGMs qui doivent looper. */
export async function loadMidi(url: string): Promise<Midi> {
  const cached = _midiCache.get(url);
  if (cached) return cached;
  const arrBuf = await fetch(url).then(r => {
    if (!r.ok) throw new Error(`MIDI fetch failed: ${url} → ${r.status}`);
    return r.arrayBuffer();
  });
  const midi = new Midi(arrBuf);
  _bufferByMidi.set(midi, arrBuf);
  // Détection markers MIDI `loopStart` / `loopEnd` (FF 06 meta events) que les
  // .mid Pokémon utilisent pour signaler les BGMs qui doivent looper. mid2agb
  // les convertit en `ply_goto` côté ROM. On scanne le buffer raw pour les
  // détecter. Confirmé via `node` :
  //   mus_route101/littleroot/petalburg → loopStart + loopEnd ✓
  //   mus_title/mus_intro → pas de markers ✓
  if (midiHasLoopMarkers(new Uint8Array(arrBuf))) {
    (midi as unknown as { loop: { start: number; end: number } }).loop = {
      start: 0, end: 1,  // valeurs symboliques (la lecture loop se fait worklet-side)
    };
  }
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

  // ─── Détection + strip noise tracks AVANT seq.play() ────────────────────
  // Si la song utilise des noise voices sur un slot SE → on les délègue à
  // se-noise-engine.ts (M4A LFSR 1:1 hardware avec pitch bend + BENDR + CC7).
  // En parallèle on FILTRE le MIDI buffer envoyé à spessasynth pour que le
  // sample SF2 noise (= "buzzer" looped) ne joue PAS en doublon.
  const isSE = !loop && (slot === 'se1' || slot === 'se2');
  let bufferForSeq: ArrayBuffer = buffer;
  let noiseTrackIndices: number[] = [];
  if (isSE && songHasNoiseTrack(song, _voicegroup, _vgLookup)) {
    // Lance le noise engine (= LFSR worklet temps-réel avec semantique M4A)
    noiseTrackIndices = await scheduleNoiseSE(song, _voicegroup, _vgLookup, slot);
    // Race-check après await
    if (myGen !== state.generation) return;
    // Strip les noise tracks du buffer MIDI envoyé à spessasynth
    if (noiseTrackIndices.length > 0) {
      const filteredMidi = new Midi(buffer.slice(0));
      for (const idx of noiseTrackIndices) {
        filteredMidi.tracks[idx].notes = [];
      }
      const arr = filteredMidi.toArray();
      const ab = new ArrayBuffer(arr.byteLength);
      new Uint8Array(ab).set(arr);
      bufferForSeq = ab;
      console.log(`[m4a] noise tracks (${noiseTrackIndices.length}) routed to se-noise-engine, stripped from spessasynth MIDI`);
    }
  }

  // SE et BGM passent par le Sequencer. Les SE/PH .mid ont été pre-process
  // (scripts/fix-se-banks.mjs) pour que le CC 0 (bank MSB) soit inline sur
  // la track avec program change, garantissant la propagation cross-track.
  const seq = new Sequencer(state.synth);
  // loadNewSongList prend un tableau de MIDI. On joue 1 song à la fois.
  // Le clone .slice(0) protège le buffer partagé entre playSong successifs.
  seq.loadNewSongList([{ binary: bufferForSeq.slice(0), fileName: 'song.mid' }]);
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

  // (Le scheduling noise SE est fait au-dessus, AVANT seq.play(), via
  // se-noise-engine.ts. Aucun fallback inline ici.)

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

/** Track des AudioWorklet noise nodes per-slot pour mono-cut. */
const _slotNoiseWorklets: Partial<Record<SlotKind, { node: AudioWorkletNode; env: GainNode }[]>> = {};

/** Stop immédiat de la song courante du slot. */
export function stopSong(slot: SlotKind = 'bgm'): void {
  const state = _slots[slot];
  if (!state) return;
  state.generation++;
  // 1:1 décomp m4a.c : m4aMPlayStart override le state du slot, ce qui implicitement
  // cancel tout fade-out en cours. Notre fade utilise un setInterval orphelin qui
  // continue à set masterGain → 0 ET call stopSong à la fin. Sans clear ici, une
  // nouvelle song démarre normalement puis se fait killer ~1s plus tard.
  // Bug user : "BGM du prof ne se lance pas si A pressé trop vite" — title fade
  // était encore en cours quand Birch BGM démarrait, ROUTE122 jouait 1s puis silence.
  const prevFade = _fadeIntervals[slot];
  if (prevFade !== undefined) {
    window.clearInterval(prevFade);
    delete _fadeIntervals[slot];
  }
  if (state.sequencer) {
    try {
      state.sequencer.pause();
      // spessasynth Sequencer n'a pas de "destroy" exposé ; pause + GC suffit.
    } catch { /* already stopped */ }
    state.sequencer = null;
  }
  // CRITIQUE : reset le synth (= mute toutes notes en cours + reset state interne)
  // sinon une nouvelle Sequencer attachée au même synth ne peut pas relancer la
  // même song proprement (= bug "Stop All puis Play A → silence" qui obligeait
  // un refresh page). force=true → flush note-offs même les sustained.
  try {
    state.synth.stopAll(true);
  } catch { /* ignore */ }
  // Stop les noise SE engine nodes actifs sur ce slot.
  stopNoiseSE(slot);
  // Stop les SE pré-rendus actifs sur ce slot.
  stopPrerenderedSE(slot);
  // Stop les LFSR sources legacy actives sur ce slot via env.gain → 0 immédiat.
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

/** Pause la song courante du slot SANS la détruire. La playSong suivante du
 *  MÊME songId pourra resume via `resumeSong(slot)` (= seq.play() sur la même
 *  Sequencer qui resume depuis pausedTime). Utile pour le bouton Play/Pause
 *  toggle du devtool : Pause + Resume marche même quand "Stop + Play same"
 *  ne marche pas (= bug spessasynth/synth state stale). */
export function pauseSong(slot: SlotKind = 'bgm'): void {
  const state = _slots[slot];
  if (!state?.sequencer) return;
  try { state.sequencer.pause(); } catch { /* ignore */ }
}

/** Resume la song courante du slot (qui doit avoir été pausée via `pauseSong`).
 *  No-op si rien n'est pausé. */
export function resumeSong(slot: SlotKind = 'bgm'): void {
  const state = _slots[slot];
  if (!state?.sequencer) return;
  try { state.sequencer.play(); } catch { /* ignore */ }
}

/** True si une song est dans un état pausé (= playing then paused, pas stopped). */
export function isPaused(slot: SlotKind = 'bgm'): boolean {
  const state = _slots[slot];
  if (!state?.sequencer) return false;
  return state.sequencer.paused;
}

/** Stop TOUS les slots (BGM + SE1 + SE2). 1:1 décomp `m4aMPlayAllStop()`. */
export function stopAllSongs(): void {
  stopSong('bgm');
  stopSong('se1');
  stopSong('se2');
}

/** 1:1 décomp `m4aMPlayFadeOut(&gMPlayInfo_BGM, speed)` (cf src/m4a.c:692
 *  FadeOutBody). Fade le master gain du synth BGM vers 0 puis stopSong.
 *
 *  Décomp : fadeOV part de 64 et décroît de 4 chaque "step", un step se déclenche
 *  toutes les `speed` frames. 16 steps × speed frames = totalFrames du fade.
 *  Pour speed=4 (= valeur standard FadeOutBGM(4)) → 64 frames = ~1.07s @ 60Hz.
 *
 *  Marche avec n'importe quel song (loop ou one-shot) car on touche au synth
 *  pas à la sequencer. */
const _fadeIntervals: Partial<Record<SlotKind, number>> = {};
const FADE_STEP_FRAMES = 16; // 64 / 4 = 16 steps de la décomp
const FRAME_MS = 1000 / 60;
function _fade(slot: SlotKind, speed: number, startGain: number, endGain: number, stopAtEnd: boolean): void {
  const state = _slots[slot];
  if (!state?.sequencer) return;
  const prevHandle = _fadeIntervals[slot];
  if (prevHandle !== undefined) window.clearInterval(prevHandle);
  const totalFrames = FADE_STEP_FRAMES * Math.max(1, speed);
  const totalMs = totalFrames * FRAME_MS;
  const stepMs = 33;  // ~30Hz fade resolution (= web audio polling)
  const steps = Math.max(1, Math.ceil(totalMs / stepMs));
  let step = 0;
  // Start at startGain immediately
  try { state.synth.setMasterParameter('masterGain', startGain); } catch { /* ignore */ }
  const handle = window.setInterval(() => {
    step++;
    const t = Math.min(1, step / steps);
    const gain = startGain + (endGain - startGain) * t;
    try { state.synth.setMasterParameter('masterGain', gain); } catch { /* ignore */ }
    if (step >= steps) {
      window.clearInterval(handle);
      delete _fadeIntervals[slot];
      if (stopAtEnd) stopSong(slot);
    }
  }, stepMs);
  _fadeIntervals[slot] = handle;
}

export function fadeOutBgm(speed: number): void {
  // Spessasynth default masterGain ≈ 0.8125 (cf playSong setMasterParameter).
  _fade('bgm', speed, 0.8125, 0, true);
}

/** 1:1 décomp `m4aMPlayFadeIn(&gMPlayInfo_BGM, speed)`. */
export function fadeInBgm(speed: number): void {
  _fade('bgm', speed, 0, 0.8125, false);
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
  volumeRamps: { time: number; value: number }[] = [],
  slot: SlotKind = 'se1',
): void {
  const ctx = getAudioContext();
  if (!_noiseWorkletAdded) {
    console.warn('[m4a-noise] worklet not loaded yet — skip note');
    return;
  }
  console.log(`[m4a-noise] LFSR worklet fire: midi=${midiNote} freq=${midiNoteToNoiseFreq(midiNote).toFixed(0)}Hz dur=${duration.toFixed(2)}s 7bit=${(voice.period ?? 0) & 1}`);
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
  // 0.15 = empirique : le noise hardware GBA est faible vs DS sample (mixer
  // SOUNDCNT_H : PSG = 25-100% selon bits, DS = full). 0.4 était trop fort.
  const sustainNorm = (voice.envelope.sustain / 15) * velNorm * 0.15;
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
  // Volume ramps (= CC7 events de la track MIDI). Applique linear ramps sur env.gain
  // pendant la note. Le sustainNorm est le 100% baseline ; CC7 (0-1) le scale.
  // Filtre les events qui sont AVANT le noteOn (= startup CC) pour les appliquer
  // immédiatement au noteOn time.
  const noteOff = when + duration;
  let lastCcVal = 1.0;
  for (const cc of volumeRamps) {
    const ccTime = when + cc.time;
    if (ccTime <= when) {
      lastCcVal = cc.value;
      continue;
    }
    if (ccTime >= noteOff) break;
    env.gain.linearRampToValueAtTime(sustainNorm * cc.value, ccTime);
    lastCcVal = cc.value;
  }
  // Sustain final value au noteOff (= dernière CC7 appliquée).
  env.gain.setValueAtTime(sustainNorm * lastCcVal, noteOff);
  // Release : ramp linéaire à 0.
  env.gain.linearRampToValueAtTime(0, noteOff + releaseSec);

  node.connect(env);
  env.connect(getMasterGain());

  // MONO-CUT 1:1 GBA noise channel : avant de spawn cette nouvelle worklet,
  // force gain à 0 sur tous les workletNodes précédents du même slot
  // (= cut hard les LFSR en cours, comme hardware GBA cut au noteOn nouvelle note).
  const prevList = _slotNoiseWorklets[slot];
  if (prevList) {
    for (const { env: prevEnv } of prevList) {
      try {
        prevEnv.gain.cancelScheduledValues(when);
        prevEnv.gain.setValueAtTime(0, when);
      } catch { /* ignore */ }
    }
  }

  // Track ce node dans le slot pour cleanup futur.
  if (!_slotNoiseWorklets[slot]) _slotNoiseWorklets[slot] = [];
  const entry = { node, env };
  _slotNoiseWorklets[slot]!.push(entry);

  // Cleanup : disconnect node après que le gain atteint 0 (sinon le worklet
  // continue à tourner CPU pour rien). AudioWorkletNode n'a pas de stop().
  const stopMs = Math.max(50, (noteOff + releaseSec + 0.05 - ctx.currentTime) * 1000);
  window.setTimeout(() => {
    try { node.disconnect(); } catch { /* already disconnected */ }
    try { env.disconnect(); } catch { /* already disconnected */ }
    const list = _slotNoiseWorklets[slot];
    if (list) {
      const idx = list.indexOf(entry);
      if (idx >= 0) list.splice(idx, 1);
    }
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

/** Vrai si une song est en cours sur le slot donné (= playing OR paused, mais
 *  PAS finished/stopped). gMPlayInfo_BGM.status lit ce check pour le demo loop
 *  décomp : status=0 quand isFinished → trigger fade vers copyright/intro. */
export function isPlaying(slot: SlotKind = 'bgm'): boolean {
  const state = _slots[slot];
  if (!state?.sequencer) return false;
  // isFinished = true quand la song non-loopée a atteint sa fin naturelle.
  // Une song pausée a paused=true mais isFinished=false → toujours "playing".
  return !state.sequencer.isFinished;
}
