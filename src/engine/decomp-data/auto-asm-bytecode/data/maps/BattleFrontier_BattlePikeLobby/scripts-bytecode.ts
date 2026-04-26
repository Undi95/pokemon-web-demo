// AUTO-GENERATED from data/maps/BattleFrontier_BattlePikeLobby/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=195, bytes=1036, labels=36, unknownOps=8, unresolvedSymbols=49

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "BattleFrontier_BattlePikeLobby_MapScripts": 0,
  "BattleFrontier_BattlePikeLobby_OnFrame": 10,
  "BattleFrontier_BattlePikeLobby_OnWarp": 42,
  "BattleFrontier_BattlePikeLobby_EventScript_TurnPlayerNorth": 50,
  "BattleFrontier_BattlePikeLobby_EventScript_GetChallengeStatus": 59,
  "BattleFrontier_BattlePikeLobby_EventScript_QuitWithoutSaving": 68,
  "BattleFrontier_BattlePikeLobby_EventScript_WonChallenge": 159,
  "BattleFrontier_BattlePikeLobby_EventScript_DefeatedQueen": 194,
  "BattleFrontier_BattlePikeLobby_EventScript_GiveBattlePoints": 205,
  "BattleFrontier_BattlePikeLobby_EventScript_LostChallenge": 328,
  "BattleFrontier_BattlePikeLobby_EventScript_Attendant": 434,
  "BattleFrontier_BattlePikeLobby_EventScript_AskTakeChallenge": 456,
  "BattleFrontier_BattlePikeLobby_EventScript_TryEnterChallenge": 469,
  "BattleFrontier_BattlePikeLobby_EventScript_SaveBeforeChallenge": 567,
  "BattleFrontier_BattlePikeLobby_EventScript_ExplainChallenge": 785,
  "BattleFrontier_BattlePikeLobby_EventScript_NotEnoughValidMons": 798,
  "BattleFrontier_BattlePikeLobby_EventScript_NotEnoughValidMonsLv50": 798,
  "BattleFrontier_BattlePikeLobby_EventScript_NotEnoughValidMonsLvOpen": 811,
  "BattleFrontier_BattlePikeLobby_EventScript_CancelChallengeSaveFailed": 824,
  "BattleFrontier_BattlePikeLobby_EventScript_LoadPartyAndCancelChallenge": 850,
  "BattleFrontier_BattlePikeLobby_EventScript_CancelChallenge": 854,
  "BattleFrontier_BattlePikeLobby_EventScript_EndCancelChallenge": 862,
  "BattleFrontier_BattlePikeLobby_EventScript_ShowResults": 864,
  "BattleFrontier_BattlePikeLobby_EventScript_WalkToCorridor": 888,
  "BattleFrontier_BattlePikeLobby_Movement_PlayerWalkToCorridor": 928,
  "BattleFrontier_BattlePikeLobby_Movement_AttendantWalkToCorridor": 928,
  "BattleFrontier_BattlePikeLobby_EventScript_Hiker": 928,
  "BattleFrontier_BattlePikeLobby_EventScript_Twin": 937,
  "BattleFrontier_BattlePikeLobby_EventScript_Beauty": 946,
  "BattleFrontier_BattlePikeLobby_EventScript_RulesBoard": 955,
  "BattleFrontier_BattlePikeLobby_EventScript_ReadRulesBoard": 970,
  "BattleFrontier_BattlePikeLobby_EventScript_RulesPokenavBag": 984,
  "BattleFrontier_BattlePikeLobby_EventScript_RulesHeldItems": 998,
  "BattleFrontier_BattlePikeLobby_EventScript_RulesMonOrder": 1012,
  "BattleFrontier_BattlePikeLobby_EventScript_ExitRules": 1026,
  "BattleFrontier_BattlePike_EventScript_CloseCurtain": 1028,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [2,10,0,0,0,4,42,0,0,0,0,0,0,0,59,0,0,0,0,0,1,0,68,0,0,0,0,0,3,0,159,0,0,0,0,0,4,0,72,1,0,0,0,0,0,0,50,0,0,0,113,0,1,0,92,255,0,2,90,113,4,0,0,38,0,0,0,90,38,0,0,0,113,4,27,0,38,0,0,0,106,16,0,0,0,0,0,10,0,105,113,4,2,0,113,5,1,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,4,2,0,113,5,4,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,4,2,0,113,5,0,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,0,255,0,108,90,106,113,4,10,0,38,0,0,0,35,13,128,1,0,34,13,128,1,0,16,0,0,0,0,0,10,0,0,0,0,89,205,0,0,0,16,0,0,0,0,0,10,0,0,0,0,16,0,0,0,0,0,10,0,113,4,11,0,38,0,0,0,16,0,0,0,0,0,10,0,113,4,8,0,38,0,0,0,113,4,1,0,113,5,3,0,38,0,0,0,115,13,1,113,4,2,0,113,5,3,0,26,6,128,13,128,113,6,13,128,38,0,0,0,38,0,0,0,38,0,0,0,113,4,27,0,38,0,0,0,104,0,0,0,0,0,0,0,113,4,8,0,113,5,0,0,38,0,0,0,9,55,0,49,16,0,0,0,0,0,10,0,105,113,0,255,0,108,90,106,104,0,0,0,0,0,0,0,113,4,8,0,38,0,0,0,113,4,2,0,113,5,2,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,4,2,0,113,5,4,0,26,6,128,0,0,113,6,0,0,38,0,0,0,38,0,0,0,38,0,0,0,113,4,27,0,38,0,0,0,113,4,8,0,113,5,0,0,38,0,0,0,9,55,0,49,16,0,0,0,0,0,10,0,105,113,0,255,0,108,90,107,91,113,207,5,0,113,206,0,0,38,0,0,0,16,0,0,0,0,0,10,0,104,0,0,0,0,0,0,0,112,17,6,23,0,104,0,0,0,0,0,0,0,112,17,6,24,0,113,4,15,0,38,0,0,0,35,4,128,1,0,34,4,128,1,0,113,4,2,0,113,5,1,0,26,6,128,13,128,113,6,13,128,38,0,0,0,16,0,0,0,0,0,10,0,152,1,88,0,0,0,0,26,4,128,13,128,113,5,3,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,113,0,0,0,113,0,0,0,113,4,2,0,113,5,4,0,26,6,128,255,255,113,6,255,255,38,0,0,0,113,4,28,0,38,0,0,0,113,4,2,0,113,5,0,0,26,6,128,1,0,113,6,1,0,38,0,0,0,113,4,2,0,113,5,4,0,26,6,128,1,0,113,6,1,0,38,0,0,0,113,4,26,0,38,0,0,0,113,4,2,0,113,5,3,0,26,6,128,0,0,113,6,0,0,38,0,0,0,38,0,0,0,105,4,2,88,0,0,0,0,113,0,255,0,113,4,26,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,38,0,0,0,113,4,3,0,113,5,3,0,38,0,0,0,16,0,0,0,0,0,10,0,105,113,4,5,0,38,0,0,0,88,120,3,0,0,38,0,0,0,88,4,4,0,0,59,0,0,255,255,255,255,255,6,255,255,255,255,255,6,0,7,0,6,7,0,0,0,113,0,0,0,0,90,16,0,0,0,0,0,10,0,89,200,1,0,0,16,0,0,0,0,0,10,0,89,94,3,0,0,16,0,0,0,0,0,10,0,89,94,3,0,0,113,4,2,0,113,5,0,0,26,6,128,0,0,113,6,0,0,38,0,0,0,89,86,3,0,0,38,0,0,0,16,0,0,0,0,0,10,0,109,90,106,113,4,7,0,113,5,5,0,113,6,255,0,38,0,0,0,110,38,0,0,0,108,90,80,0,0,160,3,0,0,81,0,0,160,3,0,0,0,0,80,255,0,160,3,0,0,81,255,0,160,3,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,106,16,0,0,0,0,0,10,0,89,202,3,0,0,90,104,0,0,0,0,0,0,0,112,16,4,102,0,90,16,0,0,0,0,0,10,0,89,202,3,0,0,90,16,0,0,0,0,0,10,0,89,202,3,0,0,90,16,0,0,0,0,0,10,0,89,202,3,0,0,90,108,90,9,11,1,38,0,0,0,49] as const;

export const STATS = { ops: 195, bytes: 1036, labels: 36, unknownOps: 8, unresolvedSymbols: 49 } as const;
