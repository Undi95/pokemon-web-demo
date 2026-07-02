/**
 * lilycove_lady.ts — Port 1:1 STRICT (MIROIR partiel) de `src/lilycove_lady.c`.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/lilycove_lady.c`
 *                  + `src/data/lilycove_lady.h` (tables).
 *
 * Périmètre porté : le SEEDING new-game (`InitLilycoveLady` + les 3 Init* +
 * leurs helpers de tirage) + les tables data (questions/réponses/prix du quiz,
 * listes d'objets de la Favor Lady). Les interactions en jeu (donner un objet,
 * répondre au quiz, Pokéblock de la Contest Lady) = specials déjà portés dans
 * specials-registry (ils lisent la MÊME struct save `lilycoveLady`).
 *
 * `union LilycoveLady` (global.h:846) = notre union discriminée `LilycoveLady`
 * (save-blocks.ts:517, champ `kind`). Le C écrit dans l'union sur RAM zéro ;
 * on REMPLACE l'objet entier, champs non mentionnés à zéro (= état GBA).
 */

import { gSaveBlock1Ptr, gSaveBlock2Ptr } from './engine/save/save-block-state';
import { gGameLanguage } from './main';
import { Random } from './random';
import { QUIZ_QUESTION_LEN, TRAINER_ID_LENGTH, CONTEST_CATEGORIES_COUNT } from '../include/constants/global';
import { ITEM_NONE } from '../include/constants/items';

// 1:1 décomp constants/lilycove_lady.h:4-13.
export const LILYCOVE_LADY_QUIZ = 0;
export const LILYCOVE_LADY_FAVOR = 1;
export const LILYCOVE_LADY_CONTEST = 2;
export const LILYCOVE_LADY_COUNT = 3;
export const LILYCOVE_LADY_STATE_READY = 0;
export const LILYCOVE_LADY_STATE_COMPLETED = 1;
export const LILYCOVE_LADY_STATE_PRIZE = 2;
export const LILYCOVE_LADY_GIFT_THRESHOLD = 5;

// ─── data/lilycove_lady.h — Quiz Lady ────────────────────────────────────────
// 1:1 sQuizLadyQuestion1..16 + table de pointeurs sQuizLadyQuizQuestions
// (valeurs EC_WORD_* résolues depuis constants/easy_chat.h, commentées 1:1).

/** 1:1 décomp `sQuizLadyQuizQuestions[]` (data/lilycove_lady.h:22-231). */
const sQuizLadyQuizQuestions: readonly (readonly number[])[] = [
  [0x0E0C, 0x1812, 0x1E1B, 0x0E0C, 0x020E, 0x0C03, 0x181C, 0x0210, 0x020D], // 1: CASE INFORMATION UP CASE POKEMON ? PHONE POKEDEX POKENAV
  [0x0E0C, 0x1A12, 0x0A31, 0x0C03, 0x2017, 0x060C, 0x1002, 0x1219, 0xFFFF], // 2: CASE COMPLETE IT_S ? AWESOME NO_MATCH OR SCARY —
  [0x0E0F, 0x161E, 0x0204, 0x0E0C, 0x020E, 0x0C03, 0x0212, 0x0451, 0x0463], // 3: HOW MAKE EVOLVE CASE POKEMON ? LEVEL INSOMNIA CUTE_CHARM
  [0x0A31, 0xFFFF, 0x1405, 0x0C03, 0x182A, 0x1A04, 0x1823, 0xFFFF, 0xFFFF], // 4: IT_S — GOOD ? RADIO SWEETS MACHINE — —
  [0x1E22, 0x181D, 0x0A1F, 0xFFFF, 0x1625, 0x0C03, 0x0208, 0x1824, 0x181C], // 5: WHAT ITEM AREN_T — IGNORANT ? EGG MAIL PHONE
  [0x0E1F, 0x162B, 0x1025, 0xFFFF, 0x1E26, 0x0C03, 0x0447, 0x045D, 0x042C], // 6: EVEN_SO USES SO — CONFUSED ? ILLUMINATE OWN_TEMPO SWIFT_SWIM
  [0x1020, 0x020E, 0x0A31, 0x0C03, 0xFFFF, 0xFFFF, 0x2021, 0x1230, 0x060C], // 7: A POKEMON IT_S ? — — LOVEY_DOVEY TERRIBLE NO_MATCH
  [0x0E1F, 0x162B, 0x061C, 0x0E09, 0x0442, 0x0C03, 0x0437, 0x0411, 0x0450], // 8: EVEN_SO USES VERSUS FEELING RUN_AWAY ? VOLT_ABSORB SHADOW_TAG WONDER_GUARD
  [0x102B, 0x0629, 0x0E0D, 0xFFFF, 0x043C, 0x0C03, 0x0421, 0x0464, 0x0435], // 9: FOR FIGHT THE — POISON ? GUTS IMMUNITY SHED_SKIN
  [0x1C08, 0x1C1E, 0x0A31, 0x0C03, 0xFFFF, 0xFFFF, 0x1C20, 0x1C0B, 0x1C29], // 10: FOREVER SATURDAY IT_S ? — — SUNDAY TUESDAY THURSDAY
  [0x0A31, 0x140C, 0x1034, 0xFFFF, 0x1A18, 0x0C03, 0x181A, 0x1806, 0x1823], // 11: IT_S FULL OF — SOFTWARE ? DEPT_STORE SCHOOL MACHINE
  [0x0E0F, 0x101E, 0x0E32, 0xFFFF, 0x1812, 0x0C03, 0x1A15, 0x1A23, 0x181B], // 12: HOW HAVE MOOD — INFORMATION ? BIKE LOCOMOTIVE TELEVISION
  [0x2760, 0x0A31, 0x1021, 0x0C03, 0x063E, 0x0408, 0x1002, 0x1021, 0x1E1E], // 13: EC_MOVE2(WATER_PULSE) IT_S AN ? MOVE COLOR OR AN AWAY
  [0x0446, 0x100B, 0x0620, 0xFFFF, 0x061C, 0x0C03, 0x0420, 0xFFFF, 0x0426], // 14: STEEL IS STRONG — VERSUS ? ICE — GROUND
  [0x0400, 0x100B, 0x0639, 0xFFFF, 0x061C, 0x0C03, 0x040E, 0xFFFF, 0x0410], // 15: DARK IS WEAK — VERSUS ? PSYCHIC — FIGHTING
  [0x041F, 0x100B, 0x0639, 0xFFFF, 0x061C, 0x0C03, 0x0445, 0x0400, 0xFFFF], // 16: GHOST IS WEAK — VERSUS ? NORMAL DARK —
];

