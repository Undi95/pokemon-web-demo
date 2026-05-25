/**
 * script-opcodes-flag-var.ts — opcodes flag / var / compare 1:1 décomp
 * `event_data.c`.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/scrcmd.c` :
 *   `ScrCmd_setvar`           (l. 360-365) : VarSet(varId, value).
 *   `ScrCmd_copyvar`          (l. 367-372) : VarSet(destVar, VarGet(srcVar)).
 *   `ScrCmd_setorcopyvar`     (l. 374-388) : si srcVar < SPECIAL_VARS_START, copy ; sinon set.
 *   `ScrCmd_addvar`           (l. 465-470) : VarSet(varId, VarGet(varId) + value).
 *   `ScrCmd_subvar`           (l. 472-477) : VarSet(varId, VarGet(varId) - value).
 *   `ScrCmd_setflag`          (l. 581-585) : FlagSet(flagId).
 *   `ScrCmd_clearflag`        (l. 587-591) : FlagClear(flagId).
 *   `ScrCmd_checkflag`        (l. 593-597) : ctx.comparisonResult = FlagGet(flagId).
 *   `ScrCmd_compare_var_to_value` etc. (l. 444-463) : Compare(a, b) → ctx.comparisonResult.
 *   `ScrCmd_incrementgamestat` (l. 599-603) : IncrementGameStat(stat).
 *
 * Et les macros user-level :
 *   `switch`/`case` (event.inc:1914-1921) : copyvar VAR_0x8000 + compare + goto_if_eq.
 *
 * Plus `compare_local_to_local/_value/_ptr/etc.` qui sont des variants alias
 * de `compare` (= dispatchent vers le même Compare()).
 */

import { registerOpcode, ScriptJump, getScript } from './script-runtime';
import { VarSet, VarGet, FlagSet, FlagClear, FlagGet, Compare, gSpecialVar } from './script-vars';
import { gSaveBlock1Ptr } from '../save/save-block-state';
import { parseValue } from './script-opcodes-helpers';

// ─── Variables ──────────────────────────────────────────────────────────────

registerOpcode('setvar', (_ctx, args) => {
  VarSet(args[0], parseValue(args[1]));
  return false;
});

registerOpcode('addvar', (_ctx, args) => {
  VarSet(args[0], (VarGet(args[0]) + parseValue(args[1])) & 0xFFFF);
  return false;
});

registerOpcode('subvar', (_ctx, args) => {
  VarSet(args[0], (VarGet(args[0]) - parseValue(args[1])) & 0xFFFF);
  return false;
});

registerOpcode('copyvar', (_ctx, args) => {
  VarSet(args[0], VarGet(args[1]));
  return false;
});

/** 1:1 décomp `ScrCmd_setorcopyvar` (scrcmd.c:374-388) — alt setvar that handles VAR_*. */
registerOpcode('setorcopyvar', (_ctx, args) => {
  const dst = args[0] ?? '';
  const src = args[1] ?? '';
  if (src && src.startsWith('VAR_')) {
    VarSet(dst, VarGet(src));
  } else {
    VarSet(dst, parseValue(src));
  }
  return false;
});

// ─── Switch / case (event.inc:1914-1921 macros) ─────────────────────────────

// 1:1 décomp asm/macros/event.inc:1914-1921 :
//
//   .macro switch var
//     copyvar VAR_0x8000, \var
//   .endm
//
//   .macro case condition, dest
//     compare VAR_0x8000, \condition
//     goto_if_eq \dest
//   .endm
//
// Notre extracteur garde les macros user-level (= switch/case) non-expandées.
// 337 usages `switch` + 1278 `case` (= biggest opcode gap).
registerOpcode('switch', (_ctx, args) => {
  // copyvar VAR_0x8000, args[0]
  VarSet('VAR_0x8000', VarGet(args[0]));
  return false;
});

registerOpcode('case', (ctx, args) => {
  // compare VAR_0x8000, args[0] + goto_if_eq args[1]
  const condition = parseValue(args[0]);
  const scratch = VarGet('VAR_0x8000');
  if (scratch === condition) {
    const target = getScript(args[1]);
    if (target) ScriptJump(ctx, target);
  }
  return false;
});

// ─── Flags ──────────────────────────────────────────────────────────────────

registerOpcode('setflag', (_ctx, args) => {
  FlagSet(args[0]);
  return false;
});

registerOpcode('clearflag', (_ctx, args) => {
  FlagClear(args[0]);
  return false;
});

registerOpcode('checkflag', (ctx, args) => {
  // 1:1 décomp : ctx.comparisonResult = FlagGet (= 0/1).
  ctx.comparisonResult = FlagGet(args[0]) ? 1 : 0;
  // gSpecialVar.Result aussi set par checkflag (= via VAR_RESULT).
  gSpecialVar.Result = ctx.comparisonResult;
  return false;
});

// ─── Compare ────────────────────────────────────────────────────────────────

registerOpcode('compare', (ctx, args) => {
  // 1:1 décomp : args peuvent être var noms, immediates, ou constantes
  // (MALE/FEMALE/LOCALID_X). parseValue les résout tous.
  const a = parseValue(args[0]);
  const b = parseValue(args[1]);
  ctx.comparisonResult = Compare(a, b);
  return false;
});

// ─── Game stats ─────────────────────────────────────────────────────────────

/** 1:1 décomp `ScrCmd_incrementgamestat` (scrcmd.c:599-603) :
 *    IncrementGameStat(stat);  // +1 à gSaveBlock1Ptr->gameStats[stat]. */
registerOpcode('incrementgamestat', (_ctx, args) => {
  const stat = VarGet(args[0] ?? '0');
  if (gSaveBlock1Ptr?.gameStats && stat >= 0 && stat < gSaveBlock1Ptr.gameStats.length) {
    gSaveBlock1Ptr.gameStats[stat] = (gSaveBlock1Ptr.gameStats[stat] ?? 0) + 1;
  }
  return false;
});
