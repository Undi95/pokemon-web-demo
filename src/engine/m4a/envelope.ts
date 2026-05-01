/**
 * Helpers ADSR — split CGB vs DirectSound (1:1 décomp pokeemeraude/src/m4a.c).
 *
 * GBA M4A a deux moteurs envelope :
 *
 * 1. **DirectSound** (PCM samples) — ADSR multiplicatif 0-255, exponentiel.
 *    Tick à V-blank ≈ 59.73 Hz. cf. `m4a_1.s SoundMain`.
 *      ATTACK  : envVol += attack chaque tick → linéaire 0→255
 *      DECAY   : envVol = (envVol × decay) >> 8 → exponentiel asymptotique vers sustainGoal
 *      SUSTAIN : tenu à sustainGoal (= sustain/255)
 *      RELEASE : envVol = (envVol × release) >> 8 → exponentiel vers 0
 *
 * 2. **CGB** (square 1/2, noise, programmable wave) — ADSR par steps 0-7 / 0-15, linéaire.
 *    Tick à 64 Hz. cf. `m4a.c CgbSound` lignes 925-1170.
 *      ATTACK  : envVol++ chaque (attack+1) ticks → linéaire 0→envelopeGoal (=15)
 *                Si attack=0 : peak instantané (skip phase).
 *      DECAY   : envVol-- chaque (decay+1) ticks → linéaire vers sustainGoal
 *                sustainGoal = (envelopeGoal × sustain + 15) >> 4 (range 0-15)
 *      SUSTAIN : tenu à sustainGoal
 *      RELEASE : envVol-- chaque (release+1) ticks → linéaire vers 0
 *                Si release=0 : cutoff instantané (oscillator off).
 *
 * Ces deux moteurs ont des plages incompatibles : un même nombre signifie des
 * choses différentes. Mélanger les formules = OST cassée.
 */

import type { Voice } from './voice-types';

/** Tick rate DirectSound : V-blank GBA. */
export const DS_TICK_PERIOD_SEC = 1 / 59.7275;

/** Tick rate CGB : `m4a.c:1175` indique « every 15 frames calc twice » → 64 Hz. */
export const CGB_TICK_PERIOD_SEC = 1 / 64;

/** True si la voice est synthétisée par le canal CGB (square/noise/wave). */
export function isCgbVoice(voice: Voice): boolean {
  switch (voice.type) {
    case 'square_1': case 'square_1_alt':
    case 'square_2': case 'square_2_alt':
    case 'noise': case 'noise_alt':
    case 'programmable_wave':
      return true;
    default:
      return false;
  }
}

// ─── DirectSound envelope (0-255 multiplicatif) ─────────────────────────────

/** DS attack rate 0-255 → durée linear ramp 0→peak en seconds.
 *  M4A : envVol += attack chaque tick. attack=0 → skip (instant peak). */
export function dsAttackTimeSec(attack: number): number {
  if (attack <= 0) return 0;
  if (attack >= 255) return DS_TICK_PERIOD_SEC;
  return Math.ceil(255 / attack) * DS_TICK_PERIOD_SEC;
}

/** DS decay/release rate 0-255 → time constant τ pour `setTargetAtTime`.
 *  M4A : `vol = (vol × rate) >> 8` chaque tick → exponentiel.
 *  exp(-tickPeriod / τ) = rate/256 → τ = tickPeriod / -ln(rate/256). */
export function dsEnvTimeConstant(rate: number): number {
  if (rate <= 0) return 0.001;
  if (rate >= 256) return 60;
  const ratio = rate / 256;
  if (ratio >= 0.9999) return 60;
  return DS_TICK_PERIOD_SEC / -Math.log(ratio);
}

/** DS sustain 0-255 → gain 0-1. */
export function dsSustainToGain(value: number): number {
  return Math.max(0, Math.min(1, value / 255));
}

// ─── CGB envelope (0-7/0-15 linéaire par steps) ─────────────────────────────

/** CGB peakLevel = envelopeGoal max = 15 (cf. `m4a.c:917`). Sert de référence interne.
 *  L'envelopeGoal RÉEL dépend du volume track courant : `(leftVol+rightVol)/16` capped 15.
 *  Quand le track joue à volume partial, l'envelopeGoal est < 15 → moins de steps total
 *  → attack/decay/release proportionnellement plus rapides (cf. m4a.c:910-919). */
const CGB_PEAK = 15;

/** Calcule l'envelopeGoal effectif courant (0-15) depuis velNorm (= 0-1).
 *  velNorm typique = velocity/127 × trackVolume × songVolume × masterVolume.
 *  GBA quantifie en 16 niveaux discrets via `>>4`. */
export function cgbEnvelopeGoal(velNorm: number): number {
  const goal = Math.min(15, Math.max(0, Math.round(velNorm * CGB_PEAK)));
  return goal;
}

/** CGB attack rate 0-7 → durée linear ramp 0→peak en seconds.
 *  M4A : envVol++ chaque (attack+1) ticks jusqu'à atteindre envelopeGoal.
 *  Donc nombre de steps = envelopeGoal (PAS 15 fixe). Pour velNorm=0.5,
 *  envelopeGoal≈7 → attack 2x plus rapide qu'à full velocity.
 *  attack=0 → instant (skip phase, cf. m4a.c:1037-1041). */
export function cgbAttackTimeSec(attack: number, envelopeGoal: number = CGB_PEAK): number {
  if (attack <= 0) return 0;
  return envelopeGoal * (attack + 1) * CGB_TICK_PERIOD_SEC;
}

/** CGB sustain 0-15 → gain 0-1, scalé par envelopeGoal courant.
 *  M4A : sustainGoal = (envelopeGoal × sustain + 15) >> 4 (cf. m4a.c:921).
 *  L'envelopeGoal varie avec le volume track courant. */
export function cgbSustainToGain(sustain: number, envelopeGoal: number = CGB_PEAK): number {
  return ((envelopeGoal * sustain + 15) >> 4) / CGB_PEAK;
}

/** CGB decay rate 0-7 + sustainLevel + envelopeGoal → durée linear ramp peak→sustain en seconds.
 *  M4A : envVol-- chaque (decay+1) ticks de envelopeGoal jusqu'à sustainGoal.
 *  decay=0 → step chaque tick. */
export function cgbDecayTimeSec(decay: number, sustainLevel: number, envelopeGoal: number = CGB_PEAK): number {
  const sustainSteps = Math.round(sustainLevel * CGB_PEAK);
  const stepsNeeded = envelopeGoal - sustainSteps;
  if (stepsNeeded <= 0) return 0;
  return stepsNeeded * (decay + 1) * CGB_TICK_PERIOD_SEC;
}

/** CGB release rate 0-7 + currentLevel 0-1 + envelopeGoal → durée linear ramp current→0 en seconds.
 *  M4A : envVol-- chaque (release+1) ticks de currentLevel (déjà à l'échelle envelopeGoal) jusqu'à 0.
 *  release=0 → cutoff instantané (oscillator off, cf. m4a.c:1064-1074). */
export function cgbReleaseTimeSec(release: number, currentLevel: number, envelopeGoal: number = CGB_PEAK): number {
  if (release <= 0) return 0;
  const stepsNeeded = Math.max(1, Math.round(currentLevel * envelopeGoal));
  return stepsNeeded * (release + 1) * CGB_TICK_PERIOD_SEC;
}
