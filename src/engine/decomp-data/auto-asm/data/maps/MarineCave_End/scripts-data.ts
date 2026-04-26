// AUTO-GENERATED from data/maps/MarineCave_End/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/MarineCave_End/scripts.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'MarineCave_End_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'MarineCave_End_OnResume', isGlobal: false, instrIndex: 2 },
  { name: 'MarineCave_End_EventScript_TryRemoveKyogre', isGlobal: true, instrIndex: 4 },
  { name: 'MarineCave_End_OnTransition', isGlobal: false, instrIndex: 8 },
  { name: 'MarineCave_End_EventScript_ShowKyogre', isGlobal: true, instrIndex: 10 },
  { name: 'MarineCave_End_EventScript_Kyogre', isGlobal: true, instrIndex: 13 },
  { name: 'MarineCave_End_EventScript_DefeatedKyogre', isGlobal: true, instrIndex: 36 },
  { name: 'MarineCave_End_EventScript_RanFromKyogre', isGlobal: true, instrIndex: 40 },
  { name: 'MarineCave_End_Movement_KyogreApproach', isGlobal: false, instrIndex: 43 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 52 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"map_script",args:["MAP_SCRIPT_ON_RESUME","MarineCave_End_OnResume"]},
  {op:"map_script",args:["MAP_SCRIPT_ON_TRANSITION","MarineCave_End_OnTransition"]},
  {op:"call_if_set",args:["FLAG_SYS_CTRL_OBJ_DELETE","MarineCave_End_EventScript_TryRemoveKyogre"]},
  {op:"end",args:[]},
  {op:"specialvar",args:["VAR_RESULT","GetBattleOutcome"]},
  {op:"goto_if_ne",args:["VAR_RESULT","B_OUTCOME_CAUGHT","Common_EventScript_NopReturn"]},
  {op:"removeobject",args:["LOCALID_MARINE_CAVE_KYOGRE"]},
  {op:"return",args:[]},
  {op:"call_if_unset",args:["FLAG_DEFEATED_KYOGRE","MarineCave_End_EventScript_ShowKyogre"]},
  {op:"end",args:[]},
  {op:"clearflag",args:["FLAG_HIDE_MARINE_CAVE_KYOGRE"]},
  {op:"setvar",args:["VAR_TEMP_1",1]},
  {op:"return",args:[]},
  {op:"lockall",args:[]},
  {op:"applymovement",args:["LOCALID_PLAYER","Common_Movement_FaceUp"]},
  {op:"waitmovement",args:[0]},
  {op:"applymovement",args:["LOCALID_MARINE_CAVE_KYOGRE","MarineCave_End_Movement_KyogreApproach"]},
  {op:"waitmovement",args:[0]},
  {op:"waitse",args:[]},
  {op:"playmoncry",args:["SPECIES_KYOGRE","CRY_MODE_ENCOUNTER"]},
  {op:"delay",args:[40]},
  {op:"waitmoncry",args:[]},
  {op:"setvar",args:["VAR_LAST_TALKED","LOCALID_MARINE_CAVE_KYOGRE"]},
  {op:"setwildbattle",args:["SPECIES_KYOGRE",70]},
  {op:"setflag",args:["FLAG_SYS_CTRL_OBJ_DELETE"]},
  {op:"special",args:["BattleSetup_StartLegendaryBattle"]},
  {op:"clearflag",args:["FLAG_SYS_CTRL_OBJ_DELETE"]},
  {op:"setvar",args:["VAR_TEMP_1",0]},
  {op:"specialvar",args:["VAR_RESULT","GetBattleOutcome"]},
  {op:"goto_if_eq",args:["VAR_RESULT","B_OUTCOME_WON","MarineCave_End_EventScript_DefeatedKyogre"]},
  {op:"goto_if_eq",args:["VAR_RESULT","B_OUTCOME_RAN","MarineCave_End_EventScript_RanFromKyogre"]},
  {op:"goto_if_eq",args:["VAR_RESULT","B_OUTCOME_PLAYER_TELEPORTED","MarineCave_End_EventScript_RanFromKyogre"]},
  {op:"setvar",args:["VAR_SHOULD_END_ABNORMAL_WEATHER",1]},
  {op:"setflag",args:["FLAG_DEFEATED_KYOGRE"]},
  {op:"releaseall",args:[]},
  {op:"end",args:[]},
  {op:"setvar",args:["VAR_SHOULD_END_ABNORMAL_WEATHER",1]},
  {op:"setflag",args:["FLAG_DEFEATED_KYOGRE"]},
  {op:"goto",args:["Common_EventScript_RemoveStaticPokemon"]},
  {op:"end",args:[]},
  {op:"setvar",args:["VAR_0x8004","SPECIES_KYOGRE"]},
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
