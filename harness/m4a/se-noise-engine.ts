/**
 * M4A noise channel SE engine — 1:1 décomp pokeemeraude src/m4a.c.
 *
 * Module standalone pour les SE qui utilisent le noise channel (= type 4 et
 * type 12 / `voice_noise` et `voice_noise_alt` dans les voicegroups).
 *
 * Pourquoi un engine séparé ? spessasynth_lib + SF2 ne reproduit pas le
 * LFSR continu hardware GBA — il joue le sample SF2 ripped (= slice fixe
 * qui loop = "buzzer"). On bypass spessasynth pour les noise tracks et on
 * pilote directement l'AudioWorklet `m4a-noise-lfsr` qui fait du LFSR
 * temps-réel.
 *
 * Features 1:1 hardware reproduites depuis m4a.c :
 *   - LFSR 15-bit/7-bit selon `voice.period` (m4a.c:825)
 *   - Pitch bend par steps de semitone (m4a.c:793-803, key = x >> 8 = floor)
 *   - BENDR (bend range) via CC20 (mid2agb agb.cpp:383)
 *   - VOL (volume modulation) via CC7
 *   - ADSR envelope CGB (m4a.c CgbModVol, attack/decay/sustain/release en
 *     steps 1/60s)
 *   - Mono-cut entre notes successives (= NR44 trigger reset 1:1 hardware
 *     noise channel mono)
 *
 * NB : on n'implémente PAS le pseudo-echo (très peu utilisé pour les SE) ni
 * les LFO modulations (= MOD/MODT/LFOS commands).
 */
import type { Midi } from '@tonejs/midi';
import type { VoiceGroup } from './voice-types';
import type { VoiceGroupLookup } from './voice-resolver';
import { resolveVoice } from './voice-resolver';
import { midiNoteToNoiseFreq } from './noise-engine';
import { getAudioContext, getMasterGain } from './audio-context';

export type SlotKind = 'bgm' | 'se1' | 'se2';

const NOISE_WORKLET_URL = '/m4a-noise-lfsr-processor.js';

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

/** Per-slot tracking pour mono-cut entre noise notes successives. */
const _slotActive: Partial<Record<SlotKind, { node: AudioWorkletNode; env: GainNode }[]>> = {};

interface NoiseVoice {
  type: 'noise' | 'noise_alt';
  period?: number;
  envelope: { attack: number; decay: number; sustain: number; release: number };
}

interface PitchBend { time: number; value: number; }
interface CC { time: number; value: number; }
interface MidiNote { midi: number; velocity: number; time: number; duration: number; }

/**
 * Détecte si la song contient au moins une track avec voice noise/noise_alt.
 * Utilisé par le caller pour décider si appeler scheduleNoiseSE().
 */
export function songHasNoiseTrack(
  song: Midi,
  voicegroup: VoiceGroup,
  vgLookup: VoiceGroupLookup,
): boolean {
  for (const track of song.tracks) {
    if (track.notes.length === 0) continue;
    const program = track.instrument?.number ?? 0;
    const voice = resolveVoice(voicegroup, program, track.notes[0].midi, vgLookup);
    if (voice?.type === 'noise' || voice?.type === 'noise_alt') return true;
  }
  return false;
}

/**
 * Schedule toutes les noise notes de la song avec semantique M4A complète.
 * Retourne les indices des tracks traités (= caller doit les strip du MIDI
 * envoyé à spessasynth pour éviter qu'il joue le sample SF2 en parallèle).
 */
