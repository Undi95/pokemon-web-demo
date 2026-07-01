// easy_chat.ts — port 1:1 STRICT de src/easy_chat.c (fichier unique, miroir décomp).
//
// UN seul fichier = 1:1 avec easy_chat.c : accès DIRECT aux statiques module
// sEasyChatScreen (état input) / sScreenControl (rendu) / sWordData (word-select).
// Plus AUCUNE injection (l'ancien split engine/ui/easy-chat-render.ts + ~60 setters
// _setG*/_setGetX a été dissous ici, 2026-07).
//
// Contenu (ordre décomp) : constantes/structs (include/easy_chat.h) → data statique →
//   word-text lookup (GetEasyChatWord/CopyEasyChatWord/IsEasyChatWordInvalid) →
//   word-data (sWordData) → rendu/sprites (sections 3-4) → converters (mail read) +
//   lifecycle (DoEasyChatScreen/CB2/Task) + input state machine (sections 0-2).
//
// API externe : CopyEasyChatWord/ConvertEasyChatWordsToString (mail.ts, versions u8
//   1:1 décomp) · GetRandomEasyChatWordFromGroup (dewford_trend.ts) · DoEasyChatScreen
//   + easyChatGfxReady (party_menu.ts). Données bundlées = src/data/easy-chat-data.ts.
//
// Adaptations web assumées (hardware-exempt) : GFX/palettes chargés async (fetch au lieu
//   d'INCGFX) via easyChatGfxReady ; converters écrivent des octets charmap encodés
//   (StringCopy encode les strings JS en indices police GBA).
//
// Source de vérité (ne JAMAIS diverger) : D:/Projet 1/decomps/pokeemeraude/src/easy_chat.c
//   + include/easy_chat.h + include/constants/easy_chat.h
//
// RESTE (2026-07) : Phase B = pipeline GFX 1:1 (sSpriteSheets/Palettes/CompressedSheets :
//   rectangle=compressed sheet, PALTAG_MISC_UI, scroll/start-select/mode manquants) ;
//   Phase C = porter les stubs section-4 (side/mode window, scroll indicators,
//   start/select buttons, AddMainScreenButtonWindow, clavier alphabet {CLEAR N}) ;
//   Phase D = ShowEasyChatScreen (special) + wire Dewford/Gabby&Ty.

import { BG_SCREEN_SIZE } from '../include/gba/defines';
import {CpuFastFill, WIN_RANGE} from "../harness/runtime/decomp-bridge";
import { LoadPalette, ResetPaletteFade, LoadCompressedSpriteSheet, LoadBgTiles } from '../harness/runtime/decomp-globals';
import { DestroySprite } from './sprite';
import { CreateSprite } from './sprite';
import { LoadSpriteSheets, StartSpriteAnim, ANIMCMD_FRAME, ANIMCMD_END } from './sprite';
import { SetGpuReg } from './gpu_regs';

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
  GetBgTilemapBuffer,
  type WindowTemplate,
  type BgTemplate,
} from './window';

import { DeactivateAllTextPrinters, GetStringCenterAlignXOffset, GetStringWidth, TEXT_SKIP_DRAW } from './text';
import { AddTextPrinterParameterized3 } from './menu';

// 1:1 STRICT décomp text.c:251-269 AddTextPrinterParameterized — vraie impl
// dans gba-text-system.ts (wrapper sur P3 avec colors par défaut du font).
import { AddTextPrinterParameterized } from './text';
import { encodeStringForFont, getOwCharmap } from './text';

import {
  LoadUserWindowBorderGfx,
  DrawTextBorderOuter,
} from './text_window';

import { CreateYesNoMenu } from './menu';

import {
  getRuntime,
  SpriteCallbackDummy,
  LoadSpritePalettes,
} from '../harness/runtime/decomp-globals';

// DecompSprite interface vit dans decomp-runtime.ts (= source de vÃ©ritÃ© Sprite).
import type { DecompSprite } from '../harness/runtime/decomp-runtime';
import {
  DISPCNT_OBJ_1D_MAP, DISPCNT_OBJ_ON, DISPCNT_WIN0_ON,
} from '../include/gba/io_reg';

import {
  CreateObjectGraphicsSprite,
} from './engine/field/object-event-graphics';

import {
  TEXT_COLOR_TRANSPARENT,
  TEXT_COLOR_DARK_GRAY,
  TEXT_COLOR_LIGHT_GRAY,
  TEXT_COLOR_WHITE,
  TEXT_COLOR_LIGHT_RED,
  FONT_NORMAL,
  PIXEL_FILL,
} from './engine/battle/battle-windows';

import {
  CHAR_HYPHEN,
  CHAR_SPACE,
  CHAR_NEWLINE,
  CHAR_PROMPT_SCROLL,
  EOS,
} from '../include/constants/characters';

import {
  BG_PLTT_ID,
  REG_OFFSET_DISPCNT,
  REG_OFFSET_WIN0H,
  REG_OFFSET_WIN0V,
  REG_OFFSET_WININ,
  REG_OFFSET_WINOUT,
  DISPCNT_MODE_0,
} from '../harness/runtime/decomp-runtime';

import {PLTT_SIZE_4BPP} from "../harness/runtime/decomp-bridge";

import {
  OAM,
  OAM_SIZE,
} from '../harness/runtime/decomp-globals';

// ─── Données bundlées (easy-chat-data.ts, auto-gén décomp) ────────────────────
import {
  gEasyChatGroups, gEasyChatWordsByLetterPointers, sRestrictedWordSpecies,
  sEasyChatGroupNamePointers, sEasyChatScreenTemplates, sMysteryGiftPhrase,
  sBerryMasterWifePhrases, sAlphabetGroupIdMap, easyChatPromptTexts,
  sEasyChatBgTemplates, sEasyChatWindowTemplates, sEasyChatYesNoWindowTemplate,
  sPhraseFrameDimensions, sAlphabetKeyboardColumnOffsets, sFooterOptionXOffsets,
  sFooterTextOptions, sText_Clear17,
} from './data/easy-chat-data';
import { gSpeciesNames, gMoveNames } from './engine/data/game-data';

// ─── Bridges (flags/pokedex/random/vars/tasks/palette) ────────────────────────
import { Random } from './random';
import { FlagGet, FlagSet, IsNationalPokedexEnabled } from './event_data';
import { GetNationalPokedexCount, GetSetPokedexFlag, SpeciesToNationalPokedexNum } from './engine/ui/pokedex-flags';
import { TrySetTrendyPhrase } from './dewford_trend';
import {
  ResetTasks, JOY_NEW, JOY_REPEAT, BlendPalettes, FreeAllSpritePalettes,
  AnimateSprites, BuildOamBuffer, PlaySE, RunTasks, TransferPlttBuffer, gSaveBlock1Ptr, gSaveBlock2Ptr,
} from '../harness/runtime/decomp-globals';
import { ResetSpriteData, LoadOam, ProcessSpriteCopyRequests } from './sprite';
import { UpdatePaletteFade, BeginNormalPaletteFade } from './palette';
import { CreateTask } from './task';
import { Menu_ProcessInputNoWrapClearOnChoose } from './menu';
import { FreeAllWindowBuffers } from './window';
import { SetVBlankCallback } from '../harness/runtime/decomp-bridge';
import { gSpecialVar, VarSet, VarGet } from './engine/script/script-vars';
import { CB2_ReturnToFieldContinueScript_Manual } from './overworld';
import { gStringVar3 } from './string_util';
import { loadGbaPal, loadTilemapBin, loadIndexedPngStrict } from '../harness/gba/png-loader';
import type { DecompTask, CB2Callback } from '../harness/runtime/decomp-runtime';

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
import { MAX_SPRITES } from '../include/sprite';

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

// FLAG_ constants 1:1 decomp include/constants/flags.h. SYSTEM_FLAGS = 0x860 :
// FLAG_SYS_GAME_CLEAR = SYSTEM_FLAGS + 0x4 ; FLAG_UNLOCKED_TRENDY_SAYINGS = +0x6.
// Résolus via FlagGet(id) au runtime.
const FLAG_SYS_GAME_CLEAR        = 0x864;
const FLAG_UNLOCKED_TRENDY_SAYINGS = 0x866;

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

type StringOrU8 = Uint8Array | string | null;
type MainCallback = CB2Callback | (() => void);

// ─── État écran/words en attente + gate GFX async (adaptation web) ────────────
// SetWordTaskArg/GetWordTaskArg (easy_chat.c:1282) empilent des pointeurs 32-bit
// dans des slots u16 → un seul écran actif : words + exitCallback en module-vars.
let sPendingWords: Uint16Array | null = null;
let sPendingExitCallback: MainCallback | null = null;
let _easyChatGfxLoaded = false;
let _easyChatGfxLoading: Promise<void> | null = null;

// ─── Assets chargés async (INCGFX/INCBIN décomp → fetch public/decomp/em) ─────
let sText_Pal: Uint16Array | null = null;
let sTitleText_Pal: Uint16Array | null = null;
let sTextInputFrameOrange_Pal: Uint16Array | null = null;
let sTextInputFrameGreen_Pal: Uint16Array | null = null;
let gEasyChatMode_Pal: Uint16Array | null = null;
let gEasyChatWindow_Gfx: Uint8Array | null = null;
let gEasyChatWindow_Tilemap: Uint16Array = new Uint16Array(0);
let sTextInputFrame_Gfx: Uint8Array | null = null;
let sSpriteSheets: Array<{ data: unknown; size: number; tag: number }> = [];
let sSpritePalettes: Array<{ data: unknown; tag: number }> = [];
let sCompressedSpriteSheets: Array<{ data: unknown; size: number; tag: number }> = [];

// ─── Constantes GBA (masques input) + SE + états — 1:1 décomp ─────────────────
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

// EASY_CHAT_TYPE_* (constants/easy_chat.h) — QUIZ_QUESTION déjà défini plus haut.
const EASY_CHAT_TYPE_PROFILE = 0;
const EASY_CHAT_TYPE_MAIL = 4;
const EASY_CHAT_TYPE_BARD_SONG = 6;
const EASY_CHAT_TYPE_TRENDY_PHRASE = 9;
const EASY_CHAT_TYPE_CONTEST_INTERVIEW = 11;
const EASY_CHAT_TYPE_GOOD_SAYING = 13;
const EASY_CHAT_TYPE_QUIZ_ANSWER = 15;
const EASY_CHAT_TYPE_QUIZ_SET_QUESTION = 17;
const EASY_CHAT_TYPE_QUIZ_SET_ANSWER = 18;
const EASY_CHAT_TYPE_APPRENTICE = 19;
const EASY_CHAT_TYPE_QUESTIONNAIRE = 20;
const EASY_CHAT_PERSON_DISPLAY_NONE = 3;

const EC_MAX_WORDS_CURRENT_PHRASE = 10; // ARRAY_COUNT(sEasyChatScreen->currentPhrase)
const FLAG_SYS_CHAT_USED = 0x861; // 1:1 flags.h (SYSTEM_FLAGS + 0x1)

// tData index (easy_chat.c:1287).
const tState = 0;      // data[0]
const tType = 1;       // data[1]
const tPersonType = 7; // data[7]

// gText_* prompts exit/deletion (data FR résolue).
const gText_StopGivingPkmnMail = easyChatPromptTexts.gText_StopGivingPkmnMail;
const gText_LikeToQuitQuiz = easyChatPromptTexts.gText_LikeToQuitQuiz;
const gText_ChallengeQuestionMark = easyChatPromptTexts.gText_ChallengeQuestionMark;
const gText_QuitEditing = easyChatPromptTexts.gText_QuitEditing;
const gText_AllTextBeingEditedWill = easyChatPromptTexts.gText_AllTextBeingEditedWill;
const gText_BeDeletedThatOkay = easyChatPromptTexts.gText_BeDeletedThatOkay;

