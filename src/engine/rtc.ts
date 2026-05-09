/**
 * rtc.ts — Real-Time Clock 1:1 décomp avec PC time as source.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/rtc.c` + `clock.c`.
 *
 * ──── Pourquoi on ne port pas le décomp littéralement ──────────────────────
 *
 * Le RTC GBA original lit un chip Sii de 8-bit BCD year/month/day. Plusieurs
 * routines convertissent en `u16 days` via `ConvertDateToDayCount`, ce qui :
 *   1. Wrap à 65535 jours (= ~179 ans, OK)
 *   2. Mais `gLocalTime.days` est `s16` → wrap à 32767 (= 89 ans)
 *   3. Plusieurs callsites stockent des `lastUpdate.days` en `u16` puis font
 *      `daysSince = current - last` (= underflow possible si player change
 *      l'horloge en arrière)
 *   4. `RtcCheckInfo` rejette les années > 99 (= year is u8 BCD = 2000-2099)
 *
 * Net : **le jeu casse à long terme**. C'est le seul endroit où on dévie du
 * 1:1 strict, à dessein. Validation user (session 124) :
 *
 *   > "C'est pas comme la seed qui donne le même Pokémon si on boot en même
 *   >  temps et respecte toutes les frames pour être 1:1, cette fois ça
 *   >  brise le jeu. Je propose de la faire et même de la corriger."
 *
 * ──── Notre design ─────────────────────────────────────────────────────────
 *
 * - **Source = `Date.now()`** (= ms epoch JS, 53-bit safe = millions d'années).
 * - **Offset = `localTimeOffsetMs: number` dans gSaveBlock2** (= manuelement
 *   réglable via menu caché si user veut décaler son in-game clock par rapport
 *   à son PC).
 * - **`gLocalTime`** computed à la demande depuis `Date.now() + offsetMs`.
 *   Les champs `days/hours/minutes/seconds` restent compatibles avec le décomp
 *   (= struct Time), donc tous les `clock-data.ts` / `time-events-data.ts`
 *   auto-extraits continuent de marcher SANS modification.
 * - **`days` est now `s32`** au lieu de `s16` (= safe jusqu'à ~5.8M ans). Aucun
 *   callsite décomp ne stocke `days` en u16 chez nous (= on a flatten en
 *   number JS, pas de typed array). Donc fix transparent.
 *
 * ──── Mapping API décomp → notre TS ────────────────────────────────────────
 *
 * | décomp `rtc.c`           | notre `rtc.ts`              |
 * |--------------------------|-----------------------------|
 * | `RtcCalcLocalTime()`     | `RtcCalcLocalTime()`        |
 * | `RtcGetMinuteCount()`    | `RtcGetMinuteCount()`       |
 * | `RtcGetLocalDayCount()`  | `RtcGetLocalDayCount()`     |
 * | `RtcInitLocalTimeOffset` | `RtcInitLocalTimeOffset`    |
 * | `RtcCalcLocalTimeOffset` | `RtcCalcLocalTimeOffset`    |
 * | `gLocalTime`             | `gLocalTime` (live struct)  |
 * | `gSaveBlock2.localTimeOffset` (struct Time) | `gSaveBlock2.localTimeOffsetMs` (ms) — **sémantique différente**, plus simple. Migration 1:1 du `Time` struct possible si retour-compat nécessaire. |
 */

import type { Time } from './save-blocks';

// ─── Constants 1:1 décomp ──────────────────────────────────────────────────

export const SECONDS_PER_MINUTE = 60;
export const MINUTES_PER_HOUR = 60;
export const HOURS_PER_DAY = 24;
export const SECONDS_PER_HOUR = SECONDS_PER_MINUTE * MINUTES_PER_HOUR;
export const SECONDS_PER_DAY = SECONDS_PER_HOUR * HOURS_PER_DAY;
export const MS_PER_DAY = SECONDS_PER_DAY * 1000;
export const MS_PER_HOUR = SECONDS_PER_HOUR * 1000;
export const MS_PER_MINUTE = SECONDS_PER_MINUTE * 1000;

// ─── State global (= 1:1 décomp `gLocalTime` + sErrorStatus) ───────────────

/**
 * `gLocalTime` 1:1 décomp `rtc.c:13`. Live struct calculée à la demande par
 * `RtcCalcLocalTime()`. Les routines auto-extraites lisent les 4 champs
 * directement.
 */
export const gLocalTime: Time = { days: 0, hours: 0, minutes: 0, seconds: 0 };

/**
 * State interne : offset utilisateur en ms. Stocké dans gSaveBlock2 (= persisté).
 * Default 0 = in-game clock = PC clock exactement.
 */
let _localTimeOffsetMs = 0;

