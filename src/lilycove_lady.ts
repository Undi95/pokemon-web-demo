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


// ═══════════════════════════════════════════════════════════════════════════
// Suite de lilycove_lady.c (merge transpile-c, REVU) : Favor/Quiz/Contest Lady
// interactions complètes. Adaptations frontière (mêmes conventions que tv.ts) :
// union save PLATE (kind, pas de .quiz/.favor/.contest), playerName = string JS,
// playerTrainerId save2 = number u32 (octets extraits), textes double canal
// (gStringVar* charmap + setStringVar byte-VM). Les statics sXPtr sont réassignés
// en tête de fn comme le C (l'union C est à adresse fixe ; nos Init* REMPLACENT
// l'objet save → toujours re-lire via les assignations 1:1).
// ═══════════════════════════════════════════════════════════════════════════

import { EOS } from '../include/constants/characters';
import { CONTEST_CATEGORY_BEAUTY, CONTEST_CATEGORY_COOL, CONTEST_CATEGORY_CUTE, CONTEST_CATEGORY_SMART, CONTEST_CATEGORY_TOUGH, PLAYER_NAME_LENGTH } from '../include/constants/global';
import { VAR_OBJ_GFX_ID_0, VAR_OBJ_GFX_ID_1 } from '../include/constants/vars';
import {
  OBJ_EVENT_GFX_ZIGZAGOON_1, OBJ_EVENT_GFX_SKITTY, OBJ_EVENT_GFX_POOCHYENA,
  OBJ_EVENT_GFX_KECLEON, OBJ_EVENT_GFX_PIKACHU,
  OBJ_EVENT_GFX_WOMAN_4, OBJ_EVENT_GFX_WOMAN_2, OBJ_EVENT_GFX_GIRL_2,
} from '../include/constants/event_objects';
import { SPECIES_ZIGZAGOON, SPECIES_SKITTY, SPECIES_POOCHYENA, SPECIES_KECLEON, SPECIES_PIKACHU } from '../include/constants/species';
import { sContestNames } from './contest_strings';
import { CopyEasyChatWord, EC_EMPTY_WORD, IsEasyChatAnswerUnlocked, ShowEasyChatScreen } from './easy_chat';
import { RemoveBagItem } from './engine/bag/bag';
import { getString } from './engine/ui/gba-strings';
import { VarGet, VarSet } from './event_data';
import { GetItemName, GetBagItemKey } from './item';
import { FavorLadyOpenBagMenu, QuizLadyOpenBagMenu } from './item_menu';
import { ScriptContext_Enable } from './script';
import { ConvertInternationalString, StringCompare, StringCopy, StringCopy_PlayerName, gStringVar1, gStringVar2, gStringVar3 } from './string_util';
import { encodeOwText, decodeOwBytes, setStringVar, GetPlayerNameString } from './text';
import type { LilycoveLady, Pokeblock } from './engine/save/save-blocks';

// Vues de l'union (le C caste &lilycoveLady.quiz sans vérifier — idem ici).
type QuizLadyView = Extract<LilycoveLady, { kind: 'quiz' }>;
type FavorLadyView = Extract<LilycoveLady, { kind: 'favor' }>;
type ContestLadyView = Extract<LilycoveLady, { kind: 'contest' }>;

// ─── constantes décomp (include/constants/lilycove_lady.h + easy_chat.h + pokeblock.h) ───
const QUIZ_AUTHOR_PLAYER = 0;             // :15
const QUIZ_AUTHOR_OTHER_PLAYER = 1;       // :16
const QUIZ_AUTHOR_LADY = 2;               // :17
const QUIZ_AUTHOR_NAME_LADY = 0;          // :20
const QUIZ_AUTHOR_NAME_PLAYER = 1;        // :21
const QUIZ_AUTHOR_NAME_OTHER_PLAYER = 2;  // :22
const CONTEST_LADY_NORMAL = 0;            // :26
const CONTEST_LADY_GOOD = 1;              // :27
const CONTEST_LADY_BAD = 2;               // :28
const EASY_CHAT_TYPE_QUIZ_SET_QUESTION = 17; // easy_chat.h:21
const TRAINER_ID_BYTES = 4;               // TRAINER_ID_LENGTH (global.h)

/** 1:1 (lilycove_lady.c:33-35) statics de vue sur l'union save. */
let sFavorLadyPtr: FavorLadyView | null = null;
let sQuizLadyPtr: QuizLadyView | null = null;
let sContestLadyPtr: ContestLadyView | null = null;

// ─── data/lilycove_lady.h (suite — gfx, textes, espèces) ────────────────────

/** 1:1 `sLilycoveLadyGfxId[]` (data/lilycove_lady.h:14-19). */
const sLilycoveLadyGfxId: readonly number[] = [
  OBJ_EVENT_GFX_WOMAN_4,
  OBJ_EVENT_GFX_WOMAN_2,
  OBJ_EVENT_GFX_GIRL_2,
];

/** 1:1 `sContestLadyMonGfxId[]` (data/lilycove_lady.h:5-12). */
const sContestLadyMonGfxId: readonly number[] = [
  OBJ_EVENT_GFX_ZIGZAGOON_1, // [CONTEST_CATEGORY_COOL]
  OBJ_EVENT_GFX_SKITTY,      // [CONTEST_CATEGORY_BEAUTY]
  OBJ_EVENT_GFX_POOCHYENA,   // [CONTEST_CATEGORY_CUTE]
  OBJ_EVENT_GFX_KECLEON,     // [CONTEST_CATEGORY_SMART]
  OBJ_EVENT_GFX_PIKACHU,     // [CONTEST_CATEGORY_TOUGH]
];

