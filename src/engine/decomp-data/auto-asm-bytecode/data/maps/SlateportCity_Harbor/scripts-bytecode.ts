// AUTO-GENERATED from data/maps/SlateportCity_Harbor/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=279, bytes=1539, labels=50, unknownOps=2, unresolvedSymbols=58

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "SlateportCity_Harbor_MapScripts": 0,
  "SlateportCity_Harbor_OnTransition": 5,
  "SlateportCity_Harbor_EventScript_ShowSSTidal": 52,
  "SlateportCity_Harbor_EventScript_ReadyAquaEscapeScene": 56,
  "SlateportCity_Harbor_EventScript_AquaEscapeTrigger0": 74,
  "SlateportCity_Harbor_EventScript_AquaEscapeTrigger1": 85,
  "SlateportCity_Harbor_EventScript_AquaEscapeTrigger2": 96,
  "SlateportCity_Harbor_EventScript_AquaEscapeTrigger3": 107,
  "SlateportCity_Harbor_EventScript_AquaEscapeScene": 142,
  "SlateportCity_Harbor_EventScript_SternApproachPlayer0": 369,
  "SlateportCity_Harbor_EventScript_SternApproachPlayer1": 418,
  "SlateportCity_Harbor_EventScript_SternApproachPlayer": 467,
  "SlateportCity_Harbor_Movement_AquaBoardSub": 516,
  "SlateportCity_Harbor_Movement_ArchieBoardSub": 521,
  "SlateportCity_Harbor_Movement_SubmarineExit": 526,
  "SlateportCity_Harbor_Movement_SternApproachPlayer0": 540,
  "SlateportCity_Harbor_Movement_SternApproachPlayer1": 546,
  "SlateportCity_Harbor_Movement_SternApproachPlayer": 551,
  "SlateportCity_Harbor_Movement_PlayerWalkUp": 555,
  "SlateportCity_Harbor_EventScript_FerryAttendant": 557,
  "SlateportCity_Harbor_EventScript_AskForTicket": 578,
  "SlateportCity_Harbor_EventScript_ChooseDestination": 600,
  "SlateportCity_Harbor_EventScript_ChooseDestinationWithBattleFrontier": 681,
  "SlateportCity_Harbor_EventScript_NoTicket": 773,
  "SlateportCity_Harbor_EventScript_Lilycove": 783,
  "SlateportCity_Harbor_EventScript_BattleFrontier": 836,
  "SlateportCity_Harbor_EventScript_ChooseNewDestination": 885,
  "SlateportCity_Harbor_EventScript_BoardFerry": 899,
  "SlateportCity_Harbor_EventScript_CancelDestinationSelect": 976,
  "SlateportCity_Harbor_EventScript_BoardFerryEast": 986,
  "SlateportCity_Harbor_EventScript_BoardFerryNorth": 1011,
  "SlateportCity_Harbor_Movement_BoardFerryEast": 1036,
  "SlateportCity_Harbor_Movement_BoardFerryNorth": 1039,
  "SlateportCity_Harbor_EventScript_Sailor": 1041,
  "SlateportCity_Harbor_EventScript_SailorNoAbnormalWeather": 1094,
  "SlateportCity_Harbor_EventScript_CountDefeatedLegendary": 1104,
  "SlateportCity_Harbor_EventScript_FatMan": 1108,
  "SlateportCity_Harbor_EventScript_CaptStern": 1117,
  "SlateportCity_Harbor_EventScript_WhyStealSubmarine": 1191,
  "SlateportCity_Harbor_EventScript_TeamAquaLeftNeedDive": 1201,
  "SlateportCity_Harbor_EventScript_NeedDive": 1214,
  "SlateportCity_Harbor_EventScript_CaptSternFerryOrScannerComment": 1224,
  "SlateportCity_Harbor_EventScript_FerryFinished": 1268,
  "SlateportCity_Harbor_EventScript_AskToTradeScanner": 1278,
  "SlateportCity_Harbor_EventScript_ChooseScannerTrade": 1292,
  "SlateportCity_Harbor_EventScript_DeepSeaTooth": 1383,
  "SlateportCity_Harbor_EventScript_DeepSeaScale": 1442,
  "SlateportCity_Harbor_EventScript_DeclineTrade": 1501,
  "SlateportCity_Harbor_EventScript_ChooseDifferentTrade": 1511,
  "SlateportCity_Harbor_EventScript_TradedScanner": 1525,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [3,5,0,0,0,197,0,0,255,255,255,255,255,28,255,255,255,255,255,28,0,13,0,28,13,0,0,0,113,0,0,0,35,160,64,1,0,34,160,64,1,0,44,0,0,8,1,52,0,0,0,90,43,92,3,15,53,163,1,100,0,0,12,0,13,0,102,0,0,9,42,137,3,15,106,113,8,0,0,89,142,0,0,0,90,106,113,8,1,0,89,142,0,0,0,90,106,113,8,2,0,89,142,0,0,0,90,106,113,8,3,0,80,255,0,43,2,0,0,81,255,0,43,2,0,0,0,0,82,0,0,83,0,0,0,0,89,142,0,0,0,90,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,105,80,0,0,4,2,0,0,81,0,0,4,2,0,0,0,0,80,0,0,4,2,0,0,81,0,0,4,2,0,0,0,0,80,0,0,14,2,0,0,81,0,0,14,2,0,0,0,0,82,0,0,83,0,0,0,0,84,0,0,85,0,0,0,0,84,0,0,85,0,0,0,0,84,0,0,85,0,0,0,0,113,160,2,0,42,97,0,42,19,3,35,8,128,0,0,34,8,128,0,0,35,8,128,1,0,34,8,128,1,0,35,8,128,2,0,34,8,128,2,0,35,8,128,3,0,34,8,128,3,0,16,0,0,0,0,0,10,0,105,42,53,3,42,54,3,101,0,0,102,0,0,10,108,90,80,0,0,28,2,0,0,81,0,0,28,2,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,15,80,0,0,34,2,0,0,81,0,0,34,2,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,15,80,0,0,39,2,0,0,81,0,0,39,2,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,15,20,20,67,84,254,20,20,67,84,254,20,20,20,20,11,11,11,24,24,24,24,24,24,254,10,10,10,10,9,254,10,10,9,10,254,10,10,10,254,9,254,107,91,44,0,0,7,1,66,2,0,0,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,104,0,0,0,0,0,0,0,89,88,2,0,0,90,44,208,1,7,1,169,2,0,0,113,18,8,56,2,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,15,3,0,0,34,15,3,0,0,35,0,128,1,0,34,0,128,1,0,35,208,3,0,0,34,208,3,0,0,35,0,128,127,0,34,0,128,127,0,35,208,3,0,0,34,208,3,0,0,90,113,17,6,52,2,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,15,3,0,0,34,15,3,0,0,35,0,128,1,0,34,0,128,1,0,35,68,3,0,0,34,68,3,0,0,35,0,128,2,0,34,0,128,2,0,35,208,3,0,0,34,208,3,0,0,35,0,128,127,0,34,0,128,127,0,35,208,3,0,0,34,208,3,0,0,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,113,180,1,0,88,131,3,0,0,58,0,0,255,255,255,255,255,1,255,255,255,255,255,1,0,10,0,1,10,0,0,0,0,109,90,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,88,131,3,0,0,58,0,0,255,255,255,255,255,19,255,255,255,255,255,19,0,67,0,19,67,0,0,0,0,109,90,104,0,0,0,0,0,0,0,89,88,2,0,0,90,16,0,0,0,0,0,10,0,105,80,15,128,0,0,0,0,81,15,128,0,0,0,0,0,0,82,0,0,83,0,0,0,0,4,30,90,15,128,0,0,35,12,128,2,0,34,12,128,2,0,35,12,128,4,0,34,12,128,4,0,4,30,90,255,0,0,0,113,4,0,0,88,0,0,0,0,15,16,0,0,0,0,0,10,0,109,90,80,255,0,12,4,0,0,81,255,0,12,4,0,0,0,0,82,0,0,83,0,0,0,0,15,80,255,0,15,4,0,0,81,255,0,15,4,0,0,0,0,82,0,0,83,0,0,0,0,15,11,38,254,9,254,107,91,44,0,0,7,0,70,4,0,0,113,4,0,0,44,190,1,8,1,80,4,0,0,44,191,1,8,1,80,4,0,0,35,4,128,2,0,34,4,128,2,0,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,115,4,1,15,16,0,0,0,0,0,10,0,90,107,91,44,0,0,7,1,200,4,0,0,44,15,1,7,1,190,4,0,0,44,112,0,7,1,177,4,0,0,35,160,64,2,0,34,160,64,2,0,16,0,0,0,0,0,10,0,105,80,15,128,0,0,0,0,81,15,128,0,0,0,0,0,0,82,0,0,83,0,0,0,0,109,90,16,0,0,0,0,0,10,0,109,90,42,15,1,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,35,0,0,1,0,34,0,0,1,0,72,22,1,1,0,35,13,128,1,0,34,13,128,1,0,44,0,0,7,1,244,4,0,0,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,104,0,0,0,0,0,0,0,89,12,5,0,0,90,112,0,0,46,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,103,5,0,0,34,103,5,0,0,35,0,128,1,0,34,0,128,1,0,35,162,5,0,0,34,162,5,0,0,35,0,128,2,0,34,0,128,2,0,35,221,5,0,0,34,221,5,0,0,35,0,128,127,0,34,0,128,127,0,35,221,5,0,0,34,221,5,0,0,90,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,27,0,128,192,0,27,1,128,1,0,10,0,35,13,128,0,0,34,13,128,0,0,0,22,16,0,0,0,0,0,10,0,42,38,1,89,245,5,0,0,90,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,27,0,128,193,0,27,1,128,1,0,10,0,35,13,128,0,0,34,13,128,0,0,0,22,16,0,0,0,0,0,10,0,42,38,1,89,245,5,0,0,90,16,0,0,0,0,0,10,0,109,90,104,0,0,0,0,0,0,0,89,12,5,0,0,90,113,0,1,0,16,0,0,0,0,0,10,0,109,90] as const;

export const STATS = { ops: 279, bytes: 1539, labels: 50, unknownOps: 2, unresolvedSymbols: 58 } as const;
