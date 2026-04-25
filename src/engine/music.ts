/**
 * Lecteur MIDI authentique Pokémon Emeraude.
 *
 * Pipeline :
 *   1. Charge voicegroups.json + samples.json + keysplits.json + song-voicegroups.json
 *      (extraits par scripts/extract-voicegroups.mjs).
 *   2. Pour chaque song, résout son voicegroup (ex: mus_littleroot → voicegroup_littleroot).
 *   3. Pour chaque note MIDI, résout le voice (program + note → voice_square_X ou
 *      voice_directsound_X ou keysplit).
 *   4. Instancie dynamiquement un instrument Tone (Synth pulse, Sampler, NoiseSynth)
 *      par voice unique, cache et réutilise.
 *   5. Joue via Tone.Part avec loop natif.
 *
 * Limites :
 *   - Enveloppes GBA 4bit/8bit approximées (pas de courbe hardware exacte).
 *   - Pas de support voice_programmable_wave (silence).
 *   - Pas de pitch sweep pour square_1.
 *   - Timing web audio ≠ timing GBA (petit jitter possible).
 */
import * as Tone from 'tone';
import { Midi } from '@tonejs/midi';

interface VoiceBase { rootKey?: number; pan?: number; a?: number; d?: number; s?: number; r?: number; }
interface VoiceSquare extends VoiceBase { type: 'square'; duty: number; }
interface VoiceDirect extends VoiceBase { type: 'directsound'; sample: string; resample: boolean; }
interface VoiceNoise extends VoiceBase { type: 'noise'; }
interface VoicePWave extends VoiceBase { type: 'pwave'; }
interface VoiceKeysplit { type: 'keysplit'; target: string; split: string; }
interface VoiceKeysplitAll { type: 'keysplit_all'; target: string; }
interface VoiceUnknown { type: 'unknown'; op: string; }
type Voice = VoiceSquare | VoiceDirect | VoiceNoise | VoicePWave | VoiceKeysplit | VoiceKeysplitAll | VoiceUnknown;

interface VoicegroupData { start: number; voices: Voice[]; }
type VoicegroupsMap = Record<string, VoicegroupData>;
type SamplesMap = Record<string, string>;
type KeysplitsMap = Record<string, Record<string, number>>;
type SongVoicegroupsMap = Record<string, string>;

let started = false;
let voicegroups: VoicegroupsMap | null = null;
let samples: SamplesMap | null = null;
let keysplits: KeysplitsMap | null = null;
let songVoicegroups: SongVoicegroupsMap | null = null;

let currentPart: Tone.Part | null = null;
let currentMidiUrl: string | null = null;

type Instrument =
  | { kind: 'poly'; synth: Tone.PolySynth<Tone.Synth>; rootKey: number }
  | { kind: 'sampler'; sampler: Tone.Sampler; rootKey: number }
  | { kind: 'noise'; noise: Tone.NoiseSynth };
const instrumentCache = new Map<string, Instrument>();

// GBA envelope encodé sur 4-8 bits → Tone.js (secondes / ratio).
function gbaEnv(a = 0, d = 0, s = 15, r = 0): { attack: number; decay: number; sustain: number; release: number } {
  const isBig = a > 15 || d > 15 || s > 15 || r > 15;
  const scale = isBig ? 255 : 15;
  return {
    attack: Math.max(0.003, ((scale - a) / scale) * 0.2),
    decay: Math.max(0.01, ((scale - d) / scale) * 0.3),
    sustain: Math.min(1, Math.max(0, s / scale)),
    release: Math.max(0.01, ((scale - r) / scale) * 0.4)
  };
}

async function loadData(): Promise<void> {
  if (voicegroups) return;
  const base = '/decomp/em/music/';
  const [vg, sm, ks, sv] = await Promise.all([
    fetch(base + 'voicegroups.json').then(r => r.json()),
    fetch(base + 'samples.json').then(r => r.json()),
    fetch(base + 'keysplits.json').then(r => r.json()),
    fetch(base + 'song-voicegroups.json').then(r => r.json())
  ]);
  voicegroups = vg; samples = sm; keysplits = ks; songVoicegroups = sv;
}

export async function primeAudio(): Promise<void> {
  if (started) return;
  await Tone.start();
  await loadData();
  started = true;
}

function resolveVoice(vgName: string, program: number, note: number): Voice | null {
  const vg = voicegroups?.[vgName];
  if (!vg) return null;
  const v = vg.voices[program - (vg.start ?? 0)] ?? vg.voices[program];
  if (!v) return null;
  if (v.type === 'keysplit_all') {
    const target = voicegroups?.[v.target];
    if (!target) return null;
    return target.voices[note - (target.start ?? 0)] ?? null;
  }
  if (v.type === 'keysplit') {
    const split = keysplits?.[v.split];
    const slot = split?.[String(note)];
    if (slot === undefined) return null;
    const target = voicegroups?.[v.target];
    return target?.voices[slot] ?? null;
  }
  return v;
}

function voiceHash(v: Voice): string | null {
  if (v.type === 'square') return `sq|${v.duty}|${v.a}|${v.d}|${v.s}|${v.r}`;
  if (v.type === 'directsound') return `ds|${v.sample}|${v.rootKey}|${v.a}|${v.d}|${v.s}|${v.r}|${v.resample ? 1 : 0}`;
  if (v.type === 'noise') return `ns|${v.a}|${v.d}|${v.s}|${v.r}`;
  return null;
}

