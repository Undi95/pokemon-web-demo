// AUTO-GENERATED from src/berry.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/berry.c
// Generated: 2026-04-26

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'GetEnigmaBerryChecksum', ret: "u32", arity: 1, params: "struct EnigmaBerry *enigmaBerry" },
  { name: 'BerryTreeGrow', ret: "bool32", arity: 1, params: "struct BerryTree *tree" },
  { name: 'BerryTypeToItemId', ret: "u16", arity: 1, params: "u16 berry" },
  { name: 'BerryTreeGetNumStagesWatered', ret: "u8", arity: 1, params: "struct BerryTree *tree" },
  { name: 'GetNumStagesWateredByBerryTreeId', ret: "u8", arity: 1, params: "u8 id" },
  { name: 'CalcBerryYieldInternal', ret: "u8", arity: 3, params: "u16 max, u16 min, u8 water" },
  { name: 'CalcBerryYield', ret: "u8", arity: 1, params: "struct BerryTree *tree" },
  { name: 'GetBerryCountByBerryTreeId', ret: "u8", arity: 1, params: "u8 id" },
  { name: 'GetStageDurationByBerryType', ret: "u16", arity: 1, params: "u8" },
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
  { name: 'GetBerryCountStringByBerryType', ret: "void", arity: 3, params: "u8 berry, u8 *dest, u32 berryCount" },
  { name: 'AllowBerryTreeGrowth', ret: "void", arity: 1, params: "u8 id" },
  { name: 'ObjectEventInteractionGetBerryTreeData', ret: "void", arity: 0, params: "void" },
  { name: 'ObjectEventInteractionGetBerryName', ret: "void", arity: 0, params: "void" },
  { name: 'ObjectEventInteractionGetBerryCountString', ret: "void", arity: 0, params: "void" },
  { name: 'Bag_ChooseBerry', ret: "void", arity: 0, params: "void" },
  { name: 'ObjectEventInteractionPlantBerryTree', ret: "void", arity: 0, params: "void" },
  { name: 'ObjectEventInteractionPickBerryTree', ret: "void", arity: 0, params: "void" },
  { name: 'ObjectEventInteractionRemoveBerryTree', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerHasBerries', ret: "bool8", arity: 0, params: "void" },
  { name: 'SetBerryTreesSeen', ret: "void", arity: 0, params: "void" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'berry.h',
  'event_data.h',
  'event_object_movement.h',
  'event_scripts.h',
  'field_control_avatar.h',
  'fieldmap.h',
  'item.h',
  'item_menu.h',
  'main.h',
  'random.h',
  'string_util.h',
  'text.h',
  'constants/event_object_movement.h',
  'constants/items.h',
] as const;
