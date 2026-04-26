// AUTO-GENERATED from data/maps/BattleFrontier_ReceptionGate/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=214, bytes=1310, labels=39, unknownOps=2, unresolvedSymbols=47

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "BattleFrontier_ReceptionGate_MapScripts": 0,
  "BattleFrontier_ReceptionGate_OnTransition": 10,
  "BattleFrontier_ReceptionGate_OnFrame": 14,
  "BattleFrontier_ReceptionGate_EventScript_FirstTimeEntering": 22,
  "BattleFrontier_ReceptionGate_EventScript_ScottScene": 117,
  "BattleFrontier_ReceptionGate_Movement_PlayerApproachCounter": 412,
  "BattleFrontier_ReceptionGate_Movement_PlayerFaceScott": 417,
  "BattleFrontier_ReceptionGate_Movement_WalkDown": 423,
  "BattleFrontier_ReceptionGate_Movement_ScottEnter": 426,
  "BattleFrontier_ReceptionGate_Movement_ScottExit": 434,
  "BattleFrontier_ReceptionGate_Movement_GreeterFaceScott": 442,
  "BattleFrontier_ReceptionGate_Movement_FacilityGuideFaceScott": 448,
  "BattleFrontier_ReceptionGate_EventScript_Greeter": 454,
  "BattleFrontier_ReceptionGate_EventScript_FacilityGuide": 474,
  "BattleFrontier_ReceptionGate_EventScript_ChooseFacilityToLearnAbout": 490,
  "BattleFrontier_ReceptionGate_EventScript_BattleTower": 732,
  "BattleFrontier_ReceptionGate_EventScript_BattleDome": 746,
  "BattleFrontier_ReceptionGate_EventScript_BattlePalace": 760,
  "BattleFrontier_ReceptionGate_EventScript_BattleArena": 774,
  "BattleFrontier_ReceptionGate_EventScript_BattleFactory": 788,
  "BattleFrontier_ReceptionGate_EventScript_BattlePike": 802,
  "BattleFrontier_ReceptionGate_EventScript_BattlePyramid": 816,
  "BattleFrontier_ReceptionGate_EventScript_RankingHall": 830,
  "BattleFrontier_ReceptionGate_EventScript_ExchangeCorner": 844,
  "BattleFrontier_ReceptionGate_EventScript_ExitFacilityGuide": 858,
  "BattleFrontier_ReceptionGate_EventScript_RulesGuide": 868,
  "BattleFrontier_ReceptionGate_EventScript_ChooseRuleToLearnAbout": 884,
  "BattleFrontier_ReceptionGate_EventScript_LevelMode": 1043,
  "BattleFrontier_ReceptionGate_EventScript_Level50": 1057,
  "BattleFrontier_ReceptionGate_EventScript_OpenLevel": 1071,
  "BattleFrontier_ReceptionGate_EventScript_MonEntry": 1085,
  "BattleFrontier_ReceptionGate_EventScript_HoldItems": 1099,
  "BattleFrontier_ReceptionGate_EventScript_ExitRulesGuide": 1113,
  "BattleFrontier_ReceptionGate_EventScript_FrontierPassGuide": 1123,
  "BattleFrontier_ReceptionGate_EventScript_ChooseFrontierPassInfoToLearnAbout": 1139,
  "BattleFrontier_ReceptionGate_EventScript_Symbols": 1258,
  "BattleFrontier_ReceptionGate_EventScript_RecordBattle": 1272,
  "BattleFrontier_ReceptionGate_EventScript_BattlePoints": 1286,
  "BattleFrontier_ReceptionGate_EventScript_ExitFrontierPassGuide": 1300,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [2,14,0,0,0,3,10,0,0,0,42,0,0,90,208,64,0,0,22,0,0,0,106,113,208,1,0,9,21,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,105,80,255,0,156,1,0,0,81,255,0,156,1,0,0,0,0,82,0,0,83,0,0,0,0,89,117,0,0,0,90,16,0,0,0,0,0,10,0,16,0,0,0,0,0,10,0,50,114,1,104,0,0,0,0,51,0,0,0,16,0,0,0,0,0,10,0,42,0,0,16,0,0,0,0,0,10,0,16,0,0,0,0,0,10,0,105,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,9,21,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,105,80,0,0,186,1,0,0,81,0,0,186,1,0,0,0,0,80,0,0,192,1,0,0,81,0,0,192,1,0,0,0,0,80,255,0,161,1,0,0,81,255,0,161,1,0,0,0,0,80,0,0,170,1,0,0,81,0,0,170,1,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,105,80,0,0,178,1,0,0,81,0,0,178,1,0,0,0,0,82,0,0,83,0,0,0,0,84,0,0,85,0,0,0,0,108,90,9,9,10,10,254,20,20,20,19,40,254,8,8,254,8,8,8,8,8,8,10,254,11,9,9,9,9,9,9,254,20,20,20,19,40,254,20,20,20,19,39,254,107,91,16,0,0,0,0,0,10,0,16,0,0,0,0,0,10,0,109,90,107,91,16,0,0,0,0,0,10,0,89,234,1,0,0,90,104,0,0,0,0,0,0,0,113,4,8,0,38,0,0,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,220,2,0,0,34,220,2,0,0,35,0,128,1,0,34,0,128,1,0,35,234,2,0,0,34,234,2,0,0,35,0,128,2,0,34,0,128,2,0,35,248,2,0,0,34,248,2,0,0,35,0,128,3,0,34,0,128,3,0,35,6,3,0,0,34,6,3,0,0,35,0,128,4,0,34,0,128,4,0,35,20,3,0,0,34,20,3,0,0,35,0,128,5,0,34,0,128,5,0,35,34,3,0,0,34,34,3,0,0,35,0,128,6,0,34,0,128,6,0,35,48,3,0,0,34,48,3,0,0,35,0,128,7,0,34,0,128,7,0,35,62,3,0,0,34,62,3,0,0,35,0,128,8,0,34,0,128,8,0,35,76,3,0,0,34,76,3,0,0,35,0,128,9,0,34,0,128,9,0,35,90,3,0,0,34,90,3,0,0,35,0,128,127,0,34,0,128,127,0,35,90,3,0,0,34,90,3,0,0,90,16,0,0,0,0,0,10,0,89,234,1,0,0,90,16,0,0,0,0,0,10,0,89,234,1,0,0,90,16,0,0,0,0,0,10,0,89,234,1,0,0,90,16,0,0,0,0,0,10,0,89,234,1,0,0,90,16,0,0,0,0,0,10,0,89,234,1,0,0,90,16,0,0,0,0,0,10,0,89,234,1,0,0,90,16,0,0,0,0,0,10,0,89,234,1,0,0,90,16,0,0,0,0,0,10,0,89,234,1,0,0,90,16,0,0,0,0,0,10,0,89,234,1,0,0,90,16,0,0,0,0,0,10,0,109,90,107,91,16,0,0,0,0,0,10,0,89,116,3,0,0,90,104,0,0,0,0,0,0,0,112,15,0,95,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,19,4,0,0,34,19,4,0,0,35,0,128,1,0,34,0,128,1,0,35,33,4,0,0,34,33,4,0,0,35,0,128,2,0,34,0,128,2,0,35,47,4,0,0,34,47,4,0,0,35,0,128,3,0,34,0,128,3,0,35,61,4,0,0,34,61,4,0,0,35,0,128,4,0,34,0,128,4,0,35,75,4,0,0,34,75,4,0,0,35,0,128,5,0,34,0,128,5,0,35,89,4,0,0,34,89,4,0,0,35,0,128,127,0,34,0,128,127,0,35,89,4,0,0,34,89,4,0,0,90,16,0,0,0,0,0,10,0,89,116,3,0,0,90,16,0,0,0,0,0,10,0,89,116,3,0,0,90,16,0,0,0,0,0,10,0,89,116,3,0,0,90,16,0,0,0,0,0,10,0,89,116,3,0,0,90,16,0,0,0,0,0,10,0,89,116,3,0,0,90,16,0,0,0,0,0,10,0,109,90,107,91,16,0,0,0,0,0,10,0,89,115,4,0,0,90,104,0,0,0,0,0,0,0,112,16,4,11,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,234,4,0,0,34,234,4,0,0,35,0,128,1,0,34,0,128,1,0,35,248,4,0,0,34,248,4,0,0,35,0,128,2,0,34,0,128,2,0,35,6,5,0,0,34,6,5,0,0,35,0,128,3,0,34,0,128,3,0,35,20,5,0,0,34,20,5,0,0,35,0,128,127,0,34,0,128,127,0,35,20,5,0,0,34,20,5,0,0,90,16,0,0,0,0,0,10,0,89,115,4,0,0,90,16,0,0,0,0,0,10,0,89,115,4,0,0,90,16,0,0,0,0,0,10,0,89,115,4,0,0,90,16,0,0,0,0,0,10,0,109,90] as const;

export const STATS = { ops: 214, bytes: 1310, labels: 39, unknownOps: 2, unresolvedSymbols: 47 } as const;
