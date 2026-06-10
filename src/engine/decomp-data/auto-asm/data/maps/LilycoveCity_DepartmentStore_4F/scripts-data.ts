// AUTO-GENERATED from data/maps/LilycoveCity_DepartmentStore_4F/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/LilycoveCity_DepartmentStore_4F/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'LilycoveCity_DepartmentStore_4F_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'LilycoveCity_DepartmentStore_4F_EventScript_Gentleman', isGlobal: true, instrIndex: 0 },
  { name: 'LilycoveCity_DepartmentStore_4F_EventScript_Woman', isGlobal: true, instrIndex: 2 },
  { name: 'LilycoveCity_DepartmentStore_4F_EventScript_Youngster', isGlobal: true, instrIndex: 4 },
  { name: 'LilycoveCity_DepartmentStore_4F_EventScript_ClerkLeft', isGlobal: true, instrIndex: 6 },
  { name: 'LilycoveCity_DepartmentStore_4F_Pokemart_AttackTMs', isGlobal: false, instrIndex: 14 },
  { name: 'LilycoveCity_DepartmentStore_4F_EventScript_ClerkRight', isGlobal: true, instrIndex: 15 },
  { name: 'LilycoveCity_DepartmentStore_4F_Pokemart_DefenseTMs', isGlobal: false, instrIndex: 23 },
  { name: 'LilycoveCity_DepartmentStore_4F_Text_AttackOrDefenseTM', isGlobal: false, instrIndex: 24 },
  { name: 'LilycoveCity_DepartmentStore_4F_Text_FiftyDifferentTMs', isGlobal: false, instrIndex: 24 },
  { name: 'LilycoveCity_DepartmentStore_4F_Text_PokemonOnlyHaveFourMoves', isGlobal: false, instrIndex: 24 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .2byte=8, .string=11
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.2byte', vals: ["ITEM_TM_FIRE_BLAST"] },
  { kind: '.2byte', vals: ["ITEM_TM_THUNDER"] },
  { kind: '.2byte', vals: ["ITEM_TM_BLIZZARD"] },
  { kind: '.2byte', vals: ["ITEM_TM_HYPER_BEAM"] },
  { kind: '.2byte', vals: ["ITEM_TM_PROTECT"] },
  { kind: '.2byte', vals: ["ITEM_TM_SAFEGUARD"] },
  { kind: '.2byte', vals: ["ITEM_TM_REFLECT"] },
  { kind: '.2byte', vals: ["ITEM_TM_LIGHT_SCREEN"] },
  { kind: '.string', vals: ["\"Humm…\\p\""] },
  { kind: '.string', vals: ["\"Une capacité offensive…\\n\""] },
  { kind: '.string', vals: ["\"Une capacité défensive…\\p\""] },
  { kind: '.string', vals: ["\"Ce n'est pas facile de savoir quelle CT\\n\""] },
  { kind: '.string', vals: ["\"doit apprendre un POKéMON…$\""] },
  { kind: '.string', vals: ["\"Il y a tellement de CT différentes.\\p\""] },
  { kind: '.string', vals: ["\"Une brochure que j'ai lue indiquait\\n\""] },
  { kind: '.string', vals: ["\"qu'il y en avait cinquante sortes.$\""] },
  { kind: '.string', vals: ["\"J'aimerais bien avoir toutes les sortes\\n\""] },
  { kind: '.string', vals: ["\"de CT, mais un POKéMON ne peut\\l\""] },
  { kind: '.string', vals: ["\"apprendre que quatre capacités.$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 24 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"msgbox",args:["LilycoveCity_DepartmentStore_4F_Text_AttackOrDefenseTM","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["LilycoveCity_DepartmentStore_4F_Text_FiftyDifferentTMs","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["LilycoveCity_DepartmentStore_4F_Text_PokemonOnlyHaveFourMoves","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"message",args:["gText_HowMayIServeYou"]},
  {op:"waitmessage",args:[]},
  {op:"pokemart",args:["LilycoveCity_DepartmentStore_4F_Pokemart_AttackTMs"]},
  {op:"msgbox",args:["gText_PleaseComeAgain","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"pokemartlistend",args:[]},
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"message",args:["gText_HowMayIServeYou"]},
  {op:"waitmessage",args:[]},
  {op:"pokemart",args:["LilycoveCity_DepartmentStore_4F_Pokemart_DefenseTMs"]},
  {op:"msgbox",args:["gText_PleaseComeAgain","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"pokemartlistend",args:[]},
] as const;
