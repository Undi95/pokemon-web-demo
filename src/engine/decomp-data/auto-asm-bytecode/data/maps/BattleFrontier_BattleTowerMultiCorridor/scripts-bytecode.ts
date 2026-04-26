// AUTO-GENERATED from data/maps/BattleFrontier_BattleTowerMultiCorridor/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=121, bytes=652, labels=20, unknownOps=0, unresolvedSymbols=20

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "BattleFrontier_BattleTowerMultiCorridor_MapScripts": 0,
  "BattleFrontier_BattleTowerMultiCorridor_OnTransition": 15,
  "BattleFrontier_BattleTowerMultiCorridor_EventScript_SetObjGfx": 60,
  "BattleFrontier_BattleTowerMultiCorridor_EventScript_SetPlayerGfxFemale": 96,
  "BattleFrontier_BattleTowerMultiCorridor_EventScript_SetLinkPlayerGfx": 101,
  "BattleFrontier_BattleTowerMultiCorridor_OnWarp": 106,
  "BattleFrontier_BattleTowerMultiCorridor_EventScript_SetUpObjects": 114,
  "BattleFrontier_BattleTowerMultiCorridor_OnFrame": 134,
  "BattleFrontier_BattleTowerMultiCorridor_EventScript_EnterCorridor": 142,
  "BattleFrontier_BattleTowerMultiCorridor_EventScript_WarpToBattleRoom": 444,
  "BattleFrontier_BattleTowerMultiCorridor_EventScript_WarpToNormalBattleRoom": 533,
  "BattleFrontier_BattleTowerMultiCorridor_EventScript_WarpToMultiBattleRoom": 558,
  "BattleFrontier_BattleTowerMultiCorridor_EventScript_WarpToLinkMultiBattleRoom": 583,
  "BattleFrontier_BattleTowerMultiCorridor_Movement_PlayerWalkToDoor": 608,
  "BattleFrontier_BattleTowerMultiCorridor_Movement_PartnerWalkToDoor": 616,
  "BattleFrontier_BattleTowerMultiCorridor_Movement_PlayerAttendantWalkToDoor": 624,
  "BattleFrontier_BattleTowerMultiCorridor_Movement_PartnerAttendantWalkToDoor": 633,
  "BattleFrontier_BattleTowerMultiCorridor_Movement_TrainerEnterDoor": 642,
  "BattleFrontier_BattleTowerMultiCorridor_Movement_AttendantEnterDoor": 647,
  "BattleFrontier_BattleTowerMultiCorridor_Movement_ExitElevator": 650,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [3,15,0,0,0,4,106,0,0,0,2,134,0,0,0,35,206,64,2,0,34,206,64,2,0,8,1,60,0,0,0,8,1,206,64,0,0,35,206,64,3,0,34,206,64,3,0,8,1,101,0,0,0,8,1,206,64,0,0,90,113,4,14,0,38,0,0,0,161,35,13,128,1,0,34,13,128,1,0,7,1,96,0,0,0,7,1,13,128,0,0,113,31,0,0,15,113,31,89,0,15,38,0,0,0,15,0,0,0,0,114,0,0,0,90,255,0,0,0,90,0,0,0,0,90,0,0,0,0,38,0,0,0,90,0,0,0,0,142,0,0,0,106,42,0,0,113,4,14,0,113,5,1,0,173,1,0,1,0,175,43,0,0,89,0,0,0,0,89,0,0,0,0,80,0,0,138,2,0,0,81,0,0,138,2,0,0,0,0,80,0,0,138,2,0,0,81,0,0,138,2,0,0,0,0,82,0,0,83,0,0,0,0,42,0,0,113,4,14,0,113,5,1,0,174,1,0,1,0,175,43,0,0,80,0,0,96,2,0,0,81,0,0,96,2,0,0,0,0,80,0,0,104,2,0,0,81,0,0,104,2,0,0,0,0,80,0,0,112,2,0,0,81,0,0,112,2,0,0,0,0,80,0,0,121,2,0,0,81,0,0,121,2,0,0,0,0,82,0,0,83,0,0,0,0,4,40,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,173,7,0,1,0,175,80,0,0,135,2,0,0,81,0,0,135,2,0,0,0,0,80,0,0,135,2,0,0,81,0,0,135,2,0,0,0,0,80,0,0,130,2,0,0,81,0,0,130,2,0,0,0,0,80,0,0,130,2,0,0,81,0,0,130,2,0,0,0,0,82,0,0,83,0,0,0,0,174,7,0,1,0,175,4,30,113,0,1,0,88,188,1,0,0,108,90,35,206,64,0,0,34,206,64,0,0,8,1,21,2,0,0,8,1,206,64,0,0,35,206,64,1,0,34,206,64,1,0,8,1,21,2,0,0,8,1,206,64,0,0,35,206,64,2,0,34,206,64,2,0,8,1,46,2,0,0,8,1,206,64,0,0,35,206,64,3,0,34,206,64,3,0,8,1,71,2,0,0,8,1,206,64,0,0,15,58,0,0,255,255,255,255,255,4,255,255,255,255,255,4,0,8,0,4,8,0,0,0,0,15,58,0,0,255,255,255,255,255,4,255,255,255,255,255,4,0,5,0,4,5,0,0,0,0,15,58,0,0,255,255,255,255,255,4,255,255,255,255,255,4,0,5,0,4,5,0,0,0,0,15,8,11,11,11,11,11,11,254,8,10,10,10,10,10,10,254,11,11,11,11,11,11,9,40,254,10,10,10,10,10,10,9,39,254,20,9,9,84,254,9,84,254,8,254] as const;

export const STATS = { ops: 121, bytes: 652, labels: 20, unknownOps: 0, unresolvedSymbols: 20 } as const;
