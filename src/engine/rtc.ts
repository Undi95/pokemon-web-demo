/**
 * rtc.ts — Real-Time Clock 1:1 décomp `src/rtc.c` (346 l), la "pile" GBA
 * remplacée par la DATE DU PC (= seule substitution ; tout le reste 1:1).
 *
 * ──── Modèle 1:1 (user 2026-05-18 : "le retour du 1:1 avec le PC qui
 *      remplace la pile", + reproduire le bug du 366e jour) ──────────────
 *
 * - `sRtc` (struct SiiRtcInfo : year/month/day/dayOfWeek/hour/minute/
 *   second/status, tous BCD) = LA PILE = le chip Sii. En web il est lu
 *   depuis `new Date()` (l'heure du PC) via `RtcGetRawInfo`, BCD-encodé
 *   exactement comme le chip réel (year = annéePC-2000, 0-99).
 * - `gSaveBlock2Ptr->localTimeOffset` (`struct Time {s16 days; s8 hours;
 *   s8 minutes; s8 seconds}`) = offset pile↔jeu, STOCKÉ DANS LA SAVE
 *   (SaveBlock2 → round-trip 1:1 avec save/load, plus de champ ms parallèle).
 * - `gLocalTime` (struct Time) = heure in-game = pile − offset, via
 *   `RtcCalcTimeDifference` (rtc.c:263), avec troncature s16/s8 1:1.
 * - Wall clock : le joueur choisit l'heure au début → `RtcInitLocalTime
 *   Offset` calcule et STOCKE l'offset. Reload → `RtcCalcLocalTime` →
 *   gLocalTime = pile_now − offset = le jeu a avancé du temps réel écoulé.
 * - **⚠️ UNIQUE DÉVIATION VOLONTAIRE (user 2026-05-18, assumée)** : le
 *   bug du "366e jour" (gel ~1 an des events RTC) n'est PAS reproduit.
 *   Le RNG buggé EST gardé 1:1 (random.ts) ; mais pour le RTC le user
 *   veut le comportement 1:1 SANS le gel ("ça craint d'être bloqué un
 *   an"). La cause GBA = compteur de jours borné (`ConvertDateToDayCount`
 *   retour `u16` + `gLocalTime.days` `s16`). Notre seule entorse :
 *   **le compteur de jours n'est PAS clampé** (number JS, monotone via
 *   la date PC) → le gel ne peut JAMAIS arriver. Tout le RESTE (algo,
 *   borrow, struct Time offset, BCD h/m/s/mois/jour) est 1:1 strict.
 *   (h/m/s gardent la troncature s8 = no-op, valeurs bornées, 1:1.)
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/rtc.c`,
 * `include/siirtc.h` (struct SiiRtcInfo), `include/global.h` (struct Time).
 */

import type { Time } from './save/save-blocks';
import { GetSaveBlock2 } from './save/save-system';

// ─── Constants 1:1 décomp ──────────────────────────────────────────────────

export const SECONDS_PER_MINUTE = 60;
export const MINUTES_PER_HOUR = 60;
export const HOURS_PER_DAY = 24;
export const SECONDS_PER_HOUR = SECONDS_PER_MINUTE * MINUTES_PER_HOUR;
export const SECONDS_PER_DAY = SECONDS_PER_HOUR * HOURS_PER_DAY;

const MONTH_JAN = 1, MONTH_FEB = 2, MONTH_COUNT = 12;

/** 1:1 décomp `sNumDaysInMonths[MONTH_COUNT]` (rtc.c:21). Index = month-1. */
const sNumDaysInMonths: readonly number[] = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

// 1:1 décomp siirtc.h flags + rtc.c RTC_ERR_* (rtc.h).
const SIIRTCINFO_24HOUR = 0x40;
const SIIRTCINFO_POWER  = 0x80;
const RTC_ERR_12HOUR_CLOCK = 1 << 4;
const RTC_ERR_POWER_FAILURE = 1 << 6;
const RTC_ERR_INVALID_YEAR  = 1 << 0;
const RTC_ERR_INVALID_MONTH = 1 << 1;
const RTC_ERR_INVALID_DAY   = 1 << 2;
const RTC_ERR_FLAG_MASK = 0xFF;

/** struct SiiRtcInfo (siirtc.h:33) — la "pile". Champs BCD. */
interface SiiRtcInfo {
  year: number; month: number; day: number; dayOfWeek: number;
  hour: number; minute: number; second: number; status: number;
  alarmHour: number; alarmMinute: number;
}

// ─── State global (= 1:1 décomp iwram : sRtc, sErrorStatus, gLocalTime) ────

