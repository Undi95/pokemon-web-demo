// AUTO-GENERATED from data/maps/BattleFrontier_Lounge1/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-05-16
// Stats: ops=89, bytes=679, labels=27, unknownOps=0, unresolvedSymbols=24

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "BattleFrontier_Lounge1_MapScripts": 0,
  "BattleFrontier_Lounge1_EventScript_Breeder": 0,
  "BattleFrontier_Lounge1_EventScript_ChooseMonToShowBreeder": 29,
  "BattleFrontier_Lounge1_EventScript_BreederIntro": 78,
  "BattleFrontier_Lounge1_EventScript_AlreadyMetBreeder": 87,
  "BattleFrontier_Lounge1_EventScript_ShowMonToBreeder": 96,
  "BattleFrontier_Lounge1_EventScript_ShowEggToBreeder": 217,
  "BattleFrontier_Lounge1_EventScript_HighestIVStat": 231,
  "BattleFrontier_Lounge1_EventScript_HighestIVValue": 364,
  "BattleFrontier_Lounge1_EventScript_EndBreederComments": 453,
  "BattleFrontier_Lounge1_EventScript_AverageTotalIVs": 455,
  "BattleFrontier_Lounge1_EventScript_AboveAverageTotalIVs": 469,
  "BattleFrontier_Lounge1_EventScript_HighTotalIVs": 483,
  "BattleFrontier_Lounge1_EventScript_VeryHighTotalIVs": 497,
  "BattleFrontier_Lounge1_EventScript_HighestIVHP": 511,
  "BattleFrontier_Lounge1_EventScript_HighestIVAtk": 525,
  "BattleFrontier_Lounge1_EventScript_HighestIVDef": 539,
  "BattleFrontier_Lounge1_EventScript_HighestIVSpeed": 553,
  "BattleFrontier_Lounge1_EventScript_HighestIVSpAtk": 567,
  "BattleFrontier_Lounge1_EventScript_HighestIVSpDef": 581,
  "BattleFrontier_Lounge1_EventScript_HighestIVLow": 595,
  "BattleFrontier_Lounge1_EventScript_HighestIVMid": 609,
  "BattleFrontier_Lounge1_EventScript_HighestIVHigh": 623,
  "BattleFrontier_Lounge1_EventScript_HighestIVMax": 637,
  "BattleFrontier_Lounge1_EventScript_CancelMonSelect": 651,
  "BattleFrontier_Lounge1_EventScript_Boy1": 661,
  "BattleFrontier_Lounge1_EventScript_Boy2": 670,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [107,91,44,83,1,8,0,78,0,0,0,44,83,1,8,1,87,0,0,0,42,83,1,89,29,0,0,0,90,38,0,0,0,35,4,128,255,0,34,4,128,255,0,7,5,96,0,0,0,7,5,4,128,0,0,35,4,128,255,0,34,4,128,255,0,7,1,139,2,0,0,7,1,4,128,0,0,90,16,0,0,0,0,0,10,4,15,16,0,0,0,0,0,10,4,15,39,13,128,0,0,0,35,13,128,156,1,34,13,128,156,1,7,1,217,0,0,0,7,1,13,128,0,0,38,0,0,0,35,5,128,90,0,34,5,128,90,0,7,3,199,1,0,0,7,3,5,128,0,0,35,5,128,120,0,34,5,128,120,0,7,3,213,1,0,0,7,3,5,128,0,0,35,5,128,150,0,34,5,128,150,0,7,3,227,1,0,0,7,3,5,128,0,0,35,5,128,151,0,34,5,128,151,0,7,4,241,1,0,0,7,4,5,128,0,0,90,16,0,0,0,0,0,10,4,89,29,0,0,0,90,35,6,128,0,0,34,6,128,0,0,7,1,255,1,0,0,7,1,6,128,0,0,35,6,128,1,0,34,6,128,1,0,7,1,13,2,0,0,7,1,6,128,0,0,35,6,128,2,0,34,6,128,2,0,7,1,27,2,0,0,7,1,6,128,0,0,35,6,128,3,0,34,6,128,3,0,7,1,41,2,0,0,7,1,6,128,0,0,35,6,128,4,0,34,6,128,4,0,7,1,55,2,0,0,7,1,6,128,0,0,35,6,128,5,0,34,6,128,5,0,7,1,69,2,0,0,7,1,6,128,0,0,90,35,7,128,15,0,34,7,128,15,0,7,3,83,2,0,0,7,3,7,128,0,0,35,7,128,25,0,34,7,128,25,0,7,3,97,2,0,0,7,3,7,128,0,0,35,7,128,30,0,34,7,128,30,0,7,3,111,2,0,0,7,3,7,128,0,0,35,7,128,31,0,34,7,128,31,0,7,4,125,2,0,0,7,4,7,128,0,0,90,109,90,16,0,0,0,0,0,10,4,89,231,0,0,0,90,16,0,0,0,0,0,10,4,89,231,0,0,0,90,16,0,0,0,0,0,10,4,89,231,0,0,0,90,16,0,0,0,0,0,10,4,89,231,0,0,0,90,16,0,0,0,0,0,10,4,89,108,1,0,0,90,16,0,0,0,0,0,10,4,89,108,1,0,0,90,16,0,0,0,0,0,10,4,89,108,1,0,0,90,16,0,0,0,0,0,10,4,89,108,1,0,0,90,16,0,0,0,0,0,10,4,89,108,1,0,0,90,16,0,0,0,0,0,10,4,89,108,1,0,0,90,16,0,0,0,0,0,10,4,89,197,1,0,0,90,16,0,0,0,0,0,10,4,89,197,1,0,0,90,16,0,0,0,0,0,10,4,89,197,1,0,0,90,16,0,0,0,0,0,10,4,89,197,1,0,0,90,16,0,0,0,0,0,10,4,109,90,16,0,0,0,0,0,10,2,90,16,0,0,0,0,0,10,2,90] as const;

export const STATS = { ops: 89, bytes: 679, labels: 27, unknownOps: 0, unresolvedSymbols: 24 } as const;
