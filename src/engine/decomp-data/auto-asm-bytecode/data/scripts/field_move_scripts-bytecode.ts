// AUTO-GENERATED from data/scripts/field_move_scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=155, bytes=657, labels=47, unknownOps=2, unresolvedSymbols=16

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "EventScript_CutTree": 0,
  "EventScript_UseCut": 78,
  "EventScript_CutTreeDown": 89,
  "Movement_CutTreeDown": 123,
  "EventScript_CheckTreeCantCut": 125,
  "EventScript_CancelCut": 135,
  "Text_WantToCut": 138,
  "Text_MonUsedFieldMove": 138,
  "Text_CantCut": 138,
  "EventScript_RockSmash": 138,
  "EventScript_UseRockSmash": 216,
  "EventScript_SmashRock": 227,
  "EventScript_EndSmash": 292,
  "Movement_SmashRock": 294,
  "EventScript_CantSmashRock": 296,
  "EventScript_CancelSmash": 306,
  "Text_WantToSmash": 309,
  "Text_CantSmash": 309,
  "EventScript_StrengthBoulder": 309,
  "EventScript_UseStrength": 374,
  "EventScript_ActivateStrength": 385,
  "EventScript_CantStrength": 398,
  "EventScript_CheckActivatedBoulder": 408,
  "EventScript_CancelStrength": 418,
  "Text_WantToStrength": 421,
  "Text_MonUsedStrength": 421,
  "Text_CantStrength": 421,
  "Text_StrengthActivated": 421,
  "EventScript_UseWaterfall": 421,
  "EventScript_CannotUseWaterfall": 480,
  "EventScript_CantWaterfall": 481,
  "EventScript_EndWaterfall": 489,
  "Text_CantWaterfall": 491,
  "Text_WantToWaterfall": 491,
  "Text_MonUsedWaterfall": 491,
  "EventScript_UseDive": 491,
  "EventScript_CantDive": 555,
  "EventScript_EndDive": 565,
  "EventScript_UseDiveUnderwater": 567,
  "EventScript_CantSurface": 631,
  "EventScript_EndSurface": 646,
  "Text_CantDive": 648,
  "Text_WantToDive": 648,
  "Text_MonUsedDive": 648,
  "Text_CantSurface": 648,
  "Text_WantToSurface": 648,
  "EventScript_FailSweetScent": 648,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [106,44,0,0,7,0,125,0,0,0,125,15,0,35,13,128,6,0,34,13,128,6,0,158,0,13,128,128,0,1,2,0,13,128,131,0,1,2,0,15,0,16,0,138,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,16,0,138,0,0,0,10,0,105,157,2,0,0,89,89,0,0,0,90,106,157,2,0,0,89,89,0,0,0,90,80,15,128,123,0,0,0,81,15,128,123,0,0,0,0,0,82,0,0,83,0,0,0,0,84,15,128,85,15,128,0,0,108,90,91,254,16,0,138,0,0,0,10,0,108,90,105,108,90,106,44,0,0,7,0,40,1,0,0,125,249,0,35,13,128,6,0,34,13,128,6,0,158,0,13,128,128,0,1,2,0,13,128,131,0,1,2,0,249,0,16,0,53,1,0,0,10,0,35,13,128,0,0,34,13,128,0,0,16,0,138,0,0,0,10,0,105,157,37,0,0,89,227,0,0,0,90,106,157,37,0,0,89,227,0,0,0,90,80,15,128,38,1,0,0,81,15,128,38,1,0,0,0,0,82,0,0,83,0,0,0,0,84,15,128,85,15,128,0,0,39,13,128,0,0,0,35,13,128,1,0,34,13,128,1,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,0,108,90,108,90,90,254,16,0,53,1,0,0,10,0,108,90,105,108,90,106,44,0,0,7,0,142,1,0,0,44,0,0,7,1,152,1,0,0,125,70,0,35,13,128,6,0,34,13,128,6,0,158,0,13,128,16,0,165,1,0,0,10,0,35,13,128,0,0,34,13,128,0,0,105,157,40,0,0,89,129,1,0,0,90,106,157,40,0,0,89,129,1,0,0,90,42,0,0,16,0,165,1,0,0,10,0,108,90,16,0,165,1,0,0,10,0,108,90,16,0,165,1,0,0,10,0,108,90,105,108,90,106,125,127,0,35,13,128,6,0,34,13,128,6,0,128,0,1,2,0,13,128,158,0,13,128,16,0,235,1,0,0,10,0,35,13,128,0,0,34,13,128,0,0,16,0,235,1,0,0,10,0,157,43,0,89,233,1,0,0,106,16,0,235,1,0,0,10,0,108,90,106,125,35,1,35,13,128,6,0,34,13,128,6,0,128,0,1,2,0,13,128,158,0,13,128,158,1,1,0,16,0,136,2,0,0,10,0,35,13,128,0,0,34,13,128,0,0,16,0,136,2,0,0,10,0,157,44,0,89,53,2,0,0,90,16,0,136,2,0,0,10,0,108,90,108,90,106,125,35,1,35,13,128,6,0,34,13,128,6,0,128,0,1,2,0,13,128,158,0,13,128,158,1,1,0,16,0,136,2,0,0,10,0,35,13,128,0,0,34,13,128,0,0,16,0,136,2,0,0,10,0,157,44,0,89,134,2,0,0,90,106,16,0,136,2,0,0,10,0,89,134,2,0,0,90,108,90,16,0,0,0,0,0,10,0,90] as const;

export const STATS = { ops: 155, bytes: 657, labels: 47, unknownOps: 2, unresolvedSymbols: 16 } as const;
