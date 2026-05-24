/**
 * battle/cmd-niveau-3.ts — implémentation 1:1 décomp des opcodes battle script
 * du **Niveau 3 (branching)**.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/battle_script_commands.c`
 *
 * Opcodes inclus (= tous "jumpif*", read args + check condition + jump ou advance) :
 *   0x1C Cmd_jumpifstatus           full (= check status1 mask + hp > 0)
 *   0x1D Cmd_jumpifstatus2          full (= check status2 mask + hp > 0)

 *   0x1E Cmd_jumpifability          FULL 1:1 (= direct + ATTACKER_SIDE + NOT_ATTACKER_SIDE via _abilityCheckSide)
 *   0x1F Cmd_jumpifsideaffecting    full (= check gSideStatuses[side] & flags)
 *   0x20 Cmd_jumpifstat              full (= CMP_* compare statStages[statId] vs value)
 *   0x21 Cmd_jumpifstatus3condition full (= check gStatuses3[battler] & status, with negate flag)
 *   0x22 Cmd_jumpiftype             full (= IS_BATTLER_OF_TYPE)
 *   0x84 Cmd_jumpifcantmakeasleep   partial (= Insomnia/VitalSpirit ; Uproar stub)
 *
 * Pattern : tous les jumpif* lisent leurs args via readers (= bytes/halfword/word),
 * puis si condition match : `ctx.scriptPtr = jumpPtr` ; sinon : continue (= déjà
 * advancé via les readers).
 */

import {
  gBattleMons,
  gBattlerAttacker,
  gBattlerTarget,
  gStatuses3,
  gSideStatuses,
  gBattleCommunication,
  gBattleScripting,
  gBattlersCount,
  setLastUsedAbility,
  setActiveBattler,
} from './state';
import { readByte, readHalfword, readWord } from './script-interpreter';
import type { BattleScriptContext, BattleOpcodeHandler } from './script-interpreter';
import {
  GET_BATTLER_SIDE,
  BIT_SIDE,
  BS_ATTACKER,
  BS_ATTACKER_SIDE,
  BS_NOT_ATTACKER_SIDE,
  CMP_EQUAL,
  CMP_NOT_EQUAL,
  CMP_GREATER_THAN,
  CMP_LESS_THAN,
  CMP_COMMON_BITS,
  CMP_NO_COMMON_BITS,
  ABILITY_INSOMNIA,
  ABILITY_VITAL_SPIRIT,
  MULTISTRING_CHOOSER,
  B_MSG_STAYED_AWAKE_USING,
} from './constants';
import { getBattlerForBattleScript, RecordAbilityBattle } from './util';

/** 1:1 décomp `IS_BATTLER_OF_TYPE(battler, type)` (battle.h:472). */
function isBattlerOfType(battlerIdx: number, type: number): boolean {
  const mon = gBattleMons[battlerIdx];
  return mon.type1 === type || mon.type2 === type;
}

/** 1:1 décomp `AbilityBattleEffects(ABILITYEFFECT_CHECK_BATTLER_SIDE/CHECK_OTHER_SIDE)`
 *  subset : itère les battlers du côté demandé, retourne (battler_idx + 1) si
 *  ability matchée, sinon 0.
 *
 *  Itère gBattlersCount = 2 (single battle) ou 4 (double battle) = 1:1 strict. */
function _abilityCheckSide(checkAttackerSide: boolean, abilityId: number): number {
  const attackerSide = GET_BATTLER_SIDE(gBattlerAttacker);
  for (let i = 0; i < gBattlersCount; i++) {
    const sameSide = (i & BIT_SIDE) === attackerSide;
    if (checkAttackerSide ? !sameSide : sameSide) continue;
    if (gBattleMons[i].hp !== 0 && gBattleMons[i].ability === abilityId) {
      return i + 1;
    }
  }
  return 0;
}

