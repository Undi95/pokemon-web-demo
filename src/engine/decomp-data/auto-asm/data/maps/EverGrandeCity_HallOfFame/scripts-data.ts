// AUTO-GENERATED from data/maps/EverGrandeCity_HallOfFame/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/EverGrandeCity_HallOfFame/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'EverGrandeCity_HallOfFame_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'EverGrandeCity_HallOfFame_OnWarp', isGlobal: false, instrIndex: 2 },
  { name: 'EverGrandeCity_HallOfFame_EventScript_TurnPlayerNorth', isGlobal: true, instrIndex: 3 },
  { name: 'EverGrandeCity_HallOfFame_OnFrame', isGlobal: false, instrIndex: 5 },
  { name: 'EverGrandeCity_HallOfFame_EventScript_EnterHallOfFame', isGlobal: true, instrIndex: 6 },
  { name: 'EverGrandeCity_HallOfFame_EventScript_GameClearMale', isGlobal: true, instrIndex: 37 },
  { name: 'EverGrandeCity_HallOfFame_EventScript_GameClearFemale', isGlobal: true, instrIndex: 42 },
  { name: 'EverGrandeCity_HallOfFame_Movement_WalkIntoHallOfFame1', isGlobal: false, instrIndex: 47 },
  { name: 'EverGrandeCity_HallOfFame_Movement_WalkIntoHallOfFame2', isGlobal: false, instrIndex: 54 },
  { name: 'EverGrandeCity_HallOfFame_Text_HereWeHonorLeagueChampions', isGlobal: false, instrIndex: 60 },
  { name: 'EverGrandeCity_HallOfFame_Text_LetsRecordYouAndYourPartnersNames', isGlobal: false, instrIndex: 60 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .2byte=2, .string=10
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.2byte', vals: [0] },
  { kind: '.2byte', vals: [0] },
  { kind: '.string', vals: ["\"MARC: Cette pièce…\\p\""] },
  { kind: '.string', vals: ["\"C'est là que les performances des\\n\""] },
  { kind: '.string', vals: ["\"POKéMON qui remportent les combats\\l\""] },
  { kind: '.string', vals: ["\"les plus difficiles sont conservées.\\p\""] },
  { kind: '.string', vals: ["\"C'est ici que les MAITRES de la LIGUE\\n\""] },
  { kind: '.string', vals: ["\"POKéMON sont honorés.$\""] },
  { kind: '.string', vals: ["\"MARC: Viens inscrire ton nom et\\n\""] },
  { kind: '.string', vals: ["\"ceux de tes partenaires de combat. On\\l\""] },
  { kind: '.string', vals: ["\"te reconnaîtra comme l'un des glorieux\\l\""] },
  { kind: '.string', vals: ["\"DRESSEURS de la LIGUE POKéMON.$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 60 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"map_script",args:["MAP_SCRIPT_ON_FRAME_TABLE","EverGrandeCity_HallOfFame_OnFrame"]},
  {op:"map_script",args:["MAP_SCRIPT_ON_WARP_INTO_MAP_TABLE","EverGrandeCity_HallOfFame_OnWarp"]},
  {op:"map_script_2",args:["VAR_TEMP_1",0,"EverGrandeCity_HallOfFame_EventScript_TurnPlayerNorth"]},
  {op:"turnobject",args:["LOCALID_PLAYER","DIR_NORTH"]},
  {op:"end",args:[]},
  {op:"map_script_2",args:["VAR_TEMP_1",0,"EverGrandeCity_HallOfFame_EventScript_EnterHallOfFame"]},
  {op:"lockall",args:[]},
  {op:"applymovement",args:["LOCALID_HALL_OF_FAME_WALLACE","EverGrandeCity_HallOfFame_Movement_WalkIntoHallOfFame1"]},
  {op:"applymovement",args:["LOCALID_PLAYER","EverGrandeCity_HallOfFame_Movement_WalkIntoHallOfFame1"]},
  {op:"waitmovement",args:[0]},
  {op:"applymovement",args:["LOCALID_HALL_OF_FAME_WALLACE","Common_Movement_WalkInPlaceFasterRight"]},
  {op:"applymovement",args:["LOCALID_PLAYER","Common_Movement_WalkInPlaceFasterLeft"]},
  {op:"waitmovement",args:[0]},
  {op:"msgbox",args:["EverGrandeCity_HallOfFame_Text_HereWeHonorLeagueChampions","MSGBOX_DEFAULT"]},
  {op:"closemessage",args:[]},
  {op:"applymovement",args:["LOCALID_HALL_OF_FAME_WALLACE","EverGrandeCity_HallOfFame_Movement_WalkIntoHallOfFame2"]},
  {op:"applymovement",args:["LOCALID_PLAYER","EverGrandeCity_HallOfFame_Movement_WalkIntoHallOfFame2"]},
  {op:"waitmovement",args:[0]},
  {op:"delay",args:[20]},
  {op:"applymovement",args:["LOCALID_HALL_OF_FAME_WALLACE","Common_Movement_WalkInPlaceFasterRight"]},
  {op:"applymovement",args:["LOCALID_PLAYER","Common_Movement_WalkInPlaceFasterLeft"]},
  {op:"waitmovement",args:[0]},
  {op:"msgbox",args:["EverGrandeCity_HallOfFame_Text_LetsRecordYouAndYourPartnersNames","MSGBOX_DEFAULT"]},
  {op:"closemessage",args:[]},
  {op:"applymovement",args:["LOCALID_HALL_OF_FAME_WALLACE","Common_Movement_WalkInPlaceFasterUp"]},
  {op:"applymovement",args:["LOCALID_PLAYER","Common_Movement_WalkInPlaceFasterUp"]},
  {op:"waitmovement",args:[0]},
  {op:"delay",args:[20]},
  {op:"dofieldeffect",args:["FLDEFF_HALL_OF_FAME_RECORD"]},
  {op:"waitfieldeffect",args:["FLDEFF_HALL_OF_FAME_RECORD"]},
  {op:"delay",args:[40]},
  {op:"setvar",args:["VAR_TEMP_1",1]},
  {op:"call",args:["EverGrandeCity_HallOfFame_EventScript_SetGameClearFlags"]},
  {op:"checkplayergender",args:[]},
  {op:"goto_if_eq",args:["VAR_RESULT","MALE","EverGrandeCity_HallOfFame_EventScript_GameClearMale"]},
  {op:"goto_if_eq",args:["VAR_RESULT","FEMALE","EverGrandeCity_HallOfFame_EventScript_GameClearFemale"]},
  {op:"end",args:[]},
  {op:"setrespawn",args:["HEAL_LOCATION_LITTLEROOT_TOWN_BRENDANS_HOUSE_2F"]},
  {op:"fadescreenspeed",args:["FADE_TO_BLACK",24]},
  {op:"special",args:["GameClear"]},
  {op:"releaseall",args:[]},
  {op:"end",args:[]},
  {op:"setrespawn",args:["HEAL_LOCATION_LITTLEROOT_TOWN_MAYS_HOUSE_2F"]},
  {op:"fadescreenspeed",args:["FADE_TO_BLACK",24]},
  {op:"special",args:["GameClear"]},
  {op:"releaseall",args:[]},
  {op:"end",args:[]},
  {op:"walk_up",args:[]},
  {op:"walk_up",args:[]},
  {op:"walk_up",args:[]},
  {op:"walk_up",args:[]},
  {op:"walk_up",args:[]},
  {op:"walk_up",args:[]},
  {op:"step_end",args:[]},
  {op:"walk_up",args:[]},
  {op:"walk_up",args:[]},
  {op:"walk_up",args:[]},
  {op:"walk_up",args:[]},
  {op:"walk_up",args:[]},
  {op:"step_end",args:[]},
] as const;