/** 1:1 décomp `sQuizLadyQuizAnswers[]` (data/lilycove_lady.h:233-252). */
const sQuizLadyQuizAnswers: readonly number[] = [
  0x0210, // EC_WORD_POKEDEX
  0x2017, // EC_WORD_AWESOME
  0x0212, // EC_WORD_LEVEL
  0x1A04, // EC_WORD_SWEETS
  0x0208, // EC_WORD_EGG
  0x045D, // EC_WORD_OWN_TEMPO
  0x2021, // EC_WORD_LOVEY_DOVEY
  0x0411, // EC_WORD_SHADOW_TAG
  0x0464, // EC_WORD_IMMUNITY
  0x1C20, // EC_WORD_SUNDAY
  0x1823, // EC_WORD_MACHINE
  0x181B, // EC_WORD_TELEVISION
  0x063E, // EC_WORD_MOVE
  0x0420, // EC_WORD_ICE
  0x0410, // EC_WORD_FIGHTING
  0x0400, // EC_WORD_DARK
];

/** 1:1 décomp `sQuizLadyPrizes[]` (data/lilycove_lady.h:254-288). */
const sQuizLadyPrizes: readonly number[] = [
  123, // ITEM_GLITTER_MAIL
  127, // ITEM_BEAD_MAIL
  129, // ITEM_TROPIC_MAIL
  35,  // ITEM_MAX_ETHER
  35,  // ITEM_MAX_ETHER
  35,  // ITEM_MAX_ETHER
  165, // ITEM_WATMEL_BERRY
  167, // ITEM_BELUE_BERRY
  166, // ITEM_DURIN_BERRY
  11,  // ITEM_LUXURY_BALL
  303, // ITEM_TM_HYPER_BEAM (= ITEM_TM15, X-macro tms_hms.h)
  107, // ITEM_BIG_PEARL
  109, // ITEM_STAR_PIECE
  68,  // ITEM_RARE_CANDY
  68,  // ITEM_RARE_CANDY
  12,  // ITEM_PREMIER_BALL
];

// ─── data/lilycove_lady.h — Favor Lady ───────────────────────────────────────
// 1:1 sFavorLadyAcceptedItems_* + table sFavorLadyAcceptedItemLists (:413-421).
// Les listes finissent par ITEM_NONE (sentinel, comme le décomp — GetNumAcceptedItems
// s'arrête dessus). sFavorLadyRequests (:291-299) = 6 textes gText_FavorLady_*
// (Slippery/Roundish/Whamish/Shiny/Sticky/Pointy) — même longueur que cette table.

