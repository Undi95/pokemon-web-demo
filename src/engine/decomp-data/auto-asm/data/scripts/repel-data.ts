// AUTO-GENERATED from data/scripts/repel.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/scripts/repel.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'EventScript_RepelWoreOff', isGlobal: true, instrIndex: 0 },
  { name: 'Text_RepelWoreOff', isGlobal: false, instrIndex: 2 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .string=1
export const DATA_DIRECTIVES = [
  { kind: '.string', vals: ["\"L'effet de REPOUSSE se dissipe…$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 2 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"msgbox",args:["Text_RepelWoreOff","MSGBOX_SIGN"]},
  {op:"end",args:[]},
] as const;