/** 1:1 `sContestLadyMonSpecies[]` (data/lilycove_lady.h:459-466). */
const sContestLadyMonSpecies: readonly number[] = [
  SPECIES_ZIGZAGOON, // COOL
  SPECIES_SKITTY,    // BEAUTY
  SPECIES_POOCHYENA, // CUTE
  SPECIES_KECLEON,   // SMART
  SPECIES_PIKACHU,   // TOUGH
];

// Tables de textes = LABELS (strings.json chargé au boot — résolution getString à
// l'USAGE, jamais au top-level : leçon TDZ charmap/fetch async).
/** 1:1 `sFavorLadyRequests[]` (data/lilycove_lady.h:291-299) — gText_FavorLady_*. */
const sFavorLadyRequestLabels: readonly string[] = [
  'gText_FavorLady_Slippery', 'gText_FavorLady_Roundish', 'gText_FavorLady_Whamish',
  'gText_FavorLady_Shiny', 'gText_FavorLady_Sticky', 'gText_FavorLady_Pointy',
];
/** 1:1 `sContestLadyMonNames[]` (data/lilycove_lady.h:434-441). */
const sContestLadyMonNameLabels: readonly string[] = [
  'gText_ContestLady_Handsome', 'gText_ContestLady_Vinny', 'gText_ContestLady_Moreme',
  'gText_ContestLady_Ironhard', 'gText_ContestLady_Muscle',
];
/** 1:1 `sContestLadyCategoryNames[]` (data/lilycove_lady.h:443-450). */
const sContestLadyCategoryNameLabels: readonly string[] = [
  'gText_ContestLady_Coolness', 'gText_ContestLady_Beauty', 'gText_ContestLady_Cuteness',
  'gText_ContestLady_Smartness', 'gText_ContestLady_Toughness',
];

// ─── lilycove_lady.c (suite) ─────────────────────────────────────────────────

/** 1:1 `void SetLilycoveLadyGfx(void)` (lilycove_lady.c:44-59) : pose VAR_OBJ_GFX_ID_0
 *  (la dame) et, si Contest Lady, VAR_OBJ_GFX_ID_1 (son Pokémon) + Result. */
export function SetLilycoveLadyGfx(): void {
  VarSet(VAR_OBJ_GFX_ID_0, sLilycoveLadyGfxId[GetLilycoveLadyId()]);
  if (GetLilycoveLadyId() === LILYCOVE_LADY_CONTEST) {
    const lilycoveLady = gSaveBlock1Ptr.lilycoveLady as ContestLadyView;
    VarSet(VAR_OBJ_GFX_ID_1, sContestLadyMonGfxId[lilycoveLady.category]);
    VarSet(0x800D /* gSpecialVar_Result */, 1);
  } else {
    VarSet(0x800D /* gSpecialVar_Result */, 0);
  }
}

/** 1:1 `void ResetLilycoveLadyForRecordMix(void)` (lilycove_lady.c:80-94). */
export function ResetLilycoveLadyForRecordMix(): void {
  switch (GetLilycoveLadyId()) {
    case LILYCOVE_LADY_QUIZ: ResetQuizLadyForRecordMix(); break;
    case LILYCOVE_LADY_FAVOR: ResetFavorLadyForRecordMix(); break;
    case LILYCOVE_LADY_CONTEST: ResetContestLadyForRecordMix(); break;
  }
}

// Unused (1:1 décomp — présent pour complétude)
/** 1:1 `void InitLilycoveLadyRandomly(void)` (lilycove_lady.c:97-113). */
export function InitLilycoveLadyRandomly(): void {
  const lady = Random() % LILYCOVE_LADY_COUNT;
  switch (lady) {
    case LILYCOVE_LADY_QUIZ: InitLilycoveQuizLady(); break;
    case LILYCOVE_LADY_FAVOR: InitLilycoveFavorLady(); break;
    case LILYCOVE_LADY_CONTEST: InitLilycoveContestLady(); break;
  }
}

/** 1:1 `void Script_GetLilycoveLadyId(void)` (lilycove_lady.c:115-118). */
export function Script_GetLilycoveLadyId(): void {
  VarSet(0x800D /* gSpecialVar_Result */, GetLilycoveLadyId());
}

/** 1:1 `static void ResetFavorLadyForRecordMix(void)` (lilycove_lady.c:152-157). */
function ResetFavorLadyForRecordMix(): void {
  sFavorLadyPtr = gSaveBlock1Ptr.lilycoveLady as FavorLadyView;
  sFavorLadyPtr.id = LILYCOVE_LADY_FAVOR;
  sFavorLadyPtr.state = LILYCOVE_LADY_STATE_READY;
}

/** 1:1 `u8 GetFavorLadyState(void)` (lilycove_lady.c:159-168). */
export function GetFavorLadyState(): number {
  sFavorLadyPtr = gSaveBlock1Ptr.lilycoveLady as FavorLadyView;
  if (sFavorLadyPtr.state === LILYCOVE_LADY_STATE_PRIZE)
    return LILYCOVE_LADY_STATE_PRIZE;
  else if (sFavorLadyPtr.state === LILYCOVE_LADY_STATE_COMPLETED)
    return LILYCOVE_LADY_STATE_COMPLETED;
  else
    return LILYCOVE_LADY_STATE_READY;
}

