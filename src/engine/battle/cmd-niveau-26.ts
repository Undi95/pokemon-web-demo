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
import { readByte, readWord, getBattleScriptOffset } from './script-interpreter';
import {
  gBattleMons, setCurrentMove,
  setActiveBattler,
  gStatuses3,
  gBattleTypeFlags,
  gCalledMove, setChosenMove,
  gPaydayMoney,
  setHpScale,
  gHpOnSwitchout,
  gTrainerBattleOpponent_A, gTrainerBattleOpponent_B,
} from './state';
import {
  STATUS2_WRAPPED, STATUS2_ESCAPE_PREVENTION, STATUS3_ROOTED,
  SWITCH_IGNORE_ESCAPE_PREVENTION,
  BATTLE_TYPE_DOUBLE, BATTLE_TYPE_LINK, BATTLE_TYPE_RECORDED_LINK,
  BATTLE_TYPE_TWO_OPPONENTS,
  BATTLE_OPPOSITE, GET_BATTLER_SIDE,
} from './constants';
import { getBattlerForBattleScript } from './util';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** 1:1 stub `GetTrainerMoneyToGive(trainerId)` (battle_setup.c). Retourne
 *  trainer.baseMoney × max(party.level). Notre stub : retourne 100 par défaut
 *  pour permettre le opcode de fonctionner sans gTrainers table portée. */
function _getTrainerMoneyToGive(trainerId: number): number {
  // TODO porter gTrainers[id].baseMoney + max party level lookup.
  return trainerId !== 0 ? 100 : 0;
}

/** 1:1 stub `AddMoney(money_ptr, amount)` (item.c:money). MVP no-op. */
function _addMoney(_amount: number): void {
  // TODO : ajout au gSaveBlock1Ptr.money + cap à 999999.
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
  // 1:1 décomp partial : skip BATTLE_TYPE_INGAME_PARTNER + standard party walk
  // (= gPlayerParty/gEnemyParty non wired battle-side). Pour MVP, on assume
  // que les autres mons sont dispo (= NE jump pas).
  // TODO porter le party walk complet quand gPlayerParty wired battle.
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
 *  gBattleScriptsForMoveEffects[move.effect].
 *  Notre port : gBattleScriptsForMoveEffects pas wired comme un table direct ;
 *  on cherche le label via getBattleScriptOffset basé sur le move effect.
 *  Pattern : label = "gBattleScriptsForMoveEffects" + offset basé sur effect. */
function Cmd_jumptocalledmove(ctx: BattleScriptContext): boolean {
  const flag = readByte(ctx);
  setCurrentMove(gCalledMove);
  if (flag === 0) {
    setChosenMove(gCalledMove);
  }
  // 1:1 décomp jump : gBattlescriptCurrInstr = gBattleScriptsForMoveEffects[effect].
  // Le label root des scripts est à offset 0 (= label "gBattleScriptsForMoveEffects"
  // dans le bytecode extracted, cf. battle_scripts_1-bytecode.ts).
  // Stub : pour l'instant, on jump au label root → si le bytecode contient le
  // jump table inline, l'interpreter va parcourir des pointers et tomber sur
  // un opcode 0xFF (invalid) ce qui forcerait return. Pour MVP, on stay.
  // TODO : extraire la jump table de gBattleScriptsForMoveEffects[] et porter
  // un mapping effect → bytecode offset.
  const off = getBattleScriptOffset('gBattleScriptsForMoveEffects');
  if (off >= 0) {
    // Pas de jump pour l'instant — manque la résolution effect → byte offset.
    // ctx.scriptPtr = off + effect * 4;  // si table inline u32 pointers
  }
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

  if (result > 69 || gBattleMons[opposing].hp === 0) setHpScale(0);
  else if (result > 39) setHpScale(1);
  else if (result > 9) setHpScale(2);
  else setHpScale(3);
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
  const hpSwitchout = gHpOnSwitchout[GET_BATTLER_SIDE(opposing)] || 1;
  const result = Math.floor(((hpSwitchout - gBattleMons[opposing].hp) * 100) / hpSwitchout);

  if (gBattleMons[opposing].hp >= hpSwitchout) setHpScale(0);
  else if (result <= 29) setHpScale(1);
  else if (result <= 69) setHpScale(2);
  else setHpScale(3);
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
