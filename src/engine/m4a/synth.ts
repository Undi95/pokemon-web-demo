/**
 * Synth Web Audio M4A — joue une note audio depuis un Voice résolu.
 *
 * Pour chaque note ON, crée :
 *   - PSG Square : OscillatorNode type 'square' avec duty cycle (custom periodic wave)
 *   - PSG Noise : AudioBufferSource avec white noise précomputé
 *   - PSG Programmable Wave : OscillatorNode avec custom periodic wave
 *   - DirectSound : AudioBufferSource avec sample WAV + pitch shifting
 * Plus :
 *   - GainNode pour ADSR envelope
 *   - StereoPannerNode pour pan
 *
 * Note OFF déclenche le release de l'envelope puis stop la source.
 *
 * Pitch :
 *   - MIDI note 0-127 → fréquence Hz via 440 × 2^((note-69)/12)
 *   - Si voice.baseKey défini, le sample/oscillator est repitch pour matcher la note
 */
import type { Voice, AdsrEnvelope } from './voice-types';
import { getAudioContext, getMasterGain } from './audio-context';
import { loadSample } from './sample-loader';
import { getNoiseLfsrBuffer, midiNoteToNoiseFreq } from './noise-engine';
import { midiKeyToCgbFreqHz } from './cgb-pitch';
import { getProgrammableWavePeriodic } from './programmable-wave';
import { ensureSquareWorklet, createSquareNode } from './square-engine';
import {
  isCgbVoice,
  dsAttackTimeSec, dsEnvTimeConstant, dsSustainToGain,
  cgbAttackTimeSec, cgbSustainToGain, cgbDecayTimeSec, cgbReleaseTimeSec,
  cgbEnvelopeGoal,
} from './envelope';

/** Une note jouée — référence pour stop/release. */
export interface ActiveNote {
  /** Source audio (oscillator, bufferSource, ou AudioWorkletNode pour square aliased / noise LFSR). */
  source: AudioBufferSourceNode | OscillatorNode | AudioWorkletNode;
  /** Gain envelope. */
  envelope: GainNode;
  /** Pan L et R (1:1 décomp volMR/volML linéaires séparés, pas equal-power). */
  panL: GainNode;
  panR: GainNode;
  /** Stop la note (release ADSR puis stop). */
  stop(time?: number): void;
  /** Timestamp AudioContext de création (pour voice stealing FIFO). */
  startedAt: number;
}

// ─── Polyphonie : voice stealing FIFO ───────────────────────────────────────
//
// 1:1 décomp : `MAX_DIRECTSOUND_CHANNELS = 12` (m4a_internal.h:167) +
// 4 CGB hardware channels = 16 voices max effectives.
// Le décomp default `maxChans = 8` (m4a.c:383) DirectSound + 4 CGB = 12.
//
// Sur Web Audio on pourrait aller plus large mais ça change le caractère du
// mix (notes anciennes s'accumulent au lieu d'être stolées comme sur GBA).
// On reste à 16 pour matcher l'enveloppe hardware tout en laissant marge.
const MAX_POLYPHONY = 16;
const _activeNotes: ActiveNote[] = [];
let _stealingCount = 0;

function registerActiveNote(note: ActiveNote): void {
  _activeNotes.push(note);
  while (_activeNotes.length > MAX_POLYPHONY) {
    const oldest = _activeNotes.shift();
    if (oldest) {
      _stealingCount++;
      if (_stealingCount === 1 || _stealingCount % 10 === 0) {
        console.warn(`[m4a] Voice stealing #${_stealingCount} (active ${_activeNotes.length}/${MAX_POLYPHONY})`);
      }
      try { oldest.stop(); } catch { /* already stopped */ }
    }
  }
}

/** Reset stealing counter (à appeler au début de chaque song). */
export function resetVoiceStealingCounter(): void {
  _stealingCount = 0;
}

/** Get total voice stealing events depuis le dernier reset. */
export function getVoiceStealingCount(): number {
  return _stealingCount;
}

