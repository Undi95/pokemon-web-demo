// AUTO-GENERATED from asm/macros/asm.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/asm/macros/asm.inc
// Generated: 2026-04-26

// ─── .equ / .set constants ──────────────────────────────────────────────────
/** Raw expr: `\x` */
export const __enum___EXPR = "\\x";

// ─── .macro definitions (asm macro → opcode mapping bodies) ─────────────────
export const MACROS = [
  { name: "inc", args: ["x:req"], body: [{op:".set",args:["\\x","\\x + 1"]}] },
  { name: "enum_start", args: ["x=0"], body: [] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 1 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"inc",args:["__enum__"]},
] as const;
