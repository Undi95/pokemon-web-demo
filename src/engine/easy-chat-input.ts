/**
 * easy-chat-input.ts — Port 1:1 STRICT de easy_chat.c lignes 1500-3000.
 *
 * Source de vérité (= 1:1 EXACT) :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/easy_chat.c` lignes 1500-3000
 *   - `D:/Projet 1/decomps/pokeemeraude/include/easy_chat.h`
 *
 * SCOPE STRICT (= ce fichier) :
 *
 *   CALLBACKS et TASKS (= easy_chat.c:1294-1455) :
 *     - DoEasyChatScreen (= easy_chat.c:1294, headerized — déjà appelée par
 *       ShowEasyChatScreen). On la porte ici car référencée par les autres
 *       entry points (Quiz/Question) qui sont aussi dans ce scope.
 *     - CB2_EasyChatScreen (= easy_chat.c:1307)
 *     - VBlankCB_EasyChatScreen (= easy_chat.c:1315)
 *     - StartEasyChatScreen (= easy_chat.c:1322)
 *     - Task_InitEasyChatScreen (= easy_chat.c:1328)
 *     - Task_EasyChatScreen (= easy_chat.c:1343)
 *     - InitEasyChatScreen (= easy_chat.c:1400) — wrapper état machine init.
 *     - ExitEasyChatScreen (= easy_chat.c:1447)
 *
 *   QUIZ LADY (= easy_chat.c:1573-1635) :
 *     - CB2_QuizLadyQuestion (= easy_chat.c:1550) — appelle DoQuizQuestion…
 *     - QuizLadyShowQuizQuestion (= easy_chat.c:1573) — public.
 *     - GetQuizLadyScreenByFuncId (= easy_chat.c:1578)
 *     - IsFuncIdForQuizLadyScreen (= easy_chat.c:1590)
 *     - EnterQuizLadyScreen (= easy_chat.c:1595)
 *     - DoQuizAnswerEasyChatScreen (= easy_chat.c:1604)
 *     - DoQuizQuestionEasyChatScreen (= easy_chat.c:1613)
 *     - DoQuizSetAnswerEasyChatScreen (= easy_chat.c:1621)
 *     - DoQuizSetQuestionEasyChatScreen (= easy_chat.c:1629)
 *
 *   ALLOC + FREE STRUCT (= easy_chat.c:1637-1694) :
 *     - InitEasyChatScreenStruct (= easy_chat.c:1637)
 *     - FreeEasyChatScreenStruct (= easy_chat.c:1691)
 *
 *   INPUT HANDLERS (= easy_chat.c:1696-2068) :
 *     - HandleEasyChatInput (= easy_chat.c:1698)
 *     - IsCurrentFrame2x5 (= easy_chat.c:1728)
 *     - HandleEasyChatInput_Phrase (= easy_chat.c:1741)
 *     - HandleEasyChatInput_MainScreenButtons (= easy_chat.c:1818)
 *     - HandleEasyChatInput_Keyboard (= easy_chat.c:1892)
 *     - HandleEasyChatInput_WordSelect (= easy_chat.c:1933)
 *     - HandleEasyChatInput_ExitPrompt (= easy_chat.c:1965)
 *     - HandleEasyChatInput_ConfirmWordsYesNo (= easy_chat.c:1985)
 *     - HandleEasyChatInput_DeleteAllYesNo (= easy_chat.c:2003)
 *     - HandleEasyChatInput_QuizQuestion (= easy_chat.c:2020)
 *     - HandleEasyChatInput_WaitForMsg (= easy_chat.c:2033)
 *     - HandleEasyChatInput_StartConfirmLyrics (= easy_chat.c:2045)
 *     - HandleEasyChatInput_ConfirmLyricsYesNo (= easy_chat.c:2051)
 *
 *   INPUT BRANCHING (= easy_chat.c:2070-2289) :
 *     - StartConfirmExitPrompt (= easy_chat.c:2070)
 *     - DoDeleteAllButton (= easy_chat.c:2087)
 *     - TryConfirmWords (= easy_chat.c:2105)
 *     - DoQuizButton (= easy_chat.c:2184)
 *     - GetEasyChatBackupState (= easy_chat.c:2202)
 *     - SelectKeyboardGroup (= easy_chat.c:2207)
 *     - ExitKeyboardToMainScreen (= easy_chat.c:2233)
 *     - StartSwitchKeyboardMode (= easy_chat.c:2239)
 *     - DeleteSelectedWord (= easy_chat.c:2252)
 *     - SelectNewWord (= easy_chat.c:2266)
 *
 *   PHRASE / WORD HELPERS (= easy_chat.c:2291-2329) :
 *     - SaveCurrentPhrase (= easy_chat.c:2291)
 *     - ResetCurrentPhrase (= easy_chat.c:2298)
 *     - ResetCurrentPhraseToSaved (= easy_chat.c:2305)
 *     - SetSelectedWord (= easy_chat.c:2312)
 *     - DidPhraseChange (= easy_chat.c:2319)
 *     - GetEasyChatCompleted (= easy_chat.c:2332)
 *
 *   CURSOR MOVEMENT (= easy_chat.c:2351-2604) :
 *     - MoveKeyboardCursor / _GroupNames / _Alphabet / _ButtonWindow
 *     - SetKeyboardCursorInButtonWindow / SetKeyboardCursorToLastColumn
 *     - MoveWordSelectCursor
 *     - GetWordIndexToReplace / GetSelectedGroupIndex
 *     - GetSelectedAlphabetGroupId / GetSelectedWordIndex
 *     - GetLastAlphabetColumn
 *     - ReduceToValidKeyboardColumn / ReduceToValidWordSelectColumn
 *     - IsSelectedKeyboardIndexInvalid / IsSelectedWordIndexInvalid
 *
 *   PUBLIC GETTERS (= easy_chat.c:2677-2853) :
 *     - FooterHasFourOptions / GetEasyChatScreenType / GetEasyChatScreenFrameId
 *     - GetTitleText / GetCurrentPhrase / GetNumRows / GetNumColumns
 *     - GetMainCursorColumn / GetMainCursorRow
 *     - GetEasyChatInstructionsText / GetEasyChatConfirmText
 *     - GetEasyChatConfirmExitText / GetEasyChatConfirmDeletionText
 *     - GetKeyboardCursorColAndRow / GetInAlphabetMode / GetKeyboardScrollOffset
 *     - GetWordSelectColAndRow / GetWordSelectScrollOffset / GetWordSelectLastRow
 *     - UnusedDummy / CanScrollUp / CanScrollDown / FooterHasFourOptions_
 *     - IsPhraseDifferentThanPlayerInput / GetDisplayedPersonType
 *
 *   TEMPLATE / PHRASE CHECKS (= easy_chat.c:2855-3000) :
 *     - GetEachChatScreenTemplateId (= easy_chat.c:2855)
 *     - IsCurrentPhraseEmpty / IsCurrentPhraseFull
 *     - IsQuizQuestionEmpty / IsQuizAnswerEmpty
 *     - GetQuizTitle (= easy_chat.c:2922)
 *     - BufferCurrentPhraseToStringVar2 (= easy_chat.c:2943)
 *     - SetSpecialEasyChatResult (= easy_chat.c:2965)
 *     - DidPlayerInputMysteryGiftPhrase (= easy_chat.c:2988)
 *     - DidPlayerInputABerryMasterWifePhrase (= easy_chat.c:2993,
 *       boucle complète, return final déféré scope >3000 — couvre lignes
 *       1500-3000 strict).
 *
 * STUB explicites pour symboles hors scope (= déférés à autre port) :
 *   - InitEasyChatScreenControl / LoadEasyChatScreen / FreeEasyChatScreenControl
 *     / InitEasyChatScreenWordData / FreeEasyChatScreenWordData
 *     → port = easy-chat-render.ts. Récupérés via setter injection
 *       (= cycle ESM évité).
 *   - StartEasyChatFunction / RunEasyChatFunction (dispatch ECFUNC_*)
 *     → port = easy-chat-render.ts. Idem setter.
 *   - GetUnlockedEasyChatGroupId / SetSelectedWordGroup / GetNumWordsInSelectedGroup
 *     / GetWordFromSelectedGroup / DummyWordCheck / GetNumUnlockedEasyChatGroups
 *     → port = easy-chat-render.ts (section 4 word data). Setter.
 *   - sEasyChatScreenTemplates (= ROM table) → setter injection.
 *   - sQuizLadyEasyChatScreens (= ROM table func→callback) → setter injection.
 *   - sAlphabetGroupIdMap (= ROM table) → setter injection.
 *   - sMysteryGiftPhrase / sBerryMasterWifePhrases → setter injection.
 *   - Helpers texte/var/save : DynamicPlaceholderTextUtil_*, FlagSet,
 *     TVShowConvertInternationalString, CopyEasyChatWordPadded, FadeScreen,
 *     CleanupOverworldWindowsAndTilemaps, ResetTasks, SetMainCallback2,
 *     CreateTask, CB2_ReturnToFieldContinueScript : importés depuis modules
 *     existants (decomp-bridge / decomp-globals / fade-screen / etc.).
 *   - gSaveBlock1Ptr / gSaveBlock2Ptr / gSpecialVar_* / gStringVar2/3 / gMain :
 *     via getRuntime().
 *
 * Contraintes 1:1 STRICT :
 *   - Noms IDENTIQUES au décomp.
 *   - Pas d'imports depuis decomp-data/auto/.
 *   - Pas de hardcoded values (constantes locales 1:1 décomp seulement).
 *   - Ordre statements respecté ; switch/case exhaustifs.
 */

// ─── Imports infrastructure (helpers TS existants) ───────────────────────────

import {
  ResetTasks,
  CreateTask,
  PlaySE,
  BlendPalettes,
  BeginNormalPaletteFade,
  UpdatePaletteFade,
  ResetSpriteData,
  FreeAllSpritePalettes,
  ResetPaletteFade,
  SetVBlankCallback,
  RunTasks,
  AnimateSprites,
  BuildOamBuffer,
  PALETTES_ALL,
  FlagSet,
} from './decomp-bridge';

import {
  getRuntime,
  TransferPlttBuffer,
  LoadOam,
  ProcessSpriteCopyRequests,
} from './decomp-globals';
import { RGB_BLACK } from './decomp-helpers';
import { FADE_TO_BLACK, FadeScreen } from './fade-screen';
import { Menu_ProcessInputNoWrapClearOnChoose } from './gba-menu-system';

import {
  type EasyChatScreen,
  type EasyChatScreenWordData,
  INPUT_UP,
  INPUT_DOWN,
  INPUT_LEFT,
  INPUT_RIGHT,
  INPUT_START,
  INPUT_SELECT,
  ECFUNC_NONE,
  ECFUNC_REPRINT_PHRASE,
  ECFUNC_UPDATE_MAIN_CURSOR,
  ECFUNC_UPDATE_MAIN_CURSOR_ON_BUTTONS,
  ECFUNC_PROMPT_DELETE_ALL,
  ECFUNC_PROMPT_EXIT,
  ECFUNC_PROMPT_CONFIRM,
  ECFUNC_PROMPT_CONFIRM_LYRICS,
  ECFUNC_CLOSE_PROMPT,
  ECFUNC_CLOSE_PROMPT_AFTER_DELETE,
  ECFUNC_OPEN_KEYBOARD,
  ECFUNC_CLOSE_KEYBOARD,
  ECFUNC_OPEN_WORD_SELECT,
  ECFUNC_CLOSE_WORD_SELECT,
  ECFUNC_RETURN_TO_KEYBOARD,
  ECFUNC_UPDATE_KEYBOARD_CURSOR,
  ECFUNC_GROUP_NAMES_SCROLL_DOWN,
  ECFUNC_GROUP_NAMES_SCROLL_UP,
  ECFUNC_UPDATE_WORD_SELECT_CURSOR,
  ECFUNC_WORD_SELECT_SCROLL_UP,
  ECFUNC_WORD_SELECT_SCROLL_DOWN,
  ECFUNC_WORD_SELECT_PAGE_UP,
  ECFUNC_WORD_SELECT_PAGE_DOWN,
  ECFUNC_SWITCH_KEYBOARD_MODE,
  ECFUNC_EXIT,
  ECFUNC_QUIZ_QUESTION,
  ECFUNC_QUIZ_ANSWER,
  ECFUNC_SET_QUIZ_QUESTION,
  ECFUNC_SET_QUIZ_ANSWER,
  ECFUNC_MSG_CREATE_QUIZ,
  ECFUNC_MSG_SELECT_ANSWER,
  ECFUNC_MSG_SONG_TOO_SHORT,
  ECFUNC_MSG_CANT_DELETE_LYRICS,
  ECFUNC_MSG_COMBINE_TWO_WORDS,
  ECFUNC_MSG_CANT_EXIT,
  _setEasyChatScreen,
} from './easy-chat-render';

// ─── Constantes locales 1:1 décomp ───────────────────────────────────────────

// EC_EMPTY_WORD (1:1 include/constants/easy_chat.h).
const EC_EMPTY_WORD = 0xFFFF;

// EASY_CHAT_TYPE_ (1:1 include/constants/easy_chat.h:4-24).
const EASY_CHAT_TYPE_PROFILE              = 0;
const EASY_CHAT_TYPE_MAIL                 = 4;
const EASY_CHAT_TYPE_BARD_SONG            = 5;
const EASY_CHAT_TYPE_INTERVIEW            = 6;
const EASY_CHAT_TYPE_FAN_CLUB             = 7;
const EASY_CHAT_TYPE_TRENDY_PHRASE        = 9;
const EASY_CHAT_TYPE_GABBY_AND_TY         = 10;
const EASY_CHAT_TYPE_CONTEST_INTERVIEW    = 11;
const EASY_CHAT_TYPE_BATTLE_TOWER_INTERVIEW = 12;
const EASY_CHAT_TYPE_GOOD_SAYING          = 13;
const EASY_CHAT_TYPE_FAN_QUESTION         = 14;
const EASY_CHAT_TYPE_QUIZ_ANSWER          = 15;
const EASY_CHAT_TYPE_QUIZ_QUESTION        = 16;
const EASY_CHAT_TYPE_QUIZ_SET_QUESTION    = 17;
const EASY_CHAT_TYPE_QUIZ_SET_ANSWER      = 18;
const EASY_CHAT_TYPE_APPRENTICE           = 19;
const EASY_CHAT_TYPE_QUESTIONNAIRE        = 20;

