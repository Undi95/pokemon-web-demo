// easy_chat.ts — portage 1:1 de src/easy_chat.c.
//
// Deux parties :
//   1. Conversion words → texte (lecture seule) : GetEasyChatWord/CopyEasyChatWord/
//      ConvertEasyChatWordsToString/GetRandomEasyChatWordFromGroup (mail read).
//   2. Écran de saisie (mail write) : sEasyChatScreen (état input) + HandleEasyChatInput_*
//      + DoEasyChatScreen/CB2/Task. Le RENDU + le contrôle (sScreenControl) + la word-data
//      (sWordData) vivent dans engine/ui/easy-chat-render.ts, câblés via injection.
//
// Données : src/data/easy-chat-words.ts (texte, mail read) + src/data/easy-chat-data.ts
// (gEasyChatGroups complet + templates, écran de saisie), AUTO-GÉN depuis le décomp.

import { gEasyChatWordsByGroup } from './data/easy-chat-words';
import { gSpeciesNames, gMoveNames } from './engine/data/game-data';
import { Random } from './random';

// ─── 1:1 décomp include/constants/easy_chat.h ────────────────────────────────
const EC_MASK_BITS = 9;
const EC_MASK_INDEX = (1 << EC_MASK_BITS) - 1;
const EC_EMPTY_WORD = 0xFFFF;
const EC_GROUP_POKEMON = 0;
const EC_GROUP_MOVE_1 = 18;
const EC_GROUP_MOVE_2 = 19;
const EC_GROUP_POKEMON_NATIONAL = 21;
const EC_NUM_GROUPS = 22;

/** 1:1 décomp `EC_GROUP(word)` (easy_chat.h:1125). */
function EC_GROUP(word: number): number { return word >> EC_MASK_BITS; }
/** 1:1 décomp `EC_INDEX(word)` (easy_chat.h:1126). */
function EC_INDEX(word: number): number { return word & EC_MASK_INDEX; }

// 1:1 décomp gText_ThreeQuestionMarks (mot invalide).
const gText_ThreeQuestionMarks = '???';

/** Nombre de mots du groupe (= `gEasyChatGroups[g].numWords`, ou tables noms). */
function _numWordsInGroup(groupId: number): number {
  switch (groupId) {
    case EC_GROUP_POKEMON:
    case EC_GROUP_POKEMON_NATIONAL:
      return gSpeciesNames.length;
    case EC_GROUP_MOVE_1:
    case EC_GROUP_MOVE_2:
      return gMoveNames.length;
    default: {
      const arr = gEasyChatWordsByGroup[groupId];
      return arr ? arr.length : 0;
    }
  }
}

/** 1:1 décomp `static const u8 *GetEasyChatWord(u8 groupId, u16 index)` (easy_chat.c:5202). */
function GetEasyChatWord(groupId: number, index: number): string {
  switch (groupId) {
    case EC_GROUP_POKEMON:
    case EC_GROUP_POKEMON_NATIONAL:
      return gSpeciesNames[index] ?? '';
    case EC_GROUP_MOVE_1:
    case EC_GROUP_MOVE_2:
      return gMoveNames[index] ?? '';
    default: {
      const arr = gEasyChatWordsByGroup[groupId];
      return (arr && arr[index]) ?? '';
    }
  }
}

/** 1:1 décomp `EC_WORD(groupId, index)` (easy_chat.h) : encode un mot = (group << 9) | index. */
function EC_WORD(groupId: number, index: number): number {
  return (((groupId << EC_MASK_BITS) | index) & 0xFFFF) >>> 0;
}

/** 1:1 décomp `u16 GetRandomEasyChatWordFromGroup(u16 groupId)` (easy_chat.c:5354) :
 *    u16 index = Random() % gEasyChatGroups[groupId].numWords;
 *    if (groupId == POKEMON|POKEMON_NATIONAL|MOVE_1|MOVE_2)
 *        index = gEasyChatGroups[groupId].wordData.valueList[index];
 *    return EC_WORD(groupId, index);
 *
 *  ⚠️ Groupes POKEMON/MOVE (valueList) : notre easy_chat indexe gSpeciesNames/gMoveNames
 *  DIRECTEMENT (pas de valueList compacte GBA) → l'index EST déjà l'id final, cohérent
 *  avec notre EC_GROUP/GetEasyChatWord. La sélection du sous-ensemble GBA (valueList) est
 *  une divergence assumée côté easy_chat ; non utilisée par InitDewfordTrend (groupes simples). */
export function GetRandomEasyChatWordFromGroup(groupId: number): number {
  const numWords = _numWordsInGroup(groupId);
  if (numWords <= 0) return EC_EMPTY_WORD;  // garde anti-NaN (groupe vide → mot vide).
  const index = Random() % numWords;
  return EC_WORD(groupId, index);
}

/** 1:1 décomp `bool8 IsEasyChatWordInvalid(u16 easyChatWord)` (easy_chat.c).
 *  EC_EMPTY_WORD est VALIDE (= mot vide, pas garbage). */
function IsEasyChatWordInvalid(easyChatWord: number): boolean {
  if (easyChatWord === EC_EMPTY_WORD) return false;
  const groupId = EC_GROUP(easyChatWord);
  const index = EC_INDEX(easyChatWord);
  if (groupId >= EC_NUM_GROUPS) return true;
  return index >= _numWordsInGroup(groupId);
}

/** 1:1 décomp `u8 *CopyEasyChatWord(u8 *dest, u16 easyChatWord)` (easy_chat.c:5219).
 *  Signature décomp `(dest, word)` conservée (= pointeur parserSingle du mail) ;
 *  port string-based → renvoie le TEXTE du mot ('???' si invalide, '' si
 *  EC_EMPTY_WORD) au lieu d'écrire dans dest + retourner le end-ptr. */
export function CopyEasyChatWord(_dest: Uint8Array | null, easyChatWord: number): string {
  if (IsEasyChatWordInvalid(easyChatWord)) return gText_ThreeQuestionMarks;
  if (easyChatWord !== EC_EMPTY_WORD) {
    return GetEasyChatWord(EC_GROUP(easyChatWord), EC_INDEX(easyChatWord));
  }
  return '';
}

/** 1:1 décomp `u8 *ConvertEasyChatWordsToString(u8 *dest, const u16 *src, u16 columns, u16 rows)`
 *  (easy_chat.c:5239). Words joints par CHAR_SPACE, lignes par CHAR_NEWLINE ; la
 *  dernière NEWLINE est remplacée par EOS.
 *
 *  Port : renvoie la string convertie (consommée par mail BufferMailText →
 *  message[i].__str). Écrit aussi `dest[0]` (marqueur EOS/non-EOS) pour le test
 *  de skip-ligne de PrintMailText (`buf[0] === EOS || CHAR_SPACE`). */
export function ConvertEasyChatWordsToString(
  dest: Uint8Array | null,
  src: ArrayLike<number>,
  columns: number,
  rows: number,
): string {
  const numColumns = columns - 1;
  let result = '';
  let s = 0;
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < numColumns; j++) {
      const word = src[s];
      result += CopyEasyChatWord(null, word);
      if (word !== EC_EMPTY_WORD) result += ' '; // CHAR_SPACE
      s++;
    }
    result += CopyEasyChatWord(null, src[s]);
    s++;
    result += '\n'; // CHAR_NEWLINE
  }
  // 1:1 décomp : dest--; *dest = EOS → retire la NEWLINE finale.
  if (result.length > 0) result = result.slice(0, -1);

  if (dest instanceof Uint8Array && dest.length > 0) {
    // PrintMailText skip si dest[0] == EOS(0xFF) ou CHAR_SPACE(0x00). On marque
    // dest[0] = 1 (texte présent) ou 0xFF (ligne vide).
    dest[0] = result.length === 0 ? 0xFF : 1;
  }
  return result;
}

// ═════════════════════════════════════════════════════════════════════════════
//  ÉCRAN DE SAISIE (mail write) — 1:1 décomp easy_chat.c sections input/main.
// ═════════════════════════════════════════════════════════════════════════════

