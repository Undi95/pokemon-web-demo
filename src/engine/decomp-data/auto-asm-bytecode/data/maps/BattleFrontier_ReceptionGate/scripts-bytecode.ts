// AUTO-GENERATED from data/maps/BattleFrontier_ReceptionGate/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-05-16
// Stats: ops=214, bytes=1586, labels=39, unknownOps=0, unresolvedSymbols=46

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
  "BattleFrontier_ReceptionGate_EventScript_BattleTower": 864,
  "BattleFrontier_ReceptionGate_EventScript_BattleDome": 878,
  "BattleFrontier_ReceptionGate_EventScript_BattlePalace": 892,
  "BattleFrontier_ReceptionGate_EventScript_BattleArena": 906,
  "BattleFrontier_ReceptionGate_EventScript_BattleFactory": 920,
  "BattleFrontier_ReceptionGate_EventScript_BattlePike": 934,
  "BattleFrontier_ReceptionGate_EventScript_BattlePyramid": 948,
  "BattleFrontier_ReceptionGate_EventScript_RankingHall": 962,
  "BattleFrontier_ReceptionGate_EventScript_ExchangeCorner": 976,
  "BattleFrontier_ReceptionGate_EventScript_ExitFacilityGuide": 990,
  "BattleFrontier_ReceptionGate_EventScript_RulesGuide": 1000,
  "BattleFrontier_ReceptionGate_EventScript_ChooseRuleToLearnAbout": 1016,
  "BattleFrontier_ReceptionGate_EventScript_LevelMode": 1259,
  "BattleFrontier_ReceptionGate_EventScript_Level50": 1273,
  "BattleFrontier_ReceptionGate_EventScript_OpenLevel": 1287,
  "BattleFrontier_ReceptionGate_EventScript_MonEntry": 1301,
  "BattleFrontier_ReceptionGate_EventScript_HoldItems": 1315,
  "BattleFrontier_ReceptionGate_EventScript_ExitRulesGuide": 1329,
  "BattleFrontier_ReceptionGate_EventScript_FrontierPassGuide": 1339,
  "BattleFrontier_ReceptionGate_EventScript_ChooseFrontierPassInfoToLearnAbout": 1355,
  "BattleFrontier_ReceptionGate_EventScript_Symbols": 1534,
  "BattleFrontier_ReceptionGate_EventScript_RecordBattle": 1548,
  "BattleFrontier_ReceptionGate_EventScript_BattlePoints": 1562,
  "BattleFrontier_ReceptionGate_EventScript_ExitFrontierPassGuide": 1576,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [2,14,0,0,0,3,10,0,0,0,42,0,0,90,208,64,0,0,22,0,0,0,106,113,208,1,0,9,21,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,105,80,255,0,156,1,0,0,81,255,0,156,1,0,0,0,0,82,0,0,83,0,0,0,0,89,117,0,0,0,90,16,0,0,0,0,0,10,4,16,0,0,0,0,0,10,4,50,114,1,104,0,0,0,0,51,0,0,0,16,0,0,0,0,0,10,4,42,0,0,16,0,0,0,0,0,10,4,16,0,0,0,0,0,10,4,105,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,9,21,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,105,80,0,0,186,1,0,0,81,0,0,186,1,0,0,0,0,80,0,0,192,1,0,0,81,0,0,192,1,0,0,0,0,80,255,0,161,1,0,0,81,255,0,161,1,0,0,0,0,80,0,0,170,1,0,0,81,0,0,170,1,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,105,80,0,0,178,1,0,0,81,0,0,178,1,0,0,0,0,82,0,0,83,0,0,0,0,84,0,0,85,0,0,0,0,108,90,9,9,10,10,254,20,20,20,19,40,254,8,8,254,8,8,8,8,8,8,10,254,11,9,9,9,9,9,9,254,20,20,20,19,40,254,20,20,20,19,39,254,107,91,16,0,0,0,0,0,10,4,16,0,0,0,0,0,10,4,109,90,107,91,16,0,0,0,0,0,10,4,89,234,1,0,0,90,104,0,0,0,0,0,0,0,113,4,8,0,38,0,0,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,96,3,0,0,34,96,3,0,0,7,1,0,0,0,0,7,1,96,3,0,0,35,0,128,1,0,34,0,128,1,0,35,110,3,0,0,34,110,3,0,0,7,1,0,0,0,0,7,1,110,3,0,0,35,0,128,2,0,34,0,128,2,0,35,124,3,0,0,34,124,3,0,0,7,1,0,0,0,0,7,1,124,3,0,0,35,0,128,3,0,34,0,128,3,0,35,138,3,0,0,34,138,3,0,0,7,1,0,0,0,0,7,1,138,3,0,0,35,0,128,4,0,34,0,128,4,0,35,152,3,0,0,34,152,3,0,0,7,1,0,0,0,0,7,1,152,3,0,0,35,0,128,5,0,34,0,128,5,0,35,166,3,0,0,34,166,3,0,0,7,1,0,0,0,0,7,1,166,3,0,0,35,0,128,6,0,34,0,128,6,0,35,180,3,0,0,34,180,3,0,0,7,1,0,0,0,0,7,1,180,3,0,0,35,0,128,7,0,34,0,128,7,0,35,194,3,0,0,34,194,3,0,0,7,1,0,0,0,0,7,1,194,3,0,0,35,0,128,8,0,34,0,128,8,0,35,208,3,0,0,34,208,3,0,0,7,1,0,0,0,0,7,1,208,3,0,0,35,0,128,9,0,34,0,128,9,0,35,222,3,0,0,34,222,3,0,0,7,1,0,0,0,0,7,1,222,3,0,0,35,0,128,127,0,34,0,128,127,0,35,222,3,0,0,34,222,3,0,0,7,1,0,0,0,0,7,1,222,3,0,0,90,16,0,0,0,0,0,10,4,89,234,1,0,0,90,16,0,0,0,0,0,10,4,89,234,1,0,0,90,16,0,0,0,0,0,10,4,89,234,1,0,0,90,16,0,0,0,0,0,10,4,89,234,1,0,0,90,16,0,0,0,0,0,10,4,89,234,1,0,0,90,16,0,0,0,0,0,10,4,89,234,1,0,0,90,16,0,0,0,0,0,10,4,89,234,1,0,0,90,16,0,0,0,0,0,10,4,89,234,1,0,0,90,16,0,0,0,0,0,10,4,89,234,1,0,0,90,16,0,0,0,0,0,10,4,109,90,107,91,16,0,0,0,0,0,10,4,89,248,3,0,0,90,104,0,0,0,0,0,0,0,112,15,0,95,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,235,4,0,0,34,235,4,0,0,7,1,0,0,0,0,7,1,235,4,0,0,35,0,128,1,0,34,0,128,1,0,35,249,4,0,0,34,249,4,0,0,7,1,0,0,0,0,7,1,249,4,0,0,35,0,128,2,0,34,0,128,2,0,35,7,5,0,0,34,7,5,0,0,7,1,0,0,0,0,7,1,7,5,0,0,35,0,128,3,0,34,0,128,3,0,35,21,5,0,0,34,21,5,0,0,7,1,0,0,0,0,7,1,21,5,0,0,35,0,128,4,0,34,0,128,4,0,35,35,5,0,0,34,35,5,0,0,7,1,0,0,0,0,7,1,35,5,0,0,35,0,128,5,0,34,0,128,5,0,35,49,5,0,0,34,49,5,0,0,7,1,0,0,0,0,7,1,49,5,0,0,35,0,128,127,0,34,0,128,127,0,35,49,5,0,0,34,49,5,0,0,7,1,0,0,0,0,7,1,49,5,0,0,90,16,0,0,0,0,0,10,4,89,248,3,0,0,90,16,0,0,0,0,0,10,4,89,248,3,0,0,90,16,0,0,0,0,0,10,4,89,248,3,0,0,90,16,0,0,0,0,0,10,4,89,248,3,0,0,90,16,0,0,0,0,0,10,4,89,248,3,0,0,90,16,0,0,0,0,0,10,4,109,90,107,91,16,0,0,0,0,0,10,4,89,75,5,0,0,90,104,0,0,0,0,0,0,0,112,16,4,11,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,254,5,0,0,34,254,5,0,0,7,1,0,0,0,0,7,1,254,5,0,0,35,0,128,1,0,34,0,128,1,0,35,12,6,0,0,34,12,6,0,0,7,1,0,0,0,0,7,1,12,6,0,0,35,0,128,2,0,34,0,128,2,0,35,26,6,0,0,34,26,6,0,0,7,1,0,0,0,0,7,1,26,6,0,0,35,0,128,3,0,34,0,128,3,0,35,40,6,0,0,34,40,6,0,0,7,1,0,0,0,0,7,1,40,6,0,0,35,0,128,127,0,34,0,128,127,0,35,40,6,0,0,34,40,6,0,0,7,1,0,0,0,0,7,1,40,6,0,0,90,16,0,0,0,0,0,10,4,89,75,5,0,0,90,16,0,0,0,0,0,10,4,89,75,5,0,0,90,16,0,0,0,0,0,10,4,89,75,5,0,0,90,16,0,0,0,0,0,10,4,109,90] as const;

export const STATS = { ops: 214, bytes: 1586, labels: 39, unknownOps: 0, unresolvedSymbols: 46 } as const;