/** 1:1 `static const u8 *GetFavorLadyRequest(u8 idx)` (lilycove_lady.c:170-173) —
 *  retourne le texte FR (string, résolu strings.json). */
function GetFavorLadyRequest(idx: number): string {
  return getString(sFavorLadyRequestLabels[idx]);
}

/** 1:1 `void BufferFavorLadyRequest(void)` (lilycove_lady.c:175-179). */
export function BufferFavorLadyRequest(): void {
  sFavorLadyPtr = gSaveBlock1Ptr.lilycoveLady as FavorLadyView;
  const req = GetFavorLadyRequest(sFavorLadyPtr.favorId);
  StringCopy(gStringVar1, encodeOwText(req));
  setStringVar(1, req); // canal byte-VM ({STR_VAR_1} des msgbox)
}

/** 1:1 `bool8 HasAnotherPlayerGivenFavorLadyItem(void)` (lilycove_lady.c:181-191). */
export function HasAnotherPlayerGivenFavorLadyItem(): boolean {
  sFavorLadyPtr = gSaveBlock1Ptr.lilycoveLady as FavorLadyView;
  if (sFavorLadyPtr.playerName !== '') {  // playerName[0] != EOS
    StringCopy_PlayerName(gStringVar3, encodeOwText(sFavorLadyPtr.playerName));
    ConvertInternationalString(gStringVar3, sFavorLadyPtr.language);
    setStringVar(3, sFavorLadyPtr.playerName);
    return true;
  }
  return false;
}

/** 1:1 `static void BufferItemName(u8 *dest, u16 itemId)` (lilycove_lady.c:193-196). */
function BufferItemName(dest: Uint8Array, itemId: number): void {
  StringCopy(dest, encodeOwText(GetItemName(itemId)));
}

/** 1:1 `void BufferFavorLadyItemName(void)` (lilycove_lady.c:198-202). */
export function BufferFavorLadyItemName(): void {
  sFavorLadyPtr = gSaveBlock1Ptr.lilycoveLady as FavorLadyView;
  BufferItemName(gStringVar2, sFavorLadyPtr.itemId);
  setStringVar(2, GetItemName(sFavorLadyPtr.itemId));
}

/** 1:1 `static void SetFavorLadyPlayerName(const u8 *src, u8 *dest)` (lilycove_lady.c:204-208)
 *  — memset(EOS) + StringCopy_PlayerName. Version buffer charmap (usage gStringVar3) ;
 *  l'écriture du champ SAVE (string) est inline dans DoesFavorLadyLikeItem. */
function SetFavorLadyPlayerName(src: string, dest: Uint8Array): void {
  dest.fill(EOS, 0, PLAYER_NAME_LENGTH + 1);  // memset(dest, EOS, PLAYER_NAME_LENGTH + 1)
  StringCopy_PlayerName(dest, encodeOwText(src));
}

/** 1:1 `void BufferFavorLadyPlayerName(void)` (lilycove_lady.c:210-215). */
export function BufferFavorLadyPlayerName(): void {
  sFavorLadyPtr = gSaveBlock1Ptr.lilycoveLady as FavorLadyView;
  SetFavorLadyPlayerName(sFavorLadyPtr.playerName, gStringVar3);
  ConvertInternationalString(gStringVar3, sFavorLadyPtr.language);
  setStringVar(3, sFavorLadyPtr.playerName);
}

// Only used to determine if a record-mixed player had given her an item she liked
/** 1:1 `bool8 DidFavorLadyLikeItem(void)` (lilycove_lady.c:218-222). */
export function DidFavorLadyLikeItem(): boolean {
  sFavorLadyPtr = gSaveBlock1Ptr.lilycoveLady as FavorLadyView;
  return sFavorLadyPtr.likedItem ? true : false;
}

/** 1:1 `void Script_FavorLadyOpenBagMenu(void)` (lilycove_lady.c:224-227). */
export function Script_FavorLadyOpenBagMenu(): void {
  FavorLadyOpenBagMenu();
}

/** 1:1 `static bool8 DoesFavorLadyLikeItem(u16 itemId)` (lilycove_lady.c:229-257). */
function DoesFavorLadyLikeItem(itemId: number): boolean {
  sFavorLadyPtr = gSaveBlock1Ptr.lilycoveLady as FavorLadyView;
  const numItems = GetNumAcceptedItems(sFavorLadyAcceptedItemLists[sFavorLadyPtr.favorId]);
  sFavorLadyPtr.state = LILYCOVE_LADY_STATE_COMPLETED;
  BufferItemName(gStringVar2, itemId);
  setStringVar(2, GetItemName(itemId));
  sFavorLadyPtr.itemId = itemId;
  // SetFavorLadyPlayerName(gSaveBlock2Ptr->playerName, sFavorLadyPtr->playerName) —
  // champ save string ; save2.playerName = number[] charmap → GetPlayerNameString.
  sFavorLadyPtr.playerName = GetPlayerNameString();
  sFavorLadyPtr.language = gGameLanguage;
  let likedItem = false;
  for (let i = 0; i < numItems; i++) {
    if (sFavorLadyAcceptedItemLists[sFavorLadyPtr.favorId][i] === itemId) {
      likedItem = true;
      sFavorLadyPtr.numItemsGiven++;
      sFavorLadyPtr.likedItem = 1;
      if (sFavorLadyPtr.bestItem === itemId)
        sFavorLadyPtr.numItemsGiven = LILYCOVE_LADY_GIFT_THRESHOLD;
      break;
    }
    sFavorLadyPtr.likedItem = 0;
  }
  return likedItem;
}

