// AUTO-GENERATED from src/librfu_sio32id.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/librfu_sio32id.c
// Generated: 2026-04-26

// ─── Numeric arrays (raw data tables) ───────────────────────────────────────
export const Sio32ConnectionData: readonly number[] = [18766,21582,20037,20292] as const;

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'COMMON_DATA', type: "struct RfuSIO32Id", name: 'gRfuSIO32Id', isArray: false, init: "{0}" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'Sio32IDIntr', ret: "void", arity: 0, params: "void" },
  { name: 'Sio32IDInit', ret: "void", arity: 0, params: "void" },
  { name: 'Sio32IDMain', ret: "s32", arity: 0, params: "void" },
  { name: 'AgbRFU_checkID', ret: "s32", arity: 1, params: "u8 maxTries" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'librfu.h',
] as const;
