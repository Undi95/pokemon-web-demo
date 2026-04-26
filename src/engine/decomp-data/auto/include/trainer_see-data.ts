// AUTO-GENERATED from include/trainer_see.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/trainer_see.h
// Generated: 2026-04-26

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'CheckForTrainersWantingBattle', ret: "bool8", arity: 0, params: "void" },
  { name: 'SetBuriedTrainerMovement', ret: "void", arity: 1, params: "struct ObjectEvent *objEvent" },
  { name: 'DoTrainerApproach', ret: "void", arity: 0, params: "void" },
  { name: 'TryPrepareSecondApproachingTrainer', ret: "void", arity: 0, params: "void" },
  { name: 'FldEff_ExclamationMarkIcon', ret: "u8", arity: 0, params: "void" },
  { name: 'FldEff_QuestionMarkIcon', ret: "u8", arity: 0, params: "void" },
  { name: 'FldEff_HeartIcon', ret: "u8", arity: 0, params: "void" },
  { name: 'GetCurrentApproachingTrainerObjectEventId', ret: "u8", arity: 0, params: "void" },
  { name: 'GetChosenApproachingTrainerObjectEventId', ret: "u8", arity: 1, params: "u8 arrayId" },
  { name: 'PlayerFaceTrainerAfterBattle', ret: "void", arity: 0, params: "void" },
] as const;
