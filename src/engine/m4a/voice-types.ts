/**
 * Types des voicegroups M4A 1:1 décomp pokeemeraude/sound/voicegroups/.
 *
 * Chaque song GBA référence un voicegroup (= preset bank de 128 entries
 * indexées par MIDI program 0-127). Une entry décrit comment synthétiser
 * cette note : PSG square/triangle/noise OU PCM sample (DirectSound).
 *
 * Source format (sound/voicegroups/X.inc) :
 *   voice_group <name>
 *       voice_square_1 60, 0, 0, 2, 0, 0, 15, 0
 *       voice_directsound 60, 0, DirectSoundWaveData_X, 255, 216, 90, 242
 *       voice_keysplit drumset, key_split_table
 *       ...
 *
 * Sound channels GBA :
 *   - DirectSound A/B (8-bit signed PCM samples) → AudioBufferSource Web Audio
 *   - Square 1/2 (PSG) → OscillatorNode 'square'
 *   - Wave (PSG patterns) → custom periodic wave
 *   - Noise (PSG random) → AudioBufferSource avec white noise
 */

/** Type de voice dans une entry voicegroup. */
export const enum VoiceType {
  /** PCM sample, joué via AudioBufferSource. */
  DirectSound = 'directsound',
  /** PCM sample, no resample (fixed pitch). */
  DirectSoundNoResample = 'directsound_no_resample',
  /** PSG square wave canal 1 (avec sweep). */
  Square1 = 'square_1',
  /** PSG square wave canal 1 (alt — sans sweep). */
  Square1Alt = 'square_1_alt',
  /** PSG square wave canal 2. */
  Square2 = 'square_2',
  /** PSG square wave canal 2 (alt). */
  Square2Alt = 'square_2_alt',
  /** PSG programmable wave (4-bit pattern × 32 samples). */
  ProgrammableWave = 'programmable_wave',
  /** PSG noise generator. */
  Noise = 'noise',
  /** PSG noise alt. */
  NoiseAlt = 'noise_alt',
  /** Keysplit (different voice per note range). */
  Keysplit = 'keysplit',
  /** Keysplit all (single child voicegroup pour toutes les notes). */
  KeysplitAll = 'keysplit_all',
}

/** ADSR envelope (Attack/Decay/Sustain/Release). 0-255 pour chaque champ. */
export interface AdsrEnvelope {
  attack: number;
  decay: number;
  sustain: number;
  release: number;
}

/** Voice DirectSound = PCM sample. */
export interface VoiceDirectSound {
  type: VoiceType.DirectSound | VoiceType.DirectSoundNoResample;
  /** MIDI key de référence pour le sample (pitch original). 0-127. */
  baseKey: number;
  /** Pan 0-127 (64 = center). */
  pan: number;
  /** Symbole pointant vers le sample data (DirectSoundWaveData_X). */
  sampleSymbol: string;
  /** Envelope ADSR. */
  envelope: AdsrEnvelope;
}

/** Voice PSG square wave. */
export interface VoiceSquare {
  type: VoiceType.Square1 | VoiceType.Square1Alt | VoiceType.Square2 | VoiceType.Square2Alt;
  baseKey: number;
  panSweep: number;
  /** Sweep (square 1 only). */
  sweep: number;
  /** Square pattern (duty cycle) : 0=12.5%, 1=25%, 2=50%, 3=75%. */
  squarePattern: number;
  /** Note length (ticks). */
  length: number;
  envelope: AdsrEnvelope;
}

/** Voice PSG noise. */
export interface VoiceNoise {
  type: VoiceType.Noise | VoiceType.NoiseAlt;
  baseKey: number;
  panSweep: number;
  /** Noise period (LFSR feedback). */
  period: number;
  length: number;
  envelope: AdsrEnvelope;
}

/** Voice programmable wave. */
export interface VoiceProgrammableWave {
  type: VoiceType.ProgrammableWave;
  baseKey: number;
  panSweep: number;
  /** Symbole pointant vers la wave table (32 samples 4-bit). */
  waveSymbol: string;
  length: number;
  envelope: AdsrEnvelope;
}

/** Voice keysplit (drumkit ou multi-voice). */
export interface VoiceKeysplit {
  type: VoiceType.Keysplit;
  /** Sub-voicegroup name (recursive lookup). */
  subVoicegroupName: string;
  /** Symbole pointant vers la table key→subVoiceIdx (gKeySplitTable_X). */
  splitTableSymbol: string;
}

/** Voice keysplit all (= sub-voicegroup utilisé pour toutes les notes). */
export interface VoiceKeysplitAll {
  type: VoiceType.KeysplitAll;
  subVoicegroupName: string;
}

/** Union de tous les voice types. */
export type Voice =
  | VoiceDirectSound
  | VoiceSquare
  | VoiceNoise
  | VoiceProgrammableWave
  | VoiceKeysplit
  | VoiceKeysplitAll;

/** Voicegroup complet : 128 entries (MIDI program 0-127). */
export interface VoiceGroup {
  /** Nom du voicegroup (depuis `voice_group X`). */
  name: string;
  /** 128 voices indexées par MIDI program. */
  voices: Voice[];
}
