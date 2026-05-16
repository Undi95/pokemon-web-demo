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
 *  Phase 1.3 G : memory-mapping table portée (= `memory-map.ts` + SYMBOL_MARKER
 *  0xF0000000 convention pour distinguer symbol IDs des vraies GBA addresses).
 *  Le compiler bytecode auto-extrait les symbols battle whitelistés (= 38 entries)
 *  et bind ID → MemoryAccessor (read/write). Les opcodes ici utilisent
 *  `resolveAddress(addr)` qui retourne null si address non whitelistée (= fallback
 *  no-jump pour jumpif*, no-write pour setbyte/setword). */

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
import { resolveAddress, initMemoryMap } from './memory-map';

// 1:1 décomp CMP_* (battle_script_commands.c) — jumpif* condition codes.
const CMP_EQUAL          = 0;
const CMP_NOT_EQUAL      = 1;
const CMP_GREATER_THAN   = 2;
const CMP_LESS_THAN      = 3;
const CMP_COMMON_BITS    = 4;
const CMP_NO_COMMON_BITS = 5;

function _compareJump(caseID: number, lhs: number, rhs: number): boolean {
  switch (caseID) {
    case CMP_EQUAL:          return lhs === rhs;
    case CMP_NOT_EQUAL:      return lhs !== rhs;
    case CMP_GREATER_THAN:   return lhs > rhs;
    case CMP_LESS_THAN:      return lhs < rhs;
    case CMP_COMMON_BITS:    return (lhs & rhs) !== 0;
    case CMP_NO_COMMON_BITS: return (lhs & rhs) === 0;
    default: return false;
  }
}

// Lazy boot memory map (= idempotent).
initMemoryMap();

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Lit u32 (pointer addr) et u32 value. L'effet mémoire est appliqué par
 *  le caller via memory-map.resolveAddress + acc.write(). */
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

// ─── 0x29 jumpifbyte (1:1 décomp battle_script_commands.c:3660-3696) ─────

/** 11 bytes (u8 caseId + u32 ptr + u8 value + u32 jumpPtr).
 *  Avant : STUB dans script-interpreter.ts (= no compare, no jump). Fix port. */
function Cmd_jumpifbyte(ctx: BattleScriptContext): boolean {
  const caseID = readByte(ctx);
  const addr = readWord(ctx);
  const value = readByte(ctx);
  const jumpPtr = readWord(ctx);
  const acc = resolveAddress(addr);
  if (!acc) return false;  // unresolved address.
  const memVal = acc.read() & 0xFF;
  if (_compareJump(caseID, memVal, value)) ctx.scriptPtr = jumpPtr;
  return false;
}

// ─── 0x2A jumpifhalfword (1:1 décomp battle_script_commands.c) ───────────

/** 12 bytes (u8 caseId + u32 ptr + u16 value + u32 jumpPtr). */
function Cmd_jumpifhalfword(ctx: BattleScriptContext): boolean {
  const caseID = readByte(ctx);
  const addr = readWord(ctx);
  const value = readHalfword(ctx);
  const jumpPtr = readWord(ctx);
  const acc = resolveAddress(addr);
  if (!acc) return false;  // STUB : unresolved address (= no jump).
  const memVal = acc.read() & 0xFFFF;
  if (_compareJump(caseID, memVal, value)) ctx.scriptPtr = jumpPtr;
  return false;
}

// ─── 0x2B jumpifword ──────────────────────────────────────────────────────

/** 14 bytes (u8 caseId + u32 ptr + u32 value + u32 jumpPtr). */
function Cmd_jumpifword(ctx: BattleScriptContext): boolean {
  const caseID = readByte(ctx);
  const addr = readWord(ctx);
  const value = readWord(ctx);
  const jumpPtr = readWord(ctx);
  const acc = resolveAddress(addr);
  if (!acc) return false;
  const memVal = acc.read() >>> 0;
  if (_compareJump(caseID, memVal, value)) ctx.scriptPtr = jumpPtr;
  return false;
}

// ─── 0x2C jumpifarrayequal ────────────────────────────────────────────────

/** 14 bytes (u32 mem1 + u32 mem2 + u8 size + u32 jumpPtr). */
function Cmd_jumpifarrayequal(ctx: BattleScriptContext): boolean {
  const addr1 = readWord(ctx);
  const addr2 = readWord(ctx);
  const _size = readByte(ctx);
  const jumpPtr = readWord(ctx);
  const acc1 = resolveAddress(addr1);
  const acc2 = resolveAddress(addr2);
  if (!acc1 || !acc2) return false;  // STUB : si une address inconnue.
  // 1:1 décomp : memcmp byte-par-byte ; pour single-cell access, compare values.
  if (acc1.read() === acc2.read()) ctx.scriptPtr = jumpPtr;
  return false;
}

// ─── 0x2D jumpifarraynotequal ─────────────────────────────────────────────

function Cmd_jumpifarraynotequal(ctx: BattleScriptContext): boolean {
  const addr1 = readWord(ctx);
  const addr2 = readWord(ctx);
  const _size = readByte(ctx);
  const jumpPtr = readWord(ctx);
  const acc1 = resolveAddress(addr1);
  const acc2 = resolveAddress(addr2);
  if (!acc1 || !acc2) return false;
  if (acc1.read() !== acc2.read()) ctx.scriptPtr = jumpPtr;
  return false;
}

