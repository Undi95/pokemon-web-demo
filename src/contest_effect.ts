/**
 * contest_effect.ts — miroir 1:1 de `D:/Projet 1/decomps/pokeemeraude/src/contest_effect.c`
 * (transpilé via scripts/transpile-c.cjs, puis réparé pour compiler INERTE).
 *
 * ⚠️ INERTE — rien n'importe encore ce module. Les Contests sont du CONTENU à venir
 * (décision projet) : ceci est la logique PURE des effets d'appeal, prête à être re-câblée
 * quand les Contests seront portés dans `src/contest.ts`.
 *
 * État EWRAM (eContestantStatus, eContestAppealResults, eContest, eContestExcitement,
 * gContestantTurnOrder) + `gContestMoves` : shapes 1:1 include/contest.h / contest_effect.h,
 * instances placeholder ZÉRO-INIT (cf. commentaires « INERTE »). Les fonctions de `contest.c`
 * pas encore portées (SetContestantEffectStringID…) : placeholders no-op « INERTE »,
 * remplacés par des imports au portage des Contests.
 *
 * Tables transcrites ENTIÈRES depuis src/data/contest_moves.h (contrat du repo) :
 * gContestEffects (:2837), gComboStarterLookupTable (:3131), gContestEffectFuncs (:3198).
 *
 * Politique préproc : build vanilla FR (NDEBUG/FRENCH définis, BUGFIX/UBFIX absents).
 */

import { CONTESTANT_COUNT, CONTEST_CATEGORY_BEAUTY, CONTEST_CATEGORY_COOL, CONTEST_CATEGORY_CUTE, CONTEST_CATEGORY_SMART, CONTEST_CATEGORY_TOUGH } from '../include/constants/global';
import { VarGet } from './event_data';
import { Random } from './random';

/** C `abs` (stdlib) → Math.abs. */
const abs = Math.abs;

// ─── enum CONTEST_STRING_* (1:1 include/contest.h:7-72) ───
const CONTEST_STRING_MORE_CONSCIOUS = 0;
const CONTEST_STRING_NO_APPEAL = 1;
const CONTEST_STRING_SETTLE_DOWN = 2;
const CONTEST_STRING_OBLIVIOUS_TO_OTHERS = 3;
const CONTEST_STRING_LESS_AWARE = 4;
const CONTEST_STRING_STOPPED_CARING = 5;
const CONTEST_STRING_DAZZLE_ATTEMPT = 7;
const CONTEST_STRING_JUDGE_LOOK_AWAY2 = 8;
const CONTEST_STRING_UNNERVE_ATTEMPT = 9;
const CONTEST_STRING_NERVOUS = 10;
const CONTEST_STRING_UNNERVE_WAITING = 11;
const CONTEST_STRING_TAUNT_WELL = 12;
const CONTEST_STRING_REGAINED_FORM = 13;
const CONTEST_STRING_JAM_WELL = 14;
const CONTEST_STRING_HUSTLE_STANDOUT = 15;
const CONTEST_STRING_WORK_HARD_UNNOTICED = 16;
const CONTEST_STRING_WORK_BEFORE = 17;
const CONTEST_STRING_APPEAL_NOT_WELL = 18;
const CONTEST_STRING_WORK_PRECEDING = 19;
const CONTEST_STRING_APPEAL_NOT_WELL2 = 20;
const CONTEST_STRING_APPEAL_NOT_SHOWN_WELL = 21;
const CONTEST_STRING_APPEAL_SLIGHTLY_WELL = 22;
const CONTEST_STRING_APPEAL_PRETTY_WELL = 23;
const CONTEST_STRING_APPEAL_EXCELLENTLY = 24;
const CONTEST_STRING_APPEAL_NOT_VERY_WELL = 26;
const CONTEST_STRING_APPEAL_SLIGHTLY_WELL2 = 27;
const CONTEST_STRING_APPEAL_PRETTY_WELL2 = 28;
const CONTEST_STRING_APPEAL_VERY_WELL = 29;
const CONTEST_STRING_APPEAL_EXCELLENTLY2 = 30;
const CONTEST_STRING_SAME_TYPE_GOOD = 31;
const CONTEST_STRING_DIFF_TYPE_GOOD = 32;
const CONTEST_STRING_STOOD_OUT_AS_MUCH = 33;
const CONTEST_STRING_NOT_AS_WELL = 34;
const CONTEST_STRING_CONDITION_ROSE = 35;
const CONTEST_STRING_HOT_STATUS = 36;
const CONTEST_STRING_MOVE_UP_LINE = 37;
const CONTEST_STRING_MOVE_BACK_LINE = 38;
const CONTEST_STRING_SCRAMBLE_ORDER = 39;
const CONTEST_STRING_AVERT_GAZE = 44;
const CONTEST_STRING_AVOID_SEEING = 45;
const CONTEST_STRING_NOT_FAZED = 46;
const CONTEST_STRING_LITTLE_DISTRACTED = 47;
const CONTEST_STRING_ATTEMPT_STARTLE = 48;
const CONTEST_STRING_MESSED_UP2 = 54;
const CONTEST_STRING_IGNORED = 57;
const CONTEST_STRING_NO_CONDITION_IMPROVE = 58;
const CONTEST_STRING_BAD_CONDITION_WEAK_APPEAL = 59;
const CONTEST_STRING_UNAFFECTED = 60;
const CONTEST_STRING_ATTRACTED_ATTENTION = 61;

// ─── enum CONDITION_* (1:1 include/contest.h:81-85) ───
const CONDITION_GAIN = 1;
const CONDITION_LOSE = 2;

// ─── constants/contest.h ───
const CONTESTANT_NONE = 0xFF;   // 1:1 include/constants/contest.h:9
const CONTEST_LAST_APPEAL = 4;  // 1:1 include/constants/contest.h:6 (CONTEST_NUM_APPEALS - 1)

// ─── CONTEST_EFFECT_TYPE_* (1:1 include/constants/contest.h:151-158) — pour gContestEffects ───
const CONTEST_EFFECT_TYPE_APPEAL = 0;
const CONTEST_EFFECT_TYPE_AVOID_STARTLE = 1;
const CONTEST_EFFECT_TYPE_STARTLE_MON = 2;
const CONTEST_EFFECT_TYPE_STARTLE_MONS = 3;
const CONTEST_EFFECT_TYPE_WORSEN = 4;
const CONTEST_EFFECT_TYPE_SPECIAL_APPEAL = 5;
const CONTEST_EFFECT_TYPE_TURN_ORDER = 6;

// ═══ shapes 1:1 (structs décomp — forme NUMÉRIQUE du moteur d'effets) ═══

/** 1:1 `struct ContestMove` (include/contest_effect.h:4). Forme numérique du moteur d'effets ;
 *  le repo a par ailleurs un `gContestMoves` string-keyé (engine/data/game-data) pour l'écran
 *  résumé — représentation distincte. */
interface ContestMove {
  effect: number;
  contestCategory: number;
  comboStarterId: number;
  comboMoves: number[];
}

/** 1:1 `struct ContestEffect` (include/contest_effect.h:12). */
interface ContestEffect {
  effectType: number;
  appeal: number;
  jam: number;
}

/** 1:1 `struct ContestantStatus` (include/contest.h:167-214). Bitfields `bool8:1` → boolean,
 *  `u8:N` (multi-bits) → number. */
interface ContestantStatus {
  baseAppeal: number;    // s16
  appeal: number;        // s16
  pointTotal: number;    // s16
  currMove: number;      // u16
  prevMove: number;      // u16
  moveCategory: number;  // u8
  ranking: number;       // u8:2
  unused1: number;       // u8:2
  moveRepeatCount: number; // u8:3
  noMoreTurns: boolean;  // bool8:1
  nervous: boolean;      // bool8:1
  numTurnsSkipped: number; // u8:2
  condition: number;     // s8
  jam: number;           // u8
  jamReduction: number;  // u8
  resistant: boolean;    // bool8:1
  immune: boolean;       // bool8:1
  moreEasilyStartled: boolean; // bool8:1
  usedRepeatableMove: boolean; // bool8:1
  conditionMod: number;  // u8:2
  turnOrderMod: number;  // u8:2
  turnOrderModAction: number; // u8:2
  turnSkipped: boolean;  // bool8:1
  exploded: boolean;     // bool8:1
  overrideCategoryExcitementMod: boolean; // bool8:1
  appealTripleCondition: boolean; // bool8:1
  jamSafetyCount: number; // u8
  effectStringId: number; // u8
  effectStringId2: number; // u8
  repeatedMove: boolean; // bool8:1
  unused2: boolean;      // bool8:1
  repeatedPrevMove: boolean; // bool8:1
  completedComboFlag: boolean; // bool8:1
  hasJudgesAttention: boolean; // bool8:1
  judgesAttentionWasRemoved: boolean; // bool8:1
  usedComboMove: boolean; // bool8:1
  completedCombo: boolean; // bool8
  comboAppealBonus: number; // u8
  repeatJam: number;     // u8
  nextTurnOrder: number; // u8
  attentionLevel: number; // u8
  contestantAnimTarget: number; // u8
}

