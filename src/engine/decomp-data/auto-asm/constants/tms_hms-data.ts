// AUTO-GENERATED from constants/tms_hms.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/constants/tms_hms.inc
// Generated: 2026-06-10

// ─── .include / .incbin / #include (dependency graph) ──────────────────────
export const INCLUDES = [
  { kind: 'cinclude', path: "constants/tms_hms.h" },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 4 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"enum_start",args:["ITEM_TM01"]},
  {op:"FOREACH_TM(EQUIV_TM)",args:[]},
  {op:"enum_start",args:["ITEM_HM01"]},
  {op:"FOREACH_HM(EQUIV_HM)",args:[]},
] as const;
