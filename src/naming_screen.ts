/**
 * naming_screen.ts
 * ─────────────────────
 * 1:1 décomp `src/naming_screen.c` (= 2594 lignes).
 *
 * Session 91 — Naming screen 1:1 decomp impl avec keyboard SPRITE-BASED.
 * Avant : MVP via window text printer (= cursor=color highlight).
 * Maintenant : cursor sprite animé + buttons sprites + page swap anim +
 *              input arrow + underscore animés, 1:1 avec sNaming_screen.c.
 *
 * Foundation utilisée :
 *   - decomp-globals.ts : IndexOfSpritePaletteTag, GetSpriteTileStartByTag,
 *     MultiplyInvertedPaletteRGBComponents, FindTaskIdByFunc, SetSubspriteTables.
 *   - decomp-runtime.ts : CreateSpriteAtOam, StartSpriteAnim.
 *   - gba-window-system.ts : AddWindow + window text printer (= keyboard chars
 *     dans WIN_KB_PAGE_1/2 + entry text).
 *   - PNG/PAL assets dans public/decomp/em/boot/naming_screen/ (= déjà extraits).
 *
 * État global : `sNamingScreen` exposé sur `globalThis` pour que les
 * auto-callbacks y accèdent.
 */
import { OBJ_PLTT_ID, MAX_SPRITES } from '../harness/runtime/decomp-runtime';
import { MarkObjTilesAllocated, MarkObjPaletteAllocated, AllocSpriteTileRange, ResetSpriteData } from './sprite';
import { SetPlayerName } from '../include/text';
import {
  AddWindow, FillWindowPixelBuffer, PutWindowTilemap, CopyWindowToVram,
  InitBgsFromTemplates, ResetBgsAndClearDma3BusyFlags,
  FillBgTilemapBufferRect_Palette0, CopyToBgTilemapBuffer, type WindowTemplate,
  ShowBg as ShowBgWin, HideBg as HideBgWin,
} from './window';
import { AddTextPrinterParameterized3 } from './engine/ui/gba-text-system';
import {
  getRuntime,
  ResetPaletteFade, FreeAllSpritePalettes, ResetTasks,
  LoadPalette, LoadBgTiles, ShowBg, HideBg,
  PlaySE,
  IndexOfSpritePaletteTag, GetSpriteTileStartByTag,
  MultiplyInvertedPaletteRGBComponents,
  BlendPalettes,
  SetSubspriteTables, syncSubspriteOam, clearAllSubspriteTables,
  CpuFill32, CpuFill16,
  VRAM, OAM, PLTT, VRAM_SIZE, OAM_SIZE, PLTT_SIZE,
  type NamingSubsprite,
} from '../harness/runtime/decomp-globals';
import { gSaveBlock2Ptr } from './engine/save/save-block-state';
import { loadGbaPal, loadTileBin, loadTilemapBin } from '../harness/gba/png-loader';
import type { DecompSprite, DecompTask } from '../harness/runtime/decomp-runtime';
import { gKeyRepeat } from '../harness/runtime/decomp-runtime';
import {
  OBJ_EVENT_GFX_RIVAL_BRENDAN_NORMAL, OBJ_EVENT_GFX_RIVAL_MAY_NORMAL,
  ANIM_STD_GO_SOUTH, PLAYER_AVATAR_STATE_NORMAL,
  GetRivalAvatarGraphicsIdByStateIdAndGender,
  loadObjectEventGraphicsInfo, CreateObjectGraphicsSprite,
} from './engine/field/object-event-graphics';

// ─── Constants 1:1 décomp src/naming_screen.c ────────────────────────────────
//
// IMPORTANT : décomp utilise DEUX énumérations qui se chevauchent :
//   - KBPAGE_*   (sNamingScreen->currentPage) = ordre de cycle
//   - KEYBOARD_* (sPageColumnCounts indexing) = order de display
// Mapping via sPageToKeyboardId / sPageToNextKeyboardId (= indirect lookup).

const KBPAGE_SYMBOLS = 0;
const KBPAGE_LETTERS_UPPER = 1;
const KBPAGE_LETTERS_LOWER = 2;
const KBPAGE_COUNT = 3;

const KEYBOARD_LETTERS_LOWER = 0;
const KEYBOARD_LETTERS_UPPER = 1;
const KEYBOARD_SYMBOLS = 2;

const PAGE_SWAP_UPPER = 0;
const PAGE_SWAP_OTHERS = 1;
const PAGE_SWAP_LOWER = 2;

const KBROW_COUNT = 4;
const KBCOL_COUNT = 9;  // FR : 9 colonnes (vs EN 8)

// 1:1 décomp src/naming_screen.c:585-604 — page → next page lookup tables.
const sPageToNextGfxId: readonly number[] = [
  /* KBPAGE_SYMBOLS       */ PAGE_SWAP_UPPER,
  /* KBPAGE_LETTERS_UPPER */ PAGE_SWAP_LOWER,
  /* KBPAGE_LETTERS_LOWER */ PAGE_SWAP_OTHERS,
];
const sPageToNextKeyboardId: readonly number[] = [
  /* KBPAGE_SYMBOLS       */ KEYBOARD_LETTERS_UPPER,
  /* KBPAGE_LETTERS_UPPER */ KEYBOARD_LETTERS_LOWER,
  /* KBPAGE_LETTERS_LOWER */ KEYBOARD_SYMBOLS,
];
const sPageToKeyboardId: readonly number[] = [
  /* KBPAGE_SYMBOLS       */ KEYBOARD_SYMBOLS,
  /* KBPAGE_LETTERS_UPPER */ KEYBOARD_LETTERS_UPPER,
  /* KBPAGE_LETTERS_LOWER */ KEYBOARD_LETTERS_LOWER,
];

// 1:1 décomp KEY_ROLE_* enum (l.107-112)
const KEY_ROLE_CHAR = 0;
const KEY_ROLE_PAGE = 1;
const KEY_ROLE_BACKSPACE = 2;
const KEY_ROLE_OK = 3;

// 1:1 décomp BUTTON_* enum (l.114-119)
const BUTTON_PAGE = 0;
const BUTTON_BACK = 1;
const BUTTON_OK = 2;
const BUTTON_COUNT = 3;

// 1:1 décomp INPUT_* enum (l.33-44)
const INPUT_NONE = 0;
const INPUT_DPAD_UP = 1;
const INPUT_DPAD_DOWN = 2;
const INPUT_DPAD_LEFT = 3;
const INPUT_DPAD_RIGHT = 4;
const INPUT_A_BUTTON = 5;
const INPUT_B_BUTTON = 6;
// const INPUT_LR_BUTTON = 7;
const INPUT_SELECT = 8;
const INPUT_START = 9;

// 1:1 décomp INPUT_STATE_* (l.137-141)
const INPUT_STATE_DISABLED = 0;
const INPUT_STATE_ENABLED = 1;
const INPUT_STATE_OVERRIDE = 2;

// 1:1 décomp Task_NamingScreen states (l.122-133)
const STATE_FADE_IN = 0;
const STATE_WAIT_FADE_IN = 1;
const STATE_HANDLE_INPUT = 2;
const STATE_MOVE_TO_OK_BUTTON = 3;
const STATE_START_PAGE_SWAP = 4;
const STATE_WAIT_PAGE_SWAP = 5;
const STATE_PRESSED_OK = 6;
// const STATE_WAIT_SENT_TO_PC_MESSAGE = 7;
const STATE_FADE_OUT = 8;
const STATE_EXIT = 9;

const NAMING_SCREEN_PLAYER = 0;
const NAMING_SCREEN_BOX = 1;
// const NAMING_SCREEN_CAUGHT_MON = 2;
// const NAMING_SCREEN_NICKNAME = 3;
// const NAMING_SCREEN_WALDA = 4;

// 1:1 décomp WIN_* enum (l.75-82)
const WIN_KB_PAGE_1 = 0;
const WIN_KB_PAGE_2 = 1;
const WIN_TEXT_ENTRY = 2;
const WIN_TEXT_ENTRY_BOX = 3;
const WIN_BANNER = 4;

// Tags pour palette/tile lookups (= 1:1 décomp GFXTAG_* + PALTAG_*).
// On stringify pour les Maps. Les tags numériques GFXTAG_X/PALTAG_X du décomp
// sont préservés en tant que préfixes pour debug + tracing.
const PALTAG_MENU             = 'PALTAG_MENU';
const PALTAG_PAGE_SWAP_UPPER  = 'PALTAG_PAGE_SWAP_UPPER';
const PALTAG_PAGE_SWAP_LOWER  = 'PALTAG_PAGE_SWAP_LOWER';
const PALTAG_PAGE_SWAP_OTHERS = 'PALTAG_PAGE_SWAP_OTHERS';
const PALTAG_PAGE_SWAP        = 'PALTAG_PAGE_SWAP';
const PALTAG_CURSOR           = 'PALTAG_CURSOR';
const PALTAG_BACK_BUTTON      = 'PALTAG_BACK_BUTTON';
const PALTAG_OK_BUTTON        = 'PALTAG_OK_BUTTON';

const GFXTAG_BACK_BUTTON      = 'GFXTAG_BACK_BUTTON';
const GFXTAG_OK_BUTTON        = 'GFXTAG_OK_BUTTON';
const GFXTAG_PAGE_SWAP_FRAME  = 'GFXTAG_PAGE_SWAP_FRAME';
const GFXTAG_PAGE_SWAP_BUTTON = 'GFXTAG_PAGE_SWAP_BUTTON';
const GFXTAG_PAGE_SWAP_UPPER  = 'GFXTAG_PAGE_SWAP_UPPER';
const GFXTAG_PAGE_SWAP_LOWER  = 'GFXTAG_PAGE_SWAP_LOWER';
const GFXTAG_PAGE_SWAP_OTHERS = 'GFXTAG_PAGE_SWAP_OTHERS';
const GFXTAG_CURSOR           = 'GFXTAG_CURSOR';
const GFXTAG_CURSOR_SQUISHED  = 'GFXTAG_CURSOR_SQUISHED';
const GFXTAG_CURSOR_FILLED    = 'GFXTAG_CURSOR_FILLED';
const GFXTAG_INPUT_ARROW      = 'GFXTAG_INPUT_ARROW';
const GFXTAG_UNDERSCORE       = 'GFXTAG_UNDERSCORE';
const GFXTAG_PC_ICON_OFF      = 'GFXTAG_PC_ICON_OFF';

// PLAYER trainer icon (= Brendan/May overworld walking sprite) is dispatched
// via `object-event-graphics.ts` framework. See OBJ_EVENT_GFX_RIVAL_BRENDAN_NORMAL
// + sRivalAvatarGfxIds[PLAYER_AVATAR_STATE_NORMAL][gender] there.

// 1:1 décomp src/naming_screen.c:281-300 — sKeyboardChars[KBPAGE_COUNT][KBROW_COUNT][KBCOL_COUNT].
// Ordre = [KEYBOARD_LETTERS_LOWER, KEYBOARD_LETTERS_UPPER, KEYBOARD_SYMBOLS].
// Indexé par KEYBOARD_* (= sPageToKeyboardId[currentPage]).
/* @strings-ignore-start: grille de caractères du clavier = DATA 1:1 décomp
   naming_screen.c (sNamingScreenKeyboardText source), PAS des gText. Chars inline fidèles. */
const sKeyboardChars: readonly string[][][] = [
  // KEYBOARD_LETTERS_LOWER
  [
    ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', '.'],
    ['i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', ','],
    ['q', 'r', 's', 't', 'u', 'v', 'w', 'x', ' '],
    ['y', 'z', ' ', ' ', '-', ' ', ' ', ' ', ' '],
  ],
  // KEYBOARD_LETTERS_UPPER
  [
    ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', '.'],
    ['I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', ','],
    ['Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', ' '],
    ['Y', 'Z', ' ', ' ', '-', ' ', ' ', ' ', ' '],
  ],
  // KEYBOARD_SYMBOLS
  [
    ['0', '1', '2', '3', '4', ' ', ' ', ' ', ' '],
    ['5', '6', '7', '8', '9', ' ', ' ', ' ', ' '],
    ['!', '?', '♂', '♀', '/', ' ', ' ', ' ', ' '],
    ['…', '“', '”', '‘', "'", ' ', ' ', ' ', ' '],
  ],
] as const;
/* @strings-ignore-end (grille clavier = data, cf. start ci-dessus) */

// 1:1 décomp src/naming_screen.c:302-306
const sPageColumnCounts: readonly number[] = [
  /* KEYBOARD_LETTERS_LOWER */ KBCOL_COUNT,
  /* KEYBOARD_LETTERS_UPPER */ KBCOL_COUNT,
  /* KEYBOARD_SYMBOLS       */ 6,
];
// 1:1 décomp src/naming_screen.c:307-311 — X position en pixels par colonne pour
// chaque keyboard. Utilisé par SetCursorPos pour positionner le cursor sprite
// précisément au-dessus de chaque char.
const sPageColumnXPos: readonly number[][] = [
  /* KEYBOARD_LETTERS_LOWER */ [0, 12, 24, 36, 62, 74, 86, 98, 123],
  /* KEYBOARD_LETTERS_UPPER */ [0, 12, 24, 36, 62, 74, 86, 98, 123],
  /* KEYBOARD_SYMBOLS       */ [0, 22, 44, 66, 88, 110],
];

// 1:1 décomp src/naming_screen.c:200-225 — sBgTemplates[4]
const sBgTemplates_NamingScreen: readonly any[] = [
  { bg: 0, charBaseIndex: 0, mapBaseIndex: 30, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0,
    tilemapLeft: 0, tilemapTop: 0, width: 0, height: 0, paletteNum: 0, baseBlock: 0 },
  { bg: 1, charBaseIndex: 2, mapBaseIndex: 29, screenSize: 0, paletteMode: 0, priority: 1, baseTile: 0,
    tilemapLeft: 0, tilemapTop: 0, width: 0, height: 0, paletteNum: 0, baseBlock: 0 },
  { bg: 2, charBaseIndex: 2, mapBaseIndex: 28, screenSize: 0, paletteMode: 0, priority: 2, baseTile: 0,
    tilemapLeft: 0, tilemapTop: 0, width: 0, height: 0, paletteNum: 0, baseBlock: 0 },
  { bg: 3, charBaseIndex: 3, mapBaseIndex: 31, screenSize: 0, paletteMode: 0, priority: 3, baseTile: 0,
    tilemapLeft: 0, tilemapTop: 0, width: 0, height: 0, paletteNum: 0, baseBlock: 0 },
];

// 1:1 décomp src/naming_screen.c:228-275 — sWindowTemplates[5]
const sWindowTemplates_NamingScreen: readonly WindowTemplate[] = [
  { bg: 1, tilemapLeft: 3, tilemapTop: 10, width: 19, height: 8, paletteNum: 10, baseBlock: 0x030 },
  { bg: 2, tilemapLeft: 3, tilemapTop: 10, width: 19, height: 8, paletteNum: 10, baseBlock: 0x0C8 },
  { bg: 3, tilemapLeft: 8, tilemapTop: 6, width: 17, height: 2, paletteNum: 10, baseBlock: 0x030 },
  { bg: 3, tilemapLeft: 8, tilemapTop: 4, width: 17, height: 2, paletteNum: 10, baseBlock: 0x052 },
  { bg: 0, tilemapLeft: 0, tilemapTop: 0, width: 30, height: 2, paletteNum: 11, baseBlock: 0x074 },
];

// ─── Subsprite tables (= 1:1 décomp src/naming_screen.c:2194-2374) ──────────

// 1:1 décomp `include/gba/types.h:97-118` — SPRITE_SHAPE/SPRITE_SIZE encoding :
//   8x8   = shape=0 (SQUARE),       size=0
//   16x16 = shape=0,                size=1
//   32x32 = shape=0,                size=2
//   16x8  = shape=1 (H_RECTANGLE),  size=0
//   32x8  = shape=1,                size=1   ← was MIS-coded as size=2 in V1
//   32x16 = shape=1,                size=2
//   64x32 = shape=1,                size=3

