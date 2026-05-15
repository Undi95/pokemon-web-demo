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
 *   - `FaintClearSetData()` 1:1 décomp partial (= MVP, skips gProtectStructs +
 *     gBattleStruct + gBattleResources qui ne sont pas portés)
 */

import {
  gBattleMons, gBattlerAttacker, gBattlerTarget, gEffectBattler,
  gBattlerFainted, gBattleScripting, gStatuses3, gLastMoves,
  gLastLandedMoves, gLastResultingMoves, gLastHitBy, gLastHitByType,
  gActiveBattler, gDisableStructs,
} from './state';
import { STATUS2_MULTIPLETURNS, STATUS2_UPROAR, STATUS2_BIDE, STATUS2_LOCK_CONFUSE, STATUS3_SEMI_INVULNERABLE } from './constants';
import {
  BS_TARGET, BS_ATTACKER, BS_EFFECT_BATTLER, BS_FAINTED,
  BS_ATTACKER_WITH_PARTNER, BS_FAINTED_LINK_MULTIPLE_1,
  BS_FAINTED_LINK_MULTIPLE_2, BS_BATTLER_0,
  BS_ATTACKER_SIDE, BS_NOT_ATTACKER_SIDE, BS_SCRIPTING,
  BS_PLAYER1, BS_OPPONENT1, BS_PLAYER2, BS_OPPONENT2,
  NUM_BATTLE_STATS, DEFAULT_STAT_STAGE, MOVE_NONE,
} from './constants';

// ─── B_POSITION_* (constants/battle.h:28-31) ────────────────────────────────
export const B_POSITION_PLAYER_LEFT    = 0;
export const B_POSITION_OPPONENT_LEFT  = 1;
export const B_POSITION_PLAYER_RIGHT   = 2;
export const B_POSITION_OPPONENT_RIGHT = 3;

/** 1:1 décomp `gBattlerPositions[MAX_BATTLERS_COUNT]` — par défaut single battle :
 *  battler i a position i. Set par battle_main au setup. Pour MVP single battle,
 *  on hardcode identity. */
export const gBattlerPositions: number[] = [
  B_POSITION_PLAYER_LEFT,
  B_POSITION_OPPONENT_LEFT,
  B_POSITION_PLAYER_RIGHT,
  B_POSITION_OPPONENT_RIGHT,
];

// ─── GetBattlerAtPosition (battle_anim_mons.c:859) — 1:1 décomp ────────────

/** 1:1 décomp `GetBattlerAtPosition(u8 position)`. */
export function GetBattlerAtPosition(position: number): number {
  // gBattlersCount = 2 single, 4 double. On itère full pour 1:1.
  for (let i = 0; i < gBattlerPositions.length; i++) {
    if (gBattlerPositions[i] === position) return i;
  }
  return 0;
}

// ─── getBattlerForBattleScript (battle_util.c) — 1:1 décomp full ───────────

/** 1:1 décomp `GetBattlerForBattleScript(u8 arg)`. */
export function getBattlerForBattleScript(caseId: number): number {
  switch (caseId) {
    case BS_TARGET:                  return gBattlerTarget;
    case BS_ATTACKER:                return gBattlerAttacker;
    case BS_EFFECT_BATTLER:          return gEffectBattler;
    case BS_BATTLER_0:               return 0;
    case BS_SCRIPTING:               return gBattleScripting.battler;
    case BS_FAINTED:                 return gBattlerFainted;
    case BS_FAINTED_LINK_MULTIPLE_1: return gBattlerFainted;
    case BS_ATTACKER_WITH_PARTNER:
    case BS_FAINTED_LINK_MULTIPLE_2:
    case BS_ATTACKER_SIDE:
    case BS_NOT_ATTACKER_SIDE:
    case BS_PLAYER1:
      return GetBattlerAtPosition(B_POSITION_PLAYER_LEFT);
    case BS_OPPONENT1:
      return GetBattlerAtPosition(B_POSITION_OPPONENT_LEFT);
    case BS_PLAYER2:
      return GetBattlerAtPosition(B_POSITION_PLAYER_RIGHT);
    case BS_OPPONENT2:
      return GetBattlerAtPosition(B_POSITION_OPPONENT_RIGHT);
    default:
      return 0;
  }
}

