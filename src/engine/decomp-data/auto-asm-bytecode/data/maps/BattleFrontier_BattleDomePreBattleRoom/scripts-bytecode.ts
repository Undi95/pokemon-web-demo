// AUTO-GENERATED from data/maps/BattleFrontier_BattleDomePreBattleRoom/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=190, bytes=1526, labels=39, unknownOps=2, unresolvedSymbols=47

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "BattleFrontier_BattleDomePreBattleRoom_MapScripts": 0,
  "BattleFrontier_BattleDomePreBattleRoom_OnWarp": 10,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_TurnPlayerNorth": 18,
  "BattleFrontier_BattleDomePreBattleRoom_OnFrame": 27,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_EnterRoom": 35,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_AskReadyForNextRound": 95,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_AskReadyForNextRoundNoRecord": 273,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_AskRecordBattle": 403,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_RecordBattle": 482,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_AskPauseChallenge": 492,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_AskRetireChallenge": 565,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_RetireChallenge": 644,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_PauseChallenge": 661,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_ShowOpponentInfo": 696,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_ShowTourneyTree": 720,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_ShowRoundMessage": 741,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_TourneyInRound1": 839,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_TourneyInRound2": 848,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_TourneyInSemifinals": 857,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_TourneyInFinals": 866,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_ContinueChallenge": 875,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_ReadyForNextRoundMessage": 1076,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_ReadyForRound1": 1174,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_ReadyForRound2": 1180,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_ReadyForSemifinals": 1186,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_ReadyForFinals": 1192,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_ReadyForTuckerSilver": 1291,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_ReadyForTuckerGold": 1312,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_ReadyForTuckerSilverShort": 1333,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_ReadyForTuckerGoldShort": 1342,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_ReturnFromBattle": 1351,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_RoundCompleteMessage": 1408,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_Round1Complete": 1486,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_Round2Complete": 1495,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_SemifinalsComplete": 1504,
  "BattleFrontier_BattleDomePreBattleRoom_Movement_AttendantMoveAside": 1513,
  "BattleFrontier_BattleDomePreBattleRoom_Movement_PlayerEnter": 1516,
  "BattleFrontier_BattleDomePreBattleRoom_Movement_PlayerWalkToDoor": 1521,
  "BattleFrontier_BattleDomePreBattleRoom_Movement_PlayerEnterDoor": 1523,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [2,27,0,0,0,4,10,0,0,0,0,0,0,0,18,0,0,0,113,0,1,0,92,255,0,2,90,0,0,0,0,35,0,0,0,35,6,128,1,0,34,6,128,1,0,113,4,2,0,113,5,6,0,26,6,128,1,0,113,6,1,0,38,0,0,0,113,0,1,0,80,255,0,236,5,0,0,81,255,0,236,5,0,0,0,0,82,0,0,83,0,0,0,0,106,88,52,4,0,0,0,0,0,26,0,128,13,128,88,0,0,0,0,35,13,128,1,0,34,13,128,1,0,112,16,0,73,1,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,184,2,0,0,34,184,2,0,0,35,0,128,1,0,34,0,128,1,0,35,208,2,0,0,34,208,2,0,0,35,0,128,2,0,34,0,128,2,0,35,107,3,0,0,34,107,3,0,0,35,0,128,3,0,34,0,128,3,0,35,147,1,0,0,34,147,1,0,0,35,0,128,4,0,34,0,128,4,0,35,236,1,0,0,34,236,1,0,0,35,0,128,5,0,34,0,128,5,0,35,53,2,0,0,34,53,2,0,0,35,0,128,127,0,34,0,128,127,0,35,95,0,0,0,34,95,0,0,0,112,16,2,107,1,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,184,2,0,0,34,184,2,0,0,35,0,128,1,0,34,0,128,1,0,35,208,2,0,0,34,208,2,0,0,35,0,128,2,0,34,0,128,2,0,35,107,3,0,0,34,107,3,0,0,35,0,128,3,0,34,0,128,3,0,35,236,1,0,0,34,236,1,0,0,35,0,128,4,0,34,0,128,4,0,35,53,2,0,0,34,53,2,0,0,35,0,128,127,0,34,0,128,127,0,35,95,0,0,0,34,95,0,0,0,104,0,0,0,0,0,0,0,113,20,8,94,1,0,26,0,128,13,128,35,0,128,1,0,34,0,128,1,0,35,95,0,0,0,34,95,0,0,0,35,0,128,0,0,34,0,128,0,0,35,226,1,0,0,34,226,1,0,0,35,0,128,127,0,34,0,128,127,0,35,95,0,0,0,34,95,0,0,0,88,0,0,0,0,89,95,0,0,0,16,0,0,0,0,0,10,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,95,0,0,0,34,95,0,0,0,35,0,128,0,0,34,0,128,0,0,35,149,2,0,0,34,149,2,0,0,35,0,128,127,0,34,0,128,127,0,35,95,0,0,0,34,95,0,0,0,104,0,0,0,0,0,0,0,113,20,8,94,1,0,26,0,128,13,128,35,0,128,1,0,34,0,128,1,0,35,95,0,0,0,34,95,0,0,0,35,0,128,0,0,34,0,128,0,0,35,132,2,0,0,34,132,2,0,0,35,0,128,127,0,34,0,128,127,0,35,95,0,0,0,34,95,0,0,0,113,4,12,0,113,5,9,0,38,0,0,0,89,0,0,0,0,104,0,0,0,0,0,0,0,113,4,13,0,113,5,2,0,38,0,0,0,9,55,0,49,152,1,113,4,4,0,38,0,0,0,90,16,0,0,0,0,0,10,0,152,1,113,4,6,0,38,0,0,0,0,89,95,0,0,0,88,229,2,0,0,152,1,113,4,7,0,38,0,0,0,0,89,95,0,0,0,113,4,1,0,113,5,2,0,38,0,0,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,71,3,0,0,34,71,3,0,0,35,0,128,1,0,34,0,128,1,0,35,80,3,0,0,34,80,3,0,0,35,0,128,2,0,34,0,128,2,0,35,89,3,0,0,34,89,3,0,0,35,0,128,3,0,34,0,128,3,0,35,98,3,0,0,34,98,3,0,0,15,16,0,0,0,0,0,10,0,15,16,0,0,0,0,0,10,0,15,16,0,0,0,0,0,10,0,15,16,0,0,0,0,0,10,0,15,104,0,0,0,0,0,0,0,110,152,1,88,0,0,0,0,26,4,128,13,128,113,5,2,0,38,0,0,0,113,4,21,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,113,4,2,0,113,5,8,0,113,6,255,255,38,0,0,0,113,4,18,0,38,0,0,0,113,4,9,0,38,0,0,0,16,0,0,0,0,0,10,0,105,80,0,0,233,5,0,0,81,0,0,233,5,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,241,5,0,0,81,255,0,241,5,0,0,0,0,82,0,0,83,0,0,0,0,173,5,0,1,0,175,80,255,0,243,5,0,0,81,255,0,243,5,0,0,0,0,82,0,0,83,0,0,0,0,174,5,0,1,0,175,58,0,0,255,255,255,255,255,9,255,255,255,255,255,9,0,5,0,9,5,0,0,0,113,0,0,0,0,90,113,4,1,0,113,5,2,0,38,0,0,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,150,4,0,0,34,150,4,0,0,35,0,128,1,0,34,0,128,1,0,35,156,4,0,0,34,156,4,0,0,35,0,128,2,0,34,0,128,2,0,35,162,4,0,0,34,162,4,0,0,35,0,128,3,0,34,0,128,3,0,35,168,4,0,0,34,168,4,0,0,15,104,0,0,0,0,15,104,0,0,0,0,15,104,0,0,0,0,15,113,4,9,0,38,0,0,0,26,0,128,13,128,35,0,128,1,0,34,0,128,1,0,35,11,5,0,0,34,11,5,0,0,35,0,128,2,0,34,0,128,2,0,35,32,5,0,0,34,32,5,0,0,35,0,128,3,0,34,0,128,3,0,35,11,5,0,0,34,11,5,0,0,35,0,128,4,0,34,0,128,4,0,35,32,5,0,0,34,32,5,0,0,104,0,0,0,0,15,44,0,0,7,1,53,5,0,0,16,0,0,0,0,0,10,0,42,0,0,15,44,0,0,7,1,62,5,0,0,16,0,0,0,0,0,10,0,42,0,0,15,16,0,0,0,0,0,10,0,15,16,0,0,0,0,0,10,0,15,113,0,1,0,16,0,0,0,0,0,10,0,38,0,0,0,113,4,3,0,113,5,3,0,38,0,0,0,50,112,1,51,38,0,0,0,88,128,5,0,0,152,1,113,4,11,0,38,0,0,0,0,89,95,0,0,0,113,4,1,0,113,5,2,0,38,0,0,0,26,0,128,13,128,35,0,128,1,0,34,0,128,1,0,35,206,5,0,0,34,206,5,0,0,35,0,128,2,0,34,0,128,2,0,35,215,5,0,0,34,215,5,0,0,35,0,128,3,0,34,0,128,3,0,35,224,5,0,0,34,224,5,0,0,15,16,0,0,0,0,0,10,0,15,16,0,0,0,0,0,10,0,15,16,0,0,0,0,0,10,0,15,11,2,254,9,9,9,9,254,9,254,9,84,254] as const;

export const STATS = { ops: 190, bytes: 1526, labels: 39, unknownOps: 2, unresolvedSymbols: 47 } as const;
