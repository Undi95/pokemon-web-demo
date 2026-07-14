// @ts-nocheck — transpilé brut (types stricts au câblage fin ; wire-transpiled.cjs)
/**
 * pokenav_menu_handler_gfx.ts — miroir 1:1 de `D:/Projet 1/decomps/pokeemeraude/src/pokenav_menu_handler_gfx.c` (transpilé).
 *
 * Généré par scripts/transpile-c.cjs — revue humaine OBLIGATOIRE avant commit :
 * rapport des flags dans audit-reports/transpile/pokenav_menu_handler_gfx.md.
 * Politique préproc : build vanilla FR (NDEBUG/FRENCH définis, BUGFIX/UBFIX absents).
 */

import { BLDALPHA_BLEND, BLDCNT_EFFECT_LIGHTEN, BLDCNT_EFFECT_NONE, BLDCNT_TGT1_OBJ, CpuFill16, FindTaskIdByFunc, FuncIsActiveTask, InitSpriteAffineAnim, LoadCompressedSpriteSheet, LoadPalette, PLTT_SIZEOF, SpriteCallbackDummy, TransferPlttBuffer, WINOUT_WIN01_BG_ALL, WINOUT_WIN01_OBJ } from '../harness/runtime/decomp-globals';
import { ClearGpuRegBits, RGB, ST_OAM_4BPP, ST_OAM_OBJ_BLEND, ST_OAM_OBJ_NORMAL, SetGpuRegBits } from '../harness/runtime/decomp-helpers';
import { TEXT_COLOR_BLUE, TEXT_COLOR_GREEN, TEXT_COLOR_LIGHT_GREEN } from '../include/constants/characters';
import { SE_FAILURE, SE_POKENAV_ON, SE_SELECT } from '../include/constants/songs';
import { DISPLAY_HEIGHT } from '../include/gba/defines';
import { DISPCNT_WIN0_ON, DMA_DEST_RELOAD, DMA_ENABLE, DMA_REPEAT, DMA_START_HBLANK, REG_OFFSET_BLDALPHA, REG_OFFSET_BLDCNT, REG_OFFSET_BLDY, REG_OFFSET_DISPCNT, REG_OFFSET_WIN0V, REG_OFFSET_WININ, REG_OFFSET_WINOUT } from '../include/gba/io_reg';
import { ST_OAM_AFFINE_DOUBLE, ST_OAM_AFFINE_OFF } from '../include/sprite';
import { FONT_NORMAL } from '../include/text';
import { IsDma3ManagerBusyWithBgCopy } from './battle_bg';
import { PlaySE } from './battle_controllers';
import { PIXEL_FILL } from './window';
import { StartSpriteAffineAnim } from './engine/decomp-impls/sprite-engine-impl';
import { gSaveBlock1Ptr } from './engine/save/save-block-state';
import { getString } from '../harness/runtime/decomp-strings';
import { gMapHeader } from './fieldmap';
import { SetGpuReg } from './gpu_regs';
import { AddTextPrinterParameterized3 } from './menu';
import { BG_PLTT_ID } from './palette';
import { ScanlineEffect_InitHBlankDmaTransfer, ScanlineEffect_SetParams, ScanlineEffect_Stop, gScanlineEffectRegBuffers } from './scanline_effect';
import { CalcCenterToCornerVec, CreateSprite, DestroySprite, FreeOamMatrix, FreeSpritePaletteByTag, FreeSpriteTilesByTag, GetSpriteTileStartByTag, IndexOfSpritePaletteTag, LoadOam, PLTT_SIZE_4BPP, ProcessSpriteCopyRequests, gDummySpriteAffineAnimTable, gDummySpriteAnimTable, gSprites } from './sprite';
import { CreateTask, DestroyTask, gTasks } from './task';
import { GetStringWidth } from './text';
import { gSineTable } from './trig';
import { AddWindow, COPYWIN_FULL, ChangeBgX, ChangeBgY, CopyBgTilemapBufferToVram, CopyToBgTilemapBuffer, CopyWindowToVram, FillWindowPixelBuffer, PutWindowTilemap, RemoveWindow, ShowBg } from './window';
import type { DecompSprite } from '../harness/runtime/decomp-runtime';
import type { ScanlineEffectParams } from './scanline_effect';
import type {  SpriteTemplate } from './sprite';
import type { WindowTemplate } from './window';

// ═══ wire-transpiled (auto) : imports résolus par l'index + sentinelles ═══
import { DISPLAY_WIDTH } from '../include/gba/defines';
import type { OamData } from '../include/gba/types';
import { __wireTodo } from './engine/wire-todo';
import { CreateLoopedTask, IsLoopedTaskActive } from './pokenav_looped_task';
import { AllocSubstruct, FreePokenavSubstruct, GetSubstructPtr } from './pokenav_resources';
import { GetWordTaskArg, SetWordTaskArg } from './task';
import { AreLeftHeaderSpritesMoving, CopyPaletteIntoBufferUnfaded, HideMainOrSubMenuLeftHeader, InitBgTemplates, IsPaletteFadeActive, LoadLeftHeaderGfxForIndex, PokenavCopyPalette, PokenavFadeScreen, Pokenav_AllocAndLoadPalettes, PrintHelpBarText, ShowLeftHeaderGfx, SlideMenuHeaderUp, WaitForHelpBar, DecompressAndCopyTileDataToVram, FreeTempTileDataBuffersIfPossible, SetBgTilemapBuffer } from './pokenav_main_menu';
import { GetCurrentMenuItemId, GetHelpBarTextId, GetPokenavCursorPos, GetPokenavMenuType } from './pokenav_menu_handler';
import { GetMatchTableMapSectionId, IsRematchEntryRegistered } from './pokenav_match_call_list';
import { loadTileBin, extractPngPlte, loadTilemapBin, loadGbaPal } from '../harness/gba/png-loader';
import { getRuntime } from '../harness/runtime/decomp-globals';
// ─── WIRE-TODO : symboles transpilés SANS foyer dans le repo (throw à l'appel) ───
// 1:1 include/sprite.h:130,136 — builders `union AffineAnimCmd` (défaut local, à consolider include/).
const AFFINEANIMCMD_END = { type: 0x7FFF /* AFFINEANIMCMDTYPE_END */ };
const AFFINEANIMCMD_FRAME = (xScale: number, yScale: number, rotation: number, duration: number) => ({ frame: { xScale, yScale, rotation, duration } });
const FreeSpriteOamMatrix: any = __wireTodo('FreeSpriteOamMatrix');
const REG_WIN0H: any = __wireTodo('REG_WIN0H');
const SetPokenavVBlankCallback: any = __wireTodo('SetPokenavVBlankCallback');
// 1:1 wrapper pokénav `static void SetVBlankCallback_(IntrCallback cb) { SetVBlankCallback(cb); }`
// (suffixe `_` = wrapper pokénav autour de la fn globale, cf. InitKeys_).
function SetVBlankCallback_(cb: any): void { getRuntime()?.SetVBlankCallback(cb); }
let gPokenavMessageBox_Gfx: any = null; // ADAPTATION : asset chargé async (chantier menu-content L2)
let gPokenavMessageBox_Pal: any = null; // ADAPTATION : asset chargé async (chantier menu-content L2)
let gPokenavMessageBox_Tilemap: any = null; // ADAPTATION : asset chargé async (chantier menu-content L2)
let gPokenavOptions_Gfx: any = null; // ADAPTATION : asset chargé async (chantier menu-content L2)
let gPokenavOptions_Pal: any = new Uint16Array(0x100); // placeholder (zéros) — asset réel chargé en STEP B (chantier menu-content L2)

// ─── constantes décomp inlinées (headers pas encore dans include/) ───
const REMATCH_TABLE_ENTRIES = 78; // 1:1 include/constants/rematches.h:0 (à consolider dans include/)
const POKENAV_SUBSTRUCT_MENU_GFX = 2; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const BG_COORD_SET = 0; // 1:1 include/bg.h:0 (à consolider dans include/)
const LT_INC_AND_PAUSE = 0; // 1:1 include/pokenav.h:58 (à consolider dans include/)
const LT_PAUSE = 2; // 1:1 include/pokenav.h:60 (à consolider dans include/)
const POKENAV_MENU_TYPE_CONDITION = 3; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_MENU_TYPE_CONDITION_SEARCH = 4; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const LT_INC_AND_CONTINUE = 1; // 1:1 include/pokenav.h:59 (à consolider dans include/)
const POKENAV_FADE_FROM_BLACK = 1; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_FADE_FROM_BLACK_ALL = 3; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const LT_FINISH = 4; // 1:1 include/pokenav.h:62 (à consolider dans include/)
const POKENAV_GFX_MAIN_MENU = 0; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_GFX_CONDITION_MENU = 1; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_GFX_SEARCH_MENU = 7; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_FADE_TO_BLACK = 0; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const MAX_POKENAV_MENUITEMS = 6; // 1:1 include/pokenav.h:167 (à consolider dans include/)
const BLDCNT_TGT2_ALL = 16128; // 1:1 include/gba/io_reg.h:610 (à consolider dans include/)
const BG_COORD_ADD = 1; // 1:1 include/bg.h:0 (à consolider dans include/)
const WININ_WIN0_ALL = 63; // 1:1 include/gba/io_reg.h:557 (à consolider dans include/)

const GFXTAG_BLUE_LIGHT = 1; // 1:1 pokenav_menu_handler_gfx.c:20

const GFXTAG_OPTIONS = 3; // 1:1 pokenav_menu_handler_gfx.c:21

const PALTAG_BLUE_LIGHT = 3; // 1:1 pokenav_menu_handler_gfx.c:23

const PALTAG_OPTIONS_DEFAULT = 4 // Includes green for Smart/Region Map and yellow for Tough; // 1:1 pokenav_menu_handler_gfx.c:24

const PALTAG_OPTIONS_BLUE = 5; // 1:1 pokenav_menu_handler_gfx.c:25

const PALTAG_OPTIONS_PINK = 6; // 1:1 pokenav_menu_handler_gfx.c:26

const PALTAG_OPTIONS_BEIGE = 7; // 1:1 pokenav_menu_handler_gfx.c:27

const PALTAG_OPTIONS_RED = 8; // 1:1 pokenav_menu_handler_gfx.c:28