// PageSwapFrame : 40x32 (= 5 wide × 4 tall, en tiles 8×8).
// 1:1 décomp src/naming_screen.c:2194-2260 sSubsprites_PageSwapFrame[] (8 entries).
// Layout : 4 rangs de [32x8 + 8x8] = 5 tiles de large × 4 tall = 40x32 px.
const sSubsprites_PageSwapFrame: readonly NamingSubsprite[] = [
  { x: -20, y: -16, shape: 1, size: 1, tileOffset: 0,  priority: 1 },  // 32x8 (4 tiles)
  { x:  12, y: -16, shape: 0, size: 0, tileOffset: 4,  priority: 1 },  // 8x8  (1 tile)
  { x: -20, y:  -8, shape: 1, size: 1, tileOffset: 5,  priority: 1 },
  { x:  12, y:  -8, shape: 0, size: 0, tileOffset: 9,  priority: 1 },
  { x: -20, y:   0, shape: 1, size: 1, tileOffset: 10, priority: 1 },
  { x:  12, y:   0, shape: 0, size: 0, tileOffset: 14, priority: 1 },
  { x: -20, y:   8, shape: 1, size: 1, tileOffset: 15, priority: 1 },
  { x:  12, y:   8, shape: 0, size: 0, tileOffset: 19, priority: 1 },
];

// PageSwapText : 24x8 (= 16x8 + 8x8).
// 1:1 décomp src/naming_screen.c:2266-2284 sSubsprites_PageSwapText[].
const sSubsprites_PageSwapText: readonly NamingSubsprite[] = [
  { x: -12, y: -4, shape: 1, size: 0, tileOffset: 0, priority: 1 },  // 16x8 (2 tiles)
  { x:   4, y: -4, shape: 0, size: 0, tileOffset: 2, priority: 1 },  // 8x8  (1 tile)
];

// Button (Back + OK) : 40x24.
// 1:1 décomp src/naming_screen.c:2291-2341 sSubsprites_Button[] (6 entries).
// Layout : 3 rangs de [32x8 + 8x8] = 5 wide × 3 tall = 40x24 px.
const sSubsprites_Button: readonly NamingSubsprite[] = [
  { x: -20, y: -12, shape: 1, size: 1, tileOffset: 0,  priority: 1 },  // 32x8 (4 tiles)
  { x:  12, y: -12, shape: 0, size: 0, tileOffset: 4,  priority: 1 },  // 8x8
  { x: -20, y:  -4, shape: 1, size: 1, tileOffset: 5,  priority: 1 },
  { x:  12, y:  -4, shape: 0, size: 0, tileOffset: 9,  priority: 1 },
  { x: -20, y:   4, shape: 1, size: 1, tileOffset: 10, priority: 1 },
  { x:  12, y:   4, shape: 0, size: 0, tileOffset: 14, priority: 1 },
];

// PCIcon : 16x24 (= 3 rangs de 16x8).
// 1:1 décomp src/naming_screen.c:2348-2374 sSubsprites_PCIcon[].
const sSubsprites_PCIcon: readonly NamingSubsprite[] = [
  { x: -8, y: -12, shape: 1, size: 0, tileOffset: 0, priority: 3 },  // 16x8 (2 tiles)
  { x: -8, y:  -4, shape: 1, size: 0, tileOffset: 2, priority: 3 },
  { x: -8, y:   4, shape: 1, size: 0, tileOffset: 4, priority: 3 },
];

// ─── State struct (1:1 décomp src/naming_screen.c:154-181) ──────────────────

interface NamingScreenState {
  state: number;
  windows: number[];                 // 5 window IDs
  inputCharBaseXPos: number;
  bg1vOffset: number;
  bg2vOffset: number;
  bg1Priority: number;
  bg2Priority: number;
  bgToReveal: number;
  bgToHide: number;
  currentPage: number;               // KBPAGE_*
  cursorSpriteId: number;
  swapBtnFrameSpriteId: number;
  template: { copyExistingString: number; maxChars: number; iconFunction: number; addGenderIcon: number; initialPage: number; title: string };
  templateNum: number;
  destBuffer: number[] | string;     // pointer to player name buffer (= 7 chars)
  monSpecies: number;
  monGender: number;
  monPersonality: number;
  returnCallback: ((rt: unknown) => void) | null;

  // Runtime — text entry state
  textBuffer: string[];              // currently entered chars
  // Runtime — input handler task ID
  inputTaskId: number;
  buttonFlashTaskId: number;
  pageSwapTaskId: number;
  // Runtime — cursor x/y in keyboard grid coords (= sX/sY in decomp sprite data).
  // We mirror them on the sprite.data[0..1] but also track here for queries.
  cursorX: number;
  cursorY: number;
  // Cached "text caret position" for use by Underscore sprite cb.
  textCaretPosition: number;
  // Track sprite IDs of children for cleanup
  pageSwapTextSpriteId: number;
  pageSwapButtonSpriteId: number;
  backButtonSpriteId: number;
  okButtonSpriteId: number;
  inputArrowSpriteId: number;
  underscoreSpriteIds: number[];
  // 1:1 décomp src/naming_screen.c:480 — sauve gKeyRepeatStartDelay AVANT
  // l'override à 16 par NamingScreen_Init. Restauré au cleanup naming screen.
  keyRepeatStartDelayCopy: number;
}

let sNamingScreen: NamingScreenState | null = null;

(globalThis as Record<string, unknown>).sNamingScreen = new Proxy({}, {
  get(_t, prop) {
    return sNamingScreen ? (sNamingScreen as any)[prop] : undefined;
  },
  set(_t, prop, value) {
    if (sNamingScreen) (sNamingScreen as any)[prop] = value;
    return true;
  },
});

// ─── Templates (= 1:1 décomp src/naming_screen.c:2093-2144) ─────────────────

const sNamingScreenTemplates = [
  // NAMING_SCREEN_PLAYER
  {
    copyExistingString: 0,
    maxChars: 7,  // = PLAYER_NAME_LENGTH
    iconFunction: 1,
    addGenderIcon: 0,
    initialPage: KBPAGE_LETTERS_UPPER,
    title: 'VOTRE NOM?',
  },
  // NAMING_SCREEN_BOX
  {
    copyExistingString: 0,
    maxChars: 8,
    iconFunction: 2,
    addGenderIcon: 0,
    initialPage: KBPAGE_LETTERS_UPPER,
    title: 'NOM DE BOÎTE?',
  },
  // NAMING_SCREEN_CAUGHT_MON
  {
    copyExistingString: 0,
    maxChars: 10,
    iconFunction: 3,
    addGenderIcon: 1,
    initialPage: KBPAGE_LETTERS_UPPER,
    title: 'SURNOM ?',
  },
  // NAMING_SCREEN_NICKNAME
  {
    copyExistingString: 0,
    maxChars: 10,
    iconFunction: 3,
    addGenderIcon: 1,
    initialPage: KBPAGE_LETTERS_UPPER,
    title: 'SURNOM ?',
  },
  // NAMING_SCREEN_WALDA
  {
    copyExistingString: 1,
    maxChars: 15,
    iconFunction: 4,
    addGenderIcon: 0,
    initialPage: KBPAGE_LETTERS_UPPER,
    title: 'MOTS ?',
  },
];

// ─── Asset loading state ─────────────────────────────────────────────────────
//
// Phase d'init : on charge les .png / .pal / .bin assets du naming screen
// AVANT de pouvoir CreateSprite. Géré via async loader appelé depuis
// CB2_LoadNamingScreen case 6 (= LoadGfx).

let _assetsLoaded = false;

// ─── BG tile/tilemap caches (= 1:1 décomp gNamingScreenMenu_Gfx + gNamingScreenBackground_Tilemap + gNamingScreenKeyboard{Upper,Lower,Symbols}_Tilemap) ─
// Foundationals : ces buffers sont chargés UNE fois depuis les .bin extraits
// par `scripts/extract-png-tiles.mjs`, puis transmis à LoadBgTiles +
// CopyToBgTilemapBuffer (= 1:1 décomp:1873-1876 + 623-626).
let _menuGfx: Uint8Array | null = null;
let _bgTilemapBackground: Uint16Array | null = null;
let _bgTilemapKeyboardUpper: Uint16Array | null = null;
let _bgTilemapKeyboardLower: Uint16Array | null = null;
let _bgTilemapKeyboardSymbols: Uint16Array | null = null;

/** Tilemap on-deck lookup (= 1:1 décomp:1968-1973 sNextKeyboardPageTilemaps).
 *  Indexé par `sNamingScreen.currentPage` ; retourne le tilemap qui doit être
 *  drawn sur la BG hors-écran (= la "next" page que le swap va révéler). */
function getNextKeyboardTilemap(currentPage: number): Uint16Array | null {
  if (currentPage === KBPAGE_SYMBOLS) return _bgTilemapKeyboardUpper;
  if (currentPage === KBPAGE_LETTERS_UPPER) return _bgTilemapKeyboardLower;
  if (currentPage === KBPAGE_LETTERS_LOWER) return _bgTilemapKeyboardSymbols;
  return null;
}

/** 1:1 décomp src/naming_screen.c:1894-1897 :
 *    static void DrawBgTilemap(u8 bg, const void *src) { CopyToBgTilemapBuffer(bg, src, 0, 0); }
 *  Notre src est déjà décompressé (= les .bin extraits par scripts/) → on
 *  utilise notre CopyToBgTilemapBuffer (= passe `mode=src.byteLength` pour
 *  forcer copy au lieu de LZ77 que notre engine ne fait pas). */
function DrawBgTilemap(bg: number, src: Uint16Array | null): void {
  if (!src) return;
  CopyToBgTilemapBuffer(bg, src, src.byteLength, 0);
}

