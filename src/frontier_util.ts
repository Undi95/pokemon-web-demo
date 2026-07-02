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

// 1:1 décomp constants/global.h:73/:78.
const HALL_RECORDS_COUNT = 3;
const FRONTIER_LVL_MODE_COUNT = 2;

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
