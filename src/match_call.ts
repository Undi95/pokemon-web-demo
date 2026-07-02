/**
 * match_call.ts — Port 1:1 STRICT (MIROIR partiel) de `src/match_call.c`.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/match_call.c`.
 *
 * Périmètre porté : le SEEDING new-game (`InitMatchCallCounters`) + son état
 * module (`sMatchCallState` minutes/stepCounter, RAM non sauvée). Le système
 * d'appels Pokénav (TryStartMatchCall et la data des ~60 interlocuteurs)
 * = Palier 4 Pokénav.
 */

import { RtcCalcLocalTime, gLocalTime } from './rtc';
import type { Time } from './engine/save/save-blocks';

// 1:1 décomp match_call.c — `static struct { u32 minutes; ... } sMatchCallState`
// (champs consommés par InitMatchCallCounters/UpdateMatchCallMinutesCounter).
const sMatchCallState = { minutes: 0, stepCounter: 0 };

/** 1:1 décomp `static u32 GetCurrentTotalMinutes(struct Time *time)`
 *  (match_call.c:1036-1039). */
function GetCurrentTotalMinutes(time: Time): number {
  return time.days * 24 * 60 + time.hours * 60 + time.minutes;
}

/** 1:1 décomp `void InitMatchCallCounters(void)` (match_call.c:1029-1034) :
 *  prochain appel possible au plus tôt 10 minutes (RTC) après le new game. */
export function InitMatchCallCounters(): void {
  RtcCalcLocalTime();
  sMatchCallState.minutes = GetCurrentTotalMinutes(gLocalTime) + 10;
  sMatchCallState.stepCounter = 0;
}
