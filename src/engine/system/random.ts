/**
 * random.ts — RE-EXPORT TRANSITOIRE vers le miroir 1:1 `src/game/random.ts`.
 *
 * ⚠️ MIGRATION MIROIR (2026-06-05) : la logique RNG vit désormais UNE seule fois
 * dans `src/game/random.ts` (= decomp/src/random.c) + `src/game/include/random.ts`
 * (= random.h). Ce fichier ne garde QUE :
 *   - un re-export des fonctions RNG (zéro duplication de logique) ;
 *   - `SeedRngAndSetTrainerId` / `GetGeneratedTrainerIdLower` qui appartiennent en
 *     fait à `main.c` (PAS à random.c) → à déplacer vers le miroir `main`/`new_game`
 *     quand il existera. Gardées ici en transit pour ne pas casser les importeurs.
 *
 * À terme : basculer tous les importeurs vers `@game/...` puis SUPPRIMER ce fichier.
 */

import { Random, Random2, SeedRng, SeedRng2, _rngDebug, _rngReset } from '../../game/random';
import { Random32 } from '../../game/include/random';

export { Random, Random2, Random32, SeedRng, SeedRng2 };

// ─── Debug (compat anciens noms ; délègue au miroir) ─────────────────────────
export function _debugGetRngValue(): number { return _rngDebug().gRngValue; }
export function _debugGetRng2Value(): number { return _rngDebug().gRng2Value; }
export function _debugGetRandCount(): number { return _rngDebug().sRandCount; }
export function _debugResetRng(): void { _rngReset(); }

// ─── main.c (PAS random.c) — à migrer vers le miroir main/new_game ───────────
// 1:1 décomp main.c:72 — static u16 sTrainerId.
let sTrainerId = 0;

/** Simule REG_TM1CNT_L (timer 1 GBA, 16 bits) : compteur monotone + entropy
 *  perf.now() au boot. Déterministe par session ; trainerId reproductible pour
 *  un même flow de boot. (Bridge plateforme — pas de timer HW.) */
let _tm1Counter = 0x12345 & 0xFFFF;
function _readSimulatedTM1CntL(): number {
  _tm1Counter = (_tm1Counter + 1) & 0xFFFF;
  if (typeof performance !== 'undefined' && performance.now) {
    _tm1Counter = (_tm1Counter ^ Math.floor(performance.now())) & 0xFFFF;
  }
  return _tm1Counter;
}

/** 1:1 décomp main.c:201 — void SeedRngAndSetTrainerId(void). */
export function SeedRngAndSetTrainerId(): void {
  const val = _readSimulatedTM1CntL();
  SeedRng(val);
  sTrainerId = val;
}

/** 1:1 décomp main.c:209 — u16 GetGeneratedTrainerIdLower(void). */
export function GetGeneratedTrainerIdLower(): number {
  return sTrainerId;
}

// ─── Expose console debug (= window.rng) ─────────────────────────────────────
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).rng = {
    Random, Random2, Random32, SeedRng, SeedRng2,
    value: _debugGetRngValue, value2: _debugGetRng2Value,
    count: _debugGetRandCount, reset: _debugResetRng,
  };
}
