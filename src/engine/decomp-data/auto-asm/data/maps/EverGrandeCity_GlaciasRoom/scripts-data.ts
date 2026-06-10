// AUTO-GENERATED from data/maps/EverGrandeCity_GlaciasRoom/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/EverGrandeCity_GlaciasRoom/scripts.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'EverGrandeCity_GlaciasRoom_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'EverGrandeCity_GlaciasRoom_OnWarp', isGlobal: false, instrIndex: 3 },
  { name: 'EverGrandeCity_GlaciasRoom_EventScript_PlayerTurnNorth', isGlobal: true, instrIndex: 4 },
  { name: 'EverGrandeCity_GlaciasRoom_OnFrame', isGlobal: false, instrIndex: 6 },
  { name: 'EverGrandeCity_GlaciasRoom_EventScript_WalkInCloseDoor', isGlobal: true, instrIndex: 7 },
  { name: 'EverGrandeCity_GlaciasRoom_OnLoad', isGlobal: false, instrIndex: 12 },
  { name: 'EverGrandeCity_GlaciasRoom_EventScript_ResetAdvanceToNextRoom', isGlobal: true, instrIndex: 15 },
  { name: 'EverGrandeCity_GlaciasRoom_EventScript_CloseDoor', isGlobal: true, instrIndex: 17 },
  { name: 'EverGrandeCity_GlaciasRoom_EventScript_Glacia', isGlobal: true, instrIndex: 19 },
  { name: 'EverGrandeCity_GlaciasRoom_EventScript_PostBattleSpeech', isGlobal: true, instrIndex: 27 },
  { name: 'EverGrandeCity_GlaciasRoom_EventScript_Defeated', isGlobal: true, instrIndex: 30 },
  { name: 'EverGrandeCity_GlaciasRoom_Text_IntroSpeech', isGlobal: false, instrIndex: 35 },
  { name: 'EverGrandeCity_GlaciasRoom_Text_Defeat', isGlobal: false, instrIndex: 35 },
  { name: 'EverGrandeCity_GlaciasRoom_Text_PostBattleSpeech', isGlobal: false, instrIndex: 35 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .2byte=2, .string=18
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.2byte', vals: [0] },
  { kind: '.2byte', vals: [0] },
  { kind: '.string', vals: ["\"Bienvenue. Je suis GLACIA du\\n\""] },
  { kind: '.string', vals: ["\"CONSEIL 4.\\p\""] },
  { kind: '.string', vals: ["\"J'ai fait le chemin jusqu'à HOENN pour\\n\""] },
  { kind: '.string', vals: ["\"apprendre à mieux utiliser la glace.\\p\""] },
  { kind: '.string', vals: ["\"Mais je n'ai affronté que des DRESSEURS\\n\""] },
  { kind: '.string', vals: ["\"et des POKéMON faibles.\\p\""] },
  { kind: '.string', vals: ["\"Et toi?\\p\""] },
  { kind: '.string', vals: ["\"Ça me ferait extrêmement plaisir de\\n\""] },
  { kind: '.string', vals: ["\"me donner à fond contre toi!$\""] },
  { kind: '.string', vals: ["\"Tes POKéMON et toi… Une telle chaleur\\n\""] },
  { kind: '.string', vals: ["\"se dégage de vos esprits!\\p\""] },
  { kind: '.string', vals: ["\"Ce débordement de chaleur est\\n\""] },
  { kind: '.string', vals: ["\"accablant.\\p\""] },
  { kind: '.string', vals: ["\"Je comprends pourquoi je n'ai pas\\n\""] },
  { kind: '.string', vals: ["\"réussi à vous affecter avec la glace.$\""] },
  { kind: '.string', vals: ["\"Avance jusqu'à la prochaine pièce.\\p\""] },
  { kind: '.string', vals: ["\"Et là, tu comprendras pourquoi la\\n\""] },
  { kind: '.string', vals: ["\"LIGUE POKéMON est si redoutable.$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 35 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"map_script",args:["MAP_SCRIPT_ON_FRAME_TABLE","EverGrandeCity_GlaciasRoom_OnFrame"]},
  {op:"map_script",args:["MAP_SCRIPT_ON_LOAD","EverGrandeCity_GlaciasRoom_OnLoad"]},
  {op:"map_script",args:["MAP_SCRIPT_ON_WARP_INTO_MAP_TABLE","EverGrandeCity_GlaciasRoom_OnWarp"]},
  {op:"map_script_2",args:["VAR_TEMP_1",0,"EverGrandeCity_GlaciasRoom_EventScript_PlayerTurnNorth"]},
  {op:"turnobject",args:["LOCALID_PLAYER","DIR_NORTH"]},
  {op:"end",args:[]},
  {op:"map_script_2",args:["VAR_ELITE_4_STATE",2,"EverGrandeCity_GlaciasRoom_EventScript_WalkInCloseDoor"]},
  {op:"lockall",args:[]},
  {op:"call",args:["PokemonLeague_EliteFour_EventScript_WalkInCloseDoor"]},
  {op:"setvar",args:["VAR_ELITE_4_STATE",3]},
  {op:"releaseall",args:[]},
  {op:"end",args:[]},
  {op:"call_if_set",args:["FLAG_DEFEATED_ELITE_4_GLACIA","EverGrandeCity_GlaciasRoom_EventScript_ResetAdvanceToNextRoom"]},
  {op:"call_if_eq",args:["VAR_ELITE_4_STATE",3,"EverGrandeCity_GlaciasRoom_EventScript_CloseDoor"]},
  {op:"end",args:[]},
  {op:"call",args:["PokemonLeague_EliteFour_EventScript_ResetAdvanceToNextRoom"]},
  {op:"return",args:[]},
  {op:"call",args:["PokemonLeague_EliteFour_EventScript_CloseDoor"]},
  {op:"return",args:[]},
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"goto_if_set",args:["FLAG_DEFEATED_ELITE_4_GLACIA","EverGrandeCity_GlaciasRoom_EventScript_PostBattleSpeech"]},
  {op:"playbgm",args:["MUS_ENCOUNTER_ELITE_FOUR",0]},
  {op:"msgbox",args:["EverGrandeCity_GlaciasRoom_Text_IntroSpeech","MSGBOX_DEFAULT"]},
  {op:"trainerbattle_no_intro",args:["TRAINER_GLACIA","EverGrandeCity_GlaciasRoom_Text_Defeat"]},
  {op:"goto",args:["EverGrandeCity_GlaciasRoom_EventScript_Defeated"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["EverGrandeCity_GlaciasRoom_Text_PostBattleSpeech","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"setflag",args:["FLAG_DEFEATED_ELITE_4_GLACIA"]},
  {op:"call",args:["PokemonLeague_EliteFour_SetAdvanceToNextRoomMetatiles"]},
  {op:"msgbox",args:["EverGrandeCity_GlaciasRoom_Text_PostBattleSpeech","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
] as const;
