// AUTO-GENERATED from data/maps/SlateportCity_Harbor/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=279, bytes=1249, labels=50, unknownOps=14, unresolvedSymbols=58

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "SlateportCity_Harbor_MapScripts": 0,
  "SlateportCity_Harbor_OnTransition": 5,
  "SlateportCity_Harbor_EventScript_ShowSSTidal": 52,
  "SlateportCity_Harbor_EventScript_ReadyAquaEscapeScene": 55,
  "SlateportCity_Harbor_EventScript_AquaEscapeTrigger0": 72,
  "SlateportCity_Harbor_EventScript_AquaEscapeTrigger1": 83,
  "SlateportCity_Harbor_EventScript_AquaEscapeTrigger2": 94,
  "SlateportCity_Harbor_EventScript_AquaEscapeTrigger3": 105,
  "SlateportCity_Harbor_EventScript_AquaEscapeScene": 140,
  "SlateportCity_Harbor_EventScript_SternApproachPlayer0": 367,
  "SlateportCity_Harbor_EventScript_SternApproachPlayer1": 415,
  "SlateportCity_Harbor_EventScript_SternApproachPlayer": 463,
  "SlateportCity_Harbor_Movement_AquaBoardSub": 511,
  "SlateportCity_Harbor_Movement_ArchieBoardSub": 511,
  "SlateportCity_Harbor_Movement_SubmarineExit": 511,
  "SlateportCity_Harbor_Movement_SternApproachPlayer0": 511,
  "SlateportCity_Harbor_Movement_SternApproachPlayer1": 511,
  "SlateportCity_Harbor_Movement_SternApproachPlayer": 511,
  "SlateportCity_Harbor_Movement_PlayerWalkUp": 511,
  "SlateportCity_Harbor_EventScript_FerryAttendant": 511,
  "SlateportCity_Harbor_EventScript_AskForTicket": 532,
  "SlateportCity_Harbor_EventScript_ChooseDestination": 554,
  "SlateportCity_Harbor_EventScript_ChooseDestinationWithBattleFrontier": 570,
  "SlateportCity_Harbor_EventScript_NoTicket": 577,
  "SlateportCity_Harbor_EventScript_Lilycove": 587,
  "SlateportCity_Harbor_EventScript_BattleFrontier": 640,
  "SlateportCity_Harbor_EventScript_ChooseNewDestination": 689,
  "SlateportCity_Harbor_EventScript_BoardFerry": 703,
  "SlateportCity_Harbor_EventScript_CancelDestinationSelect": 779,
  "SlateportCity_Harbor_EventScript_BoardFerryEast": 789,
  "SlateportCity_Harbor_EventScript_BoardFerryNorth": 813,
  "SlateportCity_Harbor_Movement_BoardFerryEast": 837,
  "SlateportCity_Harbor_Movement_BoardFerryNorth": 837,
  "SlateportCity_Harbor_EventScript_Sailor": 837,
  "SlateportCity_Harbor_EventScript_SailorNoAbnormalWeather": 890,
  "SlateportCity_Harbor_EventScript_CountDefeatedLegendary": 900,
  "SlateportCity_Harbor_EventScript_FatMan": 903,
  "SlateportCity_Harbor_EventScript_CaptStern": 912,
  "SlateportCity_Harbor_EventScript_WhyStealSubmarine": 986,
  "SlateportCity_Harbor_EventScript_TeamAquaLeftNeedDive": 996,
  "SlateportCity_Harbor_EventScript_NeedDive": 1009,
  "SlateportCity_Harbor_EventScript_CaptSternFerryOrScannerComment": 1019,
  "SlateportCity_Harbor_EventScript_FerryFinished": 1063,
  "SlateportCity_Harbor_EventScript_AskToTradeScanner": 1073,
  "SlateportCity_Harbor_EventScript_ChooseScannerTrade": 1087,
  "SlateportCity_Harbor_EventScript_DeepSeaTooth": 1093,
  "SlateportCity_Harbor_EventScript_DeepSeaScale": 1152,
  "SlateportCity_Harbor_EventScript_DeclineTrade": 1211,
  "SlateportCity_Harbor_EventScript_ChooseDifferentTrade": 1221,
  "SlateportCity_Harbor_EventScript_TradedScanner": 1235,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [3,5,0,0,0,197,0,0,255,255,255,255,255,28,255,255,255,255,255,28,0,13,0,28,13,0,0,0,113,0,0,0,35,160,64,1,0,34,160,64,1,0,44,0,0,8,1,52,0,0,0,90,43,92,3,53,163,1,100,0,0,12,0,13,0,102,0,0,9,42,137,3,106,113,8,0,0,89,140,0,0,0,90,106,113,8,1,0,89,140,0,0,0,90,106,113,8,2,0,89,140,0,0,0,90,106,113,8,3,0,80,255,0,255,1,0,0,81,255,0,255,1,0,0,0,0,82,0,0,83,0,0,0,0,89,140,0,0,0,90,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,105,80,0,0,255,1,0,0,81,0,0,255,1,0,0,0,0,80,0,0,255,1,0,0,81,0,0,255,1,0,0,0,0,80,0,0,255,1,0,0,81,0,0,255,1,0,0,0,0,82,0,0,83,0,0,0,0,84,0,0,85,0,0,0,0,84,0,0,85,0,0,0,0,84,0,0,85,0,0,0,0,113,160,2,0,42,97,0,42,19,3,35,8,128,0,0,34,8,128,0,0,35,8,128,1,0,34,8,128,1,0,35,8,128,2,0,34,8,128,2,0,35,8,128,3,0,34,8,128,3,0,16,0,0,0,0,0,10,0,105,42,53,3,42,54,3,101,0,0,102,0,0,10,108,90,80,0,0,255,1,0,0,81,0,0,255,1,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,255,1,0,0,81,0,0,255,1,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,255,1,0,0,81,0,0,255,1,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,107,91,44,0,0,7,1,20,2,0,0,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,104,0,0,0,0,0,0,0,89,42,2,0,0,90,44,208,1,7,1,58,2,0,0,113,18,8,56,2,0,90,113,17,6,52,2,0,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,113,180,1,0,88,191,2,0,0,58,0,0,255,255,255,255,255,1,255,255,255,255,255,1,0,10,0,1,10,0,0,0,0,109,90,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,88,191,2,0,0,58,0,0,255,255,255,255,255,19,255,255,255,255,255,19,0,67,0,19,67,0,0,0,0,109,90,104,0,0,0,0,0,0,0,89,42,2,0,0,90,16,0,0,0,0,0,10,0,105,80,15,128,0,0,0,0,81,15,128,0,0,0,0,0,0,82,0,0,83,0,0,0,0,4,30,90,15,128,0,0,35,12,128,2,0,34,12,128,2,0,35,12,128,4,0,34,12,128,4,0,4,30,90,255,0,0,0,113,4,0,0,88,0,0,0,0,16,0,0,0,0,0,10,0,109,90,80,255,0,69,3,0,0,81,255,0,69,3,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,69,3,0,0,81,255,0,69,3,0,0,0,0,82,0,0,83,0,0,0,0,107,91,44,0,0,7,0,122,3,0,0,113,4,0,0,44,190,1,8,1,132,3,0,0,44,191,1,8,1,132,3,0,0,35,4,128,2,0,34,4,128,2,0,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,115,4,1,16,0,0,0,0,0,10,0,90,107,91,44,0,0,7,1,251,3,0,0,44,15,1,7,1,241,3,0,0,44,112,0,7,1,228,3,0,0,35,160,64,2,0,34,160,64,2,0,16,0,0,0,0,0,10,0,105,80,15,128,0,0,0,0,81,15,128,0,0,0,0,0,0,82,0,0,83,0,0,0,0,109,90,16,0,0,0,0,0,10,0,109,90,42,15,1,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,35,0,0,1,0,34,0,0,1,0,72,22,1,1,0,35,13,128,1,0,34,13,128,1,0,44,0,0,7,1,39,4,0,0,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,104,0,0,0,0,0,0,0,89,63,4,0,0,90,112,0,0,46,0,90,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,27,0,128,192,0,27,1,128,1,0,10,0,35,13,128,0,0,34,13,128,0,0,0,22,16,0,0,0,0,0,10,0,42,38,1,89,211,4,0,0,90,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,27,0,128,193,0,27,1,128,1,0,10,0,35,13,128,0,0,34,13,128,0,0,0,22,16,0,0,0,0,0,10,0,42,38,1,89,211,4,0,0,90,16,0,0,0,0,0,10,0,109,90,104,0,0,0,0,0,0,0,89,63,4,0,0,90,113,0,1,0,16,0,0,0,0,0,10,0,109,90] as const;

export const STATS = { ops: 279, bytes: 1249, labels: 50, unknownOps: 14, unresolvedSymbols: 58 } as const;
