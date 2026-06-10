// AUTO-GENERATED from data/maps/VerdanturfTown_BattleTentCorridor/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/VerdanturfTown_BattleTentCorridor/scripts.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'VerdanturfTown_BattleTentCorridor_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'VerdanturfTown_BattleTentCorridor_OnFrame', isGlobal: false, instrIndex: 1 },
  { name: 'VerdanturfTown_BattleTentCorridor_EventScript_EnterCorridor', isGlobal: true, instrIndex: 2 },
  { name: 'VerdanturfTown_BattleTentCorridor_Movement_WalkToDoor', isGlobal: false, instrIndex: 19 },
  { name: 'VerdanturfTown_BattleTentCorridor_Movement_PlayerEnterDoor', isGlobal: false, instrIndex: 24 },
  { name: 'VerdanturfTown_BattleTentCorridor_Movement_AttendantEnterDoor', isGlobal: false, instrIndex: 25 },
  { name: 'VerdanturfTown_ContestHall_Text_WhichContestYouEntering', isGlobal: false, instrIndex: 28 },
  { name: 'VerdanturfTown_ContestHall_Text_RaisedMonToBeCute', isGlobal: false, instrIndex: 28 },
  { name: 'VerdanturfTown_ContestHall_Text_MyMonRules', isGlobal: false, instrIndex: 28 },
  { name: 'VerdanturfTown_ContestHall_Text_NormalRankStage', isGlobal: false, instrIndex: 28 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .2byte=1, .string=19
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.2byte', vals: [0] },
  { kind: '.string', vals: ["\"Which CONTEST are you entering?\\n\""] },
  { kind: '.string', vals: ["\"Want a piece of advice?\\p\""] },
  { kind: '.string', vals: ["\"In any CONTEST, for example, a CUTE\\n\""] },
  { kind: '.string', vals: ["\"CONTEST, I don't think they judge you\\l\""] },
  { kind: '.string', vals: ["\"only on cuteness in the first round.\\p\""] },
  { kind: '.string', vals: ["\"You need to work out ways for raising\\n\""] },
  { kind: '.string', vals: ["\"POKéMON better.$\""] },
  { kind: '.string', vals: ["\"I raised my POKéMON to be cute.\\p\""] },
  { kind: '.string', vals: ["\"I found out you can put POKéMON in\\n\""] },
  { kind: '.string', vals: ["\"a CONTEST for cuteness!\\p\""] },
  { kind: '.string', vals: ["\"I'm so glad I raised my POKéMON with\\n\""] },
  { kind: '.string', vals: ["\"loving care…$\""] },
  { kind: '.string', vals: ["\"My POKéMON rules!\\p\""] },
  { kind: '.string', vals: ["\"It's cool, tough yet beautiful, cute,\\n\""] },
  { kind: '.string', vals: ["\"and smart. It's complete!\\p\""] },
  { kind: '.string', vals: ["\"I may as well go for wins in every\\n\""] },
  { kind: '.string', vals: ["\"single CONTEST.$\""] },
  { kind: '.string', vals: ["\"POKéMON CONTESTS\\n\""] },
  { kind: '.string', vals: ["\"NORMAL RANK STAGE!$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 28 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"map_script",args:["MAP_SCRIPT_ON_FRAME_TABLE","VerdanturfTown_BattleTentCorridor_OnFrame"]},
  {op:"map_script_2",args:["VAR_TEMP_0",0,"VerdanturfTown_BattleTentCorridor_EventScript_EnterCorridor"]},
  {op:"lockall",args:[]},
  {op:"setvar",args:["VAR_TEMP_0",1]},
  {op:"applymovement",args:["LOCALID_VERDANTURF_TENT_CORRIDOR_ATTENDANT","VerdanturfTown_BattleTentCorridor_Movement_WalkToDoor"]},
  {op:"applymovement",args:["LOCALID_PLAYER","VerdanturfTown_BattleTentCorridor_Movement_WalkToDoor"]},
  {op:"waitmovement",args:[0]},
  {op:"opendoor",args:[2,1]},
  {op:"waitdooranim",args:[]},
  {op:"applymovement",args:["LOCALID_VERDANTURF_TENT_CORRIDOR_ATTENDANT","VerdanturfTown_BattleTentCorridor_Movement_AttendantEnterDoor"]},
  {op:"applymovement",args:["LOCALID_PLAYER","VerdanturfTown_BattleTentCorridor_Movement_PlayerEnterDoor"]},
  {op:"waitmovement",args:[0]},
  {op:"closedoor",args:[2,1]},
  {op:"waitdooranim",args:[]},
  {op:"setvar",args:["VAR_0x8006",0]},
  {op:"warp",args:["MAP_VERDANTURF_TOWN_BATTLE_TENT_BATTLE_ROOM",6,5]},
  {op:"waitstate",args:[]},
  {op:"releaseall",args:[]},
  {op:"end",args:[]},
  {op:"walk_up",args:[]},
  {op:"walk_up",args:[]},
  {op:"walk_up",args:[]},
  {op:"walk_up",args:[]},
  {op:"step_end",args:[]},
  {op:"walk_up",args:[]},
  {op:"walk_up",args:[]},
  {op:"set_invisible",args:[]},
  {op:"step_end",args:[]},
] as const;