// gText_* messages quiz/bard/apprentice — hors scope mail/dewford (Lilycove/Bard).
// TODO Phase C : extraire les vraies chaînes FR ; null = message non affiché (parité).
const gText_CreateAQuiz: StringOrU8 = null;
const gText_SelectTheAnswer: StringOrU8 = null;
const gText_OnlyOnePhrase: StringOrU8 = null;
const gText_OriginalSongWillBeUsed: StringOrU8 = null;
const gText_LyricsCantBeDeleted: StringOrU8 = null;
const gText_CombineTwoWordsOrPhrases3: StringOrU8 = null;
const gText_YouCannotQuitHere: StringOrU8 = null;
const gText_SectionMustBeCompleted: StringOrU8 = null;
const gText_ThreeQuestionMarks = '???';

// Clavier alphabet A-Z — 1:1 décomp sEasyChatKeyboardAlphabet (text_input_strings.c) :
//   gText_EasyChatKeyboard_ABCDEFothers / _GHIJKL / _MNOPQRS / _TUVWXYZ.
// Chaque ligne = {CLEAR N} (= [0xFC, 0x11, N], espacement pixel) + lettres encodées.
// Construites lazy (charmap chargé) via encodeStringForFont. `autres` = "others" FR.
const EXT_CTRL_CODE_BEGIN_B = 0xFC;
const EXT_CTRL_CODE_CLEAR_B = 0x11;
function _buildKeyboardRow(tokens: Array<number | string>): Uint8Array {
  const out: number[] = [];
  const cm = getOwCharmap() ?? {};
  for (const t of tokens) {
    if (typeof t === 'number') { out.push(EXT_CTRL_CODE_BEGIN_B, EXT_CTRL_CODE_CLEAR_B, t); }
    else { const b = encodeStringForFont(t, cm); for (let i = 0; i < b.length && b[i] !== EOS; i++) out.push(b[i]); }
  }
  out.push(EOS);
  return Uint8Array.from(out);
}
let _sEasyChatKeyboardAlphabet: Uint8Array[] | null = null;
function getEasyChatKeyboardAlphabet(): Uint8Array[] {
  if (_sEasyChatKeyboardAlphabet) return _sEasyChatKeyboardAlphabet;
  _sEasyChatKeyboardAlphabet = [
    _buildKeyboardRow([11, 'A', 6, 'B', 6, 'C', 26, 'D', 6, 'E', 6, 'F', 26, 'autres']),
    _buildKeyboardRow([11, 'G', 6, 'H', 6, 'I', 26, 'J', 6, 'K', 6, 'L']),
    _buildKeyboardRow([11, 'M', 6, 'N', 6, 'O', 26, 'P', 6, 'Q', 6, 'R', 6, 'S', 26, ' ']),
    _buildKeyboardRow([11, 'T', 6, 'U', 6, 'V', 26, 'W', 6, 'X', 6, 'Y', 6, 'Z', 26, ' ']),
  ];
  return _sEasyChatKeyboardAlphabet;
}

// ─── Getters 1:1 décomp (accès direct sEasyChatScreen) easy_chat.c:2682-2853 ──
function GetEasyChatScreenType(): number { return sEasyChatScreen!.type; }
function GetEasyChatScreenFrameId(): number { return sEasyChatScreenTemplates[sEasyChatScreen!.templateId].frameId; }
function GetTitleText(): StringOrU8 { return sEasyChatScreen!.titleText; }
function GetCurrentPhrase(): Uint16Array { return sEasyChatScreen!.currentPhrase; }
function GetNumRows(): number { return sEasyChatScreen!.numRows; }
function GetNumColumns(): number { return sEasyChatScreen!.numColumns; }
function GetMainCursorColumn(): number { return sEasyChatScreen!.mainCursorColumn; }
function GetMainCursorRow(): number { return sEasyChatScreen!.mainCursorRow; }
function GetEasyChatInstructionsText(): { text1: StringOrU8; text2: StringOrU8 } {
  const t = sEasyChatScreenTemplates[sEasyChatScreen!.templateId];
  return { text1: t.instructionsText1, text2: t.instructionsText2 };
}
function GetEasyChatConfirmText(): { text1: StringOrU8; text2: StringOrU8 } {
  const t = sEasyChatScreenTemplates[sEasyChatScreen!.templateId];
  return { text1: t.confirmText1, text2: t.confirmText2 };
}
function GetEasyChatConfirmExitText(): { text1: StringOrU8; text2: StringOrU8 } {
  switch (sEasyChatScreen!.type) {
    case EASY_CHAT_TYPE_MAIL: return { text1: gText_StopGivingPkmnMail, text2: null };
    case EASY_CHAT_TYPE_QUIZ_ANSWER:
    case EASY_CHAT_TYPE_QUIZ_QUESTION: return { text1: gText_LikeToQuitQuiz, text2: gText_ChallengeQuestionMark };
    default: return { text1: gText_QuitEditing, text2: null };
  }
}
function GetEasyChatConfirmDeletionText(): { text1: StringOrU8; text2: StringOrU8 } {
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
function GetDisplayedPersonType(): number { return sEasyChatScreen!.displayedPersonType; }
function FooterHasFourOptions_(): number { return FooterHasFourOptions(); }

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


// â”€â”€â”€ String helpers locaux (1:1 decomp string_util.c minimal) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function StringCopy(dest: Uint8Array, src: Uint8Array | string): Uint8Array {
  // 1:1 decomp StringCopy : copie jusqu'Ã  EOS, retourne ptr sur EOS.
  // 🩸 src string = texte lisible JS → ENCODER en octets charmap GBA (comme le
  // décomp où GetEasyChatWord renvoie du `const u8 *` déjà encodé). Sans ça, les
  // buffers word-select/phrase contiendraient de l'ASCII brut (charCodeAt) rendu
  // comme indices de police GBA = texte brouillé.
  const bytes = typeof src === 'string' ? encodeStringForFont(src, getOwCharmap() ?? {}) : src;
  let i = 0;
  for (i = 0; i < bytes.length && i < dest.length - 1; i++) {
    const b = bytes[i];
    if (b === EOS) break;
    dest[i] = b;
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
import { WriteColorChangeControlCode } from '../include/string_util';

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

function SetBgTilemapBuffer(bg: number, _buf: Uint16Array): void {
  // 1:1 décomp `SetBgTilemapBuffer(bg, buffer)` = associe un buffer tilemap externe au BG.
  // Notre moteur : le tilemap du BG est un buffer readonly PERSISTANT (rt.gba.bg(bg).tilemap)
  // → on pointe le buffer easy_chat (sScreenControl.bgXTilemapBuffer) VERS celui du moteur, pour
  //   que BufferFrameTilemap y écrive et que CopyBgTilemapBufferToVram le remonte en VRAM.
  if (!sScreenControl) return;
  if (bg === 3) sScreenControl.bg3TilemapBuffer = GetBgTilemapBuffer(3);
  else if (bg === 1) sScreenControl.bg1TilemapBuffer = GetBgTilemapBuffer(1);
}
function DecompressAndLoadBgGfxUsingHeap(bg: number, src: unknown, _size: number, offset: number, _mode: number): void {
  // 1:1 décomp : LZ-décompresse `src` puis charge dans le char base du BG. Nos assets .lz =
  // PNG déjà décompressés (Uint8Array) → LoadBgTiles direct (offset en tiles).
  const data = src as Uint8Array | null;
  if (!data) return;
  LoadBgTiles(bg, data, data.length, offset);
}
function IsDma3ManagerBusyWithBgCopy(): boolean {
  // 1:1 decomp : dans notre engine la copie est synchrone => jamais busy.
  return false;
}
function CopyToBgTilemapBufferRect(bg: number, src: Uint16Array | unknown, destX: number, destY: number, width: number, height: number): void {
  // 1:1 décomp `CopyToBgTilemapBufferRect(bg, src, destX, destY, width, height)` : copie un rect
  // width×height depuis src (linéaire) dans la tilemap du BG à (destX,destY).
  const tilemap = GetBgTilemapBuffer(bg);
  const s = src as Uint16Array;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const di = (destY + y) * 32 + (destX + x);
      const si = y * width + x;
      if (di >= 0 && di < tilemap.length && si < s.length) tilemap[di] = s[si];
    }
  }
}

// Section 4 sprite helpers (lignes 4624+) â€” STUB pour les call-sites lignes 3000-4500.
// ─── Curseur triangle (principal + word-select) — 1:1 easy_chat.c:4634-4828 ──
// data[0]=sDelayTimer, data[1]=sAnimateCursor (EXPR macros décomp). Le bob = x2 −6..0.
const sOamData_TriangleCursor = {
  y: 0, affineMode: 0, objMode: 0, mosaic: false, bpp: 0,
  shape: 0 /* 8x8 square */, x: 0, matrixNum: 0, size: 0 /* 8x8 */,
  tileNum: 0, priority: 3, paletteNum: 0, affineParam: 0,
};
// 1:1 sSpriteTemplate_TriangleCursor (tileTag/paletteTag inversés dans le décomp
// mais GFXTAG==PALTAG_TRIANGLE_CURSOR==0 → inoffensif).
const sSpriteTemplate_TriangleCursor = {
  tileTag: 0, paletteTag: 0, oam: sOamData_TriangleCursor,
  anims: [], images: null, affineAnims: [], callback: SpriteCB_Cursor,
};
let _wordSelectCursorSpriteId = -1;

/** 1:1 CreateMainCursorSprite (easy_chat.c:4637). */
function CreateMainCursorSprite(): void {
  if (!sScreenControl) return;
  const frameId = GetEasyChatScreenFrameId();
  const x = sPhraseFrameDimensions[frameId].left * 8 + 13;
  const y = sPhraseFrameDimensions[frameId].top * 8 + 8;
  const spriteId = CreateSprite(sSpriteTemplate_TriangleCursor, x, y, 2);
  const rt = getRuntime();
  sScreenControl.mainCursorSprite = rt.gSprites[spriteId] as unknown as DecompSprite;
  if (sScreenControl.mainCursorSprite) sScreenControl.mainCursorSprite.data[1] = 1; // sAnimateCursor = TRUE
}

/** 1:1 SpriteCB_Cursor (easy_chat.c:4647) — bob horizontal x2 −6..0. */
function SpriteCB_Cursor(sprite: DecompSprite): void {
  if (sprite.data[1]) {
    sprite.data[0] += 1;
    if (sprite.data[0] > 2) {
      sprite.data[0] = 0;
      sprite.x2 += 1;
      if (sprite.x2 > 0) sprite.x2 = -6;
    }
  }
}

/** 1:1 SetMainCursorPos (easy_chat.c:4660). */
function SetMainCursorPos(x: number, y: number): void {
  const s = sScreenControl?.mainCursorSprite;
  if (!s) return;
  s.x = x; s.y = y; s.x2 = 0; s.data[0] = 0;
}

/** 1:1 StartMainCursorAnim (easy_chat.c:4675). */
function StartMainCursorAnim(): void {
  if (sScreenControl?.mainCursorSprite) sScreenControl.mainCursorSprite.data[1] = 1;
}

/** 1:1 StopMainCursorAnim (easy_chat.c:4668). */
function StopMainCursorAnim(): void {
  const s = sScreenControl?.mainCursorSprite;
  if (!s) return;
  s.data[0] = 0; s.data[1] = 0; s.x2 = 0;
}