export async function scheduleNoiseSE(
  song: Midi,
  voicegroup: VoiceGroup,
  vgLookup: VoiceGroupLookup,
  slot: SlotKind,
): Promise<number[]> {
  const ctx = getAudioContext();
  await ensureNoiseWorklet(ctx);
  const startTime = ctx.currentTime + 0.005;
  const noiseTrackIndices: number[] = [];

  for (let i = 0; i < song.tracks.length; i++) {
    const track = song.tracks[i];
    if (track.notes.length === 0) continue;
    const program = track.instrument?.number ?? 0;
    const voice = resolveVoice(voicegroup, program, track.notes[0].midi, vgLookup);
    if (voice?.type !== 'noise' && voice?.type !== 'noise_alt') continue;
    noiseTrackIndices.push(i);

    // BENDR via CC20 (1:1 mid2agb agb.cpp:383). Default 2 si absent.
    const cc20Events = track.controlChanges?.[20] || [];
    const bendRange = cc20Events.length > 0
      ? Math.round(cc20Events[0].value * 127)
      : 2;
    const pitchBends: PitchBend[] = (track.pitchBends || [])
      .slice()
      .sort((a, b) => a.time - b.time)
      .map(pb => ({ time: pb.time, value: pb.value }));
    const cc7Events: CC[] = (track.controlChanges?.[7] || [])
      .slice()
      .sort((a, b) => a.time - b.time)
      .map(cc => ({ time: cc.time, value: cc.value }));

    for (const note of track.notes) {
      schedulePnNote({
        note,
        voice: voice as unknown as NoiseVoice,
        bendRange,
        pitchBends,
        cc7Events,
        baseTime: startTime,
        slot,
      });
    }
  }
  return noiseTrackIndices;
}

interface PnNoteParams {
  note: MidiNote;
  voice: NoiseVoice;
  bendRange: number;
  pitchBends: PitchBend[];
  cc7Events: CC[];
  baseTime: number;
  slot: SlotKind;
}

