// AUTO-GENERATED from data/maps/BattleFrontier_BattleTowerMultiPartnerRoom/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=201, bytes=810, labels=35, unknownOps=14, unresolvedSymbols=24

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "BattleFrontier_BattleTowerMultiPartnerRoom_MapScripts": 0,
  "BattleFrontier_BattleTowerMultiPartnerRoom_OnResume": 20,
  "BattleFrontier_BattleTowerMultiPartnerRoom_OnTransition": 29,
  "BattleFrontier_BattleTowerMultiPartnerRoom_EventScript_ChosePartner": 71,
  "BattleFrontier_BattleTowerMultiPartnerRoom_OnWarp": 119,
  "BattleFrontier_BattleTowerMultiPartnerRoom_EventScript_TurnPlayerNorth": 127,
  "BattleFrontier_BattleTowerMultiPartnerRoom_OnFrame": 132,
  "BattleFrontier_BattleTowerMultiPartnerRoom_EventScript_ExitRoom": 148,
  "BattleFrontier_BattleTowerMultiPartnerRoom_EventScript_EnterRoom": 159,
  "BattleFrontier_BattleTowerMultiPartnerRoom_Movement_PlayerEnterRoom": 253,
  "BattleFrontier_BattleTowerMultiPartnerRoom_Movement_AttendantBlockExit": 253,
  "BattleFrontier_BattleTowerMultiPartnerRoom_EventScript_Attendant": 253,
  "BattleFrontier_BattleTowerMultiPartnerRoom_EventScript_QuitChallenge": 289,
  "BattleFrontier_BattleTowerMultiPartnerRoom_EventScript_EnterElevator": 316,
  "BattleFrontier_BattleTowerMultiPartnerRoom_EventScript_MoveToElevator": 392,
  "BattleFrontier_BattleTowerMultiPartnerRoom_EventScript_MoveToElevatorEast": 432,
  "BattleFrontier_BattleTowerMultiPartnerRoom_EventScript_MoveToElevatorWest": 472,
  "BattleFrontier_BattleTowerMultiPartnerRoom_Movement_PlayerEnterElevator": 512,
  "BattleFrontier_BattleTowerMultiPartnerRoom_Movement_PlayerEnterElevatorEast": 512,
  "BattleFrontier_BattleTowerMultiPartnerRoom_Movement_PlayerEneterElevatorWest": 512,
  "BattleFrontier_BattleTowerMultiPartnerRoom_Movement_AttendantEnterElevator": 512,
  "BattleFrontier_BattleTowerMultiPartnerRoom_EventScript_Partner1": 512,
  "BattleFrontier_BattleTowerMultiPartnerRoom_EventScript_TalkToPotentialPartner": 524,
  "BattleFrontier_BattleTowerMultiPartnerRoom_EventScript_RejectPartner": 660,
  "BattleFrontier_BattleTowerMultiPartnerRoom_EventScript_PartnerExit": 678,
  "BattleFrontier_BattleTowerMultiPartnerRoom_EventScript_PartnerExitSouth": 702,
  "BattleFrontier_BattleTowerMultiPartnerRoom_Movement_PartnerExit": 726,
  "BattleFrontier_BattleTowerMultiPartnerRoom_Movement_PartnerExitSouth": 726,
  "BattleFrontier_BattleTowerMultiPartnerRoom_EventScript_Partner2": 726,
  "BattleFrontier_BattleTowerMultiPartnerRoom_EventScript_Partner3": 738,
  "BattleFrontier_BattleTowerMultiPartnerRoom_EventScript_Partner4": 750,
  "BattleFrontier_BattleTowerMultiPartnerRoom_EventScript_Partner5": 762,
  "BattleFrontier_BattleTowerMultiPartnerRoom_EventScript_Partner6": 774,
  "BattleFrontier_BattleTowerMultiPartnerRoom_EventScript_Partner7": 786,
  "BattleFrontier_BattleTowerMultiPartnerRoom_EventScript_Partner8": 798,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [5,20,0,0,0,3,29,0,0,0,4,119,0,0,0,2,132,0,0,0,113,4,17,0,38,0,0,0,90,44,82,1,7,1,71,0,0,0,43,199,2,43,200,2,43,201,2,43,202,2,43,203,2,43,204,2,42,96,3,42,97,3,113,4,10,0,38,0,0,0,90,113,16,7,0,113,17,7,0,113,18,7,0,113,19,7,0,113,20,7,0,113,21,7,0,113,22,7,0,113,23,7,0,113,0,1,0,113,0,1,0,100,0,0,10,0,2,0,90,0,0,1,0,127,0,0,0,92,255,0,2,90,0,0,0,0,159,0,0,0,0,0,1,0,148,0,0,0,106,113,0,0,0,89,60,1,0,0,90,106,80,255,0,253,0,0,0,81,255,0,253,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,253,0,0,0,81,0,0,253,0,0,0,0,0,82,0,0,83,0,0,0,0,101,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,38,0,0,0,113,0,1,0,108,90,107,91,104,0,0,0,0,0,0,0,113,20,8,94,1,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,109,90,113,4,2,0,113,5,6,0,26,6,128,1,0,113,6,1,0,38,0,0,0,89,0,0,0,0,90,16,0,0,0,0,0,10,0,105,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,173,10,0,1,0,175,88,136,1,0,0,174,10,0,1,0,175,58,0,0,255,255,255,255,255,1,255,255,255,255,255,1,0,6,0,1,6,0,0,0,0,108,90,80,0,0,0,2,0,0,81,0,0,0,2,0,0,0,0,80,255,0,0,2,0,0,81,255,0,0,2,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,2,0,0,81,0,0,0,2,0,0,0,0,80,255,0,0,2,0,0,81,255,0,0,2,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,2,0,0,81,0,0,0,2,0,0,0,0,80,255,0,0,2,0,0,81,255,0,0,2,0,0,0,0,82,0,0,83,0,0,0,0,107,91,113,0,0,0,89,12,2,0,0,90,44,82,1,7,1,148,2,0,0,113,4,11,0,113,5,0,0,38,0,0,0,0,0,0,110,113,4,11,0,113,5,1,0,38,0,0,0,0,0,0,110,113,4,11,0,113,5,2,0,38,0,0,0,0,0,0,113,20,8,94,1,0,113,4,11,0,113,5,3,0,38,0,0,0,0,0,0,110,105,35,12,128,1,0,34,12,128,1,0,35,12,128,1,0,34,12,128,1,0,84,15,128,85,15,128,0,0,42,82,1,59,0,0,255,255,255,255,255,10,255,255,255,255,255,10,0,3,0,10,3,0,0,0,0,109,90,113,4,11,0,113,5,4,0,38,0,0,0,0,0,0,110,109,90,80,15,128,214,2,0,0,81,15,128,214,2,0,0,0,0,82,0,0,83,0,0,0,0,80,15,128,214,2,0,0,81,15,128,214,2,0,0,0,0,82,0,0,83,0,0,0,0,107,91,113,0,1,0,89,12,2,0,0,90,107,91,113,0,2,0,89,12,2,0,0,90,107,91,113,0,3,0,89,12,2,0,0,90,107,91,113,0,4,0,89,12,2,0,0,90,107,91,113,0,5,0,89,12,2,0,0,90,107,91,113,0,6,0,89,12,2,0,0,90,107,91,113,0,7,0,89,12,2,0,0,90] as const;

export const STATS = { ops: 201, bytes: 810, labels: 35, unknownOps: 14, unresolvedSymbols: 24 } as const;
