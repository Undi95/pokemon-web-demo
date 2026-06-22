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
import { FieldEffectActiveListRemove } from './engine/field/field-effect-active-list';
import { ScriptContext_Enable } from './engine/script/script-runtime';
import { PlaySE } from '../harness/runtime/decomp-globals';
import { SE_M_ROCK_THROW } from './engine/decomp-data/include/constants/songs-data';

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
