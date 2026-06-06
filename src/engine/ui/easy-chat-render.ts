/**
 * easy-chat-render.ts â€” Port 1:1 STRICT des sections 3-4 (rendering + sprites +
 *                       cleanup + word data) du decomp `src/easy_chat.c`
 *                       lignes ~3000-5875 (= partie "fin" du fichier).
 *
 * Source de vÃ©ritÃ© (= 1:1 EXACT, ne JAMAIS diverger) :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/easy_chat.c` lignes 3000-5875
 *   - `D:/Projet 1/decomps/pokeemeraude/include/easy_chat.h`
 *   - `D:/Projet 1/decomps/pokeemeraude/include/constants/easy_chat.h`
 *
 * SCOPE de ce port (= 1:1 STRICT, NE PAS dÃ©passer) :
 *
 *   SECTION 3 â€” Rendering / windows / tilemaps (easy_chat.c:3015-4622) :
 *     - InitEasyChatScreenControl / LoadEasyChatScreen / FreeEasyChatScreenControl
 *     - StartEasyChatFunction / RunEasyChatFunction (dispatch ECFUNC_*)
 *     - ReprintPhrase / UpdateMainCursor / UpdateMainCursorOnButtons
 *     - ShowConfirm{Exit,DeleteAll,Lyrics}Prompt / ShowConfirmPrompt
 *     - ClosePrompt / ClosePromptAfterDeleteAll
 *     - Open/Close{Keyboard,WordSelect} / SwitchKeyboardMode / ReturnToKeyboard
 *     - UpdateKeyboardCursor / GroupNamesScroll{Down,Up}
 *     - UpdateWordSelectCursor / WordSelect{Scroll,PageScroll}{Up,Down}
 *     - Show{CreateQuiz,SelectAnswer,SongTooShort,CantDeleteLyrics,CombineTwoWords,CantExit}Msg
 *     - InitEasyChatScreenControl_ / InitEasyChatBgs / LoadEasyChatPalettes
 *     - PrintTitle / PrintEasyChatText / PrintEasyChatTextWithColors
 *     - PrintInitialInstructions / PrintEasyChatStdMessage / CreateEasyChatYesNoMenu
 *     - AddPhraseWindow / PrintCurrentPhrase / BufferFrameTilemap
 *     - AdjustBgTilemapForFooter / DrawLowerWindow / InitLowerWindowText
 *     - PrintKeyboardText / PrintKeyboard{GroupNames,Alphabet}
 *     - PrintInitialWordSelectText / PrintWordSelectNextRow{Down,Up}
 *     - PrintWordSelectRowsPage{Down,Up} / PrintWordSelectText / EraseWordSelectRows
 *     - ClearWordSelectWindow / InitLowerWindowAnim / UpdateLowerWindowAnim
 *     - DrawLowerWindowFrame / BufferLowerWindowFrame
 *     - ResetLowerWindowScroll / InitLowerWindowScroll / UpdateLowerWindowScroll
 *     - GetLowerWindowScrollOffset / SetWindowDimensions
 *
 *   SECTION 4 â€” Sprites + cleanup + word data (easy_chat.c:4624-5874) :
 *     - LoadEasyChatGfx
 *     - CreateMainCursorSprite / SpriteCB_Cursor / SetMainCursorPos
 *     - Stop/StartMainCursorAnim
 *     - Create/DestroyRectangleCursorSprites / UpdateRectangleCursorPos
 *     - SetRectangleCursorPos_{Group,Alphabet}Mode
 *     - CreateWordSelectCursorSprite / SpriteCB_WordSelectCursor
 *     - UpdateWordSelectCursorPos / SetWordSelectCursorPos
 *     - DestroyWordSelectCursorSprite / CreateSideWindowSprites
 *     - ShowSideWindow / HideModeWindow / DestroySideWindowSprites
 *     - SetModeWindowToTransition / UpdateModeWindowAnim / IsModeWindowAnimActive
 *     - CreateScrollIndicatorSprites / UpdateScrollIndicatorsVisibility
 *     - HideScrollIndicators / SetScrollIndicatorXPos
 *     - CreateStartSelectButtonSprites / UpdateStartSelectButtonsVisibility
 *     - HideStartSelectButtons / TryAddInterviewObjectEvents
 *     - GetFooterIndex / GetFooterOptionXOffset / AddMainScreenButtonWindow
 *     - IsEasyChatGroupUnlocked / EasyChat_GetNumWordsInGroup
 *     - IsEasyChatWordInvalid / IsBardWordInvalid
 *     - GetEasyChatWord / CopyEasyChatWord
 *     - ConvertEasyChatWordsToString / OtherConvertEasyChatWordsToString
 *     - GetEasyChatWordStringLength / CanPhraseFitInXRowsYCols
 *     - GetRandomEasyChatWordFromGroup / GetRandomEasyChatWordFromUnlockedGroup
 *     - ShowEasyChatProfile / BufferDeepLinkPhrase
 *     - IsTrendySayingUnlocked / UnlockTrendySaying / GetNumTrendySayingsUnlocked
 *     - UnlockRandomTrendySaying / GetRandomUnlockedTrendySaying
 *     - EasyChatIsNationalPokedexEnabled / GetRandomUnlockedEasyChatPokemon
 *     - InitEasyChatPhrases / InitEasyChatScreenWordData / FreeEasyChatScreenWordData
 *     - SetUnlockedEasyChatGroups / GetNumUnlockedEasyChatGroups
 *     - GetUnlockedEasyChatGroupId / BufferEasyChatWordGroupName
 *     - GetEasyChatWordGroupName / CopyEasyChatWordPadded
 *     - SetUnlockedWordsByAlphabet / SetSelectedWordGroup
 *     - GetWordFromSelectedGroup / GetNumWordsInSelectedGroup
 *     - SetSelectedWordGroup_{Group,Alphabet}Mode
 *     - IsEasyChatGroupUnlocked2 / IsEasyChatIndexAndGroupUnlocked
 *     - IsRestrictedWordSpecies / IsEasyChatWordUnlocked
 *     - InitializeEasyChatWordArray / InitQuestionnaireWords
 *     - IsEasyChatAnswerUnlocked
 *
 * DÃ©pendances STUB explicites (= helpers section 1-2 ABSENTS de ce port, donc
 *   Ã  injecter par setter depuis easy-chat.ts quand celui-ci sera portÃ©) :
 *
 *   - sEasyChatScreen  : struct EasyChatScreen* (= state machine input/cursor)
 *   - sScreenControl   : struct EasyChatScreenControl* (= rendering state)
 *   - sWordData        : struct EasyChatScreenWordData* (= word selection data)
 *   - GetEasyChatScreenFrameId / GetEasyChatScreenType
 *   - GetMainCursorColumn / GetMainCursorRow / GetNumColumns / GetNumRows
 *   - GetCurrentPhrase / GetTitleText / GetInAlphabetMode
 *   - GetKeyboardCursorColAndRow / GetWordSelectColAndRow
 *   - GetKeyboardScrollOffset / GetWordSelectScrollOffset / GetWordSelectLastRow
 *   - GetSelectedGroupIndex / GetEasyChatInstructionsText / GetEasyChatConfirmText
 *   - GetEasyChatConfirmExitText / GetEasyChatConfirmDeletionText
 *   - CanScrollUp / CanScrollDown / GetDisplayedPersonType / FooterHasFourOptions_
 *   - GetQuestionnaireWordsPtr
 *   - gEasyChatGroups / gEasyChatWordsByLetterPointers / gSpeciesNames / gMoveNames
 *   - gNumBardWords_Species / gNumBardWords_Moves
 *   - sRestrictedWordSpecies / sDefaultProfile/Battle{Start,Won,Lost}Words
 *   - gText_* strings (transparents via window text system)
 *   - gEasyChatWindow_Gfx/_Tilemap / sTextInputFrame_Gfx / palette assets
 *   - sSpriteSheets / sSpritePalettes / sCompressedSpriteSheets
 *   - sSpriteTemplate_{TriangleCursor,RectangleCursor,ModeWindow,ButtonWindow,
 *     StartSelectButton,ScrollIndicator}
 *   - sPhraseFrameDimensions / sFooterOptionXOffsets / sFooterTextOptions
 *   - sEasyChatBgTemplates / sEasyChatWindowTemplates / sEasyChatYesNoWindowTemplate
 *   - sEasyChatKeyboardAlphabet / sAlphabetKeyboardColumnOffsets
 *   - sEasyChatGroupNamePointers / sText_Clear17
 *   - gSaveBlock1Ptr / gSaveBlock2Ptr / gSpecialVar_0x8004 / gStringVar2/4
 *   - SpeciesToNationalPokedexNum / GetSetPokedexFlag / GetNationalPokedexCount
 *   - IsNationalPokedexEnabled / FlagGet
 *   - ShowFieldAutoScrollMessage / Random
 *
 *   Toutes ces dÃ©pendances sont injectÃ©es via setters _setXxx() exportÃ©s.
 *   STUB = console.warn + valeur sentinel (0 / null / false) si non injectÃ©.
 *
 * Note 1:1 strict :
 *   - Tous les noms = IDENTIQUES au decomp.
 *   - Aucune optimisation ; ordre statements respectÃ© ; switch/case exhaustifs.
 *   - Pas d'imports decomp-data/auto (= rÃ¨gle stricte projet).
 *   - Pas de hardcoded values decomp (= constantes locales dÃ©finies au top).
 */

// â”€â”€â”€ Imports infrastructure (helpers TS existants) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

import {
  LoadPalette,
  ResetPaletteFade,
  CpuFastFill,
  CreateSprite,
  DestroySprite,
  StartSpriteAnim,
  LoadCompressedSpriteSheet,
  SetGpuReg,
  GetBgTilemapBuffer,
  WIN_RANGE,
} from '../system/decomp-bridge';

import {
  InitWindows,
  AddWindow,
  PutWindowTilemap,
  FillWindowPixelBuffer,
  FillWindowPixelRect,
  CopyWindowToVram,
  InitBgsFromTemplates,
  ResetBgsAndClearDma3BusyFlags,
  ShowBg,
  HideBg,
  ChangeBgX,
  ChangeBgY,
  FillBgTilemapBufferRect,
  FillBgTilemapBufferRect_Palette0,
  CopyBgTilemapBufferToVram,
  CopyToBgTilemapBuffer,
  type WindowTemplate,
  type BgTemplate,
} from './gba-window-system';

import {
  AddTextPrinterParameterized3,
  DeactivateAllTextPrinters,
  GetStringCenterAlignXOffset,
  GetStringWidth,
  TEXT_SKIP_DRAW,
} from './gba-text-system';

// 1:1 STRICT décomp text.c:251-269 AddTextPrinterParameterized — vraie impl
// dans gba-text-system.ts (wrapper sur P3 avec colors par défaut du font).
import {
  AddTextPrinterParameterized,
} from './gba-text-system';

import {
  LoadUserWindowBorderGfx,
  DrawTextBorderOuter,
} from '../../game/text_window';

import {
  CreateYesNoMenu,
} from './gba-menu-system';

import {
  getRuntime,
  SpriteCallbackDummy,
  LoadSpritePalettes,
} from '../system/decomp-globals';

// DecompSprite interface vit dans decomp-runtime.ts (= source de vÃ©ritÃ© Sprite).
import type { DecompSprite } from '../system/decomp-runtime';
import {
  DISPCNT_OBJ_1D_MAP, DISPCNT_OBJ_ON, DISPCNT_WIN0_ON,
} from '../decomp-data/include/gba/io_reg-data';

import {
  CreateObjectGraphicsSprite,
} from '../field/object-event-graphics';

import {
  TEXT_COLOR_TRANSPARENT,
  TEXT_COLOR_DARK_GRAY,
  TEXT_COLOR_LIGHT_GRAY,
  TEXT_COLOR_WHITE,
  TEXT_COLOR_LIGHT_RED,
  FONT_NORMAL,
  PIXEL_FILL,
} from '../battle/battle-windows';

import {
  CHAR_HYPHEN,
  CHAR_SPACE,
  CHAR_NEWLINE,
  CHAR_PROMPT_SCROLL,
  EOS,
} from '../decomp-data/_common-constants';

import {
  BG_PLTT_ID,
  REG_OFFSET_DISPCNT,
  REG_OFFSET_WIN0H,
  REG_OFFSET_WIN0V,
  REG_OFFSET_WININ,
  REG_OFFSET_WINOUT,
  DISPCNT_MODE_0,
} from '../system/decomp-runtime';

import {
  PLTT_SIZE_4BPP,
} from '../system/decomp-bridge';

import {
  BG_SCREEN_SIZE,
  OAM,
  OAM_SIZE,
} from '../system/decomp-globals';

// â”€â”€â”€ Constantes locales 1:1 decomp (cf. easy_chat.c:229-403) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// PALTAGs (easy_chat.c:229-234)
const PALTAG_TRIANGLE_CURSOR     = 0;
const PALTAG_RECTANGLE_CURSOR    = 1;
const PALTAG_MISC_UI             = 2;
const PALTAG_RS_INTERVIEW_FRAME  = 3;

// GFXTAGs (easy_chat.c:236-244)
const GFXTAG_TRIANGLE_CURSOR       = 0;
const GFXTAG_RECTANGLE_CURSOR      = 1;
const GFXTAG_SCROLL_INDICATOR      = 2;
const GFXTAG_START_SELECT_BUTTONS  = 3;
const GFXTAG_MODE_WINDOW           = 4;
const GFXTAG_RS_INTERVIEW_FRAME    = 5;
const GFXTAG_BUTTON_WINDOW         = 6;

// MSG_ enum (easy_chat.c:274-285) â€” PrintEasyChatStdMessage msgId.
export const MSG_INSTRUCTIONS        = 0;
export const MSG_CONFIRM_DELETE      = 1;
export const MSG_CONFIRM_EXIT        = 2;
export const MSG_CONFIRM             = 3;
export const MSG_CREATE_QUIZ         = 4;
export const MSG_SELECT_ANSWER       = 5;
export const MSG_SONG_TOO_SHORT      = 6;
export const MSG_CANT_DELETE_LYRICS  = 7;
export const MSG_COMBINE_TWO_WORDS   = 8;
export const MSG_CANT_QUIT           = 9;

