// AUTO-GENERATED from data/maps/Route110_SeasideCyclingRoadSouthEntrance/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/Route110_SeasideCyclingRoadSouthEntrance/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'Route110_SeasideCyclingRoadSouthEntrance_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'Route110_SeasideCyclingRoadSouthEntrance_EventScript_Clerk', isGlobal: true, instrIndex: 0 },
  { name: 'Route110_SeasideCyclingRoadSouthEntrance_EventScript_BikeCheck', isGlobal: true, instrIndex: 5 },
  { name: 'Route110_SeasideCyclingRoadSouthEntrance_EventScript_NoBike', isGlobal: true, instrIndex: 12 },
  { name: 'Route110_SeasideCyclingRoadSouthEntrance_Movement_PushPlayerBackFromCounter', isGlobal: false, instrIndex: 18 },
  { name: 'Route110_SeasideCyclingRoadSouthEntrance_EventScript_ClearCyclingRoad', isGlobal: true, instrIndex: 20 },
  { name: 'Route110_SeasideCyclingRoadSouthEntrance_Text_GoAllOutOnCyclingRoad', isGlobal: false, instrIndex: 25 },
  { name: 'Route110_SeasideCyclingRoadSouthEntrance_Text_TooDangerousToWalk', isGlobal: false, instrIndex: 25 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=8
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"Sur la PISTE CYCLABLE, on peut rouler\\n\""] },
  { kind: '.string', vals: ["\"aussi vite qu'on veut.\\p\""] },
  { kind: '.string', vals: ["\"La vitesse c'est grisant, mais un\\n\""] },
  { kind: '.string', vals: ["\"accident est vite arrivé!$\""] },
  { kind: '.string', vals: ["\"Désolé, mais vous ne pouvez pas vous\\n\""] },
  { kind: '.string', vals: ["\"déplacer à pied sur la PISTE CYCLABLE.\\l\""] },
  { kind: '.string', vals: ["\"C'est trop dangereux.\\p\""] },
  { kind: '.string', vals: ["\"Revenez avec un VELO.$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 25 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"msgbox",args:["Route110_SeasideCyclingRoadSouthEntrance_Text_GoAllOutOnCyclingRoad","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"lockall",args:[]},
  {op:"specialvar",args:["VAR_RESULT","GetPlayerAvatarBike"]},
  {op:"goto_if_eq",args:["VAR_RESULT",0,"Route110_SeasideCyclingRoadSouthEntrance_EventScript_NoBike"]},
  {op:"setflag",args:["FLAG_SYS_CYCLING_ROAD"]},
  {op:"setvar",args:["VAR_TEMP_1",1]},
  {op:"releaseall",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["Route110_SeasideCyclingRoadSouthEntrance_Text_TooDangerousToWalk","MSGBOX_DEFAULT"]},
  {op:"closemessage",args:[]},
  {op:"applymovement",args:["LOCALID_PLAYER","Route110_SeasideCyclingRoadSouthEntrance_Movement_PushPlayerBackFromCounter"]},
  {op:"waitmovement",args:[0]},
  {op:"releaseall",args:[]},
  {op:"end",args:[]},
  {op:"walk_left",args:[]},
  {op:"step_end",args:[]},
  {op:"lockall",args:[]},
  {op:"clearflag",args:["FLAG_SYS_CYCLING_ROAD"]},
  {op:"setvar",args:["VAR_TEMP_1",0]},
  {op:"releaseall",args:[]},
  {op:"end",args:[]},
] as const;