/** 1:1 `struct ContestAppealMoveResults` (include/contest.h:216-224). */
interface ContestAppealMoveResults {
  turnOrder: number[];     // u8[CONTESTANT_COUNT]
  jam: number;             // s16
  jam2: number;            // s16
  jamQueue: number[];      // u8[5]
  unnervedPokes: number[]; // u8[CONTESTANT_COUNT]
  contestant: number;      // u8
}

/** Partiel 1:1 `struct Contest` (include/contest.h:133) — uniquement les champs lus par
 *  contest_effect.c ; l'état/écran complet vivra dans contest.ts. */
interface Contest {
  appealNumber: number;  // u8
  applauseLevel: number; // s8
}

/** 1:1 `struct ContestExcitement` (include/contest.h:243). */
interface ContestExcitement {
  moveExcitement: number;      // s8
  frozen: boolean;             // u8:1
  freezer: number;             // u8:3
  excitementAppealBonus: number; // s8
}

// ═══ tables de données transcrites ENTIÈRES (src/data/contest_moves.h) ═══

/** 1:1 `gContestEffects[]` (src/data/contest_moves.h:2837), indexé CONTEST_EFFECT_* (0-47). */
const gContestEffects: ContestEffect[] = [
  { effectType: CONTEST_EFFECT_TYPE_APPEAL, appeal: 40, jam: 0 },          // [0]  HIGHLY_APPEALING
  { effectType: CONTEST_EFFECT_TYPE_APPEAL, appeal: 60, jam: 0 },          // [1]  USER_MORE_EASILY_STARTLED
  { effectType: CONTEST_EFFECT_TYPE_APPEAL, appeal: 80, jam: 0 },          // [2]  GREAT_APPEAL_BUT_NO_MORE_MOVES
  { effectType: CONTEST_EFFECT_TYPE_APPEAL, appeal: 30, jam: 0 },          // [3]  REPETITION_NOT_BORING
  { effectType: CONTEST_EFFECT_TYPE_AVOID_STARTLE, appeal: 20, jam: 0 },   // [4]  AVOID_STARTLE_ONCE
  { effectType: CONTEST_EFFECT_TYPE_AVOID_STARTLE, appeal: 10, jam: 0 },   // [5]  AVOID_STARTLE
  { effectType: CONTEST_EFFECT_TYPE_AVOID_STARTLE, appeal: 30, jam: 0 },   // [6]  AVOID_STARTLE_SLIGHTLY
  { effectType: CONTEST_EFFECT_TYPE_AVOID_STARTLE, appeal: 30, jam: 0 },   // [7]  USER_LESS_EASILY_STARTLED
  { effectType: CONTEST_EFFECT_TYPE_STARTLE_MON, appeal: 30, jam: 20 },    // [8]  STARTLE_FRONT_MON
  { effectType: CONTEST_EFFECT_TYPE_STARTLE_MONS, appeal: 30, jam: 10 },   // [9]  SLIGHTLY_STARTLE_PREV_MONS
  { effectType: CONTEST_EFFECT_TYPE_STARTLE_MON, appeal: 20, jam: 30 },    // [10] STARTLE_PREV_MON
  { effectType: CONTEST_EFFECT_TYPE_STARTLE_MONS, appeal: 20, jam: 20 },   // [11] STARTLE_PREV_MONS
  { effectType: CONTEST_EFFECT_TYPE_STARTLE_MON, appeal: 10, jam: 40 },    // [12] BADLY_STARTLE_FRONT_MON
  { effectType: CONTEST_EFFECT_TYPE_STARTLE_MONS, appeal: 10, jam: 30 },   // [13] BADLY_STARTLE_PREV_MONS
  { effectType: CONTEST_EFFECT_TYPE_STARTLE_MON, appeal: 30, jam: 20 },    // [14] STARTLE_PREV_MON_2
  { effectType: CONTEST_EFFECT_TYPE_STARTLE_MONS, appeal: 30, jam: 10 },   // [15] STARTLE_PREV_MONS_2
  { effectType: CONTEST_EFFECT_TYPE_WORSEN, appeal: 30, jam: 0 },          // [16] SHIFT_JUDGE_ATTENTION
  { effectType: CONTEST_EFFECT_TYPE_STARTLE_MONS, appeal: 20, jam: 10 },   // [17] STARTLE_MON_WITH_JUDGES_ATTENTION
  { effectType: CONTEST_EFFECT_TYPE_STARTLE_MONS, appeal: 40, jam: 40 },   // [18] JAMS_OTHERS_BUT_MISS_ONE_TURN
  { effectType: CONTEST_EFFECT_TYPE_STARTLE_MONS, appeal: 20, jam: 10 },   // [19] STARTLE_MONS_SAME_TYPE_APPEAL
  { effectType: CONTEST_EFFECT_TYPE_STARTLE_MONS, appeal: 20, jam: 10 },   // [20] STARTLE_MONS_COOL_APPEAL
  { effectType: CONTEST_EFFECT_TYPE_STARTLE_MONS, appeal: 20, jam: 10 },   // [21] STARTLE_MONS_BEAUTY_APPEAL
  { effectType: CONTEST_EFFECT_TYPE_STARTLE_MONS, appeal: 20, jam: 10 },   // [22] STARTLE_MONS_CUTE_APPEAL
  { effectType: CONTEST_EFFECT_TYPE_STARTLE_MONS, appeal: 20, jam: 10 },   // [23] STARTLE_MONS_SMART_APPEAL
  { effectType: CONTEST_EFFECT_TYPE_STARTLE_MONS, appeal: 20, jam: 10 },   // [24] STARTLE_MONS_TOUGH_APPEAL
  { effectType: CONTEST_EFFECT_TYPE_WORSEN, appeal: 20, jam: 0 },          // [25] MAKE_FOLLOWING_MON_NERVOUS
  { effectType: CONTEST_EFFECT_TYPE_WORSEN, appeal: 20, jam: 0 },          // [26] MAKE_FOLLOWING_MONS_NERVOUS
  { effectType: CONTEST_EFFECT_TYPE_WORSEN, appeal: 30, jam: 0 },          // [27] WORSEN_CONDITION_OF_PREV_MONS
  { effectType: CONTEST_EFFECT_TYPE_STARTLE_MONS, appeal: 30, jam: 10 },   // [28] BADLY_STARTLES_MONS_IN_GOOD_CONDITION
  { effectType: CONTEST_EFFECT_TYPE_SPECIAL_APPEAL, appeal: 20, jam: 0 },  // [29] BETTER_IF_FIRST
  { effectType: CONTEST_EFFECT_TYPE_SPECIAL_APPEAL, appeal: 20, jam: 0 },  // [30] BETTER_IF_LAST
  { effectType: CONTEST_EFFECT_TYPE_SPECIAL_APPEAL, appeal: 10, jam: 0 },  // [31] APPEAL_AS_GOOD_AS_PREV_ONES
  { effectType: CONTEST_EFFECT_TYPE_SPECIAL_APPEAL, appeal: 10, jam: 0 },  // [32] APPEAL_AS_GOOD_AS_PREV_ONE
  { effectType: CONTEST_EFFECT_TYPE_SPECIAL_APPEAL, appeal: 10, jam: 0 },  // [33] BETTER_WHEN_LATER
  { effectType: CONTEST_EFFECT_TYPE_SPECIAL_APPEAL, appeal: 10, jam: 0 },  // [34] QUALITY_DEPENDS_ON_TIMING
  { effectType: CONTEST_EFFECT_TYPE_SPECIAL_APPEAL, appeal: 20, jam: 0 },  // [35] BETTER_IF_SAME_TYPE
  { effectType: CONTEST_EFFECT_TYPE_SPECIAL_APPEAL, appeal: 20, jam: 0 },  // [36] BETTER_IF_DIFF_TYPE
  { effectType: CONTEST_EFFECT_TYPE_SPECIAL_APPEAL, appeal: 30, jam: 0 },  // [37] AFFECTED_BY_PREV_APPEAL
  { effectType: CONTEST_EFFECT_TYPE_SPECIAL_APPEAL, appeal: 10, jam: 0 },  // [38] IMPROVE_CONDITION_PREVENT_NERVOUSNESS
  { effectType: CONTEST_EFFECT_TYPE_SPECIAL_APPEAL, appeal: 10, jam: 0 },  // [39] BETTER_WITH_GOOD_CONDITION
  { effectType: CONTEST_EFFECT_TYPE_TURN_ORDER, appeal: 30, jam: 0 },      // [40] NEXT_APPEAL_EARLIER
  { effectType: CONTEST_EFFECT_TYPE_TURN_ORDER, appeal: 30, jam: 0 },      // [41] NEXT_APPEAL_LATER
  { effectType: CONTEST_EFFECT_TYPE_TURN_ORDER, appeal: 30, jam: 0 },      // [42] MAKE_SCRAMBLING_TURN_ORDER_EASIER
  { effectType: CONTEST_EFFECT_TYPE_TURN_ORDER, appeal: 30, jam: 0 },      // [43] SCRAMBLE_NEXT_TURN_ORDER
  { effectType: CONTEST_EFFECT_TYPE_SPECIAL_APPEAL, appeal: 10, jam: 0 },  // [44] EXCITE_AUDIENCE_IN_ANY_CONTEST
  { effectType: CONTEST_EFFECT_TYPE_STARTLE_MONS, appeal: 20, jam: 10 },   // [45] BADLY_STARTLE_MONS_WITH_GOOD_APPEALS
  { effectType: CONTEST_EFFECT_TYPE_SPECIAL_APPEAL, appeal: 10, jam: 0 },  // [46] BETTER_WHEN_AUDIENCE_EXCITED
  { effectType: CONTEST_EFFECT_TYPE_WORSEN, appeal: 30, jam: 0 },          // [47] DONT_EXCITE_AUDIENCE
];