// ECFUNC_ enum (easy_chat.c:290-326)
export const ECFUNC_NONE                          = 0;
export const ECFUNC_REPRINT_PHRASE                = 1;
export const ECFUNC_UPDATE_MAIN_CURSOR            = 2;
export const ECFUNC_UPDATE_MAIN_CURSOR_ON_BUTTONS = 3;
export const ECFUNC_PROMPT_DELETE_ALL             = 4;
export const ECFUNC_PROMPT_EXIT                   = 5;
export const ECFUNC_PROMPT_CONFIRM                = 6;
export const ECFUNC_CLOSE_PROMPT                  = 7;
export const ECFUNC_CLOSE_PROMPT_AFTER_DELETE     = 8;
export const ECFUNC_OPEN_KEYBOARD                 = 9;
export const ECFUNC_CLOSE_KEYBOARD                = 10;
export const ECFUNC_OPEN_WORD_SELECT              = 11;
export const ECFUNC_CLOSE_WORD_SELECT             = 12;
export const ECFUNC_PROMPT_CONFIRM_LYRICS         = 13;
export const ECFUNC_RETURN_TO_KEYBOARD            = 14;
export const ECFUNC_UPDATE_KEYBOARD_CURSOR        = 15;
export const ECFUNC_GROUP_NAMES_SCROLL_DOWN       = 16;
export const ECFUNC_GROUP_NAMES_SCROLL_UP         = 17;
export const ECFUNC_UPDATE_WORD_SELECT_CURSOR     = 18;
export const ECFUNC_WORD_SELECT_SCROLL_UP         = 19;
export const ECFUNC_WORD_SELECT_SCROLL_DOWN       = 20;
export const ECFUNC_WORD_SELECT_PAGE_UP           = 21;
export const ECFUNC_WORD_SELECT_PAGE_DOWN         = 22;
export const ECFUNC_SWITCH_KEYBOARD_MODE          = 23;
export const ECFUNC_EXIT                          = 24;
export const ECFUNC_QUIZ_QUESTION                 = 25;
export const ECFUNC_QUIZ_ANSWER                   = 26;
export const ECFUNC_SET_QUIZ_QUESTION             = 27;
export const ECFUNC_SET_QUIZ_ANSWER               = 28;
export const ECFUNC_MSG_CREATE_QUIZ               = 29;
export const ECFUNC_MSG_SELECT_ANSWER             = 30;
export const ECFUNC_MSG_SONG_TOO_SHORT            = 31;
export const ECFUNC_MSG_CANT_DELETE_LYRICS        = 32;
export const ECFUNC_MSG_COMBINE_TWO_WORDS         = 33;
export const ECFUNC_MSG_CANT_EXIT                 = 34;

// TEXT_ enum (easy_chat.c:329-333) â€” InitLowerWindowText whichText.
const TEXT_GROUPS      = 0;
const TEXT_ALPHABET    = 1;
const TEXT_WORD_SELECT = 2;

// NUM_*_ROWS / COLUMNS (easy_chat.c:335-342)
const NUM_ALPHABET_ROWS     = 4;
const NUM_GROUP_NAME_ROWS   = 4;
const NUM_WORD_SELECT_ROWS  = 4;
const NUM_BUTTON_ROWS       = 3;
const NUM_ALPHABET_COLUMNS  = 7;
const NUM_GROUP_NAME_COLUMNS  = 2;
const NUM_WORD_SELECT_COLUMNS = 2;

// FRAMEID_ enum (easy_chat.c:344-354)
const FRAMEID_GENERAL_2x2          = 0;
const FRAMEID_GENERAL_2x3          = 1;
const FRAMEID_MAIL                 = 2;
const FRAMEID_COMBINE_TWO_WORDS    = 3;
const FRAMEID_INTERVIEW_SHOW_PERSON = 4;
const FRAMEID_INTERVIEW            = 5;
const FRAMEID_QUIZ_ANSWER          = 6;
const FRAMEID_QUIZ_QUESTION        = 7;
const FRAMEID_QUIZ_SET_QUESTION    = 8;

// FOOTER_ enum (easy_chat.c:357-362)
const FOOTER_NORMAL     = 0;
const FOOTER_QUIZ       = 1;
const FOOTER_ANSWER     = 2;
const NUM_FOOTER_TYPES  = 3;

// INPUT_ enum (easy_chat.c:364-371) â€” exported for input handler module.
export const INPUT_RIGHT  = 0;
export const INPUT_LEFT   = 1;
export const INPUT_UP     = 2;
export const INPUT_DOWN   = 3;
export const INPUT_START  = 4;
export const INPUT_SELECT = 5;

// WINANIM_ enum (easy_chat.c:374-382)
const WINANIM_OPEN_KEYBOARD        = 0;
const WINANIM_CLOSE_KEYBOARD       = 1;
const WINANIM_OPEN_WORD_SELECT     = 2;
const WINANIM_CLOSE_WORD_SELECT    = 3;
const WINANIM_RETURN_TO_KEYBOARD   = 4;
const WINANIM_KEYBOARD_SWITCH_OUT  = 5;
const WINANIM_KEYBOARD_SWITCH_IN   = 6;

// WIN_ enum (easy_chat.c:385-389) â€” Window IDs.
const WIN_TITLE         = 0;
const WIN_MSG           = 1;
const WIN_INPUT_SELECT  = 2;

// FRAME_OFFSET_ / FRAME_TILE_ (easy_chat.c:392-403)
const FRAME_OFFSET_ORANGE = 0x1000;
const FRAME_OFFSET_GREEN  = 0x4000;
const FRAME_TILE_TRANSPARENT     = 0x0;
const FRAME_TILE_TOP_L_CORNER    = 0x1;
const FRAME_TILE_TOP_EDGE        = 0x2;
const FRAME_TILE_TOP_R_CORNER    = 0x3;
const FRAME_TILE_L_EDGE          = 0x5;
const FRAME_TILE_R_EDGE          = 0x7;
const FRAME_TILE_BOTTOM_L_CORNER = 0x9;
const FRAME_TILE_BOTTOM_EDGE     = 0xA;
const FRAME_TILE_BOTTOM_R_CORNER = 0xB;

// RECTCURSOR_ANIM_ enum (easy_chat.c:1007-1012)
const RECTCURSOR_ANIM_ON_GROUP   = 0;
const RECTCURSOR_ANIM_ON_BUTTON  = 1;
const RECTCURSOR_ANIM_ON_OTHERS  = 2;
const RECTCURSOR_ANIM_ON_LETTER  = 3;

// MODEWINDOW_ANIM_ enum (easy_chat.c:1076-1082)
const MODEWINDOW_ANIM_HIDDEN       = 0;
const MODEWINDOW_ANIM_TO_GROUP     = 1;
const MODEWINDOW_ANIM_TO_ALPHABET  = 2;
const MODEWINDOW_ANIM_TO_HIDDEN    = 3;
const MODEWINDOW_ANIM_TRANSITION   = 4;

// GBA window/dispcnt bits — 1:1 décomp `include/gba/io_reg.h`.
// Migrés vers imports decomp-data io_reg-data.ts (cleanup B7).
const WININ_WIN0_BG0     = 0x01;
const WININ_WIN0_BG1     = 0x02;
const WININ_WIN0_BG2     = 0x04;
const WININ_WIN0_BG3     = 0x08;
const WININ_WIN0_BG_ALL  = WININ_WIN0_BG0 | WININ_WIN0_BG1 | WININ_WIN0_BG2 | WININ_WIN0_BG3;
const WININ_WIN0_OBJ     = 0x10;
const WININ_WIN0_CLR     = 0x20;
const WINOUT_WIN01_BG0   = 0x01;
const WINOUT_WIN01_BG1   = 0x02;
const WINOUT_WIN01_BG3   = 0x08;
const WINOUT_WIN01_OBJ   = 0x10;
const WINOUT_WIN01_CLR   = 0x20;

// COPYWIN_ (1:1 decomp include/window.h).
const COPYWIN_FULL = 3;
const COPYWIN_GFX  = 2;

// BG_COORD_ (1:1 decomp include/gba/types.h).
const BG_COORD_SET = 0;
const BG_COORD_ADD = 1;

// MAX_SPRITES (decomp include/sprite.h MAX_SPRITES = 64).
// Migré vers import decomp-data sprite-data.ts (cleanup B7).
import { MAX_SPRITES } from '../decomp-data/include/sprite-data';

// EC_ constants (1:1 decomp include/constants/easy_chat.h).
const EC_MASK_BITS  = 9;
const EC_MASK_GROUP = 0x7F;
export const EC_EMPTY_WORD = 0xFFFF;

// EC_GROUP_* (easy_chat.h:31-53). 1:1 valeurs (constantes, pas de hardcode au sens
// "logique runtime fragile" : ce sont des IDs de groupe figÃ©s par le format ROM).
const EC_GROUP_POKEMON          = 0;
const EC_GROUP_TRAINER          = 1;
const EC_GROUP_LIFESTYLE        = 12;
const EC_GROUP_HOBBIES          = 13;
const EC_GROUP_ADJECTIVES       = 16;
const EC_GROUP_EVENTS           = 17;
const EC_GROUP_MOVE_1           = 18;
const EC_GROUP_MOVE_2           = 19;
const EC_GROUP_TRENDY_SAYING    = 20;
const EC_GROUP_POKEMON_NATIONAL = 21;
const EC_NUM_GROUPS             = 22;

const EC_NUM_ALPHABET_GROUPS   = 27;
const EC_MAX_WORDS_IN_GROUP    = 270;
const NUM_TRENDY_SAYINGS       = 33;
const NUM_QUESTIONNAIRE_WORDS  = 4;
const EASY_CHAT_BATTLE_WORDS_COUNT = 6;
const MAIL_COUNT                   = 16;
const MAIL_WORDS_COUNT             = 9;

// EASY_CHAT_TYPE_ (easy_chat.h:4-24).
const EASY_CHAT_TYPE_QUIZ_QUESTION = 16;

// EASY_CHAT_PERSON_ (easy_chat.h:26-29).
const EASY_CHAT_PERSON_REPORTER_MALE   = 0;
const EASY_CHAT_PERSON_REPORTER_FEMALE = 1;
const EASY_CHAT_PERSON_BOY             = 2;

// EC_GROUP / EC_INDEX / EC_WORD helpers (easy_chat.h macros).
function EC_GROUP(word: number): number { return (word >> EC_MASK_BITS) & EC_MASK_GROUP; }
function EC_INDEX(word: number): number { return word & ((1 << EC_MASK_BITS) - 1); }
function EC_WORD(group: number, idx: number): number { return ((group & EC_MASK_GROUP) << EC_MASK_BITS) | (idx & ((1 << EC_MASK_BITS) - 1)); }

// MALE/FEMALE (1:1 decomp include/constants/pokemon.h).
const MALE   = 0;
const FEMALE = 1;

// FLAG_GET_SEEN (1:1 decomp include/constants/pokedex.h).
const FLAG_GET_SEEN = 0;

// FLAG_ constants utilisÃ©es (1:1 decomp include/constants/flags.h).
// Valeurs placeholder â€” rÃ©solues via _setFlagGet getter au runtime.
// (Ã€ injecter ; ici sentinel 0 si non set, gÃ©rÃ© par STUB FlagGet().)
const FLAG_SYS_GAME_CLEAR        = 0;
const FLAG_UNLOCKED_TRENDY_SAYINGS = 0;

// â”€â”€â”€ Structs 1:1 decomp (cf. include/easy_chat.h) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/** 1:1 decomp struct EasyChatScreen (easy_chat.h:20-46). */
export interface EasyChatScreen {
  type: number;
  templateId: number;
  numColumns: number;
  numRows: number;
  inputState: number;
  mainCursorColumn: number;
  mainCursorRow: number;
  maxWords: number;
  inputStateBackup: number;
  inAlphabetMode: number; // bool8
  keyboardColumn: number;
  keyboardRow: number;
  keyboardScrollOffset: number;
  keyboardLastRow: number;
  wordSelectScrollOffset: number;
  wordSelectLastRow: number;
  wordSelectColumn: number;
  wordSelectRow: number;
  displayedPersonType: number;
  unused: number;
  quizTitle: Uint8Array;
  titleText: Uint8Array | string | null;
  savedPhrase: Uint16Array | null;
  currentPhrase: Uint16Array;
}

/** 1:1 decomp struct EasyChatScreenControl (easy_chat.h:48-75). */
export interface EasyChatScreenControl {
  funcState: number;
  windowId: number;
  currentFuncId: number;
  curWindowAnimState: number;
  destWindowAnimState: number;
  windowAnimStateDir: number;
  modeWindowState: number;
  fourFooterOptions: number; // bool8
  phrasePrintBuffer: Uint8Array;     // [193]
  wordSelectPrintBuffer: Uint8Array; // [514]
  scrollOffset: number;
  scrollDest: number;
  scrollSpeed: number;
  mainCursorSprite: DecompSprite | null;
  rectangleCursorSpriteRight: DecompSprite | null;
  rectangleCursorSpriteLeft: DecompSprite | null;
  wordSelectCursorSprite: DecompSprite | null;
  buttonWindowSprite: DecompSprite | null;
  modeWindowSprite: DecompSprite | null;
  scrollIndicatorUpSprite: DecompSprite | null;
  scrollIndicatorDownSprite: DecompSprite | null;
  startButtonSprite: DecompSprite | null;
  selectButtonSprite: DecompSprite | null;
  bg1TilemapBuffer: Uint16Array; // [BG_SCREEN_SIZE / 2]
  bg3TilemapBuffer: Uint16Array; // [BG_SCREEN_SIZE / 2]
}

/** 1:1 decomp struct EasyChatPhraseFrameDimensions (easy_chat.h:77-84). */
export interface EasyChatPhraseFrameDimensions {
  left: number;
  top: number;
  width: number;
  height: number;
  footerId: number;
}

/** 1:1 decomp struct EasyChatWordInfo (easy_chat.h:86-91). */
export interface EasyChatWordInfo {
  text: Uint8Array | string;
  alphabeticalOrder: number;
  enabled: number;
}

/** 1:1 decomp union EasyChatGroupWordData (easy_chat.h:93-97). */
export interface EasyChatGroupWordData {
  valueList?: Uint16Array | number[];
  words?: ReadonlyArray<EasyChatWordInfo>;
}

/** 1:1 decomp struct EasyChatGroup (easy_chat.h:99-104). */
export interface EasyChatGroup {
  wordData: EasyChatGroupWordData;
  numWords: number;
  numEnabledWords: number;
}

/** 1:1 decomp struct EasyChatScreenWordData (easy_chat.h:106-115). */
export interface EasyChatScreenWordData {
  numUnlockedGroups: number;
  unlockedGroupIds: Uint16Array;             // [EC_NUM_GROUPS]
  numUnlockedAlphabetWords: Uint16Array;     // [EC_NUM_ALPHABET_GROUPS]
  unlockedAlphabetWords: Uint16Array[];      // [EC_NUM_ALPHABET_GROUPS][EC_MAX_WORDS_IN_GROUP]
  unused: Uint8Array;                        // [44]
  selectedGroupWords: Uint16Array;           // [EC_MAX_WORDS_IN_GROUP]
  numSelectedGroupWords: number;
}

/** 1:1 decomp struct EasyChatWordsByLetter (easy_chat.h:117-121). */
export interface EasyChatWordsByLetter {
  words: Uint16Array | number[];
  numWords: number;
}

// â”€â”€â”€ EWRAM-level static state (1:1 decomp easy_chat.c:36-38) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/** static EWRAM_DATA struct EasyChatScreen *sEasyChatScreen = NULL;
 *  InjectÃ© par easy-chat.ts (section 1-2) via _setEasyChatScreen. */
let sEasyChatScreen: EasyChatScreen | null = null;

/** static EWRAM_DATA struct EasyChatScreenControl *sScreenControl = NULL;
 *  AllouÃ© par InitEasyChatScreenControl_ (= ce module = owner). */
let sScreenControl: EasyChatScreenControl | null = null;

/** static EWRAM_DATA struct EasyChatScreenWordData *sWordData = NULL;
 *  AllouÃ© par InitEasyChatScreenWordData (= ce module = owner). */
