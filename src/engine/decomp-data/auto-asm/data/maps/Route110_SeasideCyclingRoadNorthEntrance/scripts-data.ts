// AUTO-GENERATED from data/maps/Route110_SeasideCyclingRoadNorthEntrance/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/Route110_SeasideCyclingRoadNorthEntrance/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'Route110_SeasideCyclingRoadNorthEntrance_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'Route110_SeasideCyclingRoadNorthEntrance_OnTransition', isGlobal: false, instrIndex: 1 },
  { name: 'Route110_SeasideCyclingRoadNorthEntrance_EventScript_RestartChallenge', isGlobal: true, instrIndex: 4 },
  { name: 'Route110_SeasideCyclingRoadNorthEntrance_EventScript_Clerk', isGlobal: true, instrIndex: 6 },
  { name: 'Route110_SeasideCyclingRoadNorthEntrance_EventScript_BikeCheck', isGlobal: true, instrIndex: 11 },
  { name: 'Route110_SeasideCyclingRoadNorthEntrance_EventScript_OnMachBike', isGlobal: true, instrIndex: 19 },
  { name: 'Route110_SeasideCyclingRoadNorthEntrance_EventScript_NoBike', isGlobal: true, instrIndex: 21 },
  { name: 'Route110_SeasideCyclingRoadNorthEntrance_Movement_PushPlayerBackFromCounter', isGlobal: false, instrIndex: 27 },
  { name: 'Route110_SeasideCyclingRoadNorthEntrance_EventScript_ClearCyclingRoad', isGlobal: true, instrIndex: 29 },
  { name: 'Route110_SeasideCyclingRoadNorthEntrance_Text_GoAllOutOnCyclingRoad', isGlobal: false, instrIndex: 35 },
  { name: 'Route110_SeasideCyclingRoadNorthEntrance_Text_TooDangerousToWalk', isGlobal: false, instrIndex: 35 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=7
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"Sur la PISTE CYCLABLE, on peut rouler\\n\""] },
  { kind: '.string', vals: ["\"aussi vite qu'on veut.\\p\""] },
  { kind: '.string', vals: ["\"La vitesse c'est grisant, mais un\\n\""] },
  { kind: '.string', vals: ["\"accident est vite arrivé!$\""] },
  { kind: '.string', vals: ["\"Désolé, mais vous ne pouvez pas marcher\\n\""] },
  { kind: '.string', vals: ["\"sur la PISTE CYCLABLE. C'est dangereux.\\p\""] },
  { kind: '.string', vals: ["\"Revenez avec un VELO.$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 35 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"map_script",args:["MAP_SCRIPT_ON_TRANSITION","Route110_SeasideCyclingRoadNorthEntrance_OnTransition"]},
  {op:"call_if_eq",args:["VAR_CYCLING_CHALLENGE_STATE",3,"Route110_SeasideCyclingRoadNorthEntrance_EventScript_RestartChallenge"]},
  {op:"call_if_eq",args:["VAR_CYCLING_CHALLENGE_STATE",2,"Route110_SeasideCyclingRoadNorthEntrance_EventScript_RestartChallenge"]},
  {op:"end",args:[]},
  {op:"setvar",args:["VAR_CYCLING_CHALLENGE_STATE",1]},
  {op:"return",args:[]},
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"msgbox",args:["Route110_SeasideCyclingRoadNorthEntrance_Text_GoAllOutOnCyclingRoad","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"lockall",args:[]},
  {op:"specialvar",args:["VAR_RESULT","GetPlayerAvatarBike"]},
  {op:"call_if_eq",args:["VAR_RESULT",2,"Route110_SeasideCyclingRoadNorthEntrance_EventScript_OnMachBike"]},
  {op:"goto_if_eq",args:["VAR_RESULT",0,"Route110_SeasideCyclingRoadNorthEntrance_EventScript_NoBike"]},
  {op:"setflag",args:["FLAG_SYS_CYCLING_ROAD"]},
  {op:"setvar",args:["VAR_TEMP_1",1]},
  {op:"releaseall",args:[]},
  {op:"end",args:[]},
  {op:"setvar",args:["VAR_CYCLING_CHALLENGE_STATE",1]},
  {op:"return",args:[]},
  {op:"msgbox",args:["Route110_SeasideCyclingRoadNorthEntrance_Text_TooDangerousToWalk","MSGBOX_DEFAULT"]},
  {op:"closemessage",args:[]},
  {op:"applymovement",args:["LOCALID_PLAYER","Route110_SeasideCyclingRoadNorthEntrance_Movement_PushPlayerBackFromCounter"]},
  {op:"waitmovement",args:[0]},
  {op:"releaseall",args:[]},
  {op:"end",args:[]},
  {op:"walk_left",args:[]},
  {op:"step_end",args:[]},
  {op:"lockall",args:[]},
  {op:"setvar",args:["VAR_CYCLING_CHALLENGE_STATE",0]},
  {op:"clearflag",args:["FLAG_SYS_CYCLING_ROAD"]},
  {op:"setvar",args:["VAR_TEMP_1",0]},
  {op:"releaseall",args:[]},
  {op:"end",args:[]},
] as const;
