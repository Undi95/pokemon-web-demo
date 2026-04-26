// AUTO-GENERATED from data/maps/BattleFrontier_BattleDomePreBattleRoom/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=190, bytes=2006, labels=39, unknownOps=0, unresolvedSymbols=47

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "BattleFrontier_BattleDomePreBattleRoom_MapScripts": 0,
  "BattleFrontier_BattleDomePreBattleRoom_OnWarp": 10,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_TurnPlayerNorth": 18,
  "BattleFrontier_BattleDomePreBattleRoom_OnFrame": 27,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_EnterRoom": 35,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_AskReadyForNextRound": 107,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_AskReadyForNextRoundNoRecord": 381,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_AskRecordBattle": 583,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_RecordBattle": 698,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_AskPauseChallenge": 708,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_AskRetireChallenge": 817,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_RetireChallenge": 932,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_PauseChallenge": 949,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_ShowOpponentInfo": 984,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_ShowTourneyTree": 1008,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_ShowRoundMessage": 1029,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_TourneyInRound1": 1175,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_TourneyInRound2": 1184,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_TourneyInSemifinals": 1193,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_TourneyInFinals": 1202,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_ContinueChallenge": 1211,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_ReadyForNextRoundMessage": 1424,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_ReadyForRound1": 1570,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_ReadyForRound2": 1576,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_ReadyForSemifinals": 1582,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_ReadyForFinals": 1588,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_ReadyForTuckerSilver": 1735,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_ReadyForTuckerGold": 1756,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_ReadyForTuckerSilverShort": 1777,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_ReadyForTuckerGoldShort": 1786,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_ReturnFromBattle": 1795,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_RoundCompleteMessage": 1852,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_Round1Complete": 1966,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_Round2Complete": 1975,
  "BattleFrontier_BattleDomePreBattleRoom_EventScript_SemifinalsComplete": 1984,
  "BattleFrontier_BattleDomePreBattleRoom_Movement_AttendantMoveAside": 1993,
  "BattleFrontier_BattleDomePreBattleRoom_Movement_PlayerEnter": 1996,
  "BattleFrontier_BattleDomePreBattleRoom_Movement_PlayerWalkToDoor": 2001,
  "BattleFrontier_BattleDomePreBattleRoom_Movement_PlayerEnterDoor": 2003,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [2,27,0,0,0,4,10,0,0,0,0,0,0,0,18,0,0,0,113,0,1,0,92,255,0,2,90,0,0,0,0,35,0,0,0,35,6,128,1,0,34,6,128,1,0,7,1,3,7,0,0,7,1,6,128,0,0,113,4,2,0,113,5,6,0,26,6,128,1,0,113,6,1,0,38,0,0,0,113,0,1,0,80,255,0,204,7,0,0,81,255,0,204,7,0,0,0,0,82,0,0,83,0,0,0,0,106,88,144,5,0,0,0,0,0,26,0,128,13,128,88,0,0,0,0,35,13,128,1,0,34,13,128,1,0,7,1,125,1,0,0,7,1,13,128,0,0,112,16,0,73,1,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,216,3,0,0,34,216,3,0,0,7,1,0,0,0,0,7,1,216,3,0,0,35,0,128,1,0,34,0,128,1,0,35,240,3,0,0,34,240,3,0,0,7,1,0,0,0,0,7,1,240,3,0,0,35,0,128,2,0,34,0,128,2,0,35,187,4,0,0,34,187,4,0,0,7,1,0,0,0,0,7,1,187,4,0,0,35,0,128,3,0,34,0,128,3,0,35,71,2,0,0,34,71,2,0,0,7,1,0,0,0,0,7,1,71,2,0,0,35,0,128,4,0,34,0,128,4,0,35,196,2,0,0,34,196,2,0,0,7,1,0,0,0,0,7,1,196,2,0,0,35,0,128,5,0,34,0,128,5,0,35,49,3,0,0,34,49,3,0,0,7,1,0,0,0,0,7,1,49,3,0,0,35,0,128,127,0,34,0,128,127,0,35,107,0,0,0,34,107,0,0,0,7,1,0,0,0,0,7,1,107,0,0,0,112,16,2,107,1,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,216,3,0,0,34,216,3,0,0,7,1,0,0,0,0,7,1,216,3,0,0,35,0,128,1,0,34,0,128,1,0,35,240,3,0,0,34,240,3,0,0,7,1,0,0,0,0,7,1,240,3,0,0,35,0,128,2,0,34,0,128,2,0,35,187,4,0,0,34,187,4,0,0,7,1,0,0,0,0,7,1,187,4,0,0,35,0,128,3,0,34,0,128,3,0,35,196,2,0,0,34,196,2,0,0,7,1,0,0,0,0,7,1,196,2,0,0,35,0,128,4,0,34,0,128,4,0,35,49,3,0,0,34,49,3,0,0,7,1,0,0,0,0,7,1,49,3,0,0,35,0,128,127,0,34,0,128,127,0,35,107,0,0,0,34,107,0,0,0,7,1,0,0,0,0,7,1,107,0,0,0,104,0,0,0,0,0,0,0,113,20,8,94,1,0,26,0,128,13,128,35,0,128,1,0,34,0,128,1,0,35,107,0,0,0,34,107,0,0,0,7,1,0,0,0,0,7,1,107,0,0,0,35,0,128,0,0,34,0,128,0,0,35,186,2,0,0,34,186,2,0,0,7,1,0,0,0,0,7,1,186,2,0,0,35,0,128,127,0,34,0,128,127,0,35,107,0,0,0,34,107,0,0,0,7,1,0,0,0,0,7,1,107,0,0,0,88,0,0,0,0,89,107,0,0,0,16,0,0,0,0,0,10,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,107,0,0,0,34,107,0,0,0,7,1,0,0,0,0,7,1,107,0,0,0,35,0,128,0,0,34,0,128,0,0,35,181,3,0,0,34,181,3,0,0,7,1,0,0,0,0,7,1,181,3,0,0,35,0,128,127,0,34,0,128,127,0,35,107,0,0,0,34,107,0,0,0,7,1,0,0,0,0,7,1,107,0,0,0,104,0,0,0,0,0,0,0,113,20,8,94,1,0,26,0,128,13,128,35,0,128,1,0,34,0,128,1,0,35,107,0,0,0,34,107,0,0,0,7,1,0,0,0,0,7,1,107,0,0,0,35,0,128,0,0,34,0,128,0,0,35,164,3,0,0,34,164,3,0,0,7,1,0,0,0,0,7,1,164,3,0,0,35,0,128,127,0,34,0,128,127,0,35,107,0,0,0,34,107,0,0,0,7,1,0,0,0,0,7,1,107,0,0,0,113,4,12,0,113,5,9,0,38,0,0,0,89,0,0,0,0,104,0,0,0,0,0,0,0,113,4,13,0,113,5,2,0,38,0,0,0,9,55,0,49,152,1,113,4,4,0,38,0,0,0,90,16,0,0,0,0,0,10,0,152,1,113,4,6,0,38,0,0,0,0,89,107,0,0,0,88,5,4,0,0,152,1,113,4,7,0,38,0,0,0,0,89,107,0,0,0,113,4,1,0,113,5,2,0,38,0,0,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,151,4,0,0,34,151,4,0,0,7,1,0,0,0,0,7,1,151,4,0,0,35,0,128,1,0,34,0,128,1,0,35,160,4,0,0,34,160,4,0,0,7,1,0,0,0,0,7,1,160,4,0,0,35,0,128,2,0,34,0,128,2,0,35,169,4,0,0,34,169,4,0,0,7,1,0,0,0,0,7,1,169,4,0,0,35,0,128,3,0,34,0,128,3,0,35,178,4,0,0,34,178,4,0,0,7,1,0,0,0,0,7,1,178,4,0,0,15,16,0,0,0,0,0,10,0,15,16,0,0,0,0,0,10,0,15,16,0,0,0,0,0,10,0,15,16,0,0,0,0,0,10,0,15,104,0,0,0,0,0,0,0,110,152,1,88,0,0,0,0,26,4,128,13,128,113,5,2,0,38,0,0,0,113,4,21,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,7,1,107,0,0,0,7,1,13,128,0,0,113,4,2,0,113,5,8,0,113,6,255,255,38,0,0,0,113,4,18,0,38,0,0,0,113,4,9,0,38,0,0,0,16,0,0,0,0,0,10,0,105,80,0,0,201,7,0,0,81,0,0,201,7,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,209,7,0,0,81,255,0,209,7,0,0,0,0,82,0,0,83,0,0,0,0,173,5,0,1,0,175,80,255,0,211,7,0,0,81,255,0,211,7,0,0,0,0,82,0,0,83,0,0,0,0,174,5,0,1,0,175,58,0,0,255,255,255,255,255,9,255,255,255,255,255,9,0,5,0,9,5,0,0,0,113,0,0,0,0,90,113,4,1,0,113,5,2,0,38,0,0,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,34,6,0,0,34,34,6,0,0,7,1,0,0,0,0,7,1,34,6,0,0,35,0,128,1,0,34,0,128,1,0,35,40,6,0,0,34,40,6,0,0,7,1,0,0,0,0,7,1,40,6,0,0,35,0,128,2,0,34,0,128,2,0,35,46,6,0,0,34,46,6,0,0,7,1,0,0,0,0,7,1,46,6,0,0,35,0,128,3,0,34,0,128,3,0,35,52,6,0,0,34,52,6,0,0,7,1,0,0,0,0,7,1,52,6,0,0,15,104,0,0,0,0,15,104,0,0,0,0,15,104,0,0,0,0,15,113,4,9,0,38,0,0,0,26,0,128,13,128,35,0,128,1,0,34,0,128,1,0,35,199,6,0,0,34,199,6,0,0,7,1,0,0,0,0,7,1,199,6,0,0,35,0,128,2,0,34,0,128,2,0,35,220,6,0,0,34,220,6,0,0,7,1,0,0,0,0,7,1,220,6,0,0,35,0,128,3,0,34,0,128,3,0,35,199,6,0,0,34,199,6,0,0,7,1,0,0,0,0,7,1,199,6,0,0,35,0,128,4,0,34,0,128,4,0,35,220,6,0,0,34,220,6,0,0,7,1,0,0,0,0,7,1,220,6,0,0,104,0,0,0,0,15,44,0,0,7,1,241,6,0,0,16,0,0,0,0,0,10,0,42,0,0,15,44,0,0,7,1,250,6,0,0,16,0,0,0,0,0,10,0,42,0,0,15,16,0,0,0,0,0,10,0,15,16,0,0,0,0,0,10,0,15,113,0,1,0,16,0,0,0,0,0,10,0,38,0,0,0,113,4,3,0,113,5,3,0,38,0,0,0,50,112,1,51,38,0,0,0,88,60,7,0,0,152,1,113,4,11,0,38,0,0,0,0,89,107,0,0,0,113,4,1,0,113,5,2,0,38,0,0,0,26,0,128,13,128,35,0,128,1,0,34,0,128,1,0,35,174,7,0,0,34,174,7,0,0,7,1,0,0,0,0,7,1,174,7,0,0,35,0,128,2,0,34,0,128,2,0,35,183,7,0,0,34,183,7,0,0,7,1,0,0,0,0,7,1,183,7,0,0,35,0,128,3,0,34,0,128,3,0,35,192,7,0,0,34,192,7,0,0,7,1,0,0,0,0,7,1,192,7,0,0,15,16,0,0,0,0,0,10,0,15,16,0,0,0,0,0,10,0,15,16,0,0,0,0,0,10,0,15,11,2,254,9,9,9,9,254,9,254,9,84,254] as const;

export const STATS = { ops: 190, bytes: 2006, labels: 39, unknownOps: 0, unresolvedSymbols: 47 } as const;