const PALTAG_OPTIONS_START = PALTAG_OPTIONS_DEFAULT; // 1:1 pokenav_menu_handler_gfx.c:30

const NUM_OPTION_SUBSPRITES = 4; // 1:1 pokenav_menu_handler_gfx.c:32

const OPTION_DEFAULT_X = 140; // 1:1 pokenav_menu_handler_gfx.c:34

const OPTION_SELECTED_X = 130; // 1:1 pokenav_menu_handler_gfx.c:35

const OPTION_EXIT_X = (DISPLAY_WIDTH + 16); // 1:1 pokenav_menu_handler_gfx.c:36

/** 1:1 `struct Pokenav_MenuGfx` (pokenav_menu_handler_gfx.c:38). */
interface Pokenav_MenuGfx {
  isTaskActiveCB: ((...args: any[]) => any) | null;
  loopedTaskId: number;
  optionDescWindowId: number;
  bg3ScrollTaskId: number;
  cursorPos: number;
  numIconsBlending: number;
  pokenavAlreadyOpen: boolean;
  iconVisible: any[];
  blueLightSprite: DecompSprite | null;
  iconSprites: DecompSprite | null;
  bg1TilemapBuffer: Uint8Array;
}

// TRANSPILER-TODO INCGFX : sPokenavBgDotsPal ← graphics/pokenav/bg_dots.png (pipeline assets : loadTileBin/loadGbaPal('/decomp/em/…'))
let sPokenavBgDotsPal: any = null;

// TRANSPILER-TODO INCGFX : sPokenavBgDotsTiles ← graphics/pokenav/bg_dots.png (pipeline assets : loadTileBin/loadGbaPal('/decomp/em/…'))
let sPokenavBgDotsTiles: any = null;

// TRANSPILER-TODO INCGFX : sPokenavBgDotsTilemap ← graphics/pokenav/bg_dots.bin (pipeline assets : loadTileBin/loadGbaPal('/decomp/em/…'))
let sPokenavBgDotsTilemap: any = null;

// TRANSPILER-TODO INCGFX : sPokenavDeviceBgPal ← graphics/pokenav/device_outline.png (pipeline assets : loadTileBin/loadGbaPal('/decomp/em/…'))
let sPokenavDeviceBgPal: any = null;

// TRANSPILER-TODO INCGFX : sPokenavDeviceBgTiles ← graphics/pokenav/device_outline.png (pipeline assets : loadTileBin/loadGbaPal('/decomp/em/…'))
let sPokenavDeviceBgTiles: any = null;

// TRANSPILER-TODO INCGFX : sPokenavDeviceBgTilemap ← graphics/pokenav/device_outline_map.bin (pipeline assets : loadTileBin/loadGbaPal('/decomp/em/…'))
let sPokenavDeviceBgTilemap: any = null;

// TRANSPILER-TODO INCGFX : sMatchCallBlueLightPal ← graphics/pokenav/blue_light.png (pipeline assets : loadTileBin/loadGbaPal('/decomp/em/…'))
let sMatchCallBlueLightPal: any = null;

// TRANSPILER-TODO INCGFX : sMatchCallBlueLightTiles ← graphics/pokenav/blue_light.png (pipeline assets : loadTileBin/loadGbaPal('/decomp/em/…'))
let sMatchCallBlueLightTiles: any = null;

/** 1:1 (pokenav_menu_handler_gfx.c:111) */
const sPokenavMainMenuBgTemplates = [
  {
    bg: 1, /* :2 */
    charBaseIndex: 1, /* :2 */
    mapBaseIndex: 15, /* :5 */
    screenSize: 0, /* :2 */
    paletteMode: 0, /* :1 */
    priority: 1, /* :2 */
    baseTile: 0x000, /* :10 */
  },
  {
    bg: 2, /* :2 */
    charBaseIndex: 2, /* :2 */
    mapBaseIndex: 23, /* :5 */
    screenSize: 0, /* :2 */
    paletteMode: 0, /* :1 */
    priority: 2, /* :2 */
    baseTile: 0x000, /* :10 */
  },
  {
    bg: 3, /* :2 */
    charBaseIndex: 3, /* :2 */
    mapBaseIndex: 31, /* :5 */
    screenSize: 0, /* :2 */
    paletteMode: 0, /* :1 */
    priority: 3, /* :2 */
    baseTile: 0x000, /* :10 */
  },
];

/** 1:1 (pokenav_menu_handler_gfx.c:139) */
const sMenuHandlerLoopTaskFuncs = [
  null, // [POKENAV_MENU_FUNC_NONE]
  LoopedTask_MoveMenuCursor, // [POKENAV_MENU_FUNC_MOVE_CURSOR]
  LoopedTask_OpenConditionMenu, // [POKENAV_MENU_FUNC_OPEN_CONDITION]
  LoopedTask_ReturnToMainMenu, // [POKENAV_MENU_FUNC_RETURN_TO_MAIN]
  LoopedTask_OpenConditionSearchMenu, // [POKENAV_MENU_FUNC_OPEN_CONDITION_SEARCH]
  LoopedTask_ReturnToConditionMenu, // [POKENAV_MENU_FUNC_RETURN_TO_CONDITION]
  LoopedTask_SelectRibbonsNoWinners, // [POKENAV_MENU_FUNC_NO_RIBBON_WINNERS]
  LoopedTask_ReShowDescription, // [POKENAV_MENU_FUNC_RESHOW_DESCRIPTION]
  LoopedTask_OpenPokenavFeature, // [POKENAV_MENU_FUNC_OPEN_FEATURE]
];

/** 1:1 (pokenav_menu_handler_gfx.c:152) */
const sPokenavOptionsSpriteSheets = [
  {
    data: gPokenavOptions_Gfx,
    size: 0x3400,
    tag: GFXTAG_OPTIONS },
  {
    data: sMatchCallBlueLightTiles,
    size: 0x0100,
    tag: GFXTAG_BLUE_LIGHT },
];

/** 1:1 (pokenav_menu_handler_gfx.c:166) */
const sPokenavOptionsSpritePalettes = [
  {
    data: gPokenavOptions_Pal.subarray(0x00) /* TRANSPILER-TODO &élément scalaire (out-param ?) */,
    tag: PALTAG_OPTIONS_DEFAULT },
  {
    data: gPokenavOptions_Pal.subarray(0x10) /* TRANSPILER-TODO &élément scalaire (out-param ?) */,
    tag: PALTAG_OPTIONS_BLUE },
  {
    data: gPokenavOptions_Pal.subarray(0x20) /* TRANSPILER-TODO &élément scalaire (out-param ?) */,
    tag: PALTAG_OPTIONS_PINK },
  {
    data: gPokenavOptions_Pal.subarray(0x30) /* TRANSPILER-TODO &élément scalaire (out-param ?) */,
    tag: PALTAG_OPTIONS_BEIGE },
  {
    data: gPokenavOptions_Pal.subarray(0x40) /* TRANSPILER-TODO &élément scalaire (out-param ?) */,
    tag: PALTAG_OPTIONS_RED },
  {
    data: sMatchCallBlueLightPal,
    tag: PALTAG_BLUE_LIGHT },
  [

  ],
];

// Tile number, palette tag offset

/** 1:1 (pokenav_menu_handler_gfx.c:178) */
const sOptionsLabelGfx_RegionMap = Uint16Array.from([
  0x000,
  PALTAG_OPTIONS_DEFAULT - PALTAG_OPTIONS_START,
]);

/** 1:1 (pokenav_menu_handler_gfx.c:179) */
const sOptionsLabelGfx_Condition = Uint16Array.from([
  0x020,
  PALTAG_OPTIONS_BLUE - PALTAG_OPTIONS_START,
]);

/** 1:1 (pokenav_menu_handler_gfx.c:180) */
const sOptionsLabelGfx_MatchCall = Uint16Array.from([
  0x040,
  PALTAG_OPTIONS_RED - PALTAG_OPTIONS_START,
]);

/** 1:1 (pokenav_menu_handler_gfx.c:181) */
const sOptionsLabelGfx_Ribbons = Uint16Array.from([
  0x060,
  PALTAG_OPTIONS_PINK - PALTAG_OPTIONS_START,
]);

/** 1:1 (pokenav_menu_handler_gfx.c:182) */
const sOptionsLabelGfx_SwitchOff = Uint16Array.from([
  0x080,
  PALTAG_OPTIONS_BEIGE - PALTAG_OPTIONS_START,
]);

/** 1:1 (pokenav_menu_handler_gfx.c:183) */
const sOptionsLabelGfx_Party = Uint16Array.from([
  0x0A0,
  PALTAG_OPTIONS_BLUE - PALTAG_OPTIONS_START,
]);

/** 1:1 (pokenav_menu_handler_gfx.c:184) */
const sOptionsLabelGfx_Search = Uint16Array.from([
  0x0C0,
  PALTAG_OPTIONS_BLUE - PALTAG_OPTIONS_START,
]);

/** 1:1 (pokenav_menu_handler_gfx.c:185) */
const sOptionsLabelGfx_Cool = Uint16Array.from([
  0x0E0,
  PALTAG_OPTIONS_RED - PALTAG_OPTIONS_START,
]);

/** 1:1 (pokenav_menu_handler_gfx.c:186) */
const sOptionsLabelGfx_Beauty = Uint16Array.from([
  0x100,
  PALTAG_OPTIONS_BLUE - PALTAG_OPTIONS_START,
]);

/** 1:1 (pokenav_menu_handler_gfx.c:187) */
const sOptionsLabelGfx_Cute = Uint16Array.from([
  0x120,
  PALTAG_OPTIONS_PINK - PALTAG_OPTIONS_START,
]);

/** 1:1 (pokenav_menu_handler_gfx.c:188) */
const sOptionsLabelGfx_Smart = Uint16Array.from([
  0x140,
  PALTAG_OPTIONS_DEFAULT - PALTAG_OPTIONS_START,
]);

/** 1:1 (pokenav_menu_handler_gfx.c:189) */
const sOptionsLabelGfx_Tough = Uint16Array.from([
  0x160,
  PALTAG_OPTIONS_DEFAULT - PALTAG_OPTIONS_START,
]);

