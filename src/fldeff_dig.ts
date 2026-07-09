/**
 * fldeff_dig.ts — Port de `src/fldeff_dig.c` (CS Tunnel / move Dig hors combat).
 *
 * Source de vérité : D:/Projet 1/decomps/pokeemeraude/src/fldeff_dig.c
 *
 * ⚠️ CŒUR WARP (simplifié, même décision que Téléport) : le move warp vers le
 * `escapeWarp` (entrée du donjon courant) avec un fade. L'ANIMATION de creusage
 * 1:1 (`Task_UseDigEscapeRopeOnField` : le perso creuse vers le bas) = FOLLOW-UP
 * (manip directe du sprite joueur, entangled rendu M3, comme le spin Téléport).
 *
 * `SetUpFieldMove_Dig` (= CanUseDigOrEscapeRopeOnCurMap = gMapHeader.allowEscaping)
 * + le YES/NO « Fuir d'ici? » sont dans party-screen.ts. `FieldCallback_Dig`
 * (gPostMenuFieldCallback) est exposé ci-dessous (__FieldCallback_Dig, anti-cycle).
 */

import type { DecompRuntime } from '../harness/runtime/decomp-runtime';
import { Overworld_ResetStateAfterDigEscRope } from './overworld';
import { setPendingWarp } from './engine/field/warp-system';
import { FieldEffectActiveListRemove } from './field_effect';
import { FadeScreen, FADE_TO_BLACK } from './field_weather';
import { gMapHeader } from './fieldmap';

/** 1:1 décomp `FLDEFF_USE_DIG = 38` (include/constants/field_effects.h). */
const FLDEFF_USE_DIG = 38;

/** Cœur warp PARTAGÉ Dig/EscapeRope (simplifié, même décision que Téléport) : fade
 *  + warp vers l'`escapeWarp` (entrée du donjon courant, posée par `setescapewarp`).
 *  Le port le stocke dans `globalThis.__escapeWarp` ({mapName SANS préfixe MAP_, x, y}).
 *  Le spin/creusage 1:1 (Task_*WarpOut state machine) = follow-up rendu. */
function _warpToEscapeWarp(): void {
  const esc = (globalThis as Record<string, unknown>).__escapeWarp as
    { mapName?: string; x?: number; y?: number } | undefined;
  if (esc && esc.mapName) {
    const destMap = esc.mapName.startsWith('MAP_') ? esc.mapName : `MAP_${esc.mapName}`;
    // ≈ WarpFadeOutScreen (FADE_TO_BLACK).
    FadeScreen(FADE_TO_BLACK, 0);
    setPendingWarp(
      { destMap, x: esc.x ?? 0, y: esc.y ?? 0, elevation: 0, warpId: -1 },
      'step',
    );
  } else {
    console.warn('[escapeWarp] pas d\'escapeWarp set (setescapewarp)');
  }
}

/** 1:1 décomp `FldEff_UseDig` (fldeff_dig.c:38) → warp vers escapeWarp. */
export function FldEff_UseDig(_rt: DecompRuntime): number {
  FieldEffectActiveListRemove(FLDEFF_USE_DIG);
  _warpToEscapeWarp();
  return 0;  // FALSE
}

/** 1:1 décomp `CanUseDigOrEscapeRopeOnCurMap` (item_use.c:922) :
 *      return gMapHeader.allowEscaping; */
export function CanUseDigOrEscapeRopeOnCurMap(): boolean {
  return gMapHeader?.allowEscaping === true;
}

/** 1:1 décomp `StartEscapeRopeFieldEffect` (field_effect.c:2242) — simplifié (le spin
 *  du joueur + WarpFadeOut = state machine Task_EscapeRopeWarpOut, follow-up rendu M3
 *  comme le creusage Dig) : LockPlayerFieldControls + warp vers __escapeWarp.
 *  DETTE : FreezeObjectEvents + l'animation de spin. */
export function StartEscapeRopeFieldEffect(): void {
  (globalThis as Record<string, unknown>).__sLockFieldControls = true;  // LockPlayerFieldControls
  _warpToEscapeWarp();
}

/** 1:1 décomp `FieldCallback_Dig(void)` (fldeff_dig.c:28) :
 *      Overworld_ResetStateAfterDigEscRope();
 *      FieldEffectStart(FLDEFF_USE_DIG);
 *      gFieldEffectArguments[0] = GetCursorSelectionMonId();   // show-mon no-op
 *  Posé comme `gPostMenuFieldCallback` par SetUpFieldMove_Dig (party menu). */
export function FieldCallback_Dig(): void {
  Overworld_ResetStateAfterDigEscRope();
  const start = (globalThis as Record<string, unknown>).FieldEffectStart as ((id: number) => void) | undefined;
  start?.(FLDEFF_USE_DIG);
}

// Exposé pour party-screen (SetUpFieldMove_Dig) sans import statique (anti-cycle ESM).
(globalThis as Record<string, unknown>).__FieldCallback_Dig = FieldCallback_Dig;
