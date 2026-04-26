// AUTO-GENERATED from data/maps/BattleFrontier_BattlePikeLobby/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=195, bytes=1628, labels=36, unknownOps=0, unresolvedSymbols=46

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "BattleFrontier_BattlePikeLobby_MapScripts": 0,
  "BattleFrontier_BattlePikeLobby_OnFrame": 10,
  "BattleFrontier_BattlePikeLobby_OnWarp": 42,
  "BattleFrontier_BattlePikeLobby_EventScript_TurnPlayerNorth": 50,
  "BattleFrontier_BattlePikeLobby_EventScript_GetChallengeStatus": 59,
  "BattleFrontier_BattlePikeLobby_EventScript_QuitWithoutSaving": 68,
  "BattleFrontier_BattlePikeLobby_EventScript_WonChallenge": 159,
  "BattleFrontier_BattlePikeLobby_EventScript_DefeatedQueen": 206,
  "BattleFrontier_BattlePikeLobby_EventScript_GiveBattlePoints": 217,
  "BattleFrontier_BattlePikeLobby_EventScript_LostChallenge": 340,
  "BattleFrontier_BattlePikeLobby_EventScript_Attendant": 446,
  "BattleFrontier_BattlePikeLobby_EventScript_AskTakeChallenge": 468,
  "BattleFrontier_BattlePikeLobby_EventScript_TryEnterChallenge": 614,
  "BattleFrontier_BattlePikeLobby_EventScript_SaveBeforeChallenge": 906,
  "BattleFrontier_BattlePikeLobby_EventScript_ExplainChallenge": 1136,
  "BattleFrontier_BattlePikeLobby_EventScript_NotEnoughValidMons": 1149,
  "BattleFrontier_BattlePikeLobby_EventScript_NotEnoughValidMonsLv50": 1218,
  "BattleFrontier_BattlePikeLobby_EventScript_NotEnoughValidMonsLvOpen": 1231,
  "BattleFrontier_BattlePikeLobby_EventScript_CancelChallengeSaveFailed": 1244,
  "BattleFrontier_BattlePikeLobby_EventScript_LoadPartyAndCancelChallenge": 1270,
  "BattleFrontier_BattlePikeLobby_EventScript_CancelChallenge": 1274,
  "BattleFrontier_BattlePikeLobby_EventScript_EndCancelChallenge": 1282,
  "BattleFrontier_BattlePikeLobby_EventScript_ShowResults": 1284,
  "BattleFrontier_BattlePikeLobby_EventScript_WalkToCorridor": 1308,
  "BattleFrontier_BattlePikeLobby_Movement_PlayerWalkToCorridor": 1349,
  "BattleFrontier_BattlePikeLobby_Movement_AttendantWalkToCorridor": 1350,
  "BattleFrontier_BattlePikeLobby_EventScript_Hiker": 1354,
  "BattleFrontier_BattlePikeLobby_EventScript_Twin": 1363,
  "BattleFrontier_BattlePikeLobby_EventScript_Beauty": 1372,
  "BattleFrontier_BattlePikeLobby_EventScript_RulesBoard": 1381,
  "BattleFrontier_BattlePikeLobby_EventScript_ReadRulesBoard": 1396,
  "BattleFrontier_BattlePikeLobby_EventScript_RulesPokenavBag": 1575,
  "BattleFrontier_BattlePikeLobby_EventScript_RulesHeldItems": 1589,
  "BattleFrontier_BattlePikeLobby_EventScript_RulesMonOrder": 1603,
  "BattleFrontier_BattlePikeLobby_EventScript_ExitRules": 1617,
  "BattleFrontier_BattlePike_EventScript_CloseCurtain": 1619,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [2,10,0,0,0,4,42,0,0,0,0,0,0,0,59,0,0,0,0,0,1,0,68,0,0,0,0,0,3,0,159,0,0,0,0,0,4,0,84,1,0,0,0,0,0,0,50,0,0,0,113,0,1,0,92,255,0,2,90,113,4,0,0,38,0,0,0,90,38,0,0,0,113,4,27,0,38,0,0,0,106,16,0,0,0,0,0,10,4,105,113,4,2,0,113,5,1,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,4,2,0,113,5,4,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,4,2,0,113,5,0,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,0,255,0,108,90,106,113,4,10,0,38,0,0,0,35,13,128,1,0,34,13,128,1,0,7,1,206,0,0,0,7,1,13,128,0,0,16,0,0,0,0,0,10,4,0,0,0,89,217,0,0,0,16,0,0,0,0,0,10,4,0,0,0,16,0,0,0,0,0,10,4,113,4,11,0,38,0,0,0,16,0,0,0,0,0,10,9,113,4,8,0,38,0,0,0,113,4,1,0,113,5,3,0,38,0,0,0,115,13,1,113,4,2,0,113,5,3,0,26,6,128,13,128,113,6,13,128,38,0,0,0,38,0,0,0,38,0,0,0,113,4,27,0,38,0,0,0,104,0,0,0,0,0,0,0,113,4,8,0,113,5,0,0,38,0,0,0,9,55,0,49,16,0,0,0,0,0,10,4,105,113,0,255,0,108,90,106,104,0,0,0,0,0,0,0,113,4,8,0,38,0,0,0,113,4,2,0,113,5,2,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,4,2,0,113,5,4,0,26,6,128,0,0,113,6,0,0,38,0,0,0,38,0,0,0,38,0,0,0,113,4,27,0,38,0,0,0,113,4,8,0,113,5,0,0,38,0,0,0,9,55,0,49,16,0,0,0,0,0,10,4,105,113,0,255,0,108,90,107,91,113,207,5,0,113,206,0,0,38,0,0,0,16,0,0,0,0,0,10,4,104,0,0,0,0,0,0,0,112,17,6,23,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,102,2,0,0,34,102,2,0,0,7,1,0,0,0,0,7,1,102,2,0,0,35,0,128,1,0,34,0,128,1,0,35,112,4,0,0,34,112,4,0,0,7,1,0,0,0,0,7,1,112,4,0,0,35,0,128,2,0,34,0,128,2,0,35,250,4,0,0,34,250,4,0,0,7,1,0,0,0,0,7,1,250,4,0,0,35,0,128,127,0,34,0,128,127,0,35,250,4,0,0,34,250,4,0,0,7,1,0,0,0,0,7,1,250,4,0,0,104,0,0,0,0,0,0,0,112,17,6,24,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,250,4,0,0,34,250,4,0,0,7,1,0,0,0,0,7,1,250,4,0,0,35,0,128,127,0,34,0,128,127,0,35,250,4,0,0,34,250,4,0,0,7,1,0,0,0,0,7,1,250,4,0,0,113,4,15,0,38,0,0,0,35,4,128,1,0,34,4,128,1,0,7,1,125,4,0,0,7,1,4,128,0,0,113,4,2,0,113,5,1,0,26,6,128,13,128,113,6,13,128,38,0,0,0,16,0,0,0,0,0,10,4,152,1,88,0,0,0,0,26,4,128,13,128,113,5,3,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,7,1,246,4,0,0,7,1,13,128,0,0,16,0,0,0,0,0,10,5,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,246,4,0,0,34,246,4,0,0,7,1,0,0,0,0,7,1,246,4,0,0,35,0,128,1,0,34,0,128,1,0,35,138,3,0,0,34,138,3,0,0,7,1,0,0,0,0,7,1,138,3,0,0,35,0,128,127,0,34,0,128,127,0,35,246,4,0,0,34,246,4,0,0,7,1,0,0,0,0,7,1,246,4,0,0,113,0,0,0,113,0,0,0,113,4,2,0,113,5,4,0,26,6,128,255,255,113,6,255,255,38,0,0,0,113,4,28,0,38,0,0,0,113,4,2,0,113,5,0,0,26,6,128,1,0,113,6,1,0,38,0,0,0,113,4,2,0,113,5,4,0,26,6,128,1,0,113,6,1,0,38,0,0,0,113,4,26,0,38,0,0,0,113,4,2,0,113,5,3,0,26,6,128,0,0,113,6,0,0,38,0,0,0,38,0,0,0,105,4,2,88,0,0,0,0,113,0,255,0,113,4,26,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,7,1,220,4,0,0,7,1,13,128,0,0,38,0,0,0,113,4,3,0,113,5,3,0,38,0,0,0,16,0,0,0,0,0,10,4,105,113,4,5,0,38,0,0,0,88,28,5,0,0,38,0,0,0,88,83,6,0,0,59,0,0,255,255,255,255,255,6,255,255,255,255,255,6,0,7,0,6,7,0,0,0,113,0,0,0,0,90,16,0,0,0,0,0,10,4,89,212,1,0,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,194,4,0,0,34,194,4,0,0,7,1,0,0,0,0,7,1,194,4,0,0,35,0,128,1,0,34,0,128,1,0,35,207,4,0,0,34,207,4,0,0,7,1,0,0,0,0,7,1,207,4,0,0,16,0,0,0,0,0,10,4,89,2,5,0,0,16,0,0,0,0,0,10,4,89,2,5,0,0,113,4,2,0,113,5,0,0,26,6,128,0,0,113,6,0,0,38,0,0,0,89,250,4,0,0,38,0,0,0,16,0,0,0,0,0,10,4,109,90,106,113,4,7,0,113,5,5,0,113,6,255,0,38,0,0,0,110,38,0,0,0,108,90,80,0,0,70,5,0,0,81,0,0,70,5,0,0,0,0,80,255,0,69,5,0,0,81,255,0,69,5,0,0,0,0,82,0,0,83,0,0,0,0,15,9,9,9,84,254,16,0,0,0,0,0,10,2,90,16,0,0,0,0,0,10,2,90,16,0,0,0,0,0,10,2,90,106,16,0,0,0,0,0,10,4,89,116,5,0,0,90,104,0,0,0,0,0,0,0,112,16,4,102,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,39,6,0,0,34,39,6,0,0,7,1,0,0,0,0,7,1,39,6,0,0,35,0,128,1,0,34,0,128,1,0,35,53,6,0,0,34,53,6,0,0,7,1,0,0,0,0,7,1,53,6,0,0,35,0,128,2,0,34,0,128,2,0,35,67,6,0,0,34,67,6,0,0,7,1,0,0,0,0,7,1,67,6,0,0,35,0,128,3,0,34,0,128,3,0,35,81,6,0,0,34,81,6,0,0,7,1,0,0,0,0,7,1,81,6,0,0,35,0,128,127,0,34,0,128,127,0,35,81,6,0,0,34,81,6,0,0,7,1,0,0,0,0,7,1,81,6,0,0,90,16,0,0,0,0,0,10,4,89,116,5,0,0,90,16,0,0,0,0,0,10,4,89,116,5,0,0,90,16,0,0,0,0,0,10,4,89,116,5,0,0,90,108,90,9,11,1,38,0,0,0,49,15] as const;

export const STATS = { ops: 195, bytes: 1628, labels: 36, unknownOps: 0, unresolvedSymbols: 46 } as const;
