/**
 * mystery_gift.ts — Port 1:1 STRICT (MIROIR partiel) de `src/mystery_gift.c`.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/mystery_gift.c`.
 *
 * Périmètre porté : le SEEDING new-game (`ClearMysteryGift` +
 * `ClearSavedWonderNewsMetadata` + `GetSavedWonderNewsMetadata`). Les Wonder
 * Card/News réels (validation, réception e-carte) = feature link/e-Reader,
 * exempt, chantier ultérieur.
 */

import { gSaveBlock1Ptr } from './engine/save/save-block-state';
import { emptyMysteryGift } from './engine/save/save-blocks';
import type { WonderNewsMetadata } from './engine/save/save-blocks';
import { WonderNews_Reset } from './wonder_news';
import { InitQuestionnaireWords } from './easy_chat';

/** 1:1 décomp `struct WonderNewsMetadata *GetSavedWonderNewsMetadata(void)`
 *  (mystery_gift.c:49-52). */
export function GetSavedWonderNewsMetadata(): WonderNewsMetadata {
  return gSaveBlock1Ptr.mysteryGift.newsMetadata;
}

/** 1:1 décomp `static void ClearSavedWonderNewsMetadata(void)` (mystery_gift.c:109-113) :
 *  CpuFill32(0, GetSavedWonderNewsMetadata(), sizeof) + WonderNews_Reset().
 *  (Le décomp note lui-même : « Clear is redundant, WonderNews_Reset would be
 *  sufficient » — WonderNews_Reset ré-écrit les 4 champs.) */
function ClearSavedWonderNewsMetadata(): void {
  const data = GetSavedWonderNewsMetadata();
  data.newsType = 0;
  data.sentRewardCounter = 0;
  data.rewardCounter = 0;
  data.berry = 0;
  WonderNews_Reset();
}

/** 1:1 décomp `void ClearMysteryGift(void)` (mystery_gift.c:27-32) :
 *  CpuFill32(0, &gSaveBlock1Ptr->mysteryGift, sizeof) → chez nous : REMPLACE
 *  la struct par la factory zéro (emptyMysteryGift), puis les 2 seedings. */
export function ClearMysteryGift(): void {
  gSaveBlock1Ptr.mysteryGift = emptyMysteryGift();
  ClearSavedWonderNewsMetadata();
  InitQuestionnaireWords();
}