async function loadNamingScreenAssets(): Promise<void> {
  if (_assetsLoaded) return;
  const rt = getRuntime();
  if (!rt) return;
  const BASE = '/decomp/em/boot/naming_screen/';

  // ⚠️ Pre-blacken faded palette buffer at LOAD START + après CHAQUE LoadPalette.
  // Le ROM décomp a softwareFadeFinishing actif pendant le loading qui maintient
  // brightness=16 (= black) jusqu'à BeginNormalPaletteFade en MainState_FadeIn.
  // Notre version : awaits inter-LoadPalette laissent passer 1+ frames où le
  // compositor render avec partial palette (= bleu BG bank 0 visible). Fix :
  // après chaque LoadPalette, on re-blackeng faded → next frame stays black.
  // Helper local pour cette fonction uniquement.
  const reBlackenFaded = (): void => {
    BlendPalettes(0xFFFFFFFF, 16, 0x0000);
  };
  reBlackenFaded();

  // ─── BG palettes (banks 0-5 = gNamingScreenMenu_Pal[6][16], bank 10 = keyboard Pal,
  //     bank 11 = txt window pal) ─
  // 1:1 décomp src/naming_screen.c:1887-1892 LoadPalettes :
  //   LoadPalette(gNamingScreenMenu_Pal, BG_PLTT_ID(0), sizeof(gNamingScreenMenu_Pal))
  //     → gNamingScreenMenu_Pal is `u16[6][16]` (= 6 banks of 16 colors,
  //       cf graphics.c:1394). sizeof = 192 bytes → loaded into BG banks 0-5.
  //       Banks : 0=menu(PCIcon), 1=page_swap_upper, 2=lower, 3=others,
  //               4=buttons, 5=cursor.
  //   LoadPalette(sKeyboard_Pal,         BG_PLTT_ID(10), sizeof(sKeyboard_Pal))
  //   LoadPalette(GetTextWindowPalette(2), BG_PLTT_ID(11), PLTT_SIZE_4BPP)
  try {
    const bgPals: ReadonlyArray<{ url: string; bank: number }> = [
      { url: BASE + 'menu.pal',             bank: 0 },
      { url: BASE + 'page_swap_upper.pal',  bank: 1 },
      { url: BASE + 'page_swap_lower.pal',  bank: 2 },
      { url: BASE + 'page_swap_others.pal', bank: 3 },
      { url: BASE + 'buttons.pal',          bank: 4 },
      { url: BASE + 'cursor.pal',           bank: 5 },
    ];
    for (const e of bgPals) {
      try {
        const pal = await loadGbaPal(e.url);
        LoadPalette(pal, e.bank * 16, Math.min(32, pal.byteLength));
        reBlackenFaded();  // re-black after each load (= no bleu flash entre awaits)
      } catch (innerE) {
        console.warn(`[naming-screen] BG pal ${e.url} failed:`, innerE);
      }
    }

    const keyboardPal = await loadGbaPal(BASE + 'keyboard.pal');
    LoadPalette(keyboardPal, 10 * 16, 32);  // bank 10
    reBlackenFaded();

    // 1:1 décomp src/naming_screen.c:1891 :
    //   LoadPalette(GetTextWindowPalette(2), BG_PLTT_ID(11), PLTT_SIZE_4BPP);
    // GetTextWindowPalette(2) → sTextWindowPalettes[2] (= text_window/text_pal2.pal).
    // idx 15 = (74,205,238) light blue → bg color du WIN_BANNER (= "DEPL./A OK/B RET.").
    // idx 12 = (49,82,205) blue, idx 13 = (164,197,246) light blue → text colors.
    // Avant ce fix on avait un fallback grayscale → idx 15 = 0x0000 (= noir) →
    // banner bg noir au lieu de bleu (= user feedback session 96).
    try {
      const textPal2 = await loadGbaPal('/decomp/em/ui/text_window/text_pal2.pal');
      LoadPalette(textPal2, 11 * 16, 32);  // bank 11 = WIN_BANNER bg
      // Bank 14 (= used by some other text prints) — same pal pour cohérence.
      LoadPalette(textPal2, 14 * 16, 32);
      reBlackenFaded();
    } catch (e) {
      console.warn('[naming-screen] text_pal2.pal failed, banner banner will be black:', e);
    }
  } catch (e) {
    console.warn('[naming-screen] loadNamingScreenAssets BG palettes failed:', e);
  }

  // ─── OBJ palettes (PALTAG_*) ──────────────────────────────────────────────
  // 1:1 décomp src/naming_screen.c:2581-2592 sSpritePalettes : 8 entries.
  // Le décomp utilise gNamingScreenMenu_Pal[N] (= 16 colors offset N*16) pour
  // PALTAG_MENU=0, PALTAG_PAGE_SWAP_UPPER=1, etc. Notre menu.pal contient
  // 16 colors only (= 1 bank). On charge depuis les autres .pal extraits.
  try {
    const palLoadOrder: { url: string, tag: string }[] = [
      // PALTAG_MENU (= menu.pal[0..15], used pour PCIcon + autres)
      { url: BASE + 'menu.pal', tag: PALTAG_MENU },
      // PALTAG_PAGE_SWAP_UPPER → page_swap_upper.pal
      { url: BASE + 'page_swap_upper.pal', tag: PALTAG_PAGE_SWAP_UPPER },
      // PALTAG_PAGE_SWAP_LOWER
      { url: BASE + 'page_swap_lower.pal', tag: PALTAG_PAGE_SWAP_LOWER },
      // PALTAG_PAGE_SWAP_OTHERS (= aussi pour input arrow + underscore)
      { url: BASE + 'page_swap_others.pal', tag: PALTAG_PAGE_SWAP_OTHERS },
      // PALTAG_PAGE_SWAP (= bouton background = buttons.pal)
      { url: BASE + 'buttons.pal', tag: PALTAG_PAGE_SWAP },
      // PALTAG_CURSOR
      { url: BASE + 'cursor.pal', tag: PALTAG_CURSOR },
      // PALTAG_BACK_BUTTON (= buttons.pal aussi)
      { url: BASE + 'buttons.pal', tag: PALTAG_BACK_BUTTON },
      // PALTAG_OK_BUTTON
      { url: BASE + 'buttons.pal', tag: PALTAG_OK_BUTTON },
    ];
    for (const e of palLoadOrder) {
      // 1:1 STRICT lookup via sSpritePaletteTags array primary (sprite.c:1637).
      if (IndexOfSpritePaletteTag(e.tag) !== 0xFF) continue;
      const pal = await loadGbaPal(e.url);
      // 1:1 décomp src/sprite.c:1589-1608 LoadSpritePalette : scan first-free
      // dans [gReservedSpritePaletteCount, 16). Avant : `nextObjPalSlot++` raw
      // saturait → palettes player+PNJ écrasées après cycles PC/bag/naming.
      // 1:1 STRICT scan first-free via sSpritePaletteTags array primary
      // (= sprite.c:1637-1645 IndexOfSpritePaletteTag(TAG_NONE)). Avant : scan
      // via Map secondary qui pouvait être désync avec l'array.
      const reserved = ((globalThis as Record<string, unknown>).gReservedSpritePaletteCount as number) ?? 0;
      const sp = (globalThis as Record<string, unknown>).__sprite as { sSpritePaletteTags?: Uint16Array } | undefined;
      let slot = -1;
      if (sp?.sSpritePaletteTags) {
        for (let i = reserved; i < 16; i++) {
          if (sp.sSpritePaletteTags[i] === 0xFFFF) { slot = i; break; }
        }
      }
      if (slot < 0) {
        console.warn(`[naming-screen] OBJ palette saturated (16/16), cannot load ${e.tag}`);
        continue;
      }
      // OBJ palette write : gPlttBufferUnfaded + Faded (= 1:1 LoadSpritePalette)
      for (let i = 0; i < Math.min(16, pal.length); i++) {
        rt.gPlttBufferUnfaded.set(256 + slot * 16 + i, pal[i]);
        rt.gPlttBufferFaded.set(256 + slot * 16 + i, pal[i]);
      }
      // Sync array primary (sSpritePaletteTags) + Map secondary via helper 1:1.
      // Sans ça, le prochain LoadSpritePalette voit le slot LIBRE dans l'array
      // → réalloue → écrase la palette naming screen.
      MarkObjPaletteAllocated(slot, e.tag);
      reBlackenFaded();
    }
  } catch (e) {
    console.warn('[naming-screen] loadNamingScreenAssets OBJ palettes failed:', e);
  }

  // ─── Sprite sheets (= load 4bpp tile data into objVram) ──────────────────
  // 1:1 décomp src/naming_screen.c:2564-2579 sSpriteSheets : 12 entries +
  // PCIcon (loaded separately via SpriteFrameImage table = TAG_NONE).
  //
  // CRITICAL : we use loadTileBin (= IDAT-parse) instead of loadIndexedPng
  // (= canvas-based, which produces RAINBOW STRIPES because the canvas
  // resampling produces slightly-off RGB values that get mapped to garbage
  // palette indices). Same class of bug as the original Lotad anim_front
  // issue (Session 91 polish). The .4bpp.bin files were extracted by
  // scripts/extract-png-indexed-tiles.mjs which preserves PLTE indices
  // 1:1 from the source PNG.
  //
  // Sheet ORDER is critical for the Cursor anim to work :
  //   anim 0 (Loop)        = frame 0..3  (= cursor.png base)
  //   anim 1 (Squish) cmd 1 = frame 4..7  (= cursor_squished.png at +0x8)
  //   anim 1 (Squish) cmd 2 = frame 8..11 (= cursor_filled.png base)
  // → cursor sheets loaded contiguously so frame N relative to cursor
  // tileBase points at the right byte range in objVram.
  //
  // Each entry has `sizeBytes` (= what to write into VRAM, 1:1 décomp size
  // arg of LoadSpriteSheet) and `srcOffset` (= byte offset into the loaded
  // .4bpp.bin to start reading from, 1:1 décomp `gXxx_Gfx + offset`).
  const sheets: ReadonlyArray<{ url: string; tag: string; sizeBytes: number; srcOffset: number }> = [
    { url: BASE + 'back_button.png',      tag: GFXTAG_BACK_BUTTON,      sizeBytes: 0x1E0, srcOffset: 0 },
    { url: BASE + 'ok_button.png',        tag: GFXTAG_OK_BUTTON,        sizeBytes: 0x1E0, srcOffset: 0 },
    { url: BASE + 'page_swap_frame.png',  tag: GFXTAG_PAGE_SWAP_FRAME,  sizeBytes: 0x280, srcOffset: 0 },
    // Note: décomp `gNamingScreenPageSwapButton_Gfx + 0x8` = `0x8 * sizeof(u32)`
    // = 32 bytes = 1 tile offset. Notre srcOffset est en BYTES, donc 0x20 = 32.
    // Bug session 96 : avant on avait 0x8 = 8 bytes → tile mal aligné, button bg
    // ne couvrait pas le centre du frame → BG transparent visible derrière le texte.
    { url: BASE + 'page_swap_button.png', tag: GFXTAG_PAGE_SWAP_BUTTON, sizeBytes: 0x100, srcOffset: 0x20 },
    { url: BASE + 'page_swap_upper.png',  tag: GFXTAG_PAGE_SWAP_UPPER,  sizeBytes: 0x060, srcOffset: 0 },
    { url: BASE + 'page_swap_lower.png',  tag: GFXTAG_PAGE_SWAP_LOWER,  sizeBytes: 0x060, srcOffset: 0 },
    { url: BASE + 'page_swap_others.png', tag: GFXTAG_PAGE_SWAP_OTHERS, sizeBytes: 0x060, srcOffset: 0 },
    { url: BASE + 'cursor.png',           tag: GFXTAG_CURSOR,           sizeBytes: 0x080, srcOffset: 0 },
    // Same fix : décomp `gNamingScreenCursorSquished_Gfx + 0x8` u32 = 32 bytes.
    { url: BASE + 'cursor_squished.png',  tag: GFXTAG_CURSOR_SQUISHED,  sizeBytes: 0x080, srcOffset: 0x20 },
    { url: BASE + 'cursor_filled.png',    tag: GFXTAG_CURSOR_FILLED,    sizeBytes: 0x080, srcOffset: 0 },
    { url: BASE + 'input_arrow.png',      tag: GFXTAG_INPUT_ARROW,      sizeBytes: 0x020, srcOffset: 0 },
    { url: BASE + 'underscore.png',       tag: GFXTAG_UNDERSCORE,       sizeBytes: 0x020, srcOffset: 0 },
    // PCIcon — décomp uses `images = sImageTable_PCIcon` with TAG_NONE, but
    // we model it as a separate gfx tag so CreateSprite can use the pre-baked
    // tile base (= no per-frame CopyToVram needed for the simple frame 0).
    { url: BASE + 'pc_icon_off.png',      tag: GFXTAG_PC_ICON_OFF,      sizeBytes: 0x0C0, srcOffset: 0 },
  ];
  try {
    // 1:1 STRICT décomp src/sprite.c:1486-1500 LoadSpriteSheet pour chaque
    // entry : AllocSpriteTiles (bitmap scan first-free) → AllocSpriteTileRange
    // → CpuCopy16. Source unique = arrays primary.
    const sp = (globalThis as Record<string, unknown>).__sprite as {
      AllocSpriteTiles?: (count: number) => number;
    } | undefined;
    for (const sheet of sheets) {
      // 1:1 STRICT check via array primary (sSpriteTileRangeTags).
      if (GetSpriteTileStartByTag(sheet.tag) !== 0xFFFF) continue;
      const charData = await loadTileBin(sheet.url, 4);
      const tileCount = sheet.sizeBytes >> 5;
      const tileStart = sp?.AllocSpriteTiles?.(tileCount) ?? -1;
      if (tileStart < 0) {
        console.warn(`[naming-screen] OBJ VRAM saturated, cannot load ${sheet.tag}`);
        continue;
      }
      const byteOffset = tileStart << 5;
      // Source slice : srcOffset..srcOffset+sizeBytes (clamped to file end).
      const srcStart = Math.min(sheet.srcOffset, charData.length);
      const srcEnd = Math.min(srcStart + sheet.sizeBytes, charData.length);
      const writeSize = Math.min(srcEnd - srcStart, rt.gba.objVram.length - byteOffset);
      if (writeSize > 0) {
        rt.gba.objVram.set(charData.subarray(srcStart, srcStart + writeSize), byteOffset);
      }
      // 1:1 STRICT AllocSpriteTileRange : sync sSpriteTileRangeTags array primary.
      AllocSpriteTileRange(sheet.tag, tileStart, tileCount);
    }
  } catch (e) {
    console.warn('[naming-screen] loadNamingScreenAssets sprite sheets failed:', e);
  }

  // ─── PLAYER trainer icon assets (= via object_event_graphics framework) ───
  // 1:1 décomp src/naming_screen.c:1397-1406 NamingScreen_CreatePlayerIcon
  // utilise CreateObjectGraphicsSprite(rivalGfxId, ...) qui passe par le
  // framework `gObjectEventGraphicsInfoPointers[gfxId]` → gfxInfo → loaded
  // tile sheet + palette via le framework helper. La logique de repack
  // frame-major est centralisée dans `loadObjectEventGraphicsInfo` pour TOUS
  // les overworld sprites (= naming screen + Phase 4 NPCs + futur).
  try {
    await loadObjectEventGraphicsInfo(rt, OBJ_EVENT_GFX_RIVAL_BRENDAN_NORMAL);
    await loadObjectEventGraphicsInfo(rt, OBJ_EVENT_GFX_RIVAL_MAY_NORMAL);
  } catch (e) {
    console.warn('[naming-screen] PLAYER trainer assets failed:', e);
  }

  // ─── BG tile graphics + tilemaps (= 1:1 décomp:1873-1876 LoadGfx + 623-626 DrawBgTilemap) ─
  // LoadGfx (décomp:1871-1879) :
  //   LZ77UnCompWram(gNamingScreenMenu_Gfx, sNamingScreen->tileBuffer);
  //   LoadBgTiles(1, sNamingScreen->tileBuffer, sizeof(sNamingScreen->tileBuffer), 0);
  //   LoadBgTiles(2, sNamingScreen->tileBuffer, sizeof(sNamingScreen->tileBuffer), 0);
  //   LoadBgTiles(3, sNamingScreen->tileBuffer, sizeof(sNamingScreen->tileBuffer), 0);
  //
  // gNamingScreenMenu_Gfx (= graphics/naming_screen/menu.png post-LZ77, 48 tiles
  // 4bpp = 1536 bytes). On charge dans BG1+BG2 (charBase=2, mêmes tiles partagés)
  // et BG3 (charBase=3, copie séparée). Notre engine bg(N).vram pointe sur le
  // charBase de chaque BG → écriture à offset 0 dans chacun = 1:1 décomp.
  try {
    if (!_menuGfx) {
      _menuGfx = await loadTileBin(BASE + 'menu.png', 4);
    }
    LoadBgTiles(1, _menuGfx, _menuGfx.byteLength, 0);
    LoadBgTiles(2, _menuGfx, _menuGfx.byteLength, 0);
    LoadBgTiles(3, _menuGfx, _menuGfx.byteLength, 0);
  } catch (e) {
    console.warn('[naming-screen] BG tiles (menu.4bpp) failed:', e);
  }

  // BG tilemaps (= 1:1 décomp:623-626 DrawBgTilemap calls dans MainState_FadeIn).
  // Les .bin sont déjà décompressés (= 1280 bytes = 32×20 tiles entries u16).
  // On les cache en module state ; DrawBgTilemap les copy dans bg.tilemap au
  // call MainState_FadeIn + DrawKeyboardPageOnDeck.
  try {
    if (!_bgTilemapBackground)      _bgTilemapBackground      = await loadTilemapBin(BASE + 'background.bin');
    if (!_bgTilemapKeyboardUpper)   _bgTilemapKeyboardUpper   = await loadTilemapBin(BASE + 'keyboard_upper.bin');
    if (!_bgTilemapKeyboardLower)   _bgTilemapKeyboardLower   = await loadTilemapBin(BASE + 'keyboard_lower.bin');
    if (!_bgTilemapKeyboardSymbols) _bgTilemapKeyboardSymbols = await loadTilemapBin(BASE + 'keyboard_symbols.bin');
  } catch (e) {
    console.warn('[naming-screen] BG tilemaps failed:', e);
  }

  _assetsLoaded = true;
}

// ─── DoNamingScreen API 1:1 décomp src/naming_screen.c:396-417 ───────────────

export function DoNamingScreen(
  templateNum: number,
  destBuffer: number[] | string,
  monSpecies: number,
  monGender: number,
  monPersonality: number,
  returnCallback: ((rt: unknown) => void) | null,
): void {
  const rt = getRuntime();
  if (!rt) return;

  const tpl = sNamingScreenTemplates[templateNum] ?? sNamingScreenTemplates[0];

  sNamingScreen = {
    state: STATE_FADE_IN,
    windows: [-1, -1, -1, -1, -1],
    inputCharBaseXPos: Math.floor((240 - tpl.maxChars * 8) / 2) + 6,
    bg1vOffset: 0,
    bg2vOffset: 0,
    bg1Priority: 1,
    bg2Priority: 2,
    bgToReveal: 0,
    bgToHide: 1,
    currentPage: tpl.initialPage,
    cursorSpriteId: -1,
    swapBtnFrameSpriteId: -1,
    template: tpl,
    templateNum,
    destBuffer,
    monSpecies,
    monGender,
    monPersonality,
    returnCallback,
    textBuffer: [],
    inputTaskId: -1,
    buttonFlashTaskId: -1,
    pageSwapTaskId: -1,
    cursorX: 0,
    cursorY: 0,
    textCaretPosition: 0,
    keyRepeatStartDelayCopy: gKeyRepeat.startDelay,
    pageSwapTextSpriteId: -1,
    pageSwapButtonSpriteId: -1,
    backButtonSpriteId: -1,
    okButtonSpriteId: -1,
    inputArrowSpriteId: -1,
    underscoreSpriteIds: [],
  };

  // Install post-syncSpritesToOam hook so subsprite child OAMs survive
  // tickFixed's syncSpritesToOam pass. See decomp-runtime.ts:1795 hook
  // dispatch comment for foundation rationale.
  (globalThis as Record<string, unknown>)._syncSubspriteOam = syncSubspriteOam;

  rt.gMain.state = 0;
  rt.SetMainCallback2(CB2_LoadNamingScreen);
}
(globalThis as Record<string, unknown>).DoNamingScreen = DoNamingScreen;

// ─── CB2_LoadNamingScreen 1:1 décomp src/naming_screen.c:419-464 ─────────────

let _loadInProgress = false;

function CB2_LoadNamingScreen(): void {
  const rt = getRuntime();
  if (!rt || !sNamingScreen) return;

  switch (rt.gMain.state) {
    case 0:
      NamingScreen_Init();
      rt.gMain.state++;
      break;
    case 1:
      NamingScreen_InitBGs();
      rt.gMain.state++;
      break;
    case 2:
      ResetPaletteFade();
      rt.gMain.state++;
      break;
    case 3:
      // 1:1 STRICT décomp ResetSpriteData + FreeAllSpritePalettes au boot
      // d'écran (= clear arrays primary + bitmap). Source UNIQUE.
      ResetSpriteData();
      FreeAllSpritePalettes();
      _assetsLoaded = false;  // force reload (= fresh slot/tile assignments)
      clearAllSubspriteTables();
      rt.gMain.state++;
      break;
    case 4:
      ResetTasks();
      rt.gMain.state++;
      break;
    case 5:
      // LoadPalettes — async load palettes (BG + OBJ)
      if (!_loadInProgress) {
        _loadInProgress = true;
        loadNamingScreenAssets().finally(() => {
          _loadInProgress = false;
          // ⚠️ Pre-blacken palette buffer IMMEDIATELY après async load.
          // Voir hook loadNamingScreenAssets() qui appelle BlendPalettes
          // au DÉBUT (= avant les LoadPalette individuels) pour neutraliser
          // les frames intermédiaires.
          BlendPalettes(0xFFFFFFFF, 16, 0x0000);
          if (rt.gMain.state === 5) rt.gMain.state++;
        });
      }
      break;
    case 6:
      // LoadGfx — already done by loadNamingScreenAssets (= unified)
      rt.gMain.state++;
      break;
    case 7:
      CreateSprites();
      // ⚠️ Pre-black palette JUSTE AVANT ShowBgs.
      // Le .finally() du case 5 BlendPalettes peut être trop tard (= state++
      // déjà à 6 quand finally fire si LoadPalettes await yields), et même
      // s'il fire à temps, frames intermédiaires entre LoadPalette (bank 0
      // = menu.pal idx 0 = bleu keyboard bg) et finally restent visibles.
      // Re-blacken juste avant ShowBgs garantit l'écran noir au premier
      // frame où les BGs deviennent visibles → MainState_FadeIn fade depuis
      // ce black. 1:1 ROM behavior reproduit (= ROM avait softwareFadeFinishing
      // de la previous scene qui maintenait brightness=16 = black ; nous on
      // simule via BlendPalettes synchrone.).
      BlendPalettes(0xFFFFFFFF, 16, 0x0000);
      rt.UpdatePaletteFade();
      NamingScreen_ShowBgs();
      rt.gMain.state++;
      break;
    default:
      // CreateHelperTasks + CreateNamingScreenTask
      CreateHelperTasks();
      CreateNamingScreenTask();
      break;
  }
}