/** 1:1 `bool8 Script_DoesFavorLadyLikeItem(void)` (lilycove_lady.c:259-262) —
 *  appelé via `specialvar VAR_RESULT`. */
export function Script_DoesFavorLadyLikeItem(): boolean {
  return DoesFavorLadyLikeItem(VarGet(0x800E) /* gSpecialVar_ItemId */);
}

/** 1:1 `bool8 IsFavorLadyThresholdMet(void)` (lilycove_lady.c:264-271). */
export function IsFavorLadyThresholdMet(): boolean {
  sFavorLadyPtr = gSaveBlock1Ptr.lilycoveLady as FavorLadyView;
  const numItemsGiven = sFavorLadyPtr.numItemsGiven;
  return numItemsGiven < LILYCOVE_LADY_GIFT_THRESHOLD ? false : true;
}

/** 1:1 `static void FavorLadyBufferPrizeName(u16 prize)` (lilycove_lady.c:273-276). */
function FavorLadyBufferPrizeName(prize: number): void {
  BufferItemName(gStringVar2, prize);
  setStringVar(2, GetItemName(prize));
}

/** 1:1 `u16 FavorLadyGetPrize(void)` (lilycove_lady.c:278-287). */
export function FavorLadyGetPrize(): number {
  sFavorLadyPtr = gSaveBlock1Ptr.lilycoveLady as FavorLadyView;
  const prize = sFavorLadyPrizes[sFavorLadyPtr.favorId];
  FavorLadyBufferPrizeName(prize);
  sFavorLadyPtr.state = LILYCOVE_LADY_STATE_PRIZE;
  return prize;
}

/** 1:1 `void SetFavorLadyState_Complete(void)` (lilycove_lady.c:289-293) — le C
 *  ré-init la Favor Lady puis marque COMPLETED (re-lecture post-Init : nos Init
 *  remplacent l'objet save). */
export function SetFavorLadyState_Complete(): void {
  InitLilycoveFavorLady();
  sFavorLadyPtr = gSaveBlock1Ptr.lilycoveLady as FavorLadyView;
  sFavorLadyPtr.state = LILYCOVE_LADY_STATE_COMPLETED;
}

/** 1:1 `void FieldCallback_FavorLadyEnableScriptContexts(void)` (lilycove_lady.c:295-298). */
export function FieldCallback_FavorLadyEnableScriptContexts(): void {
  ScriptContext_Enable();
}

/** 1:1 `static void ResetQuizLadyForRecordMix(void)` (lilycove_lady.c:338-345). */
function ResetQuizLadyForRecordMix(): void {
  sQuizLadyPtr = gSaveBlock1Ptr.lilycoveLady as QuizLadyView;
  sQuizLadyPtr.id = LILYCOVE_LADY_QUIZ;
  sQuizLadyPtr.state = LILYCOVE_LADY_STATE_READY;
  sQuizLadyPtr.waitingForChallenger = 0;
  sQuizLadyPtr.playerAnswer = EC_EMPTY_WORD;
}

/** 1:1 `u8 GetQuizLadyState(void)` (lilycove_lady.c:347-356). */
export function GetQuizLadyState(): number {
  sQuizLadyPtr = gSaveBlock1Ptr.lilycoveLady as QuizLadyView;
  if (sQuizLadyPtr.state === LILYCOVE_LADY_STATE_PRIZE)
    return LILYCOVE_LADY_STATE_PRIZE;
  else if (sQuizLadyPtr.state === LILYCOVE_LADY_STATE_COMPLETED)
    return LILYCOVE_LADY_STATE_COMPLETED;
  else
    return LILYCOVE_LADY_STATE_READY;
}

/** 1:1 `u8 GetQuizAuthor(void)` (lilycove_lady.c:358-387) : si la réponse de la
 *  question courante n'est pas débloquée (easy chat), re-tire la suivante
 *  débloquée ; puis identifie l'auteur (dame / joueur / autre joueur). */
export function GetQuizAuthor(): number {
  const quiz = gSaveBlock1Ptr.lilycoveLady as QuizLadyView;
  if (!IsEasyChatAnswerUnlocked(quiz.correctAnswer)) {
    let i = quiz.questionId;
    do {
      if (++i >= sQuizLadyQuizQuestions.length)
        i = 0;
    } while (!IsEasyChatAnswerUnlocked(sQuizLadyQuizAnswers[i]));
    for (let j = 0; j < QUIZ_QUESTION_LEN; j++)
      quiz.question[j] = sQuizLadyQuizQuestions[i][j];
    quiz.correctAnswer = sQuizLadyQuizAnswers[i];
    quiz.prize = sQuizLadyPrizes[i];
    quiz.questionId = i;
    quiz.playerName = '';  // playerName[0] = EOS
  }
  const authorNameId = BufferQuizAuthorName();
  if (authorNameId === QUIZ_AUTHOR_NAME_LADY)
    return QUIZ_AUTHOR_LADY;
  else if (authorNameId === QUIZ_AUTHOR_NAME_OTHER_PLAYER || IsQuizTrainerIdNotPlayer())
    return QUIZ_AUTHOR_OTHER_PLAYER;
  else
    return QUIZ_AUTHOR_PLAYER;
}

