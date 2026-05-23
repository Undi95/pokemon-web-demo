// ============================================================================
// easy-chat-init.ts
//
// 1:1 STRICT port of src/easy_chat.c lines 1-1500 from pokeemerald-fr decomp.
// Scope :
//   - Structs (EasyChatScreen, EasyChatScreenControl, EasyChatScreenWordData,
//     EasyChatScreenTemplate, EasyChatPhraseFrameDimensions, etc.) reused
//     from ./easy-chat-render where already exported.
//   - EWRAM_DATA globals (sEasyChatScreen, sScreenControl, sWordData).
//   - All forward declarations (lines 40-228) declared as TS-level stubs or
//     forwarded to functions provided by later-line ports (deferred).
//   - All data tables (sEasyChatScreenTemplates, sBgTemplates, sWindowTemplates,
//     sFooterOptionXOffsets, sPhraseFrameDimensions, etc.).
//   - DoEasyChatScreen (l.1294), CB2_EasyChatScreen, VBlankCB_EasyChatScreen,
//     StartEasyChatScreen, Task_InitEasyChatScreen, Task_EasyChatScreen,
//     InitEasyChatScreen, ExitEasyChatScreen, ShowEasyChatScreen prologue
//     (l.1456-1500 partial — switch left intentionally incomplete since the
//     statement spans past line 1500).
//
// STRICT LIMIT : nothing past line 1500 of easy_chat.c is ported here.
// Cross-scope references (InitEasyChatScreenStruct l.1637, InitEasyChatScreenControl
// l.3015, InitEasyChatScreenWordData l.5598, GetEasyChatScreenFrameId l.2687,
// HandleEasyChatInput, StartEasyChatFunction, RunEasyChatFunction, IsFuncIdForQuizLadyScreen,
// EnterQuizLadyScreen, GetQuizTitle, ClearUnusedField, GetEachChatScreenTemplateId,
// FreeEasyChatScreenStruct/Control/WordData, LoadEasyChatScreen, DoQuiz*EasyChatScreen)
// are declared as in-file STUB with explicit `console.warn` + line range comment
// for the agent that will port the remainder.
// ============================================================================

import {
  // structs (matching decomp easy_chat.h)
  type EasyChatScreen,
  type EasyChatScreenControl,
  type EasyChatScreenWordData,
  type EasyChatPhraseFrameDimensions,
  // ECFUNC_/MSG_/INPUT_ enums already exported by render
  ECFUNC_NONE,
  ECFUNC_EXIT,
  ECFUNC_QUIZ_ANSWER,
  ECFUNC_QUIZ_QUESTION,
  ECFUNC_SET_QUIZ_ANSWER,
  ECFUNC_SET_QUIZ_QUESTION,
} from './easy-chat-render';

// ----------------------------------------------------------------------------
// Deferred symbol declarations
// ----------------------------------------------------------------------------
// These globals/helpers belong to other decomp modules and are not part of
// the 1-1500 scope. They are declared with permissive typings; concrete
// runtime bindings come from decomp-bridge / save-block-state at module load.

declare const globalThis: any;

// Cross-module helpers (provided by decomp-bridge / task / palette / sprite /
// sound / overworld / window modules). Resolved at runtime via globalThis to
// avoid creating a static dependency on decomp-data/auto.
function _g<T = any>(name: string): T {
  return (globalThis as any)[name] as T;
}

// Type aliases that mirror decomp types
type MainCallback = (() => void) | null;
type TaskFunc = (taskId: number) => void;

// ----------------------------------------------------------------------------
// EWRAM_DATA globals (easy_chat.c:36-38)
// ----------------------------------------------------------------------------
// static EWRAM_DATA struct EasyChatScreen *sEasyChatScreen = NULL;
// static EWRAM_DATA struct EasyChatScreenControl *sScreenControl = NULL;
// static EWRAM_DATA struct EasyChatScreenWordData *sWordData = NULL;
export let sEasyChatScreen: EasyChatScreen | null = null;
export let sScreenControl: EasyChatScreenControl | null = null;
export let sWordData: EasyChatScreenWordData | null = null;

export function _setSEasyChatScreen(v: EasyChatScreen | null): void { sEasyChatScreen = v; }
export function _setSScreenControl(v: EasyChatScreenControl | null): void { sScreenControl = v; }
export function _setSWordData(v: EasyChatScreenWordData | null): void { sWordData = v; }

// ----------------------------------------------------------------------------
// Forward declarations (easy_chat.c:40-228)
// ----------------------------------------------------------------------------
// In C, these are static forward decls so subsequent code can reference them.
// In TS the corresponding functions live either in this file or in other
// easy-chat-*.ts files. The deferred ones below are STUBs that warn at call.

// Defined later in this file:
//   Task_InitEasyChatScreen, CB2_EasyChatScreen, InitEasyChatScreen,
//   Task_EasyChatScreen, ExitEasyChatScreen, StartEasyChatScreen,
//   VBlankCB_EasyChatScreen

// Deferred (1:1 TODO : port lines 1500+ easy_chat.c, separate agent):
function IsFuncIdForQuizLadyScreen(funcId: number): boolean {
  // 1:1 strict : iterate sQuizLadyEasyChatScreens to match funcId
  for (let i = 0; i < sQuizLadyEasyChatScreens.length; i++) {
    if (sQuizLadyEasyChatScreens[i].funcId === funcId) return true;
  }
  return false;
}

function EnterQuizLadyScreen(funcId: number): void {
  // 1:1 strict : look up the matching callback in sQuizLadyEasyChatScreens
  // and switch to it via SetMainCallback2 (decomp behaviour).
  for (let i = 0; i < sQuizLadyEasyChatScreens.length; i++) {
    if (sQuizLadyEasyChatScreens[i].funcId === funcId) {
      const SetMainCallback2 = _g<(cb: MainCallback) => void>('SetMainCallback2');
      if (SetMainCallback2) SetMainCallback2(sQuizLadyEasyChatScreens[i].callback);
      return;
    }
  }
}

function InitEasyChatScreenStruct(_type: number, _words: Uint16Array | null, _displayedPersonType: number): boolean {
  // 1:1 TODO : port lines 1637-2685 easy_chat.c (separate agent)
  console.warn('[easy-chat-init] InitEasyChatScreenStruct STUB — port lines 1637-2685 easy_chat.c (separate agent)');
  return true;
}

function InitEasyChatScreenControl(): boolean {
  // 1:1 TODO : port lines 3015-3893 easy_chat.c (separate agent)
  console.warn('[easy-chat-init] InitEasyChatScreenControl STUB — port lines 3015-3893 easy_chat.c (separate agent)');
  return true;
}

function InitEasyChatScreenWordData(): boolean {
  // 1:1 TODO : port lines 5598-5685 easy_chat.c (separate agent)
  console.warn('[easy-chat-init] InitEasyChatScreenWordData STUB — port lines 5598-5685 easy_chat.c (separate agent)');
  return true;
}

function LoadEasyChatScreen(): boolean {
  // 1:1 TODO : port lines ~3700-3800 easy_chat.c (separate agent)
  console.warn('[easy-chat-init] LoadEasyChatScreen STUB — port lines ~3700-3800 easy_chat.c (separate agent)');
  return false;
}

function FreeEasyChatScreenStruct(): void {
  // 1:1 strict : free sEasyChatScreen (TRY_FREE_AND_SET_NULL in decomp)
  sEasyChatScreen = null;
}

function FreeEasyChatScreenControl(): void {
  // 1:1 strict : free sScreenControl (TRY_FREE_AND_SET_NULL in decomp)
  sScreenControl = null;
}

function FreeEasyChatScreenWordData(): void {
  // 1:1 strict : free sWordData (TRY_FREE_AND_SET_NULL in decomp)
  sWordData = null;
}

function HandleEasyChatInput(): number {
  // 1:1 TODO : port lines ~1900-2100 easy_chat.c (separate agent)
  console.warn('[easy-chat-init] HandleEasyChatInput STUB — port lines ~1900-2100 easy_chat.c (separate agent)');
  return ECFUNC_NONE;
}

function StartEasyChatFunction(_funcId: number): void {
  // 1:1 TODO : port lines ~3200-3400 easy_chat.c (separate agent)
  console.warn('[easy-chat-init] StartEasyChatFunction STUB — port lines ~3200-3400 easy_chat.c (separate agent)');
}

function RunEasyChatFunction(): boolean {
  // 1:1 TODO : port lines ~3400-3500 easy_chat.c (separate agent)
  console.warn('[easy-chat-init] RunEasyChatFunction STUB — port lines ~3400-3500 easy_chat.c (separate agent)');
  return false;
}

function DoQuizAnswerEasyChatScreen(): void {
  // 1:1 TODO : port lines ~6800+ easy_chat.c (separate agent)
  console.warn('[easy-chat-init] DoQuizAnswerEasyChatScreen STUB — port lines ~6800+ easy_chat.c (separate agent)');
}
function DoQuizQuestionEasyChatScreen(): void {
  console.warn('[easy-chat-init] DoQuizQuestionEasyChatScreen STUB — port lines ~6800+ easy_chat.c (separate agent)');
}
function DoQuizSetAnswerEasyChatScreen(): void {
  console.warn('[easy-chat-init] DoQuizSetAnswerEasyChatScreen STUB — port lines ~6800+ easy_chat.c (separate agent)');
}
function DoQuizSetQuestionEasyChatScreen(): void {
  console.warn('[easy-chat-init] DoQuizSetQuestionEasyChatScreen STUB — port lines ~6800+ easy_chat.c (separate agent)');
}

// ----------------------------------------------------------------------------
// PALTAG_ / GFXTAG_ enums (easy_chat.c:229-244)
// ----------------------------------------------------------------------------
const PALTAG_TRIANGLE_CURSOR    = 0;
const PALTAG_RECTANGLE_CURSOR   = 1;
const PALTAG_MISC_UI            = 2;
const PALTAG_RS_INTERVIEW_FRAME = 3;

const GFXTAG_TRIANGLE_CURSOR      = 0;
const GFXTAG_RECTANGLE_CURSOR     = 1;
const GFXTAG_SCROLL_INDICATOR     = 2;
const GFXTAG_START_SELECT_BUTTONS = 3;
const GFXTAG_MODE_WINDOW          = 4;
const GFXTAG_RS_INTERVIEW_FRAME   = 5;
const GFXTAG_BUTTON_WINDOW        = 6;