/** 1:1 décomp `UproarWakeUpCheck(battler)` — Inlined (= éviter circular).
 *  Returns true si un battler sur le field a STATUS2_UPROAR + battler param
 *  n'a pas Soundproof. Stub side-effects (= ne set pas MULTISTRING_CHOOSER ici). */
function uproarWakeUpCheck(battler: number): boolean {
  // 1:1 décomp battle.h:132 : STATUS2_UPROAR = (1<<4|1<<5|1<<6) = 0x70.
  // AUDIT BUG FIX : était `1 << 13 = 0x2000` (faux, jamais fire).
  const STATUS2_UPROAR_LOCAL = 0x70;
  const ABILITY_SOUNDPROOF_LOCAL = 43;
  const stateMod = (globalThis as { __battleState?: { gBattlersCount?: number; gBattleMons?: { ability: number; status2: number }[] } }).__battleState;
  const battlersCount = stateMod?.gBattlersCount ?? 2;
  const battleMons = stateMod?.gBattleMons;
  if (!battleMons) return false;
  for (let i = 0; i < battlersCount; i++) {
    if ((battleMons[i].status2 & STATUS2_UPROAR_LOCAL)
        && battleMons[battler].ability !== ABILITY_SOUNDPROOF_LOCAL) {
      return true;
    }
  }
  return false;
}

// ─── Cmd_jumpifstatus (0x1C) ───────────────────────────────────────────────

/** 1:1 décomp `Cmd_jumpifstatus` (battle_script_commands.c:3081-3091).
 *
 *  Args : 1 byte battler + 4 byte flags + 4 byte ptr. Total 10 bytes.
 *  Jump si `mon.status1 & flags` et `mon.hp != 0`. */
function Cmd_jumpifstatus(ctx: BattleScriptContext): boolean {
  const battlerArg = readByte(ctx);
  const flags = readWord(ctx);
  const jumpPtr = readWord(ctx);

  const battler = getBattlerForBattleScript(battlerArg);
  if ((gBattleMons[battler].status1 & flags) && gBattleMons[battler].hp !== 0) {
    ctx.scriptPtr = jumpPtr;
  }
  return false;
}

// ─── Cmd_jumpifstatus2 (0x1D) ──────────────────────────────────────────────

/** 1:1 décomp `Cmd_jumpifstatus2` (battle_script_commands.c:3093-3103).
 *
 *  Idem jumpifstatus mais sur status2. */
function Cmd_jumpifstatus2(ctx: BattleScriptContext): boolean {
  const battlerArg = readByte(ctx);
  const flags = readWord(ctx);
  const jumpPtr = readWord(ctx);

  const battler = getBattlerForBattleScript(battlerArg);
  if ((gBattleMons[battler].status2 & flags) && gBattleMons[battler].hp !== 0) {
    ctx.scriptPtr = jumpPtr;
  }
  return false;
}

// ─── Cmd_jumpifability (0x1E) ──────────────────────────────────────────────

/** 1:1 STRICT décomp `Cmd_jumpifability` (battle_script_commands.c:3105-3156).
 *
 *  Args : 1 byte battler/side + 1 byte ability + 4 byte ptr. Total 7 bytes.
 *
 *  3 modes :
 *  - BS_ATTACKER_SIDE : check tous les mons attacker side (= AbilityBattleEffects
 *    CHECK_BATTLER_SIDE). Porté 1:1 via _abilityCheckSide().
 *  - BS_NOT_ATTACKER_SIDE : idem mais other side. Porté 1:1 via _abilityCheckSide().
 *  - default : check single battler.
 *  Tous les 3 modes 1:1 strict décomp. */
