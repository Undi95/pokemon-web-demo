/**
 * mauville_old_man.ts — Port 1:1 STRICT (MIROIR partiel) de `src/mauville_old_man.c`.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/mauville_old_man.c`.
 *
 * Périmètre porté : le SEEDING new-game du vieil homme de Lavandia
 * (`SetMauvilleOldMan` + les 5 Setup* + `SetMauvilleOldManObjEventGfx` +
 * `GetCurrentMauvilleOldMan`). Le contenu interactif (chant du barde
 * Task_BardSong, contes du storyteller, blagues de Giddy) = specials déjà
 * portés dans specials-registry ou chantier ultérieur.
 *
 * `union OldMan` (global.h:715) = notre union discriminée `OldMan`
 * (save-blocks.ts:474, champ `kind`). Le C écrit dans une union sur la RAM
 * zéro-initialisée par ClearSav1 ; ici on REMPLACE l'objet entier avec les
 * champs non mentionnés à zéro (= même état mémoire que le GBA).
 */

import { gSaveBlock1Ptr, gSaveBlock2Ptr } from './engine/save/save-block-state';
import { gGameLanguage } from './main';
import { VarSet } from './engine/script/script-vars';
import { NUM_BARD_SONG_WORDS, NUM_STORYTELLER_TALES } from '../include/constants/global';
import { OBJ_EVENT_GFX_BARD } from '../include/constants/event_objects';
import { TraderSetup } from './trader';

// 1:1 décomp constants/mauville_old_man.h:4-8.
export const MAUVILLE_MAN_BARD = 0;
export const MAUVILLE_MAN_HIPSTER = 1;
export const MAUVILLE_MAN_TRADER = 2;
export const MAUVILLE_MAN_STORYTELLER = 3;
export const MAUVILLE_MAN_GIDDY = 4;

/** 1:1 décomp `sDefaultBardSongLyrics[NUM_BARD_SONG_WORDS]` (mauville_old_man.c:40). */
const sDefaultBardSongLyrics: readonly number[] = [
  0x0E09, // EC_WORD_FEELING
  0x1A1A, // EC_WORD_DIET
  0x0A31, // EC_WORD_IT_S
  0xFFFF, // EC_EMPTY_WORD
  0x0415, // EC_WORD_COOL
  0xFFFF, // EC_EMPTY_WORD
];

/** 1:1 décomp `static void SetupBard(void)` (mauville_old_man.c:74-84). */
function SetupBard(): void {
  gSaveBlock1Ptr.oldMan = {
    id: MAUVILLE_MAN_BARD,
    kind: 'bard',
    songLyrics: sDefaultBardSongLyrics.slice(0, NUM_BARD_SONG_WORDS),
    newSongLyrics: new Array(NUM_BARD_SONG_WORDS).fill(0),
    playerName: '',
    playerTrainerId: [0, 0, 0, 0],
    hasChangedSong: 0,   // 1:1 :80 bard->hasChangedSong = FALSE
    language: gGameLanguage,
  };
}

/** 1:1 décomp `static void SetupHipster(void)` (mauville_old_man.c:86-93). */
function SetupHipster(): void {
  gSaveBlock1Ptr.oldMan = {
    id: MAUVILLE_MAN_HIPSTER,
    kind: 'hipster',
    taughtWord: 0,       // 1:1 :91 hipster->taughtWord = FALSE
    language: gGameLanguage,
  };
}

/** 1:1 décomp `static void StorytellerSetup(void)` (mauville_old_man.c:1201-1213) :
 *  id + alreadyRecorded=FALSE + gameStatIDs[i]=0 + trainerNames[0][i]=EOS
 *  (le `[0][i]` est un bug décomp documenté ligne 1211 — sur RAM fraîche
 *  zéro-initialisée le résultat est identique : tous les noms vides). */
function StorytellerSetup(): void {
  gSaveBlock1Ptr.oldMan = {
    id: MAUVILLE_MAN_STORYTELLER,
    kind: 'storyteller',
    alreadyRecorded: 0,
    gameStatIDs: new Array(NUM_STORYTELLER_TALES).fill(0),
    trainerNames: new Array(NUM_STORYTELLER_TALES).fill(''),
    statValues: Array.from({ length: NUM_STORYTELLER_TALES }, () => [0, 0, 0, 0]),
    language: new Array(NUM_STORYTELLER_TALES).fill(gGameLanguage),
  };
}

/** 1:1 décomp `static void SetupStoryteller(void)` (mauville_old_man.c:95-98). */
function SetupStoryteller(): void {
  StorytellerSetup();
}

/** 1:1 décomp `static void SetupGiddy(void)` (mauville_old_man.c:100-107). */
function SetupGiddy(): void {
  gSaveBlock1Ptr.oldMan = {
    id: MAUVILLE_MAN_GIDDY,
    kind: 'giddy',
    taleCounter: 0,      // 1:1 :105 giddy->taleCounter = 0
    questionNum: 0,
    randomWords: new Array(10).fill(0),   // GIDDY_MAX_TALES
    questionList: new Array(8).fill(0),   // GIDDY_MAX_QUESTIONS
    language: gGameLanguage,
  };
}

/** 1:1 décomp `static void SetupTrader(void)` (mauville_old_man.c:109-112). */
function SetupTrader(): void {
  TraderSetup();
}

/** 1:1 décomp `void SetMauvilleOldMan(void)` (mauville_old_man.c:114-139) :
 *  l'identité du vieil homme dépend du DERNIER CHIFFRE du trainer ID
 *  (`(trainerId % 10) / 2` → 0..4). Notre SB2.playerTrainerId est un u32
 *  number (le décomp lit les 2 octets bas : `(id[1] << 8) | id[0]`). */
export function SetMauvilleOldMan(): void {
  // 1:1 :116 `(playerTrainerId[1] << 8) | playerTrainerId[0]` = 16 bits bas du
  // u32 little-endian (notre SB2.playerTrainerId est le u32 direct).
  const trainerId = (gSaveBlock2Ptr.playerTrainerId ?? 0) & 0xFFFF;

  // Determine man based on the last digit of the player's trainer ID. (1:1 :119)
  switch (Math.floor((trainerId % 10) / 2)) {
    case MAUVILLE_MAN_BARD: SetupBard(); break;
    case MAUVILLE_MAN_HIPSTER: SetupHipster(); break;
    case MAUVILLE_MAN_TRADER: SetupTrader(); break;
    case MAUVILLE_MAN_STORYTELLER: SetupStoryteller(); break;
    case MAUVILLE_MAN_GIDDY: SetupGiddy(); break;
  }
  SetMauvilleOldManObjEventGfx();
}

/** 1:1 décomp `u8 GetCurrentMauvilleOldMan(void)` (mauville_old_man.c:141-144). */
export function GetCurrentMauvilleOldMan(): number {
  return gSaveBlock1Ptr.oldMan?.id ?? 0;
}

/** 1:1 décomp `void SetMauvilleOldManObjEventGfx(void)` (mauville_old_man.c:746-749) :
 *  VarSet(VAR_OBJ_GFX_ID_0, OBJ_EVENT_GFX_BARD). Le GFX affiché est toujours
 *  celui du barde (le sprite est le même pour les 5 identités). */
export function SetMauvilleOldManObjEventGfx(): void {
  VarSet('VAR_OBJ_GFX_ID_0', OBJ_EVENT_GFX_BARD);
}
