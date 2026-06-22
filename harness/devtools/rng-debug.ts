/**
 * rng-debug.ts — outils console RNG (`window.rng`) + wrappers debug.
 *
 * GLUE MAISON (zéro équivalent décomp) : extrait du shim transitoire
 * `engine/system/random.ts` lors de sa suppression. Délègue au miroir
 * `src/random.ts` (random.c) + `include/random.ts` (random.h). Importé une
 * fois au boot (harness/main.ts) pour enregistrer `window.rng`, et par
 * battle-devtools pour les sondes déterministes RNG.
 */
import { Random, Random2, SeedRng, SeedRng2, _rngDebug, _rngReset } from '../../src/random';
import { Random32 } from '../../include/random';

export function _debugGetRngValue(): number { return _rngDebug().gRngValue; }
export function _debugGetRng2Value(): number { return _rngDebug().gRng2Value; }
export function _debugGetRandCount(): number { return _rngDebug().sRandCount; }
export function _debugResetRng(): void { _rngReset(); }

// ─── Expose console debug (= window.rng) ─────────────────────────────────────
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).rng = {
    Random, Random2, Random32, SeedRng, SeedRng2,
    value: _debugGetRngValue, value2: _debugGetRng2Value,
    count: _debugGetRandCount, reset: _debugResetRng,
  };
}
