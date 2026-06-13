/**
 * battle/util.ts — helpers partagés entre opcodes.
 *
 * Source de vérité (1:1 décomp) :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/battle_util.c`
 *   - `D:/Projet 1/decomps/pokeemeraude/src/battle_main.c`
 *   - `D:/Projet 1/decomps/pokeemeraude/src/battle_anim_mons.c:859` (GetBattlerAtPosition)
 *
 * Helpers exposés :
 *   - `getBattlerForBattleScript(arg)` 1:1 décomp (full BS_* enum)
 *   - `GetBattlerAtPosition(position)` 1:1 décomp (search gBattlerPositions[])
 *   - `FaintClearSetData()` 1:1 décomp full (= skip gProtectStructs/gBattleStruct/
 *     gBattleResources fields rarely-used pour Phase 1)
 */

import {
  gBattleMons, gBattlerAttacker, gBattlerTarget, gEffectBattler,
  gBattlerFainted, gBattleScripting, gStatuses3, gLastMoves,
  gLastLandedMoves, gLastResultingMoves, gLastHitBy, gLastHitByType,
  gLastPrintedMoves,
  gActiveBattler, gDisableStructs, gProtectStructs,
  gBattleStruct, gBattlersCount, gCurrentMove,
  gActionSelectionCursor, gMoveSelectionCursor,
  gBattleResourcesFlags,
} from './state';
import { getSpeciesTypes } from './data/species-runtime';
import { STATUS2_DESTINY_BOND, STATUS3_GRUDGE } from './constants';
import {
  STATUS2_MULTIPLETURNS, STATUS2_UPROAR, STATUS2_BIDE, STATUS2_LOCK_CONFUSE,
  STATUS3_SEMI_INVULNERABLE,
  STATUS2_ESCAPE_PREVENTION, STATUS2_WRAPPED,
  STATUS2_INFATUATION,
  GET_BATTLER_SIDE,
  ABILITY_CLOUD_NINE, ABILITY_AIR_LOCK,
} from './constants';
import {
  BS_TARGET, BS_ATTACKER, BS_EFFECT_BATTLER, BS_FAINTED,
  BS_ATTACKER_WITH_PARTNER, BS_FAINTED_LINK_MULTIPLE_1,
  BS_FAINTED_LINK_MULTIPLE_2, BS_BATTLER_0,
  BS_ATTACKER_SIDE, BS_NOT_ATTACKER_SIDE, BS_SCRIPTING,
  BS_PLAYER1, BS_OPPONENT1, BS_PLAYER2, BS_OPPONENT2,
  NUM_BATTLE_STATS, DEFAULT_STAT_STAGE, MOVE_NONE,
} from './constants';

// ─── B_POSITION_* + gBattlerPositions + GetBattlerAtPosition/Position : DÉPLACÉS
//     dans le miroir src/game/battle_anim_mons.ts (battle_anim_mons.c:858-859,
//     éclatement du grab-bag util 2026-06-13). Import (usage local : getBattlerFor-
//     BattleScript, GetDefaultMoveTarget) + re-export (compat 14 importeurs). ──
import {
  B_POSITION_PLAYER_LEFT, B_POSITION_OPPONENT_LEFT,
  B_POSITION_PLAYER_RIGHT, B_POSITION_OPPONENT_RIGHT,
  gBattlerPositions, GetBattlerAtPosition, GetBattlerPosition,
} from '../../game/battle_anim_mons';
export {
  B_POSITION_PLAYER_LEFT, B_POSITION_OPPONENT_LEFT,
  B_POSITION_PLAYER_RIGHT, B_POSITION_OPPONENT_RIGHT,
  gBattlerPositions, GetBattlerAtPosition, GetBattlerPosition,
};

// ─── getBattlerForBattleScript : DÉPLACÉ dans le miroir game/battle_util.ts
//     (battle_util.c, éclatement du grab-bag util stage 2, 2026-06-13). ──

// ─── FaintClearSetData (battle_main.c:3264-3360) — 1:1 décomp ───────────

/** 1:1 décomp `FaintClearSetData()` (battle_main.c:3264-3360). Réinitialise
 *  TOUS les states battle d'un battler fainted. Appelé par Cmd_tryfaintmon /
 *  Cmd_handlefaintswitch après confirmation faint.
 *
 *  Notes (= UI / AI tracking deferred Phase 1.4) :
 *  - gActionSelectionCursor[], gMoveSelectionCursor[] (= UI cursor state).
 *  - gBattleResources->flags->flags[] (= AI/script flags tracker, ~256 flags).
 *  - ClearBattlerMoveHistory (= AI move tracking par battler).
 *
 *  Le reste est 1:1 strict.
 */
// ─── FaintClearSetData — DÉPLACÉ dans le miroir src/game/battle_main.ts
//     (battle_main.c:3270-3355, consolidation C2 2026-06-10). Re-export compat. ──
export { FaintClearSetData } from '../../game/battle_main';

// ─── CancelMultiTurnMoves : DÉPLACÉ dans le miroir game/battle_util.ts
//     (battle_util.c:864, éclatement du grab-bag util stage 2, 2026-06-13). ──

// ─── GetScaledHPFraction — DÉPLACÉ dans le miroir src/game/battle_interface.ts
//     (battle_interface.c:2517, consolidation C4 2026-06-09). Re-export compat. ──
export { GetScaledHPFraction } from '../../game/battle_interface';

// ─── ClearFuryCutterDestinyBondGrudge : DÉPLACÉ dans le miroir game/battle_util.ts
//     (battle_util.c:3798-3803, éclatement du grab-bag util stage 2, 2026-06-13). ──

// ─── BATTLE_HISTORY (battle_ai_script_commands.c:618-661) — UNIFIÉ : le store
//     gBattleHistory + RecordAbilityBattle/RecordItemEffectBattle/ClearBattler*History/
//     RecordLastUsedMoveByTarget vivent dans game/battle_ai_script_commands.ts (store
//     LU par l'IA). Le _battleHistory dupliqué d'ici était mort (Part B, c979c57a) →
//     retiré 2026-06-13. PressurePPLose (battle_util.c:740, vivant) → game/battle_util.ts.

// ─── GetDefaultMoveTarget : DÉPLACÉ dans le miroir game/pokemon.ts
//     (pokemon.c:3422-3446, éclatement du grab-bag util, 2026-06-13). ──

// ─── WEATHER_HAS_EFFECT : DÉPLACÉ dans le miroir game/battle_util.ts
//     (battle_util.h:47, éclatement du grab-bag util stage 2, 2026-06-13). ──

// ─── TurnValuesCleanUp (battle_main.c:4857-4892) — 1:1 décomp ──────────────

// ─── TurnValuesCleanUp — DÉPLACÉ dans le miroir src/game/battle_main.ts
//     (battle_main.c:4857-4892, consolidation C2 2026-06-10). Re-export compat. ──
export { TurnValuesCleanUp } from '../../game/battle_main';
