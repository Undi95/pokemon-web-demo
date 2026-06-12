// AUTO-GENERATED from data/maps/BattleFrontier_OutsideEast/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-06-12
// Stats: ops=149, bytes=603, labels=41, unknownOps=0, unresolvedSymbols=39

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "BattleFrontier_OutsideEast_MapScripts": 0,
  "BattleFrontier_OutsideEast_OnResume": 10,
  "BattleFrontier_OutsideEast_EventScript_TryRemoveSudowoodo": 20,
  "BattleFrontier_OutsideEast_OnTransition": 57,
  "BattleFrontier_OutsideEast_EventScript_ShowSudowoodo": 75,
  "BattleFrontier_OutsideEast_EventScript_BattleTowerSign": 79,
  "BattleFrontier_OutsideEast_EventScript_BattlePalaceSign": 88,
  "BattleFrontier_OutsideEast_EventScript_BattleArenaSign": 97,
  "BattleFrontier_OutsideEast_EventScript_BattlePyramidSign": 106,
  "BattleFrontier_OutsideEast_EventScript_NinjaBoy": 115,
  "BattleFrontier_OutsideEast_EventScript_Man1": 124,
  "BattleFrontier_OutsideEast_EventScript_Hiker": 133,
  "BattleFrontier_OutsideEast_EventScript_HexManiac": 142,
  "BattleFrontier_OutsideEast_EventScript_BlackBelt1": 151,
  "BattleFrontier_OutsideEast_EventScript_Cook": 160,
  "BattleFrontier_OutsideEast_EventScript_Zigzagoon": 171,
  "BattleFrontier_OutsideEast_EventScript_RichBoy": 190,
  "BattleFrontier_OutsideEast_EventScript_ExpertF": 199,
  "BattleFrontier_OutsideEast_EventScript_TriathleteF": 208,
  "BattleFrontier_OutsideEast_EventScript_Twin": 217,
  "BattleFrontier_OutsideEast_EventScript_Man2": 226,
  "BattleFrontier_OutsideEast_EventScript_TriathleteM": 237,
  "BattleFrontier_OutsideEast_EventScript_Sudowoodo": 246,
  "BattleFrontier_OutsideEast_EventScript_WaterSudowoodo": 278,
  "BattleFrontier_OutsideEast_EventScript_DefeatedSudowoodo": 426,
  "BattleFrontier_OutsideEast_Movement_SudowoodoShake": 435,
  "BattleFrontier_OutsideEast_EventScript_Maniac1": 451,
  "BattleFrontier_OutsideEast_EventScript_Girl": 460,
  "BattleFrontier_OutsideEast_EventScript_PsychicM": 469,
  "BattleFrontier_OutsideEast_EventScript_Man3": 478,
  "BattleFrontier_OutsideEast_EventScript_Woman1": 487,
  "BattleFrontier_OutsideEast_EventScript_Woman2": 496,
  "BattleFrontier_OutsideEast_EventScript_BlackBelt2": 505,
  "BattleFrontier_OutsideEast_EventScript_Maniac2": 514,
  "BattleFrontier_OutsideEast_EventScript_Woman3": 525,
  "BattleFrontier_OutsideEast_EventScript_RankingHallSign": 536,
  "BattleFrontier_OutsideEast_EventScript_ExchangeCornerSign": 545,
  "BattleFrontier_OutsideEast_EventScript_Gentleman": 554,
  "BattleFrontier_OutsideEast_EventScript_OldWoman": 563,
  "BattleFrontier_OutsideEast_EventScript_OldWomanSudowoodoGone": 584,
  "BattleFrontier_OutsideEast_EventScript_Camper": 594,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [5,10,0,0,0,3,57,0,0,0,44,0,0,8,1,20,0,0,0,3,39,13,128,0,0,58,35,13,128,7,0,34,13,128,7,0,7,5,0,0,0,0,7,5,13,128,0,0,84,15,128,85,15,128,0,0,4,23,188,64,0,0,42,150,3,44,198,1,8,0,75,0,0,0,3,43,74,3,4,16,0,0,0,0,0,10,3,3,16,0,0,0,0,0,10,3,3,16,0,0,0,0,0,10,3,3,16,0,0,0,0,0,10,3,3,16,0,0,0,0,0,10,2,3,16,0,0,0,0,0,10,2,3,16,0,0,0,0,0,10,2,3,16,0,0,0,0,0,10,2,3,16,0,0,0,0,0,10,2,3,107,16,0,0,0,0,0,10,4,109,3,107,91,49,162,32,1,0,0,16,0,0,0,0,0,10,4,198,109,3,16,0,0,0,0,0,10,2,3,16,0,0,0,0,0,10,2,3,16,0,0,0,0,0,10,2,3,16,0,0,0,0,0,10,2,3,107,16,0,0,0,0,0,10,4,109,3,16,0,0,0,0,0,10,2,3,107,91,49,48,13,1,80,0,0,179,1,0,0,81,0,0,179,1,0,0,0,0,82,0,0,83,0,0,0,0,109,3,107,91,38,0,0,58,49,48,13,1,80,0,0,179,1,0,0,81,0,0,179,1,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,105,49,162,185,0,2,0,41,40,0,198,23,15,128,0,0,183,185,0,40,0,0,42,0,0,184,43,0,0,39,13,128,0,0,58,35,13,128,1,0,34,13,128,1,0,7,1,170,1,0,0,7,1,13,128,0,0,35,13,128,4,0,34,13,128,4,0,7,1,170,1,0,0,7,1,13,128,0,0,35,13,128,5,0,34,13,128,5,0,7,1,170,1,0,0,7,1,13,128,0,0,42,198,1,109,3,42,198,1,6,0,0,0,0,3,3,19,0,19,2,19,0,19,3,19,0,19,2,19,0,254,16,0,0,0,0,0,10,2,3,16,0,0,0,0,0,10,2,3,16,0,0,0,0,0,10,2,3,16,0,0,0,0,0,10,2,3,16,0,0,0,0,0,10,2,3,16,0,0,0,0,0,10,2,3,16,0,0,0,0,0,10,2,3,107,16,0,0,0,0,0,10,4,109,3,107,16,0,0,0,0,0,10,4,109,3,16,0,0,0,0,0,10,3,3,16,0,0,0,0,0,10,3,3,16,0,0,0,0,0,10,2,3,107,91,44,198,1,7,1,72,2,0,0,16,0,0,0,0,0,10,4,109,3,16,0,0,0,0,0,10,4,109,3,16,0,0,0,0,0,10,2,3] as const;

export const STATS = { ops: 149, bytes: 603, labels: 41, unknownOps: 0, unresolvedSymbols: 39 } as const;
