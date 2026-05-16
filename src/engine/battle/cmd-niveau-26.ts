/**
 * battle/cmd-niveau-26.ts — Phase 1 Niveau 26 (hpthresholds + money + switch checks) — 6 opcodes
 * 1:1 décomp `src/battle_script_commands.c`.
 *
 * Opcodes :
 *   0x4F jumpifcantswitch       (6 bytes — STATUS2_WRAPPED/ESCAPE / ROOTED check)
 *   0x5D getmoneyreward         (1 byte  — trainer money via GetTrainerMoneyToGive)
 *   0x63 jumptocalledmove       (2 bytes — gCurrentMove = gCalledMove + jump)
 *   0x73 hpthresholds           (2 bytes — set gHpScale 0-3 from opponent HP%)
 *   0x74 hpthresholds2          (2 bytes — set gHpScale 0-3 from switchout diff)
 *   0x91 givepaydaymoney        (1 byte  — gPaydayMoney * multiplier → AddMoney)
 *
 * Sources de vérité (1:1) :
 *   - `public/decomp/em/extracted-all/battle_script_commands.json`
 */

import type { BattleOpcodeHandler, BattleScriptContext } from './script-interpreter';
import { readByte, readWord, getBattleScriptOffset, getMoveEffectScriptOffset } from './script-interpreter';
import {
  gBattleMons, setCurrentMove, gCurrentMove,
  setActiveBattler,
  gStatuses3,
  gBattleTypeFlags,
  gCalledMove, setChosenMove,
  gPaydayMoney,
  gBattleStruct,
  gTrainerBattleOpponent_A, gTrainerBattleOpponent_B,
  gBattlerPartyIndexes,
} from './state';
import { getBattleMove } from './data/battle-moves';
import {
  STATUS2_WRAPPED, STATUS2_ESCAPE_PREVENTION, STATUS3_ROOTED,
  SWITCH_IGNORE_ESCAPE_PREVENTION,
  BATTLE_TYPE_DOUBLE, BATTLE_TYPE_LINK, BATTLE_TYPE_RECORDED_LINK,
  BATTLE_TYPE_TWO_OPPONENTS, BATTLE_TYPE_INGAME_PARTNER, BATTLE_TYPE_MULTI,
  BATTLE_OPPOSITE, GET_BATTLER_SIDE,
  B_SIDE_OPPONENT,
  MULTI_PARTY_SIZE,
} from './constants';
import {
  getBattlerForBattleScript, GetBattlerAtPosition,
  B_POSITION_PLAYER_LEFT, B_POSITION_OPPONENT_LEFT,
  B_POSITION_PLAYER_RIGHT, B_POSITION_OPPONENT_RIGHT,
} from './util';
import {
  gPlayerParty, gEnemyParty, GetMonData, PARTY_SIZE,
  MON_DATA_SPECIES, MON_DATA_HP, MON_DATA_IS_EGG,
} from './party-storage';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** 1:1 stub `GetTrainerMoneyToGive(trainerId)` (battle_setup.c). Retourne
 *  trainer.baseMoney × max(party.level). Notre stub : retourne 100 par défaut
 *  pour permettre le opcode de fonctionner sans gTrainers table portée. */
function _getTrainerMoneyToGive(trainerId: number): number {
  // TODO porter gTrainers[id].baseMoney + max party level lookup.
  return trainerId !== 0 ? 100 : 0;
}

// 1:1 décomp `AddMoney(money_ptr, amount)` — wired via auto-data/money.
import { AddMoney as _AddMoneyFull } from '../decomp-data/auto/src-all/money-all-auto';
function _addMoney(amount: number): void {
  // 1:1 décomp : passe gSaveBlock1Ptr.money via globalThis (= déjà sync).
  const saveBlock = (globalThis as { gSaveBlock1Ptr?: { money: number } }).gSaveBlock1Ptr;
  if (saveBlock) {
    _AddMoneyFull(saveBlock.money, amount);
  }
}

/** 1:1 stub `gBattleStruct->moneyMultiplier`. Set à 1 par défaut, doublé par
 *  Amulet Coin / Luck Incense. */
function _getMoneyMultiplier(): number {
  return 1;
}

// ─── 0x4F jumpifcantswitch ────────────────────────────────────────────────

/** 1:1 décomp Cmd_jumpifcantswitch. 6 bytes (u8 battler arg | flag + u32 jump).
 *  L'arg byte contient le battler id + SWITCH_IGNORE_ESCAPE_PREVENTION bit. */
