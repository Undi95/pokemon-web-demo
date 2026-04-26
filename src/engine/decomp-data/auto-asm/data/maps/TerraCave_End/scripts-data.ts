// AUTO-GENERATED from data/maps/TerraCave_End/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/TerraCave_End/scripts.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'TerraCave_End_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'TerraCave_End_OnResume', isGlobal: false, instrIndex: 2 },
  { name: 'TerraCave_End_EventScript_TryRemoveGroudon', isGlobal: true, instrIndex: 4 },
  { name: 'TerraCave_End_OnTransition', isGlobal: false, instrIndex: 8 },
  { name: 'TerraCave_End_EventScript_ShowGroudon', isGlobal: true, instrIndex: 10 },
  { name: 'TerraCave_End_EventScript_Groudon', isGlobal: true, instrIndex: 13 },
  { name: 'TerraCave_End_EventScript_DefeatedGroudon', isGlobal: true, instrIndex: 36 },
  { name: 'TerraCave_End_EventScript_RanFromGroudon', isGlobal: true, instrIndex: 40 },
  { name: 'TerraCave_End_Movement_GroudonApproach', isGlobal: false, instrIndex: 43 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 52 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"map_script",args:["MAP_SCRIPT_ON_RESUME","TerraCave_End_OnResume"]},
  {op:"map_script",args:["MAP_SCRIPT_ON_TRANSITION","TerraCave_End_OnTransition"]},
  {op:"call_if_set",args:["FLAG_SYS_CTRL_OBJ_DELETE","TerraCave_End_EventScript_TryRemoveGroudon"]},
  {op:"end",args:[]},
  {op:"specialvar",args:["VAR_RESULT","GetBattleOutcome"]},
  {op:"goto_if_ne",args:["VAR_RESULT","B_OUTCOME_CAUGHT","Common_EventScript_NopReturn"]},
  {op:"removeobject",args:["LOCALID_TERRA_CAVE_GROUDON"]},
  {op:"return",args:[]},
  {op:"call_if_unset",args:["FLAG_DEFEATED_GROUDON","TerraCave_End_EventScript_ShowGroudon"]},
  {op:"end",args:[]},
  {op:"clearflag",args:["FLAG_HIDE_TERRA_CAVE_GROUDON"]},
  {op:"setvar",args:["VAR_TEMP_1",1]},
  {op:"return",args:[]},
  {op:"lockall",args:[]},
  {op:"applymovement",args:["LOCALID_PLAYER","Common_Movement_FaceUp"]},
  {op:"waitmovement",args:[0]},
  {op:"applymovement",args:["LOCALID_TERRA_CAVE_GROUDON","TerraCave_End_Movement_GroudonApproach"]},
  {op:"waitmovement",args:[0]},
  {op:"waitse",args:[]},
  {op:"playmoncry",args:["SPECIES_GROUDON","CRY_MODE_ENCOUNTER"]},
  {op:"delay",args:[40]},
  {op:"waitmoncry",args:[]},
  {op:"setvar",args:["VAR_LAST_TALKED","LOCALID_TERRA_CAVE_GROUDON"]},
  {op:"setwildbattle",args:["SPECIES_GROUDON",70]},
  {op:"setflag",args:["FLAG_SYS_CTRL_OBJ_DELETE"]},
  {op:"special",args:["BattleSetup_StartLegendaryBattle"]},
  {op:"clearflag",args:["FLAG_SYS_CTRL_OBJ_DELETE"]},
  {op:"setvar",args:["VAR_TEMP_1",0]},
  {op:"specialvar",args:["VAR_RESULT","GetBattleOutcome"]},
  {op:"goto_if_eq",args:["VAR_RESULT","B_OUTCOME_WON","TerraCave_End_EventScript_DefeatedGroudon"]},
  {op:"goto_if_eq",args:["VAR_RESULT","B_OUTCOME_RAN","TerraCave_End_EventScript_RanFromGroudon"]},
  {op:"goto_if_eq",args:["VAR_RESULT","B_OUTCOME_PLAYER_TELEPORTED","TerraCave_End_EventScript_RanFromGroudon"]},
  {op:"setvar",args:["VAR_SHOULD_END_ABNORMAL_WEATHER",1]},
  {op:"setflag",args:["FLAG_DEFEATED_GROUDON"]},
  {op:"releaseall",args:[]},
  {op:"end",args:[]},
  {op:"setvar",args:["VAR_SHOULD_END_ABNORMAL_WEATHER",1]},
  {op:"setflag",args:["FLAG_DEFEATED_GROUDON"]},
  {op:"goto",args:["Common_EventScript_RemoveStaticPokemon"]},
  {op:"end",args:[]},
  {op:"setvar",args:["VAR_0x8004","SPECIES_GROUDON"]},
  {op:"goto",args:["Common_EventScript_LegendaryFlewAway"]},
  {op:"end",args:[]},
  {op:"init_affine_anim",args:[]},
  {op:"walk_down_start_affine",args:[]},
  {op:"delay_16",args:[]},
  {op:"delay_16",args:[]},
  {op:"walk_down_affine",args:[]},
  {op:"delay_16",args:[]},
  {op:"delay_16",args:[]},
  {op:"walk_down_affine",args:[]},
  {op:"step_end",args:[]},
] as const;