import type { EasyChatScreen } from './engine/ui/easy-chat-render';
import type { DecompTask, CB2Callback } from '../harness/runtime/decomp-runtime';
type MainCallback = CB2Callback | (() => void);
import {
  // ECFUNC_* / INPUT_* (enums) + types.
  ECFUNC_NONE, ECFUNC_EXIT, ECFUNC_OPEN_KEYBOARD, ECFUNC_UPDATE_MAIN_CURSOR,
  ECFUNC_UPDATE_MAIN_CURSOR_ON_BUTTONS, ECFUNC_PROMPT_EXIT, ECFUNC_PROMPT_CONFIRM,
  ECFUNC_CLOSE_PROMPT, ECFUNC_CLOSE_PROMPT_AFTER_DELETE, ECFUNC_PROMPT_DELETE_ALL,
  ECFUNC_CLOSE_KEYBOARD, ECFUNC_OPEN_WORD_SELECT, ECFUNC_CLOSE_WORD_SELECT,
  ECFUNC_RETURN_TO_KEYBOARD, ECFUNC_UPDATE_KEYBOARD_CURSOR, ECFUNC_GROUP_NAMES_SCROLL_DOWN,
  ECFUNC_GROUP_NAMES_SCROLL_UP, ECFUNC_UPDATE_WORD_SELECT_CURSOR, ECFUNC_WORD_SELECT_SCROLL_UP,
  ECFUNC_WORD_SELECT_SCROLL_DOWN, ECFUNC_WORD_SELECT_PAGE_UP, ECFUNC_WORD_SELECT_PAGE_DOWN,
  ECFUNC_SWITCH_KEYBOARD_MODE, ECFUNC_REPRINT_PHRASE, ECFUNC_PROMPT_CONFIRM_LYRICS,
  ECFUNC_MSG_SONG_TOO_SHORT, ECFUNC_MSG_CANT_EXIT, ECFUNC_MSG_CREATE_QUIZ,
  ECFUNC_MSG_SELECT_ANSWER, ECFUNC_MSG_COMBINE_TWO_WORDS, ECFUNC_MSG_CANT_DELETE_LYRICS,
  ECFUNC_QUIZ_QUESTION, ECFUNC_QUIZ_ANSWER, ECFUNC_SET_QUIZ_QUESTION, ECFUNC_SET_QUIZ_ANSWER,
  INPUT_RIGHT, INPUT_LEFT, INPUT_UP, INPUT_DOWN, INPUT_START, INPUT_SELECT,
  // Contrôle + word-data (renderer = owner sScreenControl/sWordData).
  InitEasyChatScreenControl, LoadEasyChatScreen, FreeEasyChatScreenControl,
  StartEasyChatFunction, RunEasyChatFunction,
  InitEasyChatScreenWordData, FreeEasyChatScreenWordData, GetNumUnlockedEasyChatGroups,
  GetUnlockedEasyChatGroupId, SetSelectedWordGroup, GetNumWordsInSelectedGroup,
  GetWordFromSelectedGroup,
  // Injection (getters + data).
  _setEasyChatScreen,
  _setGetEasyChatScreenFrameId, _setGetEasyChatScreenType, _setGetMainCursorColumn,
  _setGetMainCursorRow, _setGetNumColumns, _setGetNumRows, _setGetCurrentPhrase,
  _setGetTitleText, _setGetInAlphabetMode, _setGetKeyboardCursorColAndRow,
  _setGetWordSelectColAndRow, _setGetKeyboardScrollOffset, _setGetWordSelectScrollOffset,
  _setGetWordSelectLastRow, _setGetEasyChatInstructionsText, _setGetEasyChatConfirmExitText,
  _setGetEasyChatConfirmText, _setGetEasyChatConfirmDeletionText, _setCanScrollUp,
  _setCanScrollDown, _setGetDisplayedPersonType, _setFooterHasFourOptions_,
  _setGEasyChatGroups, _setGEasyChatWordsByLetterPointers, _setGSpeciesNames, _setGMoveNames,
  _setSRestrictedWordSpecies, _setSEasyChatGroupNamePointers,
  _setFlagGet, _setIsNationalPokedexEnabled, _setGetNationalPokedexCount,
  _setGetSetPokedexFlag, _setSpeciesToNationalPokedexNum, _setRandom, _setGSaveBlock1Ptr,
  _setSEasyChatBgTemplates, _setSEasyChatWindowTemplates, _setSEasyChatYesNoWindowTemplate,
  _setSPhraseFrameDimensions, _setSAlphabetKeyboardColumnOffsets, _setSFooterOptionXOffsets,
  _setSFooterTextOptions, _setSText_Clear17,
  _setSText_Pal, _setSTitleText_Pal, _setSTextInputFrameOrange_Pal, _setSTextInputFrameGreen_Pal,
  _setGEasyChatMode_Pal, _setGEasyChatWindow_Gfx, _setGEasyChatWindow_Tilemap, _setSTextInputFrame_Gfx,
  _setSSpriteSheets, _setSSpritePalettes,
} from './engine/ui/easy-chat-render';
import {
  gEasyChatGroups, gEasyChatWordsByLetterPointers, sRestrictedWordSpecies,
  sEasyChatGroupNamePointers, sEasyChatScreenTemplates, sMysteryGiftPhrase,
  sBerryMasterWifePhrases, sAlphabetGroupIdMap, easyChatPromptTexts,
  sEasyChatBgTemplates, sEasyChatWindowTemplates, sEasyChatYesNoWindowTemplate,
  sPhraseFrameDimensions, sAlphabetKeyboardColumnOffsets, sFooterOptionXOffsets,
  sFooterTextOptions, sText_Clear17,
} from './data/easy-chat-data';
import { FlagGet, FlagSet, IsNationalPokedexEnabled } from './event_data';
import {
  GetNationalPokedexCount, GetSetPokedexFlag, SpeciesToNationalPokedexNum,
} from './engine/ui/pokedex-flags';
import { TrySetTrendyPhrase } from './dewford_trend';
import { getRuntime, ResetTasks, JOY_NEW, JOY_REPEAT, BlendPalettes, ResetPaletteFade,
  FreeAllSpritePalettes, AnimateSprites, BuildOamBuffer, PlaySE, RunTasks,
  TransferPlttBuffer, gSaveBlock1Ptr } from '../harness/runtime/decomp-globals';
import { ResetSpriteData, LoadOam, ProcessSpriteCopyRequests } from './sprite';
import { UpdatePaletteFade, BeginNormalPaletteFade } from './palette';
import { CreateTask } from './task';
import { Menu_ProcessInputNoWrapClearOnChoose } from './menu';
import { FreeAllWindowBuffers } from './window';
import { SetVBlankCallback } from '../harness/runtime/decomp-bridge';
import { gSpecialVar, VarSet } from './engine/script/script-vars';
import { loadGbaPal, loadTilemapBin, loadIndexedPngStrict } from '../harness/gba/png-loader';

// ─── Constantes GBA (masques input) + SE + états — 1:1 décomp ────────────────
const A_BUTTON = 1 << 0;
const B_BUTTON = 1 << 1;
const SELECT_BUTTON = 1 << 2;
const START_BUTTON = 1 << 3;
const DPAD_RIGHT = 1 << 4;
const DPAD_LEFT = 1 << 5;
const DPAD_UP = 1 << 6;
const DPAD_DOWN = 1 << 7;
const SE_SELECT = 5;    // 1:1 songs.h
const SE_FAILURE = 32;  // 1:1 songs.h (SE_HAZURE)
const MENU_B_PRESSED = -1;
const PALETTES_ALL = 0xFFFFFFFF;
const RGB_BLACK = 0;

// INPUTSTATE_* (easy_chat.c:249).
const INPUTSTATE_PHRASE = 0;
const INPUTSTATE_MAIN_SCREEN_BUTTONS = 1;
const INPUTSTATE_KEYBOARD = 2;
const INPUTSTATE_WORD_SELECT = 3;
const INPUTSTATE_EXIT_PROMPT = 4;
const INPUTSTATE_DELETE_ALL_YES_NO = 5;
const INPUTSTATE_CONFIRM_WORDS_YES_NO = 6;
const INPUTSTATE_QUIZ_QUESTION = 7;
const INPUTSTATE_WAIT_FOR_MSG = 8;
const INPUTSTATE_START_CONFIRM_LYRICS = 9;
const INPUTSTATE_CONFIRM_LYRICS_YES_NO = 10;

// MAINSTATE_* (easy_chat.c:264).
const MAINSTATE_FADE_IN = 0;
const MAINSTATE_HANDLE_INPUT = 1;
const MAINSTATE_RUN_FUNC = 2;
const MAINSTATE_TO_QUIZ_LADY = 3;
const MAINSTATE_EXIT = 4;
const MAINSTATE_WAIT_FADE_IN = 5;

// FRAMEID_* (easy_chat.c:344) — utilisés par IsCurrentFrame2x5.
const FRAMEID_MAIL = 2;
const FRAMEID_QUIZ_QUESTION = 7;
const FRAMEID_QUIZ_SET_QUESTION = 8;

// NUM_* (easy_chat.c:335).
const NUM_ALPHABET_ROWS = 4;
const NUM_GROUP_NAME_ROWS = 4;
const NUM_WORD_SELECT_ROWS = 4;
const NUM_BUTTON_ROWS = 3;
const NUM_ALPHABET_COLUMNS = 7;
const NUM_GROUP_NAME_COLUMNS = 2;
const NUM_WORD_SELECT_COLUMNS = 2;

// EASY_CHAT_TYPE_* (constants/easy_chat.h) — utilisés par la logique input.
const EASY_CHAT_TYPE_QUIZ_SET_QUESTION = 17;
const EASY_CHAT_TYPE_QUIZ_SET_ANSWER = 18;
const EASY_CHAT_TYPE_QUIZ_QUESTION = 16;
const EASY_CHAT_TYPE_QUIZ_ANSWER = 15;
const EASY_CHAT_TYPE_MAIL = 4;
const EASY_CHAT_TYPE_BARD_SONG = 6;
const EASY_CHAT_TYPE_APPRENTICE = 19;
const EASY_CHAT_TYPE_CONTEST_INTERVIEW = 11;
const EASY_CHAT_TYPE_TRENDY_PHRASE = 9;
const EASY_CHAT_TYPE_GOOD_SAYING = 13;
const EASY_CHAT_TYPE_QUESTIONNAIRE = 20;
const EASY_CHAT_TYPE_PROFILE = 0;

const EASY_CHAT_PERSON_DISPLAY_NONE = 3;

// gText_* (prompts exit/deletion) — depuis data (résolus FR).
const gText_StopGivingPkmnMail = easyChatPromptTexts.gText_StopGivingPkmnMail;
const gText_LikeToQuitQuiz = easyChatPromptTexts.gText_LikeToQuitQuiz;
const gText_ChallengeQuestionMark = easyChatPromptTexts.gText_ChallengeQuestionMark;
const gText_QuitEditing = easyChatPromptTexts.gText_QuitEditing;
const gText_AllTextBeingEditedWill = easyChatPromptTexts.gText_AllTextBeingEditedWill;
const gText_BeDeletedThatOkay = easyChatPromptTexts.gText_BeDeletedThatOkay;

// ─── EWRAM state (1:1 décomp easy_chat.c:36) ─────────────────────────────────
let sEasyChatScreen: EasyChatScreen | null = null;

// SetWordTaskArg/GetWordTaskArg (easy_chat.c:1282) empilent des pointeurs 32-bit
// dans des slots u16 → adaptation JS : un seul écran actif, on garde words +
// exitCallback en module-vars (les u16 tType/tPersonType restent dans gTasks.data).
let sPendingWords: Uint16Array | null = null;
let sPendingExitCallback: MainCallback | null = null;