function schedulePnNote(p: PnNoteParams): void {
  const ctx = getAudioContext();
  const noteStart = p.baseTime + p.note.time;
  const noteEnd = noteStart + p.note.duration;
  const periodVal = p.voice.period ?? 0;
  const is7bit = (periodVal & 1) === 1;

  const node = new AudioWorkletNode(ctx, 'm4a-noise-lfsr', {
    numberOfInputs: 0,
    numberOfOutputs: 1,
    outputChannelCount: [1],
  });
  const freqParam = node.parameters.get('frequency');
  const is7bitParam = node.parameters.get('is7bit');
  if (is7bitParam) is7bitParam.setValueAtTime(is7bit ? 1 : 0, noteStart);

  // ─── FREQUENCY : pitch bend steps 1:1 hardware ──────────────────────────
  // Hardware: chaque pitch bend event = NR43 rewrite = freq jump (pas de ramp).
  // On reproduit ça via setValueAtTime (= step). bend → semitone shift via
  // formula `(track->bend * track->bendRange) * 4 / 256` puis x>>8 = Math.floor.
  if (freqParam) {
    // Initial bend value à note start = dernier bend event AVANT noteStart
    let initBend = 0;
    for (const pb of p.pitchBends) {
      if (pb.time <= p.note.time) initBend = pb.value;
      else break;
    }
    const initBentMidi = p.note.midi + initBend * p.bendRange;
    const initFreq = midiNoteToNoiseFreq(Math.floor(initBentMidi));
    freqParam.setValueAtTime(initFreq, noteStart);
    // Stepwise pour chaque bend event dans la window de la note
    for (const pb of p.pitchBends) {
      if (pb.time < p.note.time) continue;
      if (pb.time > p.note.time + p.note.duration) break;
      const t = p.baseTime + pb.time;
      const bentMidi = p.note.midi + pb.value * p.bendRange;
      const freq = midiNoteToNoiseFreq(Math.floor(bentMidi));
      freqParam.setValueAtTime(freq, t);
    }
  }

  // ─── ENVELOPE ADSR + CC7 modulation ─────────────────────────────────────
  const env = ctx.createGain();
  const velocity = Math.round(p.note.velocity * 127);
  const velNorm = velocity / 127;
  // 0.08 = empirique réduit (était 0.15). Le LFSR digital sans filtrage
  // analog speaker GBA sonne saturé à 0.15 sur enceintes modernes.
  const sustainNorm = (p.voice.envelope.sustain / 15) * velNorm * 0.08;
  const attackSec = p.voice.envelope.attack > 0 ? p.voice.envelope.attack / 60 : 0;
  const decaySec = p.voice.envelope.decay > 0 ? p.voice.envelope.decay / 60 : 0.005;
  const releaseSec = p.voice.envelope.release > 0 ? p.voice.envelope.release / 60 : 0.04;

  // Pre-noteStart : silent
  env.gain.setValueAtTime(0, Math.max(0, noteStart - 0.001));
  // Attack ramp 0 → velNorm
  if (attackSec > 0) {
    env.gain.setValueAtTime(0, noteStart);
    env.gain.linearRampToValueAtTime(velNorm, noteStart + attackSec);
  } else {
    env.gain.setValueAtTime(velNorm, noteStart);
  }
  // Decay ramp velNorm → sustainNorm
  env.gain.linearRampToValueAtTime(sustainNorm, noteStart + attackSec + decaySec);

  // CC7 modulation pendant sustain : track current cc value at noteStart
  let lastCcVal = 1.0;
  for (const cc of p.cc7Events) {
    if (cc.time <= p.note.time) lastCcVal = cc.value;
    else break;
  }
  // Apply CC7 events after attack+decay phase
  const sustainStart = noteStart + attackSec + decaySec;
  for (const cc of p.cc7Events) {
    if (cc.time < p.note.time) continue;
    const ccTime = p.baseTime + cc.time;
    if (ccTime >= noteEnd) break;
    if (ccTime <= sustainStart) {
      lastCcVal = cc.value;
      continue;
    }
    env.gain.linearRampToValueAtTime(sustainNorm * cc.value, ccTime);
    lastCcVal = cc.value;
  }
  // Sustain final value au noteOff
  env.gain.setValueAtTime(sustainNorm * lastCcVal, noteEnd);
  // Release ramp à 0
  env.gain.linearRampToValueAtTime(0, noteEnd + releaseSec);

  // ─── MONO-CUT 1:1 hardware noise channel ────────────────────────────────
  // Hardware noise = single channel mono. New noteOn → previous LFSR cut.
  // On force gain à 0 sur tous les workletNodes précédents AU TIMESTAMP de
  // cette nouvelle note (= scheduling-aware).
  const prevList = _slotActive[p.slot];
  if (prevList) {
    for (const { env: prevEnv } of prevList) {
      try {
        prevEnv.gain.cancelScheduledValues(noteStart);
        prevEnv.gain.setValueAtTime(0, noteStart);
      } catch { /* ignore */ }
    }
  }

  // ─── Low-pass filter ~6kHz pour simuler frequency response speaker GBA ──
  // Le speaker tinny GBA filtre naturellement les highs > ~6kHz. Sans ça,
  // le LFSR digital pur sonne "harsh" / "souffle dans le mic" sur enceintes
  // modernes alors que sur GBA original le son est plus "doux".
  const lowpass = ctx.createBiquadFilter();
  lowpass.type = 'lowpass';
  lowpass.frequency.value = 6000;
  lowpass.Q.value = 0.707; // Butterworth (= no resonance peak)

  // Wire it up : worklet → lowpass → env (gain) → masterGain
  node.connect(lowpass);
  lowpass.connect(env);
  env.connect(getMasterGain());

  // Track active for future mono-cut + cleanup
  if (!_slotActive[p.slot]) _slotActive[p.slot] = [];
  const entry = { node, env };
  _slotActive[p.slot]!.push(entry);

  const stopMs = Math.max(50, (noteEnd + releaseSec + 0.05 - ctx.currentTime) * 1000);
  window.setTimeout(() => {
    try { node.disconnect(); } catch { /* ignore */ }
    try { env.disconnect(); } catch { /* ignore */ }
    const list = _slotActive[p.slot];
    if (list) {
      const idx = list.indexOf(entry);
      if (idx >= 0) list.splice(idx, 1);
    }
  }, stopMs);
}

/** Stop tous les noise nodes actifs sur le slot. Appelé par stopSong(). */
export function stopNoiseSE(slot: SlotKind): void {
  const list = _slotActive[slot];
  if (!list || list.length === 0) return;
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  for (const { env } of list) {
    try {
      env.gain.cancelScheduledValues(now);
      env.gain.setValueAtTime(0, now);
    } catch { /* ignore */ }
  }
  _slotActive[slot] = [];
}
