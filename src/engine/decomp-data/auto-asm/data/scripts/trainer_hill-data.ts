// AUTO-GENERATED from data/scripts/trainer_hill.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/scripts/trainer_hill.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'TrainerHill_OnResume', isGlobal: false, instrIndex: 0 },
  { name: 'TrainerHill_OnWarp', isGlobal: false, instrIndex: 7 },
  { name: 'TrainerHill_1F_EventScript_DummyOnWarp', isGlobal: true, instrIndex: 8 },
  { name: 'TrainerHill_OnFrame', isGlobal: false, instrIndex: 10 },
  { name: 'EventScript_TrainerHillTimer', isGlobal: true, instrIndex: 12 },
  { name: 'TrainerHill_1F_EventScript_DummyWarpToEntranceCounter', isGlobal: true, instrIndex: 17 },
  { name: 'TrainerHill_1F_EventScript_WarpSilentToEntranceCounter', isGlobal: true, instrIndex: 21 },
  { name: 'TrainerHill_1F_EventScript_Lost', isGlobal: true, instrIndex: 24 },
  { name: 'TrainerHill_EventScript_WarpToEntranceCounter', isGlobal: true, instrIndex: 28 },
  { name: 'TrainerHill_1F_Movement_SetInvisible', isGlobal: true, instrIndex: 32 },
  { name: 'TrainerHill_EventScript_TrainerBattle', isGlobal: true, instrIndex: 34 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .2byte=2
export const DATA_DIRECTIVES = [
  { kind: '.2byte', vals: [0] },
  { kind: '.2byte', vals: [0] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 40 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"setvar",args:["VAR_TEMP_2",0]},
  {op:"trainerhill_resumetimer",args:[]},
  {op:"frontier_get",args:["FRONTIER_DATA_BATTLE_OUTCOME"]},
  {op:"goto_if_eq",args:["VAR_RESULT","B_OUTCOME_LOST","TrainerHill_1F_EventScript_Lost"]},
  {op:"goto_if_eq",args:["VAR_RESULT","B_OUTCOME_DREW","TrainerHill_1F_EventScript_Lost"]},
  {op:"goto_if_eq",args:["VAR_RESULT","B_OUTCOME_FORFEITED","TrainerHill_1F_EventScript_Lost"]},
  {op:"end",args:[]},
  {op:"map_script_2",args:["VAR_TEMP_3",0,"TrainerHill_1F_EventScript_DummyOnWarp"]},
  {op:"setvar",args:["VAR_TEMP_3",1]},
  {op:"end",args:[]},
  {op:"map_script_2",args:["VAR_TEMP_2",0,"TrainerHill_1F_EventScript_DummyWarpToEntranceCounter"]},
  {op:"map_script_2",args:["VAR_TEMP_1",1,"TrainerHill_EventScript_WarpToEntranceCounter"]},
  {op:"lockall",args:[]},
  {op:"trainerhill_gettime",args:[]},
  {op:"msgbox",args:["TrainerHill_Entrance_Text_ChallengeTime","MSGBOX_DEFAULT"]},
  {op:"releaseall",args:[]},
  {op:"end",args:[]},
  {op:"setvar",args:["VAR_TEMP_2",1]},
  {op:"trainerhill_getusingereader",args:[]},
  {op:"goto_if_eq",args:["VAR_RESULT",1,"TrainerHill_1F_EventScript_WarpSilentToEntranceCounter"]},
  {op:"end",args:[]},
  {op:"warpsilent",args:["MAP_TRAINER_HILL_ENTRANCE",9,6]},
  {op:"waitstate",args:[]},
  {op:"end",args:[]},
  {op:"trainerhill_settrainerflags",args:[]},
  {op:"trainerhill_lost",args:[]},
  {op:"setvar",args:["VAR_TEMP_1",1]},
  {op:"end",args:[]},
  {op:"setvar",args:["VAR_TEMP_1",0]},
  {op:"warp",args:["MAP_TRAINER_HILL_ENTRANCE",9,6]},
  {op:"waitstate",args:[]},
  {op:"end",args:[]},
  {op:"set_invisible",args:[]},
  {op:"step_end",args:[]},
  {op:"trainerbattle",args:["TRAINER_BATTLE_HILL","TRAINER_PHILLIP","LOCALID_NONE","BattleFacility_TrainerBattle_PlaceholderText","BattleFacility_TrainerBattle_PlaceholderText"]},
  {op:"trainerhill_postbattletext",args:[]},
  {op:"waitmessage",args:[]},
  {op:"waitbuttonpress",args:[]},
  {op:"closemessage",args:[]},
  {op:"end",args:[]},
] as const;
