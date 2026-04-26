// AUTO-GENERATED from include/siirtc.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/siirtc.h
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const SIIRTCINFO_INTFE = 1;
export const SIIRTCINFO_INTME = 2;
export const SIIRTCINFO_INTAE = 4;
export const SIIRTCINFO_24HOUR = 64;
export const SIIRTCINFO_POWER = 128;
export const HOURS_PER_DAY = 24;
export const MINUTES_PER_HOUR = 60;
export const SECONDS_PER_MINUTE = 60;

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_MONTH_0 = {
  MONTH_JAN: 1,
  MONTH_FEB: 2,
  MONTH_MAR: 3,
  MONTH_APR: 4,
  MONTH_MAY: 5,
  MONTH_JUN: 6,
  MONTH_JUL: 7,
  MONTH_AUG: 8,
  MONTH_SEP: 9,
  MONTH_OCT: 10,
  MONTH_NOV: 11,
  MONTH_DEC: 12,
  MONTH_COUNT: 13,
} as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'SiiRtcUnprotect', ret: "void", arity: 0, params: "void" },
  { name: 'SiiRtcProtect', ret: "void", arity: 0, params: "void" },
  { name: 'SiiRtcProbe', ret: "u8", arity: 0, params: "void" },
  { name: 'SiiRtcReset', ret: "bool8", arity: 0, params: "void" },
  { name: 'SiiRtcGetStatus', ret: "bool8", arity: 1, params: "struct SiiRtcInfo *rtc" },
  { name: 'SiiRtcSetStatus', ret: "bool8", arity: 1, params: "struct SiiRtcInfo *rtc" },
  { name: 'SiiRtcGetDateTime', ret: "bool8", arity: 1, params: "struct SiiRtcInfo *rtc" },
  { name: 'SiiRtcSetDateTime', ret: "bool8", arity: 1, params: "struct SiiRtcInfo *rtc" },
  { name: 'SiiRtcGetTime', ret: "bool8", arity: 1, params: "struct SiiRtcInfo *rtc" },
  { name: 'SiiRtcSetTime', ret: "bool8", arity: 1, params: "struct SiiRtcInfo *rtc" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'gba/gba.h',
] as const;