// INPUTSTATE_ enum (easy_chat.c:249-261)
const INPUTSTATE_PHRASE                = 0;
const INPUTSTATE_MAIN_SCREEN_BUTTONS   = 1;
const INPUTSTATE_KEYBOARD              = 2;
const INPUTSTATE_WORD_SELECT           = 3;
const INPUTSTATE_EXIT_PROMPT           = 4;
const INPUTSTATE_DELETE_ALL_YES_NO     = 5;
const INPUTSTATE_CONFIRM_WORDS_YES_NO  = 6;
const INPUTSTATE_QUIZ_QUESTION         = 7;
const INPUTSTATE_WAIT_FOR_MSG          = 8;
const INPUTSTATE_START_CONFIRM_LYRICS  = 9;
const INPUTSTATE_CONFIRM_LYRICS_YES_NO = 10;

// MAINSTATE_ enum (easy_chat.c:264-271)
const MAINSTATE_FADE_IN       = 0;
const MAINSTATE_HANDLE_INPUT  = 1;
const MAINSTATE_RUN_FUNC      = 2;
const MAINSTATE_TO_QUIZ_LADY  = 3;
const MAINSTATE_EXIT          = 4;
const MAINSTATE_WAIT_FADE_IN  = 5;

// MSG_ enum already exported by easy-chat-render (lines 238-247) — not re-declared.
// ECFUNC_ enum already exported by easy-chat-render (lines 250-284) — not re-declared.

// TEXT_ enum (easy_chat.c:329-333)
const TEXT_GROUPS      = 0;
const TEXT_ALPHABET    = 1;
const TEXT_WORD_SELECT = 2;

// Sizing constants (easy_chat.c:335-342)
const NUM_ALPHABET_ROWS    = 4;
const NUM_GROUP_NAME_ROWS  = 4;
const NUM_WORD_SELECT_ROWS = 4;
const NUM_BUTTON_ROWS      = 3;

const NUM_ALPHABET_COLUMNS    = 7;
const NUM_GROUP_NAME_COLUMNS  = 2;
const NUM_WORD_SELECT_COLUMNS = 2;

// FRAMEID_ enum (easy_chat.c:344-354)
const FRAMEID_GENERAL_2x2           = 0;
const FRAMEID_GENERAL_2x3           = 1;
const FRAMEID_MAIL                  = 2;
const FRAMEID_COMBINE_TWO_WORDS     = 3;
const FRAMEID_INTERVIEW_SHOW_PERSON = 4;
const FRAMEID_INTERVIEW             = 5;
const FRAMEID_QUIZ_ANSWER           = 6;
const FRAMEID_QUIZ_QUESTION         = 7;
const FRAMEID_QUIZ_SET_QUESTION     = 8;

// FOOTER_ enum (easy_chat.c:357-362)
const FOOTER_NORMAL    = 0;
const FOOTER_QUIZ      = 1;
const FOOTER_ANSWER    = 2;
const NUM_FOOTER_TYPES = 3;

// INPUT_ enum already exported by easy-chat-render.

// WINANIM_ enum (easy_chat.c:374-382)
const WINANIM_OPEN_KEYBOARD       = 0;
const WINANIM_CLOSE_KEYBOARD      = 1;
const WINANIM_OPEN_WORD_SELECT    = 2;
const WINANIM_CLOSE_WORD_SELECT   = 3;
const WINANIM_RETURN_TO_KEYBOARD  = 4;
const WINANIM_KEYBOARD_SWITCH_OUT = 5;
const WINANIM_KEYBOARD_SWITCH_IN  = 6;

// WIN_ enum (easy_chat.c:385-389)
const WIN_TITLE        = 0;
const WIN_MSG          = 1;
const WIN_INPUT_SELECT = 2;

// Tilemap frame offsets (easy_chat.c:392-403)
const FRAME_OFFSET_ORANGE         = 0x1000;
const FRAME_OFFSET_GREEN          = 0x4000;
const FRAME_TILE_TRANSPARENT      = 0x0;
const FRAME_TILE_TOP_L_CORNER     = 0x1;
const FRAME_TILE_TOP_EDGE         = 0x2;
const FRAME_TILE_TOP_R_CORNER     = 0x3;
const FRAME_TILE_L_EDGE           = 0x5;
const FRAME_TILE_R_EDGE           = 0x7;
const FRAME_TILE_BOTTOM_L_CORNER  = 0x9;
const FRAME_TILE_BOTTOM_EDGE      = 0xA;
const FRAME_TILE_BOTTOM_R_CORNER  = 0xB;

// ----------------------------------------------------------------------------
// Constants from EC_*/EASY_CHAT_* enums and gText_* strings (decomp-side)
// ----------------------------------------------------------------------------
// 1:1 STRICT : these symbols live in include/constants/easy_chat.h and
// data/text/easy_chat/*. They are resolved at runtime through globalThis bindings
// already populated by decomp-bridge and the auto-generated easy_chat_words data.
// We DO NOT import from decomp-data/auto/ as per scope contract.

// gText_* (string pointers used by sEasyChatScreenTemplates etc.)
function _gText(name: string): any { return _g(name) ?? null; }

// EC_* / EASY_CHAT_* numeric constants
function _EC(name: string): number { return (_g<number>(name) ?? 0) | 0; }

// EC_POKEMON(LATIAS) helper : in decomp this is ((EC_GROUP_POKEMON << 9) | SPECIES_LATIAS).
function _ECPokemon(speciesName: string): number {
  const EC_GROUP_POKEMON = _EC('EC_GROUP_POKEMON');
  const species = _EC(speciesName);
  return ((EC_GROUP_POKEMON << 9) | species) & 0xFFFF;
}

// ----------------------------------------------------------------------------
// Quiz Lady screen dispatch table (easy_chat.c:405-426)
// ----------------------------------------------------------------------------
const sQuizLadyEasyChatScreens: Array<{ funcId: number; callback: MainCallback }> = [
  { funcId: ECFUNC_QUIZ_ANSWER,     callback: DoQuizAnswerEasyChatScreen },
  { funcId: ECFUNC_QUIZ_QUESTION,   callback: DoQuizQuestionEasyChatScreen },
  { funcId: ECFUNC_SET_QUIZ_ANSWER, callback: DoQuizSetAnswerEasyChatScreen },
  { funcId: ECFUNC_SET_QUIZ_QUESTION, callback: DoQuizSetQuestionEasyChatScreen },
];

// ----------------------------------------------------------------------------
// sEasyChatScreenTemplates (easy_chat.c:428-681)
// ----------------------------------------------------------------------------
export interface EasyChatScreenTemplate {
  type: number;
  numColumns: number;
  numRows: number;
  frameId: number;        // u8:7 in C
  fourFooterOptions: number; // u8:1 in C
  titleText: any;         // const u8 *
  instructionsText1: any;
  instructionsText2: any;
  confirmText1: any;
  confirmText2: any;
}

// Helper to build a template entry while resolving decomp constants lazily.
function _tpl(
  typeName: string, numColumns: number, numRows: number, frameId: number,
  fourFooterOptions: number, titleText: string | null, instructionsText1: string | null,
  instructionsText2: string | null, confirmText1: string | null, confirmText2: string | null,
): EasyChatScreenTemplate {
  return {
    type: _EC(typeName),
    numColumns, numRows, frameId, fourFooterOptions,
    titleText: titleText ? _gText(titleText) : null,
    instructionsText1: instructionsText1 ? _gText(instructionsText1) : null,
    instructionsText2: instructionsText2 ? _gText(instructionsText2) : null,
    confirmText1: confirmText1 ? _gText(confirmText1) : null,
    confirmText2: confirmText2 ? _gText(confirmText2) : null,
  };
}

// Lazy initialization : the templates reference gText_* which may not be bound
// at module load time. We build them on first access via a getter.
let _sEasyChatScreenTemplates: EasyChatScreenTemplate[] | null = null;

