// AUTO-GENERATED from data/maps/SlateportCity_BattleTentLobby/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=194, bytes=938, labels=40, unknownOps=8, unresolvedSymbols=46

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "SlateportCity_BattleTentLobby_MapScripts": 0,
  "SlateportCity_BattleTentLobby_OnWarp": 10,
  "SlateportCity_BattleTentLobby_EventScript_TurnPlayerNorth": 18,
  "SlateportCity_BattleTentLobby_OnFrame": 27,
  "SlateportCity_BattleTentLobby_EventScript_GetChallengeStatus": 67,
  "SlateportCity_BattleTentLobby_EventScript_QuitWithoutSaving": 76,
  "SlateportCity_BattleTentLobby_EventScript_WonChallenge": 134,
  "SlateportCity_BattleTentLobby_EventScript_GivePrize": 188,
  "SlateportCity_BattleTentLobby_EventScript_NoRoomForPrize": 242,
  "SlateportCity_BattleTentLobby_EventScript_LostChallenge": 255,
  "SlateportCity_BattleTentLobby_EventScript_EndGivePrize": 301,
  "SlateportCity_BattleTentLobby_EventScript_ResumeChallenge": 316,
  "SlateportCity_BattleTentLobby_EventScript_Attendant": 375,
  "SlateportCity_BattleTentLobby_EventScript_AskEnterChallenge": 407,
  "SlateportCity_BattleTentLobby_EventScript_TryEnterChallenge": 420,
  "SlateportCity_BattleTentLobby_EventScript_SaveBeforeChallenge": 457,
  "SlateportCity_BattleTentLobby_EventScript_EnterChallenge": 558,
  "SlateportCity_BattleTentLobby_EventScript_WalkToDoor": 601,
  "SlateportCity_BattleTentLobby_Movement_AttendantWalkToDoor": 693,
  "SlateportCity_BattleTentLobby_Movement_AttendantEnterDoor": 693,
  "SlateportCity_BattleTentLobby_Movement_PlayerWalkToDoor": 693,
  "SlateportCity_BattleTentLobby_Movement_PlayerEnterDoor": 693,
  "SlateportCity_BattleTentLobby_EventScript_ExplainChallenge": 693,
  "SlateportCity_BattleTentLobby_EventScript_CancelChallengeSaveFailed": 706,
  "SlateportCity_BattleTentLobby_EventScript_LoadPartyCancelChallenge": 732,
  "SlateportCity_BattleTentLobby_EventScript_CancelChallenge": 736,
  "SlateportCity_BattleTentLobby_Movement_UnusedEnterDoor": 746,
  "SlateportCity_BattleTentLobby_EventScript_TormentGiver": 746,
  "SlateportCity_BattleTentLobby_EventScript_ReceivedTorment": 800,
  "SlateportCity_BattleTentLobby_EventScript_Man": 810,
  "SlateportCity_BattleTentLobby_EventScript_Girl": 819,
  "SlateportCity_BattleTentLobby_EventScript_Woman": 828,
  "SlateportCity_BattleTentLobby_EventScript_RulesBoard": 837,
  "SlateportCity_BattleTentLobby_EventScript_ReadRulesBoard": 852,
  "SlateportCity_BattleTentLobby_EventScript_RulesBasics": 866,
  "SlateportCity_BattleTentLobby_EventScript_RulesSwapPartner": 880,
  "SlateportCity_BattleTentLobby_EventScript_RulesSwapNumber": 894,
  "SlateportCity_BattleTentLobby_EventScript_RulesSwapNotes": 908,
  "SlateportCity_BattleTentLobby_EventScript_RulesMons": 922,
  "SlateportCity_BattleTentLobby_EventScript_ExitRules": 936,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [2,27,0,0,0,4,10,0,0,0,0,0,0,0,18,0,0,0,113,0,1,0,92,255,0,2,90,0,0,0,0,67,0,0,0,0,0,1,0,76,0,0,0,0,0,2,0,60,1,0,0,0,0,3,0,134,0,0,0,0,0,4,0,255,0,0,0,113,4,0,0,38,0,0,0,90,106,16,0,0,0,0,0,10,0,105,113,4,2,0,113,5,0,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,0,255,0,113,4,2,0,113,5,1,0,26,6,128,0,0,113,6,0,0,38,0,0,0,108,90,106,104,0,0,0,0,0,0,0,113,4,4,0,38,0,0,0,113,4,2,0,113,5,1,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,4,3,0,113,5,0,0,38,0,0,0,9,55,0,49,16,0,0,0,0,0,10,0,113,4,5,0,38,0,0,0,113,4,2,0,113,5,0,0,26,6,128,0,0,113,6,0,0,38,0,0,0,104,0,0,0,0,0,0,0,50,114,1,51,89,45,1,0,0,16,0,0,0,0,0,10,0,89,45,1,0,0,106,104,0,0,0,0,0,0,0,113,4,2,0,113,5,1,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,4,3,0,113,5,0,0,38,0,0,0,9,55,0,49,16,0,0,0,0,0,10,0,105,113,0,255,0,108,90,106,104,0,0,0,0,0,0,0,113,4,3,0,113,5,1,0,38,0,0,0,9,55,0,49,113,4,2,0,113,5,3,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,0,255,0,113,6,2,0,89,46,2,0,0,107,91,113,4,1,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,38,0,0,0,16,0,0,0,0,0,10,0,104,0,0,0,0,0,0,0,112,17,6,23,0,113,207,4,0,113,206,0,0,113,4,2,0,113,5,1,0,26,6,128,0,0,113,6,0,0,38,0,0,0,16,0,0,0,0,0,10,0,113,0,0,0,113,4,2,0,113,5,4,0,26,6,128,255,255,113,6,255,255,38,0,0,0,113,4,0,0,38,0,0,0,113,4,2,0,113,5,0,0,26,6,128,1,0,113,6,1,0,38,0,0,0,113,4,2,0,113,5,3,0,26,6,128,0,0,113,6,0,0,38,0,0,0,105,4,2,88,0,0,0,0,113,0,255,0,35,13,128,0,0,34,13,128,0,0,113,6,0,0,16,0,0,0,0,0,10,0,105,88,89,2,0,0,58,0,0,255,255,255,255,255,2,255,255,255,255,255,2,0,7,0,2,7,0,0,0,113,0,0,0,0,90,80,0,0,181,2,0,0,81,0,0,181,2,0,0,0,0,80,255,0,181,2,0,0,81,255,0,181,2,0,0,0,0,82,0,0,83,0,0,0,0,173,6,0,1,0,175,80,0,0,181,2,0,0,81,0,0,181,2,0,0,0,0,80,255,0,181,2,0,0,81,255,0,181,2,0,0,0,0,82,0,0,83,0,0,0,0,174,6,0,1,0,175,16,0,0,0,0,0,10,0,89,151,1,0,0,113,4,2,0,113,5,0,0,26,6,128,0,0,113,6,0,0,38,0,0,0,89,224,2,0,0,38,0,0,0,16,0,0,0,0,0,10,0,109,90,107,91,44,9,1,7,1,32,3,0,0,16,0,0,0,0,0,10,0,27,0,128,0,0,27,1,128,1,0,10,0,35,13,128,0,0,34,13,128,0,0,42,9,1,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,106,16,0,0,0,0,0,10,0,89,84,3,0,0,90,104,0,0,0,0,0,0,0,112,17,0,111,0,90,16,0,0,0,0,0,10,0,89,84,3,0,0,90,16,0,0,0,0,0,10,0,89,84,3,0,0,90,16,0,0,0,0,0,10,0,89,84,3,0,0,90,16,0,0,0,0,0,10,0,89,84,3,0,0,90,16,0,0,0,0,0,10,0,89,84,3,0,0,90,108,90] as const;

export const STATS = { ops: 194, bytes: 938, labels: 40, unknownOps: 8, unresolvedSymbols: 46 } as const;