/** 1:1 (pokenav_menu_handler_gfx.c:190) */
const sOptionsLabelGfx_Cancel = Uint16Array.from([
  0x180,
  PALTAG_OPTIONS_BEIGE - PALTAG_OPTIONS_START,
]);

/** 1:1 (pokenav_menu_handler_gfx.c:197) */
export const sPokenavMenuOptionLabelGfx = [
  {
    yStart: 42,
    deltaY: 20,
    gfx: [
      sOptionsLabelGfx_RegionMap,
      sOptionsLabelGfx_Condition,
      sOptionsLabelGfx_SwitchOff,
    ] }, // [POKENAV_MENU_TYPE_DEFAULT]
  {
    yStart: 42,
    deltaY: 20,
    gfx: [
      sOptionsLabelGfx_RegionMap,
      sOptionsLabelGfx_Condition,
      sOptionsLabelGfx_MatchCall,
      sOptionsLabelGfx_SwitchOff,
    ] }, // [POKENAV_MENU_TYPE_UNLOCK_MC]
  {
    yStart: 42,
    deltaY: 20,
    gfx: [
      sOptionsLabelGfx_RegionMap,
      sOptionsLabelGfx_Condition,
      sOptionsLabelGfx_MatchCall,
      sOptionsLabelGfx_Ribbons,
      sOptionsLabelGfx_SwitchOff,
    ] }, // [POKENAV_MENU_TYPE_UNLOCK_MC_RIBBONS]
  {
    yStart: 56,
    deltaY: 20,
    gfx: [
      sOptionsLabelGfx_Party,
      sOptionsLabelGfx_Search,
      sOptionsLabelGfx_Cancel,
    ] }, // [POKENAV_MENU_TYPE_CONDITION]
  {
    yStart: 40,
    deltaY: 16,
    gfx: [
      sOptionsLabelGfx_Cool,
      sOptionsLabelGfx_Beauty,
      sOptionsLabelGfx_Cute,
      sOptionsLabelGfx_Smart,
      sOptionsLabelGfx_Tough,
      sOptionsLabelGfx_Cancel,
    ] }, // [POKENAV_MENU_TYPE_CONDITION_SEARCH]
];

/** 1:1 (pokenav_menu_handler_gfx.c:257) */
const sOptionDescWindowTemplate = {
  bg: 1,
  tilemapLeft: 3,
  tilemapTop: 17,
  width: 24,
  height: 2,
  paletteNum: 1,
  baseBlock: 8 };

/** 1:1 (pokenav_menu_handler_gfx.c:268) */
// 1:1 `static const u8 *const sPageDescriptions[]` = tableau de POINTEURS string (pas des octets).
// Le transpileur l'avait mis en `Uint8Array.from([...])` → chaque string coercée en NaN→0 → descriptions
// VIDES. Tableau JS simple (chaque élément = le retour de getString).
const sPageDescriptions = [
  getString('gText_CheckMapOfHoenn'), // [POKENAV_MENUITEM_MAP]
  getString('gText_CheckPokemonInDetail'), // [POKENAV_MENUITEM_CONDITION]
  getString('gText_CallRegisteredTrainer'), // [POKENAV_MENUITEM_MATCH_CALL]
  getString('gText_CheckObtainedRibbons'), // [POKENAV_MENUITEM_RIBBONS]
  getString('gText_PutAwayPokenav'), // [POKENAV_MENUITEM_SWITCH_OFF]
  getString('gText_CheckPartyPokemonInDetail'), // [POKENAV_MENUITEM_CONDITION_PARTY]
  getString('gText_CheckAllPokemonInDetail'), // [POKENAV_MENUITEM_CONDITION_SEARCH]
  getString('gText_ReturnToPokenavMenu'), // [POKENAV_MENUITEM_CONDITION_CANCEL]
  getString('gText_FindCoolPokemon'), // [POKENAV_MENUITEM_CONDITION_SEARCH_COOL]
  getString('gText_FindBeautifulPokemon'), // [POKENAV_MENUITEM_CONDITION_SEARCH_BEAUTY]
  getString('gText_FindCutePokemon'), // [POKENAV_MENUITEM_CONDITION_SEARCH_CUTE]
  getString('gText_FindSmartPokemon'), // [POKENAV_MENUITEM_CONDITION_SEARCH_SMART]
  getString('gText_FindToughPokemon'), // [POKENAV_MENUITEM_CONDITION_SEARCH_TOUGH]
  getString('gText_ReturnToConditionMenu'), // [POKENAV_MENUITEM_CONDITION_SEARCH_CANCEL]
];

/** 1:1 (pokenav_menu_handler_gfx.c:286) */
const sOptionDescTextColors = Uint8Array.from([
  TEXT_COLOR_GREEN,
  TEXT_COLOR_BLUE,
  TEXT_COLOR_LIGHT_GREEN,
]);

/** 1:1 (pokenav_menu_handler_gfx.c:287) */
const sOptionDescTextColors2 = Uint8Array.from([
  TEXT_COLOR_GREEN,
  TEXT_COLOR_BLUE,
  TEXT_COLOR_LIGHT_GREEN,
]);

/** 1:1 (pokenav_menu_handler_gfx.c:289) */
const sOamData_MenuOption = {
  y: 0, /* :8 */
  affineMode: ST_OAM_AFFINE_OFF, /* :2 */
  objMode: ST_OAM_OBJ_NORMAL, /* :2 */
  bpp: ST_OAM_4BPP, /* :1 */
  shape: 1, /* :2 */
  /* SPRITE_SHAPE(32x16) */
  x: 0, /* :9 */
  size: 2, /* :2 */
  /* SPRITE_SIZE(32x16) */
  tileNum: 0, /* :10 */
  priority: 2, /* :2 */
  paletteNum: 0, /* :4 */
};

/** 1:1 (pokenav_menu_handler_gfx.c:303) */
const sAffineAnim_MenuOption_Normal = {
  type: AFFINEANIMCMD_FRAME(0x100, 0x100, 0, 0),
  frame: AFFINEANIMCMD_END };

/** 1:1 (pokenav_menu_handler_gfx.c:309) */
const sAffineAnim_MenuOption_Zoom = {
  type: AFFINEANIMCMD_FRAME(0x100, 0x100, 0, 0),
  frame: AFFINEANIMCMD_FRAME(0x10, 0x10, 0, 0x12),
  loop: AFFINEANIMCMD_END };

/** 1:1 (pokenav_menu_handler_gfx.c:316) */
const sAffineAnims_MenuOption = [
  sAffineAnim_MenuOption_Normal,
  sAffineAnim_MenuOption_Zoom,
];

/** 1:1 (pokenav_menu_handler_gfx.c:322) */
const sMenuOptionSpriteTemplate = {
  tileTag: GFXTAG_OPTIONS,
  paletteTag: PALTAG_OPTIONS_START,
  oam: sOamData_MenuOption,
  anims: gDummySpriteAnimTable,
  images: null,
  affineAnims: sAffineAnims_MenuOption,
  callback: SpriteCallbackDummy };

/** 1:1 (pokenav_menu_handler_gfx.c:333) */
const sBlueLightOamData = {
  y: 0, /* :8 */
  affineMode: ST_OAM_AFFINE_OFF, /* :2 */
  objMode: ST_OAM_OBJ_NORMAL, /* :2 */
  bpp: ST_OAM_4BPP, /* :1 */
  shape: 1, /* :2 */
  /* SPRITE_SHAPE(32x16) */
  x: 0, /* :9 */
  size: 2, /* :2 */
  /* SPRITE_SIZE(32x16) */
  tileNum: 0, /* :10 */
  priority: 2, /* :2 */
  paletteNum: 0, /* :4 */
};

/** 1:1 (pokenav_menu_handler_gfx.c:347) */
const sMatchCallBlueLightSpriteTemplate = {
  tileTag: GFXTAG_BLUE_LIGHT,
  paletteTag: PALTAG_BLUE_LIGHT,
  oam: sBlueLightOamData,
  anims: gDummySpriteAnimTable,
  images: null,
  affineAnims: gDummySpriteAffineAnimTable,
  callback: SpriteCallbackDummy };

/** 1:1 (pokenav_menu_handler_gfx.c:358) */
const sPokenavMainMenuScanlineEffectParams = {
  dmaDest: REG_WIN0H,
  dmaControl: ((DMA_ENABLE | DMA_START_HBLANK | DMA_REPEAT | DMA_DEST_RELOAD) << 16) | 1,
  initState: 1,
  unused9: 0 };

/** 1:1 `static bool32 AreAnyTrainerRematchesNearby(void)` (pokenav_menu_handler_gfx.c:366-379). */
function AreAnyTrainerRematchesNearby(): boolean {
  let i = 0;
  for (i = 0; i < REMATCH_TABLE_ENTRIES; i++)
  {
    if (GetMatchTableMapSectionId(i) == gMapHeader.regionMapSectionId && IsRematchEntryRegistered(i) && gSaveBlock1Ptr.trainerRematches[i])
      return true;
  }
  return false;
}

/** 1:1 `bool32 OpenPokenavMenuInitial(void)` (pokenav_menu_handler_gfx.c:381-390). */
export function OpenPokenavMenuInitial(): boolean {
  let gfx = OpenPokenavMenu();
  if (gfx == null)
    return false;
  gfx.pokenavAlreadyOpen = false;
  return true;
}

/** 1:1 `bool32 OpenPokenavMenuNotInitial(void)` (pokenav_menu_handler_gfx.c:392-401). */
export function OpenPokenavMenuNotInitial(): boolean {
  let gfx = OpenPokenavMenu();
  if (gfx == null)
    return false;
  gfx.pokenavAlreadyOpen = true;
  return true;
}

/** 1:1 `static struct Pokenav_MenuGfx * OpenPokenavMenu(void)` (pokenav_menu_handler_gfx.c:403-415). */
function OpenPokenavMenu(): Pokenav_MenuGfx | null {
  let gfx = AllocSubstruct(POKENAV_SUBSTRUCT_MENU_GFX, 0 /* TRANSPILER-TODO sizeof(struct Pokenav_MenuGfx) */);
  if (gfx != null)
  {
    gfx.numIconsBlending = 0;
    gfx.loopedTaskId = CreateLoopedTask(LoopedTask_OpenMenu, 1);
    gfx.isTaskActiveCB = GetCurrentLoopedTaskActive;
  }
  return gfx;
}