// ─── NamingScreen_Init (= 1:1 décomp src/naming_screen.c:466-485) ────────────

function NamingScreen_Init(): void {
  if (!sNamingScreen) return;
  sNamingScreen.state = STATE_FADE_IN;
  sNamingScreen.bg1vOffset = 0;
  sNamingScreen.bg2vOffset = 0;
  sNamingScreen.currentPage = sNamingScreen.template.initialPage;
  sNamingScreen.inputCharBaseXPos = Math.floor((240 - sNamingScreen.template.maxChars * 8) / 2) + 6;
  // 1:1 décomp src/naming_screen.c:480-484 :
  //   sNamingScreen->keyRepeatStartDelayCopy = gKeyRepeatStartDelay;
  //   gKeyRepeatStartDelay = 16;
  // Save current global value (= 40 via InitKeys ou autre scene-specific) puis
  // override à 16 (= cursor nav fluide pendant naming). Restauré au cleanup.
  sNamingScreen.keyRepeatStartDelayCopy = gKeyRepeat.startDelay;
  gKeyRepeat.startDelay = 16;
  // text buffer empty (or copy if copyExistingString)
  if (sNamingScreen.template.copyExistingString && typeof sNamingScreen.destBuffer === 'string') {
    sNamingScreen.textBuffer = sNamingScreen.destBuffer.split('');
  } else if (sNamingScreen.template.copyExistingString && Array.isArray(sNamingScreen.destBuffer)) {
    sNamingScreen.textBuffer = sNamingScreen.destBuffer.map((c: any) => typeof c === 'number' ? String.fromCharCode(c) : String(c));
  } else {
    sNamingScreen.textBuffer = [];
  }
}

// ─── NamingScreen_InitBGs (= 1:1 décomp src/naming_screen.c:498-536) ─────────

function NamingScreen_InitBGs(): void {
  const rt = getRuntime();
  if (!rt || !sNamingScreen) return;

  // 1:1 décomp src/naming_screen.c:502-504 :
  //   DmaClearLarge16(3, (void *)VRAM, VRAM_SIZE, 0x1000);
  //   DmaClear32(3, (void *)OAM, OAM_SIZE);
  //   DmaClear16(3, (void *)PLTT, PLTT_SIZE);
  // Wipe all GBA memory before init — ensures BG tiles + tilemaps + palette
  // banks left over from the previous scene (= Birch ground spotlight gradient
  // on BG2/BG3 + sBirchSpeechBgGradientPal) don't bleed through naming screen
  // BGs. Foundational : every scene transition that touches BG layers needs
  // this same clear to avoid cross-scene visual artifacts.
  CpuFill32(0, VRAM, VRAM_SIZE);
  CpuFill32(0, OAM, OAM_SIZE);
  CpuFill16(0, PLTT, PLTT_SIZE);

  rt.SetGpuReg(0x000, 0);  // REG_OFFSET_DISPCNT = 0

  // 1:1 décomp src/naming_screen.c:506-510 — reset BG vOFS/hOFS depuis le scene
  // précédent (= Birch laisse BG1 vOFS=64, hOFS=3 après son fade slide).
  // Sans ce reset, le 2-page keyboard apparaît shifted (= bug session 95).
  rt.SetGpuReg(0x010, 0); rt.SetGpuReg(0x012, 0);  // BG0HOFS / BG0VOFS
  rt.SetGpuReg(0x014, 0); rt.SetGpuReg(0x016, 0);  // BG1HOFS / BG1VOFS
  rt.SetGpuReg(0x018, 0); rt.SetGpuReg(0x01A, 0);  // BG2HOFS / BG2VOFS
  rt.SetGpuReg(0x01C, 0); rt.SetGpuReg(0x01E, 0);  // BG3HOFS / BG3VOFS

  ResetBgsAndClearDma3BusyFlags(0);
  InitBgsFromTemplates(0, sBgTemplates_NamingScreen as any, sBgTemplates_NamingScreen.length);

  // Add 5 windows (= 1:1 décomp WIN_KB_PAGE_1, _2, TEXT_ENTRY, TEXT_ENTRY_BOX, BANNER)
  for (let i = 0; i < 5; i++) {
    sNamingScreen.windows[i] = AddWindow(sWindowTemplates_NamingScreen[i]);
  }

  // DISPCNT : OBJ + BG0+1+2+3 (= mode 0 + obj 1d + obj on)
  rt.SetGpuReg(0x000, 0x1F40);
  // Alpha blend BG1 + BG2 target2 (= for page swap fade)
  rt.SetGpuReg(0x050, 0x0640);
  rt.SetGpuReg(0x052, (12 << 0) | (8 << 8));  // BLDALPHA eva=12 evb=8

  // Clear BG tilemap buffers
  FillBgTilemapBufferRect_Palette0(1, 0, 0, 0, 0x20, 0x20);
  FillBgTilemapBufferRect_Palette0(2, 0, 0, 0, 0x20, 0x20);
  FillBgTilemapBufferRect_Palette0(3, 0, 0, 0, 0x20, 0x20);
}

// ─── CreateNamingScreenTask 1:1 décomp src/naming_screen.c:538-542 ──────────

function CreateNamingScreenTask(): void {
  const rt = getRuntime();
  if (!rt) return;
  rt.CreateTask((t) => Task_NamingScreen(t), 2);
  rt.SetMainCallback2(CB2_NamingScreen);
}

// ─── NamingScreen_ShowBgs (= 1:1 décomp:2046-2052) ──────────────────────────

function NamingScreen_ShowBgs(): void {
  ShowBg(0);
  ShowBg(1);
  ShowBg(2);
  ShowBg(3);
  // Notre window-system tracking aussi (= ShowBgWin garde l'état du compositor synchroniseé)
  void ShowBgWin; void HideBgWin;
}

// ─── CB2_NamingScreen 1:1 décomp src/naming_screen.c:2014-2020 ──────────────

function CB2_NamingScreen(): void {
  const rt = getRuntime();
  if (!rt) return;
  rt.runTasks();
  // AnimateSprites + BuildOamBuffer 1:1 — animations + sprite callbacks +
  // sync sprite → oam. Notre engine fait ça automatiquement dans tickFixed,
  // mais le décomp les call ici dans le CB2 (= plus tôt dans la frame).
  rt.tickSpriteAnimsPublic();
  rt.runSpriteCallbacksPublic();
  rt.syncSpritesToOamPublic();
  // Subsprite OAM sync (= notre extension pour SetSubspriteTables)
  syncSubspriteOam();
  rt.UpdatePaletteFade();

  // 1:1 décomp src/naming_screen.c:2033-2044 VBlankCB_NamingScreen — sync
  // bg1vOffset/bg2vOffset + bg1Priority/bg2Priority depuis sNamingScreen state
  // vers les GPU registers chaque frame. Critical pour :
  //   - Reset BG offsets au démarrage (= sinon BG1 vOFS=64 hOFS=3 lingering
  //     depuis Birch fade slide → keyboard shifted)
  //   - Page swap animation : Sin wave anime bg1vOffset/bg2vOffset frame-par-
  //     frame, BG affiché doit suivre.
  //   - Page swap priority swap : à mid-anim, BG1<->BG2 priority flip pour
  //     révéler la nouvelle page (= deck → front).
  if (sNamingScreen) {
    rt.SetGpuReg(0x016, sNamingScreen.bg1vOffset & 0x1FF);  // BG1VOFS
    rt.SetGpuReg(0x01A, sNamingScreen.bg2vOffset & 0x1FF);  // BG2VOFS
    rt.gba.bg(1).config.priority = (sNamingScreen.bg1Priority & 3) as 0 | 1 | 2 | 3;
    rt.gba.bg(2).config.priority = (sNamingScreen.bg2Priority & 3) as 0 | 1 | 2 | 3;
  }
}

// ─── Task_NamingScreen 1:1 décomp src/naming_screen.c:544-582 ────────────────

function Task_NamingScreen(_task: DecompTask): void {
  if (!sNamingScreen) return;
  switch (sNamingScreen.state) {
    case STATE_FADE_IN:
      MainState_FadeIn();
      SetSpritesVisible();
      break;
    case STATE_WAIT_FADE_IN:
      MainState_WaitFadeIn();
      break;
    case STATE_HANDLE_INPUT:
      MainState_HandleInput();
      break;
    case STATE_MOVE_TO_OK_BUTTON:
      MainState_MoveToOKButton();
      MainState_HandleInput();
      break;
    case STATE_START_PAGE_SWAP:
      MainState_StartPageSwap();
      break;
    case STATE_WAIT_PAGE_SWAP:
      MainState_WaitPageSwap();
      break;
    case STATE_PRESSED_OK:
      MainState_PressedOKButton();
      break;
    case STATE_FADE_OUT:
      MainState_FadeOut();
      break;
    case STATE_EXIT:
      MainState_Exit();
      break;
  }
}

// ─── SetSpritesVisible 1:1 décomp:487-496 ────────────────────────────────────

function SetSpritesVisible(): void {
  if (!sNamingScreen) return;
  const rt = getRuntime();
  if (!rt) return;
  for (let i = 0; i < MAX_SPRITES; i++) {
    const sprite = rt.gSprites[i];
    if (sprite !== undefined && sprite.inUse) sprite.invisible = false;
  }
  SetCursorInvisibility(false);
}

// ─── MainState_* (1:1 décomp state machine) ──────────────────────────────────

function MainState_FadeIn(): void {
  if (!sNamingScreen) return;
  const rt = getRuntime();
  if (!rt) return;

  // 1:1 décomp src/naming_screen.c:621-640 (MainState_FadeIn body) :
  //   DrawBgTilemap(3, gNamingScreenBackground_Tilemap);
  //   sNamingScreen->currentPage = KBPAGE_LETTERS_UPPER;
  //   DrawBgTilemap(2, gNamingScreenKeyboardLower_Tilemap);
  //   DrawBgTilemap(1, gNamingScreenKeyboardUpper_Tilemap);
  //   PrintKeyboardKeys(WIN_KB_PAGE_2, KEYBOARD_LETTERS_LOWER);
  //   PrintKeyboardKeys(WIN_KB_PAGE_1, KEYBOARD_LETTERS_UPPER);
  //   ...DrawTextEntryBox / DrawTextEntry / PrintControls...
  //   BeginNormalPaletteFade(...);
  DrawBgTilemap(3, _bgTilemapBackground);
  sNamingScreen.currentPage = KBPAGE_LETTERS_UPPER;
  DrawBgTilemap(2, _bgTilemapKeyboardLower);
  DrawBgTilemap(1, _bgTilemapKeyboardUpper);

  // Draw text entry + title + banner (= window text printer)
  DrawTextEntryBox();
  DrawTextEntry();
  PrintControls();
  // Keyboard text glyphs : OnFront = WIN_KB_PAGE_1 (= currentPage UPPER) +
  // OnDeck = WIN_KB_PAGE_2 (= LOWER, ready to swap).
  PrintKeyboardKeysOnDeck();
  PrintKeyboardKeysOnFront();

  // Begin fade in (= 1:1 décomp BlendPalettes(ALL, 16, 0); BeginNormalPaletteFade(ALL, 0, 16, 0, BLACK)).
  rt.BeginNormalPaletteFade('PALETTES_ALL', 0, 16, 0, 'RGB_BLACK');
  sNamingScreen.state = STATE_WAIT_FADE_IN;
}

function MainState_WaitFadeIn(): void {
  if (!sNamingScreen) return;
  const rt = getRuntime();
  if (!rt) return;
  if (!rt.gPaletteFade.active) {
    SetInputState(INPUT_STATE_ENABLED);
    SetCursorFlashing(true);
    sNamingScreen.state = STATE_HANDLE_INPUT;
  }
}

function MainState_HandleInput(): void {
  HandleKeyboardEvent();
}

function MainState_MoveToOKButton(): void {
  if (!sNamingScreen) return;
  if (IsCursorAnimFinished()) {
    SetInputState(INPUT_STATE_ENABLED);
    MoveCursorToOKButton();
    sNamingScreen.state = STATE_HANDLE_INPUT;
  }
}

function MainState_PressedOKButton(): void {
  if (!sNamingScreen) return;
  SaveInputText();
  SetInputState(INPUT_STATE_DISABLED);
  SetCursorFlashing(false);
  TryStartButtonFlash(BUTTON_COUNT, false, true);
  sNamingScreen.state = STATE_FADE_OUT;
}

function MainState_FadeOut(): void {
  if (!sNamingScreen) return;
  const rt = getRuntime();
  if (!rt) return;
  rt.BeginNormalPaletteFade('PALETTES_ALL', 0, 0, 16, 'RGB_BLACK');
  sNamingScreen.state = STATE_EXIT;
}

function MainState_Exit(): void {
  if (!sNamingScreen) return;
  const rt = getRuntime();
  if (!rt) return;
  if (!rt.gPaletteFade.active) {
    const cb = sNamingScreen.returnCallback;
    // 1:1 décomp src/naming_screen.c (cleanup path) : restore gKeyRepeatStartDelay
    // depuis keyRepeatStartDelayCopy (= valeur d'avant l'override à 16).
    gKeyRepeat.startDelay = sNamingScreen.keyRepeatStartDelayCopy;
    // Cleanup subsprites + tasks + post-sync hook
    clearAllSubspriteTables();
    delete (globalThis as Record<string, unknown>)._syncSubspriteOam;
    if (sNamingScreen.inputTaskId >= 0) rt.DestroyTask(sNamingScreen.inputTaskId);
    if (sNamingScreen.buttonFlashTaskId >= 0) rt.DestroyTask(sNamingScreen.buttonFlashTaskId);
    if (sNamingScreen.pageSwapTaskId >= 0) rt.DestroyTask(sNamingScreen.pageSwapTaskId);
    sNamingScreen = null;
    if (cb) {
      rt.SetMainCallback2(cb as any);
    }
  }
}

function MainState_StartPageSwap(): void {
  if (!sNamingScreen) return;
  SetInputState(INPUT_STATE_DISABLED);
  StartPageSwapButtonAnim();
  StartPageSwapAnim();
  SetCursorInvisibility(true);
  TryStartButtonFlash(BUTTON_PAGE, false, true);
  PlaySE(5);  // SE_WIN_OPEN
  sNamingScreen.state = STATE_WAIT_PAGE_SWAP;
}

function MainState_WaitPageSwap(): void {
  if (!sNamingScreen) return;
  if (IsPageSwapAnimNotInProgress()) {
    const cursorPos = GetCursorPos();
    const onLastColumn = (cursorPos.x === GetCurrentPageColumnCount());

    sNamingScreen.state = STATE_HANDLE_INPUT;
    sNamingScreen.currentPage = (sNamingScreen.currentPage + 1) % KBPAGE_COUNT;

    let cursorX = cursorPos.x;
    if (onLastColumn) {
      cursorX = GetCurrentPageColumnCount();
    } else {
      if (cursorX >= GetCurrentPageColumnCount()) {
        cursorX = GetCurrentPageColumnCount() - 1;
      }
    }
    SetCursorPos(cursorX, cursorPos.y);

    // 1:1 décomp src/naming_screen.c:786 MainState_WaitPageSwap :
    //   DrawKeyboardPageOnDeck();
    //
    // ⚠️ Bug fix : notre version ancien appelait `PrintKeyboardKeysOnFront()`
    // ICI APRÈS DrawKeyboardPageOnDeck. PrintKeyboardKeysOnFront était
    // hardcodé sur `WIN_KB_PAGE_1` (= n'inverse pas avec les swaps). Ça
    // overwrite les glyphs SYMBOLS qui viennent d'être dessinés par
    // DrawKeyboardPageOnDeck dans WIN_KB_PAGE_1 (quand bg1Priority>bg2Priority,
    // = le on-deck est BG1) avec les glyphs LOWER → user voit DEUX pages
    // LOWER au lieu de LOWER+SYMBOLS lors du 2e SELECT swap.
    // Le décomp ne fait QUE DrawKeyboardPageOnDeck — la "front" reste comme
    // elle était (= elle a été dessinée par le précédent DrawKeyboardPageOnDeck
    // quand elle était on-deck).
    DrawKeyboardPageOnDeck();

    SetInputState(INPUT_STATE_ENABLED);
    SetCursorInvisibility(false);
  }
}

