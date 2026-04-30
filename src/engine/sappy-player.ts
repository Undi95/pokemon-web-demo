/**
 * Sappy/m4a player Web Audio API direct — port fidèle du moteur audio GBA.
 *
 * Référence : `sound/m4a*.c` du décomp + `include/gba/m4a_internal.h` + agbplay.
 * Cf. SAPPY_MUSIC_REFERENCE.md.
 *
 * Architecture :
 *   1. AudioContext master (32 kHz proche du SOUND_MODE_FREQ_31536 GBA)
 *   2. Pre-built buffers PSG square (4 duty cycles) + white noise
 *   3. DirectSound samples (.wav) loadés on-demand
 *   4. Per-note : AudioBufferSourceNode + GainNode + StereoPannerNode + ADSR ramps
 *   5. Voice stealing (12 max simultanées, drop oldest)
 *   6. MIDI parsing via @tonejs/midi → scheduler via AudioContext.currentTime
 *
 * Améliorations vs ancien music.ts (Tone.js) :
 *   - Vrai PSG square wave (pas un PolySynth pulse approximé)
 *   - ADSR avec courbe exponentielle (attack/release) + linear (decay)
 *   - Voice stealing fidèle
 *   - Pitch via detune (cents) au lieu de Sampler stretch
 *   - Latency mieux contrôlée (currentTime scheduling natif)
 */
import { Midi } from '@tonejs/midi';

interface VoiceBase { rootKey?: number; pan?: number; a?: number; d?: number; s?: number; r?: number | null; }
interface VoiceSquare extends VoiceBase { type: 'square'; duty: number; }
interface VoiceDirect extends VoiceBase { type: 'directsound'; sample: string; resample: boolean; }
interface VoiceNoise extends VoiceBase { type: 'noise'; }
interface VoicePWave extends VoiceBase { type: 'pwave'; sample?: string; }
interface VoiceKeysplit { type: 'keysplit'; target: string; split: string; }
interface VoiceKeysplitAll { type: 'keysplit_all'; target: string; }
interface VoiceUnknown { type: 'unknown'; op: string; }
type Voice = VoiceSquare | VoiceDirect | VoiceNoise | VoicePWave | VoiceKeysplit | VoiceKeysplitAll | VoiceUnknown;

interface VoicegroupData { start: number; voices: Voice[]; }
type VoicegroupsMap = Record<string, VoicegroupData>;
type SamplesMap = Record<string, string>;
type KeysplitsMap = Record<string, Record<string, number>>;
type SongVoicegroupsMap = Record<string, string>;

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let started = false;
let voicegroups: VoicegroupsMap | null = null;
let samples: SamplesMap | null = null;
let keysplits: KeysplitsMap | null = null;
let songVoicegroups: SongVoicegroupsMap | null = null;

// ─── Buffers PSG pré-générés ────────────────────────────────────────────────
// Duty cycles GBA : 0=12.5%, 1=25%, 2=50%, 3=75% (cf. m4a hardware spec).
let psgSquareBuffers: AudioBuffer[] = [];
let psgNoiseBuffer: AudioBuffer | null = null;
// Programmable wave buffers : 25 wavetables 32 nibbles loadées depuis pwave-samples.json.
const pwaveBuffers = new Map<string, AudioBuffer>();
let pwaveData: Record<string, number[]> | null = null;

// Cache de samples directsound chargés (URL → AudioBuffer).
const sampleBufferCache = new Map<string, AudioBuffer>();
const sampleLoadPromises = new Map<string, Promise<AudioBuffer | null>>();

// ─── Channels GBA authentiques ──────────────────────────────────────────────
// Le GBA a 6 channels audio matériels :
//   - Square 1 (PSG, sweep)
//   - Square 2 (PSG)
//   - Wave (PSG, programmable wavetable 32 nibbles)
//   - Noise (PSG, LFSR)
//   - DirectSound A (PCM)
//   - DirectSound B (PCM)
// Chaque channel joue UNE note à la fois. Polyphonie max = 6.
// Cf. m4a_internal.h + GBA hardware spec.
interface ActiveVoice {
  source: AudioBufferSourceNode;
  gainNode: GainNode;
  startTime: number;
  endTime: number;
}
type ChannelId = 'square1' | 'square2' | 'wave' | 'noise' | 'dsA' | 'dsB';
const channels: Record<ChannelId, ActiveVoice | null> = {
  square1: null, square2: null, wave: null, noise: null, dsA: null, dsB: null,
};

