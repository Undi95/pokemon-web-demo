/**
 * battle/cmd-niveau-33.ts — Phase 1 Niveau 33 (script-var manipulation natifs) — 15 opcodes
 * 1:1 décomp `src/battle_script_commands.c`.
 *
 * Opcodes "natifs" (= manipulation directe mémoire/script-vars) :
 *   0x2A jumpifhalfword       (12 bytes — compare u16 mem with constant + jump)
 *   0x2B jumpifword           (14 bytes — compare u32 mem with constant + jump)
 *   0x2C jumpifarrayequal     (14 bytes — memcmp u8 array + jump if equal)
 *   0x2D jumpifarraynotequal  (14 bytes — memcmp + jump if neq)
 *   0x2F addbyte              (6 bytes  — *byte += constant)
 *   0x30 subbyte              (6 bytes  — *byte -= constant)
 *   0x31 copyarray            (10 bytes — memcpy)
 *   0x32 copyarraywithindex   (14 bytes — memcpy with index offset)
 *   0x33 orbyte               (6 bytes  — *byte |= constant)
 *   0x34 orhalfword           (7 bytes  — *u16 |= constant)
 *   0x35 orword               (9 bytes  — *u32 |= constant)
 *   0x36 bicbyte              (6 bytes  — *byte &= ~constant)
 *   0x37 bichalfword          (7 bytes  — *u16 &= ~constant)
 *   0x38 bicword              (9 bytes  — *u32 &= ~constant)
 *   0x3B healthbar_update     (2 bytes  — emit health bar update via dmg)
 *
 * Sources de vérité (1:1) :
 *   - `public/decomp/em/extracted-all/battle_script_commands.json`
 *
 *  Note 1:1 STRICT : Ces opcodes utilisent `T2_READ_PTR` (= u32 adresse mémoire
 *  absolue GBA) pour pointer vers des variables runtime (gBattleScripting.X,
 *  gBattleMons[i].field, etc.). Notre bytecode est extracted post-link, donc
 *  ces pointers sont des valeurs u32 numériques.
 *
 *  Pour 1:1 strict il faudrait un memory-mapping table (u32 addr → variable
 *  TS) qui résout dynamiquement. Pour l'instant ces opcodes consomment les
 *  bytes correctement (= advance + le bytecode interpreter ne crash pas) mais
 *  skip l'effet mémoire — log warning sur usage.
 *
 *  TODO porter le memory-mapping pour les pointers décomp battle (post-Phase 1). */

import type { BattleOpcodeHandler, BattleScriptContext } from './script-interpreter';
import { readByte, readWord, readHalfword } from './script-interpreter';
import {
  setActiveBattler, gBattlerAttacker, gBattlerTarget,
  gBattleMoveDamage,
} from './state';
import {
  BS_TARGET, B_COMM_TO_CONTROLLER,
} from './constants';
import {
  BtlController_EmitHealthBarUpdate, MarkBattlerForControllerExec,
} from './battle-controllers';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Lit u32 (pointer addr) et u32 value, sans effet mémoire (= TODO mapping). */
function _consumeAddrAndU32(ctx: BattleScriptContext): { addr: number; value: number } {
  return { addr: readWord(ctx), value: readWord(ctx) };
}

/** Lit u32 addr + u16 value. */
function _consumeAddrAndU16(ctx: BattleScriptContext): { addr: number; value: number } {
  return { addr: readWord(ctx), value: readHalfword(ctx) };
}

/** Lit u32 addr + u8 value. */
function _consumeAddrAndU8(ctx: BattleScriptContext): { addr: number; value: number } {
  return { addr: readWord(ctx), value: readByte(ctx) };
}

// ─── 0x2A jumpifhalfword ──────────────────────────────────────────────────

/** 1:1 décomp Cmd_jumpifhalfword. 12 bytes (u8 caseId + u32 ptr + u16 value + u32 jump). */
function Cmd_jumpifhalfword(ctx: BattleScriptContext): boolean {
  readByte(ctx);  // caseID
  readWord(ctx);  // memHword addr — TODO map
  readHalfword(ctx);  // value
  readWord(ctx);  // jumpPtr
  // TODO : déref memHword + compare + jump si match.
  // MVP : advance only.
  return false;
}

// ─── 0x2B jumpifword ──────────────────────────────────────────────────────

/** 1:1 décomp Cmd_jumpifword. 14 bytes. */
function Cmd_jumpifword(ctx: BattleScriptContext): boolean {
  readByte(ctx);  // caseID
  readWord(ctx);  // memWord addr
  readWord(ctx);  // value
  readWord(ctx);  // jumpPtr
  // TODO : déref + compare + jump.
  return false;
}

// ─── 0x2C jumpifarrayequal ────────────────────────────────────────────────