// ─── DrawKeyboardPageOnDeck 1:1 décomp:1977-2002 ────────────────────────────
function DrawKeyboardPageOnDeck(): void {
  if (!sNamingScreen) return;
  // Décomp lit BG1CNT/BG2CNT priority bits. Notre struct sNamingScreen tient
  // les mêmes valeurs (= bg1Priority/bg2Priority sync via VBlankCB_NamingScreen).
  // Higher priority = drawn behind = on-deck (= invisible currently).
  let bg: number, windowId: number;
  if (sNamingScreen.bg1Priority > sNamingScreen.bg2Priority) {
    bg = 1;
    windowId = sNamingScreen.windows[WIN_KB_PAGE_1];
  } else {
    bg = 2;
    windowId = sNamingScreen.windows[WIN_KB_PAGE_2];
  }
  DrawBgTilemap(bg, getNextKeyboardTilemap(sNamingScreen.currentPage));
  if (windowId >= 0) {
    const kbId = sPageToNextKeyboardId[sNamingScreen.currentPage];
    drawKeyboardWindow(windowId, kbId);
  }
}

// ─── CreateSprites 1:1 décomp:1111-1118 ──────────────────────────────────────

function CreateSprites(): void {
  CreateCursorSprite();
  CreatePageSwapButtonSprites();
  CreateBackOkSprites();
  CreateTextEntrySprites();
  CreateInputTargetIcon();
}

// ─── CreateCursorSprite 1:1 décomp:1120-1129 ────────────────────────────────

function CreateCursorSprite(): void {
  if (!sNamingScreen) return;
  const rt = getRuntime();
  if (!rt) return;

  const tileBase = GetSpriteTileStartByTag(GFXTAG_CURSOR);
  const palSlot = IndexOfSpritePaletteTag(PALTAG_CURSOR);
  if (tileBase === 0xFFFF || palSlot === 0xFF) {
    console.warn('[naming-screen] CreateCursorSprite : tile/pal not loaded');
    return;
  }

  // 1:1 décomp sOam_16x16 → shape=0 (square), size=1 (16x16)
  const { spriteId } = rt.CreateSpriteAtOam({
    tileId: tileBase,
    paletteBank: palSlot,
    x: 38, y: 88,
    shape: 0, size: 1,
    priority: 1,
  });
  sNamingScreen.cursorSpriteId = spriteId;
  if (spriteId >= 0) {
    const sprite = rt.gSprites[spriteId];
    if (sprite) {
      // tileBase needed by our local cursor anim FSM (= used to compute
      // oam.tileId = tileBase + tileOffset for anim frame switching).
      sprite.tileBase = tileBase;
      // 1:1 décomp:1124 — oam.priority = 1
      rt.gba.oam[sprite.oamIndex].priority = 1;
      // 1:1 décomp:1125 — oam.objMode = ST_OAM_OBJ_BLEND
      rt.gba.oam[sprite.oamIndex].objMode = 1;  // ST_OAM_OBJ_BLEND
      sprite.objMode = 1;
      // sColorIncr (data[6]) initialized to 2 (l.1127)
      sprite.data[6] = 2;
      // Install callback
      sprite.callback = SpriteCB_Cursor;
    }
  }
  SetCursorInvisibility(true);
  SetCursorPos(0, 0);
}

// ─── SetCursorPos 1:1 décomp:1131-1145 ──────────────────────────────────────

function SetCursorPos(x: number, y: number): void {
  if (!sNamingScreen) return;
  const rt = getRuntime();
  if (!rt) return;
  const sprite = rt.gSprites[sNamingScreen.cursorSpriteId];
  if (!sprite) return;
  const kbId = sPageToKeyboardId[sNamingScreen.currentPage];
  if (x < sPageColumnCounts[kbId]) {
    // 1:1 décomp:1136 — sprite.x = sPageColumnXPos[col] + 38.
    // Décomp `sprite.x` = LOGICAL CENTER. Le syncSpritesToOam compute
    // oam.x = sprite.x + centerToCornerVecX (= -8 pour 16x16) → oam.x = +30.
    // Note : lors d'un précédent test, cursor était décalé "S donne Q" →
    // on avait poussé à +30. Le vrai cause était le BG tilemap clavier non
    // loaded (= les glyph windows ne s'alignaient pas avec le frame). Avec
    // les BG tilemaps maintenant correctement chargés, +38 strict décomp est
    // OK et place le ring sur le char attendu.
    sprite.x = sPageColumnXPos[kbId][x] + 38;
  } else {
    // On button column — sprite cursor is invisible per SpriteCB_Cursor logic
    sprite.x = 0;
  }
  sprite.y = y * 16 + 88;
  // Update sX/sY/sPrevX/sPrevY (= sprite.data[0..3])
  sprite.data[2] = sprite.data[0];  // sPrevX = sX
  sprite.data[3] = sprite.data[1];  // sPrevY = sY
  sprite.data[0] = x;               // sX
  sprite.data[1] = y;               // sY
  sNamingScreen.cursorX = x;
  sNamingScreen.cursorY = y;
}

function GetCursorPos(): { x: number, y: number } {
  if (!sNamingScreen) return { x: 0, y: 0 };
  return { x: sNamingScreen.cursorX, y: sNamingScreen.cursorY };
}

function MoveCursorToOKButton(): void {
  if (!sNamingScreen) return;
  SetCursorPos(GetCurrentPageColumnCount(), 2);
}

// ─── SetCursorInvisibility 1:1 décomp:1160-1165 ─────────────────────────────

function SetCursorInvisibility(invisible: boolean): void {
  if (!sNamingScreen) return;
  const rt = getRuntime();
  if (!rt) return;
  const sprite = rt.gSprites[sNamingScreen.cursorSpriteId];
  if (!sprite) return;
  // 1:1 décomp : data[4] is bit-packed (low byte = invisible, high byte = flashing)
  sprite.data[4] = (sprite.data[4] & 0xFF00) | (invisible ? 1 : 0);
  // 1:1 décomp:1164 : StartSpriteAnim(cursor, 0). Local FSM here too.
  _startCursorAnim(sprite, rt, 0);
  sprite.invisible = invisible;
}

function SetCursorFlashing(flashing: boolean): void {
  if (!sNamingScreen) return;
  const rt = getRuntime();
  if (!rt) return;
  const sprite = rt.gSprites[sNamingScreen.cursorSpriteId];
  if (!sprite) return;
  sprite.data[4] = (sprite.data[4] & 0xFF) | ((flashing ? 1 : 0) << 8);
}

function IsCursorAnimFinished(): boolean {
  if (!sNamingScreen) return true;
  const rt = getRuntime();
  if (!rt) return true;
  const sprite = rt.gSprites[sNamingScreen.cursorSpriteId];
  if (!sprite) return true;
  return sprite.animEnded;
}

// ─── Cursor anim FSM (= 1:1 décomp sAnims_Cursor + tickSpriteAnims) ────────
//
// The cursor was created via CreateSpriteAtOam (= no spriteAnimStates entry),
// so rt.StartSpriteAnim is a silent no-op for it (Session 91 polish noted
// this same class of bug for Lotad — see AUDIT V2 Session 91 polish notes).
//
// We inline the cursor's small anim state machine using sprite.data[9..11]
// (= unused by the decomp `sX/sY/sPrev/sInvisible/sFlashing/sColor/sIncr/sDelay`
// at data[0..7]).
//
// 1:1 décomp src/naming_screen.c:2404-2433 :
//   sAnim_Loop          : ANIMCMD_FRAME(0, 1) ANIMCMD_JUMP(0)   // tile 0 forever
//   sAnim_CursorSquish  : ANIMCMD_FRAME(4, 8) ANIMCMD_FRAME(8, 8) ANIMCMD_END
//
// Frame indices are relative to the sprite's tileBase (= cursor sheet base).
// Squish anim uses the cursor_squished sheet (loaded at +4 tiles) and
// cursor_filled sheet (+8 tiles) — see loadNamingScreenAssets.
const CURSOR_ANIM_DATA_IDX = 9;     // animIdx (0=loop, 1=squish)
const CURSOR_ANIM_DATA_FRAME = 10;  // current frame within anim
const CURSOR_ANIM_DATA_DELAY = 11;  // frames remaining for current frame

function _setCursorAnimFrame(sprite: DecompSprite, _rt: any, tileOffset: number): void {
  const oam = _rt.gba.oam[sprite.oamIndex];
  if (oam) oam.tileId = (sprite.tileBase ?? 0) + tileOffset;
}

function _startCursorAnim(sprite: DecompSprite, rt: any, animIdx: number): void {
  sprite.data[CURSOR_ANIM_DATA_IDX] = animIdx;
  sprite.data[CURSOR_ANIM_DATA_FRAME] = 0;
  sprite.animEnded = false;
  if (animIdx === 0) {
    // sAnim_Loop : tileOffset 0, duration 1, JUMP — stay forever.
    sprite.data[CURSOR_ANIM_DATA_DELAY] = 1;
    _setCursorAnimFrame(sprite, rt, 0);
  } else {
    // sAnim_CursorSquish : tileOffset 4, duration 8.
    sprite.data[CURSOR_ANIM_DATA_DELAY] = 8;
    _setCursorAnimFrame(sprite, rt, 4);
  }
}

function _tickCursorAnim(sprite: DecompSprite, rt: any): void {
  const animIdx = sprite.data[CURSOR_ANIM_DATA_IDX] ?? 0;
  if (sprite.data[CURSOR_ANIM_DATA_DELAY] > 0) {
    sprite.data[CURSOR_ANIM_DATA_DELAY]--;
    return;
  }
  // Frame ended → advance.
  if (animIdx === 0) {
    // Loop : JUMP(0) — restart frame 0, duration 1.
    sprite.data[CURSOR_ANIM_DATA_FRAME] = 0;
    sprite.data[CURSOR_ANIM_DATA_DELAY] = 1;
    _setCursorAnimFrame(sprite, rt, 0);
  } else {
    // Squish : FRAME(4,8) → FRAME(8,8) → END.
    if (sprite.data[CURSOR_ANIM_DATA_FRAME] === 0) {
      sprite.data[CURSOR_ANIM_DATA_FRAME] = 1;
      sprite.data[CURSOR_ANIM_DATA_DELAY] = 8;
      _setCursorAnimFrame(sprite, rt, 8);
    } else {
      // END terminator : set animEnded = TRUE (= 1:1 décomp).
      sprite.animEnded = true;
      // Stay on last frame (= tile 8) until SpriteCB_Cursor restarts anim 0.
    }
  }
}

function SquishCursor(): void {
  if (!sNamingScreen) return;
  const rt = getRuntime();
  if (!rt) return;
  // 1:1 décomp:1173-1176 : StartSpriteAnim(cursor, 1) → sAnim_CursorSquish.
  // Direct FSM kick (= bypass rt.StartSpriteAnim, which is no-op here).
  const sprite = rt.gSprites[sNamingScreen.cursorSpriteId];
  if (sprite) _startCursorAnim(sprite, rt, 1);
}

function GetCurrentPageColumnCount(): number {
  if (!sNamingScreen) return KBCOL_COUNT;
  return sPageColumnCounts[sPageToKeyboardId[sNamingScreen.currentPage]];
}

// ─── SpriteCB_Cursor 1:1 décomp:1022-1059 ───────────────────────────────────

const SpriteCB_Cursor = (sprite: DecompSprite, _rt: any): void => {
  if (!sNamingScreen) return;
  const sX = sprite.data[0];
  const sY = sprite.data[1];
  const sPrevX = sprite.data[2];
  const sPrevY = sprite.data[3];
  const sInvisible = sprite.data[4] & 0xFF;
  const sFlashing = (sprite.data[4] & 0xFF00) !== 0;

  // 1:1 décomp:1024-1025 : if (animEnded) StartSpriteAnim(sprite, 0).
  // Local FSM (= cursor sprite has no spriteAnimStates entry, see comment
  // at _tickCursorAnim).
  if (sprite.animEnded) _startCursorAnim(sprite, _rt, 0);

  // Tick our local cursor anim (= 1:1 décomp tickSpriteAnims call before
  // sprite callbacks each frame, but cursor was created via CreateSpriteAtOam
  // and not registered).
  _tickCursorAnim(sprite, _rt);

  // Hide cursor when on button column
  sprite.invisible = (sInvisible !== 0);
  if (sX === GetCurrentPageColumnCount()) sprite.invisible = true;

  if (sprite.invisible || !sFlashing || sX !== sPrevX || sY !== sPrevY) {
    sprite.data[5] = 0;  // sColor = 0
    sprite.data[6] = 2;  // sColorIncr = 2
    sprite.data[7] = 2;  // sColorDelay = 2
  }

  sprite.data[7]--;
  if (sprite.data[7] === 0) {
    sprite.data[5] += sprite.data[6];
    if (sprite.data[5] === 16 || sprite.data[5] === 0) {
      sprite.data[6] = -sprite.data[6];
    }
    sprite.data[7] = 2;
  }

  if (sFlashing) {
    const gb = sprite.data[5];
    const r = sprite.data[5] >> 1;
    const palIdx = OBJ_PLTT_ID(IndexOfSpritePaletteTag(PALTAG_CURSOR)) + 1;
    MultiplyInvertedPaletteRGBComponents(palIdx, r, gb, gb);
  }
};

// ─── CreatePageSwapButtonSprites 1:1 décomp:1223-1243 ───────────────────────

function CreatePageSwapButtonSprites(): void {
  if (!sNamingScreen) return;
  const rt = getRuntime();
  if (!rt) return;

  const palSlotPgSwap = IndexOfSpritePaletteTag(PALTAG_PAGE_SWAP);
  const tileBaseFrame = GetSpriteTileStartByTag(GFXTAG_PAGE_SWAP_FRAME);
  const tileBaseButton = GetSpriteTileStartByTag(GFXTAG_PAGE_SWAP_BUTTON);
  const tileBaseUpper = GetSpriteTileStartByTag(GFXTAG_PAGE_SWAP_UPPER);

  // PageSwapFrame (40x32 subsprite, primary OAM 8x8 invisible)
  if (tileBaseFrame !== 0xFFFF && palSlotPgSwap !== 0xFF) {
    const { spriteId } = rt.CreateSpriteAtOam({
      tileId: tileBaseFrame, paletteBank: palSlotPgSwap,
      x: 204, y: 88, shape: 0, size: 0, priority: 0,
    });
    if (spriteId >= 0) {
      const sprite = rt.gSprites[spriteId];
      if (sprite) {
        sprite.tileBase = tileBaseFrame;
        sprite.callback = SpriteCB_PageSwap;
      }
      sNamingScreen.swapBtnFrameSpriteId = spriteId;
      SetSubspriteTables(spriteId, sSubsprites_PageSwapFrame);
    }
  }

  // PageSwapText (= 24x8 subsprite). Initial gfx = page_swap_upper (= GFXTAG_PAGE_SWAP_UPPER).
  if (tileBaseUpper !== 0xFFFF && palSlotPgSwap !== 0xFF) {
    const { spriteId } = rt.CreateSpriteAtOam({
      tileId: tileBaseUpper, paletteBank: palSlotPgSwap,
      x: 204, y: 84, shape: 0, size: 0, priority: 1,
    });
    if (spriteId >= 0) {
      const sprite = rt.gSprites[spriteId];
      if (sprite) {
        sprite.tileBase = tileBaseUpper;
      }
      sNamingScreen.pageSwapTextSpriteId = spriteId;
      SetSubspriteTables(spriteId, sSubsprites_PageSwapText);
      // 1:1 décomp:1235 : frameSprite.data[6] = textSpriteId
      const frameSprite = rt.gSprites[sNamingScreen.swapBtnFrameSpriteId];
      if (frameSprite) frameSprite.data[6] = spriteId;
    }
  }

  // PageSwapButton (= 32x16 background plate)
  if (tileBaseButton !== 0xFFFF) {
    const palSlotUpper = IndexOfSpritePaletteTag(PALTAG_PAGE_SWAP_UPPER);
    const { spriteId } = rt.CreateSpriteAtOam({
      tileId: tileBaseButton, paletteBank: palSlotUpper === 0xFF ? palSlotPgSwap : palSlotUpper,
      x: 204, y: 83, shape: 1, size: 2, priority: 1,
    });
    if (spriteId >= 0) {
      sNamingScreen.pageSwapButtonSpriteId = spriteId;
      // 1:1 décomp:1241 : frameSprite.data[7] = buttonSpriteId
      const frameSprite = rt.gSprites[sNamingScreen.swapBtnFrameSpriteId];
      if (frameSprite) frameSprite.data[7] = spriteId;
    }
  }
}

