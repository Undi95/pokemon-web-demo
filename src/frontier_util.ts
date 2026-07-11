/**
 * frontier_util.ts — Port 1:1 STRICT (MIROIR partiel) de `src/frontier_util.c`.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/frontier_util.c`.
 *
 * Périmètre porté : `ClearRankingHallRecords` (seeding new-game). Le reste
 * (challenge status, records réels, specials Frontier) = Palier 4 Battle
 * Frontier.
 */

import { gSaveBlock2Ptr } from './engine/save/save-block-state';
import { CopyTrainerId } from './new_game';
import { HALL_FACILITIES_COUNT, TRAINER_ID_LENGTH } from '../include/constants/global';
import {
  FRONTIER_MODE_COUNT, FRONTIER_MODE_MULTIS, FRONTIER_MODE_SINGLES,
  CHALLENGE_STATUS_SAVING,
} from '../include/constants/battle_frontier';

// 1:1 décomp constants/global.h:73/:78.
const HALL_RECORDS_COUNT = 3;
const FRONTIER_LVL_MODE_COUNT = 2;

/** 1:1 décomp `enum { FRONTIER_LVL_50, FRONTIER_LVL_OPEN, FRONTIER_LVL_TENT }`
 *  (constants/battle_frontier.h) → FRONTIER_LVL_TENT = 2 (= borne haute des
 *  boucles winStreak, numériquement = FRONTIER_LVL_MODE_COUNT). */
const FRONTIER_LVL_TENT = 2;

/** 1:1 décomp `void ClearRankingHallRecords(void)` (frontier_util.c:2388-2425).
 *  Note décomp : « UB: Passing 0 as a pointer instead of a pointer holding a
 *  value of 0 » — la branche UBFIX passe un id de 4 zéros ; même résultat. */
export function ClearRankingHallRecords(): void {
  const emptyId = new Array(TRAINER_ID_LENGTH).fill(0);
  for (let i = 0; i < HALL_FACILITIES_COUNT; i++) {
    for (let j = 0; j < FRONTIER_LVL_MODE_COUNT; j++) {
      for (let k = 0; k < HALL_RECORDS_COUNT; k++) {
        const rec = gSaveBlock2Ptr.hallRecords1P[i][j][k];
        CopyTrainerId(rec.id, emptyId);
        rec.name = '';   // 1:1 name[0] = EOS
        rec.winStreak = 0;
      }
    }
  }
  for (let j = 0; j < FRONTIER_LVL_MODE_COUNT; j++) {
    for (let k = 0; k < HALL_RECORDS_COUNT; k++) {
      const rec = gSaveBlock2Ptr.hallRecords2P[j][k];
      CopyTrainerId(rec.id1, emptyId);
      CopyTrainerId(rec.id2, emptyId);
      rec.name1 = '';
      rec.name2 = '';
      rec.winStreak = 0;
    }
  }
}

/** 1:1 décomp `void ResetWinStreaks(void)` (frontier_util.c:1781-1807). Remet à
 *  zéro tous les win streaks du Battle Frontier + les flags actifs, et bascule le
 *  challengeStatus en SAVING s'il était non nul. Appelé par CB2_ContinueSavedGame
 *  uniquement si `gSaveFileStatus == SAVE_STATUS_ERROR` (save corrompue). */
export function ResetWinStreaks(): void {
  const frontier = gSaveBlock2Ptr.frontier;
  frontier.winStreakActiveFlags = 0;
  for (let battleMode = 0; battleMode < FRONTIER_MODE_COUNT; battleMode++) {
    for (let lvlMode = 0; lvlMode < FRONTIER_LVL_TENT; lvlMode++) {
      frontier.towerWinStreaks[battleMode][lvlMode] = 0;
      if (battleMode < FRONTIER_MODE_MULTIS) {
        frontier.domeWinStreaks[battleMode][lvlMode] = 0;
        frontier.palaceWinStreaks[battleMode][lvlMode] = 0;
        frontier.factoryWinStreaks[battleMode][lvlMode] = 0;
      }
      if (battleMode === FRONTIER_MODE_SINGLES) {
        frontier.arenaWinStreaks[lvlMode] = 0;
        frontier.pikeWinStreaks[lvlMode] = 0;
        frontier.pyramidWinStreaks[lvlMode] = 0;
      }
    }
  }
  if (frontier.challengeStatus !== 0)
    frontier.challengeStatus = CHALLENGE_STATUS_SAVING;
}