/** 1:1 décomp `sFavorLadyAcceptedItemLists[]` (data/lilycove_lady.h:413-421). */
const sFavorLadyAcceptedItemLists: readonly (readonly number[])[] = [
  [86, 83, 84, 14, 18, 15, 167, 17, 16, 24, 25, 30, ITEM_NONE],                             // _Slippery: REPEL SUPER_REPEL MAX_REPEL ANTIDOTE PARALYZE_HEAL BURN_HEAL BELUE_BERRY AWAKENING ICE_HEAL REVIVE MAX_REVIVE ENERGY_POWDER
  [81, 106, 107, 204, 194, 47, 103, 104, 135, 137, 139, 157, 160, 165, 4, 2, ITEM_NONE],    // _Roundish: FLUFFY_TAIL PEARL BIG_PEARL HARD_STONE SMOKE_BALL SHOAL_SHELL TINY_MUSHROOM BIG_MUSHROOM PECHA_BERRY ASPEAR_BERRY ORAN_BERRY GREPA_BERRY MAGOST_BERRY WATMEL_BERRY POKE_BALL ULTRA_BALL
  [33, 13, 26, 27, 28, 204, 202, 38, 134, 150, 151, 154, 162, 166, ITEM_NONE],              // _Whamish: REVIVAL_HERB POTION FRESH_WATER SODA_POP LEMONADE HARD_STONE LIGHT_BALL LAVA_COOKIE CHESTO_BERRY NANAB_BERRY WEPEAR_BERRY KELPSY_BERRY NOMEL_BERRY DURIN_BERRY
  [32, 77, 75, 76, 39, 40, 41, 42, 43, 110, 93, 108, 109, 106, 107, 214, 188, 179, 11, 12, ITEM_NONE], // _Shiny: HEAL_POWDER X_SPEED X_ATTACK X_DEFEND BLUE/YELLOW/RED/BLACK/WHITE_FLUTE NUGGET SUN_STONE STARDUST STAR_PIECE PEARL BIG_PEARL TWISTED_SPOON SILVER_POWDER BRIGHT_POWDER LUXURY_BALL PREMIER_BALL
  [31, 19, 20, 74, 78, 73, 165, 200, 103, 111, ITEM_NONE],                                  // _Sticky: ENERGY_ROOT FULL_RESTORE MAX_POTION DIRE_HIT X_ACCURACY GUARD_SPEC WATMEL_BERRY LEFTOVERS TINY_MUSHROOM HEART_SCALE
  [183, 211, 210, 216, 158, 166, 171, 170, 108, 109, ITEM_NONE],                            // _Pointy: QUICK_CLAW POISON_BARB SHARP_BEAK DRAGON_FANG TAMATO_BERRY DURIN_BERRY PETAYA_BERRY SALAC_BERRY STARDUST STAR_PIECE
];

/** 1:1 décomp `sFavorLadyPrizes[]` (data/lilycove_lady.h:423-431). */
export const sFavorLadyPrizes: readonly number[] = [
  11,  // ITEM_LUXURY_BALL
  110, // ITEM_NUGGET
  64,  // ITEM_PROTEIN
  111, // ITEM_HEART_SCALE
  68,  // ITEM_RARE_CANDY
  71,  // ITEM_PP_MAX
];

// ─── lilycove_lady.c ─────────────────────────────────────────────────────────

/** 1:1 décomp `u8 GetLilycoveLadyId(void)` (lilycove_lady.c:39-42). */
export function GetLilycoveLadyId(): number {
  return gSaveBlock1Ptr.lilycoveLady?.id ?? 0;
}

/** 1:1 décomp `static u8 GetNumAcceptedItems(const u16 *itemsArray)`
 *  (lilycove_lady.c:120-126) : compte jusqu'au sentinel ITEM_NONE. */
function GetNumAcceptedItems(itemsArray: readonly number[]): number {
  let numItems = 0;
  while (itemsArray[numItems] !== ITEM_NONE) numItems++;
  return numItems;
}

/** 1:1 décomp `static void FavorLadyPickFavorAndBestItem(void)` (lilycove_lady.c:128-137). */
function FavorLadyPickFavorAndBestItem(lady: { favorId: number; bestItem: number }): void {
  lady.favorId = Random() % sFavorLadyAcceptedItemLists.length;  // ARRAY_COUNT(sFavorLadyRequests) = 6
  const numItems = GetNumAcceptedItems(sFavorLadyAcceptedItemLists[lady.favorId]);
  const bestItem = Random() % numItems;
  lady.bestItem = sFavorLadyAcceptedItemLists[lady.favorId][bestItem];
}

