// AUTO-GENERATED from data/maps/Underwater_SeafloorCavern/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/Underwater_SeafloorCavern/scripts.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'Underwater_SeafloorCavern_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'Underwater_SeafloorCavern_OnTransition', isGlobal: false, instrIndex: 3 },
  { name: 'Underwater_SeafloorCavern_EventScript_HideSubmarine', isGlobal: true, instrIndex: 6 },
  { name: 'Underwater_SeafloorCavern_OnLoad', isGlobal: false, instrIndex: 8 },
  { name: 'Underwater_SeafloorCavern_EventScript_SetSubmarineGoneMetatiles', isGlobal: true, instrIndex: 10 },
  { name: 'Underwater_SeafloorCavern_OnResume', isGlobal: false, instrIndex: 23 },
  { name: 'Underwater_SeafloorCavern_EventScript_CheckStolenSub', isGlobal: true, instrIndex: 25 },
  { name: 'Underwater_SeafloorCavern_Text_SubExplorer1', isGlobal: false, instrIndex: 27 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=6
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"Il est inscrit sur la coque:\\n\""] },
  { kind: '.string', vals: ["\"“SOUS-MARIN D'EXPLORATION 1”.\\p\""] },
  { kind: '.string', vals: ["\"C'est le sous-marin que la TEAM AQUA\\n\""] },
  { kind: '.string', vals: ["\"a volé à POIVRESSEL!\\p\""] },
  { kind: '.string', vals: ["\"La TEAM AQUA a dû venir\\n\""] },
  { kind: '.string', vals: ["\"jusqu'à cette rive.$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 27 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"map_script",args:["MAP_SCRIPT_ON_RESUME","Underwater_SeafloorCavern_OnResume"]},
  {op:"map_script",args:["MAP_SCRIPT_ON_TRANSITION","Underwater_SeafloorCavern_OnTransition"]},
  {op:"map_script",args:["MAP_SCRIPT_ON_LOAD","Underwater_SeafloorCavern_OnLoad"]},
  {op:"setflag",args:["FLAG_LANDMARK_SEAFLOOR_CAVERN"]},
  {op:"goto_if_set",args:["FLAG_KYOGRE_ESCAPED_SEAFLOOR_CAVERN","Underwater_SeafloorCavern_EventScript_HideSubmarine"]},
  {op:"end",args:[]},
  {op:"setflag",args:["FLAG_HIDE_UNDERWATER_SEA_FLOOR_CAVERN_STOLEN_SUBMARINE"]},
  {op:"end",args:[]},
  {op:"call_if_set",args:["FLAG_KYOGRE_ESCAPED_SEAFLOOR_CAVERN","Underwater_SeafloorCavern_EventScript_SetSubmarineGoneMetatiles"]},
  {op:"end",args:[]},
  {op:"setmetatile",args:[5,3,"METATILE_Underwater_RockWall",1]},
  {op:"setmetatile",args:[6,3,"METATILE_Underwater_RockWall",1]},
  {op:"setmetatile",args:[7,3,"METATILE_Underwater_RockWall",1]},
  {op:"setmetatile",args:[8,3,"METATILE_Underwater_RockWall",1]},
  {op:"setmetatile",args:[5,4,"METATILE_Underwater_FloorShadow",0]},
  {op:"setmetatile",args:[6,4,"METATILE_Underwater_FloorShadow",0]},
  {op:"setmetatile",args:[7,4,"METATILE_Underwater_FloorShadow",0]},
  {op:"setmetatile",args:[8,4,"METATILE_Underwater_FloorShadow",0]},
  {op:"setmetatile",args:[5,5,"METATILE_Underwater_FloorShadow",0]},
  {op:"setmetatile",args:[6,5,"METATILE_Underwater_FloorShadow",0]},
  {op:"setmetatile",args:[7,5,"METATILE_Underwater_FloorShadow",0]},
  {op:"setmetatile",args:[8,5,"METATILE_Underwater_FloorShadow",0]},
  {op:"return",args:[]},
  {op:"setdivewarp",args:["MAP_SEAFLOOR_CAVERN_ENTRANCE",10,17]},
  {op:"end",args:[]},
  {op:"msgbox",args:["Underwater_SeafloorCavern_Text_SubExplorer1","MSGBOX_SIGN"]},
  {op:"end",args:[]},
] as const;