function isExpired(v: ActiveVoice | null, now: number): boolean {
  return !v || v.endTime <= now;
}

/** Alloue un channel pour un type de voix donné. Si tous busy, retourne le
 *  channel le plus VIEUX (= note la plus ancienne) à voler.
 *  Reproduit le voice stealing m4a (priority-based dans le décomp). */
function allocChannel(voiceType: string, now: number): ChannelId | null {
  if (voiceType === 'square') {
    if (isExpired(channels.square1, now)) return 'square1';
    if (isExpired(channels.square2, now)) return 'square2';
    // Both busy → steal older
    return channels.square1!.startTime < channels.square2!.startTime ? 'square1' : 'square2';
  }
  if (voiceType === 'pwave') return 'wave';
  if (voiceType === 'noise') return 'noise';
  if (voiceType === 'directsound') {
    if (isExpired(channels.dsA, now)) return 'dsA';
    if (isExpired(channels.dsB, now)) return 'dsB';
    return channels.dsA!.startTime < channels.dsB!.startTime ? 'dsA' : 'dsB';
  }
  return null;
}

/** Stop la voice courante du channel (release rapide pour éviter click). */
function releaseChannel(chId: ChannelId, atTime: number) {
  const v = channels[chId];
  if (!v) return;
  try {
    v.gainNode.gain.cancelScheduledValues(atTime);
    v.gainNode.gain.setValueAtTime(v.gainNode.gain.value, atTime);
    v.gainNode.gain.linearRampToValueAtTime(0, atTime + 0.005);
    v.source.stop(atTime + 0.01);
  } catch {/* ignore */}
  channels[chId] = null;
}

// Song state.
let currentMidiUrl: string | null = null;
let scheduledEvents: number[] = []; // setTimeout IDs

// ─── PSG buffer generators ──────────────────────────────────────────────────

/** Génère un AudioBuffer mono 1 cycle de square wave avec duty donné. */
function generateSquareBuffer(audioCtx: AudioContext, duty: number, freq = 440, sampleRate = 32000): AudioBuffer {
  // 1 cycle complet à freq Hz : N samples = sampleRate / freq
  const cycleSamples = Math.floor(sampleRate / freq);
  // Boucle sur 4 cycles pour réduire la fréquence d'edge clicks
  const totalSamples = cycleSamples * 8;
  const buf = audioCtx.createBuffer(1, totalSamples, sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < totalSamples; i++) {
    const phase = (i % cycleSamples) / cycleSamples;
    data[i] = phase < duty ? 0.5 : -0.5;
  }
  return buf;
}

/** Génère un buffer de bruit blanc (pour PSG noise channel). */
function generateNoiseBuffer(audioCtx: AudioContext, sampleRate = 32000): AudioBuffer {
  const totalSamples = sampleRate * 2; // 2 secondes
  const buf = audioCtx.createBuffer(1, totalSamples, sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < totalSamples; i++) data[i] = Math.random() * 2 - 1;
  return buf;
}

// ─── Init ──────────────────────────────────────────────────────────────────

async function loadData(): Promise<void> {
  if (voicegroups) return;
  const base = '/decomp/em/music/';
  const [vg, sm, ks, sv, pw] = await Promise.all([
    fetch(base + 'voicegroups.json').then(r => r.json()),
    fetch(base + 'samples.json').then(r => r.json()),
    fetch(base + 'keysplits.json').then(r => r.json()),
    fetch(base + 'song-voicegroups.json').then(r => r.json()),
    fetch(base + 'pwave-samples.json').then(r => r.json()).catch(() => ({})),
  ]);
  voicegroups = vg; samples = sm; keysplits = ks; songVoicegroups = sv;
  pwaveData = pw;
}