/** 1:1 `gComboStarterLookupTable[]` (src/data/contest_moves.h:3131). bool8[] : index 0 = FALSE,
 *  1..62 (COMBO_STARTER_*) = TRUE. Représenté en 0/1 (bool8) car aussi lu numériquement
 *  (`* 10` dans ContestEffect_MakeFollowingMonsNervous). */
const gComboStarterLookupTable: number[] = [
  0,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  1, 1,
];

// ═══ état INERTE — placeholders ZÉRO-INIT ═══
// INERTE : l'état vivra dans contest.ts au portage des Contests — shapes 1:1 include/contest.h.

function zeroContestantStatus(): ContestantStatus {
  return {
    baseAppeal: 0, appeal: 0, pointTotal: 0, currMove: 0, prevMove: 0, moveCategory: 0,
    ranking: 0, unused1: 0, moveRepeatCount: 0, noMoreTurns: false, nervous: false,
    numTurnsSkipped: 0, condition: 0, jam: 0, jamReduction: 0, resistant: false, immune: false,
    moreEasilyStartled: false, usedRepeatableMove: false, conditionMod: 0, turnOrderMod: 0,
    turnOrderModAction: 0, turnSkipped: false, exploded: false, overrideCategoryExcitementMod: false,
    appealTripleCondition: false, jamSafetyCount: 0, effectStringId: 0, effectStringId2: 0,
    repeatedMove: false, unused2: false, repeatedPrevMove: false, completedComboFlag: false,
    hasJudgesAttention: false, judgesAttentionWasRemoved: false, usedComboMove: false,
    completedCombo: false, comboAppealBonus: 0, repeatJam: 0, nextTurnOrder: 0, attentionLevel: 0,
    contestantAnimTarget: 0,
  };
}

/** INERTE : `eContestantStatus` (gContestResources->status) — 1:1 include/contest.h:301. */
const eContestantStatus: ContestantStatus[] = Array.from({ length: CONTESTANT_COUNT }, zeroContestantStatus);

/** INERTE : `eContestAppealResults` (*gContestResources->appealResults) — 1:1 include/contest.h:302. */
const eContestAppealResults: ContestAppealMoveResults = {
  turnOrder: [0, 0, 0, 0],
  jam: 0,
  jam2: 0,
  jamQueue: [0, 0, 0, 0, 0],
  unnervedPokes: [0, 0, 0, 0],
  contestant: 0,
};

/** INERTE : `eContest` (*gContestResources->contest) — 1:1 include/contest.h:300. */
const eContest: Contest = { appealNumber: 0, applauseLevel: 0 };

/** INERTE : `eContestExcitement` (*gContestResources->excitement) — 1:1 include/contest.h:304. */
const eContestExcitement: ContestExcitement = { moveExcitement: 0, frozen: false, freezer: 0, excitementAppealBonus: 0 };

/** INERTE : `EWRAM_DATA u8 gContestantTurnOrder[CONTESTANT_COUNT]` — 1:1 src/contest.c:345. */
const gContestantTurnOrder: number[] = [0, 0, 0, 0];

/** INERTE : forme numérique de `gContestMoves[]` (src/data/contest_moves.h). Vide tant que les
 *  Contests ne sont pas portés — la vraie table sera câblée dans contest.ts. */
const gContestMoves: ContestMove[] = [];

// ═══ fonctions de contest.c pas encore portées — placeholders INERTES (no-op) ═══
// INERTE : vivront dans contest.ts au portage des Contests ; signatures 1:1 include/contest.h.

/** INERTE : `void SetContestantEffectStringID(u8, u8)` — 1:1 include/contest.h:345. */
function SetContestantEffectStringID(contestant: number, effectStringId: number): void {}
/** INERTE : `void SetContestantEffectStringID2(u8, u8)` — 1:1 include/contest.h:346. */
function SetContestantEffectStringID2(contestant: number, effectStringId: number): void {}
/** INERTE : `void SetStartledString(u8, u8)` — 1:1 include/contest.h:347. */
function SetStartledString(contestant: number, jam: number): void {}
/** INERTE : `void MakeContestantNervous(u8)` — 1:1 include/contest.h:348. */
function MakeContestantNervous(p: number): void {}
/** INERTE : `bool8 Contest_IsMonsTurnDisabled(u8)` — 1:1 include/contest.h:342. */
function Contest_IsMonsTurnDisabled(contestant: number): boolean { return false; }
/** INERTE : `bool8 IsContestantAllowedToCombo(u8)` — 1:1 include/contest.h:350. */
function IsContestantAllowedToCombo(contestant: number): boolean { return false; }

/** 1:1 `bool8 AreMovesContestCombo(u16 lastMove, u16 nextMove)` (contest_effect.c:60-78). */
export function AreMovesContestCombo(lastMove: number, nextMove: number): boolean {
  const nextMoveComboMoves = new Uint8Array(4);
  let lastMoveComboStarterId = gContestMoves[lastMove].comboStarterId;
  nextMoveComboMoves[0] = gContestMoves[nextMove].comboMoves[0];
  nextMoveComboMoves[1] = gContestMoves[nextMove].comboMoves[1];
  nextMoveComboMoves[2] = gContestMoves[nextMove].comboMoves[2];
  nextMoveComboMoves[3] = gContestMoves[nextMove].comboMoves[3];
  if (lastMoveComboStarterId == 0)
    return false;
  else if (lastMoveComboStarterId == nextMoveComboMoves[0] || lastMoveComboStarterId == nextMoveComboMoves[1] || lastMoveComboStarterId == nextMoveComboMoves[2] || lastMoveComboStarterId == nextMoveComboMoves[3])
    return gComboStarterLookupTable[lastMoveComboStarterId] !== 0; // C: bool8 (u8 0/1) → boolean
  else
    return false;
}

// A highly appealing move.

/** 1:1 `static void ContestEffect_HighlyAppealing(void)` (contest_effect.c:81-83). */
function ContestEffect_HighlyAppealing(): void {
}

// After this move, the user is more easily startled.

/** 1:1 `static void ContestEffect_UserMoreEasilyStartled(void)` (contest_effect.c:86-90). */
function ContestEffect_UserMoreEasilyStartled(): void {
  eContestantStatus[eContestAppealResults.contestant].moreEasilyStartled = true;
  SetContestantEffectStringID(eContestAppealResults.contestant, CONTEST_STRING_MORE_CONSCIOUS);
}

// Makes a great appeal, but allows no more to the end.

/** 1:1 `static void ContestEffect_GreatAppealButNoMoreMoves(void)` (contest_effect.c:93-97). */
function ContestEffect_GreatAppealButNoMoreMoves(): void {
  eContestantStatus[eContestAppealResults.contestant].exploded = true;
  SetContestantEffectStringID(eContestAppealResults.contestant, CONTEST_STRING_NO_APPEAL);
}

// Can be used repeatedly without boring the JUDGE.

/** 1:1 `static void ContestEffect_RepetitionNotBoring(void)` (contest_effect.c:100-105). */
function ContestEffect_RepetitionNotBoring(): void {
  eContestantStatus[eContestAppealResults.contestant].usedRepeatableMove = true;
  eContestantStatus[eContestAppealResults.contestant].repeatedMove = false;
  eContestantStatus[eContestAppealResults.contestant].moveRepeatCount = 0;
}

// Can avoid being startled by others once.

/** 1:1 `static void ContestEffect_AvoidStartleOnce(void)` (contest_effect.c:108-112). */
function ContestEffect_AvoidStartleOnce(): void {
  eContestantStatus[eContestAppealResults.contestant].jamSafetyCount = 1;
  SetContestantEffectStringID(eContestAppealResults.contestant, CONTEST_STRING_SETTLE_DOWN);
}

// Can avoid being startled by others.

/** 1:1 `static void ContestEffect_AvoidStartle(void)` (contest_effect.c:115-119). */
function ContestEffect_AvoidStartle(): void {
  eContestantStatus[eContestAppealResults.contestant].immune = true;
  SetContestantEffectStringID(eContestAppealResults.contestant, CONTEST_STRING_OBLIVIOUS_TO_OTHERS);
}