function StartPageSwapButtonAnim(): void {
  if (!sNamingScreen) return;
  const rt = getRuntime();
  if (!rt) return;
  const sprite = rt.gSprites[sNamingScreen.swapBtnFrameSpriteId];
  if (!sprite) return;
  // 1:1 décomp:1247-1250
  sprite.data[0] = 2;  // sState → SlideOff
  sprite.data[1] = sNamingScreen.currentPage;  // sPage
}

const SpriteCB_PageSwap = (sprite: DecompSprite, _rt: any): void => {
  // 1:1 décomp:1261-1263 : while (sPageSwapSpriteFuncs[sprite->sState](sprite));
  let limit = 8;
  while (limit-- > 0) {
    const state = sprite.data[0];
    let cont = false;
    switch (state) {
      case 0: cont = PageSwapSprite_Init(sprite); break;
      case 1: cont = PageSwapSprite_Idle(sprite); break;
      case 2: cont = PageSwapSprite_SlideOff(sprite); break;
      case 3: cont = PageSwapSprite_SlideOn(sprite); break;
      default: return;
    }
    if (!cont) return;
  }
};

function PageSwapSprite_Init(sprite: DecompSprite): boolean {
  if (!sNamingScreen) return false;
  const rt = getRuntime();
  if (!rt) return false;
  const text = rt.gSprites[sprite.data[6]];
  const button = rt.gSprites[sprite.data[7]];
  if (text && button) {
    SetPageSwapButtonGfx(sPageToNextGfxId[sNamingScreen.currentPage], text, button);
  }
  sprite.data[0]++;  // → Idle
  return false;
}

function PageSwapSprite_Idle(_sprite: DecompSprite): boolean {
  return false;
}

function PageSwapSprite_SlideOff(sprite: DecompSprite): boolean {
  if (!sNamingScreen) return false;
  const rt = getRuntime();
  if (!rt) return false;
  const text = rt.gSprites[sprite.data[6]];
  const button = rt.gSprites[sprite.data[7]];
  if (!text || !button) return false;
  text.y2++;
  if (text.y2 > 7) {
    sprite.data[0]++;  // → SlideOn
    text.y2 = -4;
    text.invisible = true;
    SetPageSwapButtonGfx(sPageToNextGfxId[(sprite.data[1] + 1) % KBPAGE_COUNT], text, button);
  }
  return false;
}

function PageSwapSprite_SlideOn(sprite: DecompSprite): boolean {
  if (!sNamingScreen) return false;
  const rt = getRuntime();
  if (!rt) return false;
  const text = rt.gSprites[sprite.data[6]];
  if (!text) return false;
  text.invisible = false;
  text.y2++;
  if (text.y2 >= 0) {
    text.y2 = 0;
    sprite.data[0] = 1;  // → Idle
  }
  return false;
}

function SetPageSwapButtonGfx(page: number, text: DecompSprite, button: DecompSprite): void {
  const rt = getRuntime();
  if (!rt) return;
  // 1:1 décomp:1311-1320 sPageSwapPalTags + sPageSwapGfxTags lookup
  const palTags = [PALTAG_PAGE_SWAP_UPPER, PALTAG_PAGE_SWAP_OTHERS, PALTAG_PAGE_SWAP_LOWER];
  const gfxTags = [GFXTAG_PAGE_SWAP_UPPER, GFXTAG_PAGE_SWAP_OTHERS, GFXTAG_PAGE_SWAP_LOWER];
  const palSlot = IndexOfSpritePaletteTag(palTags[page]);
  const tileStart = GetSpriteTileStartByTag(gfxTags[page]);
  if (palSlot !== 0xFF) rt.gba.oam[button.oamIndex].paletteBank = palSlot;
  if (tileStart !== 0xFFFF) {
    text.tileBase = tileStart;
    rt.gba.oam[text.oamIndex].tileId = tileStart;
  }
}

// ─── CreateBackOkSprites 1:1 décomp:1335-1346 ────────────────────────────────

function CreateBackOkSprites(): void {
  if (!sNamingScreen) return;
  const rt = getRuntime();
  if (!rt) return;

  const tileBack = GetSpriteTileStartByTag(GFXTAG_BACK_BUTTON);
  const tileOK = GetSpriteTileStartByTag(GFXTAG_OK_BUTTON);
  const palBack = IndexOfSpritePaletteTag(PALTAG_BACK_BUTTON);
  const palOK = IndexOfSpritePaletteTag(PALTAG_OK_BUTTON);

  if (tileBack !== 0xFFFF && palBack !== 0xFF) {
    const { spriteId } = rt.CreateSpriteAtOam({
      tileId: tileBack, paletteBank: palBack,
      x: 204, y: 116, shape: 0, size: 0, priority: 0,
    });
    if (spriteId >= 0) {
      const sprite = rt.gSprites[spriteId];
      if (sprite) sprite.tileBase = tileBack;
      sNamingScreen.backButtonSpriteId = spriteId;
      SetSubspriteTables(spriteId, sSubsprites_Button);
    }
  }

  if (tileOK !== 0xFFFF && palOK !== 0xFF) {
    const { spriteId } = rt.CreateSpriteAtOam({
      tileId: tileOK, paletteBank: palOK,
      x: 204, y: 140, shape: 0, size: 0, priority: 0,
    });
    if (spriteId >= 0) {
      const sprite = rt.gSprites[spriteId];
      if (sprite) sprite.tileBase = tileOK;
      sNamingScreen.okButtonSpriteId = spriteId;
      SetSubspriteTables(spriteId, sSubsprites_Button);
    }
  }
}

// ─── CreateTextEntrySprites 1:1 décomp:1348-1366 ────────────────────────────

function CreateTextEntrySprites(): void {
  if (!sNamingScreen) return;
  const rt = getRuntime();
  if (!rt) return;

  const tileArrow = GetSpriteTileStartByTag(GFXTAG_INPUT_ARROW);
  const tileUnderscore = GetSpriteTileStartByTag(GFXTAG_UNDERSCORE);
  const palOthers = IndexOfSpritePaletteTag(PALTAG_PAGE_SWAP_OTHERS);

  if (tileArrow !== 0xFFFF && palOthers !== 0xFF) {
    const xPos = sNamingScreen.inputCharBaseXPos - 5;
    const { spriteId } = rt.CreateSpriteAtOam({
      tileId: tileArrow, paletteBank: palOthers,
      x: xPos, y: 56, shape: 0, size: 0, priority: 3,
    });
    if (spriteId >= 0) {
      const sprite = rt.gSprites[spriteId];
      if (sprite) {
        sprite.tileBase = tileArrow;
        sprite.callback = SpriteCB_InputArrow;
        sprite.invisible = true;  // 1:1 décomp:1357 — visible after SetSpritesVisible() in fade-in
      }
      sNamingScreen.inputArrowSpriteId = spriteId;
    }
  }

  // Underscore : 1 sprite par char position (1:1 décomp:1359-1365)
  let xPos = sNamingScreen.inputCharBaseXPos;
  for (let i = 0; i < sNamingScreen.template.maxChars; i++, xPos += 8) {
    if (tileUnderscore !== 0xFFFF && palOthers !== 0xFF) {
      const { spriteId } = rt.CreateSpriteAtOam({
        tileId: tileUnderscore, paletteBank: palOthers,
        x: xPos + 3, y: 60, shape: 0, size: 0, priority: 3,
      });
      if (spriteId >= 0) {
        const sprite = rt.gSprites[spriteId];
        if (sprite) {
          sprite.tileBase = tileUnderscore;
          sprite.data[0] = i;  // sId
          sprite.callback = SpriteCB_Underscore;
          sprite.invisible = true;  // 1:1 décomp:1364
        }
        sNamingScreen.underscoreSpriteIds.push(spriteId);
      }
    }
  }
}

const SpriteCB_InputArrow = (sprite: DecompSprite, _rt: any): void => {
  // 1:1 décomp:1064-1074
  const x = [0, -4, -2, -1];
  if (sprite.data[0] === 0 || --sprite.data[0] === 0) {
    sprite.data[0] = 8;   // sDelay
    sprite.data[1] = (sprite.data[1] + 1) % x.length;  // sXPosId
  }
  sprite.x2 = x[sprite.data[1]];
};

const SpriteCB_Underscore = (sprite: DecompSprite, _rt: any): void => {
  // 1:1 décomp:1083-1104
  const y = [2, 3, 2, 1];
  const pos = GetTextEntryPosition();
  if (pos !== sprite.data[0]) {
    sprite.y2 = 0;
    sprite.data[1] = 0;
    sprite.data[2] = 0;
  } else {
    sprite.y2 = y[sprite.data[1]];
    sprite.data[2]++;
    if (sprite.data[2] > 8) {
      sprite.data[1] = (sprite.data[1] + 1) % y.length;
      sprite.data[2] = 0;
    }
  }
};

function CreateInputTargetIcon(): void {
  if (!sNamingScreen) return;
  const rt = getRuntime();
  if (!rt) return;
  // 1:1 décomp:1387-1390 : sIconFunctions[template.iconFunction]()
  // Fonctions : NoIcon (0), CreatePlayerIcon (1), CreatePCIcon (2),
  //             CreateMonIcon (3), CreateWaldaDadIcon (4).
  //
  // Implemented :
  //   - NoIcon (0)             : explicit no-op (= no garbage drawn).
  //   - CreatePlayerIcon (1)   : 1:1 décomp:1397-1406. Brendan/May walking
  //     sprite frame 0 (south-standing). Gender from `monSpecies` field (=
  //     decomp pattern : DoNamingScreen call from main_menu.c:1606 passes
  //     gSaveBlock2Ptr->playerGender as the monSpecies arg for PLAYER context).
  //   - CreatePCIcon (2)       : 1:1 décomp:1408-1415.
  //
  // Deferred (= NoIcon fallback) :
  //   - CreateMonIcon (3)      : requires pokemon_icon engine (= 64-color icon
  //     palettes + species-specific icon gfx). Used by CAUGHT_MON / NICKNAME.
  //   - CreateWaldaDadIcon (4) : requires gObjectEvents engine
  //     (= OBJ_EVENT_GFX_MAN_1 overworld sprite). Used by WALDA.
  const iconFn = sNamingScreen.template.iconFunction;
  switch (iconFn) {
    case 0: /* NoIcon */ break;
    case 1: /* PlayerIcon */ NamingScreen_CreatePlayerIcon(); break;
    case 2: /* PCIcon */ NamingScreen_CreatePCIcon(); break;
    case 3: /* MonIcon */ /* deferred */ break;
    case 4: /* WaldaDadIcon */ /* deferred */ break;
    default: break;  // No-op (= NoIcon fallback)
  }
}

// 1:1 décomp src/naming_screen.c:1397-1406 NamingScreen_CreatePlayerIcon.
//
//   rivalGfxId = GetRivalAvatarGraphicsIdByStateIdAndGender(NORMAL, gender)
//   spriteId   = CreateObjectGraphicsSprite(rivalGfxId, SpriteCallbackDummy, 56, 37, 0)
//   gSprites[spriteId].oam.priority = 3
//   StartSpriteAnim(&gSprites[spriteId], ANIM_STD_GO_SOUTH)
//
// Gender source : `sNamingScreen.monSpecies` (= décomp réutilise ce field
// comme gender pour PLAYER context, cf. main_menu.c:1606 DoNamingScreen call
// où arg3 = playerGender).
//
// Le framework `object-event-graphics.ts` :
//   - Resolve gfxId via sRivalAvatarGfxIds[NORMAL][gender]
//   - Loads gfx + palette via loadObjectEventGraphicsInfo (= preloaded au state 5)
//   - Creates sprite via CreateSpriteAtOam avec dimensions de gObjectEventGraphicsInfo_*
//   - Register dans spriteAnimStates → tickSpriteAnims cycle frames 0/1/0/2 chaque 8f.
function NamingScreen_CreatePlayerIcon(): void {
  if (!sNamingScreen) return;
  const gender = sNamingScreen.monSpecies & 0xFF;
  const rivalGfxId = GetRivalAvatarGraphicsIdByStateIdAndGender(PLAYER_AVATAR_STATE_NORMAL, gender);
  // 1:1 décomp:1403 : CreateObjectGraphicsSprite(rivalGfxId, SpriteCallbackDummy, 56, 37, 0).
  // Le 3eme arg `subPriority=0` mappe vers OAM priority via le framework.
  // Anim default = ANIM_STD_GO_SOUTH (= 4-step cycle south-stand/walk1/stand/walk2).
  const spriteId = CreateObjectGraphicsSprite(rivalGfxId, null, 56, 37, 3, ANIM_STD_GO_SOUTH);
  if (spriteId < 0) {
    console.warn('[naming-screen] CreatePlayerIcon : framework returned -1 for gender', gender);
  }
}

function NamingScreen_CreatePCIcon(): void {
  if (!sNamingScreen) return;
  const rt = getRuntime();
  if (!rt) return;
  // 1:1 décomp:1408-1415 :
  //   spriteId = CreateSprite(&sSpriteTemplate_PCIcon, 56, 41, 0);
  //   SetSubspriteTables(&gSprites[spriteId], sSubspriteTable_PCIcon);
  //   gSprites[spriteId].oam.priority = 3;
  const tileBase = GetSpriteTileStartByTag(GFXTAG_PC_ICON_OFF);
  const palSlot = IndexOfSpritePaletteTag(PALTAG_MENU);
  if (tileBase === 0xFFFF || palSlot === 0xFF) return;
  const { spriteId } = rt.CreateSpriteAtOam({
    tileId: tileBase, paletteBank: palSlot,
    x: 56, y: 41, shape: 0, size: 0, priority: 3,
  });
  if (spriteId >= 0) {
    const sprite = rt.gSprites[spriteId];
    if (sprite) sprite.tileBase = tileBase;
    SetSubspriteTables(spriteId, sSubsprites_PCIcon);
  }
}

// ─── Page swap animation 1:1 décomp:813-890 ─────────────────────────────────

function StartPageSwapAnim(): void {
  if (!sNamingScreen) return;
  const rt = getRuntime();
  if (!rt) return;
  const taskId = rt.CreateTask((t) => Task_HandlePageSwapAnim(t), 0);
  sNamingScreen.pageSwapTaskId = taskId;
  // 1:1 décomp:818 : Task_HandlePageSwapAnim(taskId) called immediately
  const t = rt.gTasks[taskId];
  if (t) Task_HandlePageSwapAnim(t);
}

function Task_HandlePageSwapAnim(task: DecompTask): void {
  // 1:1 décomp:821-824 : while sPageSwapAnimStateFuncs[task.data[0]] != 0
  let limit = 8;
  while (limit-- > 0) {
    const state = task.data[0];
    let cont = false;
    switch (state) {
      case 0: cont = PageSwapAnimState_Init(task); break;
      case 1: cont = PageSwapAnimState_1(task); break;
      case 2: cont = PageSwapAnimState_2(task); break;
      case 3: cont = PageSwapAnimState_Done(task); break;
      default: return;
    }
    if (!cont) return;
  }
}

function PageSwapAnimState_Init(task: DecompTask): boolean {
  if (!sNamingScreen) return false;
  sNamingScreen.bg1vOffset = 0;
  sNamingScreen.bg2vOffset = 0;
  task.data[0]++;
  return false;
}