/** 1:1 décomp `static struct SiiRtcInfo sRtc` (rtc.c:8). */
const sRtc: SiiRtcInfo = {
  year: 0, month: MONTH_JAN, day: 1, dayOfWeek: 0,
  hour: 0, minute: 0, second: 0, status: SIIRTCINFO_24HOUR,
  alarmHour: 0, alarmMinute: 0,
};
/** 1:1 décomp `static const struct SiiRtcInfo sRtcDummy = {0, MONTH_JAN, 1}`
 *  (rtc.c:17) = 2000 Jan 1, utilisé quand le chip est en erreur. */
const sRtcDummy: SiiRtcInfo = {
  year: 0, month: MONTH_JAN, day: 1, dayOfWeek: 0,
  hour: 0, minute: 0, second: 0, status: SIIRTCINFO_24HOUR,
  alarmHour: 0, alarmMinute: 0,
};
/** 1:1 décomp `static u16 sErrorStatus` (rtc.c:7). */
let sErrorStatus = 0;
/** 1:1 décomp `COMMON_DATA struct Time gLocalTime = {0}` (rtc.c:13).
 *  Mutée in-place (callers gardent leur référence d'import). */
export const gLocalTime: Time = { days: 0, hours: 0, minutes: 0, seconds: 0 };

// ─── Truncation s16/s8 (= 1:1 struct Time : s16 days; s8 h/m/s) ────────────
// h/m/s : troncature s8 1:1 struct Time (no-op, valeurs bornées 0-59/0-23).
// PAS de _s16 sur `days` : déviation volontaire user (compteur monotone,
// pas de gel "366e jour" — cf. en-tête).
const _s8 = (v: number): number => (v << 24) >> 24;

// ─── BCD (1:1 décomp ConvertBcdToBinary rtc.c:46) ──────────────────────────

/** 1:1 décomp `u32 ConvertBcdToBinary(u8 bcd)` (rtc.c:46). */
function ConvertBcdToBinary(bcd: number): number {
  bcd &= 0xFF;
  if (bcd > 0x9F) return 0xFF;
  if ((bcd & 0xF) <= 9) return (10 * ((bcd >> 4) & 0xF)) + (bcd & 0xF);
  return 0xFF;
}
/** Encode binaire→BCD pour alimenter la pile depuis la date PC. >99 produit
 *  un octet >0x9F → ConvertBcdToBinary renvoie 0xFF → RtcCheckInfo erreur →
 *  sRtcDummy : c'est le wrap "année > 99" du chip (bug émergent 1:1). */
function ConvertBinaryToBcd(bin: number): number {
  if (bin < 0 || bin > 99) return 0xFF;
  return ((Math.trunc(bin / 10) << 4) | (bin % 10)) & 0xFF;
}

// ─── La pile lue depuis le PC (= SiiRtcGetDateTime/RtcGetRawInfo 1:1) ──────

/** 1:1 décomp `RtcGetRawInfo`→`SiiRtcGetStatus`+`SiiRtcGetDateTime`
 *  (rtc.c:148) : remplit `rtc` depuis le chip. Web : depuis `new Date()`
 *  (heure du PC), BCD-encodée comme le chip Sii réel. */
function RtcGetRawInfo(rtc: SiiRtcInfo): void {
  const d = new Date();
  rtc.status = SIIRTCINFO_24HOUR; // chip en mode 24h (pas de power-fail)
  rtc.year = ConvertBinaryToBcd(d.getFullYear() - 2000); // 0-99 ; >99 → 0xFF (wrap)
  rtc.month = ConvertBinaryToBcd(d.getMonth() + 1);
  rtc.day = ConvertBinaryToBcd(d.getDate());
  rtc.dayOfWeek = d.getDay();
  rtc.hour = ConvertBinaryToBcd(d.getHours());
  rtc.minute = ConvertBinaryToBcd(d.getMinutes());
  rtc.second = ConvertBinaryToBcd(d.getSeconds());
}

