// AUTO-GENERATED from data/scripts/field_move_scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-05-16
// Stats: ops=155, bytes=825, labels=47, unknownOps=0, unresolvedSymbols=12

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "EventScript_CutTree": 0,
  "EventScript_UseCut": 102,
  "EventScript_CutTreeDown": 113,
  "Movement_CutTreeDown": 147,
  "EventScript_CheckTreeCantCut": 149,
  "EventScript_CancelCut": 159,
  "Text_WantToCut": 162,
  "Text_MonUsedFieldMove": 162,
  "Text_CantCut": 162,
  "EventScript_RockSmash": 162,
  "EventScript_UseRockSmash": 264,
  "EventScript_SmashRock": 275,
  "EventScript_EndSmash": 364,
  "Movement_SmashRock": 366,
  "EventScript_CantSmashRock": 368,
  "EventScript_CancelSmash": 378,
  "Text_WantToSmash": 381,
  "Text_CantSmash": 381,
  "EventScript_StrengthBoulder": 381,
  "EventScript_UseStrength": 470,
  "EventScript_ActivateStrength": 481,
  "EventScript_CantStrength": 494,
  "EventScript_CheckActivatedBoulder": 504,
  "EventScript_CancelStrength": 514,
  "Text_WantToStrength": 517,
  "Text_MonUsedStrength": 517,
  "Text_CantStrength": 517,
  "Text_StrengthActivated": 517,
  "EventScript_UseWaterfall": 517,
  "EventScript_CannotUseWaterfall": 600,
  "EventScript_CantWaterfall": 601,
  "EventScript_EndWaterfall": 609,
  "Text_CantWaterfall": 611,
  "Text_WantToWaterfall": 611,
  "Text_MonUsedWaterfall": 611,
  "EventScript_UseDive": 611,
  "EventScript_CantDive": 699,
  "EventScript_EndDive": 709,
  "EventScript_UseDiveUnderwater": 711,
  "EventScript_CantSurface": 799,
  "EventScript_EndSurface": 814,
  "Text_CantDive": 816,
  "Text_WantToDive": 816,
  "Text_MonUsedDive": 816,
  "Text_CantSurface": 816,
  "Text_WantToSurface": 816,
  "EventScript_FailSweetScent": 816,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [106,44,0,0,7,0,149,0,0,0,125,15,0,35,13,128,6,0,34,13,128,6,0,7,1,149,0,0,0,7,1,13,128,0,0,158,0,13,128,128,0,1,2,0,13,128,131,0,1,2,0,15,0,16,0,162,0,0,0,10,5,35,13,128,0,0,34,13,128,0,0,7,1,159,0,0,0,7,1,13,128,0,0,16,0,162,0,0,0,10,4,105,157,2,0,0,89,113,0,0,0,90,106,157,2,0,0,89,113,0,0,0,90,80,15,128,147,0,0,0,81,15,128,147,0,0,0,0,0,82,0,0,83,0,0,0,0,84,15,128,85,15,128,0,0,108,90,91,254,16,0,162,0,0,0,10,4,108,90,105,108,90,106,44,0,0,7,0,112,1,0,0,125,249,0,35,13,128,6,0,34,13,128,6,0,7,1,112,1,0,0,7,1,13,128,0,0,158,0,13,128,128,0,1,2,0,13,128,131,0,1,2,0,249,0,16,0,125,1,0,0,10,5,35,13,128,0,0,34,13,128,0,0,7,1,122,1,0,0,7,1,13,128,0,0,16,0,162,0,0,0,10,4,105,157,37,0,0,89,19,1,0,0,90,106,157,37,0,0,89,19,1,0,0,90,80,15,128,110,1,0,0,81,15,128,110,1,0,0,0,0,82,0,0,83,0,0,0,0,84,15,128,85,15,128,0,0,39,13,128,0,0,0,35,13,128,1,0,34,13,128,1,0,7,1,108,1,0,0,7,1,13,128,0,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,7,1,108,1,0,0,7,1,13,128,0,0,0,108,90,108,90,90,254,16,0,125,1,0,0,10,4,108,90,105,108,90,106,44,0,0,7,0,238,1,0,0,44,0,0,7,1,248,1,0,0,125,70,0,35,13,128,6,0,34,13,128,6,0,7,1,238,1,0,0,7,1,13,128,0,0,158,0,13,128,16,0,5,2,0,0,10,5,35,13,128,0,0,34,13,128,0,0,7,1,2,2,0,0,7,1,13,128,0,0,105,157,40,0,0,89,225,1,0,0,90,106,157,40,0,0,89,225,1,0,0,90,42,0,0,16,0,5,2,0,0,10,4,108,90,16,0,5,2,0,0,10,4,108,90,16,0,5,2,0,0,10,4,108,90,105,108,90,106,125,127,0,35,13,128,6,0,34,13,128,6,0,7,1,89,2,0,0,7,1,13,128,0,0,128,0,1,2,0,13,128,158,0,13,128,16,0,99,2,0,0,10,5,35,13,128,0,0,34,13,128,0,0,7,1,97,2,0,0,7,1,13,128,0,0,16,0,99,2,0,0,10,4,157,43,0,89,97,2,0,0,106,16,0,99,2,0,0,10,4,108,90,106,125,35,1,35,13,128,6,0,34,13,128,6,0,7,1,187,2,0,0,7,1,13,128,0,0,128,0,1,2,0,13,128,158,0,13,128,158,1,1,0,16,0,48,3,0,0,10,5,35,13,128,0,0,34,13,128,0,0,7,1,197,2,0,0,7,1,13,128,0,0,16,0,48,3,0,0,10,4,157,44,0,89,197,2,0,0,90,16,0,48,3,0,0,10,4,108,90,108,90,106,125,35,1,35,13,128,6,0,34,13,128,6,0,7,1,31,3,0,0,7,1,13,128,0,0,128,0,1,2,0,13,128,158,0,13,128,158,1,1,0,16,0,48,3,0,0,10,5,35,13,128,0,0,34,13,128,0,0,7,1,46,3,0,0,7,1,13,128,0,0,16,0,48,3,0,0,10,4,157,44,0,89,46,3,0,0,90,106,16,0,48,3,0,0,10,4,89,46,3,0,0,90,108,90,16,0,0,0,0,0,10,3,90] as const;

export const STATS = { ops: 155, bytes: 825, labels: 47, unknownOps: 0, unresolvedSymbols: 12 } as const;
