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
import { loadSample, getNoiseBuffer } from './sample-loader';

/** Une note jouée — référence pour stop/release. */
export interface ActiveNote {
  /** Source audio (oscillator ou bufferSource). */
  source: AudioBufferSourceNode | OscillatorNode;
  /** Gain envelope. */
  envelope: GainNode;
  /** Pan. */
  panner: StereoPannerNode;
  /** Stop la note (release ADSR puis stop). */
  stop(time?: number): void;
  /** Timestamp AudioContext de création (pour voice stealing FIFO). */
  startedAt: number;
}

// ─── Polyphonie : voice stealing FIFO ───────────────────────────────────────
//
// GBA hardware M4A est limité à 6 canaux audio (2 PSG square + wave + noise +
// 2 DirectSound). Le décomp utilise une couche M4A qui peut multiplexer
// jusqu'à ~16 "virtual channels" via le mixer software. Mais sur web audio,
// on n'a aucune limite hardware → on peut être beaucoup plus généreux.
//
// MAX_POLYPHONY=64 = ample pour MIDI denses (27 tracks × ~3 notes simultanées).
// Si voice stealing déclenché : on log pour diag (= probably MIDI mal mixé).
const MAX_POLYPHONY = 64;
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

/** Convertit un attack/decay/release rate GBA M4A (0-255) en durée seconds.
 *
 *  M4A semantics (1:1 décomp) : ces valeurs sont des RATES, pas des durées.
 *  Plus la valeur est HAUTE, plus la transition est RAPIDE :
 *    attack/decay/release = 255 → atteint le target en ~1 frame (~16ms)
 *    attack/decay/release = 1   → très lent (~4 sec)
 *    attack/decay/release = 0   → infini (jamais atteint, donc on clamp)
 *
 *  Formule empirique : time = 256 / (value × 60fps) seconds. */
function gbaEnvTimeToSec(value: number): number {
  if (value >= 255) return 0.016;         // ~1 frame
  if (value <= 0) return 4;               // clamp infini → 4 sec
  return Math.min(4, 256 / (value * 60));  // taux × 60fps → cap 4s
}

/** Convertit un sustain value GBA M4A (0-255) en gain 0.0 - 1.0. */
function gbaSustainToGain(value: number): number {
  return Math.max(0, Math.min(1, value / 255));
}

/** Joue une note depuis une Voice résolue.
 *  @param voice voice concrète (PSG ou PCM)
 *  @param midiNote 0-127
 *  @param velocity 0-127 (volume)
 *  @param panMidi 0-127 (64 = center)
 *  @param when timestamp AudioContext quand jouer (= ctx.currentTime pour now)
 *  @returns ActiveNote pour pouvoir stop/release plus tard, ou null si voice non gérée
 */