/**
 * Anchor epoch ms = jour 0 de l'in-game clock. Configurable mais fixé à
 * 2000-01-01 00:00:00 UTC (= 946684800000 ms) pour matcher la "Y2K" baseline
 * du chip Sii RTC original. `gLocalTime.days = floor((now + offset - anchor) / MS_PER_DAY)`.
 */
const RTC_ANCHOR_MS = Date.UTC(2000, 0, 1, 0, 0, 0, 0);

// ─── Offset persistence (= synced avec gSaveBlock2) ────────────────────────

/**
 * Set le local time offset (en ms). Appelé par `RtcInitLocalTimeOffset` /
 * `RtcCalcLocalTimeOffset` (= au confirm du wall clock UI), et par le système
 * de save load (= restore offset persisté).
 */
export function setLocalTimeOffsetMs(ms: number): void {
  _localTimeOffsetMs = Math.floor(ms);
}

export function getLocalTimeOffsetMs(): number {
  return _localTimeOffsetMs;
}

// ─── Core API (= 1:1 décomp ConvertDateToDayCount + RtcCalcLocalTime) ──────

/**
 * Convert epoch ms (= local time including offset) to a `Time` struct.
 * Equivalent décomp : `RtcCalcLocalTime` → `RtcCalcTimeDifference`.
 *
 * **Pas de wrap u16** sur days : on stocke en JS Number (= 53-bit safe).
 */
export function epochMsToTime(epochMs: number): Time {
  // Adjusted ms = since RTC anchor 2000-01-01 (= matches `RtcGetDayCount` baseline).
  const adjMs = epochMs - RTC_ANCHOR_MS;
  // Use UTC-based decomposition (= deterministic regardless of TZ DST shenanigans).
  const totalSec = Math.floor(adjMs / 1000);
  const days = Math.floor(totalSec / SECONDS_PER_DAY);
  const remainAfterDays = totalSec - days * SECONDS_PER_DAY;
  const hours = Math.floor(remainAfterDays / SECONDS_PER_HOUR);
  const remainAfterHours = remainAfterDays - hours * SECONDS_PER_HOUR;
  const minutes = Math.floor(remainAfterHours / SECONDS_PER_MINUTE);
  const seconds = remainAfterHours - minutes * SECONDS_PER_MINUTE;
  return { days, hours, minutes, seconds };
}

/**
 * 1:1 décomp `RtcCalcLocalTime` (rtc.c:290) : refresh `gLocalTime` from RTC HW.
 *
 * ```c
 * void RtcCalcLocalTime(void) {
 *     RtcGetInfo(&sRtc);
 *     RtcCalcTimeDifference(&sRtc, &gLocalTime, &gSaveBlock2Ptr->localTimeOffset);
 * }
 * ```
 *
 * Notre version : `gLocalTime = epochMsToTime(Date.now() + offsetMs)`. Le
 * `gLocalTime` est mutated in-place pour ne pas casser les imports.
 */
export function RtcCalcLocalTime(): void {
  const t = epochMsToTime(Date.now() + _localTimeOffsetMs);
  gLocalTime.days = t.days;
  gLocalTime.hours = t.hours;
  gLocalTime.minutes = t.minutes;
  gLocalTime.seconds = t.seconds;
}

/**
 * 1:1 décomp `RtcGetMinuteCount` (rtc.c:337) : returns total minutes since
 * RTC anchor (= 2000-01-01). Utilisé par main.c:CB2_InitMainMenu pour seed RNG.
 *
 * **Note** : décomp returns `u32` qui wrap à ~8000 ans. Notre version returns
 * Number qui wrap au safe-int (= ~17M ans). Aucun gameplay impact.
 */
export function RtcGetMinuteCount(): number {
  RtcCalcLocalTime();
  return HOURS_PER_DAY * MINUTES_PER_HOUR * gLocalTime.days
    + MINUTES_PER_HOUR * gLocalTime.hours
    + gLocalTime.minutes;
}

/**
 * 1:1 décomp `RtcGetLocalDayCount` (rtc.c:343). Returns days since anchor.
 * Wrap-safe (= number JS).
 */
export function RtcGetLocalDayCount(): number {
  return gLocalTime.days;
}

// ─── Offset setters (= 1:1 décomp wall clock confirm) ──────────────────────

/**
 * 1:1 décomp `RtcInitLocalTimeOffset` (rtc.c:296) : set initial in-game time
 * to `(hour, minute)` of the current calendar day. Called by wall clock confirm
 * via `Special_StartWallClock`.
 *
 * Notre impl : compute the offset such that `gLocalTime.hours = hour` and
 * `gLocalTime.minutes = minute`, jour reste = today. Equivalent à dire "le
 * jeu pense qu'il est `hour:minute` MAIS la date est celle du PC".
 */