/** 1:1 `static u8 BufferQuizAuthorName(void)` (lilycove_lady.c:389-423) — FR :
 *  la dame = « moi » (gText_QuizLady_Lady, French Difference). */
function BufferQuizAuthorName(): number {
  let authorNameId = QUIZ_AUTHOR_NAME_PLAYER;
  sQuizLadyPtr = gSaveBlock1Ptr.lilycoveLady as QuizLadyView;
  if (sQuizLadyPtr.playerName === '') {
    const lady = getString('gText_QuizLady_Lady'); // "moi"
    StringCopy(gStringVar1, encodeOwText(lady)); //!< French Difference
    setStringVar(1, lady);
    authorNameId = QUIZ_AUTHOR_NAME_LADY;
  } else {
    StringCopy_PlayerName(gStringVar1, encodeOwText(sQuizLadyPtr.playerName));
    ConvertInternationalString(gStringVar1, sQuizLadyPtr.language);
    setStringVar(1, sQuizLadyPtr.playerName);
    const nameLen = GetPlayerNameLength(sQuizLadyPtr.playerName);
    const playerStr = GetPlayerNameString();  // save2.playerName = number[] charmap
    if (nameLen === GetPlayerNameLength(playerStr)) {
      const name = sQuizLadyPtr.playerName;
      for (let i = 0; i < nameLen; i++) {
        if (name[i] !== playerStr[i]) {
          authorNameId = QUIZ_AUTHOR_NAME_OTHER_PLAYER;
          break;
        }
      }
    }
  }
  return authorNameId;
}

/** 1:1 `static bool8 IsQuizTrainerIdNotPlayer(void)` (lilycove_lady.c:425-441) —
 *  playerTrainerId save2 = u32 (octets little-endian extraits, cf. InitLilycoveLady). */
function IsQuizTrainerIdNotPlayer(): boolean {
  sQuizLadyPtr = gSaveBlock1Ptr.lilycoveLady as QuizLadyView;
  const trainerId = gSaveBlock2Ptr.playerTrainerId ?? 0;
  for (let i = 0; i < TRAINER_ID_BYTES; i++) {
    if (sQuizLadyPtr.playerTrainerId[i] !== ((trainerId >>> (8 * i)) & 0xFF))
      return true;
  }
  return false;
}

/** 1:1 `static u8 GetPlayerNameLength(const u8 *playerName)` (lilycove_lady.c:443-450). */
function GetPlayerNameLength(playerName: string | Uint8Array): number {
  if (typeof playerName === 'string') return playerName.length;
  let len = 0;
  while (playerName[len] !== EOS) len++;
  return len;
}

/** 1:1 `void BufferQuizPrizeName(void)` (lilycove_lady.c:452-455) — utilise le
 *  static posé par la special précédente (comme le C). */
export function BufferQuizPrizeName(): void {
  sQuizLadyPtr ??= gSaveBlock1Ptr.lilycoveLady as QuizLadyView;
  StringCopy(gStringVar1, encodeOwText(GetItemName(sQuizLadyPtr.prize)));
  setStringVar(1, GetItemName(sQuizLadyPtr.prize));
}

/** 1:1 `bool8 BufferQuizAuthorNameAndCheckIfLady(void)` (lilycove_lady.c:457-466). */
export function BufferQuizAuthorNameAndCheckIfLady(): boolean {
  sQuizLadyPtr = gSaveBlock1Ptr.lilycoveLady as QuizLadyView;
  if (BufferQuizAuthorName() === QUIZ_AUTHOR_NAME_LADY) {
    sQuizLadyPtr.language = gGameLanguage;
    return true;
  }
  return false;
}

/** 1:1 `bool8 IsQuizLadyWaitingForChallenger(void)` (lilycove_lady.c:468-472). */
export function IsQuizLadyWaitingForChallenger(): boolean {
  sQuizLadyPtr = gSaveBlock1Ptr.lilycoveLady as QuizLadyView;
  return !!sQuizLadyPtr.waitingForChallenger;
}

/** 1:1 `void QuizLadyGetPlayerAnswer(void)` (lilycove_lady.c:474-477) — le script
 *  a posé VAR_0x8004 = EASY_CHAT_TYPE_QUIZ_ANSWER avant. */
export function QuizLadyGetPlayerAnswer(): void {
  ShowEasyChatScreen();
}

/** 1:1 `bool8 IsQuizAnswerCorrect(void)` (lilycove_lady.c:479-485). */
export function IsQuizAnswerCorrect(): boolean {
  sQuizLadyPtr = gSaveBlock1Ptr.lilycoveLady as QuizLadyView;
  CopyEasyChatWord(gStringVar1, sQuizLadyPtr.correctAnswer);
  CopyEasyChatWord(gStringVar2, sQuizLadyPtr.playerAnswer);
  setStringVar(1, decodeOwBytes(gStringVar1));
  setStringVar(2, decodeOwBytes(gStringVar2));
  return StringCompare(gStringVar1, gStringVar2) ? false : true;
}

/** 1:1 `void BufferQuizPrizeItem(void)` (lilycove_lady.c:487-491). */
export function BufferQuizPrizeItem(): void {
  sQuizLadyPtr = gSaveBlock1Ptr.lilycoveLady as QuizLadyView;
  VarSet(0x8005 /* gSpecialVar_0x8005 */, sQuizLadyPtr.prize);
}