// Can avoid being startled by others a little.

/** 1:1 `static void ContestEffect_AvoidStartleSlightly(void)` (contest_effect.c:122-126). */
function ContestEffect_AvoidStartleSlightly(): void {
  eContestantStatus[eContestAppealResults.contestant].jamReduction = 20;
  SetContestantEffectStringID(eContestAppealResults.contestant, CONTEST_STRING_LESS_AWARE);
}

// After this move, the user is less likely to be startled.

/** 1:1 `static void ContestEffect_UserLessEasilyStartled(void)` (contest_effect.c:129-133). */
function ContestEffect_UserLessEasilyStartled(): void {
  eContestantStatus[eContestAppealResults.contestant].resistant = true;
  SetContestantEffectStringID(eContestAppealResults.contestant, CONTEST_STRING_STOPPED_CARING);
}

// Slightly startles the POKéMON in front.

/** 1:1 `static void ContestEffect_StartleFrontMon(void)` (contest_effect.c:136-157). */
function ContestEffect_StartleFrontMon(): void {
  let idx = 0;
  let a = eContestAppealResults.contestant;
  if (eContestAppealResults.turnOrder[a] != 0)
  {
    let i = 0;
    for (i = 0; i < CONTESTANT_COUNT; i++)
    {
      if (eContestAppealResults.turnOrder[a] - 1 == eContestAppealResults.turnOrder[i])
        break;
    }
    eContestAppealResults.jamQueue[0] = i;
    eContestAppealResults.jamQueue[1] = CONTESTANT_NONE;
    idx = WasAtLeastOneOpponentJammed();
  }
  if (idx == 0)
    SetContestantEffectStringID2(eContestAppealResults.contestant, CONTEST_STRING_MESSED_UP2);
  SetContestantEffectStringID(eContestAppealResults.contestant, CONTEST_STRING_ATTEMPT_STARTLE);
}

// Slightly startles those that have made appeals.

/** 1:1 `static void ContestEffect_StartlePrevMons(void)` (contest_effect.c:160-181). */
function ContestEffect_StartlePrevMons(): void {
  let idx = 0;
  let contestant = eContestAppealResults.contestant;
  if (eContestAppealResults.turnOrder[contestant] != 0)
  {
    let i = 0;
    let j = 0;
    for ((i = 0, j = 0); i < CONTESTANT_COUNT; i++)
    {
      if (eContestAppealResults.turnOrder[contestant] > eContestAppealResults.turnOrder[i])
        eContestAppealResults.jamQueue[j++] = i;
    }
    eContestAppealResults.jamQueue[j] = CONTESTANT_NONE;
    idx = WasAtLeastOneOpponentJammed();
  }
  if (idx == 0)
    SetContestantEffectStringID2(eContestAppealResults.contestant, CONTEST_STRING_MESSED_UP2);
  SetContestantEffectStringID(eContestAppealResults.contestant, CONTEST_STRING_ATTEMPT_STARTLE);
}

// Startles the POKéMON that appealed before the user.

/** 1:1 `static void ContestEffect_StartlePrevMon2(void)` (contest_effect.c:184-198). */
function ContestEffect_StartlePrevMon2(): void {
  let rval = Random() % 10;
  let jam = 0;
  if (rval < 2)
    jam = 20;
  else if (rval < 8)
    jam = 40;
  else
    jam = 60;
  eContestAppealResults.jam = jam;
  ContestEffect_StartleFrontMon();
}

// Startles all POKéMON that appealed before the user.

/** 1:1 `static void ContestEffect_StartlePrevMons2(void)` (contest_effect.c:201-244). */
function ContestEffect_StartlePrevMons2(): void {
  let numStartled = 0;
  let contestant = eContestAppealResults.contestant;
  let turnOrder = eContestAppealResults.turnOrder[contestant];
  if (turnOrder != 0)
  {
    let i = 0;
    for (i = 0; i < 4; i++)
    {
      if (eContestAppealResults.turnOrder[contestant] > eContestAppealResults.turnOrder[i])
      {
        let rval = 0;
        let jam = 0;
        eContestAppealResults.jamQueue[0] = i;
        eContestAppealResults.jamQueue[1] = CONTESTANT_NONE;
        rval = Random() % 10;
        if (rval == 0)
          jam = 0;
        else if (rval <= 2)
          jam = 10;
        else if (rval <= 4)
          jam = 20;
        else if (rval <= 6)
          jam = 30;
        else if (rval <= 8)
          jam = 40;
        else
          jam = 60;
        eContestAppealResults.jam = jam;
        if (WasAtLeastOneOpponentJammed())
          numStartled++;
      }
    }
  }
  SetContestantEffectStringID(eContestAppealResults.contestant, CONTEST_STRING_ATTEMPT_STARTLE);
  if (numStartled == 0)
    SetContestantEffectStringID2(eContestAppealResults.contestant, CONTEST_STRING_MESSED_UP2);
}

// Shifts the JUDGE's attention from others.

/** 1:1 `static void ContestEffect_ShiftJudgeAttention(void)` (contest_effect.c:247-274). */
function ContestEffect_ShiftJudgeAttention(): void {
  let hitAny = false;
  let contestant = eContestAppealResults.contestant;
  if (eContestAppealResults.turnOrder[eContestAppealResults.contestant] != 0)
  {
    let i = 0;
    for (i = 0; i < 4; i++)
    {
      if (eContestAppealResults.turnOrder[contestant] > eContestAppealResults.turnOrder[i] && eContestantStatus[i].hasJudgesAttention && CanUnnerveContestant(i))
      {
        eContestantStatus[i].hasJudgesAttention = false;
        eContestantStatus[i].judgesAttentionWasRemoved = true;
        SetContestantEffectStringID(i, CONTEST_STRING_JUDGE_LOOK_AWAY2);
        hitAny = true;
      }
    }
  }
  SetContestantEffectStringID(eContestAppealResults.contestant, CONTEST_STRING_DAZZLE_ATTEMPT);
  if (!hitAny)
  {
    SetContestantEffectStringID2(eContestAppealResults.contestant, CONTEST_STRING_MESSED_UP2);
  }
}

// Startles the POKéMON that has the JUDGE's attention.

/** 1:1 `static void ContestEffect_StartleMonWithJudgesAttention(void)` (contest_effect.c:277-304). */
function ContestEffect_StartleMonWithJudgesAttention(): void {
  let numStartled = 0;
  let contestant = eContestAppealResults.contestant;
  if (eContestAppealResults.turnOrder[eContestAppealResults.contestant] != 0)
  {
    let i = 0;
    for (i = 0; i < 4; i++)
    {
      if (eContestAppealResults.turnOrder[contestant] > eContestAppealResults.turnOrder[i])
      {
        if (eContestantStatus[i].hasJudgesAttention)
          eContestAppealResults.jam = 50;
        else
          eContestAppealResults.jam = 10;
        eContestAppealResults.jamQueue[0] = i;
        eContestAppealResults.jamQueue[1] = CONTESTANT_NONE;
        if (WasAtLeastOneOpponentJammed())
          numStartled++;
      }
    }
  }
  SetContestantEffectStringID(eContestAppealResults.contestant, CONTEST_STRING_ATTEMPT_STARTLE);
  if (numStartled == 0)
    SetContestantEffectStringID2(eContestAppealResults.contestant, CONTEST_STRING_MESSED_UP2);
}

// Jams the others, and misses one turn of appeals.

/** 1:1 `static void ContestEffect_JamsOthersButMissOneTurn(void)` (contest_effect.c:307-312). */
function ContestEffect_JamsOthersButMissOneTurn(): void {
  eContestantStatus[eContestAppealResults.contestant].turnSkipped = true;
  ContestEffect_StartlePrevMons();
  SetContestantEffectStringID(eContestAppealResults.contestant, CONTEST_STRING_ATTEMPT_STARTLE);
}

// Startles POKéMON that made a same-type appeal.

/** 1:1 `static void ContestEffect_StartleMonsSameTypeAppeal(void)` (contest_effect.c:315-320). */
function ContestEffect_StartleMonsSameTypeAppeal(): void {
  let move = eContestantStatus[eContestAppealResults.contestant].currMove;
  JamByMoveCategory(gContestMoves[move].contestCategory);
  SetContestantEffectStringID(eContestAppealResults.contestant, CONTEST_STRING_ATTEMPT_STARTLE);
}

// Badly startles POKéMON that made COOL appeals.

/** 1:1 `static void ContestEffect_StartleMonsCoolAppeal(void)` (contest_effect.c:323-327). */
function ContestEffect_StartleMonsCoolAppeal(): void {
  JamByMoveCategory(CONTEST_CATEGORY_COOL);
  SetContestantEffectStringID(eContestAppealResults.contestant, CONTEST_STRING_ATTEMPT_STARTLE);
}

// Badly startles POKéMON that made BEAUTY appeals.