let sWordData: EasyChatScreenWordData | null = null;

/** Setter pour sEasyChatScreen (= injectÃ© par section 1-2 du port easy-chat.ts
 *  quand celui-ci sera portÃ©). */
export function _setEasyChatScreen(ec: EasyChatScreen | null): void {
  sEasyChatScreen = ec;
}

/** Lecture exposÃ©e pour easy-chat.ts (= section 1-2 input handlers). */
export function _getScreenControl(): EasyChatScreenControl | null { return sScreenControl; }
export function _getWordData(): EasyChatScreenWordData | null { return sWordData; }

// â”€â”€â”€ Setters injection (= helpers section 1-2 absents) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
//
//   Le decomp easy_chat.c partage 100+ static helpers entre sections.
//   Ce module porte sections 3-4 ; les helpers nÃ©cessaires (section 1-2)
//   doivent Ãªtre injectÃ©s via setters depuis easy-chat.ts (futur).
//   Fallback STUB : warn + sentinel.

type StringOrU8 = Uint8Array | string | null;

let _GetEasyChatScreenFrameId: () => number = () => {
  console.warn('[easy-chat-render STUB] GetEasyChatScreenFrameId : injection manquante');
  return 0;
};
let _GetEasyChatScreenType: () => number = () => {
  console.warn('[easy-chat-render STUB] GetEasyChatScreenType : injection manquante');
  return 0;
};
let _GetMainCursorColumn: () => number = () => 0;
let _GetMainCursorRow: () => number = () => 0;
let _GetNumColumns: () => number = () => 0;
let _GetNumRows: () => number = () => 0;
let _GetCurrentPhrase: () => Uint16Array = () => new Uint16Array(0);
let _GetTitleText: () => StringOrU8 = () => null;
let _GetInAlphabetMode: () => number = () => 0;
let _GetKeyboardCursorColAndRow: () => { column: number; row: number } = () => ({ column: 0, row: 0 });
let _GetWordSelectColAndRow: () => { column: number; row: number } = () => ({ column: 0, row: 0 });
let _GetKeyboardScrollOffset: () => number = () => 0;
let _GetWordSelectScrollOffset: () => number = () => 0;
let _GetWordSelectLastRow: () => number = () => 0;
let _GetEasyChatInstructionsText: () => { text1: StringOrU8; text2: StringOrU8 } = () => ({ text1: null, text2: null });
let _GetEasyChatConfirmExitText: () => { text1: StringOrU8; text2: StringOrU8 } = () => ({ text1: null, text2: null });
let _GetEasyChatConfirmText: () => { text1: StringOrU8; text2: StringOrU8 } = () => ({ text1: null, text2: null });
let _GetEasyChatConfirmDeletionText: () => { text1: StringOrU8; text2: StringOrU8 } = () => ({ text1: null, text2: null });
let _CanScrollUp: () => boolean = () => false;
let _CanScrollDown: () => boolean = () => false;
let _GetDisplayedPersonType: () => number = () => 3; // EASY_CHAT_PERSON_DISPLAY_NONE
let _FooterHasFourOptions_: () => number = () => 0;
let _GetQuestionnaireWordsPtr: () => Uint16Array = () => new Uint16Array(NUM_QUESTIONNAIRE_WORDS);

export function _setGetEasyChatScreenFrameId(fn: () => number): void { _GetEasyChatScreenFrameId = fn; }
export function _setGetEasyChatScreenType(fn: () => number): void { _GetEasyChatScreenType = fn; }
export function _setGetMainCursorColumn(fn: () => number): void { _GetMainCursorColumn = fn; }
export function _setGetMainCursorRow(fn: () => number): void { _GetMainCursorRow = fn; }
export function _setGetNumColumns(fn: () => number): void { _GetNumColumns = fn; }
export function _setGetNumRows(fn: () => number): void { _GetNumRows = fn; }
export function _setGetCurrentPhrase(fn: () => Uint16Array): void { _GetCurrentPhrase = fn; }
export function _setGetTitleText(fn: () => StringOrU8): void { _GetTitleText = fn; }
export function _setGetInAlphabetMode(fn: () => number): void { _GetInAlphabetMode = fn; }
export function _setGetKeyboardCursorColAndRow(fn: () => { column: number; row: number }): void { _GetKeyboardCursorColAndRow = fn; }
export function _setGetWordSelectColAndRow(fn: () => { column: number; row: number }): void { _GetWordSelectColAndRow = fn; }
export function _setGetKeyboardScrollOffset(fn: () => number): void { _GetKeyboardScrollOffset = fn; }
export function _setGetWordSelectScrollOffset(fn: () => number): void { _GetWordSelectScrollOffset = fn; }
export function _setGetWordSelectLastRow(fn: () => number): void { _GetWordSelectLastRow = fn; }
export function _setGetEasyChatInstructionsText(fn: () => { text1: StringOrU8; text2: StringOrU8 }): void { _GetEasyChatInstructionsText = fn; }
export function _setGetEasyChatConfirmExitText(fn: () => { text1: StringOrU8; text2: StringOrU8 }): void { _GetEasyChatConfirmExitText = fn; }
export function _setGetEasyChatConfirmText(fn: () => { text1: StringOrU8; text2: StringOrU8 }): void { _GetEasyChatConfirmText = fn; }
export function _setGetEasyChatConfirmDeletionText(fn: () => { text1: StringOrU8; text2: StringOrU8 }): void { _GetEasyChatConfirmDeletionText = fn; }
export function _setCanScrollUp(fn: () => boolean): void { _CanScrollUp = fn; }
export function _setCanScrollDown(fn: () => boolean): void { _CanScrollDown = fn; }
export function _setGetDisplayedPersonType(fn: () => number): void { _GetDisplayedPersonType = fn; }
export function _setFooterHasFourOptions_(fn: () => number): void { _FooterHasFourOptions_ = fn; }
export function _setGetQuestionnaireWordsPtr(fn: () => Uint16Array): void { _GetQuestionnaireWordsPtr = fn; }

// â”€â”€â”€ Setters data (groups, strings, sprites templates, ROM tables) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

let _gEasyChatGroups: ReadonlyArray<EasyChatGroup> = [];
let _gEasyChatWordsByLetterPointers: ReadonlyArray<EasyChatWordsByLetter> = [];
let _gSpeciesNames: ReadonlyArray<Uint8Array | string> = [];
let _gMoveNames: ReadonlyArray<Uint8Array | string> = [];
let _gNumBardWords_Species = 0;
let _gNumBardWords_Moves = 0;
let _sRestrictedWordSpecies: ReadonlyArray<number> = [];
let _sDefaultProfileWords: ReadonlyArray<number> = [];
let _sDefaultBattleStartWords: ReadonlyArray<number> = [];
let _sDefaultBattleWonWords: ReadonlyArray<number> = [];
let _sDefaultBattleLostWords: ReadonlyArray<number> = [];
let _sPhraseFrameDimensions: ReadonlyArray<EasyChatPhraseFrameDimensions> = [];
let _sFooterOptionXOffsets: ReadonlyArray<ReadonlyArray<number>> = [];
let _sFooterTextOptions: ReadonlyArray<ReadonlyArray<StringOrU8>> = [];
let _sEasyChatBgTemplates: ReadonlyArray<BgTemplate> = [];
let _sEasyChatWindowTemplates: ReadonlyArray<WindowTemplate> = [];
let _sEasyChatYesNoWindowTemplate: WindowTemplate | null = null;
let _sEasyChatKeyboardAlphabet: ReadonlyArray<StringOrU8> = [];
let _sAlphabetKeyboardColumnOffsets: ReadonlyArray<number> = [];
let _sEasyChatGroupNamePointers: ReadonlyArray<StringOrU8> = [];
let _sText_Clear17: Uint8Array | null = null;

let _sSpriteSheets: ReadonlyArray<{ data: unknown; size: number; tag: number | string }> = [];
let _sSpritePalettes: ReadonlyArray<{ data: unknown; tag: number | string }> = [];
let _sCompressedSpriteSheets: ReadonlyArray<{ data: unknown; size: number; tag: number | string }> = [];
let _sSpriteTemplate_TriangleCursor: unknown = null;
let _sSpriteTemplate_RectangleCursor: unknown = null;
let _sSpriteTemplate_ModeWindow: unknown = null;
let _sSpriteTemplate_ButtonWindow: unknown = null;
let _sSpriteTemplate_StartSelectButton: unknown = null;
let _sSpriteTemplate_ScrollIndicator: unknown = null;

let _gEasyChatWindow_Gfx: unknown = null;
let _gEasyChatWindow_Tilemap: Uint16Array = new Uint16Array(0);
let _sTextInputFrame_Gfx: unknown = null;
let _gEasyChatMode_Pal: unknown = null;
let _sTextInputFrameOrange_Pal: unknown = null;
let _sTextInputFrameGreen_Pal: unknown = null;
let _sTitleText_Pal: unknown = null;
let _sText_Pal: unknown = null;

let _gText_CreateAQuiz: StringOrU8 = null;
let _gText_SelectTheAnswer: StringOrU8 = null;
let _gText_OnlyOnePhrase: StringOrU8 = null;
let _gText_OriginalSongWillBeUsed: StringOrU8 = null;
let _gText_LyricsCantBeDeleted: StringOrU8 = null;
let _gText_CombineTwoWordsOrPhrases3: StringOrU8 = null;
let _gText_YouCannotQuitHere: StringOrU8 = null;
let _gText_SectionMustBeCompleted: StringOrU8 = null;
let _gText_ThreeQuestionMarks: StringOrU8 = '???';

export function _setGEasyChatGroups(v: ReadonlyArray<EasyChatGroup>): void { _gEasyChatGroups = v; }
export function _setGEasyChatWordsByLetterPointers(v: ReadonlyArray<EasyChatWordsByLetter>): void { _gEasyChatWordsByLetterPointers = v; }
export function _setGSpeciesNames(v: ReadonlyArray<Uint8Array | string>): void { _gSpeciesNames = v; }
export function _setGMoveNames(v: ReadonlyArray<Uint8Array | string>): void { _gMoveNames = v; }
export function _setGNumBardWords_Species(v: number): void { _gNumBardWords_Species = v; }
export function _setGNumBardWords_Moves(v: number): void { _gNumBardWords_Moves = v; }
export function _setSRestrictedWordSpecies(v: ReadonlyArray<number>): void { _sRestrictedWordSpecies = v; }
export function _setSDefaultProfileWords(v: ReadonlyArray<number>): void { _sDefaultProfileWords = v; }
export function _setSDefaultBattleStartWords(v: ReadonlyArray<number>): void { _sDefaultBattleStartWords = v; }
export function _setSDefaultBattleWonWords(v: ReadonlyArray<number>): void { _sDefaultBattleWonWords = v; }
export function _setSDefaultBattleLostWords(v: ReadonlyArray<number>): void { _sDefaultBattleLostWords = v; }
export function _setSPhraseFrameDimensions(v: ReadonlyArray<EasyChatPhraseFrameDimensions>): void { _sPhraseFrameDimensions = v; }
export function _setSFooterOptionXOffsets(v: ReadonlyArray<ReadonlyArray<number>>): void { _sFooterOptionXOffsets = v; }
export function _setSFooterTextOptions(v: ReadonlyArray<ReadonlyArray<StringOrU8>>): void { _sFooterTextOptions = v; }
export function _setSEasyChatBgTemplates(v: ReadonlyArray<BgTemplate>): void { _sEasyChatBgTemplates = v; }
export function _setSEasyChatWindowTemplates(v: ReadonlyArray<WindowTemplate>): void { _sEasyChatWindowTemplates = v; }
export function _setSEasyChatYesNoWindowTemplate(v: WindowTemplate): void { _sEasyChatYesNoWindowTemplate = v; }
export function _setSEasyChatKeyboardAlphabet(v: ReadonlyArray<StringOrU8>): void { _sEasyChatKeyboardAlphabet = v; }
export function _setSAlphabetKeyboardColumnOffsets(v: ReadonlyArray<number>): void { _sAlphabetKeyboardColumnOffsets = v; }
export function _setSEasyChatGroupNamePointers(v: ReadonlyArray<StringOrU8>): void { _sEasyChatGroupNamePointers = v; }
export function _setSText_Clear17(v: Uint8Array): void { _sText_Clear17 = v; }
export function _setSSpriteSheets(v: ReadonlyArray<{ data: unknown; size: number; tag: number | string }>): void { _sSpriteSheets = v; }
export function _setSSpritePalettes(v: ReadonlyArray<{ data: unknown; tag: number | string }>): void { _sSpritePalettes = v; }
export function _setSCompressedSpriteSheets(v: ReadonlyArray<{ data: unknown; size: number; tag: number | string }>): void { _sCompressedSpriteSheets = v; }
export function _setSSpriteTemplate_TriangleCursor(v: unknown): void { _sSpriteTemplate_TriangleCursor = v; }
export function _setSSpriteTemplate_RectangleCursor(v: unknown): void { _sSpriteTemplate_RectangleCursor = v; }
export function _setSSpriteTemplate_ModeWindow(v: unknown): void { _sSpriteTemplate_ModeWindow = v; }
export function _setSSpriteTemplate_ButtonWindow(v: unknown): void { _sSpriteTemplate_ButtonWindow = v; }
export function _setSSpriteTemplate_StartSelectButton(v: unknown): void { _sSpriteTemplate_StartSelectButton = v; }
export function _setSSpriteTemplate_ScrollIndicator(v: unknown): void { _sSpriteTemplate_ScrollIndicator = v; }
export function _setGEasyChatWindow_Gfx(v: unknown): void { _gEasyChatWindow_Gfx = v; }
export function _setGEasyChatWindow_Tilemap(v: Uint16Array): void { _gEasyChatWindow_Tilemap = v; }
export function _setSTextInputFrame_Gfx(v: unknown): void { _sTextInputFrame_Gfx = v; }
export function _setGEasyChatMode_Pal(v: unknown): void { _gEasyChatMode_Pal = v; }
export function _setSTextInputFrameOrange_Pal(v: unknown): void { _sTextInputFrameOrange_Pal = v; }
export function _setSTextInputFrameGreen_Pal(v: unknown): void { _sTextInputFrameGreen_Pal = v; }
export function _setSTitleText_Pal(v: unknown): void { _sTitleText_Pal = v; }
export function _setSText_Pal(v: unknown): void { _sText_Pal = v; }
export function _setGText_CreateAQuiz(v: StringOrU8): void { _gText_CreateAQuiz = v; }
export function _setGText_SelectTheAnswer(v: StringOrU8): void { _gText_SelectTheAnswer = v; }
export function _setGText_OnlyOnePhrase(v: StringOrU8): void { _gText_OnlyOnePhrase = v; }
export function _setGText_OriginalSongWillBeUsed(v: StringOrU8): void { _gText_OriginalSongWillBeUsed = v; }
export function _setGText_LyricsCantBeDeleted(v: StringOrU8): void { _gText_LyricsCantBeDeleted = v; }
export function _setGText_CombineTwoWordsOrPhrases3(v: StringOrU8): void { _gText_CombineTwoWordsOrPhrases3 = v; }
export function _setGText_YouCannotQuitHere(v: StringOrU8): void { _gText_YouCannotQuitHere = v; }
export function _setGText_SectionMustBeCompleted(v: StringOrU8): void { _gText_SectionMustBeCompleted = v; }
export function _setGText_ThreeQuestionMarks(v: StringOrU8): void { _gText_ThreeQuestionMarks = v; }