/** 1:1 `void SetQuizLadyState_Complete(void)` (lilycove_lady.c:493-497). */
export function SetQuizLadyState_Complete(): void {
  sQuizLadyPtr = gSaveBlock1Ptr.lilycoveLady as QuizLadyView;
  sQuizLadyPtr.state = LILYCOVE_LADY_STATE_COMPLETED;
}

/** 1:1 `void SetQuizLadyState_GivePrize(void)` (lilycove_lady.c:499-503). */
export function SetQuizLadyState_GivePrize(): void {
  sQuizLadyPtr = gSaveBlock1Ptr.lilycoveLady as QuizLadyView;
  sQuizLadyPtr.state = LILYCOVE_LADY_STATE_PRIZE;
}

/** 1:1 `void ClearQuizLadyPlayerAnswer(void)` (lilycove_lady.c:505-509). */
export function ClearQuizLadyPlayerAnswer(): void {
  sQuizLadyPtr = gSaveBlock1Ptr.lilycoveLady as QuizLadyView;
  sQuizLadyPtr.playerAnswer = EC_EMPTY_WORD;
}

/** 1:1 `void Script_QuizLadyOpenBagMenu(void)` (lilycove_lady.c:511-514). */
export function Script_QuizLadyOpenBagMenu(): void {
  QuizLadyOpenBagMenu();
}

/** 1:1 `void QuizLadyPickNewQuestion(void)` (lilycove_lady.c:516-524). */
export function QuizLadyPickNewQuestion(): void {
  sQuizLadyPtr = gSaveBlock1Ptr.lilycoveLady as QuizLadyView;
  let prevQuestionId: number;
  if (BufferQuizAuthorNameAndCheckIfLady())
    prevQuestionId = sQuizLadyPtr.questionId;
  else
    prevQuestionId = sQuizLadyQuizQuestions.length;
  QuizLadyPickQuestion(sQuizLadyPtr);  // ré-écrit question/answer/prize/questionId in-place
  sQuizLadyPtr.prevQuestionId = prevQuestionId;
}

/** 1:1 `void ClearQuizLadyQuestionAndAnswer(void)` (lilycove_lady.c:526-534). */
export function ClearQuizLadyQuestionAndAnswer(): void {
  sQuizLadyPtr = gSaveBlock1Ptr.lilycoveLady as QuizLadyView;
  for (let i = 0; i < QUIZ_QUESTION_LEN; i++)
    sQuizLadyPtr.question[i] = EC_EMPTY_WORD;
  sQuizLadyPtr.correctAnswer = EC_EMPTY_WORD;
}

/** 1:1 `void QuizLadySetCustomQuestion(void)` (lilycove_lady.c:536-540). */
export function QuizLadySetCustomQuestion(): void {
  VarSet(0x8004 /* gSpecialVar_0x8004 */, EASY_CHAT_TYPE_QUIZ_SET_QUESTION);
  ShowEasyChatScreen();
}

/** 1:1 `void QuizLadyTakePrizeForCustomQuiz(void)` (lilycove_lady.c:542-545). */
export function QuizLadyTakePrizeForCustomQuiz(): void {
  RemoveBagItem(GetBagItemKey(VarGet(0x800E) /* gSpecialVar_ItemId */), 1);
}

/** 1:1 `void QuizLadyRecordCustomQuizData(void)` (lilycove_lady.c:547-557). */
export function QuizLadyRecordCustomQuizData(): void {
  sQuizLadyPtr = gSaveBlock1Ptr.lilycoveLady as QuizLadyView;
  sQuizLadyPtr.prize = VarGet(0x800E) /* gSpecialVar_ItemId */;
  const trainerId = gSaveBlock2Ptr.playerTrainerId ?? 0;
  for (let i = 0; i < TRAINER_ID_BYTES; i++)
    sQuizLadyPtr.playerTrainerId[i] = (trainerId >>> (8 * i)) & 0xFF;
  sQuizLadyPtr.playerName = GetPlayerNameString();  // StringCopy_PlayerName (save string)
  sQuizLadyPtr.language = gGameLanguage;
}

/** 1:1 `void QuizLadySetWaitingForChallenger(void)` (lilycove_lady.c:559-563). */
export function QuizLadySetWaitingForChallenger(): void {
  sQuizLadyPtr = gSaveBlock1Ptr.lilycoveLady as QuizLadyView;
  sQuizLadyPtr.waitingForChallenger = 1;
}

/** 1:1 `void BufferQuizCorrectAnswer(void)` (lilycove_lady.c:565-569). */
export function BufferQuizCorrectAnswer(): void {
  sQuizLadyPtr = gSaveBlock1Ptr.lilycoveLady as QuizLadyView;
  CopyEasyChatWord(gStringVar3, sQuizLadyPtr.correctAnswer);
  setStringVar(3, decodeOwBytes(gStringVar3));
}

/** 1:1 `void FieldCallback_QuizLadyEnableScriptContexts(void)` (lilycove_lady.c:572-575). */
export function FieldCallback_QuizLadyEnableScriptContexts(): void {
  ScriptContext_Enable();
}

/** 1:1 `void QuizLadyClearQuestionForRecordMix(const LilycoveLady *lilycoveLady)`
 *  (lilycove_lady.c:577-596) — `lilycoveLady` = la dame REÇUE du record mixing. */