/** 1:1 `static void ContestEffect_StartleMonsBeautyAppeal(void)` (contest_effect.c:330-334). */
function ContestEffect_StartleMonsBeautyAppeal(): void {
  JamByMoveCategory(CONTEST_CATEGORY_BEAUTY);
  SetContestantEffectStringID(eContestAppealResults.contestant, CONTEST_STRING_ATTEMPT_STARTLE);
}

// Badly startles POKéMON that made CUTE appeals.

/** 1:1 `static void ContestEffect_StartleMonsCuteAppeal(void)` (contest_effect.c:337-341). */
function ContestEffect_StartleMonsCuteAppeal(): void {
  JamByMoveCategory(CONTEST_CATEGORY_CUTE);
  SetContestantEffectStringID(eContestAppealResults.contestant, CONTEST_STRING_ATTEMPT_STARTLE);
}

// Badly startles POKéMON that made SMART appeals.

/** 1:1 `static void ContestEffect_StartleMonsSmartAppeal(void)` (contest_effect.c:344-348). */
function ContestEffect_StartleMonsSmartAppeal(): void {
  JamByMoveCategory(CONTEST_CATEGORY_SMART);
  SetContestantEffectStringID(eContestAppealResults.contestant, CONTEST_STRING_ATTEMPT_STARTLE);
}

// Badly startles POKéMON that made TOUGH appeals.

/** 1:1 `static void ContestEffect_StartleMonsToughAppeal(void)` (contest_effect.c:351-355). */
function ContestEffect_StartleMonsToughAppeal(): void {
  JamByMoveCategory(CONTEST_CATEGORY_TOUGH);
  SetContestantEffectStringID(eContestAppealResults.contestant, CONTEST_STRING_ATTEMPT_STARTLE);
}

// Makes one POKéMON after the user nervous.

/** 1:1 `static void ContestEffect_MakeFollowingMonNervous(void)` (contest_effect.c:358-387). */
function ContestEffect_MakeFollowingMonNervous(): void {
  let hitAny = false;
  if (eContestAppealResults.turnOrder[eContestAppealResults.contestant] != 3)
  {
    let i = 0;
    for (i = 0; i < 4; i++)
    {
      if (eContestAppealResults.turnOrder[eContestAppealResults.contestant] + 1 == eContestAppealResults.turnOrder[i])
      {
        if (CanUnnerveContestant(i))
        {
          MakeContestantNervous(i);
          SetContestantEffectStringID(i, CONTEST_STRING_NERVOUS);
          hitAny = true;
        }
        else
        {
          SetContestantEffectStringID(i, CONTEST_STRING_UNAFFECTED);
          hitAny = true;
        }
      }
    }
  }
  SetContestantEffectStringID(eContestAppealResults.contestant, CONTEST_STRING_UNNERVE_ATTEMPT);
  if (!hitAny)
    SetContestantEffectStringID2(eContestAppealResults.contestant, CONTEST_STRING_MESSED_UP2);
}

// Makes all POKéMON after the user nervous.

/** 1:1 `static void ContestEffect_MakeFollowingMonsNervous(void)` (contest_effect.c:390-470). */
function ContestEffect_MakeFollowingMonsNervous(): void {
  let numUnnerved = 0;
  let contestantUnnerved = false;
  const contestantIds = new Uint8Array(5);
  let i = 0;
  let numAfter = 0;
  const oddsMod = new Int16Array(CONTESTANT_COUNT);
  const odds = new Int16Array(CONTESTANT_COUNT);
  contestantIds.fill(CONTESTANT_NONE, 0, contestantIds.length);
  for ((i = 0, numAfter = 0); i < CONTESTANT_COUNT; i++)
  {
    if (eContestAppealResults.turnOrder[eContestAppealResults.contestant] < eContestAppealResults.turnOrder[i] && !eContestantStatus[i].nervous && !Contest_IsMonsTurnDisabled(i))
      contestantIds[numAfter++] = i;
  }
  if (numAfter == 1)
  {
    odds[0] = 60;
  }
  else if (numAfter == 2)
  {
    odds[0] = 30;
    odds[1] = 30;
  }
  else if (numAfter == 3)
  {
    odds[0] = 20;
    odds[1] = 20;
    odds[2] = 20;
  }
  else
  {
    for (i = 0; i < CONTESTANT_COUNT; i++)
      odds[i] = 0;
  }
  for (i = 0; i < CONTESTANT_COUNT; i++)
  {
    if (eContestantStatus[i].hasJudgesAttention && IsContestantAllowedToCombo(i))
      oddsMod[i] = gComboStarterLookupTable[gContestMoves[eContestantStatus[i].prevMove].comboStarterId] * 10;
    else
      oddsMod[i] = 0;
    oddsMod[i] -= (Math.trunc(eContestantStatus[i].condition / 10)) * 10;
  }
  if (odds[0] != 0)
  {
    for (i = 0; contestantIds[i] != CONTESTANT_NONE; i++)
    {
      if (Random() % 100 < odds[i] + oddsMod[contestantIds[i]])
      {
        if (CanUnnerveContestant(contestantIds[i]))
        {
          MakeContestantNervous(contestantIds[i]);
          SetContestantEffectStringID(contestantIds[i], CONTEST_STRING_NERVOUS);
          numUnnerved++;
        }
        else
        {
          contestantUnnerved = true;
        }
      }
      else
      {
        contestantUnnerved = true;
      }
      if (contestantUnnerved)
      {
        contestantUnnerved = false;
        SetContestantEffectStringID(contestantIds[i], CONTEST_STRING_UNAFFECTED);
        numUnnerved++;
      }
      eContestAppealResults.unnervedPokes[contestantIds[i]] = 1;
    }
  }
  SetContestantEffectStringID(eContestAppealResults.contestant, CONTEST_STRING_UNNERVE_WAITING);
  if (numUnnerved == 0)
    SetContestantEffectStringID2(eContestAppealResults.contestant, CONTEST_STRING_MESSED_UP2);
}

// Worsens the condition of those that made appeals.

/** 1:1 `static void ContestEffect_WorsenConditionOfPrevMons(void)` (contest_effect.c:473-494). */
function ContestEffect_WorsenConditionOfPrevMons(): void {
  let numHit = 0;
  let i = 0;
  for (i = 0; i < CONTESTANT_COUNT; i++)
  {
    if (eContestAppealResults.turnOrder[eContestAppealResults.contestant] > eContestAppealResults.turnOrder[i] && eContestantStatus[i].condition > 0 && CanUnnerveContestant(i))
    {
      eContestantStatus[i].condition = 0;
      eContestantStatus[i].conditionMod = CONDITION_LOSE;
      SetContestantEffectStringID(i, CONTEST_STRING_REGAINED_FORM);
      numHit++;
    }
  }
  SetContestantEffectStringID(eContestAppealResults.contestant, CONTEST_STRING_TAUNT_WELL);
  if (numHit == 0)
    SetContestantEffectStringID2(eContestAppealResults.contestant, CONTEST_STRING_IGNORED);
}

// Badly startles POKéMON in good condition.

/** 1:1 `static void ContestEffect_BadlyStartlesMonsInGoodCondition(void)` (contest_effect.c:497-519). */
function ContestEffect_BadlyStartlesMonsInGoodCondition(): void {
  let numHit = 0;
  let i = 0;
  for (i = 0; i < CONTESTANT_COUNT; i++)
  {
    if (eContestAppealResults.turnOrder[eContestAppealResults.contestant] > eContestAppealResults.turnOrder[i])
    {
      if (eContestantStatus[i].condition > 0)
        eContestAppealResults.jam = 40;
      else
        eContestAppealResults.jam = 10;
      eContestAppealResults.jamQueue[0] = i;
      eContestAppealResults.jamQueue[1] = CONTESTANT_NONE;
      if (WasAtLeastOneOpponentJammed())
        numHit++;
    }
  }
  SetContestantEffectStringID(eContestAppealResults.contestant, CONTEST_STRING_JAM_WELL);
  if (numHit == 0)
    SetContestantEffectStringID2(eContestAppealResults.contestant, CONTEST_STRING_IGNORED);
}

// The appeal works great if performed first.

/** 1:1 `static void ContestEffect_BetterIfFirst(void)` (contest_effect.c:522-530). */
function ContestEffect_BetterIfFirst(): void {
  if (gContestantTurnOrder[eContestAppealResults.contestant] == 0)
  {
    let move = eContestantStatus[eContestAppealResults.contestant].currMove;
    eContestantStatus[eContestAppealResults.contestant].appeal += 2 * gContestEffects[gContestMoves[move].effect].appeal;
    SetContestantEffectStringID(eContestAppealResults.contestant, CONTEST_STRING_HUSTLE_STANDOUT);
  }
}

// The appeal works great if performed last.

/** 1:1 `static void ContestEffect_BetterIfLast(void)` (contest_effect.c:533-541). */
function ContestEffect_BetterIfLast(): void {
  if (gContestantTurnOrder[eContestAppealResults.contestant] == 3)
  {
    let move = eContestantStatus[eContestAppealResults.contestant].currMove;
    eContestantStatus[eContestAppealResults.contestant].appeal += 2 * gContestEffects[gContestMoves[move].effect].appeal;
    SetContestantEffectStringID(eContestAppealResults.contestant, CONTEST_STRING_WORK_HARD_UNNOTICED);
  }
}

