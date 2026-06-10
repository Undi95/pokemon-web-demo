// AUTO-GENERATED from data/maps/LavaridgeTown_Gym_B1F/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/LavaridgeTown_Gym_B1F/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'LavaridgeTown_Gym_B1F_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'LavaridgeTown_Gym_B1F_OnTransition', isGlobal: false, instrIndex: 1 },
  { name: 'LavaridgeTown_Gym_B1F_EventScript_SetTrainerTempVars', isGlobal: true, instrIndex: 4 },
  { name: 'LavaridgeTown_Gym_B1F_EventScript_SetJaceTempVar', isGlobal: true, instrIndex: 10 },
  { name: 'LavaridgeTown_Gym_B1F_EventScript_SetJeffTempVar', isGlobal: true, instrIndex: 12 },
  { name: 'LavaridgeTown_Gym_B1F_EventScript_SetEliTempVar', isGlobal: true, instrIndex: 14 },
  { name: 'LavaridgeTown_Gym_B1F_EventScript_EndSetTrainerTempVars', isGlobal: true, instrIndex: 16 },
  { name: 'LavaridgeTown_Gym_B1F_EventScript_CheckBuryTrainers', isGlobal: true, instrIndex: 17 },
  { name: 'LavaridgeTown_Gym_B1F_EventScript_CheckBuryJace', isGlobal: true, instrIndex: 19 },
  { name: 'LavaridgeTown_Gym_B1F_EventScript_CheckBuryJeff', isGlobal: true, instrIndex: 21 },
  { name: 'LavaridgeTown_Gym_B1F_EventScript_CheckBuryEli', isGlobal: true, instrIndex: 23 },
  { name: 'LavaridgeTown_Gym_B1F_EventScript_EndCheckBuryTrainers', isGlobal: true, instrIndex: 25 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 26 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"map_script",args:["MAP_SCRIPT_ON_TRANSITION","LavaridgeTown_Gym_B1F_OnTransition"]},
  {op:"call",args:["LavaridgeTown_Gym_B1F_EventScript_SetTrainerTempVars"]},
  {op:"call",args:["LavaridgeTown_Gym_B1F_EventScript_CheckBuryTrainers"]},
  {op:"end",args:[]},
  {op:"setvar",args:["VAR_TEMP_7",0]},
  {op:"setvar",args:["VAR_TEMP_8",0]},
  {op:"setvar",args:["VAR_TEMP_9",0]},
  {op:"setvar",args:["VAR_TEMP_A",0]},
  {op:"goto_if_defeated",args:["TRAINER_KEEGAN","LavaridgeTown_Gym_B1F_EventScript_SetJaceTempVar"]},
  {op:"setvar",args:["VAR_TEMP_7",1]},
  {op:"goto_if_defeated",args:["TRAINER_JACE","LavaridgeTown_Gym_B1F_EventScript_SetJeffTempVar"]},
  {op:"setvar",args:["VAR_TEMP_8",1]},
  {op:"goto_if_defeated",args:["TRAINER_JEFF","LavaridgeTown_Gym_B1F_EventScript_SetEliTempVar"]},
  {op:"setvar",args:["VAR_TEMP_9",1]},
  {op:"goto_if_defeated",args:["TRAINER_ELI","LavaridgeTown_Gym_B1F_EventScript_EndSetTrainerTempVars"]},
  {op:"setvar",args:["VAR_TEMP_A",1]},
  {op:"return",args:[]},
  {op:"goto_if_defeated",args:["TRAINER_KEEGAN","LavaridgeTown_Gym_B1F_EventScript_CheckBuryJace"]},
  {op:"setobjectmovementtype",args:["LOCALID_KEEGAN","MOVEMENT_TYPE_BURIED"]},
  {op:"goto_if_defeated",args:["TRAINER_JACE","LavaridgeTown_Gym_B1F_EventScript_CheckBuryJeff"]},
  {op:"setobjectmovementtype",args:["LOCALID_JACE","MOVEMENT_TYPE_BURIED"]},
  {op:"goto_if_defeated",args:["TRAINER_JEFF","LavaridgeTown_Gym_B1F_EventScript_CheckBuryEli"]},
  {op:"setobjectmovementtype",args:["LOCALID_JEFF","MOVEMENT_TYPE_BURIED"]},
  {op:"goto_if_defeated",args:["TRAINER_ELI","LavaridgeTown_Gym_B1F_EventScript_EndCheckBuryTrainers"]},
  {op:"setobjectmovementtype",args:["LOCALID_ELI","MOVEMENT_TYPE_BURIED"]},
  {op:"return",args:[]},
] as const;
