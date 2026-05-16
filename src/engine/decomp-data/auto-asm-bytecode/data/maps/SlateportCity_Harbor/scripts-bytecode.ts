// AUTO-GENERATED from data/maps/SlateportCity_Harbor/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-05-16
// Stats: ops=279, bytes=1875, labels=50, unknownOps=0, unresolvedSymbols=54

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "SlateportCity_Harbor_MapScripts": 0,
  "SlateportCity_Harbor_OnTransition": 5,
  "SlateportCity_Harbor_EventScript_ShowSSTidal": 64,
  "SlateportCity_Harbor_EventScript_ReadyAquaEscapeScene": 68,
  "SlateportCity_Harbor_EventScript_AquaEscapeTrigger0": 86,
  "SlateportCity_Harbor_EventScript_AquaEscapeTrigger1": 97,
  "SlateportCity_Harbor_EventScript_AquaEscapeTrigger2": 108,
  "SlateportCity_Harbor_EventScript_AquaEscapeTrigger3": 119,
  "SlateportCity_Harbor_EventScript_AquaEscapeScene": 154,
  "SlateportCity_Harbor_EventScript_SternApproachPlayer0": 429,
  "SlateportCity_Harbor_EventScript_SternApproachPlayer1": 478,
  "SlateportCity_Harbor_EventScript_SternApproachPlayer": 527,
  "SlateportCity_Harbor_Movement_AquaBoardSub": 576,
  "SlateportCity_Harbor_Movement_ArchieBoardSub": 581,
  "SlateportCity_Harbor_Movement_SubmarineExit": 586,
  "SlateportCity_Harbor_Movement_SternApproachPlayer0": 600,
  "SlateportCity_Harbor_Movement_SternApproachPlayer1": 606,
  "SlateportCity_Harbor_Movement_SternApproachPlayer": 611,
  "SlateportCity_Harbor_Movement_PlayerWalkUp": 615,
  "SlateportCity_Harbor_EventScript_FerryAttendant": 617,
  "SlateportCity_Harbor_EventScript_AskForTicket": 638,
  "SlateportCity_Harbor_EventScript_ChooseDestination": 660,
  "SlateportCity_Harbor_EventScript_ChooseDestinationWithBattleFrontier": 777,
  "SlateportCity_Harbor_EventScript_NoTicket": 917,
  "SlateportCity_Harbor_EventScript_Lilycove": 927,
  "SlateportCity_Harbor_EventScript_BattleFrontier": 992,
  "SlateportCity_Harbor_EventScript_ChooseNewDestination": 1053,
  "SlateportCity_Harbor_EventScript_BoardFerry": 1067,
  "SlateportCity_Harbor_EventScript_CancelDestinationSelect": 1168,
  "SlateportCity_Harbor_EventScript_BoardFerryEast": 1178,
  "SlateportCity_Harbor_EventScript_BoardFerryNorth": 1203,
  "SlateportCity_Harbor_Movement_BoardFerryEast": 1228,
  "SlateportCity_Harbor_Movement_BoardFerryNorth": 1231,
  "SlateportCity_Harbor_EventScript_Sailor": 1233,
  "SlateportCity_Harbor_EventScript_SailorNoAbnormalWeather": 1298,
  "SlateportCity_Harbor_EventScript_CountDefeatedLegendary": 1308,
  "SlateportCity_Harbor_EventScript_FatMan": 1312,
  "SlateportCity_Harbor_EventScript_CaptStern": 1321,
  "SlateportCity_Harbor_EventScript_WhyStealSubmarine": 1407,
  "SlateportCity_Harbor_EventScript_TeamAquaLeftNeedDive": 1417,
  "SlateportCity_Harbor_EventScript_NeedDive": 1430,
  "SlateportCity_Harbor_EventScript_CaptSternFerryOrScannerComment": 1440,
  "SlateportCity_Harbor_EventScript_FerryFinished": 1508,
  "SlateportCity_Harbor_EventScript_AskToTradeScanner": 1518,
  "SlateportCity_Harbor_EventScript_ChooseScannerTrade": 1532,
  "SlateportCity_Harbor_EventScript_DeepSeaTooth": 1671,
  "SlateportCity_Harbor_EventScript_DeepSeaScale": 1754,
  "SlateportCity_Harbor_EventScript_DeclineTrade": 1837,
  "SlateportCity_Harbor_EventScript_ChooseDifferentTrade": 1847,
  "SlateportCity_Harbor_EventScript_TradedScanner": 1861,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [3,5,0,0,0,197,0,0,255,255,255,255,255,28,255,255,255,255,255,28,0,13,0,28,13,0,0,0,113,0,0,0,35,160,64,1,0,34,160,64,1,0,8,1,68,0,0,0,8,1,160,64,0,0,44,0,0,8,1,64,0,0,0,90,43,92,3,15,53,163,1,100,0,0,12,0,13,0,102,0,0,9,42,137,3,15,106,113,8,0,0,89,154,0,0,0,90,106,113,8,1,0,89,154,0,0,0,90,106,113,8,2,0,89,154,0,0,0,90,106,113,8,3,0,80,255,0,103,2,0,0,81,255,0,103,2,0,0,0,0,82,0,0,83,0,0,0,0,89,154,0,0,0,90,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,105,80,0,0,64,2,0,0,81,0,0,64,2,0,0,0,0,80,0,0,64,2,0,0,81,0,0,64,2,0,0,0,0,80,0,0,74,2,0,0,81,0,0,74,2,0,0,0,0,82,0,0,83,0,0,0,0,84,0,0,85,0,0,0,0,84,0,0,85,0,0,0,0,84,0,0,85,0,0,0,0,113,160,2,0,42,97,0,42,19,3,35,8,128,0,0,34,8,128,0,0,8,1,173,1,0,0,8,1,8,128,0,0,35,8,128,1,0,34,8,128,1,0,8,1,222,1,0,0,8,1,8,128,0,0,35,8,128,2,0,34,8,128,2,0,8,1,15,2,0,0,8,1,8,128,0,0,35,8,128,3,0,34,8,128,3,0,8,1,15,2,0,0,8,1,8,128,0,0,16,0,0,0,0,0,10,4,105,42,53,3,42,54,3,101,0,0,102,0,0,10,108,90,80,0,0,88,2,0,0,81,0,0,88,2,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,15,80,0,0,94,2,0,0,81,0,0,94,2,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,15,80,0,0,99,2,0,0,81,0,0,99,2,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,15,20,20,67,84,254,20,20,67,84,254,20,20,20,20,11,11,11,24,24,24,24,24,24,254,10,10,10,10,9,254,10,10,9,10,254,10,10,10,254,9,254,107,91,44,0,0,7,1,126,2,0,0,16,0,0,0,0,0,10,4,109,90,16,0,0,0,0,0,10,4,104,0,0,0,0,0,0,0,89,148,2,0,0,90,44,208,1,7,1,9,3,0,0,113,18,8,56,2,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,159,3,0,0,34,159,3,0,0,7,1,0,0,0,0,7,1,159,3,0,0,35,0,128,1,0,34,0,128,1,0,35,144,4,0,0,34,144,4,0,0,7,1,0,0,0,0,7,1,144,4,0,0,35,0,128,127,0,34,0,128,127,0,35,144,4,0,0,34,144,4,0,0,7,1,0,0,0,0,7,1,144,4,0,0,90,113,17,6,52,2,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,159,3,0,0,34,159,3,0,0,7,1,0,0,0,0,7,1,159,3,0,0,35,0,128,1,0,34,0,128,1,0,35,224,3,0,0,34,224,3,0,0,7,1,0,0,0,0,7,1,224,3,0,0,35,0,128,2,0,34,0,128,2,0,35,144,4,0,0,34,144,4,0,0,7,1,0,0,0,0,7,1,144,4,0,0,35,0,128,127,0,34,0,128,127,0,35,144,4,0,0,34,144,4,0,0,7,1,0,0,0,0,7,1,144,4,0,0,90,16,0,0,0,0,0,10,4,109,90,16,0,0,0,0,0,10,5,35,13,128,0,0,34,13,128,0,0,7,1,29,4,0,0,7,1,13,128,0,0,113,180,1,0,88,43,4,0,0,58,0,0,255,255,255,255,255,1,255,255,255,255,255,1,0,10,0,1,10,0,0,0,0,109,90,16,0,0,0,0,0,10,5,35,13,128,0,0,34,13,128,0,0,7,1,29,4,0,0,7,1,13,128,0,0,88,43,4,0,0,58,0,0,255,255,255,255,255,19,255,255,255,255,255,19,0,67,0,19,67,0,0,0,0,109,90,104,0,0,0,0,0,0,0,89,148,2,0,0,90,16,0,0,0,0,0,10,4,105,80,15,128,0,0,0,0,81,15,128,0,0,0,0,0,0,82,0,0,83,0,0,0,0,4,30,90,15,128,0,0,35,12,128,2,0,34,12,128,2,0,8,1,179,4,0,0,8,1,12,128,0,0,35,12,128,4,0,34,12,128,4,0,8,1,154,4,0,0,8,1,12,128,0,0,4,30,90,255,0,0,0,113,4,0,0,88,0,0,0,0,15,16,0,0,0,0,0,10,4,109,90,80,255,0,204,4,0,0,81,255,0,204,4,0,0,0,0,82,0,0,83,0,0,0,0,15,80,255,0,207,4,0,0,81,255,0,207,4,0,0,0,0,82,0,0,83,0,0,0,0,15,11,38,254,9,254,107,91,44,0,0,7,0,18,5,0,0,113,4,0,0,44,190,1,8,1,28,5,0,0,44,191,1,8,1,28,5,0,0,35,4,128,2,0,34,4,128,2,0,7,1,18,5,0,0,7,1,4,128,0,0,16,0,0,0,0,0,10,4,109,90,16,0,0,0,0,0,10,4,109,90,115,4,1,15,16,0,0,0,0,0,10,2,90,107,91,44,0,0,7,1,160,5,0,0,44,15,1,7,1,150,5,0,0,44,112,0,7,1,137,5,0,0,35,160,64,2,0,34,160,64,2,0,7,1,127,5,0,0,7,1,160,64,0,0,16,0,0,0,0,0,10,4,105,80,15,128,0,0,0,0,81,15,128,0,0,0,0,0,0,82,0,0,83,0,0,0,0,109,90,16,0,0,0,0,0,10,4,109,90,42,15,1,16,0,0,0,0,0,10,4,109,90,16,0,0,0,0,0,10,4,109,90,35,0,0,1,0,34,0,0,1,0,7,1,69,7,0,0,7,1,0,0,0,0,72,22,1,1,0,35,13,128,1,0,34,13,128,1,0,7,1,238,5,0,0,7,1,13,128,0,0,44,0,0,7,1,228,5,0,0,16,0,0,0,0,0,10,4,109,90,16,0,0,0,0,0,10,4,109,90,104,0,0,0,0,0,0,0,89,252,5,0,0,90,112,0,0,46,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,135,6,0,0,34,135,6,0,0,7,1,0,0,0,0,7,1,135,6,0,0,35,0,128,1,0,34,0,128,1,0,35,218,6,0,0,34,218,6,0,0,7,1,0,0,0,0,7,1,218,6,0,0,35,0,128,2,0,34,0,128,2,0,35,45,7,0,0,34,45,7,0,0,7,1,0,0,0,0,7,1,45,7,0,0,35,0,128,127,0,34,0,128,127,0,35,45,7,0,0,34,45,7,0,0,7,1,0,0,0,0,7,1,45,7,0,0,90,16,0,0,0,0,0,10,5,35,13,128,0,0,34,13,128,0,0,7,1,55,7,0,0,7,1,13,128,0,0,27,0,128,192,0,27,1,128,1,0,10,0,35,13,128,0,0,34,13,128,0,0,7,1,0,0,0,0,7,1,13,128,0,0,0,22,16,0,0,0,0,0,10,4,42,38,1,89,69,7,0,0,90,16,0,0,0,0,0,10,5,35,13,128,0,0,34,13,128,0,0,7,1,55,7,0,0,7,1,13,128,0,0,27,0,128,193,0,27,1,128,1,0,10,0,35,13,128,0,0,34,13,128,0,0,7,1,0,0,0,0,7,1,13,128,0,0,0,22,16,0,0,0,0,0,10,4,42,38,1,89,69,7,0,0,90,16,0,0,0,0,0,10,4,109,90,104,0,0,0,0,0,0,0,89,252,5,0,0,90,113,0,1,0,16,0,0,0,0,0,10,4,109,90] as const;

export const STATS = { ops: 279, bytes: 1875, labels: 50, unknownOps: 0, unresolvedSymbols: 54 } as const;