/** Génère un AudioBuffer wavetable depuis nibbles 4-bit (32 samples). */
function getPwaveBuffer(audioCtx: AudioContext, sampleId: string): AudioBuffer | null {
  const cached = pwaveBuffers.get(sampleId);
  if (cached) return cached;
  const nibbles = pwaveData?.[sampleId];
  if (!nibbles || nibbles.length === 0) return null;
  // Loop le wavetable 8 fois pour réduire les clicks d'edge.
  // Sample rate cible : la wavetable 32 samples = 1 cycle. À 32kHz, freq = 1000Hz natif.
  // On veut freq native = 440Hz → 32k/440 = 72 samples/cycle. On stretch les 32 nibbles à 72.
  const cycleSamples = Math.round(32000 / 440);
  const totalSamples = cycleSamples * 8;
  const buf = audioCtx.createBuffer(1, totalSamples, 32000);
  const data = buf.getChannelData(0);
  for (let i = 0; i < totalSamples; i++) {
    const phase = (i % cycleSamples) / cycleSamples;
    const nibbleIdx = Math.floor(phase * nibbles.length);
    const v = nibbles[nibbleIdx] ?? 7;
    data[i] = (v - 7.5) / 8; // [-0.94, +0.94]
  }
  pwaveBuffers.set(sampleId, buf);
  return buf;
}

export async function primeAudio(): Promise<void> {
  if (started) return;
  try {
    // Note: 32kHz est un hint, le browser peut ignorer (utilise alors 44.1k/48k).
    ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 32000 });
  } catch {
    ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  // Resume si suspended (autoplay policy nécessite user gesture).
  if (ctx.state === 'suspended') {
    try { await ctx.resume(); } catch (e) { console.warn('[sappy] ctx.resume fail', e); }
  }
  masterGain = ctx.createGain();
  masterGain.gain.value = 0.4;
  // Compressor pour éviter le clipping quand plusieurs voices se superposent.
  // Le GBA a 4 PSG + 2 DirectSound canaux MAX, mix avec saturation hardware
  // limitée. En Web Audio sans limit, 12 voices à peak 0.25 chacune saturent.
  const compressor = ctx.createDynamicsCompressor();
  compressor.threshold.value = -18;
  compressor.knee.value = 8;
  compressor.ratio.value = 4;
  compressor.attack.value = 0.003;
  compressor.release.value = 0.1;
  masterGain.connect(compressor);
  compressor.connect(ctx.destination);
  // Pré-génère les buffers PSG aux freq exactes
  const duties = [0.125, 0.25, 0.5, 0.75];
  psgSquareBuffers = duties.map(d => generateSquareBuffer(ctx!, d));
  psgNoiseBuffer = generateNoiseBuffer(ctx);
  await loadData();
  started = true;
  console.log('[sappy] ready, ctx:', ctx.state, 'rate:', ctx.sampleRate);
  // Expose testBeep à console pour debug
  (window as any).testBeep = testBeep;
  (window as any).sappyStatus = () => ({
    started, ctxState: ctx?.state, currentMidiUrl,
    channels: Object.fromEntries(Object.entries(channels).map(([k, v]) => [k, v ? 'busy' : 'free'])),
    scheduledEvents: scheduledEvents.length,
  });
}

export function isAudioPrimed(): boolean { return started; }

// ─── Voice resolution (du MIDI program → Voice via voicegroup) ──────────────

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

// ─── Sample loader ──────────────────────────────────────────────────────────

async function loadSample(samplePath: string): Promise<AudioBuffer | null> {
  if (!ctx) return null;
  const cached = sampleBufferCache.get(samplePath);
  if (cached) return cached;
  const pending = sampleLoadPromises.get(samplePath);
  if (pending) return pending;
  const url = '/decomp/em/' + samplePath;
  const promise = fetch(url)
    .then(r => r.arrayBuffer())
    .then(buf => ctx!.decodeAudioData(buf))
    .then(decoded => { sampleBufferCache.set(samplePath, decoded); return decoded; })
    .catch(err => { console.warn('[sappy] sample load fail', samplePath, err); return null; });
  sampleLoadPromises.set(samplePath, promise);
  return promise;
}

// ─── Envelope GBA-style ─────────────────────────────────────────────────────