// Défauts d'injection posés (une seule fois) — voir _installEasyChatBridges.
let _bridgesInstalled = false;

// tData index (easy_chat.c:1287).
const tState = 0;   // data[0]
const tType = 1;    // data[1]
const tPersonType = 7; // data[7]

// ─── Chargement GFX (palettes + frames) — assets décomp public/decomp/em/easy_chat ─
// Les INCGFX_U16(.gbapal)/INCGFX(.png) du décomp → fetch async. Adaptation JS
// hardware-exempte : préchargé une fois, injecté dans le renderer. `easyChatGfxReady`
// = gate (le flux give attend avant DoEasyChatScreen, cf. init synchrone du CB2).
let _easyChatGfxLoaded = false;
let _easyChatGfxLoading: Promise<void> | null = null;
export function easyChatGfxReady(): Promise<void> {
  if (_easyChatGfxLoaded) return Promise.resolve();
  if (!_easyChatGfxLoading) _easyChatGfxLoading = _loadEasyChatGfxAssets();
  return _easyChatGfxLoading;
}
async function _loadEasyChatGfxAssets(): Promise<void> {
  if (_easyChatGfxLoaded) return;
  const base = '/decomp/em/easy_chat';
  const [textPal, titlePal, orangePal, greenPal, modePng, winPng, winMap, framePng, triCursor] = await Promise.all([
    loadGbaPal(`${base}/text.pal`),
    loadGbaPal(`${base}/title_text.pal`),
    loadGbaPal(`${base}/text_input_frame_orange.pal`),
    loadGbaPal(`${base}/text_input_frame_green.pal`),
    loadIndexedPngStrict(`${base}/mode.png`, 4),
    loadIndexedPngStrict(`${base}/window.png`, 4),
    loadTilemapBin(`${base}/window.bin`),
    loadIndexedPngStrict(`${base}/text_input_frame.png`, 4),
    loadIndexedPngStrict(`${base}/triangle_cursor.png`, 4),
  ]);
  _setSText_Pal(textPal);
  _setSTitleText_Pal(titlePal);
  _setSTextInputFrameOrange_Pal(orangePal);
  _setSTextInputFrameGreen_Pal(greenPal);
  _setGEasyChatMode_Pal(modePng.palette);
  _setGEasyChatWindow_Gfx(winPng.charData);
  _setGEasyChatWindow_Tilemap(winMap);
  _setSTextInputFrame_Gfx(framePng.charData);
  // Sprite curseur triangle (principal + word-select). tag 0 = GFXTAG/PALTAG_TRIANGLE_CURSOR
  // (le template décomp inverse tileTag/paletteTag mais les 2 valent 0 → inoffensif).
  _setSSpriteSheets([{ data: triCursor.charData, size: triCursor.charData.length, tag: 0 }]);
  _setSSpritePalettes([{ data: triCursor.palette, tag: 0 }]);
  _easyChatGfxLoaded = true;
}

// ─── Injection : câble getters + data dans le renderer ───────────────────────
function _installEasyChatBridges(): void {
  if (_bridgesInstalled) return;
  _bridgesInstalled = true;
  void easyChatGfxReady(); // kick off le préchargement des assets (palettes+frames)

  // Getters (état input → renderer).
  _setGetEasyChatScreenFrameId(GetEasyChatScreenFrameId);
  _setGetEasyChatScreenType(GetEasyChatScreenType);
  _setGetMainCursorColumn(GetMainCursorColumn);
  _setGetMainCursorRow(GetMainCursorRow);
  _setGetNumColumns(GetNumColumns);
  _setGetNumRows(GetNumRows);
  _setGetCurrentPhrase(GetCurrentPhrase);
  _setGetTitleText(GetTitleText);
  _setGetInAlphabetMode(() => (GetInAlphabetMode() ? 1 : 0));
  _setGetKeyboardCursorColAndRow(GetKeyboardCursorColAndRow);
  _setGetWordSelectColAndRow(GetWordSelectColAndRow);
  _setGetKeyboardScrollOffset(GetKeyboardScrollOffset);
  _setGetWordSelectScrollOffset(GetWordSelectScrollOffset);
  _setGetWordSelectLastRow(GetWordSelectLastRow);
  _setGetEasyChatInstructionsText(GetEasyChatInstructionsText);
  _setGetEasyChatConfirmExitText(GetEasyChatConfirmExitText);
  _setGetEasyChatConfirmText(GetEasyChatConfirmText);
  _setGetEasyChatConfirmDeletionText(GetEasyChatConfirmDeletionText);
  _setCanScrollUp(CanScrollUp);
  _setCanScrollDown(CanScrollDown);
  _setGetDisplayedPersonType(GetDisplayedPersonType);
  _setFooterHasFourOptions_(FooterHasFourOptions_);

  // Data (word-data + rendu).
  _setGEasyChatGroups(gEasyChatGroups);
  _setGEasyChatWordsByLetterPointers(gEasyChatWordsByLetterPointers);
  _setGSpeciesNames(gSpeciesNames);
  _setGMoveNames(gMoveNames);
  _setSRestrictedWordSpecies(sRestrictedWordSpecies);
  _setSEasyChatGroupNamePointers(sEasyChatGroupNamePointers);
  _setFlagGet(FlagGet);
  _setIsNationalPokedexEnabled(IsNationalPokedexEnabled);
  _setGetNationalPokedexCount(GetNationalPokedexCount);
  _setGetSetPokedexFlag(GetSetPokedexFlag);
  _setSpeciesToNationalPokedexNum(SpeciesToNationalPokedexNum);
  _setRandom(Random);
  _setGSaveBlock1Ptr(gSaveBlock1Ptr);

  // Layout (rendu écran de saisie).
  _setSEasyChatBgTemplates(sEasyChatBgTemplates);
  _setSEasyChatWindowTemplates(sEasyChatWindowTemplates);
  _setSEasyChatYesNoWindowTemplate(sEasyChatYesNoWindowTemplate);
  _setSPhraseFrameDimensions(sPhraseFrameDimensions);
  _setSAlphabetKeyboardColumnOffsets(sAlphabetKeyboardColumnOffsets);
  _setSFooterOptionXOffsets(sFooterOptionXOffsets);
  _setSFooterTextOptions(sFooterTextOptions);
  _setSText_Clear17(new Uint8Array(sText_Clear17));
}

// ─── DoEasyChatScreen / CB2 / Task (easy_chat.c:1294) ────────────────────────

/** 1:1 décomp `void DoEasyChatScreen(u8 type, u16 *words, MainCallback exitCallback, u8 displayedPersonType)`. */
export function DoEasyChatScreen(
  type: number,
  words: Uint16Array | null,
  exitCallback: MainCallback | null,
  displayedPersonType: number,
): void {
  _installEasyChatBridges();
  const rt = getRuntime();
  ResetTasks();
  const taskId = CreateTask(Task_InitEasyChatScreen, 0);
  const data = rt.gTasks[taskId].data;
  data[tType] = type;
  data[tPersonType] = displayedPersonType;
  sPendingWords = words;
  sPendingExitCallback = exitCallback;
  SetMainCallback2(CB2_EasyChatScreen);
}

/** 1:1 décomp `static void CB2_EasyChatScreen(void)`. */
function CB2_EasyChatScreen(): void {
  RunTasks();
  AnimateSprites();
  BuildOamBuffer();
  UpdatePaletteFade();
}

/** 1:1 décomp `static void VBlankCB_EasyChatScreen(void)`. */
function VBlankCB_EasyChatScreen(): void {
  TransferPlttBuffer();
  LoadOam();
  ProcessSpriteCopyRequests(getRuntime());
}

/** 1:1 décomp `static void StartEasyChatScreen(u8 taskId, TaskFunc taskFunc)`. */
function StartEasyChatScreen(taskId: number, taskFunc: (task: DecompTask) => void): void {
  const rt = getRuntime();
  rt.gTasks[taskId].func = taskFunc;
  rt.gTasks[taskId].data[tState] = MAINSTATE_FADE_IN;
}

/** 1:1 décomp `static void Task_InitEasyChatScreen(u8 taskId)`.
 *  Solo (non-link) : `while (InitEasyChatScreen(taskId));` (init synchrone). */
function Task_InitEasyChatScreen(task: DecompTask): void {
  const taskId = task.taskId;
  // IsOverworldLinkActive() = FALSE en solo.
  while (InitEasyChatScreen(taskId));
  StartEasyChatScreen(taskId, Task_EasyChatScreen);
}

/** 1:1 décomp `static void Task_EasyChatScreen(u8 taskId)` — boucle principale. */
function Task_EasyChatScreen(task: DecompTask): void {
  const taskId = task.taskId;
  const rt = getRuntime();
  const data = rt.gTasks[taskId].data;
  switch (data[tState]) {
    case MAINSTATE_FADE_IN:
      SetVBlankCallback(VBlankCB_EasyChatScreen);
      BlendPalettes(PALETTES_ALL, 16, 0);
      BeginNormalPaletteFade(PALETTES_ALL, -1, 16, 0, RGB_BLACK);
      data[tState] = MAINSTATE_WAIT_FADE_IN;
      break;
    case MAINSTATE_HANDLE_INPUT: {
      const funcId = HandleEasyChatInput();
      if (funcId === ECFUNC_EXIT) {
        BeginNormalPaletteFade(PALETTES_ALL, -1, 0, 16, RGB_BLACK);
        data[tState] = MAINSTATE_EXIT;
      } else if (funcId !== ECFUNC_NONE) {
        PlaySE(SE_SELECT);
        StartEasyChatFunction(funcId);
        data[tState]++; // MAINSTATE_RUN_FUNC
      }
      break;
    }
    case MAINSTATE_RUN_FUNC:
      if (!RunEasyChatFunction()) data[tState] = MAINSTATE_HANDLE_INPUT;
      break;
    case MAINSTATE_EXIT:
      if (!rt.gPaletteFade.active) ExitEasyChatScreen(sPendingExitCallback);
      break;
    case MAINSTATE_WAIT_FADE_IN:
      if (!rt.gPaletteFade.active) data[tState] = MAINSTATE_HANDLE_INPUT;
      break;
  }
}

