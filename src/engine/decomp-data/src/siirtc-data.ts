// AUTO-GENERATED from src/siirtc.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/siirtc.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const STATUS_INTFE = 2;
export const STATUS_INTME = 8;
export const STATUS_INTAE = 32;
export const STATUS_24HOUR = 64;
export const STATUS_POWER = 128;
export const TEST_MODE = 128;
export const ALARM_AM = 0;
export const ALARM_PM = 128;
/** Raw expr: `offsetof(struct SiiRtcInfo, year)` */
export const OFFSET_YEAR_EXPR = "offsetof(struct SiiRtcInfo, year)";
/** Raw expr: `offsetof(struct SiiRtcInfo, month)` */
export const OFFSET_MONTH_EXPR = "offsetof(struct SiiRtcInfo, month)";
/** Raw expr: `offsetof(struct SiiRtcInfo, day)` */
export const OFFSET_DAY_EXPR = "offsetof(struct SiiRtcInfo, day)";
/** Raw expr: `offsetof(struct SiiRtcInfo, dayOfWeek)` */
export const OFFSET_DAY_OF_WEEK_EXPR = "offsetof(struct SiiRtcInfo, dayOfWeek)";
/** Raw expr: `offsetof(struct SiiRtcInfo, hour)` */
export const OFFSET_HOUR_EXPR = "offsetof(struct SiiRtcInfo, hour)";
/** Raw expr: `offsetof(struct SiiRtcInfo, minute)` */
export const OFFSET_MINUTE_EXPR = "offsetof(struct SiiRtcInfo, minute)";
/** Raw expr: `offsetof(struct SiiRtcInfo, second)` */
export const OFFSET_SECOND_EXPR = "offsetof(struct SiiRtcInfo, second)";
/** Raw expr: `offsetof(struct SiiRtcInfo, status)` */
export const OFFSET_STATUS_EXPR = "offsetof(struct SiiRtcInfo, status)";
/** Raw expr: `offsetof(struct SiiRtcInfo, alarmHour)` */
export const OFFSET_ALARM_HOUR_EXPR = "offsetof(struct SiiRtcInfo, alarmHour)";
/** Raw expr: `offsetof(struct SiiRtcInfo, alarmMinute)` */
export const OFFSET_ALARM_MINUTE_EXPR = "offsetof(struct SiiRtcInfo, alarmMinute)";
/** Raw expr: `(OFFSET_SECOND - OFFSET_YEAR + 1)` */
export const DATETIME_BUF_LEN_EXPR = "(OFFSET_SECOND - OFFSET_YEAR + 1)";
/** Raw expr: `(OFFSET_SECOND - OFFSET_HOUR + 1)` */
export const TIME_BUF_LEN_EXPR = "(OFFSET_SECOND - OFFSET_HOUR + 1)";
export const WR = 0;
export const RD = 1;
/** Raw expr: `CMD(0)` */
export const CMD_RESET_EXPR = "CMD(0)";
/** Raw expr: `CMD(1)` */
export const CMD_STATUS_EXPR = "CMD(1)";
/** Raw expr: `CMD(2)` */
export const CMD_DATETIME_EXPR = "CMD(2)";
/** Raw expr: `CMD(3)` */
export const CMD_TIME_EXPR = "CMD(3)";
/** Raw expr: `CMD(4)` */
export const CMD_ALARM_EXPR = "CMD(4)";
export const SCK_HI = 1;
export const SIO_HI = 2;
export const CS_HI = 4;
export const DIR_0_IN = 0;
export const DIR_0_OUT = 1;
export const DIR_1_IN = 0;
export const DIR_1_OUT = 2;
export const DIR_2_IN = 0;
export const DIR_2_OUT = 4;
/** Raw expr: `(DIR_0_IN | DIR_1_IN | DIR_2_IN)` */
export const DIR_ALL_IN_EXPR = "(DIR_0_IN | DIR_1_IN | DIR_2_IN)";
/** Raw expr: `(DIR_0_OUT | DIR_1_OUT | DIR_2_OUT)` */
export const DIR_ALL_OUT_EXPR = "(DIR_0_OUT | DIR_1_OUT | DIR_2_OUT)";
/** Raw expr: `(*(vu16 *)0x80000C4)` */
export const GPIO_PORT_DATA_EXPR = "(*(vu16 *)0x80000C4)";
/** Raw expr: `(*(vu16 *)0x80000C6)` */
export const GPIO_PORT_DIRECTION_EXPR = "(*(vu16 *)0x80000C6)";
/** Raw expr: `(*(vu16 *)0x80000C8)` */
export const GPIO_PORT_READ_ENABLE_EXPR = "(*(vu16 *)0x80000C8)";

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'WriteCommand', ret: "int", arity: 1, params: "u8 value" },
  { name: 'WriteData', ret: "int", arity: 1, params: "u8 value" },
  { name: 'ReadData', ret: "u8", arity: 0, params: "" },
  { name: 'EnableGpioPortRead', ret: "void", arity: 0, params: "" },
  { name: 'DisableGpioPortRead', ret: "void", arity: 0, params: "" },
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
  { name: 'SiiRtcSetAlarm', ret: "UNUSED", arity: 1, params: "struct SiiRtcInfo *rtc" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'gba/gba.h',
  'siirtc.h',
  'config.h',
] as const;
