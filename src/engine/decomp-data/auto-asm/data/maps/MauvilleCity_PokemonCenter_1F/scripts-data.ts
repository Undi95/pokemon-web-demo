// AUTO-GENERATED from data/maps/MauvilleCity_PokemonCenter_1F/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/MauvilleCity_PokemonCenter_1F/scripts.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'MauvilleCity_PokemonCenter_1F_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'MauvilleCity_PokemonCenter_1F_OnTransition', isGlobal: false, instrIndex: 2 },
  { name: 'MauvilleCity_PokemonCenter_1F_EventScript_SetMauvilleOldManGfx', isGlobal: true, instrIndex: 6 },
  { name: 'MauvilleCity_PokemonCenter_1F_EventScript_Nurse', isGlobal: true, instrIndex: 8 },
  { name: 'MauvilleCity_PokemonCenter_1F_EventScript_Woman1', isGlobal: true, instrIndex: 14 },
  { name: 'MauvilleCity_PokemonCenter_1F_EventScript_Woman2', isGlobal: true, instrIndex: 16 },
  { name: 'MauvilleCity_PokemonCenter_1F_EventScript_Youngster', isGlobal: true, instrIndex: 18 },
  { name: 'MauvilleCity_PokemonCenter_1F_Text_ManOverThereSaysWeirdThings', isGlobal: false, instrIndex: 20 },
  { name: 'MauvilleCity_PokemonCenter_1F_Text_MyDataUpdatedFromRecordCorner', isGlobal: false, instrIndex: 20 },
  { name: 'MauvilleCity_PokemonCenter_1F_Text_RecordCornerSoundsFun', isGlobal: false, instrIndex: 20 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=12
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"L'homme qui est là-bas dit des choses\\n\""] },
  { kind: '.string', vals: ["\"étranges.\\p\""] },
  { kind: '.string', vals: ["\"Il est marrant, mais bizarre aussi.\\n\""] },
  { kind: '.string', vals: ["\"Je ne suis pas près de l'oublier!$\""] },
  { kind: '.string', vals: ["\"Quand j'ai échangé des données au\\n\""] },
  { kind: '.string', vals: ["\"CENTRE DE DONNEES, il y a eu une mise à\\l\""] },
  { kind: '.string', vals: ["\"jour de ce qui est à la mode à MYOKARA.\\p\""] },
  { kind: '.string', vals: ["\"Maintenant, j'ai les mêmes que mes amis!$\""] },
  { kind: '.string', vals: ["\"Un CENTRE DE DONNEES a ouvert à l'étage\\n\""] },
  { kind: '.string', vals: ["\"du CENTRE POKéMON.\\p\""] },
  { kind: '.string', vals: ["\"Je ne sais pas de quoi il s'agit au juste,\\n\""] },
  { kind: '.string', vals: ["\"mais ça a l'air sympa. Je passerai voir!$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 20 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"map_script",args:["MAP_SCRIPT_ON_TRANSITION","MauvilleCity_PokemonCenter_1F_OnTransition"]},
  {op:"map_script",args:["MAP_SCRIPT_ON_RESUME","CableClub_OnResume"]},
  {op:"setrespawn",args:["HEAL_LOCATION_MAUVILLE_CITY"]},
  {op:"call",args:["Common_EventScript_UpdateBrineyLocation"]},
  {op:"goto",args:["MauvilleCity_PokemonCenter_1F_EventScript_SetMauvilleOldManGfx"]},
  {op:"end",args:[]},
  {op:"special",args:["SetMauvilleOldManObjEventGfx"]},
  {op:"end",args:[]},
  {op:"setvar",args:["VAR_0x800B","LOCALID_MAUVILLE_NURSE"]},
  {op:"call",args:["Common_EventScript_PkmnCenterNurse"]},
  {op:"waitmessage",args:[]},
  {op:"waitbuttonpress",args:[]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["MauvilleCity_PokemonCenter_1F_Text_ManOverThereSaysWeirdThings","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["MauvilleCity_PokemonCenter_1F_Text_MyDataUpdatedFromRecordCorner","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["MauvilleCity_PokemonCenter_1F_Text_RecordCornerSoundsFun","MSGBOX_NPC"]},
  {op:"end",args:[]},
] as const;