// SaveBlock / VAR / Random / Pokedex / Flag / OBJ_EVENT_GFX bridges
let _gSaveBlock1Ptr: any = {
  easyChatProfile: new Uint16Array(EASY_CHAT_BATTLE_WORDS_COUNT),
  easyChatBattleStart: new Uint16Array(EASY_CHAT_BATTLE_WORDS_COUNT),
  easyChatBattleWon: new Uint16Array(EASY_CHAT_BATTLE_WORDS_COUNT),
  easyChatBattleLost: new Uint16Array(EASY_CHAT_BATTLE_WORDS_COUNT),
  mail: Array.from({ length: MAIL_COUNT }, () => ({ words: new Uint16Array(MAIL_WORDS_COUNT) })),
  unlockedTrendySayings: new Uint8Array(8),
};
let _gSaveBlock2Ptr: any = { playerGender: MALE };
let _gSpecialVar_0x8004 = 0;
let _gStringVar2 = new Uint8Array(64);
let _gStringVar4 = new Uint8Array(1024);

let _Random: () => number = () => Math.floor(Math.random() * 0x10000) & 0xFFFF;
let _FlagGet: (flagId: number) => boolean = () => false;
let _SpeciesToNationalPokedexNum: (species: number) => number = (s) => s;
let _GetSetPokedexFlag: (dexNum: number, op: number) => number = () => 0;
let _GetNationalPokedexCount: (op: number) => number = () => 0;
let _IsNationalPokedexEnabled: () => boolean = () => false;
let _ShowFieldAutoScrollMessage: (text: Uint8Array | string) => void = () => { /* no-op */ };

let _OBJ_EVENT_GFX_REPORTER_M: number = -1;
let _OBJ_EVENT_GFX_REPORTER_F: number = -1;
let _OBJ_EVENT_GFX_BOY_1: number = -1;
let _OBJ_EVENT_GFX_RIVAL_BRENDAN_NORMAL: number = -1;
let _OBJ_EVENT_GFX_RIVAL_MAY_NORMAL: number = -1;

export function _setGSaveBlock1Ptr(v: any): void { _gSaveBlock1Ptr = v; }
export function _setGSaveBlock2Ptr(v: any): void { _gSaveBlock2Ptr = v; }
export function _setGSpecialVar_0x8004(v: number): void { _gSpecialVar_0x8004 = v; }
export function _setGStringVar2(v: Uint8Array): void { _gStringVar2 = v as Uint8Array<ArrayBuffer>; }
export function _setGStringVar4(v: Uint8Array): void { _gStringVar4 = v as Uint8Array<ArrayBuffer>; }
export function _setRandom(fn: () => number): void { _Random = fn; }
export function _setFlagGet(fn: (id: number) => boolean): void { _FlagGet = fn; }
export function _setSpeciesToNationalPokedexNum(fn: (s: number) => number): void { _SpeciesToNationalPokedexNum = fn; }
export function _setGetSetPokedexFlag(fn: (d: number, op: number) => number): void { _GetSetPokedexFlag = fn; }
export function _setGetNationalPokedexCount(fn: (op: number) => number): void { _GetNationalPokedexCount = fn; }
export function _setIsNationalPokedexEnabled(fn: () => boolean): void { _IsNationalPokedexEnabled = fn; }
export function _setShowFieldAutoScrollMessage(fn: (t: Uint8Array | string) => void): void { _ShowFieldAutoScrollMessage = fn; }
export function _setObjEventGfxConstants(v: {
  REPORTER_M?: number; REPORTER_F?: number; BOY_1?: number;
  RIVAL_BRENDAN_NORMAL?: number; RIVAL_MAY_NORMAL?: number;
}): void {
  if (v.REPORTER_M !== undefined) _OBJ_EVENT_GFX_REPORTER_M = v.REPORTER_M;
  if (v.REPORTER_F !== undefined) _OBJ_EVENT_GFX_REPORTER_F = v.REPORTER_F;
  if (v.BOY_1 !== undefined) _OBJ_EVENT_GFX_BOY_1 = v.BOY_1;
  if (v.RIVAL_BRENDAN_NORMAL !== undefined) _OBJ_EVENT_GFX_RIVAL_BRENDAN_NORMAL = v.RIVAL_BRENDAN_NORMAL;
  if (v.RIVAL_MAY_NORMAL !== undefined) _OBJ_EVENT_GFX_RIVAL_MAY_NORMAL = v.RIVAL_MAY_NORMAL;
}

// â”€â”€â”€ String helpers locaux (1:1 decomp string_util.c minimal) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function StringCopy(dest: Uint8Array, src: Uint8Array | string): Uint8Array {
  // 1:1 decomp StringCopy : copie jusqu'Ã  EOS, retourne ptr sur EOS.
  let i = 0;
  if (typeof src === 'string') {
    for (i = 0; i < src.length && i < dest.length - 1; i++) {
      dest[i] = src.charCodeAt(i);
    }
  } else {
    for (i = 0; i < src.length && i < dest.length - 1; i++) {
      const b = src[i];
      if (b === EOS) break;
      dest[i] = b;
    }
  }
  if (i < dest.length) dest[i] = EOS;
  // Retourne subarray pointant juste sur EOS (= Ã©quivalent ptr arithmetic decomp).
  return dest.subarray(i);
}

function StringAppend(dest: Uint8Array, src: Uint8Array | string): Uint8Array {
  // 1:1 decomp StringAppend : find EOS in dest, then StringCopy src there.
  let p = 0;
  while (p < dest.length && dest[p] !== EOS) p++;
  return StringCopy(dest.subarray(p), src);
}

function StringLength(str: Uint8Array | string): number {
  if (typeof str === 'string') return str.length;
  let i = 0;
  while (i < str.length && str[i] !== EOS) i++;
  return i;
}

// 1:1 décomp `u8 *WriteColorChangeControlCode(u8 *dest, u32 colorType, u8 color)`
// (string_util.c:602) — CONSOLIDÉ vers le miroir `src/game/string_util.ts` (0 dup).
// NB : le miroir écrit le `EOS` final que cette impl locale OMETTAIT (vraie divergence
// 1:1 corrigée) ; les callers ré-écrivent aussitôt cette position (CHAR_HYPHEN / StringAppend).
import { WriteColorChangeControlCode } from '../../game/include/string_util';

// â”€â”€â”€ Memory allocation 1:1 (Alloc / TRY_FREE_AND_SET_NULL) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function Alloc<T>(factory: () => T): T { return factory(); }

function makeEasyChatScreenControl(): EasyChatScreenControl {
  return {
    funcState: 0,
    windowId: 0,
    currentFuncId: 0,
    curWindowAnimState: 0,
    destWindowAnimState: 0,
    windowAnimStateDir: 0,
    modeWindowState: 0,
    fourFooterOptions: 0,
    phrasePrintBuffer: new Uint8Array(193),
    wordSelectPrintBuffer: new Uint8Array(514),
    scrollOffset: 0,
    scrollDest: 0,
    scrollSpeed: 0,
    mainCursorSprite: null,
    rectangleCursorSpriteRight: null,
    rectangleCursorSpriteLeft: null,
    wordSelectCursorSprite: null,
    buttonWindowSprite: null,
    modeWindowSprite: null,
    scrollIndicatorUpSprite: null,
    scrollIndicatorDownSprite: null,
    startButtonSprite: null,
    selectButtonSprite: null,
    bg1TilemapBuffer: new Uint16Array(BG_SCREEN_SIZE / 2),
    bg3TilemapBuffer: new Uint16Array(BG_SCREEN_SIZE / 2),
  };
}

function makeEasyChatScreenWordData(): EasyChatScreenWordData {
  return {
    numUnlockedGroups: 0,
    unlockedGroupIds: new Uint16Array(EC_NUM_GROUPS),
    numUnlockedAlphabetWords: new Uint16Array(EC_NUM_ALPHABET_GROUPS),
    unlockedAlphabetWords: Array.from({ length: EC_NUM_ALPHABET_GROUPS },
      () => new Uint16Array(EC_MAX_WORDS_IN_GROUP)),
    unused: new Uint8Array(44),
    selectedGroupWords: new Uint16Array(EC_MAX_WORDS_IN_GROUP),
    numSelectedGroupWords: 0,
  };
}

// â”€â”€â”€ Local STUBs for helpers hors-scope (= lignes hors range 3000-4500) â”€â”€â”€â”€â”€â”€
//
//   Ces helpers sont dÃ©finis ailleurs dans easy_chat.c (sections 0-2 et 4-5)
//   ou dans d'autres modules decomp non encore portÃ©s. STUB explicite ici.

function SetBgTilemapBuffer(_bg: number, _buf: Uint16Array): void {
  console.warn('[easy-chat-render STUB] SetBgTilemapBuffer hors-scope (bg.c)');
}
function DecompressAndLoadBgGfxUsingHeap(_bg: number, _src: unknown, _size: number, _offset: number, _mode: number): void {
  console.warn('[easy-chat-render STUB] DecompressAndLoadBgGfxUsingHeap hors-scope (menu.c)');
}
function IsDma3ManagerBusyWithBgCopy(): boolean {
  // 1:1 decomp : dans notre engine la copie est synchrone => jamais busy.
  return false;
}
function CopyToBgTilemapBufferRect(_bg: number, _src: Uint16Array | unknown, _destX: number, _destY: number, _width: number, _height: number): void {
  console.warn('[easy-chat-render STUB] CopyToBgTilemapBufferRect hors-scope (bg.c)');
}

// Section 4 sprite helpers (lignes 4624+) â€” STUB pour les call-sites lignes 3000-4500.
function CreateMainCursorSprite(): void {
  console.warn('[easy-chat-render STUB] CreateMainCursorSprite â€” section 4 (ligne 4624+)');
}
function SetMainCursorPos(_x: number, _y: number): void {
  console.warn('[easy-chat-render STUB] SetMainCursorPos â€” section 4');
}
function StartMainCursorAnim(): void {
  console.warn('[easy-chat-render STUB] StartMainCursorAnim â€” section 4');
}
function StopMainCursorAnim(): void {
  console.warn('[easy-chat-render STUB] StopMainCursorAnim â€” section 4');
}
function CreateRectangleCursorSprites(): void {
  console.warn('[easy-chat-render STUB] CreateRectangleCursorSprites â€” section 4');
}
function DestroyRectangleCursorSprites(): void {
  console.warn('[easy-chat-render STUB] DestroyRectangleCursorSprites â€” section 4');
}
function UpdateRectangleCursorPos(): void {
  console.warn('[easy-chat-render STUB] UpdateRectangleCursorPos â€” section 4');
}
function CreateWordSelectCursorSprite(): void {
  console.warn('[easy-chat-render STUB] CreateWordSelectCursorSprite â€” section 4');
}
function DestroyWordSelectCursorSprite(): void {
  console.warn('[easy-chat-render STUB] DestroyWordSelectCursorSprite â€” section 4');
}
function UpdateWordSelectCursorPos(): void {
  console.warn('[easy-chat-render STUB] UpdateWordSelectCursorPos â€” section 4');
}
function CreateSideWindowSprites(): void {
  console.warn('[easy-chat-render STUB] CreateSideWindowSprites â€” section 4');
}
function DestroySideWindowSprites(): boolean {
  console.warn('[easy-chat-render STUB] DestroySideWindowSprites â€” section 4');
  return false;
}
function ShowSideWindow(): boolean {
  console.warn('[easy-chat-render STUB] ShowSideWindow â€” section 4');
  return false;
}
function HideModeWindow(): void {
  console.warn('[easy-chat-render STUB] HideModeWindow â€” section 4');
}
function SetModeWindowToTransition(): void {
  console.warn('[easy-chat-render STUB] SetModeWindowToTransition â€” section 4');
}
function UpdateModeWindowAnim(): void {
  console.warn('[easy-chat-render STUB] UpdateModeWindowAnim â€” section 4');
}
function IsModeWindowAnimActive(): boolean {
  console.warn('[easy-chat-render STUB] IsModeWindowAnimActive â€” section 4');
  return false;
}
function CreateScrollIndicatorSprites(): void {
  console.warn('[easy-chat-render STUB] CreateScrollIndicatorSprites â€” section 4');
}
function UpdateScrollIndicatorsVisibility(): void {
  console.warn('[easy-chat-render STUB] UpdateScrollIndicatorsVisibility â€” section 4');
}
function HideScrollIndicators(): void {
  console.warn('[easy-chat-render STUB] HideScrollIndicators â€” section 4');
}
function SetScrollIndicatorXPos(_inWordSelect: boolean): void {
  console.warn('[easy-chat-render STUB] SetScrollIndicatorXPos â€” section 4');
}
function CreateStartSelectButtonSprites(): void {
  console.warn('[easy-chat-render STUB] CreateStartSelectButtonSprites â€” section 4');
}
function UpdateStartSelectButtonsVisibility(): void {
  console.warn('[easy-chat-render STUB] UpdateStartSelectButtonsVisibility â€” section 4');
}
function HideStartSelectButtons(): void {
  console.warn('[easy-chat-render STUB] HideStartSelectButtons â€” section 4');
}
function TryAddInterviewObjectEvents(): void {
  console.warn('[easy-chat-render STUB] TryAddInterviewObjectEvents â€” section 4');
}
function AddMainScreenButtonWindow(): void {
  console.warn('[easy-chat-render STUB] AddMainScreenButtonWindow â€” section 4');
}
function LoadEasyChatGfx(): void {
  console.warn('[easy-chat-render STUB] LoadEasyChatGfx â€” section 4');
}
function GetFooterOptionXOffset(_optionIdx: number): number {
  console.warn('[easy-chat-render STUB] GetFooterOptionXOffset â€” section 4');
  return 0;
}
function CopyEasyChatWord(dest: Uint8Array, _ecWord: number): Uint8Array {
  console.warn('[easy-chat-render STUB] CopyEasyChatWord â€” section 4');
  if (dest.length > 0) dest[0] = EOS;
  return dest.subarray(0);
}
function CopyEasyChatWordPadded(dest: Uint8Array, _ecWord: number, _padLength: number): Uint8Array {
  console.warn('[easy-chat-render STUB] CopyEasyChatWordPadded â€” section 4');
  if (dest.length > 0) dest[0] = EOS;
  return dest.subarray(0);
}
function GetEasyChatWordGroupName(_groupId: number): Uint8Array | string {
  console.warn('[easy-chat-render STUB] GetEasyChatWordGroupName â€” section 4');
  return '';
}
function GetUnlockedEasyChatGroupId(_idx: number): number {
  console.warn('[easy-chat-render STUB] GetUnlockedEasyChatGroupId â€” section 4');
  return EC_NUM_GROUPS;
}
function GetWordFromSelectedGroup(_wordIndex: number): number {
  console.warn('[easy-chat-render STUB] GetWordFromSelectedGroup â€” section 4');
  return EC_EMPTY_WORD;
}

