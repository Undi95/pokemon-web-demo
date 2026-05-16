/**
 * battle/cmd-niveau-11.ts — Phase 1 Niveau 11 (damage manip + multihit + substitute) — 7 opcodes
 * 1:1 décomp `src/battle_script_commands.c`.
 *
 * Opcodes :
 *   0x88 negativedamage           (1 byte — gBattleMoveDamage = -(gHpDealt/2))
 *   0x8D setmultihitcounter       (2 bytes — set ou random 2-5)
 *   0x8E initmultihitstring       (1 byte — buffer multihit count = 1)
 *   0x9C setsubstitute            (1 byte — set STATUS2_SUBSTITUTE, maxHP/4 damage)
 *   0xAB trysetdestinybondtohappen (1 byte — wrapper TrySetDestinyBondToHappen)
 *   0xD7 setyawn                  (5 bytes — set STATUS3_YAWN_TURN(2), jump si déjà yawn ou status1)
 *   0xD8 setdamagetohealthdifference (5 bytes — gBattleMoveDamage = target.hp - attacker.hp, jump si <=0)
 *
 * Sources de vérité (1:1) :
 *   - `public/decomp/em/extracted-all/battle_script_commands.json`
 */

import type { BattleOpcodeHandler, BattleScriptContext } from './script-interpreter';
import { readByte, readWord, Random } from './script-interpreter';
import {
  gBattleMons, gBattlerAttacker, gBattlerTarget,
  gBattleMoveDamage, setBattleMoveDamage,
  gHpDealt, gMultiHitCounter, setMultiHitCounter,
  gBattleScripting, gDisableStructs, gStatuses3,
  gBattleCommunication, gHitMarker, setHitMarker,
} from './state';
import {
  STATUS2_SUBSTITUTE, STATUS2_WRAPPED, STATUS2_DESTINY_BOND, STATUS3_YAWN,
  STATUS1_ANY, STATUS3_YAWN_TURN,
  HITMARKER_IGNORE_SUBSTITUTE, HITMARKER_GRUDGE, HITMARKER_DESTINYBOND,
  GET_BATTLER_SIDE,
  MULTISTRING_CHOOSER,
  B_MSG_SET_SUBSTITUTE, B_MSG_SUBSTITUTE_FAILED,
} from './constants';

// ─── 0x88 negativedamage ───────────────────────────────────────────────────

/** 1:1 décomp Cmd_negativedamage. 1 byte. */
function Cmd_negativedamage(_ctx: BattleScriptContext): boolean {
  let dmg = -Math.floor(gHpDealt / 2);
  if (dmg === 0) dmg = -1;
  setBattleMoveDamage(dmg);
  return false;
}

// ─── 0x8D setmultihitcounter ───────────────────────────────────────────────

/** 1:1 décomp Cmd_setmultihitcounter. 2 bytes. */
function Cmd_setmultihitcounter(ctx: BattleScriptContext): boolean {
  const arg = readByte(ctx);
  if (arg) {
    setMultiHitCounter(arg);
  } else {
    let count = Random() & 3;
    if (count > 1) {
      count = (Random() & 3) + 2;
    } else {
      count += 2;
    }
    setMultiHitCounter(count);
  }
  return false;
}

// ─── 0x8E initmultihitstring ───────────────────────────────────────────────

/** 1:1 décomp Cmd_initmultihitstring (battle_script_commands.c). 1 byte.
 *  `PREPARE_BYTE_NUMBER_BUFFER(gBattleScripting.multihitString, 1, 0)`. */
function Cmd_initmultihitstring(_ctx: BattleScriptContext): boolean {
  // 1:1 décomp : PREPARE_BYTE_NUMBER_BUFFER appliquée à gBattleScripting.multihitString.
  // Notre gBattleScripting.multihitString est array de 6 nombres ; on écrit
  // les 6 bytes du format PREPARE_BYTE_NUMBER_BUFFER directement.
  const buf = gBattleScripting.multihitString;
  buf[0] = 0xFD; /* B_BUFF_PLACEHOLDER_BEGIN */
  buf[1] = 1;    /* B_BUFF_NUMBER */
  buf[2] = 1;    /* bytes = 1 */
  buf[3] = 1;    /* maxDigits = 1 */
  buf[4] = 0;    /* number = 0 */
  buf[5] = 0xFF; /* B_BUFF_EOS */
  return false;
}

