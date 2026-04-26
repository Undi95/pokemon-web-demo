// AUTO-GENERATED from src/battle_pyramid.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/battle_pyramid.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const NUM_LAYOUT_OFFSETS = 8;
export const ABILITY_RANDOM = 2;

// ─── Function pointer tables (opcode dispatch) ──────────────────────────────
export const sBattlePyramidFunctions = ['InitPyramidChallenge', 'GetBattlePyramidData', 'SetBattlePyramidData', 'SavePyramidChallenge', 'SetBattlePyramidPrize', 'GiveBattlePyramidPrize', 'SeedPyramidFloor', 'SetPickupItem', 'HidePyramidItem', 'SetPyramidFacilityTrainers', 'ShowPostBattleHintText', 'UpdatePyramidWinStreak', 'GetCurrentBattlePyramidLocation', 'UpdatePyramidLightRadius', 'ClearPyramidPartyHeldItems', 'SetPyramidFloorPalette', 'BattlePyramidStartMenu', 'RestorePyramidPlayerParty'] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'InitPyramidChallenge', ret: "void", arity: 0, params: "void" },
  { name: 'GetBattlePyramidData', ret: "void", arity: 0, params: "void" },
  { name: 'SetBattlePyramidData', ret: "void", arity: 0, params: "void" },
  { name: 'SavePyramidChallenge', ret: "void", arity: 0, params: "void" },
  { name: 'SetBattlePyramidPrize', ret: "void", arity: 0, params: "void" },
  { name: 'GiveBattlePyramidPrize', ret: "void", arity: 0, params: "void" },
  { name: 'SeedPyramidFloor', ret: "void", arity: 0, params: "void" },
  { name: 'SetPickupItem', ret: "void", arity: 0, params: "void" },
  { name: 'HidePyramidItem', ret: "void", arity: 0, params: "void" },
  { name: 'SetPyramidFacilityTrainers', ret: "void", arity: 0, params: "void" },
  { name: 'ShowPostBattleHintText', ret: "void", arity: 0, params: "void" },
  { name: 'UpdatePyramidWinStreak', ret: "void", arity: 0, params: "void" },
  { name: 'GetCurrentBattlePyramidLocation', ret: "void", arity: 0, params: "void" },
  { name: 'UpdatePyramidLightRadius', ret: "void", arity: 0, params: "void" },
  { name: 'ClearPyramidPartyHeldItems', ret: "void", arity: 0, params: "void" },
  { name: 'SetPyramidFloorPalette', ret: "void", arity: 0, params: "void" },
  { name: 'BattlePyramidStartMenu', ret: "void", arity: 0, params: "void" },
  { name: 'RestorePyramidPlayerParty', ret: "void", arity: 0, params: "void" },
  { name: 'InitPyramidBagItems', ret: "void", arity: 1, params: "u8" },
  { name: 'GetPyramidFloorTemplateId', ret: "u8", arity: 0, params: "void" },
  { name: 'GetPostBattleDirectionHintTextIndex', ret: "u8", arity: 3, params: "int *, u8, u8" },
  { name: 'Task_SetPyramidFloorPalette', ret: "void", arity: 1, params: "u8" },
  { name: 'MarkPyramidTrainerAsBattled', ret: "void", arity: 1, params: "u16" },
  { name: 'GetPyramidFloorLayoutOffsets', ret: "void", arity: 1, params: "u8 *" },
  { name: 'GetPyramidEntranceAndExitSquareIds', ret: "void", arity: 2, params: "u8 *, u8 *" },
  { name: 'SetPyramidObjectPositionsUniformly', ret: "void", arity: 1, params: "u8" },
  { name: 'SetPyramidObjectPositionsInAndNearSquare', ret: "bool8", arity: 2, params: "u8, u8" },
  { name: 'SetPyramidObjectPositionsNearSquare', ret: "bool8", arity: 2, params: "u8, u8" },
  { name: 'TrySetPyramidObjectEventPositionInSquare', ret: "bool8", arity: 4, params: "u8, u8 *, u8, u8" },
  { name: 'TrySetPyramidObjectEventPositionAtCoords', ret: "bool8", arity: 6, params: "bool8, u8, u8, u8 *, u8, u8" },
  { name: 'CallBattlePyramidFunction', ret: "void", arity: 0, params: "void" },
  { name: 'PlaySE', ret: "else", arity: 1, params: "gSpecialVar_0x8007" },
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
  { name: 'BattlePyramidRetireChallenge', ret: "UNUSED", arity: 0, params: "void" },
  { name: 'GetUniqueTrainerId', ret: "u16", arity: 1, params: "u8 objectEventId" },
  { name: 'GenerateBattlePyramidFloorLayout', ret: "void", arity: 2, params: "u16 *backupMapData, bool8 setPlayerPosition" },
  { name: 'LoadBattlePyramidObjectEventTemplates', ret: "void", arity: 0, params: "void" },
  { name: 'LoadBattlePyramidFloorObjectEventScripts', ret: "void", arity: 0, params: "void" },
  { name: 'GetNumBattlePyramidObjectEvents', ret: "u8", arity: 0, params: "void" },
  { name: 'GetBattlePyramidPickupItemId', ret: "u16", arity: 0, params: "void" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_SetPyramidFloorPalette',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'battle_pyramid.h',
  'battle_pyramid_bag.h',
  'event_data.h',
  'battle.h',
  'battle_setup.h',
  'battle_tower.h',
  'save.h',
  'strings.h',
  'fieldmap.h',
  'party_menu.h',
  'palette.h',
  'field_screen_effect.h',
  'field_message_box.h',
  'random.h',
  'item.h',
  'util.h',
  'sound.h',
  'task.h',
  'start_menu.h',
  'string_util.h',
  'trainer_see.h',
  'main.h',
  'load_save.h',
  'script.h',
  'malloc.h',
  'overworld.h',
  'event_scripts.h',
  'graphics.h',
  'constants/battle_frontier.h',
  'constants/battle_pyramid.h',
  'constants/event_objects.h',
  'constants/event_object_movement.h',
  'constants/frontier_util.h',
  'constants/items.h',
  'constants/layouts.h',
  'constants/metatile_labels.h',
  'constants/moves.h',
  'constants/trainers.h',
  'data/battle_frontier/battle_pyramid_level_50_wild_mons.h',
  'data/battle_frontier/battle_pyramid_open_level_wild_mons.h',
] as const;
