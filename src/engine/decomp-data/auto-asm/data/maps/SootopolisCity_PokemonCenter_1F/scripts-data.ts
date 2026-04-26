// AUTO-GENERATED from data/maps/SootopolisCity_PokemonCenter_1F/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/SootopolisCity_PokemonCenter_1F/scripts.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'SootopolisCity_PokemonCenter_1F_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'SootopolisCity_PokemonCenter_1F_OnTransition', isGlobal: false, instrIndex: 2 },
  { name: 'SootopolisCity_PokemonCenter_1F_EventScript_Nurse', isGlobal: true, instrIndex: 4 },
  { name: 'SootopolisCity_PokemonCenter_1F_EventScript_Gentleman', isGlobal: true, instrIndex: 10 },
  { name: 'SootopolisCity_PokemonCenter_1F_EventScript_GentlemanNoLegendaries', isGlobal: true, instrIndex: 17 },
  { name: 'SootopolisCity_PokemonCenter_1F_EventScript_Woman', isGlobal: true, instrIndex: 20 },
  { name: 'SootopolisCity_PokemonCenter_1F_EventScript_WomanNoLegendaries', isGlobal: true, instrIndex: 27 },
  { name: 'SootopolisCity_PokemonCenter_1F_Text_WallaceToughestInHoenn', isGlobal: false, instrIndex: 30 },
  { name: 'SootopolisCity_PokemonCenter_1F_Text_EveryoneTakenRefuge', isGlobal: false, instrIndex: 30 },
  { name: 'SootopolisCity_PokemonCenter_1F_Text_AlwaysBeFriendsWithPokemon', isGlobal: false, instrIndex: 30 },
  { name: 'SootopolisCity_PokemonCenter_1F_Text_ArentPokemonOurFriends', isGlobal: false, instrIndex: 30 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=18
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"On raconte que MARC est le DRESSEUR\\n\""] },
  { kind: '.string', vals: ["\"le plus fort de tout HOENN.\\p\""] },
  { kind: '.string', vals: ["\"L'ARENE de cette ville est dirigée par\\n\""] },
  { kind: '.string', vals: ["\"celui qui lui a tout appris.\\p\""] },
  { kind: '.string', vals: ["\"Mais le CONSEIL 4…\\p\""] },
  { kind: '.string', vals: ["\"On dit qu'ils sont encore plus forts\\n\""] },
  { kind: '.string', vals: ["\"que le mentor de MARC.\\p\""] },
  { kind: '.string', vals: ["\"Mais jusqu'à quel point?$\""] },
  { kind: '.string', vals: ["\"Tout le monde en ville s'est réfugié\\n\""] },
  { kind: '.string', vals: ["\"chez soi et personne ne veut sortir.\\p\""] },
  { kind: '.string', vals: ["\"Même moi je ferais bien de ne pas\\n\""] },
  { kind: '.string', vals: ["\"m'aventurer dehors.$\""] },
  { kind: '.string', vals: ["\"Peu importe ce qui se passera, où\\n\""] },
  { kind: '.string', vals: ["\"et quand ça se passera, je resterai\\l\""] },
  { kind: '.string', vals: ["\"toujours amie avec les POKéMON.\\p\""] },
  { kind: '.string', vals: ["\"Car c'est cool d'être avec les POKéMON!$\""] },
  { kind: '.string', vals: ["\"Je ne sais pas pourquoi…\\n\""] },
  { kind: '.string', vals: ["\"mais… j'ai vraiment peur…$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 30 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"map_script",args:["MAP_SCRIPT_ON_TRANSITION","SootopolisCity_PokemonCenter_1F_OnTransition"]},
  {op:"map_script",args:["MAP_SCRIPT_ON_RESUME","CableClub_OnResume"]},
  {op:"setrespawn",args:["HEAL_LOCATION_SOOTOPOLIS_CITY"]},
  {op:"end",args:[]},
  {op:"setvar",args:["VAR_0x800B","LOCALID_SOOTOPOLIS_NURSE"]},
  {op:"call",args:["Common_EventScript_PkmnCenterNurse"]},
  {op:"waitmessage",args:[]},
  {op:"waitbuttonpress",args:[]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"goto_if_ge",args:["VAR_SKY_PILLAR_STATE",2,"SootopolisCity_PokemonCenter_1F_EventScript_GentlemanNoLegendaries"]},
  {op:"goto_if_unset",args:["FLAG_KYOGRE_ESCAPED_SEAFLOOR_CAVERN","SootopolisCity_PokemonCenter_1F_EventScript_GentlemanNoLegendaries"]},
  {op:"msgbox",args:["SootopolisCity_PokemonCenter_1F_Text_EveryoneTakenRefuge","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["SootopolisCity_PokemonCenter_1F_Text_WallaceToughestInHoenn","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"goto_if_ge",args:["VAR_SKY_PILLAR_STATE",2,"SootopolisCity_PokemonCenter_1F_EventScript_WomanNoLegendaries"]},
  {op:"goto_if_unset",args:["FLAG_KYOGRE_ESCAPED_SEAFLOOR_CAVERN","SootopolisCity_PokemonCenter_1F_EventScript_WomanNoLegendaries"]},
  {op:"msgbox",args:["SootopolisCity_PokemonCenter_1F_Text_ArentPokemonOurFriends","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["SootopolisCity_PokemonCenter_1F_Text_AlwaysBeFriendsWithPokemon","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
] as const;