// Makes the appeal as good as those before it.

/** 1:1 `static void ContestEffect_AppealAsGoodAsPrevOnes(void)` (contest_effect.c:544-567). */
function ContestEffect_AppealAsGoodAsPrevOnes(): void {
  let i = 0;
  let appealSum = 0;
  for ((i = 0, appealSum = 0); i < CONTESTANT_COUNT; i++)
  {
    if (eContestAppealResults.turnOrder[eContestAppealResults.contestant] > eContestAppealResults.turnOrder[i])
      appealSum += eContestantStatus[i].appeal;
  }
  if (appealSum < 0)
    appealSum = 0;
  if (eContestAppealResults.turnOrder[eContestAppealResults.contestant] == 0 || appealSum == 0)
  {
    SetContestantEffectStringID(eContestAppealResults.contestant, CONTEST_STRING_APPEAL_NOT_WELL);
  }
  else
  {
    eContestantStatus[eContestAppealResults.contestant].appeal += Math.trunc(appealSum / 2);
    SetContestantEffectStringID(eContestAppealResults.contestant, CONTEST_STRING_WORK_BEFORE);
  }
  eContestantStatus[eContestAppealResults.contestant].appeal = RoundTowardsZero(eContestantStatus[eContestAppealResults.contestant].appeal);
}

// Makes the appeal as good as the one before it.

/** 1:1 `static void ContestEffect_AppealAsGoodAsPrevOne(void)` (contest_effect.c:570-592). */
function ContestEffect_AppealAsGoodAsPrevOne(): void {
  let appeal = 0;
  if (eContestAppealResults.turnOrder[eContestAppealResults.contestant] != 0)
  {
    let i = 0;
    for (i = 0; i < CONTESTANT_COUNT; i++)
    {
      if (eContestAppealResults.turnOrder[eContestAppealResults.contestant] - 1 == eContestAppealResults.turnOrder[i])
        appeal = eContestantStatus[i].appeal;
    }
  }
  if (eContestAppealResults.turnOrder[eContestAppealResults.contestant] == 0 || appeal <= 0)
  {
    SetContestantEffectStringID(eContestAppealResults.contestant, CONTEST_STRING_APPEAL_NOT_WELL2);
  }
  else
  {
    eContestantStatus[eContestAppealResults.contestant].appeal += appeal;
    SetContestantEffectStringID(eContestAppealResults.contestant, CONTEST_STRING_WORK_PRECEDING);
  }
}

// The appeal works better the later it is performed.

/** 1:1 `static void ContestEffect_BetterWhenLater(void)` (contest_effect.c:595-610). */
function ContestEffect_BetterWhenLater(): void {
  let whichTurn = eContestAppealResults.turnOrder[eContestAppealResults.contestant];
  if (whichTurn == 0)
    eContestantStatus[eContestAppealResults.contestant].appeal = 10;
  else
    eContestantStatus[eContestAppealResults.contestant].appeal = 20 * whichTurn;
  if (whichTurn == 0)
    SetContestantEffectStringID(eContestAppealResults.contestant, CONTEST_STRING_APPEAL_NOT_SHOWN_WELL);
  else if (whichTurn == 1)
    SetContestantEffectStringID(eContestAppealResults.contestant, CONTEST_STRING_APPEAL_SLIGHTLY_WELL);
  else if (whichTurn == 2)
    SetContestantEffectStringID(eContestAppealResults.contestant, CONTEST_STRING_APPEAL_PRETTY_WELL);
  else
    SetContestantEffectStringID(eContestAppealResults.contestant, CONTEST_STRING_APPEAL_EXCELLENTLY);
}

// The appeal's quality varies depending on its timing.

/** 1:1 `static void ContestEffect_QualityDependsOnTiming(void)` (contest_effect.c:613-644). */
function ContestEffect_QualityDependsOnTiming(): void {
  let rval = Random() % 10;
  let appeal = 0;
  if (rval < 3)
  {
    appeal = 10;
    SetContestantEffectStringID(eContestAppealResults.contestant, CONTEST_STRING_APPEAL_NOT_VERY_WELL);
  }
  else if (rval < 6)
  {
    appeal = 20;
    SetContestantEffectStringID(eContestAppealResults.contestant, CONTEST_STRING_APPEAL_SLIGHTLY_WELL2);
  }
  else if (rval < 8)
  {
    appeal = 40;
    SetContestantEffectStringID(eContestAppealResults.contestant, CONTEST_STRING_APPEAL_PRETTY_WELL2);
  }
  else if (rval < 9)
  {
    appeal = 60;
    SetContestantEffectStringID(eContestAppealResults.contestant, CONTEST_STRING_APPEAL_VERY_WELL);
  }
  else
  {
    appeal = 80;
    SetContestantEffectStringID(eContestAppealResults.contestant, CONTEST_STRING_APPEAL_EXCELLENTLY2);
  }
  eContestantStatus[eContestAppealResults.contestant].appeal = appeal;
}

/** 1:1 `static void ContestEffect_BetterIfSameType(void)` (contest_effect.c:646-679). */
function ContestEffect_BetterIfSameType(): void {
  let turnOrder = eContestAppealResults.turnOrder[eContestAppealResults.contestant];
  let i = turnOrder - 1;
  let j = 0;
  let move = 0;
  if (turnOrder == 0)
    return;
  while (1)
  {
    for (j = 0; j < CONTESTANT_COUNT; j++)
    {
      if (eContestAppealResults.turnOrder[j] == i)
        break;
    }
    if (eContestantStatus[j].noMoreTurns || eContestantStatus[j].nervous || eContestantStatus[j].numTurnsSkipped)
    {
      if (--i < 0)
        return;
    }
    else
    {
      break;
    }
  }
  move = eContestantStatus[eContestAppealResults.contestant].currMove;
  if (gContestMoves[move].contestCategory == gContestMoves[eContestantStatus[j].currMove].contestCategory)
  {
    eContestantStatus[eContestAppealResults.contestant].appeal += gContestEffects[gContestMoves[move].effect].appeal * 2;
    SetContestantEffectStringID(eContestAppealResults.contestant, CONTEST_STRING_SAME_TYPE_GOOD);
  }
}

// Works well if different in type than the one before.

/** 1:1 `static void ContestEffect_BetterIfDiffType(void)` (contest_effect.c:682-700). */
function ContestEffect_BetterIfDiffType(): void {
  if (eContestAppealResults.turnOrder[eContestAppealResults.contestant] != 0)
  {
    let move = eContestantStatus[eContestAppealResults.contestant].currMove;
    let i = 0;
    for (i = 0; i < CONTESTANT_COUNT; i++)
    {
      if (eContestAppealResults.turnOrder[eContestAppealResults.contestant] - 1 == eContestAppealResults.turnOrder[i] && gContestMoves[move].contestCategory != gContestMoves[eContestantStatus[i].currMove].contestCategory)
      {
        eContestantStatus[eContestAppealResults.contestant].appeal += gContestEffects[gContestMoves[move].effect].appeal * 2;
        SetContestantEffectStringID(eContestAppealResults.contestant, CONTEST_STRING_DIFF_TYPE_GOOD);
        break;
      }
    }
  }
}

// Affected by how well the appeal in front goes.

/** 1:1 `static void ContestEffect_AffectedByPrevAppeal(void)` (contest_effect.c:703-726). */
function ContestEffect_AffectedByPrevAppeal(): void {
  if (eContestAppealResults.turnOrder[eContestAppealResults.contestant] != 0)
  {
    let i = 0;
    for (i = 0; i < CONTESTANT_COUNT; i++)
    {
      if (eContestAppealResults.turnOrder[eContestAppealResults.contestant] - 1 == eContestAppealResults.turnOrder[i])
      {
        if (eContestantStatus[eContestAppealResults.contestant].appeal > eContestantStatus[i].appeal)
        {
          eContestantStatus[eContestAppealResults.contestant].appeal *= 2;
          SetContestantEffectStringID(eContestAppealResults.contestant, CONTEST_STRING_STOOD_OUT_AS_MUCH);
        }
        else if (eContestantStatus[eContestAppealResults.contestant].appeal < eContestantStatus[i].appeal)
        {
          eContestantStatus[eContestAppealResults.contestant].appeal = 0;
          SetContestantEffectStringID(eContestAppealResults.contestant, CONTEST_STRING_NOT_AS_WELL);
        }
      }
    }
  }
}

// Ups the user's condition. Helps prevent nervousness.

