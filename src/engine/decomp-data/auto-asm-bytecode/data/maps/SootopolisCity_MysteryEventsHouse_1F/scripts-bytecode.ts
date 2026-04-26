// AUTO-GENERATED from data/maps/SootopolisCity_MysteryEventsHouse_1F/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=114, bytes=613, labels=24, unknownOps=2, unresolvedSymbols=29

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "SootopolisCity_MysteryEventsHouse_1F_MapScripts": 0,
  "SootopolisCity_MysteryEventsHouse_1F_OnTransition": 10,
  "SootopolisCity_MysteryEventsHouse_1F_EventScript_SetTrainerVisitingLayout": 39,
  "SootopolisCity_MysteryEventsHouse_1F_EventScript_MoveOldManToDoor": 58,
  "SootopolisCity_MysteryEventsHouse_1F_OnFrame": 70,
  "SootopolisCity_MysteryEventsHouse_1F_EventScript_OldManCommentOnBattle": 94,
  "SootopolisCity_MysteryEventsHouse_1F_EventScript_BattleWonComment": 210,
  "SootopolisCity_MysteryEventsHouse_1F_EventScript_BattleLostComment": 219,
  "SootopolisCity_MysteryEventsHouse_1F_EventScript_BattleTiedComment": 228,
  "SootopolisCity_MysteryEventsHouse_1F_Movement_PlayerExitStairs": 237,
  "SootopolisCity_MysteryEventsHouse_1F_Movement_OldManWalkBehindPlayer": 239,
  "SootopolisCity_MysteryEventsHouse_1F_EventScript_OldMan": 242,
  "SootopolisCity_MysteryEventsHouse_1F_EventScript_InvalidVisitingTrainer": 282,
  "SootopolisCity_MysteryEventsHouse_1F_EventScript_TrainerVisiting": 292,
  "SootopolisCity_MysteryEventsHouse_1F_EventScript_DeclineBattle": 443,
  "SootopolisCity_MysteryEventsHouse_1F_EventScript_ChooseParty": 457,
  "SootopolisCity_MysteryEventsHouse_1F_EventScript_EnterBasementNorth": 472,
  "SootopolisCity_MysteryEventsHouse_1F_EventScript_EnterBasementEast": 513,
  "SootopolisCity_MysteryEventsHouse_1F_EventScript_EnterBasementWest": 554,
  "SootopolisCity_MysteryEventsHouse_1F_Movement_PlayerEnterBasementNorth": 595,
  "SootopolisCity_MysteryEventsHouse_1F_Movement_PlayerEnterBasementEast": 599,
  "SootopolisCity_MysteryEventsHouse_1F_Movement_PlayerEnterBasementWest": 603,
  "SootopolisCity_MysteryEventsHouse_1F_Movement_OldManMoveAsideLeft": 607,
  "SootopolisCity_MysteryEventsHouse_1F_Movement_OldManMoveAsideRight": 610,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [3,10,0,0,0,2,70,0,0,0,113,4,16,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,35,192,64,0,0,34,192,64,0,0,90,113,0,1,0,100,0,0,3,0,2,0,102,0,0,8,168,0,0,15,100,0,0,2,0,2,0,102,0,0,10,15,192,64,1,0,94,0,0,0,192,64,2,0,94,0,0,0,192,64,3,0,94,0,0,0,106,80,255,0,237,0,0,0,81,255,0,237,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,239,0,0,0,81,0,0,239,0,0,0,0,0,82,0,0,83,0,0,0,0,101,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,35,192,64,1,0,34,192,64,1,0,35,192,64,2,0,34,192,64,2,0,35,192,64,3,0,34,192,64,3,0,38,0,0,0,113,192,0,0,108,90,16,0,0,0,0,0,10,0,15,16,0,0,0,0,0,10,0,15,16,0,0,0,0,0,10,0,15,8,254,11,37,254,107,91,113,4,16,0,38,0,0,0,35,13,128,1,0,34,13,128,1,0,35,0,0,1,0,34,0,0,1,0,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,38,0,0,0,38,0,0,0,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,88,201,1,0,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,38,0,0,0,88,0,0,0,0,35,13,128,0,0,34,13,128,0,0,38,0,0,0,38,0,0,0,16,0,0,0,0,0,10,0,105,35,12,128,2,0,34,12,128,2,0,35,12,128,4,0,34,12,128,4,0,35,12,128,3,0,34,12,128,3,0,58,0,0,255,255,255,255,255,3,255,255,255,255,255,3,0,1,0,3,1,0,0,0,0,109,90,38,0,0,0,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,152,1,38,0,0,0,15,80,15,128,95,2,0,0,81,15,128,95,2,0,0,0,0,80,255,0,83,2,0,0,81,255,0,83,2,0,0,0,0,82,0,0,83,0,0,0,0,15,80,15,128,98,2,0,0,81,15,128,98,2,0,0,0,0,80,255,0,87,2,0,0,81,255,0,87,2,0,0,0,0,82,0,0,83,0,0,0,0,15,80,15,128,95,2,0,0,81,15,128,95,2,0,0,0,0,80,255,0,91,2,0,0,81,255,0,91,2,0,0,0,0,82,0,0,83,0,0,0,0,15,20,9,9,254,20,11,9,254,20,10,9,254,10,40,254,11,39,254] as const;

export const STATS = { ops: 114, bytes: 613, labels: 24, unknownOps: 2, unresolvedSymbols: 29 } as const;
