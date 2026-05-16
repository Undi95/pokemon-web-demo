// AUTO-GENERATED from data/maps/BattleFrontier_BattleTowerMultiCorridor/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-05-16
// Stats: ops=121, bytes=662, labels=20, unknownOps=0, unresolvedSymbols=19

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "BattleFrontier_BattleTowerMultiCorridor_MapScripts": 0,
  "BattleFrontier_BattleTowerMultiCorridor_OnTransition": 15,
  "BattleFrontier_BattleTowerMultiCorridor_EventScript_SetObjGfx": 60,
  "BattleFrontier_BattleTowerMultiCorridor_EventScript_SetPlayerGfxFemale": 98,
  "BattleFrontier_BattleTowerMultiCorridor_EventScript_SetLinkPlayerGfx": 104,
  "BattleFrontier_BattleTowerMultiCorridor_OnWarp": 109,
  "BattleFrontier_BattleTowerMultiCorridor_EventScript_SetUpObjects": 117,
  "BattleFrontier_BattleTowerMultiCorridor_OnFrame": 137,
  "BattleFrontier_BattleTowerMultiCorridor_EventScript_EnterCorridor": 145,
  "BattleFrontier_BattleTowerMultiCorridor_EventScript_WarpToBattleRoom": 454,
  "BattleFrontier_BattleTowerMultiCorridor_EventScript_WarpToNormalBattleRoom": 543,
  "BattleFrontier_BattleTowerMultiCorridor_EventScript_WarpToMultiBattleRoom": 568,
  "BattleFrontier_BattleTowerMultiCorridor_EventScript_WarpToLinkMultiBattleRoom": 593,
  "BattleFrontier_BattleTowerMultiCorridor_Movement_PlayerWalkToDoor": 618,
  "BattleFrontier_BattleTowerMultiCorridor_Movement_PartnerWalkToDoor": 626,
  "BattleFrontier_BattleTowerMultiCorridor_Movement_PlayerAttendantWalkToDoor": 634,
  "BattleFrontier_BattleTowerMultiCorridor_Movement_PartnerAttendantWalkToDoor": 643,
  "BattleFrontier_BattleTowerMultiCorridor_Movement_TrainerEnterDoor": 652,
  "BattleFrontier_BattleTowerMultiCorridor_Movement_AttendantEnterDoor": 657,
  "BattleFrontier_BattleTowerMultiCorridor_Movement_ExitElevator": 660,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [3,15,0,0,0,4,109,0,0,0,2,137,0,0,0,35,206,64,2,0,34,206,64,2,0,8,1,60,0,0,0,8,1,206,64,0,0,35,206,64,3,0,34,206,64,3,0,8,1,104,0,0,0,8,1,206,64,0,0,3,23,4,128,14,0,38,0,0,58,161,35,13,128,1,0,34,13,128,1,0,7,1,98,0,0,0,7,1,13,128,0,0,23,31,64,0,0,4,23,31,64,89,0,4,38,0,0,58,4,0,0,0,0,117,0,0,0,90,255,0,0,0,90,0,0,0,0,90,0,0,0,0,38,0,0,58,3,0,0,0,0,145,0,0,0,106,42,0,0,23,4,128,14,0,23,5,128,1,0,173,1,0,1,0,175,43,0,0,89,0,0,0,0,89,0,0,0,0,80,0,0,148,2,0,0,81,0,0,148,2,0,0,0,0,80,0,0,148,2,0,0,81,0,0,148,2,0,0,0,0,82,0,0,83,0,0,0,0,42,0,0,23,4,128,14,0,23,5,128,1,0,174,1,0,1,0,175,43,0,0,80,0,0,106,2,0,0,81,0,0,106,2,0,0,0,0,80,0,0,114,2,0,0,81,0,0,114,2,0,0,0,0,80,0,0,122,2,0,0,81,0,0,122,2,0,0,0,0,80,0,0,131,2,0,0,81,0,0,131,2,0,0,0,0,82,0,0,83,0,0,0,0,41,40,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,173,7,0,1,0,175,80,0,0,145,2,0,0,81,0,0,145,2,0,0,0,0,80,0,0,145,2,0,0,81,0,0,145,2,0,0,0,0,80,0,0,140,2,0,0,81,0,0,140,2,0,0,0,0,80,0,0,140,2,0,0,81,0,0,140,2,0,0,0,0,82,0,0,83,0,0,0,0,174,7,0,1,0,175,41,30,0,23,0,0,1,0,5,198,1,0,0,108,3,35,206,64,0,0,34,206,64,0,0,8,1,31,2,0,0,8,1,206,64,0,0,35,206,64,1,0,34,206,64,1,0,8,1,31,2,0,0,8,1,206,64,0,0,35,206,64,2,0,34,206,64,2,0,8,1,56,2,0,0,8,1,206,64,0,0,35,206,64,3,0,34,206,64,3,0,8,1,81,2,0,0,8,1,206,64,0,0,4,58,0,0,255,255,255,255,255,4,255,255,255,255,255,4,0,8,0,4,8,0,0,0,58,4,58,0,0,255,255,255,255,255,4,255,255,255,255,255,4,0,5,0,4,5,0,0,0,58,4,58,0,0,255,255,255,255,255,4,255,255,255,255,255,4,0,5,0,4,5,0,0,0,58,4,8,11,11,11,11,11,11,254,8,10,10,10,10,10,10,254,11,11,11,11,11,11,9,40,254,10,10,10,10,10,10,9,39,254,20,9,9,84,254,9,84,254,8,254] as const;

export const STATS = { ops: 121, bytes: 662, labels: 20, unknownOps: 0, unresolvedSymbols: 19 } as const;
