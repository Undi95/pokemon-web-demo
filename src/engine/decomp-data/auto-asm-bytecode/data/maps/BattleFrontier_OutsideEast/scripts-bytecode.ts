// AUTO-GENERATED from data/maps/BattleFrontier_OutsideEast/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=149, bytes=534, labels=41, unknownOps=8, unresolvedSymbols=44

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "BattleFrontier_OutsideEast_MapScripts": 0,
  "BattleFrontier_OutsideEast_OnResume": 10,
  "BattleFrontier_OutsideEast_EventScript_TryRemoveSudowoodo": 20,
  "BattleFrontier_OutsideEast_OnTransition": 44,
  "BattleFrontier_OutsideEast_EventScript_ShowSudowoodo": 61,
  "BattleFrontier_OutsideEast_EventScript_BattleTowerSign": 64,
  "BattleFrontier_OutsideEast_EventScript_BattlePalaceSign": 73,
  "BattleFrontier_OutsideEast_EventScript_BattleArenaSign": 82,
  "BattleFrontier_OutsideEast_EventScript_BattlePyramidSign": 91,
  "BattleFrontier_OutsideEast_EventScript_NinjaBoy": 100,
  "BattleFrontier_OutsideEast_EventScript_Man1": 109,
  "BattleFrontier_OutsideEast_EventScript_Hiker": 118,
  "BattleFrontier_OutsideEast_EventScript_HexManiac": 127,
  "BattleFrontier_OutsideEast_EventScript_BlackBelt1": 136,
  "BattleFrontier_OutsideEast_EventScript_Cook": 145,
  "BattleFrontier_OutsideEast_EventScript_Zigzagoon": 156,
  "BattleFrontier_OutsideEast_EventScript_RichBoy": 175,
  "BattleFrontier_OutsideEast_EventScript_ExpertF": 184,
  "BattleFrontier_OutsideEast_EventScript_TriathleteF": 193,
  "BattleFrontier_OutsideEast_EventScript_Twin": 202,
  "BattleFrontier_OutsideEast_EventScript_Man2": 211,
  "BattleFrontier_OutsideEast_EventScript_TriathleteM": 222,
  "BattleFrontier_OutsideEast_EventScript_Sudowoodo": 231,
  "BattleFrontier_OutsideEast_EventScript_WaterSudowoodo": 263,
  "BattleFrontier_OutsideEast_EventScript_DefeatedSudowoodo": 373,
  "BattleFrontier_OutsideEast_Movement_SudowoodoShake": 382,
  "BattleFrontier_OutsideEast_EventScript_Maniac1": 382,
  "BattleFrontier_OutsideEast_EventScript_Girl": 391,
  "BattleFrontier_OutsideEast_EventScript_PsychicM": 400,
  "BattleFrontier_OutsideEast_EventScript_Man3": 409,
  "BattleFrontier_OutsideEast_EventScript_Woman1": 418,
  "BattleFrontier_OutsideEast_EventScript_Woman2": 427,
  "BattleFrontier_OutsideEast_EventScript_BlackBelt2": 436,
  "BattleFrontier_OutsideEast_EventScript_Maniac2": 445,
  "BattleFrontier_OutsideEast_EventScript_Woman3": 456,
  "BattleFrontier_OutsideEast_EventScript_RankingHallSign": 467,
  "BattleFrontier_OutsideEast_EventScript_ExchangeCornerSign": 476,
  "BattleFrontier_OutsideEast_EventScript_Gentleman": 485,
  "BattleFrontier_OutsideEast_EventScript_OldWoman": 494,
  "BattleFrontier_OutsideEast_EventScript_OldWomanSudowoodoGone": 515,
  "BattleFrontier_OutsideEast_EventScript_Camper": 525,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [5,10,0,0,0,3,44,0,0,0,44,0,0,8,1,20,0,0,0,90,39,13,128,0,0,0,35,13,128,7,0,34,13,128,7,0,84,15,128,85,15,128,0,0,113,188,0,0,42,150,3,44,198,1,8,0,61,0,0,0,90,43,74,3,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,107,16,0,0,0,0,0,10,0,109,90,107,91,49,162,32,1,0,0,16,0,0,0,0,0,10,0,198,109,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,107,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,90,107,91,49,9,13,1,80,0,0,126,1,0,0,81,0,0,126,1,0,0,0,0,82,0,0,83,0,0,0,0,109,90,107,91,38,0,0,0,49,9,13,1,80,0,0,126,1,0,0,81,0,0,126,1,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,105,49,162,185,0,2,0,4,40,198,113,15,0,0,183,185,0,40,0,0,42,0,0,184,43,0,0,39,13,128,0,0,0,35,13,128,1,0,34,13,128,1,0,35,13,128,4,0,34,13,128,4,0,35,13,128,5,0,34,13,128,5,0,42,198,1,109,90,42,198,1,89,0,0,0,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,107,16,0,0,0,0,0,10,0,109,90,107,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,107,91,44,198,1,7,1,3,2,0,0,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,90] as const;

export const STATS = { ops: 149, bytes: 534, labels: 41, unknownOps: 8, unresolvedSymbols: 44 } as const;
