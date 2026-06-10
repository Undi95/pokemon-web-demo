// AUTO-GENERATED from data/maps/BattleFrontier_BattlePikeLobby/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-06-10
// Stats: ops=195, bytes=1688, labels=36, unknownOps=0, unresolvedSymbols=93

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "BattleFrontier_BattlePikeLobby_MapScripts": 0,
  "BattleFrontier_BattlePikeLobby_OnFrame": 10,
  "BattleFrontier_BattlePikeLobby_OnWarp": 42,
  "BattleFrontier_BattlePikeLobby_EventScript_TurnPlayerNorth": 50,
  "BattleFrontier_BattlePikeLobby_EventScript_GetChallengeStatus": 60,
  "BattleFrontier_BattlePikeLobby_EventScript_QuitWithoutSaving": 70,
  "BattleFrontier_BattlePikeLobby_EventScript_WonChallenge": 172,
  "BattleFrontier_BattlePikeLobby_EventScript_DefeatedQueen": 218,
  "BattleFrontier_BattlePikeLobby_EventScript_GiveBattlePoints": 227,
  "BattleFrontier_BattlePikeLobby_EventScript_LostChallenge": 361,
  "BattleFrontier_BattlePikeLobby_EventScript_Attendant": 476,
  "BattleFrontier_BattlePikeLobby_EventScript_AskTakeChallenge": 500,
  "BattleFrontier_BattlePikeLobby_EventScript_TryEnterChallenge": 644,
  "BattleFrontier_BattlePikeLobby_EventScript_SaveBeforeChallenge": 939,
  "BattleFrontier_BattlePikeLobby_EventScript_ExplainChallenge": 1192,
  "BattleFrontier_BattlePikeLobby_EventScript_NotEnoughValidMons": 1205,
  "BattleFrontier_BattlePikeLobby_EventScript_NotEnoughValidMonsLv50": 1274,
  "BattleFrontier_BattlePikeLobby_EventScript_NotEnoughValidMonsLvOpen": 1287,
  "BattleFrontier_BattlePikeLobby_EventScript_CancelChallengeSaveFailed": 1300,
  "BattleFrontier_BattlePikeLobby_EventScript_LoadPartyAndCancelChallenge": 1329,
  "BattleFrontier_BattlePikeLobby_EventScript_CancelChallenge": 1333,
  "BattleFrontier_BattlePikeLobby_EventScript_EndCancelChallenge": 1341,
  "BattleFrontier_BattlePikeLobby_EventScript_ShowResults": 1343,
  "BattleFrontier_BattlePikeLobby_EventScript_WalkToCorridor": 1370,
  "BattleFrontier_BattlePikeLobby_Movement_PlayerWalkToCorridor": 1411,
  "BattleFrontier_BattlePikeLobby_Movement_AttendantWalkToCorridor": 1412,
  "BattleFrontier_BattlePikeLobby_EventScript_Hiker": 1416,
  "BattleFrontier_BattlePikeLobby_EventScript_Twin": 1425,
  "BattleFrontier_BattlePikeLobby_EventScript_Beauty": 1434,
  "BattleFrontier_BattlePikeLobby_EventScript_RulesBoard": 1443,
  "BattleFrontier_BattlePikeLobby_EventScript_ReadRulesBoard": 1458,
  "BattleFrontier_BattlePikeLobby_EventScript_RulesPokenavBag": 1635,
  "BattleFrontier_BattlePikeLobby_EventScript_RulesHeldItems": 1649,
  "BattleFrontier_BattlePikeLobby_EventScript_RulesMonOrder": 1663,
  "BattleFrontier_BattlePikeLobby_EventScript_ExitRules": 1677,
  "BattleFrontier_BattlePike_EventScript_CloseCurtain": 1679,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [0,10,0,0,0,0,42,0,0,0,0,0,0,0,60,0,0,0,0,0,0,0,70,0,0,0,0,0,0,0,172,0,0,0,0,0,0,0,105,1,0,0,0,0,0,0,50,0,0,0,23,0,0,1,0,92,0,0,0,3,23,0,0,0,0,38,0,0,0,3,38,0,0,0,23,0,0,0,0,38,0,0,0,106,16,0,0,0,0,0,10,4,105,23,0,0,0,0,23,0,0,0,0,26,0,0,0,0,23,0,0,0,0,38,0,0,0,23,0,0,0,0,23,0,0,0,0,26,0,0,0,0,23,0,0,0,0,38,0,0,0,23,0,0,0,0,23,0,0,0,0,26,0,0,0,0,23,0,0,0,0,38,0,0,0,23,0,0,255,0,108,3,106,23,0,0,0,0,38,0,0,0,35,0,0,1,0,34,0,0,1,0,7,1,218,0,0,0,7,1,0,0,0,0,16,0,0,0,0,0,10,4,103,6,227,0,0,0,16,0,0,0,0,0,10,4,103,16,0,0,0,0,0,10,4,23,0,0,0,0,38,0,0,0,16,0,0,0,0,0,10,9,23,0,0,0,0,38,0,0,0,23,0,0,0,0,23,0,0,0,0,38,0,0,0,24,0,0,1,0,23,0,0,0,0,23,0,0,0,0,26,0,0,0,0,23,0,0,0,0,38,0,0,0,38,0,0,0,38,0,0,0,23,0,0,0,0,38,0,0,0,104,0,0,0,0,103,23,0,0,0,0,23,0,0,0,0,38,0,0,0,48,55,0,49,16,0,0,0,0,0,10,4,105,23,0,0,255,0,108,3,106,104,0,0,0,0,103,23,0,0,0,0,38,0,0,0,23,0,0,0,0,23,0,0,0,0,26,0,0,0,0,23,0,0,0,0,38,0,0,0,23,0,0,0,0,23,0,0,0,0,26,0,0,0,0,23,0,0,0,0,38,0,0,0,38,0,0,0,38,0,0,0,23,0,0,0,0,38,0,0,0,23,0,0,0,0,23,0,0,0,0,38,0,0,0,48,55,0,49,16,0,0,0,0,0,10,4,105,23,0,0,255,0,108,3,107,91,23,0,0,0,0,23,0,0,0,0,38,0,0,0,16,0,0,0,0,0,10,4,104,0,0,0,0,103,112,17,6,0,0,26,0,0,0,0,35,0,0,0,0,34,0,0,0,0,35,132,2,0,0,34,132,2,0,0,7,1,0,0,0,0,7,1,132,2,0,0,35,0,0,1,0,34,0,0,1,0,35,168,4,0,0,34,168,4,0,0,7,1,0,0,0,0,7,1,168,4,0,0,35,0,0,2,0,34,0,0,2,0,35,53,5,0,0,34,53,5,0,0,7,1,0,0,0,0,7,1,53,5,0,0,35,0,0,0,0,34,0,0,0,0,35,53,5,0,0,34,53,5,0,0,7,1,0,0,0,0,7,1,53,5,0,0,104,0,0,0,0,103,112,17,6,0,0,26,0,0,0,0,35,0,0,0,0,34,0,0,0,0,35,53,5,0,0,34,53,5,0,0,7,1,0,0,0,0,7,1,53,5,0,0,35,0,0,0,0,34,0,0,0,0,35,53,5,0,0,34,53,5,0,0,7,1,0,0,0,0,7,1,53,5,0,0,23,0,0,0,0,38,0,0,0,35,0,0,1,0,34,0,0,1,0,7,1,181,4,0,0,7,1,0,0,0,0,23,0,0,0,0,23,0,0,0,0,26,0,0,0,0,23,0,0,0,0,38,0,0,0,16,0,0,0,0,0,10,4,152,0,5,0,0,0,0,26,0,0,0,0,23,0,0,0,0,38,0,0,0,35,0,0,0,0,34,0,0,0,0,7,1,49,5,0,0,7,1,0,0,0,0,16,0,0,0,0,0,10,5,26,0,0,0,0,35,0,0,0,0,34,0,0,0,0,35,49,5,0,0,34,49,5,0,0,7,1,0,0,0,0,7,1,49,5,0,0,35,0,0,1,0,34,0,0,1,0,35,171,3,0,0,34,171,3,0,0,7,1,0,0,0,0,7,1,171,3,0,0,35,0,0,0,0,34,0,0,0,0,35,49,5,0,0,34,49,5,0,0,7,1,0,0,0,0,7,1,49,5,0,0,23,0,0,0,0,23,0,0,0,0,23,0,0,0,0,23,0,0,0,0,26,0,0,255,255,23,0,0,255,255,38,0,0,0,23,0,0,0,0,38,0,0,0,23,0,0,0,0,23,0,0,0,0,26,0,0,0,0,23,0,0,0,0,38,0,0,0,23,0,0,0,0,23,0,0,0,0,26,0,0,1,0,23,0,0,1,0,38,0,0,0,23,0,0,0,0,38,0,0,0,23,0,0,0,0,23,0,0,0,0,26,0,0,0,0,23,0,0,0,0,38,0,0,0,38,0,0,0,105,41,2,0,5,0,0,0,0,23,0,0,255,0,23,0,0,0,0,38,0,0,0,35,0,0,0,0,34,0,0,0,0,7,1,20,5,0,0,7,1,0,0,0,0,38,0,0,0,23,0,0,0,0,23,0,0,0,0,38,0,0,0,16,0,0,0,0,0,10,4,105,23,0,0,0,0,38,0,0,0,5,90,5,0,0,38,0,0,0,5,143,6,0,0,59,0,0,0,255,255,255,255,6,255,255,255,255,0,6,0,7,0,6,7,0,0,0,23,0,0,0,0,0,3,16,0,0,0,0,0,10,4,6,244,1,0,0,26,0,0,0,0,35,0,0,0,0,34,0,0,0,0,35,250,4,0,0,34,250,4,0,0,7,1,0,0,0,0,7,1,250,4,0,0,35,0,0,0,0,34,0,0,0,0,35,7,5,0,0,34,7,5,0,0,7,1,0,0,0,0,7,1,7,5,0,0,16,0,0,0,0,0,10,4,6,61,5,0,0,16,0,0,0,0,0,10,4,6,61,5,0,0,23,0,0,0,0,23,0,0,0,0,26,0,0,0,0,23,0,0,0,0,38,0,0,0,6,53,5,0,0,38,0,0,0,16,0,0,0,0,0,10,4,109,3,106,23,0,0,0,0,23,0,0,0,0,23,0,0,255,0,38,0,0,0,110,38,0,0,0,108,3,80,0,0,132,5,0,0,81,0,0,132,5,0,0,0,0,80,0,0,131,5,0,0,81,0,0,131,5,0,0,0,0,82,0,0,83,0,0,0,0,4,0,0,0,0,0,16,0,0,0,0,0,10,2,3,16,0,0,0,0,0,10,2,3,16,0,0,0,0,0,10,2,3,106,16,0,0,0,0,0,10,4,6,178,5,0,0,3,104,0,0,0,0,103,112,16,4,0,0,26,0,0,0,0,35,0,0,0,0,34,0,0,0,0,35,99,6,0,0,34,99,6,0,0,7,1,0,0,0,0,7,1,99,6,0,0,35,0,0,1,0,34,0,0,1,0,35,113,6,0,0,34,113,6,0,0,7,1,0,0,0,0,7,1,113,6,0,0,35,0,0,2,0,34,0,0,2,0,35,127,6,0,0,34,127,6,0,0,7,1,0,0,0,0,7,1,127,6,0,0,35,0,0,3,0,34,0,0,3,0,35,141,6,0,0,34,141,6,0,0,7,1,0,0,0,0,7,1,141,6,0,0,35,0,0,0,0,34,0,0,0,0,35,141,6,0,0,34,141,6,0,0,7,1,0,0,0,0,7,1,141,6,0,0,3,16,0,0,0,0,0,10,4,6,178,5,0,0,3,16,0,0,0,0,0,10,4,6,178,5,0,0,3,16,0,0,0,0,0,10,4,6,178,5,0,0,3,108,3,48,11,1,38,0,0,0,49,4] as const;

export const STATS = { ops: 195, bytes: 1688, labels: 36, unknownOps: 0, unresolvedSymbols: 93 } as const;