// ─── Curseur rectangle (clavier) — 1:1 easy_chat.c:4680-4785 ─────────────────
const sOamData_RectangleCursor = {
  y: 0, affineMode: 0, objMode: 0, mosaic: false, bpp: 0,
  shape: 1 /* 64x32 H_RECTANGLE */, x: 0, matrixNum: 0, size: 3 /* 64x32 */,
  tileNum: 0, priority: 1, paletteNum: 0, affineParam: 0,
};
const sAnims_RectangleCursor = [
  [ANIMCMD_FRAME(0, 0), ANIMCMD_END],   // ON_GROUP
  [ANIMCMD_FRAME(32, 0), ANIMCMD_END],  // ON_BUTTON
  [ANIMCMD_FRAME(64, 0), ANIMCMD_END],  // ON_OTHERS
  [ANIMCMD_FRAME(96, 0), ANIMCMD_END],  // ON_LETTER
];
const sSpriteTemplate_RectangleCursor = {
  tileTag: 1, paletteTag: 1, oam: sOamData_RectangleCursor,
  anims: sAnims_RectangleCursor, images: null, affineAnims: [], callback: SpriteCB_Cursor,
};
let _rectCursorRightId = -1;
let _rectCursorLeftId = -1;

/** 1:1 CreateRectangleCursorSprites (easy_chat.c:4680) — 2 moitiés (droite hFlip). */
function CreateRectangleCursorSprites(): void {
  if (!sScreenControl) return;
  const rt = getRuntime();
  let spriteId = CreateSprite(sSpriteTemplate_RectangleCursor, 0, 0, 3);
  _rectCursorRightId = spriteId;
  const right = rt.gSprites[spriteId] as unknown as DecompSprite;
  sScreenControl.rectangleCursorSpriteRight = right;
  if (right) right.x2 = 32;

  spriteId = CreateSprite(sSpriteTemplate_RectangleCursor, 0, 0, 3);
  _rectCursorLeftId = spriteId;
  const left = rt.gSprites[spriteId] as unknown as DecompSprite;
  sScreenControl.rectangleCursorSpriteLeft = left;
  if (left) left.x2 = -32;

  if (right) right.hFlip = true;
  UpdateRectangleCursorPos();
}

/** 1:1 DestroyRectangleCursorSprites (easy_chat.c:4694). */
function DestroyRectangleCursorSprites(): void {
  if (_rectCursorRightId >= 0) { DestroySprite(_rectCursorRightId); _rectCursorRightId = -1; }
  if (_rectCursorLeftId >= 0) { DestroySprite(_rectCursorLeftId); _rectCursorLeftId = -1; }
  if (sScreenControl) {
    sScreenControl.rectangleCursorSpriteRight = null;
    sScreenControl.rectangleCursorSpriteLeft = null;
  }
}

/** 1:1 UpdateRectangleCursorPos (easy_chat.c:4702). */
function UpdateRectangleCursorPos(): void {
  if (sScreenControl?.rectangleCursorSpriteRight && sScreenControl?.rectangleCursorSpriteLeft) {
    const { column, row } = GetKeyboardCursorColAndRow();
    if (!GetInAlphabetMode()) SetRectangleCursorPos_GroupMode(column, row);
    else SetRectangleCursorPos_AlphabetMode(column, row);
  }
}

/** 1:1 SetRectangleCursorPos_GroupMode (easy_chat.c:4718). */
function SetRectangleCursorPos_GroupMode(column: number, row: number): void {
  const right = sScreenControl?.rectangleCursorSpriteRight;
  const left = sScreenControl?.rectangleCursorSpriteLeft;
  if (!right || !left) return;
  if (column !== -1) {
    StartSpriteAnim(right as never, RECTCURSOR_ANIM_ON_GROUP); right.x = column * 84 + 58; right.y = row * 16 + 96;
    StartSpriteAnim(left as never, RECTCURSOR_ANIM_ON_GROUP); left.x = column * 84 + 58; left.y = row * 16 + 96;
  } else {
    StartSpriteAnim(right as never, RECTCURSOR_ANIM_ON_BUTTON); right.x = 216; right.y = row * 16 + 112;
    StartSpriteAnim(left as never, RECTCURSOR_ANIM_ON_BUTTON); left.x = 216; left.y = row * 16 + 112;
  }
}

/** 1:1 SetRectangleCursorPos_AlphabetMode (easy_chat.c:4744). */
function SetRectangleCursorPos_AlphabetMode(column: number, row: number): void {
  const right = sScreenControl?.rectangleCursorSpriteRight;
  const left = sScreenControl?.rectangleCursorSpriteLeft;
  if (!right || !left) return;
  if (column !== -1) {
    const y = row * 16 + 96;
    let x = 32;
    let anim: number;
    if (column === NUM_ALPHABET_COLUMNS - 1 && row === 0) {
      x = 158; anim = RECTCURSOR_ANIM_ON_OTHERS;
    } else {
      x += sAlphabetKeyboardColumnOffsets[(column & 0xFF) < NUM_ALPHABET_COLUMNS ? column : 0];
      anim = RECTCURSOR_ANIM_ON_LETTER;
    }
    StartSpriteAnim(right as never, anim); right.x = x; right.y = y;
    StartSpriteAnim(left as never, anim); left.x = x; left.y = y;
  } else {
    StartSpriteAnim(right as never, RECTCURSOR_ANIM_ON_BUTTON); right.x = 216; right.y = row * 16 + 112;
    StartSpriteAnim(left as never, RECTCURSOR_ANIM_ON_BUTTON); left.x = 216; left.y = row * 16 + 112;
  }
}

/** 1:1 CreateWordSelectCursorSprite (easy_chat.c:4789) — même sprite que le principal. */
function CreateWordSelectCursorSprite(): void {
  if (!sScreenControl) return;
  const spriteId = CreateSprite(sSpriteTemplate_TriangleCursor, 0, 0, 4);
  const rt = getRuntime();
  _wordSelectCursorSpriteId = spriteId;
  const ws = rt.gSprites[spriteId] as unknown as DecompSprite;
  sScreenControl.wordSelectCursorSprite = ws;
  if (ws) {
    ws.callback = SpriteCB_WordSelectCursor as never;
    // 1:1 `sprite->oam.priority = 2` (OBJ devant le word-select bg2) → gba.oam[oamIndex].
    const oamEntry = (rt.gba as unknown as { oam?: Array<{ priority: number }> }).oam?.[ws.oamIndex];
    if (oamEntry) oamEntry.priority = 2;
  }
  UpdateWordSelectCursorPos();
}

/** 1:1 SpriteCB_WordSelectCursor (easy_chat.c:4798) — bob (sans le gate sAnimateCursor). */
function SpriteCB_WordSelectCursor(sprite: DecompSprite): void {
  sprite.data[0] += 1;
  if (sprite.data[0] > 2) {
    sprite.data[0] = 0;
    sprite.x2 += 1;
    if (sprite.x2 > 0) sprite.x2 = -6;
  }
}

/** 1:1 UpdateWordSelectCursorPos (easy_chat.c:4808). */
function UpdateWordSelectCursorPos(): void {
  const { column, row } = GetWordSelectColAndRow();
  let x = column * 13;
  x = x * 8 + 28;
  const y = row * 16 + 96;
  SetWordSelectCursorPos(x, y);
}

/** 1:1 SetWordSelectCursorPos (easy_chat.c:4819). */
function SetWordSelectCursorPos(x: number, y: number): void {
  const s = sScreenControl?.wordSelectCursorSprite;
  if (s) { s.x = x; s.y = y; s.x2 = 0; s.data[0] = 0; }
}

/** 1:1 DestroyWordSelectCursorSprite (easy_chat.c:4830). */
function DestroyWordSelectCursorSprite(): void {
  if (sScreenControl?.wordSelectCursorSprite && _wordSelectCursorSpriteId >= 0) {
    DestroySprite(_wordSelectCursorSpriteId);
    _wordSelectCursorSpriteId = -1;
    sScreenControl.wordSelectCursorSprite = null;
  }
}
// ─── Sprites section 4 (1:1 décomp easy_chat.c:1032-1198 data + 4839-5106 fns) ─
const sOamData_ModeWindow = {
  y: 0, affineMode: 0, objMode: 0, mosaic: false, bpp: 0,
  shape: 1 /* 64x32 */, x: 0, matrixNum: 0, size: 3, tileNum: 0, priority: 1, paletteNum: 0, affineParam: 0,
};
const sAnims_ModeWindow = [
  [ANIMCMD_FRAME(96, 0), ANIMCMD_END],                       // HIDDEN
  [ANIMCMD_FRAME(64, 4), ANIMCMD_FRAME(32, 4), ANIMCMD_END], // TO_GROUP (transition + 'Groupe')
  [ANIMCMD_FRAME(64, 4), ANIMCMD_FRAME(0, 4), ANIMCMD_END],  // TO_ALPHABET (transition + 'A-Z')
  [ANIMCMD_FRAME(64, 4), ANIMCMD_FRAME(96, 0), ANIMCMD_END], // TO_HIDDEN
  [ANIMCMD_FRAME(64, 4), ANIMCMD_END],                       // TRANSITION
];
const sSpriteTemplate_ModeWindow = {
  tileTag: GFXTAG_MODE_WINDOW, paletteTag: PALTAG_MISC_UI, oam: sOamData_ModeWindow,
  anims: sAnims_ModeWindow, images: null, affineAnims: [], callback: SpriteCallbackDummy,
};
const sOamData_ButtonWindow = {
  y: 0, affineMode: 0, objMode: 0, mosaic: false, bpp: 0,
  shape: 0 /* 64x64 */, x: 0, matrixNum: 0, size: 3, tileNum: 0, priority: 3, paletteNum: 0, affineParam: 0,
};
const sSpriteTemplate_ButtonWindow = {
  tileTag: GFXTAG_BUTTON_WINDOW, paletteTag: PALTAG_MISC_UI, oam: sOamData_ButtonWindow,
  anims: [], images: null, affineAnims: [], callback: SpriteCallbackDummy,
};
const sOamData_StartSelectButton = {
  y: 0, affineMode: 0, objMode: 0, mosaic: false, bpp: 0,
  shape: 1 /* 32x8 */, x: 0, matrixNum: 0, size: 1, tileNum: 0, priority: 1, paletteNum: 0, affineParam: 0,
};
const sOamData_ScrollIndicator = {
  y: 0, affineMode: 0, objMode: 0, mosaic: false, bpp: 0,
  shape: 0 /* 16x16 */, x: 0, matrixNum: 0, size: 1, tileNum: 0, priority: 1, paletteNum: 0, affineParam: 0,
};
const sAnims_TwoFrame = [
  [ANIMCMD_FRAME(0, 0), ANIMCMD_END],
  [ANIMCMD_FRAME(4, 0), ANIMCMD_END],
];
const sSpriteTemplate_StartSelectButton = {
  tileTag: GFXTAG_START_SELECT_BUTTONS, paletteTag: PALTAG_MISC_UI, oam: sOamData_StartSelectButton,
  anims: sAnims_TwoFrame, images: null, affineAnims: [], callback: SpriteCallbackDummy,
};
const sSpriteTemplate_ScrollIndicator = {
  tileTag: GFXTAG_SCROLL_INDICATOR, paletteTag: PALTAG_MISC_UI, oam: sOamData_ScrollIndicator,
  anims: sAnims_TwoFrame, images: null, affineAnims: [], callback: SpriteCallbackDummy,
};
let _buttonWindowSpriteId = -1;
let _modeWindowSpriteId = -1;

