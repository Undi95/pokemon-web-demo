// AUTO-GENERATED from include/frontier_util.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/frontier_util.h
// Generated: 2026-04-26

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'CallFrontierUtilFunc', ret: "void", arity: 0, params: "void" },
  { name: 'GetFrontierBrainStatus', ret: "u8", arity: 0, params: "void" },
  { name: 'CopyFrontierTrainerText', ret: "void", arity: 2, params: "u8 whichText, u16 trainerId" },
  { name: 'ResetWinStreaks', ret: "void", arity: 0, params: "void" },
  { name: 'GetCurrentFacilityWinStreak', ret: "u32", arity: 0, params: "void" },
  { name: 'ResetFrontierTrainerIds', ret: "void", arity: 0, params: "void" },
  { name: 'GetPlayerSymbolCountForFacility', ret: "u8", arity: 1, params: "u8 facility" },
  { name: 'ShowRankingHallRecordsWindow', ret: "void", arity: 0, params: "void" },
  { name: 'ScrollRankingHallRecordsWindow', ret: "void", arity: 0, params: "void" },
  { name: 'ClearRankingHallRecords', ret: "void", arity: 0, params: "void" },
  { name: 'SaveGameFrontier', ret: "void", arity: 0, params: "void" },
  { name: 'GetFrontierBrainTrainerPicIndex', ret: "u8", arity: 0, params: "void" },
  { name: 'GetFrontierBrainTrainerClass', ret: "u8", arity: 0, params: "void" },
  { name: 'CopyFrontierBrainTrainerName', ret: "void", arity: 1, params: "u8 *dst" },
  { name: 'IsFrontierBrainFemale', ret: "bool8", arity: 0, params: "void" },
  { name: 'SetFrontierBrainObjEventGfx_2', ret: "void", arity: 0, params: "void" },
  { name: 'CreateFrontierBrainPokemon', ret: "void", arity: 0, params: "void" },
  { name: 'GetFrontierBrainMonSpecies', ret: "u16", arity: 1, params: "u8 monId" },
  { name: 'SetFrontierBrainObjEventGfx', ret: "void", arity: 1, params: "u8 facility" },
  { name: 'GetFrontierBrainMonMove', ret: "u16", arity: 2, params: "u8 monId, u8 moveSlotId" },
  { name: 'GetFrontierBrainMonNature', ret: "u8", arity: 1, params: "u8 monId" },
  { name: 'GetFrontierBrainMonEvs', ret: "u8", arity: 2, params: "u8 monId, u8 evStatId" },
  { name: 'GetFronterBrainSymbol', ret: "s32", arity: 0, params: "void" },
] as const;
