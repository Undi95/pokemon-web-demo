// AUTO-GENERATED from src/field_control_avatar.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/field_control_avatar.c
// Generated: 2026-04-26

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'EWRAM_DATA', type: "u8", name: 'sWildEncounterImmunitySteps', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'sPrevMetatileBehavior', isArray: false, init: "0" },
  { segment: 'COMMON_DATA', type: "u8", name: 'gSelectedObjectEvent', isArray: false, init: "0" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'GetPlayerPosition', ret: "void", arity: 1, params: "struct MapPosition *" },
  { name: 'GetInFrontOfPlayerPosition', ret: "void", arity: 1, params: "struct MapPosition *" },
  { name: 'GetPlayerCurMetatileBehavior', ret: "u16", arity: 1, params: "int" },
  { name: 'TryStartInteractionScript', ret: "bool8", arity: 3, params: "struct MapPosition *, u16, u8" },
  { name: 'TrySetupDiveDownScript', ret: "bool32", arity: 0, params: "void" },
  { name: 'TrySetupDiveEmergeScript', ret: "bool32", arity: 0, params: "void" },
  { name: 'TryStartStepBasedScript', ret: "bool8", arity: 3, params: "struct MapPosition *, u16, u16" },
  { name: 'CheckStandardWildEncounter', ret: "bool8", arity: 1, params: "u16" },
  { name: 'TryArrowWarp', ret: "bool8", arity: 3, params: "struct MapPosition *, u16, u8" },
  { name: 'IsWarpMetatileBehavior', ret: "bool8", arity: 1, params: "u16" },
  { name: 'IsArrowWarpMetatileBehavior', ret: "bool8", arity: 2, params: "u16, u8" },
  { name: 'GetWarpEventAtMapPosition', ret: "s8", arity: 2, params: "struct MapHeader *, struct MapPosition *" },
  { name: 'SetupWarp', ret: "void", arity: 3, params: "struct MapHeader *, s8, struct MapPosition *" },
  { name: 'TryDoorWarp', ret: "bool8", arity: 3, params: "struct MapPosition *, u16, u8" },
  { name: 'GetWarpEventAtPosition', ret: "s8", arity: 4, params: "struct MapHeader *, u16, u16, u8" },
  { name: 'TryStartCoordEventScript', ret: "bool8", arity: 1, params: "struct MapPosition *" },
  { name: 'TryStartWarpEventScript', ret: "bool8", arity: 2, params: "struct MapPosition *, u16" },
  { name: 'TryStartMiscWalkingScripts', ret: "bool8", arity: 1, params: "u16" },
  { name: 'TryStartStepCountScript', ret: "bool8", arity: 1, params: "u16" },
  { name: 'UpdateFriendshipStepCounter', ret: "void", arity: 0, params: "void" },
  { name: 'UpdatePoisonStepCounter', ret: "bool8", arity: 0, params: "void" },
  { name: 'FieldClearPlayerInput', ret: "void", arity: 1, params: "struct FieldInput *input" },
  { name: 'FieldGetPlayerInput', ret: "void", arity: 3, params: "struct FieldInput *input, u16 newKeys, u16 heldKeys" },
  { name: 'ProcessPlayerFieldInput', ret: "int", arity: 1, params: "struct FieldInput *input" },
  { name: 'ClearFriendshipStepCounter', ret: "UNUSED", arity: 0, params: "void" },
  { name: 'ClearPoisonStepCounter', ret: "void", arity: 0, params: "void" },
  { name: 'RestartWildEncounterImmunitySteps', ret: "void", arity: 0, params: "void" },
  { name: 'TryDoDiveWarp', ret: "bool8", arity: 2, params: "struct MapPosition *position, u16 metatileBehavior" },
  { name: 'TrySetDiveWarp', ret: "u8", arity: 0, params: "void" },
  { name: 'SetCableClubWarp', ret: "int", arity: 0, params: "void" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'battle_setup.h',
  'bike.h',
  'coord_event_weather.h',
  'daycare.h',
  'faraway_island.h',
  'event_data.h',
  'event_object_movement.h',
  'event_scripts.h',
  'fieldmap.h',
  'field_control_avatar.h',
  'field_player_avatar.h',
  'field_poison.h',
  'field_screen_effect.h',
  'field_specials.h',
  'fldeff_misc.h',
  'item_menu.h',
  'link.h',
  'match_call.h',
  'metatile_behavior.h',
  'overworld.h',
  'pokemon.h',
  'safari_zone.h',
  'script.h',
  'secret_base.h',
  'sound.h',
  'start_menu.h',
  'trainer_see.h',
  'trainer_hill.h',
  'wild_encounter.h',
  'constants/event_bg.h',
  'constants/event_objects.h',
  'constants/field_poison.h',
  'constants/map_types.h',
  'constants/songs.h',
  'constants/trainer_hill.h',
] as const;