// EASY_CHAT_PERSON_ (1:1 easy_chat.h:26-29).
const EASY_CHAT_PERSON_DISPLAY_NONE     = 0xFF;
const EASY_CHAT_PERSON_REPORTER_MALE    = 0;
const EASY_CHAT_PERSON_REPORTER_FEMALE  = 1;
const EASY_CHAT_PERSON_BOY              = 2;

// MENU_B_PRESSED (1:1 include/menu.h).
const MENU_B_PRESSED = -1;

// INPUTSTATE_ enum (1:1 easy_chat.c:249-261).
const INPUTSTATE_PHRASE                 = 0;
const INPUTSTATE_MAIN_SCREEN_BUTTONS    = 1;
const INPUTSTATE_KEYBOARD               = 2;
const INPUTSTATE_WORD_SELECT            = 3;
const INPUTSTATE_EXIT_PROMPT            = 4;
const INPUTSTATE_DELETE_ALL_YES_NO      = 5;
const INPUTSTATE_CONFIRM_WORDS_YES_NO   = 6;
const INPUTSTATE_QUIZ_QUESTION          = 7;
const INPUTSTATE_WAIT_FOR_MSG           = 8;
const INPUTSTATE_START_CONFIRM_LYRICS   = 9;
const INPUTSTATE_CONFIRM_LYRICS_YES_NO  = 10;

// MAINSTATE_ enum (1:1 easy_chat.c:264-271).
const MAINSTATE_FADE_IN          = 0;
const MAINSTATE_HANDLE_INPUT     = 1;
const MAINSTATE_RUN_FUNC         = 2;
const MAINSTATE_TO_QUIZ_LADY     = 3;
const MAINSTATE_EXIT             = 4;
const MAINSTATE_WAIT_FADE_IN     = 5;

// FRAMEID_ (1:1 easy_chat.c:344-354).
const FRAMEID_MAIL              = 2;
const FRAMEID_QUIZ_QUESTION     = 7;
const FRAMEID_QUIZ_SET_QUESTION = 8;

// NUM_*_ROWS / COLUMNS (1:1 easy_chat.c:335-342).
const NUM_ALPHABET_ROWS     = 4;
const NUM_GROUP_NAME_ROWS   = 4;
const NUM_WORD_SELECT_ROWS  = 4;
const NUM_BUTTON_ROWS       = 3;
const NUM_ALPHABET_COLUMNS  = 7;
const NUM_GROUP_NAME_COLUMNS = 2;
const NUM_WORD_SELECT_COLUMNS = 2;

// QUIZ_QUESTION_LEN (1:1 include/constants/lilycove_lady.h).
const QUIZ_QUESTION_LEN = 9;

// Buttons (1:1 include/gba/io_reg.h KEY_* / A_BUTTON / B_BUTTON / etc.).
const A_BUTTON      = 1 << 0;
const B_BUTTON      = 1 << 1;
const SELECT_BUTTON = 1 << 2;
const START_BUTTON  = 1 << 3;
const DPAD_RIGHT    = 1 << 4;
const DPAD_LEFT     = 1 << 5;
const DPAD_UP       = 1 << 6;
const DPAD_DOWN     = 1 << 7;

// SE_FAILURE (1:1 include/constants/songs.h).
const SE_FAILURE = 32;

// FLAG_SYS_CHAT_USED (1:1 include/constants/flags.h FLAG_SYS_CHAT_USED).
// API FlagSet projet = string (script-vars.ts). Default 1:1 décomp.
let _FLAG_SYS_CHAT_USED: string = 'FLAG_SYS_CHAT_USED';
export function _setFlagSysChatUsed(v: string): void { _FLAG_SYS_CHAT_USED = v; }

// Task indices into gTasks[].data (1:1 easy_chat.c:223-227 task layout).
// Le décomp utilise des macros tData/tType/tState/tPersonType/tFuncId qui
// indexent gTasks[taskId].data[N]. On reproduit la même indexation (N
// inférés du source, vérifié vs decomp DECLARE_DATA).
//   tState        = data[0]
//   tType         = data[1]
//   tPersonType   = data[2]
//   tFuncId       = data[3]
//   data[4..5]    = TASKIDX_WORDS         (u32 split low/high)
//   data[6..7]    = TASKIDX_EXIT_CALLBACK (u32 split low/high)
const TIDX_STATE       = 0;
const TIDX_TYPE        = 1;
const TIDX_PERSONTYPE  = 2;
const TIDX_FUNCID      = 3;
const TASKIDX_WORDS         = 4;
const TASKIDX_EXIT_CALLBACK = 5;

// ─── EWRAM-level static state (1:1 easy_chat.c:36) ───────────────────────────

/** static EWRAM_DATA struct EasyChatScreen *sEasyChatScreen = NULL;
 *  Local owner (cf. easy_chat.c:1642 Alloc). On expose lecture pour
 *  easy-chat-render.ts via _setEasyChatScreen call. */
let sEasyChatScreen: EasyChatScreen | null = null;

/** Getter local (= ce module = owner principal de la struct sEasyChatScreen,
 *  car InitEasyChatScreenStruct est ici en scope ligne 1637-1689). */
export function _getEasyChatScreen(): EasyChatScreen | null { return sEasyChatScreen; }

// ─── Setters injection (= dependency injection pour briser cycle ESM) ────────

/** sEasyChatScreenTemplates : table ROM. Injectée par easy-chat-init.ts. */
interface EasyChatScreenTemplate {
  type: number;
  numColumns: number;
  numRows: number;
  frameId: number;
  fourFooterOptions: number;
  titleText: Uint8Array | string | null;
  instructionsText1: Uint8Array | string | null;
  instructionsText2: Uint8Array | string | null;
  confirmText1: Uint8Array | string | null;
  confirmText2: Uint8Array | string | null;
}
let sEasyChatScreenTemplates: ReadonlyArray<EasyChatScreenTemplate> = [];
export function _setSEasyChatScreenTemplates(v: ReadonlyArray<EasyChatScreenTemplate>): void {
  sEasyChatScreenTemplates = v;
}

/** sQuizLadyEasyChatScreens : table func→cb. Injectée. */
interface QuizLadyEasyChatScreen {
  funcId: number;
  callback: (() => void) | null;
}
let sQuizLadyEasyChatScreens: ReadonlyArray<QuizLadyEasyChatScreen> = [];
export function _setSQuizLadyEasyChatScreens(v: ReadonlyArray<QuizLadyEasyChatScreen>): void {
  sQuizLadyEasyChatScreens = v;
}

/** sAlphabetGroupIdMap : table 1:1 ROM (= [row][column]). Injectée. */
let sAlphabetGroupIdMap: ReadonlyArray<ReadonlyArray<number>> = [];
export function _setSAlphabetGroupIdMap(v: ReadonlyArray<ReadonlyArray<number>>): void {
  sAlphabetGroupIdMap = v;
}

/** sMysteryGiftPhrase : table ROM (4 mots) — DidPlayerInputMysteryGiftPhrase. */
let sMysteryGiftPhrase: ReadonlyArray<number> = [];
export function _setSMysteryGiftPhrase(v: ReadonlyArray<number>): void {
  sMysteryGiftPhrase = v;
}

/** sBerryMasterWifePhrases : table ROM 2D — DidPlayerInputABerryMasterWifePhrase. */
let sBerryMasterWifePhrases: ReadonlyArray<ReadonlyArray<number>> = [];
export function _setSBerryMasterWifePhrases(v: ReadonlyArray<ReadonlyArray<number>>): void {
  sBerryMasterWifePhrases = v;
}

/** Renderer hooks (= easy-chat-render.ts) injectés via setters. */
let _InitEasyChatScreenWordData: (() => boolean) | null = null;
export function _setInitEasyChatScreenWordData(fn: () => boolean): void {
  _InitEasyChatScreenWordData = fn;
}
let _FreeEasyChatScreenWordData: (() => void) | null = null;
export function _setFreeEasyChatScreenWordData(fn: () => void): void {
  _FreeEasyChatScreenWordData = fn;
}
let _InitEasyChatScreenControl: (() => boolean) | null = null;
export function _setInitEasyChatScreenControl(fn: () => boolean): void {
  _InitEasyChatScreenControl = fn;
}
let _LoadEasyChatScreen: (() => boolean) | null = null;
export function _setLoadEasyChatScreen(fn: () => boolean): void {
  _LoadEasyChatScreen = fn;
}
let _FreeEasyChatScreenControl: (() => void) | null = null;
export function _setFreeEasyChatScreenControl(fn: () => void): void {
  _FreeEasyChatScreenControl = fn;
}
let _StartEasyChatFunction: ((funcId: number) => void) | null = null;
export function _setStartEasyChatFunction(fn: (funcId: number) => void): void {
  _StartEasyChatFunction = fn;
}
let _RunEasyChatFunction: (() => boolean) | null = null;
export function _setRunEasyChatFunction(fn: () => boolean): void {
  _RunEasyChatFunction = fn;
}

/** Word data hooks (= easy-chat-render.ts section 4) injectés via setters. */
let _GetNumUnlockedEasyChatGroups: (() => number) | null = null;
export function _setGetNumUnlockedEasyChatGroups(fn: () => number): void {
  _GetNumUnlockedEasyChatGroups = fn;
}
let _GetUnlockedEasyChatGroupId: ((index: number) => number) | null = null;
export function _setGetUnlockedEasyChatGroupId(fn: (index: number) => number): void {
  _GetUnlockedEasyChatGroupId = fn;
}
let _SetSelectedWordGroup: ((alphabetMode: boolean, groupId: number) => void) | null = null;
export function _setSetSelectedWordGroup(fn: (alphabetMode: boolean, groupId: number) => void): void {
  _SetSelectedWordGroup = fn;
}
let _GetNumWordsInSelectedGroup: (() => number) | null = null;
export function _setGetNumWordsInSelectedGroup(fn: () => number): void {
  _GetNumWordsInSelectedGroup = fn;
}
let _GetWordFromSelectedGroup: ((index: number) => number) | null = null;
export function _setGetWordFromSelectedGroup(fn: (index: number) => number): void {
  _GetWordFromSelectedGroup = fn;
}
let _DummyWordCheck: ((word: number) => boolean) | null = null;
export function _setDummyWordCheck(fn: (word: number) => boolean): void {
  _DummyWordCheck = fn;
}

/** TrySetTrendyPhrase (= mauville_old_man.c). Injecté via setter. */
let _TrySetTrendyPhrase: ((phrase: Uint16Array) => number) | null = null;
export function _setTrySetTrendyPhrase(fn: (phrase: Uint16Array) => number): void {
  _TrySetTrendyPhrase = fn;
}

/** GetQuestionnaireWordsPtr (= ScrShowMysteryEvent ROMHooks). Injecté. */
let _GetQuestionnaireWordsPtr: (() => Uint16Array) | null = null;
export function _setGetQuestionnaireWordsPtr(fn: () => Uint16Array): void {
  _GetQuestionnaireWordsPtr = fn;
}

/** CB2_ReturnToFieldContinueScript (= scripts callback). Injecté. */
let _CB2_ReturnToFieldContinueScript: (() => void) | null = null;
export function _setCB2_ReturnToFieldContinueScript(fn: () => void): void {
  _CB2_ReturnToFieldContinueScript = fn;
}

/** CleanupOverworldWindowsAndTilemaps (= overworld). Injecté. */
let _CleanupOverworldWindowsAndTilemaps: (() => void) | null = null;
export function _setCleanupOverworldWindowsAndTilemaps(fn: () => void): void {
  _CleanupOverworldWindowsAndTilemaps = fn;
}

/** IsOverworldLinkActive (= link). Injecté ou STUB returns false. */
let _IsOverworldLinkActive: (() => boolean) | null = null;
export function _setIsOverworldLinkActive(fn: () => boolean): void {
  _IsOverworldLinkActive = fn;
}
function IsOverworldLinkActive(): boolean {
  if (_IsOverworldLinkActive) return _IsOverworldLinkActive();
  return false;
}

/** FreeAllWindowBuffers (= gba-window-system). Injecté ou STUB. */
let _FreeAllWindowBuffers: (() => void) | null = null;
export function _setFreeAllWindowBuffers(fn: () => void): void {
  _FreeAllWindowBuffers = fn;
}
function FreeAllWindowBuffers(): void {
  if (_FreeAllWindowBuffers) _FreeAllWindowBuffers();
}

/** DynamicPlaceholderTextUtil_Reset / SetPlaceholderPtr / ExpandPlaceholders.
 *  Injectés ou STUB no-op pour GetQuizTitle. */
let _DynamicPlaceholderTextUtil_Reset: (() => void) | null = null;
export function _setDynamicPlaceholderTextUtil_Reset(fn: () => void): void {
  _DynamicPlaceholderTextUtil_Reset = fn;
}
let _DynamicPlaceholderTextUtil_SetPlaceholderPtr: ((idx: number, ptr: Uint8Array | string) => void) | null = null;
export function _setDynamicPlaceholderTextUtil_SetPlaceholderPtr(fn: (idx: number, ptr: Uint8Array | string) => void): void {
  _DynamicPlaceholderTextUtil_SetPlaceholderPtr = fn;
}
let _DynamicPlaceholderTextUtil_ExpandPlaceholders: ((dst: Uint8Array, src: Uint8Array | string) => void) | null = null;
export function _setDynamicPlaceholderTextUtil_ExpandPlaceholders(fn: (dst: Uint8Array, src: Uint8Array | string) => void): void {
  _DynamicPlaceholderTextUtil_ExpandPlaceholders = fn;
}

/** TVShowConvertInternationalString (= tv.c). Injecté. */
let _TVShowConvertInternationalString: ((dst: Uint8Array, src: Uint8Array, lang: number) => void) | null = null;
export function _setTVShowConvertInternationalString(fn: (dst: Uint8Array, src: Uint8Array, lang: number) => void): void {
  _TVShowConvertInternationalString = fn;
}

/** CopyEasyChatWordPadded (= easy_chat.c). Injecté depuis section render. */
let _CopyEasyChatWordPadded: ((dst: Uint8Array, offset: number, word: number, padLen: number) => number) | null = null;
export function _setCopyEasyChatWordPadded(fn: (dst: Uint8Array, offset: number, word: number, padLen: number) => number): void {
  _CopyEasyChatWordPadded = fn;
}

/** gText_Lady / gText_F700sQuiz : strings ROM injectés. */
let _gText_Lady: Uint8Array | string = '';
export function _setGTextLady(v: Uint8Array | string): void { _gText_Lady = v; }
let _gText_F700sQuiz: Uint8Array | string = '';
export function _setGTextF700sQuiz(v: Uint8Array | string): void { _gText_F700sQuiz = v; }

