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
// MAX_POLYPHONY=128 = très ample. Avec 131 stealing events à 64 et ADSR ×4,
// on monte la limite. Si encore stealing avec ADSR ×2 et 128 voices, c'est
// que les notes longues s'accumulent en cas de note très soutenue (rare).
const MAX_POLYPHONY = 128;
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

/** Tick rate de l'envelope M4A : m4aSoundMain est appelé chaque V-blank GBA = 60Hz. */
const M4A_TICK_PERIOD_SEC = 1 / 60;

/** Calcule la durée d'attack en seconds pour un rate ADSR (0-255).
 *  1:1 décomp src/m4a_1.s : `envelopeVolume += attack` chaque tick (60Hz),
 *  jusqu'à atteindre 255. Donc time = ceil(255 / attack) × tickPeriod.
 *
 *  attack=255 → 1 tick (16ms instant)
 *  attack=128 → 2 ticks (33ms)
 *  attack=64  → 4 ticks (67ms)
 *  attack=4   → 64 ticks (1.06s)
 *  attack=1   → 255 ticks (4.25s)
 *  attack=0   → skip attack phase (envelopeVolume = peak directly) */
function attackTimeSec(attack: number): number {
  if (attack <= 0) return 0;        // skip phase
  if (attack >= 255) return M4A_TICK_PERIOD_SEC;
  return Math.ceil(255 / attack) * M4A_TICK_PERIOD_SEC;
}

/** Calcule la time constant pour un decay/release multiplicatif M4A → Web Audio
 *  setTargetAtTime. M4A : `vol = (vol × rate) / 256` chaque tick (60Hz).
 *  Web Audio setTargetAtTime simule `vol(t) = target + (initial - target) × exp(-t / τ)`.
 *
 *  Conversion : après 1 tick (16.67ms), le ratio préservé est rate/256.
 *  Donc `exp(-tickPeriod / τ) = rate/256` → `τ = tickPeriod / -ln(rate/256)`.
 *
 *  rate=255 → τ ≈ 4.27 sec (decay très lent, preserves 99.6% par tick)
 *  rate=235 → τ ≈ 195 ms (decay lent, preserves 92% par tick)
 *  rate=200 → τ ≈ 67 ms (preserves 78%)
 *  rate=128 → τ ≈ 24 ms (decay rapide, halve chaque tick)
 *  rate=0   → τ ≈ 0 (instant)
 *  rate=1-255 valid range. */
function envTimeConstant(rate: number): number {
  if (rate <= 0) return 0.001;                 // instant
  if (rate >= 256) return 60;                  // virtually never (cap)
  const ratio = rate / 256;
  if (ratio >= 0.9999) return 60;              // would div by zero
  return M4A_TICK_PERIOD_SEC / -Math.log(ratio);
}

/** Convertit un sustain value GBA M4A (0-255) en gain 0.0 - 1.0. */
function gbaSustainToGain(value: number): number {
  return Math.max(0, Math.min(1, value / 255));
}

/** Joue une note depuis une Voice résolue.
 *  @param voice voice concrète (PSG ou PCM)
 *  @param midiNote 0-127
 *  @param velocity 0-127 (volume)
 *  @param panMidi 0-127 (64 = center). Lecture priorité : voice.pan > track CC10 > 64.
 *  @param when timestamp AudioContext quand jouer (= ctx.currentTime pour now)
 *  @param trackVolume 0-1 (= MIDI CC7 × CC11 expression normalisés). Default 1.0.
 *  @param pitchBendSemis pitch bend en demi-tons (négatif = down, positif = up). Default 0.
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
): Promise<ActiveNote | null> {
  const ctx = getAudioContext();
  const startTime = when ?? ctx.currentTime;
  // Apply pitch bend en frequency (= 2^(semis/12))
  const noteFreq = midiNoteToFreq(midiNote) * Math.pow(2, pitchBendSemis / 12);

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
      // PCM sample WAV.
      // 1:1 décomp src/m4a.c : DirectSound joue à pleine vélocité immédiate
      // (pas d'attack ramp) — c'est géré dans la section ADSR plus bas.
      // Loop heuristique : samples > 1s = sustained (strings, pads) → loop
      //                    samples ≤ 1s = one-shot (drums, percussion) → no loop
      // Cap à 1s plus strict que mon précédent 0.5s pour éviter vibration sur
      // samples piano/xylophone courts.
      const buf = await loadSample(voice.sampleSymbol);
      if (!buf) return null;
      const bs = ctx.createBufferSource();
      bs.buffer = buf;
      if (voice.type === 'directsound') {
        const baseFreq = midiNoteToFreq(voice.baseKey);
        bs.playbackRate.value = noteFreq / baseFreq;
      }
      bs.loop = buf.duration > 1.0;
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

  // Envelope ADSR 1:1 décomp src/m4a_1.s :
  //   ATTACK  : envelopeVolume += attack chaque tick → linear ramp 0→peak
  //   DECAY   : envelopeVolume = (envelopeVolume × decay) >> 8 → exponential fade
  //             vers sustainGoal (= setTargetAtTime avec timeConstant)
  //   SUSTAIN : tenu à sustainGoal jusqu'à noteOff
  //   RELEASE : envelopeVolume = (envelopeVolume × release) >> 8 → exponential fade vers 0
  const env = ctx.createGain();
  // Velocity scaled par trackVolume (= MIDI CC7 × CC11 / 127² normalisé) — 1:1 décomp TrkVolPitSet
  const velNorm = (velocity / 127) * trackVolume;
  const sustainGain = gbaSustainToGain(envelope.sustain) * velNorm;
  const aTime = attackTimeSec(envelope.attack);
  const decayTau = envTimeConstant(envelope.decay);

  if (envelope.attack <= 0) {
    env.gain.setValueAtTime(velNorm, startTime);
  } else {
    env.gain.setValueAtTime(0, startTime);
    env.gain.linearRampToValueAtTime(velNorm, startTime + aTime);
  }
  env.gain.setTargetAtTime(sustainGain, startTime + aTime, Math.max(0.001, decayTau));

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
      // Release : exponential fade vers 0 via setTargetAtTime (1:1 GBA mult per tick).
      // Stop le source après ~5 × tau (= envelope quasi-zéro 99%).
      const releaseTau = envTimeConstant(envelope.release);
      const releaseTotalSec = Math.max(0.05, releaseTau * 5);
      env.gain.cancelScheduledValues(t);
      env.gain.setValueAtTime(env.gain.value, t);
      env.gain.setTargetAtTime(0, t, Math.max(0.001, releaseTau));
      try {
        if ('stop' in source) (source as AudioBufferSourceNode | OscillatorNode).stop(t + releaseTotalSec + 0.01);
      } catch { /* already stopped */ }
      window.setTimeout(() => unregisterActiveNote(note), Math.max(50, (releaseTotalSec + 0.05) * 1000));
    },
  };
  registerActiveNote(note);
  return note;
}