/** 1:1 `static void ContestEffect_ImproveConditionPreventNervousness(void)` (contest_effect.c:729-741). */
function ContestEffect_ImproveConditionPreventNervousness(): void {
  if (eContestantStatus[eContestAppealResults.contestant].condition < 30)
  {
    eContestantStatus[eContestAppealResults.contestant].condition += 10;
    eContestantStatus[eContestAppealResults.contestant].conditionMod = CONDITION_GAIN;
    SetContestantEffectStringID(eContestAppealResults.contestant, CONTEST_STRING_CONDITION_ROSE);
  }
  else
  {
    SetContestantEffectStringID(eContestAppealResults.contestant, CONTEST_STRING_NO_CONDITION_IMPROVE);
  }
}

// The appeal works well if the user's condition is good.

/** 1:1 `static void ContestEffect_BetterWithGoodCondition(void)` (contest_effect.c:744-751). */
function ContestEffect_BetterWithGoodCondition(): void {
  eContestantStatus[eContestAppealResults.contestant].appealTripleCondition = true;
  if (eContestantStatus[eContestAppealResults.contestant].condition != 0)
    SetContestantEffectStringID(eContestAppealResults.contestant, CONTEST_STRING_HOT_STATUS);
  else
    SetContestantEffectStringID(eContestAppealResults.contestant, CONTEST_STRING_BAD_CONDITION_WEAK_APPEAL);
}

// The next appeal can be made earlier next turn.

/** 1:1 `static void ContestEffect_NextAppealEarlier(void)` (contest_effect.c:754-793). */
function ContestEffect_NextAppealEarlier(): void {
  let i = 0;
  let j = 0;
  const turnOrder = new Uint8Array(CONTESTANT_COUNT);
  if (eContest.appealNumber != CONTEST_LAST_APPEAL)
  {
    for (i = 0; i < CONTESTANT_COUNT; i++)
      turnOrder[i] = eContestantStatus[i].nextTurnOrder;
    turnOrder[eContestAppealResults.contestant] = CONTESTANT_NONE;
    for (i = 0; i < CONTESTANT_COUNT; i++)
    {
      for (j = 0; j < CONTESTANT_COUNT; j++)
      {
        if (j != eContestAppealResults.contestant && i == turnOrder[j] && turnOrder[j] == eContestantStatus[j].nextTurnOrder)
        {
          turnOrder[j]++;
          break;
        }
      }
      if (j == CONTESTANT_COUNT)
        break;
    }
    turnOrder[eContestAppealResults.contestant] = 0;
    eContestantStatus[eContestAppealResults.contestant].turnOrderMod = 1;
    for (i = 0; i < CONTESTANT_COUNT; i++)
    {
      eContestantStatus[i].nextTurnOrder = turnOrder[i];
    }
    eContestantStatus[eContestAppealResults.contestant].turnOrderModAction = 1;
    SetContestantEffectStringID(eContestAppealResults.contestant, CONTEST_STRING_MOVE_UP_LINE);
  }
}

// The next appeal can be made later next turn.

/** 1:1 `static void ContestEffect_NextAppealLater(void)` (contest_effect.c:796-835). */
function ContestEffect_NextAppealLater(): void {
  let i = 0;
  let j = 0;
  const turnOrder = new Uint8Array(CONTESTANT_COUNT);
  if (eContest.appealNumber != CONTEST_LAST_APPEAL)
  {
    for (i = 0; i < CONTESTANT_COUNT; i++)
      turnOrder[i] = eContestantStatus[i].nextTurnOrder;
    turnOrder[eContestAppealResults.contestant] = CONTESTANT_NONE;
    for (i = CONTESTANT_COUNT - 1; i > -1; i--)
    {
      for (j = 0; j < CONTESTANT_COUNT; j++)
      {
        if (j != eContestAppealResults.contestant && i == turnOrder[j] && turnOrder[j] == eContestantStatus[j].nextTurnOrder)
        {
          turnOrder[j]--;
          break;
        }
      }
      if (j == CONTESTANT_COUNT)
        break;
    }
    turnOrder[eContestAppealResults.contestant] = CONTESTANT_COUNT - 1;
    eContestantStatus[eContestAppealResults.contestant].turnOrderMod = 1;
    for (i = 0; i < CONTESTANT_COUNT; i++)
    {
      eContestantStatus[i].nextTurnOrder = turnOrder[i];
    }
    eContestantStatus[eContestAppealResults.contestant].turnOrderModAction = 2;
    SetContestantEffectStringID(eContestAppealResults.contestant, CONTEST_STRING_MOVE_BACK_LINE);
  }
}

// Makes the next turn's order more easily scrambled.

/** 1:1 `static void ContestEffect_MakeScramblingTurnOrderEasier(void)` (contest_effect.c:838-841). */
function ContestEffect_MakeScramblingTurnOrderEasier(): void {
  // dummied out?
}

// Scrambles the order of appeals on the next turn.

/** 1:1 `static void ContestEffect_ScrambleNextTurnOrder(void)` (contest_effect.c:844-889). */
function ContestEffect_ScrambleNextTurnOrder(): void {
  let i = 0;
  let j = 0;
  const turnOrder = new Uint8Array(CONTESTANT_COUNT);
  const unselectedContestants = new Uint8Array(CONTESTANT_COUNT);
  if (eContest.appealNumber != CONTEST_LAST_APPEAL)
  {
    for (i = 0; i < CONTESTANT_COUNT; i++)
    {
      turnOrder[i] = eContestantStatus[i].nextTurnOrder;
      unselectedContestants[i] = i;
    }
    for (i = 0; i < CONTESTANT_COUNT; i++)
    {
      let rval = Random() % (CONTESTANT_COUNT - i);
      for (j = 0; j < CONTESTANT_COUNT; j++)
      {
        if (unselectedContestants[j] != CONTESTANT_NONE)
        {
          if (rval == 0)
          {
            turnOrder[j] = i;
            unselectedContestants[j] = CONTESTANT_NONE;
            break;
          }
          else
          {
            rval--;
          }
        }
      }
    }
    for (i = 0; i < CONTESTANT_COUNT; i++)
    {
      eContestantStatus[i].nextTurnOrder = turnOrder[i];
      eContestantStatus[i].turnOrderMod = 2;
    }
    eContestantStatus[eContestAppealResults.contestant].turnOrderModAction = 3;
    SetContestantEffectStringID(eContestAppealResults.contestant, CONTEST_STRING_SCRAMBLE_ORDER);
  }
}

// An appeal that excites the audience in any CONTEST.

/** 1:1 `static void ContestEffect_ExciteAudienceInAnyContest(void)` (contest_effect.c:892-898). */
function ContestEffect_ExciteAudienceInAnyContest(): void {
  if (gContestMoves[eContestantStatus[eContestAppealResults.contestant].currMove].contestCategory != VarGet(0x8011) /* gSpecialVar_ContestCategory */)
  {
    eContestantStatus[eContestAppealResults.contestant].overrideCategoryExcitementMod = true;
  }
}

// Badly startles all POKéMON that made good appeals.

/** 1:1 `static void ContestEffect_BadlyStartleMonsWithGoodAppeals(void)` (contest_effect.c:901-928). */
function ContestEffect_BadlyStartleMonsWithGoodAppeals(): void {
  let i = 0;
  let numJammed = 0;
  for (i = 0; i < CONTESTANT_COUNT; i++)
  {
    if (eContestAppealResults.turnOrder[eContestAppealResults.contestant] > eContestAppealResults.turnOrder[i])
    {
      if (eContestantStatus[i].appeal > 0)
      {
        eContestAppealResults.jam = Math.trunc(eContestantStatus[i].appeal / 2);
        eContestAppealResults.jam = RoundUp(eContestAppealResults.jam);
      }
      else
      {
        eContestAppealResults.jam = 10;
      }
      eContestAppealResults.jamQueue[0] = i;
      eContestAppealResults.jamQueue[1] = CONTESTANT_NONE;
      if (WasAtLeastOneOpponentJammed())
        numJammed++;
    }
  }
  if (numJammed == 0)
    SetContestantEffectStringID2(eContestAppealResults.contestant, CONTEST_STRING_MESSED_UP2);
  SetContestantEffectStringID(eContestAppealResults.contestant, CONTEST_STRING_ATTEMPT_STARTLE);
}

// The appeal works best the more the crowd is excited.

/** 1:1 `static void ContestEffect_BetterWhenAudienceExcited(void)` (contest_effect.c:931-961). */
function ContestEffect_BetterWhenAudienceExcited(): void {
  let appeal = 0;
  if (eContest.applauseLevel == 0)
  {
    appeal = 10;
    SetContestantEffectStringID(eContestAppealResults.contestant, CONTEST_STRING_APPEAL_NOT_VERY_WELL);
  }
  else if (eContest.applauseLevel == 1)
  {
    appeal = 20;
    SetContestantEffectStringID(eContestAppealResults.contestant, CONTEST_STRING_APPEAL_SLIGHTLY_WELL2);
  }
  else if (eContest.applauseLevel == 2)
  {
    appeal = 30;
    SetContestantEffectStringID(eContestAppealResults.contestant, CONTEST_STRING_APPEAL_PRETTY_WELL2);
  }
  else if (eContest.applauseLevel == 3)
  {
    appeal = 50;
    SetContestantEffectStringID(eContestAppealResults.contestant, CONTEST_STRING_APPEAL_VERY_WELL);
  }
  else
  {
    appeal = 60;
    SetContestantEffectStringID(eContestAppealResults.contestant, CONTEST_STRING_APPEAL_EXCELLENTLY2);
  }
  eContestantStatus[eContestAppealResults.contestant].appeal = appeal;
}