async function getOrCreateInstrument(v: Voice): Promise<Instrument | null> {
  const h = voiceHash(v);
  if (!h) return null;
  const cached = instrumentCache.get(h);
  if (cached) return cached;

  // À ce stade v est forcément square/directsound/noise (voiceHash filtre le reste)
  const vb = v as VoiceSquare | VoiceDirect | VoiceNoise;
  const env = gbaEnv(vb.a, vb.d, vb.s, vb.r);
  const rootKey = vb.rootKey ?? 60;

  if (v.type === 'square') {
    const widths = [0.125, 0.25, 0.5, 0.75];
    const width = widths[v.duty] ?? 0.5;
    const synth = new Tone.PolySynth(Tone.Synth, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      oscillator: { type: 'pulse', width } as any,
      envelope: env
    }).toDestination();
    synth.volume.value = -16;
    const inst: Instrument = { kind: 'poly', synth, rootKey };
    instrumentCache.set(h, inst);
    return inst;
  }
  if (v.type === 'directsound') {
    const samplePath = samples?.[v.sample];
    if (!samplePath) return null;
    const noteName = Tone.Frequency(rootKey, 'midi').toNote();
    const sampler = new Tone.Sampler({
      urls: { [noteName]: samplePath },
      baseUrl: '/decomp/em/',
      attack: env.attack,
      release: env.release
    }).toDestination();
    sampler.volume.value = -12;
    await Tone.loaded();
    const inst: Instrument = { kind: 'sampler', sampler, rootKey };
    instrumentCache.set(h, inst);
    return inst;
  }
  if (v.type === 'noise') {
    const noise = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: env
    }).toDestination();
    noise.volume.value = -18;
    const inst: Instrument = { kind: 'noise', noise };
    instrumentCache.set(h, inst);
    return inst;
  }
  return null;
}

function songNameFromUrl(url: string): string {
  const base = url.split('/').pop() ?? '';
  return base.replace(/\.mid$/i, '');
}

interface PlayEvent {
  time: number; note: number; duration: number; velocity: number; program: number;
}

export async function playMidiLoop(url: string): Promise<void> {
  if (!started || !voicegroups) return;
  // Déjà en train de jouer cette musique → ne pas relancer (évite coupure au warp inter-map)
  if (currentPart && currentMidiUrl === url) return;
  stopMusic();
  currentMidiUrl = url;

  const songName = songNameFromUrl(url);
  const vgName = songVoicegroups?.[songName];
  if (!vgName) { console.warn('[music] voicegroup introuvable pour', songName); return; }

  try {
    const midi = await Midi.fromUrl(url);
    const events: PlayEvent[] = [];
    for (const track of midi.tracks) {
      const program = track.instrument.number ?? 0;
      for (const n of track.notes) {
        events.push({
          time: n.time,
          note: Math.round(n.midi),
          duration: Math.max(0.04, Math.min(4, n.duration)),
          velocity: n.velocity,
          program
        });
      }
    }
    if (events.length === 0) return;
    events.sort((a, b) => a.time - b.time);

    // Pré-résolution + pré-instantiation des instruments uniques
    const uniqueVoices = new Map<string, Voice>();
    for (const ev of events) {
      const v = resolveVoice(vgName, ev.program, ev.note);
      if (!v) continue;
      const h = voiceHash(v);
      if (h && !uniqueVoices.has(h)) uniqueVoices.set(h, v);
    }
    await Promise.all([...uniqueVoices.values()].map(v => getOrCreateInstrument(v)));

    currentPart = new Tone.Part<PlayEvent>((time, ev) => {
      const v = resolveVoice(vgName, ev.program, ev.note);
      if (!v) return;
      const h = voiceHash(v);
      if (!h) return;
      const inst = instrumentCache.get(h);
      if (!inst) return;
      if (inst.kind === 'poly') {
        inst.synth.triggerAttackRelease(
          Tone.Frequency(ev.note, 'midi').toFrequency(),
          ev.duration, time, ev.velocity
        );
      } else if (inst.kind === 'sampler') {
        inst.sampler.triggerAttackRelease(
          Tone.Frequency(ev.note, 'midi').toNote(),
          ev.duration, time, ev.velocity
        );
      } else if (inst.kind === 'noise') {
        inst.noise.triggerAttackRelease(ev.duration, time, ev.velocity);
      }
    }, events).start(0);

    currentPart.loop = true;
    // Utilise la fin de la dernière note comme point de loop (GBA n'encode pas
    // explicitement de loop point dans le MIDI, mais toute la piste est loopée).
    currentPart.loopEnd = Math.max(1, midi.duration);
    if (Tone.Transport.state !== 'started') Tone.Transport.start();
  } catch (err) {
    console.warn('[music] échec lecture', url, err);
  }
}

export function stopMusic(): void {
  if (currentPart) {
    currentPart.stop();
    currentPart.dispose();
    currentPart = null;
  }
  currentMidiUrl = null;
}

export function isAudioPrimed(): boolean { return started; }
