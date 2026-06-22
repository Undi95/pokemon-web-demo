/**
 * fldeff_cut.ts — Port 1:1 STRICT (MIROIR partiel) de `src/fldeff_cut.c`.
 *
 * Source de vérité : D:/Projet 1/decomps/pokeemeraude/src/fldeff_cut.c
 *
 * Pour l'instant : SEULEMENT la branche ARBRE (`FldEff_UseCutOnTree` + `StartCutTreeFieldEffect`),
 * déclenchée par l'interaction A face à un object event `OBJ_EVENT_GFX_CUTTABLE_TREE` dont le script
 * est `EventScript_CutTree` (badge1 + checkpartymove MOVE_CUT + msgbox + dofieldeffect
 * FLDEFF_USE_CUT_ON_TREE + waitstate + goto EventScript_CutTreeDown).
 *
 * Le Cut sur HERBE (`SetUpFieldMove_Cut` party-menu + `FldEff_UseCutOnGrass`/`FldEff_CutGrass` +
 * hyper cutter + sprites rotatifs + changements de metatiles) = chantier séparé (incomplet ici,
 * mais ce qui est porté est 100% propre — règle migration game/).
 */

import type { DecompRuntime } from '../harness/runtime/decomp-runtime';
import { CreateFieldMoveTask } from './field_effect_helpers';
import { FieldEffectActiveListRemove } from './engine/field/field-effect-active-list';
import { ScriptContext_Enable } from './engine/script/script-runtime';
import { PlaySE } from '../harness/runtime/decomp-globals';
import { SE_M_CUT } from './engine/decomp-data/include/constants/songs-data';

/** 1:1 décomp `FLDEFF_USE_CUT_ON_TREE = 2` (include/constants/field_effects.h). */
const FLDEFF_USE_CUT_ON_TREE = 2;

/** 1:1 STRICT décomp `StartCutTreeFieldEffect` (fldeff_cut.c:642) :
 *    PlaySE(SE_M_CUT);
 *    FieldEffectActiveListRemove(FLDEFF_USE_CUT_ON_TREE);
 *    ScriptContext_Enable();
 *  `PlaySE(SE_M_CUT)` = le bruitage de coupe (se_m_cut.wav préchargé) — demandé par le user, wiré 1:1.
 *  `ScriptContext_Enable` reprend `EventScript_CutTree` après le
 *  `waitstate` → `goto EventScript_CutTreeDown` (l'arbre tombe via Movement_CutTreeDown + removeobject).
 *
 *  ⚠️ Le `waitstate` du port (script-opcodes-special.ts) attend un latch `SignalWaitState()` (= le
 *  pattern port pour « ScriptContext_Enable débloque le waitstate » ; les UI flows wallclock/starter
 *  l'appellent déjà). `ScriptContext_Enable` seul ne suffit pas (le waitstate est un native-poll, pas
 *  un check de status) → on appelle AUSSI `SignalWaitState()` (sinon script bloqué à `waitstate`).
 *  Import LAZY de SignalWaitState : `script-opcodes-special` est lourd (dispatcher special tire tout
 *  le graphe) → import statique = cycle ESM/TDZ `BG_SCREEN_SIZE` au boot. Appelé au runtime → lazy OK. */
function StartCutTreeFieldEffect(): void {
  PlaySE(SE_M_CUT);
  FieldEffectActiveListRemove(FLDEFF_USE_CUT_ON_TREE);
  ScriptContext_Enable();
  void import('./engine/script/script-opcodes-special').then(m => m.SignalWaitState());
}

/** 1:1 STRICT décomp `FldEff_UseCutOnTree` (fldeff_cut.c:300) :
 *    u8 taskId = CreateFieldMoveTask();
 *    gTasks[taskId].data[8/9] = (u32)StartCutTreeFieldEffect;  // fn stockée en moitiés
 *    IncrementGameStat(GAME_STAT_USED_CUT);
 *    return FALSE;
 *  Port : `CreateFieldMoveTask(StartCutTreeFieldEffect)` (la fn est passée directement, pas data[8/9]).
 *  ⚠️ DETTE mineure : `IncrementGameStat(GAME_STAT_USED_CUT)` non porté (stat cosmétique, comme PlaySE). */
export function FldEff_UseCutOnTree(_rt: DecompRuntime): number {
  CreateFieldMoveTask(StartCutTreeFieldEffect);
  return 0;  // FALSE
}
