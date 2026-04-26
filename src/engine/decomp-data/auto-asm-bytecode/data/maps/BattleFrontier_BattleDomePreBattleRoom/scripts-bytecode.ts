// AUTO-GENERATED from data/maps/BattleFrontier_BattleDomePreBattleRoom/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=190, bytes=705, labels=39, unknownOps=10, unresolvedSymbols=45

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "BattleFrontier_BattleDomePreBattleRoom_MapScripts": 0,
  "BattleFrontier_BattleDomePreBattleRoom_OnWarp": 10,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_TurnPlayerNorth": 18,
  "BattleFrontier_BattleDomePreBattleRoom_OnFrame": 27,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_EnterRoom": 35,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_AskReadyForNextRound": 95,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_AskReadyForNextRoundNoRecord": 123,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_AskRecordBattle": 128,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_RecordBattle": 142,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_AskPauseChallenge": 152,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_AskRetireChallenge": 160,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_RetireChallenge": 174,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_PauseChallenge": 191,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_ShowOpponentInfo": 226,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_ShowTourneyTree": 250,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_ShowRoundMessage": 271,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_TourneyInRound1": 283,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_TourneyInRound2": 291,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_TourneyInSemifinals": 299,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_TourneyInFinals": 307,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_ContinueChallenge": 315,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_ReadyForNextRoundMessage": 516,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_ReadyForRound1": 528,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_ReadyForRound2": 533,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_ReadyForSemifinals": 538,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_ReadyForFinals": 543,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_ReadyForTuckerSilver": 556,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_ReadyForTuckerGold": 576,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_ReadyForTuckerSilverShort": 596,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_ReadyForTuckerGoldShort": 604,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_ReturnFromBattle": 612,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_RoundCompleteMessage": 669,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_Round1Complete": 681,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_Round2Complete": 689,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_SemifinalsComplete": 697,
  "BattleFrontier_BattleDomePreBattleRoom_Movement_AttendantMoveAside": 705,
  "BattleFrontier_BattleDomePreBattleRoom_Movement_PlayerEnter": 705,
  "BattleFrontier_BattleDomePreBattleRoom_Movement_PlayerWalkToDoor": 705,
  "BattleFrontier_BattleDomePreBattleRoom_Movement_PlayerEnterDoor": 705,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [2,27,0,0,0,4,10,0,0,0,0,0,0,0,18,0,0,0,113,0,1,0,92,255,0,2,90,0,0,0,0,35,0,0,0,35,6,128,1,0,34,6,128,1,0,113,4,2,0,113,5,6,0,26,6,128,1,0,113,6,1,0,38,0,0,0,113,0,1,0,80,255,0,193,2,0,0,81,255,0,193,2,0,0,0,0,82,0,0,83,0,0,0,0,106,88,4,2,0,0,0,0,0,88,0,0,0,0,35,13,128,1,0,34,13,128,1,0,112,16,0,73,1,112,16,2,107,1,104,0,0,0,0,0,0,0,113,20,8,94,1,0,88,0,0,0,0,89,95,0,0,0,16,0,0,0,0,0,10,0,104,0,0,0,0,0,0,0,113,20,8,94,1,0,113,4,12,0,113,5,9,0,38,0,0,0,89,0,0,0,0,104,0,0,0,0,0,0,0,113,4,13,0,113,5,2,0,38,0,0,0,9,55,0,49,152,1,113,4,4,0,38,0,0,0,90,16,0,0,0,0,0,10,0,152,1,113,4,6,0,38,0,0,0,0,89,95,0,0,0,88,15,1,0,0,152,1,113,4,7,0,38,0,0,0,0,89,95,0,0,0,113,4,1,0,113,5,2,0,38,0,0,0,16,0,0,0,0,0,10,0,16,0,0,0,0,0,10,0,16,0,0,0,0,0,10,0,16,0,0,0,0,0,10,0,104,0,0,0,0,0,0,0,110,152,1,88,0,0,0,0,26,4,128,13,128,113,5,2,0,38,0,0,0,113,4,21,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,113,4,2,0,113,5,8,0,113,6,255,255,38,0,0,0,113,4,18,0,38,0,0,0,113,4,9,0,38,0,0,0,16,0,0,0,0,0,10,0,105,80,0,0,193,2,0,0,81,0,0,193,2,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,193,2,0,0,81,255,0,193,2,0,0,0,0,82,0,0,83,0,0,0,0,173,5,0,1,0,175,80,255,0,193,2,0,0,81,255,0,193,2,0,0,0,0,82,0,0,83,0,0,0,0,174,5,0,1,0,175,58,0,0,255,255,255,255,255,9,255,255,255,255,255,9,0,5,0,9,5,0,0,0,113,0,0,0,0,90,113,4,1,0,113,5,2,0,38,0,0,0,104,0,0,0,0,104,0,0,0,0,104,0,0,0,0,113,4,9,0,38,0,0,0,104,0,0,0,0,44,0,0,7,1,84,2,0,0,16,0,0,0,0,0,10,0,42,0,0,44,0,0,7,1,92,2,0,0,16,0,0,0,0,0,10,0,42,0,0,16,0,0,0,0,0,10,0,16,0,0,0,0,0,10,0,113,0,1,0,16,0,0,0,0,0,10,0,38,0,0,0,113,4,3,0,113,5,3,0,38,0,0,0,50,112,1,51,38,0,0,0,88,157,2,0,0,152,1,113,4,11,0,38,0,0,0,0,89,95,0,0,0,113,4,1,0,113,5,2,0,38,0,0,0,16,0,0,0,0,0,10,0,16,0,0,0,0,0,10,0,16,0,0,0,0,0,10,0] as const;

export const STATS = { ops: 190, bytes: 705, labels: 39, unknownOps: 10, unresolvedSymbols: 45 } as const;
