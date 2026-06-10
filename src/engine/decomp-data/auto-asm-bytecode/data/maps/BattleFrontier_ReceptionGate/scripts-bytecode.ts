// AUTO-GENERATED from data/maps/BattleFrontier_ReceptionGate/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-06-10
// Stats: ops=214, bytes=1580, labels=39, unknownOps=0, unresolvedSymbols=65

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "BattleFrontier_ReceptionGate_MapScripts": 0,
  "BattleFrontier_ReceptionGate_OnTransition": 10,
  "BattleFrontier_ReceptionGate_OnFrame": 14,
  "BattleFrontier_ReceptionGate_EventScript_FirstTimeEntering": 22,
  "BattleFrontier_ReceptionGate_EventScript_ScottScene": 118,
  "BattleFrontier_ReceptionGate_Movement_PlayerApproachCounter": 411,
  "BattleFrontier_ReceptionGate_Movement_PlayerFaceScott": 416,
  "BattleFrontier_ReceptionGate_Movement_WalkDown": 422,
  "BattleFrontier_ReceptionGate_Movement_ScottEnter": 425,
  "BattleFrontier_ReceptionGate_Movement_ScottExit": 433,
  "BattleFrontier_ReceptionGate_Movement_GreeterFaceScott": 441,
  "BattleFrontier_ReceptionGate_Movement_FacilityGuideFaceScott": 447,
  "BattleFrontier_ReceptionGate_EventScript_Greeter": 453,
  "BattleFrontier_ReceptionGate_EventScript_FacilityGuide": 473,
  "BattleFrontier_ReceptionGate_EventScript_ChooseFacilityToLearnAbout": 489,
  "BattleFrontier_ReceptionGate_EventScript_BattleTower": 862,
  "BattleFrontier_ReceptionGate_EventScript_BattleDome": 876,
  "BattleFrontier_ReceptionGate_EventScript_BattlePalace": 890,
  "BattleFrontier_ReceptionGate_EventScript_BattleArena": 904,
  "BattleFrontier_ReceptionGate_EventScript_BattleFactory": 918,
  "BattleFrontier_ReceptionGate_EventScript_BattlePike": 932,
  "BattleFrontier_ReceptionGate_EventScript_BattlePyramid": 946,
  "BattleFrontier_ReceptionGate_EventScript_RankingHall": 960,
  "BattleFrontier_ReceptionGate_EventScript_ExchangeCorner": 974,
  "BattleFrontier_ReceptionGate_EventScript_ExitFacilityGuide": 988,
  "BattleFrontier_ReceptionGate_EventScript_RulesGuide": 998,
  "BattleFrontier_ReceptionGate_EventScript_ChooseRuleToLearnAbout": 1014,
  "BattleFrontier_ReceptionGate_EventScript_LevelMode": 1255,
  "BattleFrontier_ReceptionGate_EventScript_Level50": 1269,
  "BattleFrontier_ReceptionGate_EventScript_OpenLevel": 1283,
  "BattleFrontier_ReceptionGate_EventScript_MonEntry": 1297,
  "BattleFrontier_ReceptionGate_EventScript_HoldItems": 1311,
  "BattleFrontier_ReceptionGate_EventScript_ExitRulesGuide": 1325,
  "BattleFrontier_ReceptionGate_EventScript_FrontierPassGuide": 1335,
  "BattleFrontier_ReceptionGate_EventScript_ChooseFrontierPassInfoToLearnAbout": 1351,
  "BattleFrontier_ReceptionGate_EventScript_Symbols": 1528,
  "BattleFrontier_ReceptionGate_EventScript_RecordBattle": 1542,
  "BattleFrontier_ReceptionGate_EventScript_BattlePoints": 1556,
  "BattleFrontier_ReceptionGate_EventScript_ExitFrontierPassGuide": 1570,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [0,14,0,0,0,0,10,0,0,0,42,0,0,3,0,0,0,0,22,0,0,0,106,23,0,0,1,0,48,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,105,80,0,0,155,1,0,0,81,0,0,155,1,0,0,0,0,82,0,0,83,0,0,0,0,6,118,0,0,0,3,16,0,0,0,0,0,10,4,16,0,0,0,0,0,10,4,50,0,0,104,0,0,0,0,51,103,16,0,0,0,0,0,10,4,42,0,0,16,0,0,0,0,0,10,4,16,0,0,0,0,0,10,4,105,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,48,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,105,80,0,0,185,1,0,0,81,0,0,185,1,0,0,0,0,80,0,0,191,1,0,0,81,0,0,191,1,0,0,0,0,80,0,0,160,1,0,0,81,0,0,160,1,0,0,0,0,80,0,0,169,1,0,0,81,0,0,169,1,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,105,80,0,0,177,1,0,0,81,0,0,177,1,0,0,0,0,82,0,0,83,0,0,0,0,84,0,0,85,0,0,0,0,108,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,107,91,16,0,0,0,0,0,10,4,16,0,0,0,0,0,10,4,109,3,107,91,16,0,0,0,0,0,10,4,6,233,1,0,0,3,104,0,0,0,0,103,23,0,0,0,0,38,0,0,0,26,0,0,0,0,35,0,0,0,0,34,0,0,0,0,35,94,3,0,0,34,94,3,0,0,7,1,0,0,0,0,7,1,94,3,0,0,35,0,0,1,0,34,0,0,1,0,35,108,3,0,0,34,108,3,0,0,7,1,0,0,0,0,7,1,108,3,0,0,35,0,0,2,0,34,0,0,2,0,35,122,3,0,0,34,122,3,0,0,7,1,0,0,0,0,7,1,122,3,0,0,35,0,0,3,0,34,0,0,3,0,35,136,3,0,0,34,136,3,0,0,7,1,0,0,0,0,7,1,136,3,0,0,35,0,0,4,0,34,0,0,4,0,35,150,3,0,0,34,150,3,0,0,7,1,0,0,0,0,7,1,150,3,0,0,35,0,0,5,0,34,0,0,5,0,35,164,3,0,0,34,164,3,0,0,7,1,0,0,0,0,7,1,164,3,0,0,35,0,0,6,0,34,0,0,6,0,35,178,3,0,0,34,178,3,0,0,7,1,0,0,0,0,7,1,178,3,0,0,35,0,0,7,0,34,0,0,7,0,35,192,3,0,0,34,192,3,0,0,7,1,0,0,0,0,7,1,192,3,0,0,35,0,0,8,0,34,0,0,8,0,35,206,3,0,0,34,206,3,0,0,7,1,0,0,0,0,7,1,206,3,0,0,35,0,0,9,0,34,0,0,9,0,35,220,3,0,0,34,220,3,0,0,7,1,0,0,0,0,7,1,220,3,0,0,35,0,0,0,0,34,0,0,0,0,35,220,3,0,0,34,220,3,0,0,7,1,0,0,0,0,7,1,220,3,0,0,3,16,0,0,0,0,0,10,4,6,233,1,0,0,3,16,0,0,0,0,0,10,4,6,233,1,0,0,3,16,0,0,0,0,0,10,4,6,233,1,0,0,3,16,0,0,0,0,0,10,4,6,233,1,0,0,3,16,0,0,0,0,0,10,4,6,233,1,0,0,3,16,0,0,0,0,0,10,4,6,233,1,0,0,3,16,0,0,0,0,0,10,4,6,233,1,0,0,3,16,0,0,0,0,0,10,4,6,233,1,0,0,3,16,0,0,0,0,0,10,4,6,233,1,0,0,3,16,0,0,0,0,0,10,4,109,3,107,91,16,0,0,0,0,0,10,4,6,246,3,0,0,3,104,0,0,0,0,103,112,15,0,0,0,26,0,0,0,0,35,0,0,0,0,34,0,0,0,0,35,231,4,0,0,34,231,4,0,0,7,1,0,0,0,0,7,1,231,4,0,0,35,0,0,1,0,34,0,0,1,0,35,245,4,0,0,34,245,4,0,0,7,1,0,0,0,0,7,1,245,4,0,0,35,0,0,2,0,34,0,0,2,0,35,3,5,0,0,34,3,5,0,0,7,1,0,0,0,0,7,1,3,5,0,0,35,0,0,3,0,34,0,0,3,0,35,17,5,0,0,34,17,5,0,0,7,1,0,0,0,0,7,1,17,5,0,0,35,0,0,4,0,34,0,0,4,0,35,31,5,0,0,34,31,5,0,0,7,1,0,0,0,0,7,1,31,5,0,0,35,0,0,5,0,34,0,0,5,0,35,45,5,0,0,34,45,5,0,0,7,1,0,0,0,0,7,1,45,5,0,0,35,0,0,0,0,34,0,0,0,0,35,45,5,0,0,34,45,5,0,0,7,1,0,0,0,0,7,1,45,5,0,0,3,16,0,0,0,0,0,10,4,6,246,3,0,0,3,16,0,0,0,0,0,10,4,6,246,3,0,0,3,16,0,0,0,0,0,10,4,6,246,3,0,0,3,16,0,0,0,0,0,10,4,6,246,3,0,0,3,16,0,0,0,0,0,10,4,6,246,3,0,0,3,16,0,0,0,0,0,10,4,109,3,107,91,16,0,0,0,0,0,10,4,6,71,5,0,0,3,104,0,0,0,0,103,112,16,4,0,0,26,0,0,0,0,35,0,0,0,0,34,0,0,0,0,35,248,5,0,0,34,248,5,0,0,7,1,0,0,0,0,7,1,248,5,0,0,35,0,0,1,0,34,0,0,1,0,35,6,6,0,0,34,6,6,0,0,7,1,0,0,0,0,7,1,6,6,0,0,35,0,0,2,0,34,0,0,2,0,35,20,6,0,0,34,20,6,0,0,7,1,0,0,0,0,7,1,20,6,0,0,35,0,0,3,0,34,0,0,3,0,35,34,6,0,0,34,34,6,0,0,7,1,0,0,0,0,7,1,34,6,0,0,35,0,0,0,0,34,0,0,0,0,35,34,6,0,0,34,34,6,0,0,7,1,0,0,0,0,7,1,34,6,0,0,3,16,0,0,0,0,0,10,4,6,71,5,0,0,3,16,0,0,0,0,0,10,4,6,71,5,0,0,3,16,0,0,0,0,0,10,4,6,71,5,0,0,3,16,0,0,0,0,0,10,4,109,3] as const;

export const STATS = { ops: 214, bytes: 1580, labels: 39, unknownOps: 0, unresolvedSymbols: 65 } as const;