/** 1:1 décomp `static bool8 InitEasyChatScreen(u8 taskId)`. Retourne TRUE tant qu'init. */
function InitEasyChatScreen(taskId: number): boolean {
  const rt = getRuntime();
  const data = rt.gTasks[taskId].data;
  switch (data[tState]) {
    case 0:
      SetVBlankCallback(null);
      ResetSpriteData();
      FreeAllSpritePalettes();
      ResetPaletteFade();
      break;
    case 1:
      if (!InitEasyChatScreenWordData()) ExitEasyChatScreen(sPendingExitCallback);
      break;
    case 2:
      if (!InitEasyChatScreenStruct(data[tType], sPendingWords, data[tPersonType]))
        ExitEasyChatScreen(sPendingExitCallback);
      break;
    case 3:
      if (!InitEasyChatScreenControl()) ExitEasyChatScreen(sPendingExitCallback);
      break;
    case 4:
      if (LoadEasyChatScreen()) return true;
      break;
    default:
      return false;
  }
  data[tState]++;
  return true;
}

/** 1:1 décomp `static void ExitEasyChatScreen(MainCallback callback)`. */
function ExitEasyChatScreen(callback: MainCallback | null): void {
  FreeEasyChatScreenControl();
  FreeEasyChatScreenStruct();
  FreeEasyChatScreenWordData();
  FreeAllWindowBuffers();
  SetMainCallback2(callback);
}

// ─── InitEasyChatScreenStruct (easy_chat.c:1637) ─────────────────────────────

/** 1:1 décomp `static bool8 InitEasyChatScreenStruct(u8 type, u16 *words, u8 displayedPersonType)`. */
function InitEasyChatScreenStruct(type: number, words: Uint16Array | null, displayedPersonType: number): boolean {
  sEasyChatScreen = {
    type, templateId: 0, numColumns: 0, numRows: 0, inputState: 0,
    mainCursorColumn: 0, mainCursorRow: 0, maxWords: 0, inputStateBackup: 0,
    inAlphabetMode: 0, keyboardColumn: 0, keyboardRow: 0, keyboardScrollOffset: 0,
    keyboardLastRow: 0, wordSelectScrollOffset: 0, wordSelectLastRow: 0,
    wordSelectColumn: 0, wordSelectRow: 0, displayedPersonType, unused: 0,
    quizTitle: new Uint8Array(32), titleText: null, savedPhrase: words,
    currentPhrase: new Uint16Array(EC_MAX_WORDS_CURRENT_PHRASE),
  };
  _setEasyChatScreen(sEasyChatScreen);

  const templateId = GetEachChatScreenTemplateId(type);
  // (EASY_CHAT_TYPE_QUIZ_QUESTION : titre = quiz — hors périmètre mail, laissé au flux quiz.)
  sEasyChatScreen.inputState = INPUTSTATE_PHRASE;
  sEasyChatScreen.titleText = sEasyChatScreenTemplates[templateId].titleText;

  sEasyChatScreen.numColumns = sEasyChatScreenTemplates[templateId].numColumns;
  sEasyChatScreen.numRows = sEasyChatScreenTemplates[templateId].numRows;
  sEasyChatScreen.maxWords = sEasyChatScreen.numColumns * sEasyChatScreen.numRows;
  sEasyChatScreen.templateId = templateId;
  if (sEasyChatScreen.maxWords > EC_MAX_WORDS_CURRENT_PHRASE)
    sEasyChatScreen.maxWords = EC_MAX_WORDS_CURRENT_PHRASE;

  if (words !== null) {
    // Phrase pré-remplie → copie dans currentPhrase.
    for (let i = 0; i < sEasyChatScreen.maxWords; i++) sEasyChatScreen.currentPhrase[i] = words[i];
  } else {
    for (let i = 0; i < sEasyChatScreen.maxWords; i++) sEasyChatScreen.currentPhrase[i] = EC_EMPTY_WORD;
    sEasyChatScreen.savedPhrase = sEasyChatScreen.currentPhrase;
  }

  sEasyChatScreen.keyboardLastRow = Math.floor((GetNumUnlockedEasyChatGroups() - 1) / 2) + 1;
  return true;
}
// ARRAY_COUNT(sEasyChatScreen->currentPhrase) : la struct décomp a currentPhrase[10].
const EC_MAX_WORDS_CURRENT_PHRASE = 10;

/** 1:1 décomp `static void FreeEasyChatScreenStruct(void)`. */
function FreeEasyChatScreenStruct(): void {
  sEasyChatScreen = null;
  _setEasyChatScreen(null);
}

/** 1:1 décomp `static u8 GetEachChatScreenTemplateId(u8 type)`. */
function GetEachChatScreenTemplateId(type: number): number {
  for (let i = 0; i < sEasyChatScreenTemplates.length; i++) {
    if (sEasyChatScreenTemplates[i].type === type) return i;
  }
  return 0;
}

// ─── HandleEasyChatInput + sous-handlers (easy_chat.c:1698) ──────────────────

/** 1:1 décomp `static u16 HandleEasyChatInput(void)`. */
function HandleEasyChatInput(): number {
  switch (sEasyChatScreen!.inputState) {
    case INPUTSTATE_PHRASE: return HandleEasyChatInput_Phrase();
    case INPUTSTATE_MAIN_SCREEN_BUTTONS: return HandleEasyChatInput_MainScreenButtons();
    case INPUTSTATE_KEYBOARD: return HandleEasyChatInput_Keyboard();
    case INPUTSTATE_WORD_SELECT: return HandleEasyChatInput_WordSelect();
    case INPUTSTATE_EXIT_PROMPT: return HandleEasyChatInput_ExitPrompt();
    case INPUTSTATE_DELETE_ALL_YES_NO: return HandleEasyChatInput_DeleteAllYesNo();
    case INPUTSTATE_CONFIRM_WORDS_YES_NO: return HandleEasyChatInput_ConfirmWordsYesNo();
    case INPUTSTATE_QUIZ_QUESTION: return HandleEasyChatInput_QuizQuestion();
    case INPUTSTATE_WAIT_FOR_MSG: return HandleEasyChatInput_WaitForMsg();
    case INPUTSTATE_START_CONFIRM_LYRICS: return HandleEasyChatInput_StartConfirmLyrics();
    case INPUTSTATE_CONFIRM_LYRICS_YES_NO: return HandleEasyChatInput_ConfirmLyricsYesNo();
  }
  return ECFUNC_NONE;
}

/** 1:1 décomp `static bool32 IsCurrentFrame2x5(void)`. */
function IsCurrentFrame2x5(): boolean {
  switch (GetEasyChatScreenFrameId()) {
    case FRAMEID_MAIL:
    case FRAMEID_QUIZ_QUESTION:
    case FRAMEID_QUIZ_SET_QUESTION:
      return true;
  }
  return false;
}

/** 1:1 décomp `static u16 HandleEasyChatInput_Phrase(void)`. */
function HandleEasyChatInput_Phrase(): number {
  const s = sEasyChatScreen!;
  let dpad = true;
  do {
    if (JOY_NEW(A_BUTTON)) {
      ClearUnusedField();
      s.inputState = INPUTSTATE_KEYBOARD;
      s.keyboardColumn = 0;
      s.keyboardRow = 0;
      s.keyboardScrollOffset = 0;
      return ECFUNC_OPEN_KEYBOARD;
    } else if (JOY_NEW(B_BUTTON)) {
      return StartConfirmExitPrompt();
    } else if (JOY_NEW(START_BUTTON)) {
      return TryConfirmWords();
    } else if (JOY_NEW(DPAD_UP)) {
      s.mainCursorRow--;
      break;
    } else if (JOY_NEW(DPAD_LEFT)) {
      s.mainCursorColumn--;
      break;
    } else if (JOY_NEW(DPAD_DOWN)) {
      s.mainCursorRow++;
      break;
    } else if (JOY_NEW(DPAD_RIGHT)) {
      s.mainCursorColumn++;
      break;
    }
    dpad = false;
  } while (false);
  if (!dpad) return ECFUNC_NONE;

  const tmpl = sEasyChatScreenTemplates[s.templateId];
  // Wrap row.
  if (s.mainCursorRow < 0) s.mainCursorRow = tmpl.numRows;
  if (s.mainCursorRow > tmpl.numRows) s.mainCursorRow = 0;

  if (s.mainCursorRow === tmpl.numRows) {
    if (s.mainCursorColumn > 2) s.mainCursorColumn = 2;
    s.inputState = INPUTSTATE_MAIN_SCREEN_BUTTONS;
    return ECFUNC_UPDATE_MAIN_CURSOR_ON_BUTTONS;
  }

  // Wrap column.
  if (s.mainCursorColumn < 0) s.mainCursorColumn = tmpl.numColumns - 1;
  if (s.mainCursorColumn >= tmpl.numColumns) s.mainCursorColumn = 0;

  if (IsCurrentFrame2x5() && s.mainCursorColumn === 1 && s.mainCursorRow === 4) s.mainCursorColumn = 0;

  return ECFUNC_UPDATE_MAIN_CURSOR;
}

