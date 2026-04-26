// AUTO-GENERATED from data/scripts/trainer_battle-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=92, bytes=394, labels=19, unknownOps=2, unresolvedSymbols=16

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "EventScript_StartTrainerApproach": 0,
  "EventScript_TrainerApproach": 2,
  "EventScript_TryDoNormalTrainerBattle": 15,
  "EventScript_NoNormalTrainerBattle": 70,
  "EventScript_TryDoDoubleTrainerBattle": 71,
  "EventScript_NotEnoughMonsForDoubleBattle": 121,
  "EventScript_NoDoubleTrainerBattle": 131,
  "EventScript_DoNoIntroTrainerBattle": 132,
  "EventScript_TryDoRematchBattle": 162,
  "EventScript_NoRematchTrainerBattle": 205,
  "EventScript_TryDoDoubleRematchBattle": 206,
  "EventScript_NoDoubleRematchTrainerBattle": 258,
  "EventScript_NotEnoughMonsForDoubleRematchBattle": 259,
  "EventScript_RevealTrainer": 269,
  "Movement_RevealTrainer": 294,
  "EventScript_ShowTrainerIntroMsg": 296,
  "EventScript_DoTrainerBattle": 323,
  "EventScript_EndTrainerBattle": 380,
  "Std_MsgboxAutoclose": 383,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [217,218,38,0,0,0,38,0,0,0,89,40,1,0,0,107,91,80,15,128,38,1,0,0,81,15,128,38,1,0,0,0,0,82,0,0,83,0,0,0,0,39,13,128,0,0,0,35,13,128,0,0,34,13,128,0,0,38,0,0,0,38,0,0,0,89,40,1,0,0,95,107,91,88,13,1,0,0,39,13,128,0,0,0,35,13,128,0,0,34,13,128,0,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,38,0,0,0,38,0,0,0,89,40,1,0,0,38,0,0,0,0,0,0,110,109,90,95,80,15,128,38,1,0,0,81,15,128,38,1,0,0,0,0,82,0,0,83,0,0,0,0,38,0,0,0,94,95,88,13,1,0,0,39,13,128,0,0,0,35,13,128,0,0,34,13,128,0,0,38,0,0,0,38,0,0,0,38,0,0,0,0,0,0,110,38,0,0,0,108,90,95,39,13,128,0,0,0,35,13,128,0,0,34,13,128,0,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,38,0,0,0,38,0,0,0,38,0,0,0,0,0,0,110,38,0,0,0,108,90,95,38,0,0,0,0,0,0,110,109,90,80,15,128,38,1,0,0,81,15,128,38,1,0,0,0,0,82,0,0,83,0,0,0,0,15,89,254,38,0,0,0,0,0,0,110,38,0,0,0,35,13,128,1,0,34,13,128,1,0,89,67,1,0,0,94,39,13,128,0,0,0,35,13,128,0,0,34,13,128,0,0,35,13,128,2,0,34,13,128,2,0,35,13,128,1,0,34,13,128,1,0,35,13,128,6,0,34,13,128,6,0,35,13,128,8,0,34,13,128,8,0,96,108,90,104,0,0,0,0,0,0,0,110,109,15] as const;

export const STATS = { ops: 92, bytes: 394, labels: 19, unknownOps: 2, unresolvedSymbols: 16 } as const;
