/**
 * field-effect-active-list.ts — 1:1 décomp `src/field_effect.c:gFieldEffectActiveList`.
 *
 * Source de vérité :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/field_effect.c` (FieldEffectStart,
 *     FieldEffectActiveListContains, FieldEffectActiveListAdd, etc.)
 *   - `D:/Projet 1/decomps/pokeemeraude/include/constants/field_effect.h` (FLDEFF_*)
 *
 * Concept :
 *   Quand un script déclenche un field effect (= dofieldeffect FLDEFF_X),
 *   l'effect est ajouté à `gFieldEffectActiveList[]`. Pendant sa durée d'anim,
 *   le tile callback de l'effect est actif. À la fin de l'anim, il se retire
 *   de la list via `FieldEffectActiveListRemove`.
 *
 *   `waitfieldeffect FLDEFF_X` polls `FieldEffectActiveListContains(FLDEFF_X)`
 *   et resume le script quand l'effect est retiré.
 *
 *   Notre impl simple : timer-based default 60 frames si pas explicit duration.
 *   Future : real anim-driven removal pour chaque field effect implémenté.
 */

// ─── Active list state ───────────────────────────────────────────────────────

/** Set des field effect IDs currently active. */
const _gFieldEffectActiveList = new Set<number>();

/** Map id → expected end time (performance.now ms). Auto-cleanup quand atteint. */
const _gFieldEffectEndTime = new Map<number, number>();

/** Default duration en ms (= 1s = 60 frames @ 60fps). Future : per-effect duration. */
const DEFAULT_FIELD_EFFECT_DURATION_MS = 1000;

// ─── Public API 1:1 décomp ──────────────────────────────────────────────────

/** 1:1 décomp `FieldEffectActiveListAdd` (field_effect.c) :
 *  Add un effect id à la list. Triggered par FieldEffectStart implicitement. */
export function FieldEffectActiveListAdd(id: number, durationMs?: number): void {
  _gFieldEffectActiveList.add(id);
  _gFieldEffectEndTime.set(id, performance.now() + (durationMs ?? DEFAULT_FIELD_EFFECT_DURATION_MS));
}

/** 1:1 décomp `FieldEffectActiveListRemove` (field_effect.c) :
 *  Remove un effect id de la list. Appelé par le callback de l'effect à fin
 *  d'anim, OU automatiquement quand le timer expire. */
export function FieldEffectActiveListRemove(id: number): void {
  _gFieldEffectActiveList.delete(id);
  _gFieldEffectEndTime.delete(id);
}

/** 1:1 décomp `FieldEffectActiveListContains` (field_effect.c) :
 *  Returns TRUE si effect id encore active. Auto-cleanup les timers expirés
 *  avant de vérifier. */
export function FieldEffectActiveListContains(id: number): boolean {
  // Auto-cleanup : check end time pour cet id.
  const endTime = _gFieldEffectEndTime.get(id);
  if (endTime !== undefined && performance.now() >= endTime) {
    FieldEffectActiveListRemove(id);
    return false;
  }
  return _gFieldEffectActiveList.has(id);
}

/** Clear toute la list. Appelé au map switch / scene reset. */
export function ClearFieldEffectActiveList(): void {
  _gFieldEffectActiveList.clear();
  _gFieldEffectEndTime.clear();
}

// Auto-register sur globalThis pour script-opcodes (= avoid import cycle).
(globalThis as { __fieldEffectActiveList?: Record<string, unknown> }).__fieldEffectActiveList = {
  FieldEffectActiveListAdd,
  FieldEffectActiveListRemove,
  FieldEffectActiveListContains,
  ClearFieldEffectActiveList,
};
