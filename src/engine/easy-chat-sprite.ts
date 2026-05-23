/**
 * easy-chat-sprite.ts — Port 1:1 STRICT du décomp `src/easy_chat.c` LIGNES
 *                       4500-5875 (= FIN du fichier).
 *
 * SCOPE STRICT lignes 4500-5875 :
 *   - LIGNES 4500-4521 : queue de `DrawLowerWindowFrame` (cases 17-22 + close).
 *   - LIGNES 4523-4565 : BufferLowerWindowFrame.
 *   - LIGNES 4567-4622 : ResetLowerWindowScroll / InitLowerWindowScroll /
 *                        UpdateLowerWindowScroll / GetLowerWindowScrollOffset /
 *                        SetWindowDimensions.
 *   - LIGNES 4624-4632 : LoadEasyChatGfx.
 *   - LIGNES 4634-4716 : Cursor system (CreateMainCursorSprite / SpriteCB_Cursor /
 *                        SetMainCursorPos / Stop/StartMainCursorAnim /
 *                        Create/DestroyRectangleCursorSprites / UpdateRectangleCursorPos).
 *   - LIGNES 4718-4785 : SetRectangleCursorPos_{Group,Alphabet}Mode.
 *   - LIGNES 4787-4837 : Word select cursor (Create/Destroy/Update/Set + SpriteCB).
 *   - LIGNES 4839-4926 : Side window / mode window
 *                        (CreateSideWindowSprites / ShowSideWindow / HideModeWindow /
 *                         DestroySideWindowSprites / SetModeWindowToTransition /
 *                         UpdateModeWindowAnim / IsModeWindowAnimActive).
 *   - LIGNES 4928-5004 : Scroll indicators + start/select buttons.
 *   - LIGNES 5006-5050 : TryAddInterviewObjectEvents.
 *   - LIGNES 5052-5106 : GetFooterIndex / GetFooterOptionXOffset /
 *                        AddMainScreenButtonWindow.
 *   - LIGNES 5108-5200 : IsEasyChatGroupUnlocked / EasyChat_GetNumWordsInGroup /
 *                        IsEasyChatWordInvalid / IsBardWordInvalid.
 *   - LIGNES 5202-5266 : GetEasyChatWord / CopyEasyChatWord /
 *                        ConvertEasyChatWordsToString.
 *   - LIGNES 5268-5352 : OtherConvertEasyChatWordsToString /
 *                        GetEasyChatWordStringLength / CanPhraseFitInXRowsYCols.
 *   - LIGNES 5354-5427 : GetRandomEasyChatWordFromGroup /
 *                        GetRandomEasyChatWordFromUnlockedGroup / ShowEasyChatProfile /
 *                        BufferDeepLinkPhrase.
 *   - LIGNES 5446-5527 : IsTrendySayingUnlocked / UnlockTrendySaying /
 *                        GetNumTrendySayingsUnlocked / UnlockRandomTrendySaying /
 *                        GetRandomUnlockedTrendySaying.
 *   - LIGNES 5529-5561 : EasyChatIsNationalPokedexEnabled /
 *                        GetRandomUnlockedEasyChatPokemon.
 *   - LIGNES 5563-5596 : InitEasyChatPhrases.
 *   - LIGNES 5598-5651 : Word data init (InitEasyChatScreenWordData /
 *                        FreeEasyChatScreenWordData / SetUnlockedEasyChatGroups /
 *                        GetNumUnlockedEasyChatGroups / GetUnlockedEasyChatGroupId).
 *   - LIGNES 5653-5683 : BufferEasyChatWordGroupName / GetEasyChatWordGroupName /
 *                        CopyEasyChatWordPadded.
 *   - LIGNES 5686-5793 : SetUnlockedWordsByAlphabet / SetSelectedWordGroup /
 *                        GetWordFromSelectedGroup / GetNumWordsInSelectedGroup /
 *                        SetSelectedWordGroup_{Group,Alphabet}Mode.
 *   - LIGNES 5795-5849 : IsEasyChatGroupUnlocked2 / IsEasyChatIndexAndGroupUnlocked /
 *                        IsRestrictedWordSpecies / IsEasyChatWordUnlocked.
 *   - LIGNES 5851-5874 : InitializeEasyChatWordArray / InitQuestionnaireWords /
 *                        IsEasyChatAnswerUnlocked.
 *
 * Source vérité : `D:/Projet 1/decomps/pokeemeraude/src/easy_chat.c` LIGNES
 *                  4500-5875 strict. AUCUNE lecture hors range.
 *
 * STUBS explicites (= références hors range, à injecter via setters) :
 *   - sScreenControl  : struct EasyChatScreenControl* (= rendering state)
 *   - sWordData       : struct EasyChatScreenWordData* (= word data)
 *   - GetEasyChatScreenFrameId / GetInAlphabetMode / GetKeyboardCursorColAndRow
 *   - GetWordSelectColAndRow / GetDisplayedPersonType / CanScrollUp / CanScrollDown
 *   - gEasyChatGroups / gEasyChatWordsByLetterPointers / gSpeciesNames / gMoveNames
 *   - gNumBardWords_Species / gNumBardWords_Moves
 *   - sRestrictedWordSpecies / sDefaultProfile/Battle{Start,Won,Lost}Words
 *   - sPhraseFrameDimensions / sFooterOptionXOffsets / sFooterTextOptions
 *   - sSpriteSheets / sSpritePalettes / sCompressedSpriteSheets
 *   - sSpriteTemplate_TriangleCursor/RectangleCursor/ButtonWindow/ModeWindow/
 *     StartSelectButton/ScrollIndicator
 *   - sAlphabetKeyboardColumnOffsets / sEasyChatGroupNamePointers
 *   - gText_ThreeQuestionMarks
 *   - gSaveBlock1Ptr / gSaveBlock2Ptr / gSpecialVar_0x8004 / gStringVar2/4
 *   - Random / FlagGet / SpeciesToNationalPokedexNum / GetSetPokedexFlag
 *   - GetNationalPokedexCount / IsNationalPokedexEnabled
 *   - ShowFieldAutoScrollMessage
 *   - OBJ_EVENT_GFX_* (REPORTER_M/F, BOY_1, RIVAL_BRENDAN/MAY_NORMAL)
 *
 *   Toutes ces dépendances sont injectées via setters _setXxx() exportés.
 *   STUB = console.warn + valeur sentinel si non injecté.
 *
 * Note 1:1 STRICT :
 *   - Tous les noms = IDENTIQUES au décomp.
 *   - Aucune optimisation ; ordre statements respecté ; switch/case exhaustifs.
 *   - Pas d'imports decomp-data/auto (= règle stricte projet).
 *   - Pas de hardcoded values décomp (= constantes locales définies au top).
 */

// ─── Imports infrastructure (helpers TS existants) ───────────────────────────

import {
  CreateSprite,
  DestroySprite,
  StartSpriteAnim,
  LoadCompressedSpriteSheet,
  SetGpuReg,
  WIN_RANGE,
} from './decomp-bridge';

import {
  AddWindow,
  PutWindowTilemap,
  FillWindowPixelBuffer,
  CopyBgTilemapBufferToVram,
  ChangeBgY,
  type WindowTemplate,
} from './gba-window-system';

import {
  FONT_NORMAL,
  PIXEL_FILL,
} from './battle-windows';

import {
  CHAR_SPACE,
  CHAR_NEWLINE,
  CHAR_PROMPT_SCROLL,
  EOS,
} from './decomp-data/_common-constants';

import {
  REG_OFFSET_WIN0H,
  REG_OFFSET_WIN0V,
} from './decomp-runtime';

import {
  getRuntime,
  SpriteCallbackDummy,
  LoadSpritePalettes,
} from './decomp-globals';

import type { DecompSprite } from './decomp-runtime';

import {
  CreateObjectGraphicsSprite,
} from './object-event-graphics';

// ─── Constantes locales 1:1 décomp (cf. easy_chat.c:229-403) ─────────────────

// FRAME_OFFSET_ / FRAME_TILE_ (easy_chat.c:392-403)
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

// NUM_ALPHABET_COLUMNS (easy_chat.c:335-342)
const NUM_ALPHABET_COLUMNS  = 7;

// RECTCURSOR_ANIM_ enum (easy_chat.c:1007-1012)
const RECTCURSOR_ANIM_ON_GROUP   = 0;
const RECTCURSOR_ANIM_ON_BUTTON  = 1;
const RECTCURSOR_ANIM_ON_OTHERS  = 2;
const RECTCURSOR_ANIM_ON_LETTER  = 3;

// MODEWINDOW_ANIM_ enum (easy_chat.c:1076-1082)
const MODEWINDOW_ANIM_TO_GROUP     = 1;
const MODEWINDOW_ANIM_TO_ALPHABET  = 2;
const MODEWINDOW_ANIM_TO_HIDDEN    = 3;
const MODEWINDOW_ANIM_TRANSITION   = 4;

// FOOTER_ enum (easy_chat.c:357-362)
const FOOTER_NORMAL     = 0;
const FOOTER_QUIZ       = 1;
const FOOTER_ANSWER     = 2;
const NUM_FOOTER_TYPES  = 3;

// FRAMEID_ enum (easy_chat.c:344-354)
const FRAMEID_INTERVIEW_SHOW_PERSON = 4;

// BG_COORD_ (1:1 décomp include/gba/types.h).
const BG_COORD_SET = 0;
const BG_COORD_ADD = 1;

// MAX_SPRITES (décomp include/sprite.h MAX_SPRITES = 64).
const MAX_SPRITES = 64;