function unregisterActiveNote(note: ActiveNote): void {
  const idx = _activeNotes.indexOf(note);
  if (idx >= 0) _activeNotes.splice(idx, 1);
}

/** Stop toutes les voices actives (utilisé par player.stopSong). */
export function stopAllActiveNotes(): void {
  for (const n of _activeNotes) {
    try { n.stop(); } catch { /* ignore */ }
  }
  _activeNotes.length = 0;
}

/** Convertit une note MIDI 0-127 en Hz (A4 = 440 Hz, MIDI 69). */
export function midiNoteToFreq(note: number): number {
  return 440 * Math.pow(2, (note - 69) / 12);
}

/** GBA M4A square pattern → duty cycle 0.0-1.0. */
function squarePatternToDuty(pattern: number): number {
  switch (pattern) {
    case 0: return 0.125;  // 12.5%
    case 1: return 0.25;   // 25%
    case 2: return 0.50;   // 50% (default Web Audio square)
    case 3: return 0.75;   // 75%
    default: return 0.50;
  }
}

/** Cache des PeriodicWave par duty cycle. Build une seule fois par duty. */
const _squareWaveCache = new Map<number, PeriodicWave>();
function getOrBuildSquareWave(ctx: AudioContext, duty: number): PeriodicWave {
  const key = Math.round(duty * 1000);
  const cached = _squareWaveCache.get(key);
  if (cached) return cached;
  // Fourier square pulse of duty d :
  //   a_n = (2 / (n × π)) × sin(n × π × d)
  // n = 1..N (harmoniques)
  const N = 32;
  const real = new Float32Array(N + 1);
  const imag = new Float32Array(N + 1);
  for (let n = 1; n <= N; n++) {
    const an = (2 / (n * Math.PI)) * Math.sin(n * Math.PI * duty);
    imag[n] = an;
  }
  const wave = ctx.createPeriodicWave(real, imag, { disableNormalization: false });
  _squareWaveCache.set(key, wave);
  return wave;
}

// Helpers ADSR (CGB vs DirectSound) déplacés dans `./envelope.ts`.

/** Options LFO 1:1 décomp m4a_1.s LFO update :
 *  - Triangle wave avec phase accumulator (lfoSpeedC += lfoSpeed) chaque tick 60Hz
 *  - Period = 256 / lfoSpeed ticks → frequency = 60 / (256 / lfoSpeed) = lfoSpeed × 60 / 256 Hz
 *  - depth (mod) 0-127 → amplitude
 *  - modT : 0=vibrato (pitch), 1=tremolo (volume), 2=pan_lfo */
export interface LfoConfig {
  /** lfoSpeed 0-255 (default M4A = 22 → 5.16 Hz). 0 = no LFO. */
  speed: number;
  /** mod depth 0-127. 0 = no modulation. */
  depth: number;
  /** modT : 0=vibrato, 1=tremolo, 2=pan_lfo. */
  type: 0 | 1 | 2;
  /** Delay before LFO starts (ticks @ 60Hz). Default 0. */
  delayTicks?: number;
}

/** Joue une note depuis une Voice résolue.
 *  @param voice voice concrète (PSG ou PCM)
 *  @param midiNote 0-127
 *  @param velocity 0-127 (volume)
 *  @param panMidi 0-127 (64 = center). Lecture priorité : voice.pan > track CC10 > 64.
 *  @param when timestamp AudioContext quand jouer (= ctx.currentTime pour now)
 *  @param trackVolume 0-1 (= MIDI CC7 × CC11 expression normalisés). Default 1.0.
 *  @param pitchBendSemis pitch bend en demi-tons (négatif = down, positif = up). Default 0.
 *  @param lfo LFO config (vibrato/tremolo/pan_lfo). Default null.
 *  @returns ActiveNote pour pouvoir stop/release plus tard, ou null si voice non gérée
 */