/** 1:1 CreateSideWindowSprites (easy_chat.c:4839). */
function CreateSideWindowSprites(): void {
  if (!sScreenControl) return;
  const rt = getRuntime();
  let spriteId = CreateSprite(sSpriteTemplate_ButtonWindow, 208, 128, 6);
  _buttonWindowSpriteId = spriteId;
  const bw = rt.gSprites[spriteId] as unknown as DecompSprite;
  sScreenControl.buttonWindowSprite = bw;
  if (bw) bw.x2 = -64;

  spriteId = CreateSprite(sSpriteTemplate_ModeWindow, 208, 80, 5);
  _modeWindowSpriteId = spriteId;
  sScreenControl.modeWindowSprite = rt.gSprites[spriteId] as unknown as DecompSprite;
  sScreenControl.modeWindowState = 0;
}

/** 1:1 ShowSideWindow (easy_chat.c:4850) — slide button window + anim mode window. */
function ShowSideWindow(): boolean {
  if (!sScreenControl) return false;
  const bw = sScreenControl.buttonWindowSprite;
  const mw = sScreenControl.modeWindowSprite;
  switch (sScreenControl.modeWindowState) {
    default:
      return false;
    case 0:
      if (bw) {
        bw.x2 += 8;
        if (bw.x2 >= 0) {
          bw.x2 = 0;
          if (!GetInAlphabetMode()) StartSpriteAnim(mw as never, MODEWINDOW_ANIM_TO_GROUP);
          else StartSpriteAnim(mw as never, MODEWINDOW_ANIM_TO_ALPHABET);
          sScreenControl.modeWindowState++;
        }
      }
      break;
    case 1:
      if (mw && mw.animEnded) {
        sScreenControl.modeWindowState = 2;
        return false;
      }
  }
  return true;
}

/** 1:1 HideModeWindow (easy_chat.c:4883). */
function HideModeWindow(): void {
  if (!sScreenControl) return;
  sScreenControl.modeWindowState = 0;
  StartSpriteAnim(sScreenControl.modeWindowSprite as never, MODEWINDOW_ANIM_TO_HIDDEN);
}

/** 1:1 DestroySideWindowSprites (easy_chat.c:4889). */
function DestroySideWindowSprites(): boolean {
  if (!sScreenControl) return false;
  const bw = sScreenControl.buttonWindowSprite;
  const mw = sScreenControl.modeWindowSprite;
  switch (sScreenControl.modeWindowState) {
    default:
      return false;
    case 0:
      if (mw && mw.animEnded) sScreenControl.modeWindowState = 1;
      break;
    case 1:
      if (bw) {
        bw.x2 -= 8;
        if (bw.x2 <= -64) {
          if (_modeWindowSpriteId >= 0) { DestroySprite(_modeWindowSpriteId); _modeWindowSpriteId = -1; }
          if (_buttonWindowSpriteId >= 0) { DestroySprite(_buttonWindowSpriteId); _buttonWindowSpriteId = -1; }
          sScreenControl.modeWindowSprite = null;
          sScreenControl.buttonWindowSprite = null;
          sScreenControl.modeWindowState++;
          return false;
        }
      }
  }
  return true;
}

/** 1:1 SetModeWindowToTransition (easy_chat.c:4915). */
function SetModeWindowToTransition(): void {
  if (!sScreenControl) return;
  StartSpriteAnim(sScreenControl.modeWindowSprite as never, MODEWINDOW_ANIM_TRANSITION);
}

/** 1:1 UpdateModeWindowAnim (easy_chat.c:4920). */
function UpdateModeWindowAnim(): void {
  if (!sScreenControl) return;
  if (!GetInAlphabetMode()) StartSpriteAnim(sScreenControl.modeWindowSprite as never, MODEWINDOW_ANIM_TO_GROUP);
  else StartSpriteAnim(sScreenControl.modeWindowSprite as never, MODEWINDOW_ANIM_TO_ALPHABET);
}

/** 1:1 IsModeWindowAnimActive (easy_chat.c:4928). */
function IsModeWindowAnimActive(): boolean {
  return !(sScreenControl?.modeWindowSprite?.animEnded);
}

/** 1:1 CreateScrollIndicatorSprites (easy_chat.c:4933). */
function CreateScrollIndicatorSprites(): void {
  if (!sScreenControl) return;
  const rt = getRuntime();
  let spriteId = CreateSprite(sSpriteTemplate_ScrollIndicator, 96, 80, 0);
  if (spriteId !== MAX_SPRITES) sScreenControl.scrollIndicatorUpSprite = rt.gSprites[spriteId] as unknown as DecompSprite;
  spriteId = CreateSprite(sSpriteTemplate_ScrollIndicator, 96, 156, 0);
  if (spriteId !== MAX_SPRITES) {
    const down = rt.gSprites[spriteId] as unknown as DecompSprite;
    sScreenControl.scrollIndicatorDownSprite = down;
    if (down) down.vFlip = true;
  }
  HideScrollIndicators();
}

/** 1:1 UpdateScrollIndicatorsVisibility (easy_chat.c:4949). */
function UpdateScrollIndicatorsVisibility(): void {
  if (!sScreenControl) return;
  if (sScreenControl.scrollIndicatorUpSprite) sScreenControl.scrollIndicatorUpSprite.invisible = !CanScrollUp();
  if (sScreenControl.scrollIndicatorDownSprite) sScreenControl.scrollIndicatorDownSprite.invisible = !CanScrollDown();
}

/** 1:1 HideScrollIndicators (easy_chat.c:4955). */
function HideScrollIndicators(): void {
  if (!sScreenControl) return;
  if (sScreenControl.scrollIndicatorUpSprite) sScreenControl.scrollIndicatorUpSprite.invisible = true;
  if (sScreenControl.scrollIndicatorDownSprite) sScreenControl.scrollIndicatorDownSprite.invisible = true;
}

/** 1:1 SetScrollIndicatorXPos (easy_chat.c:4961). */
function SetScrollIndicatorXPos(inWordSelect: boolean): void {
  if (!sScreenControl) return;
  const up = sScreenControl.scrollIndicatorUpSprite;
  const down = sScreenControl.scrollIndicatorDownSprite;
  if (!inWordSelect) {
    if (up) up.x = 96;
    if (down) down.x = 96;
  } else {
    if (up) up.x = 120;
    if (down) down.x = 120;
  }
}

/** 1:1 CreateStartSelectButtonSprites (easy_chat.c:4978) — Start/Select = indicateurs page. */
function CreateStartSelectButtonSprites(): void {
  if (!sScreenControl) return;
  const rt = getRuntime();
  let spriteId = CreateSprite(sSpriteTemplate_StartSelectButton, 220, 84, 1);
  if (spriteId !== MAX_SPRITES) sScreenControl.startButtonSprite = rt.gSprites[spriteId] as unknown as DecompSprite;
  spriteId = CreateSprite(sSpriteTemplate_StartSelectButton, 220, 156, 1);
  if (spriteId !== MAX_SPRITES) {
    const sel = rt.gSprites[spriteId] as unknown as DecompSprite;
    sScreenControl.selectButtonSprite = sel;
    StartSpriteAnim(sel as never, 1);
  }
  HideStartSelectButtons();
}

/** 1:1 UpdateStartSelectButtonsVisibility (easy_chat.c:4994). */
function UpdateStartSelectButtonsVisibility(): void {
  if (!sScreenControl) return;
  if (sScreenControl.startButtonSprite) sScreenControl.startButtonSprite.invisible = !CanScrollUp();
  if (sScreenControl.selectButtonSprite) sScreenControl.selectButtonSprite.invisible = !CanScrollDown();
}

/** 1:1 HideStartSelectButtons (easy_chat.c:5000). */
function HideStartSelectButtons(): void {
  if (!sScreenControl) return;
  if (sScreenControl.startButtonSprite) sScreenControl.startButtonSprite.invisible = true;
  if (sScreenControl.selectButtonSprite) sScreenControl.selectButtonSprite.invisible = true;
}

/** 1:1 TryAddInterviewObjectEvents (easy_chat.c:5006) — interview seulement
 *  (mail/dewford = DISPLAY_NONE → return default). Le rendu des sprites reporter/
 *  joueur reste à câbler (OBJ gfx) = chantier interview parallèle (Gabby&Ty). */
function TryAddInterviewObjectEvents(): void {
  switch (GetDisplayedPersonType()) {
    case EASY_CHAT_PERSON_REPORTER_MALE:
    case EASY_CHAT_PERSON_REPORTER_FEMALE:
    case EASY_CHAT_PERSON_BOY:
      break;
    default:
      return;
  }
  if (GetEasyChatScreenFrameId() !== FRAMEID_INTERVIEW_SHOW_PERSON) return;
  // TODO interview : CreateObjectGraphicsSprite(reporter, 76, 40) + joueur (52, 40).
}

/** 1:1 GetFooterIndex (easy_chat.c:5052). */
function GetFooterIndex(): number {
  const frameId = GetEasyChatScreenFrameId();
  switch (sPhraseFrameDimensions[frameId].footerId) {
    case FOOTER_QUIZ: return FOOTER_QUIZ;
    case FOOTER_ANSWER: return FOOTER_ANSWER;
    case FOOTER_NORMAL: return FOOTER_NORMAL;
    default: return NUM_FOOTER_TYPES;
  }
}

/** 1:1 GetFooterOptionXOffset (easy_chat.c:5068). */
function GetFooterOptionXOffset(option: number): number {
  const footerIndex = GetFooterIndex();
  if (footerIndex < NUM_FOOTER_TYPES) return sFooterOptionXOffsets[footerIndex][option] + 4;
  else return 0;
}

/** 1:1 AddMainScreenButtonWindow (easy_chat.c:5077) — barre de boutons du bas. */
function AddMainScreenButtonWindow(): void {
  const footerIndex = GetFooterIndex();
  if (footerIndex === NUM_FOOTER_TYPES) return;
  const template: WindowTemplate = {
    bg: 3, tilemapLeft: 1, tilemapTop: 11, width: 28, height: 2,
    paletteNum: 11, baseBlock: 0x4C, //!< French Difference
  };
  const windowId = AddWindow(template);
  FillWindowPixelBuffer(windowId, PIXEL_FILL(1));
  for (let i = 0; i < sFooterTextOptions[0].length; i++) {
    const str = sFooterTextOptions[footerIndex][i];
    if (str) {
      const x = sFooterOptionXOffsets[footerIndex][i];
      PrintEasyChatText(windowId, FONT_NORMAL, str, x, 1, 0, null);
    }
  }
  PutWindowTilemap(windowId);
}

/** 1:1 LoadEasyChatGfx (easy_chat.c:4624). Décomp : LoadSpriteSheets + LoadSpritePalettes
 *  + boucle LoadCompressedSpriteSheet. Adaptation : nos assets .lz du décomp sont des PNG
 *  DÉJÀ décompressés → on charge les "compressed sheets" comme des sheets bruts par tag. */
function LoadEasyChatGfx(): void {
  LoadSpriteSheets(sSpriteSheets as never);
  LoadSpritePalettes(sSpritePalettes as never);
  LoadSpriteSheets(sCompressedSpriteSheets as never);
}

// ─── Word text lookup (1:1 decomp easy_chat.c:5136-5237, 5667-5684) ──────────

function GetEasyChatWord(groupId: number, index: number): Uint8Array | string {
  switch (groupId) {
    case EC_GROUP_POKEMON:
    case EC_GROUP_POKEMON_NATIONAL:
      return gSpeciesNames[index] ?? '';
    case EC_GROUP_MOVE_1:
    case EC_GROUP_MOVE_2:
      return gMoveNames[index] ?? '';
    default:
      return gEasyChatGroups[groupId]?.wordData.words?.[index]?.text ?? '';
  }
}

