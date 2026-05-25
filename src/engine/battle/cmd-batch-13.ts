/**
 * battle/cmd-batch-13.ts — Phase 1 Batch 13 (damage calcs special) — 6 opcodes
 * 1:1 décomp `src/battle_script_commands.c`.
 *
 * Opcodes :
 *   0x79 setatkhptozero               (1 byte — Selfdestruct/Explosion sub)
 *   0x7A jumpifnexttargetvalid        (5 bytes — double battle target iter)
 *   0x7B tryhealhalfhealth            (6 bytes — Recover/Softboiled, fail si full HP)
 *   0x9F dmgtolevel                   (1 byte — gBattleMoveDamage = atk.level)
 *   0xA0 psywavedamageeffect          (1 byte — random 50-150% level)
 *   0xB6 friendshiptodamagecalculation (1 byte — Return/Frustration)
 *   0xBC maxattackhalvehp             (5 bytes — Belly Drum)
 *
 * Sources de vérité (1:1) :
 *   - `public/decomp/em/extracted-all/battle_script_commands.json`
 *   - `decomps/pokeemeraude/include/constants/battle_move_effects.h:125`
 *   - `decomps/pokeemeraude/include/constants/pokemon.h:196`
 */

import type { BattleOpcodeHandler, BattleScriptContext } from './script-interpreter';
import { readByte, readWord, Random } from './script-interpreter';
import {
  gBattleMons, gBattlerAttacker, gBattlerTarget, setBattlerTarget,
  gBattleControllerExecFlags, setActiveBattler,
  setBattleMoveDamage, setDynamicBasePower,
  gCurrentMove, gBattleTypeFlags,
  gBattlersCount,
  gAbsentBattlerFlags,
} from './state';
import {
  STAT_ATK, MAX_STAT_STAGE,
  EFFECT_RETURN, MAX_FRIENDSHIP,
  BS_ATTACKER, BATTLE_TYPE_DOUBLE,
  REQUEST_HP_BATTLE, B_COMM_TO_CONTROLLER,
} from './constants';
import {
  MarkBattlerForControllerExec, BtlController_EmitSetMonData, gBitTable,
} from './battle-controllers';
import { getBattleMove } from './data/battle-moves';

// ─── Helpers ────────────────────────────────────────────────────────────────

function _stayOnOpcode(ctx: BattleScriptContext): boolean {
  ctx.scriptPtr--;
  return true;
}

// 1:1 décomp `gAbsentBattlerFlags` — wired depuis state.ts.

// ─── 0x79 setatkhptozero ───────────────────────────────────────────────────

/** 1:1 décomp Cmd_setatkhptozero. 1 byte. */
function Cmd_setatkhptozero(ctx: BattleScriptContext): boolean {
  if (gBattleControllerExecFlags) {
    return _stayOnOpcode(ctx);
  }
  setActiveBattler(gBattlerAttacker);
  gBattleMons[gBattlerAttacker].hp = 0;
  // 1:1 décomp : sizeof(gBattleMons[active].hp) = sizeof(u16) = 2 bytes.
  BtlController_EmitSetMonData(B_COMM_TO_CONTROLLER, REQUEST_HP_BATTLE, 0, 2, gBattleMons[gBattlerAttacker].hp);
  MarkBattlerForControllerExec(gBattlerAttacker);
  return false;
}

// ─── 0x7A jumpifnexttargetvalid ────────────────────────────────────────────

/** 1:1 décomp Cmd_jumpifnexttargetvalid. 5 bytes. */
function Cmd_jumpifnexttargetvalid(ctx: BattleScriptContext): boolean {
  const jumpPtr = readWord(ctx);
  if (gBattleTypeFlags & BATTLE_TYPE_DOUBLE) {
    let target = gBattlerTarget + 1;
    while (true) {
      if (target === gBattlerAttacker) { target++; continue; }
      if (!(gAbsentBattlerFlags & gBitTable[target])) break;
      target++;
      if (target >= 32) break; // safety
    }
    setBattlerTarget(target);
    if (target >= gBattlersCount) {
      // advance (= already past args)
      return false;
    }
    ctx.scriptPtr = jumpPtr;
    return false;
  }
  // single battle : advance unconditionally.
  return false;
}