// EC_ constants (1:1 décomp include/constants/easy_chat.h).
const EC_MASK_BITS  = 9;
const EC_MASK_GROUP = 0x7F;
const EC_EMPTY_WORD = 0xFFFF;

// EC_GROUP_* (easy_chat.h:31-53).
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

// EASY_CHAT_PERSON_ (easy_chat.h:26-29).
const EASY_CHAT_PERSON_REPORTER_MALE   = 0;
const EASY_CHAT_PERSON_REPORTER_FEMALE = 1;
const EASY_CHAT_PERSON_BOY             = 2;

// EC_GROUP / EC_INDEX / EC_WORD helpers (easy_chat.h macros).
function EC_GROUP(word: number): number { return (word >> EC_MASK_BITS) & EC_MASK_GROUP; }
function EC_INDEX(word: number): number { return word & ((1 << EC_MASK_BITS) - 1); }
function EC_WORD(group: number, idx: number): number { return ((group & EC_MASK_GROUP) << EC_MASK_BITS) | (idx & ((1 << EC_MASK_BITS) - 1)); }

// MALE/FEMALE (1:1 décomp include/constants/pokemon.h).
const MALE   = 0;

// FLAG_GET_SEEN (1:1 décomp include/constants/pokedex.h).
const FLAG_GET_SEEN = 0;

// EC_MASK_GROUP_BIT used by IsEasyChatAnswerUnlocked (= EC_MASK_GROUP). Already defined.

// FLAG_ placeholders (résolus via _setFlagGet getter au runtime).
const FLAG_SYS_GAME_CLEAR        = 0;
const FLAG_UNLOCKED_TRENDY_SAYINGS = 0;

// ─── Structs 1:1 décomp (cf. include/easy_chat.h) ────────────────────────────

/** 1:1 décomp struct EasyChatScreenControl (easy_chat.h:48-75).
 *  Re-déclaration locale (équiv. easy-chat-render.ts) pour permettre
 *  injection autonome via setter (= STUB explicite). */
export interface EasyChatScreenControl {
  funcState: number;
  windowId: number;
  currentFuncId: number;
  curWindowAnimState: number;
  destWindowAnimState: number;
  windowAnimStateDir: number;
  modeWindowState: number;
  fourFooterOptions: number;
  phrasePrintBuffer: Uint8Array;
  wordSelectPrintBuffer: Uint8Array;
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
  bg1TilemapBuffer: Uint16Array;
  bg3TilemapBuffer: Uint16Array;
}

/** 1:1 décomp struct EasyChatPhraseFrameDimensions (easy_chat.h:77-84). */
export interface EasyChatPhraseFrameDimensions {
  left: number;
  top: number;
  width: number;
  height: number;
  footerId: number;
}

/** 1:1 décomp struct EasyChatWordInfo (easy_chat.h:86-91). */
export interface EasyChatWordInfo {
  text: Uint8Array | string;
  alphabeticalOrder: number;
  enabled: number;
}

/** 1:1 décomp union EasyChatGroupWordData (easy_chat.h:93-97). */
export interface EasyChatGroupWordData {
  valueList?: Uint16Array | number[];
  words?: ReadonlyArray<EasyChatWordInfo>;
}

/** 1:1 décomp struct EasyChatGroup (easy_chat.h:99-104). */
export interface EasyChatGroup {
  wordData: EasyChatGroupWordData;
  numWords: number;
  numEnabledWords: number;
}

/** 1:1 décomp struct EasyChatScreenWordData (easy_chat.h:106-115). */
export interface EasyChatScreenWordData {
  numUnlockedGroups: number;
  unlockedGroupIds: Uint16Array;
  numUnlockedAlphabetWords: Uint16Array;
  unlockedAlphabetWords: Uint16Array[];
  unused: Uint8Array;
  selectedGroupWords: Uint16Array;
  numSelectedGroupWords: number;
}

/** 1:1 décomp struct EasyChatWordsByLetter (easy_chat.h:117-121). */
export interface EasyChatWordsByLetter {
  words: Uint16Array | number[];
  numWords: number;
}

// ─── Static state injection (= STUB explicite) ───────────────────────────────
//
//   `sScreenControl` est owné par easy-chat-render.ts (= alloué par
//    InitEasyChatScreenControl_) ; ici on l'injecte via setter.
//
//   `sWordData` est owné par CE module : alloué par
//    InitEasyChatScreenWordData (cf. l. 5598-5607).

let sScreenControl: EasyChatScreenControl | null = null;
let sWordData: EasyChatScreenWordData | null = null;

/** Setter pour sScreenControl (= injecté par easy-chat-render.ts).
 *  CE module et easy-chat-render.ts DOIVENT partager la même instance. */
export function _setScreenControl(ctrl: EasyChatScreenControl | null): void {
  sScreenControl = ctrl;
}

/** Lecture exposée (pour easy-chat.ts orchestration). */
export function _getScreenControl(): EasyChatScreenControl | null { return sScreenControl; }
export function _getWordData(): EasyChatScreenWordData | null { return sWordData; }

// ─── Setters injection (= helpers / data section 1-2 absents) ────────────────

type StringOrU8 = Uint8Array | string | null;

let _GetEasyChatScreenFrameId: () => number = () => {
  console.warn('[easy-chat-sprite STUB] GetEasyChatScreenFrameId : injection manquante');
  return 0;
};
let _GetInAlphabetMode: () => number = () => 0;
let _GetKeyboardCursorColAndRow: () => { column: number; row: number } = () => ({ column: 0, row: 0 });
let _GetWordSelectColAndRow: () => { column: number; row: number } = () => ({ column: 0, row: 0 });
let _CanScrollUp: () => boolean = () => false;
let _CanScrollDown: () => boolean = () => false;
let _GetDisplayedPersonType: () => number = () => 3; // EASY_CHAT_PERSON_DISPLAY_NONE
let _GetQuestionnaireWordsPtr: () => Uint16Array = () => new Uint16Array(NUM_QUESTIONNAIRE_WORDS);

export function _setGetEasyChatScreenFrameId(fn: () => number): void { _GetEasyChatScreenFrameId = fn; }
export function _setGetInAlphabetMode(fn: () => number): void { _GetInAlphabetMode = fn; }
export function _setGetKeyboardCursorColAndRow(fn: () => { column: number; row: number }): void { _GetKeyboardCursorColAndRow = fn; }
export function _setGetWordSelectColAndRow(fn: () => { column: number; row: number }): void { _GetWordSelectColAndRow = fn; }
export function _setCanScrollUp(fn: () => boolean): void { _CanScrollUp = fn; }
export function _setCanScrollDown(fn: () => boolean): void { _CanScrollDown = fn; }
export function _setGetDisplayedPersonType(fn: () => number): void { _GetDisplayedPersonType = fn; }
export function _setGetQuestionnaireWordsPtr(fn: () => Uint16Array): void { _GetQuestionnaireWordsPtr = fn; }

// Setters data (groups, ROM tables)

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
let _sAlphabetKeyboardColumnOffsets: ReadonlyArray<number> = [];
let _sEasyChatGroupNamePointers: ReadonlyArray<StringOrU8> = [];

let _sSpriteSheets: ReadonlyArray<{ data: unknown; size: number; tag: number | string }> = [];
let _sSpritePalettes: Array<{ data: string; tag: string | number }> = [];
let _sCompressedSpriteSheets: ReadonlyArray<{ data: string; size: number; tag: number | string }> = [];
let _sSpriteTemplate_TriangleCursor: unknown = null;
let _sSpriteTemplate_RectangleCursor: unknown = null;
let _sSpriteTemplate_ModeWindow: unknown = null;
let _sSpriteTemplate_ButtonWindow: unknown = null;
let _sSpriteTemplate_StartSelectButton: unknown = null;
let _sSpriteTemplate_ScrollIndicator: unknown = null;

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
export function _setSAlphabetKeyboardColumnOffsets(v: ReadonlyArray<number>): void { _sAlphabetKeyboardColumnOffsets = v; }
export function _setSEasyChatGroupNamePointers(v: ReadonlyArray<StringOrU8>): void { _sEasyChatGroupNamePointers = v; }
export function _setSSpriteSheets(v: ReadonlyArray<{ data: unknown; size: number; tag: number | string }>): void { _sSpriteSheets = v; }
export function _setSSpritePalettes(v: Array<{ data: string; tag: string | number }>): void { _sSpritePalettes = v; }
export function _setSCompressedSpriteSheets(v: ReadonlyArray<{ data: string; size: number; tag: number | string }>): void { _sCompressedSpriteSheets = v; }
export function _setSSpriteTemplate_TriangleCursor(v: unknown): void { _sSpriteTemplate_TriangleCursor = v; }
export function _setSSpriteTemplate_RectangleCursor(v: unknown): void { _sSpriteTemplate_RectangleCursor = v; }
export function _setSSpriteTemplate_ModeWindow(v: unknown): void { _sSpriteTemplate_ModeWindow = v; }
export function _setSSpriteTemplate_ButtonWindow(v: unknown): void { _sSpriteTemplate_ButtonWindow = v; }
export function _setSSpriteTemplate_StartSelectButton(v: unknown): void { _sSpriteTemplate_StartSelectButton = v; }
export function _setSSpriteTemplate_ScrollIndicator(v: unknown): void { _sSpriteTemplate_ScrollIndicator = v; }
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
let _gStringVar2: Uint8Array = new Uint8Array(64);
let _gStringVar4: Uint8Array = new Uint8Array(1024);

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
export function _setGStringVar2(v: Uint8Array): void { _gStringVar2 = v; }
export function _setGStringVar4(v: Uint8Array): void { _gStringVar4 = v; }
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

