// AUTO-GENERATED from data/maps/BattleFrontier_OutsideEast/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=149, bytes=600, labels=41, unknownOps=0, unresolvedSymbols=42

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "BattleFrontier_OutsideEast_MapScripts": 0,
  "BattleFrontier_OutsideEast_OnResume": 10,
  "BattleFrontier_OutsideEast_EventScript_TryRemoveSudowoodo": 20,
  "BattleFrontier_OutsideEast_OnTransition": 57,
  "BattleFrontier_OutsideEast_EventScript_ShowSudowoodo": 74,
  "BattleFrontier_OutsideEast_EventScript_BattleTowerSign": 78,
  "BattleFrontier_OutsideEast_EventScript_BattlePalaceSign": 87,
  "BattleFrontier_OutsideEast_EventScript_BattleArenaSign": 96,
  "BattleFrontier_OutsideEast_EventScript_BattlePyramidSign": 105,
  "BattleFrontier_OutsideEast_EventScript_NinjaBoy": 114,
  "BattleFrontier_OutsideEast_EventScript_Man1": 123,
  "BattleFrontier_OutsideEast_EventScript_Hiker": 132,
  "BattleFrontier_OutsideEast_EventScript_HexManiac": 141,
  "BattleFrontier_OutsideEast_EventScript_BlackBelt1": 150,
  "BattleFrontier_OutsideEast_EventScript_Cook": 159,
  "BattleFrontier_OutsideEast_EventScript_Zigzagoon": 170,
  "BattleFrontier_OutsideEast_EventScript_RichBoy": 189,
  "BattleFrontier_OutsideEast_EventScript_ExpertF": 198,
  "BattleFrontier_OutsideEast_EventScript_TriathleteF": 207,
  "BattleFrontier_OutsideEast_EventScript_Twin": 216,
  "BattleFrontier_OutsideEast_EventScript_Man2": 225,
  "BattleFrontier_OutsideEast_EventScript_TriathleteM": 236,
  "BattleFrontier_OutsideEast_EventScript_Sudowoodo": 245,
  "BattleFrontier_OutsideEast_EventScript_WaterSudowoodo": 277,
  "BattleFrontier_OutsideEast_EventScript_DefeatedSudowoodo": 423,
  "BattleFrontier_OutsideEast_Movement_SudowoodoShake": 432,
  "BattleFrontier_OutsideEast_EventScript_Maniac1": 448,
  "BattleFrontier_OutsideEast_EventScript_Girl": 457,
  "BattleFrontier_OutsideEast_EventScript_PsychicM": 466,
  "BattleFrontier_OutsideEast_EventScript_Man3": 475,
  "BattleFrontier_OutsideEast_EventScript_Woman1": 484,
  "BattleFrontier_OutsideEast_EventScript_Woman2": 493,
  "BattleFrontier_OutsideEast_EventScript_BlackBelt2": 502,
  "BattleFrontier_OutsideEast_EventScript_Maniac2": 511,
  "BattleFrontier_OutsideEast_EventScript_Woman3": 522,
  "BattleFrontier_OutsideEast_EventScript_RankingHallSign": 533,
  "BattleFrontier_OutsideEast_EventScript_ExchangeCornerSign": 542,
  "BattleFrontier_OutsideEast_EventScript_Gentleman": 551,
  "BattleFrontier_OutsideEast_EventScript_OldWoman": 560,
  "BattleFrontier_OutsideEast_EventScript_OldWomanSudowoodoGone": 581,
  "BattleFrontier_OutsideEast_EventScript_Camper": 591,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [5,10,0,0,0,3,57,0,0,0,44,0,0,8,1,20,0,0,0,90,39,13,128,0,0,0,35,13,128,7,0,34,13,128,7,0,7,5,0,0,0,0,7,5,13,128,0,0,84,15,128,85,15,128,0,0,15,113,188,0,0,42,150,3,44,198,1,8,0,74,0,0,0,90,43,74,3,15,16,0,0,0,0,0,10,3,90,16,0,0,0,0,0,10,3,90,16,0,0,0,0,0,10,3,90,16,0,0,0,0,0,10,3,90,16,0,0,0,0,0,10,2,90,16,0,0,0,0,0,10,2,90,16,0,0,0,0,0,10,2,90,16,0,0,0,0,0,10,2,90,16,0,0,0,0,0,10,2,90,107,16,0,0,0,0,0,10,4,109,90,107,91,49,162,32,1,0,0,16,0,0,0,0,0,10,4,198,109,90,16,0,0,0,0,0,10,2,90,16,0,0,0,0,0,10,2,90,16,0,0,0,0,0,10,2,90,16,0,0,0,0,0,10,2,90,107,16,0,0,0,0,0,10,4,109,90,16,0,0,0,0,0,10,2,90,107,91,49,9,13,1,80,0,0,176,1,0,0,81,0,0,176,1,0,0,0,0,82,0,0,83,0,0,0,0,109,90,107,91,38,0,0,0,49,9,13,1,80,0,0,176,1,0,0,81,0,0,176,1,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,105,49,162,185,0,2,0,4,40,198,113,15,0,0,183,185,0,40,0,0,42,0,0,184,43,0,0,39,13,128,0,0,0,35,13,128,1,0,34,13,128,1,0,7,1,167,1,0,0,7,1,13,128,0,0,35,13,128,4,0,34,13,128,4,0,7,1,167,1,0,0,7,1,13,128,0,0,35,13,128,5,0,34,13,128,5,0,7,1,167,1,0,0,7,1,13,128,0,0,42,198,1,109,90,42,198,1,89,0,0,0,0,90,3,19,0,19,2,19,0,19,3,19,0,19,2,19,0,254,16,0,0,0,0,0,10,2,90,16,0,0,0,0,0,10,2,90,16,0,0,0,0,0,10,2,90,16,0,0,0,0,0,10,2,90,16,0,0,0,0,0,10,2,90,16,0,0,0,0,0,10,2,90,16,0,0,0,0,0,10,2,90,107,16,0,0,0,0,0,10,4,109,90,107,16,0,0,0,0,0,10,4,109,90,16,0,0,0,0,0,10,3,90,16,0,0,0,0,0,10,3,90,16,0,0,0,0,0,10,2,90,107,91,44,198,1,7,1,69,2,0,0,16,0,0,0,0,0,10,4,109,90,16,0,0,0,0,0,10,4,109,90,16,0,0,0,0,0,10,2,90] as const;

export const STATS = { ops: 149, bytes: 600, labels: 41, unknownOps: 0, unresolvedSymbols: 42 } as const;
