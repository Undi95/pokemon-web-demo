// AUTO-GENERATED from data/maps/SootopolisCity_MysteryEventsHouse_1F/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=114, bytes=581, labels=24, unknownOps=12, unresolvedSymbols=29

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "SootopolisCity_MysteryEventsHouse_1F_MapScripts": 0,
  "SootopolisCity_MysteryEventsHouse_1F_OnTransition": 10,
  "SootopolisCity_MysteryEventsHouse_1F_EventScript_SetTrainerVisitingLayout": 39,
  "SootopolisCity_MysteryEventsHouse_1F_EventScript_MoveOldManToDoor": 57,
  "SootopolisCity_MysteryEventsHouse_1F_OnFrame": 68,
  "SootopolisCity_MysteryEventsHouse_1F_EventScript_OldManCommentOnBattle": 92,
  "SootopolisCity_MysteryEventsHouse_1F_EventScript_BattleWonComment": 208,
  "SootopolisCity_MysteryEventsHouse_1F_EventScript_BattleLostComment": 216,
  "SootopolisCity_MysteryEventsHouse_1F_EventScript_BattleTiedComment": 224,
  "SootopolisCity_MysteryEventsHouse_1F_Movement_PlayerExitStairs": 232,
  "SootopolisCity_MysteryEventsHouse_1F_Movement_OldManWalkBehindPlayer": 232,
  "SootopolisCity_MysteryEventsHouse_1F_EventScript_OldMan": 232,
  "SootopolisCity_MysteryEventsHouse_1F_EventScript_InvalidVisitingTrainer": 272,
  "SootopolisCity_MysteryEventsHouse_1F_EventScript_TrainerVisiting": 282,
  "SootopolisCity_MysteryEventsHouse_1F_EventScript_DeclineBattle": 433,
  "SootopolisCity_MysteryEventsHouse_1F_EventScript_ChooseParty": 447,
  "SootopolisCity_MysteryEventsHouse_1F_EventScript_EnterBasementNorth": 461,
  "SootopolisCity_MysteryEventsHouse_1F_EventScript_EnterBasementEast": 501,
  "SootopolisCity_MysteryEventsHouse_1F_EventScript_EnterBasementWest": 541,
  "SootopolisCity_MysteryEventsHouse_1F_Movement_PlayerEnterBasementNorth": 581,
  "SootopolisCity_MysteryEventsHouse_1F_Movement_PlayerEnterBasementEast": 581,
  "SootopolisCity_MysteryEventsHouse_1F_Movement_PlayerEnterBasementWest": 581,
  "SootopolisCity_MysteryEventsHouse_1F_Movement_OldManMoveAsideLeft": 581,
  "SootopolisCity_MysteryEventsHouse_1F_Movement_OldManMoveAsideRight": 581,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [3,10,0,0,0,2,68,0,0,0,113,4,16,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,35,192,64,0,0,34,192,64,0,0,90,113,0,1,0,100,0,0,3,0,2,0,102,0,0,8,168,0,0,100,0,0,2,0,2,0,102,0,0,10,192,64,1,0,92,0,0,0,192,64,2,0,92,0,0,0,192,64,3,0,92,0,0,0,106,80,255,0,232,0,0,0,81,255,0,232,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,232,0,0,0,81,0,0,232,0,0,0,0,0,82,0,0,83,0,0,0,0,101,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,35,192,64,1,0,34,192,64,1,0,35,192,64,2,0,34,192,64,2,0,35,192,64,3,0,34,192,64,3,0,38,0,0,0,113,192,0,0,108,90,16,0,0,0,0,0,10,0,16,0,0,0,0,0,10,0,16,0,0,0,0,0,10,0,107,91,113,4,16,0,38,0,0,0,35,13,128,1,0,34,13,128,1,0,35,0,0,1,0,34,0,0,1,0,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,38,0,0,0,38,0,0,0,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,88,191,1,0,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,38,0,0,0,88,0,0,0,0,35,13,128,0,0,34,13,128,0,0,38,0,0,0,38,0,0,0,16,0,0,0,0,0,10,0,105,35,12,128,2,0,34,12,128,2,0,35,12,128,4,0,34,12,128,4,0,35,12,128,3,0,34,12,128,3,0,58,0,0,255,255,255,255,255,3,255,255,255,255,255,3,0,1,0,3,1,0,0,0,0,109,90,38,0,0,0,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,152,1,38,0,0,0,80,15,128,69,2,0,0,81,15,128,69,2,0,0,0,0,80,255,0,69,2,0,0,81,255,0,69,2,0,0,0,0,82,0,0,83,0,0,0,0,80,15,128,69,2,0,0,81,15,128,69,2,0,0,0,0,80,255,0,69,2,0,0,81,255,0,69,2,0,0,0,0,82,0,0,83,0,0,0,0,80,15,128,69,2,0,0,81,15,128,69,2,0,0,0,0,80,255,0,69,2,0,0,81,255,0,69,2,0,0,0,0,82,0,0,83,0,0,0,0] as const;

export const STATS = { ops: 114, bytes: 581, labels: 24, unknownOps: 12, unresolvedSymbols: 29 } as const;