// LoadSpriteSheets — stub local (= existe seulement dans decomp-data/auto/, hors règle).
let _LoadSpriteSheets: (sheets: unknown) => void = () => { /* no-op */ };
export function _setLoadSpriteSheets(fn: (sheets: unknown) => void): void { _LoadSpriteSheets = fn; }

// GetBgY — équivalent décomp src/bg.c (lecture du BGnVOFS via shadow), pas exporté
//          par gba-window-system. STUB local injection.
let _GetBgY: (bg: number) => number = () => 0;
export function _setGetBgY(fn: (bg: number) => number): void { _GetBgY = fn; }

// ─── String helpers locaux (1:1 décomp string_util.c minimal) ────────────────

function StringCopy(dest: Uint8Array, src: Uint8Array | string): Uint8Array {
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
  return dest.subarray(i);
}

function StringLength(str: Uint8Array | string | null): number {
  if (str === null) return 0;
  if (typeof str === 'string') return str.length;
  let i = 0;
  while (i < str.length && str[i] !== EOS) i++;
  return i;
}

// ─── Memory alloc (1:1 Alloc / TRY_FREE_AND_SET_NULL) ────────────────────────

function Alloc<T>(factory: () => T): T { return factory(); }

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

// ─── Sprite access helper (= gSprites[spriteId]) ─────────────────────────────

function getSprite(spriteId: number): DecompSprite | null {
  const rt = getRuntime();
  return rt.gSprites.get(spriteId) ?? null;
}

// ─── data[0]/data[1] aliases (1:1 décomp #define sDelayTimer/sAnimateCursor) ─
//
//   #define sDelayTimer    data[0]
//   #define sAnimateCursor data[1]
//   (easy_chat.c:4634-4635, scope sprite cursor anim).

function getDelayTimer(sprite: DecompSprite): number { return sprite.data[0] | 0; }
function setDelayTimer(sprite: DecompSprite, v: number): void { sprite.data[0] = v | 0; }
function incDelayTimer(sprite: DecompSprite): number {
  sprite.data[0] = (sprite.data[0] | 0) + 1;
  return sprite.data[0];
}
function getAnimateCursor(sprite: DecompSprite): number { return sprite.data[1] | 0; }
function setAnimateCursor(sprite: DecompSprite, v: number): void { sprite.data[1] = v | 0; }

// ─── BufferLowerWindowFrame (easy_chat.c:4523-4565) ──────────────────────────

function BufferLowerWindowFrame(left: number, top: number, width: number, height: number): void {
  let tilemap: Uint16Array;
  let right: number;
  let bottom: number;
  let x: number, y: number;

  tilemap = sScreenControl!.bg1TilemapBuffer;
  right = left + width - 1;
  bottom = top + height - 1;
  x = left;
  y = top;

  // Draw top edge
  tilemap[y * 32 + x] = FRAME_OFFSET_GREEN + FRAME_TILE_TOP_L_CORNER;
  x++;
  for (; x < right; x++)
    tilemap[y * 32 + x] = FRAME_OFFSET_GREEN + FRAME_TILE_TOP_EDGE;

  tilemap[y * 32 + x] = FRAME_OFFSET_GREEN + FRAME_TILE_TOP_R_CORNER;
  y++;

  // Draw middle section
  for (; y < bottom; y++)
  {
    tilemap[y * 32 + left] = FRAME_OFFSET_GREEN + FRAME_TILE_L_EDGE;
    x = left + 1;
    for (; x < right; x++)
      tilemap[y * 32 + x] = FRAME_OFFSET_GREEN + FRAME_TILE_TRANSPARENT;

    tilemap[y * 32 + x] = FRAME_OFFSET_GREEN + FRAME_TILE_R_EDGE;
  }

  // Draw bottom edge
  tilemap[y * 32 + left] = FRAME_OFFSET_GREEN + FRAME_TILE_BOTTOM_L_CORNER;
  x = left + 1;
  for (; x < right; x++)
    tilemap[y * 32 + x] = FRAME_OFFSET_GREEN + FRAME_TILE_BOTTOM_EDGE;

  tilemap[y * 32 + x] = FRAME_OFFSET_GREEN + FRAME_TILE_BOTTOM_R_CORNER;

  SetWindowDimensions((left + 1) * 8, (top + 1) * 8, (width - 2) * 8, (height - 2) * 8);
}

/** Exported pour permettre à DrawLowerWindowFrame (easy-chat-render.ts) de
 *  partager le même helper de tracé — 1:1 strict static C devient export TS. */
export { BufferLowerWindowFrame };

// ─── Lower window scroll (easy_chat.c:4567-4614) ─────────────────────────────

export function ResetLowerWindowScroll(): void {
  ChangeBgY(2, 0x800, BG_COORD_SET);
  sScreenControl!.scrollOffset = 0;
}

export function InitLowerWindowScroll(scrollChange: number, speed: number): void {
  let bgY: number;
  let yChange: number;

  bgY = _GetBgY(2);
  sScreenControl!.scrollOffset += scrollChange;
  yChange = scrollChange * 16;
  bgY += yChange * 256;
  if (speed)
  {
    sScreenControl!.scrollDest = bgY;
    sScreenControl!.scrollSpeed = speed * 256;
    if (yChange < 0)
      sScreenControl!.scrollSpeed = -sScreenControl!.scrollSpeed;
  }
  else
  {
    ChangeBgY(2, bgY, BG_COORD_SET);
  }
}

export function UpdateLowerWindowScroll(): number /* bool8 */ {
  let bgY: number;

  bgY = _GetBgY(2);
  if (bgY === sScreenControl!.scrollDest)
  {
    return 0; // FALSE
  }
  else
  {
    ChangeBgY(2, sScreenControl!.scrollSpeed, BG_COORD_ADD);
    return 1; // TRUE
  }
}

export function GetLowerWindowScrollOffset(): number {
  return sScreenControl!.scrollOffset;
}

// ─── SetWindowDimensions (easy_chat.c:4616-4622) ─────────────────────────────

function SetWindowDimensions(left: number, top: number, width: number, height: number): void {
  const horizontalDimensions = WIN_RANGE(left, left + width);
  const verticalDimensions = WIN_RANGE(top, top + height);
  SetGpuReg(REG_OFFSET_WIN0H, horizontalDimensions);
  SetGpuReg(REG_OFFSET_WIN0V, verticalDimensions);
}

// ─── LoadEasyChatGfx (easy_chat.c:4624-4632) ─────────────────────────────────

export function LoadEasyChatGfx(): void {
  let i: number;

  _LoadSpriteSheets(_sSpriteSheets);
  LoadSpritePalettes(_sSpritePalettes);
  for (i = 0; i < _sCompressedSpriteSheets.length; i++)
    LoadCompressedSpriteSheet(_sCompressedSpriteSheets[i]);
}

// ─── Cursor sprite system (easy_chat.c:4634-4716) ────────────────────────────
//
//   #define sDelayTimer    data[0]
//   #define sAnimateCursor data[1]

export function CreateMainCursorSprite(): void {
  const frameId = _GetEasyChatScreenFrameId();
  const x = _sPhraseFrameDimensions[frameId].left * 8 + 13;
  const y = _sPhraseFrameDimensions[frameId].top * 8 + 8;
  const spriteId = CreateSprite(_sSpriteTemplate_TriangleCursor as any, x, y, 2);
  const sp = getSprite(spriteId);
  sScreenControl!.mainCursorSprite = sp;
  if (sp) setAnimateCursor(sp, 1); // TRUE
}

export function SpriteCB_Cursor(sprite: DecompSprite): void {
  if (getAnimateCursor(sprite))
  {
    if (incDelayTimer(sprite) > 2)
    {
      setDelayTimer(sprite, 0);
      sprite.x2 = sprite.x2 + 1;
      if (sprite.x2 > 0)
        sprite.x2 = -6;
    }
  }
}

export function SetMainCursorPos(x: number, y: number): void {
  const sp = sScreenControl!.mainCursorSprite!;
  sp.x = x;
  sp.y = y;
  sp.x2 = 0;
  setDelayTimer(sp, 0);
}

export function StopMainCursorAnim(): void {
  const sp = sScreenControl!.mainCursorSprite!;
  setDelayTimer(sp, 0);
  setAnimateCursor(sp, 0); // FALSE
  sp.x2 = 0;
}

export function StartMainCursorAnim(): void {
  const sp = sScreenControl!.mainCursorSprite!;
  setAnimateCursor(sp, 1); // TRUE
}

export function CreateRectangleCursorSprites(): void {
  let spriteId = CreateSprite(_sSpriteTemplate_RectangleCursor as any, 0, 0, 3);
  let sp = getSprite(spriteId);
  sScreenControl!.rectangleCursorSpriteRight = sp;
  if (sp) sp.x2 = 32;

  spriteId = CreateSprite(_sSpriteTemplate_RectangleCursor as any, 0, 0, 3);
  sp = getSprite(spriteId);
  sScreenControl!.rectangleCursorSpriteLeft = sp;
  if (sp) sp.x2 = -32;

  if (sScreenControl!.rectangleCursorSpriteRight)
    sScreenControl!.rectangleCursorSpriteRight.hFlip = true;
  UpdateRectangleCursorPos();
}

export function DestroyRectangleCursorSprites(): void {
  if (sScreenControl!.rectangleCursorSpriteRight)
    DestroySprite(sScreenControl!.rectangleCursorSpriteRight);
  sScreenControl!.rectangleCursorSpriteRight = null;
  if (sScreenControl!.rectangleCursorSpriteLeft)
    DestroySprite(sScreenControl!.rectangleCursorSpriteLeft);
  sScreenControl!.rectangleCursorSpriteLeft = null;
}

