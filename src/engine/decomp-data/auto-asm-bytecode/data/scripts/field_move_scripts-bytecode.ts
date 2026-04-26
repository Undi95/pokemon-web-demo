// AUTO-GENERATED from data/scripts/field_move_scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=155, bytes=653, labels=47, unknownOps=5, unresolvedSymbols=16

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "EventScript_CutTree": 0,
  "EventScript_UseCut": 78,
  "EventScript_CutTreeDown": 89,
  "Movement_CutTreeDown": 123,
  "EventScript_CheckTreeCantCut": 123,
  "EventScript_CancelCut": 133,
  "Text_WantToCut": 136,
  "Text_MonUsedFieldMove": 136,
  "Text_CantCut": 136,
  "EventScript_RockSmash": 136,
  "EventScript_UseRockSmash": 214,
  "EventScript_SmashRock": 225,
  "EventScript_EndSmash": 290,
  "Movement_SmashRock": 292,
  "EventScript_CantSmashRock": 292,
  "EventScript_CancelSmash": 302,
  "Text_WantToSmash": 305,
  "Text_CantSmash": 305,
  "EventScript_StrengthBoulder": 305,
  "EventScript_UseStrength": 370,
  "EventScript_ActivateStrength": 381,
  "EventScript_CantStrength": 394,
  "EventScript_CheckActivatedBoulder": 404,
  "EventScript_CancelStrength": 414,
  "Text_WantToStrength": 417,
  "Text_MonUsedStrength": 417,
  "Text_CantStrength": 417,
  "Text_StrengthActivated": 417,
  "EventScript_UseWaterfall": 417,
  "EventScript_CannotUseWaterfall": 476,
  "EventScript_CantWaterfall": 477,
  "EventScript_EndWaterfall": 485,
  "Text_CantWaterfall": 487,
  "Text_WantToWaterfall": 487,
  "Text_MonUsedWaterfall": 487,
  "EventScript_UseDive": 487,
  "EventScript_CantDive": 551,
  "EventScript_EndDive": 561,
  "EventScript_UseDiveUnderwater": 563,
  "EventScript_CantSurface": 627,
  "EventScript_EndSurface": 642,
  "Text_CantDive": 644,
  "Text_WantToDive": 644,
  "Text_MonUsedDive": 644,
  "Text_CantSurface": 644,
  "Text_WantToSurface": 644,
  "EventScript_FailSweetScent": 644,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [106,44,0,0,7,0,123,0,0,0,125,15,0,35,13,128,6,0,34,13,128,6,0,158,0,13,128,128,0,1,2,0,13,128,131,0,1,2,0,15,0,16,0,136,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,16,0,136,0,0,0,10,0,105,157,2,0,0,89,89,0,0,0,90,106,157,2,0,0,89,89,0,0,0,90,80,15,128,123,0,0,0,81,15,128,123,0,0,0,0,0,82,0,0,83,0,0,0,0,84,15,128,85,15,128,0,0,108,90,16,0,136,0,0,0,10,0,108,90,105,108,90,106,44,0,0,7,0,36,1,0,0,125,249,0,35,13,128,6,0,34,13,128,6,0,158,0,13,128,128,0,1,2,0,13,128,131,0,1,2,0,249,0,16,0,49,1,0,0,10,0,35,13,128,0,0,34,13,128,0,0,16,0,136,0,0,0,10,0,105,157,37,0,0,89,225,0,0,0,90,106,157,37,0,0,89,225,0,0,0,90,80,15,128,36,1,0,0,81,15,128,36,1,0,0,0,0,82,0,0,83,0,0,0,0,84,15,128,85,15,128,0,0,39,13,128,0,0,0,35,13,128,1,0,34,13,128,1,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,0,108,90,108,90,16,0,49,1,0,0,10,0,108,90,105,108,90,106,44,0,0,7,0,138,1,0,0,44,0,0,7,1,148,1,0,0,125,70,0,35,13,128,6,0,34,13,128,6,0,158,0,13,128,16,0,161,1,0,0,10,0,35,13,128,0,0,34,13,128,0,0,105,157,40,0,0,89,125,1,0,0,90,106,157,40,0,0,89,125,1,0,0,90,42,0,0,16,0,161,1,0,0,10,0,108,90,16,0,161,1,0,0,10,0,108,90,16,0,161,1,0,0,10,0,108,90,105,108,90,106,125,127,0,35,13,128,6,0,34,13,128,6,0,128,0,1,2,0,13,128,158,0,13,128,16,0,231,1,0,0,10,0,35,13,128,0,0,34,13,128,0,0,16,0,231,1,0,0,10,0,157,43,0,89,229,1,0,0,106,16,0,231,1,0,0,10,0,108,90,106,125,35,1,35,13,128,6,0,34,13,128,6,0,128,0,1,2,0,13,128,158,0,13,128,158,1,1,0,16,0,132,2,0,0,10,0,35,13,128,0,0,34,13,128,0,0,16,0,132,2,0,0,10,0,157,44,0,89,49,2,0,0,90,16,0,132,2,0,0,10,0,108,90,108,90,106,125,35,1,35,13,128,6,0,34,13,128,6,0,128,0,1,2,0,13,128,158,0,13,128,158,1,1,0,16,0,132,2,0,0,10,0,35,13,128,0,0,34,13,128,0,0,16,0,132,2,0,0,10,0,157,44,0,89,130,2,0,0,90,106,16,0,132,2,0,0,10,0,89,130,2,0,0,90,108,90,16,0,0,0,0,0,10,0,90] as const;

export const STATS = { ops: 155, bytes: 653, labels: 47, unknownOps: 5, unresolvedSymbols: 16 } as const;
