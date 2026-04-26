// AUTO-GENERATED from include/battle_pyramid.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/battle_pyramid.h
// Generated: 2026-04-26

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'CallBattlePyramidFunction', ret: "void", arity: 0, params: "void" },
  { name: 'LocalIdToPyramidTrainerId', ret: "u16", arity: 1, params: "u8 localId" },
  { name: 'GetBattlePyramidTrainerFlag', ret: "bool8", arity: 1, params: "u8 eventId" },
  { name: 'MarkApproachingPyramidTrainersAsBattled', ret: "void", arity: 0, params: "void" },
  { name: 'GenerateBattlePyramidWildMon', ret: "void", arity: 0, params: "void" },
  { name: 'GetPyramidRunMultiplier', ret: "u8", arity: 0, params: "void" },
  { name: 'CurrentBattlePyramidLocation', ret: "u8", arity: 0, params: "void" },
  { name: 'InBattlePyramid_', ret: "bool8", arity: 0, params: "void" },
  { name: 'PausePyramidChallenge', ret: "void", arity: 0, params: "void" },
  { name: 'SoftResetInBattlePyramid', ret: "void", arity: 0, params: "void" },
  { name: 'CopyPyramidTrainerSpeechBefore', ret: "void", arity: 1, params: "u16 trainerId" },
  { name: 'CopyPyramidTrainerWinSpeech', ret: "void", arity: 1, params: "u16 trainerId" },
  { name: 'CopyPyramidTrainerLoseSpeech', ret: "void", arity: 1, params: "u16 trainerId" },
  { name: 'GetTrainerEncounterMusicIdInBattlePyramid', ret: "u8", arity: 1, params: "u16 trainerId" },
  { name: 'GenerateBattlePyramidFloorLayout', ret: "void", arity: 2, params: "u16 *backupMapData, bool8 setPlayerPosition" },
  { name: 'LoadBattlePyramidObjectEventTemplates', ret: "void", arity: 0, params: "void" },
  { name: 'LoadBattlePyramidFloorObjectEventScripts', ret: "void", arity: 0, params: "void" },
  { name: 'GetNumBattlePyramidObjectEvents', ret: "u8", arity: 0, params: "void" },
  { name: 'GetBattlePyramidPickupItemId', ret: "u16", arity: 0, params: "void" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'constants/battle_pyramid.h',
] as const;
