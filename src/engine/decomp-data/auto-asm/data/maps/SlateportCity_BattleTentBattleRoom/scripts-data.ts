// AUTO-GENERATED from data/maps/SlateportCity_BattleTentBattleRoom/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/SlateportCity_BattleTentBattleRoom/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'SlateportCity_BattleTentBattleRoom_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'SlateportCity_BattleTentBattleRoom_OnTransition', isGlobal: false, instrIndex: 3 },
  { name: 'SlateportCity_BattleTentBattleRoom_EventScript_SetPlayerGfx', isGlobal: true, instrIndex: 5 },
  { name: 'SlateportCity_BattleTentBattleRoom_EventScript_SetPlayerGfxMale', isGlobal: true, instrIndex: 9 },
  { name: 'SlateportCity_BattleTentBattleRoom_EventScript_SetPlayerGfxFemale', isGlobal: true, instrIndex: 11 },
  { name: 'SlateportCity_BattleTentBattleRoom_OnWarp', isGlobal: false, instrIndex: 13 },
  { name: 'SlateportCity_BattleTentBattleRoom_EventScript_SetUpObjects', isGlobal: true, instrIndex: 14 },
  { name: 'SlateportCity_BattleTentBattleRoom_OnFrame', isGlobal: false, instrIndex: 18 },
  { name: 'SlateportCity_BattleTentBattleRoom_EventScript_EnterRoom', isGlobal: true, instrIndex: 19 },
  { name: 'SlateportCity_BattleTent_EventScript_WarpToLobbyLost', isGlobal: true, instrIndex: 38 },
  { name: 'SlateportCity_BattleTentBattleRoom_EventScript_DefeatedOpponent', isGlobal: true, instrIndex: 42 },
  { name: 'SlateportCity_BattleTentBattleRoom_EventScript_WarpToLobbyWon', isGlobal: true, instrIndex: 50 },
  { name: 'SlateportCity_BattleTentBattleRoom_Movement_PlayerEnter', isGlobal: false, instrIndex: 54 },
  { name: 'SlateportCity_BattleTentBattleRoom_Movement_OpponentEnter', isGlobal: false, instrIndex: 59 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .2byte=2
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.2byte', vals: [0] },
  { kind: '.2byte', vals: [0] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 65 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"map_script",args:["MAP_SCRIPT_ON_TRANSITION","SlateportCity_BattleTentBattleRoom_OnTransition"]},
  {op:"map_script",args:["MAP_SCRIPT_ON_WARP_INTO_MAP_TABLE","SlateportCity_BattleTentBattleRoom_OnWarp"]},
  {op:"map_script",args:["MAP_SCRIPT_ON_FRAME_TABLE","SlateportCity_BattleTentBattleRoom_OnFrame"]},
  {op:"call",args:["SlateportCity_BattleTentBattleRoom_EventScript_SetPlayerGfx"]},
  {op:"end",args:[]},
  {op:"checkplayergender",args:[]},
  {op:"goto_if_eq",args:["VAR_RESULT","MALE","SlateportCity_BattleTentBattleRoom_EventScript_SetPlayerGfxMale"]},
  {op:"goto_if_eq",args:["VAR_RESULT","FEMALE","SlateportCity_BattleTentBattleRoom_EventScript_SetPlayerGfxFemale"]},
  {op:"return",args:[]},
  {op:"setvar",args:["VAR_OBJ_GFX_ID_1","OBJ_EVENT_GFX_RIVAL_BRENDAN_NORMAL"]},
  {op:"return",args:[]},
  {op:"setvar",args:["VAR_OBJ_GFX_ID_1","OBJ_EVENT_GFX_RIVAL_MAY_NORMAL"]},
  {op:"return",args:[]},
  {op:"map_script_2",args:["VAR_TEMP_1",0,"SlateportCity_BattleTentBattleRoom_EventScript_SetUpObjects"]},
  {op:"setvar",args:["VAR_TEMP_1",1]},
  {op:"hideobjectat",args:["LOCALID_PLAYER","MAP_FALLARBOR_TOWN_BATTLE_TENT_BATTLE_ROOM"]},
  {op:"hideobjectat",args:["LOCALID_SLATEPORT_TENT_BATTLE_OPPONENT","MAP_SLATEPORT_CITY_BATTLE_TENT_BATTLE_ROOM"]},
  {op:"end",args:[]},
  {op:"map_script_2",args:["VAR_TEMP_0",0,"SlateportCity_BattleTentBattleRoom_EventScript_EnterRoom"]},
  {op:"applymovement",args:["LOCALID_SLATEPORT_TENT_BATTLE_PLAYER","SlateportCity_BattleTentBattleRoom_Movement_PlayerEnter"]},
  {op:"waitmovement",args:[0]},
  {op:"factory_setopponentgfx",args:[]},
  {op:"setobjectxyperm",args:["LOCALID_SLATEPORT_TENT_BATTLE_OPPONENT",5,1]},
  {op:"removeobject",args:["LOCALID_SLATEPORT_TENT_BATTLE_OPPONENT"]},
  {op:"addobject",args:["LOCALID_SLATEPORT_TENT_BATTLE_OPPONENT"]},
  {op:"applymovement",args:["LOCALID_SLATEPORT_TENT_BATTLE_OPPONENT","SlateportCity_BattleTentBattleRoom_Movement_OpponentEnter"]},
  {op:"waitmovement",args:[0]},
  {op:"battletent_getopponentintro",args:[]},
  {op:"lockall",args:[]},
  {op:"msgbox",args:["gStringVar4","MSGBOX_DEFAULT"]},
  {op:"waitmessage",args:[]},
  {op:"closemessage",args:[]},
  {op:"special",args:["HealPlayerParty"]},
  {op:"setvar",args:["VAR_0x8004","SPECIAL_BATTLE_FACTORY"]},
  {op:"setvar",args:["VAR_0x8005",0]},
  {op:"special",args:["DoSpecialTrainerBattle"]},
  {op:"switch",args:["VAR_RESULT"]},
  {op:"case",args:[1,"SlateportCity_BattleTentBattleRoom_EventScript_DefeatedOpponent"]},
  {op:"frontier_set",args:["FRONTIER_DATA_CHALLENGE_STATUS","CHALLENGE_STATUS_LOST"]},
  {op:"special",args:["LoadPlayerParty"]},
  {op:"warp",args:["MAP_SLATEPORT_CITY_BATTLE_TENT_LOBBY",6,6]},
  {op:"waitstate",args:[]},
  {op:"frontier_get",args:["FRONTIER_DATA_BATTLE_NUM"]},
  {op:"addvar",args:["VAR_RESULT",1]},
  {op:"frontier_set",args:["FRONTIER_DATA_BATTLE_NUM","VAR_RESULT"]},
  {op:"switch",args:["VAR_RESULT"]},
  {op:"case",args:[3,"SlateportCity_BattleTentBattleRoom_EventScript_WarpToLobbyWon"]},
  {op:"setvar",args:["VAR_0x8006",1]},
  {op:"warp",args:["MAP_SLATEPORT_CITY_BATTLE_TENT_CORRIDOR",2,3]},
  {op:"waitstate",args:[]},
  {op:"frontier_set",args:["FRONTIER_DATA_CHALLENGE_STATUS","CHALLENGE_STATUS_WON"]},
  {op:"special",args:["LoadPlayerParty"]},
  {op:"warp",args:["MAP_SLATEPORT_CITY_BATTLE_TENT_LOBBY",6,6]},
  {op:"waitstate",args:[]},
  {op:"walk_up",args:[]},
  {op:"walk_up",args:[]},
  {op:"walk_up",args:[]},
  {op:"walk_in_place_faster_right",args:[]},
  {op:"step_end",args:[]},
  {op:"walk_down",args:[]},
  {op:"walk_down",args:[]},
  {op:"walk_down",args:[]},
  {op:"walk_down",args:[]},
  {op:"walk_in_place_faster_left",args:[]},
  {op:"step_end",args:[]},
] as const;