function getEasyChatScreenTemplates(): EasyChatScreenTemplate[] {
  if (_sEasyChatScreenTemplates) return _sEasyChatScreenTemplates;
  _sEasyChatScreenTemplates = [
    _tpl('EASY_CHAT_TYPE_PROFILE',      2, 2, FRAMEID_GENERAL_2x2,           0,
      'gText_Profile',
      'gText_CombineFourWordsOrPhrases',
      'gText_AndMakeYourProfile',
      'gText_YourProfile',
      'gText_IsAsShownOkay'),
    _tpl('EASY_CHAT_TYPE_BATTLE_START', 2, 3, FRAMEID_GENERAL_2x3,           0,
      'gText_AtTheBattlesStart',
      'gText_CombineSixWordsOrPhrases',
      'gText_AndMakeAMessage',
      'gText_YourFeelingAtTheBattlesStart',
      'gText_IsAsShownOkay'),
    _tpl('EASY_CHAT_TYPE_BATTLE_WON',   2, 3, FRAMEID_GENERAL_2x3,           0,
      'gText_UponWinningABattle',
      'gText_CombineSixWordsOrPhrases',
      'gText_AndMakeAMessage',
      'gText_WhatYouSayIfYouWin',
      'gText_IsAsShownOkay'),
    _tpl('EASY_CHAT_TYPE_BATTLE_LOST',  2, 3, FRAMEID_GENERAL_2x3,           0,
      'gText_UponLosingABattle',
      'gText_CombineSixWordsOrPhrases',
      'gText_AndMakeAMessage',
      'gText_WhatYouSayIfYouLose',
      'gText_IsAsShownOkay'),
    _tpl('EASY_CHAT_TYPE_MAIL',         2, 5, FRAMEID_MAIL,                  0,
      null,
      'gText_CombineNineWordsOrPhrases',
      'gText_AndMakeAMessage2',
      'gText_TheMailMessage',
      'gText_IsAsShownOkay'),
    _tpl('EASY_CHAT_TYPE_INTERVIEW',    2, 2, FRAMEID_INTERVIEW,             0,
      'gText_Interview',
      'gText_CombineFourWordsOrPhrases',
      'gText_LetsReplyToTheInterview',
      'gText_TheAnswer',
      'gText_IsAsShownOkay'),
    _tpl('EASY_CHAT_TYPE_BARD_SONG',    2, 3, FRAMEID_GENERAL_2x3,           0,
      'gText_TheBardsSong',
      'gText_ChangeJustOneWordOrPhrase',
      'gText_AndImproveTheBardsSong',
      'gText_TheBardsSong2',
      'gText_IsAsShownOkay'),
    _tpl('EASY_CHAT_TYPE_FAN_CLUB',     1, 1, FRAMEID_INTERVIEW_SHOW_PERSON, 0,
      'gText_Interview',
      'gText_FindWordsThatDescribeYour',
      'gText_FeelingsRightNow',
      'gText_TheAnswer',
      'gText_IsAsShownOkay'),
    _tpl('EASY_CHAT_TYPE_TRENDY_PHRASE', 2, 1, FRAMEID_COMBINE_TWO_WORDS,    0,
      'gText_WhatsHipAndHappening',
      'gText_CombineTwoWordsOrPhrases',
      'gText_AndMakeATrendySaying',
      'gText_TheTrendySaying',
      'gText_IsAsShownOkay'),
    _tpl('EASY_CHAT_TYPE_QUIZ_QUESTION', 2, 5, FRAMEID_QUIZ_QUESTION,        1,
      null,
      'gText_AfterYouHaveReadTheQuiz',
      'gText_QuestionPressTheAButton',
      null,
      null),
    _tpl('EASY_CHAT_TYPE_QUIZ_ANSWER',  1, 1, FRAMEID_QUIZ_ANSWER,           1,
      'gText_TheQuizAnswerIs',
      'gText_OutOfTheListedChoices',
      'gText_SelectTheAnswerToTheQuiz',
      'gText_TheAnswerColon',
      'gText_IsAsShownOkay'),
    _tpl('EASY_CHAT_TYPE_QUIZ_SET_QUESTION', 2, 5, FRAMEID_QUIZ_SET_QUESTION, 1,
      null,
      'gText_CombineNineWordsOrPhrases',
      'gText_AndCreateAQuiz',
      'gText_IsThisQuizOK',
      null),
    _tpl('EASY_CHAT_TYPE_QUIZ_SET_ANSWER', 1, 1, FRAMEID_QUIZ_ANSWER,        1,
      'gText_TheQuizAnswerIs',
      'gText_PickAWordOrPhraseAnd',
      'gText_SetTheQuizAnswer',
      'gText_IsThisQuizOK',
      null),
    // Duplicate of EASY_CHAT_TYPE_BARD_SONG entry — present in decomp (line 585)
    _tpl('EASY_CHAT_TYPE_BARD_SONG',    2, 3, FRAMEID_GENERAL_2x3,           0,
      'gText_TheBardsSong',
      'gText_ChangeJustOneWordOrPhrase',
      'gText_AndImproveTheBardsSong',
      'gText_TheBardsSong2',
      'gText_IsAsShownOkay'),
    _tpl('EASY_CHAT_TYPE_APPRENTICE',   2, 3, FRAMEID_GENERAL_2x3,           0,
      'gText_ApprenticesPhrase',
      'gText_FindWordsWhichFit',
      'gText_TheTrainersImage',
      'gText_ApprenticePhrase',
      'gText_IsAsShownOkay'),
    _tpl('EASY_CHAT_TYPE_GOOD_SAYING',  2, 1, FRAMEID_COMBINE_TWO_WORDS,     0,
      'gText_GoodSaying',
      'gText_CombineTwoWordsOrPhrases2',
      'gText_ToTeachHerAGoodSaying',
      'gText_TheAnswer',
      'gText_IsAsShownOkay'),
    _tpl('EASY_CHAT_TYPE_GABBY_AND_TY', 1, 1, FRAMEID_INTERVIEW_SHOW_PERSON, 0,
      'gText_Interview',
      'gText_FindWordsThatDescribeYour',
      'gText_FeelingsRightNow',
      'gText_TheAnswer',
      'gText_IsAsShownOkay'),
    _tpl('EASY_CHAT_TYPE_BATTLE_TOWER_INTERVIEW', 1, 1, FRAMEID_INTERVIEW_SHOW_PERSON, 0,
      'gText_Interview',
      'gText_FindWordsThatDescribeYour',
      'gText_FeelingsRightNow',
      'gText_TheAnswer',
      'gText_IsAsShownOkay'),
    _tpl('EASY_CHAT_TYPE_CONTEST_INTERVIEW', 1, 1, FRAMEID_INTERVIEW_SHOW_PERSON, 0,
      'gText_Interview',
      'gText_FindWordsThatDescribeYour',
      'gText_FeelingsRightNow',
      'gText_TheAnswer',
      'gText_IsAsShownOkay'),
    _tpl('EASY_CHAT_TYPE_FAN_QUESTION', 1, 1, FRAMEID_INTERVIEW_SHOW_PERSON, 0,
      'gText_FansQuestion',
      'gText_FindWordsWhichFit',
      'gText_TheTrainersImage',
      'gText_TheImage',
      'gText_IsAsShownOkay'),
    _tpl('EASY_CHAT_TYPE_QUESTIONNAIRE', 2, 2, FRAMEID_GENERAL_2x2,          0,
      'gText_Questionnaire',
      'gText_CombineFourWordsOrPhrases',
      'gText_AndFillOutTheQuestionnaire',
      'gText_TheAnswer',
      'gText_IsAsShownOkay'),
  ];
  return _sEasyChatScreenTemplates;
}

// ----------------------------------------------------------------------------
// sAlphabetGroupIdMap (easy_chat.c:686-691)
// ----------------------------------------------------------------------------
const sAlphabetGroupIdMap: readonly number[][] = [
  [ 1,  2,  3,  4,  5,  6,  0],
  [ 7,  8,  9, 10, 11, 12,  0],
  [13, 14, 15, 16, 17, 18, 19],
  [20, 21, 22, 23, 24, 25, 26],
];

// ----------------------------------------------------------------------------
// sMysteryGiftPhrase (easy_chat.c:693-698)
// ----------------------------------------------------------------------------
function getMysteryGiftPhrase(): Uint16Array {
  const arr = new Uint16Array(4);
  arr[0] = _EC('EC_WORD_LINK');
  arr[1] = _EC('EC_WORD_WITH');
  arr[2] = _EC('EC_WORD_CASE');
  arr[3] = _EC('EC_WORD_TRAINER');
  return arr;
}

// ----------------------------------------------------------------------------
// sBerryMasterWifePhrases (easy_chat.c:700-706)
// ----------------------------------------------------------------------------
function getBerryMasterWifePhrases(): Uint16Array[] {
  const PHRASE_GREAT_BATTLE         = _EC('PHRASE_GREAT_BATTLE');
  const PHRASE_CHALLENGE_CONTEST    = _EC('PHRASE_CHALLENGE_CONTEST');
  const PHRASE_OVERWHELMING_LATIAS  = _EC('PHRASE_OVERWHELMING_LATIAS');
  const PHRASE_COOL_LATIOS          = _EC('PHRASE_COOL_LATIOS');
  const PHRASE_SUPER_HUSTLE         = _EC('PHRASE_SUPER_HUSTLE');
  const n = Math.max(
    PHRASE_GREAT_BATTLE, PHRASE_CHALLENGE_CONTEST,
    PHRASE_OVERWHELMING_LATIAS, PHRASE_COOL_LATIOS, PHRASE_SUPER_HUSTLE,
  );
  const arr: Uint16Array[] = new Array(n);
  for (let i = 0; i < n; i++) arr[i] = new Uint16Array(2);
  arr[PHRASE_GREAT_BATTLE - 1]        = Uint16Array.from([_EC('EC_WORD_GREAT'),       _EC('EC_WORD_FIGHTING')]);
  arr[PHRASE_CHALLENGE_CONTEST - 1]   = Uint16Array.from([_EC('EC_WORD_CONTEST'),     _EC('EC_WORD_CHALLENGE')]);
  arr[PHRASE_OVERWHELMING_LATIAS - 1] = Uint16Array.from([_EC('EC_WORD_OVERWHELMING'), _ECPokemon('SPECIES_LATIAS')]);
  arr[PHRASE_COOL_LATIOS - 1]         = Uint16Array.from([_EC('EC_WORD_COOL'),         _ECPokemon('SPECIES_LATIOS')]);
  arr[PHRASE_SUPER_HUSTLE - 1]        = Uint16Array.from([_EC('EC_WORD_SUPER'),        _EC('EC_WORD_HUSTLE')]);
  return arr;
}

// ----------------------------------------------------------------------------
// Graphics blobs (easy_chat.c:708-721)
// ----------------------------------------------------------------------------
// 1:1 strict : these are GBA palette/tile data fetched from the decomp asset
// extraction pipeline at runtime. Bound by decomp-bridge.
const sTriangleCursor_Pal      = _g<Uint16Array>('sTriangleCursor_Pal');
const sTriangleCursor_Gfx      = _g<Uint32Array>('sTriangleCursor_Gfx');
const sScrollIndicator_Gfx     = _g<Uint32Array>('sScrollIndicator_Gfx');
const sStartSelectButtons_Gfx  = _g<Uint32Array>('sStartSelectButtons_Gfx');
const sRSInterviewFrame_Pal    = _g<Uint16Array>('sRSInterviewFrame_Pal');
const sRSInterviewFrame_Gfx    = _g<Uint32Array>('sRSInterviewFrame_Gfx');
const sTextInputFrameOrange_Pal = _g<Uint16Array>('sTextInputFrameOrange_Pal');
const sTextInputFrameGreen_Pal  = _g<Uint16Array>('sTextInputFrameGreen_Pal');
const sTextInputFrame_Gfx      = _g<Uint32Array>('sTextInputFrame_Gfx');
const sTitleText_Pal           = _g<Uint16Array>('sTitleText_Pal');
const sText_Pal                = _g<Uint16Array>('sText_Pal');