/** 1:1 `void CreateMenuHandlerLoopedTask(s32 ltIdx)` (pokenav_menu_handler_gfx.c:417-422). */
export function CreateMenuHandlerLoopedTask(ltIdx: number): void {
  let gfx = GetSubstructPtr(POKENAV_SUBSTRUCT_MENU_GFX);
  gfx.loopedTaskId = CreateLoopedTask(sMenuHandlerLoopTaskFuncs[ltIdx], 1);
  gfx.isTaskActiveCB = GetCurrentLoopedTaskActive;
}

/** 1:1 `bool32 IsMenuHandlerLoopedTaskActive(void)` (pokenav_menu_handler_gfx.c:424-428). */
export function IsMenuHandlerLoopedTaskActive(): boolean {
  let gfx = GetSubstructPtr(POKENAV_SUBSTRUCT_MENU_GFX);
  return gfx.isTaskActiveCB();
}

/** 1:1 `void FreeMenuHandlerSubstruct2(void)` (pokenav_menu_handler_gfx.c:430-439). */
export function FreeMenuHandlerSubstruct2(): void {
  let gfx = GetSubstructPtr(POKENAV_SUBSTRUCT_MENU_GFX);
  DestroyMovingDotsBgTask();
  RemoveWindow(gfx.optionDescWindowId);
  FreeAndDestroyMainMenuSprites();
  DestroyMenuOptionGlowTask();
  FreePokenavSubstruct(POKENAV_SUBSTRUCT_MENU_GFX);
}

/** 1:1 `static bool32 GetCurrentLoopedTaskActive(void)` (pokenav_menu_handler_gfx.c:441-446). */
function GetCurrentLoopedTaskActive(): boolean {
  let gfx = GetSubstructPtr(POKENAV_SUBSTRUCT_MENU_GFX);
  return IsLoopedTaskActive(gfx.loopedTaskId);
}

// ─── ADAPTATION MOTEUR : modèle sprite PLAT (pas de `sprite.oam` nested) — `.oam.tileNum` = tileBase/
//     sheetTileStart + tuile OAM, `.oam.paletteNum` = paletteBank via oamIndex (cf. battle_anim + note
//     mémoire « .oam.paletteNum n'existe pas → paletteBank via oamIndex »). ───
function _spriteOamTileNumSet(sprite: any, v: number): void {
  if (!sprite) return;
  const oam = getRuntime()?.gba?.oam?.[sprite.oamIndex ?? -1];
  if (oam) oam.tileId = v;
  sprite.tileBase = v;
  sprite.sheetTileStart = v;
}
function _spriteOamPaletteNumSet(sprite: any, n: number): void {
  if (!sprite) return;
  const oam = getRuntime()?.gba?.oam?.[sprite.oamIndex ?? -1];
  if (oam) oam.paletteBank = n;
}

// ─── ADAPTATION MOTEUR : chargement async des assets du menu (« mapping gfx→binaires », micro-tâche L1
//     §E.1). La ROM les a en INCBIN ; ici on fetch message/device/dots/options/blue_light depuis
//     public/decomp/em/pokenav/ puis on peuple les statics + reconstruit les 2 structures sprite/palette
//     (qui capturaient null/placeholder au module-load). Gate LT_PAUSE en case 0 (comme le bandeau). ───
// Ordre de concaténation des 13 gfx d'options = build décomp `graphics_file_rules.mk:338`
// (`options.4bpp: cat hoenn_map.4bpp condition.4bpp … cancel.4bpp`). Chaque PNG = 32×64 = 0x20 tiles
// → colle aux offsets `sOptionsLabelGfx_*` (0x000, 0x020, …). ⚠️ `options.bin` (72 o) est le TILEMAP
// `gPokenavOptions_Tilemap` (utilisé par le sous-écran Condition, pokenav_conditions_gfx.c:226), PAS le gfx.
const OPTION_GFX_FILES = ['hoenn_map', 'condition', 'match_call', 'ribbons', 'switch_off', 'party', 'search', 'cool', 'beauty', 'cute', 'smart', 'tough', 'cancel'];
/** Reconstruit gPokenavOptions_Gfx (416 tiles = 0x3400 o) = concat des 13 .4bpp individuels (le `@cat` du Makefile). */
async function _loadPokenavOptionsGfx(B: string): Promise<Uint8Array> {
  const parts = await Promise.all(OPTION_GFX_FILES.map((n) => loadTileBin(B + 'options/' + n + '.png', 4)));
  let total = 0;
  for (const p of parts) total += p.length;
  const out = new Uint8Array(total);
  let off = 0;
  for (const p of parts) { out.set(p, off); off += p.length; }
  return out;
}

let _pokenavMenuGfxLoaded = false;
function _pokenavLoadMenuGraphics(): void {
  if (_pokenavMenuGfxLoaded) return;
  const B = '/decomp/em/pokenav/';
  void (async () => {
    try {
      const [mGfx, mPal, mTm, dGfx, dPal, dTm, bGfx, bPal, bTm, oGfx, oPal, blGfx, blPal] = await Promise.all([
        loadTileBin(B + 'message.png', 4), extractPngPlte(B + 'message.png'), loadTilemapBin(B + 'message.bin'),
        loadTileBin(B + 'device_outline.png', 4), extractPngPlte(B + 'device_outline.png'), loadTilemapBin(B + 'device_outline_map.bin'),
        loadTileBin(B + 'bg_dots.png', 4), extractPngPlte(B + 'bg_dots.png'), loadTilemapBin(B + 'bg_dots.bin'),
        _loadPokenavOptionsGfx(B), loadGbaPal(B + 'options/options.pal'),
        loadTileBin(B + 'blue_light.png', 4), extractPngPlte(B + 'blue_light.png'),
      ]);
      gPokenavMessageBox_Gfx = mGfx; gPokenavMessageBox_Pal = mPal; gPokenavMessageBox_Tilemap = mTm;
      sPokenavDeviceBgTiles = dGfx; sPokenavDeviceBgPal = dPal; sPokenavDeviceBgTilemap = dTm;
      sPokenavBgDotsTiles = bGfx; sPokenavBgDotsPal = bPal; sPokenavBgDotsTilemap = bTm;
      gPokenavOptions_Gfx = oGfx; gPokenavOptions_Pal = oPal; sMatchCallBlueLightTiles = blGfx; sMatchCallBlueLightPal = blPal;
      // reconstruire les structures qui capturaient les assets au module-load :
      (sPokenavOptionsSpriteSheets[0] as any).data = oGfx;
      (sPokenavOptionsSpriteSheets[1] as any).data = blGfx;
      // [0..4] = les 5 sous-palettes d'options (gPokenavOptions_Pal[0x00..0x40]) ; [5] = BLUE_LIGHT ;
      // [6] = terminateur `[]` — NE PAS écraser sa `.data` (sinon Pokenav_AllocAndLoadPalettes ne s'arrête plus).
      for (let i = 0; i < 5; i++)
        (sPokenavOptionsSpritePalettes[i] as any).data = oPal.subarray(i * 0x10);
      (sPokenavOptionsSpritePalettes[5] as any).data = blPal;
    } catch (e) {
      console.error('[pokenav menu gfx load]', e);
    } finally {
      _pokenavMenuGfxLoaded = true;
    }
  })();
}

/** 1:1 `static u32 LoopedTask_OpenMenu(s32 state)` (pokenav_menu_handler_gfx.c:448-555). */
function LoopedTask_OpenMenu(state: number): number {
  let gfx = GetSubstructPtr(POKENAV_SUBSTRUCT_MENU_GFX);
  switch (state) {
    case 0:
      // ADAPTATION MOTEUR : attendre le chargement async des assets menu (la ROM les a inline).
      if (!_pokenavMenuGfxLoaded) { _pokenavLoadMenuGraphics(); return LT_PAUSE; }
      InitBgTemplates(sPokenavMainMenuBgTemplates, sPokenavMainMenuBgTemplates.length);
      DecompressAndCopyTileDataToVram(1, gPokenavMessageBox_Gfx, 0, 0, 0);
      SetBgTilemapBuffer(1, gfx.bg1TilemapBuffer);
      CopyToBgTilemapBuffer(1, gPokenavMessageBox_Tilemap, 0, 0);
      CopyBgTilemapBufferToVram(1);
      CopyPaletteIntoBufferUnfaded(gPokenavMessageBox_Pal, BG_PLTT_ID(1), PLTT_SIZE_4BPP);
      ChangeBgX(1, 0, BG_COORD_SET);
      ChangeBgY(1, 0, BG_COORD_SET);
      ChangeBgX(2, 0, BG_COORD_SET);
      ChangeBgY(2, 0, BG_COORD_SET);
      ChangeBgX(3, 0, BG_COORD_SET);
      ChangeBgY(3, 0, BG_COORD_SET);
      return LT_INC_AND_PAUSE;
    case 1:
      if (FreeTempTileDataBuffersIfPossible())
        return LT_PAUSE;
      DecompressAndCopyTileDataToVram(2, sPokenavDeviceBgTiles, 0, 0, 0);
      DecompressAndCopyTileDataToVram(2, sPokenavDeviceBgTilemap, 0, 0, 1);
      CopyPaletteIntoBufferUnfaded(sPokenavDeviceBgPal, BG_PLTT_ID(2), sPokenavDeviceBgPal.length * 2 /* sizeof = octets (u16 count * 2) */);
      return LT_INC_AND_PAUSE;
    case 2:
      if (FreeTempTileDataBuffersIfPossible())
        return LT_PAUSE;
      DecompressAndCopyTileDataToVram(3, sPokenavBgDotsTiles, 0, 0, 0);
      DecompressAndCopyTileDataToVram(3, sPokenavBgDotsTilemap, 0, 0, 1);
      CopyPaletteIntoBufferUnfaded(sPokenavBgDotsPal, BG_PLTT_ID(3), sPokenavBgDotsPal.length * 2 /* sizeof = octets (u16 count * 2) */);
      if (GetPokenavMenuType() == POKENAV_MENU_TYPE_CONDITION || GetPokenavMenuType() == POKENAV_MENU_TYPE_CONDITION_SEARCH)
        ChangeBgDotsColorToPurple();
      return LT_INC_AND_PAUSE;
    case 3:
      if (FreeTempTileDataBuffersIfPossible())
        return LT_PAUSE;
      AddOptionDescriptionWindow();
      CreateMovingBgDotsTask();
      return LT_INC_AND_CONTINUE;
    case 4:
      LoadPokenavOptionPalettes();
      return LT_INC_AND_CONTINUE;
    case 5:
      PrintCurrentOptionDescription();
      CreateMenuOptionSprites();
      CreateMatchCallBlueLightSprite();
      DrawCurrentMenuOptionLabels();
      return LT_INC_AND_PAUSE;
    case 6:
      if (IsDma3ManagerBusyWithBgCopy_())
        return LT_PAUSE;
      return LT_INC_AND_CONTINUE;
    case 7:
      ShowBg(1);
      ShowBg(2);
      ShowBg(3);
      if (gfx.pokenavAlreadyOpen)
      {
        PokenavFadeScreen(POKENAV_FADE_FROM_BLACK);
      }
      else
      {
        PlaySE(SE_POKENAV_ON);
        PokenavFadeScreen(POKENAV_FADE_FROM_BLACK_ALL);
      }
      switch (GetPokenavMenuType()) {
        case POKENAV_MENU_TYPE_CONDITION_SEARCH:
          LoadLeftHeaderGfxForIndex(7);
        // fallthrough
        case POKENAV_MENU_TYPE_CONDITION:
          LoadLeftHeaderGfxForIndex(1);
          break;
        default:
          LoadLeftHeaderGfxForIndex(0);
          break;
      }
      return LT_INC_AND_PAUSE;
    case 8:
      if (IsPaletteFadeActive())
        return LT_PAUSE;
      switch (GetPokenavMenuType()) {
        case POKENAV_MENU_TYPE_CONDITION_SEARCH:
          ShowLeftHeaderGfx(7, false, false);
        // fallthrough
        case POKENAV_MENU_TYPE_CONDITION:
          ShowLeftHeaderGfx(1, false, false);
          break;
        default:
          ShowLeftHeaderGfx(0, false, false);
          break;
      }
      StartOptionAnimations_Enter();
      SetupPokenavMenuScanlineEffects();
      return LT_INC_AND_CONTINUE;
    case 9:
      if (AreMenuOptionSpritesMoving())
        return LT_PAUSE;
      if (AreLeftHeaderSpritesMoving())
        return LT_PAUSE;
      break;
  }
  return LT_FINISH;
}

