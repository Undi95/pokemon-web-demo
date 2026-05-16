/**
 * battle/move-limitations.ts — Port 1:1 décomp `CheckMoveLimitations` +
 * `AreAllMovesUnusable` (battle_util.c:1069-1127).
 *
 * Check pour chaque move dans le moveset du battler si il est utilisable
 * (= pas Disabled, pas Torment, pas Taunt, pas Imprison, pas Choice Band lock,
 * pas Encore lock, pas PP 0, pas MOVE_NONE).
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/battle_util.c:1069-1127`.
 */

import {
  gBattleMons, gActiveBattler,
  gLastMoves,
  gDisableStructs, gProtectStructs,
  gBattleStruct,
  setPotentialItemEffectBattler,
} from './state';
import {
  STATUS2_TORMENT,
  MOVE_NONE, MOVE_UNAVAILABLE,
  MAX_MON_MOVES,
  HOLD_EFFECT_CHOICE_BAND,
  MOVE_LIMITATION_ZEROMOVE, MOVE_LIMITATION_PP,
  MOVE_LIMITATION_DISABLED, MOVE_LIMITATION_TORMENTED,
  MOVE_LIMITATION_TAUNT, MOVE_LIMITATION_IMPRISON,
  MOVE_LIMITATIONS_ALL, ALL_MOVES_MASK,
} from './constants';
import { gBitTable } from './battle-controllers';
import { GetItemHoldEffect } from './data/item-hold-effects';
import { getBattleMove } from './data/battle-moves';

/** 1:1 décomp `GetImprisonedMovesCount(battlerId, move)` (battle_util.c:1129-1151).
 *  Compte combien de battlers (= opponents) ont Imprison + ont ce move dans
 *  leur moveset. Si > 0 le caller doit bloquer l'usage du move. */
function _GetImprisonedMovesCount(battlerId: number, move: number): number {
  let imprisonedMoves = 0;
  // STATUS3_IMPRISONED_OTHERS = 1 << 13.
  const STATUS3_IMPRISONED_OTHERS_LOCAL = 1 << 13;
  // Lazy lookup gBattlersCount + gStatuses3 via globalThis.
  const stateMod = (globalThis as { __battleState?: { gBattlersCount?: number; gStatuses3?: number[]; gBattleMons?: { moves: number[] }[] } }).__battleState;
  const battlersCount = stateMod?.gBattlersCount ?? 2;
  const statuses3 = stateMod?.gStatuses3;
  const battleMons = stateMod?.gBattleMons;
  if (!statuses3 || !battleMons) return 0;

  // BATTLE_OPPOSITE side check = (id ^ 1).
  const battlerSide = battlerId & 1;
  for (let i = 0; i < battlersCount; i++) {
    if (battlerSide !== (i & 1)
        && (statuses3[i] & STATUS3_IMPRISONED_OTHERS_LOCAL)) {
      for (let j = 0; j < MAX_MON_MOVES; j++) {
        if (move === battleMons[i].moves[j]) {
          imprisonedMoves++;
          break;
        }
      }
    }
  }
  return imprisonedMoves;
}

/** 1:1 décomp `CheckMoveLimitations(battlerId, unusableMoves, check)`. */
export function CheckMoveLimitations(battlerId: number, unusableMoves: number, check: number): number {
  // 1:1 décomp : holdEffect lookup.
  // STUB ITEM_ENIGMA_BERRY path (= rare custom berry).
  const holdEffect = GetItemHoldEffect(gBattleMons[battlerId].item);
  setPotentialItemEffectBattler(battlerId);

  for (let i = 0; i < MAX_MON_MOVES; i++) {
    const move = gBattleMons[battlerId].moves[i];

    // No move
    if (move === MOVE_NONE && (check & MOVE_LIMITATION_ZEROMOVE)) {
      unusableMoves |= gBitTable[i];
    }
    // No PP
    if (gBattleMons[battlerId].pp[i] === 0 && (check & MOVE_LIMITATION_PP)) {
      unusableMoves |= gBitTable[i];
    }
    // Disable
    if (move === gDisableStructs[battlerId].disabledMove && (check & MOVE_LIMITATION_DISABLED)) {
      unusableMoves |= gBitTable[i];
    }
    // Torment
    if (move === gLastMoves[battlerId]
        && (check & MOVE_LIMITATION_TORMENTED)
        && (gBattleMons[battlerId].status2 & STATUS2_TORMENT)) {
      unusableMoves |= gBitTable[i];
    }
    // Taunt (= block status moves si tauntTimer actif)
    if (gDisableStructs[battlerId].tauntTimer
        && (check & MOVE_LIMITATION_TAUNT)
        && getBattleMove(move).power === 0) {
      unusableMoves |= gBitTable[i];
    }
    // Imprison
    if (_GetImprisonedMovesCount(battlerId, move) && (check & MOVE_LIMITATION_IMPRISON)) {
      unusableMoves |= gBitTable[i];
    }
    // Encore
    if (gDisableStructs[battlerId].encoreTimer
        && gDisableStructs[battlerId].encoredMove !== move) {
      unusableMoves |= gBitTable[i];
    }
    // Choice Band
    if (holdEffect === HOLD_EFFECT_CHOICE_BAND
        && gBattleStruct.choicedMove[battlerId] !== MOVE_NONE
        && gBattleStruct.choicedMove[battlerId] !== MOVE_UNAVAILABLE
        && gBattleStruct.choicedMove[battlerId] !== move) {
      unusableMoves |= gBitTable[i];
    }
  }
  return unusableMoves;
}

/** 1:1 décomp `AreAllMovesUnusable()` (battle_util.c:1112-1127). */
export function AreAllMovesUnusable(): boolean {
  const unusable = CheckMoveLimitations(gActiveBattler, 0, MOVE_LIMITATIONS_ALL);
  if (unusable === ALL_MOVES_MASK) {
    gProtectStructs[gActiveBattler].noValidMoves = 1;
    // STUB gSelectionBattleScripts[active] = BattleScript_NoMovesLeft.
    // TODO porter gSelectionBattleScripts array.
    return true;
  } else {
    gProtectStructs[gActiveBattler].noValidMoves = 0;
    return false;
  }
}
