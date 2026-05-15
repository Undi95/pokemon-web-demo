/**
 * battle/cmd-niveau-23.ts — Phase 1 Niveau 23 (clear status / spite / imprison / future / pursuit) — 6 opcodes
 * 1:1 décomp `src/battle_script_commands.c`.
 *
 * Opcodes :
 *   0x18 clearstatusfromeffect    (2 bytes — clear status1/2 flag set by MOVE_EFFECT_BYTE)
 *   0x83 nop                       (1 byte  — pure no-op)
 *   0xAD tryspiteppreduce          (5 bytes — Spite PP reduction)
 *   0xC3 trysetfutureattack        (5 bytes — Future Sight / Doom Desire)
 *   0xDB tryimprison               (5 bytes — Imprison set bit)
 *   0xEC pursuitdoubles            (5 bytes — Pursuit double battle special)
 *
 * Sources de vérité (1:1) :
 *   - `public/decomp/em/extracted-all/battle_script_commands.json`
 */

import type { BattleOpcodeHandler, BattleScriptContext } from './script-interpreter';
import { readByte, readWord, Random } from './script-interpreter';
import {
  gBattleMons, gBattlerAttacker, gBattlerTarget, setBattlerAttacker,
  setActiveBattler,
  gMoveResultFlags, gLastMoves,
  gStatuses3, gBattleCommunication, gBattlersCount, gAbsentBattlerFlags,
  gBattleTypeFlags,
  gWishFutureKnock, gCurrentMove, setCurrentMove,
  gBattleScripting,
  gChosenActionByBattler, gChosenMoveByBattler, gActionsByTurnOrder,
  gDisableStructs, gBattleMons as _gBattleMons,
  gSideStatuses, gProtectStructs,
} from './state';
import {
  MOVE_EFFECT_BYTE, MAX_MON_MOVES, MOVE_NONE, MOVE_UNAVAILABLE,
  MOVE_PURSUIT, B_ACTION_USE_MOVE, B_ACTION_TRY_FINISH,
  STATUS3_IMPRISONED_OTHERS,
  STATUS2_TRANSFORMED,
  SIDE_STATUS_FUTUREATTACK,
  GET_BATTLER_SIDE, BATTLE_PARTNER,
  BATTLE_TYPE_DOUBLE,
  REQUEST_PPMOVE1_BATTLE, B_COMM_TO_CONTROLLER,
  MOVE_EFFECT_SLEEP, MOVE_EFFECT_POISON, MOVE_EFFECT_BURN,
  MOVE_EFFECT_FREEZE, MOVE_EFFECT_PARALYSIS, MOVE_EFFECT_TOXIC,
  MOVE_EFFECT_CONFUSION, MOVE_EFFECT_FLINCH, MOVE_EFFECT_UPROAR,
  MOVE_EFFECT_CHARGING, MOVE_EFFECT_WRAP, MOVE_EFFECT_RECHARGE,
  MOVE_EFFECT_THRASH,
} from './constants';
import {
  BtlController_EmitSetMonData, MarkBattlerForControllerExec,
  gBitTable,
} from './battle-controllers';
import { getBattlerForBattleScript, GetBattlerAtPosition, CancelMultiTurnMoves } from './util';
import { runDamagecalc } from './damage-calc';

// ─── 1:1 décomp `sStatusFlagsForMoveEffects` (battle_script_commands.c:608) ─

/** Partial 1:1 décomp — entries pour les MOVE_EFFECT_* utilisés.
 *  STATUS1_SLEEP=7, STATUS1_POISON=8, BURN=16, FREEZE=32, PARALYSIS=64,
 *  TOXIC_POISON=128 ; STATUS2_CONFUSION=7, FLINCHED=8, UPROAR=0x70,
 *  MULTIPLETURNS=0x1000, WRAPPED=0xE000, RECHARGE=0x400000,
 *  LOCK_CONFUSE=0xC00. */
const _statusFlagsForMoveEffects: Record<number, number> = {
  [MOVE_EFFECT_SLEEP]:       0x7,
  [MOVE_EFFECT_POISON]:      1 << 3,
  [MOVE_EFFECT_BURN]:        1 << 4,
  [MOVE_EFFECT_FREEZE]:      1 << 5,
  [MOVE_EFFECT_PARALYSIS]:   1 << 6,
  [MOVE_EFFECT_TOXIC]:       1 << 7,
  [MOVE_EFFECT_CONFUSION]:   0x7,
  [MOVE_EFFECT_FLINCH]:      1 << 3,
  [MOVE_EFFECT_UPROAR]:      0x70,
  [MOVE_EFFECT_CHARGING]:    1 << 12,
  [MOVE_EFFECT_WRAP]:        0xE000,
  [MOVE_EFFECT_RECHARGE]:    1 << 22,
  [MOVE_EFFECT_THRASH]:      0xC00,
};