// ─── 0x2E setbyte ─────────────────────────────────────────────────────────

/** 6 bytes (u32 addr + u8 value). 1:1 décomp Cmd_setbyte (battle_script_commands.c).
 *  Avant : STUB dans script-interpreter.ts qui consume args sans write. Maintenant
 *  utilise memory-map.resolveAddress + write. AUDIT BUG critique : sans ça,
 *  setbyte gBattlerTarget=0 etc. ne marchait pas → infinite loops dans
 *  IntimidateActivates et autres. */
function Cmd_setbyte(ctx: BattleScriptContext): boolean {
  const addr = readWord(ctx);
  const value = readByte(ctx);
  const acc = resolveAddress(addr);
  if (acc) acc.write(value & 0xFF);
  return false;
}

// ─── 0x2F addbyte ─────────────────────────────────────────────────────────

/** 6 bytes (u32 addr + u8 const). */
function Cmd_addbyte(ctx: BattleScriptContext): boolean {
  const { addr, value } = _consumeAddrAndU8(ctx);
  const acc = resolveAddress(addr);
  if (acc) acc.write((acc.read() + value) & 0xFF);
  return false;
}

// ─── 0x30 subbyte ─────────────────────────────────────────────────────────

function Cmd_subbyte(ctx: BattleScriptContext): boolean {
  const { addr, value } = _consumeAddrAndU8(ctx);
  const acc = resolveAddress(addr);
  if (acc) acc.write((acc.read() - value) & 0xFF);
  return false;
}

// ─── 0x31 copyarray ───────────────────────────────────────────────────────

/** 10 bytes (u32 dest + u32 src + u8 size). */
function Cmd_copyarray(ctx: BattleScriptContext): boolean {
  const dest = readWord(ctx);
  const src = readWord(ctx);
  const _size = readByte(ctx);
  const accDest = resolveAddress(dest);
  const accSrc = resolveAddress(src);
  if (accDest && accSrc) {
    // 1:1 décomp memcpy ; pour single-cell access, juste copy la value.
    accDest.write(accSrc.read());
  }
  return false;
}

// ─── 0x32 copyarraywithindex ──────────────────────────────────────────────

/** 14 bytes (u32 dest + u32 src + u32 index addr + u8 size). */
function Cmd_copyarraywithindex(ctx: BattleScriptContext): boolean {
  const dest = readWord(ctx);
  const src = readWord(ctx);
  const _idxAddr = readWord(ctx);
  const _size = readByte(ctx);
  const accDest = resolveAddress(dest);
  const accSrc = resolveAddress(src);
  if (accDest && accSrc) {
    // Notre memory-map est cell-based donc index = 0 effectivement.
    accDest.write(accSrc.read());
  }
  return false;
}

// ─── 0x33 orbyte / 0x34 orhalfword / 0x35 orword ──────────────────────────

function Cmd_orbyte(ctx: BattleScriptContext): boolean {
  const { addr, value } = _consumeAddrAndU8(ctx);
  const acc = resolveAddress(addr);
  if (acc) acc.write((acc.read() | value) & 0xFF);
  return false;
}
function Cmd_orhalfword(ctx: BattleScriptContext): boolean {
  const { addr, value } = _consumeAddrAndU16(ctx);
  const acc = resolveAddress(addr);
  if (acc) acc.write((acc.read() | value) & 0xFFFF);
  return false;
}
function Cmd_orword(ctx: BattleScriptContext): boolean {
  const { addr, value } = _consumeAddrAndU32(ctx);
  const acc = resolveAddress(addr);
  if (acc) acc.write((acc.read() | value) >>> 0);
  return false;
}

// ─── 0x36 bicbyte / 0x37 bichalfword / 0x38 bicword ───────────────────────

function Cmd_bicbyte(ctx: BattleScriptContext): boolean {
  const { addr, value } = _consumeAddrAndU8(ctx);
  const acc = resolveAddress(addr);
  if (acc) acc.write((acc.read() & ~value) & 0xFF);
  return false;
}
function Cmd_bichalfword(ctx: BattleScriptContext): boolean {
  const { addr, value } = _consumeAddrAndU16(ctx);
  const acc = resolveAddress(addr);
  if (acc) acc.write((acc.read() & ~value) & 0xFFFF);
  return false;
}
function Cmd_bicword(ctx: BattleScriptContext): boolean {
  const { addr, value } = _consumeAddrAndU32(ctx);
  const acc = resolveAddress(addr);
  if (acc) acc.write((acc.read() & ~value) >>> 0);
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
  commands[0x29] = Cmd_jumpifbyte;  // AUDIT BUG fix : STUB.
  commands[0x2A] = Cmd_jumpifhalfword;
  commands[0x2B] = Cmd_jumpifword;
  commands[0x2C] = Cmd_jumpifarrayequal;
  commands[0x2D] = Cmd_jumpifarraynotequal;
  commands[0x2E] = Cmd_setbyte;  // AUDIT BUG fix : STUB.
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