function Cmd_jumpifcantswitch(ctx: BattleScriptContext): boolean {
  const argByte = readByte(ctx);
  const jumpPtr = readWord(ctx);
  const active = getBattlerForBattleScript(argByte & ~SWITCH_IGNORE_ESCAPE_PREVENTION);
  setActiveBattler(active);

  // 1:1 décomp : check escape prevention sauf si bit set explicitement.
  if (!(argByte & SWITCH_IGNORE_ESCAPE_PREVENTION)
      && ((gBattleMons[active].status2 & (STATUS2_WRAPPED | STATUS2_ESCAPE_PREVENTION))
          || (gStatuses3[active] & STATUS3_ROOTED))) {
    ctx.scriptPtr = jumpPtr;
    return false;
  }

  // 1:1 décomp : party walk pour valider qu'au moins 1 mon est switchable.
  // BATTLE_TYPE_INGAME_PARTNER + BATTLE_TYPE_MULTI + BATTLE_TYPE_TWO_OPPONENTS
  // limitent la window à MULTI_PARTY_SIZE (= 3 mons) ; else full party.

  let party: typeof gPlayerParty;
  let lastMonId = 0;
  let endMonId = PARTY_SIZE;

  if (gBattleTypeFlags & BATTLE_TYPE_INGAME_PARTNER) {
    party = GET_BATTLER_SIDE(active) === B_SIDE_OPPONENT ? gEnemyParty : gPlayerParty;
    lastMonId = (active & 2) ? MULTI_PARTY_SIZE : 0;
    endMonId = lastMonId + MULTI_PARTY_SIZE;
  } else if (gBattleTypeFlags & BATTLE_TYPE_MULTI) {
    // 1:1 décomp : link multi. Pour MVP single-machine, on traite comme single.
    party = GET_BATTLER_SIDE(active) === B_SIDE_OPPONENT ? gEnemyParty : gPlayerParty;
    lastMonId = 0;
    endMonId = lastMonId + MULTI_PARTY_SIZE;
  } else if ((gBattleTypeFlags & BATTLE_TYPE_TWO_OPPONENTS) && GET_BATTLER_SIDE(active) === B_SIDE_OPPONENT) {
    party = gEnemyParty;
    lastMonId = (active === GetBattlerAtPosition(B_POSITION_OPPONENT_RIGHT)) ? (PARTY_SIZE / 2) : 0;
    endMonId = lastMonId + (PARTY_SIZE / 2);
  } else {
    party = GET_BATTLER_SIDE(active) === B_SIDE_OPPONENT ? gEnemyParty : gPlayerParty;
    lastMonId = 0;
    endMonId = PARTY_SIZE;
  }

  // 1:1 décomp partial : pour BATTLE_TYPE_INGAME_PARTNER / MULTI / TWO_OPPONENTS,
  // check exclusion d'un seul battler index. Pour le case "normal" (else),
  // exclure battlerIn1 + battlerIn2 (= les 2 mons en field side).
  let battlerIn1 = active, battlerIn2 = active;
  if (!(gBattleTypeFlags & (BATTLE_TYPE_INGAME_PARTNER | BATTLE_TYPE_MULTI | BATTLE_TYPE_TWO_OPPONENTS))) {
    if (GET_BATTLER_SIDE(active) === B_SIDE_OPPONENT) {
      battlerIn1 = GetBattlerAtPosition(B_POSITION_OPPONENT_LEFT);
      battlerIn2 = (gBattleTypeFlags & BATTLE_TYPE_DOUBLE)
        ? GetBattlerAtPosition(B_POSITION_OPPONENT_RIGHT) : battlerIn1;
    } else {
      battlerIn1 = GetBattlerAtPosition(B_POSITION_PLAYER_LEFT);
      battlerIn2 = (gBattleTypeFlags & BATTLE_TYPE_DOUBLE)
        ? GetBattlerAtPosition(B_POSITION_PLAYER_RIGHT) : battlerIn1;
    }
  }

  let i = lastMonId;
  for (; i < endMonId; i++) {
    const species = GetMonData(party[i], MON_DATA_SPECIES) as number;
    const hp = GetMonData(party[i], MON_DATA_HP) as number;
    const isEgg = GetMonData(party[i], MON_DATA_IS_EGG) as number;
    if (species !== 0 && !isEgg && hp !== 0) {
      if (gBattleTypeFlags & (BATTLE_TYPE_INGAME_PARTNER | BATTLE_TYPE_MULTI | BATTLE_TYPE_TWO_OPPONENTS)) {
        if (gBattlerPartyIndexes[active] !== i) break;
      } else {
        if (i !== gBattlerPartyIndexes[battlerIn1] && i !== gBattlerPartyIndexes[battlerIn2]) break;
      }
    }
  }

  if (i === endMonId) {
    // No valid mon to switch to → jump.
    ctx.scriptPtr = jumpPtr;
  }
  // Sinon : advance normalement (= déjà fait par readByte + readWord).
  return false;
}

// ─── 0x5D getmoneyreward ──────────────────────────────────────────────────

