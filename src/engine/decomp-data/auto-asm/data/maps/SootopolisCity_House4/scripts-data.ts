// AUTO-GENERATED from data/maps/SootopolisCity_House4/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/SootopolisCity_House4/scripts.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'SootopolisCity_House4_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'SootopolisCity_House4_EventScript_Man', isGlobal: true, instrIndex: 0 },
  { name: 'SootopolisCity_House4_EventScript_Woman', isGlobal: true, instrIndex: 2 },
  { name: 'SootopolisCity_House4_EventScript_Azumarill', isGlobal: true, instrIndex: 4 },
  { name: 'SootopolisCity_House4_Text_AncientTreasuresWaitingInSea', isGlobal: false, instrIndex: 12 },
  { name: 'SootopolisCity_House4_Text_StrollUnderwaterWithPokemon', isGlobal: false, instrIndex: 12 },
  { name: 'SootopolisCity_House4_Text_Azumarill', isGlobal: false, instrIndex: 12 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=12
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"Ecoute-moi bien, je vais te dire\\n\""] },
  { kind: '.string', vals: ["\"quelque chose d'intéressant.\\p\""] },
  { kind: '.string', vals: ["\"Il paraît qu'il existe, pas très loin\\n\""] },
  { kind: '.string', vals: ["\"d'ici, une vieille ruine dans la mer.\\p\""] },
  { kind: '.string', vals: ["\"Il y a peut-être là-bas des trésors qui\\n\""] },
  { kind: '.string', vals: ["\"ne demandent qu'à être découverts.$\""] },
  { kind: '.string', vals: ["\"D'anciens trésors…\\p\""] },
  { kind: '.string', vals: ["\"Ce serait formidable s'ils existaient\\n\""] },
  { kind: '.string', vals: ["\"vraiment, mais même si ce n'est pas le\\l\""] },
  { kind: '.string', vals: ["\"cas, ce serait merveilleux de faire\\l\""] },
  { kind: '.string', vals: ["\"un tour sous l'eau avec mon POKéMON.$\""] },
  { kind: '.string', vals: ["\"AZUMARILL: Zuzu.$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 12 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"msgbox",args:["SootopolisCity_House4_Text_AncientTreasuresWaitingInSea","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["SootopolisCity_House4_Text_StrollUnderwaterWithPokemon","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"waitse",args:[]},
  {op:"playmoncry",args:["SPECIES_AZUMARILL","CRY_MODE_NORMAL"]},
  {op:"msgbox",args:["SootopolisCity_House4_Text_Azumarill","MSGBOX_DEFAULT"]},
  {op:"waitmoncry",args:[]},
  {op:"release",args:[]},
  {op:"end",args:[]},
] as const;
