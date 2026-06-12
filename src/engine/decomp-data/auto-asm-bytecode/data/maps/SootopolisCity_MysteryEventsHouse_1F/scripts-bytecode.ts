// AUTO-GENERATED from data/maps/SootopolisCity_MysteryEventsHouse_1F/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-06-12
// Stats: ops=114, bytes=785, labels=24, unknownOps=0, unresolvedSymbols=22

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "SootopolisCity_MysteryEventsHouse_1F_MapScripts": 0,
  "SootopolisCity_MysteryEventsHouse_1F_OnTransition": 10,
  "SootopolisCity_MysteryEventsHouse_1F_EventScript_SetTrainerVisitingLayout": 64,
  "SootopolisCity_MysteryEventsHouse_1F_EventScript_MoveOldManToDoor": 84,
  "SootopolisCity_MysteryEventsHouse_1F_OnFrame": 96,
  "SootopolisCity_MysteryEventsHouse_1F_EventScript_OldManCommentOnBattle": 120,
  "SootopolisCity_MysteryEventsHouse_1F_EventScript_BattleWonComment": 273,
  "SootopolisCity_MysteryEventsHouse_1F_EventScript_BattleLostComment": 282,
  "SootopolisCity_MysteryEventsHouse_1F_EventScript_BattleTiedComment": 291,
  "SootopolisCity_MysteryEventsHouse_1F_Movement_PlayerExitStairs": 300,
  "SootopolisCity_MysteryEventsHouse_1F_Movement_OldManWalkBehindPlayer": 302,
  "SootopolisCity_MysteryEventsHouse_1F_EventScript_OldMan": 305,
  "SootopolisCity_MysteryEventsHouse_1F_EventScript_InvalidVisitingTrainer": 370,
  "SootopolisCity_MysteryEventsHouse_1F_EventScript_TrainerVisiting": 380,
  "SootopolisCity_MysteryEventsHouse_1F_EventScript_DeclineBattle": 615,
  "SootopolisCity_MysteryEventsHouse_1F_EventScript_ChooseParty": 629,
  "SootopolisCity_MysteryEventsHouse_1F_EventScript_EnterBasementNorth": 644,
  "SootopolisCity_MysteryEventsHouse_1F_EventScript_EnterBasementEast": 685,
  "SootopolisCity_MysteryEventsHouse_1F_EventScript_EnterBasementWest": 726,
  "SootopolisCity_MysteryEventsHouse_1F_Movement_PlayerEnterBasementNorth": 767,
  "SootopolisCity_MysteryEventsHouse_1F_Movement_PlayerEnterBasementEast": 771,
  "SootopolisCity_MysteryEventsHouse_1F_Movement_PlayerEnterBasementWest": 775,
  "SootopolisCity_MysteryEventsHouse_1F_Movement_OldManMoveAsideLeft": 779,
  "SootopolisCity_MysteryEventsHouse_1F_Movement_OldManMoveAsideRight": 782,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [3,10,0,0,0,2,96,0,0,0,23,4,128,16,0,38,0,0,58,35,13,128,0,0,34,13,128,0,0,8,1,64,0,0,0,8,1,13,128,0,0,35,192,64,0,0,34,192,64,0,0,8,5,84,0,0,0,8,5,192,64,0,0,3,23,0,0,1,0,100,0,0,3,0,2,0,102,0,0,8,168,0,0,4,100,0,0,2,0,2,0,102,0,0,10,4,192,64,1,0,120,0,0,0,192,64,2,0,120,0,0,0,192,64,3,0,120,0,0,0,106,80,255,0,44,1,0,0,81,255,0,44,1,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,46,1,0,0,81,0,0,46,1,0,0,0,0,82,0,0,83,0,0,0,0,101,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,35,192,64,1,0,34,192,64,1,0,8,1,17,1,0,0,8,1,192,64,0,0,35,192,64,2,0,34,192,64,2,0,8,1,26,1,0,0,8,1,192,64,0,0,35,192,64,3,0,34,192,64,3,0,8,1,35,1,0,0,8,1,192,64,0,0,38,0,0,58,23,192,64,0,0,108,3,16,0,0,0,0,0,10,4,4,16,0,0,0,0,0,10,4,4,16,0,0,0,0,0,10,4,4,8,254,11,37,254,107,91,23,4,128,16,0,38,0,0,58,35,13,128,1,0,34,13,128,1,0,7,1,114,1,0,0,7,1,13,128,0,0,35,0,0,1,0,34,0,0,1,0,7,1,124,1,0,0,7,1,0,0,0,0,16,0,0,0,0,0,10,4,109,3,16,0,0,0,0,0,10,4,109,3,38,0,0,58,38,0,0,58,16,0,0,0,0,0,10,5,35,13,128,0,0,34,13,128,0,0,7,1,103,2,0,0,7,1,13,128,0,0,5,117,2,0,0,35,13,128,0,0,34,13,128,0,0,7,1,103,2,0,0,7,1,13,128,0,0,16,0,0,0,0,0,10,5,35,13,128,0,0,34,13,128,0,0,7,1,103,2,0,0,7,1,13,128,0,0,38,0,0,58,5,0,0,0,0,35,13,128,0,0,34,13,128,0,0,7,1,103,2,0,0,7,1,13,128,0,0,38,0,0,58,38,0,0,58,16,0,0,0,0,0,10,4,105,35,12,128,2,0,34,12,128,2,0,8,1,132,2,0,0,8,1,12,128,0,0,35,12,128,4,0,34,12,128,4,0,8,1,173,2,0,0,8,1,12,128,0,0,35,12,128,3,0,34,12,128,3,0,8,1,214,2,0,0,8,1,12,128,0,0,58,0,0,255,255,255,255,255,3,255,255,255,255,255,3,0,1,0,3,1,0,0,0,58,109,3,38,0,0,58,16,0,0,0,0,0,10,4,109,3,16,0,0,0,0,0,10,4,152,1,38,0,0,58,4,80,15,128,11,3,0,0,81,15,128,11,3,0,0,0,0,80,255,0,255,2,0,0,81,255,0,255,2,0,0,0,0,82,0,0,83,0,0,0,0,4,80,15,128,14,3,0,0,81,15,128,14,3,0,0,0,0,80,255,0,3,3,0,0,81,255,0,3,3,0,0,0,0,82,0,0,83,0,0,0,0,4,80,15,128,11,3,0,0,81,15,128,11,3,0,0,0,0,80,255,0,7,3,0,0,81,255,0,7,3,0,0,0,0,82,0,0,83,0,0,0,0,4,20,9,9,254,20,11,9,254,20,10,9,254,10,40,254,11,39,254] as const;

export const STATS = { ops: 114, bytes: 785, labels: 24, unknownOps: 0, unresolvedSymbols: 22 } as const;
