// AUTO-GENERATED from data/maps/BattleFrontier_OutsideEast/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=149, bytes=552, labels=41, unknownOps=2, unresolvedSymbols=44

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "BattleFrontier_OutsideEast_MapScripts": 0,
  "BattleFrontier_OutsideEast_OnResume": 10,
  "BattleFrontier_OutsideEast_EventScript_TryRemoveSudowoodo": 20,
  "BattleFrontier_OutsideEast_OnTransition": 45,
  "BattleFrontier_OutsideEast_EventScript_ShowSudowoodo": 62,
  "BattleFrontier_OutsideEast_EventScript_BattleTowerSign": 66,
  "BattleFrontier_OutsideEast_EventScript_BattlePalaceSign": 75,
  "BattleFrontier_OutsideEast_EventScript_BattleArenaSign": 84,
  "BattleFrontier_OutsideEast_EventScript_BattlePyramidSign": 93,
  "BattleFrontier_OutsideEast_EventScript_NinjaBoy": 102,
  "BattleFrontier_OutsideEast_EventScript_Man1": 111,
  "BattleFrontier_OutsideEast_EventScript_Hiker": 120,
  "BattleFrontier_OutsideEast_EventScript_HexManiac": 129,
  "BattleFrontier_OutsideEast_EventScript_BlackBelt1": 138,
  "BattleFrontier_OutsideEast_EventScript_Cook": 147,
  "BattleFrontier_OutsideEast_EventScript_Zigzagoon": 158,
  "BattleFrontier_OutsideEast_EventScript_RichBoy": 177,
  "BattleFrontier_OutsideEast_EventScript_ExpertF": 186,
  "BattleFrontier_OutsideEast_EventScript_TriathleteF": 195,
  "BattleFrontier_OutsideEast_EventScript_Twin": 204,
  "BattleFrontier_OutsideEast_EventScript_Man2": 213,
  "BattleFrontier_OutsideEast_EventScript_TriathleteM": 224,
  "BattleFrontier_OutsideEast_EventScript_Sudowoodo": 233,
  "BattleFrontier_OutsideEast_EventScript_WaterSudowoodo": 265,
  "BattleFrontier_OutsideEast_EventScript_DefeatedSudowoodo": 375,
  "BattleFrontier_OutsideEast_Movement_SudowoodoShake": 384,
  "BattleFrontier_OutsideEast_EventScript_Maniac1": 400,
  "BattleFrontier_OutsideEast_EventScript_Girl": 409,
  "BattleFrontier_OutsideEast_EventScript_PsychicM": 418,
  "BattleFrontier_OutsideEast_EventScript_Man3": 427,
  "BattleFrontier_OutsideEast_EventScript_Woman1": 436,
  "BattleFrontier_OutsideEast_EventScript_Woman2": 445,
  "BattleFrontier_OutsideEast_EventScript_BlackBelt2": 454,
  "BattleFrontier_OutsideEast_EventScript_Maniac2": 463,
  "BattleFrontier_OutsideEast_EventScript_Woman3": 474,
  "BattleFrontier_OutsideEast_EventScript_RankingHallSign": 485,
  "BattleFrontier_OutsideEast_EventScript_ExchangeCornerSign": 494,
  "BattleFrontier_OutsideEast_EventScript_Gentleman": 503,
  "BattleFrontier_OutsideEast_EventScript_OldWoman": 512,
  "BattleFrontier_OutsideEast_EventScript_OldWomanSudowoodoGone": 533,
  "BattleFrontier_OutsideEast_EventScript_Camper": 543,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [5,10,0,0,0,3,45,0,0,0,44,0,0,8,1,20,0,0,0,90,39,13,128,0,0,0,35,13,128,7,0,34,13,128,7,0,84,15,128,85,15,128,0,0,15,113,188,0,0,42,150,3,44,198,1,8,0,62,0,0,0,90,43,74,3,15,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,107,16,0,0,0,0,0,10,0,109,90,107,91,49,162,32,1,0,0,16,0,0,0,0,0,10,0,198,109,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,107,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,90,107,91,49,9,13,1,80,0,0,128,1,0,0,81,0,0,128,1,0,0,0,0,82,0,0,83,0,0,0,0,109,90,107,91,38,0,0,0,49,9,13,1,80,0,0,128,1,0,0,81,0,0,128,1,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,105,49,162,185,0,2,0,4,40,198,113,15,0,0,183,185,0,40,0,0,42,0,0,184,43,0,0,39,13,128,0,0,0,35,13,128,1,0,34,13,128,1,0,35,13,128,4,0,34,13,128,4,0,35,13,128,5,0,34,13,128,5,0,42,198,1,109,90,42,198,1,89,0,0,0,0,90,3,19,0,19,2,19,0,19,3,19,0,19,2,19,0,254,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,107,16,0,0,0,0,0,10,0,109,90,107,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,107,91,44,198,1,7,1,21,2,0,0,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,90] as const;

export const STATS = { ops: 149, bytes: 552, labels: 41, unknownOps: 2, unresolvedSymbols: 44 } as const;
