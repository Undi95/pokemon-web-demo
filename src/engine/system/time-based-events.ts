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

import { RtcGetMinuteCount } from '../system/rtc';
import { gSaveBlock1Ptr } from '../save/save-block-state';
import { BerryTreeTimeUpdate } from '../../game/berry';

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

  // Future :
  // - ClearDailyFlagsAfterChallenge if day changed
  // - Rotate Mass Outbreaks
  // - Weather rotation (Route 119/123)
  // - Mirage Island calc
}