// ----------------------------------------------------------------------------
// sPhraseFrameDimensions (easy_chat.c:723-787)
// ----------------------------------------------------------------------------
const sPhraseFrameDimensions: EasyChatPhraseFrameDimensions[] = (() => {
  const arr: EasyChatPhraseFrameDimensions[] = [];
  arr[FRAMEID_GENERAL_2x2]           = { left: 3,  top: 4, width: 24, height: 4,  footerId: FOOTER_NORMAL };
  arr[FRAMEID_GENERAL_2x3]           = { left: 3,  top: 3, width: 24, height: 6,  footerId: FOOTER_NORMAL };
  arr[FRAMEID_MAIL]                  = { left: 3,  top: 0, width: 24, height: 10, footerId: FOOTER_NORMAL };
  arr[FRAMEID_COMBINE_TWO_WORDS]     = { left: 3,  top: 5, width: 24, height: 2,  footerId: FOOTER_NORMAL };
  arr[FRAMEID_INTERVIEW_SHOW_PERSON] = { left: 16, top: 5, width: 12, height: 2,  footerId: FOOTER_NORMAL };
  arr[FRAMEID_INTERVIEW]             = { left: 3,  top: 4, width: 24, height: 4,  footerId: FOOTER_NORMAL };
  arr[FRAMEID_QUIZ_ANSWER]           = { left: 9,  top: 4, width: 12, height: 2,  footerId: FOOTER_QUIZ };
  arr[FRAMEID_QUIZ_QUESTION]         = { left: 5,  top: 3, width: 20, height: 10, footerId: NUM_FOOTER_TYPES };
  arr[FRAMEID_QUIZ_SET_QUESTION]     = { left: 3,  top: 0, width: 24, height: 10, footerId: FOOTER_ANSWER };
  return arr;
})();

// ----------------------------------------------------------------------------
// sEasyChatBgTemplates (easy_chat.c:789-826)
// ----------------------------------------------------------------------------
export interface BgTemplate {
  bg: number;
  charBaseIndex: number;
  mapBaseIndex: number;
  screenSize: number;
  paletteMode: number;
  priority: number;
  baseTile: number;
}

const sEasyChatBgTemplates: BgTemplate[] = [
  { bg: 0, charBaseIndex: 0, mapBaseIndex: 28, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0 },
  { bg: 1, charBaseIndex: 3, mapBaseIndex: 29, screenSize: 0, paletteMode: 0, priority: 1, baseTile: 0 },
  { bg: 2, charBaseIndex: 0, mapBaseIndex: 30, screenSize: 0, paletteMode: 0, priority: 2, baseTile: 0x80 },
  { bg: 3, charBaseIndex: 2, mapBaseIndex: 31, screenSize: 0, paletteMode: 0, priority: 3, baseTile: 0 },
];

// ----------------------------------------------------------------------------
// sEasyChatWindowTemplates (easy_chat.c:828-857)
// ----------------------------------------------------------------------------
export interface WindowTemplate {
  bg: number;
  tilemapLeft: number;
  tilemapTop: number;
  width: number;
  height: number;
  paletteNum: number;
  baseBlock: number;
}

const DUMMY_WIN_TEMPLATE: WindowTemplate = {
  bg: 0xFF, tilemapLeft: 0, tilemapTop: 0, width: 0, height: 0, paletteNum: 0, baseBlock: 0,
};

const sEasyChatWindowTemplates: WindowTemplate[] = [];
sEasyChatWindowTemplates[WIN_TITLE]       = { bg: 1, tilemapLeft: 0, tilemapTop: 0,  width: 30, height: 2,  paletteNum: 10, baseBlock: 0x10 };
sEasyChatWindowTemplates[WIN_MSG]         = { bg: 0, tilemapLeft: 3, tilemapTop: 15, width: 24, height: 4,  paletteNum: 15, baseBlock: 0xA  };
sEasyChatWindowTemplates[WIN_INPUT_SELECT] = { bg: 2, tilemapLeft: 1, tilemapTop: 0,  width: 28, height: 32, paletteNum: 3,  baseBlock: 0    };
sEasyChatWindowTemplates[3]               = DUMMY_WIN_TEMPLATE;

// ----------------------------------------------------------------------------
// sEasyChatYesNoWindowTemplate (easy_chat.c:859-867)
// ----------------------------------------------------------------------------
const sEasyChatYesNoWindowTemplate: WindowTemplate = {
  bg: 0, tilemapLeft: 22, tilemapTop: 9, width: 5, height: 4, paletteNum: 15, baseBlock: 0x6A,
};

// ----------------------------------------------------------------------------
// sText_Clear17 (easy_chat.c:869)
// ----------------------------------------------------------------------------
// _("{CLEAR 17}") => GBA control sequence 0xFC 0x11 0x11 0xFF
const sText_Clear17 = new Uint8Array([0xFC, 0x11, 0x11, 0xFF]);

// ----------------------------------------------------------------------------
// sEasyChatKeyboardAlphabet (easy_chat.c:871-877)
// ----------------------------------------------------------------------------
function getEasyChatKeyboardAlphabet(): any[] {
  return [
    _gText('gText_EasyChatKeyboard_ABCDEFothers'),
    _gText('gText_EasyChatKeyboard_GHIJKL'),
    _gText('gText_EasyChatKeyboard_MNOPQRS'),
    _gText('gText_EasyChatKeyboard_TUVWXYZ'),
  ];
}

// ----------------------------------------------------------------------------
// sSpriteSheets (easy_chat.c:879-896)
// ----------------------------------------------------------------------------
export interface SpriteSheet { data: any; size: number; tag: number; }

function getSpriteSheets(): SpriteSheet[] {
  return [
    { data: sTriangleCursor_Gfx,     size: sTriangleCursor_Gfx     ? sTriangleCursor_Gfx.byteLength    : 0, tag: GFXTAG_TRIANGLE_CURSOR },
    { data: sScrollIndicator_Gfx,    size: sScrollIndicator_Gfx    ? sScrollIndicator_Gfx.byteLength   : 0, tag: GFXTAG_SCROLL_INDICATOR },
    { data: sStartSelectButtons_Gfx, size: sStartSelectButtons_Gfx ? sStartSelectButtons_Gfx.byteLength : 0, tag: GFXTAG_START_SELECT_BUTTONS },
    { data: null, size: 0, tag: 0 },
  ];
}

// ----------------------------------------------------------------------------
// sSpritePalettes (easy_chat.c:898-916)
// ----------------------------------------------------------------------------
export interface SpritePalette { data: any; tag: number; }

function getSpritePalettes(): SpritePalette[] {
  return [
    { data: sTriangleCursor_Pal,                       tag: PALTAG_TRIANGLE_CURSOR },
    { data: _g('gEasyChatRectangleCursor_Pal'),        tag: PALTAG_RECTANGLE_CURSOR },
    { data: _g('gEasyChatButtonWindow_Pal'),           tag: PALTAG_MISC_UI },
    { data: sRSInterviewFrame_Pal,                     tag: PALTAG_RS_INTERVIEW_FRAME },
    { data: null, tag: 0 },
  ];
}

// ----------------------------------------------------------------------------
// sCompressedSpriteSheets (easy_chat.c:918-939)
// ----------------------------------------------------------------------------
export interface CompressedSpriteSheet { data: any; size: number; tag: number; }

function getCompressedSpriteSheets(): CompressedSpriteSheet[] {
  return [
    { data: sRSInterviewFrame_Gfx,            size: 0x800,  tag: GFXTAG_RS_INTERVIEW_FRAME },
    { data: _g('gEasyChatRectangleCursor_Gfx'), size: 0x1000, tag: GFXTAG_RECTANGLE_CURSOR },
    { data: _g('gEasyChatButtonWindow_Gfx'),    size: 0x800,  tag: GFXTAG_BUTTON_WINDOW },
    { data: _g('gEasyChatMode_Gfx'),            size: 0x1000, tag: GFXTAG_MODE_WINDOW },
  ];
}

// ----------------------------------------------------------------------------
// sAlphabetKeyboardColumnOffsets (easy_chat.c:941)
// ----------------------------------------------------------------------------
const sAlphabetKeyboardColumnOffsets: readonly number[] = [0, 12, 24, 56, 68, 80, 92];

// ----------------------------------------------------------------------------
// OamData / SpriteTemplate / AnimCmd descriptors (easy_chat.c:943-1198)
// ----------------------------------------------------------------------------
// 1:1 strict : these mirror the decomp struct literals byte-for-byte. The TS
// representation keeps the same field names + values; sprite system bindings
// will read them via this module.

export interface OamData {
  y: number;
  affineMode: number;
  objMode: number;
  mosaic: number;
  bpp: number;
  shape: number;
  x: number;
  matrixNum: number;
  size: number;
  tileNum: number;
  priority: number;
  paletteNum: number;
  affineParam: number;
}

// GBA OAM constants
const ST_OAM_AFFINE_OFF = 0;
const ST_OAM_OBJ_NORMAL = 0;
const ST_OAM_4BPP       = 0;
const SHAPE_SQUARE      = 0; // 8x8, 16x16, 32x32, 64x64
const SHAPE_WIDE        = 1; // 16x8, 32x8, 32x16, 64x32
const SHAPE_TALL        = 2;
const SIZE_8            = 0;
const SIZE_16           = 1;
const SIZE_32           = 2;
const SIZE_64           = 3;

// SPRITE_SHAPE / SPRITE_SIZE macro values
const SPRITE_SHAPE_8x8   = SHAPE_SQUARE; const SPRITE_SIZE_8x8   = SIZE_8;
const SPRITE_SHAPE_64x32 = SHAPE_WIDE;   const SPRITE_SIZE_64x32 = SIZE_64;
const SPRITE_SHAPE_64x64 = SHAPE_SQUARE; const SPRITE_SIZE_64x64 = SIZE_64;
const SPRITE_SHAPE_32x8  = SHAPE_WIDE;   const SPRITE_SIZE_32x8  = SIZE_16;
const SPRITE_SHAPE_16x16 = SHAPE_SQUARE; const SPRITE_SIZE_16x16 = SIZE_16;

// sOamData_TriangleCursor (easy_chat.c:943-957)
const sOamData_TriangleCursor: OamData = {
  y: 0, affineMode: ST_OAM_AFFINE_OFF, objMode: ST_OAM_OBJ_NORMAL, mosaic: 0,
  bpp: ST_OAM_4BPP, shape: SPRITE_SHAPE_8x8, x: 0, matrixNum: 0, size: SPRITE_SIZE_8x8,
  tileNum: 0, priority: 3, paletteNum: 0, affineParam: 0,
};

export interface SpriteTemplate {
  tileTag: number;
  paletteTag: number;
  oam: OamData;
  anims: any;
  images: any;
  affineAnims: any;
  callback: any;
}

// gDummySpriteAnimTable / gDummySpriteAffineAnimTable / SpriteCallbackDummy
function _gSpriteHelper(name: string): any { return _g(name) ?? null; }