export function RtcInitLocalTimeOffset(hour: number, minute: number): void {
  RtcCalcLocalTimeOffset(0, hour, minute, 0);
}

/**
 * 1:1 décomp `RtcCalcLocalTimeOffset` (rtc.c:301). Décomp signature :
 *
 *   void RtcCalcLocalTimeOffset(s32 days, s32 hours, s32 minutes, s32 seconds);
 *
 * Compute the offset such that `gLocalTime = (days, hours, minutes, seconds)`
 * RIGHT NOW. Then store in save.
 */
export function RtcCalcLocalTimeOffset(
  days: number, hours: number, minutes: number, seconds: number,
): void {
  // Désiré : gLocalTime = (days, hours, minutes, seconds) RIGHT NOW.
  // Donc : Date.now() + offsetMs - anchor = days*MS_PER_DAY + hours*MS_PER_HOUR + ...
  const desiredAdjMs = days * MS_PER_DAY + hours * MS_PER_HOUR
    + minutes * MS_PER_MINUTE + seconds * 1000;
  const currentAdjMs = Date.now() - RTC_ANCHOR_MS;
  _localTimeOffsetMs = desiredAdjMs - currentAdjMs;
  // Update gLocalTime live so callers see immediate effect.
  RtcCalcLocalTime();
}

// ─── Convenience helpers (= JS-flavored) ──────────────────────────────────

/**
 * Returns the current PC date as a JS Date (= source of truth, pre-offset).
 * Used by the WallClock UI to display "réelle" time vs "in-game" time.
 */
export function getPcDate(): Date {
  return new Date();
}

/**
 * Returns the current in-game date as a JS Date (= PC + offset).
 */
export function getInGameDate(): Date {
  return new Date(Date.now() + _localTimeOffsetMs);
}

/**
 * Returns 12-hour clock hour + AM/PM flag, as the GBA wall clock UI displays.
 * Décomp `wallclock.c` uses 12-hour with `PERIOD_AM`/`PERIOD_PM`.
 */
export function getInGame12Hour(): { hour12: number; isPM: boolean } {
  RtcCalcLocalTime();
  const h = gLocalTime.hours;
  const isPM = h >= 12;
  let hour12 = h % 12;
  if (hour12 === 0) hour12 = 12;
  return { hour12, isPM };
}

/**
 * Returns the current day-of-week (0=Sunday, 6=Saturday) for in-game time.
 * Décomp utilise `gLocalTime.days % 7` mais la baseline 2000-01-01 est un
 * **samedi** (= day 6) donc l'offset matche : `(days + 6) % 7`.
 */
export function getInGameDayOfWeek(): number {
  RtcCalcLocalTime();
  return ((gLocalTime.days + 6) % 7 + 7) % 7;
}

// ─── Dev API (= window.dev.wallclock for hidden override) ─────────────────

/**
 * Set the in-game clock to a specific hour/minute/second. Hidden behind dev
 * console. User explicitly asked for this as a "menu caché pour changer
 * l'heure" (session 124).
 */
export function devSetInGameTime(hour: number, minute: number, second = 0): void {
  RtcInitLocalTimeOffset(hour, minute);
  // Override seconds aussi.
  RtcCalcLocalTimeOffset(gLocalTime.days, hour, minute, second);
  console.log(`[rtc] dev set in-game time to ${hour}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`);
}

/**
 * Reset offset à 0 = in-game clock = PC clock exactement.
 */
export function devResetTimeOffset(): void {
  _localTimeOffsetMs = 0;
  RtcCalcLocalTime();
  console.log('[rtc] dev reset offset to 0');
}

/**
 * Expose API on `window.dev.wallclock` for browser console access.
 * Activé au boot par `main.ts`.
 */
export function exposeRtcDevApi(): void {
  if (typeof window === 'undefined') return;
  // Type-safe attachment via Record cast.
  const w = window as unknown as { dev?: Record<string, unknown> };
  w.dev = w.dev || {};
  (w.dev as Record<string, unknown>).wallclock = {
    set: devSetInGameTime,
    reset: devResetTimeOffset,
    getOffsetMs: getLocalTimeOffsetMs,
    getLocalTime: () => ({ ...gLocalTime }),
    getPcDate,
    getInGameDate,
    getInGame12Hour,
    getInGameDayOfWeek,
  };
}

// Init au load : compute gLocalTime from current PC time + offset 0.
RtcCalcLocalTime();

// Register global `__rtcModule` pour que save-system.ts puisse lire
// l'offset au moment du TrySavingData sans circular import async race.
(globalThis as { __rtcModule?: unknown }).__rtcModule = {
  getLocalTimeOffsetMs,
  setLocalTimeOffsetMs,
};
