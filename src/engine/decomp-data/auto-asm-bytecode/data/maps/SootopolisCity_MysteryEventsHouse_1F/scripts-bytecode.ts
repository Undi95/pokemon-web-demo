// AUTO-GENERATED from data/maps/SootopolisCity_MysteryEventsHouse_1F/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=114, bytes=781, labels=24, unknownOps=0, unresolvedSymbols=29

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "SootopolisCity_MysteryEventsHouse_1F_MapScripts": 0,
  "SootopolisCity_MysteryEventsHouse_1F_OnTransition": 10,
  "SootopolisCity_MysteryEventsHouse_1F_EventScript_SetTrainerVisitingLayout": 63,
  "SootopolisCity_MysteryEventsHouse_1F_EventScript_MoveOldManToDoor": 82,
  "SootopolisCity_MysteryEventsHouse_1F_OnFrame": 94,
  "SootopolisCity_MysteryEventsHouse_1F_EventScript_OldManCommentOnBattle": 118,
  "SootopolisCity_MysteryEventsHouse_1F_EventScript_BattleWonComment": 270,
  "SootopolisCity_MysteryEventsHouse_1F_EventScript_BattleLostComment": 279,
  "SootopolisCity_MysteryEventsHouse_1F_EventScript_BattleTiedComment": 288,
  "SootopolisCity_MysteryEventsHouse_1F_Movement_PlayerExitStairs": 297,
  "SootopolisCity_MysteryEventsHouse_1F_Movement_OldManWalkBehindPlayer": 299,
  "SootopolisCity_MysteryEventsHouse_1F_EventScript_OldMan": 302,
  "SootopolisCity_MysteryEventsHouse_1F_EventScript_InvalidVisitingTrainer": 366,
  "SootopolisCity_MysteryEventsHouse_1F_EventScript_TrainerVisiting": 376,
  "SootopolisCity_MysteryEventsHouse_1F_EventScript_DeclineBattle": 611,
  "SootopolisCity_MysteryEventsHouse_1F_EventScript_ChooseParty": 625,
  "SootopolisCity_MysteryEventsHouse_1F_EventScript_EnterBasementNorth": 640,
  "SootopolisCity_MysteryEventsHouse_1F_EventScript_EnterBasementEast": 681,
  "SootopolisCity_MysteryEventsHouse_1F_EventScript_EnterBasementWest": 722,
  "SootopolisCity_MysteryEventsHouse_1F_Movement_PlayerEnterBasementNorth": 763,
  "SootopolisCity_MysteryEventsHouse_1F_Movement_PlayerEnterBasementEast": 767,
  "SootopolisCity_MysteryEventsHouse_1F_Movement_PlayerEnterBasementWest": 771,
  "SootopolisCity_MysteryEventsHouse_1F_Movement_OldManMoveAsideLeft": 775,
  "SootopolisCity_MysteryEventsHouse_1F_Movement_OldManMoveAsideRight": 778,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [3,10,0,0,0,2,94,0,0,0,113,4,16,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,8,1,63,0,0,0,8,1,13,128,0,0,35,192,64,0,0,34,192,64,0,0,8,5,82,0,0,0,8,5,192,64,0,0,90,113,0,1,0,100,0,0,3,0,2,0,102,0,0,8,168,0,0,15,100,0,0,2,0,2,0,102,0,0,10,15,192,64,1,0,118,0,0,0,192,64,2,0,118,0,0,0,192,64,3,0,118,0,0,0,106,80,255,0,41,1,0,0,81,255,0,41,1,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,43,1,0,0,81,0,0,43,1,0,0,0,0,82,0,0,83,0,0,0,0,101,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,35,192,64,1,0,34,192,64,1,0,8,1,14,1,0,0,8,1,192,64,0,0,35,192,64,2,0,34,192,64,2,0,8,1,23,1,0,0,8,1,192,64,0,0,35,192,64,3,0,34,192,64,3,0,8,1,32,1,0,0,8,1,192,64,0,0,38,0,0,0,113,192,0,0,108,90,16,0,0,0,0,0,10,0,15,16,0,0,0,0,0,10,0,15,16,0,0,0,0,0,10,0,15,8,254,11,37,254,107,91,113,4,16,0,38,0,0,0,35,13,128,1,0,34,13,128,1,0,7,1,110,1,0,0,7,1,13,128,0,0,35,0,0,1,0,34,0,0,1,0,7,1,120,1,0,0,7,1,0,0,0,0,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,38,0,0,0,38,0,0,0,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,7,1,99,2,0,0,7,1,13,128,0,0,88,113,2,0,0,35,13,128,0,0,34,13,128,0,0,7,1,99,2,0,0,7,1,13,128,0,0,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,7,1,99,2,0,0,7,1,13,128,0,0,38,0,0,0,88,0,0,0,0,35,13,128,0,0,34,13,128,0,0,7,1,99,2,0,0,7,1,13,128,0,0,38,0,0,0,38,0,0,0,16,0,0,0,0,0,10,0,105,35,12,128,2,0,34,12,128,2,0,8,1,128,2,0,0,8,1,12,128,0,0,35,12,128,4,0,34,12,128,4,0,8,1,169,2,0,0,8,1,12,128,0,0,35,12,128,3,0,34,12,128,3,0,8,1,210,2,0,0,8,1,12,128,0,0,58,0,0,255,255,255,255,255,3,255,255,255,255,255,3,0,1,0,3,1,0,0,0,0,109,90,38,0,0,0,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,152,1,38,0,0,0,15,80,15,128,7,3,0,0,81,15,128,7,3,0,0,0,0,80,255,0,251,2,0,0,81,255,0,251,2,0,0,0,0,82,0,0,83,0,0,0,0,15,80,15,128,10,3,0,0,81,15,128,10,3,0,0,0,0,80,255,0,255,2,0,0,81,255,0,255,2,0,0,0,0,82,0,0,83,0,0,0,0,15,80,15,128,7,3,0,0,81,15,128,7,3,0,0,0,0,80,255,0,3,3,0,0,81,255,0,3,3,0,0,0,0,82,0,0,83,0,0,0,0,15,20,9,9,254,20,11,9,254,20,10,9,254,10,40,254,11,39,254] as const;

export const STATS = { ops: 114, bytes: 781, labels: 24, unknownOps: 0, unresolvedSymbols: 29 } as const;