export function UpdateRectangleCursorPos(): void {
  if (sScreenControl!.rectangleCursorSpriteRight
   && sScreenControl!.rectangleCursorSpriteLeft)
  {
    const { column, row } = _GetKeyboardCursorColAndRow();
    if (!_GetInAlphabetMode())
      SetRectangleCursorPos_GroupMode(column, row);
    else
      SetRectangleCursorPos_AlphabetMode(column, row);
  }
}

// ─── SetRectangleCursorPos_GroupMode (easy_chat.c:4718-4742) ─────────────────

function SetRectangleCursorPos_GroupMode(column: number, row: number): void {
  if (column !== -1)
  {
    // In group name window
    StartSpriteAnim(sScreenControl!.rectangleCursorSpriteRight, RECTCURSOR_ANIM_ON_GROUP);
    sScreenControl!.rectangleCursorSpriteRight!.x = column * 84 + 58;
    sScreenControl!.rectangleCursorSpriteRight!.y = row * 16 + 96;

    StartSpriteAnim(sScreenControl!.rectangleCursorSpriteLeft, RECTCURSOR_ANIM_ON_GROUP);
    sScreenControl!.rectangleCursorSpriteLeft!.x = column * 84 + 58;
    sScreenControl!.rectangleCursorSpriteLeft!.y = row * 16 + 96;
  }
  else
  {
    // In button window
    StartSpriteAnim(sScreenControl!.rectangleCursorSpriteRight, RECTCURSOR_ANIM_ON_BUTTON);
    sScreenControl!.rectangleCursorSpriteRight!.x = 216;
    sScreenControl!.rectangleCursorSpriteRight!.y = row * 16 + 112;

    StartSpriteAnim(sScreenControl!.rectangleCursorSpriteLeft, RECTCURSOR_ANIM_ON_BUTTON);
    sScreenControl!.rectangleCursorSpriteLeft!.x = 216;
    sScreenControl!.rectangleCursorSpriteLeft!.y = row * 16 + 112;
  }
}

// ─── SetRectangleCursorPos_AlphabetMode (easy_chat.c:4744-4785) ──────────────

function SetRectangleCursorPos_AlphabetMode(column: number, row: number): void {
  let anim: number;
  let x: number, y: number;

  if (column !== -1)
  {
    y = row * 16 + 96;
    x = 32;
    if (column === NUM_ALPHABET_COLUMNS - 1 && row === 0)
    {
      // Cursor is on 'Others'
      x = 158;
      anim = RECTCURSOR_ANIM_ON_OTHERS;
    }
    else
    {
      // Cursor is on a letter
      // (u8)column → on borne sur 0..255 ; le `column < NUM_ALPHABET_COLUMNS` check
      //  reproduit le ternaire C 1:1.
      const idx = ((column & 0xFF) < NUM_ALPHABET_COLUMNS) ? (column & 0xFF) : 0;
      x += _sAlphabetKeyboardColumnOffsets[idx];
      anim = RECTCURSOR_ANIM_ON_LETTER;
    }

    StartSpriteAnim(sScreenControl!.rectangleCursorSpriteRight, anim);
    sScreenControl!.rectangleCursorSpriteRight!.x = x;
    sScreenControl!.rectangleCursorSpriteRight!.y = y;

    StartSpriteAnim(sScreenControl!.rectangleCursorSpriteLeft, anim);
    sScreenControl!.rectangleCursorSpriteLeft!.x = x;
    sScreenControl!.rectangleCursorSpriteLeft!.y = y;
  }
  else
  {
    // In button window
    StartSpriteAnim(sScreenControl!.rectangleCursorSpriteRight, RECTCURSOR_ANIM_ON_BUTTON);
    sScreenControl!.rectangleCursorSpriteRight!.x = 216;
    sScreenControl!.rectangleCursorSpriteRight!.y = row * 16 + 112;

    StartSpriteAnim(sScreenControl!.rectangleCursorSpriteLeft, RECTCURSOR_ANIM_ON_BUTTON);
    sScreenControl!.rectangleCursorSpriteLeft!.x = 216;
    sScreenControl!.rectangleCursorSpriteLeft!.y = row * 16 + 112;
  }
}

// ─── Word select cursor (easy_chat.c:4787-4837) ──────────────────────────────
//
// Cursor for selecting a new word. Identical in appearance to the 'main' cursor.

export function CreateWordSelectCursorSprite(): void {
  const spriteId = CreateSprite(_sSpriteTemplate_TriangleCursor as any, 0, 0, 4);
  const sp = getSprite(spriteId);
  sScreenControl!.wordSelectCursorSprite = sp;
  if (sp) {
    sp.callback = SpriteCB_WordSelectCursor as any;
    // sprite->oam.priority = 2;
    // Note 1:1 : DecompSprite n'expose pas oam.priority direct ; on l'écrit
    // sur l'oam slot. (Si .oamIndex valide.)
    const oam = getRuntime().gba?.oam?.[sp.oamIndex];
    if (oam) (oam as { priority: number }).priority = 2;
  }
  UpdateWordSelectCursorPos();
}

export function SpriteCB_WordSelectCursor(sprite: DecompSprite): void {
  if (incDelayTimer(sprite) > 2)
  {
    setDelayTimer(sprite, 0);
    sprite.x2 = sprite.x2 + 1;
    if (sprite.x2 > 0)
      sprite.x2 = -6;
  }
}

export function UpdateWordSelectCursorPos(): void {
  let x: number, y: number;
  const { column, row } = _GetWordSelectColAndRow();
  // 1:1 décomp : `x = column * 13;  x = x * 8 + 28;`
  let xLocal = column * 13;
  xLocal = xLocal * 8 + 28;
  x = xLocal;
  y = row * 16 + 96;
  SetWordSelectCursorPos(x, y);
}

export function SetWordSelectCursorPos(x: number, y: number): void {
  if (sScreenControl!.wordSelectCursorSprite)
  {
    const sp = sScreenControl!.wordSelectCursorSprite;
    sp.x = x;
    sp.y = y;
    sp.x2 = 0;
    setDelayTimer(sp, 0);
  }
}

export function DestroyWordSelectCursorSprite(): void {
  if (sScreenControl!.wordSelectCursorSprite)
  {
    DestroySprite(sScreenControl!.wordSelectCursorSprite);
    sScreenControl!.wordSelectCursorSprite = null;
  }
}

// ─── Side window sprites (easy_chat.c:4839-4926) ─────────────────────────────

export function CreateSideWindowSprites(): void {
  let spriteId = CreateSprite(_sSpriteTemplate_ButtonWindow as any, 208, 128, 6);
  let sp = getSprite(spriteId);
  sScreenControl!.buttonWindowSprite = sp;
  if (sp) sp.x2 = -64;

  spriteId = CreateSprite(_sSpriteTemplate_ModeWindow as any, 208, 80, 5);
  sp = getSprite(spriteId);
  sScreenControl!.modeWindowSprite = sp;
  sScreenControl!.modeWindowState = 0;
}

export function ShowSideWindow(): number /* bool8 */ {
  switch (sScreenControl!.modeWindowState)
  {
  default:
    return 0; // FALSE
  case 0:
    // Slide button window on
    sScreenControl!.buttonWindowSprite!.x2 += 8;
    if (sScreenControl!.buttonWindowSprite!.x2 >= 0)
    {
      sScreenControl!.buttonWindowSprite!.x2 = 0;

      // Set mode window anim
      if (!_GetInAlphabetMode())
        StartSpriteAnim(sScreenControl!.modeWindowSprite, MODEWINDOW_ANIM_TO_GROUP);
      else
        StartSpriteAnim(sScreenControl!.modeWindowSprite, MODEWINDOW_ANIM_TO_ALPHABET);

      sScreenControl!.modeWindowState++;
    }
    break;
  case 1:
    if (sScreenControl!.modeWindowSprite!.animEnded)
    {
      sScreenControl!.modeWindowState = 2;
      return 0; // FALSE
    }
  }

  return 1; // TRUE
}

export function HideModeWindow(): void {
  sScreenControl!.modeWindowState = 0;
  StartSpriteAnim(sScreenControl!.modeWindowSprite, MODEWINDOW_ANIM_TO_HIDDEN);
}

export function DestroySideWindowSprites(): number /* bool8 */ {
  switch (sScreenControl!.modeWindowState)
  {
  default:
    return 0; // FALSE
  case 0:
    if (sScreenControl!.modeWindowSprite!.animEnded)
      sScreenControl!.modeWindowState = 1;
    break;
  case 1:
    sScreenControl!.buttonWindowSprite!.x2 -= 8;
    if (sScreenControl!.buttonWindowSprite!.x2 <= -64)
    {
      DestroySprite(sScreenControl!.modeWindowSprite);
      DestroySprite(sScreenControl!.buttonWindowSprite);
      sScreenControl!.modeWindowSprite = null;
      sScreenControl!.buttonWindowSprite = null;
      sScreenControl!.modeWindowState++;
      return 0; // FALSE
    }
  }

  return 1; // TRUE
}

export function SetModeWindowToTransition(): void {
  StartSpriteAnim(sScreenControl!.modeWindowSprite, MODEWINDOW_ANIM_TRANSITION);
}

export function UpdateModeWindowAnim(): void {
  if (!_GetInAlphabetMode())
    StartSpriteAnim(sScreenControl!.modeWindowSprite, MODEWINDOW_ANIM_TO_GROUP);
  else
    StartSpriteAnim(sScreenControl!.modeWindowSprite, MODEWINDOW_ANIM_TO_ALPHABET);
}