/** 1:1 `static u32 LoopedTask_MoveMenuCursor(s32 state)` (pokenav_menu_handler_gfx.c:557-575). */
function LoopedTask_MoveMenuCursor(state: number): number {
  switch (state) {
    case 0:
      SetMenuOptionGlow();
      StartOptionAnimations_CursorMoved();
      PrintCurrentOptionDescription();
      PlaySE(SE_SELECT);
      return LT_INC_AND_PAUSE;
    case 1:
      if (AreMenuOptionSpritesMoving())
        return LT_PAUSE;
      if (IsDma3ManagerBusyWithBgCopy_())
        return LT_PAUSE;
      break;
  }
  return LT_FINISH;
}

/** 1:1 `static u32 LoopedTask_OpenConditionMenu(s32 state)` (pokenav_menu_handler_gfx.c:577-614). */
function LoopedTask_OpenConditionMenu(state: number): number {
  switch (state) {
    case 0:
      ResetBldCnt();
      StartOptionAnimations_Exit();
      HideMainOrSubMenuLeftHeader(POKENAV_GFX_MAIN_MENU, false);
      PlaySE(SE_SELECT);
      return LT_INC_AND_PAUSE;
    case 1:
      if (AreMenuOptionSpritesMoving())
        return LT_PAUSE;
      if (AreLeftHeaderSpritesMoving())
        return LT_PAUSE;
      DrawCurrentMenuOptionLabels();
      LoadLeftHeaderGfxForIndex(1);
      return LT_INC_AND_PAUSE;
    case 2:
      StartOptionAnimations_Enter();
      ShowLeftHeaderGfx(1, false, false);
      CreateBgDotPurplePalTask();
      PrintCurrentOptionDescription();
      return LT_INC_AND_PAUSE;
    case 3:
      if (AreMenuOptionSpritesMoving())
        return LT_PAUSE;
      if (AreLeftHeaderSpritesMoving())
        return LT_PAUSE;
      if (IsTaskActive_UpdateBgDotsPalette())
        return LT_PAUSE;
      if (IsDma3ManagerBusyWithBgCopy_())
        return LT_PAUSE;
      InitMenuOptionGlow();
      break;
  }
  return LT_FINISH;
}

/** 1:1 `static u32 LoopedTask_ReturnToMainMenu(s32 state)` (pokenav_menu_handler_gfx.c:616-652). */
function LoopedTask_ReturnToMainMenu(state: number): number {
  switch (state) {
    case 0:
      ResetBldCnt();
      StartOptionAnimations_Exit();
      HideMainOrSubMenuLeftHeader(POKENAV_GFX_CONDITION_MENU, false);
      return LT_INC_AND_PAUSE;
    case 1:
      if (AreMenuOptionSpritesMoving())
        return LT_PAUSE;
      if (AreLeftHeaderSpritesMoving())
        return LT_PAUSE;
      DrawCurrentMenuOptionLabels();
      LoadLeftHeaderGfxForIndex(0);
      return LT_INC_AND_PAUSE;
    case 2:
      StartOptionAnimations_Enter();
      ShowLeftHeaderGfx(0, false, false);
      CreateBgDotLightBluePalTask();
      PrintCurrentOptionDescription();
      return LT_INC_AND_PAUSE;
    case 3:
      if (AreMenuOptionSpritesMoving())
        return LT_PAUSE;
      if (AreLeftHeaderSpritesMoving())
        return LT_PAUSE;
      if (IsTaskActive_UpdateBgDotsPalette())
        return LT_PAUSE;
      if (IsDma3ManagerBusyWithBgCopy_())
        return LT_PAUSE;
      InitMenuOptionGlow();
      break;
  }
  return LT_FINISH;
}

/** 1:1 `static u32 LoopedTask_OpenConditionSearchMenu(s32 state)` (pokenav_menu_handler_gfx.c:654-685). */
function LoopedTask_OpenConditionSearchMenu(state: number): number {
  switch (state) {
    case 0:
      ResetBldCnt();
      StartOptionAnimations_Exit();
      PlaySE(SE_SELECT);
      return LT_INC_AND_PAUSE;
    case 1:
      if (AreMenuOptionSpritesMoving())
        return LT_PAUSE;
      LoadLeftHeaderGfxForIndex(7);
      DrawCurrentMenuOptionLabels();
      return LT_INC_AND_PAUSE;
    case 2:
      StartOptionAnimations_Enter();
      ShowLeftHeaderGfx(7, false, false);
      PrintCurrentOptionDescription();
      return LT_INC_AND_PAUSE;
    case 3:
      if (AreMenuOptionSpritesMoving())
        return LT_PAUSE;
      if (AreLeftHeaderSpritesMoving())
        return LT_PAUSE;
      if (IsTaskActive_UpdateBgDotsPalette())
        return LT_PAUSE;
      InitMenuOptionGlow();
      break;
  }
  return LT_FINISH;
}

/** 1:1 `static u32 LoopedTask_ReturnToConditionMenu(s32 state)` (pokenav_menu_handler_gfx.c:687-716). */
function LoopedTask_ReturnToConditionMenu(state: number): number {
  switch (state) {
    case 0:
      ResetBldCnt();
      StartOptionAnimations_Exit();
      HideMainOrSubMenuLeftHeader(POKENAV_GFX_SEARCH_MENU, false);
      return LT_INC_AND_PAUSE;
    case 1:
      if (AreMenuOptionSpritesMoving())
        return LT_PAUSE;
      if (AreLeftHeaderSpritesMoving())
        return LT_PAUSE;
      DrawCurrentMenuOptionLabels();
      return LT_INC_AND_PAUSE;
    case 2:
      StartOptionAnimations_Enter();
      PrintCurrentOptionDescription();
      return LT_INC_AND_PAUSE;
    case 3:
      if (AreMenuOptionSpritesMoving())
        return LT_PAUSE;
      if (IsTaskActive_UpdateBgDotsPalette())
        return LT_PAUSE;
      InitMenuOptionGlow();
      break;
  }
  return LT_FINISH;
}

/** 1:1 `static u32 LoopedTask_SelectRibbonsNoWinners(s32 state)` (pokenav_menu_handler_gfx.c:718-732). */
function LoopedTask_SelectRibbonsNoWinners(state: number): number {
  switch (state) {
    case 0:
      PlaySE(SE_FAILURE);
      PrintNoRibbonWinners();
      return LT_INC_AND_PAUSE;
    case 1:
      if (IsDma3ManagerBusyWithBgCopy())
        return LT_PAUSE;
      break;
  }
  return LT_FINISH;
}

// For redisplaying the Ribbons description to replace the No Ribbon Winners message

/** 1:1 `static u32 LoopedTask_ReShowDescription(s32 state)` (pokenav_menu_handler_gfx.c:735-749). */
function LoopedTask_ReShowDescription(state: number): number {
  switch (state) {
    case 0:
      PlaySE(SE_SELECT);
      PrintCurrentOptionDescription();
      return LT_INC_AND_PAUSE;
    case 1:
      if (IsDma3ManagerBusyWithBgCopy())
        return LT_PAUSE;
      break;
  }
  return LT_FINISH;
}

// For selecting a feature option from a menu, e.g. the Map, Match Call, Beauty search, etc.

