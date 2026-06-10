// AUTO-GENERATED from data/maps/SlateportCity_BattleTentLobby/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-06-10
// Stats: ops=194, bytes=1539, labels=40, unknownOps=0, unresolvedSymbols=80

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "SlateportCity_BattleTentLobby_MapScripts": 0,
  "SlateportCity_BattleTentLobby_OnWarp": 10,
  "SlateportCity_BattleTentLobby_EventScript_TurnPlayerNorth": 18,
  "SlateportCity_BattleTentLobby_OnFrame": 28,
  "SlateportCity_BattleTentLobby_EventScript_GetChallengeStatus": 68,
  "SlateportCity_BattleTentLobby_EventScript_QuitWithoutSaving": 78,
  "SlateportCity_BattleTentLobby_EventScript_WonChallenge": 143,
  "SlateportCity_BattleTentLobby_EventScript_GivePrize": 201,
  "SlateportCity_BattleTentLobby_EventScript_NoRoomForPrize": 294,
  "SlateportCity_BattleTentLobby_EventScript_LostChallenge": 307,
  "SlateportCity_BattleTentLobby_EventScript_EndGivePrize": 356,
  "SlateportCity_BattleTentLobby_EventScript_ResumeChallenge": 372,
  "SlateportCity_BattleTentLobby_EventScript_Attendant": 436,
  "SlateportCity_BattleTentLobby_EventScript_AskEnterChallenge": 481,
  "SlateportCity_BattleTentLobby_EventScript_TryEnterChallenge": 625,
  "SlateportCity_BattleTentLobby_EventScript_SaveBeforeChallenge": 768,
  "SlateportCity_BattleTentLobby_EventScript_EnterChallenge": 895,
  "SlateportCity_BattleTentLobby_EventScript_WalkToDoor": 939,
  "SlateportCity_BattleTentLobby_Movement_AttendantWalkToDoor": 1032,
  "SlateportCity_BattleTentLobby_Movement_AttendantEnterDoor": 1036,
  "SlateportCity_BattleTentLobby_Movement_PlayerWalkToDoor": 1039,
  "SlateportCity_BattleTentLobby_Movement_PlayerEnterDoor": 1043,
  "SlateportCity_BattleTentLobby_EventScript_ExplainChallenge": 1047,
  "SlateportCity_BattleTentLobby_EventScript_CancelChallengeSaveFailed": 1060,
  "SlateportCity_BattleTentLobby_EventScript_LoadPartyCancelChallenge": 1089,
  "SlateportCity_BattleTentLobby_EventScript_CancelChallenge": 1093,
  "SlateportCity_BattleTentLobby_Movement_UnusedEnterDoor": 1103,
  "SlateportCity_BattleTentLobby_EventScript_TormentGiver": 1108,
  "SlateportCity_BattleTentLobby_EventScript_ReceivedTorment": 1174,
  "SlateportCity_BattleTentLobby_EventScript_Man": 1184,
  "SlateportCity_BattleTentLobby_EventScript_Girl": 1193,
  "SlateportCity_BattleTentLobby_EventScript_Woman": 1202,
  "SlateportCity_BattleTentLobby_EventScript_RulesBoard": 1211,
  "SlateportCity_BattleTentLobby_EventScript_ReadRulesBoard": 1226,
  "SlateportCity_BattleTentLobby_EventScript_RulesBasics": 1467,
  "SlateportCity_BattleTentLobby_EventScript_RulesSwapPartner": 1481,
  "SlateportCity_BattleTentLobby_EventScript_RulesSwapNumber": 1495,
  "SlateportCity_BattleTentLobby_EventScript_RulesSwapNotes": 1509,
  "SlateportCity_BattleTentLobby_EventScript_RulesMons": 1523,
  "SlateportCity_BattleTentLobby_EventScript_ExitRules": 1537,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [0,28,0,0,0,0,10,0,0,0,0,0,0,0,18,0,0,0,23,0,0,1,0,92,0,0,0,3,0,0,0,0,68,0,0,0,0,0,0,0,78,0,0,0,0,0,0,0,116,1,0,0,0,0,0,0,143,0,0,0,0,0,0,0,51,1,0,0,23,0,0,0,0,38,0,0,0,3,106,16,0,0,0,0,0,10,4,105,23,0,0,0,0,23,0,0,0,0,26,0,0,0,0,23,0,0,0,0,38,0,0,0,23,0,0,255,0,23,0,0,0,0,23,0,0,0,0,26,0,0,0,0,23,0,0,0,0,38,0,0,0,108,3,106,104,0,0,0,0,103,23,0,0,0,0,38,0,0,0,23,0,0,0,0,23,0,0,0,0,26,0,0,0,0,23,0,0,0,0,38,0,0,0,23,0,0,0,0,23,0,0,0,0,38,0,0,0,48,0,0,49,16,0,0,0,0,0,10,4,23,0,0,0,0,38,0,0,0,26,0,0,0,0,35,0,0,0,0,34,0,0,0,0,35,38,1,0,0,34,38,1,0,0,7,1,0,0,0,0,7,1,38,1,0,0,23,0,0,0,0,23,0,0,0,0,26,0,0,0,0,23,0,0,0,0,38,0,0,0,104,0,0,0,0,103,50,0,0,51,6,100,1,0,0,16,0,0,0,0,0,10,4,6,100,1,0,0,106,104,0,0,0,0,103,23,0,0,0,0,23,0,0,0,0,26,0,0,0,0,23,0,0,0,0,38,0,0,0,23,0,0,0,0,23,0,0,0,0,38,0,0,0,48,0,0,49,16,0,0,0,0,0,10,4,105,23,0,0,255,0,108,3,106,104,0,0,0,0,103,23,0,0,0,0,23,0,0,0,0,38,0,0,0,48,0,0,49,23,0,0,0,0,23,0,0,0,0,26,0,0,0,0,23,0,0,0,0,38,0,0,0,23,0,0,255,0,23,0,0,2,0,6,127,3,0,0,107,91,23,0,0,0,0,38,0,0,0,35,0,0,0,0,34,0,0,0,0,7,5,201,0,0,0,7,5,0,0,0,0,38,0,0,0,16,0,0,0,0,0,10,4,104,0,0,0,0,103,112,17,6,0,0,26,0,0,0,0,35,0,0,0,0,34,0,0,0,0,35,113,2,0,0,34,113,2,0,0,7,1,0,0,0,0,7,1,113,2,0,0,35,0,0,1,0,34,0,0,1,0,35,23,4,0,0,34,23,4,0,0,7,1,0,0,0,0,7,1,23,4,0,0,35,0,0,2,0,34,0,0,2,0,35,69,4,0,0,34,69,4,0,0,7,1,0,0,0,0,7,1,69,4,0,0,35,0,0,0,0,34,0,0,0,0,35,69,4,0,0,34,69,4,0,0,7,1,0,0,0,0,7,1,69,4,0,0,23,0,0,0,0,23,0,0,0,0,23,0,0,0,0,23,0,0,0,0,26,0,0,0,0,23,0,0,0,0,38,0,0,0,16,0,0,0,0,0,10,5,26,0,0,0,0,35,0,0,0,0,34,0,0,0,0,35,65,4,0,0,34,65,4,0,0,7,1,0,0,0,0,7,1,65,4,0,0,35,0,0,1,0,34,0,0,1,0,35,0,3,0,0,34,0,3,0,0,7,1,0,0,0,0,7,1,0,3,0,0,35,0,0,0,0,34,0,0,0,0,35,65,4,0,0,34,65,4,0,0,7,1,0,0,0,0,7,1,65,4,0,0,23,0,0,0,0,23,0,0,0,0,23,0,0,0,0,26,0,0,255,255,23,0,0,255,255,38,0,0,0,23,0,0,0,0,38,0,0,0,23,0,0,0,0,23,0,0,0,0,26,0,0,0,0,23,0,0,0,0,38,0,0,0,23,0,0,0,0,23,0,0,0,0,26,0,0,0,0,23,0,0,0,0,38,0,0,0,105,41,2,0,5,0,0,0,0,23,0,0,255,0,35,0,0,0,0,34,0,0,0,0,7,1,36,4,0,0,7,1,0,0,0,0,23,0,0,0,0,16,0,0,0,0,0,10,4,105,5,171,3,0,0,58,0,0,0,255,255,255,255,2,255,255,255,255,0,2,0,7,0,2,7,0,0,0,23,0,0,0,0,0,3,80,0,0,8,4,0,0,81,0,0,8,4,0,0,0,0,80,0,0,15,4,0,0,81,0,0,15,4,0,0,0,0,82,0,0,83,0,0,0,0,173,6,0,1,0,175,80,0,0,12,4,0,0,81,0,0,12,4,0,0,0,0,80,0,0,19,4,0,0,81,0,0,19,4,0,0,0,0,82,0,0,83,0,0,0,0,174,6,0,1,0,175,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,0,0,10,4,6,225,1,0,0,23,0,0,0,0,23,0,0,0,0,26,0,0,0,0,23,0,0,0,0,38,0,0,0,6,69,4,0,0,38,0,0,0,16,0,0,0,0,0,10,4,109,3,0,0,0,0,0,107,91,44,0,0,7,1,150,4,0,0,16,0,0,0,0,0,10,4,27,0,0,0,0,27,0,0,1,0,10,0,35,0,0,0,0,34,0,0,0,0,7,1,0,0,0,0,7,1,0,0,0,0,42,0,0,16,0,0,0,0,0,10,4,109,3,16,0,0,0,0,0,10,4,109,3,16,0,0,0,0,0,10,2,3,16,0,0,0,0,0,10,2,3,16,0,0,0,0,0,10,2,3,106,16,0,0,0,0,0,10,4,6,202,4,0,0,3,104,0,0,0,0,103,112,17,0,0,0,26,0,0,0,0,35,0,0,0,0,34,0,0,0,0,35,187,5,0,0,34,187,5,0,0,7,1,0,0,0,0,7,1,187,5,0,0,35,0,0,1,0,34,0,0,1,0,35,201,5,0,0,34,201,5,0,0,7,1,0,0,0,0,7,1,201,5,0,0,35,0,0,2,0,34,0,0,2,0,35,215,5,0,0,34,215,5,0,0,7,1,0,0,0,0,7,1,215,5,0,0,35,0,0,3,0,34,0,0,3,0,35,229,5,0,0,34,229,5,0,0,7,1,0,0,0,0,7,1,229,5,0,0,35,0,0,4,0,34,0,0,4,0,35,243,5,0,0,34,243,5,0,0,7,1,0,0,0,0,7,1,243,5,0,0,35,0,0,5,0,34,0,0,5,0,35,1,6,0,0,34,1,6,0,0,7,1,0,0,0,0,7,1,1,6,0,0,35,0,0,0,0,34,0,0,0,0,35,1,6,0,0,34,1,6,0,0,7,1,0,0,0,0,7,1,1,6,0,0,3,16,0,0,0,0,0,10,4,6,202,4,0,0,3,16,0,0,0,0,0,10,4,6,202,4,0,0,3,16,0,0,0,0,0,10,4,6,202,4,0,0,3,16,0,0,0,0,0,10,4,6,202,4,0,0,3,16,0,0,0,0,0,10,4,6,202,4,0,0,3,108,3] as const;

export const STATS = { ops: 194, bytes: 1539, labels: 40, unknownOps: 0, unresolvedSymbols: 80 } as const;
