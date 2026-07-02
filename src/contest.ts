/**
 * contest.ts — Port 1:1 STRICT (MIROIR partiel) de `src/contest.c`.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/contest.c`
 *                  + `src/data/contest_opponents.h` (gDefaultContestWinners).
 *
 * Périmètre porté : le SEEDING new-game (`ResetLinkContestBoolean`,
 * `ClearContestWinnerPicsInContestHall`, `ResetContestLinkResults` +
 * `gDefaultContestWinners`). Les concours eux-mêmes = Palier 4.
 */

import { gSaveBlock1Ptr, gSaveBlock2Ptr } from './engine/save/save-block-state';
import { CONTEST_CATEGORIES_COUNT, CONTESTANT_COUNT } from '../include/constants/global';
import {
  SPECIES_ELECTRIKE, SPECIES_TROPIUS, SPECIES_XATU, SPECIES_PLUSLE,
  SPECIES_SHUPPET, SPECIES_ZANGOOSE, SPECIES_LOUDRED, SPECIES_DELCATTY,
} from '../include/constants/species';
import type { ContestWinner } from './engine/save/save-blocks';

// 1:1 décomp constants/contest.h:15-19 + :47.
const CONTEST_RANK_NORMAL = 0;
const CONTEST_RANK_SUPER = 1;
const CONTEST_RANK_HYPER = 2;
const CONTEST_RANK_MASTER = 3;
/** 1:1 `(CONTEST_WINNER_MUSEUM_COOL - 1)` = 8 (constants/contest.h:47). */
export const MUSEUM_CONTEST_WINNERS_START = 8;

// 1:1 décomp data/contest_opponents.h:142 + constants/global.h:86.
const CONTEST_AI_TRAINER_ID = 0xFFFF;
const CONTEST_CATEGORY_COOL = 0;
const CONTEST_CATEGORY_BEAUTY = 1;
const CONTEST_CATEGORY_CUTE = 2;
const CONTEST_CATEGORY_SMART = 3;
const CONTEST_CATEGORY_TOUGH = 4;

/** 1:1 décomp `EWRAM_DATA u32 gLinkContestFlags` (contest.c). */
export let gLinkContestFlags = 0;

/** 1:1 décomp `void ResetLinkContestBoolean(void)` (contest.c:1000-1003). */
export function ResetLinkContestBoolean(): void {
  gLinkContestFlags = 0;
}

/** 1:1 décomp `gDefaultContestWinners[]` (data/contest_opponents.h:144-215) :
 *  les 8 tableaux par défaut du hall des concours (6 affichés + 2 unused).
 *  Noms FR ROM (build FR de la décomp, texte cité 1:1). Species résolues
 *  depuis constants/species.h. */
const gDefaultContestWinners: readonly ContestWinner[] = [
  { personality: 0, trainerId: CONTEST_AI_TRAINER_ID, species: SPECIES_ELECTRIKE, contestCategory: CONTEST_CATEGORY_CUTE,   monName: 'DYNONO',  trainerName: 'AXEL',    contestRank: CONTEST_RANK_NORMAL }, // [CONTEST_WINNER_HALL_1]
  { personality: 0, trainerId: CONTEST_AI_TRAINER_ID, species: SPECIES_TROPIUS,   contestCategory: CONTEST_CATEGORY_COOL,   monName: 'TROPO',   trainerName: 'NICOLAS', contestRank: CONTEST_RANK_HYPER },  // [CONTEST_WINNER_HALL_2]
  { personality: 0, trainerId: CONTEST_AI_TRAINER_ID, species: SPECIES_XATU,      contestCategory: CONTEST_CATEGORY_BEAUTY, monName: 'TUXA',    trainerName: 'JULIA',   contestRank: CONTEST_RANK_NORMAL }, // [CONTEST_WINNER_HALL_3]
  { personality: 0, trainerId: CONTEST_AI_TRAINER_ID, species: SPECIES_PLUSLE,    contestCategory: CONTEST_CATEGORY_TOUGH,  monName: 'POSSI',   trainerName: 'ELTON',   contestRank: CONTEST_RANK_MASTER }, // [CONTEST_WINNER_HALL_4]
  { personality: 0, trainerId: CONTEST_AI_TRAINER_ID, species: SPECIES_SHUPPET,   contestCategory: CONTEST_CATEGORY_SMART,  monName: 'CHOMBY',  trainerName: 'MELANIE', contestRank: CONTEST_RANK_SUPER },  // [CONTEST_WINNER_HALL_5]
  { personality: 0, trainerId: CONTEST_AI_TRAINER_ID, species: SPECIES_ZANGOOSE,  contestCategory: CONTEST_CATEGORY_COOL,   monName: 'GRIFFIK', trainerName: 'ANNE',    contestRank: CONTEST_RANK_HYPER },  // [CONTEST_WINNER_HALL_6]
  { personality: 0, trainerId: CONTEST_AI_TRAINER_ID, species: SPECIES_LOUDRED,   contestCategory: CONTEST_CATEGORY_BEAUTY, monName: 'BABOUM',  trainerName: 'JACO',    contestRank: CONTEST_RANK_HYPER },  // [CONTEST_WINNER_HALL_UNUSED_1]
  { personality: 0, trainerId: CONTEST_AI_TRAINER_ID, species: SPECIES_DELCATTY,  contestCategory: CONTEST_CATEGORY_CUTE,   monName: 'KITSY',   trainerName: 'OMAR',    contestRank: CONTEST_RANK_MASTER }, // [CONTEST_WINNER_HALL_UNUSED_2]
];

/** 1:1 décomp `void ClearContestWinnerPicsInContestHall(void)` (contest.c:5630-5636) :
 *  repose les 8 tableaux par défaut (indices 0..MUSEUM_CONTEST_WINNERS_START-1). */
export function ClearContestWinnerPicsInContestHall(): void {
  for (let i = 0; i < MUSEUM_CONTEST_WINNERS_START; i++) {
    gSaveBlock1Ptr.contestWinners[i] = { ...gDefaultContestWinners[i] };
  }
}

/** 1:1 décomp `void ResetContestLinkResults(void)` (contest.c:5512-5520). */
export function ResetContestLinkResults(): void {
  for (let i = 0; i < CONTEST_CATEGORIES_COUNT; i++)
    for (let j = 0; j < CONTESTANT_COUNT; j++)
      gSaveBlock2Ptr.contestLinkResults[i][j] = 0;
}
