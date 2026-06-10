// AUTO-GENERATED from data/maps/LavaridgeTown_House/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/LavaridgeTown_House/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'LavaridgeTown_House_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'LavaridgeTown_House_EventScript_OldMan', isGlobal: true, instrIndex: 0 },
  { name: 'LavaridgeTown_House_EventScript_Zigzagoon', isGlobal: true, instrIndex: 2 },
  { name: 'LavaridgeTown_House_Text_WifeWarmingEggInHotSprings', isGlobal: false, instrIndex: 10 },
  { name: 'LavaridgeTown_House_Text_Zigzagoon', isGlobal: false, instrIndex: 10 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=6
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"Ma femme tente de faire éclore un OEUF\\n\""] },
  { kind: '.string', vals: ["\"dans les sources chaudes. Elle\\l\""] },
  { kind: '.string', vals: ["\"vient de me le dire.\\p\""] },
  { kind: '.string', vals: ["\"Elle a laissé deux POKéMON à la PENSION.\\n\""] },
  { kind: '.string', vals: ["\"Et ils ont découvert cet OEUF!$\""] },
  { kind: '.string', vals: ["\"ZIGZATON: Zigzaaa!$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 10 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"msgbox",args:["LavaridgeTown_House_Text_WifeWarmingEggInHotSprings","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"waitse",args:[]},
  {op:"playmoncry",args:["SPECIES_ZIGZAGOON","CRY_MODE_NORMAL"]},
  {op:"msgbox",args:["LavaridgeTown_House_Text_Zigzagoon","MSGBOX_DEFAULT"]},
  {op:"waitmoncry",args:[]},
  {op:"release",args:[]},
  {op:"end",args:[]},
] as const;