// SpriteCB_Cursor — implementation lives in easy-chat-render or a later port
function SpriteCB_Cursor(_sprite: any): void {
  // 1:1 TODO : port lines ~2400-2450 easy_chat.c (separate agent)
  // No console.warn here — this is called every frame.
}

// sSpriteTemplate_TriangleCursor (easy_chat.c:959-968)
// NOTE: decomp has tileTag and paletteTag SWAPPED in this template
// (line 961-962 : .tileTag = PALTAG_TRIANGLE_CURSOR, .paletteTag = GFXTAG_TRIANGLE_CURSOR).
// Bug-for-bug 1:1 reproduced.
const sSpriteTemplate_TriangleCursor: SpriteTemplate = {
  tileTag:    PALTAG_TRIANGLE_CURSOR,
  paletteTag: GFXTAG_TRIANGLE_CURSOR,
  oam: sOamData_TriangleCursor,
  anims: _gSpriteHelper('gDummySpriteAnimTable'),
  images: null,
  affineAnims: _gSpriteHelper('gDummySpriteAffineAnimTable'),
  callback: SpriteCB_Cursor,
};

// sOamData_RectangleCursor (easy_chat.c:970-984)
const sOamData_RectangleCursor: OamData = {
  y: 0, affineMode: ST_OAM_AFFINE_OFF, objMode: ST_OAM_OBJ_NORMAL, mosaic: 0,
  bpp: ST_OAM_4BPP, shape: SPRITE_SHAPE_64x32, x: 0, matrixNum: 0, size: SPRITE_SIZE_64x32,
  tileNum: 0, priority: 1, paletteNum: 0, affineParam: 0,
};

// ANIMCMD frames
type AnimCmd = { frame: number; duration: number; isEnd?: boolean };
const ANIMCMD_END: AnimCmd = { frame: 0, duration: 0, isEnd: true };
function ANIMCMD_FRAME(frame: number, duration: number): AnimCmd { return { frame, duration }; }

// sAnim_RectangleCursor_OnGroup/OnButton/OnOthers/OnLetter (easy_chat.c:986-1004)
const sAnim_RectangleCursor_OnGroup:  AnimCmd[] = [ANIMCMD_FRAME(0, 0),  ANIMCMD_END];
const sAnim_RectangleCursor_OnButton: AnimCmd[] = [ANIMCMD_FRAME(32, 0), ANIMCMD_END];
const sAnim_RectangleCursor_OnOthers: AnimCmd[] = [ANIMCMD_FRAME(64, 0), ANIMCMD_END];
const sAnim_RectangleCursor_OnLetter: AnimCmd[] = [ANIMCMD_FRAME(96, 0), ANIMCMD_END];

// RECTCURSOR_ANIM_ enum (easy_chat.c:1007-1012)
const RECTCURSOR_ANIM_ON_GROUP  = 0;
const RECTCURSOR_ANIM_ON_BUTTON = 1;
const RECTCURSOR_ANIM_ON_OTHERS = 2;
const RECTCURSOR_ANIM_ON_LETTER = 3;

// sAnims_RectangleCursor (easy_chat.c:1014-1019)
const sAnims_RectangleCursor: AnimCmd[][] = [];
sAnims_RectangleCursor[RECTCURSOR_ANIM_ON_GROUP]  = sAnim_RectangleCursor_OnGroup;
sAnims_RectangleCursor[RECTCURSOR_ANIM_ON_BUTTON] = sAnim_RectangleCursor_OnButton;
sAnims_RectangleCursor[RECTCURSOR_ANIM_ON_OTHERS] = sAnim_RectangleCursor_OnOthers;
sAnims_RectangleCursor[RECTCURSOR_ANIM_ON_LETTER] = sAnim_RectangleCursor_OnLetter;

// sSpriteTemplate_RectangleCursor (easy_chat.c:1021-1030)
const sSpriteTemplate_RectangleCursor: SpriteTemplate = {
  tileTag:    GFXTAG_RECTANGLE_CURSOR,
  paletteTag: PALTAG_RECTANGLE_CURSOR,
  oam: sOamData_RectangleCursor,
  anims: sAnims_RectangleCursor,
  images: null,
  affineAnims: _gSpriteHelper('gDummySpriteAffineAnimTable'),
  callback: SpriteCB_Cursor,
};

// sOamData_ModeWindow (easy_chat.c:1032-1046)
const sOamData_ModeWindow: OamData = {
  y: 0, affineMode: ST_OAM_AFFINE_OFF, objMode: ST_OAM_OBJ_NORMAL, mosaic: 0,
  bpp: ST_OAM_4BPP, shape: SPRITE_SHAPE_64x32, x: 0, matrixNum: 0, size: SPRITE_SIZE_64x32,
  tileNum: 0, priority: 1, paletteNum: 0, affineParam: 0,
};

// sAnim_ModeWindow_* (easy_chat.c:1048-1074)
const sAnim_ModeWindow_Hidden:    AnimCmd[] = [ANIMCMD_FRAME(96, 0), ANIMCMD_END];
const sAnim_ModeWindow_ToGroup:   AnimCmd[] = [ANIMCMD_FRAME(64, 4), ANIMCMD_FRAME(32, 4), ANIMCMD_END];
const sAnim_ModeWindow_ToAlphabet:AnimCmd[] = [ANIMCMD_FRAME(64, 4), ANIMCMD_FRAME(0, 4),  ANIMCMD_END];
const sAnim_ModeWindow_ToHidden:  AnimCmd[] = [ANIMCMD_FRAME(64, 4), ANIMCMD_FRAME(96, 0), ANIMCMD_END];
const sAnim_ModeWindow_Transition:AnimCmd[] = [ANIMCMD_FRAME(64, 4), ANIMCMD_END];

// MODEWINDOW_ANIM_ enum (easy_chat.c:1076-1082)
const MODEWINDOW_ANIM_HIDDEN       = 0;
const MODEWINDOW_ANIM_TO_GROUP     = 1;
const MODEWINDOW_ANIM_TO_ALPHABET  = 2;
const MODEWINDOW_ANIM_TO_HIDDEN    = 3;
const MODEWINDOW_ANIM_TRANSITION   = 4;

// sAnims_ModeWindow (easy_chat.c:1084-1090)
const sAnims_ModeWindow: AnimCmd[][] = [];
sAnims_ModeWindow[MODEWINDOW_ANIM_HIDDEN]      = sAnim_ModeWindow_Hidden;
sAnims_ModeWindow[MODEWINDOW_ANIM_TO_GROUP]    = sAnim_ModeWindow_ToGroup;
sAnims_ModeWindow[MODEWINDOW_ANIM_TO_ALPHABET] = sAnim_ModeWindow_ToAlphabet;
sAnims_ModeWindow[MODEWINDOW_ANIM_TO_HIDDEN]   = sAnim_ModeWindow_ToHidden;
sAnims_ModeWindow[MODEWINDOW_ANIM_TRANSITION]  = sAnim_ModeWindow_Transition;

// sSpriteTemplate_ModeWindow (easy_chat.c:1092-1101)
const sSpriteTemplate_ModeWindow: SpriteTemplate = {
  tileTag:    GFXTAG_MODE_WINDOW,
  paletteTag: PALTAG_MISC_UI,
  oam: sOamData_ModeWindow,
  anims: sAnims_ModeWindow,
  images: null,
  affineAnims: _gSpriteHelper('gDummySpriteAffineAnimTable'),
  callback: _gSpriteHelper('SpriteCallbackDummy'),
};

// sOamData_ButtonWindow (easy_chat.c:1103-1117)
const sOamData_ButtonWindow: OamData = {
  y: 0, affineMode: ST_OAM_AFFINE_OFF, objMode: ST_OAM_OBJ_NORMAL, mosaic: 0,
  bpp: ST_OAM_4BPP, shape: SPRITE_SHAPE_64x64, x: 0, matrixNum: 0, size: SPRITE_SIZE_64x64,
  tileNum: 0, priority: 3, paletteNum: 0, affineParam: 0,
};

// sSpriteTemplate_ButtonWindow (easy_chat.c:1119-1128)
const sSpriteTemplate_ButtonWindow: SpriteTemplate = {
  tileTag:    GFXTAG_BUTTON_WINDOW,
  paletteTag: PALTAG_MISC_UI,
  oam: sOamData_ButtonWindow,
  anims: _gSpriteHelper('gDummySpriteAnimTable'),
  images: null,
  affineAnims: _gSpriteHelper('gDummySpriteAffineAnimTable'),
  callback: _gSpriteHelper('SpriteCallbackDummy'),
};

// sOamData_StartSelectButton (easy_chat.c:1130-1144)
const sOamData_StartSelectButton: OamData = {
  y: 0, affineMode: ST_OAM_AFFINE_OFF, objMode: ST_OAM_OBJ_NORMAL, mosaic: 0,
  bpp: ST_OAM_4BPP, shape: SPRITE_SHAPE_32x8, x: 0, matrixNum: 0, size: SPRITE_SIZE_32x8,
  tileNum: 0, priority: 1, paletteNum: 0, affineParam: 0,
};

// sOamData_ScrollIndicator (easy_chat.c:1146-1160)
const sOamData_ScrollIndicator: OamData = {
  y: 0, affineMode: ST_OAM_AFFINE_OFF, objMode: ST_OAM_OBJ_NORMAL, mosaic: 0,
  bpp: ST_OAM_4BPP, shape: SPRITE_SHAPE_16x16, x: 0, matrixNum: 0, size: SPRITE_SIZE_16x16,
  tileNum: 0, priority: 1, paletteNum: 0, affineParam: 0,
};

// sAnim_Frame0/Frame1 (easy_chat.c:1162-1170)
const sAnim_Frame0: AnimCmd[] = [ANIMCMD_FRAME(0, 0), ANIMCMD_END];
const sAnim_Frame1: AnimCmd[] = [ANIMCMD_FRAME(4, 0), ANIMCMD_END];

// sAnims_TwoFrame (easy_chat.c:1173-1176)
const sAnims_TwoFrame: AnimCmd[][] = [sAnim_Frame0, sAnim_Frame1];