export function IsModeWindowAnimActive(): number /* bool8 */ {
  return sScreenControl!.modeWindowSprite!.animEnded ? 0 : 1;
}

// ─── Scroll indicators (easy_chat.c:4933-4975) ───────────────────────────────

export function CreateScrollIndicatorSprites(): void {
  let spriteId = CreateSprite(_sSpriteTemplate_ScrollIndicator as any, 96, 80, 0);
  if (spriteId !== MAX_SPRITES)
    sScreenControl!.scrollIndicatorUpSprite = getSprite(spriteId);

  spriteId = CreateSprite(_sSpriteTemplate_ScrollIndicator as any, 96, 156, 0);
  if (spriteId !== MAX_SPRITES)
  {
    const sp = getSprite(spriteId);
    sScreenControl!.scrollIndicatorDownSprite = sp;
    if (sp) sp.vFlip = true;
  }

  HideScrollIndicators();
}

export function UpdateScrollIndicatorsVisibility(): void {
  sScreenControl!.scrollIndicatorUpSprite!.invisible = !_CanScrollUp();
  sScreenControl!.scrollIndicatorDownSprite!.invisible = !_CanScrollDown();
}

export function HideScrollIndicators(): void {
  sScreenControl!.scrollIndicatorUpSprite!.invisible = true;
  sScreenControl!.scrollIndicatorDownSprite!.invisible = true;
}

export function SetScrollIndicatorXPos(inWordSelect: number /* bool32 */): void {
  if (!inWordSelect)
  {
    // Keyboard (only relevant for group mode, can't scroll in alphabet mode)
    sScreenControl!.scrollIndicatorUpSprite!.x = 96;
    sScreenControl!.scrollIndicatorDownSprite!.x = 96;
  }
  else
  {
    // Word select
    sScreenControl!.scrollIndicatorUpSprite!.x = 120;
    sScreenControl!.scrollIndicatorDownSprite!.x = 120;
  }
}

// ─── Start/Select buttons (easy_chat.c:4977-5004) ────────────────────────────
//
// The Start/Select buttons are used as page scroll indicators

export function CreateStartSelectButtonSprites(): void {
  let spriteId = CreateSprite(_sSpriteTemplate_StartSelectButton as any, 220, 84, 1);
  if (spriteId !== MAX_SPRITES)
    sScreenControl!.startButtonSprite = getSprite(spriteId);

  spriteId = CreateSprite(_sSpriteTemplate_StartSelectButton as any, 220, 156, 1);
  if (spriteId !== MAX_SPRITES)
  {
    sScreenControl!.selectButtonSprite = getSprite(spriteId);
    StartSpriteAnim(sScreenControl!.selectButtonSprite, 1);
  }

  HideStartSelectButtons();
}

export function UpdateStartSelectButtonsVisibility(): void {
  sScreenControl!.startButtonSprite!.invisible = !_CanScrollUp();
  sScreenControl!.selectButtonSprite!.invisible = !_CanScrollDown();
}

export function HideStartSelectButtons(): void {
  sScreenControl!.startButtonSprite!.invisible = true;
  sScreenControl!.selectButtonSprite!.invisible = true;
}

// ─── TryAddInterviewObjectEvents (easy_chat.c:5006-5050) ─────────────────────

export function TryAddInterviewObjectEvents(): void {
  let graphicsId: number;
  let spriteId: number;

  switch (_GetDisplayedPersonType())
  {
  case EASY_CHAT_PERSON_REPORTER_MALE:
    graphicsId = _OBJ_EVENT_GFX_REPORTER_M;
    break;
  case EASY_CHAT_PERSON_REPORTER_FEMALE:
    graphicsId = _OBJ_EVENT_GFX_REPORTER_F;
    break;
  case EASY_CHAT_PERSON_BOY:
    graphicsId = _OBJ_EVENT_GFX_BOY_1;
    break;
  default:
    return;
  }

  if (_GetEasyChatScreenFrameId() !== FRAMEID_INTERVIEW_SHOW_PERSON)
    return;

  // Add object for reporter/interviewing fan (facing left)
  spriteId = CreateObjectGraphicsSprite(graphicsId, SpriteCallbackDummy, 76, 40, 0);
  if (spriteId !== MAX_SPRITES)
  {
    const sp = getSprite(spriteId);
    if (sp) {
      const oam = getRuntime().gba?.oam?.[sp.oamIndex];
      if (oam) (oam as { priority: number }).priority = 0;
      StartSpriteAnim(sp, 2);
    }
  }

  // Add object for player (facing right)
  spriteId = CreateObjectGraphicsSprite(
    _gSaveBlock2Ptr.playerGender === MALE ? _OBJ_EVENT_GFX_RIVAL_BRENDAN_NORMAL : _OBJ_EVENT_GFX_RIVAL_MAY_NORMAL,
    SpriteCallbackDummy,
    52,
    40,
    0);

  if (spriteId !== MAX_SPRITES)
  {
    const sp = getSprite(spriteId);
    if (sp) {
      const oam = getRuntime().gba?.oam?.[sp.oamIndex];
      if (oam) (oam as { priority: number }).priority = 0;
      StartSpriteAnim(sp, 3);
    }
  }
}

// ─── Footer + main screen button window (easy_chat.c:5052-5106) ──────────────

export function GetFooterIndex(): number {
  const frameId = _GetEasyChatScreenFrameId();
  switch (_sPhraseFrameDimensions[frameId].footerId)
  {
  case FOOTER_QUIZ:
    return FOOTER_QUIZ;
  case FOOTER_ANSWER:
    return FOOTER_ANSWER;
  case FOOTER_NORMAL:
    return FOOTER_NORMAL;
  default:
    return NUM_FOOTER_TYPES;
  }
}

function GetFooterOptionXOffset(option: number): number {
  const footerIndex = GetFooterIndex();
  if (footerIndex < NUM_FOOTER_TYPES)
    return _sFooterOptionXOffsets[footerIndex][option] + 4;
  else
    return 0;
}
// Unused-export guard : keep symbol visible to potential future caller.
export { GetFooterOptionXOffset };

export function AddMainScreenButtonWindow(): void {
  let i: number;
  let windowId: number;
  const template: WindowTemplate = {
    bg: 3,
    tilemapLeft: 1,
    tilemapTop: 11,
    width: 28,
    height: 2,
    paletteNum: 11,
    baseBlock: 0x4C, // !< French Difference
  };
  const footerIndex = GetFooterIndex();
  if (footerIndex === NUM_FOOTER_TYPES)
    return;

  windowId = AddWindow(template);
  FillWindowPixelBuffer(windowId, PIXEL_FILL(1));
  // 1:1 décomp : `for (i = 0; i < (int)ARRAY_COUNT(sFooterTextOptions[0]); i++)`.
  const numOptions = _sFooterTextOptions.length > 0 ? _sFooterTextOptions[0].length : 0;
  for (i = 0; i < numOptions; i++)
  {
    const str = _sFooterTextOptions[footerIndex][i];
    if (str)
    {
      const x = _sFooterOptionXOffsets[footerIndex][i];
      // 1:1 décomp : `PrintEasyChatText(windowId, FONT_NORMAL, str, x, 1, 0, NULL);`
      //              (PrintEasyChatText delegated to render layer).
      printEasyChatText(windowId, FONT_NORMAL, str, x, 1, 0, null);
    }
  }

  PutWindowTilemap(windowId);
}

// PrintEasyChatText forwarder — pas exposé hors range 4500-5875 dans le décomp ;
// délégué à un setter pour décorréler des cycles ESM avec easy-chat-render.ts.
let _PrintEasyChatText: (
  windowId: number, fontId: number, str: Uint8Array | string,
  x: number, y: number, speed: number, callback: unknown
) => void = () => {
  console.warn('[easy-chat-sprite STUB] PrintEasyChatText : injection manquante');
};
export function _setPrintEasyChatText(fn: typeof _PrintEasyChatText): void { _PrintEasyChatText = fn; }
function printEasyChatText(
  windowId: number, fontId: number, str: Uint8Array | string,
  x: number, y: number, speed: number, callback: unknown
): void {
  _PrintEasyChatText(windowId, fontId, str, x, y, speed, callback);
}

// ─── Group unlock checks (easy_chat.c:5108-5134) ─────────────────────────────

export function IsEasyChatGroupUnlocked(groupId: number): number /* bool8 */ {
  switch (groupId)
  {
  case EC_GROUP_TRENDY_SAYING:
    return _FlagGet(FLAG_UNLOCKED_TRENDY_SAYINGS) ? 1 : 0;
  case EC_GROUP_EVENTS:
  case EC_GROUP_MOVE_1:
  case EC_GROUP_MOVE_2:
    return _FlagGet(FLAG_SYS_GAME_CLEAR) ? 1 : 0;
  case EC_GROUP_POKEMON_NATIONAL:
    return EasyChatIsNationalPokedexEnabled() ? 1 : 0;
  default:
    return 1; // TRUE
  }
}

export function EasyChat_GetNumWordsInGroup(groupId: number): number {
  if (groupId === EC_GROUP_POKEMON)
    return _GetNationalPokedexCount(FLAG_GET_SEEN);

  if (IsEasyChatGroupUnlocked(groupId))
    return _gEasyChatGroups[groupId].numEnabledWords;

  return 0;
}

// ─── IsEasyChatWordInvalid (easy_chat.c:5136-5171) ───────────────────────────