/** 1:1 décomp `PRIMARY_STATUS_MOVE_EFFECT` (battle.h:251) = MOVE_EFFECT_TOXIC. */
const PRIMARY_STATUS_MOVE_EFFECT = MOVE_EFFECT_TOXIC;

// ─── Helpers ────────────────────────────────────────────────────────────────

/** 1:1 stub `PressurePPLoseOnUsingImprison(battler)` (battle_util.c). Pressure
 *  ability triggers extra PP loss when target uses these moves. MVP no-op. */
function _pressurePPLoseOnUsingImprison(_battler: number): void {}

/** 1:1 décomp `CalculateBaseDamage` — wrapped via runDamagecalc. */
function _calculateBaseDamage(sideStatus: number, power: number, type: number): number {
  return runDamagecalc(sideStatus, power, type);
}

// ─── 0x18 clearstatusfromeffect ───────────────────────────────────────────

/** 1:1 décomp Cmd_clearstatusfromeffect. 2 bytes. */
function Cmd_clearstatusfromeffect(ctx: BattleScriptContext): boolean {
  const arg = readByte(ctx);
  const active = getBattlerForBattleScript(arg);
  setActiveBattler(active);
  const effect = gBattleCommunication[MOVE_EFFECT_BYTE];
  const mask = _statusFlagsForMoveEffects[effect] ?? 0;
  if (effect <= PRIMARY_STATUS_MOVE_EFFECT) {
    gBattleMons[active].status1 &= ~mask;
  } else {
    gBattleMons[active].status2 &= ~mask;
  }
  gBattleCommunication[MOVE_EFFECT_BYTE] = 0;
  gBattleScripting.multihitMoveEffect = 0;
  return false;
}

// ─── 0x83 nop ─────────────────────────────────────────────────────────────

/** 1:1 décomp Cmd_nop. 1 byte. (Indices unused dans dispatch). */
function Cmd_nop(_ctx: BattleScriptContext): boolean {
  return false;
}

// ─── 0xAD tryspiteppreduce ────────────────────────────────────────────────

/** 1:1 décomp Cmd_tryspiteppreduce. 5 bytes. */
function Cmd_tryspiteppreduce(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);
  if (gLastMoves[gBattlerTarget] === MOVE_NONE || gLastMoves[gBattlerTarget] === MOVE_UNAVAILABLE) {
    ctx.scriptPtr = failJump;
    return false;
  }
  let i = 0;
  for (i = 0; i < MAX_MON_MOVES; i++) {
    if (gLastMoves[gBattlerTarget] === gBattleMons[gBattlerTarget].moves[i]) break;
  }
  if (i === MAX_MON_MOVES || gBattleMons[gBattlerTarget].pp[i] <= 1) {
    ctx.scriptPtr = failJump;
    return false;
  }

  let ppToDeduct = (Random() & 3) + 2;
  if (gBattleMons[gBattlerTarget].pp[i] < ppToDeduct) {
    ppToDeduct = gBattleMons[gBattlerTarget].pp[i];
  }
  // PREPARE_MOVE_BUFFER / PREPARE_BYTE_NUMBER_BUFFER : TODO text placeholders.
  gBattleMons[gBattlerTarget].pp[i] -= ppToDeduct;
  setActiveBattler(gBattlerTarget);

  if (!(gDisableStructs[gBattlerTarget].mimickedMoves & gBitTable[i])
      && !(gBattleMons[gBattlerTarget].status2 & STATUS2_TRANSFORMED)) {
    BtlController_EmitSetMonData(B_COMM_TO_CONTROLLER, REQUEST_PPMOVE1_BATTLE + i, 0, 1, gBattleMons[gBattlerTarget].pp[i]);
    MarkBattlerForControllerExec(gBattlerTarget);
  }

  if (gBattleMons[gBattlerTarget].pp[i] === 0) {
    CancelMultiTurnMoves(gBattlerTarget);
  }
  return false;
}

// ─── 0xC3 trysetfutureattack ──────────────────────────────────────────────

