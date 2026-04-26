// AUTO-GENERATED from data/maps/BattleFrontier_Lounge1/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=89, bytes=475, labels=27, unknownOps=2, unresolvedSymbols=26

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "BattleFrontier_Lounge1_MapScripts": 0,
  "BattleFrontier_Lounge1_EventScript_Breeder": 0,
  "BattleFrontier_Lounge1_EventScript_ChooseMonToShowBreeder": 29,
  "BattleFrontier_Lounge1_EventScript_BreederIntro": 54,
  "BattleFrontier_Lounge1_EventScript_AlreadyMetBreeder": 63,
  "BattleFrontier_Lounge1_EventScript_ShowMonToBreeder": 72,
  "BattleFrontier_Lounge1_EventScript_ShowEggToBreeder": 133,
  "BattleFrontier_Lounge1_EventScript_HighestIVStat": 147,
  "BattleFrontier_Lounge1_EventScript_HighestIVValue": 208,
  "BattleFrontier_Lounge1_EventScript_EndBreederComments": 249,
  "BattleFrontier_Lounge1_EventScript_AverageTotalIVs": 251,
  "BattleFrontier_Lounge1_EventScript_AboveAverageTotalIVs": 265,
  "BattleFrontier_Lounge1_EventScript_HighTotalIVs": 279,
  "BattleFrontier_Lounge1_EventScript_VeryHighTotalIVs": 293,
  "BattleFrontier_Lounge1_EventScript_HighestIVHP": 307,
  "BattleFrontier_Lounge1_EventScript_HighestIVAtk": 321,
  "BattleFrontier_Lounge1_EventScript_HighestIVDef": 335,
  "BattleFrontier_Lounge1_EventScript_HighestIVSpeed": 349,
  "BattleFrontier_Lounge1_EventScript_HighestIVSpAtk": 363,
  "BattleFrontier_Lounge1_EventScript_HighestIVSpDef": 377,
  "BattleFrontier_Lounge1_EventScript_HighestIVLow": 391,
  "BattleFrontier_Lounge1_EventScript_HighestIVMid": 405,
  "BattleFrontier_Lounge1_EventScript_HighestIVHigh": 419,
  "BattleFrontier_Lounge1_EventScript_HighestIVMax": 433,
  "BattleFrontier_Lounge1_EventScript_CancelMonSelect": 447,
  "BattleFrontier_Lounge1_EventScript_Boy1": 457,
  "BattleFrontier_Lounge1_EventScript_Boy2": 466,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [107,91,44,83,1,8,0,54,0,0,0,44,83,1,8,1,63,0,0,0,42,83,1,89,29,0,0,0,90,38,0,0,0,35,4,128,255,0,34,4,128,255,0,35,4,128,255,0,34,4,128,255,0,90,16,0,0,0,0,0,10,0,15,16,0,0,0,0,0,10,0,15,39,13,128,0,0,0,35,13,128,156,1,34,13,128,156,1,38,0,0,0,35,5,128,90,0,34,5,128,90,0,35,5,128,120,0,34,5,128,120,0,35,5,128,150,0,34,5,128,150,0,35,5,128,151,0,34,5,128,151,0,90,16,0,0,0,0,0,10,0,89,29,0,0,0,90,35,6,128,0,0,34,6,128,0,0,35,6,128,1,0,34,6,128,1,0,35,6,128,2,0,34,6,128,2,0,35,6,128,3,0,34,6,128,3,0,35,6,128,4,0,34,6,128,4,0,35,6,128,5,0,34,6,128,5,0,90,35,7,128,15,0,34,7,128,15,0,35,7,128,25,0,34,7,128,25,0,35,7,128,30,0,34,7,128,30,0,35,7,128,31,0,34,7,128,31,0,90,109,90,16,0,0,0,0,0,10,0,89,147,0,0,0,90,16,0,0,0,0,0,10,0,89,147,0,0,0,90,16,0,0,0,0,0,10,0,89,147,0,0,0,90,16,0,0,0,0,0,10,0,89,147,0,0,0,90,16,0,0,0,0,0,10,0,89,208,0,0,0,90,16,0,0,0,0,0,10,0,89,208,0,0,0,90,16,0,0,0,0,0,10,0,89,208,0,0,0,90,16,0,0,0,0,0,10,0,89,208,0,0,0,90,16,0,0,0,0,0,10,0,89,208,0,0,0,90,16,0,0,0,0,0,10,0,89,208,0,0,0,90,16,0,0,0,0,0,10,0,89,249,0,0,0,90,16,0,0,0,0,0,10,0,89,249,0,0,0,90,16,0,0,0,0,0,10,0,89,249,0,0,0,90,16,0,0,0,0,0,10,0,89,249,0,0,0,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90] as const;

export const STATS = { ops: 89, bytes: 475, labels: 27, unknownOps: 2, unresolvedSymbols: 26 } as const;