/** 1:1 décomp Cmd_getmoneyreward. 1 byte. */
function Cmd_getmoneyreward(_ctx: BattleScriptContext): boolean {
  let moneyReward = _getTrainerMoneyToGive(gTrainerBattleOpponent_A);
  if (gBattleTypeFlags & BATTLE_TYPE_TWO_OPPONENTS) {
    moneyReward += _getTrainerMoneyToGive(gTrainerBattleOpponent_B);
  }
  _addMoney(moneyReward);
  // PREPARE_WORD_NUMBER_BUFFER : TODO porter text placeholder.
  return false;
}

// ─── 0x63 jumptocalledmove ────────────────────────────────────────────────

/** 1:1 décomp Cmd_jumptocalledmove. 2 bytes (u8 flag).
 *  Set gCurrentMove = gCalledMove (et gChosenMove si flag==0), puis jump à
 *  gBattleScriptsForMoveEffects[move.effect]. */
function Cmd_jumptocalledmove(ctx: BattleScriptContext): boolean {
  const flag = readByte(ctx);
  setCurrentMove(gCalledMove);
  if (flag === 0) {
    setChosenMove(gCalledMove);
  }
  // 1:1 décomp : gBattlescriptCurrInstr = gBattleScriptsForMoveEffects[gBattleMoves[gCurrentMove].effect].
  const effect = getBattleMove(gCurrentMove).effect;
  const off = getMoveEffectScriptOffset(effect);
  if (off >= 0) ctx.scriptPtr = off;
  return false;
}

// ─── 0x73 hpthresholds ────────────────────────────────────────────────────

/** 1:1 décomp Cmd_hpthresholds. 2 bytes. */
function Cmd_hpthresholds(ctx: BattleScriptContext): boolean {
  const arg = readByte(ctx);
  if (gBattleTypeFlags & BATTLE_TYPE_DOUBLE) return false;
  const active = getBattlerForBattleScript(arg);
  setActiveBattler(active);
  const opposing = BATTLE_OPPOSITE(active);
  let result = Math.floor((gBattleMons[opposing].hp * 100) / gBattleMons[opposing].maxHP);
  if (result === 0) result = 1;

  if (result > 69 || gBattleMons[opposing].hp === 0) gBattleStruct.hpScale = 0;
  else if (result > 39) gBattleStruct.hpScale = 1;
  else if (result > 9) gBattleStruct.hpScale = 2;
  else gBattleStruct.hpScale = 3;
  return false;
}

// ─── 0x74 hpthresholds2 ───────────────────────────────────────────────────

/** 1:1 décomp Cmd_hpthresholds2. 2 bytes. */
function Cmd_hpthresholds2(ctx: BattleScriptContext): boolean {
  const arg = readByte(ctx);
  if (gBattleTypeFlags & BATTLE_TYPE_DOUBLE) return false;
  const active = getBattlerForBattleScript(arg);
  setActiveBattler(active);
  const opposing = BATTLE_OPPOSITE(active);
  const hpSwitchout = gBattleStruct.hpOnSwitchout[GET_BATTLER_SIDE(opposing)] || 1;
  const result = Math.floor(((hpSwitchout - gBattleMons[opposing].hp) * 100) / hpSwitchout);

  if (gBattleMons[opposing].hp >= hpSwitchout) gBattleStruct.hpScale = 0;
  else if (result <= 29) gBattleStruct.hpScale = 1;
  else if (result <= 69) gBattleStruct.hpScale = 2;
  else gBattleStruct.hpScale = 3;
  return false;
}

// ─── 0x91 givepaydaymoney ─────────────────────────────────────────────────

/** 1:1 décomp Cmd_givepaydaymoney. 1 byte (peut jumper à
 *  BattleScript_PrintPayDayMoneyString). */
function Cmd_givepaydaymoney(ctx: BattleScriptContext): boolean {
  if (!(gBattleTypeFlags & (BATTLE_TYPE_LINK | BATTLE_TYPE_RECORDED_LINK))
      && gPaydayMoney !== 0) {
    const bonusMoney = gPaydayMoney * _getMoneyMultiplier();
    _addMoney(bonusMoney);
    // PREPARE_HWORD_NUMBER_BUFFER : TODO porter.
    // 1:1 décomp : BattleScriptPush(instr + 1); jump à PrintPayDayMoneyString.
    const off = getBattleScriptOffset('BattleScript_PrintPayDayMoneyString');
    if (off >= 0) {
      ctx.scriptPtrStack.push(ctx.scriptPtr);
      ctx.scriptPtr = off;
    }
  }
  return false;
}

// ─── Install handlers ──────────────────────────────────────────────────────

export function installNiveau26Handlers(commands: BattleOpcodeHandler[]): void {
  commands[0x4F] = Cmd_jumpifcantswitch;
  commands[0x5D] = Cmd_getmoneyreward;
  commands[0x63] = Cmd_jumptocalledmove;
  commands[0x73] = Cmd_hpthresholds;
  commands[0x74] = Cmd_hpthresholds2;
  commands[0x91] = Cmd_givepaydaymoney;
}