// sSpriteTemplate_StartSelectButton (easy_chat.c:1178-1187)
const sSpriteTemplate_StartSelectButton: SpriteTemplate = {
  tileTag:    GFXTAG_START_SELECT_BUTTONS,
  paletteTag: PALTAG_MISC_UI,
  oam: sOamData_StartSelectButton,
  anims: sAnims_TwoFrame,
  images: null,
  affineAnims: _gSpriteHelper('gDummySpriteAffineAnimTable'),
  callback: _gSpriteHelper('SpriteCallbackDummy'),
};

// sSpriteTemplate_ScrollIndicator (easy_chat.c:1189-1198)
const sSpriteTemplate_ScrollIndicator: SpriteTemplate = {
  tileTag:    GFXTAG_SCROLL_INDICATOR,
  paletteTag: PALTAG_MISC_UI,
  oam: sOamData_ScrollIndicator,
  anims: sAnims_TwoFrame,
  images: null,
  affineAnims: _gSpriteHelper('gDummySpriteAffineAnimTable'),
  callback: _gSpriteHelper('SpriteCallbackDummy'),
};

// ----------------------------------------------------------------------------
// sFooterOptionXOffsets (easy_chat.c:1200-1204)
// ----------------------------------------------------------------------------
const sFooterOptionXOffsets: readonly (readonly number[])[] = (() => {
  const arr: number[][] = [];
  arr[FOOTER_NORMAL] = [16, 111, 196,   0];
  arr[FOOTER_QUIZ]   = [16,  82, 148, 184];
  arr[FOOTER_ANSWER] = [16,  78, 141, 174];
  return arr;
})();

// ----------------------------------------------------------------------------
// sFooterTextOptions (easy_chat.c:1206-1210)
// ----------------------------------------------------------------------------
function getFooterTextOptions(): (any[])[] {
  const arr: any[][] = [];
  arr[FOOTER_NORMAL] = [_gText('gText_DelAll'), _gText('gText_Cancel5'), _gText('gText_Ok2'), null];
  arr[FOOTER_QUIZ]   = [_gText('gText_DelAll'), _gText('gText_Cancel5'), _gText('gText_Ok2'), _gText('gText_Quiz')];
  arr[FOOTER_ANSWER] = [_gText('gText_DelAll'), _gText('gText_Cancel5'), _gText('gText_Ok2'), _gText('gText_Answer')];
  return arr;
}

// ----------------------------------------------------------------------------
// External data tables (easy_chat.c:1212-1213)
// ----------------------------------------------------------------------------
// #include "data/easy_chat/easy_chat_groups.h"
// #include "data/easy_chat/easy_chat_words_by_letter.h"
// 1:1 strict : these are large external word group tables. Bound via globalThis
// at runtime from the auto-generated data modules.
// gEasyChatGroups, gEasyChatWordsByLetterPointers.

// ----------------------------------------------------------------------------
// sEasyChatGroupNamePointers (easy_chat.c:1215-1238)
// ----------------------------------------------------------------------------
function getEasyChatGroupNamePointers(): any[] {
  const EC_NUM_GROUPS = _EC('EC_NUM_GROUPS');
  const arr: any[] = new Array(EC_NUM_GROUPS || 22).fill(null);
  arr[_EC('EC_GROUP_POKEMON')]          = _gText('gEasyChatGroupName_Pokemon');
  arr[_EC('EC_GROUP_TRAINER')]          = _gText('gEasyChatGroupName_Trainer');
  arr[_EC('EC_GROUP_STATUS')]           = _gText('gEasyChatGroupName_Status');
  arr[_EC('EC_GROUP_BATTLE')]           = _gText('gEasyChatGroupName_Battle');
  arr[_EC('EC_GROUP_GREETINGS')]        = _gText('gEasyChatGroupName_Greetings');
  arr[_EC('EC_GROUP_PEOPLE')]           = _gText('gEasyChatGroupName_People');
  arr[_EC('EC_GROUP_VOICES')]           = _gText('gEasyChatGroupName_Voices');
  arr[_EC('EC_GROUP_SPEECH')]           = _gText('gEasyChatGroupName_Speech');
  arr[_EC('EC_GROUP_ENDINGS')]          = _gText('gEasyChatGroupName_Endings');
  arr[_EC('EC_GROUP_FEELINGS')]         = _gText('gEasyChatGroupName_Feelings');
  arr[_EC('EC_GROUP_CONDITIONS')]       = _gText('gEasyChatGroupName_Conditions');
  arr[_EC('EC_GROUP_ACTIONS')]          = _gText('gEasyChatGroupName_Actions');
  arr[_EC('EC_GROUP_LIFESTYLE')]        = _gText('gEasyChatGroupName_Lifestyle');
  arr[_EC('EC_GROUP_HOBBIES')]          = _gText('gEasyChatGroupName_Hobbies');
  arr[_EC('EC_GROUP_TIME')]             = _gText('gEasyChatGroupName_Time');
  arr[_EC('EC_GROUP_MISC')]             = _gText('gEasyChatGroupName_Misc');
  arr[_EC('EC_GROUP_ADJECTIVES')]       = _gText('gEasyChatGroupName_Adjectives');
  arr[_EC('EC_GROUP_EVENTS')]           = _gText('gEasyChatGroupName_Events');
  arr[_EC('EC_GROUP_MOVE_1')]           = _gText('gEasyChatGroupName_Move1');
  arr[_EC('EC_GROUP_MOVE_2')]           = _gText('gEasyChatGroupName_Move2');
  arr[_EC('EC_GROUP_TRENDY_SAYING')]    = _gText('gEasyChatGroupName_TrendySaying');
  arr[_EC('EC_GROUP_POKEMON_NATIONAL')] = _gText('gEasyChatGroupName_Pokemon2');
  return arr;
}

// ----------------------------------------------------------------------------
// sDefaultProfileWords, sDefaultBattle*Words (easy_chat.c:1240-1272)
// ----------------------------------------------------------------------------
function getDefaultProfileWords(): Uint16Array {
  // EASY_CHAT_BATTLE_WORDS_COUNT - 2 = 4 (decomp constant)
  return Uint16Array.from([
    _EC('EC_WORD_ADORE'),
    _EC('EC_WORD_CASE'),
    _EC('EC_WORD_POKEMON'),
    _EC('EC_EMPTY_WORD'),
  ]);
}

function getDefaultBattleStartWords(): Uint16Array {
  return Uint16Array.from([
    _EC('EC_WORD_APOLOGIZE'),
    _EC('EC_WORD_EXCL'),
    _EC('EC_WORD_HERE_I_COME'),
    _EC('EC_WORD_EXCL'),
    _EC('EC_EMPTY_WORD'),
    _EC('EC_EMPTY_WORD'),
  ]);
}

function getDefaultBattleWonWords(): Uint16Array {
  return Uint16Array.from([
    _EC('EC_WORD_YAY'),
    _EC('EC_WORD_YAY'),
    _EC('EC_WORD_I_VE'),
    _EC('EC_WORD_REALLY'),
    _EC('EC_WORD_WINS'),
    _EC('EC_WORD_EXCL_EXCL'),
  ]);
}

function getDefaultBattleLostWords(): Uint16Array {
  return Uint16Array.from([
    _EC('EC_WORD_IT_S'),
    _EC('EC_EMPTY_WORD'),
    _EC('EC_WORD_AWFUL'),
    _EC('EC_WORD_ELLIPSIS'),
    _EC('EC_WORD_I_VE'),
    _EC('EC_WORD_LOST'),
  ]);
}

// ----------------------------------------------------------------------------
// sRestrictedWordSpecies (easy_chat.c:1274-1276)
// ----------------------------------------------------------------------------
function getRestrictedWordSpecies(): Uint16Array {
  return Uint16Array.from([_EC('SPECIES_DEOXYS')]);
}

// ----------------------------------------------------------------------------
// Task data accessor macros (easy_chat.c:1284-1292)
// ----------------------------------------------------------------------------
const TASKIDX_WORDS         = 2;
const TASKIDX_EXIT_CALLBACK = 4;
// #define tState        data[0]
// #define tType         data[1]
// #define tWords        data[2..3]
// #define tExitCallback data[4..5]
// #define tFuncId       data[6]
// #define tPersonType   data[7]

function _tState(taskId: number): number {
  const gTasks = _g<any[]>('gTasks');
  return gTasks ? gTasks[taskId].data[0] : 0;
}
function _setTState(taskId: number, v: number): void {
  const gTasks = _g<any[]>('gTasks');
  if (gTasks) gTasks[taskId].data[0] = v;
}
function _tType(taskId: number): number {
  const gTasks = _g<any[]>('gTasks');
  return gTasks ? gTasks[taskId].data[1] : 0;
}
function _setTType(taskId: number, v: number): void {
  const gTasks = _g<any[]>('gTasks');
  if (gTasks) gTasks[taskId].data[1] = v;
}
function _tFuncId(taskId: number): number {
  const gTasks = _g<any[]>('gTasks');
  return gTasks ? gTasks[taskId].data[6] : 0;
}
function _setTFuncId(taskId: number, v: number): void {
  const gTasks = _g<any[]>('gTasks');
  if (gTasks) gTasks[taskId].data[6] = v;
}
function _tPersonType(taskId: number): number {
  const gTasks = _g<any[]>('gTasks');
  return gTasks ? gTasks[taskId].data[7] : 0;
}
function _setTPersonType(taskId: number, v: number): void {
  const gTasks = _g<any[]>('gTasks');
  if (gTasks) gTasks[taskId].data[7] = v;
}
function _setTaskFunc(taskId: number, fn: TaskFunc): void {
  const gTasks = _g<any[]>('gTasks');
  if (gTasks) gTasks[taskId].func = fn;
}

// ----------------------------------------------------------------------------
// DoEasyChatScreen (easy_chat.c:1294-1305)
// ----------------------------------------------------------------------------
export function DoEasyChatScreen(
  type: number,
  words: Uint16Array | null,
  exitCallback: MainCallback,
  displayedPersonType: number,
): void {
  const ResetTasks    = _g<() => void>('ResetTasks');
  const CreateTask    = _g<(fn: TaskFunc, prio: number) => number>('CreateTask');
  const SetWordTaskArg = _g<(taskId: number, idx: number, value: number) => void>('SetWordTaskArg');
  const SetMainCallback2 = _g<(cb: MainCallback) => void>('SetMainCallback2');

  if (ResetTasks) ResetTasks();
  const taskId = CreateTask ? CreateTask(Task_InitEasyChatScreen, 0) : 0;
  _setTType(taskId, type);
  _setTPersonType(taskId, displayedPersonType);
  // SetWordTaskArg writes a 32-bit pointer split across two 16-bit data slots.
  // In TS we keep the actual JS reference in a side-table.
  if (SetWordTaskArg) {
    SetWordTaskArg(taskId, TASKIDX_WORDS,         _stashRef(words));
    SetWordTaskArg(taskId, TASKIDX_EXIT_CALLBACK, _stashRef(exitCallback));
  }
  if (SetMainCallback2) SetMainCallback2(CB2_EasyChatScreen);
}