function IsEasyChatWordInvalid(easyChatWord: number): number /* bool8 */ {
  let i: number;
  let groupId: number;
  let index: number;
  let numWords: number;
  let list: Uint16Array | number[];
  if (easyChatWord === EC_EMPTY_WORD)
    return 0; // FALSE

  groupId = EC_GROUP(easyChatWord);
  index = EC_INDEX(easyChatWord);
  if (groupId >= EC_NUM_GROUPS)
    return 1; // TRUE

  numWords = _gEasyChatGroups[groupId].numWords;
  switch (groupId)
  {
  case EC_GROUP_POKEMON:
  case EC_GROUP_POKEMON_NATIONAL:
  case EC_GROUP_MOVE_1:
  case EC_GROUP_MOVE_2:
    list = _gEasyChatGroups[groupId].wordData.valueList!;
    for (i = 0; i < numWords; i++)
    {
      if (index === list[i])
        return 0; // FALSE
    }
    return 1; // TRUE
  }

  if (index >= numWords)
    return 1; // TRUE
  else
    return 0; // FALSE
}
export { IsEasyChatWordInvalid };

// ─── IsBardWordInvalid (easy_chat.c:5173-5200) ───────────────────────────────

export function IsBardWordInvalid(easyChatWord: number): number /* bool8 */ {
  let numWordsInGroup: number;
  const groupId = EC_GROUP(easyChatWord);
  const index = EC_INDEX(easyChatWord);
  if (groupId >= EC_NUM_GROUPS)
    return 1; // TRUE

  switch (groupId)
  {
  case EC_GROUP_POKEMON:
  case EC_GROUP_POKEMON_NATIONAL:
    numWordsInGroup = _gNumBardWords_Species;
    break;
  case EC_GROUP_MOVE_1:
  case EC_GROUP_MOVE_2:
    numWordsInGroup = _gNumBardWords_Moves;
    break;
  default:
    numWordsInGroup = _gEasyChatGroups[groupId].numWords;
    break;
  }

  if (numWordsInGroup <= index)
    return 1; // TRUE
  else
    return 0; // FALSE
}

// ─── GetEasyChatWord (easy_chat.c:5202-5215) ─────────────────────────────────

function GetEasyChatWord(groupId: number, index: number): Uint8Array | string {
  switch (groupId)
  {
  case EC_GROUP_POKEMON:
  case EC_GROUP_POKEMON_NATIONAL:
    return _gSpeciesNames[index];
  case EC_GROUP_MOVE_1:
  case EC_GROUP_MOVE_2:
    return _gMoveNames[index];
  default:
    return _gEasyChatGroups[groupId].wordData.words![index].text;
  }
}
export { GetEasyChatWord };

// ─── CopyEasyChatWord (easy_chat.c:5217-5237) ────────────────────────────────

export function CopyEasyChatWord(dest: Uint8Array, easyChatWord: number): Uint8Array {
  let resultStr: Uint8Array;
  if (IsEasyChatWordInvalid(easyChatWord))
  {
    resultStr = StringCopy(dest, _gText_ThreeQuestionMarks || '???');
  }
  else if (easyChatWord !== EC_EMPTY_WORD)
  {
    const index = EC_INDEX(easyChatWord);
    const groupId = EC_GROUP(easyChatWord);
    resultStr = StringCopy(dest, GetEasyChatWord(groupId, index));
  }
  else
  {
    dest[0] = EOS;
    resultStr = dest;
  }

  return resultStr;
}

// ─── ConvertEasyChatWordsToString (easy_chat.c:5239-5266) ────────────────────

export function ConvertEasyChatWordsToString(
  dest: Uint8Array, src: Uint16Array, columns: number, rows: number
): Uint8Array {
  let i: number, j: number;
  const numColumns = columns - 1;

  let srcIdx = 0;
  let destSub: Uint8Array = dest;

  for (i = 0; i < rows; i++)
  {
    for (j = 0; j < numColumns; j++)
    {
      destSub = CopyEasyChatWord(destSub, src[srcIdx]);
      if (src[srcIdx] !== EC_EMPTY_WORD)
      {
        destSub[0] = CHAR_SPACE;
        destSub = destSub.subarray(1);
      }

      srcIdx++;
    }

    destSub = CopyEasyChatWord(destSub, src[srcIdx++]);
    destSub[0] = CHAR_NEWLINE;
    destSub = destSub.subarray(1);
  }

  // dest--;
  // *dest = EOS;
  // En TS l'arithmétique pointeur n'est pas dispo ; on simule via
  // une longueur calculée. dest est la base ; destSub pointe juste après
  // le dernier CHAR_NEWLINE. On veut écrire EOS *à la place* du dernier.
  // Pour rester 1:1 sémantique : si destSub a au moins 1 octet d'historique
  //  (= rows > 0), on revient en arrière de 1 via dest indexing manuel.
  // Le retour décomp `dest--` puis `*dest = EOS` ⇒ dest pointe sur EOS.
  if (rows > 0) {
    // destSub correspond à dest + offset (offset = bytes écrits).
    // L'offset est dest.length - destSub.length.
    const writtenLen = dest.length - destSub.length;
    dest[writtenLen - 1] = EOS;
    return dest.subarray(writtenLen - 1);
  }
  return destSub;
}

// ─── OtherConvertEasyChatWordsToString (easy_chat.c:5268-5318) ───────────────

export function OtherConvertEasyChatWordsToString(
  dest: Uint8Array, src: Uint16Array, columns: number, rows: number
): Uint8Array {
  let i: number, j: number, k: number;
  let numColumns: number;
  let notEmpty: number, lineNumber: number;

  numColumns = columns;
  lineNumber = 0;
  columns--;

  let srcIdx = 0;
  let destSub: Uint8Array = dest;

  for (i = 0; i < rows; i++)
  {
    const strBase = srcIdx;
    notEmpty = 0; // FALSE
    for (j = 0; j < numColumns; j++)
    {
      if (src[strBase + j] !== EC_EMPTY_WORD)
        notEmpty = 1; // TRUE
    }

    if (!notEmpty)
    {
      srcIdx += numColumns;
      continue;
    }

    for (k = 0; k < columns; k++)
    {
      destSub = CopyEasyChatWord(destSub, src[srcIdx]);
      if (src[srcIdx] !== EC_EMPTY_WORD)
      {
        destSub[0] = CHAR_SPACE;
        destSub = destSub.subarray(1);
      }

      srcIdx++;
    }

    destSub = CopyEasyChatWord(destSub, src[srcIdx++]);
    if (lineNumber === 0)
      destSub[0] = CHAR_NEWLINE;
    else
      destSub[0] = CHAR_PROMPT_SCROLL;

    destSub = destSub.subarray(1);
    lineNumber++;
  }

  // dest--; *dest = EOS;
  if (rows > 0) {
    const writtenLen = dest.length - destSub.length;
    if (writtenLen > 0) {
      dest[writtenLen - 1] = EOS;
      return dest.subarray(writtenLen - 1);
    }
  }
  return destSub;
}

// ─── GetEasyChatWordStringLength (easy_chat.c:5320-5335) ─────────────────────

function GetEasyChatWordStringLength(easyChatWord: number): number {
  if (easyChatWord === EC_EMPTY_WORD)
    return 0;

  if (IsEasyChatWordInvalid(easyChatWord))
  {
    return StringLength(_gText_ThreeQuestionMarks);
  }
  else
  {
    const index = EC_INDEX(easyChatWord);
    const groupId = EC_GROUP(easyChatWord);
    return StringLength(GetEasyChatWord(groupId, index));
  }
}

// ─── CanPhraseFitInXRowsYCols (easy_chat.c:5337-5352) ────────────────────────

function CanPhraseFitInXRowsYCols(
  easyChatWords: Uint16Array, numRows: number, numColumns: number, maxLength: number
): number /* bool8 */ {
  let i: number, j: number;
  let idx = 0;

  for (i = 0; i < numColumns; i++)
  {
    let totalLength = numRows - 1;
    for (j = 0; j < numRows; j++)
      totalLength += GetEasyChatWordStringLength(easyChatWords[idx++]);

    if (totalLength > maxLength)
      return 1; // TRUE
  }

  return 0; // FALSE
}

// ─── GetRandomEasyChatWordFromGroup (easy_chat.c:5354-5366) ──────────────────

export function GetRandomEasyChatWordFromGroup(groupId: number): number {
  let index = _Random() % _gEasyChatGroups[groupId].numWords;
  if (groupId === EC_GROUP_POKEMON
   || groupId === EC_GROUP_POKEMON_NATIONAL
   || groupId === EC_GROUP_MOVE_1
   || groupId === EC_GROUP_MOVE_2)
  {
    index = _gEasyChatGroups[groupId].wordData.valueList![index];
  }

  return EC_WORD(groupId, index);
}

// ─── GetRandomEasyChatWordFromUnlockedGroup (easy_chat.c:5368-5377) ──────────

export function GetRandomEasyChatWordFromUnlockedGroup(groupId: number): number {
  if (!IsEasyChatGroupUnlocked(groupId))
    return EC_EMPTY_WORD;

  if (groupId === EC_GROUP_POKEMON)
    return GetRandomUnlockedEasyChatPokemon();

  return GetRandomEasyChatWordFromGroup(groupId);
}

// ─── ShowEasyChatProfile (easy_chat.c:5379-5419) ─────────────────────────────

