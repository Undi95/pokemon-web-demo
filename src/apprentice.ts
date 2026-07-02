/**
 * apprentice.ts — Port 1:1 STRICT (MIROIR partiel) de `src/apprentice.c`.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/apprentice.c`
 *                  + `src/data/battle_frontier/apprentice.h` (sInitialApprenticeIds).
 *
 * Périmètre porté : le SEEDING new-game (`ResetAllApprenticeData` +
 * `Script_ResetPlayerApprentice` + `SetApprenticeId`). Le système Apprenti
 * complet (questions, party, Battle Tower) = Palier 4 Battle Frontier.
 *
 * `#define PLAYER_APPRENTICE gSaveBlock2Ptr->playerApprentice` (apprentice.c).
 */

import { gSaveBlock2Ptr } from './engine/save/save-block-state';
import { gGameLanguage } from './main';
import { Random } from './random';
import {
  APPRENTICE_COUNT, APPRENTICE_MAX_QUESTIONS, TRAINER_ID_LENGTH,
} from '../include/constants/global';

// 1:1 décomp constants/apprentice.h:4 + constants/global.h:34.
const NUM_APPRENTICES = 16;
const MULTI_PARTY_SIZE = 3;   // (PARTY_SIZE / 2)
const EC_EMPTY_WORD = 0xFFFF;

/** 1:1 décomp `sInitialApprenticeIds[8]` (data/battle_frontier/apprentice.h:982). */
const sInitialApprenticeIds: readonly number[] = [0, 1, 2, 3, 6, 7, 8, 9];

/** 1:1 décomp `static void SetApprenticeId(void)` (apprentice.c:178-196) :
 *  tire un id initial ≠ apprentices[0].id (do/while). */
function SetApprenticeId(): void {
  const pa = gSaveBlock2Ptr.playerApprentice;
  if (gSaveBlock2Ptr.apprentices[0].number === 0) {
    do {
      pa.id = sInitialApprenticeIds[Random() % sInitialApprenticeIds.length];
    } while (pa.id === gSaveBlock2Ptr.apprentices[0].id);
  } else {
    do {
      pa.id = Random() % NUM_APPRENTICES;
    } while (pa.id === gSaveBlock2Ptr.apprentices[0].id);
  }
}

/** 1:1 décomp `static void Script_ResetPlayerApprentice(void)` (apprentice.c:727-748). */
function Script_ResetPlayerApprentice(): void {
  const pa = gSaveBlock2Ptr.playerApprentice;
  SetApprenticeId();
  pa.lvlMode = 0;
  pa.questionsAnswered = 0;
  pa.leadMonId = 0;
  pa.party = 0;
  for (let i = 0; i < MULTI_PARTY_SIZE; i++) pa.speciesIds[i] = 0;
  for (let i = 0; i < APPRENTICE_MAX_QUESTIONS; i++) {
    pa.questions[i].questionId = 0;
    pa.questions[i].monId = 0;
    pa.questions[i].moveSlot = 0;
    pa.questions[i].suggestedChange = 0;
    pa.questions[i].data = 0;
  }
}

/** 1:1 décomp `void ResetAllApprenticeData(void)` (apprentice.c:151-173). */
export function ResetAllApprenticeData(): void {
  gSaveBlock2Ptr.playerApprentice.saveId = 0;
  for (let i = 0; i < APPRENTICE_COUNT; i++) {
    const ap = gSaveBlock2Ptr.apprentices[i];
    for (let j = 0; j < ap.speechWon.length; j++) ap.speechWon[j] = EC_EMPTY_WORD;
    ap.id = NUM_APPRENTICES;
    ap.playerName = '';   // 1:1 :161 playerName[0] = EOS
    ap.lvlMode = 0;
    ap.number = 0;
    ap.numQuestions = 0;
    for (let j = 0; j < TRAINER_ID_LENGTH; j++) ap.playerId[j] = 0;
    ap.language = gGameLanguage;
    ap.checksum = 0;
  }
  Script_ResetPlayerApprentice();
}
