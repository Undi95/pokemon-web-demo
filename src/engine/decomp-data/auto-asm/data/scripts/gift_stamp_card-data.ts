// AUTO-GENERATED from data/scripts/gift_stamp_card.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/scripts/gift_stamp_card.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'MysteryGiftScript_StampCard', isGlobal: true, instrIndex: 0 },
  { name: 'sText_MysteryGiftStampCard', isGlobal: false, instrIndex: 14 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .string=4
export const DATA_DIRECTIVES = [
  { kind: '.string', vals: ["\"Merci d'utiliser le système\\n\""] },
  { kind: '.string', vals: ["\"CARTE TAMPON.\\p\""] },
  { kind: '.string', vals: ["\"Il vous en faut {STR_VAR_1} de plus pour\\n\""] },
  { kind: '.string', vals: ["\"remplir complètement la carte.$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 14 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"setvaddress",args:["MysteryGiftScript_StampCard"]},
  {op:"setorcopyvar",args:["VAR_RESULT","GET_MAX_STAMPS"]},
  {op:"specialvar",args:["VAR_0x8008","GetMysteryGiftCardStat"]},
  {op:"setorcopyvar",args:["VAR_RESULT","GET_NUM_STAMPS"]},
  {op:"specialvar",args:["VAR_0x8009","GetMysteryGiftCardStat"]},
  {op:"subvar",args:["VAR_0x8008","VAR_0x8009"]},
  {op:"buffernumberstring",args:["STR_VAR_1","VAR_0x8008"]},
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"vmessage",args:["sText_MysteryGiftStampCard"]},
  {op:"waitmessage",args:[]},
  {op:"waitbuttonpress",args:[]},
  {op:"release",args:[]},
  {op:"end",args:[]},
] as const;