/**
 * ADSR avec encodage différent selon channel (PSG 4-bit vs DirectSound 8-bit).
 *
 * **PSG (square/noise)** : valeurs 0-15 (m4a CGB encoding)
 *   - a=0 → INSTANT attack (pas d'envelope, full vol immédiat)
 *   - a=1-15 → rate (plus haut = plus rapide)
 *   - sustain s/15
 *
 * **DirectSound** : valeurs 0-255
 *   - a=255 → INSTANT (max rate per step)
 *   - a=0 → no attack (silent)
 *   - sustain s/127
 *
 * Cf. agbplay réf + src/m4a.c CGB envelope code.
 */
interface EnvParams {
  attackSec: number;
  decaySec: number;
  sustainLevel: number;
  releaseSec: number;
}
function gbaEnv(voice: VoiceSquare | VoiceDirect | VoiceNoise | VoicePWave): EnvParams {
  const isPSG = voice.type === 'square' || voice.type === 'noise' || voice.type === 'pwave';
  const a = voice.a ?? 0;
  const d = voice.d ?? 0;
  const s = voice.s ?? (isPSG ? 15 : 127);
  const r = voice.r ?? 0;

  if (isPSG) {
    // 4-bit PSG : a=0 = instant, sinon rate / 15 → temps approximatif
    return {
      attackSec: a === 0 ? 0.002 : Math.min(0.5, (a / 15) * 0.3),
      decaySec: d === 0 ? 0.002 : Math.min(0.8, (d / 15) * 0.5),
      sustainLevel: Math.min(1, s / 15),
      releaseSec: r === 0 ? 0.05 : Math.min(0.8, (r / 15) * 0.4),
    };
  }
  // 8-bit DirectSound : a=255 = instant, a=0 = très lent
  return {
    attackSec: a >= 250 ? 0.002 : Math.max(0.005, ((255 - a) / 255) * 0.25),
    decaySec: d >= 250 ? 0.002 : Math.max(0.005, ((255 - d) / 255) * 0.5),
    sustainLevel: Math.min(1, Math.max(0, s / 127)),
    releaseSec: r >= 250 ? 0.005 : Math.max(0.01, ((255 - r) / 255) * 0.6),
  };
}

// ─── Voice stealing ─────────────────────────────────────────────────────────

/** Cleanup les channels expirés (note finie). */
function cleanupExpiredChannels(now: number) {
  for (const id of Object.keys(channels) as ChannelId[]) {
    if (channels[id] && channels[id]!.endTime <= now) channels[id] = null;
  }
}

// ─── Note trigger ───────────────────────────────────────────────────────────

interface NoteParams {
  voice: Voice;
  midiNote: number;
  velocity: number; // 0-1
  startTime: number; // AudioContext.currentTime offset
  duration: number;  // seconds
}

