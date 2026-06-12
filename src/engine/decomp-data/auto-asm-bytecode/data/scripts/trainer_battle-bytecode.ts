// AUTO-GENERATED from data/scripts/trainer_battle-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-06-12
// Stats: ops=92, bytes=526, labels=19, unknownOps=0, unresolvedSymbols=11

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "EventScript_StartTrainerApproach": 0,
  "EventScript_TrainerApproach": 2,
  "EventScript_TryDoNormalTrainerBattle": 15,
  "EventScript_NoNormalTrainerBattle": 82,
  "EventScript_TryDoDoubleTrainerBattle": 83,
  "EventScript_NotEnoughMonsForDoubleBattle": 157,
  "EventScript_NoDoubleTrainerBattle": 165,
  "EventScript_DoNoIntroTrainerBattle": 166,
  "EventScript_TryDoRematchBattle": 196,
  "EventScript_NoRematchTrainerBattle": 249,
  "EventScript_TryDoDoubleRematchBattle": 250,
  "EventScript_NoDoubleRematchTrainerBattle": 324,
  "EventScript_NotEnoughMonsForDoubleRematchBattle": 325,
  "EventScript_RevealTrainer": 333,
  "Movement_RevealTrainer": 358,
  "EventScript_ShowTrainerIntroMsg": 360,
  "EventScript_DoTrainerBattle": 397,
  "EventScript_EndTrainerBattle": 514,
  "Std_MsgboxAutoclose": 517,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [217,218,38,0,0,58,38,0,0,58,6,104,1,0,0,107,91,80,15,128,102,1,0,0,81,15,128,102,1,0,0,0,0,82,0,0,83,0,0,0,0,39,13,128,0,0,58,35,13,128,0,0,34,13,128,0,0,7,5,82,0,0,0,7,5,13,128,0,0,38,0,0,58,38,0,0,58,6,104,1,0,0,95,107,91,5,77,1,0,0,39,13,128,0,0,58,35,13,128,0,0,34,13,128,0,0,7,5,165,0,0,0,7,5,13,128,0,0,38,0,0,58,35,13,128,0,0,34,13,128,0,0,7,5,157,0,0,0,7,5,13,128,0,0,38,0,0,58,38,0,0,58,6,104,1,0,0,38,0,0,58,103,110,109,3,95,80,15,128,102,1,0,0,81,15,128,102,1,0,0,0,0,82,0,0,83,0,0,0,0,38,0,0,58,94,95,5,77,1,0,0,39,13,128,0,0,58,35,13,128,0,0,34,13,128,0,0,7,1,249,0,0,0,7,1,13,128,0,0,38,0,0,58,38,0,0,58,38,0,0,58,103,110,38,0,0,58,108,3,95,39,13,128,0,0,58,35,13,128,0,0,34,13,128,0,0,7,1,68,1,0,0,7,1,13,128,0,0,38,0,0,58,35,13,128,0,0,34,13,128,0,0,7,5,69,1,0,0,7,5,13,128,0,0,38,0,0,58,38,0,0,58,38,0,0,58,103,110,38,0,0,58,108,3,95,38,0,0,58,103,110,109,3,80,15,128,102,1,0,0,81,15,128,102,1,0,0,0,0,82,0,0,83,0,0,0,0,4,89,254,38,0,0,58,103,110,38,0,0,58,35,13,128,1,0,34,13,128,1,0,7,1,2,0,0,0,7,1,13,128,0,0,6,141,1,0,0,94,39,13,128,0,0,58,35,13,128,0,0,34,13,128,0,0,7,1,2,2,0,0,7,1,13,128,0,0,35,13,128,2,0,34,13,128,2,0,7,1,2,2,0,0,7,1,13,128,0,0,35,13,128,1,0,34,13,128,1,0,7,1,2,2,0,0,7,1,13,128,0,0,35,13,128,6,0,34,13,128,6,0,7,1,2,2,0,0,7,1,13,128,0,0,35,13,128,8,0,34,13,128,8,0,7,1,2,2,0,0,7,1,13,128,0,0,96,108,3,104,0,0,0,0,103,110,109,4] as const;

export const STATS = { ops: 92, bytes: 526, labels: 19, unknownOps: 0, unresolvedSymbols: 11 } as const;