export function QuizLadyClearQuestionForRecordMix(lilycoveLady: LilycoveLady): void {
  sQuizLadyPtr = gSaveBlock1Ptr.lilycoveLady as QuizLadyView;
  const incoming = lilycoveLady as QuizLadyView;
  if (incoming.prevQuestionId < sQuizLadyQuizQuestions.length && sQuizLadyPtr.id === LILYCOVE_LADY_QUIZ) {
    for (let i = 0; i < 4; i++) {
      if (incoming.prevQuestionId !== sQuizLadyPtr.questionId)
        break;
      sQuizLadyPtr.questionId = Random() % sQuizLadyQuizQuestions.length;
    }
    if (incoming.prevQuestionId === sQuizLadyPtr.questionId)
      sQuizLadyPtr.questionId = (sQuizLadyPtr.questionId + 1) % sQuizLadyQuizQuestions.length;
    sQuizLadyPtr.prevQuestionId = incoming.prevQuestionId;
  }
}

/** 1:1 `static void ResetContestLadyForRecordMix(void)` (lilycove_lady.c:616-625). */
function ResetContestLadyForRecordMix(): void {
  sContestLadyPtr = gSaveBlock1Ptr.lilycoveLady as ContestLadyView;
  sContestLadyPtr.id = LILYCOVE_LADY_CONTEST;
  sContestLadyPtr.givenPokeblock = 0;
  if (sContestLadyPtr.numGoodPokeblocksGiven === LILYCOVE_LADY_GIFT_THRESHOLD
    || sContestLadyPtr.numOtherPokeblocksGiven === LILYCOVE_LADY_GIFT_THRESHOLD)
    ResetContestLadyContestData(sContestLadyPtr);
}

/** 1:1 `static void ContestLadySavePlayerNameIfHighSheen(u8 sheen)` (lilycove_lady.c:627-637). */
function ContestLadySavePlayerNameIfHighSheen(sheen: number): void {
  sContestLadyPtr = gSaveBlock1Ptr.lilycoveLady as ContestLadyView;
  if (sContestLadyPtr.maxSheen <= sheen) {
    sContestLadyPtr.maxSheen = sheen;
    // memset(EOS) + memcpy(gSaveBlock2Ptr->playerName) — champ save string :
    sContestLadyPtr.playerName = GetPlayerNameString();
    sContestLadyPtr.language = gGameLanguage;
  }
}

/** 1:1 `bool8 GivePokeblockToContestLady(struct Pokeblock *pokeblock)` (lilycove_lady.c:639-693). */
export function GivePokeblockToContestLady(pokeblock: Pokeblock): boolean {
  let sheen = 0;
  let correctFlavor = false;
  sContestLadyPtr = gSaveBlock1Ptr.lilycoveLady as ContestLadyView;
  switch (sContestLadyPtr.category) {
    case CONTEST_CATEGORY_COOL:
      if (pokeblock.spicy !== 0) { sheen = pokeblock.spicy; correctFlavor = true; }
      break;
    case CONTEST_CATEGORY_BEAUTY:
      if (pokeblock.dry !== 0) { sheen = pokeblock.dry; correctFlavor = true; }
      break;
    case CONTEST_CATEGORY_CUTE:
      if (pokeblock.sweet !== 0) { sheen = pokeblock.sweet; correctFlavor = true; }
      break;
    case CONTEST_CATEGORY_SMART:
      if (pokeblock.bitter !== 0) { sheen = pokeblock.bitter; correctFlavor = true; }
      break;
    case CONTEST_CATEGORY_TOUGH:
      if (pokeblock.sour !== 0) { sheen = pokeblock.sour; correctFlavor = true; }
      break;
  }
  if (correctFlavor === true) {
    ContestLadySavePlayerNameIfHighSheen(sheen);
    sContestLadyPtr.numGoodPokeblocksGiven++;
  } else {
    sContestLadyPtr.numOtherPokeblocksGiven++;
  }
  return correctFlavor;
}

/** 1:1 `static void BufferContestLadyCategoryAndMonName(u8 *category, u8 *nickname)`
 *  (lilycove_lady.c:695-700). */
function BufferContestLadyCategoryAndMonName(category: Uint8Array, nickname: Uint8Array): void {
  sContestLadyPtr = gSaveBlock1Ptr.lilycoveLady as ContestLadyView;
  StringCopy(category, encodeOwText(getString(sContestLadyCategoryNameLabels[sContestLadyPtr.category])));
  StringCopy(nickname, encodeOwText(getString(sContestLadyMonNameLabels[sContestLadyPtr.category])));  // StringCopy_Nickname
}

/** 1:1 `void BufferContestLadyMonName(u8 *category, u8 *nickname)` (lilycove_lady.c:702-707)
 *  — `category` = OUT param (u8*) → boxé. Caller : tv.c (Contest Lady show). */
export function BufferContestLadyMonName(category: { v: number }, nickname: Uint8Array): void {
  sContestLadyPtr = gSaveBlock1Ptr.lilycoveLady as ContestLadyView;
  category.v = sContestLadyPtr.category;
  StringCopy(nickname, encodeOwText(getString(sContestLadyMonNameLabels[sContestLadyPtr.category])));
}

/** 1:1 `void BufferContestLadyPlayerName(u8 *dest)` (lilycove_lady.c:709-713). */
export function BufferContestLadyPlayerName(dest: Uint8Array): void {
  sContestLadyPtr = gSaveBlock1Ptr.lilycoveLady as ContestLadyView;
  StringCopy(dest, encodeOwText(sContestLadyPtr.playerName));
}

