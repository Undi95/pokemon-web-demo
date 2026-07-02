/**
 * wonder_news.ts — Port 1:1 STRICT (MIROIR partiel) de `src/wonder_news.c`.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/wonder_news.c`.
 *
 * Périmètre porté : `WonderNews_Reset` (appelé par le seeding new-game via
 * ClearMysteryGift → ClearSavedWonderNewsMetadata). Le reste (WonderNews_
 * IncrementStepCounter/TryGetReward — feature e-carte/Mystery Gift link)
 * = exempt link, chantier ultérieur.
 */

import { gSaveBlock1Ptr } from './engine/save/save-block-state';
import { VarSet } from './engine/script/script-vars';

// 1:1 décomp include/wonder_news.h:5 (enum) — WONDER_NEWS_NONE = 0.
const WONDER_NEWS_NONE = 0;

/** 1:1 décomp `void WonderNews_Reset(void)` (wonder_news.c:42-51). */
export function WonderNews_Reset(): void {
  const data = gSaveBlock1Ptr.mysteryGift.newsMetadata;
  data.newsType = WONDER_NEWS_NONE;
  data.sentRewardCounter = 0;
  data.rewardCounter = 0;
  data.berry = 0;
  VarSet('VAR_WONDER_NEWS_STEP_COUNTER', 0);
}
