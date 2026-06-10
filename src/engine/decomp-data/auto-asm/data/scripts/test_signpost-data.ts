// AUTO-GENERATED from data/scripts/test_signpost.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/scripts/test_signpost.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'Text_ThisIsATestSignpostMsg', isGlobal: true, instrIndex: 0 },
  { name: 'EventScript_TestSignpostMsg', isGlobal: true, instrIndex: 0 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .string=2
export const DATA_DIRECTIVES = [
  { kind: '.string', vals: ["\"Message test.\\n\""] },
  { kind: '.string', vals: ["\"Panneau.$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 2 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"msgbox",args:["Text_ThisIsATestSignpostMsg","MSGBOX_SIGN"]},
  {op:"end",args:[]},
] as const;