async function triggerNote(p: NoteParams): Promise<void> {
  if (!ctx || !masterGain) return;
  const v = p.voice;
  if (v.type === 'unknown' || v.type === 'keysplit' || v.type === 'keysplit_all') return;

  // 1. Sélectionne le buffer source
  let buffer: AudioBuffer | null = null;
  let bufferLoopable = false;

  if (v.type === 'square') {
    const dutyIdx = Math.max(0, Math.min(3, v.duty));
    buffer = psgSquareBuffers[dutyIdx] ?? null;
    bufferLoopable = true;
  } else if (v.type === 'noise') {
    buffer = psgNoiseBuffer;
    bufferLoopable = true;
  } else if (v.type === 'pwave') {
    buffer = ctx ? getPwaveBuffer(ctx, v.sample ?? '01') : null;
    bufferLoopable = true;
  } else if (v.type === 'directsound') {
    const samplePath = samples?.[v.sample];
    if (!samplePath) return;
    buffer = await loadSample(samplePath);
    bufferLoopable = false;
  }
  if (!buffer) return;

  // 2. Calcul detune (cents) pour transposer vers midiNote
  const rootKey = v.rootKey ?? 60;
  const semitoneOffset = p.midiNote - rootKey;
  // Pour PSG square, le buffer est calibré à 440 Hz. RootKey 69 (A4) = pas de detune.
  // Pour DirectSound, le buffer est à freq native, rootKey indique sa note.
  // PSG square/noise + pwave : buffers calibrés à 440Hz (= MIDI 69 A4).
  // DirectSound : sample à freq native, rootKey indique sa note.
  const baseAdjust = (v.type === 'square' || v.type === 'noise' || v.type === 'pwave')
    ? (p.midiNote - 69)
    : semitoneOffset;
  const detuneCents = baseAdjust * 100;

  // 3. Channel allocation GBA-style (par type de voix, max 1 note par channel)
  const t0Pre = Math.max(p.startTime, ctx.currentTime + 0.001);
  cleanupExpiredChannels(t0Pre);
  const chId = allocChannel(v.type, t0Pre);
  if (!chId) return;
  // Si channel busy, release sa voice courante AVANT scheduling new
  if (channels[chId]) releaseChannel(chId, t0Pre);

  // 4. Allocation des nodes
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.detune.value = detuneCents;
  if (bufferLoopable) source.loop = true;

  const gainNode = ctx.createGain();
  const env = gbaEnv(v as VoiceSquare | VoiceDirect | VoiceNoise | VoicePWave);

  const t0 = Math.max(p.startTime, ctx.currentTime + 0.001);
  // Volume final : velocity × master par type
  // Avec channel allocation max 6 voices, on peut remonter les volumes.
  const peakVol = p.velocity * (
    v.type === 'square' ? 0.22 :
    v.type === 'noise' ? 0.16 :
    v.type === 'pwave' ? 0.18 :
    0.40
  );
  const sustainVol = Math.max(0.0001, peakVol * env.sustainLevel);

  // ADSR avec linear ramps (exponentialRampToValueAtTime fragile si valeurs 0).
  // Pattern : attack peak, decay vers sustain, hold, release.
  gainNode.gain.setValueAtTime(0, t0);
  gainNode.gain.linearRampToValueAtTime(peakVol, t0 + env.attackSec);
  const decayEnd = t0 + env.attackSec + env.decaySec;
  gainNode.gain.linearRampToValueAtTime(sustainVol, decayEnd);
  // Sustain hold jusqu'à fin de note.
  const noteOffTime = Math.max(decayEnd, t0 + p.duration);
  gainNode.gain.setValueAtTime(sustainVol, noteOffTime);
  gainNode.gain.linearRampToValueAtTime(0, noteOffTime + env.releaseSec);
  const sustainEndTime = noteOffTime;

  // Pan (optionnel)
  let pannerNode: StereoPannerNode | null = null;
  if (v.pan !== undefined && v.pan !== 0 && ctx.createStereoPanner) {
    pannerNode = ctx.createStereoPanner();
    pannerNode.pan.value = Math.max(-1, Math.min(1, v.pan / 64));
  }

  // 5. Connect chain
  source.connect(gainNode);
  if (pannerNode) {
    gainNode.connect(pannerNode);
    pannerNode.connect(masterGain);
  } else {
    gainNode.connect(masterGain);
  }

  // 6. Start + stop
  try {
    source.start(t0);
    const stopTime = sustainEndTime + env.releaseSec + 0.05;
    source.stop(stopTime);
    channels[chId] = { source, gainNode, startTime: t0, endTime: stopTime };
  } catch {/* ignore (timing edge case) */}
}

// ─── Song playback ──────────────────────────────────────────────────────────

interface PlayEvent { time: number; note: number; duration: number; velocity: number; program: number; }

function songNameFromUrl(url: string): string {
  const base = url.split('/').pop() ?? '';
  return base.replace(/\.mid$/i, '');
}

/** Test beep : joue une note 440Hz square pendant 500ms pour vérifier que
 *  l'AudioContext fonctionne. Appeler depuis console : `window.testBeep()`. */
export function testBeep() {
  if (!ctx || !masterGain || !psgSquareBuffers[2]) {
    console.warn('[sappy] not ready, ctx:', !!ctx, 'master:', !!masterGain, 'buffer:', !!psgSquareBuffers[2]);
    return;
  }
  const t0 = ctx.currentTime + 0.05;
  const src = ctx.createBufferSource();
  src.buffer = psgSquareBuffers[2]; // 50% duty
  src.detune.value = 0; // 440 Hz natif
  src.loop = true;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(0.3, t0 + 0.01);
  g.gain.linearRampToValueAtTime(0, t0 + 0.5);
  src.connect(g);
  g.connect(masterGain);
  src.start(t0);
  src.stop(t0 + 0.55);
  console.log('[sappy] testBeep scheduled at', t0, 'ctx.currentTime:', ctx.currentTime);
}