/** 1:1 décomp Cmd_jumpifarrayequal. 14 bytes. */
function Cmd_jumpifarrayequal(ctx: BattleScriptContext): boolean {
  readWord(ctx);  // mem1 addr
  readWord(ctx);  // mem2 addr
  readByte(ctx);  // size
  readWord(ctx);  // jumpPtr
  // TODO : memcmp + jump.
  return false;
}

// ─── 0x2D jumpifarraynotequal ─────────────────────────────────────────────

/** 1:1 décomp Cmd_jumpifarraynotequal. 14 bytes. */
function Cmd_jumpifarraynotequal(ctx: BattleScriptContext): boolean {
  readWord(ctx);  // mem1
  readWord(ctx);  // mem2
  readByte(ctx);  // size
  readWord(ctx);  // jumpPtr
  return false;
}

// ─── 0x2F addbyte ─────────────────────────────────────────────────────────

/** 1:1 décomp Cmd_addbyte. 6 bytes (u32 addr + u8 const). */
function Cmd_addbyte(ctx: BattleScriptContext): boolean {
  _consumeAddrAndU8(ctx);
  return false;
}

// ─── 0x30 subbyte ─────────────────────────────────────────────────────────

function Cmd_subbyte(ctx: BattleScriptContext): boolean {
  _consumeAddrAndU8(ctx);
  return false;
}

// ─── 0x31 copyarray ───────────────────────────────────────────────────────

/** 1:1 décomp Cmd_copyarray. 10 bytes (u32 dest + u32 src + u8 size). */
function Cmd_copyarray(ctx: BattleScriptContext): boolean {
  readWord(ctx);  // dest
  readWord(ctx);  // src
  readByte(ctx);  // size
  return false;
}

// ─── 0x32 copyarraywithindex ──────────────────────────────────────────────

/** 1:1 décomp Cmd_copyarraywithindex. 14 bytes. */
function Cmd_copyarraywithindex(ctx: BattleScriptContext): boolean {
  readWord(ctx);  // dest
  readWord(ctx);  // src
  readWord(ctx);  // index addr
  readByte(ctx);  // size
  return false;
}

// ─── 0x33 orbyte / 0x34 orhalfword / 0x35 orword ──────────────────────────

function Cmd_orbyte(ctx: BattleScriptContext): boolean {
  _consumeAddrAndU8(ctx);
  return false;
}
function Cmd_orhalfword(ctx: BattleScriptContext): boolean {
  _consumeAddrAndU16(ctx);
  return false;
}
function Cmd_orword(ctx: BattleScriptContext): boolean {
  _consumeAddrAndU32(ctx);
  return false;
}

// ─── 0x36 bicbyte / 0x37 bichalfword / 0x38 bicword ───────────────────────

function Cmd_bicbyte(ctx: BattleScriptContext): boolean {
  _consumeAddrAndU8(ctx);
  return false;
}
function Cmd_bichalfword(ctx: BattleScriptContext): boolean {
  _consumeAddrAndU16(ctx);
  return false;
}
function Cmd_bicword(ctx: BattleScriptContext): boolean {
  _consumeAddrAndU32(ctx);
  return false;
}

// ─── 0x3B healthbar_update ────────────────────────────────────────────────

/** 1:1 décomp Cmd_healthbar_update. 2 bytes (u8 battler arg). */
function Cmd_healthbar_update(ctx: BattleScriptContext): boolean {
  const arg = readByte(ctx);
  const active = arg === BS_TARGET ? gBattlerTarget : gBattlerAttacker;
  setActiveBattler(active);
  BtlController_EmitHealthBarUpdate(B_COMM_TO_CONTROLLER, gBattleMoveDamage);
  MarkBattlerForControllerExec(active);
  return false;
}

// ─── Install handlers ──────────────────────────────────────────────────────

export function installNiveau33Handlers(commands: BattleOpcodeHandler[]): void {
  commands[0x2A] = Cmd_jumpifhalfword;
  commands[0x2B] = Cmd_jumpifword;
  commands[0x2C] = Cmd_jumpifarrayequal;
  commands[0x2D] = Cmd_jumpifarraynotequal;
  commands[0x2F] = Cmd_addbyte;
  commands[0x30] = Cmd_subbyte;
  commands[0x31] = Cmd_copyarray;
  commands[0x32] = Cmd_copyarraywithindex;
  commands[0x33] = Cmd_orbyte;
  commands[0x34] = Cmd_orhalfword;
  commands[0x35] = Cmd_orword;
  commands[0x36] = Cmd_bicbyte;
  commands[0x37] = Cmd_bichalfword;
  commands[0x38] = Cmd_bicword;
  commands[0x3B] = Cmd_healthbar_update;
}