/** 1:1 `static u32 LoopedTask_OpenPokenavFeature(s32 state)` (pokenav_menu_handler_gfx.c:752-792). */
function LoopedTask_OpenPokenavFeature(state: number): number {
  switch (state) {
    case 0:
      PrintHelpBarText(GetHelpBarTextId());
      return LT_INC_AND_PAUSE;
    case 1:
      if (WaitForHelpBar())
        return LT_PAUSE;
      SlideMenuHeaderUp();
      ResetBldCnt();
      StartOptionAnimations_Exit();
      switch (GetPokenavMenuType()) {
        case POKENAV_MENU_TYPE_CONDITION_SEARCH:
          HideMainOrSubMenuLeftHeader(POKENAV_GFX_SEARCH_MENU, false);
        // fallthrough
        case POKENAV_MENU_TYPE_CONDITION:
          HideMainOrSubMenuLeftHeader(POKENAV_GFX_CONDITION_MENU, false);
          break;
        default:
          HideMainOrSubMenuLeftHeader(POKENAV_GFX_MAIN_MENU, false);
          break;
      }
      PlaySE(SE_SELECT);
      return LT_INC_AND_PAUSE;
    case 2:
      if (AreMenuOptionSpritesMoving())
        return LT_PAUSE;
      if (AreLeftHeaderSpritesMoving())
        return LT_PAUSE;
      PokenavFadeScreen(POKENAV_FADE_TO_BLACK);
      return LT_INC_AND_PAUSE;
    case 3:
      if (IsPaletteFadeActive())
        return LT_PAUSE;
      break;
  }
  return LT_FINISH;
}

/** 1:1 `static void LoadPokenavOptionPalettes(void)` (pokenav_menu_handler_gfx.c:794-801). */
function LoadPokenavOptionPalettes(): void {
  let i = 0;
  for (i = 0; i < sPokenavOptionsSpriteSheets.length; i++)
    LoadCompressedSpriteSheet(sPokenavOptionsSpriteSheets[i]);
  Pokenav_AllocAndLoadPalettes(sPokenavOptionsSpritePalettes);
}

/** 1:1 `static void FreeAndDestroyMainMenuSprites(void)` (pokenav_menu_handler_gfx.c:803-815). */
function FreeAndDestroyMainMenuSprites(): void {
  FreeSpriteTilesByTag(GFXTAG_OPTIONS);
  FreeSpriteTilesByTag(GFXTAG_BLUE_LIGHT);
  FreeSpritePaletteByTag(PALTAG_OPTIONS_DEFAULT);
  FreeSpritePaletteByTag(PALTAG_OPTIONS_BLUE);
  FreeSpritePaletteByTag(PALTAG_OPTIONS_PINK);
  FreeSpritePaletteByTag(PALTAG_OPTIONS_BEIGE);
  FreeSpritePaletteByTag(PALTAG_OPTIONS_RED);
  FreeSpritePaletteByTag(PALTAG_BLUE_LIGHT);
  DestroyMenuOptionSprites();
  DestroyRematchBlueLightSprite();
}

/** 1:1 `static void CreateMenuOptionSprites(void)` (pokenav_menu_handler_gfx.c:817-831). */
function CreateMenuOptionSprites(): void {
  let i = 0;
  let j = 0;
  let gfx = GetSubstructPtr(POKENAV_SUBSTRUCT_MENU_GFX);
  // Adaptation moteur : substruct alloué `{}` (AllocSubstruct, pas calloc) → init explicite du 2D
  // `struct Sprite *iconSprites[MAX_POKENAV_MENUITEMS][NUM_OPTION_SUBSPRITES]` (zéro-init 1:1 calloc).
  gfx.iconSprites = Array.from({ length: MAX_POKENAV_MENUITEMS }, () => new Array(NUM_OPTION_SUBSPRITES).fill(null));
  gfx.iconVisible = new Array(MAX_POKENAV_MENUITEMS).fill(0); // idem `u8 iconVisible[MAX_POKENAV_MENUITEMS]` (zéro-init calloc)
  for (i = 0; i < MAX_POKENAV_MENUITEMS; i++)
  {
    for (j = 0; j < NUM_OPTION_SUBSPRITES; j++)
    {
      let spriteId = CreateSprite(sMenuOptionSpriteTemplate, 0x8c, 20 * i + 40, 3);
      gfx.iconSprites[i][j] = gSprites[spriteId];
      gSprites[spriteId].x2 = 32 * j;
    }
  }
}

/** 1:1 `static void DestroyMenuOptionSprites(void)` (pokenav_menu_handler_gfx.c:833-846). */
function DestroyMenuOptionSprites(): void {
  let i = 0;
  let j = 0;
  let gfx = GetSubstructPtr(POKENAV_SUBSTRUCT_MENU_GFX);
  for (i = 0; i < MAX_POKENAV_MENUITEMS; i++)
  {
    for (j = 0; j < NUM_OPTION_SUBSPRITES; j++)
    {
      FreeSpriteOamMatrix(gfx.iconSprites[i][j]);
      DestroySprite(gfx.iconSprites[i][j]);
    }
  }
}

/** 1:1 `static void DrawCurrentMenuOptionLabels(void)` (pokenav_menu_handler_gfx.c:848-852). */
function DrawCurrentMenuOptionLabels(): void {
  let menuType = GetPokenavMenuType();
  DrawOptionLabelGfx(sPokenavMenuOptionLabelGfx[menuType].gfx, sPokenavMenuOptionLabelGfx[menuType].yStart, sPokenavMenuOptionLabelGfx[menuType].deltaY);
}

/** 1:1 `static void DrawOptionLabelGfx(const u16 *const *optionGfx, s32 yPos, s32 deltaY)` (pokenav_menu_handler_gfx.c:854-885). */
function DrawOptionLabelGfx(optionGfx: any, yPos: number, deltaY: number): void {
  let i = 0;
  let j = 0;
  let gfx = GetSubstructPtr(POKENAV_SUBSTRUCT_MENU_GFX);
  let baseTile = GetSpriteTileStartByTag(GFXTAG_OPTIONS);
  for (i = 0; i < MAX_POKENAV_MENUITEMS; i++)
  {
    // 1:1 `const u16 *const *optionGfx` : `optionGfx[i]` = i-ème paire [tileOffset, palOffset]
    // (le `optionGfx++` du décomp = passage à l'entrée suivante ; fix bugs transpileur ptr-of-ptr + deref).
    if (optionGfx[i] != null)
    {
      for (j = 0; j < NUM_OPTION_SUBSPRITES; j++)
      {
        const s = gfx.iconSprites[i][j];
        _spriteOamTileNumSet(s, optionGfx[i][0] + baseTile + 8 * j);
        _spriteOamPaletteNumSet(s, IndexOfSpritePaletteTag(optionGfx[i][1] + PALTAG_OPTIONS_START));
        s.invisible = true;
        s.y = yPos;
        s.x = OPTION_DEFAULT_X;
        s.x2 = 32 * j;
      }
      gfx.iconVisible[i] = 1;
    }
    else
    {
      for (j = 0; j < NUM_OPTION_SUBSPRITES; j++)
        gfx.iconSprites[i][j].invisible = true;
      gfx.iconVisible[i] = 0;
    }
    yPos += deltaY;
  }
}

/** 1:1 `static void StartOptionAnimations_Enter(void)` (pokenav_menu_handler_gfx.c:887-919). */
function StartOptionAnimations_Enter(): void {
  let i = 0;
  let gfx = GetSubstructPtr(POKENAV_SUBSTRUCT_MENU_GFX);
  let cursorPos = GetPokenavCursorPos();
  let iconCount = 0;
  let x = 0;
  for (i = 0; i < MAX_POKENAV_MENUITEMS; i++)
  {
    if (gfx.iconVisible[i])
    {
      if (iconCount++ == cursorPos)
      {
        x = OPTION_SELECTED_X;
        gfx.cursorPos = i;
      }
      else
      {
        // Not selected, set default position
        x = OPTION_DEFAULT_X;
      }
      // Slide new options in
      StartOptionSlide(gfx.iconSprites[i], OPTION_EXIT_X, x, 12);
      SetOptionInvisibility(gfx.iconSprites[i], false);
    }
    else
    {
      SetOptionInvisibility(gfx.iconSprites[i], true);
    }
  }
}

/** 1:1 `static void StartOptionAnimations_CursorMoved(void)` (pokenav_menu_handler_gfx.c:921-947). */
function StartOptionAnimations_CursorMoved(): void {
  let i = 0;
  let gfx = GetSubstructPtr(POKENAV_SUBSTRUCT_MENU_GFX);
  let prevPos = GetPokenavCursorPos();
  let newPos = 0;
  // Get the index of the next visible option
  for ((i = 0, newPos = 0); i < MAX_POKENAV_MENUITEMS; i++)
  {
    if (gfx.iconVisible[i])
    {
      if (newPos == prevPos)
      {
        newPos = i;
        break;
      }
      newPos++;
    }
  }
  // The selected option slides out a bit and the previously
  // selected option slides back to its original position.
  StartOptionSlide(gfx.iconSprites[gfx.cursorPos], OPTION_SELECTED_X, OPTION_DEFAULT_X, 4);
  StartOptionSlide(gfx.iconSprites[newPos], OPTION_DEFAULT_X, OPTION_SELECTED_X, 4);
  gfx.cursorPos = newPos;
}

/** 1:1 `static void StartOptionAnimations_Exit(void)` (pokenav_menu_handler_gfx.c:949-966). */
function StartOptionAnimations_Exit(): void {
  let i = 0;
  let gfx = GetSubstructPtr(POKENAV_SUBSTRUCT_MENU_GFX);
  for (i = 0; i < MAX_POKENAV_MENUITEMS; i++)
  {
    if (gfx.iconVisible[i])
    {
      // Unselected options slide out,
      // selected option zooms in
      if (gfx.cursorPos != i)
        StartOptionSlide(gfx.iconSprites[i], OPTION_DEFAULT_X, OPTION_EXIT_X, 8);
      else
        StartOptionZoom(gfx.iconSprites[i]);
    }
  }
}

/** 1:1 `static bool32 AreMenuOptionSpritesMoving(void)` (pokenav_menu_handler_gfx.c:968-983). */
function AreMenuOptionSpritesMoving(): boolean {
  let i = 0;
  let gfx = GetSubstructPtr(POKENAV_SUBSTRUCT_MENU_GFX);
  for (i = 0; i < MAX_POKENAV_MENUITEMS; i++)
  {
    if (gfx.iconSprites[i][0].callback != SpriteCallbackDummy)
      return true;
  }
  if (gfx.numIconsBlending != 0)
    return true;
  return false;
}

// #define sSlideTime data[0]  (alias — expansé aux usages)