/** 1:1 décomp `static void InitLilycoveFavorLady(void)` (lilycove_lady.c:139-150). */
function InitLilycoveFavorLady(): void {
  const lady = {
    id: LILYCOVE_LADY_FAVOR,
    kind: 'favor' as const,
    state: LILYCOVE_LADY_STATE_READY,
    playerName: '',            // 1:1 :144 playerName[0] = EOS
    likedItem: 0,              // 1:1 :145 FALSE
    numItemsGiven: 0,
    itemId: ITEM_NONE,
    favorId: 0,
    bestItem: 0,
    language: gGameLanguage,
  };
  FavorLadyPickFavorAndBestItem(lady);
  gSaveBlock1Ptr.lilycoveLady = lady;
}

/** 1:1 décomp `static void QuizLadyPickQuestion(void)` (lilycove_lady.c:300-312). */
function QuizLadyPickQuestion(lady: {
  question: number[]; correctAnswer: number; prize: number; questionId: number; playerName: string;
}): void {
  const questionId = Random() % sQuizLadyQuizQuestions.length;
  for (let i = 0; i < QUIZ_QUESTION_LEN; i++) {
    lady.question[i] = sQuizLadyQuizQuestions[questionId][i];
  }
  lady.correctAnswer = sQuizLadyQuizAnswers[questionId];
  lady.prize = sQuizLadyPrizes[questionId];
  lady.questionId = questionId;
  lady.playerName = '';        // 1:1 :311 playerName[0] = EOS
}

/** 1:1 décomp `static void InitLilycoveQuizLady(void)` (lilycove_lady.c:314-336). */
function InitLilycoveQuizLady(): void {
  const lady = {
    id: LILYCOVE_LADY_QUIZ,
    kind: 'quiz' as const,
    state: LILYCOVE_LADY_STATE_READY,
    question: new Array(QUIZ_QUESTION_LEN).fill(0xFFFF),  // 1:1 :322-323 EC_EMPTY_WORD
    correctAnswer: 0xFFFF,                                 // EC_EMPTY_WORD
    playerAnswer: 0xFFFF,                                  // EC_EMPTY_WORD
    playerName: '',
    playerTrainerId: new Array(TRAINER_ID_LENGTH).fill(0), // 1:1 :328-329
    prize: ITEM_NONE,
    waitingForChallenger: 0,                               // 1:1 :332 FALSE
    questionId: 0,
    prevQuestionId: sQuizLadyQuizQuestions.length,         // 1:1 :333 ARRAY_COUNT(sQuizLadyQuizQuestions)
    language: gGameLanguage,
  };
  QuizLadyPickQuestion(lady);
  gSaveBlock1Ptr.lilycoveLady = lady;
}

/** 1:1 décomp `static void ResetContestLadyContestData(void)` (lilycove_lady.c:598-605). */
function ResetContestLadyContestData(lady: {
  playerName: string; numGoodPokeblocksGiven: number; numOtherPokeblocksGiven: number;
  maxSheen: number; category: number;
}): void {
  lady.playerName = '';        // 1:1 :600 playerName[0] = EOS
  lady.numGoodPokeblocksGiven = 0;
  lady.numOtherPokeblocksGiven = 0;
  lady.maxSheen = 0;
  lady.category = Random() % CONTEST_CATEGORIES_COUNT;
}

/** 1:1 décomp `static void InitLilycoveContestLady(void)` (lilycove_lady.c:607-614). */
function InitLilycoveContestLady(): void {
  const lady = {
    id: LILYCOVE_LADY_CONTEST,
    kind: 'contest' as const,
    givenPokeblock: 0,   // 1:1 :611 FALSE
    numGoodPokeblocksGiven: 0,
    numOtherPokeblocksGiven: 0,
    playerName: '',
    maxSheen: 0,
    category: 0,
    language: 0,
  };
  ResetContestLadyContestData(lady);
  lady.language = gGameLanguage;  // 1:1 :613 (posé APRÈS ResetContestLadyContestData)
  gSaveBlock1Ptr.lilycoveLady = lady;
}

/** 1:1 décomp `void InitLilycoveLady(void)` (lilycove_lady.c:61-78) :
 *  l'identité de la dame dépend du trainer ID : `(id % 6) >> 1` → 0..2. */
export function InitLilycoveLady(): void {
  // 1:1 :63 `(playerTrainerId[1] << 8) | playerTrainerId[0]` = 16 bits bas du u32.
  let id = (gSaveBlock2Ptr.playerTrainerId ?? 0) & 0xFFFF;
  id %= 6;
  id >>= 1;
  switch (id) {
    case LILYCOVE_LADY_QUIZ: InitLilycoveQuizLady(); break;
    case LILYCOVE_LADY_FAVOR: InitLilycoveFavorLady(); break;
    case LILYCOVE_LADY_CONTEST: InitLilycoveContestLady(); break;
  }
}
