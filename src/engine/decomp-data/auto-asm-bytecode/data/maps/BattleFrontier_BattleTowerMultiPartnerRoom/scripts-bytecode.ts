// AUTO-GENERATED from data/maps/BattleFrontier_BattleTowerMultiPartnerRoom/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-06-11
// Stats: ops=201, bytes=980, labels=35, unknownOps=0, unresolvedSymbols=72

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
export const BYTECODE: readonly number[] = [0,20,0,0,0,0,30,0,0,0,0,131,0,0,0,0,144,0,0,0,23,0,0,0,0,38,0,0,0,3,44,0,0,7,1,73,0,0,0,43,0,0,43,0,0,43,0,0,43,0,0,43,0,0,43,0,0,42,0,0,42,0,0,23,0,0,0,0,38,0,0,0,3,23,0,0,0,0,23,0,0,0,0,23,0,0,0,0,23,0,0,0,0,23,0,0,0,0,23,0,0,0,0,23,0,0,0,0,23,0,0,0,0,23,0,0,1,0,23,0,0,1,0,100,0,0,10,0,2,0,3,0,0,1,0,139,0,0,0,92,0,0,0,3,0,0,0,0,172,0,0,0,0,0,1,0,160,0,0,0,106,23,0,0,0,0,6,92,1,0,0,3,106,80,0,0,11,1,0,0,81,0,0,11,1,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,13,1,0,0,81,0,0,13,1,0,0,0,0,82,0,0,83,0,0,0,0,101,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,38,0,0,0,23,0,0,1,0,108,3,0,0,0,0,0,107,91,104,0,0,0,0,103,113,20,8,0,1,0,35,0,0,0,0,34,0,0,0,0,7,1,62,1,0,0,7,1,0,0,0,0,16,0,0,0,0,0,10,4,109,3,23,0,0,0,0,23,0,0,0,0,26,0,0,1,0,23,0,0,1,0,38,0,0,0,6,0,0,0,0,3,16,0,0,0,0,0,10,4,105,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,173,10,0,1,0,175,5,168,1,0,0,174,10,0,1,0,175,58,0,0,0,255,255,255,255,1,255,255,255,255,0,1,0,6,0,1,6,0,0,0,0,108,3,80,0,0,47,2,0,0,81,0,0,47,2,0,0,0,0,80,0,0,35,2,0,0,81,0,0,35,2,0,0,0,0,82,0,0,83,0,0,0,0,4,80,0,0,47,2,0,0,81,0,0,47,2,0,0,0,0,80,0,0,39,2,0,0,81,0,0,39,2,0,0,0,0,82,0,0,83,0,0,0,0,4,80,0,0,47,2,0,0,81,0,0,47,2,0,0,0,0,80,0,0,43,2,0,0,81,0,0,43,2,0,0,0,0,82,0,0,83,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,107,91,23,0,0,0,0,6,63,2,0,0,3,44,0,0,7,1,36,3,0,0,23,0,0,0,0,23,0,0,0,0,38,0,0,0,103,110,23,0,0,0,0,23,0,0,0,0,38,0,0,0,103,110,23,0,0,0,0,23,0,0,0,0,38,0,0,0,103,113,20,8,0,1,0,26,0,0,0,0,35,0,0,1,0,34,0,0,1,0,35,36,3,0,0,34,36,3,0,0,7,1,0,0,0,0,7,1,36,3,0,0,35,0,0,0,0,34,0,0,0,0,35,36,3,0,0,34,36,3,0,0,7,1,0,0,0,0,7,1,36,3,0,0,23,0,0,0,0,23,0,0,0,0,38,0,0,0,103,110,105,35,0,0,0,0,34,0,0,0,0,8,5,54,3,0,0,8,5,0,0,0,0,35,0,0,0,0,34,0,0,0,0,8,1,79,3,0,0,8,1,0,0,0,0,84,0,0,85,0,0,0,0,42,0,0,59,0,0,0,255,255,255,255,10,255,255,255,255,0,10,0,3,0,10,3,0,0,0,0,109,3,23,0,0,0,0,23,0,0,0,0,38,0,0,0,103,110,109,3,80,0,0,104,3,0,0,81,0,0,104,3,0,0,0,0,82,0,0,83,0,0,0,0,4,80,0,0,112,3,0,0,81,0,0,112,3,0,0,0,0,82,0,0,83,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,107,91,23,0,0,1,0,6,63,2,0,0,3,107,91,23,0,0,2,0,6,63,2,0,0,3,107,91,23,0,0,3,0,6,63,2,0,0,3,107,91,23,0,0,4,0,6,63,2,0,0,3,107,91,23,0,0,5,0,6,63,2,0,0,3,107,91,23,0,0,6,0,6,63,2,0,0,3,107,91,23,0,0,7,0,6,63,2,0,0,3] as const;

export const STATS = { ops: 201, bytes: 980, labels: 35, unknownOps: 0, unresolvedSymbols: 72 } as const;