let _gText_StopGivingPkmnMail: Uint8Array | string = '';
export function _setGTextStopGivingPkmnMail(v: Uint8Array | string): void { _gText_StopGivingPkmnMail = v; }
let _gText_LikeToQuitQuiz: Uint8Array | string = '';
export function _setGTextLikeToQuitQuiz(v: Uint8Array | string): void { _gText_LikeToQuitQuiz = v; }
let _gText_ChallengeQuestionMark: Uint8Array | string = '';
export function _setGTextChallengeQuestionMark(v: Uint8Array | string): void { _gText_ChallengeQuestionMark = v; }
let _gText_QuitEditing: Uint8Array | string = '';
export function _setGTextQuitEditing(v: Uint8Array | string): void { _gText_QuitEditing = v; }
let _gText_AllTextBeingEditedWill: Uint8Array | string = '';
export function _setGTextAllTextBeingEditedWill(v: Uint8Array | string): void { _gText_AllTextBeingEditedWill = v; }
let _gText_BeDeletedThatOkay: Uint8Array | string = '';
export function _setGTextBeDeletedThatOkay(v: Uint8Array | string): void { _gText_BeDeletedThatOkay = v; }

// ─── Runtime helpers (= proxy raccourcis vers getRuntime()) ──────────────────

function _rt(): any { return getRuntime() as any; }

function _gSaveBlock1Ptr(): any { return _rt()?.gSaveBlock1Ptr ?? {}; }
function _gSaveBlock2Ptr(): any { return _rt()?.gSaveBlock2Ptr ?? {}; }
function _gMain(): any {
  const r = _rt();
  if (!r) return { state: 0 };
  if (!r.gMain) r.gMain = { state: 0 };
  return r.gMain;
}
function _gPaletteFade(): any {
  const r = _rt();
  return r?.gPaletteFade ?? { active: false };
}
function _gSpecialVar_0x8004_get(): number { return _rt()?.gSpecialVar_0x8004 ?? 0; }
function _gSpecialVar_0x8004_set(v: number): void { const r = _rt(); if (r) r.gSpecialVar_0x8004 = v; }
function _gSpecialVar_0x8005_get(): number { return _rt()?.gSpecialVar_0x8005 ?? 0; }
function _gSpecialVar_0x8006_get(): number { return _rt()?.gSpecialVar_0x8006 ?? 0; }
function _gSpecialVar_Result_set(v: number): void { const r = _rt(); if (r) r.gSpecialVar_Result = v; }
function _gStringVar2(): Uint8Array { const r = _rt(); if (!r.gStringVar2) r.gStringVar2 = new Uint8Array(256); return r.gStringVar2; }
function _gTasks(): any { return _rt()?.gTasks; }

function _taskData(taskId: number): number[] | null {
  const tasks = _gTasks();
  if (!tasks) return null;
  const t = typeof tasks.get === 'function' ? tasks.get(taskId) : tasks[taskId];
  if (!t) return null;
  if (!t.data) t.data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  return t.data as number[];
}

function _setTaskFunc(taskId: number, fn: any): void {
  const tasks = _gTasks();
  if (!tasks) return;
  const t = typeof tasks.get === 'function' ? tasks.get(taskId) : tasks[taskId];
  if (t) t.func = fn;
}

// ─── 1:1 easy_chat.c:1294 DoEasyChatScreen ──────────────────────────────────

/**
 * 1:1 décomp `easy_chat.c:1294 DoEasyChatScreen`. Public entry point.
 * Note : déclarée extern en `easy_chat.h:135`, ré-exportée ici (utilisée par
 *        Quiz Lady helpers locaux + autres callers field via setter).
 */
export function DoEasyChatScreen(
  type: number,
  words: Uint16Array | null,
  exitCallback: (() => void) | null,
  displayedPersonType: number,
): void {
  ResetTasks();
  const taskId = CreateTask(Task_InitEasyChatScreen, 0);
  const data = _taskData(taskId);
  if (data) {
    data[TIDX_TYPE] = type;
    data[TIDX_PERSONTYPE] = displayedPersonType;
  }
  SetWordTaskArg(taskId, TASKIDX_WORDS, words);
  SetWordTaskArg(taskId, TASKIDX_EXIT_CALLBACK, exitCallback);
  const r = _rt();
  if (r?.SetMainCallback2) r.SetMainCallback2(CB2_EasyChatScreen);
}

// SetWordTaskArg / GetWordTaskArg : helpers TS qui stockent objects directs
// (1:1 décomp stocke u32 split low/high, mais en TS on évite la conversion
// pointer→int en remplaçant par stockage direct dans data[] avec slot unique).
const _wordSlot: Array<{ words: Uint16Array | null; cb: (() => void) | null }> = [];
function SetWordTaskArg(taskId: number, idx: number, value: any): void {
  if (!_wordSlot[taskId]) _wordSlot[taskId] = { words: null, cb: null };
  if (idx === TASKIDX_WORDS) _wordSlot[taskId].words = value;
  else if (idx === TASKIDX_EXIT_CALLBACK) _wordSlot[taskId].cb = value;
}
function GetWordTaskArg(taskId: number, idx: number): any {
  const slot = _wordSlot[taskId];
  if (!slot) return null;
  if (idx === TASKIDX_WORDS) return slot.words;
  if (idx === TASKIDX_EXIT_CALLBACK) return slot.cb;
  return null;
}

// ─── 1:1 easy_chat.c:1307 CB2_EasyChatScreen ────────────────────────────────

/** 1:1 décomp `easy_chat.c:1307 CB2_EasyChatScreen`. */
function CB2_EasyChatScreen(): void {
  RunTasks();
  AnimateSprites();
  BuildOamBuffer();
  UpdatePaletteFade();
}

// ─── 1:1 easy_chat.c:1315 VBlankCB_EasyChatScreen ───────────────────────────

/** 1:1 décomp `easy_chat.c:1315 VBlankCB_EasyChatScreen`. */
function VBlankCB_EasyChatScreen(): void {
  TransferPlttBuffer();
  LoadOam();
  ProcessSpriteCopyRequests();
}

// ─── 1:1 easy_chat.c:1322 StartEasyChatScreen ───────────────────────────────

/** 1:1 décomp `easy_chat.c:1322 StartEasyChatScreen`. */
function StartEasyChatScreen(taskId: number, taskFunc: (taskId: number) => void): void {
  _setTaskFunc(taskId, taskFunc);
  const data = _taskData(taskId);
  if (data) data[TIDX_STATE] = MAINSTATE_FADE_IN;
}

// ─── 1:1 easy_chat.c:1328 Task_InitEasyChatScreen ───────────────────────────

/** 1:1 décomp `easy_chat.c:1328 Task_InitEasyChatScreen`. */
function Task_InitEasyChatScreen(taskId: number): void {
  if (!IsOverworldLinkActive()) {
    while (InitEasyChatScreen(taskId)) { /* spin */ }
  } else {
    if (InitEasyChatScreen(taskId) === true)
      return;
  }
  StartEasyChatScreen(taskId, Task_EasyChatScreen);
}

// ─── 1:1 easy_chat.c:1343 Task_EasyChatScreen ───────────────────────────────

/** 1:1 décomp `easy_chat.c:1343 Task_EasyChatScreen`. */
function Task_EasyChatScreen(taskId: number): void {
  let funcId: number;
  const data = _taskData(taskId);
  if (!data) return;

  switch (data[TIDX_STATE]) {
    case MAINSTATE_FADE_IN:
      SetVBlankCallback(VBlankCB_EasyChatScreen);
      BlendPalettes(PALETTES_ALL, 16, 0);
      BeginNormalPaletteFade(PALETTES_ALL, -1, 16, 0, RGB_BLACK);
      data[TIDX_STATE] = MAINSTATE_WAIT_FADE_IN;
      break;
    case MAINSTATE_HANDLE_INPUT:
      funcId = HandleEasyChatInput();
      if (IsFuncIdForQuizLadyScreen(funcId)) {
        // Fade to Quiz Lady screen
        BeginNormalPaletteFade(PALETTES_ALL, -2, 0, 16, RGB_BLACK);
        data[TIDX_STATE] = MAINSTATE_TO_QUIZ_LADY;
        data[TIDX_FUNCID] = funcId;
      } else if (funcId === ECFUNC_EXIT) {
        // Fade and exit Easy Chat
        BeginNormalPaletteFade(PALETTES_ALL, -1, 0, 16, RGB_BLACK);
        data[TIDX_STATE] = MAINSTATE_EXIT;
      } else if (funcId !== ECFUNC_NONE) {
        const SE_SELECT = 5; // 1:1 include/constants/songs.h
        PlaySE(SE_SELECT);
        if (_StartEasyChatFunction) _StartEasyChatFunction(funcId);
        else console.warn('[easy-chat-input STUB] StartEasyChatFunction non injecté');
        data[TIDX_STATE]++; // MAINSTATE_RUN_FUNC
      }
      break;
    case MAINSTATE_RUN_FUNC:
      if (!(_RunEasyChatFunction ? _RunEasyChatFunction() : false))
        data[TIDX_STATE] = MAINSTATE_HANDLE_INPUT;
      break;
    case MAINSTATE_TO_QUIZ_LADY:
      if (!_gPaletteFade().active)
        EnterQuizLadyScreen(data[TIDX_FUNCID]);
      break;
    case MAINSTATE_EXIT:
      if (!_gPaletteFade().active)
        ExitEasyChatScreen(GetWordTaskArg(taskId, TASKIDX_EXIT_CALLBACK));
      break;
    case MAINSTATE_WAIT_FADE_IN:
      if (!_gPaletteFade().active)
        data[TIDX_STATE] = MAINSTATE_HANDLE_INPUT;
      break;
  }
}

// ─── 1:1 easy_chat.c:1400 InitEasyChatScreen ────────────────────────────────

/** 1:1 décomp `easy_chat.c:1400 InitEasyChatScreen`. */
function InitEasyChatScreen(taskId: number): boolean {
  const data = _taskData(taskId);
  if (!data) return false;

  switch (data[TIDX_STATE]) {
    case 0:
      SetVBlankCallback(null);
      ResetSpriteData();
      FreeAllSpritePalettes();
      ResetPaletteFade();
      break;
    case 1:
      if (!(_InitEasyChatScreenWordData ? _InitEasyChatScreenWordData() : false)) {
        // Alloc failed, exit
        ExitEasyChatScreen(GetWordTaskArg(taskId, TASKIDX_EXIT_CALLBACK));
      }
      break;
    case 2:
      if (!InitEasyChatScreenStruct(
            data[TIDX_TYPE],
            GetWordTaskArg(taskId, TASKIDX_WORDS) as (Uint16Array | null),
            data[TIDX_PERSONTYPE])) {
        // Alloc failed, exit
        ExitEasyChatScreen(GetWordTaskArg(taskId, TASKIDX_EXIT_CALLBACK));
      }
      break;
    case 3:
      if (!(_InitEasyChatScreenControl ? _InitEasyChatScreenControl() : false)) {
        // Alloc failed, exit
        ExitEasyChatScreen(GetWordTaskArg(taskId, TASKIDX_EXIT_CALLBACK));
      }
      break;
    case 4:
      if (_LoadEasyChatScreen ? _LoadEasyChatScreen() : false) {
        return true;
      }
      break;
    default:
      return false;
  }
  data[TIDX_STATE]++;
  return true;
}

// ─── 1:1 easy_chat.c:1447 ExitEasyChatScreen ────────────────────────────────

/** 1:1 décomp `easy_chat.c:1447 ExitEasyChatScreen`. */
export function ExitEasyChatScreen(callback: (() => void) | null): void {
  if (_FreeEasyChatScreenControl) _FreeEasyChatScreenControl();
  FreeEasyChatScreenStruct();
  if (_FreeEasyChatScreenWordData) _FreeEasyChatScreenWordData();
  FreeAllWindowBuffers();
  const r = _rt();
  if (r?.SetMainCallback2) r.SetMainCallback2(callback);
}

// ─── 1:1 easy_chat.c:1550 CB2_QuizLadyQuestion ──────────────────────────────

/** 1:1 décomp `easy_chat.c:1550 CB2_QuizLadyQuestion`. */
function CB2_QuizLadyQuestion(): void {
  UpdatePaletteFade();
  switch (_gMain().state) {
    case 0:
      FadeScreen(FADE_TO_BLACK, 0);
      break;
    case 1:
      if (!_gPaletteFade().active) {
        const lilycoveLady = _gSaveBlock1Ptr().lilycoveLady;
        if (lilycoveLady && lilycoveLady.quiz) lilycoveLady.quiz.playerAnswer = EC_EMPTY_WORD;
        if (_CleanupOverworldWindowsAndTilemaps) _CleanupOverworldWindowsAndTilemaps();
        DoQuizQuestionEasyChatScreen();
      }
      return;
  }
  _gMain().state++;
}

// ─── 1:1 easy_chat.c:1573 QuizLadyShowQuizQuestion ──────────────────────────

/** 1:1 décomp `easy_chat.c:1573 QuizLadyShowQuizQuestion`. */
export function QuizLadyShowQuizQuestion(): void {
  const r = _rt();
  if (r?.SetMainCallback2) r.SetMainCallback2(CB2_QuizLadyQuestion);
}

// ─── 1:1 easy_chat.c:1578 GetQuizLadyScreenByFuncId ─────────────────────────

/** 1:1 décomp `easy_chat.c:1578 GetQuizLadyScreenByFuncId`. */
function GetQuizLadyScreenByFuncId(funcId: number): number {
  for (let i = 0; i < sQuizLadyEasyChatScreens.length; i++) {
    if (funcId === sQuizLadyEasyChatScreens[i].funcId)
      return i;
  }
  return -1;
}

// ─── 1:1 easy_chat.c:1590 IsFuncIdForQuizLadyScreen ─────────────────────────

/** 1:1 décomp `easy_chat.c:1590 IsFuncIdForQuizLadyScreen`. */
function IsFuncIdForQuizLadyScreen(funcId: number): boolean {
  return GetQuizLadyScreenByFuncId(funcId) === -1 ? false : true;
}

// ─── 1:1 easy_chat.c:1595 EnterQuizLadyScreen ───────────────────────────────

/** 1:1 décomp `easy_chat.c:1595 EnterQuizLadyScreen`. */
function EnterQuizLadyScreen(funcId: number): void {
  const i = GetQuizLadyScreenByFuncId(funcId);
  ResetTasks();
  ExitEasyChatScreen(sQuizLadyEasyChatScreens[i]?.callback ?? null);
}

// ─── 1:1 easy_chat.c:1604 DoQuizAnswerEasyChatScreen ────────────────────────