/** 1:1 IsEasyChatWordInvalid (easy_chat.c:5136). */
function IsEasyChatWordInvalid(easyChatWord: number): boolean {
  if (easyChatWord === EC_EMPTY_WORD) return false;
  const groupId = EC_GROUP(easyChatWord);
  const index = EC_INDEX(easyChatWord);
  if (groupId >= EC_NUM_GROUPS) return true;
  const numWords = gEasyChatGroups[groupId].numWords;
  switch (groupId) {
    case EC_GROUP_POKEMON:
    case EC_GROUP_POKEMON_NATIONAL:
    case EC_GROUP_MOVE_1:
    case EC_GROUP_MOVE_2: {
      const list = gEasyChatGroups[groupId].wordData.valueList!;
      for (let i = 0; i < numWords; i++) if (index === list[i]) return false;
      return true;
    }
  }
  return index >= numWords;
}

/** 1:1 CopyEasyChatWord (easy_chat.c:5217). Retourne l'end-ptr (subarray sur EOS). */
export function CopyEasyChatWord(dest: Uint8Array, easyChatWord: number): Uint8Array {
  let resultStr: Uint8Array;
  if (IsEasyChatWordInvalid(easyChatWord)) {
    resultStr = StringCopy(dest, gText_ThreeQuestionMarks ?? '???');
  } else if (easyChatWord !== EC_EMPTY_WORD) {
    const index = EC_INDEX(easyChatWord);
    const groupId = EC_GROUP(easyChatWord);
    resultStr = StringCopy(dest, GetEasyChatWord(groupId, index));
  } else {
    dest[0] = EOS;
    resultStr = dest;
  }
  return resultStr;
}

/** 1:1 CopyEasyChatWordPadded (easy_chat.c:5672). */
function CopyEasyChatWordPadded(dest: Uint8Array, easyChatWord: number, totalChars: number): Uint8Array {
  let str = CopyEasyChatWord(dest, easyChatWord);
  for (let i = str.byteOffset - dest.byteOffset; i < totalChars; i++) {
    str[0] = CHAR_SPACE;
    str = str.subarray(1);
  }
  str[0] = EOS;
  return str;
}

/** 1:1 GetEasyChatWordGroupName (easy_chat.c:5667) = sEasyChatGroupNamePointers[groupId]. */
function GetEasyChatWordGroupName(groupId: number): Uint8Array | string {
  return sEasyChatGroupNamePointers[groupId] ?? '';
}

// ─── Word data (sWordData) — 1:1 decomp easy_chat.c section 5598-5849 ─────────

/** 1:1 InitEasyChatScreenWordData (easy_chat.c:5598). */
export function InitEasyChatScreenWordData(): boolean {
  sWordData = makeEasyChatScreenWordData(); // Alloc
  if (!sWordData) return false;
  SetUnlockedEasyChatGroups();
  SetUnlockedWordsByAlphabet();
  return true;
}

/** 1:1 FreeEasyChatScreenWordData (easy_chat.c:5609). */
export function FreeEasyChatScreenWordData(): void {
  sWordData = null;
}

/** 1:1 SetUnlockedEasyChatGroups (easy_chat.c:5614). */
function SetUnlockedEasyChatGroups(): void {
  if (!sWordData) return;
  sWordData.numUnlockedGroups = 0;
  if (GetNationalPokedexCount(FLAG_GET_SEEN))
    sWordData.unlockedGroupIds[sWordData.numUnlockedGroups++] = EC_GROUP_POKEMON;

  // Ces groupes sont déverrouillés automatiquement.
  for (let i = EC_GROUP_TRAINER; i <= EC_GROUP_ADJECTIVES; i++)
    sWordData.unlockedGroupIds[sWordData.numUnlockedGroups++] = i;

  if (FlagGet(FLAG_SYS_GAME_CLEAR)) {
    sWordData.unlockedGroupIds[sWordData.numUnlockedGroups++] = EC_GROUP_EVENTS;
    sWordData.unlockedGroupIds[sWordData.numUnlockedGroups++] = EC_GROUP_MOVE_1;
    sWordData.unlockedGroupIds[sWordData.numUnlockedGroups++] = EC_GROUP_MOVE_2;
  }
  if (FlagGet(FLAG_UNLOCKED_TRENDY_SAYINGS))
    sWordData.unlockedGroupIds[sWordData.numUnlockedGroups++] = EC_GROUP_TRENDY_SAYING;
  if (IsNationalPokedexEnabled())
    sWordData.unlockedGroupIds[sWordData.numUnlockedGroups++] = EC_GROUP_POKEMON_NATIONAL;
}

/** 1:1 GetNumUnlockedEasyChatGroups (easy_chat.c:5640). */
export function GetNumUnlockedEasyChatGroups(): number {
  return sWordData ? sWordData.numUnlockedGroups : 0;
}

/** 1:1 GetUnlockedEasyChatGroupId (easy_chat.c:5645). */
export function GetUnlockedEasyChatGroupId(index: number): number {
  if (!sWordData || index >= sWordData.numUnlockedGroups) return EC_NUM_GROUPS;
  return sWordData.unlockedGroupIds[index];
}

/** 1:1 SetUnlockedWordsByAlphabet (easy_chat.c:5686). Liste compressée
 *  EC_EMPTY_WORD+count (DOUBLE_SPECIES_NAME) : garde le premier mot débloqué. */
function SetUnlockedWordsByAlphabet(): void {
  if (!sWordData) return;
  for (let i = 0; i < EC_NUM_ALPHABET_GROUPS; i++) {
    const numWords = gEasyChatWordsByLetterPointers[i].numWords;
    const words = gEasyChatWordsByLetterPointers[i].words;
    sWordData.numUnlockedAlphabetWords[i] = 0;
    let index = 0;
    let w = 0; // pointeur mobile (= `words` du décomp)
    for (let j = 0; j < numWords; j++) {
      let numToProcess: number;
      if (words[w] === EC_EMPTY_WORD) {
        w++;
        numToProcess = words[w];
        w++;
        j += 1 + numToProcess;
      } else {
        numToProcess = 1;
      }
      for (let k = 0; k < numToProcess; k++) {
        if (IsEasyChatWordUnlocked(words[w + k])) {
          sWordData.unlockedAlphabetWords[i][index++] = words[w + k];
          sWordData.numUnlockedAlphabetWords[i]++;
          break;
        }
      }
      w += numToProcess;
    }
  }
}

/** 1:1 SetSelectedWordGroup (easy_chat.c:5729). */
export function SetSelectedWordGroup(inAlphabetMode: boolean, groupId: number): void {
  if (!sWordData) return;
  if (!inAlphabetMode)
    sWordData.numSelectedGroupWords = SetSelectedWordGroup_GroupMode(groupId);
  else
    sWordData.numSelectedGroupWords = SetSelectedWordGroup_AlphabetMode(groupId);
}

/** 1:1 GetWordFromSelectedGroup (easy_chat.c:5737). */
export function GetWordFromSelectedGroup(index: number): number {
  if (!sWordData || index >= sWordData.numSelectedGroupWords) return EC_EMPTY_WORD;
  return sWordData.selectedGroupWords[index];
}

/** 1:1 GetNumWordsInSelectedGroup (easy_chat.c:5745). */
export function GetNumWordsInSelectedGroup(): number {
  return sWordData ? sWordData.numSelectedGroupWords : 0;
}

/** 1:1 SetSelectedWordGroup_GroupMode (easy_chat.c:5750). */
function SetSelectedWordGroup_GroupMode(groupId: number): number {
  if (!sWordData) return 0;
  const numWords = gEasyChatGroups[groupId].numWords;
  let totalWords = 0;
  if (
    groupId === EC_GROUP_POKEMON || groupId === EC_GROUP_POKEMON_NATIONAL ||
    groupId === EC_GROUP_MOVE_1 || groupId === EC_GROUP_MOVE_2
  ) {
    const list = gEasyChatGroups[groupId].wordData.valueList!;
    for (let i = 0; i < numWords; i++) {
      if (IsEasyChatIndexAndGroupUnlocked(list[i], groupId))
        sWordData.selectedGroupWords[totalWords++] = EC_WORD(groupId, list[i]);
    }
    return totalWords;
  } else {
    const wordInfo = gEasyChatGroups[groupId].wordData.words!;
    for (let i = 0; i < numWords; i++) {
      const alphabeticalOrder = wordInfo[i].alphabeticalOrder;
      if (IsEasyChatIndexAndGroupUnlocked(alphabeticalOrder, groupId))
        sWordData.selectedGroupWords[totalWords++] = EC_WORD(groupId, alphabeticalOrder);
    }
    return totalWords;
  }
}

/** 1:1 SetSelectedWordGroup_AlphabetMode (easy_chat.c:5784). */
function SetSelectedWordGroup_AlphabetMode(groupId: number): number {
  if (!sWordData) return 0;
  let totalWords = 0;
  for (let i = 0; i < sWordData.numUnlockedAlphabetWords[groupId]; i++)
    sWordData.selectedGroupWords[totalWords++] = sWordData.unlockedAlphabetWords[groupId][i];
  return totalWords;
}

/** 1:1 IsEasyChatGroupUnlocked2 (easy_chat.c:5795). */
function IsEasyChatGroupUnlocked2(groupId: number): boolean {
  if (!sWordData) return false;
  for (let i = 0; i < sWordData.numUnlockedGroups; i++)
    if (sWordData.unlockedGroupIds[i] === groupId) return true;
  return false;
}

/** 1:1 IsEasyChatIndexAndGroupUnlocked (easy_chat.c:5807). */
function IsEasyChatIndexAndGroupUnlocked(wordIndex: number, groupId: number): boolean {
  switch (groupId) {
    case EC_GROUP_POKEMON:
      return !!GetSetPokedexFlag(SpeciesToNationalPokedexNum(wordIndex), FLAG_GET_SEEN);
    case EC_GROUP_POKEMON_NATIONAL:
      if (IsRestrictedWordSpecies(wordIndex))
        GetSetPokedexFlag(SpeciesToNationalPokedexNum(wordIndex), FLAG_GET_SEEN);
      return true;
    case EC_GROUP_MOVE_1:
    case EC_GROUP_MOVE_2:
      return true;
    case EC_GROUP_TRENDY_SAYING:
      return IsTrendySayingUnlocked(wordIndex);
    default:
      return !!gEasyChatGroups[groupId].wordData.words![wordIndex].enabled;
  }
}

/** 1:1 IsRestrictedWordSpecies (easy_chat.c:5829). */
function IsRestrictedWordSpecies(species: number): boolean {
  for (let i = 0; i < sRestrictedWordSpecies.length; i++)
    if (sRestrictedWordSpecies[i] === species) return true;
  return false;
}

/** 1:1 IsEasyChatWordUnlocked (easy_chat.c:5841). */
function IsEasyChatWordUnlocked(easyChatWord: number): boolean {
  const groupId = EC_GROUP(easyChatWord);
  const index = EC_INDEX(easyChatWord);
  if (!IsEasyChatGroupUnlocked2(groupId)) return false;
  return IsEasyChatIndexAndGroupUnlocked(index, groupId);
}