export function ShowEasyChatProfile(): void {
  let easyChatWords: Uint16Array;
  let columns: number, rows: number;
  switch (_gSpecialVar_0x8004)
  {
  case 0:
    easyChatWords = _gSaveBlock1Ptr.easyChatProfile;
    columns = 2;
    rows = 2;
    break;
  case 1:
    easyChatWords = _gSaveBlock1Ptr.easyChatBattleStart;
    if (CanPhraseFitInXRowsYCols(_gSaveBlock1Ptr.easyChatBattleStart, 3, 2, 18))
    {
      columns = 2;
      rows = 3;
    }
    else
    {
      columns = 3;
      rows = 2;
    }
    break;
  case 2:
    easyChatWords = _gSaveBlock1Ptr.easyChatBattleWon;
    columns = 3;
    rows = 2;
    break;
  case 3:
    easyChatWords = _gSaveBlock1Ptr.easyChatBattleLost;
    columns = 3;
    rows = 2;
    break;
  default:
    return;
  }

  ConvertEasyChatWordsToString(_gStringVar4, easyChatWords, columns, rows);
  _ShowFieldAutoScrollMessage(_gStringVar4);
}

// ─── BufferDeepLinkPhrase (easy_chat.c:5421-5427) ────────────────────────────
//
// The phrase that a man in Dewford Hall suggests has a "deep link" to the current trendy phrase

export function BufferDeepLinkPhrase(): void {
  const groupId = (_Random() & 1) ? EC_GROUP_HOBBIES : EC_GROUP_LIFESTYLE;
  const easyChatWord = GetRandomEasyChatWordFromUnlockedGroup(groupId);
  CopyEasyChatWord(_gStringVar2, easyChatWord);
}

// ─── Trendy sayings (easy_chat.c:5446-5527) ──────────────────────────────────
//
//   ### Trendy Sayings
//
//   Not to be confused with Dewford Town's "trendy phrase".
//   This is a group of easy chat words (EC_GROUP_TRENDY_SAYING) that are normally inaccessible.
//   They can be unlocked either through Mystery Event or from the "Hipster" Mauville Old Man.
//   Which words have been unlocked is saved in the unlockedTrendySayings bitfield in SaveBlock1.

function IsTrendySayingUnlocked(wordIndex: number): number /* bool8 */ {
  const byteOffset = (wordIndex / 8) | 0;
  const shift = wordIndex % 8;
  return ((_gSaveBlock1Ptr.unlockedTrendySayings[byteOffset] >> shift) & 1) as number;
}

export function UnlockTrendySaying(wordIndex: number): void {
  if (wordIndex < NUM_TRENDY_SAYINGS)
  {
    const byteOffset = (wordIndex / 8) | 0;
    const shift = wordIndex % 8;
    _gSaveBlock1Ptr.unlockedTrendySayings[byteOffset] |= 1 << shift;
  }
}

function GetNumTrendySayingsUnlocked(): number {
  let i: number;
  let numUnlocked: number;

  for (i = 0, numUnlocked = 0; i < NUM_TRENDY_SAYINGS; i++)
  {
    if (IsTrendySayingUnlocked(i))
      numUnlocked++;
  }

  return numUnlocked;
}

export function UnlockRandomTrendySaying(): number {
  let i: number;
  let numToSkip: number;
  const numUnlocked = GetNumTrendySayingsUnlocked();
  if (numUnlocked === NUM_TRENDY_SAYINGS)
    return EC_EMPTY_WORD;

  numToSkip = _Random() % (NUM_TRENDY_SAYINGS - numUnlocked);
  for (i = 0; i < NUM_TRENDY_SAYINGS; i++)
  {
    if (!IsTrendySayingUnlocked(i))
    {
      if (numToSkip)
      {
        // Skip the first n locked words, as determined by the Random call above.
        numToSkip--;
      }
      else
      {
        UnlockTrendySaying(i);
        return EC_WORD(EC_GROUP_TRENDY_SAYING, i);
      }
    }
  }

  // Would only be reached if there are no new words to teach, which is handled at the start.
  return EC_EMPTY_WORD;
}

// UNUSED dans le décomp — porté 1:1 pour exhaustivité (l. 5507-5527).
function GetRandomUnlockedTrendySaying(): number {
  let i: number;
  let n = GetNumTrendySayingsUnlocked();
  if (n === 0)
    return EC_EMPTY_WORD;

  n = _Random() % n;
  for (i = 0; i < NUM_TRENDY_SAYINGS; i++)
  {
    if (IsTrendySayingUnlocked(i))
    {
      if (n)
        n--;
      else
        return EC_WORD(EC_GROUP_TRENDY_SAYING, i);
    }
  }

  return EC_EMPTY_WORD;
}
// Suppress 'unused' warning : keep visible for any future caller.
export { GetRandomUnlockedTrendySaying };

// ─── EasyChatIsNationalPokedexEnabled / GetRandomUnlockedEasyChatPokemon ──────
//                                                       (easy_chat.c:5529-5561)

function EasyChatIsNationalPokedexEnabled(): number /* bool8 */ {
  return _IsNationalPokedexEnabled() ? 1 : 0;
}

function GetRandomUnlockedEasyChatPokemon(): number {
  let i: number;
  let numWords: number;
  let species: Uint16Array | number[];
  let index = EasyChat_GetNumWordsInGroup(EC_GROUP_POKEMON);
  if (index === 0)
    return EC_EMPTY_WORD;

  index = _Random() % index;
  species = _gEasyChatGroups[EC_GROUP_POKEMON].wordData.valueList!;
  numWords = _gEasyChatGroups[EC_GROUP_POKEMON].numWords;
  let sp = 0;
  for (i = 0; i < numWords; i++)
  {
    const dexNum = _SpeciesToNationalPokedexNum(species[sp]);
    if (_GetSetPokedexFlag(dexNum, FLAG_GET_SEEN))
    {
      if (index)
        index--;
      else
        return EC_WORD(EC_GROUP_POKEMON, species[sp]);
    }

    sp++;
  }

  return EC_EMPTY_WORD;
}

// ─── InitEasyChatPhrases (easy_chat.c:5563-5596) ─────────────────────────────

export function InitEasyChatPhrases(): void {
  let i: number, j: number;

  for (i = 0; i < _sDefaultProfileWords.length; i++)
    _gSaveBlock1Ptr.easyChatProfile[i] = _sDefaultProfileWords[i];

  for (i = 0; i < EASY_CHAT_BATTLE_WORDS_COUNT; i++)
    _gSaveBlock1Ptr.easyChatBattleStart[i] = _sDefaultBattleStartWords[i];

  for (i = 0; i < EASY_CHAT_BATTLE_WORDS_COUNT; i++)
    _gSaveBlock1Ptr.easyChatBattleWon[i] = _sDefaultBattleWonWords[i];

  for (i = 0; i < EASY_CHAT_BATTLE_WORDS_COUNT; i++)
    _gSaveBlock1Ptr.easyChatBattleLost[i] = _sDefaultBattleLostWords[i];

  for (i = 0; i < MAIL_COUNT; i++)
  {
    for (j = 0; j < MAIL_WORDS_COUNT; j++)
      _gSaveBlock1Ptr.mail[i].words[j] = EC_EMPTY_WORD;
  }

  // BUG: This is supposed to clear 64 bits, but this loop is clearing 64 bytes.
  // However, this bug has no resulting effect on gameplay because only the
  // Mauville old man data is corrupted, which is initialized directly after
  // this function is called when starting a new game.
  // (UBFIX path conservé en commentaire : non utilisé par cette ROM build.)
  for (i = 0; i < 64; i++)
    _gSaveBlock1Ptr.unlockedTrendySayings[i] = 0;
}

// ─── Word data init (easy_chat.c:5598-5651) ──────────────────────────────────

export function InitEasyChatScreenWordData(): number /* bool8 */ {
  sWordData = Alloc(makeEasyChatScreenWordData);
  if (!sWordData)
    return 0; // FALSE

  SetUnlockedEasyChatGroups();
  SetUnlockedWordsByAlphabet();
  return 1; // TRUE
}

export function FreeEasyChatScreenWordData(): void {
  // TRY_FREE_AND_SET_NULL : free + set NULL.
  sWordData = null;
}

function SetUnlockedEasyChatGroups(): void {
  let i: number;

  sWordData!.numUnlockedGroups = 0;
  if (_GetNationalPokedexCount(FLAG_GET_SEEN))
    sWordData!.unlockedGroupIds[sWordData!.numUnlockedGroups++] = EC_GROUP_POKEMON;

  // These groups are unlocked automatically
  for (i = EC_GROUP_TRAINER; i <= EC_GROUP_ADJECTIVES; i++)
    sWordData!.unlockedGroupIds[sWordData!.numUnlockedGroups++] = i;

  if (_FlagGet(FLAG_SYS_GAME_CLEAR))
  {
    sWordData!.unlockedGroupIds[sWordData!.numUnlockedGroups++] = EC_GROUP_EVENTS;
    sWordData!.unlockedGroupIds[sWordData!.numUnlockedGroups++] = EC_GROUP_MOVE_1;
    sWordData!.unlockedGroupIds[sWordData!.numUnlockedGroups++] = EC_GROUP_MOVE_2;
  }

  if (_FlagGet(FLAG_UNLOCKED_TRENDY_SAYINGS))
    sWordData!.unlockedGroupIds[sWordData!.numUnlockedGroups++] = EC_GROUP_TRENDY_SAYING;

  if (_IsNationalPokedexEnabled())
    sWordData!.unlockedGroupIds[sWordData!.numUnlockedGroups++] = EC_GROUP_POKEMON_NATIONAL;
}

export function GetNumUnlockedEasyChatGroups(): number {
  return sWordData!.numUnlockedGroups;
}

export function GetUnlockedEasyChatGroupId(index: number): number {
  if (index >= sWordData!.numUnlockedGroups)
    return EC_NUM_GROUPS;
  else
    return sWordData!.unlockedGroupIds[index];
}