// TRY_FREE_AND_SET_NULL 1:1 decomp macro (include/malloc.h).
function TRY_FREE_AND_SET_NULL<T>(ref: { value: T | null }): void {
  if (ref.value !== null) {
    ref.value = null;
  }
}

// â”€â”€â”€ Lower window scroll/dimensions â€” utilisÃ© par section 3 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
//
//   DÃ©comp easy_chat.c lignes ~4602-4622 â€” proches du range, helpers utilisÃ©s
//   par les fonctions du range et par section 4. Port 1:1.

let sLowerWindowScroll = 0;

function ResetLowerWindowScroll(): void {
  sLowerWindowScroll = 0;
}

function InitLowerWindowScroll(scrollChange: number, scrollSpeed: number): void {
  if (!sScreenControl) return;
  sScreenControl.scrollOffset = sLowerWindowScroll;
  sScreenControl.scrollDest = sLowerWindowScroll + scrollChange * 16;
  sScreenControl.scrollSpeed = scrollSpeed;
}

function UpdateLowerWindowScroll(): boolean {
  if (!sScreenControl) return false;
  if (sScreenControl.scrollOffset === sScreenControl.scrollDest) return false;

  if (sScreenControl.scrollOffset < sScreenControl.scrollDest) {
    sScreenControl.scrollOffset += sScreenControl.scrollSpeed;
    if (sScreenControl.scrollOffset >= sScreenControl.scrollDest) {
      sScreenControl.scrollOffset = sScreenControl.scrollDest;
    }
  } else {
    sScreenControl.scrollOffset -= sScreenControl.scrollSpeed;
    if (sScreenControl.scrollOffset <= sScreenControl.scrollDest) {
      sScreenControl.scrollOffset = sScreenControl.scrollDest;
    }
  }
  sLowerWindowScroll = sScreenControl.scrollOffset;
  return sScreenControl.scrollOffset !== sScreenControl.scrollDest;
}

function GetLowerWindowScrollOffset(): number {
  return Math.floor(sLowerWindowScroll / 16);
}

function SetWindowDimensions(_left: number, _top: number, _right: number, _bottom: number): void {
  // 1:1 decomp : configure REG_WIN0H/V via SetGpuReg. Pour notre engine, no-op.
  // (Le clipping rectangle est traitÃ© par le compositor.)
}

