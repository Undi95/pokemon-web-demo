/**
 * fldeff_teleport.ts — Port de `src/fldeff_teleport.c` (CS/move Téléport).
 *
 * Source de vérité : D:/Projet 1/decomps/pokeemeraude/src/fldeff_teleport.c
 *                  + field_effect.c:2356 (Task_TeleportWarpOut / TeleportWarpIn).
 *
 * ⚠️ CŒUR WARP (simplifié, décision user 2026-06-17) : le move warp vers le
 * dernier lieu de soins (lastHealLocation) avec un fade. L'ANIMATION spin-out /
 * spin-in 1:1 (le perso tourne sur lui-même + s'élève hors écran, puis redescend
 * en tournoyant) = FOLLOW-UP : elle manipule `sprite->y` directement, ce qui se
 * bat avec le rendu sprite joueur UNIFIÉ M3 (positionné en coords-monde par
 * UpdateObjectEvents), + exige d'intégrer `gFieldCallback` post-warp dans
 * executeWarp. Ici on livre le téléport FONCTIONNEL ; le spin viendra à part.
 *
 * `SetUpFieldMove_Teleport` (map-type check) + la confirmation YES/NO sont dans
 * party-screen.ts. `FieldCallback_Teleport` (gPostMenuFieldCallback) est exposé
 * ci-dessous (__FieldCallback_Teleport, anti-cycle ESM).
 */

import type { DecompRuntime } from '../harness/runtime/decomp-runtime';
import { Overworld_ResetStateAfterTeleport } from './overworld';
import { setPendingWarp } from './engine/field/warp-system';
import { gSaveBlock1Ptr } from './engine/save/save-block-state';
import { GetHealLocationByName } from './heal_location';
import { FieldEffectActiveListRemove } from './engine/field/field-effect-active-list';
import { FadeScreen, FADE_TO_BLACK } from './field_weather';

/** 1:1 décomp `FLDEFF_USE_TELEPORT = 63` (include/constants/field_effects.h). */
const FLDEFF_USE_TELEPORT = 63;

/** Cœur warp (simplifié) de `FldEff_UseTeleport` (fldeff_teleport.c:34) +
 *  `StartTeleportFieldEffect` (`SetWarpDestinationToLastHealLocation` + WarpIntoMap) :
 *  warp vers `gSaveBlock1Ptr->lastHealLocation`. Le spin-out (Task_TeleportWarpOut)
 *  est REMPLACÉ par un simple FADE_TO_BLACK (≈ WarpFadeOutScreen) → suivi du warp.
 *  Le warp de connexion = `setPendingWarp({destMap, x, y}, 'step')` (= __devGotoMap,
 *  prouvé par Plongée). */
export function FldEff_UseTeleport(_rt: DecompRuntime): number {
  FieldEffectActiveListRemove(FLDEFF_USE_TELEPORT);
  // Le port stocke le lieu de soins comme STRING ID (gSaveBlock1Ptr.respawnLocation,
  // posé par `setrespawn`) au lieu de lastHealLocation.{mapGroup,mapNum} (décomp).
  // On résout via la table heal_location → (map, x, y).
  const respawn = (gSaveBlock1Ptr as { respawnLocation?: string }).respawnLocation;
  const heal = GetHealLocationByName(respawn);
  if (heal) {
    // ≈ WarpFadeOutScreen (FADE_TO_BLACK) ; le spin-out 1:1 = follow-up.
    FadeScreen(FADE_TO_BLACK, 0);
    setPendingWarp(
      { destMap: heal.map, x: heal.x, y: heal.y, elevation: 0, warpId: -1 },
      'step',
    );
  } else {
    console.warn('[FldEff_UseTeleport] pas de respawnLocation résolue:', respawn);
  }
  return 0;  // FALSE
}

/** 1:1 décomp `FieldCallback_Teleport(void)` (fldeff_teleport.c:24) :
 *      Overworld_ResetStateAfterTeleport();
 *      FieldEffectStart(FLDEFF_USE_TELEPORT);
 *      gFieldEffectArguments[0] = GetCursorSelectionMonId();   // show-mon no-op (posé par le menu)
 *  Posé comme `gPostMenuFieldCallback` par SetUpFieldMove_Teleport (party menu). */
export function FieldCallback_Teleport(): void {
  Overworld_ResetStateAfterTeleport();
  const start = (globalThis as Record<string, unknown>).FieldEffectStart as ((id: number) => void) | undefined;
  start?.(FLDEFF_USE_TELEPORT);
}

// Exposé pour party-screen (SetUpFieldMove_Teleport) sans import statique (anti-cycle ESM).
(globalThis as Record<string, unknown>).__FieldCallback_Teleport = FieldCallback_Teleport;
