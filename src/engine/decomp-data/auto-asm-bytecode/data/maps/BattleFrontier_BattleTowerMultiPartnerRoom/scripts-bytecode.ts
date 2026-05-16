// AUTO-GENERATED from data/maps/BattleFrontier_BattleTowerMultiPartnerRoom/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-05-16
// Stats: ops=201, bytes=980, labels=35, unknownOps=0, unresolvedSymbols=17

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "BattleFrontier_BattleTowerMultiPartnerRoom_MapScripts": 0,
  "BattleFrontier_BattleTowerMultiPartnerRoom_OnResume": 20,
  "BattleFrontier_BattleTowerMultiPartnerRoom_OnTransition": 30,
  "BattleFrontier_BattleTowerMultiPartnerRoom_EventScript_ChosePartner": 73,
  "BattleFrontier_BattleTowerMultiPartnerRoom_OnWarp": 131,
  "BattleFrontier_BattleTowerMultiPartnerRoom_EventScript_TurnPlayerNorth": 139,
  "BattleFrontier_BattleTowerMultiPartnerRoom_OnFrame": 144,
  "BattleFrontier_BattleTowerMultiPartnerRoom_EventScript_ExitRoom": 160,
  "BattleFrontier_BattleTowerMultiPartnerRoom_EventScript_EnterRoom": 172,
  "BattleFrontier_BattleTowerMultiPartnerRoom_Movement_PlayerEnterRoom": 267,
  "BattleFrontier_BattleTowerMultiPartnerRoom_Movement_AttendantBlockExit": 269,
  "BattleFrontier_BattleTowerMultiPartnerRoom_EventScript_Attendant": 272,
  "BattleFrontier_BattleTowerMultiPartnerRoom_EventScript_QuitChallenge": 318,
  "BattleFrontier_BattleTowerMultiPartnerRoom_EventScript_EnterElevator": 348,
  "BattleFrontier_BattleTowerMultiPartnerRoom_EventScript_MoveToElevator": 424,
  "BattleFrontier_BattleTowerMultiPartnerRoom_EventScript_MoveToElevatorEast": 465,
  "BattleFrontier_BattleTowerMultiPartnerRoom_EventScript_MoveToElevatorWest": 506,
  "BattleFrontier_BattleTowerMultiPartnerRoom_Movement_PlayerEnterElevator": 547,
  "BattleFrontier_BattleTowerMultiPartnerRoom_Movement_PlayerEnterElevatorEast": 551,
  "BattleFrontier_BattleTowerMultiPartnerRoom_Movement_PlayerEneterElevatorWest": 555,
  "BattleFrontier_BattleTowerMultiPartnerRoom_Movement_AttendantEnterElevator": 559,
  "BattleFrontier_BattleTowerMultiPartnerRoom_EventScript_Partner1": 562,
  "BattleFrontier_BattleTowerMultiPartnerRoom_EventScript_TalkToPotentialPartner": 575,
  "BattleFrontier_BattleTowerMultiPartnerRoom_EventScript_RejectPartner": 804,
  "BattleFrontier_BattleTowerMultiPartnerRoom_EventScript_PartnerExit": 822,
  "BattleFrontier_BattleTowerMultiPartnerRoom_EventScript_PartnerExitSouth": 847,
  "BattleFrontier_BattleTowerMultiPartnerRoom_Movement_PartnerExit": 872,
  "BattleFrontier_BattleTowerMultiPartnerRoom_Movement_PartnerExitSouth": 880,
  "BattleFrontier_BattleTowerMultiPartnerRoom_EventScript_Partner2": 889,
  "BattleFrontier_BattleTowerMultiPartnerRoom_EventScript_Partner3": 902,
  "BattleFrontier_BattleTowerMultiPartnerRoom_EventScript_Partner4": 915,
  "BattleFrontier_BattleTowerMultiPartnerRoom_EventScript_Partner5": 928,
  "BattleFrontier_BattleTowerMultiPartnerRoom_EventScript_Partner6": 941,
  "BattleFrontier_BattleTowerMultiPartnerRoom_EventScript_Partner7": 954,
  "BattleFrontier_BattleTowerMultiPartnerRoom_EventScript_Partner8": 967,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [5,20,0,0,0,3,30,0,0,0,4,131,0,0,0,2,144,0,0,0,23,4,128,17,0,38,0,0,58,3,44,82,1,7,1,73,0,0,0,43,199,2,43,200,2,43,201,2,43,202,2,43,203,2,43,204,2,42,96,3,42,97,3,23,4,128,10,0,38,0,0,58,3,23,16,64,7,0,23,17,64,7,0,23,18,64,7,0,23,19,64,7,0,23,20,64,7,0,23,21,64,7,0,23,22,64,7,0,23,23,64,7,0,23,0,0,1,0,23,0,0,1,0,100,0,0,10,0,2,0,3,0,0,1,0,139,0,0,0,92,255,0,2,3,0,0,0,0,172,0,0,0,0,0,1,0,160,0,0,0,106,23,0,0,0,0,6,92,1,0,0,3,106,80,255,0,11,1,0,0,81,255,0,11,1,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,13,1,0,0,81,0,0,13,1,0,0,0,0,82,0,0,83,0,0,0,0,101,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,38,0,0,58,23,0,0,1,0,108,3,8,254,10,37,254,107,91,104,0,0,0,0,103,113,20,8,94,1,0,35,13,128,0,0,34,13,128,0,0,7,1,62,1,0,0,7,1,13,128,0,0,16,0,0,0,0,0,10,4,109,3,23,4,128,2,0,23,5,128,6,0,26,6,128,1,0,23,6,128,1,0,38,0,0,58,6,0,0,0,0,3,16,0,0,0,0,0,10,4,105,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,173,10,0,1,0,175,5,168,1,0,0,174,10,0,1,0,175,58,0,0,255,255,255,255,255,1,255,255,255,255,255,1,0,6,0,1,6,0,0,0,58,108,3,80,0,0,47,2,0,0,81,0,0,47,2,0,0,0,0,80,255,0,35,2,0,0,81,255,0,35,2,0,0,0,0,82,0,0,83,0,0,0,0,4,80,0,0,47,2,0,0,81,0,0,47,2,0,0,0,0,80,255,0,39,2,0,0,81,255,0,39,2,0,0,0,0,82,0,0,83,0,0,0,0,4,80,0,0,47,2,0,0,81,0,0,47,2,0,0,0,0,80,255,0,43,2,0,0,81,255,0,43,2,0,0,0,0,82,0,0,83,0,0,0,0,4,9,9,84,254,11,9,84,254,10,9,84,254,9,84,254,107,91,23,0,0,0,0,6,63,2,0,0,3,44,82,1,7,1,36,3,0,0,23,4,128,11,0,23,5,128,0,0,38,0,0,58,103,110,23,4,128,11,0,23,5,128,1,0,38,0,0,58,103,110,23,4,128,11,0,23,5,128,2,0,38,0,0,58,103,113,20,8,94,1,0,26,0,128,13,128,35,0,128,1,0,34,0,128,1,0,35,36,3,0,0,34,36,3,0,0,7,1,0,0,0,0,7,1,36,3,0,0,35,0,128,127,0,34,0,128,127,0,35,36,3,0,0,34,36,3,0,0,7,1,0,0,0,0,7,1,36,3,0,0,23,4,128,11,0,23,5,128,3,0,38,0,0,58,103,110,105,35,12,128,1,0,34,12,128,1,0,8,5,54,3,0,0,8,5,12,128,0,0,35,12,128,1,0,34,12,128,1,0,8,1,79,3,0,0,8,1,12,128,0,0,84,15,128,85,15,128,0,0,42,82,1,59,0,0,255,255,255,255,255,10,255,255,255,255,255,10,0,3,0,10,3,0,0,0,58,109,3,23,4,128,11,0,23,5,128,4,0,38,0,0,58,103,110,109,3,80,15,128,104,3,0,0,81,15,128,104,3,0,0,0,0,82,0,0,83,0,0,0,0,4,80,15,128,112,3,0,0,81,15,128,112,3,0,0,0,0,82,0,0,83,0,0,0,0,4,22,22,22,22,22,22,22,254,23,22,22,22,22,22,22,22,254,107,91,23,0,0,1,0,6,63,2,0,0,3,107,91,23,0,0,2,0,6,63,2,0,0,3,107,91,23,0,0,3,0,6,63,2,0,0,3,107,91,23,0,0,4,0,6,63,2,0,0,3,107,91,23,0,0,5,0,6,63,2,0,0,3,107,91,23,0,0,6,0,6,63,2,0,0,3,107,91,23,0,0,7,0,6,63,2,0,0,3] as const;

export const STATS = { ops: 201, bytes: 980, labels: 35, unknownOps: 0, unresolvedSymbols: 17 } as const;