/** 1:1 décomp `static u16 HandleEasyChatInput_MainScreenButtons(void)`. */
function HandleEasyChatInput_MainScreenButtons(): number {
  const s = sEasyChatScreen!;
  let dpad = true;
  do {
    if (JOY_NEW(A_BUTTON)) {
      switch (s.mainCursorColumn) {
        case 0: return DoDeleteAllButton();
        case 1: return StartConfirmExitPrompt();
        case 2: return TryConfirmWords();
        case 3: return DoQuizButton();
      }
    }
    if (JOY_NEW(B_BUTTON)) {
      return StartConfirmExitPrompt();
    } else if (JOY_NEW(START_BUTTON)) {
      return TryConfirmWords();
    } else if (JOY_NEW(DPAD_UP)) {
      s.mainCursorRow--;
      break;
    } else if (JOY_NEW(DPAD_LEFT)) {
      s.mainCursorColumn--;
      break;
    } else if (JOY_NEW(DPAD_DOWN)) {
      s.mainCursorRow = 0;
      break;
    } else if (JOY_NEW(DPAD_RIGHT)) {
      s.mainCursorColumn++;
      break;
    }
    dpad = false;
  } while (false);
  if (!dpad) return ECFUNC_NONE;

  const tmpl = sEasyChatScreenTemplates[s.templateId];
  if (s.mainCursorRow === tmpl.numRows) {
    const numFooterColumns = FooterHasFourOptions() ? 4 : 3;
    if (s.mainCursorColumn < 0) s.mainCursorColumn = numFooterColumns - 1;
    if (s.mainCursorColumn >= numFooterColumns) s.mainCursorColumn = 0;
    return ECFUNC_UPDATE_MAIN_CURSOR_ON_BUTTONS;
  }

  if (s.mainCursorColumn >= tmpl.numColumns) s.mainCursorColumn = tmpl.numColumns - 1;
  if (IsCurrentFrame2x5() && s.mainCursorColumn === 1 && s.mainCursorRow === 4) s.mainCursorColumn = 0;

  s.inputState = INPUTSTATE_PHRASE;
  return ECFUNC_UPDATE_MAIN_CURSOR;
}

/** 1:1 décomp `static u16 HandleEasyChatInput_Keyboard(void)`. */
function HandleEasyChatInput_Keyboard(): number {
  const s = sEasyChatScreen!;
  if (JOY_NEW(B_BUTTON)) return ExitKeyboardToMainScreen();
  if (JOY_NEW(A_BUTTON)) {
    if (s.keyboardColumn !== -1) return SelectKeyboardGroup();
    switch (s.keyboardRow) {
      case 0: return StartSwitchKeyboardMode();
      case 1: return DeleteSelectedWord();
      case 2: return ExitKeyboardToMainScreen();
    }
  }
  if (JOY_NEW(SELECT_BUTTON)) return StartSwitchKeyboardMode();
  if (JOY_REPEAT(DPAD_UP)) return MoveKeyboardCursor(INPUT_UP);
  if (JOY_REPEAT(DPAD_DOWN)) return MoveKeyboardCursor(INPUT_DOWN);
  if (JOY_REPEAT(DPAD_LEFT)) return MoveKeyboardCursor(INPUT_LEFT);
  if (JOY_REPEAT(DPAD_RIGHT)) return MoveKeyboardCursor(INPUT_RIGHT);
  return ECFUNC_NONE;
}

/** 1:1 décomp `static u16 HandleEasyChatInput_WordSelect(void)`. */
function HandleEasyChatInput_WordSelect(): number {
  const s = sEasyChatScreen!;
  if (JOY_NEW(B_BUTTON)) {
    s.inputState = INPUTSTATE_KEYBOARD;
    return ECFUNC_RETURN_TO_KEYBOARD;
  }
  if (JOY_NEW(A_BUTTON)) return SelectNewWord();
  if (JOY_NEW(START_BUTTON)) return MoveWordSelectCursor(INPUT_START);
  if (JOY_NEW(SELECT_BUTTON)) return MoveWordSelectCursor(INPUT_SELECT);
  if (JOY_REPEAT(DPAD_UP)) return MoveWordSelectCursor(INPUT_UP);
  if (JOY_REPEAT(DPAD_DOWN)) return MoveWordSelectCursor(INPUT_DOWN);
  if (JOY_REPEAT(DPAD_LEFT)) return MoveWordSelectCursor(INPUT_LEFT);
  if (JOY_REPEAT(DPAD_RIGHT)) return MoveWordSelectCursor(INPUT_RIGHT);
  return ECFUNC_NONE;
}

/** 1:1 décomp `static u16 HandleEasyChatInput_ExitPrompt(void)`. */
function HandleEasyChatInput_ExitPrompt(): number {
  const s = sEasyChatScreen!;
  switch (Menu_ProcessInputNoWrapClearOnChoose()) {
    case MENU_B_PRESSED:
    case 1: // No (Continue)
      s.inputState = GetEasyChatBackupState();
      return ECFUNC_CLOSE_PROMPT;
    case 0: // Yes (Exit)
      gSpecialVar.Result = 0;
      if (s.type === EASY_CHAT_TYPE_QUIZ_SET_QUESTION || s.type === EASY_CHAT_TYPE_QUIZ_SET_ANSWER)
        SaveCurrentPhrase();
      return ECFUNC_EXIT;
    default:
      return ECFUNC_NONE;
  }
}

/** 1:1 décomp `static u16 HandleEasyChatInput_ConfirmWordsYesNo(void)`. */
function HandleEasyChatInput_ConfirmWordsYesNo(): number {
  const s = sEasyChatScreen!;
  switch (Menu_ProcessInputNoWrapClearOnChoose()) {
    case MENU_B_PRESSED:
    case 1:
      s.inputState = GetEasyChatBackupState();
      return ECFUNC_CLOSE_PROMPT;
    case 0:
      SetSpecialEasyChatResult();
      gSpecialVar.Result = GetEasyChatCompleted() ? 1 : 0;
      SaveCurrentPhrase();
      return ECFUNC_EXIT;
    default:
      return ECFUNC_NONE;
  }
}

/** 1:1 décomp `static u16 HandleEasyChatInput_DeleteAllYesNo(void)`. */
function HandleEasyChatInput_DeleteAllYesNo(): number {
  const s = sEasyChatScreen!;
  switch (Menu_ProcessInputNoWrapClearOnChoose()) {
    case MENU_B_PRESSED:
    case 1:
      s.inputState = INPUTSTATE_MAIN_SCREEN_BUTTONS;
      return ECFUNC_CLOSE_PROMPT;
    case 0:
      ResetCurrentPhrase();
      s.inputState = INPUTSTATE_MAIN_SCREEN_BUTTONS;
      return ECFUNC_CLOSE_PROMPT_AFTER_DELETE;
    default:
      return ECFUNC_NONE;
  }
}

/** 1:1 décomp `static u16 HandleEasyChatInput_QuizQuestion(void)`. */
function HandleEasyChatInput_QuizQuestion(): number {
  if (JOY_NEW(A_BUTTON)) return ECFUNC_QUIZ_ANSWER;
  if (JOY_NEW(B_BUTTON)) return StartConfirmExitPrompt();
  return ECFUNC_NONE;
}

/** 1:1 décomp `static u16 HandleEasyChatInput_WaitForMsg(void)`. */
function HandleEasyChatInput_WaitForMsg(): number {
  const s = sEasyChatScreen!;
  if (JOY_NEW(A_BUTTON | B_BUTTON)) {
    s.inputState = GetEasyChatBackupState();
    return ECFUNC_CLOSE_PROMPT;
  }
  return ECFUNC_NONE;
}

/** 1:1 décomp `static u16 HandleEasyChatInput_StartConfirmLyrics(void)`. */
function HandleEasyChatInput_StartConfirmLyrics(): number {
  sEasyChatScreen!.inputState = INPUTSTATE_CONFIRM_LYRICS_YES_NO;
  return ECFUNC_PROMPT_CONFIRM;
}

/** 1:1 décomp `static u16 HandleEasyChatInput_ConfirmLyricsYesNo(void)`. */
function HandleEasyChatInput_ConfirmLyricsYesNo(): number {
  const s = sEasyChatScreen!;
  switch (Menu_ProcessInputNoWrapClearOnChoose()) {
    case MENU_B_PRESSED:
    case 1:
      ResetCurrentPhraseToSaved();
      s.inputStateBackup = INPUTSTATE_PHRASE;
      s.inputState = INPUTSTATE_WAIT_FOR_MSG;
      return ECFUNC_MSG_SONG_TOO_SHORT;
    case 0:
      gSpecialVar.Result = GetEasyChatCompleted() ? 1 : 0;
      SaveCurrentPhrase();
      return ECFUNC_EXIT;
    default:
      return ECFUNC_NONE;
  }
}

/** 1:1 décomp `static u16 StartConfirmExitPrompt(void)`. */
function StartConfirmExitPrompt(): number {
  const s = sEasyChatScreen!;
  if (s.type === EASY_CHAT_TYPE_APPRENTICE || s.type === EASY_CHAT_TYPE_CONTEST_INTERVIEW) {
    s.inputStateBackup = s.inputState;
    s.inputState = INPUTSTATE_WAIT_FOR_MSG;
    return ECFUNC_MSG_CANT_EXIT;
  } else {
    s.inputStateBackup = s.inputState;
    s.inputState = INPUTSTATE_EXIT_PROMPT;
    return ECFUNC_PROMPT_EXIT;
  }
}

/** 1:1 décomp `static int DoDeleteAllButton(void)`. */
function DoDeleteAllButton(): number {
  const s = sEasyChatScreen!;
  s.inputStateBackup = s.inputState;
  if (s.type !== EASY_CHAT_TYPE_BARD_SONG) {
    s.inputState = INPUTSTATE_DELETE_ALL_YES_NO;
    return ECFUNC_PROMPT_DELETE_ALL;
  } else {
    s.inputStateBackup = s.inputState;
    s.inputState = INPUTSTATE_WAIT_FOR_MSG;
    return ECFUNC_MSG_CANT_DELETE_LYRICS;
  }
}