/** 1:1 décomp `easy_chat.c:1604 DoQuizAnswerEasyChatScreen`. */
function DoQuizAnswerEasyChatScreen(): void {
  const sb1 = _gSaveBlock1Ptr();
  DoEasyChatScreen(
    EASY_CHAT_TYPE_QUIZ_ANSWER,
    sb1.lilycoveLady?.quiz?.playerAnswer ? new Uint16Array([sb1.lilycoveLady.quiz.playerAnswer]) : null,
    _CB2_ReturnToFieldContinueScript,
    EASY_CHAT_PERSON_DISPLAY_NONE);
}

// ─── 1:1 easy_chat.c:1613 DoQuizQuestionEasyChatScreen ──────────────────────

/** 1:1 décomp `easy_chat.c:1613 DoQuizQuestionEasyChatScreen`. */
function DoQuizQuestionEasyChatScreen(): void {
  const sb1 = _gSaveBlock1Ptr();
  DoEasyChatScreen(
    EASY_CHAT_TYPE_QUIZ_QUESTION,
    sb1.lilycoveLady?.quiz?.question ?? null,
    _CB2_ReturnToFieldContinueScript,
    EASY_CHAT_PERSON_DISPLAY_NONE);
}

// ─── 1:1 easy_chat.c:1621 DoQuizSetAnswerEasyChatScreen ─────────────────────

/** 1:1 décomp `easy_chat.c:1621 DoQuizSetAnswerEasyChatScreen`. */
function DoQuizSetAnswerEasyChatScreen(): void {
  const sb1 = _gSaveBlock1Ptr();
  DoEasyChatScreen(
    EASY_CHAT_TYPE_QUIZ_SET_ANSWER,
    sb1.lilycoveLady?.quiz?.correctAnswer ? new Uint16Array([sb1.lilycoveLady.quiz.correctAnswer]) : null,
    _CB2_ReturnToFieldContinueScript,
    EASY_CHAT_PERSON_DISPLAY_NONE);
}

// ─── 1:1 easy_chat.c:1629 DoQuizSetQuestionEasyChatScreen ───────────────────

/** 1:1 décomp `easy_chat.c:1629 DoQuizSetQuestionEasyChatScreen`. */
function DoQuizSetQuestionEasyChatScreen(): void {
  const sb1 = _gSaveBlock1Ptr();
  DoEasyChatScreen(
    EASY_CHAT_TYPE_QUIZ_SET_QUESTION,
    sb1.lilycoveLady?.quiz?.question ?? null,
    _CB2_ReturnToFieldContinueScript,
    EASY_CHAT_PERSON_DISPLAY_NONE);
}

// ─── 1:1 easy_chat.c:1637 InitEasyChatScreenStruct ──────────────────────────

/** 1:1 décomp `easy_chat.c:1637 InitEasyChatScreenStruct`. */
function InitEasyChatScreenStruct(type: number, words: Uint16Array | null, displayedPersonType: number): boolean {
  sEasyChatScreen = {
    type: 0,
    templateId: 0,
    numColumns: 0,
    numRows: 0,
    inputState: 0,
    mainCursorColumn: 0,
    mainCursorRow: 0,
    maxWords: 0,
    inputStateBackup: 0,
    inAlphabetMode: 0,
    keyboardColumn: 0,
    keyboardRow: 0,
    keyboardScrollOffset: 0,
    keyboardLastRow: 0,
    wordSelectScrollOffset: 0,
    wordSelectLastRow: 0,
    wordSelectColumn: 0,
    wordSelectRow: 0,
    displayedPersonType: 0,
    unused: 0,
    quizTitle: new Uint8Array(32),
    titleText: null,
    savedPhrase: null,
    currentPhrase: new Uint16Array(9),
  };
  if (sEasyChatScreen === null)
    return false;

  // 1:1 propagate vers render module.
  _setEasyChatScreen(sEasyChatScreen);

  sEasyChatScreen.type = type;
  sEasyChatScreen.savedPhrase = words;
  sEasyChatScreen.mainCursorColumn = 0;
  sEasyChatScreen.mainCursorRow = 0;
  sEasyChatScreen.inAlphabetMode = 0; // FALSE
  sEasyChatScreen.displayedPersonType = displayedPersonType;
  sEasyChatScreen.unused = 0;
  const templateId = GetEachChatScreenTemplateId(type);

  if (type === EASY_CHAT_TYPE_QUIZ_QUESTION) {
    GetQuizTitle(sEasyChatScreen.quizTitle);
    sEasyChatScreen.titleText = sEasyChatScreen.quizTitle;
    sEasyChatScreen.inputState = INPUTSTATE_QUIZ_QUESTION;
  } else {
    sEasyChatScreen.inputState = INPUTSTATE_PHRASE;
    sEasyChatScreen.titleText = sEasyChatScreenTemplates[templateId]?.titleText ?? null;
  }

  sEasyChatScreen.numColumns = sEasyChatScreenTemplates[templateId]?.numColumns ?? 0;
  sEasyChatScreen.numRows = sEasyChatScreenTemplates[templateId]?.numRows ?? 0;
  sEasyChatScreen.maxWords = sEasyChatScreen.numColumns * sEasyChatScreen.numRows;
  sEasyChatScreen.templateId = templateId;
  if (sEasyChatScreen.maxWords > sEasyChatScreen.currentPhrase.length)
    sEasyChatScreen.maxWords = sEasyChatScreen.currentPhrase.length;

  if (words !== null) {
    // Phrase starts with words filled in, copy to current phrase
    for (let i = 0; i < sEasyChatScreen.maxWords; i++) {
      sEasyChatScreen.currentPhrase[i] = words[i] ?? 0;
    }
  } else {
    // Phrase starts with no words, fill with empty words and save
    for (let i = 0; i < sEasyChatScreen.maxWords; i++)
      sEasyChatScreen.currentPhrase[i] = EC_EMPTY_WORD;

    sEasyChatScreen.savedPhrase = sEasyChatScreen.currentPhrase;
  }

  const numUnlocked = _GetNumUnlockedEasyChatGroups ? _GetNumUnlockedEasyChatGroups() : 0;
  sEasyChatScreen.keyboardLastRow = ((numUnlocked - 1) / 2 | 0) + 1;
  return true;
}

// ─── 1:1 easy_chat.c:1691 FreeEasyChatScreenStruct ──────────────────────────

/** 1:1 décomp `easy_chat.c:1691 FreeEasyChatScreenStruct`. */
function FreeEasyChatScreenStruct(): void {
  sEasyChatScreen = null;
  _setEasyChatScreen(null);
}

// ─── 1:1 easy_chat.c:1698 HandleEasyChatInput ───────────────────────────────

/** 1:1 décomp `easy_chat.c:1698 HandleEasyChatInput`.
 *  Returns the function ID of the action to take as a result of player's input.
 *  If no action is needed, returns ECFUNC_NONE */
function HandleEasyChatInput(): number {
  if (!sEasyChatScreen) return ECFUNC_NONE;
  switch (sEasyChatScreen.inputState) {
    case INPUTSTATE_PHRASE:
      return HandleEasyChatInput_Phrase();
    case INPUTSTATE_MAIN_SCREEN_BUTTONS:
      return HandleEasyChatInput_MainScreenButtons();
    case INPUTSTATE_KEYBOARD:
      return HandleEasyChatInput_Keyboard();
    case INPUTSTATE_WORD_SELECT:
      return HandleEasyChatInput_WordSelect();
    case INPUTSTATE_EXIT_PROMPT:
      return HandleEasyChatInput_ExitPrompt();
    case INPUTSTATE_DELETE_ALL_YES_NO:
      return HandleEasyChatInput_DeleteAllYesNo();
    case INPUTSTATE_CONFIRM_WORDS_YES_NO:
      return HandleEasyChatInput_ConfirmWordsYesNo();
    case INPUTSTATE_QUIZ_QUESTION:
      return HandleEasyChatInput_QuizQuestion();
    case INPUTSTATE_WAIT_FOR_MSG:
      return HandleEasyChatInput_WaitForMsg();
    case INPUTSTATE_START_CONFIRM_LYRICS:
      return HandleEasyChatInput_StartConfirmLyrics();
    case INPUTSTATE_CONFIRM_LYRICS_YES_NO:
      return HandleEasyChatInput_ConfirmLyricsYesNo();
  }
  return ECFUNC_NONE;
}

// ─── 1:1 easy_chat.c:1728 IsCurrentFrame2x5 ─────────────────────────────────

/** 1:1 décomp `easy_chat.c:1728 IsCurrentFrame2x5`. */
function IsCurrentFrame2x5(): boolean {
  switch (GetEasyChatScreenFrameId()) {
    case FRAMEID_MAIL:
    case FRAMEID_QUIZ_QUESTION:
    case FRAMEID_QUIZ_SET_QUESTION:
      return true;
  }
  return false;
}

// ─── Input read helpers (= JOY_NEW / JOY_REPEAT via runtime) ────────────────

function JOY_NEW(mask: number): boolean {
  const r = _rt();
  if (!r?.gMain) return false;
  return (r.gMain.newKeys & mask) !== 0;
}
function JOY_REPEAT(mask: number): boolean {
  const r = _rt();
  if (!r?.gMain) return false;
  return (r.gMain.newAndRepeatedKeys & mask) !== 0;
}

// ─── 1:1 easy_chat.c:1741 HandleEasyChatInput_Phrase ────────────────────────

/** 1:1 décomp `easy_chat.c:1741 HandleEasyChatInput_Phrase`.
 *  Handles main screen input while cursor is on a word in the phrase */
function HandleEasyChatInput_Phrase(): number {
  if (!sEasyChatScreen) return ECFUNC_NONE;
  do {
    if (JOY_NEW(A_BUTTON)) {
      ClearUnusedField();
      sEasyChatScreen.inputState = INPUTSTATE_KEYBOARD;
      sEasyChatScreen.keyboardColumn = 0;
      sEasyChatScreen.keyboardRow = 0;
      sEasyChatScreen.keyboardScrollOffset = 0;
      return ECFUNC_OPEN_KEYBOARD;
    } else if (JOY_NEW(B_BUTTON)) {
      return StartConfirmExitPrompt();
    } else if (JOY_NEW(START_BUTTON)) {
      return TryConfirmWords();
    } else if (JOY_NEW(DPAD_UP)) {
      sEasyChatScreen.mainCursorRow--;
      break;
    } else if (JOY_NEW(DPAD_LEFT)) {
      sEasyChatScreen.mainCursorColumn--;
      break;
    } else if (JOY_NEW(DPAD_DOWN)) {
      sEasyChatScreen.mainCursorRow++;
      break;
    } else if (JOY_NEW(DPAD_RIGHT)) {
      sEasyChatScreen.mainCursorColumn++;
      break;
    }
    return ECFUNC_NONE;
  } while (false);

  // Handle D-Pad input
  const tpl = sEasyChatScreenTemplates[sEasyChatScreen.templateId];
  const tplNumRows = tpl?.numRows ?? 0;
  const tplNumCols = tpl?.numColumns ?? 0;

  // Wrap row
  if (sEasyChatScreen.mainCursorRow < 0)
    sEasyChatScreen.mainCursorRow = tplNumRows;
  if (sEasyChatScreen.mainCursorRow > tplNumRows)
    sEasyChatScreen.mainCursorRow = 0;

  if (sEasyChatScreen.mainCursorRow === tplNumRows) {
    // Moved onto bottom row (buttons)
    if (sEasyChatScreen.mainCursorColumn > 2)
      sEasyChatScreen.mainCursorColumn = 2;

    sEasyChatScreen.inputState = INPUTSTATE_MAIN_SCREEN_BUTTONS;
    return ECFUNC_UPDATE_MAIN_CURSOR_ON_BUTTONS;
  }

  // Wrap column
  if (sEasyChatScreen.mainCursorColumn < 0)
    sEasyChatScreen.mainCursorColumn = tplNumCols - 1;
  if (sEasyChatScreen.mainCursorColumn >= tplNumCols)
    sEasyChatScreen.mainCursorColumn = 0;

  // All 2x5 phrases are only 9 words long, exclude the bottom right (10th) position
  if (IsCurrentFrame2x5() && sEasyChatScreen.mainCursorColumn === 1 && sEasyChatScreen.mainCursorRow === 4)
    sEasyChatScreen.mainCursorColumn = 0;

  return ECFUNC_UPDATE_MAIN_CURSOR;
}

// ─── 1:1 easy_chat.c:1818 HandleEasyChatInput_MainScreenButtons ─────────────

/** 1:1 décomp `easy_chat.c:1818 HandleEasyChatInput_MainScreenButtons`.
 *  Handles main screen input while cursor is below the phrase on one of
 *  the buttons, e.g. Del. All or Cancel */
function HandleEasyChatInput_MainScreenButtons(): number {
  if (!sEasyChatScreen) return ECFUNC_NONE;
  do {
    if (JOY_NEW(A_BUTTON)) {
      switch (sEasyChatScreen.mainCursorColumn) {
        case 0: // Del. All button
          return DoDeleteAllButton();
        case 1: // Cancel button
          return StartConfirmExitPrompt();
        case 2: // OK button
          return TryConfirmWords();
        case 3: // Quiz/Answer button
          return DoQuizButton();
      }
    }

    if (JOY_NEW(B_BUTTON)) {
      return StartConfirmExitPrompt();
    } else if (JOY_NEW(START_BUTTON)) {
      return TryConfirmWords();
    } else if (JOY_NEW(DPAD_UP)) {
      sEasyChatScreen.mainCursorRow--;
      break;
    } else if (JOY_NEW(DPAD_LEFT)) {
      sEasyChatScreen.mainCursorColumn--;
      break;
    } else if (JOY_NEW(DPAD_DOWN)) {
      sEasyChatScreen.mainCursorRow = 0;
      break;
    } else if (JOY_NEW(DPAD_RIGHT)) {
      sEasyChatScreen.mainCursorColumn++;
      break;
    }
    return ECFUNC_NONE;
  } while (false);

  const tpl = sEasyChatScreenTemplates[sEasyChatScreen.templateId];
  const tplNumRows = tpl?.numRows ?? 0;
  const tplNumCols = tpl?.numColumns ?? 0;

  if (sEasyChatScreen.mainCursorRow === tplNumRows) {
    const numFooterColumns = FooterHasFourOptions() ? 4 : 3;
    if (sEasyChatScreen.mainCursorColumn < 0)
      sEasyChatScreen.mainCursorColumn = numFooterColumns - 1;
    if (sEasyChatScreen.mainCursorColumn >= numFooterColumns)
      sEasyChatScreen.mainCursorColumn = 0;

    return ECFUNC_UPDATE_MAIN_CURSOR_ON_BUTTONS;
  }

  if (sEasyChatScreen.mainCursorColumn >= tplNumCols)
    sEasyChatScreen.mainCursorColumn = tplNumCols - 1;

  // All 2x5 phrases are only 9 words long, exclude the bottom right (10th) position
  if (IsCurrentFrame2x5() && sEasyChatScreen.mainCursorColumn === 1 && sEasyChatScreen.mainCursorRow === 4)
    sEasyChatScreen.mainCursorColumn = 0;

  sEasyChatScreen.inputState = INPUTSTATE_PHRASE;
  return ECFUNC_UPDATE_MAIN_CURSOR;
}

