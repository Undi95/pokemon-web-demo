// AUTO-GENERATED from include/trainer_hill.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/trainer_hill.h
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
/** Raw expr: `{ .nickname = __("$$$$$$$$$$$") }` */
export const DUMMY_HILL_MON_EXPR = "{ .nickname = __(\"$$$$$$$$$$$\") }";

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'CallTrainerHillFunction', ret: "void", arity: 0, params: "void" },
  { name: 'ResetTrainerHillResults', ret: "void", arity: 0, params: "void" },
  { name: 'GetTrainerHillOpponentClass', ret: "u8", arity: 1, params: "u16 trainerId" },
  { name: 'GetTrainerHillTrainerName', ret: "void", arity: 2, params: "u8 *dst, u16 trainerId" },
  { name: 'GetTrainerHillTrainerFrontSpriteId', ret: "u8", arity: 1, params: "u16 trainerId" },
  { name: 'InitTrainerHillBattleStruct', ret: "void", arity: 0, params: "void" },
  { name: 'FreeTrainerHillBattleStruct', ret: "void", arity: 0, params: "void" },
  { name: 'CopyTrainerHillTrainerText', ret: "void", arity: 2, params: "u8 which, u16 trainerId" },
  { name: 'InTrainerHillChallenge', ret: "bool8", arity: 0, params: "void" },
  { name: 'PrintOnTrainerHillRecordsWindow', ret: "void", arity: 0, params: "void" },
  { name: 'LoadTrainerHillObjectEventTemplates', ret: "void", arity: 0, params: "void" },
  { name: 'LoadTrainerHillFloorObjectEventScripts', ret: "bool32", arity: 0, params: "void" },
  { name: 'GenerateTrainerHillFloorLayout', ret: "void", arity: 1, params: "u16 *mapArg" },
  { name: 'InTrainerHill', ret: "bool32", arity: 0, params: "void" },
  { name: 'GetCurrentTrainerHillMapId', ret: "u8", arity: 0, params: "void" },
  { name: 'SetWarpDestinationTrainerHill4F', ret: "WarpEvent*", arity: 0, params: "void" },
  { name: 'SetWarpDestinationTrainerHillFinalFloor', ret: "WarpEvent*", arity: 1, params: "u8 warpEventId" },
  { name: 'LocalIdToHillTrainerId', ret: "u16", arity: 1, params: "u8 localId" },
  { name: 'GetHillTrainerFlag', ret: "bool8", arity: 1, params: "u8 objectEventId" },
  { name: 'SetHillTrainerFlag', ret: "void", arity: 0, params: "void" },
  { name: 'FillHillTrainerParty', ret: "void", arity: 0, params: "void" },
  { name: 'FillHillTrainersParties', ret: "void", arity: 0, params: "void" },
  { name: 'GetTrainerEncounterMusicIdInTrainerHill', ret: "u8", arity: 1, params: "u16 trainerId" },
  { name: 'GetNumFloorsInTrainerHillChallenge', ret: "u8", arity: 0, params: "void" },
  { name: 'TryLoadTrainerHillEReaderPalette', ret: "void", arity: 0, params: "void" },
  { name: 'OnTrainerHillEReaderChallengeFloor', ret: "bool32", arity: 0, params: "void" },
] as const;