// #define sSlideAccel data[1]  (alias — expansé aux usages)

// #define sSlideSpeed data[2]  (alias — expansé aux usages)

// #define sSlideEndX data[7]  (alias — expansé aux usages)

/** 1:1 `static void StartOptionSlide(struct Sprite **sprites, s32 startX, s32 endX, s32 time)` (pokenav_menu_handler_gfx.c:990-1004). */
function StartOptionSlide(sprites: any, startX: number, endX: number, time: number): void {
  // 1:1 fix transpileur (deref ptr-de-ptr + ptr-arith laissés en `void 0`). sprites = tableau de subsprites.
  // sSlideTime=data[0] · sSlideAccel=data[1] · sSlideSpeed=data[2] · sSlideEndX=data[7] (cf. SpriteCB_OptionSlide).
  for (let i = 0; i < NUM_OPTION_SUBSPRITES; i++) {
    const s = sprites && sprites[i];
    if (!s) continue;
    s.x = startX;
    s.data[0] = time;
    s.data[1] = Math.trunc(16 * (endX - startX) / time);
    s.data[2] = 16 * startX;
    s.data[7] = endX;
    s.callback = SpriteCB_OptionSlide;
  }
}

// #define sZoomDelay data[0]  (alias — expansé aux usages)

// #define sZoomSetAffine data[1]  (alias — expansé aux usages)

// #define sZoomSpeed data[2]  (alias — expansé aux usages)

// #define sZoomSubspriteId data[7]  (alias — expansé aux usages)

// #define tBlendDelay data[0]  (alias — expansé aux usages)

// #define tBlendState data[1]  (alias — expansé aux usages)

// #define tBlendTarget1 data[2]  (alias — expansé aux usages)

// #define tBlendTarget2 data[3]  (alias — expansé aux usages)

// #define tBlendCounter data[4]  (alias — expansé aux usages)

// When an option is selected it zooms in and blends away as part

// of the transition to the next screen.

/** 1:1 `static void StartOptionZoom(struct Sprite **sprites)` (pokenav_menu_handler_gfx.c:1019-1042). */
function StartOptionZoom(sprites: any): void {
  let i = 0;
  let gfx = GetSubstructPtr(POKENAV_SUBSTRUCT_MENU_GFX);
  let taskId = 0;
  for (i = 0; i < NUM_OPTION_SUBSPRITES; i++)
  {
    void 0 /* TRANSPILER-TODO ASSIGN: (*sprites)->oam.objMode = ST_OAM_OBJ_BLEND */;
    void 0 /* TRANSPILER-TODO ASSIGN: (*sprites)->oam.affineMode = ST_OAM_AFFINE_DOUBLE */;
    void 0 /* TRANSPILER-TODO ASSIGN: (*sprites)->callback = SpriteCB_OptionZoom */;
    void 0 /* TRANSPILER-TODO ASSIGN: (*sprites)->sZoomDelay = 8 */;
    void 0 /* TRANSPILER-TODO ASSIGN: (*sprites)->sZoomSetAffine = FALSE */;
    void 0 /* TRANSPILER-TODO ASSIGN: (*sprites)->sZoomSubspriteId = i */;
    InitSpriteAffineAnim(sprites[0]);
    StartSpriteAffineAnim(sprites[0], 0);
    sprites++ /* TRANSPILER-TODO ptr-arith */;
  }
  SetGpuReg(REG_OFFSET_BLDALPHA, BLDALPHA_BLEND(16, 0));
  taskId = CreateTask((t: { taskId: number }) => Task_OptionBlend(t.taskId), 3);
  gTasks[taskId].data[0] /* tBlendDelay */ = 8;
  gfx.numIconsBlending++;
}

/** 1:1 `static void SetOptionInvisibility(struct Sprite **sprites, bool32 invisible)` (pokenav_menu_handler_gfx.c:1044-1053). */
function SetOptionInvisibility(sprites: any, invisible: boolean): void {
  // 1:1 `(*sprites)->invisible = invisible; sprites++` — sprites = tableau de subsprites (struct Sprite**),
  // le transpileur avait laissé l'assign en `void 0` (no-op) + `sprites++` → les icônes restaient invisibles.
  for (let i = 0; i < NUM_OPTION_SUBSPRITES; i++)
    if (sprites && sprites[i]) sprites[i].invisible = invisible;
}

/** 1:1 `static void SpriteCB_OptionSlide(struct Sprite *sprite)` (pokenav_menu_handler_gfx.c:1055-1068). */
function SpriteCB_OptionSlide(sprite: DecompSprite): void {
  sprite.data[0] /* sSlideTime */--;
  if (sprite.data[0] /* sSlideTime */ != -1)
  {
    sprite.data[2] /* sSlideSpeed */ += sprite.data[1] /* sSlideAccel */;
    sprite.x = sprite.data[2] /* sSlideSpeed */ >> 4;
  }
  else
  {
    sprite.x = sprite.data[7] /* sSlideEndX */;
    sprite.callback = SpriteCallbackDummy;
  }
}

/** 1:1 `static void SpriteCB_OptionZoom(struct Sprite *sprite)` (pokenav_menu_handler_gfx.c:1075-1127). */
function SpriteCB_OptionZoom(sprite: DecompSprite): void {
  let temp = 0;
  let x = 0;
  if (sprite.data[0] /* sZoomDelay */ == 0)
  {
    if (!sprite.data[1] /* sZoomSetAffine */)
    {
      StartSpriteAffineAnim(sprite, 1);
      sprite.data[1] /* sZoomSetAffine */++;
      sprite.data[2] /* sZoomSpeed */ = 0x100;
      sprite.x += sprite.x2;
      sprite.x2 = 0;
    }
    else
    {
      sprite.data[2] /* sZoomSpeed */ += 16;
      temp = sprite.data[2] /* sZoomSpeed */;
      x = temp >> 3;
      x = Math.trunc((x - 32) / 2);
      // Each subsprite needs to zoom to a different degree/direction
      switch (sprite.data[7] /* sZoomSubspriteId */) {
        case 0:
          sprite.x2 = -x * 3;
          break;
        case 1:
          sprite.x2 = -x;
          break;
        case 2:
          sprite.x2 = x;
          break;
        case 3:
          sprite.x2 = x * 3;
          break;
      }
      if (sprite.affineAnimEnded)
      {
        sprite.invisible = true;
        FreeOamMatrix(sprite.oam.matrixNum);
        CalcCenterToCornerVec(sprite, sprite.oam.shape, sprite.oam.size, ST_OAM_AFFINE_OFF);
        sprite.oam.affineMode = ST_OAM_AFFINE_OFF;
        sprite.oam.objMode = ST_OAM_OBJ_NORMAL;
        sprite.callback = SpriteCallbackDummy;
      }
    }
  }
  else
  {
    sprite.data[0] /* sZoomDelay */--;
  }
}

/** 1:1 `static void Task_OptionBlend(u8 taskId)` (pokenav_menu_handler_gfx.c:1134-1177). */
function Task_OptionBlend(taskId: number): void {
  let data = gTasks[taskId].data;
  if (data[0] /* tBlendDelay */ == 0)
  {
    switch (data[1] /* tBlendState */) {
      case 0:
        data[2] /* tBlendTarget1 */ = 16;
        data[3] /* tBlendTarget2 */ = 0;
        SetGpuReg(REG_OFFSET_BLDCNT, BLDCNT_EFFECT_NONE | BLDCNT_TGT2_ALL);
        SetGpuReg(REG_OFFSET_BLDALPHA, BLDALPHA_BLEND(16, 0));
        data[1] /* tBlendState */++;
        break;
      case 1:
        if (data[4] /* tBlendCounter */ & 1)
        {
          data[2] /* tBlendTarget1 */ -= 3;
          if (data[2] /* tBlendTarget1 */ < 0)
            data[2] /* tBlendTarget1 */ = 0;
        }
        else
        {
          data[3] /* tBlendTarget2 */ += 3;
          if (data[3] /* tBlendTarget2 */ > 16)
            data[3] /* tBlendTarget2 */ = 16;
        }
        SetGpuReg(REG_OFFSET_BLDALPHA, BLDALPHA_BLEND(data[2] /* tBlendTarget1 */, data[3] /* tBlendTarget2 */));
        data[4] /* tBlendCounter */++;
        if (data[4] /* tBlendCounter */ == 12)
        {
          (GetSubstructPtr(POKENAV_SUBSTRUCT_MENU_GFX)).numIconsBlending--;
          SetGpuReg(REG_OFFSET_BLDALPHA, BLDALPHA_BLEND(0, 16));
          DestroyTask(taskId);
        }
        break;
    }
  }
  else
  {
    data[0] /* tBlendDelay */--;
  }
}

// Blue light that blinks if there are available rematches nearby

/** 1:1 `static void CreateMatchCallBlueLightSprite(void)` (pokenav_menu_handler_gfx.c:1186-1195). */
function CreateMatchCallBlueLightSprite(): void {
  let gfx = GetSubstructPtr(POKENAV_SUBSTRUCT_MENU_GFX);
  let spriteId = CreateSprite(sMatchCallBlueLightSpriteTemplate, 0x10, 0x60, 4);
  gfx.blueLightSprite = gSprites[spriteId];
  if (AreAnyTrainerRematchesNearby())
    gfx.blueLightSprite.callback = SpriteCB_BlinkingBlueLight;
  else
    gfx.blueLightSprite.invisible = true;
}

/** 1:1 `static void DestroyRematchBlueLightSprite(void)` (pokenav_menu_handler_gfx.c:1197-1201). */
function DestroyRematchBlueLightSprite(): void {
  let gfx = GetSubstructPtr(POKENAV_SUBSTRUCT_MENU_GFX);
  DestroySprite(gfx.blueLightSprite);
}

/** 1:1 `static void SpriteCB_BlinkingBlueLight(struct Sprite *sprite)` (pokenav_menu_handler_gfx.c:1203-1211). */
function SpriteCB_BlinkingBlueLight(sprite: DecompSprite): void {
  sprite.data[0]++;
  if (sprite.data[0] > 8)
  {
    sprite.data[0] = 0;
    sprite.invisible ^= 1;
  }
}

