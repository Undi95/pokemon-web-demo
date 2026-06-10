// AUTO-GENERATED from data/maps/EverGrandeCity_DrakesRoom/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/EverGrandeCity_DrakesRoom/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'EverGrandeCity_DrakesRoom_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'EverGrandeCity_DrakesRoom_OnWarp', isGlobal: false, instrIndex: 3 },
  { name: 'EverGrandeCity_DrakesRoom_EventScript_PlayerTurnNorth', isGlobal: true, instrIndex: 4 },
  { name: 'EverGrandeCity_DrakesRoom_OnFrame', isGlobal: false, instrIndex: 6 },
  { name: 'EverGrandeCity_DrakesRoom_EventScript_WalkInCloseDoor', isGlobal: true, instrIndex: 7 },
  { name: 'EverGrandeCity_DrakesRoom_OnLoad', isGlobal: false, instrIndex: 12 },
  { name: 'EverGrandeCity_DrakesRoom_EventScript_ResetAdvanceToNextRoom', isGlobal: true, instrIndex: 15 },
  { name: 'EverGrandeCity_DrakesRoom_EventScript_CloseDoor', isGlobal: true, instrIndex: 17 },
  { name: 'EverGrandeCity_DrakesRoom_EventScript_Drake', isGlobal: true, instrIndex: 19 },
  { name: 'EverGrandeCity_DrakesRoom_EventScript_PostBattleSpeech', isGlobal: true, instrIndex: 27 },
  { name: 'EverGrandeCity_DrakesRoom_EventScript_Defeated', isGlobal: true, instrIndex: 30 },
  { name: 'EverGrandeCity_DrakesRoom_Text_IntroSpeech', isGlobal: false, instrIndex: 37 },
  { name: 'EverGrandeCity_DrakesRoom_Text_Defeat', isGlobal: false, instrIndex: 37 },
  { name: 'EverGrandeCity_DrakesRoom_Text_PostBattleSpeech', isGlobal: false, instrIndex: 37 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .2byte=2, .string=24
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.2byte', vals: [0] },
  { kind: '.2byte', vals: [0] },
  { kind: '.string', vals: ["\"Je suis le dernier du CONSEIL 4,\\n\""] },
  { kind: '.string', vals: ["\"ARAGON, le maître DRAGON.\\p\""] },
  { kind: '.string', vals: ["\"A l'état naturel, les POKéMON sont des\\n\""] },
  { kind: '.string', vals: ["\"créatures sauvages. Ils sont libres.\\p\""] },
  { kind: '.string', vals: ["\"Parfois, ils nous font obstacle.\\n\""] },
  { kind: '.string', vals: ["\"Parfois, ils nous aident.\\p\""] },
  { kind: '.string', vals: ["\"Combattre en s'alliant avec les\\n\""] },
  { kind: '.string', vals: ["\"POKéMON, tu sais ce que ça représente?\\p\""] },
  { kind: '.string', vals: ["\"Tu sais ce qu'il faut pour y parvenir?\\p\""] },
  { kind: '.string', vals: ["\"Si tu ne le sais pas, alors tu ne pourras\\n\""] },
  { kind: '.string', vals: ["\"jamais me dominer!$\""] },
  { kind: '.string', vals: ["\"Superbe! Ça vaut la peine d'être dit!$\""] },
  { kind: '.string', vals: ["\"Quel mérite d'avoir fait tout ce chemin\\n\""] },
  { kind: '.string', vals: ["\"en tant que DRESSEUR de POKéMON!\\p\""] },
  { kind: '.string', vals: ["\"Tu sembles avoir la qualité que\\n\""] },
  { kind: '.string', vals: ["\"possèdent les vrais DRESSEURS.\\p\""] },
  { kind: '.string', vals: ["\"Oui, ce qu'un DRESSEUR doit avoir, c'est\\n\""] },
  { kind: '.string', vals: ["\"un cœur vertueux.\\p\""] },
  { kind: '.string', vals: ["\"Les POKéMON touchent le cœur vertueux\\n\""] },
  { kind: '.string', vals: ["\"des DRESSEURS et apprennent le bien.\\p\""] },
  { kind: '.string', vals: ["\"Ils touchent le cœur vertueux des\\n\""] },
  { kind: '.string', vals: ["\"DRESSEURS et deviennent forts.\\p\""] },
  { kind: '.string', vals: ["\"Allez, en avant!\\n\""] },
  { kind: '.string', vals: ["\"Le MAITRE t'attend!$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 37 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"map_script",args:["MAP_SCRIPT_ON_FRAME_TABLE","EverGrandeCity_DrakesRoom_OnFrame"]},
  {op:"map_script",args:["MAP_SCRIPT_ON_LOAD","EverGrandeCity_DrakesRoom_OnLoad"]},
  {op:"map_script",args:["MAP_SCRIPT_ON_WARP_INTO_MAP_TABLE","EverGrandeCity_SidneysRoom_OnWarp"]},
  {op:"map_script_2",args:["VAR_TEMP_1",0,"EverGrandeCity_DrakesRoom_EventScript_PlayerTurnNorth"]},
  {op:"turnobject",args:["LOCALID_PLAYER","DIR_NORTH"]},
  {op:"end",args:[]},
  {op:"map_script_2",args:["VAR_ELITE_4_STATE",3,"EverGrandeCity_DrakesRoom_EventScript_WalkInCloseDoor"]},
  {op:"lockall",args:[]},
  {op:"call",args:["PokemonLeague_EliteFour_EventScript_WalkInCloseDoor"]},
  {op:"setvar",args:["VAR_ELITE_4_STATE",4]},
  {op:"releaseall",args:[]},
  {op:"end",args:[]},
  {op:"call_if_set",args:["FLAG_DEFEATED_ELITE_4_DRAKE","EverGrandeCity_DrakesRoom_EventScript_ResetAdvanceToNextRoom"]},
  {op:"call_if_eq",args:["VAR_ELITE_4_STATE",4,"EverGrandeCity_DrakesRoom_EventScript_CloseDoor"]},
  {op:"end",args:[]},
  {op:"call",args:["PokemonLeague_EliteFour_EventScript_ResetAdvanceToNextRoom"]},
  {op:"return",args:[]},
  {op:"call",args:["PokemonLeague_EliteFour_EventScript_CloseDoor"]},
  {op:"return",args:[]},
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"goto_if_set",args:["FLAG_DEFEATED_ELITE_4_DRAKE","EverGrandeCity_DrakesRoom_EventScript_PostBattleSpeech"]},
  {op:"playbgm",args:["MUS_ENCOUNTER_ELITE_FOUR",0]},
  {op:"msgbox",args:["EverGrandeCity_DrakesRoom_Text_IntroSpeech","MSGBOX_DEFAULT"]},
  {op:"trainerbattle_no_intro",args:["TRAINER_DRAKE","EverGrandeCity_DrakesRoom_Text_Defeat"]},
  {op:"goto",args:["EverGrandeCity_DrakesRoom_EventScript_Defeated"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["EverGrandeCity_DrakesRoom_Text_PostBattleSpeech","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"setvar",args:["VAR_0x8004","FANCOUNTER_DEFEATED_DRAKE"]},
  {op:"special",args:["Script_TryGainNewFanFromCounter"]},
  {op:"setflag",args:["FLAG_DEFEATED_ELITE_4_DRAKE"]},
  {op:"call",args:["PokemonLeague_EliteFour_SetAdvanceToNextRoomMetatiles"]},
  {op:"msgbox",args:["EverGrandeCity_DrakesRoom_Text_PostBattleSpeech","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
] as const;
