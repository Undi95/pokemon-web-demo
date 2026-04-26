// AUTO-GENERATED from src/event_data.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/event_data.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
/** Raw expr: `(NUM_SPECIAL_FLAGS / 8)` */
export const SPECIAL_FLAGS_SIZE_EXPR = "(NUM_SPECIAL_FLAGS / 8)";
/** Raw expr: `(NUM_TEMP_FLAGS / 8)` */
export const TEMP_FLAGS_SIZE_EXPR = "(NUM_TEMP_FLAGS / 8)";
/** Raw expr: `(NUM_DAILY_FLAGS / 8)` */
export const DAILY_FLAGS_SIZE_EXPR = "(NUM_DAILY_FLAGS / 8)";
/** Raw expr: `(NUM_TEMP_VARS * 2)` */
export const TEMP_VARS_SIZE_EXPR = "(NUM_TEMP_VARS * 2)";

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'EWRAM_DATA', type: "u16", name: 'gSpecialVar_0x8000', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'gSpecialVar_0x8001', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'gSpecialVar_0x8002', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'gSpecialVar_0x8003', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'gSpecialVar_0x8004', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'gSpecialVar_0x8005', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'gSpecialVar_0x8006', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'gSpecialVar_0x8007', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'gSpecialVar_0x8008', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'gSpecialVar_0x8009', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'gSpecialVar_0x800A', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'gSpecialVar_0x800B', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'gSpecialVar_Result', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'gSpecialVar_LastTalked', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'gSpecialVar_Facing', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'gSpecialVar_MonBoxId', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'gSpecialVar_MonBoxPos', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'gSpecialVar_Unused_0x8014', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'sSpecialFlags', isArray: true, init: "{0}" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'InitEventData', ret: "void", arity: 0, params: "void" },
  { name: 'ClearTempFieldEventData', ret: "void", arity: 0, params: "void" },
  { name: 'ClearDailyFlags', ret: "void", arity: 0, params: "void" },
  { name: 'DisableNationalPokedex', ret: "void", arity: 0, params: "void" },
  { name: 'EnableNationalPokedex', ret: "void", arity: 0, params: "void" },
  { name: 'IsNationalPokedexEnabled', ret: "bool32", arity: 0, params: "void" },
  { name: 'DisableMysteryEvent', ret: "void", arity: 0, params: "void" },
  { name: 'EnableMysteryEvent', ret: "void", arity: 0, params: "void" },
  { name: 'IsMysteryEventEnabled', ret: "bool32", arity: 0, params: "void" },
  { name: 'DisableMysteryGift', ret: "void", arity: 0, params: "void" },
  { name: 'EnableMysteryGift', ret: "void", arity: 0, params: "void" },
  { name: 'IsMysteryGiftEnabled', ret: "bool32", arity: 0, params: "void" },
  { name: 'ClearMysteryGiftFlags', ret: "void", arity: 0, params: "void" },
  { name: 'ClearMysteryGiftVars', ret: "void", arity: 0, params: "void" },
  { name: 'DisableResetRTC', ret: "void", arity: 0, params: "void" },
  { name: 'EnableResetRTC', ret: "void", arity: 0, params: "void" },
  { name: 'CanResetRTC', ret: "bool32", arity: 0, params: "void" },
  { name: 'VarGet', ret: "u16", arity: 1, params: "u16 id" },
  { name: 'VarSet', ret: "bool8", arity: 2, params: "u16 id, u16 value" },
  { name: 'VarGetObjectEventGraphicsId', ret: "u8", arity: 1, params: "u8 id" },
  { name: 'FlagSet', ret: "u8", arity: 1, params: "u16 id" },
  { name: 'FlagClear', ret: "u8", arity: 1, params: "u16 id" },
  { name: 'FlagGet', ret: "bool8", arity: 1, params: "u16 id" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'event_data.h',
  'pokedex.h',
] as const;