// ─── 0x7B tryhealhalfhealth ────────────────────────────────────────────────

/** 1:1 décomp Cmd_tryhealhalfhealth. 6 bytes (u32 failPtr + u8 battler). */
function Cmd_tryhealhalfhealth(ctx: BattleScriptContext): boolean {
  const failPtr = readWord(ctx);
  const battlerArg = readByte(ctx);
  if (battlerArg === BS_ATTACKER) {
    setBattlerTarget(gBattlerAttacker);
  }
  let dmg = Math.floor(gBattleMons[gBattlerTarget].maxHP / 2);
  if (dmg === 0) dmg = 1;
  setBattleMoveDamage(-dmg);
  if (gBattleMons[gBattlerTarget].hp === gBattleMons[gBattlerTarget].maxHP) {
    ctx.scriptPtr = failPtr;
  }
  return false;
}

// ─── 0x9F dmgtolevel ───────────────────────────────────────────────────────

/** 1:1 décomp Cmd_dmgtolevel. 1 byte. */
function Cmd_dmgtolevel(_ctx: BattleScriptContext): boolean {
  setBattleMoveDamage(gBattleMons[gBattlerAttacker].level);
  return false;
}

// ─── 0xA0 psywavedamageeffect ──────────────────────────────────────────────

/** 1:1 décomp Cmd_psywavedamageeffect. 1 byte.
 *  Random 50-150% du level via loop while > 10. */
function Cmd_psywavedamageeffect(_ctx: BattleScriptContext): boolean {
  let randDamage: number;
  do {
    randDamage = Random() % 16;
  } while (randDamage > 10);
  randDamage *= 10;
  const dmg = Math.floor(gBattleMons[gBattlerAttacker].level * (randDamage + 50) / 100);
  setBattleMoveDamage(dmg);
  return false;
}

// ─── 0xB6 friendshiptodamagecalculation ────────────────────────────────────

/** 1:1 décomp Cmd_friendshiptodamagecalculation. 1 byte. */
function Cmd_friendshiptodamagecalculation(_ctx: BattleScriptContext): boolean {
  const move = getBattleMove(gCurrentMove);
  const effect = move?.effect ?? 0;
  const friendship = gBattleMons[gBattlerAttacker].friendship;
  if (effect === EFFECT_RETURN) {
    setDynamicBasePower(Math.floor(10 * friendship / 25));
  } else {
    setDynamicBasePower(Math.floor(10 * (MAX_FRIENDSHIP - friendship) / 25));
  }
  return false;
}

// ─── 0xBC maxattackhalvehp ─────────────────────────────────────────────────

/** 1:1 décomp Cmd_maxattackhalvehp. 5 bytes (u32 fail jump). */
function Cmd_maxattackhalvehp(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);
  let halfHp = Math.floor(gBattleMons[gBattlerAttacker].maxHP / 2);
  if (halfHp === 0) halfHp = 1;
  if (gBattleMons[gBattlerAttacker].statStages[STAT_ATK] < MAX_STAT_STAGE
      && gBattleMons[gBattlerAttacker].hp > halfHp) {
    gBattleMons[gBattlerAttacker].statStages[STAT_ATK] = MAX_STAT_STAGE;
    let dmg = Math.floor(gBattleMons[gBattlerAttacker].maxHP / 2);
    if (dmg === 0) dmg = 1;
    setBattleMoveDamage(dmg);
    return false;
  }
  ctx.scriptPtr = failJump;
  return false;
}

// ─── Install dispatch table ─────────────────────────────────────────────────

export function installBatch13Handlers(commands: BattleOpcodeHandler[]): void {
  commands[0x79] = Cmd_setatkhptozero;
  commands[0x7A] = Cmd_jumpifnexttargetvalid;
  commands[0x7B] = Cmd_tryhealhalfhealth;
  commands[0x9F] = Cmd_dmgtolevel;
  commands[0xA0] = Cmd_psywavedamageeffect;
  commands[0xB6] = Cmd_friendshiptodamagecalculation;
  commands[0xBC] = Cmd_maxattackhalvehp;
}