function Cmd_jumpifability(ctx: BattleScriptContext): boolean {
  const battlerArg = readByte(ctx);
  const abilityId = readByte(ctx);
  const jumpPtr = readWord(ctx);

  if (battlerArg === BS_ATTACKER_SIDE) {
    // 1:1 décomp : AbilityBattleEffects(ABILITYEFFECT_CHECK_BATTLER_SIDE, ...)
    // retourne (battler+1) si match, sinon 0.
    const battlerPlusOne = _abilityCheckSide(true, abilityId);
    if (battlerPlusOne) {
      setLastUsedAbility(abilityId);
      ctx.scriptPtr = jumpPtr;
      RecordAbilityBattle(battlerPlusOne - 1, abilityId);
      gBattleScripting.battlerWithAbility = battlerPlusOne - 1;
    }
    return false;
  }

  if (battlerArg === BS_NOT_ATTACKER_SIDE) {
    const battlerPlusOne = _abilityCheckSide(false, abilityId);
    if (battlerPlusOne) {
      setLastUsedAbility(abilityId);
      ctx.scriptPtr = jumpPtr;
      RecordAbilityBattle(battlerPlusOne - 1, abilityId);
      gBattleScripting.battlerWithAbility = battlerPlusOne - 1;
    }
    return false;
  }

  // Default : single battler check.
  const battler = getBattlerForBattleScript(battlerArg);
  if (gBattleMons[battler].ability === abilityId) {
    setLastUsedAbility(abilityId);
    ctx.scriptPtr = jumpPtr;
    RecordAbilityBattle(battler, abilityId);
    gBattleScripting.battlerWithAbility = battler;
  }
  return false;
}

// ─── Cmd_jumpifsideaffecting (0x1F) ────────────────────────────────────────

/** 1:1 décomp `Cmd_jumpifsideaffecting` (battle_script_commands.c:3158-3176).
 *
 *  Args : 1 byte battler ref + 2 byte flags + 4 byte ptr. Total 8 bytes.
 *  Jump si `gSideStatuses[side] & flags`. */
function Cmd_jumpifsideaffecting(ctx: BattleScriptContext): boolean {
  const battlerArg = readByte(ctx);
  const flags = readHalfword(ctx);
  const jumpPtr = readWord(ctx);

  // 1:1 décomp : si battlerArg == BS_ATTACKER → attacker side, sinon → target side.
  const side = battlerArg === BS_ATTACKER
    ? GET_BATTLER_SIDE(gBattlerAttacker)
    : GET_BATTLER_SIDE(gBattlerTarget);

  if (gSideStatuses[side] & flags) {
    ctx.scriptPtr = jumpPtr;
  }
  return false;
}

// ─── Cmd_jumpifstat (0x20) ─────────────────────────────────────────────────

/** 1:1 décomp `Cmd_jumpifstat` (battle_script_commands.c:3178-3216).
 *
 *  Args : 1 byte battler + 1 byte cmp + 1 byte statId + 1 byte value + 4 byte ptr.
 *  Total 9 bytes.
 *
 *  Compare battler.statStages[statId] vs value via CMP_* opcode. Jump si match. */
function Cmd_jumpifstat(ctx: BattleScriptContext): boolean {
  const battlerArg = readByte(ctx);
  const cmpOp = readByte(ctx);
  const statId = readByte(ctx);
  const cmpValue = readByte(ctx);
  const jumpPtr = readWord(ctx);

  const battler = getBattlerForBattleScript(battlerArg);
  const value = gBattleMons[battler].statStages[statId];
  let match = false;

  switch (cmpOp) {
    case CMP_EQUAL:          match = value === cmpValue; break;
    case CMP_NOT_EQUAL:      match = value !== cmpValue; break;
    case CMP_GREATER_THAN:   match = value > cmpValue; break;
    case CMP_LESS_THAN:      match = value < cmpValue; break;
    case CMP_COMMON_BITS:    match = (value & cmpValue) !== 0; break;
    case CMP_NO_COMMON_BITS: match = (value & cmpValue) === 0; break;
  }

  if (match) ctx.scriptPtr = jumpPtr;
  return false;
}

// ─── Cmd_jumpifstatus3condition (0x21) ─────────────────────────────────────