/** 1:1 décomp `static u16 TryConfirmWords(void)`. */
function TryConfirmWords(): number {
  const s = sEasyChatScreen!;
  s.inputStateBackup = s.inputState;
  if (s.type === EASY_CHAT_TYPE_QUIZ_SET_QUESTION) {
    if (IsQuizQuestionEmpty()) { s.inputState = INPUTSTATE_WAIT_FOR_MSG; return ECFUNC_MSG_CREATE_QUIZ; }
    if (IsQuizAnswerEmpty()) { s.inputState = INPUTSTATE_WAIT_FOR_MSG; return ECFUNC_MSG_SELECT_ANSWER; }
    s.inputState = INPUTSTATE_CONFIRM_WORDS_YES_NO;
    return ECFUNC_PROMPT_CONFIRM;
  } else if (s.type === EASY_CHAT_TYPE_QUIZ_SET_ANSWER) {
    if (IsQuizAnswerEmpty()) { s.inputState = INPUTSTATE_WAIT_FOR_MSG; return ECFUNC_MSG_SELECT_ANSWER; }
    if (IsQuizQuestionEmpty()) { s.inputState = INPUTSTATE_WAIT_FOR_MSG; return ECFUNC_MSG_CREATE_QUIZ; }
    s.inputState = INPUTSTATE_CONFIRM_WORDS_YES_NO;
    return ECFUNC_PROMPT_CONFIRM;
  } else if (s.type === EASY_CHAT_TYPE_TRENDY_PHRASE || s.type === EASY_CHAT_TYPE_GOOD_SAYING) {
    if (!IsCurrentPhraseFull()) { s.inputState = INPUTSTATE_WAIT_FOR_MSG; return ECFUNC_MSG_COMBINE_TWO_WORDS; }
    s.inputState = INPUTSTATE_CONFIRM_WORDS_YES_NO;
    return ECFUNC_PROMPT_CONFIRM;
  } else if (s.type === EASY_CHAT_TYPE_APPRENTICE || s.type === EASY_CHAT_TYPE_CONTEST_INTERVIEW) {
    if (IsCurrentPhraseEmpty()) { s.inputState = INPUTSTATE_WAIT_FOR_MSG; return ECFUNC_MSG_CANT_EXIT; }
    s.inputState = INPUTSTATE_CONFIRM_WORDS_YES_NO;
    return ECFUNC_PROMPT_CONFIRM;
  } else if (s.type === EASY_CHAT_TYPE_QUESTIONNAIRE) {
    s.inputState = INPUTSTATE_CONFIRM_WORDS_YES_NO;
    return ECFUNC_PROMPT_CONFIRM;
  } else {
    if (IsCurrentPhraseEmpty() === true || !GetEasyChatCompleted()) {
      s.inputState = INPUTSTATE_EXIT_PROMPT;
      return ECFUNC_PROMPT_EXIT;
    }
    s.inputState = INPUTSTATE_CONFIRM_WORDS_YES_NO;
    return ECFUNC_PROMPT_CONFIRM;
  }
}

/** 1:1 décomp `static int DoQuizButton(void)`. */
function DoQuizButton(): number {
  const s = sEasyChatScreen!;
  s.inputStateBackup = s.inputState;
  switch (s.type) {
    case EASY_CHAT_TYPE_QUIZ_ANSWER: return ECFUNC_QUIZ_QUESTION;
    case EASY_CHAT_TYPE_QUIZ_SET_QUESTION: SaveCurrentPhrase(); return ECFUNC_SET_QUIZ_ANSWER;
    case EASY_CHAT_TYPE_QUIZ_SET_ANSWER: SaveCurrentPhrase(); return ECFUNC_SET_QUIZ_QUESTION;
    default: return ECFUNC_NONE;
  }
}

/** 1:1 décomp `static u8 GetEasyChatBackupState(void)`. */
function GetEasyChatBackupState(): number { return sEasyChatScreen!.inputStateBackup; }

/** 1:1 décomp `static int SelectKeyboardGroup(void)`. */
function SelectKeyboardGroup(): number {
  const s = sEasyChatScreen!;
  if (!s.inAlphabetMode) {
    const groupId = GetUnlockedEasyChatGroupId(GetSelectedGroupIndex());
    SetSelectedWordGroup(false, groupId);
  } else {
    SetSelectedWordGroup(true, GetSelectedAlphabetGroupId());
  }
  const numWords = GetNumWordsInSelectedGroup();
  if (numWords === 0) return ECFUNC_NONE;
  s.wordSelectLastRow = Math.floor((numWords - 1) / 2);
  s.wordSelectScrollOffset = 0;
  s.wordSelectColumn = 0;
  s.wordSelectRow = 0;
  s.inputState = INPUTSTATE_WORD_SELECT;
  return ECFUNC_OPEN_WORD_SELECT;
}

/** 1:1 décomp `static int ExitKeyboardToMainScreen(void)`. */
function ExitKeyboardToMainScreen(): number {
  sEasyChatScreen!.inputState = INPUTSTATE_PHRASE;
  return ECFUNC_CLOSE_KEYBOARD;
}

/** 1:1 décomp `static int StartSwitchKeyboardMode(void)`. */
function StartSwitchKeyboardMode(): number {
  const s = sEasyChatScreen!;
  s.keyboardColumn = 0;
  s.keyboardRow = 0;
  s.keyboardScrollOffset = 0;
  s.inAlphabetMode = s.inAlphabetMode ? 0 : 1;
  return ECFUNC_SWITCH_KEYBOARD_MODE;
}

/** 1:1 décomp `static int DeleteSelectedWord(void)`. */
function DeleteSelectedWord(): number {
  if (sEasyChatScreen!.type === EASY_CHAT_TYPE_BARD_SONG) {
    PlaySE(SE_FAILURE);
    return ECFUNC_NONE;
  } else {
    SetSelectedWord(EC_EMPTY_WORD);
    return ECFUNC_REPRINT_PHRASE;
  }
}

/** 1:1 décomp `static int SelectNewWord(void)`. */
function SelectNewWord(): number {
  const s = sEasyChatScreen!;
  const easyChatWord = GetWordFromSelectedGroup(GetSelectedWordIndex());
  if (DummyWordCheck(easyChatWord)) {
    PlaySE(SE_FAILURE);
    return ECFUNC_NONE;
  } else {
    SetSelectedWord(easyChatWord);
    if (s.type !== EASY_CHAT_TYPE_BARD_SONG) {
      s.inputState = INPUTSTATE_PHRASE;
      return ECFUNC_CLOSE_WORD_SELECT;
    } else {
      s.inputState = INPUTSTATE_START_CONFIRM_LYRICS;
      return ECFUNC_PROMPT_CONFIRM_LYRICS;
    }
  }
}

/** 1:1 décomp `static void SaveCurrentPhrase(void)`. */
function SaveCurrentPhrase(): void {
  const s = sEasyChatScreen!;
  for (let i = 0; i < s.maxWords; i++) s.savedPhrase![i] = s.currentPhrase[i];
}

/** 1:1 décomp `static void ResetCurrentPhrase(void)`. */
function ResetCurrentPhrase(): void {
  const s = sEasyChatScreen!;
  for (let i = 0; i < s.maxWords; i++) s.currentPhrase[i] = EC_EMPTY_WORD;
}

/** 1:1 décomp `static void ResetCurrentPhraseToSaved(void)`. */
function ResetCurrentPhraseToSaved(): void {
  const s = sEasyChatScreen!;
  for (let i = 0; i < s.maxWords; i++) s.currentPhrase[i] = s.savedPhrase![i];
}

/** 1:1 décomp `static void SetSelectedWord(u16 easyChatWord)`. */
function SetSelectedWord(easyChatWord: number): void {
  const index = GetWordIndexToReplace();
  sEasyChatScreen!.currentPhrase[index] = easyChatWord;
}

/** 1:1 décomp `static bool8 DidPhraseChange(void)`. */
function DidPhraseChange(): boolean {
  const s = sEasyChatScreen!;
  for (let i = 0; i < s.maxWords; i++) {
    if (s.currentPhrase[i] !== s.savedPhrase![i]) return true;
  }
  return false;
}

/** 1:1 décomp `static bool32 GetEasyChatCompleted(void)`. */
function GetEasyChatCompleted(): boolean {
  const s = sEasyChatScreen!;
  if (s.type === EASY_CHAT_TYPE_QUIZ_SET_QUESTION || s.type === EASY_CHAT_TYPE_QUIZ_SET_ANSWER) {
    if (IsQuizQuestionEmpty()) return false;
    if (IsQuizAnswerEmpty()) return false;
    return true;
  } else {
    return DidPhraseChange();
  }
}

/** 1:1 décomp `static u16 MoveKeyboardCursor(int input)`. */
function MoveKeyboardCursor(input: number): number {
  const s = sEasyChatScreen!;
  if (s.keyboardColumn !== -1) {
    if (!s.inAlphabetMode) return MoveKeyboardCursor_GroupNames(input);
    else return MoveKeyboardCursor_Alphabet(input);
  } else {
    return MoveKeyboardCursor_ButtonWindow(input);
  }
}

/** 1:1 décomp `static int MoveKeyboardCursor_GroupNames(u32 input)`. */
function MoveKeyboardCursor_GroupNames(input: number): number {
  const s = sEasyChatScreen!;
  switch (input) {
    case INPUT_UP:
      if (s.keyboardRow !== -s.keyboardScrollOffset) {
        if (s.keyboardRow) { s.keyboardRow--; return ECFUNC_UPDATE_KEYBOARD_CURSOR; }
        else { s.keyboardScrollOffset--; return ECFUNC_GROUP_NAMES_SCROLL_UP; }
      }
      break;
    case INPUT_DOWN:
      if (s.keyboardRow + s.keyboardScrollOffset < s.keyboardLastRow - 1) {
        let funcId: number;
        if (s.keyboardRow < NUM_GROUP_NAME_ROWS - 1) { s.keyboardRow++; funcId = ECFUNC_UPDATE_KEYBOARD_CURSOR; }
        else { s.keyboardScrollOffset++; funcId = ECFUNC_GROUP_NAMES_SCROLL_DOWN; }
        ReduceToValidKeyboardColumn();
        return funcId;
      }
      break;
    case INPUT_LEFT:
      if (s.keyboardColumn) s.keyboardColumn--;
      else SetKeyboardCursorInButtonWindow();
      return ECFUNC_UPDATE_KEYBOARD_CURSOR;
    case INPUT_RIGHT:
      if (s.keyboardColumn < 1) {
        s.keyboardColumn++;
        if (IsSelectedKeyboardIndexInvalid()) SetKeyboardCursorInButtonWindow();
      } else {
        SetKeyboardCursorInButtonWindow();
      }
      return ECFUNC_UPDATE_KEYBOARD_CURSOR;
  }
  return ECFUNC_NONE;
}