function PageSwapAnimState_1(task: DecompTask): boolean {
  if (!sNamingScreen) return false;
  task.data[1] += 4;  // tFrameCount
  // 1:1 décomp Sin lookup table : x in [0..127], amplitude 40.
  const sin = (x: number, amp: number): number => Math.round(Math.sin((x / 256) * Math.PI * 2) * amp);
  const offsets = [
    /* bgToReveal=0 */ 'bg2vOffset',
    /* bgToReveal=1 */ 'bg1vOffset',
  ];
  const ns = sNamingScreen as unknown as Record<string, number>;
  ns[offsets[sNamingScreen.bgToReveal]] = sin(task.data[1], 40);
  ns[offsets[sNamingScreen.bgToHide]] = sin((task.data[1] + 128) & 0xFF, 40);
  if (task.data[1] >= 64) {
    const tmp = sNamingScreen.bg1Priority;
    sNamingScreen.bg1Priority = sNamingScreen.bg2Priority;
    sNamingScreen.bg2Priority = tmp;
    task.data[0]++;
  }
  return false;
}

function PageSwapAnimState_2(task: DecompTask): boolean {
  if (!sNamingScreen) return false;
  task.data[1] += 4;
  const sin = (x: number, amp: number): number => Math.round(Math.sin((x / 256) * Math.PI * 2) * amp);
  const offsets = ['bg2vOffset', 'bg1vOffset'];
  const ns = sNamingScreen as unknown as Record<string, number>;
  ns[offsets[sNamingScreen.bgToReveal]] = sin(task.data[1], 40);
  ns[offsets[sNamingScreen.bgToHide]] = sin((task.data[1] + 128) & 0xFF, 40);
  if (task.data[1] >= 128) {
    const tmp = sNamingScreen.bgToReveal;
    sNamingScreen.bgToReveal = sNamingScreen.bgToHide;
    sNamingScreen.bgToHide = tmp;
    task.data[0]++;
  }
  return false;
}

function PageSwapAnimState_Done(_task: DecompTask): boolean {
  if (!sNamingScreen) return false;
  const rt = getRuntime();
  if (!rt) return false;
  if (sNamingScreen.pageSwapTaskId >= 0) {
    rt.DestroyTask(sNamingScreen.pageSwapTaskId);
    sNamingScreen.pageSwapTaskId = -1;
  }
  return false;
}

function IsPageSwapAnimNotInProgress(): boolean {
  if (!sNamingScreen) return true;
  return sNamingScreen.pageSwapTaskId < 0;
}

// ─── Button flash 1:1 décomp:907-1006 ────────────────────────────────────────

function CreateButtonFlashTask(): void {
  if (!sNamingScreen) return;
  const rt = getRuntime();
  if (!rt) return;
  const taskId = rt.CreateTask((t) => Task_UpdateButtonFlash(t), 3);
  sNamingScreen.buttonFlashTaskId = taskId;
  const task = rt.gTasks[taskId];
  if (task) task.data[0] = BUTTON_COUNT;  // tButtonId = sentinel
}

function TryStartButtonFlash(button: number, keepFlashing: boolean, interruptCurFlash: boolean): void {
  if (!sNamingScreen) return;
  const rt = getRuntime();
  if (!rt) return;
  const taskId = sNamingScreen.buttonFlashTaskId;
  if (taskId < 0) return;
  const task = rt.gTasks[taskId];
  if (!task) return;

  if (button === task.data[0] && !interruptCurFlash) {
    task.data[1] = keepFlashing ? 1 : 0;
    task.data[2] = 1;  // tAllowFlash = TRUE
    return;
  }
  if (button === BUTTON_COUNT && !task.data[1] && !interruptCurFlash) return;

  if (task.data[0] !== BUTTON_COUNT) {
    RestoreButtonColor(task.data[0]);
  }

  StartButtonFlash(task, button, keepFlashing);
}

function Task_UpdateButtonFlash(task: DecompTask): void {
  if (!sNamingScreen) return;
  if (task.data[0] === BUTTON_COUNT || !task.data[2]) return;

  MultiplyInvertedPaletteRGBComponents(GetButtonPalOffset(task.data[0]), task.data[3], task.data[3], task.data[3]);

  if (task.data[5] && --task.data[5]) return;

  task.data[5] = 2;
  if (task.data[4] >= 0) {
    if (task.data[3] < 14) {
      task.data[3] += task.data[4];
      task.data[6] += task.data[4];
    } else {
      task.data[3] = 16;
      task.data[6]++;
    }
  } else {
    task.data[3] += task.data[4];
    task.data[6] += task.data[4];
  }

  if (task.data[3] === 16 && task.data[6] === 22) {
    task.data[4] = -4;
  } else if (task.data[3] === 0) {
    task.data[2] = task.data[1];
    task.data[4] = 2;
    task.data[6] = 0;
  }
}

function GetButtonPalOffset(button: number): number {
  // 1:1 décomp:978-989
  switch (button) {
    case BUTTON_PAGE: return OBJ_PLTT_ID(IndexOfSpritePaletteTag(PALTAG_PAGE_SWAP)) + 14;
    case BUTTON_BACK: return OBJ_PLTT_ID(IndexOfSpritePaletteTag(PALTAG_BACK_BUTTON)) + 14;
    case BUTTON_OK:   return OBJ_PLTT_ID(IndexOfSpritePaletteTag(PALTAG_OK_BUTTON)) + 14;
    case BUTTON_COUNT: return OBJ_PLTT_ID(IndexOfSpritePaletteTag(PALTAG_OK_BUTTON)) + 1;
    default: return 0;
  }
}

function RestoreButtonColor(button: number): void {
  const rt = getRuntime();
  if (!rt) return;
  const idx = GetButtonPalOffset(button);
  rt.gPlttBufferFaded.set(idx, rt.gPlttBufferUnfaded.get(idx));
}

function StartButtonFlash(task: DecompTask, button: number, keepFlashing: boolean): void {
  task.data[0] = button;        // tButtonId
  task.data[1] = keepFlashing ? 1 : 0;
  task.data[2] = 1;             // tAllowFlash
  task.data[3] = 4;             // tColor
  task.data[4] = 2;             // tColorIncr
  task.data[5] = 0;             // tColorDelay
  task.data[6] = 4;             // tColorDelta
}

// ─── Input handling 1:1 décomp:1539-1699 ────────────────────────────────────

function CreateInputHandlerTask(): void {
  if (!sNamingScreen) return;
  const rt = getRuntime();
  if (!rt) return;
  const taskId = rt.CreateTask((t) => Task_HandleInput(t), 1);
  sNamingScreen.inputTaskId = taskId;
}

function Task_HandleInput(task: DecompTask): void {
  switch (task.data[0]) {
    case INPUT_STATE_DISABLED: Input_Disabled(task); break;
    case INPUT_STATE_ENABLED:  Input_Enabled(task); break;
    case INPUT_STATE_OVERRIDE: Input_Override(task); break;
  }
}

function Input_Disabled(task: DecompTask): void {
  task.data[1] = INPUT_NONE;  // tKeyboardEvent
}

function Input_Enabled(task: DecompTask): void {
  const rt = getRuntime();
  if (!rt) return;
  const newKeys = (rt.gMain as any).newKeys ?? 0;
  const newAndRepeated = (rt.gMain as any).newAndRepeatedKeys ?? newKeys;
  task.data[1] = INPUT_NONE;

  const A_BUTTON = 0x01;
  const B_BUTTON = 0x02;
  const SELECT_BUTTON = 0x04;
  const START_BUTTON = 0x08;

  if (newKeys & A_BUTTON) task.data[1] = INPUT_A_BUTTON;
  else if (newKeys & B_BUTTON) task.data[1] = INPUT_B_BUTTON;
  else if (newKeys & SELECT_BUTTON) task.data[1] = INPUT_SELECT;
  else if (newKeys & START_BUTTON) task.data[1] = INPUT_START;
  else HandleDpadMovement(task, newAndRepeated);
}

function Input_Override(task: DecompTask): void {
  task.data[1] = INPUT_NONE;
}

function HandleDpadMovement(task: DecompTask, joyKeys: number): void {
  if (!sNamingScreen) return;

  const DPAD_RIGHT = 0x10;
  const DPAD_LEFT = 0x20;
  const DPAD_UP = 0x40;
  const DPAD_DOWN = 0x80;

  // 1:1 décomp:1605-1624 — delta lookup tables
  const sDpadDeltaX = [0, 0, 0, -1, 1];   // INPUT_NONE/UP/DOWN/LEFT/RIGHT
  const sDpadDeltaY = [0, -1, 1, 0, 0];
  const sKeyRowToButtonRow = [0, 1, 1, 2];
  const sButtonRowToKeyRow = [0, 0, 3];

  const cur = GetCursorPos();
  let cursorX = cur.x;
  let cursorY = cur.y;
  let input = INPUT_NONE;

  if (joyKeys & DPAD_UP) input = INPUT_DPAD_UP;
  if (joyKeys & DPAD_DOWN) input = INPUT_DPAD_DOWN;
  if (joyKeys & DPAD_LEFT) input = INPUT_DPAD_LEFT;
  if (joyKeys & DPAD_RIGHT) input = INPUT_DPAD_RIGHT;

  const prevCursorX = cursorX;
  cursorX += sDpadDeltaX[input];
  cursorY += sDpadDeltaY[input];

  // Wrap X
  if (cursorX < 0) cursorX = GetCurrentPageColumnCount();
  if (cursorX > GetCurrentPageColumnCount()) cursorX = 0;

  // Handle moving on/off button column
  if (sDpadDeltaX[input] !== 0) {
    if (cursorX === GetCurrentPageColumnCount()) {
      task.data[2] = cursorY;  // tButtonId = save Y for return
      cursorY = sKeyRowToButtonRow[cursorY];
    } else if (prevCursorX === GetCurrentPageColumnCount()) {
      if (cursorY === Math.floor(BUTTON_COUNT / 2)) {
        cursorY = task.data[2];
      } else {
        cursorY = sButtonRowToKeyRow[cursorY];
      }
    }
  }

  // Wrap Y
  if (cursorX === GetCurrentPageColumnCount()) {
    if (cursorY < 0) cursorY = BUTTON_COUNT - 1;
    if (cursorY >= BUTTON_COUNT) cursorY = 0;
    if (cursorY === 0) task.data[2] = BUTTON_BACK;
    else if (cursorY === BUTTON_COUNT - 1) task.data[2] = BUTTON_OK;
  } else {
    if (cursorY < 0) cursorY = KBROW_COUNT - 1;
    if (cursorY > KBROW_COUNT - 1) cursorY = 0;
  }

  // 1:1 décomp:1698 — TOUJOURS appeler SetCursorPos (= même si pas de
  // mouvement). Critical : SetCursorPos updates sPrevX = sX BEFORE writing
  // new sX. Si on call avec mêmes coords, sPrevX rattrape sX → la condition
  // `sX != sPrevX` du SpriteCB_Cursor devient FALSE → le flash sColor pulse
  // peut démarrer. Sans ce call chaque frame, sPrevX stale après tout move
  // input → reset condition fire forever → cursor ne clignote jamais.
  // Bug session 96.
  SetCursorPos(cursorX, cursorY);
}

function GetInputEvent(): number {
  if (!sNamingScreen) return INPUT_NONE;
  const rt = getRuntime();
  if (!rt) return INPUT_NONE;
  if (sNamingScreen.inputTaskId < 0) return INPUT_NONE;
  const task = rt.gTasks[sNamingScreen.inputTaskId];
  return task ? task.data[1] : INPUT_NONE;
}

function SetInputState(state: number): void {
  if (!sNamingScreen) return;
  const rt = getRuntime();
  if (!rt) return;
  if (sNamingScreen.inputTaskId < 0) return;
  const task = rt.gTasks[sNamingScreen.inputTaskId];
  if (task) task.data[0] = state;
}

// ─── HandleKeyboardEvent 1:1 décomp:1452-1475 ───────────────────────────────

function HandleKeyboardEvent(): void {
  if (!sNamingScreen) return;
  const input = GetInputEvent();
  const keyRole = GetKeyRoleAtCursorPos();

  if (input === INPUT_SELECT) {
    SwapKeyboardPage();
  } else if (input === INPUT_B_BUTTON) {
    DeleteTextCharacter();
  } else if (input === INPUT_START) {
    MoveCursorToOKButton();
  } else {
    switch (keyRole) {
      case KEY_ROLE_CHAR:      KeyboardKeyHandler_Character(input); break;
      case KEY_ROLE_PAGE:      KeyboardKeyHandler_Page(input); break;
      case KEY_ROLE_BACKSPACE: KeyboardKeyHandler_Backspace(input); break;
      case KEY_ROLE_OK:        KeyboardKeyHandler_OK(input); break;
    }
  }
}

const sButtonKeyRoles: readonly number[] = [KEY_ROLE_PAGE, KEY_ROLE_BACKSPACE, KEY_ROLE_OK];

function GetKeyRoleAtCursorPos(): number {
  if (!sNamingScreen) return KEY_ROLE_CHAR;
  const cur = GetCursorPos();
  if (cur.x < GetCurrentPageColumnCount()) return KEY_ROLE_CHAR;
  return sButtonKeyRoles[cur.y] ?? KEY_ROLE_CHAR;
}

function KeyboardKeyHandler_Character(input: number): void {
  TryStartButtonFlash(BUTTON_COUNT, false, false);
  if (input === INPUT_A_BUTTON) {
    const textFull = AddTextCharacter();
    SquishCursor();
    if (textFull) {
      SetInputState(INPUT_STATE_OVERRIDE);
      if (sNamingScreen) sNamingScreen.state = STATE_MOVE_TO_OK_BUTTON;
    }
  }
}

function KeyboardKeyHandler_Page(input: number): void {
  TryStartButtonFlash(BUTTON_PAGE, true, false);
  if (input === INPUT_A_BUTTON) SwapKeyboardPage();
}

function KeyboardKeyHandler_Backspace(input: number): void {
  TryStartButtonFlash(BUTTON_BACK, true, false);
  if (input === INPUT_A_BUTTON) DeleteTextCharacter();
}

function KeyboardKeyHandler_OK(input: number): void {
  TryStartButtonFlash(BUTTON_OK, true, false);
  if (input === INPUT_A_BUTTON) {
    PlaySE(5);  // SE_SELECT
    if (sNamingScreen) sNamingScreen.state = STATE_PRESSED_OK;
  }
}

function SwapKeyboardPage(): void {
  if (!sNamingScreen) return;
  sNamingScreen.state = STATE_START_PAGE_SWAP;
}

// ─── Text manipulation 1:1 décomp:1814-1869 ─────────────────────────────────

function GetTextEntryPosition(): number {
  if (!sNamingScreen) return 0;
  for (let i = 0; i < sNamingScreen.template.maxChars; i++) {
    if (!sNamingScreen.textBuffer[i]) return i;
  }
  return sNamingScreen.template.maxChars - 1;
}

function GetPreviousTextCaretPosition(): number {
  if (!sNamingScreen) return 0;
  for (let i = sNamingScreen.template.maxChars - 1; i > 0; i--) {
    if (sNamingScreen.textBuffer[i]) return i;
  }
  return 0;
}

function DeleteTextCharacter(): void {
  if (!sNamingScreen) return;
  const idx = GetPreviousTextCaretPosition();
  sNamingScreen.textBuffer[idx] = '';
  DrawTextEntry();
  const keyRole = GetKeyRoleAtCursorPos();
  if (keyRole === KEY_ROLE_CHAR || keyRole === KEY_ROLE_BACKSPACE) {
    TryStartButtonFlash(BUTTON_BACK, false, true);
  }
  PlaySE(5);  // SE_BALL — décomp uses SE_BALL but we collapse to SE_SELECT
}

function AddTextCharacter(): boolean {
  if (!sNamingScreen) return false;
  const cur = GetCursorPos();
  const ch = GetCharAtKeyboardPos(cur.x, cur.y);
  if (ch && ch !== ' ') {
    BufferCharacter(ch);
    DrawTextEntry();
    PlaySE(5);
  }
  return GetPreviousTextCaretPosition() === sNamingScreen.template.maxChars - 1;
}

function GetCharAtKeyboardPos(x: number, y: number): string {
  if (!sNamingScreen) return ' ';
  const kbId = sPageToKeyboardId[sNamingScreen.currentPage];
  return sKeyboardChars[kbId][y]?.[x] ?? ' ';
}

