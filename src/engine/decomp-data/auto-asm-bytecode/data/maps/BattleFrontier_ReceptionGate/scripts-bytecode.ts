// AUTO-GENERATED from data/maps/BattleFrontier_ReceptionGate/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=214, bytes=793, labels=39, unknownOps=11, unresolvedSymbols=47

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "BattleFrontier_ReceptionGate_MapScripts": 0,
  "BattleFrontier_ReceptionGate_OnTransition": 10,
  "BattleFrontier_ReceptionGate_OnFrame": 14,
  "BattleFrontier_ReceptionGate_EventScript_FirstTimeEntering": 22,
  "BattleFrontier_ReceptionGate_EventScript_ScottScene": 117,
  "BattleFrontier_ReceptionGate_Movement_PlayerApproachCounter": 412,
  "BattleFrontier_ReceptionGate_Movement_PlayerFaceScott": 412,
  "BattleFrontier_ReceptionGate_Movement_WalkDown": 412,
  "BattleFrontier_ReceptionGate_Movement_ScottEnter": 412,
  "BattleFrontier_ReceptionGate_Movement_ScottExit": 412,
  "BattleFrontier_ReceptionGate_Movement_GreeterFaceScott": 412,
  "BattleFrontier_ReceptionGate_Movement_FacilityGuideFaceScott": 412,
  "BattleFrontier_ReceptionGate_EventScript_Greeter": 412,
  "BattleFrontier_ReceptionGate_EventScript_FacilityGuide": 432,
  "BattleFrontier_ReceptionGate_EventScript_ChooseFacilityToLearnAbout": 448,
  "BattleFrontier_ReceptionGate_EventScript_BattleTower": 465,
  "BattleFrontier_ReceptionGate_EventScript_BattleDome": 479,
  "BattleFrontier_ReceptionGate_EventScript_BattlePalace": 493,
  "BattleFrontier_ReceptionGate_EventScript_BattleArena": 507,
  "BattleFrontier_ReceptionGate_EventScript_BattleFactory": 521,
  "BattleFrontier_ReceptionGate_EventScript_BattlePike": 535,
  "BattleFrontier_ReceptionGate_EventScript_BattlePyramid": 549,
  "BattleFrontier_ReceptionGate_EventScript_RankingHall": 563,
  "BattleFrontier_ReceptionGate_EventScript_ExchangeCorner": 577,
  "BattleFrontier_ReceptionGate_EventScript_ExitFacilityGuide": 591,
  "BattleFrontier_ReceptionGate_EventScript_RulesGuide": 601,
  "BattleFrontier_ReceptionGate_EventScript_ChooseRuleToLearnAbout": 617,
  "BattleFrontier_ReceptionGate_EventScript_LevelMode": 631,
  "BattleFrontier_ReceptionGate_EventScript_Level50": 645,
  "BattleFrontier_ReceptionGate_EventScript_OpenLevel": 659,
  "BattleFrontier_ReceptionGate_EventScript_MonEntry": 673,
  "BattleFrontier_ReceptionGate_EventScript_HoldItems": 687,
  "BattleFrontier_ReceptionGate_EventScript_ExitRulesGuide": 701,
  "BattleFrontier_ReceptionGate_EventScript_FrontierPassGuide": 711,
  "BattleFrontier_ReceptionGate_EventScript_ChooseFrontierPassInfoToLearnAbout": 727,
  "BattleFrontier_ReceptionGate_EventScript_Symbols": 741,
  "BattleFrontier_ReceptionGate_EventScript_RecordBattle": 755,
  "BattleFrontier_ReceptionGate_EventScript_BattlePoints": 769,
  "BattleFrontier_ReceptionGate_EventScript_ExitFrontierPassGuide": 783,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [2,14,0,0,0,3,10,0,0,0,42,0,0,90,208,64,0,0,22,0,0,0,106,113,208,1,0,9,21,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,105,80,255,0,156,1,0,0,81,255,0,156,1,0,0,0,0,82,0,0,83,0,0,0,0,89,117,0,0,0,90,16,0,0,0,0,0,10,0,16,0,0,0,0,0,10,0,50,114,1,104,0,0,0,0,51,0,0,0,16,0,0,0,0,0,10,0,42,0,0,16,0,0,0,0,0,10,0,16,0,0,0,0,0,10,0,105,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,9,21,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,105,80,0,0,156,1,0,0,81,0,0,156,1,0,0,0,0,80,0,0,156,1,0,0,81,0,0,156,1,0,0,0,0,80,255,0,156,1,0,0,81,255,0,156,1,0,0,0,0,80,0,0,156,1,0,0,81,0,0,156,1,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,105,80,0,0,156,1,0,0,81,0,0,156,1,0,0,0,0,82,0,0,83,0,0,0,0,84,0,0,85,0,0,0,0,108,90,107,91,16,0,0,0,0,0,10,0,16,0,0,0,0,0,10,0,109,90,107,91,16,0,0,0,0,0,10,0,89,192,1,0,0,90,104,0,0,0,0,0,0,0,113,4,8,0,38,0,0,0,90,16,0,0,0,0,0,10,0,89,192,1,0,0,90,16,0,0,0,0,0,10,0,89,192,1,0,0,90,16,0,0,0,0,0,10,0,89,192,1,0,0,90,16,0,0,0,0,0,10,0,89,192,1,0,0,90,16,0,0,0,0,0,10,0,89,192,1,0,0,90,16,0,0,0,0,0,10,0,89,192,1,0,0,90,16,0,0,0,0,0,10,0,89,192,1,0,0,90,16,0,0,0,0,0,10,0,89,192,1,0,0,90,16,0,0,0,0,0,10,0,89,192,1,0,0,90,16,0,0,0,0,0,10,0,109,90,107,91,16,0,0,0,0,0,10,0,89,105,2,0,0,90,104,0,0,0,0,0,0,0,112,15,0,95,0,90,16,0,0,0,0,0,10,0,89,105,2,0,0,90,16,0,0,0,0,0,10,0,89,105,2,0,0,90,16,0,0,0,0,0,10,0,89,105,2,0,0,90,16,0,0,0,0,0,10,0,89,105,2,0,0,90,16,0,0,0,0,0,10,0,89,105,2,0,0,90,16,0,0,0,0,0,10,0,109,90,107,91,16,0,0,0,0,0,10,0,89,215,2,0,0,90,104,0,0,0,0,0,0,0,112,16,4,11,0,90,16,0,0,0,0,0,10,0,89,215,2,0,0,90,16,0,0,0,0,0,10,0,89,215,2,0,0,90,16,0,0,0,0,0,10,0,89,215,2,0,0,90,16,0,0,0,0,0,10,0,109,90] as const;

export const STATS = { ops: 214, bytes: 793, labels: 39, unknownOps: 11, unresolvedSymbols: 47 } as const;
