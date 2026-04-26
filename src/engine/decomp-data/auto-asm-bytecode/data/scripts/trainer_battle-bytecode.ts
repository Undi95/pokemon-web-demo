// AUTO-GENERATED from data/scripts/trainer_battle-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=92, bytes=538, labels=19, unknownOps=0, unresolvedSymbols=16

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "EventScript_StartTrainerApproach": 0,
  "EventScript_TrainerApproach": 2,
  "EventScript_TryDoNormalTrainerBattle": 15,
  "EventScript_NoNormalTrainerBattle": 82,
  "EventScript_TryDoDoubleTrainerBattle": 83,
  "EventScript_NotEnoughMonsForDoubleBattle": 157,
  "EventScript_NoDoubleTrainerBattle": 167,
  "EventScript_DoNoIntroTrainerBattle": 168,
  "EventScript_TryDoRematchBattle": 198,
  "EventScript_NoRematchTrainerBattle": 253,
  "EventScript_TryDoDoubleRematchBattle": 254,
  "EventScript_NoDoubleRematchTrainerBattle": 330,
  "EventScript_NotEnoughMonsForDoubleRematchBattle": 331,
  "EventScript_RevealTrainer": 341,
  "Movement_RevealTrainer": 366,
  "EventScript_ShowTrainerIntroMsg": 368,
  "EventScript_DoTrainerBattle": 407,
  "EventScript_EndTrainerBattle": 524,
  "Std_MsgboxAutoclose": 527,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [217,218,38,0,0,0,38,0,0,0,89,112,1,0,0,107,91,80,15,128,110,1,0,0,81,15,128,110,1,0,0,0,0,82,0,0,83,0,0,0,0,39,13,128,0,0,0,35,13,128,0,0,34,13,128,0,0,7,5,82,0,0,0,7,5,13,128,0,0,38,0,0,0,38,0,0,0,89,112,1,0,0,95,107,91,88,85,1,0,0,39,13,128,0,0,0,35,13,128,0,0,34,13,128,0,0,7,5,167,0,0,0,7,5,13,128,0,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,7,5,157,0,0,0,7,5,13,128,0,0,38,0,0,0,38,0,0,0,89,112,1,0,0,38,0,0,0,0,0,0,110,109,90,95,80,15,128,110,1,0,0,81,15,128,110,1,0,0,0,0,82,0,0,83,0,0,0,0,38,0,0,0,94,95,88,85,1,0,0,39,13,128,0,0,0,35,13,128,0,0,34,13,128,0,0,7,1,253,0,0,0,7,1,13,128,0,0,38,0,0,0,38,0,0,0,38,0,0,0,0,0,0,110,38,0,0,0,108,90,95,39,13,128,0,0,0,35,13,128,0,0,34,13,128,0,0,7,1,74,1,0,0,7,1,13,128,0,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,7,5,75,1,0,0,7,5,13,128,0,0,38,0,0,0,38,0,0,0,38,0,0,0,0,0,0,110,38,0,0,0,108,90,95,38,0,0,0,0,0,0,110,109,90,80,15,128,110,1,0,0,81,15,128,110,1,0,0,0,0,82,0,0,83,0,0,0,0,15,89,254,38,0,0,0,0,0,0,110,38,0,0,0,35,13,128,1,0,34,13,128,1,0,7,1,2,0,0,0,7,1,13,128,0,0,89,151,1,0,0,94,39,13,128,0,0,0,35,13,128,0,0,34,13,128,0,0,7,1,12,2,0,0,7,1,13,128,0,0,35,13,128,2,0,34,13,128,2,0,7,1,12,2,0,0,7,1,13,128,0,0,35,13,128,1,0,34,13,128,1,0,7,1,12,2,0,0,7,1,13,128,0,0,35,13,128,6,0,34,13,128,6,0,7,1,12,2,0,0,7,1,13,128,0,0,35,13,128,8,0,34,13,128,8,0,7,1,12,2,0,0,7,1,13,128,0,0,96,108,90,104,0,0,0,0,0,0,0,110,109,15] as const;

export const STATS = { ops: 92, bytes: 538, labels: 19, unknownOps: 0, unresolvedSymbols: 16 } as const;