export async function playMidiLoop(url: string): Promise<void> {
  console.log('[sappy] playMidiLoop called', url, 'started:', started, 'ctx:', !!ctx);
  if (!started || !ctx || !voicegroups) {
    console.warn('[sappy] not ready, skip play');
    return;
  }
  if (currentMidiUrl === url && scheduledEvents.length > 0) {
    console.log('[sappy] already playing this url');
    return;
  }
  stopMusic();
  currentMidiUrl = url;

  const songName = songNameFromUrl(url);
  const vgName = songVoicegroups?.[songName];
  console.log('[sappy] song', songName, '→ voicegroup', vgName);
  if (!vgName) { console.warn('[sappy] voicegroup introuvable pour', songName); return; }

  let midi: Midi;
  try {
    midi = await Midi.fromUrl(url);
  } catch (err) {
    console.warn('[sappy] échec parsing MIDI', url, err);
    return;
  }

  // Collect events
  const events: PlayEvent[] = [];
  for (const track of midi.tracks) {
    const program = track.instrument.number ?? 0;
    for (const n of track.notes) {
      events.push({
        time: n.time,
        note: Math.round(n.midi),
        duration: Math.max(0.04, Math.min(8, n.duration)),
        velocity: n.velocity,
        program,
      });
    }
  }
  if (events.length === 0) { console.warn('[sappy] no events in MIDI'); return; }
  events.sort((a, b) => a.time - b.time);

  const songDuration = Math.max(midi.duration, events[events.length - 1].time + events[events.length - 1].duration);

  // Pre-load all directsound samples + count voice types pour debug
  const samplesNeeded = new Set<string>();
  const voiceTypeStats: Record<string, number> = {};
  let nullVoices = 0;
  for (const ev of events) {
    const v = resolveVoice(vgName, ev.program, ev.note);
    if (!v) { nullVoices++; continue; }
    voiceTypeStats[v.type] = (voiceTypeStats[v.type] || 0) + 1;
    if (v.type === 'directsound' && samples?.[v.sample]) samplesNeeded.add(samples[v.sample]);
  }
  console.log('[sappy]', events.length, 'events, voice types:', voiceTypeStats, 'null voices:', nullVoices, 'samples to load:', samplesNeeded.size);
  await Promise.all([...samplesNeeded].map(s => loadSample(s)));
  console.log('[sappy] samples loaded, scheduling at base time', ctx.currentTime + 0.05);

  // Schedule via setTimeout par groupes de 1s + lookhead.
  // Plus simple : schedule TOUT immédiatement (Web Audio API a son propre lookhead).
  const startTime = ctx.currentTime + 0.05;
  scheduleSongLoop(events, vgName, startTime, songDuration);
}

function scheduleSongLoop(events: PlayEvent[], vgName: string, baseTime: number, duration: number) {
  if (!ctx) return;
  // Schedule current iteration
  for (const ev of events) {
    const t = baseTime + ev.time;
    const v = resolveVoice(vgName, ev.program, ev.note);
    if (!v) continue;
    triggerNote({
      voice: v,
      midiNote: ev.note,
      velocity: ev.velocity,
      startTime: t,
      duration: ev.duration,
    });
  }
  // Schedule next iteration
  const nextBaseTime = baseTime + duration;
  const delayMs = Math.max(50, (nextBaseTime - ctx.currentTime - 1) * 1000);
  const tid = window.setTimeout(() => {
    if (currentMidiUrl !== null) scheduleSongLoop(events, vgName, nextBaseTime, duration);
  }, delayMs);
  scheduledEvents.push(tid);
}

export function stopMusic(): void {
  for (const tid of scheduledEvents) clearTimeout(tid);
  scheduledEvents = [];
  // Stop all active voices on all channels
  const now = ctx?.currentTime ?? 0;
  for (const id of Object.keys(channels) as ChannelId[]) {
    const av = channels[id];
    if (!av) continue;
    try {
      av.gainNode.gain.cancelScheduledValues(now);
      av.gainNode.gain.setValueAtTime(av.gainNode.gain.value, now);
      av.gainNode.gain.linearRampToValueAtTime(0, now + 0.05);
      av.source.stop(now + 0.1);
    } catch {/* ignore */}
    channels[id] = null;
  }
  currentMidiUrl = null;
}