export async function playNote(
  voice: Voice,
  midiNote: number,
  velocity: number,
  panMidi: number,
  when?: number,
  trackVolume = 1.0,
  pitchBendSemis = 0,
  lfo: LfoConfig | null = null,
): Promise<ActiveNote | null> {
  const ctx = getAudioContext();
  const startTime = when ?? ctx.currentTime;
  // Apply pitch bend en frequency (= 2^(semis/12))
  const noteFreq = midiNoteToFreq(midiNote) * Math.pow(2, pitchBendSemis / 12);

  let source: AudioBufferSourceNode | OscillatorNode | AudioWorkletNode;
  let envelope: AdsrEnvelope;

  switch (voice.type) {
    case 'square_1':
    case 'square_1_alt':
    case 'square_2':
    case 'square_2_alt': {
      // PSG square wave RAW aliased via AudioWorklet (1:1 hardware GBA).
      // Web Audio `OscillatorNode 'square'` est band-limited (= trop propre).
      // Le DAC GBA à 13.379 kHz produit l'aliasing caractéristique 8-bit qui
      // donne le « buzz » des leads. Notre worklet émule un square raw, puis
      // le double lowpass DAC à 6.5 kHz dans audio-context.ts atténue les
      // harmoniques aigues comme le ferait le hardware.
      await ensureSquareWorklet();
      const cgbHz = midiKeyToCgbFreqHz(midiNote);
      const finalFreq = cgbHz * Math.pow(2, pitchBendSemis / 12);
      const dutyCycle = squarePatternToDuty(voice.squarePattern);
      const node = createSquareNode(finalFreq, dutyCycle);
      if (!node) {
        // Fallback si worklet pas encore chargé (race condition rare au boot)
        const osc = ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.value = finalFreq;
        source = osc;
      } else {
        source = node;
      }
      envelope = voice.envelope;
      break;
    }
    case 'noise':
    case 'noise_alt': {
      // PSG noise : LFSR-accurate (1:1 GBA hardware).
      //
      // Le contenu du buffer est la vraie séquence LFSR du GBA :
      //   - voice.period == 0 → 15-bit LFSR (32767 samples, white-ish)
      //   - voice.period == 1 → 7-bit LFSR (127 samples, tonal/buzzy)
      // 1:1 décomp asm/macros/music_voice.inc : `(\period & 0x1)` → un seul bit.
      //
      // La playbackRate suit la formule hardware NR43 (cf. m4a.c MidiKeyToCgbFreq
      // + gNoiseTable) : la note MIDI est mappée à un NR43 byte qui détermine
      // la cadence du LFSR. On joue donc le buffer à `noiseFreqHz / sampleRate`.
      const periodVal = (voice as { period?: number }).period ?? 0;
      const is7bit = (periodVal & 1) === 1;
      const bs = ctx.createBufferSource();
      bs.buffer = getNoiseLfsrBuffer(is7bit);
      bs.loop = true;
      const noiseFreqHz = midiNoteToNoiseFreq(midiNote);
      bs.playbackRate.value = noiseFreqHz / ctx.sampleRate;
      source = bs;
      envelope = voice.envelope;
      break;
    }
    case 'directsound':
    case 'directsound_no_resample': {
      // PCM sample WAV avec loop points exacts depuis smpl chunk (1:1 GBA).
      // WaveData GBA struct : flags + loopStart + size + data → on lit le smpl chunk
      // du WAV pour avoir les vrais loop points (= sustained instruments naturels).
      const sample = await loadSample(voice.sampleSymbol);
      if (!sample) return null;
      const bs = ctx.createBufferSource();
      bs.buffer = sample.buffer;
      if (voice.type === 'directsound') {
        const baseFreq = midiNoteToFreq(voice.baseKey);
        bs.playbackRate.value = noteFreq / baseFreq;
      }
      // Loop : utilise les loop points smpl du WAV si présents (= 1:1 décomp WaveData.loopStart).
      // Sinon : pas de loop (sample one-shot finit naturellement).
      if (sample.hasLoop && sample.loopEnd > sample.loopStart) {
        bs.loop = true;
        bs.loopStart = sample.loopStart;
        bs.loopEnd = sample.loopEnd;
      } else {
        bs.loop = false;
      }
      source = bs;
      envelope = voice.envelope;
      break;
    }
    case 'programmable_wave': {
      // PSG programmable wave : 32 samples 4-bit sur 1 cycle. Sur GBA c'est joué
      // sur un canal dédié (sound channel 3). Format : 16 bytes total = 32 nibbles
      // 4-bit (0-15) qui définissent la wave shape.
      //
      // Pour Web Audio : on génère une PeriodicWave en analysant les harmoniques
      // de la wave shape. Pour MVP simple : OscillatorNode 'triangle' qui
      // approxime un wave sample doux. Si voice.waveSymbol pointe vers un .bin
      // chargeable, on pourrait reconstruire la wave exacte (TODO).
      //
      // Le décomp pokeemeraude n'expose PAS les programmable_wave_samples en .bin
      // dans le repo (juste le voicegroup binding). Donc fallback triangle wave.
      // 1:1 décomp : 32 samples 4-bit (= 16 octets) chargés depuis le décomp via
      // `extract-programmable-wave.mjs`. DFT → PeriodicWave Web Audio. Si symbole
      // inconnu (rare), fallback `triangle`.
      const osc = ctx.createOscillator();
      const waveSym = (voice as { waveSymbol?: string }).waveSymbol;
      const pw = waveSym ? getProgrammableWavePeriodic(waveSym) : null;
      if (pw) {
        osc.setPeriodicWave(pw);
      } else {
        osc.type = 'triangle';
      }
      // Pitch CGB exact (channel 3 utilise le même MidiKeyToCgbFreq que square).
      osc.frequency.value = midiKeyToCgbFreqHz(midiNote) * Math.pow(2, pitchBendSemis / 12);
      source = osc;
      envelope = voice.envelope;
      break;
    }
    case 'unknown':
      // Fallback du transpiler d'extracteur pour les voix non parsées.
      // Silencieux : le player compte déjà skippedUnknownType.
      return null;
    default:
      console.warn(`[m4a] Unknown voice type: ${(voice as { type: string }).type}`);
      return null;
  }

  // Envelope ADSR — split selon canal hardware :
  //   - DirectSound (PCM)  : 0-255 multiplicatif, exponentiel (cf. m4a_1.s)
  //   - CGB (square/noise) : 0-7 / 0-15 par steps, linéaire (cf. m4a.c CgbSound)
  // Helpers dans `./envelope.ts`.
  const env = ctx.createGain();
  // Velocity scaled par trackVolume (= MIDI CC7 × CC11 / 127² normalisé) — 1:1 décomp TrkVolPitSet
  const velNorm = (velocity / 127) * trackVolume;
  const cgb = isCgbVoice(voice);

  let sustainGain: number;
  let aTime: number;
  let cgbGoal = 15;  // utilisé seulement pour CGB
  if (cgb) {
    // envelopeGoal CGB scale avec velNorm courant — moins de volume track =
    // moins de steps total = attack/decay plus rapides (1:1 m4a.c:910-919).
    cgbGoal = cgbEnvelopeGoal(velNorm);
    sustainGain = cgbSustainToGain(envelope.sustain, cgbGoal) * velNorm;
    aTime = cgbAttackTimeSec(envelope.attack, cgbGoal);
  } else {
    sustainGain = dsSustainToGain(envelope.sustain) * velNorm;
    aTime = dsAttackTimeSec(envelope.attack);
  }

  // ATTACK : ramp 0→peak (velNorm) sur aTime, ou peak instantané si attack=0
  if (envelope.attack <= 0) {
    env.gain.setValueAtTime(velNorm, startTime);
  } else {
    env.gain.setValueAtTime(0, startTime);
    env.gain.linearRampToValueAtTime(velNorm, startTime + aTime);
  }

  // DECAY : descend de peak vers sustainGain
  if (cgb) {
    // CGB : linear ramp peak→sustain en cgbDecayTimeSec, ou step instantané si decay=0
    const sustainLevel = velNorm > 0 ? sustainGain / velNorm : 0;
    const dTime = cgbDecayTimeSec(envelope.decay, sustainLevel, cgbGoal);
    if (dTime > 0) {
      env.gain.linearRampToValueAtTime(sustainGain, startTime + aTime + dTime);
    } else {
      env.gain.setValueAtTime(sustainGain, startTime + aTime + 1 / 60);
    }
  } else {
    // DirectSound : setTargetAtTime exponentiel (= multiplicatif M4A)
    const decayTau = dsEnvTimeConstant(envelope.decay);
    env.gain.setTargetAtTime(sustainGain, startTime + aTime, Math.max(0.001, decayTau));
  }

  // Pan
  // Pan : si voice a un override absolu (1:1 décomp `_voice_directsound`/`_voice_square*` :
  // byte pan stocké comme `(0x80 | val)` quand val != 0 → flag « pan fixe »).
  // Notre extracteur lit la val source (0-127, sans le flag 0x80). Donc :
  //   - Si voice.pan/panSweep != 0 : utilise comme pan absolu (drumkits stéréo).
  //   - Sinon : retombe sur panMidi (= track CC10 + center default).
  // Cf. `m4a.c:777 (y = 2 * track->pan + track->panX)` et `m4a_1.s:1612-1618` (TONEDATA_P_S_PAN).
  const voicePan = (voice as { pan?: number; panSweep?: number }).pan
                ?? (voice as { panSweep?: number }).panSweep
                ?? 0;
  const effectivePan = voicePan !== 0 ? voicePan : panMidi;
  // Pan linéaire 1:1 décomp `m4a.c:777-788` (volMR/volML séparés, pas equal-power).
  //   y = 2 × (effectivePan - 64) ∈ [-128, +126] (signé)
  //   gainR = (y + 128) / 256 ∈ [0, 0.99]
  //   gainL = (127 - y) / 256 ∈ [0, ~1.0]
  // Au centre (effectivePan=64) : gainL=gainR≈0.5 → -6dB par côté = -3dB total.
  // L'equal-power Web Audio donnerait 0.707 par côté → 0dB total (= 3dB plus
  // FORT au centre que sur GBA). C'est ce qui rend les leads centrés trop forts.
  const panY = 2 * (Math.max(0, Math.min(127, effectivePan)) - 64);
  const panL = ctx.createGain();
  const panR = ctx.createGain();
  panL.gain.value = (127 - panY) / 256;
  panR.gain.value = (panY + 128) / 256;
  const merger = ctx.createChannelMerger(2);

  // Connect graph : source → env → [panL, panR] → merger(L,R) → masterGain
  source.connect(env);
  env.connect(panL);
  env.connect(panR);
  panL.connect(merger, 0, 0);  // input port 0 (signal) → output channel 0 (L)
  panR.connect(merger, 0, 1);  // input port 0 (signal) → output channel 1 (R)
  merger.connect(getMasterGain());

  // LFO 1:1 décomp m4a_1.s : OscillatorNode triangle qui module pitch/volume/pan.
  // Setup APRES la création des nodes (besoin de source/env/panner pour modulation).
  let lfoOsc: OscillatorNode | null = null;
  let lfoGain: GainNode | null = null;
  if (lfo && lfo.speed > 0 && lfo.depth > 0) {
    lfoOsc = ctx.createOscillator();
    lfoOsc.type = 'triangle';
    // Frequency : lfoSpeed × 60 / 256 Hz (1:1 décomp accumulator triangle 256 phase steps)
    lfoOsc.frequency.value = (lfo.speed * 60) / 256;
    // Delay avant LFO start (tonejs : audioParam.setValueAtTime à valeur 0 puis ramp à depth)
    const lfoDelaySec = (lfo.delayTicks ?? 0) / 60;
    lfoGain = ctx.createGain();

    if (lfo.type === 0) {
      // VIBRATO : module la pitch.
      // 1:1 décomp `m4a.c:801` (`x += 16 * track->modM`) puis `keyM = x >> 8`.
      // modM = depth × LFO triangle ∈ [-depth, +depth]. Pour depth=127 :
      //   keyM_max = (16 × 127) >> 8 = 7.94 → ±8 demi-tons (= 1:1 hardware GBA).
      const maxSemis = (lfo.depth / 127) * 8;  // depth 127 = ±8 semitones (full range)
      const freqDelta = noteFreq * (Math.pow(2, maxSemis / 12) - 1);
      lfoGain.gain.value = 0;
      lfoGain.gain.setValueAtTime(0, startTime);
      lfoGain.gain.linearRampToValueAtTime(freqDelta, startTime + lfoDelaySec + 0.05);
      lfoOsc.connect(lfoGain);
      // Connect LFO to source frequency
      if ('frequency' in source) {
        // OscillatorNode (PSG)
        lfoGain.connect((source as OscillatorNode).frequency);
      } else if ('playbackRate' in source) {
        // AudioBufferSource (PCM) : module playbackRate via ratio (lfo Hz → ratio delta)
        // Convertir freqDelta → ratioDelta : ratio = freq / baseFreq
        // ratioDelta = freqDelta / baseFreq. Pour DirectSound, baseFreq = midiNoteToFreq(voice.baseKey)
        const isDirectsound = voice.type === 'directsound' || voice.type === 'directsound_no_resample';
        const baseFreq = isDirectsound ? midiNoteToFreq(voice.baseKey) : noteFreq;
        const ratioDelta = freqDelta / baseFreq;
        lfoGain.gain.value = 0;
        lfoGain.gain.setValueAtTime(0, startTime);
        lfoGain.gain.linearRampToValueAtTime(ratioDelta, startTime + lfoDelaySec + 0.05);
        lfoGain.connect((source as AudioBufferSourceNode).playbackRate);
      }
    } else if (lfo.type === 1) {
      // TREMOLO : module le volume.
      // 1:1 décomp `m4a.c:774-775` : si modT==1, `x = (x × (modM + 128)) >> 7`.
      // modM ∈ [-depth, +depth] avec LFO triangle. Pour depth=127 :
      //   facteur ∈ [(0+128)/128 = 1, (127+128)/128 ≈ 2] → 0% à 100% du velNorm en mod.
      // Centré sur velNorm avec amplitude ±velNorm × depth/127.
      const tremoloDepth = (lfo.depth / 127) * velNorm;
      lfoGain.gain.value = 0;
      lfoGain.gain.setValueAtTime(0, startTime);
      lfoGain.gain.linearRampToValueAtTime(tremoloDepth, startTime + lfoDelaySec + 0.05);
      lfoOsc.connect(lfoGain);
      lfoGain.connect(env.gain);  // module l'envelope gain
    } else if (lfo.type === 2) {
      // PAN_LFO : module le pan via inversion gainL/gainR.
      // 1:1 décomp : y += modM. On module gainR positivement et gainL négativement
      // (= panR.gain += depth × triangle, panL.gain -= depth × triangle).
      const panDepth = (lfo.depth / 127) * 0.5;
      lfoGain.gain.value = 0;
      lfoGain.gain.setValueAtTime(0, startTime);
      lfoGain.gain.linearRampToValueAtTime(panDepth, startTime + lfoDelaySec + 0.05);
      lfoOsc.connect(lfoGain);
      lfoGain.connect(panR.gain);
      // panL = -panR : crée un 2e gain inversé
      const lfoGainNeg = ctx.createGain();
      lfoGainNeg.gain.value = -1;
      lfoGain.connect(lfoGainNeg);
      lfoGainNeg.connect(panL.gain);
    }
    lfoOsc.start(startTime);
  }

  // start() : AudioWorkletNode démarre dès qu'il est connecté au graph (pas
  // de méthode start). OscillatorNode et AudioBufferSourceNode ont un start.
  if ('start' in source && typeof (source as { start?: unknown }).start === 'function') {
    (source as OscillatorNode | AudioBufferSourceNode).start(startTime);
  }

  const note: ActiveNote = {
    source,
    envelope: env,
    panL,
    panR,
    startedAt: startTime,
    stop(time?: number) {
      const t = time ?? ctx.currentTime;
      env.gain.cancelScheduledValues(t);
      env.gain.setValueAtTime(env.gain.value, t);

      // RELEASE — split CGB/DirectSound :
      // Anti-click guard : Web Audio coupe l'oscillator à phase arbitraire,
      // produisant un pop si gain change trop vite. On garantit ≥3ms de fade
      // pour neutraliser le click (= sub-perceptuel, mais élimine la harshness).
      const ANTICLICK_FADE = 0.003;
      let releaseTotalSec: number;
      if (cgb) {
        // CGB : linear ramp current→0 en cgbReleaseTimeSec.
        // release=0 → cutoff "quasi-instantané" (3ms fade vs hardware oscillator off).
        // Cf. m4a.c:1064-1074 — hardware GBA a un filtrage analog naturel qu'on
        // approxime via cette mini-rampe pour éviter le click Web Audio.
        const currentLevel = velNorm > 0 ? env.gain.value / velNorm : 0;
        const rTime = cgbReleaseTimeSec(envelope.release, currentLevel, cgbGoal);
        if (rTime > 0) {
          env.gain.linearRampToValueAtTime(0, t + rTime);
          releaseTotalSec = rTime;
        } else {
          env.gain.linearRampToValueAtTime(0, t + ANTICLICK_FADE);
          releaseTotalSec = ANTICLICK_FADE;
        }
      } else {
        // DirectSound : setTargetAtTime exponentiel (5τ ≈ -60dB).
        const releaseTau = dsEnvTimeConstant(envelope.release);
        releaseTotalSec = Math.max(0.05, releaseTau * 5);
        env.gain.setTargetAtTime(0, t, Math.max(0.001, releaseTau));
      }

      // Pseudo-echo 1:1 décomp m4a_1.s _081DCFC8 :
      // Après release, si pseudoEchoVolume > 0 : envVol = envelopeGoal ×
      // pseudoEchoVolume / 256, tient pendant pseudoEchoLength ticks puis stop.
      // Ces fields viennent des MIDI controllers BPSE/BPSL (non parsés actuellement),
      // l'API est en place pour quand l'extension sera ajoutée.
      let totalDuration = releaseTotalSec;
      const pe = (voice as { pseudoEchoVolume?: number; pseudoEchoLength?: number });
      if (pe.pseudoEchoVolume && pe.pseudoEchoLength) {
        const echoVol = velNorm * (pe.pseudoEchoVolume / 256);
        const echoSec = pe.pseudoEchoLength / 60;
        env.gain.setTargetAtTime(echoVol, t + releaseTotalSec, 0.005);
        env.gain.setTargetAtTime(0, t + releaseTotalSec + echoSec, 0.005);
        totalDuration += echoSec + releaseTotalSec;
      }

      try {
        if ('stop' in source && typeof (source as { stop?: unknown }).stop === 'function') {
          (source as AudioBufferSourceNode | OscillatorNode).stop(t + totalDuration + 0.01);
        } else {
          // AudioWorkletNode : pas de méthode stop. Disconnect après le release
          // pour libérer le CPU (le worklet continue de tourner sinon).
          window.setTimeout(() => {
            try { source.disconnect(); } catch { /* already disconnected */ }
          }, Math.max(50, (totalDuration + 0.05) * 1000));
        }
      } catch { /* already stopped */ }
      if (lfoOsc) {
        try { lfoOsc.stop(t + totalDuration + 0.02); } catch { /* ignore */ }
      }
      window.setTimeout(() => unregisterActiveNote(note), Math.max(50, (totalDuration + 0.05) * 1000));
    },
  };
  registerActiveNote(note);
  return note;
}
