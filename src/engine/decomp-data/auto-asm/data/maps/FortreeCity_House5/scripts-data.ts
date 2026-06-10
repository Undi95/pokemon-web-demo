// AUTO-GENERATED from data/maps/FortreeCity_House5/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/FortreeCity_House5/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'FortreeCity_House5_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'FortreeCity_House5_EventScript_PokefanF', isGlobal: true, instrIndex: 0 },
  { name: 'FortreeCity_House5_EventScript_Man', isGlobal: true, instrIndex: 2 },
  { name: 'FortreeCity_House5_EventScript_Zigzagoon', isGlobal: true, instrIndex: 4 },
  { name: 'FortreeCity_House5_Text_TreeHousesAreGreat', isGlobal: false, instrIndex: 12 },
  { name: 'FortreeCity_House5_Text_AdaptedToNature', isGlobal: false, instrIndex: 12 },
  { name: 'FortreeCity_House5_Text_Zigzagoon', isGlobal: false, instrIndex: 12 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=9
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"Les cabanes de CIMETRONELLE\\n\""] },
  { kind: '.string', vals: ["\"sont géniales!\\p\""] },
  { kind: '.string', vals: ["\"Je trouve que c'est la ville parfaite\\n\""] },
  { kind: '.string', vals: ["\"pour vivre avec les POKéMON.$\""] },
  { kind: '.string', vals: ["\"Les POKéMON et les hommes se sont\\n\""] },
  { kind: '.string', vals: ["\"adaptés à la nature pour survivre.\\p\""] },
  { kind: '.string', vals: ["\"Il n'est pas nécessaire d'adapter la\\n\""] },
  { kind: '.string', vals: ["\"nature au mode de vie que l'on souhaite.$\""] },
  { kind: '.string', vals: ["\"ZIGZATON: Zaaaton!$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 12 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"msgbox",args:["FortreeCity_House5_Text_TreeHousesAreGreat","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["FortreeCity_House5_Text_AdaptedToNature","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"waitse",args:[]},
  {op:"playmoncry",args:["SPECIES_ZIGZAGOON","CRY_MODE_NORMAL"]},
  {op:"msgbox",args:["FortreeCity_House5_Text_Zigzagoon","MSGBOX_DEFAULT"]},
  {op:"waitmoncry",args:[]},
  {op:"release",args:[]},
  {op:"end",args:[]},
] as const;