/** 1:1 décomp Cmd_trysetfutureattack. 5 bytes. Future Sight / Doom Desire. */
function Cmd_trysetfutureattack(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);
  if (gWishFutureKnock.futureSightCounter[gBattlerTarget] !== 0) {
    ctx.scriptPtr = failJump;
    return false;
  }
  const targetSide = GET_BATTLER_SIDE(gBattlerTarget);
  gSideStatuses[targetSide] |= SIDE_STATUS_FUTUREATTACK;
  gWishFutureKnock.futureSightMove[gBattlerTarget] = gCurrentMove;
  gWishFutureKnock.futureSightAttacker[gBattlerTarget] = gBattlerAttacker;
  gWishFutureKnock.futureSightCounter[gBattlerTarget] = 3;

  let dmg = _calculateBaseDamage(gSideStatuses[targetSide], 0, 0);
  if (gProtectStructs[gBattlerAttacker].helpingHand) {
    dmg = Math.floor((dmg * 15) / 10);
  }
  gWishFutureKnock.futureSightDmg[gBattlerTarget] = dmg;
  // Décomp set gBattleCommunication[MULTISTRING_CHOOSER] selon Doom Desire vs
  // Future Sight ; on suit le pattern mais on n'a pas les MSG IDs distincts
  // dans constants. TODO ajouter B_MSG_DOOM_DESIRE / B_MSG_FUTURE_SIGHT.
  return false;
}

// ─── 0xDB tryimprison ─────────────────────────────────────────────────────

/** 1:1 décomp Cmd_tryimprison. 5 bytes. */
function Cmd_tryimprison(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);
  if (gStatuses3[gBattlerAttacker] & STATUS3_IMPRISONED_OTHERS) {
    ctx.scriptPtr = failJump;
    return false;
  }
  const sideAttacker = GET_BATTLER_SIDE(gBattlerAttacker);
  _pressurePPLoseOnUsingImprison(gBattlerAttacker);

  let battler = 0;
  for (battler = 0; battler < gBattlersCount; battler++) {
    if (sideAttacker !== GET_BATTLER_SIDE(battler)) {
      let attackerMoveId = 0;
      for (attackerMoveId = 0; attackerMoveId < MAX_MON_MOVES; attackerMoveId++) {
        let i = 0;
        for (i = 0; i < MAX_MON_MOVES; i++) {
          if (gBattleMons[gBattlerAttacker].moves[attackerMoveId] === gBattleMons[battler].moves[i]
              && gBattleMons[gBattlerAttacker].moves[attackerMoveId] !== MOVE_NONE) break;
        }
        if (i !== MAX_MON_MOVES) break;
      }
      if (attackerMoveId !== MAX_MON_MOVES) {
        gStatuses3[gBattlerAttacker] |= STATUS3_IMPRISONED_OTHERS;
        return false;
      }
    }
  }
  if (battler === gBattlersCount) {
    ctx.scriptPtr = failJump;
  }
  return false;
}

// ─── 0xEC pursuitdoubles ──────────────────────────────────────────────────

/** 1:1 décomp Cmd_pursuitdoubles. 5 bytes. */
function Cmd_pursuitdoubles(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);
  // GetBattlerPosition est identity en MVP single battle.
  const partner = GetBattlerAtPosition(BATTLE_PARTNER(gBattlerAttacker));
  setActiveBattler(partner);
  if ((gBattleTypeFlags & BATTLE_TYPE_DOUBLE)
      && !(gAbsentBattlerFlags & gBitTable[partner])
      && gChosenActionByBattler[partner] === B_ACTION_USE_MOVE
      && gChosenMoveByBattler[partner] === MOVE_PURSUIT) {
    gActionsByTurnOrder[partner] = B_ACTION_TRY_FINISH;
    setCurrentMove(MOVE_PURSUIT);
    gBattleScripting.animTurn = 1;
    gBattleScripting.pursuitDoublesAttacker = gBattlerAttacker;
    setBattlerAttacker(partner);
    return false;
  }
  ctx.scriptPtr = failJump;
  return false;
}

// ─── Install handlers ──────────────────────────────────────────────────────

export function installNiveau23Handlers(commands: BattleOpcodeHandler[]): void {
  commands[0x18] = Cmd_clearstatusfromeffect;
  commands[0x83] = Cmd_nop;
  commands[0xAD] = Cmd_tryspiteppreduce;
  commands[0xC3] = Cmd_trysetfutureattack;
  commands[0xDB] = Cmd_tryimprison;
  commands[0xEC] = Cmd_pursuitdoubles;
}

// Suppress unused (kept for clarity / future use).
void gMoveResultFlags;
