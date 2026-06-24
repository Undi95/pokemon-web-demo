/**
 * time-based-events.ts — 1:1 décomp `src/clock.c:DoTimeBasedEvents`.
 *
 * Source de vérité :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/clock.c:26` (DoTimeBasedEvents)
 *
 * Concept :
 *   Au chargement de map (LoadMapFromWarp / CB2_ContinueSavedGame), au per-step
 *   (field_tasks.c RunTimeBasedEvents) et à l'opcode `dotimebasedevents`, on calc
 *   le delta minutes RTC depuis le dernier passage + on advance les berry trees.
 *
 * La logique de croissance des arbres (`BerryTreeGrow` + `BerryTreeTimeUpdate`,
 * berry.c:1046-1112) vit dans son miroir `src/game/berry.ts` ; ce module ne
 * contient que `DoTimeBasedEvents` (= clock.c) qui l'appelle.
 */

import { RtcGetMinuteCount, gLocalTime } from './rtc';
import { gSaveBlock1Ptr } from './engine/save/save-block-state';
import { BerryTreeTimeUpdate } from './berry';
import { VarGet, VarSet, FlagGet } from './engine/script/script-vars';
import { UpdatePartyPokerusTime } from './engine/battle/party-storage';
import { ClearDailyFlags } from './event_data';
import { UpdateWeatherPerDay } from './field_weather_effect';
import { UpdateMirageRnd, UpdateBirchState } from './time_events';

/** 1:1 décomp `DoTimeBasedEvents` (clock.c:26) :
 *    - Read gSaveBlock1Ptr->lastBerryTreeUpdate
 *    - Calc minutes diff vs RtcGetMinuteCount()
 *    - Call BerryTreeTimeUpdate(diff)
 *    - Store new lastBerryTreeUpdate
 *    - Also : daily flag clear, weather rotation, etc. (dette future)
 *  Notre version : utilise minutes since RTC anchor (s32) à la place de struct Time. */
export function DoTimeBasedEvents(): void {
  // 1:1 décomp `gSaveBlock1Ptr->lastBerryTreeUpdate` (= u16 sur ROM, on stocke
  // en s32 minutes-since-anchor).
  const minuteNow = RtcGetMinuteCount();
  const lastUpdate = (gSaveBlock1Ptr.lastBerryTreeUpdateMin as number | undefined) ?? minuteNow;
  const diff = minuteNow - lastUpdate;

  gSaveBlock1Ptr.lastBerryTreeUpdateMin = minuteNow;

  if (diff > 0) {
    BerryTreeTimeUpdate(diff);
  }

  // 1:1 décomp `UpdatePerDay` (clock.c:36) : bloc changement-de-jour. Gated sur
  // FLAG_SYS_CLOCK_SET (InPokemonCenter omis : non porté). `VAR_DAYS` = dernier jour
  // traité, `gLocalTime.days` = jour courant. Forward-only (days <= localTime.days).
  // RESTE future : ClearDailyFlags, Dewford/TV/Weather/Mirage/lottery per-day.
  if (FlagGet('FLAG_SYS_CLOCK_SET')) {
    const days = VarGet('VAR_DAYS');
    if (days !== gLocalTime.days && days <= gLocalTime.days) {
      const daysSince = gLocalTime.days - days;
      // 1:1 décomp UpdatePerDay (ordre) : ClearDailyFlags, [Dewford/TV non portés],
      // UpdateWeatherPerDay, UpdatePartyPokerusTime, UpdateMirageRnd, UpdateBirchState,
      // [Frontier/Shoal/lottery non portés].
      ClearDailyFlags();
      UpdateWeatherPerDay(daysSince);
      UpdatePartyPokerusTime(daysSince);
      UpdateMirageRnd(daysSince);
      UpdateBirchState(daysSince);
      VarSet('VAR_DAYS', gLocalTime.days);
    }
  }
}
