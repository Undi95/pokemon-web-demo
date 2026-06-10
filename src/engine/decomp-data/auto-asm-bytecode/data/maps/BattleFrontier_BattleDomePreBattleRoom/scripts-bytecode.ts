// AUTO-GENERATED from data/maps/BattleFrontier_BattleDomePreBattleRoom/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-06-10
// Stats: ops=190, bytes=2027, labels=39, unknownOps=0, unresolvedSymbols=88

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "BattleFrontier_BattleDomePreBattleRoom_MapScripts": 0,
  "BattleFrontier_BattleDomePreBattleRoom_OnWarp": 10,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_TurnPlayerNorth": 18,
  "BattleFrontier_BattleDomePreBattleRoom_OnFrame": 28,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_EnterRoom": 36,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_AskReadyForNextRound": 112,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_AskReadyForNextRoundNoRecord": 384,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_AskRecordBattle": 586,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_RecordBattle": 699,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_AskPauseChallenge": 709,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_AskRetireChallenge": 818,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_RetireChallenge": 931,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_PauseChallenge": 950,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_ShowOpponentInfo": 986,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_ShowTourneyTree": 1011,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_ShowRoundMessage": 1033,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_TourneyInRound1": 1181,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_TourneyInRound2": 1190,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_TourneyInSemifinals": 1199,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_TourneyInFinals": 1208,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_ContinueChallenge": 1217,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_ReadyForNextRoundMessage": 1436,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_ReadyForRound1": 1584,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_ReadyForRound2": 1590,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_ReadyForSemifinals": 1596,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_ReadyForFinals": 1602,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_ReadyForTuckerSilver": 1750,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_ReadyForTuckerGold": 1771,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_ReadyForTuckerSilverShort": 1792,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_ReadyForTuckerGoldShort": 1801,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_ReturnFromBattle": 1810,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_RoundCompleteMessage": 1871,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_Round1Complete": 1987,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_Round2Complete": 1996,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_SemifinalsComplete": 2005,
  "BattleFrontier_BattleDomePreBattleRoom_Movement_AttendantMoveAside": 2014,
  "BattleFrontier_BattleDomePreBattleRoom_Movement_PlayerEnter": 2017,
  "BattleFrontier_BattleDomePreBattleRoom_Movement_PlayerWalkToDoor": 2022,
  "BattleFrontier_BattleDomePreBattleRoom_Movement_PlayerEnterDoor": 2024,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [0,28,0,0,0,0,10,0,0,0,0,0,0,0,18,0,0,0,23,0,0,1,0,92,0,0,0,3,0,0,0,0,36,0,0,0,35,0,0,1,0,34,0,0,1,0,7,1,18,7,0,0,7,1,0,0,0,0,23,0,0,0,0,23,0,0,0,0,26,0,0,1,0,23,0,0,1,0,38,0,0,0,23,0,0,1,0,80,0,0,225,7,0,0,81,0,0,225,7,0,0,0,0,82,0,0,83,0,0,0,0,106,5,156,5,0,0,103,26,0,0,0,0,5,0,0,0,0,35,0,0,1,0,34,0,0,1,0,7,1,128,1,0,0,7,1,0,0,0,0,112,16,0,0,1,26,0,0,0,0,35,0,0,0,0,34,0,0,0,0,35,218,3,0,0,34,218,3,0,0,7,1,0,0,0,0,7,1,218,3,0,0,35,0,0,1,0,34,0,0,1,0,35,243,3,0,0,34,243,3,0,0,7,1,0,0,0,0,7,1,243,3,0,0,35,0,0,2,0,34,0,0,2,0,35,193,4,0,0,34,193,4,0,0,7,1,0,0,0,0,7,1,193,4,0,0,35,0,0,3,0,34,0,0,3,0,35,74,2,0,0,34,74,2,0,0,7,1,0,0,0,0,7,1,74,2,0,0,35,0,0,4,0,34,0,0,4,0,35,197,2,0,0,34,197,2,0,0,7,1,0,0,0,0,7,1,197,2,0,0,35,0,0,5,0,34,0,0,5,0,35,50,3,0,0,34,50,3,0,0,7,1,0,0,0,0,7,1,50,3,0,0,35,0,0,0,0,34,0,0,0,0,35,112,0,0,0,34,112,0,0,0,7,1,0,0,0,0,7,1,112,0,0,0,112,16,2,0,1,26,0,0,0,0,35,0,0,0,0,34,0,0,0,0,35,218,3,0,0,34,218,3,0,0,7,1,0,0,0,0,7,1,218,3,0,0,35,0,0,1,0,34,0,0,1,0,35,243,3,0,0,34,243,3,0,0,7,1,0,0,0,0,7,1,243,3,0,0,35,0,0,2,0,34,0,0,2,0,35,193,4,0,0,34,193,4,0,0,7,1,0,0,0,0,7,1,193,4,0,0,35,0,0,3,0,34,0,0,3,0,35,197,2,0,0,34,197,2,0,0,7,1,0,0,0,0,7,1,197,2,0,0,35,0,0,4,0,34,0,0,4,0,35,50,3,0,0,34,50,3,0,0,7,1,0,0,0,0,7,1,50,3,0,0,35,0,0,0,0,34,0,0,0,0,35,112,0,0,0,34,112,0,0,0,7,1,0,0,0,0,7,1,112,0,0,0,104,0,0,0,0,103,113,20,8,0,1,0,26,0,0,0,0,35,0,0,1,0,34,0,0,1,0,35,112,0,0,0,34,112,0,0,0,7,1,0,0,0,0,7,1,112,0,0,0,35,0,0,0,0,34,0,0,0,0,35,187,2,0,0,34,187,2,0,0,7,1,0,0,0,0,7,1,187,2,0,0,35,0,0,0,0,34,0,0,0,0,35,112,0,0,0,34,112,0,0,0,7,1,0,0,0,0,7,1,112,0,0,0,5,0,0,0,0,6,112,0,0,0,16,0,0,0,0,0,10,5,26,0,0,0,0,35,0,0,0,0,34,0,0,0,0,35,112,0,0,0,34,112,0,0,0,7,1,0,0,0,0,7,1,112,0,0,0,35,0,0,1,0,34,0,0,1,0,35,182,3,0,0,34,182,3,0,0,7,1,0,0,0,0,7,1,182,3,0,0,35,0,0,0,0,34,0,0,0,0,35,112,0,0,0,34,112,0,0,0,7,1,0,0,0,0,7,1,112,0,0,0,104,0,0,0,0,103,113,20,8,0,1,0,26,0,0,0,0,35,0,0,1,0,34,0,0,1,0,35,112,0,0,0,34,112,0,0,0,7,1,0,0,0,0,7,1,112,0,0,0,35,0,0,0,0,34,0,0,0,0,35,163,3,0,0,34,163,3,0,0,7,1,0,0,0,0,7,1,163,3,0,0,35,0,0,0,0,34,0,0,0,0,35,112,0,0,0,34,112,0,0,0,7,1,0,0,0,0,7,1,112,0,0,0,23,0,0,0,0,23,0,0,0,0,38,0,0,0,6,0,0,0,0,104,0,0,0,0,103,23,0,0,0,0,23,0,0,0,0,38,0,0,0,48,55,0,49,152,0,23,0,0,0,0,38,0,0,0,3,16,0,0,0,0,0,10,4,152,0,23,0,0,0,0,38,0,0,0,0,6,112,0,0,0,5,9,4,0,0,152,0,23,0,0,0,0,38,0,0,0,0,6,112,0,0,0,23,0,0,0,0,23,0,0,0,0,38,0,0,0,26,0,0,0,0,35,0,0,0,0,34,0,0,0,0,35,157,4,0,0,34,157,4,0,0,7,1,0,0,0,0,7,1,157,4,0,0,35,0,0,0,0,34,0,0,0,0,35,166,4,0,0,34,166,4,0,0,7,1,0,0,0,0,7,1,166,4,0,0,35,0,0,0,0,34,0,0,0,0,35,175,4,0,0,34,175,4,0,0,7,1,0,0,0,0,7,1,175,4,0,0,35,0,0,0,0,34,0,0,0,0,35,184,4,0,0,34,184,4,0,0,7,1,0,0,0,0,7,1,184,4,0,0,4,16,0,0,0,0,0,10,4,4,16,0,0,0,0,0,10,4,4,16,0,0,0,0,0,10,4,4,16,0,0,0,0,0,10,4,4,104,0,0,0,0,103,110,152,0,5,0,0,0,0,26,0,0,0,0,23,0,0,0,0,38,0,0,0,23,0,0,0,0,38,0,0,0,35,0,0,0,0,34,0,0,0,0,7,1,112,0,0,0,7,1,0,0,0,0,23,0,0,0,0,23,0,0,0,0,23,0,0,255,255,38,0,0,0,23,0,0,0,0,38,0,0,0,23,0,0,0,0,38,0,0,0,16,0,0,0,0,0,10,4,105,80,0,0,222,7,0,0,81,0,0,222,7,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,230,7,0,0,81,0,0,230,7,0,0,0,0,82,0,0,83,0,0,0,0,173,5,0,1,0,175,80,0,0,232,7,0,0,81,0,0,232,7,0,0,0,0,82,0,0,83,0,0,0,0,174,5,0,1,0,175,58,0,0,0,255,255,255,255,9,255,255,255,255,0,9,0,5,0,9,5,0,0,0,23,0,0,0,0,0,3,23,0,0,0,0,23,0,0,0,0,38,0,0,0,26,0,0,0,0,35,0,0,0,0,34,0,0,0,0,35,48,6,0,0,34,48,6,0,0,7,1,0,0,0,0,7,1,48,6,0,0,35,0,0,0,0,34,0,0,0,0,35,54,6,0,0,34,54,6,0,0,7,1,0,0,0,0,7,1,54,6,0,0,35,0,0,0,0,34,0,0,0,0,35,60,6,0,0,34,60,6,0,0,7,1,0,0,0,0,7,1,60,6,0,0,35,0,0,0,0,34,0,0,0,0,35,66,6,0,0,34,66,6,0,0,7,1,0,0,0,0,7,1,66,6,0,0,4,104,0,0,0,0,4,104,0,0,0,0,4,104,0,0,0,0,4,23,0,0,0,0,38,0,0,0,26,0,0,0,0,35,0,0,0,0,34,0,0,0,0,35,214,6,0,0,34,214,6,0,0,7,1,0,0,0,0,7,1,214,6,0,0,35,0,0,0,0,34,0,0,0,0,35,235,6,0,0,34,235,6,0,0,7,1,0,0,0,0,7,1,235,6,0,0,35,0,0,0,0,34,0,0,0,0,35,214,6,0,0,34,214,6,0,0,7,1,0,0,0,0,7,1,214,6,0,0,35,0,0,0,0,34,0,0,0,0,35,235,6,0,0,34,235,6,0,0,7,1,0,0,0,0,7,1,235,6,0,0,104,0,0,0,0,4,44,0,0,7,1,0,7,0,0,16,0,0,0,0,0,10,4,42,0,0,4,44,0,0,7,1,9,7,0,0,16,0,0,0,0,0,10,4,42,0,0,4,16,0,0,0,0,0,10,4,4,16,0,0,0,0,0,10,4,4,23,0,0,1,0,16,0,0,0,0,0,10,4,38,0,0,0,23,0,0,0,0,23,0,0,0,0,38,0,0,0,50,112,1,51,38,0,0,0,5,79,7,0,0,152,0,23,0,0,0,0,38,0,0,0,0,6,112,0,0,0,23,0,0,0,0,23,0,0,0,0,38,0,0,0,26,0,0,0,0,35,0,0,0,0,34,0,0,0,0,35,195,7,0,0,34,195,7,0,0,7,1,0,0,0,0,7,1,195,7,0,0,35,0,0,0,0,34,0,0,0,0,35,204,7,0,0,34,204,7,0,0,7,1,0,0,0,0,7,1,204,7,0,0,35,0,0,0,0,34,0,0,0,0,35,213,7,0,0,34,213,7,0,0,7,1,0,0,0,0,7,1,213,7,0,0,4,16,0,0,0,0,0,10,4,4,16,0,0,0,0,0,10,4,4,16,0,0,0,0,0,10,4,4,0,0,0,0,0,0,0,0,0,0,0,0,0] as const;

export const STATS = { ops: 190, bytes: 2027, labels: 39, unknownOps: 0, unresolvedSymbols: 88 } as const;