// ─── 1:1 easy_chat.c:1892 HandleEasyChatInput_Keyboard ──────────────────────

/** 1:1 décomp `easy_chat.c:1892 HandleEasyChatInput_Keyboard`. */
function HandleEasyChatInput_Keyboard(): number {
  if (!sEasyChatScreen) return ECFUNC_NONE;
  if (JOY_NEW(B_BUTTON))
    return ExitKeyboardToMainScreen();

  if (JOY_NEW(A_BUTTON)) {
    if (sEasyChatScreen.keyboardColumn !== -1)
      return SelectKeyboardGroup();

    // Cursor is in button window
    switch (sEasyChatScreen.keyboardRow) {
      case 0: // Mode button
        return StartSwitchKeyboardMode();
      case 1: // Delete button
        return DeleteSelectedWord();
      case 2: // Cancel button
        return ExitKeyboardToMainScreen();
    }
  }

  if (JOY_NEW(SELECT_BUTTON))
    return StartSwitchKeyboardMode();

  if (JOY_REPEAT(DPAD_UP))
    return MoveKeyboardCursor(INPUT_UP);
  if (JOY_REPEAT(DPAD_DOWN))
    return MoveKeyboardCursor(INPUT_DOWN);
  if (JOY_REPEAT(DPAD_LEFT))
    return MoveKeyboardCursor(INPUT_LEFT);
  if (JOY_REPEAT(DPAD_RIGHT))
    return MoveKeyboardCursor(INPUT_RIGHT);

  return ECFUNC_NONE;
}

// ─── 1:1 easy_chat.c:1933 HandleEasyChatInput_WordSelect ────────────────────

/** 1:1 décomp `easy_chat.c:1933 HandleEasyChatInput_WordSelect`.
 *  Input handling for the lower window after a word group has been selected */
function HandleEasyChatInput_WordSelect(): number {
  if (!sEasyChatScreen) return ECFUNC_NONE;
  if (JOY_NEW(B_BUTTON)) {
    sEasyChatScreen.inputState = INPUTSTATE_KEYBOARD;
    return ECFUNC_RETURN_TO_KEYBOARD;
  }

  if (JOY_NEW(A_BUTTON))
    return SelectNewWord();

  if (JOY_NEW(START_BUTTON))
    return MoveWordSelectCursor(INPUT_START);
  if (JOY_NEW(SELECT_BUTTON))
    return MoveWordSelectCursor(INPUT_SELECT);

  if (JOY_REPEAT(DPAD_UP))
    return MoveWordSelectCursor(INPUT_UP);
  if (JOY_REPEAT(DPAD_DOWN))
    return MoveWordSelectCursor(INPUT_DOWN);
  if (JOY_REPEAT(DPAD_LEFT))
    return MoveWordSelectCursor(INPUT_LEFT);
  if (JOY_REPEAT(DPAD_RIGHT))
    return MoveWordSelectCursor(INPUT_RIGHT);

  return ECFUNC_NONE;
}

// ─── 1:1 easy_chat.c:1965 HandleEasyChatInput_ExitPrompt ────────────────────

/** 1:1 décomp `easy_chat.c:1965 HandleEasyChatInput_ExitPrompt`. */
function HandleEasyChatInput_ExitPrompt(): number {
  if (!sEasyChatScreen) return ECFUNC_NONE;
  switch (Menu_ProcessInputNoWrapClearOnChoose()) {
    case MENU_B_PRESSED:
    case 1: // No (Continue)
      sEasyChatScreen.inputState = GetEasyChatBackupState();
      return ECFUNC_CLOSE_PROMPT;
    case 0: // Yes (Exit)
      _gSpecialVar_Result_set(0);
      if (sEasyChatScreen.type === EASY_CHAT_TYPE_QUIZ_SET_QUESTION
       || sEasyChatScreen.type === EASY_CHAT_TYPE_QUIZ_SET_ANSWER)
        SaveCurrentPhrase();

      return ECFUNC_EXIT;
    default:
      return ECFUNC_NONE;
  }
}

// ─── 1:1 easy_chat.c:1985 HandleEasyChatInput_ConfirmWordsYesNo ─────────────

/** 1:1 décomp `easy_chat.c:1985 HandleEasyChatInput_ConfirmWordsYesNo`. */
function HandleEasyChatInput_ConfirmWordsYesNo(): number {
  if (!sEasyChatScreen) return ECFUNC_NONE;
  switch (Menu_ProcessInputNoWrapClearOnChoose()) {
    case MENU_B_PRESSED:
    case 1: // No
      sEasyChatScreen.inputState = GetEasyChatBackupState();
      return ECFUNC_CLOSE_PROMPT;
    case 0: // Yes
      SetSpecialEasyChatResult();
      _gSpecialVar_Result_set(GetEasyChatCompleted() ? 1 : 0);
      SaveCurrentPhrase();
      return ECFUNC_EXIT;
    default:
      return ECFUNC_NONE;
  }
}

// ─── 1:1 easy_chat.c:2003 HandleEasyChatInput_DeleteAllYesNo ────────────────

/** 1:1 décomp `easy_chat.c:2003 HandleEasyChatInput_DeleteAllYesNo`. */
function HandleEasyChatInput_DeleteAllYesNo(): number {
  if (!sEasyChatScreen) return ECFUNC_NONE;
  switch (Menu_ProcessInputNoWrapClearOnChoose()) {
    case MENU_B_PRESSED:
    case 1: // No
      sEasyChatScreen.inputState = INPUTSTATE_MAIN_SCREEN_BUTTONS;
      return ECFUNC_CLOSE_PROMPT;
    case 0: // Yes
      ResetCurrentPhrase();
      sEasyChatScreen.inputState = INPUTSTATE_MAIN_SCREEN_BUTTONS;
      return ECFUNC_CLOSE_PROMPT_AFTER_DELETE;
    default:
      return ECFUNC_NONE;
  }
}

// ─── 1:1 easy_chat.c:2020 HandleEasyChatInput_QuizQuestion ──────────────────

/** 1:1 décomp `easy_chat.c:2020 HandleEasyChatInput_QuizQuestion`. */
function HandleEasyChatInput_QuizQuestion(): number {
  if (JOY_NEW(A_BUTTON))
    return ECFUNC_QUIZ_ANSWER;

  if (JOY_NEW(B_BUTTON))
    return StartConfirmExitPrompt();

  return ECFUNC_NONE;
}

// ─── 1:1 easy_chat.c:2033 HandleEasyChatInput_WaitForMsg ────────────────────

/** 1:1 décomp `easy_chat.c:2033 HandleEasyChatInput_WaitForMsg`.
 *  A message has been printed. Wait for player to press A or B,
 *  then return to previous state */
function HandleEasyChatInput_WaitForMsg(): number {
  if (!sEasyChatScreen) return ECFUNC_NONE;
  if (JOY_NEW(A_BUTTON | B_BUTTON)) {
    sEasyChatScreen.inputState = GetEasyChatBackupState();
    return ECFUNC_CLOSE_PROMPT;
  }
  return ECFUNC_NONE;
}

// ─── 1:1 easy_chat.c:2045 HandleEasyChatInput_StartConfirmLyrics ────────────

/** 1:1 décomp `easy_chat.c:2045 HandleEasyChatInput_StartConfirmLyrics`.
 *  Odd, could have been skipped. Just passes to HandleEasyChatInput_ConfirmLyricsYesNo */
function HandleEasyChatInput_StartConfirmLyrics(): number {
  if (!sEasyChatScreen) return ECFUNC_NONE;
  sEasyChatScreen.inputState = INPUTSTATE_CONFIRM_LYRICS_YES_NO;
  return ECFUNC_PROMPT_CONFIRM;
}

// ─── 1:1 easy_chat.c:2051 HandleEasyChatInput_ConfirmLyricsYesNo ────────────

/** 1:1 décomp `easy_chat.c:2051 HandleEasyChatInput_ConfirmLyricsYesNo`. */
function HandleEasyChatInput_ConfirmLyricsYesNo(): number {
  if (!sEasyChatScreen) return ECFUNC_NONE;
  switch (Menu_ProcessInputNoWrapClearOnChoose()) {
    case MENU_B_PRESSED:
    case 1: // No
      ResetCurrentPhraseToSaved();
      sEasyChatScreen.inputStateBackup = INPUTSTATE_PHRASE;
      sEasyChatScreen.inputState = INPUTSTATE_WAIT_FOR_MSG;
      return ECFUNC_MSG_SONG_TOO_SHORT;
    case 0: // Yes
      _gSpecialVar_Result_set(GetEasyChatCompleted() ? 1 : 0);
      SaveCurrentPhrase();
      return ECFUNC_EXIT;
    default:
      return ECFUNC_NONE;
  }
}

// ─── 1:1 easy_chat.c:2070 StartConfirmExitPrompt ────────────────────────────

/** 1:1 décomp `easy_chat.c:2070 StartConfirmExitPrompt`. */
function StartConfirmExitPrompt(): number {
  if (!sEasyChatScreen) return ECFUNC_NONE;
  if (sEasyChatScreen.type === EASY_CHAT_TYPE_APPRENTICE
   || sEasyChatScreen.type === EASY_CHAT_TYPE_CONTEST_INTERVIEW) {
    sEasyChatScreen.inputStateBackup = sEasyChatScreen.inputState;
    sEasyChatScreen.inputState = INPUTSTATE_WAIT_FOR_MSG;
    return ECFUNC_MSG_CANT_EXIT;
  } else {
    sEasyChatScreen.inputStateBackup = sEasyChatScreen.inputState;
    sEasyChatScreen.inputState = INPUTSTATE_EXIT_PROMPT;
    return ECFUNC_PROMPT_EXIT;
  }
}

// ─── 1:1 easy_chat.c:2087 DoDeleteAllButton ─────────────────────────────────

/** 1:1 décomp `easy_chat.c:2087 DoDeleteAllButton`. */
function DoDeleteAllButton(): number {
  if (!sEasyChatScreen) return ECFUNC_NONE;
  sEasyChatScreen.inputStateBackup = sEasyChatScreen.inputState;
  if (sEasyChatScreen.type !== EASY_CHAT_TYPE_BARD_SONG) {
    // Show Delete yes/no
    sEasyChatScreen.inputState = INPUTSTATE_DELETE_ALL_YES_NO;
    return ECFUNC_PROMPT_DELETE_ALL;
  } else {
    // Cannot delete lyrics when setting Bard's song
    sEasyChatScreen.inputStateBackup = sEasyChatScreen.inputState;
    sEasyChatScreen.inputState = INPUTSTATE_WAIT_FOR_MSG;
    return ECFUNC_MSG_CANT_DELETE_LYRICS;
  }
}

// ─── 1:1 easy_chat.c:2105 TryConfirmWords ───────────────────────────────────

/** 1:1 décomp `easy_chat.c:2105 TryConfirmWords`. */
function TryConfirmWords(): number {
  if (!sEasyChatScreen) return ECFUNC_NONE;
  sEasyChatScreen.inputStateBackup = sEasyChatScreen.inputState;
  if (sEasyChatScreen.type === EASY_CHAT_TYPE_QUIZ_SET_QUESTION) {
    if (IsQuizQuestionEmpty()) {
      sEasyChatScreen.inputState = INPUTSTATE_WAIT_FOR_MSG;
      return ECFUNC_MSG_CREATE_QUIZ;
    }
    if (IsQuizAnswerEmpty()) {
      sEasyChatScreen.inputState = INPUTSTATE_WAIT_FOR_MSG;
      return ECFUNC_MSG_SELECT_ANSWER;
    }
    sEasyChatScreen.inputState = INPUTSTATE_CONFIRM_WORDS_YES_NO;
    return ECFUNC_PROMPT_CONFIRM;
  } else if (sEasyChatScreen.type === EASY_CHAT_TYPE_QUIZ_SET_ANSWER) {
    if (IsQuizAnswerEmpty()) {
      sEasyChatScreen.inputState = INPUTSTATE_WAIT_FOR_MSG;
      return ECFUNC_MSG_SELECT_ANSWER;
    }
    if (IsQuizQuestionEmpty()) {
      sEasyChatScreen.inputState = INPUTSTATE_WAIT_FOR_MSG;
      return ECFUNC_MSG_CREATE_QUIZ;
    }
    sEasyChatScreen.inputState = INPUTSTATE_CONFIRM_WORDS_YES_NO;
    return ECFUNC_PROMPT_CONFIRM;
  } else if (sEasyChatScreen.type === EASY_CHAT_TYPE_TRENDY_PHRASE
          || sEasyChatScreen.type === EASY_CHAT_TYPE_GOOD_SAYING) {
    if (!IsCurrentPhraseFull()) {
      sEasyChatScreen.inputState = INPUTSTATE_WAIT_FOR_MSG;
      return ECFUNC_MSG_COMBINE_TWO_WORDS;
    }
    sEasyChatScreen.inputState = INPUTSTATE_CONFIRM_WORDS_YES_NO;
    return ECFUNC_PROMPT_CONFIRM;
  } else if (sEasyChatScreen.type === EASY_CHAT_TYPE_APPRENTICE
          || sEasyChatScreen.type === EASY_CHAT_TYPE_CONTEST_INTERVIEW) {
    if (IsCurrentPhraseEmpty()) {
      sEasyChatScreen.inputState = INPUTSTATE_WAIT_FOR_MSG;
      return ECFUNC_MSG_CANT_EXIT;
    }
    sEasyChatScreen.inputState = INPUTSTATE_CONFIRM_WORDS_YES_NO;
    return ECFUNC_PROMPT_CONFIRM;
  } else if (sEasyChatScreen.type === EASY_CHAT_TYPE_QUESTIONNAIRE) {
    sEasyChatScreen.inputState = INPUTSTATE_CONFIRM_WORDS_YES_NO;
    return ECFUNC_PROMPT_CONFIRM;
  } else {
    if (IsCurrentPhraseEmpty() === true || !GetEasyChatCompleted()) {
      sEasyChatScreen.inputState = INPUTSTATE_EXIT_PROMPT;
      return ECFUNC_PROMPT_EXIT;
    }
    sEasyChatScreen.inputState = INPUTSTATE_CONFIRM_WORDS_YES_NO;
    return ECFUNC_PROMPT_CONFIRM;
  }
}