// Temporarily stops the crowd from growing excited.

/** 1:1 `static void ContestEffect_DontExciteAudience(void)` (contest_effect.c:964-972). */
function ContestEffect_DontExciteAudience(): void {
  if (!eContestExcitement.frozen)
  {
    eContestExcitement.frozen = true;
    eContestExcitement.freezer = eContestAppealResults.contestant;
    SetContestantEffectStringID(eContestAppealResults.contestant, CONTEST_STRING_ATTRACTED_ATTENTION);
  }
}

/** 1:1 `static void JamByMoveCategory(u8 category)` (contest_effect.c:974-996). */
function JamByMoveCategory(category: number): void {
  let i = 0;
  let numJammed = 0;
  for (i = 0; i < CONTESTANT_COUNT; i++)
  {
    if (eContestAppealResults.turnOrder[eContestAppealResults.contestant] > eContestAppealResults.turnOrder[i])
    {
      if (category == gContestMoves[eContestantStatus[i].currMove].contestCategory)
        eContestAppealResults.jam = 40;
      else
        eContestAppealResults.jam = 10;
      eContestAppealResults.jamQueue[0] = i;
      eContestAppealResults.jamQueue[1] = CONTESTANT_NONE;
      if (WasAtLeastOneOpponentJammed())
        numJammed++;
    }
  }
  if (numJammed == 0)
    SetContestantEffectStringID2(eContestAppealResults.contestant, CONTEST_STRING_MESSED_UP2);
}

/** 1:1 `static bool8 CanUnnerveContestant(u8 i)` (contest_effect.c:998-1020). */
function CanUnnerveContestant(i: number): boolean {
  eContestAppealResults.unnervedPokes[i] = 1;
  if (eContestantStatus[i].immune)
  {
    SetContestantEffectStringID(i, CONTEST_STRING_AVOID_SEEING);
    return false;
  }
  else if (eContestantStatus[i].jamSafetyCount != 0)
  {
    eContestantStatus[i].jamSafetyCount--;
    SetContestantEffectStringID(i, CONTEST_STRING_AVERT_GAZE);
    return false;
  }
  else if (!eContestantStatus[i].noMoreTurns && eContestantStatus[i].numTurnsSkipped == 0)
  {
    return true;
  }
  else
  {
    return false;
  }
}

/** 1:1 `static bool8 WasAtLeastOneOpponentJammed(void)` (contest_effect.c:1022-1064).
 *  bool8 → `number` (u8) : le résultat est stocké dans le `u8 idx` de ContestEffect_StartleFrontMon
 *  /StartlePrevMons (`idx = WasAtLeastOneOpponentJammed()`) autant que testé en booléen. */
function WasAtLeastOneOpponentJammed(): number {
  const jamBuffer = new Int16Array(CONTESTANT_COUNT); // 1:1 `s16 jamBuffer[CONTESTANT_COUNT] = {0}` (le transpileur avait émis un tableau à 1 élément)
  let i = 0;
  for (i = 0; eContestAppealResults.jamQueue[i] != CONTESTANT_NONE; i++)
  {
    let contestant = eContestAppealResults.jamQueue[i];
    if (CanUnnerveContestant(contestant))
    {
      eContestAppealResults.jam2 = eContestAppealResults.jam;
      if (eContestantStatus[contestant].moreEasilyStartled)
        eContestAppealResults.jam2 *= 2;
      if (eContestantStatus[contestant].resistant)
      {
        eContestAppealResults.jam2 = 10;
        SetContestantEffectStringID(contestant, CONTEST_STRING_LITTLE_DISTRACTED);
      }
      else
      {
        eContestAppealResults.jam2 -= eContestantStatus[contestant].jamReduction;
        if (eContestAppealResults.jam2 <= 0)
        {
          eContestAppealResults.jam2 = 0;
          SetContestantEffectStringID(contestant, CONTEST_STRING_NOT_FAZED);
        }
        else
        {
          JamContestant(contestant, eContestAppealResults.jam2);
          SetStartledString(contestant, eContestAppealResults.jam2);
          jamBuffer[contestant] = eContestAppealResults.jam2;
        }
      }
    }
  }
  for (i = 0; i < CONTESTANT_COUNT; i++)
  {
    if (jamBuffer[i] != 0)
      return 1; // TRUE
  }
  return 0; // FALSE
}

/** 1:1 `static void JamContestant(u8 i, u8 jam)` (contest_effect.c:1066-1070). */
function JamContestant(i: number, jam: number): void {
  eContestantStatus[i].appeal -= jam;
  eContestantStatus[i].jam += jam;
}

/** 1:1 `static s16 RoundTowardsZero(s16 score)` (contest_effect.c:1072-1085). */
function RoundTowardsZero(score: number): number {
  let absScore = abs(score) % 10;
  if (score < 0)
  {
    if (absScore != 0)
      score -= 10 - absScore;
  }
  else
  {
    score -= absScore;
  }
  return score;
}

/** 1:1 `static s16 RoundUp(s16 score)` (contest_effect.c:1087-1093). */
function RoundUp(score: number): number {
  let absScore = abs(score) % 10;
  if (absScore != 0)
    score += 10 - absScore;
  return score;
}

/** 1:1 `void (*const gContestEffectFuncs[])(void)` (src/data/contest_moves.h:3198), indexé
 *  CONTEST_EFFECT_* (0-47). `extern` dans contest.c (`gContestEffectFuncs[effect]()`) — exporté
 *  pour le futur câblage du moteur de Contests. Certaines entrées réutilisent la même fonction. */
export const gContestEffectFuncs: ReadonlyArray<() => void> = [
  ContestEffect_HighlyAppealing,               // [0]
  ContestEffect_UserMoreEasilyStartled,        // [1]
  ContestEffect_GreatAppealButNoMoreMoves,     // [2]
  ContestEffect_RepetitionNotBoring,           // [3]
  ContestEffect_AvoidStartleOnce,              // [4]
  ContestEffect_AvoidStartle,                  // [5]
  ContestEffect_AvoidStartleSlightly,          // [6]
  ContestEffect_UserLessEasilyStartled,        // [7]
  ContestEffect_StartleFrontMon,               // [8]
  ContestEffect_StartlePrevMons,               // [9]
  ContestEffect_StartleFrontMon,               // [10]
  ContestEffect_StartlePrevMons,               // [11]
  ContestEffect_StartleFrontMon,               // [12]
  ContestEffect_StartlePrevMons,               // [13]
  ContestEffect_StartlePrevMon2,               // [14]
  ContestEffect_StartlePrevMons2,              // [15]
  ContestEffect_ShiftJudgeAttention,           // [16]
  ContestEffect_StartleMonWithJudgesAttention, // [17]
  ContestEffect_JamsOthersButMissOneTurn,      // [18]
  ContestEffect_StartleMonsSameTypeAppeal,     // [19]
  ContestEffect_StartleMonsCoolAppeal,         // [20]
  ContestEffect_StartleMonsBeautyAppeal,       // [21]
  ContestEffect_StartleMonsCuteAppeal,         // [22]
  ContestEffect_StartleMonsSmartAppeal,        // [23]
  ContestEffect_StartleMonsToughAppeal,        // [24]
  ContestEffect_MakeFollowingMonNervous,       // [25]
  ContestEffect_MakeFollowingMonsNervous,      // [26]
  ContestEffect_WorsenConditionOfPrevMons,     // [27]
  ContestEffect_BadlyStartlesMonsInGoodCondition, // [28]
  ContestEffect_BetterIfFirst,                 // [29]
  ContestEffect_BetterIfLast,                  // [30]
  ContestEffect_AppealAsGoodAsPrevOnes,        // [31]
  ContestEffect_AppealAsGoodAsPrevOne,         // [32]
  ContestEffect_BetterWhenLater,               // [33]
  ContestEffect_QualityDependsOnTiming,        // [34]
  ContestEffect_BetterIfSameType,              // [35]
  ContestEffect_BetterIfDiffType,              // [36]
  ContestEffect_AffectedByPrevAppeal,          // [37]
  ContestEffect_ImproveConditionPreventNervousness, // [38]
  ContestEffect_BetterWithGoodCondition,       // [39]
  ContestEffect_NextAppealEarlier,             // [40]
  ContestEffect_NextAppealLater,               // [41]
  ContestEffect_MakeScramblingTurnOrderEasier, // [42]
  ContestEffect_ScrambleNextTurnOrder,         // [43]
  ContestEffect_ExciteAudienceInAnyContest,    // [44]
  ContestEffect_BadlyStartleMonsWithGoodAppeals, // [45]
  ContestEffect_BetterWhenAudienceExcited,     // [46]
  ContestEffect_DontExciteAudience,            // [47]
];
