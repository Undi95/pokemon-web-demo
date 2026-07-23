/**
 * clock.ts — 1:1 décomp `src/clock.c` (`DoTimeBasedEvents` + `UpdatePerDay` +
 * `UpdatePerMinute`).
 *
 * Source de vérité :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/clock.c:26` (DoTimeBasedEvents)
 *   - `clock.c:36` (UpdatePerDay) · `clock.c:59` (UpdatePerMinute)
 *
 * Concept :
 *   Au chargement de map (LoadMapFromWarp / CB2_ContinueSavedGame), au per-step
 *   (field_tasks.c RunTimeBasedEvents) et à l'opcode `dotimebasedevents`, on
 *   rafraîchit `gLocalTime` (RtcCalcLocalTime), on traite le changement de jour
 *   (UpdatePerDay) puis le delta minutes RTC depuis le dernier passage pour
 *   advancer les berry trees (UpdatePerMinute).
 *
 * La logique de croissance des arbres (`BerryTreeTimeUpdate`, berry.c:1046-1112)
 * vit dans son miroir `src/game/berry.ts` ; ce module ne contient que le trio
 * clock.c qui l'appelle.
 */

import type { Time } from './engine/save/save-blocks';
import { RtcCalcLocalTime, gLocalTime, CalcTimeDifference } from './rtc';
import { GetSaveBlock2 } from './engine/save/save-block-state';
import { BerryTreeTimeUpdate } from './berry';
import { VarGet, VarSet, FlagGet } from './engine/script/script-vars';
import { UpdatePartyPokerusTime } from './engine/battle/party-storage';
import { ClearDailyFlags } from './event_data';
import { UpdateWeatherPerDay } from './field_weather_effect';
import { UpdateMirageRnd, UpdateBirchState } from './time_events';
import { UpdateDewfordTrendPerDay } from './dewford_trend';
import { SetRandomLotteryNumber } from './lottery_corner';
import { UpdateTVShowsPerDay } from './tv';

/** 1:1 décomp `void DoTimeBasedEvents(void)` (clock.c:26).
 *
 *  NOTE : la garde décomp est `FlagGet(FLAG_SYS_CLOCK_SET) && !InPokemonCenter()`.
 *  `InPokemonCenter()` (pokemon_center couche 2G) n'est PAS porté → omis (comme
 *  avant). Le reste est transcrit ligne-à-ligne : RtcCalcLocalTime rafraîchit
 *  `gLocalTime` (chip → binaire via RtcCalcTimeDifference), puis UpdatePerDay /
 *  UpdatePerMinute travaillent sur cette heure locale binaire. */
export function DoTimeBasedEvents(): void {
  if (FlagGet('FLAG_SYS_CLOCK_SET') /* && !InPokemonCenter() — non porté */) {
    RtcCalcLocalTime();
    UpdatePerDay(gLocalTime);
    UpdatePerMinute(gLocalTime);
  }
}

/** 1:1 décomp `static void UpdatePerDay(struct Time *localTime)` (clock.c:36).
 *  `GetVarPointer(VAR_DAYS)` porté en VarGet/VarSet (pas de pointeur JS). Les
 *  entrées Frontier/Shoal (UpdateFrontierManiac/Gambler, SetShoalItemFlag) ne
 *  sont pas portées → omises. */
function UpdatePerDay(localTime: Time): void {
  const days = VarGet('VAR_DAYS');

  if (days !== localTime.days && days <= localTime.days) {
    const daysSince = localTime.days - days;
    ClearDailyFlags();
    UpdateDewfordTrendPerDay(daysSince);
    UpdateTVShowsPerDay(daysSince);
    UpdateWeatherPerDay(daysSince);
    UpdatePartyPokerusTime(daysSince);
    UpdateMirageRnd(daysSince);
    UpdateBirchState(daysSince);
    // UpdateFrontierManiac(daysSince) — non porté
    // UpdateFrontierGambler(daysSince) — non porté
    // SetShoalItemFlag(daysSince) — non porté
    SetRandomLotteryNumber(daysSince);
    VarSet('VAR_DAYS', localTime.days);
  }
}

/** 1:1 décomp `static void UpdatePerMinute(struct Time *localTime)` (clock.c:59).
 *  `gSaveBlock2Ptr->lastBerryTreeUpdate` = struct Time (global.h:536). La diff
 *  passe par CalcTimeDifference (rtc.c:311, result = t2 − t1) sur des `Time`
 *  BINAIRES → plus de BCD brut non-monotone. */
function UpdatePerMinute(localTime: Time): void {
  const sb2 = GetSaveBlock2();
  const difference: Time = { days: 0, hours: 0, minutes: 0, seconds: 0 };

  CalcTimeDifference(difference, sb2.lastBerryTreeUpdate, localTime);
  const minutes = 24 * 60 * difference.days + 60 * difference.hours + difference.minutes;
  if (minutes !== 0) {
    if (minutes >= 0) {
      BerryTreeTimeUpdate(minutes);
      // `gSaveBlock2Ptr->lastBerryTreeUpdate = *localTime;` — copie de struct
      // (localTime = gLocalTime, muté en place → copier les champs, pas la réf).
      sb2.lastBerryTreeUpdate.days = localTime.days;
      sb2.lastBerryTreeUpdate.hours = localTime.hours;
      sb2.lastBerryTreeUpdate.minutes = localTime.minutes;
      sb2.lastBerryTreeUpdate.seconds = localTime.seconds;
    }
  }
}