// ─── 1:1 easy_chat.c:2184 DoQuizButton ──────────────────────────────────────

/** 1:1 décomp `easy_chat.c:2184 DoQuizButton`. */
function DoQuizButton(): number {
  if (!sEasyChatScreen) return ECFUNC_NONE;
  sEasyChatScreen.inputStateBackup = sEasyChatScreen.inputState;
  switch (sEasyChatScreen.type) {
    case EASY_CHAT_TYPE_QUIZ_ANSWER:
      return ECFUNC_QUIZ_QUESTION;
    case EASY_CHAT_TYPE_QUIZ_SET_QUESTION:
      SaveCurrentPhrase();
      return ECFUNC_SET_QUIZ_ANSWER;
    case EASY_CHAT_TYPE_QUIZ_SET_ANSWER:
      SaveCurrentPhrase();
      return ECFUNC_SET_QUIZ_QUESTION;
    default:
      return ECFUNC_NONE;
  }
}

// ─── 1:1 easy_chat.c:2202 GetEasyChatBackupState ────────────────────────────

/** 1:1 décomp `easy_chat.c:2202 GetEasyChatBackupState`. */
function GetEasyChatBackupState(): number {
  return sEasyChatScreen?.inputStateBackup ?? 0;
}

// ─── 1:1 easy_chat.c:2207 SelectKeyboardGroup ───────────────────────────────

/** 1:1 décomp `easy_chat.c:2207 SelectKeyboardGroup`. */
function SelectKeyboardGroup(): number {
  if (!sEasyChatScreen) return ECFUNC_NONE;
  if (!sEasyChatScreen.inAlphabetMode) {
    const groupId = (_GetUnlockedEasyChatGroupId ? _GetUnlockedEasyChatGroupId(GetSelectedGroupIndex()) : 0);
    if (_SetSelectedWordGroup) _SetSelectedWordGroup(false, groupId);
  } else {
    if (_SetSelectedWordGroup) _SetSelectedWordGroup(true, GetSelectedAlphabetGroupId());
  }

  const numWords = _GetNumWordsInSelectedGroup ? _GetNumWordsInSelectedGroup() : 0;
  if (numWords === 0)
    return ECFUNC_NONE;

  sEasyChatScreen.wordSelectLastRow = ((numWords - 1) / 2) | 0;
  sEasyChatScreen.wordSelectScrollOffset = 0;
  sEasyChatScreen.wordSelectColumn = 0;
  sEasyChatScreen.wordSelectRow = 0;
  sEasyChatScreen.inputState = INPUTSTATE_WORD_SELECT;
  return ECFUNC_OPEN_WORD_SELECT;
}

// ─── 1:1 easy_chat.c:2233 ExitKeyboardToMainScreen ──────────────────────────

/** 1:1 décomp `easy_chat.c:2233 ExitKeyboardToMainScreen`. */
function ExitKeyboardToMainScreen(): number {
  if (!sEasyChatScreen) return ECFUNC_NONE;
  sEasyChatScreen.inputState = INPUTSTATE_PHRASE;
  return ECFUNC_CLOSE_KEYBOARD;
}

// ─── 1:1 easy_chat.c:2239 StartSwitchKeyboardMode ───────────────────────────

/** 1:1 décomp `easy_chat.c:2239 StartSwitchKeyboardMode`. */
function StartSwitchKeyboardMode(): number {
  if (!sEasyChatScreen) return ECFUNC_NONE;
  sEasyChatScreen.keyboardColumn = 0;
  sEasyChatScreen.keyboardRow = 0;
  sEasyChatScreen.keyboardScrollOffset = 0;
  if (!sEasyChatScreen.inAlphabetMode)
    sEasyChatScreen.inAlphabetMode = 1; // TRUE
  else
    sEasyChatScreen.inAlphabetMode = 0; // FALSE

  return ECFUNC_SWITCH_KEYBOARD_MODE;
}

// ─── 1:1 easy_chat.c:2252 DeleteSelectedWord ────────────────────────────────

/** 1:1 décomp `easy_chat.c:2252 DeleteSelectedWord`. */
function DeleteSelectedWord(): number {
  if (!sEasyChatScreen) return ECFUNC_NONE;
  if (sEasyChatScreen.type === EASY_CHAT_TYPE_BARD_SONG) {
    PlaySE(SE_FAILURE);
    return ECFUNC_NONE;
  } else {
    SetSelectedWord(EC_EMPTY_WORD);
    return ECFUNC_REPRINT_PHRASE;
  }
}

// ─── 1:1 easy_chat.c:2266 SelectNewWord ─────────────────────────────────────

/** 1:1 décomp `easy_chat.c:2266 SelectNewWord`. */
function SelectNewWord(): number {
  if (!sEasyChatScreen) return ECFUNC_NONE;
  const easyChatWord = _GetWordFromSelectedGroup ? _GetWordFromSelectedGroup(GetSelectedWordIndex()) : 0;
  if (_DummyWordCheck ? _DummyWordCheck(easyChatWord) : false) {
    // Never reached. Would disallow selecting certain words
    PlaySE(SE_FAILURE);
    return ECFUNC_NONE;
  } else {
    SetSelectedWord(easyChatWord);
    if (sEasyChatScreen.type !== EASY_CHAT_TYPE_BARD_SONG) {
      sEasyChatScreen.inputState = INPUTSTATE_PHRASE;
      return ECFUNC_CLOSE_WORD_SELECT;
    } else {
      sEasyChatScreen.inputState = INPUTSTATE_START_CONFIRM_LYRICS;
      return ECFUNC_PROMPT_CONFIRM_LYRICS;
    }
  }
}

// ─── 1:1 easy_chat.c:2291 SaveCurrentPhrase ─────────────────────────────────

/** 1:1 décomp `easy_chat.c:2291 SaveCurrentPhrase`. */
function SaveCurrentPhrase(): void {
  if (!sEasyChatScreen || !sEasyChatScreen.savedPhrase) return;
  for (let i = 0; i < sEasyChatScreen.maxWords; i++)
    sEasyChatScreen.savedPhrase[i] = sEasyChatScreen.currentPhrase[i];
}

// ─── 1:1 easy_chat.c:2298 ResetCurrentPhrase ────────────────────────────────

/** 1:1 décomp `easy_chat.c:2298 ResetCurrentPhrase`. */
function ResetCurrentPhrase(): void {
  if (!sEasyChatScreen) return;
  for (let i = 0; i < sEasyChatScreen.maxWords; i++)
    sEasyChatScreen.currentPhrase[i] = EC_EMPTY_WORD;
}

// ─── 1:1 easy_chat.c:2305 ResetCurrentPhraseToSaved ─────────────────────────

/** 1:1 décomp `easy_chat.c:2305 ResetCurrentPhraseToSaved`. */
function ResetCurrentPhraseToSaved(): void {
  if (!sEasyChatScreen || !sEasyChatScreen.savedPhrase) return;
  for (let i = 0; i < sEasyChatScreen.maxWords; i++)
    sEasyChatScreen.currentPhrase[i] = sEasyChatScreen.savedPhrase[i];
}

// ─── 1:1 easy_chat.c:2312 SetSelectedWord ───────────────────────────────────

/** 1:1 décomp `easy_chat.c:2312 SetSelectedWord`. */
function SetSelectedWord(easyChatWord: number): void {
  if (!sEasyChatScreen) return;
  const index = GetWordIndexToReplace();
  sEasyChatScreen.currentPhrase[index] = easyChatWord;
}

// ─── 1:1 easy_chat.c:2319 DidPhraseChange ───────────────────────────────────

/** 1:1 décomp `easy_chat.c:2319 DidPhraseChange`.
 *  Compare current phrase to the original saved phrase */
function DidPhraseChange(): boolean {
  if (!sEasyChatScreen || !sEasyChatScreen.savedPhrase) return false;
  for (let i = 0; i < sEasyChatScreen.maxWords; i++) {
    if (sEasyChatScreen.currentPhrase[i] !== sEasyChatScreen.savedPhrase[i])
      return true;
  }
  return false;
}

// ─── 1:1 easy_chat.c:2332 GetEasyChatCompleted ──────────────────────────────

/** 1:1 décomp `easy_chat.c:2332 GetEasyChatCompleted`.
 *  'Completed' if the phrase was changed, or in the case of making a quiz,
 *  the question and answer were filled out */
function GetEasyChatCompleted(): boolean {
  if (!sEasyChatScreen) return false;
  if (sEasyChatScreen.type === EASY_CHAT_TYPE_QUIZ_SET_QUESTION
   || sEasyChatScreen.type === EASY_CHAT_TYPE_QUIZ_SET_ANSWER) {
    if (IsQuizQuestionEmpty())
      return false;
    if (IsQuizAnswerEmpty())
      return false;
    return true;
  } else {
    return DidPhraseChange();
  }
}

// ─── 1:1 easy_chat.c:2351 MoveKeyboardCursor ────────────────────────────────

/** 1:1 décomp `easy_chat.c:2351 MoveKeyboardCursor`. */
function MoveKeyboardCursor(input: number): number {
  if (!sEasyChatScreen) return ECFUNC_NONE;
  if (sEasyChatScreen.keyboardColumn !== -1) {
    if (!sEasyChatScreen.inAlphabetMode)
      return MoveKeyboardCursor_GroupNames(input);
    else
      return MoveKeyboardCursor_Alphabet(input);
  } else {
    return MoveKeyboardCursor_ButtonWindow(input);
  }
}

// ─── 1:1 easy_chat.c:2366 MoveKeyboardCursor_GroupNames ─────────────────────

/** 1:1 décomp `easy_chat.c:2366 MoveKeyboardCursor_GroupNames`. */
function MoveKeyboardCursor_GroupNames(input: number): number {
  if (!sEasyChatScreen) return ECFUNC_NONE;
  switch (input) {
    case INPUT_UP:
      if (sEasyChatScreen.keyboardRow !== -sEasyChatScreen.keyboardScrollOffset) {
        if (sEasyChatScreen.keyboardRow) {
          sEasyChatScreen.keyboardRow--;
          return ECFUNC_UPDATE_KEYBOARD_CURSOR;
        } else {
          sEasyChatScreen.keyboardScrollOffset--;
          return ECFUNC_GROUP_NAMES_SCROLL_UP;
        }
      }
      break;
    case INPUT_DOWN:
      if (sEasyChatScreen.keyboardRow + sEasyChatScreen.keyboardScrollOffset < sEasyChatScreen.keyboardLastRow - 1) {
        let funcId: number;
        if (sEasyChatScreen.keyboardRow < NUM_GROUP_NAME_ROWS - 1) {
          sEasyChatScreen.keyboardRow++;
          funcId = ECFUNC_UPDATE_KEYBOARD_CURSOR;
        } else {
          sEasyChatScreen.keyboardScrollOffset++;
          funcId = ECFUNC_GROUP_NAMES_SCROLL_DOWN;
        }
        ReduceToValidKeyboardColumn();
        return funcId;
      }
      break;
    case INPUT_LEFT:
      if (sEasyChatScreen.keyboardColumn)
        sEasyChatScreen.keyboardColumn--;
      else
        SetKeyboardCursorInButtonWindow();
      return ECFUNC_UPDATE_KEYBOARD_CURSOR;
    case INPUT_RIGHT:
      if (sEasyChatScreen.keyboardColumn < 1) {
        sEasyChatScreen.keyboardColumn++;
        if (IsSelectedKeyboardIndexInvalid())
          SetKeyboardCursorInButtonWindow();
      } else {
        SetKeyboardCursorInButtonWindow();
      }
      return ECFUNC_UPDATE_KEYBOARD_CURSOR;
  }
  return ECFUNC_NONE;
}

// ─── 1:1 easy_chat.c:2428 MoveKeyboardCursor_Alphabet ───────────────────────

/** 1:1 décomp `easy_chat.c:2428 MoveKeyboardCursor_Alphabet`. */
function MoveKeyboardCursor_Alphabet(input: number): number {
  if (!sEasyChatScreen) return ECFUNC_NONE;
  switch (input) {
    case INPUT_UP:
      if (sEasyChatScreen.keyboardRow > 0)
        sEasyChatScreen.keyboardRow--;
      else
        sEasyChatScreen.keyboardRow = NUM_ALPHABET_ROWS - 1;
      ReduceToValidKeyboardColumn();
      return ECFUNC_UPDATE_KEYBOARD_CURSOR;
    case INPUT_DOWN:
      if (sEasyChatScreen.keyboardRow < NUM_ALPHABET_ROWS - 1)
        sEasyChatScreen.keyboardRow++;
      else
        sEasyChatScreen.keyboardRow = 0;
      ReduceToValidKeyboardColumn();
      return ECFUNC_UPDATE_KEYBOARD_CURSOR;
    case INPUT_RIGHT:
      sEasyChatScreen.keyboardColumn++;
      if (IsSelectedKeyboardIndexInvalid())
        SetKeyboardCursorInButtonWindow();
      return ECFUNC_UPDATE_KEYBOARD_CURSOR;
    case INPUT_LEFT:
      sEasyChatScreen.keyboardColumn--;
      if (sEasyChatScreen.keyboardColumn < 0)
        SetKeyboardCursorInButtonWindow();
      return ECFUNC_UPDATE_KEYBOARD_CURSOR;
  }
  return ECFUNC_NONE;
}

// ─── 1:1 easy_chat.c:2465 MoveKeyboardCursor_ButtonWindow ───────────────────

/** 1:1 décomp `easy_chat.c:2465 MoveKeyboardCursor_ButtonWindow`. */
function MoveKeyboardCursor_ButtonWindow(input: number): number {
  if (!sEasyChatScreen) return ECFUNC_NONE;
  switch (input) {
    case INPUT_UP:
      if (sEasyChatScreen.keyboardRow)
        sEasyChatScreen.keyboardRow--;
      else
        sEasyChatScreen.keyboardRow = NUM_BUTTON_ROWS - 1;
      return ECFUNC_UPDATE_KEYBOARD_CURSOR;
    case INPUT_DOWN:
      if (sEasyChatScreen.keyboardRow < NUM_BUTTON_ROWS - 1)
        sEasyChatScreen.keyboardRow++;
      else
        sEasyChatScreen.keyboardRow = 0;
      return ECFUNC_UPDATE_KEYBOARD_CURSOR;
    case INPUT_LEFT:
      sEasyChatScreen.keyboardRow++;
      SetKeyboardCursorToLastColumn();
      return ECFUNC_UPDATE_KEYBOARD_CURSOR;
    case INPUT_RIGHT:
      sEasyChatScreen.keyboardColumn = 0;
      sEasyChatScreen.keyboardRow++;
      return ECFUNC_UPDATE_KEYBOARD_CURSOR;
  }
  return ECFUNC_NONE;
}