/** 1:1 décomp `Cmd_jumpifstatus3condition` (battle_script_commands.c:3218-3241).
 *
 *  Args : 1 byte battler + 4 byte status flags + 1 byte negateCondition + 4 byte ptr.
 *  Total 11 bytes.
 *
 *  Si negateCondition == 0 : jump si `gStatuses3[battler] & status != 0` (= has status).
 *  Si negateCondition != 0 : jump si `gStatuses3[battler] & status == 0` (= doesn't have status).
 *
 *  NB : le décomp lit dans cet ordre dans le code (au lieu de :
 *  byte battler + word status + word ptr + byte negate, c'est byte battler + word status
 *  + byte negate + word ptr). Source : T2_READ_32(+2) puis T2_READ_PTR(+7) puis [6]. */
function Cmd_jumpifstatus3condition(ctx: BattleScriptContext): boolean {
  const battlerArg = readByte(ctx);
  const status = readWord(ctx);
  const negateCondition = readByte(ctx);
  const jumpPtr = readWord(ctx);

  const activeBattler = getBattlerForBattleScript(battlerArg);
  setActiveBattler(activeBattler);
  const hasStatus = (gStatuses3[activeBattler] & status) !== 0;

  if (negateCondition) {
    // jump si on N'A PAS le status
    if (!hasStatus) ctx.scriptPtr = jumpPtr;
  } else {
    // jump si on A le status
    if (hasStatus) ctx.scriptPtr = jumpPtr;
  }
  return false;
}

// ─── Cmd_jumpiftype (0x22) ─────────────────────────────────────────────────

/** 1:1 décomp `Cmd_jumpiftype` (battle_script_commands.c:3243-3253).
 *
 *  Args : 1 byte battler + 1 byte type + 4 byte ptr. Total 7 bytes.
 *  Jump si battler est du type spécifié. */
function Cmd_jumpiftype(ctx: BattleScriptContext): boolean {
  const battlerArg = readByte(ctx);
  const type = readByte(ctx);
  const jumpPtr = readWord(ctx);

  const battler = getBattlerForBattleScript(battlerArg);
  if (isBattlerOfType(battler, type)) {
    ctx.scriptPtr = jumpPtr;
  }
  return false;
}

// ─── Cmd_jumpifcantmakeasleep (0x84) ───────────────────────────────────────

/** 1:1 décomp `Cmd_jumpifcantmakeasleep` (battle_script_commands.c:6831-6851).
 *
 *  Args : 4 byte ptr. Total 5 bytes.
 *
 *  Jump si target ne peut pas être endormi (= Uproar field active OU
 *  Insomnia/VitalSpirit ability). Sinon advance. */
function Cmd_jumpifcantmakeasleep(ctx: BattleScriptContext): boolean {
  const jumpPtr = readWord(ctx);

  if (uproarWakeUpCheck(gBattlerTarget)) {
    ctx.scriptPtr = jumpPtr;
    return false;
  }

  const targetAbility = gBattleMons[gBattlerTarget].ability;
  if (targetAbility === ABILITY_INSOMNIA || targetAbility === ABILITY_VITAL_SPIRIT) {
    setLastUsedAbility(targetAbility);
    gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_STAYED_AWAKE_USING;
    ctx.scriptPtr = jumpPtr;
    RecordAbilityBattle(gBattlerTarget, targetAbility);
    return false;
  }
  return false;
}

// ─── Install handlers ──────────────────────────────────────────────────────

export function installNiveau3Handlers(commandsTable: BattleOpcodeHandler[]): void {
  commandsTable[0x1C] = Cmd_jumpifstatus;
  commandsTable[0x1D] = Cmd_jumpifstatus2;
  commandsTable[0x1E] = Cmd_jumpifability;
  commandsTable[0x1F] = Cmd_jumpifsideaffecting;
  commandsTable[0x20] = Cmd_jumpifstat;
  commandsTable[0x21] = Cmd_jumpifstatus3condition;
  commandsTable[0x22] = Cmd_jumpiftype;
  commandsTable[0x84] = Cmd_jumpifcantmakeasleep;
  console.log('[battle/cmd-niveau-3] installed 8/8 Niveau 3 handlers (branching)');
}