export async function playNote(
  voice: Voice,
  midiNote: number,
  velocity: number,
  panMidi: number,
  when?: number,
): Promise<ActiveNote | null> {
  const ctx = getAudioContext();
  const startTime = when ?? ctx.currentTime;
  const noteFreq = midiNoteToFreq(midiNote);

  let source: AudioBufferSourceNode | OscillatorNode;
  let envelope: AdsrEnvelope;

  switch (voice.type) {
    case 'square_1':
    case 'square_1_alt':
    case 'square_2':
    case 'square_2_alt': {
      // PSG square wave avec duty cycle exact (12.5/25/50/75% selon squarePattern).
      // Web Audio Oscillator type 'square' = duty 50% par défaut.
      // Pour autres duties, on génère une PeriodicWave custom (Fourier coefficients
      // d'un square pulse de duty d : a_n = (2/(nπ)) × sin(nπd) ).
      const osc = ctx.createOscillator();
      const dutyCycle = squarePatternToDuty(voice.squarePattern);
      if (Math.abs(dutyCycle - 0.5) < 0.01) {
        osc.type = 'square';
      } else {
        osc.setPeriodicWave(getOrBuildSquareWave(ctx, dutyCycle));
      }
      osc.frequency.value = noteFreq;
      source = osc;
      envelope = voice.envelope;
      break;
    }
    case 'noise':
    case 'noise_alt': {
      // PSG noise : white noise buffer + biquad lowpass filter color selon `period`.
      // 1:1 GBA : noise period 0-7 contrôle la "couleur" du bruit (LFSR feedback rate).
      // Period 0 = fréquence haute (snare aigu), period 7 = grave (sub bass).
      const bs = ctx.createBufferSource();
      bs.buffer = getNoiseBuffer();
      bs.loop = true;
      bs.playbackRate.value = noteFreq / 440;  // base pitch via playback rate
      // Filter : period 0-7 → cutoff 8000 Hz - 500 Hz
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      const periodVal = (voice as { period?: number }).period ?? 0;
      filter.frequency.value = 8000 - (periodVal * 1000);  // 8000, 7000, ..., 1000 Hz
      filter.Q.value = 1.5;
      bs.connect(filter);
      // On stocke le filter dans _noiseFilters pour cleanup, mais on connecte source
      // au filter et on retourne une source "virtuelle" (le filter va vers env)
      // Simplification : on retourne bs comme source mais le routing passe par filter
      // → modifier le connect graph plus bas
      source = bs;
      envelope = voice.envelope;
      // Mark le filter pour le routing (variable temp via WeakMap ou closure)
      (bs as AudioBufferSourceNode & { _noiseFilter?: BiquadFilterNode })._noiseFilter = filter;
      break;
    }
    case 'directsound':
    case 'directsound_no_resample': {
      // PCM sample
      const buf = await loadSample(voice.sampleSymbol);
      if (!buf) return null;
      const bs = ctx.createBufferSource();
      bs.buffer = buf;
      // Pitch shifting : on assume que le sample est enregistré à voice.baseKey
      // On adjuste playbackRate selon (noteFreq / baseFreq)
      const baseFreq = midiNoteToFreq(voice.baseKey);
      bs.playbackRate.value = noteFreq / baseFreq;
      bs.loop = false; // TODO : detect loop region dans le WAV (smpl chunk)
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
      const osc = ctx.createOscillator();
      osc.type = 'triangle';  // approximation acceptable pour la plupart des wave samples
      osc.frequency.value = noteFreq;
      source = osc;
      envelope = voice.envelope;
      break;
    }
    default:
      console.warn(`[m4a] Unknown voice type: ${(voice as { type: string }).type}`);
      return null;
  }

  // Envelope ADSR
  const env = ctx.createGain();
  const velNorm = velocity / 127;
  const attackTime = gbaEnvTimeToSec(envelope.attack);
  const decayTime = gbaEnvTimeToSec(envelope.decay);
  const sustainGain = gbaSustainToGain(envelope.sustain) * velNorm;
  // releaseTime is used in stop()

  env.gain.setValueAtTime(0, startTime);
  env.gain.linearRampToValueAtTime(velNorm, startTime + Math.max(0.001, attackTime));
  env.gain.linearRampToValueAtTime(sustainGain, startTime + attackTime + Math.max(0.001, decayTime));

  // Pan
  const panner = ctx.createStereoPanner();
  panner.pan.value = (panMidi - 64) / 64;  // -1 left, +1 right

  // Connect graph (avec filter intermédiaire pour noise voices)
  const noiseFilter = (source as { _noiseFilter?: BiquadFilterNode })._noiseFilter;
  if (noiseFilter) {
    // source → filter (déjà connecté plus haut) → env → panner → master
    noiseFilter.connect(env);
  } else {
    source.connect(env);
  }
  env.connect(panner);
  panner.connect(getMasterGain());

  source.start(startTime);

  const note: ActiveNote = {
    source,
    envelope: env,
    panner,
    startedAt: startTime,
    stop(time?: number) {
      const t = time ?? ctx.currentTime;
      const releaseTime = gbaEnvTimeToSec(envelope.release);
      env.gain.cancelScheduledValues(t);
      env.gain.setValueAtTime(env.gain.value, t);
      env.gain.linearRampToValueAtTime(0, t + Math.max(0.005, releaseTime));
      try {
        if ('stop' in source) (source as AudioBufferSourceNode | OscillatorNode).stop(t + releaseTime + 0.01);
      } catch { /* already stopped */ }
      // Auto-unregister après release pour libérer le slot polyphonie
      window.setTimeout(() => unregisterActiveNote(note), Math.max(50, (releaseTime + 0.05) * 1000));
    },
  };
  registerActiveNote(note);
  return note;
}