/** 1:1 décomp `u16 RtcCheckInfo(struct SiiRtcInfo *rtc)` (rtc.c:154). */
function RtcCheckInfo(rtc: SiiRtcInfo): number {
  let errorFlags = 0;
  if (rtc.status & SIIRTCINFO_POWER) errorFlags |= RTC_ERR_POWER_FAILURE;
  if (!(rtc.status & SIIRTCINFO_24HOUR)) errorFlags |= RTC_ERR_12HOUR_CLOCK;
  const year = ConvertBcdToBinary(rtc.year);
  if (year === 0xFF) errorFlags |= RTC_ERR_INVALID_YEAR;
  const month = ConvertBcdToBinary(rtc.month);
  if (month === 0xFF || month === 0 || month > MONTH_COUNT) errorFlags |= RTC_ERR_INVALID_MONTH;
  const value = ConvertBcdToBinary(rtc.day);
  if (value === 0xFF) errorFlags |= RTC_ERR_INVALID_DAY;
  if (month === MONTH_FEB) {
    if (value > (IsLeapYear(year) ? 1 : 0) + sNumDaysInMonths[month - 1]) errorFlags |= RTC_ERR_INVALID_DAY;
  } else if (month >= MONTH_JAN && month <= MONTH_COUNT) {
    if (value > sNumDaysInMonths[month - 1]) errorFlags |= RTC_ERR_INVALID_DAY;
  }
  return errorFlags;
}

/** 1:1 décomp `void RtcGetInfo(struct SiiRtcInfo *rtc)` (rtc.c:126). */
function RtcGetInfo(rtc: SiiRtcInfo): void {
  if (sErrorStatus & RTC_ERR_FLAG_MASK) {
    Object.assign(rtc, sRtcDummy);
  } else {
    RtcGetRawInfo(rtc);
  }
}

/** 1:1 décomp `void RtcInit(void)` (rtc.c:97). Le chip web est toujours
 *  présent ; on recalcule juste sErrorStatus depuis la lecture courante. */
export function RtcInit(): void {
  sErrorStatus = 0;
  RtcGetRawInfo(sRtc);
  sErrorStatus = RtcCheckInfo(sRtc);
}

// ─── Jour/temps (1:1 décomp) ───────────────────────────────────────────────

/** 1:1 décomp `bool8 IsLeapYear(u32 year)` (rtc.c:57). */
export function IsLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

/** 1:1 décomp `u16 ConvertDateToDayCount(u8 year, u8 month, u8 day)`
 *  (rtc.c:65). Retour tronqué u16 (= source du wrap long-terme). */
export function ConvertDateToDayCount(year: number, month: number, day: number): number {
  let dayCount = 0;
  for (let i = year - 1; i >= 0; i--) {
    dayCount += 365;
    if (IsLeapYear(i)) dayCount++;
  }
  for (let i = 0; i < month - 1; i++) dayCount += sNumDaysInMonths[i];
  if (month > MONTH_FEB && IsLeapYear(year)) dayCount++;
  dayCount += day;
  // 1:1 décomp SAUF le retour u16 (`& 0xFFFF`) : déviation user assumée —
  // compteur de jours monotone (number JS) → JAMAIS le gel du 366e jour.
  return dayCount;
}

/** 1:1 décomp `u16 RtcGetDayCount(struct SiiRtcInfo *rtc)` (rtc.c:89). */
export function RtcGetDayCount(rtc: SiiRtcInfo): number {
  const year = ConvertBcdToBinary(rtc.year);
  const month = ConvertBcdToBinary(rtc.month);
  const day = ConvertBcdToBinary(rtc.day);
  return ConvertDateToDayCount(year, month, day);
}

/** 1:1 décomp `void RtcCalcTimeDifference(rtc, result, t)` (rtc.c:263).
 *  result = rtc − t. Champs tronqués s16(days)/s8(h/m/s) = struct Time 1:1. */
function RtcCalcTimeDifference(rtc: SiiRtcInfo, result: Time, t: Time): void {
  const days = RtcGetDayCount(rtc);
  let seconds = ConvertBcdToBinary(rtc.second) - t.seconds;
  let minutes = ConvertBcdToBinary(rtc.minute) - t.minutes;
  let hours = ConvertBcdToBinary(rtc.hour) - t.hours;
  let rdays = days - t.days;
  if (seconds < 0) { seconds += SECONDS_PER_MINUTE; --minutes; }
  if (minutes < 0) { minutes += MINUTES_PER_HOUR; --hours; }
  if (hours < 0) { hours += HOURS_PER_DAY; --rdays; }
  result.seconds = _s8(seconds);
  result.minutes = _s8(minutes);
  result.hours = _s8(hours);
  result.days = rdays; // PAS de troncature s16 (déviation user : pas de gel)
}

/** 1:1 décomp `void RtcCalcLocalTime(void)` (rtc.c:290). */
export function RtcCalcLocalTime(): void {
  RtcGetInfo(sRtc);
  RtcCalcTimeDifference(sRtc, gLocalTime, GetSaveBlock2().localTimeOffset);
}

/** 1:1 décomp `void RtcCalcLocalTimeOffset(s32,s32,s32,s32)` (rtc.c:301).
 *  Calcule l'offset pour que gLocalTime = (days,h,m,s) MAINTENANT, et le
 *  STOCKE dans gSaveBlock2.localTimeOffset (→ persisté par la save). */
