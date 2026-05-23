// AUTO-GENERATED from src/rtc.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/rtc.c
// Generated: 2026-04-26

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'COMMON_DATA', type: "struct Time", name: 'gLocalTime', isArray: false, init: "{0}" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'RtcDisableInterrupts', ret: "void", arity: 0, params: "void" },
  { name: 'RtcRestoreInterrupts', ret: "void", arity: 0, params: "void" },
  { name: 'ConvertBcdToBinary', ret: "u32", arity: 1, params: "u8 bcd" },
  { name: 'IsLeapYear', ret: "bool8", arity: 1, params: "u32 year" },
  { name: 'ConvertDateToDayCount', ret: "u16", arity: 3, params: "u8 year, u8 month, u8 day" },
  { name: 'RtcGetDayCount', ret: "u16", arity: 1, params: "struct SiiRtcInfo *rtc" },
  { name: 'RtcInit', ret: "void", arity: 0, params: "void" },
  { name: 'RtcGetErrorStatus', ret: "u16", arity: 0, params: "void" },
  { name: 'RtcGetInfo', ret: "void", arity: 1, params: "struct SiiRtcInfo *rtc" },
  { name: 'RtcGetRawInfo', ret: "else", arity: 1, params: "rtc" },
  { name: 'RtcGetDateTime', ret: "void", arity: 1, params: "struct SiiRtcInfo *rtc" },
  { name: 'RtcGetStatus', ret: "void", arity: 1, params: "struct SiiRtcInfo *rtc" },
  { name: 'RtcCheckInfo', ret: "u16", arity: 1, params: "struct SiiRtcInfo *rtc" },
  { name: 'RtcReset', ret: "void", arity: 0, params: "void" },
  { name: 'FormatDecimalTime', ret: "UNUSED", arity: 4, params: "u8 *dest, s32 hour, s32 minute, s32 second" },
  { name: 'FormatHexTime', ret: "UNUSED", arity: 4, params: "u8 *dest, s32 hour, s32 minute, s32 second" },
  { name: 'FormatHexRtcTime', ret: "UNUSED", arity: 1, params: "u8 *dest" },
  { name: 'FormatDecimalDate', ret: "UNUSED", arity: 4, params: "u8 *dest, s32 year, s32 month, s32 day" },
  { name: 'FormatHexDate', ret: "UNUSED", arity: 4, params: "u8 *dest, s32 year, s32 month, s32 day" },
  { name: 'RtcCalcTimeDifference', ret: "void", arity: 3, params: "struct SiiRtcInfo *rtc, struct Time *result, struct Time *t" },
  { name: 'RtcCalcLocalTime', ret: "void", arity: 0, params: "void" },
  { name: 'RtcInitLocalTimeOffset', ret: "void", arity: 2, params: "s32 hour, s32 minute" },
  { name: 'RtcCalcLocalTimeOffset', ret: "void", arity: 4, params: "s32 days, s32 hours, s32 minutes, s32 seconds" },
  { name: 'CalcTimeDifference', ret: "void", arity: 3, params: "struct Time *result, struct Time *t1, struct Time *t2" },
  { name: 'RtcGetMinuteCount', ret: "u32", arity: 0, params: "void" },
  { name: 'RtcGetLocalDayCount', ret: "u32", arity: 0, params: "void" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'rtc.h',
  'string_util.h',
  'text.h',
] as const;
