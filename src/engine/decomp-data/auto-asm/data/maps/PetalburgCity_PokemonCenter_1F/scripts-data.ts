// AUTO-GENERATED from data/maps/PetalburgCity_PokemonCenter_1F/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/PetalburgCity_PokemonCenter_1F/scripts.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'PetalburgCity_PokemonCenter_1F_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'PetalburgCity_PokemonCenter_1F_OnTransition', isGlobal: false, instrIndex: 2 },
  { name: 'PetalburgCity_PokemonCenter_1F_EventScript_Nurse', isGlobal: true, instrIndex: 5 },
  { name: 'PetalburgCity_PokemonCenter_1F_EventScript_FatMan', isGlobal: true, instrIndex: 11 },
  { name: 'PetalburgCity_PokemonCenter_1F_EventScript_Youngster', isGlobal: true, instrIndex: 13 },
  { name: 'PetalburgCity_PokemonCenter_1F_EventScript_Woman', isGlobal: true, instrIndex: 15 },
  { name: 'PetalburgCity_PokemonCenter_1F_EventScript_SayStarterTypeInfo', isGlobal: true, instrIndex: 22 },
  { name: 'PetalburgCity_PokemonCenter_1F_EventScript_SayTreeckoType', isGlobal: true, instrIndex: 27 },
  { name: 'PetalburgCity_PokemonCenter_1F_EventScript_SayTorchicType', isGlobal: true, instrIndex: 29 },
  { name: 'PetalburgCity_PokemonCenter_1F_EventScript_SayMudkipType', isGlobal: true, instrIndex: 31 },
  { name: 'PetalburgCity_PokemonCenter_1F_Text_PCStorageSystem', isGlobal: false, instrIndex: 33 },
  { name: 'PetalburgCity_PokemonCenter_1F_Text_OranBerryRegainedHP', isGlobal: false, instrIndex: 33 },
  { name: 'PetalburgCity_PokemonCenter_1F_Text_ManyTypesOfPokemon', isGlobal: false, instrIndex: 33 },
  { name: 'PetalburgCity_PokemonCenter_1F_Text_TreeckoIsGrassType', isGlobal: false, instrIndex: 33 },
  { name: 'PetalburgCity_PokemonCenter_1F_Text_TorchicIsFireType', isGlobal: false, instrIndex: 33 },
  { name: 'PetalburgCity_PokemonCenter_1F_Text_MudkipIsWaterType', isGlobal: false, instrIndex: 33 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=29
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"Ce système de stockage de POKéMON\\n\""] },
  { kind: '.string', vals: ["\"sur PC…\\p\""] },
  { kind: '.string', vals: ["\"Celui qui l'a inventé doit être\\n\""] },
  { kind: '.string', vals: ["\"une sorte de génie de la science!$\""] },
  { kind: '.string', vals: ["\"Quand mon POKéMON mange une\\n\""] },
  { kind: '.string', vals: ["\"BAIE ORAN, il récupère des PV!$\""] },
  { kind: '.string', vals: ["\"Il existe de nombreux types de POKéMON.\\p\""] },
  { kind: '.string', vals: ["\"Chaque type a ses forces et ses\\n\""] },
  { kind: '.string', vals: ["\"faiblesses face aux autres types.\\p\""] },
  { kind: '.string', vals: ["\"Selon les types de POKéMON,\\n\""] },
  { kind: '.string', vals: ["\"le combat peut être facile ou difficile.$\""] },
  { kind: '.string', vals: ["\"Par exemple, ton ARCKO est un\\n\""] },
  { kind: '.string', vals: ["\"POKéMON du type PLANTE.\\p\""] },
  { kind: '.string', vals: ["\"Il est fort contre les POKéMON \\n\""] },
  { kind: '.string', vals: ["\"des types EAU et SOL.\\p\""] },
  { kind: '.string', vals: ["\"Mais il est faible contre les POKéMON\\n\""] },
  { kind: '.string', vals: ["\"du type FEU.$\""] },
  { kind: '.string', vals: ["\"Par exemple, ton POUSSIFEU est un\\n\""] },
  { kind: '.string', vals: ["\"POKéMON du type FEU.\\p\""] },
  { kind: '.string', vals: ["\"Il est fort contre les POKéMON \\n\""] },
  { kind: '.string', vals: ["\"des types PLANTE et INSECTE.\\p\""] },
  { kind: '.string', vals: ["\"Mais il est faible contre les POKéMON\\n\""] },
  { kind: '.string', vals: ["\"du type EAU.$\""] },
  { kind: '.string', vals: ["\"Par exemple, ton GOBOU est un\\n\""] },
  { kind: '.string', vals: ["\"POKéMON du type EAU.\\p\""] },
  { kind: '.string', vals: ["\"Il est fort contre les POKéMON \\n\""] },
  { kind: '.string', vals: ["\"du type FEU.\\p\""] },
  { kind: '.string', vals: ["\"Mais il est faible contre les POKéMON\\n\""] },
  { kind: '.string', vals: ["\"des types PLANTE et ELECTRIK.$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 33 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"map_script",args:["MAP_SCRIPT_ON_TRANSITION","PetalburgCity_PokemonCenter_1F_OnTransition"]},
  {op:"map_script",args:["MAP_SCRIPT_ON_RESUME","CableClub_OnResume"]},
  {op:"setrespawn",args:["HEAL_LOCATION_PETALBURG_CITY"]},
  {op:"call",args:["Common_EventScript_UpdateBrineyLocation"]},
  {op:"end",args:[]},
  {op:"setvar",args:["VAR_0x800B","LOCALID_PETALBURG_NURSE"]},
  {op:"call",args:["Common_EventScript_PkmnCenterNurse"]},
  {op:"waitmessage",args:[]},
  {op:"waitbuttonpress",args:[]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["PetalburgCity_PokemonCenter_1F_Text_PCStorageSystem","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["PetalburgCity_PokemonCenter_1F_Text_OranBerryRegainedHP","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"msgbox",args:["PetalburgCity_PokemonCenter_1F_Text_ManyTypesOfPokemon","MSGBOX_DEFAULT"]},
  {op:"specialvar",args:["VAR_RESULT","IsStarterInParty"]},
  {op:"goto_if_eq",args:["VAR_RESULT",1,"PetalburgCity_PokemonCenter_1F_EventScript_SayStarterTypeInfo"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"call_if_eq",args:["VAR_STARTER_MON",0,"PetalburgCity_PokemonCenter_1F_EventScript_SayTreeckoType"]},
  {op:"call_if_eq",args:["VAR_STARTER_MON",1,"PetalburgCity_PokemonCenter_1F_EventScript_SayTorchicType"]},
  {op:"call_if_eq",args:["VAR_STARTER_MON",2,"PetalburgCity_PokemonCenter_1F_EventScript_SayMudkipType"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["PetalburgCity_PokemonCenter_1F_Text_TreeckoIsGrassType","MSGBOX_DEFAULT"]},
  {op:"return",args:[]},
  {op:"msgbox",args:["PetalburgCity_PokemonCenter_1F_Text_TorchicIsFireType","MSGBOX_DEFAULT"]},
  {op:"return",args:[]},
  {op:"msgbox",args:["PetalburgCity_PokemonCenter_1F_Text_MudkipIsWaterType","MSGBOX_DEFAULT"]},
  {op:"return",args:[]},
] as const;