/** 1:1 `void BufferContestLadyLanguage(u8 *dest)` (lilycove_lady.c:715-719). */
export function BufferContestLadyLanguage(dest: { v: number }): void {
  sContestLadyPtr = gSaveBlock1Ptr.lilycoveLady as ContestLadyView;
  dest.v = sContestLadyPtr.language;
}

/** 1:1 `void BufferContestName(u8 *dest, u8 category)` (lilycove_lady.c:721-724)
 *  — sContestNames = foyer contest_strings.ts (même source data/lilycove_lady.h:452). */
export function BufferContestName(dest: Uint8Array, category: number): void {
  StringCopy(dest, encodeOwText(sContestNames[category]));
}

// Used by the Contest Lady's TV show to determine how well she performed
/** 1:1 `u8 GetContestLadyPokeblockState(void)` (lilycove_lady.c:727-736). */
export function GetContestLadyPokeblockState(): number {
  sContestLadyPtr = gSaveBlock1Ptr.lilycoveLady as ContestLadyView;
  if (sContestLadyPtr.numGoodPokeblocksGiven >= LILYCOVE_LADY_GIFT_THRESHOLD)
    return CONTEST_LADY_GOOD;
  else if (sContestLadyPtr.numGoodPokeblocksGiven === 0)
    return CONTEST_LADY_BAD;
  else
    return CONTEST_LADY_NORMAL;
}

/** 1:1 `bool8 HasPlayerGivenContestLadyPokeblock(void)` (lilycove_lady.c:739-745). */
export function HasPlayerGivenContestLadyPokeblock(): boolean {
  sContestLadyPtr = gSaveBlock1Ptr.lilycoveLady as ContestLadyView;
  if (sContestLadyPtr.givenPokeblock === 1)
    return true;
  return false;
}

/** 1:1 `bool8 ShouldContestLadyShowGoOnAir(void)` (lilycove_lady.c:747-757). */
export function ShouldContestLadyShowGoOnAir(): boolean {
  let putOnAir = false;
  sContestLadyPtr = gSaveBlock1Ptr.lilycoveLady as ContestLadyView;
  if (sContestLadyPtr.numGoodPokeblocksGiven >= LILYCOVE_LADY_GIFT_THRESHOLD
    || sContestLadyPtr.numOtherPokeblocksGiven >= LILYCOVE_LADY_GIFT_THRESHOLD)
    putOnAir = true;
  return putOnAir;
}

/** 1:1 `void Script_BufferContestLadyCategoryAndMonName(void)` (lilycove_lady.c:759-762). */
export function Script_BufferContestLadyCategoryAndMonName(): void {
  BufferContestLadyCategoryAndMonName(gStringVar2, gStringVar1);
  // canal byte-VM ({STR_VAR_2}=catégorie, {STR_VAR_1}=nom du mon)
  const cat = (gSaveBlock1Ptr.lilycoveLady as ContestLadyView).category;
  setStringVar(2, getString(sContestLadyCategoryNameLabels[cat]));
  setStringVar(1, getString(sContestLadyMonNameLabels[cat]));
}

/** 1:1 `void OpenPokeblockCaseForContestLady(void)` (lilycove_lady.c:764-767) :
 *  `OpenPokeblockCase(PBLOCK_CASE_GIVE, CB2_ReturnToField)`. 🚧 DETTE : l'écran
 *  PokéblockCase (pokeblock.c CB2_OpenPokeblockCase) n'est pas porté (chantier
 *  sac #15) — on ré-enable le contexte script pour ne pas geler le waitstate ;
 *  à câbler avec l'écran. Reste dans la stub-list registry en attendant. */
export function OpenPokeblockCaseForContestLady(): void {
  console.warn('[lilycove_lady] OpenPokeblockCase(PBLOCK_CASE_GIVE) : écran PokéblockCase non porté (dette sac #15)');
  ScriptContext_Enable();
}

/** 1:1 `void SetContestLadyGivenPokeblock(void)` (lilycove_lady.c:769-773). */
export function SetContestLadyGivenPokeblock(): void {
  sContestLadyPtr = gSaveBlock1Ptr.lilycoveLady as ContestLadyView;
  sContestLadyPtr.givenPokeblock = 1;
}

/** 1:1 `void GetContestLadyMonSpecies(void)` (lilycove_lady.c:775-779). */
export function GetContestLadyMonSpecies(): void {
  sContestLadyPtr = gSaveBlock1Ptr.lilycoveLady as ContestLadyView;
  VarSet(0x8005 /* gSpecialVar_0x8005 */, sContestLadyMonSpecies[sContestLadyPtr.category]);
}

/** 1:1 `u8 GetContestLadyCategory(void)` (lilycove_lady.c:781-785). */
export function GetContestLadyCategory(): number {
  sContestLadyPtr = gSaveBlock1Ptr.lilycoveLady as ContestLadyView;
  return sContestLadyPtr.category;
}

// ─── Ponts globalThis (anti-cycle : item_menu CB2 exits + tv.ts Contest Lady) ─
(globalThis as Record<string, unknown>).__FieldCallback_FavorLadyEnableScriptContexts = FieldCallback_FavorLadyEnableScriptContexts;
(globalThis as Record<string, unknown>).__FieldCallback_QuizLadyEnableScriptContexts = FieldCallback_QuizLadyEnableScriptContexts;
(globalThis as Record<string, unknown>).__lilycoveLady = {
  GetContestLadyPokeblockState, BufferContestLadyMonName, BufferContestLadyPlayerName,
  BufferContestLadyLanguage, BufferContestName, GetContestLadyCategory,
};
