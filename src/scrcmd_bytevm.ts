/**
 * scrcmd_bytevm.ts — handlers du byte-VM, 1:1 de `src/scrcmd.c` (Phase 4, slice).
 *
 * TRANSITOIRE : deviendra `src/scrcmd.ts` (handlers dispatch-par-nom actuels) au
 * swap. Chaque handler lit ses args via ScriptRead{Byte,Halfword,Word} et renvoie
 * TRUE pour wait — exactement comme scrcmd.c.
 *
 * SLICE INITIAL = opcodes d'état + flux (sans UI ni specials) : prouve la chaîne
 * bytecode → VM → dispatch → handler → état du jeu, contrôle de flux inclus
 * (goto/call/return/goto_if via offsets de l'image globale).
 *
 * Source de vérité : D:/Projet 1/decomps/pokeemeraude/src/scrcmd.c (1:1).
 */

import {
  ScriptContext, ScrCmdFunc, gScriptCmdTable,
  ScriptReadByte, ScriptReadHalfword, ScriptReadWord,
  ScriptJump, ScriptCall, ScriptReturn, StopScript, SetupNativeScript,
  ScriptContext_Stop, ptrFromOffset,
} from './script_bytevm';
import { VarGet, GetVarPointer, FlagSet, FlagClear, FlagGet } from './event_data';

// 1:1 scrcmd.c:76-84 — [condition][comparisonResult] → 1 si la branche est prise.
//   <  =  >
const sScriptConditionTable: number[][] = [
  [1, 0, 0], // <
  [0, 1, 0], // =
  [0, 0, 1], // >
  [1, 1, 0], // <=
  [0, 1, 1], // >=
  [1, 0, 1], // !=
];

// `*GetVarPointer(id)` (lecture/écriture) — notre GetVarPointer renvoie {get,set}|null.
function varDeref(id: number): number { const p = GetVarPointer(id); return p ? p.get() : 0; }
function varStore(id: number, v: number): void { const p = GetVarPointer(id); if (p) p.set(v & 0xFFFF); }

/** 1:1 scrcmd.c:381-388 `Compare(a, b)` : 0=<, 1==, 2=>. */
function Compare(a: number, b: number): number { return a < b ? 0 : a === b ? 1 : 2; }

// ─── handlers (1:1 scrcmd.c) ─────────────────────────────────────────────────
const ScrCmd_nop: ScrCmdFunc = () => false;                                  // :94
const ScrCmd_nop1: ScrCmdFunc = () => false;                                 // :99
const ScrCmd_end: ScrCmdFunc = (ctx) => { StopScript(ctx); return false; };  // :104

const ScrCmd_gotonative: ScrCmdFunc = (ctx) => {                             // :110
  // addr = pointeur natif. Chez nous : id de symbole natif → résolu en Phase 4b.
  const id = ScriptReadWord(ctx); void id;
  SetupNativeScript(ctx, () => true); // stub temporaire (slice sans natifs)
  return true;
};

const ScrCmd_waitstate: ScrCmdFunc = () => { ScriptContext_Stop(); return true; }; // :142

const ScrCmd_goto: ScrCmdFunc = (ctx) => {                                   // :148
  const off = ScriptReadWord(ctx);
  ScriptJump(ctx, ptrFromOffset(off));
  return false;
};
const ScrCmd_return: ScrCmdFunc = (ctx) => { ScriptReturn(ctx); return false; }; // :156
const ScrCmd_call: ScrCmdFunc = (ctx) => {                                   // :162
  const off = ScriptReadWord(ctx);
  ScriptCall(ctx, ptrFromOffset(off));
  return false;
};
const ScrCmd_goto_if: ScrCmdFunc = (ctx) => {                                // :170
  const condition = ScriptReadByte(ctx);
  const off = ScriptReadWord(ctx);
  if (sScriptConditionTable[condition][ctx.comparisonResult] === 1) ScriptJump(ctx, ptrFromOffset(off));
  return false;
};
const ScrCmd_call_if: ScrCmdFunc = (ctx) => {                               // :180
  const condition = ScriptReadByte(ctx);
  const off = ScriptReadWord(ctx);
  if (sScriptConditionTable[condition][ctx.comparisonResult] === 1) ScriptCall(ctx, ptrFromOffset(off));
  return false;
};