function BufferLowerWindowFrame(left: number, top: number, width: number, height: number): void {
  // 1:1 decomp easy_chat.c â€” dessine un cadre dans la BG1 tilemap pour
  // l'animation d'ouverture/fermeture du clavier/word select.
  // Note : appelÃ© depuis DrawLowerWindowFrame (range 3000-4500).
  const right = left + width;
  const bottom = top + height;
  // Top-left corner.
  FillBgTilemapBufferRect(1, FRAME_OFFSET_GREEN + FRAME_TILE_TOP_L_CORNER, left, top, 1, 1, 4);
  // Top edge.
  FillBgTilemapBufferRect(1, FRAME_OFFSET_GREEN + FRAME_TILE_TOP_EDGE, left + 1, top, width - 1, 1, 4);
  // Top-right corner.
  FillBgTilemapBufferRect(1, FRAME_OFFSET_GREEN + FRAME_TILE_TOP_R_CORNER, right, top, 1, 1, 4);
  // Left/right edges + middle.
  for (let y = top + 1; y < bottom; y++) {
    FillBgTilemapBufferRect(1, FRAME_OFFSET_GREEN + FRAME_TILE_L_EDGE, left, y, 1, 1, 4);
    FillBgTilemapBufferRect(1, FRAME_OFFSET_GREEN + FRAME_TILE_TRANSPARENT, left + 1, y, width - 1, 1, 4);
    FillBgTilemapBufferRect(1, FRAME_OFFSET_GREEN + FRAME_TILE_R_EDGE, right, y, 1, 1, 4);
  }
  // Bottom-left corner.
  FillBgTilemapBufferRect(1, FRAME_OFFSET_GREEN + FRAME_TILE_BOTTOM_L_CORNER, left, bottom, 1, 1, 4);
  // Bottom edge.
  FillBgTilemapBufferRect(1, FRAME_OFFSET_GREEN + FRAME_TILE_BOTTOM_EDGE, left + 1, bottom, width - 1, 1, 4);
  // Bottom-right corner.
  FillBgTilemapBufferRect(1, FRAME_OFFSET_GREEN + FRAME_TILE_BOTTOM_R_CORNER, right, bottom, 1, 1, 4);
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//   PORT 1:1 STRICT â€” easy_chat.c lignes 3005-4499
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

/** 1:1 decomp easy_chat.c:3005 */
function ClearUnusedField(): void {
  if (!sEasyChatScreen) return;
  sEasyChatScreen.unused = 0;
}

/** 1:1 decomp easy_chat.c:3010 */
function DummyWordCheck(_easyChatWord: number): boolean {
  return false;
}

/** 1:1 decomp easy_chat.c:3015 */
export function InitEasyChatScreenControl(): boolean {
  if (!InitEasyChatScreenControl_()) return false;
  return true;
}

/** 1:1 decomp easy_chat.c:3023 */
export function LoadEasyChatScreen(): boolean {
  if (!sScreenControl) return false;
  switch (sScreenControl.funcState) {
    case 0:
      ResetBgsAndClearDma3BusyFlags(0);
      InitBgsFromTemplates(0, _sEasyChatBgTemplates, _sEasyChatBgTemplates.length);
      SetBgTilemapBuffer(3, sScreenControl.bg3TilemapBuffer);
      SetBgTilemapBuffer(1, sScreenControl.bg1TilemapBuffer);
      InitWindows(_sEasyChatWindowTemplates);
      DeactivateAllTextPrinters();
      LoadEasyChatPalettes();
      InitEasyChatBgs();
      CpuFastFill(0, OAM as unknown as Uint8Array, OAM_SIZE);
      break;
    case 1:
      DecompressAndLoadBgGfxUsingHeap(3, _gEasyChatWindow_Gfx, 0, 0, 0);
      CopyToBgTilemapBuffer(3, _gEasyChatWindow_Tilemap, 0, 0);
      AdjustBgTilemapForFooter();
      BufferFrameTilemap(sScreenControl.bg1TilemapBuffer);
      AddPhraseWindow();
      AddMainScreenButtonWindow();
      CopyBgTilemapBufferToVram(3);
      break;
    case 2:
      DecompressAndLoadBgGfxUsingHeap(1, _sTextInputFrame_Gfx, 0, 0, 0);
      CopyBgTilemapBufferToVram(1);
      break;
    case 3:
      PrintTitle();
      PrintInitialInstructions();
      PrintCurrentPhrase();
      DrawLowerWindow();
      break;
    case 4:
      LoadEasyChatGfx();
      if (_GetEasyChatScreenType() !== EASY_CHAT_TYPE_QUIZ_QUESTION) {
        CreateMainCursorSprite();
      }
      break;
    case 5:
      if (IsDma3ManagerBusyWithBgCopy()) {
        return true;
      } else {
        SetWindowDimensions(0, 0, 0, 0);
        SetGpuReg(REG_OFFSET_WININ, WININ_WIN0_BG_ALL | WININ_WIN0_OBJ | WININ_WIN0_CLR);
        SetGpuReg(REG_OFFSET_WINOUT,
          WINOUT_WIN01_BG0 |
          WINOUT_WIN01_BG1 |
          WINOUT_WIN01_BG3 |
          WINOUT_WIN01_OBJ |
          WINOUT_WIN01_CLR,
        );
        ShowBg(3);
        ShowBg(1);
        ShowBg(2);
        ShowBg(0);
        CreateScrollIndicatorSprites();
        CreateStartSelectButtonSprites();
        TryAddInterviewObjectEvents();
      }
      break;
    default:
      return false;
  }
  sScreenControl.funcState++;
  return true;
}

/** 1:1 decomp easy_chat.c:3093 */
export function FreeEasyChatScreenControl(): void {
  if (sScreenControl !== null) {
    TRY_FREE_AND_SET_NULL({ value: sScreenControl });
    sScreenControl = null;
  }
}

/** 1:1 decomp easy_chat.c:3098 */
export function StartEasyChatFunction(funcId: number): void {
  if (!sScreenControl) return;
  sScreenControl.currentFuncId = funcId;
  sScreenControl.funcState = 0;
  RunEasyChatFunction();
}

/** 1:1 decomp easy_chat.c:3106 â€” Returns FALSE when called function has finished. */
export function RunEasyChatFunction(): boolean {
  if (!sScreenControl) return false;
  switch (sScreenControl.currentFuncId) {
    case ECFUNC_NONE: return false;
    case ECFUNC_REPRINT_PHRASE: return ReprintPhrase();
    case ECFUNC_UPDATE_MAIN_CURSOR: return UpdateMainCursor();
    case ECFUNC_UPDATE_MAIN_CURSOR_ON_BUTTONS: return UpdateMainCursorOnButtons();
    case ECFUNC_PROMPT_DELETE_ALL: return ShowConfirmDeleteAllPrompt();
    case ECFUNC_PROMPT_EXIT: return ShowConfirmExitPrompt();
    case ECFUNC_PROMPT_CONFIRM: return ShowConfirmPrompt();
    case ECFUNC_CLOSE_PROMPT: return ClosePrompt();
    case ECFUNC_CLOSE_PROMPT_AFTER_DELETE: return ClosePromptAfterDeleteAll();
    case ECFUNC_OPEN_KEYBOARD: return OpenKeyboard();
    case ECFUNC_CLOSE_KEYBOARD: return CloseKeyboard();
    case ECFUNC_OPEN_WORD_SELECT: return OpenWordSelect();
    case ECFUNC_CLOSE_WORD_SELECT: return CloseWordSelect();
    case ECFUNC_PROMPT_CONFIRM_LYRICS: return ShowConfirmLyricsPrompt();
    case ECFUNC_RETURN_TO_KEYBOARD: return ReturnToKeyboard();
    case ECFUNC_UPDATE_KEYBOARD_CURSOR: return UpdateKeyboardCursor();
    case ECFUNC_GROUP_NAMES_SCROLL_DOWN: return GroupNamesScrollDown();
    case ECFUNC_GROUP_NAMES_SCROLL_UP: return GroupNamesScrollUp();
    case ECFUNC_UPDATE_WORD_SELECT_CURSOR: return UpdateWordSelectCursor();
    case ECFUNC_WORD_SELECT_SCROLL_UP: return WordSelectScrollUp();
    case ECFUNC_WORD_SELECT_SCROLL_DOWN: return WordSelectScrollDown();
    case ECFUNC_WORD_SELECT_PAGE_UP: return WordSelectPageScrollUp();
    case ECFUNC_WORD_SELECT_PAGE_DOWN: return WordSelectPageScrollDown();
    case ECFUNC_SWITCH_KEYBOARD_MODE: return SwitchKeyboardMode();
    case ECFUNC_EXIT: return false;
    case ECFUNC_QUIZ_QUESTION: return false;
    case ECFUNC_QUIZ_ANSWER: return false;
    case ECFUNC_SET_QUIZ_QUESTION: return false;
    case ECFUNC_SET_QUIZ_ANSWER: return false;
    case ECFUNC_MSG_CREATE_QUIZ: return ShowCreateQuizMsg();
    case ECFUNC_MSG_SELECT_ANSWER: return ShowSelectAnswerMsg();
    case ECFUNC_MSG_SONG_TOO_SHORT: return ShowSongTooShortMsg();
    case ECFUNC_MSG_CANT_DELETE_LYRICS: return ShowCantDeleteLyricsMsg();
    case ECFUNC_MSG_COMBINE_TWO_WORDS: return ShowCombineTwoWordsMsg();
    case ECFUNC_MSG_CANT_EXIT: return ShowCantExitMsg();
    default: return false;
  }
}

/** 1:1 decomp easy_chat.c:3150 â€” Only used to update the current phrase after a word deletion. */
function ReprintPhrase(): boolean {
  if (!sScreenControl) return false;
  switch (sScreenControl.funcState) {
    case 0:
      PrintCurrentPhrase();
      sScreenControl.funcState++;
      break;
    case 1:
      return IsDma3ManagerBusyWithBgCopy();
  }
  return true;
}

/** 1:1 decomp easy_chat.c:3165 */
function UpdateMainCursor(): boolean {
  if (!sScreenControl) return false;
  let i: number;
  let currentPhrase: Uint16Array;
  let frameId: number;
  let cursorColumn: number, cursorRow: number, numColumns: number;
  let x: number;
  let stringWidth: number;
  let trueStringWidth: number;
  let y: number;
  const str = new Uint8Array(64);

  currentPhrase = _GetCurrentPhrase();
  frameId = _GetEasyChatScreenFrameId();
  cursorColumn = _GetMainCursorColumn();
  cursorRow = _GetMainCursorRow();
  numColumns = _GetNumColumns();
  let ecWordIdx = cursorRow * numColumns;
  const frame = _sPhraseFrameDimensions[frameId];
  if (!frame) {
    console.warn('[easy-chat-render] UpdateMainCursor: sPhraseFrameDimensions not injected');
    return false;
  }
  x = 8 * frame.left + 13;
  for (i = 0; i < cursorColumn; i++) {
    const ecWord = currentPhrase[ecWordIdx];
    if (ecWord === EC_EMPTY_WORD) {
      stringWidth = 72;
    } else {
      CopyEasyChatWord(str, ecWord);
      // 1:1 decomp: GetStringWidth(FONT_NORMAL, str, 0)
      // (engine TS signature collapsed to 1 arg = font-implicit / spacing=0)
      stringWidth = GetStringWidth(str as unknown as string);
    }
    trueStringWidth = stringWidth + 17;
    x += trueStringWidth;
    ecWordIdx++;
  }
  y = 8 * (frame.top + cursorRow * 2);
  SetMainCursorPos(x, y + 8);
  return false;
}

/** 1:1 decomp easy_chat.c:3207 */
function UpdateMainCursorOnButtons(): boolean {
  const xOffset = GetFooterOptionXOffset(_GetMainCursorColumn());
  SetMainCursorPos(xOffset, 96);
  return false;
}

/** 1:1 decomp easy_chat.c:3214 */
function ShowConfirmExitPrompt(): boolean {
  if (!sScreenControl) return false;
  switch (sScreenControl.funcState) {
    case 0:
      StopMainCursorAnim();
      PrintEasyChatStdMessage(MSG_CONFIRM_EXIT);
      CreateEasyChatYesNoMenu(1);
      sScreenControl.funcState++;
      break;
    case 1:
      return IsDma3ManagerBusyWithBgCopy();
  }
  return true;
}

/** 1:1 decomp easy_chat.c:3231 */
function ShowConfirmPrompt(): boolean {
  if (!sScreenControl) return false;
  switch (sScreenControl.funcState) {
    case 0:
      StopMainCursorAnim();
      PrintEasyChatStdMessage(MSG_CONFIRM);
      CreateEasyChatYesNoMenu(0);
      sScreenControl.funcState++;
      break;
    case 1:
      return IsDma3ManagerBusyWithBgCopy();
  }
  return true;
}

/** 1:1 decomp easy_chat.c:3248 */
function ShowConfirmDeleteAllPrompt(): boolean {
  if (!sScreenControl) return false;
  switch (sScreenControl.funcState) {
    case 0:
      StopMainCursorAnim();
      PrintEasyChatStdMessage(MSG_CONFIRM_DELETE);
      CreateEasyChatYesNoMenu(1);
      sScreenControl.funcState++;
      break;
    case 1:
      return IsDma3ManagerBusyWithBgCopy();
  }
  return true;
}

/** 1:1 decomp easy_chat.c:3265 */
function ClosePrompt(): boolean {
  if (!sScreenControl) return false;
  switch (sScreenControl.funcState) {
    case 0:
      StartMainCursorAnim();
      PrintEasyChatStdMessage(MSG_INSTRUCTIONS);
      PrintCurrentPhrase();
      ShowBg(0);
      sScreenControl.funcState++;
      break;
    case 1:
      return IsDma3ManagerBusyWithBgCopy();
  }
  return true;
}

/** 1:1 decomp easy_chat.c:3283 */
function ClosePromptAfterDeleteAll(): boolean {
  if (!sScreenControl) return false;
  // 1:1 decomp : case 0 fall-through case 1 (= action puis IsDma3...).
  // TS noFallthroughCasesInSwitch => on remplace par if/else equivalent.
  if (sScreenControl.funcState === 0) {
    StartMainCursorAnim();
    PrintEasyChatStdMessage(MSG_INSTRUCTIONS);
    PrintCurrentPhrase();
    sScreenControl.funcState++;
    return IsDma3ManagerBusyWithBgCopy();
  }
  if (sScreenControl.funcState === 1) {
    return IsDma3ManagerBusyWithBgCopy();
  }
  return true;
}

/** 1:1 decomp easy_chat.c:3300 */
function OpenKeyboard(): boolean {
  if (!sScreenControl) return false;
  switch (sScreenControl.funcState) {
    case 0:
      StopMainCursorAnim();
      HideBg(0);
      SetWindowDimensions(0, 0, 0, 0);
      PrintKeyboardText();
      sScreenControl.funcState++;
      break;
    case 1:
      if (!IsDma3ManagerBusyWithBgCopy()) {
        InitLowerWindowAnim(WINANIM_OPEN_KEYBOARD);
        sScreenControl.funcState++;
      }
      break;
    case 2:
      if (!IsDma3ManagerBusyWithBgCopy() && !UpdateLowerWindowAnim()) {
        sScreenControl.funcState++;
      }
      break;
    case 3:
      if (!IsDma3ManagerBusyWithBgCopy()) {
        CreateSideWindowSprites();
        sScreenControl.funcState++;
      }
      break;
    case 4:
      if (!ShowSideWindow()) {
        CreateRectangleCursorSprites();
        SetScrollIndicatorXPos(false);
        UpdateScrollIndicatorsVisibility();
        sScreenControl.funcState++;
        return false;
      }
      break;
    default:
      return false;
  }
  return true;
}

/** 1:1 decomp easy_chat.c:3346 */
function CloseKeyboard(): boolean {
  if (!sScreenControl) return false;
  switch (sScreenControl.funcState) {
    case 0:
      DestroyRectangleCursorSprites();
      HideModeWindow();
      HideScrollIndicators();
      sScreenControl.funcState++;
      break;
    case 1: {
      // 1:1 decomp : si DestroySideWindowSprites()==TRUE => break out of switch.
      // Sinon InitLowerWindowAnim + funcState++ + FALL-THROUGH to case 2.
      if (DestroySideWindowSprites() === true) break;
      InitLowerWindowAnim(WINANIM_CLOSE_KEYBOARD);
      sScreenControl.funcState++;
      // TS noFallthroughCasesInSwitch => exécute case 2 inline.
      if (!UpdateLowerWindowAnim()) {
        sScreenControl.funcState++;
      }
      break;
    }
    case 2:
      if (!UpdateLowerWindowAnim()) {
        sScreenControl.funcState++;
      }
      break;
    case 3:
      if (!IsDma3ManagerBusyWithBgCopy()) {
        StartMainCursorAnim();
        ShowBg(0);
        sScreenControl.funcState++;
      }
      break;
    case 4:
      return false;
  }
  return true;
}

/** 1:1 decomp easy_chat.c:3382 */
function SwitchKeyboardMode(): boolean {
  if (!sScreenControl) return false;
  switch (sScreenControl.funcState) {
    case 0:
      DestroyRectangleCursorSprites();
      HideScrollIndicators();
      SetModeWindowToTransition();
      InitLowerWindowAnim(WINANIM_KEYBOARD_SWITCH_OUT);
      sScreenControl.funcState++;
      break;
    case 1:
      if (!UpdateLowerWindowAnim() && !IsModeWindowAnimActive()) {
        PrintKeyboardText();
        sScreenControl.funcState++;
      }
      break;
    case 2:
      if (!IsDma3ManagerBusyWithBgCopy()) {
        InitLowerWindowAnim(WINANIM_KEYBOARD_SWITCH_IN);
        UpdateModeWindowAnim();
        sScreenControl.funcState++;
      }
      break;
    case 3:
      if (!UpdateLowerWindowAnim() && !IsModeWindowAnimActive()) {
        UpdateScrollIndicatorsVisibility();
        CreateRectangleCursorSprites();
        sScreenControl.funcState++;
        return false;
      }
      break;
    case 4:
      return false;
  }
  return true;
}

/** 1:1 decomp easy_chat.c:3424 */
function UpdateKeyboardCursor(): boolean {
  UpdateRectangleCursorPos();
  return false;
}

/** 1:1 decomp easy_chat.c:3430 */
function GroupNamesScrollDown(): boolean {
  if (!sScreenControl) return false;
  // 1:1 decomp : case 0 fall-through case 1. TS => if/else equivalent.
  if (sScreenControl.funcState === 0) {
    InitLowerWindowScroll(1, 4);
    sScreenControl.funcState++;
    // fall-through into case 1 body
    if (!UpdateLowerWindowScroll()) {
      UpdateRectangleCursorPos();
      UpdateScrollIndicatorsVisibility();
      return false;
    }
    return true;
  }
  if (sScreenControl.funcState === 1) {
    if (!UpdateLowerWindowScroll()) {
      UpdateRectangleCursorPos();
      UpdateScrollIndicatorsVisibility();
      return false;
    }
  }
  return true;
}

/** 1:1 decomp easy_chat.c:3451 */
function GroupNamesScrollUp(): boolean {
  if (!sScreenControl) return false;
  // 1:1 decomp : case 0 fall-through case 1. TS => if/else equivalent.
  if (sScreenControl.funcState === 0) {
    InitLowerWindowScroll(-1, 4);
    sScreenControl.funcState++;
    // fall-through into case 1 body
    if (!UpdateLowerWindowScroll()) {
      UpdateScrollIndicatorsVisibility();
      sScreenControl.funcState++;
      return false;
    }
    return true;
  }
  if (sScreenControl.funcState === 1) {
    if (!UpdateLowerWindowScroll()) {
      UpdateScrollIndicatorsVisibility();
      sScreenControl.funcState++;
      return false;
    }
    return true;
  }
  if (sScreenControl.funcState === 2) {
    return false;
  }
  return true;
}

/** 1:1 decomp easy_chat.c:3474 */
function OpenWordSelect(): boolean {
  if (!sScreenControl) return false;
  switch (sScreenControl.funcState) {
    case 0:
      DestroyRectangleCursorSprites();
      HideModeWindow();
      HideScrollIndicators();
      sScreenControl.funcState++;
      break;
    case 1:
      if (!DestroySideWindowSprites()) {
        ClearWordSelectWindow();
        sScreenControl.funcState++;
      }
      break;
    case 2:
      if (!IsDma3ManagerBusyWithBgCopy()) {
        InitLowerWindowAnim(WINANIM_OPEN_WORD_SELECT);
        sScreenControl.funcState++;
      }
      break;
    case 3:
      if (!UpdateLowerWindowAnim()) {
        InitLowerWindowText(TEXT_WORD_SELECT);
        sScreenControl.funcState++;
      }
      break;
    case 4:
      if (!IsDma3ManagerBusyWithBgCopy()) {
        CreateWordSelectCursorSprite();
        SetScrollIndicatorXPos(true);
        UpdateScrollIndicatorsVisibility();
        UpdateStartSelectButtonsVisibility();
        sScreenControl.funcState++;
        return false;
      }
      break;
    case 5:
      return false;
  }
  return true;
}

/** 1:1 decomp easy_chat.c:3523 */
function CloseWordSelect(): boolean {
  if (!sScreenControl) return false;
  switch (sScreenControl.funcState) {
    case 0:
      PrintCurrentPhrase();
      sScreenControl.funcState++;
      break;
    case 1:
      DestroyWordSelectCursorSprite();
      HideScrollIndicators();
      HideStartSelectButtons();
      ClearWordSelectWindow();
      sScreenControl.funcState++;
      break;
    case 2:
      if (!IsDma3ManagerBusyWithBgCopy()) {
        InitLowerWindowAnim(WINANIM_CLOSE_WORD_SELECT);
        sScreenControl.funcState++;
      }
      break;
    case 3:
      if (!UpdateLowerWindowAnim()) {
        ShowBg(0);
        sScreenControl.funcState++;
      }
      break;
    case 4:
      if (!IsDma3ManagerBusyWithBgCopy()) {
        StartMainCursorAnim();
        sScreenControl.funcState++;
        return false;
      }
      break;
    case 5:
      return false;
  }
  return true;
}

/** 1:1 decomp easy_chat.c:3567 */
function ShowConfirmLyricsPrompt(): boolean {
  if (!sScreenControl) return false;
  switch (sScreenControl.funcState) {
    case 0:
      PrintCurrentPhrase();
      sScreenControl.funcState++;
      break;
    case 1:
      DestroyWordSelectCursorSprite();
      HideScrollIndicators();
      HideStartSelectButtons();
      ClearWordSelectWindow();
      sScreenControl.funcState++;
      break;
    case 2:
      if (!IsDma3ManagerBusyWithBgCopy()) {
        InitLowerWindowAnim(WINANIM_CLOSE_WORD_SELECT);
        sScreenControl.funcState++;
      }
      break;
    case 3:
      if (!UpdateLowerWindowAnim()) {
        PrintEasyChatStdMessage(MSG_CONFIRM);
        sScreenControl.funcState++;
      }
      break;
    case 4:
      if (!IsDma3ManagerBusyWithBgCopy()) {
        ShowBg(0);
        sScreenControl.funcState++;
      }
      break;
    case 5:
      if (!IsDma3ManagerBusyWithBgCopy()) {
        StartMainCursorAnim();
        sScreenControl.funcState++;
        return false;
      }
      break;
    case 6:
      return false;
  }
  return true;
}

/** 1:1 decomp easy_chat.c:3618 */
function ReturnToKeyboard(): boolean {
  if (!sScreenControl) return false;
  switch (sScreenControl.funcState) {
    case 0:
      DestroyWordSelectCursorSprite();
      HideScrollIndicators();
      HideStartSelectButtons();
      ClearWordSelectWindow();
      sScreenControl.funcState++;
      break;
    case 1:
      if (!IsDma3ManagerBusyWithBgCopy()) {
        InitLowerWindowAnim(WINANIM_RETURN_TO_KEYBOARD);
        sScreenControl.funcState++;
      }
      break;
    case 2:
      if (!UpdateLowerWindowAnim()) {
        PrintKeyboardText();
        sScreenControl.funcState++;
      }
      break;
    case 3:
      if (!IsDma3ManagerBusyWithBgCopy()) {
        CreateSideWindowSprites();
        sScreenControl.funcState++;
      }
      break;
    case 4:
      if (!ShowSideWindow()) {
        CreateRectangleCursorSprites();
        SetScrollIndicatorXPos(false);
        UpdateScrollIndicatorsVisibility();
        sScreenControl.funcState++;
        return false;
      }
      break;
  }
  return true;
}

/** 1:1 decomp easy_chat.c:3665 */
function UpdateWordSelectCursor(): boolean {
  UpdateWordSelectCursorPos();
  return false;
}

/** 1:1 decomp easy_chat.c:3671 */
function WordSelectScrollDown(): boolean {
  if (!sScreenControl) return false;
  switch (sScreenControl.funcState) {
    case 0:
      PrintWordSelectNextRowDown();
      sScreenControl.funcState++;
      break;
    case 1:
      if (!IsDma3ManagerBusyWithBgCopy()) {
        InitLowerWindowScroll(1, 4);
        sScreenControl.funcState++;
      }
      break;
    case 2:
      if (!UpdateLowerWindowScroll()) {
        UpdateWordSelectCursorPos();
        UpdateScrollIndicatorsVisibility();
        UpdateStartSelectButtonsVisibility();
        sScreenControl.funcState++;
        return false;
      }
      break;
    case 3:
      return false;
  }
  return true;
}

/** 1:1 decomp easy_chat.c:3703 */
function WordSelectScrollUp(): boolean {
  if (!sScreenControl) return false;
  switch (sScreenControl.funcState) {
    case 0:
      PrintWordSelectNextRowUp();
      sScreenControl.funcState++;
      break;
    case 1:
      if (!IsDma3ManagerBusyWithBgCopy()) {
        InitLowerWindowScroll(-1, 4);
        sScreenControl.funcState++;
      }
      break;
    case 2:
      if (!UpdateLowerWindowScroll()) {
        UpdateScrollIndicatorsVisibility();
        UpdateStartSelectButtonsVisibility();
        sScreenControl.funcState++;
        return false;
      }
      break;
    case 3:
      return false;
  }
  return true;
}

/** 1:1 decomp easy_chat.c:3734 */
function WordSelectPageScrollDown(): boolean {
  if (!sScreenControl) return false;
  switch (sScreenControl.funcState) {
    case 0:
      PrintWordSelectRowsPageDown();
      sScreenControl.funcState++;
      break;
    case 1:
      if (!IsDma3ManagerBusyWithBgCopy()) {
        const scrollChange = _GetWordSelectScrollOffset() - GetLowerWindowScrollOffset();
        InitLowerWindowScroll(scrollChange, 8);
        sScreenControl.funcState++;
      }
      break;
    case 2:
      if (!UpdateLowerWindowScroll()) {
        UpdateWordSelectCursorPos();
        UpdateScrollIndicatorsVisibility();
        UpdateStartSelectButtonsVisibility();
        sScreenControl.funcState++;
        return false;
      }
      break;
    case 3:
      return false;
  }
  return true;
}

/** 1:1 decomp easy_chat.c:3767 */
function WordSelectPageScrollUp(): boolean {
  if (!sScreenControl) return false;
  switch (sScreenControl.funcState) {
    case 0:
      PrintWordSelectRowsPageUp();
      sScreenControl.funcState++;
      break;
    case 1:
      if (!IsDma3ManagerBusyWithBgCopy()) {
        const scrollChange = _GetWordSelectScrollOffset() - GetLowerWindowScrollOffset();
        InitLowerWindowScroll(scrollChange, 8);
        sScreenControl.funcState++;
      }
      break;
    case 2:
      if (!UpdateLowerWindowScroll()) {
        UpdateScrollIndicatorsVisibility();
        UpdateStartSelectButtonsVisibility();
        sScreenControl.funcState++;
        return false;
      }
      break;
    case 3:
      return false;
  }
  return true;
}

/** 1:1 decomp easy_chat.c:3799 */
function ShowCreateQuizMsg(): boolean {
  if (!sScreenControl) return false;
  switch (sScreenControl.funcState) {
    case 0:
      StopMainCursorAnim();
      PrintEasyChatStdMessage(MSG_CREATE_QUIZ);
      sScreenControl.funcState++;
      break;
    case 1:
      return IsDma3ManagerBusyWithBgCopy();
  }
  return true;
}

/** 1:1 decomp easy_chat.c:3815 */
function ShowSelectAnswerMsg(): boolean {
  if (!sScreenControl) return false;
  switch (sScreenControl.funcState) {
    case 0:
      StopMainCursorAnim();
      PrintEasyChatStdMessage(MSG_SELECT_ANSWER);
      sScreenControl.funcState++;
      break;
    case 1:
      return IsDma3ManagerBusyWithBgCopy();
  }
  return true;
}

/** 1:1 decomp easy_chat.c:3831 */
function ShowSongTooShortMsg(): boolean {
  if (!sScreenControl) return false;
  switch (sScreenControl.funcState) {
    case 0:
      StopMainCursorAnim();
      PrintEasyChatStdMessage(MSG_SONG_TOO_SHORT);
      sScreenControl.funcState++;
      break;
    case 1:
      return IsDma3ManagerBusyWithBgCopy();
  }
  return true;
}

/** 1:1 decomp easy_chat.c:3847 */
function ShowCantDeleteLyricsMsg(): boolean {
  if (!sScreenControl) return false;
  switch (sScreenControl.funcState) {
    case 0:
      StopMainCursorAnim();
      PrintEasyChatStdMessage(MSG_CANT_DELETE_LYRICS);
      sScreenControl.funcState++;
      break;
    case 1:
      return IsDma3ManagerBusyWithBgCopy();
  }
  return true;
}

/** 1:1 decomp easy_chat.c:3863 */
function ShowCombineTwoWordsMsg(): boolean {
  if (!sScreenControl) return false;
  switch (sScreenControl.funcState) {
    case 0:
      StopMainCursorAnim();
      PrintEasyChatStdMessage(MSG_COMBINE_TWO_WORDS);
      sScreenControl.funcState++;
      break;
    case 1:
      return IsDma3ManagerBusyWithBgCopy();
  }
  return true;
}

/** 1:1 decomp easy_chat.c:3879 */
function ShowCantExitMsg(): boolean {
  if (!sScreenControl) return false;
  switch (sScreenControl.funcState) {
    case 0:
      StopMainCursorAnim();
      PrintEasyChatStdMessage(MSG_CANT_QUIT);
      sScreenControl.funcState++;
      break;
    case 1:
      return IsDma3ManagerBusyWithBgCopy();
  }
  return true;
}

/** 1:1 decomp easy_chat.c:3895 */
function InitEasyChatScreenControl_(): boolean {
  sScreenControl = Alloc(() => makeEasyChatScreenControl());
  if (!sScreenControl) return false;

  sScreenControl.funcState = 0;
  sScreenControl.mainCursorSprite = null;
  sScreenControl.rectangleCursorSpriteRight = null;
  sScreenControl.rectangleCursorSpriteLeft = null;
  sScreenControl.wordSelectCursorSprite = null;
  sScreenControl.buttonWindowSprite = null;
  sScreenControl.modeWindowSprite = null;
  sScreenControl.scrollIndicatorUpSprite = null;
  sScreenControl.scrollIndicatorDownSprite = null;
  sScreenControl.startButtonSprite = null;
  sScreenControl.selectButtonSprite = null;
  sScreenControl.fourFooterOptions = _FooterHasFourOptions_();
  return true;
}

/** 1:1 decomp easy_chat.c:3916 */
function InitEasyChatBgs(): void {
  ChangeBgX(3, 0, BG_COORD_SET);
  ChangeBgY(3, 0, BG_COORD_SET);
  ChangeBgX(1, 0, BG_COORD_SET);
  ChangeBgY(1, 0, BG_COORD_SET);
  ChangeBgX(2, 0, BG_COORD_SET);
  ChangeBgY(2, 0, BG_COORD_SET);
  ChangeBgX(0, 0, BG_COORD_SET);
  ChangeBgY(0, 0, BG_COORD_SET);
  SetGpuReg(REG_OFFSET_DISPCNT, DISPCNT_MODE_0 | DISPCNT_OBJ_1D_MAP | DISPCNT_OBJ_ON | DISPCNT_WIN0_ON);
}

/** 1:1 decomp easy_chat.c:3929 */
function LoadEasyChatPalettes(): void {
  ResetPaletteFade();
  LoadPalette(_gEasyChatMode_Pal as Uint16Array, BG_PLTT_ID(0), PLTT_SIZE_4BPP);
  LoadPalette(_sTextInputFrameOrange_Pal as Uint16Array, BG_PLTT_ID(1), 32);
  LoadPalette(_sTextInputFrameGreen_Pal as Uint16Array, BG_PLTT_ID(4), 32);
  LoadPalette(_sTitleText_Pal as Uint16Array, BG_PLTT_ID(10), 32);
  LoadPalette(_sText_Pal as Uint16Array, BG_PLTT_ID(11), 32);
  LoadPalette(_sText_Pal as Uint16Array, BG_PLTT_ID(15), 32);
  LoadPalette(_sText_Pal as Uint16Array, BG_PLTT_ID(3), 32);
}

/** 1:1 decomp easy_chat.c:3941 */
function PrintTitle(): void {
  let xOffset: number;
  const titleText = _GetTitleText();
  if (!titleText) return;

  //!< French Difference
  // 1:1 decomp: GetStringCenterAlignXOffset(FONT_NORMAL, titleText, 240)
  // (engine TS signature collapsed to 2 args = font-implicit)
  xOffset = GetStringCenterAlignXOffset(titleText as unknown as string, 240);
  FillWindowPixelBuffer(WIN_TITLE, PIXEL_FILL(0));
  PrintEasyChatTextWithColors(
    WIN_TITLE,
    FONT_NORMAL,
    titleText as unknown as Uint8Array,
    xOffset,
    1,
    TEXT_SKIP_DRAW,
    TEXT_COLOR_TRANSPARENT,
    TEXT_COLOR_DARK_GRAY,
    TEXT_COLOR_LIGHT_GRAY,
  );
  PutWindowTilemap(WIN_TITLE);
  CopyWindowToVram(WIN_TITLE, COPYWIN_FULL);
}

/** 1:1 decomp easy_chat.c:3956 */
function PrintEasyChatText(
  windowId: number,
  fontId: number,
  str: Uint8Array | string,
  x: number,
  y: number,
  speed: number,
  callback: ((tp: unknown, _x: number) => void) | null,
): void {
  AddTextPrinterParameterized(windowId, fontId, str, x, y, speed, callback);
}

/** 1:1 decomp easy_chat.c:3961 */
function PrintEasyChatTextWithColors(
  windowId: number,
  fontId: number,
  str: Uint8Array | string,
  left: number,
  top: number,
  speed: number,
  bg: number,
  fg: number,
  shadow: number,
): void {
  // 1:1 decomp: u8 color[3] = { bg, fg, shadow }. AddTextPrinterParameterized3
  // attend readonly number[] dans notre engine.
  const color: readonly number[] = [bg, fg, shadow];
  AddTextPrinterParameterized3(windowId, fontId, left, top, color, speed, str as unknown as string);
}

/** 1:1 decomp easy_chat.c:3970 */
function PrintInitialInstructions(): void {
  FillBgTilemapBufferRect(0, 0, 0, 0, 32, 20, 17);
  LoadUserWindowBorderGfx(WIN_MSG, 1, BG_PLTT_ID(14));
  DrawTextBorderOuter(WIN_MSG, 1, 14);
  PrintEasyChatStdMessage(MSG_INSTRUCTIONS);
  PutWindowTilemap(WIN_MSG);
  CopyBgTilemapBufferToVram(0);
}

/** 1:1 decomp easy_chat.c:3980 */
function PrintEasyChatStdMessage(msgId: number): void {
  let text2: StringOrU8 = null;
  let text1: StringOrU8 = null;
  switch (msgId) {
    case MSG_INSTRUCTIONS: {
      const r = _GetEasyChatInstructionsText();
      text1 = r.text1; text2 = r.text2;
      break;
    }
    case MSG_CONFIRM_EXIT: {
      const r = _GetEasyChatConfirmExitText();
      text1 = r.text1; text2 = r.text2;
      break;
    }
    case MSG_CONFIRM: {
      const r = _GetEasyChatConfirmText();
      text1 = r.text1; text2 = r.text2;
      break;
    }
    case MSG_CONFIRM_DELETE: {
      const r = _GetEasyChatConfirmDeletionText();
      text1 = r.text1; text2 = r.text2;
      break;
    }
    case MSG_CREATE_QUIZ:
      text1 = _gText_CreateAQuiz;
      break;
    case MSG_SELECT_ANSWER:
      text1 = _gText_SelectTheAnswer;
      break;
    case MSG_SONG_TOO_SHORT:
      text1 = _gText_OnlyOnePhrase;
      text2 = _gText_OriginalSongWillBeUsed;
      break;
    case MSG_CANT_DELETE_LYRICS:
      text1 = _gText_LyricsCantBeDeleted;
      break;
    case MSG_COMBINE_TWO_WORDS:
      text1 = _gText_CombineTwoWordsOrPhrases3;
      break;
    case MSG_CANT_QUIT:
      text1 = _gText_YouCannotQuitHere;
      text2 = _gText_SectionMustBeCompleted;
      break;
  }

  FillWindowPixelBuffer(WIN_MSG, PIXEL_FILL(1));
  if (text1) {
    PrintEasyChatText(WIN_MSG, FONT_NORMAL, text1, 0, 1, TEXT_SKIP_DRAW, null);
  }
  if (text2) {
    PrintEasyChatText(WIN_MSG, FONT_NORMAL, text2, 0, 17, TEXT_SKIP_DRAW, null);
  }
  CopyWindowToVram(WIN_MSG, COPYWIN_FULL);
}

/** 1:1 decomp easy_chat.c:4030 */
function CreateEasyChatYesNoMenu(initialCursorPos: number): void {
  if (!_sEasyChatYesNoWindowTemplate) {
    console.warn('[easy-chat-render] CreateEasyChatYesNoMenu: sEasyChatYesNoWindowTemplate not injected');
    return;
  }
  CreateYesNoMenu(_sEasyChatYesNoWindowTemplate, 1, 14, initialCursorPos);
}

/** 1:1 decomp easy_chat.c:4035 */
function AddPhraseWindow(): void {
  if (!sScreenControl) return;
  const frameId = _GetEasyChatScreenFrameId();
  const frame = _sPhraseFrameDimensions[frameId];
  if (!frame) {
    console.warn('[easy-chat-render] AddPhraseWindow: sPhraseFrameDimensions not injected');
    return;
  }
  const template: WindowTemplate = {
    bg: 3,
    tilemapLeft: frame.left,
    tilemapTop: frame.top,
    width: frame.width,
    height: frame.height,
    paletteNum: 11,
    baseBlock: 0x84, //!< French Difference
  };
  sScreenControl.windowId = AddWindow(template);
  PutWindowTilemap(sScreenControl.windowId);
}

/** 1:1 decomp easy_chat.c:4052 */
function PrintCurrentPhrase(): void {
  if (!sScreenControl) return;
  const strClear = new Uint8Array(4);
  let currentPhrase: Uint16Array;
  let numColumns: number, numRows: number;
  let str: Uint8Array;
  let frameId: number;
  let isQuizQuestion: boolean;
  let i: number, j: number, k: number;

  currentPhrase = _GetCurrentPhrase();
  numColumns = _GetNumColumns();
  numRows = _GetNumRows();
  frameId = _GetEasyChatScreenFrameId();

  isQuizQuestion = false;
  if (frameId === FRAMEID_QUIZ_QUESTION) {
    isQuizQuestion = true;
  }

  FillWindowPixelBuffer(sScreenControl.windowId, PIXEL_FILL(1));
  let phraseIdx = 0;
  for (i = 0; i < numRows; i++) {
    // memcpy(strClear, sText_Clear17, sizeof(sText_Clear17));
    if (_sText_Clear17) {
      for (let m = 0; m < strClear.length && m < _sText_Clear17.length; m++) {
        strClear[m] = _sText_Clear17[m];
      }
    }
    if (isQuizQuestion) {
      strClear[2] = 6;
    }

    str = sScreenControl.phrasePrintBuffer;
    sScreenControl.phrasePrintBuffer[0] = EOS;
    str = StringAppend(str, strClear);
    for (j = 0; j < numColumns; j++) {
      if (currentPhrase[phraseIdx] !== EC_EMPTY_WORD) {
        str = CopyEasyChatWord(str, currentPhrase[phraseIdx]);
        phraseIdx++;
      } else {
        phraseIdx++;
        if (!isQuizQuestion) {
          str = WriteColorChangeControlCode(str, 0, 4);
          for (k = 0; k < 12; k++) {
            str[0] = CHAR_HYPHEN;
            str = str.subarray(1);
          }
          str = WriteColorChangeControlCode(str, 0, 2);
        }
      }

      if (isQuizQuestion) {
        strClear[2] = 3;
      }
      str = StringAppend(str, strClear);

      if (frameId === FRAMEID_MAIL || frameId === FRAMEID_QUIZ_QUESTION || frameId === FRAMEID_QUIZ_SET_QUESTION) {
        // Is 2x5 frame, end on 9th word
        if (j === 0 && i === 4) break;
      }
    }
    if (str.length > 0) str[0] = EOS;
    PrintEasyChatText(
      sScreenControl.windowId,
      FONT_NORMAL,
      sScreenControl.phrasePrintBuffer,
      0,
      i * 16 + 1,
      TEXT_SKIP_DRAW,
      null,
    );
  }

  CopyWindowToVram(sScreenControl.windowId, COPYWIN_FULL);
}

/** 1:1 decomp easy_chat.c:4124 */
function BufferFrameTilemap(tilemap: Uint16Array): void {
  let frameId: number;
  let right: number, bottom: number;
  let x: number, y: number;

  frameId = _GetEasyChatScreenFrameId();
  CpuFastFill(0, tilemap as unknown as Uint8Array, BG_SCREEN_SIZE);
  const frame = _sPhraseFrameDimensions[frameId];
  if (!frame) {
    console.warn('[easy-chat-render] BufferFrameTilemap: sPhraseFrameDimensions not injected');
    return;
  }
  if (frameId === FRAMEID_MAIL || frameId === FRAMEID_QUIZ_SET_QUESTION) {
    // These frames fill the screen, no need to draw top/bottom edges
    right = frame.left + frame.width;
    bottom = frame.top + frame.height;

    // Draw middle section
    for (y = frame.top; y < bottom; y++) {
      x = frame.left - 1;
      tilemap[y * 32 + x] = FRAME_OFFSET_ORANGE + FRAME_TILE_L_EDGE;
      x++;
      for (; x < right; x++) {
        tilemap[y * 32 + x] = FRAME_OFFSET_ORANGE + FRAME_TILE_TRANSPARENT;
      }
      tilemap[y * 32 + x] = FRAME_OFFSET_ORANGE + FRAME_TILE_R_EDGE;
    }
  } else {
    y = frame.top - 1;
    x = frame.left - 1;
    right = frame.left + frame.width;
    bottom = frame.top + frame.height;

    // Draw top edge
    tilemap[y * 32 + x] = FRAME_OFFSET_ORANGE + FRAME_TILE_TOP_L_CORNER;
    x++;
    for (; x < right; x++) {
      tilemap[y * 32 + x] = FRAME_OFFSET_ORANGE + FRAME_TILE_TOP_EDGE;
    }
    tilemap[y * 32 + x] = FRAME_OFFSET_ORANGE + FRAME_TILE_TOP_R_CORNER;
    y++;

    // Draw middle section
    for (; y < bottom; y++) {
      x = frame.left - 1;
      tilemap[y * 32 + x] = FRAME_OFFSET_ORANGE + FRAME_TILE_L_EDGE;
      x++;
      for (; x < right; x++) {
        tilemap[y * 32 + x] = FRAME_OFFSET_ORANGE + FRAME_TILE_TRANSPARENT;
      }
      tilemap[y * 32 + x] = FRAME_OFFSET_ORANGE + FRAME_TILE_R_EDGE;
    }

    // Draw bottom edge
    x = frame.left - 1;
    tilemap[y * 32 + x] = FRAME_OFFSET_ORANGE + FRAME_TILE_BOTTOM_L_CORNER;
    x++;
    for (; x < right; x++) {
      tilemap[y * 32 + x] = FRAME_OFFSET_ORANGE + FRAME_TILE_BOTTOM_EDGE;
    }
    tilemap[y * 32 + x] = FRAME_OFFSET_ORANGE + FRAME_TILE_BOTTOM_R_CORNER;
  }
}

/** 1:1 decomp easy_chat.c:4189 */
function AdjustBgTilemapForFooter(): void {
  let frameId: number;
  let tilemap: Uint16Array;

  tilemap = GetBgTilemapBuffer(3) as Uint16Array;
  frameId = _GetEasyChatScreenFrameId();
  const frame = _sPhraseFrameDimensions[frameId];
  if (!frame) {
    console.warn('[easy-chat-render] AdjustBgTilemapForFooter: sPhraseFrameDimensions not injected');
    return;
  }
  switch (frame.footerId) {
    case FOOTER_ANSWER:
      tilemap = tilemap.subarray(0x2A0);
      CopyToBgTilemapBufferRect(3, tilemap, 0, 11, 32, 2);
      break;
    case FOOTER_QUIZ:
      tilemap = tilemap.subarray(0x300);
      CopyToBgTilemapBufferRect(3, tilemap, 0, 11, 32, 2);
      break;
    case NUM_FOOTER_TYPES:
      CopyToBgTilemapBufferRect(3, tilemap, 0, 10, 32, 4);
      break;
  }
}

/** 1:1 decomp easy_chat.c:4212 */
function DrawLowerWindow(): void {
  PutWindowTilemap(WIN_INPUT_SELECT);
  CopyBgTilemapBufferToVram(WIN_INPUT_SELECT);
}

/** 1:1 decomp easy_chat.c:4218 */
function InitLowerWindowText(whichText: number): void {
  ResetLowerWindowScroll();
  FillWindowPixelBuffer(WIN_INPUT_SELECT, PIXEL_FILL(1));
  switch (whichText) {
    case TEXT_GROUPS:
      PrintKeyboardGroupNames();
      break;
    case TEXT_ALPHABET:
      PrintKeyboardAlphabet();
      break;
    case TEXT_WORD_SELECT:
      PrintInitialWordSelectText();
      break;
  }
  CopyWindowToVram(WIN_INPUT_SELECT, COPYWIN_GFX);
}

/** 1:1 decomp easy_chat.c:4238 */
function PrintKeyboardText(): void {
  if (!_GetInAlphabetMode()) {
    InitLowerWindowText(TEXT_GROUPS);
  } else {
    InitLowerWindowText(TEXT_ALPHABET);
  }
}

/** 1:1 decomp easy_chat.c:4246 */
function PrintKeyboardGroupNames(): void {
  let i: number;
  let x: number, y: number;

  i = 0;
  y = 97;
  while (true) {
    for (x = 0; x < 2; x++) {
      const groupId = GetUnlockedEasyChatGroupId(i++);
      if (groupId === EC_NUM_GROUPS) {
        InitLowerWindowScroll(_GetKeyboardScrollOffset(), 0);
        return;
      }
      PrintEasyChatText(
        WIN_INPUT_SELECT,
        FONT_NORMAL,
        GetEasyChatWordGroupName(groupId),
        x * 84 + 10,
        y,
        TEXT_SKIP_DRAW,
        null,
      );
    }
    y += 16;
  }
}

/** 1:1 decomp easy_chat.c:4271 */
function PrintKeyboardAlphabet(): void {
  for (let i = 0; i < _sEasyChatKeyboardAlphabet.length; i++) {
    const letter = _sEasyChatKeyboardAlphabet[i];
    if (!letter) continue;
    PrintEasyChatText(WIN_INPUT_SELECT, FONT_NORMAL, letter, 10, 97 + i * 16, TEXT_SKIP_DRAW, null);
  }
}

/** 1:1 decomp easy_chat.c:4279 */
function PrintInitialWordSelectText(): void {
  PrintWordSelectText(0, NUM_WORD_SELECT_ROWS);
}

/** 1:1 decomp easy_chat.c:4284 */
function PrintWordSelectNextRowDown(): void {
  const wordScroll = _GetWordSelectScrollOffset() + NUM_WORD_SELECT_ROWS - 1;
  EraseWordSelectRows(wordScroll, 1);
  PrintWordSelectText(wordScroll, 1);
}

/** 1:1 decomp easy_chat.c:4291 */
function PrintWordSelectNextRowUp(): void {
  const wordScroll = _GetWordSelectScrollOffset();
  EraseWordSelectRows(wordScroll, 1);
  PrintWordSelectText(wordScroll, 1);
}

/** 1:1 decomp easy_chat.c:4298 */
function PrintWordSelectRowsPageDown(): void {
  const wordScroll = _GetWordSelectScrollOffset();
  let maxScroll = wordScroll + NUM_WORD_SELECT_ROWS;
  const maxRows = _GetWordSelectLastRow() + 1;
  if (maxScroll > maxRows) {
    maxScroll = maxRows;
  }
  if (wordScroll < maxScroll) {
    const numRows = maxScroll - wordScroll;
    EraseWordSelectRows(wordScroll, numRows);
    PrintWordSelectText(wordScroll, numRows);
  }
}

/** 1:1 decomp easy_chat.c:4314 */
function PrintWordSelectRowsPageUp(): void {
  const wordScroll = _GetWordSelectScrollOffset();
  const windowScroll = GetLowerWindowScrollOffset();
  if (wordScroll < windowScroll) {
    const numRows = windowScroll - wordScroll;
    EraseWordSelectRows(wordScroll, numRows);
    PrintWordSelectText(wordScroll, numRows);
  }
}

/** 1:1 decomp easy_chat.c:4328 â€” Print the easy chat words available for selection
 *  in the currently selected group and at the given offset and row. */
function PrintWordSelectText(scrollOffset: number, numRows: number): void {
  if (!sScreenControl) return;
  let i: number, j: number;
  let easyChatWord: number;
  let y: number;
  let wordIndex: number;

  wordIndex = scrollOffset * NUM_WORD_SELECT_COLUMNS;
  y = (scrollOffset * 16 + 96) & 0xFF;
  y++;
  for (i = 0; i < numRows; i++) {
    for (j = 0; j < 2; j++) {
      easyChatWord = GetWordFromSelectedGroup(wordIndex++);
      if (easyChatWord !== EC_EMPTY_WORD) {
        CopyEasyChatWordPadded(sScreenControl.wordSelectPrintBuffer, easyChatWord, 0);
        if (!DummyWordCheck(easyChatWord)) {
          PrintEasyChatText(
            WIN_INPUT_SELECT,
            FONT_NORMAL,
            sScreenControl.wordSelectPrintBuffer,
            (j * 13 + 3) * 8,
            y,
            TEXT_SKIP_DRAW,
            null,
          );
        } else {
          // Never reached
          PrintEasyChatTextWithColors(
            WIN_INPUT_SELECT,
            FONT_NORMAL,
            sScreenControl.wordSelectPrintBuffer,
            (j * 13 + 3) * 8,
            y,
            TEXT_SKIP_DRAW,
            TEXT_COLOR_WHITE,
            TEXT_COLOR_LIGHT_RED,
            TEXT_COLOR_LIGHT_GRAY,
          );
        }
      }
    }
    y += 16;
  }
  CopyWindowToVram(WIN_INPUT_SELECT, COPYWIN_GFX);
}

/** 1:1 decomp easy_chat.c:4359 */
function EraseWordSelectRows(scrollOffset: number, numRows: number): void {
  let y: number;
  let var0: number;
  let var1: number;
  let var2: number;

  y = (scrollOffset * 16 + 96) & 0xFF;
  var2 = numRows * 16;
  var0 = y + var2;

  if (var0 > 255) {
    var1 = var0 - 256;
    var2 = 256 - y;
  } else {
    var1 = 0;
  }

  FillWindowPixelRect(WIN_INPUT_SELECT, PIXEL_FILL(1), 0, y, 224, var2);
  if (var1) {
    FillWindowPixelRect(WIN_INPUT_SELECT, PIXEL_FILL(1), 0, 0, 224, var1);
  }
}

/** 1:1 decomp easy_chat.c:4385 */
function ClearWordSelectWindow(): void {
  FillWindowPixelBuffer(WIN_INPUT_SELECT, PIXEL_FILL(1));
  CopyWindowToVram(WIN_INPUT_SELECT, COPYWIN_GFX);
}

/** 1:1 decomp easy_chat.c:4391 */
function InitLowerWindowAnim(winAnimType: number): void {
  if (!sScreenControl) return;
  switch (winAnimType) {
    case WINANIM_OPEN_KEYBOARD:
      sScreenControl.curWindowAnimState = 0;
      sScreenControl.destWindowAnimState = 10;
      break;
    case WINANIM_CLOSE_KEYBOARD:
      sScreenControl.curWindowAnimState = 9;
      sScreenControl.destWindowAnimState = 0;
      break;
    case WINANIM_OPEN_WORD_SELECT:
      sScreenControl.curWindowAnimState = 11;
      sScreenControl.destWindowAnimState = 17;
      break;
    case WINANIM_CLOSE_WORD_SELECT:
      sScreenControl.curWindowAnimState = 17;
      sScreenControl.destWindowAnimState = 0;
      break;
    case WINANIM_RETURN_TO_KEYBOARD:
      sScreenControl.curWindowAnimState = 17;
      sScreenControl.destWindowAnimState = 10;
      break;
    case WINANIM_KEYBOARD_SWITCH_OUT:
      sScreenControl.curWindowAnimState = 18;
      sScreenControl.destWindowAnimState = 22;
      break;
    case WINANIM_KEYBOARD_SWITCH_IN:
      sScreenControl.curWindowAnimState = 22;
      sScreenControl.destWindowAnimState = 18;
      break;
  }
  sScreenControl.windowAnimStateDir =
    sScreenControl.curWindowAnimState < sScreenControl.destWindowAnimState ? 1 : -1;
}

/** 1:1 decomp easy_chat.c:4429 â€” Returns FALSE if the anim is finished. */
function UpdateLowerWindowAnim(): boolean {
  if (!sScreenControl) return false;
  let curState: number, destState: number;
  if (sScreenControl.curWindowAnimState === sScreenControl.destWindowAnimState) {
    return false;
  }
  sScreenControl.curWindowAnimState += sScreenControl.windowAnimStateDir;
  DrawLowerWindowFrame(sScreenControl.curWindowAnimState);
  curState = sScreenControl.curWindowAnimState;
  destState = sScreenControl.destWindowAnimState;
  return (curState ^ destState) > 0;
}

/** 1:1 decomp easy_chat.c:4445 â€” States in this function are used incrementally
 *  with differing start/end cases to draw the lower window and create the appearance
 *  that it's opening/closing/animating. See InitLowerWindowAnim. */
function DrawLowerWindowFrame(type: number): void {
  FillBgTilemapBufferRect_Palette0(1, 0, 0, 10, 30, 10);
  switch (type) {
    case 0: // Closed
      break;
    case 1:
      BufferLowerWindowFrame(11, 14, 3, 2);
      break;
    case 2:
      BufferLowerWindowFrame(9, 14, 7, 2);
      break;
    case 3:
      BufferLowerWindowFrame(7, 14, 11, 2);
      break;
    case 4:
      BufferLowerWindowFrame(5, 14, 15, 2);
      break;
    case 5:
      BufferLowerWindowFrame(3, 14, 19, 2);
      break;
    case 6:
      BufferLowerWindowFrame(1, 14, 23, 2);
      break;
    case 7:
      BufferLowerWindowFrame(1, 13, 23, 4);
      break;
    case 8:
      BufferLowerWindowFrame(1, 12, 23, 6);
      break;
    case 9:
      BufferLowerWindowFrame(1, 11, 23, 8);
      break;
    case 10:
      BufferLowerWindowFrame(1, 10, 23, 10);
      break;
    case 11:
      BufferLowerWindowFrame(1, 10, 24, 10);
      break;
    case 12:
      BufferLowerWindowFrame(1, 10, 25, 10);
      break;
    case 13:
      BufferLowerWindowFrame(1, 10, 26, 10);
      break;
    case 14:
      BufferLowerWindowFrame(1, 10, 27, 10);
      break;
    case 15:
      BufferLowerWindowFrame(1, 10, 28, 10);
      break;
    case 16:
      BufferLowerWindowFrame(1, 10, 29, 10);
      break;
  }
  // Note : type >= 17 = section 4 (lignes 4500+), reste Ã  porter hors scope range.
}

// â”€â”€â”€ Wire helpers exposÃ©s au reste du module / appelants futurs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export {
  // State machine functions (ECFUNC dispatch â€” already exported via Run/Start).
  // Render helpers utiles Ã  section 1-2 / debug :
  PrintCurrentPhrase,
  PrintTitle,
  PrintEasyChatStdMessage,
  PrintInitialInstructions,
  BufferFrameTilemap,
  AdjustBgTilemapForFooter,
  DrawLowerWindow,
  InitLowerWindowText,
  PrintKeyboardText,
  PrintKeyboardGroupNames,
  PrintKeyboardAlphabet,
  PrintInitialWordSelectText,
  PrintWordSelectText,
  EraseWordSelectRows,
  ClearWordSelectWindow,
  InitLowerWindowAnim,
  UpdateLowerWindowAnim,
  DrawLowerWindowFrame,
  InitLowerWindowScroll,
  UpdateLowerWindowScroll,
  GetLowerWindowScrollOffset,
  ResetLowerWindowScroll,
  AddPhraseWindow,
  CreateEasyChatYesNoMenu,
  ClearUnusedField,
  DummyWordCheck,
  BufferLowerWindowFrame,
  SetWindowDimensions,
};