// ─── 0x9C setsubstitute ────────────────────────────────────────────────────

/** 1:1 décomp Cmd_setsubstitute. 1 byte. */
function Cmd_setsubstitute(_ctx: BattleScriptContext): boolean {
  let hp = Math.floor(gBattleMons[gBattlerAttacker].maxHP / 4);
  if (hp === 0) hp = 1;

  if (gBattleMons[gBattlerAttacker].hp <= hp) {
    setBattleMoveDamage(0);
    gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_SUBSTITUTE_FAILED;
  } else {
    let dmg = Math.floor(gBattleMons[gBattlerAttacker].maxHP / 4);
    if (dmg === 0) dmg = 1;
    setBattleMoveDamage(dmg);

    gBattleMons[gBattlerAttacker].status2 |= STATUS2_SUBSTITUTE;
    gBattleMons[gBattlerAttacker].status2 &= ~STATUS2_WRAPPED;
    gDisableStructs[gBattlerAttacker].substituteHP = dmg;
    gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_SET_SUBSTITUTE;
    setHitMarker(gHitMarker | HITMARKER_IGNORE_SUBSTITUTE);
  }
  void gBattleMoveDamage;  // ref clarté
  return false;
}

// ─── 0xAB trysetdestinybondtohappen ────────────────────────────────────────

/** 1:1 décomp Cmd_trysetdestinybondtohappen. 1 byte.
 *  Décomp appelle helper TrySetDestinyBondToHappen() (battle_util.c). */
function Cmd_trysetdestinybondtohappen(_ctx: BattleScriptContext): boolean {
  _trySetDestinyBondToHappen();
  return false;
}

/** 1:1 décomp `TrySetDestinyBondToHappen` (battle_script_commands.c:8288). */
function _trySetDestinyBondToHappen(): void {
  const sideAttacker = GET_BATTLER_SIDE(gBattlerAttacker);
  const sideTarget   = GET_BATTLER_SIDE(gBattlerTarget);
  if ((gBattleMons[gBattlerTarget].status2 & STATUS2_DESTINY_BOND)
      && sideAttacker !== sideTarget
      && !(gHitMarker & HITMARKER_GRUDGE)) {
    setHitMarker(gHitMarker | HITMARKER_DESTINYBOND);
  }
}

// ─── 0xD7 setyawn ──────────────────────────────────────────────────────────

/** 1:1 décomp Cmd_setyawn. 5 bytes (u32 fail jump). */
function Cmd_setyawn(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);
  if (gStatuses3[gBattlerTarget] & STATUS3_YAWN ||
      gBattleMons[gBattlerTarget].status1 & STATUS1_ANY) {
    ctx.scriptPtr = failJump;
    return false;
  }
  gStatuses3[gBattlerTarget] |= STATUS3_YAWN_TURN(2);
  return false;
}

// ─── 0xD8 setdamagetohealthdifference ──────────────────────────────────────

/** 1:1 décomp Cmd_setdamagetohealthdifference. 5 bytes. */
function Cmd_setdamagetohealthdifference(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);
  if (gBattleMons[gBattlerTarget].hp <= gBattleMons[gBattlerAttacker].hp) {
    ctx.scriptPtr = failJump;
    return false;
  }
  setBattleMoveDamage(gBattleMons[gBattlerTarget].hp - gBattleMons[gBattlerAttacker].hp);
  return false;
}

// ─── Install dispatch table ─────────────────────────────────────────────────

export function installNiveau11Handlers(commands: BattleOpcodeHandler[]): void {
  commands[0x88] = Cmd_negativedamage;
  commands[0x8D] = Cmd_setmultihitcounter;
  commands[0x8E] = Cmd_initmultihitstring;
  commands[0x9C] = Cmd_setsubstitute;
  commands[0xAB] = Cmd_trysetdestinybondtohappen;
  commands[0xD7] = Cmd_setyawn;
  commands[0xD8] = Cmd_setdamagetohealthdifference;
}

// Reference unused vars pour éviter warnings sur multihit counter (utilisé via
// le setter, mais on importe le getter pour cohérence).
void gMultiHitCounter;
