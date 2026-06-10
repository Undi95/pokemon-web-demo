// AUTO-GENERATED from data/scripts/surf.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/scripts/surf.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'EventScript_UseSurf', isGlobal: true, instrIndex: 0 },
  { name: 'EventScript_ReleaseUseSurf', isGlobal: true, instrIndex: 9 },
  { name: 'EventScript_EndUseSurf', isGlobal: true, instrIndex: 10 },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 11 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"checkpartymove",args:["MOVE_SURF"]},
  {op:"goto_if_eq",args:["VAR_RESULT","PARTY_SIZE","EventScript_EndUseSurf"]},
  {op:"bufferpartymonnick",args:["STR_VAR_1","VAR_RESULT"]},
  {op:"setfieldeffectargument",args:[0,"VAR_RESULT"]},
  {op:"lockall",args:[]},
  {op:"msgbox",args:["gText_WantToUseSurf","MSGBOX_YESNO"]},
  {op:"goto_if_eq",args:["VAR_RESULT","NO","EventScript_ReleaseUseSurf"]},
  {op:"msgbox",args:["gText_PlayerUsedSurf","MSGBOX_DEFAULT"]},
  {op:"dofieldeffect",args:["FLDEFF_USE_SURF"]},
  {op:"releaseall",args:[]},
  {op:"end",args:[]},
] as const;