export function RtcCalcLocalTimeOffset(days: number, hours: number, minutes: number, seconds: number): void {
  gLocalTime.days = days; // PAS de troncature s16 (déviation user : pas de gel)
  gLocalTime.hours = _s8(hours);
  gLocalTime.minutes = _s8(minutes);
  gLocalTime.seconds = _s8(seconds);
  RtcGetInfo(sRtc);
  RtcCalcTimeDifference(sRtc, GetSaveBlock2().localTimeOffset, gLocalTime);
}

/** 1:1 décomp `void RtcInitLocalTimeOffset(s32 hour, s32 minute)` (rtc.c:296).
 *  = le joueur choisit l'heure au wall clock du début. */
export function RtcInitLocalTimeOffset(hour: number, minute: number): void {
  RtcCalcLocalTimeOffset(0, hour, minute, 0);
}

/** 1:1 décomp `u32 RtcGetMinuteCount(void)` (rtc.c:337). NOTE : le décomp
 *  utilise `sRtc.hour`/`sRtc.minute` BRUTS (BCD, non convertis) — quirk
 *  d'origine (seul appelant = SeedRngWithRtc, jamais appelé). Reproduit 1:1. */
export function RtcGetMinuteCount(): number {
  RtcGetInfo(sRtc);
  return ((HOURS_PER_DAY * MINUTES_PER_HOUR) * RtcGetDayCount(sRtc)
    + MINUTES_PER_HOUR * sRtc.hour + sRtc.minute) >>> 0;
}

/** 1:1 décomp `u32 RtcGetLocalDayCount(void)` (rtc.c:343). Utilise sRtc tel
 *  quel (pas de RtcGetInfo — 1:1 décomp). */
export function RtcGetLocalDayCount(): number {
  return RtcGetDayCount(sRtc);
}

// ─── Helpers JS (UI wall clock / dev) — bâtis sur le modèle 1:1 ────────────

export function getPcDate(): Date {
  return new Date();
}
/** Date in-game = recompose depuis gLocalTime (jour 0 = 2000-01-01). */
export function getInGameDate(): Date {
  RtcCalcLocalTime();
  return new Date(Date.UTC(2000, 0, 1) + (
    gLocalTime.days * SECONDS_PER_DAY + gLocalTime.hours * SECONDS_PER_HOUR
    + gLocalTime.minutes * SECONDS_PER_MINUTE + gLocalTime.seconds) * 1000);
}
export function getInGame12Hour(): { hour12: number; isPM: boolean } {
  RtcCalcLocalTime();
  const h = gLocalTime.hours;
  const isPM = h >= 12;
  let hour12 = h % 12;
  if (hour12 === 0) hour12 = 12;
  return { hour12, isPM };
}
/** 2000-01-01 = samedi → (days + 6) % 7 (1:1 baseline décomp). */
export function getInGameDayOfWeek(): number {
  RtcCalcLocalTime();
  return ((gLocalTime.days + 6) % 7 + 7) % 7;
}

/** Dev : régler l'horloge in-game (= RtcCalcLocalTimeOffset, persiste l'offset). */
export function devSetInGameTime(hour: number, minute: number, second = 0): void {
  RtcCalcLocalTime();
  RtcCalcLocalTimeOffset(gLocalTime.days, hour, minute, second);
  console.log(`[rtc] dev set in-game time ${hour}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`);
}
/** Dev : offset = 0 → in-game = PC exactement. */
export function devResetTimeOffset(): void {
  const off = GetSaveBlock2().localTimeOffset;
  off.days = 0; off.hours = 0; off.minutes = 0; off.seconds = 0;
  RtcCalcLocalTime();
  console.log('[rtc] dev reset offset to 0');
}

export function exposeRtcDevApi(): void {
  if (typeof window === 'undefined') return;
  const w = window as unknown as { dev?: Record<string, unknown> };
  w.dev = w.dev || {};
  (w.dev as Record<string, unknown>).wallclock = {
    set: devSetInGameTime,
    reset: devResetTimeOffset,
    getOffset: () => ({ ...GetSaveBlock2().localTimeOffset }),
    getLocalTime: () => ({ ...gLocalTime }),
    getPcDate, getInGameDate, getInGame12Hour, getInGameDayOfWeek,
    RtcInit, RtcGetMinuteCount, RtcGetLocalDayCount,
  };
}

// Init au load : probe le chip + calcule gLocalTime (offset défaut 0 dans
// SaveBlock2 = in-game == PC). 1:1 ordre boot : RtcInit avant load save.
RtcInit();
RtcCalcLocalTime();