// ─── FaintClearSetData (battle_main.c) — partial 1:1 ───────────────────────

/** Partial 1:1 décomp `FaintClearSetData()`. Réinitialise les states battle
 *  d'un battler fainted. Pour MVP, on porte les bits clé :
 *  - statStages reset to DEFAULT
 *  - status2/status3 clear
 *  - gDisableStructs[active] clear
 *  - gLastMoves[active], gLastLandedMoves, gLastResultingMoves, gLastHitBy reset
 *
 *  TODO (non portés) :
 *  - gProtectStructs (struct pas porté)
 *  - gBattleStruct.choicedMove / lastTakenMove / lastTakenMoveFrom / palaceFlags
 *  - gBattleResources.flags
 *  - gBattleMons[].types[] re-set from gSpeciesInfo (BattleMon a type1/type2
 *    séparés)
 *  - ClearBattlerMoveHistory / ClearBattlerAbilityHistory
 *  - gActionSelectionCursor / gMoveSelectionCursor (state UI)
 *  - gLastPrintedMoves */
export function FaintClearSetData(): void {
  for (let i = 0; i < NUM_BATTLE_STATS; i++) {
    gBattleMons[gActiveBattler].statStages[i] = DEFAULT_STAT_STAGE;
  }
  gBattleMons[gActiveBattler].status2 = 0;
  gStatuses3[gActiveBattler] = 0;

  // Clear gDisableStructs[active] entièrement.
  const ds = gDisableStructs[gActiveBattler];
  for (const k of Object.keys(ds) as Array<keyof typeof ds>) {
    (ds as unknown as Record<string, number>)[k] = 0;
  }
  ds.isFirstTurn = 2; // 1:1 décomp : reset to 2 (= post-faint freshness).

  gLastMoves[gActiveBattler] = MOVE_NONE;
  gLastLandedMoves[gActiveBattler] = MOVE_NONE;
  gLastHitByType[gActiveBattler] = 0;
  gLastResultingMoves[gActiveBattler] = MOVE_NONE;
  gLastHitBy[gActiveBattler] = 0xFF;
}

// ─── CancelMultiTurnMoves (battle_util.c:864) — 1:1 décomp ─────────────────

/** 1:1 décomp `CancelMultiTurnMoves(u8 battler)`. Clear locked/uproar/bide/
 *  rollout/furycutter state pour un battler donné. Utilisé quand Rollout
 *  misses, Bide breaks, ou switch out. */
export function CancelMultiTurnMoves(battler: number): void {
  gBattleMons[battler].status2 &= ~STATUS2_MULTIPLETURNS;
  gBattleMons[battler].status2 &= ~STATUS2_LOCK_CONFUSE;
  gBattleMons[battler].status2 &= ~STATUS2_UPROAR;
  gBattleMons[battler].status2 &= ~STATUS2_BIDE;
  gStatuses3[battler] &= ~STATUS3_SEMI_INVULNERABLE;
  gDisableStructs[battler].rolloutTimer = 0;
  gDisableStructs[battler].furyCutterCounter = 0;
}

// ─── GetScaledHPFraction (battle_interface.c:2517) — 1:1 décomp ────────────

/** 1:1 décomp `GetScaledHPFraction(s16 hp, s16 maxhp, u8 scale)`. */
export function GetScaledHPFraction(hp: number, maxhp: number, scale: number): number {
  if (maxhp === 0) return 0;
  let result = Math.floor((hp * scale) / maxhp);
  if (result === 0 && hp > 0) return 1;
  return result;
}
