// AUTO-GENERATED from data/maps/EverGrandeCity_SidneysRoom/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/EverGrandeCity_SidneysRoom/scripts.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'EverGrandeCity_SidneysRoom_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'EverGrandeCity_SidneysRoom_OnTransition', isGlobal: false, instrIndex: 4 },
  { name: 'EverGrandeCity_SidneysRoom_OnLoad', isGlobal: false, instrIndex: 7 },
  { name: 'EverGrandeCity_SidneysRoom_EventScript_ResetAdvanceToNextRoom', isGlobal: true, instrIndex: 10 },
  { name: 'EverGrandeCity_SidneysRoom_EventScript_CloseDoor', isGlobal: true, instrIndex: 12 },
  { name: 'EverGrandeCity_SidneysRoom_OnWarp', isGlobal: false, instrIndex: 14 },
  { name: 'EverGrandeCity_SidneysRoom_EventScript_PlayerTurnNorth', isGlobal: true, instrIndex: 15 },
  { name: 'EverGrandeCity_SidneysRoom_OnFrame', isGlobal: false, instrIndex: 17 },
  { name: 'EverGrandeCity_SidneysRoom_EventScript_WalkInCloseDoor', isGlobal: true, instrIndex: 18 },
  { name: 'EverGrandeCity_SidneysRoom_EventScript_Sidney', isGlobal: true, instrIndex: 23 },
  { name: 'EverGrandeCity_SidneysRoom_EventScript_PostBattleSpeech', isGlobal: true, instrIndex: 31 },
  { name: 'EverGrandeCity_SidneysRoom_EventScript_Defeated', isGlobal: true, instrIndex: 34 },
  { name: 'EverGrandeCity_SidneysRoom_Text_IntroSpeech', isGlobal: false, instrIndex: 39 },
  { name: 'EverGrandeCity_SidneysRoom_Text_Defeat', isGlobal: false, instrIndex: 39 },
  { name: 'EverGrandeCity_SidneysRoom_Text_PostBattleSpeech', isGlobal: false, instrIndex: 39 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .2byte=2, .string=15
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.2byte', vals: [0] },
  { kind: '.2byte', vals: [0] },
  { kind: '.string', vals: ["\"Bienvenue, adversaire!\\n\""] },
  { kind: '.string', vals: ["\"Je suis DAMIEN du CONSEIL 4.\\p\""] },
  { kind: '.string', vals: ["\"J'aime la façon dont tu me regardes.\\n\""] },
  { kind: '.string', vals: ["\"Tu vas sûrement faire un bon combat.\\p\""] },
  { kind: '.string', vals: ["\"C'est bien! Vraiment bien!\\p\""] },
  { kind: '.string', vals: ["\"Bon! Toi et moi, livrons un combat\\n\""] },
  { kind: '.string', vals: ["\"comme on ne peut en voir qu'ici, à\\l\""] },
  { kind: '.string', vals: ["\"la LIGUE POKéMON!$\""] },
  { kind: '.string', vals: ["\"Alors, ça te fait plaisir? J'ai perdu!\\n\""] },
  { kind: '.string', vals: ["\"Tant pis, c'était sympa.$\""] },
  { kind: '.string', vals: ["\"Bon, écoute ce que le perdant veut\\n\""] },
  { kind: '.string', vals: ["\"te dire.\\p\""] },
  { kind: '.string', vals: ["\"Tu as ce qu'il faut pour continuer.\\n\""] },
  { kind: '.string', vals: ["\"Alors va dans la prochaine pièce et\\l\""] },
  { kind: '.string', vals: ["\"bon combat!$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 39 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"map_script",args:["MAP_SCRIPT_ON_LOAD","EverGrandeCity_SidneysRoom_OnLoad"]},
  {op:"map_script",args:["MAP_SCRIPT_ON_WARP_INTO_MAP_TABLE","EverGrandeCity_SidneysRoom_OnWarp"]},
  {op:"map_script",args:["MAP_SCRIPT_ON_TRANSITION","EverGrandeCity_SidneysRoom_OnTransition"]},
  {op:"map_script",args:["MAP_SCRIPT_ON_FRAME_TABLE","EverGrandeCity_SidneysRoom_OnFrame"]},
  {op:"setflag",args:["FLAG_MET_SCOTT_IN_EVERGRANDE"]},
  {op:"setflag",args:["FLAG_HIDE_EVER_GRANDE_POKEMON_CENTER_1F_SCOTT"]},
  {op:"end",args:[]},
  {op:"call_if_set",args:["FLAG_DEFEATED_ELITE_4_SIDNEY","EverGrandeCity_SidneysRoom_EventScript_ResetAdvanceToNextRoom"]},
  {op:"call_if_eq",args:["VAR_ELITE_4_STATE",1,"EverGrandeCity_SidneysRoom_EventScript_CloseDoor"]},
  {op:"end",args:[]},
  {op:"call",args:["PokemonLeague_EliteFour_EventScript_ResetAdvanceToNextRoom"]},
  {op:"return",args:[]},
  {op:"call",args:["PokemonLeague_EliteFour_EventScript_CloseDoor"]},
  {op:"return",args:[]},
  {op:"map_script_2",args:["VAR_TEMP_1",0,"EverGrandeCity_SidneysRoom_EventScript_PlayerTurnNorth"]},
  {op:"turnobject",args:["LOCALID_PLAYER","DIR_NORTH"]},
  {op:"end",args:[]},
  {op:"map_script_2",args:["VAR_ELITE_4_STATE",0,"EverGrandeCity_SidneysRoom_EventScript_WalkInCloseDoor"]},
  {op:"lockall",args:[]},
  {op:"call",args:["PokemonLeague_EliteFour_EventScript_WalkInCloseDoor"]},
  {op:"setvar",args:["VAR_ELITE_4_STATE",1]},
  {op:"releaseall",args:[]},
  {op:"end",args:[]},
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"goto_if_set",args:["FLAG_DEFEATED_ELITE_4_SIDNEY","EverGrandeCity_SidneysRoom_EventScript_PostBattleSpeech"]},
  {op:"playbgm",args:["MUS_ENCOUNTER_ELITE_FOUR",0]},
  {op:"msgbox",args:["EverGrandeCity_SidneysRoom_Text_IntroSpeech","MSGBOX_DEFAULT"]},
  {op:"trainerbattle_no_intro",args:["TRAINER_SIDNEY","EverGrandeCity_SidneysRoom_Text_Defeat"]},
  {op:"goto",args:["EverGrandeCity_SidneysRoom_EventScript_Defeated"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["EverGrandeCity_SidneysRoom_Text_PostBattleSpeech","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"setflag",args:["FLAG_DEFEATED_ELITE_4_SIDNEY"]},
  {op:"call",args:["PokemonLeague_EliteFour_SetAdvanceToNextRoomMetatiles"]},
  {op:"msgbox",args:["EverGrandeCity_SidneysRoom_Text_PostBattleSpeech","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
] as const;