/** 1:1 IsTrendySayingUnlocked (easy_chat.c:5446). */
function IsTrendySayingUnlocked(wordIndex: number): boolean {
  const byteOffset = Math.floor(wordIndex / 8);
  const shift = wordIndex % 8;
  return ((gSaveBlock1Ptr.unlockedTrendySayings[byteOffset] >> shift) & 1) !== 0;
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
      InitBgsFromTemplates(0, sEasyChatBgTemplates, sEasyChatBgTemplates.length);
      SetBgTilemapBuffer(3, sScreenControl.bg3TilemapBuffer);
      SetBgTilemapBuffer(1, sScreenControl.bg1TilemapBuffer);
      InitWindows(sEasyChatWindowTemplates);
      DeactivateAllTextPrinters();
      LoadEasyChatPalettes();
      InitEasyChatBgs();
      CpuFastFill(0, OAM as unknown as Uint8Array, OAM_SIZE);
      break;
    case 1:
      DecompressAndLoadBgGfxUsingHeap(3, gEasyChatWindow_Gfx, 0, 0, 0);
      CopyToBgTilemapBuffer(3, gEasyChatWindow_Tilemap, 0, 0);
      AdjustBgTilemapForFooter();
      BufferFrameTilemap(sScreenControl.bg1TilemapBuffer);
      AddPhraseWindow();
      AddMainScreenButtonWindow();
      CopyBgTilemapBufferToVram(3);
      break;
    case 2:
      DecompressAndLoadBgGfxUsingHeap(1, sTextInputFrame_Gfx, 0, 0, 0);
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
      if (GetEasyChatScreenType() !== EASY_CHAT_TYPE_QUIZ_QUESTION) {
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

  currentPhrase = GetCurrentPhrase();
  frameId = GetEasyChatScreenFrameId();
  cursorColumn = GetMainCursorColumn();
  cursorRow = GetMainCursorRow();
  numColumns = GetNumColumns();
  let ecWordIdx = cursorRow * numColumns;
  const frame = sPhraseFrameDimensions[frameId];
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
  const xOffset = GetFooterOptionXOffset(GetMainCursorColumn());
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
        const scrollChange = GetWordSelectScrollOffset() - GetLowerWindowScrollOffset();
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
        const scrollChange = GetWordSelectScrollOffset() - GetLowerWindowScrollOffset();
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
  sScreenControl.fourFooterOptions = FooterHasFourOptions_();
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
  LoadPalette(gEasyChatMode_Pal as Uint16Array, BG_PLTT_ID(0), PLTT_SIZE_4BPP);
  LoadPalette(sTextInputFrameOrange_Pal as Uint16Array, BG_PLTT_ID(1), 32);
  LoadPalette(sTextInputFrameGreen_Pal as Uint16Array, BG_PLTT_ID(4), 32);
  LoadPalette(sTitleText_Pal as Uint16Array, BG_PLTT_ID(10), 32);
  LoadPalette(sText_Pal as Uint16Array, BG_PLTT_ID(11), 32);
  LoadPalette(sText_Pal as Uint16Array, BG_PLTT_ID(15), 32);
  LoadPalette(sText_Pal as Uint16Array, BG_PLTT_ID(3), 32);
}

/** 1:1 decomp easy_chat.c:3941 */
function PrintTitle(): void {
  let xOffset: number;
  const titleText = GetTitleText();
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
      const r = GetEasyChatInstructionsText();
      text1 = r.text1; text2 = r.text2;
      break;
    }
    case MSG_CONFIRM_EXIT: {
      const r = GetEasyChatConfirmExitText();
      text1 = r.text1; text2 = r.text2;
      break;
    }
    case MSG_CONFIRM: {
      const r = GetEasyChatConfirmText();
      text1 = r.text1; text2 = r.text2;
      break;
    }
    case MSG_CONFIRM_DELETE: {
      const r = GetEasyChatConfirmDeletionText();
      text1 = r.text1; text2 = r.text2;
      break;
    }
    case MSG_CREATE_QUIZ:
      text1 = gText_CreateAQuiz;
      break;
    case MSG_SELECT_ANSWER:
      text1 = gText_SelectTheAnswer;
      break;
    case MSG_SONG_TOO_SHORT:
      text1 = gText_OnlyOnePhrase;
      text2 = gText_OriginalSongWillBeUsed;
      break;
    case MSG_CANT_DELETE_LYRICS:
      text1 = gText_LyricsCantBeDeleted;
      break;
    case MSG_COMBINE_TWO_WORDS:
      text1 = gText_CombineTwoWordsOrPhrases3;
      break;
    case MSG_CANT_QUIT:
      text1 = gText_YouCannotQuitHere;
      text2 = gText_SectionMustBeCompleted;
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
  if (!sEasyChatYesNoWindowTemplate) {
    console.warn('[easy-chat-render] CreateEasyChatYesNoMenu: sEasyChatYesNoWindowTemplate not injected');
    return;
  }
  CreateYesNoMenu(sEasyChatYesNoWindowTemplate, 1, 14, initialCursorPos);
}