// ─── 1:1 easy_chat.c:2496 SetKeyboardCursorInButtonWindow ───────────────────

/** 1:1 décomp `easy_chat.c:2496 SetKeyboardCursorInButtonWindow`. */
function SetKeyboardCursorInButtonWindow(): void {
  if (!sEasyChatScreen) return;
  sEasyChatScreen.keyboardColumn = -1;
  if (sEasyChatScreen.keyboardRow)
    sEasyChatScreen.keyboardRow--;
}

// ─── 1:1 easy_chat.c:2503 SetKeyboardCursorToLastColumn ─────────────────────

/** 1:1 décomp `easy_chat.c:2503 SetKeyboardCursorToLastColumn`. */
function SetKeyboardCursorToLastColumn(): void {
  if (!sEasyChatScreen) return;
  if (!sEasyChatScreen.inAlphabetMode) {
    sEasyChatScreen.keyboardColumn = 1;
    ReduceToValidKeyboardColumn();
  } else {
    sEasyChatScreen.keyboardColumn = GetLastAlphabetColumn(sEasyChatScreen.keyboardRow);
  }
}

// ─── 1:1 easy_chat.c:2516 MoveWordSelectCursor ──────────────────────────────

/** 1:1 décomp `easy_chat.c:2516 MoveWordSelectCursor`. */
function MoveWordSelectCursor(input: number): number {
  if (!sEasyChatScreen) return ECFUNC_NONE;
  let funcId: number;
  switch (input) {
    case INPUT_UP:
      if (sEasyChatScreen.wordSelectRow + sEasyChatScreen.wordSelectScrollOffset > 0) {
        if (sEasyChatScreen.wordSelectRow > 0) {
          sEasyChatScreen.wordSelectRow--;
          funcId = ECFUNC_UPDATE_WORD_SELECT_CURSOR;
        } else {
          sEasyChatScreen.wordSelectScrollOffset--;
          funcId = ECFUNC_WORD_SELECT_SCROLL_UP;
        }
        ReduceToValidWordSelectColumn();
        return funcId;
      }
      break;
    case INPUT_DOWN:
      if (sEasyChatScreen.wordSelectRow + sEasyChatScreen.wordSelectScrollOffset < sEasyChatScreen.wordSelectLastRow) {
        if (sEasyChatScreen.wordSelectRow < NUM_WORD_SELECT_ROWS - 1) {
          sEasyChatScreen.wordSelectRow++;
          funcId = ECFUNC_UPDATE_WORD_SELECT_CURSOR;
        } else {
          sEasyChatScreen.wordSelectScrollOffset++;
          funcId = ECFUNC_WORD_SELECT_SCROLL_DOWN;
        }
        ReduceToValidWordSelectColumn();
        return funcId;
      }
      break;
    case INPUT_LEFT:
      if (sEasyChatScreen.wordSelectColumn > 0)
        sEasyChatScreen.wordSelectColumn--;
      else
        sEasyChatScreen.wordSelectColumn = 1;
      ReduceToValidWordSelectColumn();
      return ECFUNC_UPDATE_WORD_SELECT_CURSOR;
    case INPUT_RIGHT:
      if (sEasyChatScreen.wordSelectColumn < 1) {
        sEasyChatScreen.wordSelectColumn++;
        if (IsSelectedWordIndexInvalid())
          sEasyChatScreen.wordSelectColumn = 0;
      } else {
        sEasyChatScreen.wordSelectColumn = 0;
      }
      return ECFUNC_UPDATE_WORD_SELECT_CURSOR;
    case INPUT_START:
      // Page scroll up
      if (sEasyChatScreen.wordSelectScrollOffset) {
        if (sEasyChatScreen.wordSelectScrollOffset >= NUM_WORD_SELECT_ROWS)
          sEasyChatScreen.wordSelectScrollOffset -= NUM_WORD_SELECT_ROWS;
        else
          sEasyChatScreen.wordSelectScrollOffset = 0;
        return ECFUNC_WORD_SELECT_PAGE_UP;
      }
      break;
    case INPUT_SELECT:
      // Page scroll down
      if (sEasyChatScreen.wordSelectScrollOffset <= sEasyChatScreen.wordSelectLastRow - NUM_WORD_SELECT_ROWS) {
        sEasyChatScreen.wordSelectScrollOffset += NUM_WORD_SELECT_ROWS;
        if (sEasyChatScreen.wordSelectScrollOffset > sEasyChatScreen.wordSelectLastRow - NUM_WORD_SELECT_ROWS + 1)
          sEasyChatScreen.wordSelectScrollOffset = sEasyChatScreen.wordSelectLastRow - NUM_WORD_SELECT_ROWS + 1;
        ReduceToValidWordSelectColumn();
        return ECFUNC_WORD_SELECT_PAGE_DOWN;
      }
      break;
  }
  return ECFUNC_NONE;
}

// ─── 1:1 easy_chat.c:2606 GetWordIndexToReplace ─────────────────────────────

/** 1:1 décomp `easy_chat.c:2606 GetWordIndexToReplace`. */
function GetWordIndexToReplace(): number {
  if (!sEasyChatScreen) return 0;
  return (sEasyChatScreen.mainCursorRow * sEasyChatScreen.numColumns) + sEasyChatScreen.mainCursorColumn;
}

// ─── 1:1 easy_chat.c:2611 GetSelectedGroupIndex ─────────────────────────────

/** 1:1 décomp `easy_chat.c:2611 GetSelectedGroupIndex`. */
function GetSelectedGroupIndex(): number {
  if (!sEasyChatScreen) return 0;
  return NUM_GROUP_NAME_COLUMNS * (sEasyChatScreen.keyboardRow + sEasyChatScreen.keyboardScrollOffset) + sEasyChatScreen.keyboardColumn;
}

// ─── 1:1 easy_chat.c:2616 GetSelectedAlphabetGroupId ────────────────────────

/** 1:1 décomp `easy_chat.c:2616 GetSelectedAlphabetGroupId`. */
function GetSelectedAlphabetGroupId(): number {
  if (!sEasyChatScreen) return 0;
  const column = ((sEasyChatScreen.keyboardColumn & 0xFF) < NUM_ALPHABET_COLUMNS) ? sEasyChatScreen.keyboardColumn : 0;
  const row    = ((sEasyChatScreen.keyboardRow & 0xFF) < NUM_ALPHABET_ROWS) ? sEasyChatScreen.keyboardRow : 0;
  return sAlphabetGroupIdMap[row]?.[column] ?? 0;
}

// ─── 1:1 easy_chat.c:2623 GetSelectedWordIndex ──────────────────────────────

/** 1:1 décomp `easy_chat.c:2623 GetSelectedWordIndex`. */
function GetSelectedWordIndex(): number {
  if (!sEasyChatScreen) return 0;
  return NUM_WORD_SELECT_COLUMNS * (sEasyChatScreen.wordSelectRow + sEasyChatScreen.wordSelectScrollOffset) + sEasyChatScreen.wordSelectColumn;
}

// ─── 1:1 easy_chat.c:2629 GetLastAlphabetColumn ─────────────────────────────

/** 1:1 décomp `easy_chat.c:2629 GetLastAlphabetColumn`.
 *  Get the index of the last column in the alphabet keyboard, depending on current row */
function GetLastAlphabetColumn(row: number): number {
  switch (row) {
    case 0:
    default:
      return NUM_ALPHABET_COLUMNS - 1;
    case 1:
      return NUM_ALPHABET_COLUMNS - 2;
      // At 6 letters, only the 2nd row (index 1) has less than the max columns
      // The 3rd and 4th row have 7 letters, the 1st row has 6 letters and 'Others'
  }
}

// ─── 1:1 easy_chat.c:2642 ReduceToValidKeyboardColumn ───────────────────────

/** 1:1 décomp `easy_chat.c:2642 ReduceToValidKeyboardColumn`. */
function ReduceToValidKeyboardColumn(): void {
  if (!sEasyChatScreen) return;
  while (IsSelectedKeyboardIndexInvalid()) {
    if (sEasyChatScreen.keyboardColumn)
      sEasyChatScreen.keyboardColumn--;
    else
      break;
  }
}

// ─── 1:1 easy_chat.c:2653 ReduceToValidWordSelectColumn ─────────────────────

/** 1:1 décomp `easy_chat.c:2653 ReduceToValidWordSelectColumn`. */
function ReduceToValidWordSelectColumn(): void {
  if (!sEasyChatScreen) return;
  while (IsSelectedWordIndexInvalid()) {
    if (sEasyChatScreen.wordSelectColumn)
      sEasyChatScreen.wordSelectColumn--;
    else
      break;
  }
}

// ─── 1:1 easy_chat.c:2664 IsSelectedKeyboardIndexInvalid ────────────────────

/** 1:1 décomp `easy_chat.c:2664 IsSelectedKeyboardIndexInvalid`. */
function IsSelectedKeyboardIndexInvalid(): boolean {
  if (!sEasyChatScreen) return false;
  if (!sEasyChatScreen.inAlphabetMode) {
    const numUnlocked = _GetNumUnlockedEasyChatGroups ? _GetNumUnlockedEasyChatGroups() : 0;
    return GetSelectedGroupIndex() >= numUnlocked ? true : false;
  } else {
    return sEasyChatScreen.keyboardColumn > GetLastAlphabetColumn(sEasyChatScreen.keyboardRow) ? true : false;
  }
}

// ─── 1:1 easy_chat.c:2672 IsSelectedWordIndexInvalid ────────────────────────

/** 1:1 décomp `easy_chat.c:2672 IsSelectedWordIndexInvalid`. */
function IsSelectedWordIndexInvalid(): boolean {
  const num = _GetNumWordsInSelectedGroup ? _GetNumWordsInSelectedGroup() : 0;
  return GetSelectedWordIndex() >= num ? true : false;
}

// ─── 1:1 easy_chat.c:2677 FooterHasFourOptions ──────────────────────────────

/** 1:1 décomp `easy_chat.c:2677 FooterHasFourOptions`. */
function FooterHasFourOptions(): number {
  if (!sEasyChatScreen) return 0;
  return sEasyChatScreenTemplates[sEasyChatScreen.templateId]?.fourFooterOptions ?? 0;
}

// ─── 1:1 easy_chat.c:2682 GetEasyChatScreenType ─────────────────────────────

/** 1:1 décomp `easy_chat.c:2682 GetEasyChatScreenType`. */
export function GetEasyChatScreenType(): number {
  return sEasyChatScreen?.type ?? 0;
}

// ─── 1:1 easy_chat.c:2687 GetEasyChatScreenFrameId ──────────────────────────

/** 1:1 décomp `easy_chat.c:2687 GetEasyChatScreenFrameId`. */
export function GetEasyChatScreenFrameId(): number {
  if (!sEasyChatScreen) return 0;
  return sEasyChatScreenTemplates[sEasyChatScreen.templateId]?.frameId ?? 0;
}

// ─── 1:1 easy_chat.c:2692 GetTitleText ──────────────────────────────────────

/** 1:1 décomp `easy_chat.c:2692 GetTitleText`. */
export function GetTitleText(): Uint8Array | string | null {
  return sEasyChatScreen?.titleText ?? null;
}

// ─── 1:1 easy_chat.c:2697 GetCurrentPhrase ──────────────────────────────────

/** 1:1 décomp `easy_chat.c:2697 GetCurrentPhrase`. */
export function GetCurrentPhrase(): Uint16Array {
  return sEasyChatScreen?.currentPhrase ?? new Uint16Array(0);
}

// ─── 1:1 easy_chat.c:2702 GetNumRows ────────────────────────────────────────

/** 1:1 décomp `easy_chat.c:2702 GetNumRows`. */
export function GetNumRows(): number { return sEasyChatScreen?.numRows ?? 0; }

// ─── 1:1 easy_chat.c:2707 GetNumColumns ─────────────────────────────────────

/** 1:1 décomp `easy_chat.c:2707 GetNumColumns`. */
export function GetNumColumns(): number { return sEasyChatScreen?.numColumns ?? 0; }

// ─── 1:1 easy_chat.c:2712 GetMainCursorColumn ───────────────────────────────

/** 1:1 décomp `easy_chat.c:2712 GetMainCursorColumn`. */
export function GetMainCursorColumn(): number { return sEasyChatScreen?.mainCursorColumn ?? 0; }

// ─── 1:1 easy_chat.c:2717 GetMainCursorRow ──────────────────────────────────

/** 1:1 décomp `easy_chat.c:2717 GetMainCursorRow`. */
export function GetMainCursorRow(): number { return sEasyChatScreen?.mainCursorRow ?? 0; }

// ─── 1:1 easy_chat.c:2722 GetEasyChatInstructionsText ───────────────────────

/** 1:1 décomp `easy_chat.c:2722 GetEasyChatInstructionsText`. */
export function GetEasyChatInstructionsText(): { text1: Uint8Array | string | null; text2: Uint8Array | string | null } {
  if (!sEasyChatScreen) return { text1: null, text2: null };
  const tpl = sEasyChatScreenTemplates[sEasyChatScreen.templateId];
  return { text1: tpl?.instructionsText1 ?? null, text2: tpl?.instructionsText2 ?? null };
}

// ─── 1:1 easy_chat.c:2728 GetEasyChatConfirmText ────────────────────────────

/** 1:1 décomp `easy_chat.c:2728 GetEasyChatConfirmText`. */
export function GetEasyChatConfirmText(): { text1: Uint8Array | string | null; text2: Uint8Array | string | null } {
  if (!sEasyChatScreen) return { text1: null, text2: null };
  const tpl = sEasyChatScreenTemplates[sEasyChatScreen.templateId];
  return { text1: tpl?.confirmText1 ?? null, text2: tpl?.confirmText2 ?? null };
}

// ─── 1:1 easy_chat.c:2734 GetEasyChatConfirmExitText ────────────────────────

/** 1:1 décomp `easy_chat.c:2734 GetEasyChatConfirmExitText`. */
export function GetEasyChatConfirmExitText(): { text1: Uint8Array | string | null; text2: Uint8Array | string | null } {
  if (!sEasyChatScreen) return { text1: null, text2: null };
  switch (sEasyChatScreen.type) {
    case EASY_CHAT_TYPE_MAIL:
      return { text1: _gText_StopGivingPkmnMail, text2: null };
    case EASY_CHAT_TYPE_QUIZ_ANSWER:
    case EASY_CHAT_TYPE_QUIZ_QUESTION:
      return { text1: _gText_LikeToQuitQuiz, text2: _gText_ChallengeQuestionMark };
    default:
      return { text1: _gText_QuitEditing, text2: null };
  }
}