function BufferCharacter(ch: string): void {
  if (!sNamingScreen) return;
  const idx = GetTextEntryPosition();
  sNamingScreen.textBuffer[idx] = ch;
}

function SaveInputText(): void {
  if (!sNamingScreen) return;
  const name = sNamingScreen.textBuffer.join('').slice(0, sNamingScreen.template.maxChars);
  if (!name) return;
  if (sNamingScreen.templateNum === NAMING_SCREEN_PLAYER) {
    SetPlayerName(name);
  } else if (Array.isArray(sNamingScreen.destBuffer)) {
    // Array<number> = char codes
    const buf = sNamingScreen.destBuffer as number[];
    buf.length = 0;
    for (const c of name) buf.push(c.charCodeAt(0));
  }
}

// ─── Drawing helpers (= window text printer for keyboard chars + entry) ─────

function DrawTextEntryBox(): void {
  if (!sNamingScreen) return;
  const winTextBox = sNamingScreen.windows[WIN_TEXT_ENTRY_BOX];
  if (winTextBox < 0) return;
  FillWindowPixelBuffer(winTextBox, 0x11);
  AddTextPrinterParameterized3(winTextBox, 1, 24, 0, [1, 2, 3], 255, sNamingScreen.template.title);
  PutWindowTilemap(winTextBox);
  CopyWindowToVram(winTextBox, 3);
}

function DrawTextEntry(): void {
  if (!sNamingScreen) return;
  const winText = sNamingScreen.windows[WIN_TEXT_ENTRY];
  if (winText < 0) return;
  FillWindowPixelBuffer(winText, 0x11);
  const maxChars = sNamingScreen.template.maxChars;
  // 1:1 décomp src/naming_screen.c:1908-1922 DrawTextEntry :
  //   u16 x = sNamingScreen->inputCharBaseXPos - 0x40;
  //   for (i = 0; i < maxChars; i++)
  //     AddTextPrinterParameterized(WIN_TEXT_ENTRY, FONT_NORMAL, &textBuffer[i],
  //                                 i * 8 + x + extraWidth, 1, TEXT_SKIP_DRAW, NULL);
  // Chaque char est rendu à `x = i*8 + (inputCharBaseXPos - 0x40)` window-relative,
  // sans espace entre eux. Les underscores sprites s'alignent à la même position
  // (= sprite x = inputCharBaseXPos + i*8 → screen position match window x).
  // Bug session 96 : avant on draw avec espace entre chars + start x=8 → décalage
  // ~26px à gauche → user feedback "le texte est décalé sur la gauche, le > est
  // au milieu du texte".
  const baseX = sNamingScreen.inputCharBaseXPos - 0x40;
  for (let i = 0; i < maxChars; i++) {
    const c = sNamingScreen.textBuffer[i];
    const ch = (c && c !== ' ') ? c : ' ';
    AddTextPrinterParameterized3(winText, 1, i * 8 + baseX, 1, [1, 2, 3], 255, ch);
  }
  PutWindowTilemap(winText);
  CopyWindowToVram(winText, 3);
}

function PrintControls(): void {
  if (!sNamingScreen) return;
  const winBanner = sNamingScreen.windows[WIN_BANNER];
  if (winBanner < 0) return;
  // 1:1 décomp src/naming_screen.c:2004-2010 PrintControls :
  //   const u8 color[3] = { TEXT_DYNAMIC_COLOR_6, TEXT_COLOR_WHITE, TEXT_COLOR_DARK_GRAY };
  //   FillWindowPixelBuffer(WIN_BANNER, PIXEL_FILL(15));
  //   AddTextPrinterParameterized3(WIN_BANNER, FONT_SMALL, 2, 1, color, 0, gText_MoveOkBack);
  //
  // PIXEL_FILL(15) = 0xFF → idx 15 dans bank 11 (= text_pal2.pal idx 15 =
  // light blue 74,205,238). Avant on avait 0xCC (= idx 12) avec un fallback
  // grayscale → banner sortait noir au lieu de bleu (= user feedback session 96).
  // Color triplet [DYNAMIC_6=15, WHITE=1, DARK_GRAY=2] : bg = idx 15 (= match
  // PIXEL_FILL = invisible glyph "ghost"), fg = white, shadow = dark gray.
  FillWindowPixelBuffer(winBanner, 0xFF);
  AddTextPrinterParameterized3(winBanner, 1, 4, 1, [0xF, 0x1, 0x2], 255, '+DEPL.  A OK  B RET.');
  PutWindowTilemap(winBanner);
  CopyWindowToVram(winBanner, 3);
}

function PrintKeyboardKeysOnFront(): void {
  if (!sNamingScreen) return;
  // Front = WIN_KB_PAGE_1 si bg1Priority < bg2Priority, sinon WIN_KB_PAGE_2.
  // Initialement bg1Priority=1 < bg2Priority=2 → WIN_KB_PAGE_1 front.
  const win = sNamingScreen.windows[WIN_KB_PAGE_1];
  if (win < 0) return;
  const kbId = sPageToKeyboardId[sNamingScreen.currentPage];
  drawKeyboardWindow(win, kbId);
}

function PrintKeyboardKeysOnDeck(): void {
  if (!sNamingScreen) return;
  const win = sNamingScreen.windows[WIN_KB_PAGE_2];
  if (win < 0) return;
  const kbId = sPageToNextKeyboardId[sNamingScreen.currentPage];
  drawKeyboardWindow(win, kbId);
}

// 1:1 décomp src/text_input_strings.c:9-21 sNamingScreenKeyboardText[KBPAGE][KBROW].
// Chaque string utilise {CLEAR N} (= EXT_CTRL_CODE_CLEAR) pour kerner les chars
// de manière à ce qu'ils s'alignent avec sPageColumnXPos (= cursor sprite anchor).
// Le rendu char-by-char à sPageColumnXPos[col] décalait visuellement de
// ~14px → cursor visible 1 col à droite du char ciblé. Avec ces strings,
// le text printer avance currentX par les CLEAR codes et chaque glyph est
// dessiné à la bonne position absolue pour matcher le cursor.
/* @strings-ignore-start: lignes texte du clavier = DATA 1:1 décomp
   text_input_strings.c:9-21 (sNamingScreenKeyboardText), codes {CLEAR n} + chars. */
const sNamingScreenKeyboardText: readonly string[][] = [
  // KEYBOARD_LETTERS_LOWER (1:1 décomp:10-13)
  [
    '{CLEAR 11}a{CLEAR 6}b{CLEAR 6}c{CLEAR 6}d{CLEAR 20}e{CLEAR 6}f{CLEAR 6}g{CLEAR 6}h{CLEAR 20}.',
    '{CLEAR 12}i{CLEAR 7}j{CLEAR 7}k{CLEAR 7}l{CLEAR 21}m{CLEAR 6}n{CLEAR 6}o{CLEAR 6}p{CLEAR 20},',
    '{CLEAR 11}q{CLEAR 7}r{CLEAR 6}s{CLEAR 6}t{CLEAR 20}u{CLEAR 6}v{CLEAR 6}w{CLEAR 6}x{CLEAR 20} ',
    '{CLEAR 11}y{CLEAR 6}z{CLEAR 6} {CLEAR 9} {CLEAR 23}-{CLEAR 6} {CLEAR 6} {CLEAR 6} {CLEAR 20} ',
  ],
  // KEYBOARD_LETTERS_UPPER (1:1 décomp:14-17)
  [
    '{CLEAR 11}A{CLEAR 6}B{CLEAR 6}C{CLEAR 6}D{CLEAR 20}E{CLEAR 6}F{CLEAR 6}G{CLEAR 6}H{CLEAR 20}.',
    '{CLEAR 11}I{CLEAR 6}J{CLEAR 6}K{CLEAR 6}L{CLEAR 20}M{CLEAR 6}N{CLEAR 6}O{CLEAR 6}P{CLEAR 20},',
    '{CLEAR 11}Q{CLEAR 6}R{CLEAR 6}S{CLEAR 6}T{CLEAR 20}U{CLEAR 6}V{CLEAR 6}W{CLEAR 6}X{CLEAR 20} ',
    '{CLEAR 11}Y{CLEAR 6}Z{CLEAR 6} {CLEAR 9} {CLEAR 23}-{CLEAR 6} {CLEAR 6} {CLEAR 6} {CLEAR 20} ',
  ],
  // KEYBOARD_SYMBOLS (1:1 décomp:18-21)
  [
    '{CLEAR 11}0{CLEAR 16}1{CLEAR 16}2{CLEAR 16}3{CLEAR 16}4{CLEAR 16} ',
    '{CLEAR 11}5{CLEAR 16}6{CLEAR 16}7{CLEAR 16}8{CLEAR 16}9{CLEAR 16} ',
    "{CLEAR 12}!{CLEAR 17}?{CLEAR 16}♂{CLEAR 16}♀{CLEAR 16}/{CLEAR 16} ",
    "{CLEAR 11}…{CLEAR 16}“{CLEAR 16}”{CLEAR 18}‘{CLEAR 18}'{CLEAR 18} ",
  ],
];
/* @strings-ignore-end (lignes texte clavier = data, cf. start ci-dessus) */

// 1:1 décomp src/naming_screen.c:1942-1947 sFillValues[KBPAGE_COUNT].
// PIXEL_FILL(idx) = (idx<<4)|idx (= 2 nibbles palette idx packés dans un byte).
// Indices = banks dans la window palette (paletteNum=10 = keyboard.pal) :
//   13 = idx 13 (123,172,197) = light blue   → KEYBOARD_LETTERS_UPPER bg
//   14 = idx 14 (213,156,115) = orange       → KEYBOARD_LETTERS_LOWER bg
//   15 = idx 15 (148,189,106) = green        → KEYBOARD_SYMBOLS bg
const sFillValues: readonly number[] = [
  /* KEYBOARD_LETTERS_LOWER = 0 */ 0xEE,  // PIXEL_FILL(14)
  /* KEYBOARD_LETTERS_UPPER = 1 */ 0xDD,  // PIXEL_FILL(13)
  /* KEYBOARD_SYMBOLS       = 2 */ 0xFF,  // PIXEL_FILL(15)
];

// 1:1 décomp src/naming_screen.c:1928-1954 sTextColorStruct + sKeyboardTextColors.
// Triplets [bgColor, fgColor, shadowColor]. Le bgColor utilise un DYNAMIC_COLOR
// (idx 13/14/15 dans la palette du window = matched avec sFillValues idx) :
//   LOWER  : DYNAMIC_5=14 (orange) + WHITE + DARK_GRAY
//   UPPER  : DYNAMIC_4=13 (blue)   + WHITE + DARK_GRAY
//   SYMBOLS: DYNAMIC_6=15 (green)  + WHITE + DARK_GRAY
// Le bgColor === sFillValues idx → "ghost" pixels du glyph se fondent dans
// le bg fill (= invisible). Seuls fg (white) + shadow (dark gray) écrivent.
const sKeyboardTextColors: ReadonlyArray<readonly number[]> = [
  /* KEYBOARD_LETTERS_LOWER = 0 */ [0xE, 0x1, 0x2],  // DYNAMIC_5, WHITE, DARK_GRAY
  /* KEYBOARD_LETTERS_UPPER = 1 */ [0xD, 0x1, 0x2],  // DYNAMIC_4, WHITE, DARK_GRAY
  /* KEYBOARD_SYMBOLS       = 2 */ [0xF, 0x1, 0x2],  // DYNAMIC_6, WHITE, DARK_GRAY
];

function drawKeyboardWindow(win: number, kbId: number): void {
  // 1:1 décomp src/naming_screen.c:1956-1966 PrintKeyboardKeys :
  //   FillWindowPixelBuffer(window, sFillValues[page]);
  //   for (i = 0; i < KBROW_COUNT; i++)
  //     AddTextPrinterParameterized3(window, FONT_NORMAL, 0, i * 16 + 1,
  //       sKeyboardTextColors[page], 0, sNamingScreenKeyboardText[page][i]);
  //   PutWindowTilemap(window);
  //
  // sFillValues + sKeyboardTextColors indexés par KEYBOARD_LETTERS_LOWER/UPPER/SYMBOLS
  // (= 0/1/2). kbId est exactement cette valeur (cf. `sPageToKeyboardId` /
  // `sPageToNextKeyboardId`).
  const fill = sFillValues[kbId] ?? 0x00;
  const colors = sKeyboardTextColors[kbId] ?? [0x0, 0x1, 0x2];
  FillWindowPixelBuffer(win, fill);
  for (let row = 0; row < KBROW_COUNT; row++) {
    const text = sNamingScreenKeyboardText[kbId]?.[row];
    if (!text) continue;
    const y = row * 16 + 1;
    AddTextPrinterParameterized3(win, 1, 0, y, colors, 255, text);
  }
  PutWindowTilemap(win);
  CopyWindowToVram(win, 3);
}

function CreateHelperTasks(): void {
  CreateInputHandlerTask();
  CreateButtonFlashTask();
}

// ─── Globals exposure for auto-callbacks (= used by transpiled code) ────────

(globalThis as Record<string, unknown>).Task_NamingScreen = Task_NamingScreen;
(globalThis as Record<string, unknown>).CB2_LoadNamingScreen = CB2_LoadNamingScreen;
(globalThis as Record<string, unknown>).CB2_NamingScreen = CB2_NamingScreen;
(globalThis as Record<string, unknown>).MainState_FadeIn = MainState_FadeIn;
(globalThis as Record<string, unknown>).MainState_WaitFadeIn = MainState_WaitFadeIn;
(globalThis as Record<string, unknown>).MainState_HandleInput = MainState_HandleInput;
(globalThis as Record<string, unknown>).MainState_MoveToOKButton = MainState_MoveToOKButton;
(globalThis as Record<string, unknown>).MainState_PressedOKButton = MainState_PressedOKButton;
(globalThis as Record<string, unknown>).MainState_StartPageSwap = MainState_StartPageSwap;
(globalThis as Record<string, unknown>).MainState_WaitPageSwap = MainState_WaitPageSwap;
(globalThis as Record<string, unknown>).MainState_FadeOut = MainState_FadeOut;
(globalThis as Record<string, unknown>).MainState_Exit = MainState_Exit;
(globalThis as Record<string, unknown>).GetCurrentPageColumnCount = GetCurrentPageColumnCount;
(globalThis as Record<string, unknown>).GetCursorPos = GetCursorPos;
(globalThis as Record<string, unknown>).SetCursorPos = SetCursorPos;
(globalThis as Record<string, unknown>).IsCursorAnimFinished = IsCursorAnimFinished;
(globalThis as Record<string, unknown>).SetCursorInvisibility = SetCursorInvisibility;
(globalThis as Record<string, unknown>).SetCursorFlashing = SetCursorFlashing;
(globalThis as Record<string, unknown>).MoveCursorToOKButton = MoveCursorToOKButton;
(globalThis as Record<string, unknown>).TryStartButtonFlash = TryStartButtonFlash;
(globalThis as Record<string, unknown>).GetInputEvent = GetInputEvent;
(globalThis as Record<string, unknown>).SetInputState = SetInputState;
(globalThis as Record<string, unknown>).GetTextEntryPosition = GetTextEntryPosition;
(globalThis as Record<string, unknown>).GetCharAtKeyboardPos = GetCharAtKeyboardPos;
(globalThis as Record<string, unknown>).IsPageSwapAnimNotInProgress = IsPageSwapAnimNotInProgress;
(globalThis as Record<string, unknown>).SaveInputText = SaveInputText;
(globalThis as Record<string, unknown>).DrawTextEntry = DrawTextEntry;
(globalThis as Record<string, unknown>).DrawTextEntryBox = DrawTextEntryBox;
(globalThis as Record<string, unknown>).PrintControls = PrintControls;
// Sprite callbacks (for re-attach via auto-callback dispatch if needed)
(globalThis as Record<string, unknown>).SpriteCB_Cursor = SpriteCB_Cursor;
(globalThis as Record<string, unknown>).SpriteCB_InputArrow = SpriteCB_InputArrow;
(globalThis as Record<string, unknown>).SpriteCB_Underscore = SpriteCB_Underscore;
(globalThis as Record<string, unknown>).SpriteCB_PageSwap = SpriteCB_PageSwap;