/** 1:1 decomp easy_chat.c:4035 */
function AddPhraseWindow(): void {
  if (!sScreenControl) return;
  const frameId = GetEasyChatScreenFrameId();
  const frame = sPhraseFrameDimensions[frameId];
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

  currentPhrase = GetCurrentPhrase();
  numColumns = GetNumColumns();
  numRows = GetNumRows();
  frameId = GetEasyChatScreenFrameId();

  isQuizQuestion = false;
  if (frameId === FRAMEID_QUIZ_QUESTION) {
    isQuizQuestion = true;
  }

  FillWindowPixelBuffer(sScreenControl.windowId, PIXEL_FILL(1));
  let phraseIdx = 0;
  for (i = 0; i < numRows; i++) {
    // memcpy(strClear, sText_Clear17, sizeof(sText_Clear17));
    if (sText_Clear17) {
      for (let m = 0; m < strClear.length && m < sText_Clear17.length; m++) {
        strClear[m] = sText_Clear17[m];
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

  frameId = GetEasyChatScreenFrameId();
  CpuFastFill(0, tilemap as unknown as Uint8Array, BG_SCREEN_SIZE);
  const frame = sPhraseFrameDimensions[frameId];
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
  frameId = GetEasyChatScreenFrameId();
  const frame = sPhraseFrameDimensions[frameId];
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
  if (!GetInAlphabetMode()) {
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
        InitLowerWindowScroll(GetKeyboardScrollOffset(), 0);
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
  const alphabet = getEasyChatKeyboardAlphabet();
  for (let i = 0; i < alphabet.length; i++) {
    PrintEasyChatText(WIN_INPUT_SELECT, FONT_NORMAL, alphabet[i], 10, 97 + i * 16, TEXT_SKIP_DRAW, null);
  }
}

/** 1:1 decomp easy_chat.c:4279 */
function PrintInitialWordSelectText(): void {
  PrintWordSelectText(0, NUM_WORD_SELECT_ROWS);
}

/** 1:1 decomp easy_chat.c:4284 */
function PrintWordSelectNextRowDown(): void {
  const wordScroll = GetWordSelectScrollOffset() + NUM_WORD_SELECT_ROWS - 1;
  EraseWordSelectRows(wordScroll, 1);
  PrintWordSelectText(wordScroll, 1);
}

/** 1:1 decomp easy_chat.c:4291 */
function PrintWordSelectNextRowUp(): void {
  const wordScroll = GetWordSelectScrollOffset();
  EraseWordSelectRows(wordScroll, 1);
  PrintWordSelectText(wordScroll, 1);
}

/** 1:1 decomp easy_chat.c:4298 */
function PrintWordSelectRowsPageDown(): void {
  const wordScroll = GetWordSelectScrollOffset();
  let maxScroll = wordScroll + NUM_WORD_SELECT_ROWS;
  const maxRows = GetWordSelectLastRow() + 1;
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
  const wordScroll = GetWordSelectScrollOffset();
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

// (Fusion 1 fichier : ancien bloc `export {}` retiré — tout est interne ici.)
// State machine functions (ECFUNC dispatch â€” already exported via Run/Start).
  // Render helpers utiles Ã  section 1-2 / debug :
// ═════════════════════════════════════════════════════════════════════════════
//  SECTIONS 0-2 — Converters (mail read) + lifecycle + input state machine
//  (1:1 décomp easy_chat.c) — fusionnées dans ce fichier (plus d'injection).
// ═════════════════════════════════════════════════════════════════════════════

/** 1:1 décomp `u8 *ConvertEasyChatWordsToString(u8 *dest, const u16 *src, u16 columns, u16 rows)`
 *  (easy_chat.c:5239). Écrit les mots (joints CHAR_SPACE, lignes CHAR_NEWLINE)
 *  dans dest, la dernière NEWLINE remplacée par EOS ; retourne l'end-ptr. */
export function ConvertEasyChatWordsToString(
  dest: Uint8Array, src: ArrayLike<number>, columns: number, rows: number,
): Uint8Array {
  const base = dest.byteOffset;
  let d = dest;
  const numColumns = columns - 1;
  let si = 0;
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < numColumns; j++) {
      d = CopyEasyChatWord(d, src[si]);
      if (src[si] !== EC_EMPTY_WORD) { d[0] = CHAR_SPACE; d = d.subarray(1); }
      si++;
    }
    d = CopyEasyChatWord(d, src[si++]);
    d[0] = CHAR_NEWLINE; d = d.subarray(1);
  }
  const pos = d.byteOffset - base - 1; // 1:1 décomp : dest--; *dest = EOS
  dest[pos] = EOS;
  return dest.subarray(pos);
}

/** 1:1 décomp `u16 GetRandomEasyChatWordFromGroup(u16 groupId)` (easy_chat.c:5354). */
export function GetRandomEasyChatWordFromGroup(groupId: number): number {
  let index = Random() % gEasyChatGroups[groupId].numWords;
  if (groupId === EC_GROUP_POKEMON || groupId === EC_GROUP_POKEMON_NATIONAL
   || groupId === EC_GROUP_MOVE_1 || groupId === EC_GROUP_MOVE_2) {
    index = gEasyChatGroups[groupId].wordData.valueList![index];
  }
  return EC_WORD(groupId, index);
}

// ─── Chargement GFX (palettes + frames) — assets décomp public/decomp/em/easy_chat ─
// Adaptation JS hardware-exempte : préchargé une fois. easyChatGfxReady = gate
// (le flux give attend avant DoEasyChatScreen, cf. init synchrone du CB2).
export function easyChatGfxReady(): Promise<void> {
  if (_easyChatGfxLoaded) return Promise.resolve();
  if (!_easyChatGfxLoading) _easyChatGfxLoading = _loadEasyChatGfxAssets();
  return _easyChatGfxLoading;
}
async function _loadEasyChatGfxAssets(): Promise<void> {
  if (_easyChatGfxLoaded) return;
  const base = '/decomp/em/easy_chat';
  const [textPal, titlePal, orangePal, greenPal, modePng, winPng, winMap, framePng,
         triCursor, rectCursor, scrollInd, startSelect, buttonWin, interview] = await Promise.all([
    loadGbaPal(`${base}/text.pal`),
    loadGbaPal(`${base}/title_text.pal`),
    loadGbaPal(`${base}/text_input_frame_orange.pal`),
    loadGbaPal(`${base}/text_input_frame_green.pal`),
    loadIndexedPngStrict(`${base}/mode.png`, 4),
    loadIndexedPngStrict(`${base}/window.png`, 4),
    loadTilemapBin(`${base}/window.bin`),
    loadIndexedPngStrict(`${base}/text_input_frame.png`, 4),
    loadIndexedPngStrict(`${base}/triangle_cursor.png`, 4),
    loadIndexedPngStrict(`${base}/rectangle_cursor.png`, 4),
    loadIndexedPngStrict(`${base}/scroll_indicator.png`, 4),
    loadIndexedPngStrict(`${base}/start_select_buttons.png`, 4),
    loadIndexedPngStrict(`${base}/button_window.png`, 4),
    loadIndexedPngStrict(`${base}/interview_frame.png`, 4),
  ]);
  sText_Pal = textPal;
  sTitleText_Pal = titlePal;
  sTextInputFrameOrange_Pal = orangePal;
  sTextInputFrameGreen_Pal = greenPal;
  gEasyChatMode_Pal = modePng.palette;
  gEasyChatWindow_Gfx = winPng.charData;
  gEasyChatWindow_Tilemap = winMap;
  sTextInputFrame_Gfx = framePng.charData;
  // 1:1 décomp sSpriteSheets (easy_chat.c:879) : triangle + scroll_indicator + start_select_buttons.
  sSpriteSheets = [
    { data: triCursor.charData, size: triCursor.charData.length, tag: GFXTAG_TRIANGLE_CURSOR },
    { data: scrollInd.charData, size: scrollInd.charData.length, tag: GFXTAG_SCROLL_INDICATOR },
    { data: startSelect.charData, size: startSelect.charData.length, tag: GFXTAG_START_SELECT_BUTTONS },
  ];
  // 1:1 décomp sSpritePalettes (easy_chat.c:898) : triangle(0) + rectangle(1) +
  // button_window→PALTAG_MISC_UI(2, palette partagée mode/boutons/scroll/start-select) + rs_interview(3).
  sSpritePalettes = [
    { data: triCursor.palette, tag: PALTAG_TRIANGLE_CURSOR },
    { data: rectCursor.palette, tag: PALTAG_RECTANGLE_CURSOR },
    { data: buttonWin.palette, tag: PALTAG_MISC_UI },
    { data: interview.palette, tag: PALTAG_RS_INTERVIEW_FRAME },
  ];
  // 1:1 décomp sCompressedSpriteSheets (easy_chat.c:918) : rs_interview + rectangle + button_window + mode.
  // (Assets .lz du décomp → PNG déjà décompressés chez nous ; LoadCompressedSpriteSheet charge par tag.)
  sCompressedSpriteSheets = [
    { data: interview.charData, size: interview.charData.length, tag: GFXTAG_RS_INTERVIEW_FRAME },
    { data: rectCursor.charData, size: rectCursor.charData.length, tag: GFXTAG_RECTANGLE_CURSOR },
    { data: buttonWin.charData, size: buttonWin.charData.length, tag: GFXTAG_BUTTON_WINDOW },
    { data: modePng.charData, size: modePng.charData.length, tag: GFXTAG_MODE_WINDOW },
  ];
  _easyChatGfxLoaded = true;
}

// ─── DoEasyChatScreen / CB2 / Task (easy_chat.c:1294) ────────────────────────
/** 1:1 décomp `void DoEasyChatScreen(u8 type, u16 *words, MainCallback exitCallback, u8 displayedPersonType)`. */
export function DoEasyChatScreen(
  type: number, words: Uint16Array | null, exitCallback: MainCallback | null, displayedPersonType: number,
): void {
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

// EASY_CHAT_TYPE_* restants (les autres sont dans le bloc de déclarations en tête).
const EASY_CHAT_TYPE_BATTLE_START = 1;
const EASY_CHAT_TYPE_BATTLE_WON = 2;
const EASY_CHAT_TYPE_BATTLE_LOST = 3;
const EASY_CHAT_TYPE_INTERVIEW = 5;
const EASY_CHAT_TYPE_FAN_CLUB = 7;
const EASY_CHAT_TYPE_DUMMY_SHOW = 8;
const EASY_CHAT_TYPE_GABBY_AND_TY = 10;
const EASY_CHAT_TYPE_BATTLE_TOWER_INTERVIEW = 12;
const EASY_CHAT_TYPE_FAN_QUESTION = 14;
const EASY_CHAT_PERSON_REPORTER_MALE_L = 0;
const EASY_CHAT_PERSON_REPORTER_FEMALE_L = 1;
const EASY_CHAT_PERSON_BOY_L = 2;
const NUM_BARD_SONG_WORDS = 6;

// ⚠️ NON-1:1 (dép. externe non portée) : `CleanupOverworldWindowsAndTilemaps` vit dans
// overworld.c:1416 (ClearMirageTowerPulseBlendEffect + FreeAllOverworldWindowBuffers +
// TRY_FREE_AND_SET_NULL gOverworldTilemapBuffer_Bg1/2/3) — PAS PORTÉE. Stub : notre
// InitEasyChatScreen (ResetBgs/ResetSpriteData/FreeAllWindowBuffers) couvre le reset nécessaire.
function CleanupOverworldWindowsAndTilemaps(): void { /* overworld.c:1416 non portée */ }

/** 1:1 décomp `void InitializeEasyChatWordArray(u16 *words, u16 length)` (easy_chat.c) :
 *    for (i = length - 1; i != EC_EMPTY_WORD; i--) *(words++) = EC_EMPTY_WORD; */
function InitializeEasyChatWordArray(words: Uint16Array, length: number): void {
  let w = 0; // pointeur mobile = `words++` du décomp
  for (let i = (length - 1) & 0xFFFF; i !== EC_EMPTY_WORD; i = (i - 1) & 0xFFFF)
    words[w++] = EC_EMPTY_WORD;
}

// ⚠️ NON-1:1 (dép. externe non portée) : `GetQuestionnaireWordsPtr` vit dans mystery_gift.c:54
// (pointeur vers le buffer questionnaire du Mystery Gift) — mystery_gift.c PAS PORTÉ → buffer
// local vide. Hors scope mail/dewford/interview (= Mystery Gift uniquement).
function GetQuestionnaireWordsPtr(): Uint16Array { return new Uint16Array(4).fill(EC_EMPTY_WORD); }

/** 1:1 décomp `void ShowEasyChatScreen(void)` (easy_chat.c:1456). Special de champ :
 *  lit gSpecialVar_0x8004 (type) → sélectionne le buffer de mots → DoEasyChatScreen. */
export function ShowEasyChatScreen(): void {
  let words: Uint16Array;
  let displayedPersonType = EASY_CHAT_PERSON_DISPLAY_NONE;
  const sb1 = gSaveBlock1Ptr as Record<string, any>;
  const sb2 = gSaveBlock2Ptr as Record<string, any>;
  const v8004 = VarGet('VAR_0x8004');
  const v8005 = VarGet('VAR_0x8005');
  const v8006 = VarGet('VAR_0x8006');
  // gStringVar3 réinterprété u16 (= décomp `words = (u16 *)gStringVar3`).
  const sv3 = new Uint16Array(gStringVar3.buffer, gStringVar3.byteOffset, 4);
  switch (v8004) {
    case EASY_CHAT_TYPE_PROFILE: words = sb1.easyChatProfile; break;
    case EASY_CHAT_TYPE_BATTLE_START: words = sb1.easyChatBattleStart; break;
    case EASY_CHAT_TYPE_BATTLE_WON: words = sb1.easyChatBattleWon; break;
    case EASY_CHAT_TYPE_BATTLE_LOST: words = sb1.easyChatBattleLost; break;
    case EASY_CHAT_TYPE_MAIL: words = sb1.mail[v8005].words; break;
    case EASY_CHAT_TYPE_BARD_SONG: {
      const bard = sb1.oldMan.bard;
      for (let i = 0; i < NUM_BARD_SONG_WORDS; i++) bard.newSongLyrics[i] = bard.songLyrics[i];
      words = bard.newSongLyrics;
      break;
    }
    case EASY_CHAT_TYPE_INTERVIEW:
      words = sb1.tvShows[v8005].bravoTrainer.words;
      displayedPersonType = v8006;
      break;
    case EASY_CHAT_TYPE_FAN_CLUB:
      words = sb1.tvShows[v8005].fanclubOpinions.words.subarray(v8006);
      displayedPersonType = EASY_CHAT_PERSON_REPORTER_FEMALE_L;
      break;
    case EASY_CHAT_TYPE_DUMMY_SHOW:
      words = sb1.tvShows[v8005].dummy.words;
      displayedPersonType = EASY_CHAT_PERSON_REPORTER_MALE_L;
      break;
    case EASY_CHAT_TYPE_TRENDY_PHRASE:
      words = sv3;
      words[0] = sb1.dewfordTrends[0].words[0];
      words[1] = sb1.dewfordTrends[0].words[1];
      break;
    case EASY_CHAT_TYPE_GABBY_AND_TY:
      words = sb1.gabbyAndTyData.quote;
      words[0] = EC_EMPTY_WORD;
      displayedPersonType = EASY_CHAT_PERSON_REPORTER_FEMALE_L;
      break;
    case EASY_CHAT_TYPE_CONTEST_INTERVIEW:
      words = sb1.tvShows[v8005].bravoTrainer.words.subarray(v8006);
      displayedPersonType = EASY_CHAT_PERSON_REPORTER_MALE_L;
      break;
    case EASY_CHAT_TYPE_BATTLE_TOWER_INTERVIEW:
      words = sb1.tvShows[v8005].bravoTrainerTower.words;
      displayedPersonType = EASY_CHAT_PERSON_REPORTER_FEMALE_L;
      break;
    case EASY_CHAT_TYPE_GOOD_SAYING:
      words = sv3;
      InitializeEasyChatWordArray(words, 2);
      break;
    case EASY_CHAT_TYPE_FAN_QUESTION:
      words = sb1.tvShows[v8005].fanClubSpecial.words;
      words[0] = EC_EMPTY_WORD;
      displayedPersonType = EASY_CHAT_PERSON_BOY_L;
      break;
    // ⚠️ Cases QUIZ = Lilycove Lady (lilycove_lady.c) PAS PORTÉE : la save n'a pas
    // lilycoveLady → ces branches ne se déclenchent pas (hors mail/dewford/interview).
    // Décomp : QUIZ_ANSWER/QUIZ_SET_ANSWER = `&quiz.playerAnswer`/`&quiz.correctAnswer`
    // (pointeur sur 1 u16) ; à porter en vue 1-élément quand lilycove_lady.c sera fait.
    case EASY_CHAT_TYPE_QUIZ_ANSWER: words = sb1.lilycoveLady.quiz.playerAnswer; break;
    case EASY_CHAT_TYPE_QUIZ_QUESTION: return;
    case EASY_CHAT_TYPE_QUIZ_SET_QUESTION: words = sb1.lilycoveLady.quiz.question; break;
    case EASY_CHAT_TYPE_QUIZ_SET_ANSWER: words = sb1.lilycoveLady.quiz.correctAnswer; break;
    case EASY_CHAT_TYPE_APPRENTICE: words = sb2.apprentices[0].speechWon; break;
    case EASY_CHAT_TYPE_QUESTIONNAIRE: words = GetQuestionnaireWordsPtr(); break;
    default: return;
  }
  CleanupOverworldWindowsAndTilemaps();
  DoEasyChatScreen(v8004, words, CB2_ReturnToFieldContinueScript_Manual, displayedPersonType);
}

function CB2_EasyChatScreen(): void {
  RunTasks();
  AnimateSprites();
  BuildOamBuffer();
  UpdatePaletteFade();
}

function VBlankCB_EasyChatScreen(): void {
  TransferPlttBuffer();
  LoadOam();
  ProcessSpriteCopyRequests(getRuntime());
}

function StartEasyChatScreen(taskId: number, taskFunc: (task: DecompTask) => void): void {
  const rt = getRuntime();
  rt.gTasks[taskId].func = taskFunc;
  rt.gTasks[taskId].data[tState] = MAINSTATE_FADE_IN;
}

/** Solo (non-link) : `while (InitEasyChatScreen(taskId));` (init synchrone). */
function Task_InitEasyChatScreen(task: DecompTask): void {
  const taskId = task.taskId;
  while (InitEasyChatScreen(taskId));
  StartEasyChatScreen(taskId, Task_EasyChatScreen);
}

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

function ExitEasyChatScreen(callback: MainCallback | null): void {
  FreeEasyChatScreenControl();
  FreeEasyChatScreenStruct();
  FreeEasyChatScreenWordData();
  FreeAllWindowBuffers();
  SetMainCallback2(callback);
}

// ─── InitEasyChatScreenStruct (easy_chat.c:1637) ─────────────────────────────
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
  const templateId = GetEachChatScreenTemplateId(type);
  sEasyChatScreen.inputState = INPUTSTATE_PHRASE;
  sEasyChatScreen.titleText = sEasyChatScreenTemplates[templateId].titleText;
  sEasyChatScreen.numColumns = sEasyChatScreenTemplates[templateId].numColumns;
  sEasyChatScreen.numRows = sEasyChatScreenTemplates[templateId].numRows;
  sEasyChatScreen.maxWords = sEasyChatScreen.numColumns * sEasyChatScreen.numRows;
  sEasyChatScreen.templateId = templateId;
  if (sEasyChatScreen.maxWords > EC_MAX_WORDS_CURRENT_PHRASE)
    sEasyChatScreen.maxWords = EC_MAX_WORDS_CURRENT_PHRASE;

  if (words !== null) {
    for (let i = 0; i < sEasyChatScreen.maxWords; i++) sEasyChatScreen.currentPhrase[i] = words[i];
  } else {
    for (let i = 0; i < sEasyChatScreen.maxWords; i++) sEasyChatScreen.currentPhrase[i] = EC_EMPTY_WORD;
    sEasyChatScreen.savedPhrase = sEasyChatScreen.currentPhrase;
  }
  sEasyChatScreen.keyboardLastRow = Math.floor((GetNumUnlockedEasyChatGroups() - 1) / 2) + 1;
  return true;
}

function FreeEasyChatScreenStruct(): void {
  sEasyChatScreen = null;
}

function GetEachChatScreenTemplateId(type: number): number {
  for (let i = 0; i < sEasyChatScreenTemplates.length; i++) {
    if (sEasyChatScreenTemplates[i].type === type) return i;
  }
  return 0;
}

// ─── HandleEasyChatInput + sous-handlers (easy_chat.c:1698) ──────────────────
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

function IsCurrentFrame2x5(): boolean {
  switch (GetEasyChatScreenFrameId()) {
    case FRAMEID_MAIL:
    case FRAMEID_QUIZ_QUESTION:
    case FRAMEID_QUIZ_SET_QUESTION:
      return true;
  }
  return false;
}

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
      s.mainCursorRow--; break;
    } else if (JOY_NEW(DPAD_LEFT)) {
      s.mainCursorColumn--; break;
    } else if (JOY_NEW(DPAD_DOWN)) {
      s.mainCursorRow++; break;
    } else if (JOY_NEW(DPAD_RIGHT)) {
      s.mainCursorColumn++; break;
    }
    dpad = false;
  } while (false);
  if (!dpad) return ECFUNC_NONE;

  const tmpl = sEasyChatScreenTemplates[s.templateId];
  if (s.mainCursorRow < 0) s.mainCursorRow = tmpl.numRows;
  if (s.mainCursorRow > tmpl.numRows) s.mainCursorRow = 0;
  if (s.mainCursorRow === tmpl.numRows) {
    if (s.mainCursorColumn > 2) s.mainCursorColumn = 2;
    s.inputState = INPUTSTATE_MAIN_SCREEN_BUTTONS;
    return ECFUNC_UPDATE_MAIN_CURSOR_ON_BUTTONS;
  }
  if (s.mainCursorColumn < 0) s.mainCursorColumn = tmpl.numColumns - 1;
  if (s.mainCursorColumn >= tmpl.numColumns) s.mainCursorColumn = 0;
  if (IsCurrentFrame2x5() && s.mainCursorColumn === 1 && s.mainCursorRow === 4) s.mainCursorColumn = 0;
  return ECFUNC_UPDATE_MAIN_CURSOR;
}

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
      s.mainCursorRow--; break;
    } else if (JOY_NEW(DPAD_LEFT)) {
      s.mainCursorColumn--; break;
    } else if (JOY_NEW(DPAD_DOWN)) {
      s.mainCursorRow = 0; break;
    } else if (JOY_NEW(DPAD_RIGHT)) {
      s.mainCursorColumn++; break;
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

function HandleEasyChatInput_ExitPrompt(): number {
  const s = sEasyChatScreen!;
  switch (Menu_ProcessInputNoWrapClearOnChoose()) {
    case MENU_B_PRESSED:
    case 1:
      s.inputState = GetEasyChatBackupState();
      return ECFUNC_CLOSE_PROMPT;
    case 0:
      gSpecialVar.Result = 0;
      if (s.type === EASY_CHAT_TYPE_QUIZ_SET_QUESTION || s.type === EASY_CHAT_TYPE_QUIZ_SET_ANSWER)
        SaveCurrentPhrase();
      return ECFUNC_EXIT;
    default:
      return ECFUNC_NONE;
  }
}

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

function HandleEasyChatInput_QuizQuestion(): number {
  if (JOY_NEW(A_BUTTON)) return ECFUNC_QUIZ_ANSWER;
  if (JOY_NEW(B_BUTTON)) return StartConfirmExitPrompt();
  return ECFUNC_NONE;
}

function HandleEasyChatInput_WaitForMsg(): number {
  const s = sEasyChatScreen!;
  if (JOY_NEW(A_BUTTON | B_BUTTON)) {
    s.inputState = GetEasyChatBackupState();
    return ECFUNC_CLOSE_PROMPT;
  }
  return ECFUNC_NONE;
}

function HandleEasyChatInput_StartConfirmLyrics(): number {
  sEasyChatScreen!.inputState = INPUTSTATE_CONFIRM_LYRICS_YES_NO;
  return ECFUNC_PROMPT_CONFIRM;
}

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

function GetEasyChatBackupState(): number { return sEasyChatScreen!.inputStateBackup; }

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

function ExitKeyboardToMainScreen(): number {
  sEasyChatScreen!.inputState = INPUTSTATE_PHRASE;
  return ECFUNC_CLOSE_KEYBOARD;
}

function StartSwitchKeyboardMode(): number {
  const s = sEasyChatScreen!;
  s.keyboardColumn = 0;
  s.keyboardRow = 0;
  s.keyboardScrollOffset = 0;
  s.inAlphabetMode = s.inAlphabetMode ? 0 : 1;
  return ECFUNC_SWITCH_KEYBOARD_MODE;
}

function DeleteSelectedWord(): number {
  if (sEasyChatScreen!.type === EASY_CHAT_TYPE_BARD_SONG) {
    PlaySE(SE_FAILURE);
    return ECFUNC_NONE;
  } else {
    SetSelectedWord(EC_EMPTY_WORD);
    return ECFUNC_REPRINT_PHRASE;
  }
}

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

function SaveCurrentPhrase(): void {
  const s = sEasyChatScreen!;
  for (let i = 0; i < s.maxWords; i++) s.savedPhrase![i] = s.currentPhrase[i];
}

function ResetCurrentPhrase(): void {
  const s = sEasyChatScreen!;
  for (let i = 0; i < s.maxWords; i++) s.currentPhrase[i] = EC_EMPTY_WORD;
}

function ResetCurrentPhraseToSaved(): void {
  const s = sEasyChatScreen!;
  for (let i = 0; i < s.maxWords; i++) s.currentPhrase[i] = s.savedPhrase![i];
}

function SetSelectedWord(easyChatWord: number): void {
  const index = GetWordIndexToReplace();
  sEasyChatScreen!.currentPhrase[index] = easyChatWord;
}

function DidPhraseChange(): boolean {
  const s = sEasyChatScreen!;
  for (let i = 0; i < s.maxWords; i++) {
    if (s.currentPhrase[i] !== s.savedPhrase![i]) return true;
  }
  return false;
}

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

function MoveKeyboardCursor(input: number): number {
  const s = sEasyChatScreen!;
  if (s.keyboardColumn !== -1) {
    if (!s.inAlphabetMode) return MoveKeyboardCursor_GroupNames(input);
    else return MoveKeyboardCursor_Alphabet(input);
  } else {
    return MoveKeyboardCursor_ButtonWindow(input);
  }
}

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

function SetKeyboardCursorInButtonWindow(): void {
  const s = sEasyChatScreen!;
  s.keyboardColumn = -1;
  if (s.keyboardRow) s.keyboardRow--;
}

function SetKeyboardCursorToLastColumn(): void {
  const s = sEasyChatScreen!;
  if (!s.inAlphabetMode) {
    s.keyboardColumn = 1;
    ReduceToValidKeyboardColumn();
  } else {
    s.keyboardColumn = GetLastAlphabetColumn(s.keyboardRow);
  }
}

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

function GetWordIndexToReplace(): number {
  const s = sEasyChatScreen!;
  return s.mainCursorRow * s.numColumns + s.mainCursorColumn;
}

function GetSelectedGroupIndex(): number {
  const s = sEasyChatScreen!;
  return NUM_GROUP_NAME_COLUMNS * (s.keyboardRow + s.keyboardScrollOffset) + s.keyboardColumn;
}

function GetSelectedAlphabetGroupId(): number {
  const s = sEasyChatScreen!;
  const column = (s.keyboardColumn & 0xFF) < NUM_ALPHABET_COLUMNS ? s.keyboardColumn : 0;
  const row = (s.keyboardRow & 0xFF) < NUM_ALPHABET_ROWS ? s.keyboardRow : 0;
  return sAlphabetGroupIdMap[row][column];
}

function GetSelectedWordIndex(): number {
  const s = sEasyChatScreen!;
  return NUM_WORD_SELECT_COLUMNS * (s.wordSelectRow + s.wordSelectScrollOffset) + s.wordSelectColumn;
}

function GetLastAlphabetColumn(row: number): number {
  switch (row) {
    case 1: return NUM_ALPHABET_COLUMNS - 2;
    case 0:
    default: return NUM_ALPHABET_COLUMNS - 1;
  }
}

function ReduceToValidKeyboardColumn(): void {
  const s = sEasyChatScreen!;
  while (IsSelectedKeyboardIndexInvalid()) {
    if (s.keyboardColumn) s.keyboardColumn--;
    else break;
  }
}

function ReduceToValidWordSelectColumn(): void {
  const s = sEasyChatScreen!;
  while (IsSelectedWordIndexInvalid()) {
    if (s.wordSelectColumn) s.wordSelectColumn--;
    else break;
  }
}

function IsSelectedKeyboardIndexInvalid(): boolean {
  const s = sEasyChatScreen!;
  if (!s.inAlphabetMode) return GetSelectedGroupIndex() >= GetNumUnlockedEasyChatGroups();
  else return s.keyboardColumn > GetLastAlphabetColumn(s.keyboardRow);
}

function IsSelectedWordIndexInvalid(): boolean {
  return GetSelectedWordIndex() >= GetNumWordsInSelectedGroup();
}

function FooterHasFourOptions(): number {
  return sEasyChatScreenTemplates[sEasyChatScreen!.templateId].fourFooterOptions ? 1 : 0;
}

function IsPhraseDifferentThanPlayerInput(phrase: readonly number[], phraseLength: number): boolean {
  const s = sEasyChatScreen!;
  for (let i = 0; i < phraseLength; i++) if (phrase[i] !== s.currentPhrase[i]) return true;
  return false;
}

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

function DidPlayerInputMysteryGiftPhrase(): number {
  return IsPhraseDifferentThanPlayerInput(sMysteryGiftPhrase, sMysteryGiftPhrase.length) ? 0 : 1;
}

function DidPlayerInputABerryMasterWifePhrase(): number {
  for (let i = 0; i < sBerryMasterWifePhrases.length; i++) {
    if (!IsPhraseDifferentThanPlayerInput(sBerryMasterWifePhrases[i], 2)) return i + 1;
  }
  return 0;
}

// ─── SetMainCallback2 wrap ───────────────────────────────────────────────────
function SetMainCallback2(cb: MainCallback | null): void {
  const rt = getRuntime();
  if (!rt) return;
  rt.SetMainCallback2(cb as CB2Callback);
}

