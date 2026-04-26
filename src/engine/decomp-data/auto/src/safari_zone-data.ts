// AUTO-GENERATED from src/safari_zone.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/safari_zone.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const NUM_POKEBLOCK_FEEDERS = 10;

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'EWRAM_DATA', type: "u8", name: 'gNumSafariBalls', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'sSafariZoneStepCounter', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'sSafariZoneCaughtMons', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'sSafariZonePkblkUses', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "struct PokeblockFeeder", name: 'sPokeblockFeeders', isArray: true, init: "{0}" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'ClearAllPokeblockFeeders', ret: "void", arity: 0, params: "void" },
  { name: 'DecrementFeederStepCounters', ret: "void", arity: 0, params: "void" },
  { name: 'GetSafariZoneFlag', ret: "bool32", arity: 0, params: "void" },
  { name: 'SetSafariZoneFlag', ret: "void", arity: 0, params: "void" },
  { name: 'ResetSafariZoneFlag', ret: "void", arity: 0, params: "void" },
  { name: 'EnterSafariMode', ret: "void", arity: 0, params: "void" },
  { name: 'ExitSafariMode', ret: "void", arity: 0, params: "void" },
  { name: 'SafariZoneTakeStep', ret: "bool8", arity: 0, params: "void" },
  { name: 'SafariZoneRetirePrompt', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_EndSafariBattle', ret: "void", arity: 0, params: "void" },
  { name: 'ClearPokeblockFeeder', ret: "void", arity: 1, params: "u8 index" },
  { name: 'GetPokeblockFeederInFront', ret: "void", arity: 0, params: "void" },
  { name: 'GetPokeblockFeederWithinRange', ret: "void", arity: 0, params: "void" },
  { name: 'SafariZoneActivatePokeblockFeeder', ret: "void", arity: 1, params: "u8 pkblId" },
  { name: 'GetInFrontFeederPokeblockAndSteps', ret: "bool8", arity: 0, params: "void" },
] as const;

// ─── CB2_* (callback / scene entry points) ──────────────────────────────────
export const CB2_NAMES = [
  'CB2_EndSafariBattle',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'battle.h',
  'event_data.h',
  'field_player_avatar.h',
  'overworld.h',
  'main.h',
  'pokeblock.h',
  'safari_zone.h',
  'script.h',
  'string_util.h',
  'tv.h',
  'constants/game_stat.h',
  'field_screen_effect.h',
] as const;