// Side-table for refs that can't be encoded as 32-bit ints (function refs,
// JS arrays). decomp-bridge.SetWordTaskArg/GetWordTaskArg already handle this
// pattern in other ports.
const _refStash = new Map<number, any>();
let _refStashCounter = 1;
function _stashRef(ref: any): number {
  if (ref === null || ref === undefined) return 0;
  const id = _refStashCounter++;
  _refStash.set(id, ref);
  return id;
}
function _retrieveRef<T = any>(id: number): T | null {
  if (id === 0) return null;
  return (_refStash.get(id) ?? null) as T | null;
}

function _GetWordTaskArg<T = any>(taskId: number, idx: number): T | null {
  const GetWordTaskArg = _g<(t: number, i: number) => number>('GetWordTaskArg');
  if (!GetWordTaskArg) return null;
  return _retrieveRef<T>(GetWordTaskArg(taskId, idx));
}

// ----------------------------------------------------------------------------
// CB2_EasyChatScreen (easy_chat.c:1307-1313)
// ----------------------------------------------------------------------------
export function CB2_EasyChatScreen(): void {
  const RunTasks               = _g<() => void>('RunTasks');
  const AnimateSprites         = _g<() => void>('AnimateSprites');
  const BuildOamBuffer         = _g<() => void>('BuildOamBuffer');
  const UpdatePaletteFade      = _g<() => void>('UpdatePaletteFade');
  if (RunTasks)               RunTasks();
  if (AnimateSprites)         AnimateSprites();
  if (BuildOamBuffer)         BuildOamBuffer();
  if (UpdatePaletteFade)      UpdatePaletteFade();
}

// ----------------------------------------------------------------------------
// VBlankCB_EasyChatScreen (easy_chat.c:1315-1320)
// ----------------------------------------------------------------------------
function VBlankCB_EasyChatScreen(): void {
  const TransferPlttBuffer           = _g<() => void>('TransferPlttBuffer');
  const LoadOam                      = _g<() => void>('LoadOam');
  const ProcessSpriteCopyRequests    = _g<() => void>('ProcessSpriteCopyRequests');
  if (TransferPlttBuffer)         TransferPlttBuffer();
  if (LoadOam)                    LoadOam();
  if (ProcessSpriteCopyRequests)  ProcessSpriteCopyRequests();
}

// ----------------------------------------------------------------------------
// StartEasyChatScreen (easy_chat.c:1322-1326)
// ----------------------------------------------------------------------------
function StartEasyChatScreen(taskId: number, taskFunc: TaskFunc): void {
  _setTaskFunc(taskId, taskFunc);
  _setTState(taskId, MAINSTATE_FADE_IN);
}

// ----------------------------------------------------------------------------
// Task_InitEasyChatScreen (easy_chat.c:1328-1340)
// ----------------------------------------------------------------------------
export function Task_InitEasyChatScreen(taskId: number): void {
  const IsOverworldLinkActive = _g<() => boolean>('IsOverworldLinkActive');
  if (!(IsOverworldLinkActive && IsOverworldLinkActive())) {
    // 1:1 strict : drain InitEasyChatScreen in a tight loop until it returns FALSE
    let safety = 0;
    while (InitEasyChatScreen(taskId)) {
      // protect against infinite loops in case STUBs always return true
      if (++safety > 64) {
        console.warn('[easy-chat-init] Task_InitEasyChatScreen safety break (>64 iterations)');
        break;
      }
    }
  } else {
    if (InitEasyChatScreen(taskId) === true) return;
  }
  StartEasyChatScreen(taskId, Task_EasyChatScreen);
}

// ----------------------------------------------------------------------------
// Task_EasyChatScreen (easy_chat.c:1343-1396)
// ----------------------------------------------------------------------------
function Task_EasyChatScreen(taskId: number): void {
  const gPaletteFade = _g<{ active: boolean }>('gPaletteFade');
  const BeginNormalPaletteFade = _g<(pal: number, dly: number, sY: number, tY: number, c: number) => void>('BeginNormalPaletteFade');
  const BlendPalettes          = _g<(pal: number, coeff: number, color: number) => void>('BlendPalettes');
  const SetVBlankCallback      = _g<(cb: (() => void) | null) => void>('SetVBlankCallback');
  const PlaySE                 = _g<(seId: number) => void>('PlaySE');
  const PALETTES_ALL = (_g<number>('PALETTES_ALL') as any) ?? 0xFFFFFFFF;
  const RGB_BLACK    = (_g<number>('RGB_BLACK') as any) ?? 0;
  const SE_SELECT    = (_g<number>('SE_SELECT') as any) ?? 0;

  switch (_tState(taskId)) {
    case MAINSTATE_FADE_IN:
      if (SetVBlankCallback) SetVBlankCallback(VBlankCB_EasyChatScreen);
      if (BlendPalettes) BlendPalettes(PALETTES_ALL, 16, 0);
      if (BeginNormalPaletteFade) BeginNormalPaletteFade(PALETTES_ALL, -1, 16, 0, RGB_BLACK);
      _setTState(taskId, MAINSTATE_WAIT_FADE_IN);
      break;
    case MAINSTATE_HANDLE_INPUT: {
      const funcId = HandleEasyChatInput();
      if (IsFuncIdForQuizLadyScreen(funcId)) {
        // Fade to Quiz Lady screen
        if (BeginNormalPaletteFade) BeginNormalPaletteFade(PALETTES_ALL, -2, 0, 16, RGB_BLACK);
        _setTState(taskId, MAINSTATE_TO_QUIZ_LADY);
        _setTFuncId(taskId, funcId);
      } else if (funcId === ECFUNC_EXIT) {
        // Fade and exit Easy Chat
        if (BeginNormalPaletteFade) BeginNormalPaletteFade(PALETTES_ALL, -1, 0, 16, RGB_BLACK);
        _setTState(taskId, MAINSTATE_EXIT);
      } else if (funcId !== ECFUNC_NONE) {
        if (PlaySE) PlaySE(SE_SELECT);
        StartEasyChatFunction(funcId);
        _setTState(taskId, _tState(taskId) + 1); // MAINSTATE_RUN_FUNC
      }
      break;
    }
    case MAINSTATE_RUN_FUNC:
      if (!RunEasyChatFunction()) _setTState(taskId, MAINSTATE_HANDLE_INPUT);
      break;
    case MAINSTATE_TO_QUIZ_LADY:
      if (gPaletteFade && !gPaletteFade.active) EnterQuizLadyScreen(_tFuncId(taskId));
      break;
    case MAINSTATE_EXIT:
      if (gPaletteFade && !gPaletteFade.active) {
        ExitEasyChatScreen(_GetWordTaskArg<MainCallback>(taskId, TASKIDX_EXIT_CALLBACK));
      }
      break;
    case MAINSTATE_WAIT_FADE_IN:
      if (gPaletteFade && !gPaletteFade.active) _setTState(taskId, MAINSTATE_HANDLE_INPUT);
      break;
  }
}

// ----------------------------------------------------------------------------
// InitEasyChatScreen (easy_chat.c:1400-1445)
// ----------------------------------------------------------------------------
// Returns TRUE if still initializing, FALSE when finished. If an allocation
// fails it switches to the exit callback.
function InitEasyChatScreen(taskId: number): boolean {
  const SetVBlankCallback     = _g<(cb: (() => void) | null) => void>('SetVBlankCallback');
  const ResetSpriteData       = _g<() => void>('ResetSpriteData');
  const FreeAllSpritePalettes = _g<() => void>('FreeAllSpritePalettes');
  const ResetPaletteFade      = _g<() => void>('ResetPaletteFade');

  switch (_tState(taskId)) {
    case 0:
      if (SetVBlankCallback)     SetVBlankCallback(null);
      if (ResetSpriteData)       ResetSpriteData();
      if (FreeAllSpritePalettes) FreeAllSpritePalettes();
      if (ResetPaletteFade)      ResetPaletteFade();
      break;
    case 1:
      if (!InitEasyChatScreenWordData()) {
        ExitEasyChatScreen(_GetWordTaskArg<MainCallback>(taskId, TASKIDX_EXIT_CALLBACK));
      }
      break;
    case 2:
      if (!InitEasyChatScreenStruct(
        _tType(taskId),
        _GetWordTaskArg<Uint16Array>(taskId, TASKIDX_WORDS),
        _tPersonType(taskId),
      )) {
        ExitEasyChatScreen(_GetWordTaskArg<MainCallback>(taskId, TASKIDX_EXIT_CALLBACK));
      }
      break;
    case 3:
      if (!InitEasyChatScreenControl()) {
        ExitEasyChatScreen(_GetWordTaskArg<MainCallback>(taskId, TASKIDX_EXIT_CALLBACK));
      }
      break;
    case 4:
      if (LoadEasyChatScreen()) {
        return true;
      }
      break;
    default:
      return false;
  }
  _setTState(taskId, _tState(taskId) + 1);
  return true;
}

// ----------------------------------------------------------------------------
// ExitEasyChatScreen (easy_chat.c:1447-1454)
// ----------------------------------------------------------------------------
export function ExitEasyChatScreen(callback: MainCallback): void {
  const FreeAllWindowBuffers = _g<() => void>('FreeAllWindowBuffers');
  const SetMainCallback2     = _g<(cb: MainCallback) => void>('SetMainCallback2');
  FreeEasyChatScreenControl();
  FreeEasyChatScreenStruct();
  FreeEasyChatScreenWordData();
  if (FreeAllWindowBuffers) FreeAllWindowBuffers();
  if (SetMainCallback2)     SetMainCallback2(callback);
}

