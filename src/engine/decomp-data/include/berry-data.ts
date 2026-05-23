// AUTO-GENERATED from include/berry.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/berry.h
// Generated: 2026-04-26

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'ClearEnigmaBerries', ret: "void", arity: 0, params: "void" },
  { name: 'SetEnigmaBerry', ret: "void", arity: 1, params: "u8 *src" },
  { name: 'IsEnigmaBerryValid', ret: "bool32", arity: 0, params: "void" },
  { name: 'ObjectEventInteractionWaterBerryTree', ret: "bool32", arity: 0, params: "void" },
  { name: 'IsPlayerFacingEmptyBerryTreePatch', ret: "bool8", arity: 0, params: "void" },
  { name: 'TryToWaterBerryTree', ret: "bool8", arity: 0, params: "void" },
  { name: 'ClearBerryTrees', ret: "void", arity: 0, params: "void" },
  { name: 'BerryTreeTimeUpdate', ret: "void", arity: 1, params: "s32 minutes" },
  { name: 'PlantBerryTree', ret: "void", arity: 4, params: "u8 id, u8 berry, u8 stage, bool8 allowGrowth" },
  { name: 'RemoveBerryTree', ret: "void", arity: 1, params: "u8 id" },
  { name: 'GetBerryTypeByBerryTreeId', ret: "u8", arity: 1, params: "u8 id" },
  { name: 'GetStageByBerryTreeId', ret: "u8", arity: 1, params: "u8 id" },
  { name: 'ItemIdToBerryType', ret: "u8", arity: 1, params: "u16 item" },
  { name: 'GetBerryNameByBerryType', ret: "void", arity: 2, params: "u8 berry, u8 *string" },
  { name: 'Bag_ChooseBerry', ret: "void", arity: 0, params: "void" },
  { name: 'ObjectEventInteractionGetBerryTreeData', ret: "void", arity: 0, params: "void" },
  { name: 'ObjectEventInteractionPlantBerryTree', ret: "void", arity: 0, params: "void" },
  { name: 'ObjectEventInteractionPickBerryTree', ret: "void", arity: 0, params: "void" },
  { name: 'ObjectEventInteractionRemoveBerryTree', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerHasBerries', ret: "bool8", arity: 0, params: "void" },
  { name: 'SetBerryTreesSeen', ret: "void", arity: 0, params: "void" },
] as const;
