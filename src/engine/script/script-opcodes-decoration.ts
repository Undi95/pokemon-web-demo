/**
 * script-opcodes-decoration.ts — opcodes decoration 1:1 décomp `decoration.c` +
 * `decoration_inventory.c`.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/scrcmd.c:549-579` :
 *   `ScrCmd_adddecoration`      : gSpecialVar_Result = DecorationAdd(decorId).
 *   `ScrCmd_removedecoration`   : gSpecialVar_Result = DecorationRemove(decorId).
 *   `ScrCmd_checkdecorspace`    : gSpecialVar_Result = DecorationCheckSpace(decorId).
 *   `ScrCmd_checkdecor`         : gSpecialVar_Result = CheckHasDecoration(decorId).
 *
 * Plus la macro `givedecoration` (event.inc:1960) → callstd STD_OBTAIN_DECORATION.
 * Plus `takedecoration` + `movedecoration` (RS-era retiré dans Em).
 * Plus `bufferdecorationname` (= 1:1 décomp string_util.c BufferDecorationName).
 */

import { registerOpcode, getOpcodeHandler } from './script-runtime';
import { VarGet, VarSet } from './script-vars';
import { gSaveBlock1Ptr } from '../save-block-state';
import { setStringVar } from '../string-buffers';
import { parseValue } from './script-opcodes-helpers';

/** _vget = VarGet avec fallback '0'. Local au fichier (= 1:1 décomp inline read). */
function _vget(arg: string | undefined): number {
  return VarGet(arg ?? '0');
}

/** Decorations dans le SaveBlock1. 1:1 décomp gSaveBlock1Ptr->decorations[]. */
function _decorationsArr(): number[] {
  if (!gSaveBlock1Ptr) return [];
  if (!gSaveBlock1Ptr.decorations) gSaveBlock1Ptr.decorations = [];
  return gSaveBlock1Ptr.decorations;
}

// 1:1 décomp ScrCmd_adddecoration (scrcmd.c:549-555) :
//   gSpecialVar_Result = DecorationAdd(decorId).
registerOpcode('adddecoration', (_ctx, args) => {
  const decorId = _vget(args[0]);
  const arr = _decorationsArr();
  if (arr.length < 256) {
    arr.push(decorId);
    VarSet('VAR_RESULT', 1);
  } else {
    VarSet('VAR_RESULT', 0);
  }
  return false;
});

// 1:1 décomp macro `givedecoration decoration` (event.inc:1960) :
//   setorcopyvar VAR_0x8000, decoration ; callstd STD_OBTAIN_DECORATION.
// STD_OBTAIN_DECORATION = adddecoration + obtained msg.
registerOpcode('givedecoration', (_ctx, args) => {
  return getOpcodeHandler('adddecoration')?.(_ctx, args) ?? false;
});

// 1:1 décomp ScrCmd_removedecoration (scrcmd.c:557-563) :
//   gSpecialVar_Result = DecorationRemove(decorId).
registerOpcode('takedecoration', (_ctx, args) => {
  const decorId = _vget(args[0]);
  const arr = _decorationsArr();
  const idx = arr.indexOf(decorId);
  if (idx >= 0) {
    arr.splice(idx, 1);
    VarSet('VAR_RESULT', 1);
  } else {
    VarSet('VAR_RESULT', 0);
  }
  return false;
});

// `removedecoration` — alias takedecoration (= naming variant des scripts JSON).
registerOpcode('removedecoration', (_ctx, args) => {
  return getOpcodeHandler('takedecoration')?.(_ctx, args) ?? false;
});

// 1:1 décomp ScrCmd_checkdecor (scrcmd.c:573-579) :
//   gSpecialVar_Result = CheckHasDecoration(decorId).
registerOpcode('checkdecor', (_ctx, args) => {
  const decorId = _vget(args[0]);
  const arr = _decorationsArr();
  VarSet('VAR_RESULT', arr.includes(decorId) ? 1 : 0);
  return false;
});

// 1:1 décomp ScrCmd_checkdecorspace (scrcmd.c:565-571) :
//   gSpecialVar_Result = DecorationCheckSpace(decorId).
registerOpcode('checkdecorspace', (_ctx, args) => {
  const _decorId = _vget(args[0]);
  void _decorId;
  const arr = _decorationsArr();
  VarSet('VAR_RESULT', arr.length < 256 ? 1 : 0);
  return false;
});

// `movedecoration` — RS-era opcode, non-functional dans Em (= retiré du décomp Em).
registerOpcode('movedecoration', (_ctx, _args) => {
  return false;
});

// 1:1 décomp ScrCmd_bufferdecorationname (scrcmd.c:1598-1605) :
//   StringCopy(sScriptStringVars[stringVarIndex], gDecorations[decorId].name).
// Notre port : strip prefix DECOR_ pour récupérer le nom (= post-MVP, lookup
// dans gDecorations[] data à porter en session dédiée).
registerOpcode('bufferdecorationname', (_ctx, args) => {
  const n = parseValue(args[0]) || 1;
  setStringVar(n, args[1]?.replace(/^DECOR_/, '') ?? '');
  return false;
});