// ─── 1:1 easy_chat.c:2755 GetEasyChatConfirmDeletionText ────────────────────

/** 1:1 décomp `easy_chat.c:2755 GetEasyChatConfirmDeletionText`. */
export function GetEasyChatConfirmDeletionText(): { text1: Uint8Array | string | null; text2: Uint8Array | string | null } {
  return { text1: _gText_AllTextBeingEditedWill, text2: _gText_BeDeletedThatOkay };
}

// ─── 1:1 easy_chat.c:2761 GetKeyboardCursorColAndRow ────────────────────────

/** 1:1 décomp `easy_chat.c:2761 GetKeyboardCursorColAndRow`. */
export function GetKeyboardCursorColAndRow(): { column: number; row: number } {
  if (!sEasyChatScreen) return { column: 0, row: 0 };
  return { column: sEasyChatScreen.keyboardColumn, row: sEasyChatScreen.keyboardRow };
}

// ─── 1:1 easy_chat.c:2767 GetInAlphabetMode ─────────────────────────────────

/** 1:1 décomp `easy_chat.c:2767 GetInAlphabetMode`. */
export function GetInAlphabetMode(): number { return sEasyChatScreen?.inAlphabetMode ?? 0; }

// ─── 1:1 easy_chat.c:2772 GetKeyboardScrollOffset ───────────────────────────

/** 1:1 décomp `easy_chat.c:2772 GetKeyboardScrollOffset`. */
export function GetKeyboardScrollOffset(): number { return sEasyChatScreen?.keyboardScrollOffset ?? 0; }

// ─── 1:1 easy_chat.c:2777 GetWordSelectColAndRow ────────────────────────────

/** 1:1 décomp `easy_chat.c:2777 GetWordSelectColAndRow`. */
export function GetWordSelectColAndRow(): { column: number; row: number } {
  if (!sEasyChatScreen) return { column: 0, row: 0 };
  return { column: sEasyChatScreen.wordSelectColumn, row: sEasyChatScreen.wordSelectRow };
}

// ─── 1:1 easy_chat.c:2783 GetWordSelectScrollOffset ─────────────────────────

/** 1:1 décomp `easy_chat.c:2783 GetWordSelectScrollOffset`. */
export function GetWordSelectScrollOffset(): number { return sEasyChatScreen?.wordSelectScrollOffset ?? 0; }

// ─── 1:1 easy_chat.c:2788 GetWordSelectLastRow ──────────────────────────────

/** 1:1 décomp `easy_chat.c:2788 GetWordSelectLastRow`. */
export function GetWordSelectLastRow(): number { return sEasyChatScreen?.wordSelectLastRow ?? 0; }

// ─── 1:1 easy_chat.c:2793 UnusedDummy ───────────────────────────────────────

/** 1:1 décomp `easy_chat.c:2793 UnusedDummy`. */
function UnusedDummy(): boolean { return false; }

// ─── 1:1 easy_chat.c:2798 CanScrollUp ───────────────────────────────────────

/** 1:1 décomp `easy_chat.c:2798 CanScrollUp`. */
export function CanScrollUp(): boolean {
  if (!sEasyChatScreen) return false;
  switch (sEasyChatScreen.inputState) {
    case INPUTSTATE_KEYBOARD:
      if (!sEasyChatScreen.inAlphabetMode && sEasyChatScreen.keyboardScrollOffset)
        return true;
      break;
    case INPUTSTATE_WORD_SELECT:
      if (sEasyChatScreen.wordSelectScrollOffset)
        return true;
      break;
  }
  return false;
}

// ─── 1:1 easy_chat.c:2815 CanScrollDown ─────────────────────────────────────

/** 1:1 décomp `easy_chat.c:2815 CanScrollDown`. */
export function CanScrollDown(): boolean {
  if (!sEasyChatScreen) return false;
  switch (sEasyChatScreen.inputState) {
    case INPUTSTATE_KEYBOARD:
      if (!sEasyChatScreen.inAlphabetMode && sEasyChatScreen.keyboardScrollOffset + NUM_GROUP_NAME_ROWS <= sEasyChatScreen.keyboardLastRow - 1)
        return true;
      break;
    case INPUTSTATE_WORD_SELECT:
      if (sEasyChatScreen.wordSelectScrollOffset + NUM_WORD_SELECT_ROWS <= sEasyChatScreen.wordSelectLastRow)
        return true;
      break;
  }
  return false;
}

// ─── 1:1 easy_chat.c:2832 FooterHasFourOptions_ ─────────────────────────────

/** 1:1 décomp `easy_chat.c:2832 FooterHasFourOptions_`. */
export function FooterHasFourOptions_(): number {
  return FooterHasFourOptions();
}

// ─── 1:1 easy_chat.c:2837 IsPhraseDifferentThanPlayerInput ──────────────────

/** 1:1 décomp `easy_chat.c:2837 IsPhraseDifferentThanPlayerInput`. */
function IsPhraseDifferentThanPlayerInput(phrase: ReadonlyArray<number>, phraseLength: number): boolean {
  if (!sEasyChatScreen) return false;
  for (let i = 0; i < phraseLength; i++) {
    if (phrase[i] !== sEasyChatScreen.currentPhrase[i])
      return true;
  }
  return false;
}

// ─── 1:1 easy_chat.c:2850 GetDisplayedPersonType ────────────────────────────

/** 1:1 décomp `easy_chat.c:2850 GetDisplayedPersonType`. */
export function GetDisplayedPersonType(): number { return sEasyChatScreen?.displayedPersonType ?? 0; }

// ─── 1:1 easy_chat.c:2855 GetEachChatScreenTemplateId ───────────────────────

/** 1:1 décomp `easy_chat.c:2855 GetEachChatScreenTemplateId`. */
function GetEachChatScreenTemplateId(type: number): number {
  for (let i = 0; i < sEasyChatScreenTemplates.length; i++) {
    if (sEasyChatScreenTemplates[i].type === type)
      return i;
  }
  return 0;
}

// ─── 1:1 easy_chat.c:2868 IsCurrentPhraseEmpty ──────────────────────────────

/** 1:1 décomp `easy_chat.c:2868 IsCurrentPhraseEmpty`. */
function IsCurrentPhraseEmpty(): boolean {
  if (!sEasyChatScreen) return true;
  for (let i = 0; i < sEasyChatScreen.maxWords; i++) {
    if (sEasyChatScreen.currentPhrase[i] !== EC_EMPTY_WORD)
      return false;
  }
  return true;
}

// ─── 1:1 easy_chat.c:2881 IsCurrentPhraseFull ───────────────────────────────

/** 1:1 décomp `easy_chat.c:2881 IsCurrentPhraseFull`. */
function IsCurrentPhraseFull(): boolean {
  if (!sEasyChatScreen) return false;
  for (let i = 0; i < sEasyChatScreen.maxWords; i++) {
    if (sEasyChatScreen.currentPhrase[i] === EC_EMPTY_WORD)
      return false;
  }
  return true;
}

// ─── 1:1 easy_chat.c:2894 IsQuizQuestionEmpty ───────────────────────────────

/** 1:1 décomp `easy_chat.c:2894 IsQuizQuestionEmpty`. */
function IsQuizQuestionEmpty(): boolean {
  if (!sEasyChatScreen) return true;
  if (sEasyChatScreen.type === EASY_CHAT_TYPE_QUIZ_SET_QUESTION)
    return IsCurrentPhraseEmpty();

  const saveBlock1 = _gSaveBlock1Ptr();
  const question = saveBlock1?.lilycoveLady?.quiz?.question;
  if (!question) return true;
  for (let i = 0; i < QUIZ_QUESTION_LEN; i++) {
    if ((question[i] ?? EC_EMPTY_WORD) !== EC_EMPTY_WORD)
      return false;
  }
  return true;
}

// ─── 1:1 easy_chat.c:2912 IsQuizAnswerEmpty ─────────────────────────────────

/** 1:1 décomp `easy_chat.c:2912 IsQuizAnswerEmpty`. */
function IsQuizAnswerEmpty(): boolean {
  if (!sEasyChatScreen) return true;
  if (sEasyChatScreen.type === EASY_CHAT_TYPE_QUIZ_SET_ANSWER)
    return IsCurrentPhraseEmpty();

  const quiz = _gSaveBlock1Ptr()?.lilycoveLady?.quiz;
  return (quiz?.correctAnswer ?? EC_EMPTY_WORD) === EC_EMPTY_WORD ? true : false;
}

// ─── 1:1 easy_chat.c:2922 GetQuizTitle ──────────────────────────────────────

/** 1:1 décomp `easy_chat.c:2922 GetQuizTitle`. */
function GetQuizTitle(dst: Uint8Array): void {
  const name = new Uint8Array(32);
  const saveBlock1 = _gSaveBlock1Ptr();
  if (_DynamicPlaceholderTextUtil_Reset) _DynamicPlaceholderTextUtil_Reset();

  // Buffer author's name
  const playerName: Uint8Array | null = saveBlock1?.lilycoveLady?.quiz?.playerName ?? null;
  const playerNameLen = playerName ? _StringLength(playerName) : 0;
  if (playerNameLen !== 0 && playerName) {
    if (_TVShowConvertInternationalString) {
      _TVShowConvertInternationalString(name, playerName, saveBlock1.lilycoveLady.quiz.language);
    }
    if (_DynamicPlaceholderTextUtil_SetPlaceholderPtr) _DynamicPlaceholderTextUtil_SetPlaceholderPtr(0, name);
  } else {
    if (_DynamicPlaceholderTextUtil_SetPlaceholderPtr) _DynamicPlaceholderTextUtil_SetPlaceholderPtr(0, _gText_Lady);
  }

  // "<author>'s Quiz"
  if (_DynamicPlaceholderTextUtil_ExpandPlaceholders) _DynamicPlaceholderTextUtil_ExpandPlaceholders(dst, _gText_F700sQuiz);
}

function _StringLength(s: Uint8Array | string): number {
  if (typeof s === 'string') return s.length;
  const EOS = 0xFF;
  let len = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === EOS) break;
    len++;
  }
  return len;
}

// ─── 1:1 easy_chat.c:2943 BufferCurrentPhraseToStringVar2 ───────────────────

/** 1:1 décomp `easy_chat.c:2943 BufferCurrentPhraseToStringVar2`. */
function BufferCurrentPhraseToStringVar2(): void {
  if (!sEasyChatScreen) return;
  const phrase = sEasyChatScreen.currentPhrase;
  const str = _gStringVar2();
  let offset = 0;
  let i = 0;
  while (i < sEasyChatScreen.maxWords) {
    if (_CopyEasyChatWordPadded) {
      offset = _CopyEasyChatWordPadded(str, offset, phrase[i], 0);
    }
    str[offset] = 0;
    offset++;
    i++;
  }
  offset--;
  const EOS = 0xFF;
  str[offset] = EOS;
}

// ─── 1:1 easy_chat.c:2965 SetSpecialEasyChatResult ──────────────────────────

/** 1:1 décomp `easy_chat.c:2965 SetSpecialEasyChatResult`. */
function SetSpecialEasyChatResult(): void {
  if (!sEasyChatScreen) return;
  switch (sEasyChatScreen.type) {
    case EASY_CHAT_TYPE_PROFILE:
      FlagSet(_FLAG_SYS_CHAT_USED);
      break;
    case EASY_CHAT_TYPE_QUESTIONNAIRE:
      if (DidPlayerInputMysteryGiftPhrase())
        _gSpecialVar_0x8004_set(2);
      else
        _gSpecialVar_0x8004_set(0);
      break;
    case EASY_CHAT_TYPE_TRENDY_PHRASE:
      BufferCurrentPhraseToStringVar2();
      _gSpecialVar_0x8004_set(_TrySetTrendyPhrase ? _TrySetTrendyPhrase(sEasyChatScreen.currentPhrase) : 0);
      break;
    case EASY_CHAT_TYPE_GOOD_SAYING:
      _gSpecialVar_0x8004_set(DidPlayerInputABerryMasterWifePhrase());
      break;
  }
}

// ─── 1:1 easy_chat.c:2988 DidPlayerInputMysteryGiftPhrase ───────────────────

/** 1:1 décomp `easy_chat.c:2988 DidPlayerInputMysteryGiftPhrase`. */
function DidPlayerInputMysteryGiftPhrase(): number {
  return !IsPhraseDifferentThanPlayerInput(sMysteryGiftPhrase, sMysteryGiftPhrase.length) ? 1 : 0;
}

// ─── 1:1 easy_chat.c:2993 DidPlayerInputABerryMasterWifePhrase ──────────────

/** 1:1 décomp `easy_chat.c:2993 DidPlayerInputABerryMasterWifePhrase`.
 *  Note : boucle complète portée (sortie commune `return 0` est >3000 hors scope
 *  strict mais nécessaire pour comportement sain — = 1:1 return 0 final). */
function DidPlayerInputABerryMasterWifePhrase(): number {
  for (let i = 0; i < sBerryMasterWifePhrases.length; i++) {
    if (!IsPhraseDifferentThanPlayerInput(sBerryMasterWifePhrases[i], sBerryMasterWifePhrases[i].length))
      return i + 1;
  }
  return 0;
}

// ─── ClearUnusedField (référence sEasyChatScreen->unused field) ─────────────

/** Helper interne : reset unused field (= 1:1 décomp sEasyChatScreen->unused
 *  est toujours mis à 0 dans HandleEasyChatInput_Phrase via "ClearUnusedField()").
 *  Le décomp définit ClearUnusedField hors scope (= ligne >3000). Stub local. */
function ClearUnusedField(): void {
  if (!sEasyChatScreen) return;
  sEasyChatScreen.unused = 0;
}

// ─── STUB silencing pour ESLint sur consts inutilisées ──────────────────────

void UnusedDummy;
void DoQuizAnswerEasyChatScreen;
void DoQuizSetAnswerEasyChatScreen;
void DoQuizSetQuestionEasyChatScreen;
void _gSpecialVar_0x8004_get;
void _gSpecialVar_0x8005_get;
void _gSpecialVar_0x8006_get;
void _gSaveBlock2Ptr;
void EASY_CHAT_PERSON_REPORTER_MALE;
void EASY_CHAT_PERSON_REPORTER_FEMALE;
void EASY_CHAT_PERSON_BOY;