/** 1:1 `static void AddOptionDescriptionWindow(void)` (pokenav_menu_handler_gfx.c:1213-1221). */
function AddOptionDescriptionWindow(): void {
  let gfx = GetSubstructPtr(POKENAV_SUBSTRUCT_MENU_GFX);
  gfx.optionDescWindowId = AddWindow(sOptionDescWindowTemplate);
  PutWindowTilemap(gfx.optionDescWindowId);
  FillWindowPixelBuffer(gfx.optionDescWindowId, PIXEL_FILL(6));
  CopyWindowToVram(gfx.optionDescWindowId, COPYWIN_FULL);
}

/** 1:1 `static void PrintCurrentOptionDescription(void)` (pokenav_menu_handler_gfx.c:1223-1231). */
function PrintCurrentOptionDescription(): void {
  let gfx = GetSubstructPtr(POKENAV_SUBSTRUCT_MENU_GFX);
  let menuItem = GetCurrentMenuItemId();
  let desc = sPageDescriptions[menuItem];
  let width = GetStringWidth(FONT_NORMAL, desc, -1);
  FillWindowPixelBuffer(gfx.optionDescWindowId, PIXEL_FILL(6));
  AddTextPrinterParameterized3(gfx.optionDescWindowId, FONT_NORMAL, Math.trunc((192 - width) / 2), 1, sOptionDescTextColors, 0, desc);
}

// Printed when Ribbons is selected if no PC/party mons have ribbons

// Can occur by obtaining a mon with a ribbon and then releasing all ribbon winners

/** 1:1 `static void PrintNoRibbonWinners(void)` (pokenav_menu_handler_gfx.c:1235-1242). */
function PrintNoRibbonWinners(): void {
  let gfx = GetSubstructPtr(POKENAV_SUBSTRUCT_MENU_GFX);
  let s = getString('gText_NoRibbonWinners');
  let width = GetStringWidth(FONT_NORMAL, s, -1);
  FillWindowPixelBuffer(gfx.optionDescWindowId, PIXEL_FILL(6));
  AddTextPrinterParameterized3(gfx.optionDescWindowId, FONT_NORMAL, Math.trunc((192 - width) / 2), 1, sOptionDescTextColors2, 0, s);
}

/** 1:1 `static bool32 IsDma3ManagerBusyWithBgCopy_(void)` (pokenav_menu_handler_gfx.c:1244-1247). */
function IsDma3ManagerBusyWithBgCopy_(): boolean {
  return IsDma3ManagerBusyWithBgCopy();
}

/** 1:1 `static void CreateMovingBgDotsTask(void)` (pokenav_menu_handler_gfx.c:1249-1253). */
function CreateMovingBgDotsTask(): void {
  let gfx = GetSubstructPtr(POKENAV_SUBSTRUCT_MENU_GFX);
  gfx.bg3ScrollTaskId = CreateTask((t: { taskId: number }) => Task_MoveBgDots(t.taskId), 2);
}

/** 1:1 `static void DestroyMovingDotsBgTask(void)` (pokenav_menu_handler_gfx.c:1255-1259). */
function DestroyMovingDotsBgTask(): void {
  let gfx = GetSubstructPtr(POKENAV_SUBSTRUCT_MENU_GFX);
  DestroyTask(gfx.bg3ScrollTaskId);
}

/** 1:1 `static void Task_MoveBgDots(u8 taskId)` (pokenav_menu_handler_gfx.c:1261-1264). */
function Task_MoveBgDots(taskId: number): void {
  ChangeBgX(3, 0x80, BG_COORD_ADD);
}

/** 1:1 `static void CreateBgDotPurplePalTask(void)` (pokenav_menu_handler_gfx.c:1266-1271). */
function CreateBgDotPurplePalTask(): void {
  let taskId = CreateTask((t: { taskId: number }) => Task_UpdateBgDotsPalette(t.taskId), 3);
  SetWordTaskArg(taskId, 1, (sPokenavBgDotsPal + 1));
  SetWordTaskArg(taskId, 3, (sPokenavBgDotsPal + 7));
}

/** 1:1 `static void ChangeBgDotsColorToPurple(void)` (pokenav_menu_handler_gfx.c:1273-1276). */
function ChangeBgDotsColorToPurple(): void {
  CopyPaletteIntoBufferUnfaded(sPokenavBgDotsPal + 7, BG_PLTT_ID(3) + 1, PLTT_SIZEOF(2));
}

/** 1:1 `static void CreateBgDotLightBluePalTask(void)` (pokenav_menu_handler_gfx.c:1278-1283). */
function CreateBgDotLightBluePalTask(): void {
  let taskId = CreateTask((t: { taskId: number }) => Task_UpdateBgDotsPalette(t.taskId), 3);
  SetWordTaskArg(taskId, 1, (sPokenavBgDotsPal + 7));
  SetWordTaskArg(taskId, 3, (sPokenavBgDotsPal + 1));
}

/** 1:1 `static bool32 IsTaskActive_UpdateBgDotsPalette(void)` (pokenav_menu_handler_gfx.c:1285-1288). */
function IsTaskActive_UpdateBgDotsPalette(): boolean {
  return FuncIsActiveTask(Task_UpdateBgDotsPalette);
}

/** 1:1 `static void Task_UpdateBgDotsPalette(u8 taskId)` (pokenav_menu_handler_gfx.c:1290-1301). */
function Task_UpdateBgDotsPalette(taskId: number): void {
  const sp8 = new Uint16Array(2);
  let data = gTasks[taskId].data;
  let pal1 = GetWordTaskArg(taskId, 1);
  let pal2 = GetWordTaskArg(taskId, 3);
  PokenavCopyPalette(pal1, pal2, 2, 12, ++data[0], sp8);
  LoadPalette(sp8, BG_PLTT_ID(3) + 1, PLTT_SIZEOF(2));
  if (data[0] == 12)
    DestroyTask(taskId);
}

/** 1:1 `static void VBlankCB_PokenavMainMenu(void)` (pokenav_menu_handler_gfx.c:1303-1309). */
function VBlankCB_PokenavMainMenu(): void {
  TransferPlttBuffer();
  LoadOam();
  ProcessSpriteCopyRequests();
  ScanlineEffect_InitHBlankDmaTransfer();
}

/** 1:1 `static void SetupPokenavMenuScanlineEffects(void)` (pokenav_menu_handler_gfx.c:1311-1331). */
function SetupPokenavMenuScanlineEffects(): void {
  SetGpuReg(REG_OFFSET_BLDCNT, BLDCNT_TGT1_OBJ | BLDCNT_EFFECT_LIGHTEN);
  SetGpuReg(REG_OFFSET_BLDY, 0);
  SetGpuRegBits(REG_OFFSET_DISPCNT, DISPCNT_WIN0_ON);
  SetGpuRegBits(REG_OFFSET_WININ, WININ_WIN0_ALL);
  SetGpuRegBits(REG_OFFSET_WINOUT, WINOUT_WIN01_BG_ALL | WINOUT_WIN01_OBJ);
  SetGpuRegBits(REG_OFFSET_WIN0V, DISPLAY_HEIGHT);
  ScanlineEffect_Stop();
  SetMenuOptionGlow();
  ScanlineEffect_SetParams(sPokenavMainMenuScanlineEffectParams);
  SetVBlankCallback_(VBlankCB_PokenavMainMenu);
  CreateTask((t: { taskId: number }) => Task_CurrentMenuOptionGlow(t.taskId), 3);
}

/** 1:1 `static void DestroyMenuOptionGlowTask(void)` (pokenav_menu_handler_gfx.c:1333-1340). */
function DestroyMenuOptionGlowTask(): void {
  SetGpuReg(REG_OFFSET_BLDCNT, 0);
  ClearGpuRegBits(REG_OFFSET_DISPCNT, DISPCNT_WIN0_ON);
  ScanlineEffect_Stop();
  DestroyTask(FindTaskIdByFunc(Task_CurrentMenuOptionGlow));
  SetPokenavVBlankCallback();
}

/** 1:1 `static void ResetBldCnt(void)` (pokenav_menu_handler_gfx.c:1342-1345). */
function ResetBldCnt(): void {
  SetGpuReg(REG_OFFSET_BLDCNT, 0);
}

/** 1:1 `static void InitMenuOptionGlow(void)` (pokenav_menu_handler_gfx.c:1347-1351). */
function InitMenuOptionGlow(): void {
  SetMenuOptionGlow();
  SetGpuReg(REG_OFFSET_BLDCNT, BLDCNT_TGT1_OBJ | BLDCNT_EFFECT_LIGHTEN);
}

/** 1:1 `static void Task_CurrentMenuOptionGlow(u8 taskId)` (pokenav_menu_handler_gfx.c:1353-1364). */
function Task_CurrentMenuOptionGlow(taskId: number): void {
  let data = gTasks[taskId].data;
  data[0]++;
  if (data[0] > 0)
  {
    data[0] = 0;
    data[1] += 3;
    data[1] &= 0x7F;
    SetGpuReg(REG_OFFSET_BLDY, gSineTable[data[1]] >> 5);
  }
}

/** 1:1 `static void SetMenuOptionGlow(void)` (pokenav_menu_handler_gfx.c:1366-1375). */
function SetMenuOptionGlow(): void {
  let menuType = GetPokenavMenuType();
  let cursorPos = GetPokenavCursorPos();
  let r4 = sPokenavMenuOptionLabelGfx[menuType].deltaY * cursorPos + sPokenavMenuOptionLabelGfx[menuType].yStart - 8;
  CpuFill16(0, gScanlineEffectRegBuffers[0], DISPLAY_HEIGHT * 2);
  CpuFill16(0, gScanlineEffectRegBuffers[1], DISPLAY_HEIGHT * 2);
  CpuFill16(RGB(16, 23, 28), gScanlineEffectRegBuffers[0][r4] /* TRANSPILER-TODO &élément scalaire (out-param ?) */, 0x20);
  CpuFill16(RGB(16, 23, 28), gScanlineEffectRegBuffers[1][r4] /* TRANSPILER-TODO &élément scalaire (out-param ?) */, 0x20);
}

/** 1:1 `void ResetBldCnt_(void)` (pokenav_menu_handler_gfx.c:1377-1380). */
export function ResetBldCnt_(): void {
  ResetBldCnt();
}
