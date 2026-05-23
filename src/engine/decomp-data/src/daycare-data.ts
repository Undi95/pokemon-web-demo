// AUTO-GENERATED from src/daycare.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/daycare.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
/** Raw expr: `data[0]` */
export const tMenuListTaskId_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tWindowId_EXPR = "data[1]";

// ─── WindowTemplate ─────────────────────────────────────────────────────────────
export const sDaycareLevelMenuWindowTemplate = { bg: 0, tilemapLeft: 15, tilemapTop: 1, width: 14, height: 6, paletteNum: 15, baseBlock: 8 } as const;

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'EWRAM_DATA', type: "u16", name: 'sHatchedEggLevelUpMoves', isArray: true, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'sHatchedEggFatherMoves', isArray: true, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'sHatchedEggFinalMoves', isArray: true, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'sHatchedEggEggMoves', isArray: true, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'sHatchedEggMotherMoves', isArray: true, init: "{0}" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'ClearDaycareMonMail', ret: "void", arity: 1, params: "struct DaycareMail *mail" },
  { name: 'SetInitialEggData', ret: "void", arity: 3, params: "struct Pokemon *mon, u16 species, struct DayCare *daycare" },
  { name: 'GetDaycareCompatibilityScore', ret: "u8", arity: 1, params: "struct DayCare *daycare" },
  { name: 'DaycarePrintMonInfo', ret: "void", arity: 3, params: "u8 windowId, u32 daycareSlotId, u8 y" },
  { name: 'CountPokemonInDaycare', ret: "u8", arity: 1, params: "struct DayCare *daycare" },
  { name: 'InitDaycareMailRecordMixing', ret: "void", arity: 2, params: "struct DayCare *daycare, struct RecordMixingDaycareMail *mixMail" },
  { name: 'Daycare_FindEmptySpot', ret: "s8", arity: 1, params: "struct DayCare *daycare" },
  { name: 'StorePokemonInDaycare', ret: "void", arity: 2, params: "struct Pokemon *mon, struct DaycareMon *daycareMon" },
  { name: 'StorePokemonInEmptyDaycareSlot', ret: "void", arity: 2, params: "struct Pokemon *mon, struct DayCare *daycare" },
  { name: 'StoreSelectedPokemonInDaycare', ret: "void", arity: 0, params: "void" },
  { name: 'ShiftDaycareSlots', ret: "void", arity: 1, params: "struct DayCare *daycare" },
  { name: 'ApplyDaycareExperience', ret: "void", arity: 1, params: "struct Pokemon *mon" },
  { name: 'TakeSelectedPokemonFromDaycare', ret: "u16", arity: 1, params: "struct DaycareMon *daycareMon" },
  { name: 'TakeSelectedPokemonMonFromDaycareShiftSlots', ret: "u16", arity: 2, params: "struct DayCare *daycare, u8 slotId" },
  { name: 'TakePokemonFromDaycare', ret: "u16", arity: 0, params: "void" },
  { name: 'GetLevelAfterDaycareSteps', ret: "u8", arity: 2, params: "struct BoxPokemon *mon, u32 steps" },
  { name: 'GetNumLevelsGainedFromSteps', ret: "u8", arity: 1, params: "struct DaycareMon *daycareMon" },
  { name: 'GetNumLevelsGainedForDaycareMon', ret: "u8", arity: 1, params: "struct DaycareMon *daycareMon" },
  { name: 'GetDaycareCostForSelectedMon', ret: "u32", arity: 1, params: "struct DaycareMon *daycareMon" },
  { name: 'GetDaycareCostForMon', ret: "u16", arity: 2, params: "struct DayCare *daycare, u8 slotId" },
  { name: 'GetDaycareCost', ret: "void", arity: 0, params: "void" },
  { name: 'Debug_AddDaycareSteps', ret: "UNUSED", arity: 1, params: "u16 numSteps" },
  { name: 'GetNumLevelsGainedFromDaycare', ret: "u8", arity: 0, params: "void" },
  { name: 'ClearDaycareMon', ret: "void", arity: 1, params: "struct DaycareMon *daycareMon" },
  { name: 'ClearAllDaycareData', ret: "UNUSED", arity: 1, params: "struct DayCare *daycare" },
  { name: 'GetEggSpecies', ret: "u16", arity: 1, params: "u16 species" },
  { name: 'GetParentToInheritNature', ret: "s32", arity: 1, params: "struct DayCare *daycare" },
  { name: '_TriggerPendingDaycareEgg', ret: "void", arity: 1, params: "struct DayCare *daycare" },
  { name: '_TriggerPendingDaycareMaleEgg', ret: "void", arity: 1, params: "struct DayCare *daycare" },
  { name: 'TriggerPendingDaycareEgg', ret: "void", arity: 0, params: "void" },
  { name: 'TriggerPendingDaycareMaleEgg', ret: "UNUSED", arity: 0, params: "void" },
  { name: 'RemoveIVIndexFromList', ret: "void", arity: 2, params: "u8 *ivs, u8 selectedIv" },
  { name: 'InheritIVs', ret: "void", arity: 2, params: "struct Pokemon *egg, struct DayCare *daycare" },
  { name: 'GetEggMoves', ret: "u8", arity: 2, params: "struct Pokemon *pokemon, u16 *eggMoves" },
  { name: 'BuildEggMoveset', ret: "void", arity: 3, params: "struct Pokemon *egg, struct BoxPokemon *father, struct BoxPokemon *mother" },
  { name: 'RemoveEggFromDayCare', ret: "void", arity: 1, params: "struct DayCare *daycare" },
  { name: 'RejectEggFromDayCare', ret: "void", arity: 0, params: "void" },
  { name: 'AlterEggSpeciesWithIncenseItem', ret: "void", arity: 2, params: "u16 *species, struct DayCare *daycare" },
  { name: 'GiveVoltTackleIfLightBall', ret: "void", arity: 2, params: "struct Pokemon *mon, struct DayCare *daycare" },
  { name: 'DetermineEggSpeciesAndParentSlots', ret: "u16", arity: 2, params: "struct DayCare *daycare, u8 *parentSlots" },
  { name: '_GiveEggFromDaycare', ret: "void", arity: 1, params: "struct DayCare *daycare" },
  { name: 'CreateEgg', ret: "void", arity: 3, params: "struct Pokemon *mon, u16 species, bool8 setHotSpringsLocation" },
  { name: 'GiveEggFromDaycare', ret: "void", arity: 0, params: "void" },
  { name: 'TryProduceOrHatchEgg', ret: "bool8", arity: 1, params: "struct DayCare *daycare" },
  { name: 'ShouldEggHatch', ret: "bool8", arity: 0, params: "void" },
  { name: 'IsEggPending', ret: "bool8", arity: 1, params: "struct DayCare *daycare" },
  { name: '_GetDaycareMonNicknames', ret: "void", arity: 1, params: "struct DayCare *daycare" },
  { name: 'GetSelectedMonNicknameAndSpecies', ret: "u16", arity: 0, params: "void" },
  { name: 'GetDaycareMonNicknames', ret: "void", arity: 0, params: "void" },
  { name: 'GetDaycareState', ret: "u8", arity: 0, params: "void" },
  { name: 'GetDaycarePokemonCount', ret: "UNUSED", arity: 0, params: "void" },
  { name: 'EggGroupsOverlap', ret: "bool8", arity: 2, params: "u16 *eggGroups1, u16 *eggGroups2" },
  { name: 'GetDaycareCompatibilityScoreFromSave', ret: "u8", arity: 0, params: "void" },
  { name: 'SetDaycareCompatibilityString', ret: "void", arity: 0, params: "void" },
  { name: 'NameHasGenderSymbol', ret: "bool8", arity: 2, params: "const u8 *name, u8 genderRatio" },
  { name: 'GetDaycareLevelMenuText', ret: "UNUSED", arity: 2, params: "struct DayCare *daycare, u8 *dest" },
  { name: 'GetDaycareLevelMenuLevelText', ret: "UNUSED", arity: 2, params: "struct DayCare *daycare, u8 *dest" },
  { name: 'DaycareAddTextPrinter', ret: "void", arity: 4, params: "u8 windowId, const u8 *text, u32 x, u32 y" },
  { name: 'DaycarePrintMonNickname', ret: "void", arity: 4, params: "struct DayCare *daycare, u8 windowId, u32 daycareSlotId, u32 y" },
  { name: 'DaycarePrintMonLvl', ret: "void", arity: 4, params: "struct DayCare *daycare, u8 windowId, u32 daycareSlotId, u32 y" },
  { name: 'Task_HandleDaycareLevelMenuInput', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ShowDaycareLevelMenu', ret: "void", arity: 0, params: "void" },
  { name: 'ChooseSendDaycareMon', ret: "void", arity: 0, params: "void" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_HandleDaycareLevelMenuInput',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'pokemon.h',
  'battle.h',
  'daycare.h',
  'string_util.h',
  'mail.h',
  'pokemon_storage_system.h',
  'event_data.h',
  'random.h',
  'main.h',
  'egg_hatch.h',
  'text.h',
  'menu.h',
  'international_string_util.h',
  'script.h',
  'strings.h',
  'task.h',
  'window.h',
  'party_menu.h',
  'list_menu.h',
  'overworld.h',
  'constants/items.h',
  'constants/moves.h',
  'constants/region_map_sections.h',
  'data/pokemon/egg_moves.h',
] as const;