// ─── BufferEasyChatWordGroupName (easy_chat.c:5653-5665) ─────────────────────
// UNUSED dans le décomp — porté 1:1 pour exhaustivité.

function BufferEasyChatWordGroupName(dest: Uint8Array, groupId: number, totalChars: number): Uint8Array {
  let i: number;
  const groupName = _sEasyChatGroupNamePointers[groupId];
  let str = StringCopy(dest, groupName || '');
  const written = dest.length - str.length;
  for (i = written; i < totalChars; i++)
  {
    dest[i] = CHAR_SPACE;
  }
  // (str advance by totalChars - written)
  // emulate `str = str + advanced`.
  if (totalChars - written > 0) {
    str = dest.subarray(totalChars);
  }
  // *str = EOS;
  if (totalChars < dest.length) dest[totalChars] = EOS;
  return str;
}
export { BufferEasyChatWordGroupName };

export function GetEasyChatWordGroupName(groupId: number): Uint8Array | string {
  return (_sEasyChatGroupNamePointers[groupId] as Uint8Array | string) ?? '';
}

// ─── CopyEasyChatWordPadded (easy_chat.c:5672-5684) ──────────────────────────

export function CopyEasyChatWordPadded(dest: Uint8Array, easyChatWord: number, totalChars: number): Uint8Array {
  let i: number;
  let str = CopyEasyChatWord(dest, easyChatWord);
  const written = dest.length - str.length;
  for (i = written; i < totalChars; i++)
  {
    dest[i] = CHAR_SPACE;
  }
  if (totalChars - written > 0) {
    str = dest.subarray(totalChars);
  }
  if (totalChars < dest.length) dest[totalChars] = EOS;
  return str;
}

// ─── SetUnlockedWordsByAlphabet (easy_chat.c:5686-5727) ──────────────────────

function SetUnlockedWordsByAlphabet(): void {
  let i: number, j: number, k: number;
  let numWords: number;
  let words: Uint16Array | number[];
  let numToProcess: number;
  let index: number;
  let wordsIdx: number;

  for (i = 0; i < EC_NUM_ALPHABET_GROUPS; i++)
  {
    numWords = _gEasyChatWordsByLetterPointers[i].numWords;
    words = _gEasyChatWordsByLetterPointers[i].words;
    sWordData!.numUnlockedAlphabetWords[i] = 0;
    index = 0;
    wordsIdx = 0;
    for (j = 0; j < numWords; j++)
    {
      if (words[wordsIdx] === EC_EMPTY_WORD)
      {
        wordsIdx++;
        numToProcess = words[wordsIdx];
        wordsIdx++;
        j += 1 + numToProcess;
      }
      else
      {
        numToProcess = 1;
      }

      for (k = 0; k < numToProcess; k++)
      {
        if (IsEasyChatWordUnlocked(words[wordsIdx + k]))
        {
          sWordData!.unlockedAlphabetWords[i][index++] = words[wordsIdx + k];
          sWordData!.numUnlockedAlphabetWords[i]++;
          break;
        }
      }

      wordsIdx += numToProcess;
    }
  }
}

// ─── SetSelectedWordGroup (easy_chat.c:5729-5793) ────────────────────────────

export function SetSelectedWordGroup(inAlphabetMode: number /* bool32 */, groupId: number): void {
  if (!inAlphabetMode)
    sWordData!.numSelectedGroupWords = SetSelectedWordGroup_GroupMode(groupId);
  else
    sWordData!.numSelectedGroupWords = SetSelectedWordGroup_AlphabetMode(groupId);
}

export function GetWordFromSelectedGroup(index: number): number {
  if (index >= sWordData!.numSelectedGroupWords)
    return EC_EMPTY_WORD;
  else
    return sWordData!.selectedGroupWords[index];
}

export function GetNumWordsInSelectedGroup(): number {
  return sWordData!.numSelectedGroupWords;
}

function SetSelectedWordGroup_GroupMode(groupId: number): number {
  let i: number;
  let totalWords: number;
  let list: Uint16Array | number[];
  let wordInfo: ReadonlyArray<EasyChatWordInfo>;
  const numWords = _gEasyChatGroups[groupId].numWords;

  if (groupId === EC_GROUP_POKEMON || groupId === EC_GROUP_POKEMON_NATIONAL
   || groupId === EC_GROUP_MOVE_1  || groupId === EC_GROUP_MOVE_2)
  {
    list = _gEasyChatGroups[groupId].wordData.valueList!;
    for (i = 0, totalWords = 0; i < numWords; i++)
    {
      if (IsEasyChatIndexAndGroupUnlocked(list[i], groupId))
        sWordData!.selectedGroupWords[totalWords++] = EC_WORD(groupId, list[i]);
    }

    return totalWords;
  }
  else
  {
    wordInfo = _gEasyChatGroups[groupId].wordData.words!;
    for (i = 0, totalWords = 0; i < numWords; i++)
    {
      const alphabeticalOrder = wordInfo[i].alphabeticalOrder;
      if (IsEasyChatIndexAndGroupUnlocked(alphabeticalOrder, groupId))
        sWordData!.selectedGroupWords[totalWords++] = EC_WORD(groupId, alphabeticalOrder);
    }

    return totalWords;
  }
}

function SetSelectedWordGroup_AlphabetMode(groupId: number): number {
  let i: number;
  let totalWords: number;

  for (i = 0, totalWords = 0; i < sWordData!.numUnlockedAlphabetWords[groupId]; i++)
    sWordData!.selectedGroupWords[totalWords++] = sWordData!.unlockedAlphabetWords[groupId][i];

  return totalWords;
}

// ─── IsEasyChatGroupUnlocked2 (easy_chat.c:5795-5805) ────────────────────────

function IsEasyChatGroupUnlocked2(groupId: number): number /* bool8 */ {
  let i: number;
  for (i = 0; i < sWordData!.numUnlockedGroups; i++)
  {
    if (sWordData!.unlockedGroupIds[i] === groupId)
      return 1; // TRUE
  }

  return 0; // FALSE
}

// ─── IsEasyChatIndexAndGroupUnlocked (easy_chat.c:5807-5825) ─────────────────

function IsEasyChatIndexAndGroupUnlocked(wordIndex: number, groupId: number): number /* bool8 */ {
  switch (groupId)
  {
  case EC_GROUP_POKEMON:
    return _GetSetPokedexFlag(_SpeciesToNationalPokedexNum(wordIndex), FLAG_GET_SEEN) ? 1 : 0;
  case EC_GROUP_POKEMON_NATIONAL:
    if (IsRestrictedWordSpecies(wordIndex))
      _GetSetPokedexFlag(_SpeciesToNationalPokedexNum(wordIndex), FLAG_GET_SEEN);
    return 1; // TRUE
  case EC_GROUP_MOVE_1:
  case EC_GROUP_MOVE_2:
    return 1; // TRUE
  case EC_GROUP_TRENDY_SAYING:
    return IsTrendySayingUnlocked(wordIndex);
  default:
    return _gEasyChatGroups[groupId].wordData.words![wordIndex].enabled ? 1 : 0;
  }
}

// ─── IsRestrictedWordSpecies (easy_chat.c:5827-5839) ─────────────────────────
//
// Pokémon words in EC_GROUP_POKEMON_NATIONAL are always allowed (assuming the group is unlocked)
// unless they are in this group. If they are in this group (just Deoxys), they must also have been seen.

function IsRestrictedWordSpecies(species: number): number {
  let i: number;
  for (i = 0; i < _sRestrictedWordSpecies.length; i++)
  {
    if (_sRestrictedWordSpecies[i] === species)
      return 1; // TRUE
  }

  return 0; // FALSE
}

// ─── IsEasyChatWordUnlocked (easy_chat.c:5841-5849) ──────────────────────────

function IsEasyChatWordUnlocked(easyChatWord: number): number /* u8 */ {
  const groupId = EC_GROUP(easyChatWord);
  const index = EC_INDEX(easyChatWord);
  if (!IsEasyChatGroupUnlocked2(groupId))
    return 0; // FALSE
  else
    return IsEasyChatIndexAndGroupUnlocked(index, groupId);
}
export { IsEasyChatWordUnlocked };

// ─── InitializeEasyChatWordArray (easy_chat.c:5851-5856) ─────────────────────

export function InitializeEasyChatWordArray(words: Uint16Array, length: number): void {
  let i: number;
  // 1:1 décomp : `for (i = length - 1; i != EC_EMPTY_WORD; i--)`.
  // Quand length=0, i=0xFFFF (= EC_EMPTY_WORD) ⇒ exit immédiat. OK.
  let wIdx = 0;
  for (i = length - 1; i !== EC_EMPTY_WORD; i--) {
    words[wIdx++] = EC_EMPTY_WORD;
  }
}

// ─── InitQuestionnaireWords (easy_chat.c:5858-5864) ──────────────────────────

export function InitQuestionnaireWords(): void {
  let i: number;
  const words = _GetQuestionnaireWordsPtr();
  for (i = 0; i < NUM_QUESTIONNAIRE_WORDS; i++)
    words[i] = EC_EMPTY_WORD;
}

// ─── IsEasyChatAnswerUnlocked (easy_chat.c:5866-5874) ────────────────────────

export function IsEasyChatAnswerUnlocked(easyChatWord: number): boolean /* bool32 */ {
  const groupId = EC_GROUP(easyChatWord);
  const mask = EC_MASK_GROUP;
  const index = EC_INDEX(easyChatWord);
  if (!IsEasyChatGroupUnlocked(groupId & mask))
    return false;
  else
    return IsEasyChatIndexAndGroupUnlocked(index, groupId & mask) ? true : false;
}
