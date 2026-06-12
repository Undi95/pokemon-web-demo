// AUTO-GENERATED from data/maps/SlateportCity_Harbor/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-06-12
// Stats: ops=279, bytes=1887, labels=50, unknownOps=0, unresolvedSymbols=45

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "SlateportCity_Harbor_MapScripts": 0,
  "SlateportCity_Harbor_OnTransition": 5,
  "SlateportCity_Harbor_EventScript_ShowSSTidal": 65,
  "SlateportCity_Harbor_EventScript_ReadyAquaEscapeScene": 69,
  "SlateportCity_Harbor_EventScript_AquaEscapeTrigger0": 87,
  "SlateportCity_Harbor_EventScript_AquaEscapeTrigger1": 99,
  "SlateportCity_Harbor_EventScript_AquaEscapeTrigger2": 111,
  "SlateportCity_Harbor_EventScript_AquaEscapeTrigger3": 123,
  "SlateportCity_Harbor_EventScript_AquaEscapeScene": 159,
  "SlateportCity_Harbor_EventScript_SternApproachPlayer0": 435,
  "SlateportCity_Harbor_EventScript_SternApproachPlayer1": 484,
  "SlateportCity_Harbor_EventScript_SternApproachPlayer": 533,
  "SlateportCity_Harbor_Movement_AquaBoardSub": 582,
  "SlateportCity_Harbor_Movement_ArchieBoardSub": 587,
  "SlateportCity_Harbor_Movement_SubmarineExit": 592,
  "SlateportCity_Harbor_Movement_SternApproachPlayer0": 606,
  "SlateportCity_Harbor_Movement_SternApproachPlayer1": 612,
  "SlateportCity_Harbor_Movement_SternApproachPlayer": 617,
  "SlateportCity_Harbor_Movement_PlayerWalkUp": 621,
  "SlateportCity_Harbor_EventScript_FerryAttendant": 623,
  "SlateportCity_Harbor_EventScript_AskForTicket": 644,
  "SlateportCity_Harbor_EventScript_ChooseDestination": 664,
  "SlateportCity_Harbor_EventScript_ChooseDestinationWithBattleFrontier": 781,
  "SlateportCity_Harbor_EventScript_NoTicket": 921,
  "SlateportCity_Harbor_EventScript_Lilycove": 931,
  "SlateportCity_Harbor_EventScript_BattleFrontier": 997,
  "SlateportCity_Harbor_EventScript_ChooseNewDestination": 1058,
  "SlateportCity_Harbor_EventScript_BoardFerry": 1070,
  "SlateportCity_Harbor_EventScript_CancelDestinationSelect": 1174,
  "SlateportCity_Harbor_EventScript_BoardFerryEast": 1184,
  "SlateportCity_Harbor_EventScript_BoardFerryNorth": 1209,
  "SlateportCity_Harbor_Movement_BoardFerryEast": 1234,
  "SlateportCity_Harbor_Movement_BoardFerryNorth": 1237,
  "SlateportCity_Harbor_EventScript_Sailor": 1239,
  "SlateportCity_Harbor_EventScript_SailorNoAbnormalWeather": 1305,
  "SlateportCity_Harbor_EventScript_CountDefeatedLegendary": 1315,
  "SlateportCity_Harbor_EventScript_FatMan": 1321,
  "SlateportCity_Harbor_EventScript_CaptStern": 1330,
  "SlateportCity_Harbor_EventScript_WhyStealSubmarine": 1416,
  "SlateportCity_Harbor_EventScript_TeamAquaLeftNeedDive": 1426,
  "SlateportCity_Harbor_EventScript_NeedDive": 1439,
  "SlateportCity_Harbor_EventScript_CaptSternFerryOrScannerComment": 1449,
  "SlateportCity_Harbor_EventScript_FerryFinished": 1517,
  "SlateportCity_Harbor_EventScript_AskToTradeScanner": 1527,
  "SlateportCity_Harbor_EventScript_ChooseScannerTrade": 1539,
  "SlateportCity_Harbor_EventScript_DeepSeaTooth": 1678,
  "SlateportCity_Harbor_EventScript_DeepSeaScale": 1764,
  "SlateportCity_Harbor_EventScript_DeclineTrade": 1850,
  "SlateportCity_Harbor_EventScript_ChooseDifferentTrade": 1860,
  "SlateportCity_Harbor_EventScript_TradedScanner": 1872,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [3,5,0,0,0,197,0,0,255,255,255,255,255,28,255,255,255,255,255,28,0,13,0,28,13,0,0,0,23,0,0,0,0,35,160,64,1,0,34,160,64,1,0,8,1,69,0,0,0,8,1,160,64,0,0,44,0,0,8,1,65,0,0,0,3,43,92,3,4,53,163,1,100,0,0,12,0,13,0,102,0,0,9,42,137,3,4,106,23,8,128,0,0,6,159,0,0,0,3,106,23,8,128,1,0,6,159,0,0,0,3,106,23,8,128,2,0,6,159,0,0,0,3,106,23,8,128,3,0,80,255,0,109,2,0,0,81,255,0,109,2,0,0,0,0,82,0,0,83,0,0,0,0,6,159,0,0,0,3,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,105,80,0,0,70,2,0,0,81,0,0,70,2,0,0,0,0,80,0,0,70,2,0,0,81,0,0,70,2,0,0,0,0,80,0,0,80,2,0,0,81,0,0,80,2,0,0,0,0,82,0,0,83,0,0,0,0,84,0,0,85,0,0,0,0,84,0,0,85,0,0,0,0,84,0,0,85,0,0,0,0,23,160,64,2,0,42,97,0,42,19,3,35,8,128,0,0,34,8,128,0,0,8,1,179,1,0,0,8,1,8,128,0,0,35,8,128,1,0,34,8,128,1,0,8,1,228,1,0,0,8,1,8,128,0,0,35,8,128,2,0,34,8,128,2,0,8,1,21,2,0,0,8,1,8,128,0,0,35,8,128,3,0,34,8,128,3,0,8,1,21,2,0,0,8,1,8,128,0,0,16,0,0,0,0,0,10,4,105,42,53,3,42,54,3,101,0,0,102,0,0,10,108,3,80,0,0,94,2,0,0,81,0,0,94,2,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,4,80,0,0,100,2,0,0,81,0,0,100,2,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,4,80,0,0,105,2,0,0,81,0,0,105,2,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,4,20,20,67,84,254,20,20,67,84,254,20,20,20,20,11,11,11,24,24,24,24,24,24,254,10,10,10,10,9,254,10,10,9,10,254,10,10,10,254,9,254,107,91,44,0,0,7,1,132,2,0,0,16,0,0,0,0,0,10,4,109,3,16,0,0,0,0,0,10,4,104,0,0,0,0,103,6,152,2,0,0,3,44,208,1,7,1,13,3,0,0,113,18,8,56,2,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,163,3,0,0,34,163,3,0,0,7,1,0,0,0,0,7,1,163,3,0,0,35,0,128,1,0,34,0,128,1,0,35,150,4,0,0,34,150,4,0,0,7,1,0,0,0,0,7,1,150,4,0,0,35,0,128,127,0,34,0,128,127,0,35,150,4,0,0,34,150,4,0,0,7,1,0,0,0,0,7,1,150,4,0,0,3,113,17,6,52,2,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,163,3,0,0,34,163,3,0,0,7,1,0,0,0,0,7,1,163,3,0,0,35,0,128,1,0,34,0,128,1,0,35,229,3,0,0,34,229,3,0,0,7,1,0,0,0,0,7,1,229,3,0,0,35,0,128,2,0,34,0,128,2,0,35,150,4,0,0,34,150,4,0,0,7,1,0,0,0,0,7,1,150,4,0,0,35,0,128,127,0,34,0,128,127,0,35,150,4,0,0,34,150,4,0,0,7,1,0,0,0,0,7,1,150,4,0,0,3,16,0,0,0,0,0,10,4,109,3,16,0,0,0,0,0,10,5,35,13,128,0,0,34,13,128,0,0,7,1,34,4,0,0,7,1,13,128,0,0,23,180,64,1,0,5,46,4,0,0,58,0,0,255,255,255,255,255,1,255,255,255,255,255,1,0,10,0,1,10,0,0,0,58,109,3,16,0,0,0,0,0,10,5,35,13,128,0,0,34,13,128,0,0,7,1,34,4,0,0,7,1,13,128,0,0,5,46,4,0,0,58,0,0,255,255,255,255,255,19,255,255,255,255,255,19,0,67,0,19,67,0,0,0,58,109,3,104,0,0,0,0,103,6,152,2,0,0,3,16,0,0,0,0,0,10,4,105,80,15,128,0,0,0,0,81,15,128,0,0,0,0,0,0,82,0,0,83,0,0,0,0,41,30,0,90,15,128,0,0,35,12,128,2,0,34,12,128,2,0,8,1,185,4,0,0,8,1,12,128,0,0,35,12,128,4,0,34,12,128,4,0,8,1,160,4,0,0,8,1,12,128,0,0,41,30,0,90,255,0,0,0,23,4,128,0,0,5,0,0,0,0,4,16,0,0,0,0,0,10,4,109,3,80,255,0,210,4,0,0,81,255,0,210,4,0,0,0,0,82,0,0,83,0,0,0,0,4,80,255,0,213,4,0,0,81,255,0,213,4,0,0,0,0,82,0,0,83,0,0,0,0,4,11,38,254,9,254,107,91,44,0,0,7,0,25,5,0,0,23,4,128,0,0,44,190,1,8,1,35,5,0,0,44,191,1,8,1,35,5,0,0,35,4,128,2,0,34,4,128,2,0,7,1,25,5,0,0,7,1,4,128,0,0,16,0,0,0,0,0,10,4,109,3,16,0,0,0,0,0,10,4,109,3,24,4,128,1,0,4,16,0,0,0,0,0,10,2,3,107,91,44,0,0,7,1,169,5,0,0,44,15,1,7,1,159,5,0,0,44,112,0,7,1,146,5,0,0,35,160,64,2,0,34,160,64,2,0,7,1,136,5,0,0,7,1,160,64,0,0,16,0,0,0,0,0,10,4,105,80,15,128,0,0,0,0,81,15,128,0,0,0,0,0,0,82,0,0,83,0,0,0,0,109,3,16,0,0,0,0,0,10,4,109,3,42,15,1,16,0,0,0,0,0,10,4,109,3,16,0,0,0,0,0,10,4,109,3,35,0,0,1,0,34,0,0,1,0,7,1,80,7,0,0,7,1,0,0,0,0,72,22,1,1,0,35,13,128,1,0,34,13,128,1,0,7,1,247,5,0,0,7,1,13,128,0,0,44,0,0,7,1,237,5,0,0,16,0,0,0,0,0,10,4,109,3,16,0,0,0,0,0,10,4,109,3,104,0,0,0,0,103,6,3,6,0,0,3,112,0,0,46,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,142,6,0,0,34,142,6,0,0,7,1,0,0,0,0,7,1,142,6,0,0,35,0,128,1,0,34,0,128,1,0,35,228,6,0,0,34,228,6,0,0,7,1,0,0,0,0,7,1,228,6,0,0,35,0,128,2,0,34,0,128,2,0,35,58,7,0,0,34,58,7,0,0,7,1,0,0,0,0,7,1,58,7,0,0,35,0,128,127,0,34,0,128,127,0,35,58,7,0,0,34,58,7,0,0,7,1,0,0,0,0,7,1,58,7,0,0,3,16,0,0,0,0,0,10,5,35,13,128,0,0,34,13,128,0,0,7,1,68,7,0,0,7,1,13,128,0,0,27,0,128,192,0,27,1,128,1,0,10,0,35,13,128,0,0,34,13,128,0,0,7,1,0,0,0,0,7,1,13,128,0,0,70,22,1,1,0,16,0,0,0,0,0,10,4,42,38,1,6,80,7,0,0,3,16,0,0,0,0,0,10,5,35,13,128,0,0,34,13,128,0,0,7,1,68,7,0,0,7,1,13,128,0,0,27,0,128,193,0,27,1,128,1,0,10,0,35,13,128,0,0,34,13,128,0,0,7,1,0,0,0,0,7,1,13,128,0,0,70,22,1,1,0,16,0,0,0,0,0,10,4,42,38,1,6,80,7,0,0,3,16,0,0,0,0,0,10,4,109,3,104,0,0,0,0,103,6,3,6,0,0,3,23,0,0,1,0,16,0,0,0,0,0,10,4,109,3] as const;

export const STATS = { ops: 279, bytes: 1887, labels: 50, unknownOps: 0, unresolvedSymbols: 45 } as const;
