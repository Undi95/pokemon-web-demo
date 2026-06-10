// AUTO-GENERATED from data/scripts/gift_altering_cave.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/scripts/gift_altering_cave.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'MysteryGiftScript_AlteringCave', isGlobal: true, instrIndex: 0 },
  { name: 'MysteryGiftScript_AlteringCave_', isGlobal: false, instrIndex: 4 },
  { name: 'sText_MysteryGiftAlteringCave', isGlobal: false, instrIndex: 11 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .string=8
export const DATA_DIRECTIVES = [
  { kind: '.string', vals: ["\"Merci d'utiliser le système\\n\""] },
  { kind: '.string', vals: ["\"CADEAU MYST.\\p\""] },
  { kind: '.string', vals: ["\"Il y a de plus en plus de rumeurs\\n\""] },
  { kind: '.string', vals: ["\"sur l'apparition de POKéMON rares.\\p\""] },
  { kind: '.string', vals: ["\"Les rumeurs parlent de la GROTTE\\n\""] },
  { kind: '.string', vals: ["\"METAMO sur la ROUTE 103.\\p\""] },
  { kind: '.string', vals: ["\"Vous devriez y aller pour vérifier\\n\""] },
  { kind: '.string', vals: ["\"si les rumeurs sont vraies.$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 11 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"setvaddress",args:["MysteryGiftScript_AlteringCave"]},
  {op:"addvar",args:["VAR_ALTERING_CAVE_WILD_SET",1]},
  {op:"vgoto_if_ne",args:["VAR_ALTERING_CAVE_WILD_SET","(NUM_ALTERING_CAVE_TABLES + 1)","MysteryGiftScript_AlteringCave_"]},
  {op:"setvar",args:["VAR_ALTERING_CAVE_WILD_SET",0]},
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"vmessage",args:["sText_MysteryGiftAlteringCave"]},
  {op:"waitmessage",args:[]},
  {op:"waitbuttonpress",args:[]},
  {op:"release",args:[]},
  {op:"end",args:[]},
] as const;
