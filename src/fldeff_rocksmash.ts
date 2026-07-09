/**
 * fldeff_rocksmash.ts — Port 1:1 STRICT (MIROIR partiel) de `src/fldeff_rocksmash.c`.
 *
 * Source de vérité : D:/Projet 1/decomps/pokeemeraude/src/fldeff_rocksmash.c
 *
 * Branche INTERACTION (A face à un object event `OBJ_EVENT_GFX_BREAKABLE_ROCK`, script
 * `EventScript_RockSmash`, maps Route111/RusturfTunnel…) : badge3 + checkpartymove MOVE_ROCK_SMASH
 * + msgbox + dofieldeffect FLDEFF_USE_ROCK_SMASH + waitstate + goto EventScript_SmashRock (le rocher
 * se brise via `rock_smash_break` + removeobject + éventuellement `special RockSmashWildEncounter`).
 *
 * ⚠️ `CreateFieldMoveTask` (la tâche field-move commune, décomp fldeff_rocksmash.c:48) vit pour
 * l'instant dans game/field_effect_helpers.ts (avec surf/cut) — dette de placement (devrait revenir
 * ici). On l'importe de là. Le Cut sur party-menu (`SetUpFieldMove_RockSmash`) = chantier séparé.
 */

import type { DecompRuntime } from '../harness/runtime/decomp-runtime';
import { CreateFieldMoveTask } from './field_effect_helpers';
import { FieldEffectActiveListRemove } from './field_effect';
import { ScriptContext_Enable } from './script';
import { PlaySE } from '../harness/runtime/decomp-globals';
import { SE_M_ROCK_THROW } from '../include/constants/songs';
import { GetXYCoordsOneStepInFrontOfPlayer, PlayerGetElevation } from './field_player_avatar';
import { GetObjectEventIdByPosition, gObjectEvents } from './event_object_movement';
import { VarSet } from './event_data';

/** 1:1 décomp `FLDEFF_USE_ROCK_SMASH = 37` (include/constants/field_effects.h). */
const FLDEFF_USE_ROCK_SMASH = 37;

/** 1:1 STRICT décomp `FieldMove_RockSmash` (fldeff_rocksmash.c) :
 *    PlaySE(SE_M_ROCK_THROW);
 *    FieldEffectActiveListRemove(FLDEFF_USE_ROCK_SMASH);
 *    ScriptContext_Enable();
 *  `ScriptContext_Enable` reprend `EventScript_RockSmash` après le `waitstate` → `goto EventScript_SmashRock`.
 *  ⚠️ Le `waitstate` du port (native-poll) ignore ScriptContext_Enable → on signale aussi via
 *  `SignalWaitState()` (= le pattern port, cf. fldeff_cut.ts). Import LAZY de script-opcodes-special
 *  (lourd) pour éviter le cycle ESM/TDZ. */
function FieldMove_RockSmash(): void {
  PlaySE(SE_M_ROCK_THROW);
  FieldEffectActiveListRemove(FLDEFF_USE_ROCK_SMASH);
  ScriptContext_Enable();
  void import('./scrcmd').then(m => m.SignalWaitState());
}

/** 1:1 STRICT décomp `FldEff_UseRockSmash` (fldeff_rocksmash.c:150) :
 *    u8 taskId = CreateFieldMoveTask();
 *    gTasks[taskId].data[8/9] = (u32)FieldMove_RockSmash;
 *    IncrementGameStat(GAME_STAT_USED_ROCK_SMASH);
 *    return FALSE;
 *  ⚠️ DETTE mineure : `IncrementGameStat(GAME_STAT_USED_ROCK_SMASH)` non porté (stat cosmétique). */
export function FldEff_UseRockSmash(_rt: DecompRuntime): number {
  CreateFieldMoveTask(FieldMove_RockSmash);
  return 0;  // FALSE
}

/** 1:1 STRICT décomp `bool8 CheckObjectGraphicsInFrontOfPlayer(u8 graphicsId)`
 *  (fldeff_rocksmash.c:30-46) : object event à la case devant le joueur avec le
 *  graphics demandé → pose gSpecialVar_LastTalked (0x800F) + TRUE. `graphicsId`
 *  chez nous = clé string ('OBJ_EVENT_GFX_PUSHABLE_BOULDER'). Le décomp passe
 *  par la global gPlayerFacingPosition — locals équivalents ici (aucun autre
 *  lecteur ne dépend de la global entre deux appels). */
export function CheckObjectGraphicsInFrontOfPlayer(graphicsId: string): boolean {
  const { x, y } = GetXYCoordsOneStepInFrontOfPlayer();
  const elevation = PlayerGetElevation();
  const objEventId = GetObjectEventIdByPosition(x, y, elevation);
  const npc = gObjectEvents[objEventId];
  if (!npc || npc.graphicsId !== graphicsId) {
    return false;
  } else {
    VarSet(0x800F /* gSpecialVar_LastTalked */, npc.localId);
    return true;
  }
}

// Pont globalThis (pattern __PartyHasMonWithSurf) : party_menu.SetUpFieldMove_Strength
// ne peut pas importer ce module (cycle ESM party_menu ⇄ field/eom).
(globalThis as Record<string, unknown>).__CheckObjectGraphicsInFrontOfPlayer = CheckObjectGraphicsInFrontOfPlayer;