// ----------------------------------------------------------------------------
// ShowEasyChatScreen (easy_chat.c:1456-1500 partial — function continues past 1500)
// ----------------------------------------------------------------------------
// 1:1 STRICT : the switch statement begins at line 1462 and extends beyond
// line 1500. Only the cases visible in scope (PROFILE, BATTLE_START,
// BATTLE_WON, BATTLE_LOST, MAIL, BARD_SONG, INTERVIEW, FAN_CLUB, DUMMY_SHOW,
// TRENDY_PHRASE — case partial) are ported. Remaining cases live in a
// deferred port.
export function ShowEasyChatScreen(): void {
  const gSpecialVar_0x8004 = _g<{ value: number }>('gSpecialVar_0x8004');
  const gSpecialVar_0x8005 = _g<{ value: number }>('gSpecialVar_0x8005');
  const gSpecialVar_0x8006 = _g<{ value: number }>('gSpecialVar_0x8006');
  const sb1 = _g<any>('gSaveBlock1Ptr');

  let words: Uint16Array | null = null;
  let displayedPersonType = _EC('EASY_CHAT_PERSON_DISPLAY_NONE');

  const type = gSpecialVar_0x8004 ? gSpecialVar_0x8004.value : 0;

  switch (type) {
    case _EC('EASY_CHAT_TYPE_PROFILE'):
      words = sb1 ? sb1.easyChatProfile : null;
      break;
    case _EC('EASY_CHAT_TYPE_BATTLE_START'):
      words = sb1 ? sb1.easyChatBattleStart : null;
      break;
    case _EC('EASY_CHAT_TYPE_BATTLE_WON'):
      words = sb1 ? sb1.easyChatBattleWon : null;
      break;
    case _EC('EASY_CHAT_TYPE_BATTLE_LOST'):
      words = sb1 ? sb1.easyChatBattleLost : null;
      break;
    case _EC('EASY_CHAT_TYPE_MAIL'): {
      const idx = gSpecialVar_0x8005 ? gSpecialVar_0x8005.value : 0;
      words = sb1 && sb1.mail ? sb1.mail[idx].words : null;
      break;
    }
    case _EC('EASY_CHAT_TYPE_BARD_SONG'): {
      const NUM_BARD_SONG_WORDS = _EC('NUM_BARD_SONG_WORDS') || 6;
      const bard = sb1 && sb1.oldMan ? sb1.oldMan.bard : null;
      if (bard) {
        for (let i = 0; i < NUM_BARD_SONG_WORDS; i++) {
          bard.newSongLyrics[i] = bard.songLyrics[i];
        }
        words = bard.newSongLyrics;
      }
      break;
    }
    case _EC('EASY_CHAT_TYPE_INTERVIEW'): {
      const idx = gSpecialVar_0x8005 ? gSpecialVar_0x8005.value : 0;
      words = sb1 && sb1.tvShows ? sb1.tvShows[idx].bravoTrainer.words : null;
      displayedPersonType = gSpecialVar_0x8006 ? gSpecialVar_0x8006.value : 0;
      break;
    }
    case _EC('EASY_CHAT_TYPE_FAN_CLUB'): {
      const idx = gSpecialVar_0x8005 ? gSpecialVar_0x8005.value : 0;
      const subIdx = gSpecialVar_0x8006 ? gSpecialVar_0x8006.value : 0;
      words = sb1 && sb1.tvShows ? sb1.tvShows[idx].fanclubOpinions.words.subarray(subIdx) : null;
      displayedPersonType = _EC('EASY_CHAT_PERSON_REPORTER_FEMALE');
      break;
    }
    case _EC('EASY_CHAT_TYPE_DUMMY_SHOW'): {
      const idx = gSpecialVar_0x8005 ? gSpecialVar_0x8005.value : 0;
      words = sb1 && sb1.tvShows ? sb1.tvShows[idx].dummy.words : null;
      displayedPersonType = _EC('EASY_CHAT_PERSON_REPORTER_MALE');
      break;
    }
    case _EC('EASY_CHAT_TYPE_TRENDY_PHRASE'): {
      // Decomp continues past line 1500. Use gStringVar3 as base pointer.
      const gStringVar3 = _g<Uint16Array>('gStringVar3');
      words = gStringVar3 ?? null;
      // 1:1 TODO : remaining cases (APPRENTICE / GOOD_SAYING / QUESTIONNAIRE /
      // GABBY_AND_TY / BATTLE_TOWER_INTERVIEW / CONTEST_INTERVIEW /
      // FAN_QUESTION / QUIZ_*) — port lines 1500-1636 easy_chat.c (separate agent)
      break;
    }
    default:
      console.warn('[easy-chat-init] ShowEasyChatScreen STUB — port lines 1500-1636 easy_chat.c (separate agent) for type=' + type);
      return;
  }

  DoEasyChatScreen(type, words, null, displayedPersonType);
}

// ----------------------------------------------------------------------------
// Public exports for downstream UI modules + tests
// ----------------------------------------------------------------------------
export const _internals = {
  // enums (private to scope 1-1500)
  PALTAG_TRIANGLE_CURSOR, PALTAG_RECTANGLE_CURSOR, PALTAG_MISC_UI, PALTAG_RS_INTERVIEW_FRAME,
  GFXTAG_TRIANGLE_CURSOR, GFXTAG_RECTANGLE_CURSOR, GFXTAG_SCROLL_INDICATOR,
  GFXTAG_START_SELECT_BUTTONS, GFXTAG_MODE_WINDOW, GFXTAG_RS_INTERVIEW_FRAME, GFXTAG_BUTTON_WINDOW,
  INPUTSTATE_PHRASE, INPUTSTATE_MAIN_SCREEN_BUTTONS, INPUTSTATE_KEYBOARD, INPUTSTATE_WORD_SELECT,
  INPUTSTATE_EXIT_PROMPT, INPUTSTATE_DELETE_ALL_YES_NO, INPUTSTATE_CONFIRM_WORDS_YES_NO,
  INPUTSTATE_QUIZ_QUESTION, INPUTSTATE_WAIT_FOR_MSG, INPUTSTATE_START_CONFIRM_LYRICS,
  INPUTSTATE_CONFIRM_LYRICS_YES_NO,
  MAINSTATE_FADE_IN, MAINSTATE_HANDLE_INPUT, MAINSTATE_RUN_FUNC, MAINSTATE_TO_QUIZ_LADY,
  MAINSTATE_EXIT, MAINSTATE_WAIT_FADE_IN,
  TEXT_GROUPS, TEXT_ALPHABET, TEXT_WORD_SELECT,
  NUM_ALPHABET_ROWS, NUM_GROUP_NAME_ROWS, NUM_WORD_SELECT_ROWS, NUM_BUTTON_ROWS,
  NUM_ALPHABET_COLUMNS, NUM_GROUP_NAME_COLUMNS, NUM_WORD_SELECT_COLUMNS,
  FRAMEID_GENERAL_2x2, FRAMEID_GENERAL_2x3, FRAMEID_MAIL, FRAMEID_COMBINE_TWO_WORDS,
  FRAMEID_INTERVIEW_SHOW_PERSON, FRAMEID_INTERVIEW, FRAMEID_QUIZ_ANSWER,
  FRAMEID_QUIZ_QUESTION, FRAMEID_QUIZ_SET_QUESTION,
  FOOTER_NORMAL, FOOTER_QUIZ, FOOTER_ANSWER, NUM_FOOTER_TYPES,
  WINANIM_OPEN_KEYBOARD, WINANIM_CLOSE_KEYBOARD, WINANIM_OPEN_WORD_SELECT,
  WINANIM_CLOSE_WORD_SELECT, WINANIM_RETURN_TO_KEYBOARD, WINANIM_KEYBOARD_SWITCH_OUT,
  WINANIM_KEYBOARD_SWITCH_IN,
  WIN_TITLE, WIN_MSG, WIN_INPUT_SELECT,
  FRAME_OFFSET_ORANGE, FRAME_OFFSET_GREEN, FRAME_TILE_TRANSPARENT, FRAME_TILE_TOP_L_CORNER,
  FRAME_TILE_TOP_EDGE, FRAME_TILE_TOP_R_CORNER, FRAME_TILE_L_EDGE, FRAME_TILE_R_EDGE,
  FRAME_TILE_BOTTOM_L_CORNER, FRAME_TILE_BOTTOM_EDGE, FRAME_TILE_BOTTOM_R_CORNER,
  RECTCURSOR_ANIM_ON_GROUP, RECTCURSOR_ANIM_ON_BUTTON, RECTCURSOR_ANIM_ON_OTHERS, RECTCURSOR_ANIM_ON_LETTER,
  MODEWINDOW_ANIM_HIDDEN, MODEWINDOW_ANIM_TO_GROUP, MODEWINDOW_ANIM_TO_ALPHABET,
  MODEWINDOW_ANIM_TO_HIDDEN, MODEWINDOW_ANIM_TRANSITION,
  TASKIDX_WORDS, TASKIDX_EXIT_CALLBACK,
  // data tables
  getEasyChatScreenTemplates, sAlphabetGroupIdMap, getMysteryGiftPhrase, getBerryMasterWifePhrases,
  sPhraseFrameDimensions, sEasyChatBgTemplates, sEasyChatWindowTemplates,
  sEasyChatYesNoWindowTemplate, sText_Clear17, getEasyChatKeyboardAlphabet,
  getSpriteSheets, getSpritePalettes, getCompressedSpriteSheets,
  sAlphabetKeyboardColumnOffsets,
  sOamData_TriangleCursor, sSpriteTemplate_TriangleCursor,
  sOamData_RectangleCursor, sAnims_RectangleCursor, sSpriteTemplate_RectangleCursor,
  sOamData_ModeWindow, sAnims_ModeWindow, sSpriteTemplate_ModeWindow,
  sOamData_ButtonWindow, sSpriteTemplate_ButtonWindow,
  sOamData_StartSelectButton, sOamData_ScrollIndicator, sAnims_TwoFrame,
  sSpriteTemplate_StartSelectButton, sSpriteTemplate_ScrollIndicator,
  sFooterOptionXOffsets, getFooterTextOptions,
  getEasyChatGroupNamePointers,
  getDefaultProfileWords, getDefaultBattleStartWords, getDefaultBattleWonWords,
  getDefaultBattleLostWords, getRestrictedWordSpecies,
  sQuizLadyEasyChatScreens,
  // task accessors
  _tState, _setTState, _tType, _setTType, _tFuncId, _setTFuncId,
  _tPersonType, _setTPersonType, _setTaskFunc,
  _stashRef, _retrieveRef, _GetWordTaskArg,
};
