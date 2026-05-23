// AUTO-GENERATED from include/rtc.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/rtc.h
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const RTC_INIT_ERROR = 1;
export const RTC_INIT_WARNING = 2;
export const RTC_ERR_12HOUR_CLOCK = 16;
export const RTC_ERR_POWER_FAILURE = 32;
export const RTC_ERR_INVALID_YEAR = 64;
export const RTC_ERR_INVALID_MONTH = 128;
export const RTC_ERR_INVALID_DAY = 256;
export const RTC_ERR_INVALID_HOUR = 512;
export const RTC_ERR_INVALID_MINUTE = 1024;
export const RTC_ERR_INVALID_SECOND = 2048;
export const RTC_ERR_FLAG_MASK = 4080;

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
  { name: 'RtcGetDateTime', ret: "void", arity: 1, params: "struct SiiRtcInfo *rtc" },
  { name: 'RtcGetStatus', ret: "void", arity: 1, params: "struct SiiRtcInfo *rtc" },
  { name: 'RtcGetRawInfo', ret: "void", arity: 1, params: "struct SiiRtcInfo *rtc" },
  { name: 'RtcCheckInfo', ret: "u16", arity: 1, params: "struct SiiRtcInfo *rtc" },
  { name: 'RtcReset', ret: "void", arity: 0, params: "void" },
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
  'siirtc.h',
] as const;