/** 1:1 décomp `static int MoveKeyboardCursor_Alphabet(u32 input)`. */
function MoveKeyboardCursor_Alphabet(input: number): number {
  const s = sEasyChatScreen!;
  switch (input) {
    case INPUT_UP:
      if (s.keyboardRow > 0) s.keyboardRow--;
      else s.keyboardRow = NUM_ALPHABET_ROWS - 1;
      ReduceToValidKeyboardColumn();
      return ECFUNC_UPDATE_KEYBOARD_CURSOR;
    case INPUT_DOWN:
      if (s.keyboardRow < NUM_ALPHABET_ROWS - 1) s.keyboardRow++;
      else s.keyboardRow = 0;
      ReduceToValidKeyboardColumn();
      return ECFUNC_UPDATE_KEYBOARD_CURSOR;
    case INPUT_RIGHT:
      s.keyboardColumn++;
      if (IsSelectedKeyboardIndexInvalid()) SetKeyboardCursorInButtonWindow();
      return ECFUNC_UPDATE_KEYBOARD_CURSOR;
    case INPUT_LEFT:
      s.keyboardColumn--;
      if (s.keyboardColumn < 0) SetKeyboardCursorInButtonWindow();
      return ECFUNC_UPDATE_KEYBOARD_CURSOR;
  }
  return ECFUNC_NONE;
}

/** 1:1 décomp `static int MoveKeyboardCursor_ButtonWindow(u32 input)`. */
function MoveKeyboardCursor_ButtonWindow(input: number): number {
  const s = sEasyChatScreen!;
  switch (input) {
    case INPUT_UP:
      if (s.keyboardRow) s.keyboardRow--;
      else s.keyboardRow = NUM_BUTTON_ROWS - 1;
      return ECFUNC_UPDATE_KEYBOARD_CURSOR;
    case INPUT_DOWN:
      if (s.keyboardRow < NUM_BUTTON_ROWS - 1) s.keyboardRow++;
      else s.keyboardRow = 0;
      return ECFUNC_UPDATE_KEYBOARD_CURSOR;
    case INPUT_LEFT:
      s.keyboardRow++;
      SetKeyboardCursorToLastColumn();
      return ECFUNC_UPDATE_KEYBOARD_CURSOR;
    case INPUT_RIGHT:
      s.keyboardColumn = 0;
      s.keyboardRow++;
      return ECFUNC_UPDATE_KEYBOARD_CURSOR;
  }
  return ECFUNC_NONE;
}

/** 1:1 décomp `static void SetKeyboardCursorInButtonWindow(void)`. */
function SetKeyboardCursorInButtonWindow(): void {
  const s = sEasyChatScreen!;
  s.keyboardColumn = -1;
  if (s.keyboardRow) s.keyboardRow--;
}

/** 1:1 décomp `static void SetKeyboardCursorToLastColumn(void)`. */
function SetKeyboardCursorToLastColumn(): void {
  const s = sEasyChatScreen!;
  if (!s.inAlphabetMode) {
    s.keyboardColumn = 1;
    ReduceToValidKeyboardColumn();
  } else {
    s.keyboardColumn = GetLastAlphabetColumn(s.keyboardRow);
  }
}

/** 1:1 décomp `static u16 MoveWordSelectCursor(u32 input)`. */
function MoveWordSelectCursor(input: number): number {
  const s = sEasyChatScreen!;
  let funcId: number;
  switch (input) {
    case INPUT_UP:
      if (s.wordSelectRow + s.wordSelectScrollOffset > 0) {
        if (s.wordSelectRow > 0) { s.wordSelectRow--; funcId = ECFUNC_UPDATE_WORD_SELECT_CURSOR; }
        else { s.wordSelectScrollOffset--; funcId = ECFUNC_WORD_SELECT_SCROLL_UP; }
        ReduceToValidWordSelectColumn();
        return funcId;
      }
      break;
    case INPUT_DOWN:
      if (s.wordSelectRow + s.wordSelectScrollOffset < s.wordSelectLastRow) {
        if (s.wordSelectRow < NUM_WORD_SELECT_ROWS - 1) { s.wordSelectRow++; funcId = ECFUNC_UPDATE_WORD_SELECT_CURSOR; }
        else { s.wordSelectScrollOffset++; funcId = ECFUNC_WORD_SELECT_SCROLL_DOWN; }
        ReduceToValidWordSelectColumn();
        return funcId;
      }
      break;
    case INPUT_LEFT:
      if (s.wordSelectColumn > 0) s.wordSelectColumn--;
      else s.wordSelectColumn = 1;
      ReduceToValidWordSelectColumn();
      return ECFUNC_UPDATE_WORD_SELECT_CURSOR;
    case INPUT_RIGHT:
      if (s.wordSelectColumn < 1) {
        s.wordSelectColumn++;
        if (IsSelectedWordIndexInvalid()) s.wordSelectColumn = 0;
      } else {
        s.wordSelectColumn = 0;
      }
      return ECFUNC_UPDATE_WORD_SELECT_CURSOR;
    case INPUT_START:
      if (s.wordSelectScrollOffset) {
        if (s.wordSelectScrollOffset >= NUM_WORD_SELECT_ROWS) s.wordSelectScrollOffset -= NUM_WORD_SELECT_ROWS;
        else s.wordSelectScrollOffset = 0;
        return ECFUNC_WORD_SELECT_PAGE_UP;
      }
      break;
    case INPUT_SELECT:
      if (s.wordSelectScrollOffset <= s.wordSelectLastRow - NUM_WORD_SELECT_ROWS) {
        s.wordSelectScrollOffset += NUM_WORD_SELECT_ROWS;
        if (s.wordSelectScrollOffset > s.wordSelectLastRow - NUM_WORD_SELECT_ROWS + 1)
          s.wordSelectScrollOffset = s.wordSelectLastRow - NUM_WORD_SELECT_ROWS + 1;
        ReduceToValidWordSelectColumn();
        return ECFUNC_WORD_SELECT_PAGE_DOWN;
      }
      break;
  }
  return ECFUNC_NONE;
}

/** 1:1 décomp `static u16 GetWordIndexToReplace(void)`. */
function GetWordIndexToReplace(): number {
  const s = sEasyChatScreen!;
  return s.mainCursorRow * s.numColumns + s.mainCursorColumn;
}

/** 1:1 décomp `static u16 GetSelectedGroupIndex(void)`. */
function GetSelectedGroupIndex(): number {
  const s = sEasyChatScreen!;
  return NUM_GROUP_NAME_COLUMNS * (s.keyboardRow + s.keyboardScrollOffset) + s.keyboardColumn;
}

/** 1:1 décomp `static int GetSelectedAlphabetGroupId(void)`. */
function GetSelectedAlphabetGroupId(): number {
  const s = sEasyChatScreen!;
  const column = (s.keyboardColumn & 0xFF) < NUM_ALPHABET_COLUMNS ? s.keyboardColumn : 0;
  const row = (s.keyboardRow & 0xFF) < NUM_ALPHABET_ROWS ? s.keyboardRow : 0;
  return sAlphabetGroupIdMap[row][column];
}

/** 1:1 décomp `static u16 GetSelectedWordIndex(void)`. */
function GetSelectedWordIndex(): number {
  const s = sEasyChatScreen!;
  return NUM_WORD_SELECT_COLUMNS * (s.wordSelectRow + s.wordSelectScrollOffset) + s.wordSelectColumn;
}

/** 1:1 décomp `static u8 GetLastAlphabetColumn(u8 row)`. */
function GetLastAlphabetColumn(row: number): number {
  switch (row) {
    case 1: return NUM_ALPHABET_COLUMNS - 2;
    case 0:
    default: return NUM_ALPHABET_COLUMNS - 1;
  }
}

/** 1:1 décomp `static void ReduceToValidKeyboardColumn(void)`. */
function ReduceToValidKeyboardColumn(): void {
  const s = sEasyChatScreen!;
  while (IsSelectedKeyboardIndexInvalid()) {
    if (s.keyboardColumn) s.keyboardColumn--;
    else break;
  }
}

/** 1:1 décomp `static void ReduceToValidWordSelectColumn(void)`. */
function ReduceToValidWordSelectColumn(): void {
  const s = sEasyChatScreen!;
  while (IsSelectedWordIndexInvalid()) {
    if (s.wordSelectColumn) s.wordSelectColumn--;
    else break;
  }
}

/** 1:1 décomp `static bool8 IsSelectedKeyboardIndexInvalid(void)`. */
function IsSelectedKeyboardIndexInvalid(): boolean {
  const s = sEasyChatScreen!;
  if (!s.inAlphabetMode) return GetSelectedGroupIndex() >= GetNumUnlockedEasyChatGroups();
  else return s.keyboardColumn > GetLastAlphabetColumn(s.keyboardRow);
}

/** 1:1 décomp `static bool8 IsSelectedWordIndexInvalid(void)`. */
function IsSelectedWordIndexInvalid(): boolean {
  return GetSelectedWordIndex() >= GetNumWordsInSelectedGroup();
}

/** 1:1 décomp `static int FooterHasFourOptions(void)`. */
function FooterHasFourOptions(): number {
  return sEasyChatScreenTemplates[sEasyChatScreen!.templateId].fourFooterOptions ? 1 : 0;
}