const ScrCmd_loadword: ScrCmdFunc = (ctx) => { const i = ScriptReadByte(ctx); ctx.data[i] = ScriptReadWord(ctx); return false; };   // :304
const ScrCmd_loadbyte: ScrCmdFunc = (ctx) => { const i = ScriptReadByte(ctx); ctx.data[i] = ScriptReadByte(ctx); return false; };   // :328
const ScrCmd_copylocal: ScrCmdFunc = (ctx) => { const d = ScriptReadByte(ctx); const s = ScriptReadByte(ctx); ctx.data[d] = ctx.data[s]; return false; }; // :344

const ScrCmd_setvar: ScrCmdFunc = (ctx) => { const id = ScriptReadHalfword(ctx); varStore(id, ScriptReadHalfword(ctx)); return false; };          // :360
const ScrCmd_copyvar: ScrCmdFunc = (ctx) => { const id = ScriptReadHalfword(ctx); varStore(id, varDeref(ScriptReadHalfword(ctx))); return false; }; // :367
const ScrCmd_setorcopyvar: ScrCmdFunc = (ctx) => { const id = ScriptReadHalfword(ctx); varStore(id, VarGet(ScriptReadHalfword(ctx))); return false; }; // :374
const ScrCmd_addvar: ScrCmdFunc = (ctx) => { const id = ScriptReadHalfword(ctx); varStore(id, (varDeref(id) + ScriptReadHalfword(ctx)) & 0xFFFF); return false; }; // :465
const ScrCmd_subvar: ScrCmdFunc = (ctx) => { const id = ScriptReadHalfword(ctx); varStore(id, (varDeref(id) - VarGet(ScriptReadHalfword(ctx))) & 0xFFFF); return false; }; // :472

const ScrCmd_compare_local_to_local: ScrCmdFunc = (ctx) => { const a = ctx.data[ScriptReadByte(ctx)]; const b = ctx.data[ScriptReadByte(ctx)]; ctx.comparisonResult = Compare(a & 0xFF, b & 0xFF); return false; }; // :390
const ScrCmd_compare_local_to_value: ScrCmdFunc = (ctx) => { const a = ctx.data[ScriptReadByte(ctx)]; const b = ScriptReadByte(ctx); ctx.comparisonResult = Compare(a & 0xFF, b); return false; }; // :399
const ScrCmd_compare_var_to_value: ScrCmdFunc = (ctx) => { const a = varDeref(ScriptReadHalfword(ctx)); const b = ScriptReadHalfword(ctx); ctx.comparisonResult = Compare(a, b); return false; }; // :444
const ScrCmd_compare_var_to_var: ScrCmdFunc = (ctx) => { const a = varDeref(ScriptReadHalfword(ctx)); const b = varDeref(ScriptReadHalfword(ctx)); ctx.comparisonResult = Compare(a, b); return false; }; // :453

const ScrCmd_setflag: ScrCmdFunc = (ctx) => { FlagSet(ScriptReadHalfword(ctx)); return false; };        // :581
const ScrCmd_clearflag: ScrCmdFunc = (ctx) => { FlagClear(ScriptReadHalfword(ctx)); return false; };    // :587
const ScrCmd_checkflag: ScrCmdFunc = (ctx) => { ctx.comparisonResult = FlagGet(ScriptReadHalfword(ctx)) ? 1 : 0; return false; }; // :593

/** Handlers du slice, keyed par nom ScrCmd_* (= colonne `handler` du cmd-table). */
export const BYTEVM_HANDLERS: Record<string, ScrCmdFunc> = {
  ScrCmd_nop, ScrCmd_nop1, ScrCmd_end, ScrCmd_gotonative, ScrCmd_waitstate,
  ScrCmd_goto, ScrCmd_return, ScrCmd_call, ScrCmd_goto_if, ScrCmd_call_if,
  ScrCmd_loadword, ScrCmd_loadbyte, ScrCmd_copylocal,
  ScrCmd_setvar, ScrCmd_copyvar, ScrCmd_setorcopyvar, ScrCmd_addvar, ScrCmd_subvar,
  ScrCmd_compare_local_to_local, ScrCmd_compare_local_to_value,
  ScrCmd_compare_var_to_value, ScrCmd_compare_var_to_var,
  ScrCmd_setflag, ScrCmd_clearflag, ScrCmd_checkflag,
};

/** Installe les handlers disponibles dans gScriptCmdTable, indexés par cmdId.
 *  `enumEntries` = champ `enum[]` de script-cmd-table.json ({op, cmdId, handler}). */
export function installByteVmHandlers(enumEntries: { cmdId: number; handler: string }[]): number {
  let n = 0;
  for (const e of enumEntries) {
    const fn = BYTEVM_HANDLERS[e.handler];
    if (fn) { gScriptCmdTable[e.cmdId] = fn; n++; }
  }
  return n;
}
