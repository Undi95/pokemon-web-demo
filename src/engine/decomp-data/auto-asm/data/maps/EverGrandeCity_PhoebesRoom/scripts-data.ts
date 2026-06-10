// AUTO-GENERATED from data/maps/EverGrandeCity_PhoebesRoom/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/EverGrandeCity_PhoebesRoom/scripts.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'EverGrandeCity_PhoebesRoom_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'EverGrandeCity_PhoebesRoom_OnWarp', isGlobal: false, instrIndex: 3 },
  { name: 'EverGrandeCity_PhoebesRoom_EventScript_PlayerTurnNorth', isGlobal: true, instrIndex: 4 },
  { name: 'EverGrandeCity_PhoebesRoom_OnFrame', isGlobal: false, instrIndex: 6 },
  { name: 'EverGrandeCity_PhoebesRoom_EventScript_WalkInCloseDoor', isGlobal: true, instrIndex: 7 },
  { name: 'EverGrandeCity_PhoebesRoom_OnLoad', isGlobal: false, instrIndex: 12 },
  { name: 'EverGrandeCity_PhoebesRoom_EventScript_ResetAdvanceToNextRoom', isGlobal: true, instrIndex: 15 },
  { name: 'EverGrandeCity_PhoebesRoom_EventScript_CloseDoor', isGlobal: true, instrIndex: 17 },
  { name: 'EverGrandeCity_PhoebesRoom_EventScript_Phoebe', isGlobal: true, instrIndex: 19 },
  { name: 'EverGrandeCity_PhoebesRoom_EventScript_PostBattleSpeech', isGlobal: true, instrIndex: 27 },
  { name: 'EverGrandeCity_PhoebesRoom_EventScript_Defeated', isGlobal: true, instrIndex: 30 },
  { name: 'EverGrandeCity_PhoebesRoom_Text_IntroSpeech', isGlobal: false, instrIndex: 35 },
  { name: 'EverGrandeCity_PhoebesRoom_Text_Defeat', isGlobal: false, instrIndex: 35 },
  { name: 'EverGrandeCity_PhoebesRoom_Text_PostBattleSpeech', isGlobal: false, instrIndex: 35 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .2byte=2, .string=18
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.2byte', vals: [0] },
  { kind: '.2byte', vals: [0] },
  { kind: '.string', vals: ["\"Ah, ah, ah!\\p\""] },
  { kind: '.string', vals: ["\"Je suis SPECTRA du CONSEIL 4.\\n\""] },
  { kind: '.string', vals: ["\"Je me suis entraînée au MONT MEMORIA.\\p\""] },
  { kind: '.string', vals: ["\"Là-bas, j'ai appris à communier avec\\n\""] },
  { kind: '.string', vals: ["\"les POKéMON du type SPECTRE.\\p\""] },
  { kind: '.string', vals: ["\"Oui, le lien que j'ai créé avec eux\\n\""] },
  { kind: '.string', vals: ["\"est très étroit.\\p\""] },
  { kind: '.string', vals: ["\"Viens! On verra si tu arrives à infliger\\n\""] },
  { kind: '.string', vals: ["\"des dommages à mes POKéMON!$\""] },
  { kind: '.string', vals: ["\"Oh, non!\\n\""] },
  { kind: '.string', vals: ["\"J'ai lancé le défi et j'ai perdu…$\""] },
  { kind: '.string', vals: ["\"Toi aussi, un lien fort t'unit\\n\""] },
  { kind: '.string', vals: ["\"à tes POKéMON.\\p\""] },
  { kind: '.string', vals: ["\"Je n'ai pas voulu le reconnaître et\\n\""] },
  { kind: '.string', vals: ["\"forcément, j'ai perdu.\\p\""] },
  { kind: '.string', vals: ["\"J'aimerais bien voir jusqu'où ce lien\\n\""] },
  { kind: '.string', vals: ["\"si fort te mènera.\\p\""] },
  { kind: '.string', vals: ["\"Avance jusqu'à la prochaine pièce.$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 35 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"map_script",args:["MAP_SCRIPT_ON_LOAD","EverGrandeCity_PhoebesRoom_OnLoad"]},
  {op:"map_script",args:["MAP_SCRIPT_ON_WARP_INTO_MAP_TABLE","EverGrandeCity_PhoebesRoom_OnWarp"]},
  {op:"map_script",args:["MAP_SCRIPT_ON_FRAME_TABLE","EverGrandeCity_PhoebesRoom_OnFrame"]},
  {op:"map_script_2",args:["VAR_TEMP_1",0,"EverGrandeCity_PhoebesRoom_EventScript_PlayerTurnNorth"]},
  {op:"turnobject",args:["LOCALID_PLAYER","DIR_NORTH"]},
  {op:"end",args:[]},
  {op:"map_script_2",args:["VAR_ELITE_4_STATE",1,"EverGrandeCity_PhoebesRoom_EventScript_WalkInCloseDoor"]},
  {op:"lockall",args:[]},
  {op:"call",args:["PokemonLeague_EliteFour_EventScript_WalkInCloseDoor"]},
  {op:"setvar",args:["VAR_ELITE_4_STATE",2]},
  {op:"releaseall",args:[]},
  {op:"end",args:[]},
  {op:"call_if_set",args:["FLAG_DEFEATED_ELITE_4_PHOEBE","EverGrandeCity_PhoebesRoom_EventScript_ResetAdvanceToNextRoom"]},
  {op:"call_if_eq",args:["VAR_ELITE_4_STATE",2,"EverGrandeCity_PhoebesRoom_EventScript_CloseDoor"]},
  {op:"end",args:[]},
  {op:"call",args:["PokemonLeague_EliteFour_EventScript_ResetAdvanceToNextRoom"]},
  {op:"return",args:[]},
  {op:"call",args:["PokemonLeague_EliteFour_EventScript_CloseDoor"]},
  {op:"return",args:[]},
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"goto_if_set",args:["FLAG_DEFEATED_ELITE_4_PHOEBE","EverGrandeCity_PhoebesRoom_EventScript_PostBattleSpeech"]},
  {op:"playbgm",args:["MUS_ENCOUNTER_ELITE_FOUR",0]},
  {op:"msgbox",args:["EverGrandeCity_PhoebesRoom_Text_IntroSpeech","MSGBOX_DEFAULT"]},
  {op:"trainerbattle_no_intro",args:["TRAINER_PHOEBE","EverGrandeCity_PhoebesRoom_Text_Defeat"]},
  {op:"goto",args:["EverGrandeCity_PhoebesRoom_EventScript_Defeated"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["EverGrandeCity_PhoebesRoom_Text_PostBattleSpeech","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"setflag",args:["FLAG_DEFEATED_ELITE_4_PHOEBE"]},
  {op:"call",args:["PokemonLeague_EliteFour_SetAdvanceToNextRoomMetatiles"]},
  {op:"msgbox",args:["EverGrandeCity_PhoebesRoom_Text_PostBattleSpeech","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
] as const;