// ─── Getters (injectés dans le renderer) — easy_chat.c:2682-2853 ─────────────
function GetEasyChatScreenType(): number { return sEasyChatScreen!.type; }
function GetEasyChatScreenFrameId(): number { return sEasyChatScreenTemplates[sEasyChatScreen!.templateId].frameId; }
function GetTitleText(): Uint8Array | string | null { return sEasyChatScreen!.titleText; }
function GetCurrentPhrase(): Uint16Array { return sEasyChatScreen!.currentPhrase; }
function GetNumRows(): number { return sEasyChatScreen!.numRows; }
function GetNumColumns(): number { return sEasyChatScreen!.numColumns; }
function GetMainCursorColumn(): number { return sEasyChatScreen!.mainCursorColumn; }
function GetMainCursorRow(): number { return sEasyChatScreen!.mainCursorRow; }

function GetEasyChatInstructionsText(): { text1: Uint8Array | string | null; text2: Uint8Array | string | null } {
  const t = sEasyChatScreenTemplates[sEasyChatScreen!.templateId];
  return { text1: t.instructionsText1, text2: t.instructionsText2 };
}
function GetEasyChatConfirmText(): { text1: Uint8Array | string | null; text2: Uint8Array | string | null } {
  const t = sEasyChatScreenTemplates[sEasyChatScreen!.templateId];
  return { text1: t.confirmText1, text2: t.confirmText2 };
}
function GetEasyChatConfirmExitText(): { text1: Uint8Array | string | null; text2: Uint8Array | string | null } {
  switch (sEasyChatScreen!.type) {
    case EASY_CHAT_TYPE_MAIL: return { text1: gText_StopGivingPkmnMail, text2: null };
    case EASY_CHAT_TYPE_QUIZ_ANSWER:
    case EASY_CHAT_TYPE_QUIZ_QUESTION: return { text1: gText_LikeToQuitQuiz, text2: gText_ChallengeQuestionMark };
    default: return { text1: gText_QuitEditing, text2: null };
  }
}
function GetEasyChatConfirmDeletionText(): { text1: Uint8Array | string | null; text2: Uint8Array | string | null } {
  return { text1: gText_AllTextBeingEditedWill, text2: gText_BeDeletedThatOkay };
}
function GetKeyboardCursorColAndRow(): { column: number; row: number } {
  return { column: sEasyChatScreen!.keyboardColumn, row: sEasyChatScreen!.keyboardRow };
}
function GetInAlphabetMode(): boolean { return !!sEasyChatScreen!.inAlphabetMode; }
function GetKeyboardScrollOffset(): number { return sEasyChatScreen!.keyboardScrollOffset; }
function GetWordSelectColAndRow(): { column: number; row: number } {
  return { column: sEasyChatScreen!.wordSelectColumn, row: sEasyChatScreen!.wordSelectRow };
}
function GetWordSelectScrollOffset(): number { return sEasyChatScreen!.wordSelectScrollOffset; }
function GetWordSelectLastRow(): number { return sEasyChatScreen!.wordSelectLastRow; }

/** 1:1 décomp `static bool32 CanScrollUp(void)`. */
function CanScrollUp(): boolean {
  const s = sEasyChatScreen!;
  switch (s.inputState) {
    case INPUTSTATE_KEYBOARD:
      if (!s.inAlphabetMode && s.keyboardScrollOffset) return true;
      break;
    case INPUTSTATE_WORD_SELECT:
      if (s.wordSelectScrollOffset) return true;
      break;
  }
  return false;
}

/** 1:1 décomp `static bool32 CanScrollDown(void)`. */
function CanScrollDown(): boolean {
  const s = sEasyChatScreen!;
  switch (s.inputState) {
    case INPUTSTATE_KEYBOARD:
      if (!s.inAlphabetMode && s.keyboardScrollOffset + NUM_GROUP_NAME_ROWS <= s.keyboardLastRow - 1) return true;
      break;
    case INPUTSTATE_WORD_SELECT:
      if (s.wordSelectScrollOffset + NUM_WORD_SELECT_ROWS <= s.wordSelectLastRow) return true;
      break;
  }
  return false;
}

/** 1:1 décomp `static int FooterHasFourOptions_(void)`. */
function FooterHasFourOptions_(): number { return FooterHasFourOptions(); }

/** 1:1 décomp `static bool8 IsPhraseDifferentThanPlayerInput(const u16 *phrase, u8 phraseLength)`. */
function IsPhraseDifferentThanPlayerInput(phrase: readonly number[], phraseLength: number): boolean {
  const s = sEasyChatScreen!;
  for (let i = 0; i < phraseLength; i++) if (phrase[i] !== s.currentPhrase[i]) return true;
  return false;
}

function GetDisplayedPersonType(): number { return sEasyChatScreen!.displayedPersonType; }

// ─── Phrase state helpers (easy_chat.c:2868-3013) ────────────────────────────
function IsCurrentPhraseEmpty(): boolean {
  const s = sEasyChatScreen!;
  for (let i = 0; i < s.maxWords; i++) if (s.currentPhrase[i] !== EC_EMPTY_WORD) return false;
  return true;
}
function IsCurrentPhraseFull(): boolean {
  const s = sEasyChatScreen!;
  for (let i = 0; i < s.maxWords; i++) if (s.currentPhrase[i] === EC_EMPTY_WORD) return false;
  return true;
}
function IsQuizQuestionEmpty(): boolean {
  const s = sEasyChatScreen!;
  if (s.type === EASY_CHAT_TYPE_QUIZ_SET_QUESTION) return IsCurrentPhraseEmpty();
  const q = (gSaveBlock1Ptr as Record<string, unknown>).lilycoveLady as { quiz?: { question?: number[] } } | undefined;
  const question = q?.quiz?.question ?? [];
  for (let i = 0; i < question.length; i++) if (question[i] !== EC_EMPTY_WORD) return false;
  return true;
}
function IsQuizAnswerEmpty(): boolean {
  const s = sEasyChatScreen!;
  if (s.type === EASY_CHAT_TYPE_QUIZ_SET_ANSWER) return IsCurrentPhraseEmpty();
  const q = (gSaveBlock1Ptr as Record<string, unknown>).lilycoveLady as { quiz?: { correctAnswer?: number } } | undefined;
  return (q?.quiz?.correctAnswer ?? EC_EMPTY_WORD) === EC_EMPTY_WORD;
}

/** 1:1 décomp `static void ClearUnusedField(void)`. */
function ClearUnusedField(): void { sEasyChatScreen!.unused = 0; }

/** 1:1 décomp `static bool32 DummyWordCheck(int easyChatWord)`. */
function DummyWordCheck(_easyChatWord: number): boolean { return false; }

/** 1:1 décomp `static void SetSpecialEasyChatResult(void)`. */
function SetSpecialEasyChatResult(): void {
  const s = sEasyChatScreen!;
  switch (s.type) {
    case EASY_CHAT_TYPE_PROFILE:
      FlagSet(FLAG_SYS_CHAT_USED);
      break;
    case EASY_CHAT_TYPE_QUESTIONNAIRE:
      VarSet('VAR_0x8004', DidPlayerInputMysteryGiftPhrase() ? 2 : 0);
      break;
    case EASY_CHAT_TYPE_TRENDY_PHRASE:
      VarSet('VAR_0x8004', TrySetTrendyPhrase(s.currentPhrase) ? 1 : 0);
      break;
    case EASY_CHAT_TYPE_GOOD_SAYING:
      VarSet('VAR_0x8004', DidPlayerInputABerryMasterWifePhrase());
      break;
  }
}
const FLAG_SYS_CHAT_USED = 0x861; // 1:1 flags.h (SYSTEM_FLAGS + 0x1)

/** 1:1 décomp `static int DidPlayerInputMysteryGiftPhrase(void)`. */
function DidPlayerInputMysteryGiftPhrase(): number {
  return IsPhraseDifferentThanPlayerInput(sMysteryGiftPhrase, sMysteryGiftPhrase.length) ? 0 : 1;
}

/** 1:1 décomp `static u16 DidPlayerInputABerryMasterWifePhrase(void)`. */
function DidPlayerInputABerryMasterWifePhrase(): number {
  for (let i = 0; i < sBerryMasterWifePhrases.length; i++) {
    if (!IsPhraseDifferentThanPlayerInput(sBerryMasterWifePhrases[i], 2)) return i + 1;
  }
  return 0;
}

// ─── SetMainCallback2 wrap (1:1, cf. mail.ts) ────────────────────────────────
function SetMainCallback2(cb: MainCallback | null): void {
  const rt = getRuntime();
  if (!rt) return;
  rt.SetMainCallback2(cb as CB2Callback);
}

// ─── Hook headless (test logique sans rendu) ─────────────────────────────────
/** Expose l'installation des bridges + accès à l'état pour un test logique headless
 *  (drive SelectKeyboardGroup/SelectNewWord et lit currentPhrase). NON 1:1 (harness). */
export const __easyChatTest = {
  install: _installEasyChatBridges,
  initStruct: (type: number, words: Uint16Array | null) => {
    InitEasyChatScreenWordData();
    return InitEasyChatScreenStruct(type, words, EASY_CHAT_PERSON_DISPLAY_NONE);
  },
  getScreen: () => sEasyChatScreen,
  SelectKeyboardGroup, SelectNewWord, GetWordFromSelectedGroup, GetSelectedWordIndex,
  GetNumWordsInSelectedGroup, GetNumUnlockedEasyChatGroups, GetUnlockedEasyChatGroupId,
  CopyEasyChatWord,
  /** Ouvre l'écran easy-chat (visuel) : précharge les assets puis DoEasyChatScreen.
   *  exitCb = retour overworld (fourni par l'appelant). */
  open: async (type: number, words: Uint16Array | null, exitCb: () => void) => {
    _installEasyChatBridges();
    await easyChatGfxReady();
    DoEasyChatScreen(type, words, exitCb, EASY_CHAT_PERSON_DISPLAY_NONE);
  },
};
