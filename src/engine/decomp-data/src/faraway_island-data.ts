// AUTO-GENERATED from src/faraway_island.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/faraway_island.c
// Generated: 2026-04-26

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'EWRAM_DATA', type: "u8", name: 'sGrassSpriteId', isArray: false, init: "0" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'GetValidMewMoveDirection', ret: "u8", arity: 1, params: "u8" },
  { name: 'ShouldMewMoveNorth', ret: "bool8", arity: 2, params: "struct ObjectEvent *, u8" },
  { name: 'ShouldMewMoveSouth', ret: "bool8", arity: 2, params: "struct ObjectEvent *, u8" },
  { name: 'ShouldMewMoveEast', ret: "bool8", arity: 2, params: "struct ObjectEvent *, u8" },
  { name: 'ShouldMewMoveWest', ret: "bool8", arity: 2, params: "struct ObjectEvent *, u8" },
  { name: 'GetRandomMewDirectionCandidate', ret: "u8", arity: 1, params: "u8" },
  { name: 'CanMewMoveToCoords', ret: "bool8", arity: 2, params: "s16, s16" },
  { name: 'GetMewObjectEventId', ret: "u8", arity: 0, params: "void" },
  { name: 'GetMewMoveDirection', ret: "u32", arity: 0, params: "void" },
  { name: 'UpdateFarawayIslandStepCounter', ret: "void", arity: 0, params: "void" },
  { name: 'VarSet', ret: "else", arity: 2, params: "VAR_FARAWAY_ISLAND_STEP_COUNTER, steps" },
  { name: 'ObjectEventIsFarawayIslandMew', ret: "bool8", arity: 1, params: "struct ObjectEvent *objectEvent" },
  { name: 'IsMewPlayingHideAndSeek', ret: "bool8", arity: 0, params: "void" },
  { name: 'ShouldMewShakeGrass', ret: "bool8", arity: 1, params: "struct ObjectEvent *objectEvent" },
  { name: 'SetMewAboveGrass', ret: "void", arity: 0, params: "void" },
  { name: 'DestroyMewEmergingGrassSprite', ret: "void", arity: 0, params: "void" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'event_data.h',
  'event_object_movement.h',
  'field_weather.h',
  'fieldmap.h',
  'metatile_behavior.h',
  'sprite.h',
  'constants/event_objects.h',
  'constants/field_effects.h',
  'constants/metatile_behaviors.h',
] as const;
