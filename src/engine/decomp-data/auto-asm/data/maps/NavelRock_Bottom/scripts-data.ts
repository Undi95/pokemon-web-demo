// AUTO-GENERATED from data/maps/NavelRock_Bottom/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/NavelRock_Bottom/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'NavelRock_Bottom_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'NavelRock_Bottom_OnTransition', isGlobal: false, instrIndex: 2 },
  { name: 'NavelRock_Bottom_EventScript_HideLugia', isGlobal: true, instrIndex: 5 },
  { name: 'NavelRock_Bottom_EventScript_TryShowLugia', isGlobal: true, instrIndex: 7 },
  { name: 'NavelRock_Bottom_OnResume', isGlobal: false, instrIndex: 10 },
  { name: 'NavelRock_Bottom_EventScript_TryRemoveLugia', isGlobal: true, instrIndex: 12 },
  { name: 'NavelRock_Bottom_EventScript_Lugia', isGlobal: true, instrIndex: 16 },
  { name: 'NavelRock_Bottom_EventScript_DefeatedLugia', isGlobal: true, instrIndex: 50 },
  { name: 'NavelRock_Bottom_EventScript_RanFromLugia', isGlobal: true, instrIndex: 54 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 57 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"map_script",args:["MAP_SCRIPT_ON_TRANSITION","NavelRock_Bottom_OnTransition"]},
  {op:"map_script",args:["MAP_SCRIPT_ON_RESUME","NavelRock_Bottom_OnResume"]},
  {op:"call_if_set",args:["FLAG_CAUGHT_LUGIA","NavelRock_Bottom_EventScript_HideLugia"]},
  {op:"call_if_unset",args:["FLAG_CAUGHT_LUGIA","NavelRock_Bottom_EventScript_TryShowLugia"]},
  {op:"end",args:[]},
  {op:"setflag",args:["FLAG_HIDE_LUGIA"]},
  {op:"return",args:[]},
  {op:"goto_if_set",args:["FLAG_DEFEATED_LUGIA","Common_EventScript_NopReturn"]},
  {op:"clearflag",args:["FLAG_HIDE_LUGIA"]},
  {op:"return",args:[]},
  {op:"call_if_set",args:["FLAG_SYS_CTRL_OBJ_DELETE","NavelRock_Bottom_EventScript_TryRemoveLugia"]},
  {op:"end",args:[]},
  {op:"specialvar",args:["VAR_RESULT","GetBattleOutcome"]},
  {op:"goto_if_ne",args:["VAR_RESULT","B_OUTCOME_CAUGHT","Common_EventScript_NopReturn"]},
  {op:"removeobject",args:["LOCALID_NAVEL_ROCK_LUGIA"]},
  {op:"return",args:[]},
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"waitse",args:[]},
  {op:"delay",args:[20]},
  {op:"playse",args:["SE_THUNDERSTORM_STOP"]},
  {op:"setvar",args:["VAR_0x8004",0]},
  {op:"setvar",args:["VAR_0x8005",3]},
  {op:"setvar",args:["VAR_0x8006",4]},
  {op:"setvar",args:["VAR_0x8007",2]},
  {op:"special",args:["ShakeCamera"]},
  {op:"delay",args:[30]},
  {op:"playse",args:["SE_THUNDERSTORM_STOP"]},
  {op:"setvar",args:["VAR_0x8004",0]},
  {op:"setvar",args:["VAR_0x8005",3]},
  {op:"setvar",args:["VAR_0x8006",4]},
  {op:"setvar",args:["VAR_0x8007",2]},
  {op:"special",args:["ShakeCamera"]},
  {op:"delay",args:[30]},
  {op:"delay",args:[50]},
  {op:"waitse",args:[]},
  {op:"playmoncry",args:["SPECIES_LUGIA","CRY_MODE_ENCOUNTER"]},
  {op:"waitmoncry",args:[]},
  {op:"delay",args:[20]},
  {op:"seteventmon",args:["SPECIES_LUGIA",70]},
  {op:"setflag",args:["FLAG_SYS_CTRL_OBJ_DELETE"]},
  {op:"special",args:["BattleSetup_StartLegendaryBattle"]},
  {op:"clearflag",args:["FLAG_SYS_CTRL_OBJ_DELETE"]},
  {op:"specialvar",args:["VAR_RESULT","GetBattleOutcome"]},
  {op:"goto_if_eq",args:["VAR_RESULT","B_OUTCOME_WON","NavelRock_Bottom_EventScript_DefeatedLugia"]},
  {op:"goto_if_eq",args:["VAR_RESULT","B_OUTCOME_RAN","NavelRock_Bottom_EventScript_RanFromLugia"]},
  {op:"goto_if_eq",args:["VAR_RESULT","B_OUTCOME_PLAYER_TELEPORTED","NavelRock_Bottom_EventScript_RanFromLugia"]},
  {op:"setflag",args:["FLAG_CAUGHT_LUGIA"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"setflag",args:["FLAG_DEFEATED_LUGIA"]},
  {op:"setvar",args:["VAR_0x8004","SPECIES_LUGIA"]},
  {op:"goto",args:["Common_EventScript_LegendaryFlewAway"]},
  {op:"end",args:[]},
  {op:"setvar",args:["VAR_0x8004","SPECIES_LUGIA"]},
  {op:"goto",args:["Common_EventScript_LegendaryFlewAway"]},
  {op:"end",args:[]},
] as const;
