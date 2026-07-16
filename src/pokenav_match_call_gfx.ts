// @ts-nocheck — transpilé brut (types stricts au câblage fin ; wire-transpiled.cjs)
/**
 * pokenav_match_call_gfx.ts — miroir 1:1 de `D:/Projet 1/decomps/pokeemeraude/src/pokenav_match_call_gfx.c` (transpilé).
 *
 * Généré par scripts/transpile-c.cjs — revue humaine OBLIGATOIRE avant commit :
 * rapport des flags dans audit-reports/transpile/pokenav_match_call_gfx.md.
 * Politique préproc : build vanilla FR (NDEBUG/FRENCH définis, BUGFIX/UBFIX absents).
 */

import { FindTaskIdByFunc, LoadCompressedSpriteSheet, LoadPalette, SpriteCallbackDummy } from '../harness/runtime/decomp-globals';
import { ST_OAM_4BPP, ST_OAM_OBJ_NORMAL } from '../harness/runtime/decomp-helpers';
import { GAME_STAT_TRAINER_BATTLES } from '../include/constants/game_stat';
import { MAPSEC_NONE } from '../include/constants/region_map_sections';
import { SE_POKENAV_CALL, SE_POKENAV_HANG_UP, SE_SELECT } from '../include/constants/songs';
import { SPECIES_NONE } from '../include/constants/species';
import { A_BUTTON } from '../include/gba/io_reg';
import { ST_OAM_AFFINE_OFF } from '../include/sprite';
import { STR_CONV_MODE_LEFT_ALIGN } from '../include/string_util';
import { TASK_NONE } from '../include/task';
import { FONT_NARROW, FONT_NORMAL, TEXT_SKIP_DRAW } from '../include/text';
import { IsDma3ManagerBusyWithBgCopy } from './battle_bg';
import { JOY_HELD, PlaySE } from './battle_controllers';
import { PIXEL_FILL } from './window';
import { getString } from '../harness/runtime/decomp-strings';
import { GetGameStat } from './field_player_avatar';
import { GetStringCenterAlignXOffset, GetStringRightAlignXOffset } from './international_string_util';
import { GetPlayerTextSpeedDelay } from './menu';
import { BG_PLTT_ID, OBJ_PLTT_ID, gPaletteFade, gPlttBufferFaded, gPlttBufferUnfaded } from './palette';
import { GetMapName } from './region_map';
import { AllocSpritePalette, CreateSprite, DestroySprite, FreeSpritePaletteByTag, FreeSpriteTilesByTag, LoadSpriteSheet, PLTT_SIZE_4BPP, gDummySpriteAffineAnimTable, gDummySpriteAnimTable, gSprites } from './sprite';
import { ConvertIntToDecimalStringN, StringCopy } from './string_util';
import { CreateTask, DestroyTask, gTasks } from './task';
import { AddTextPrinterParameterized, IsTextPrinterActive, RunTextPrinters, encodeOwText, gTextFlags } from './text';
import { DrawTextBorderOuter, LoadUserWindowBorderGfx } from './text_window';
import { gSineTable } from './trig';
import { AddWindow, COPYWIN_FULL, COPYWIN_GFX, COPYWIN_MAP, ChangeBgX, ChangeBgY, CopyBgTilemapBufferToVram, CopyToBgTilemapBuffer, CopyWindowToVram, FillBgTilemapBufferRect_Palette0, FillWindowPixelBuffer, GetBgTilemapBuffer, GetWindowAttribute, PutWindowTilemap, RemoveWindow, ShowBg, WINDOW_BG } from './window';
import type { DecompSprite } from '../harness/runtime/decomp-runtime';
import type {  SpriteTemplate } from './sprite';
import type { WindowTemplate } from './window';

// ═══ wire-transpiled (auto) : imports résolus par l'index + sentinelles ═══
import type { OamData } from '../include/gba/types';
import { __wireTodo } from './engine/wire-todo';
import { CreateLoopedTask, IsLoopedTaskActive } from './pokenav_looped_task';
import { ensureGTrainersLoaded } from './engine/battle/battle-trainer-data-bridge';
import { AllocSubstruct, FreePokenavSubstruct, GetSubstructPtr } from './pokenav_resources';
import { AreLeftHeaderSpritesMoving, CopyPaletteIntoBufferUnfaded, DecompressAndCopyTileDataToVram, FadeToBlackExceptPrimary, FreeTempTileDataBuffersIfPossible, GetSpinningPokenavSprite, HideSpinningPokenavSprite, InitBgTemplates, IsPaletteFadeActive, LoadLeftHeaderGfxForIndex, MainMenuLoopedTaskIsBusy, PokenavCopyPalette, PokenavFadeScreen, Pokenav_AllocAndLoadPalettes, PrintHelpBarText, SetBgTilemapBuffer, SetLeftHeaderSpritesInvisibility, ShowLeftHeaderGfx, SlideMenuHeaderDown, WaitForHelpBar } from './pokenav_main_menu';
import { BufferMatchCallNameAndDesc, GetIndexDeltaOfNextCheckPageDown, GetIndexDeltaOfNextCheckPageUp, GetMatchCallList, GetMatchCallMapSec, GetMatchCallMessageText, GetMatchCallOptionCursorPos, GetMatchCallOptionId, GetMatchCallTrainerPic, GetNumberRegistered, IsMatchCallListInitFinished, ShouldDrawRematchPokeballIcon } from './pokenav_match_call_list';
import { CreatePokenavList, DestroyPokenavList, IsCreatePokenavListTaskActive, PokenavList_DrawCurrentItemIcon, PokenavList_EraseListForCheckPage, PokenavList_GetSelectedIndex, PokenavList_GetTopIndex, PokenavList_IsMoveWindowTaskActive, PokenavList_IsTaskActive, PokenavList_MoveCursorDown, PokenavList_MoveCursorUp, PokenavList_PageDown, PokenavList_PageUp, PokenavList_ReshowListFromCheckPage, PokenavList_ToggleVerticalArrows, PrintCheckPageInfo } from './pokenav_list';
import { LT_SET_STATE } from './pokenav_looped_task';
import { loadTileBin, extractPngPlte, loadTilemapBin, loadGbaPal } from '../harness/gba/png-loader';
import { BgDmaFill, LoadBgTiles } from '../harness/runtime/decomp-globals';
// ─── WIRE-TODO : symboles transpilés SANS foyer dans le repo (throw à l'appel) ───
const CheckForSpaceForDma3Request: any = __wireTodo('CheckForSpaceForDma3Request');
const CpuCopy32: any = __wireTodo('CpuCopy32');
const DecompressPicFromTable: any = __wireTodo('DecompressPicFromTable');
const DrawMatchCallTextBoxBorder: any = __wireTodo('DrawMatchCallTextBoxBorder');
const LZ77UnCompWram: any = __wireTodo('LZ77UnCompWram');
// Assets fenêtre message — 1:1 décomp match_call.c:1197-1198 (window.png .4bpp + .gbapal),
// chargés async (cf _loadMatchCallUiGfx). `LoadMatchCallWindowGfx` = 1:1 match_call.c:2102.
let sMatchCallWindow_Gfx: Uint8Array | null = null;
let sMatchCallWindow_Pal: Uint16Array | null = null;
function LoadMatchCallWindowGfx(windowId: number, destOffset: number, paletteId: number): void {
  const bg = GetWindowAttribute(windowId, WINDOW_BG);
  LoadBgTiles(bg, sMatchCallWindow_Gfx as any, 0x100, destOffset);
  LoadPalette(sMatchCallWindow_Pal as any, BG_PLTT_ID(paletteId), (sMatchCallWindow_Pal?.length ?? 0) * 2 /* sizeof(u16[]) */);
}
const RequestDma3Copy: any = __wireTodo('RequestDma3Copy');
// Assets UI match call — 1:1 décomp graphics.c:1613-1615 (graphics/pokenav/match_call/ui.png
// + ui.bin), chargés async depuis public/decomp/em/pokenav/match_call/ comme gPokenavHeader_*
// du menu principal (pokenav_main_menu.ts:_pokenavLoadHeaderGraphics). Gate = case 0 attend.
let gMatchCallUI_Gfx: Uint8Array | null = null;
let gMatchCallUI_Pal: Uint16Array | null = null;
let gMatchCallUI_Tilemap: Uint16Array | null = null;
let _matchCallUiLoaded = false;
function _loadMatchCallUiGfx(): void {
  if (_matchCallUiLoaded || gMatchCallUI_Gfx) return;
  void (async () => {
    try {
      const [gfx, pal, tilemap, callPal, listPal, pokeballPal, pokeballGfx, winGfx, winPal] = await Promise.all([
        loadTileBin('/decomp/em/pokenav/match_call/ui.png', 4),
        extractPngPlte('/decomp/em/pokenav/match_call/ui.png'),
        loadTilemapBin('/decomp/em/pokenav/match_call/ui.bin'),
        loadGbaPal('/decomp/em/pokenav/match_call/call_window.pal'),   // sCallWindow_Pal
        loadGbaPal('/decomp/em/pokenav/match_call/list_window.pal'),   // sListWindow_Pal
        loadGbaPal('/decomp/em/pokenav/match_call/pokeball.pal'),      // sPokeball_Pal
        loadTileBin('/decomp/em/pokenav/match_call/pokeball.png', 4),  // sPokeball_Gfx
        loadTileBin('/decomp/em/pokenav/match_call/window.png', 4),    // sMatchCallWindow_Gfx
        extractPngPlte('/decomp/em/pokenav/match_call/window.png'),    // sMatchCallWindow_Pal
      ]);
      gMatchCallUI_Gfx = gfx;
      gMatchCallUI_Pal = pal;
      gMatchCallUI_Tilemap = tilemap;
      sCallWindow_Pal = callPal;
      sListWindow_Pal = listPal;
      sPokeball_Pal = pokeballPal;
      sPokeball_Gfx = pokeballGfx;
      sMatchCallWindow_Gfx = winGfx;
      sMatchCallWindow_Pal = winPal;
    } catch (e) { console.error('[match call ui gfx load]', e); }
    finally { _matchCallUiLoaded = true; }
  })();
}
const gTrainerFrontPicPaletteTable: any = __wireTodo('gTrainerFrontPicPaletteTable');
const gTrainerFrontPicTable: any = __wireTodo('gTrainerFrontPicTable');

// ─── constantes décomp inlinées (headers pas encore dans include/) ───
const POKENAV_SUBSTRUCT_MATCH_CALL_OPEN = 6; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const BG_COORD_SET = 0; // 1:1 include/bg.h:0 (à consolider dans include/)
const LT_INC_AND_PAUSE = 0; // 1:1 include/pokenav.h:58 (à consolider dans include/)
const LT_PAUSE = 2; // 1:1 include/pokenav.h:60 (à consolider dans include/)
const POKENAV_GFX_MATCH_CALL_MENU = 3; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_FADE_FROM_BLACK = 1; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const LT_FINISH = 4; // 1:1 include/pokenav.h:62 (à consolider dans include/)
const HELPBAR_MC_CALL_MENU = 7; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const HELPBAR_MC_TRAINER_LIST = 6; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const LT_INC_AND_CONTINUE = 1; // 1:1 include/pokenav.h:59 (à consolider dans include/)
const HELPBAR_MC_CHECK_PAGE = 8; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_FADE_TO_BLACK = 0; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const MATCH_CALL_OPTION_COUNT = 3; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const OBJ_VRAM0 = 100728832; // 1:1 include/gba/defines.h:54 (à consolider dans include/)

const GFXTAG_CURSOR = 7; // 1:1 pokenav_match_call_gfx.c:28

const GFXTAG_TRAINER_PIC = 8; // 1:1 pokenav_match_call_gfx.c:29

const PALTAG_CURSOR = 12; // 1:1 pokenav_match_call_gfx.c:30

const PALTAG_TRAINER_PIC = 13; // 1:1 pokenav_match_call_gfx.c:31

/** 1:1 `struct Pokenav_MatchCallGfx` (pokenav_match_call_gfx.c:33). */
interface Pokenav_MatchCallGfx {
  isTaskActiveCB: ((...args: any[]) => any) | null;
  loopTaskId: number;
  filler8: Uint8Array;
  skipHangUpSE: boolean;
  newRematchRequest: boolean;
  locWindowId: number;
  infoBoxWindowId: number;
  msgBoxWindowId: number;
  pageDelta: number;
  unused18: number;
  unused19: number;
  trainerPicPalOffset: number;
  optionsCursorSprite: DecompSprite | null;
  trainerPicSprite: DecompSprite | null;
  bgTilemapBuffer1: Uint8Array;
  unusedTilemapBuffer: Uint8Array;
  bgTilemapBuffer2: Uint8Array;
  trainerPicGfxPtr: Uint8Array;
  trainerPicGfx: Uint8Array;
  trainerPicPal: Uint8Array;
}

// TRANSPILER-TODO INCGFX : sOptionsCursor_Pal ← graphics/pokenav/match_call/options_cursor.png (pipeline assets : loadTileBin/loadGbaPal('/decomp/em/…'))
let sOptionsCursor_Pal: any = null;

// TRANSPILER-TODO INCGFX : sOptionsCursor_Gfx ← graphics/pokenav/match_call/options_cursor.png (pipeline assets : loadTileBin/loadGbaPal('/decomp/em/…'))
let sOptionsCursor_Gfx: any = null;

// TRANSPILER-TODO INCGFX : sCallWindow_Pal ← graphics/pokenav/match_call/call_window.pal (pipeline assets : loadTileBin/loadGbaPal('/decomp/em/…'))
let sCallWindow_Pal: any = null;

// TRANSPILER-TODO INCGFX : sListWindow_Pal ← graphics/pokenav/match_call/list_window.pal (pipeline assets : loadTileBin/loadGbaPal('/decomp/em/…'))
let sListWindow_Pal: any = null;

// TRANSPILER-TODO INCGFX : sPokeball_Pal ← graphics/pokenav/match_call/pokeball.pal (pipeline assets : loadTileBin/loadGbaPal('/decomp/em/…'))
let sPokeball_Pal: any = null;

// TRANSPILER-TODO INCGFX : sPokeball_Gfx ← graphics/pokenav/match_call/pokeball.png (pipeline assets : loadTileBin/loadGbaPal('/decomp/em/…'))
let sPokeball_Gfx: any = null;

/** 1:1 (pokenav_match_call_gfx.c:125) */
const sMatchCallBgTemplates = [
  {
    bg: 1, /* :2 */
    charBaseIndex: 3, /* :2 */
    mapBaseIndex: 0x1F, /* :5 */
    screenSize: 0, /* :2 */
    paletteMode: 0, /* :1 */
    priority: 1, /* :2 */
    baseTile: 0, /* :10 */
  },
  {
    bg: 2, /* :2 */
    charBaseIndex: 2, /* :2 */
    mapBaseIndex: 0x06, /* :5 */
    screenSize: 0, /* :2 */
    paletteMode: 0, /* :1 */
    priority: 2, /* :2 */
    baseTile: 0x80, /* :10 */
  },
  {
    bg: 3, /* :2 */
    charBaseIndex: 1, /* :2 */
    mapBaseIndex: 0x07, /* :5 */
    screenSize: 0, /* :2 */
    paletteMode: 0, /* :1 */
    priority: 3, /* :2 */
    baseTile: 0, /* :10 */
  },
];

/** 1:1 (pokenav_match_call_gfx.c:156) */
const sMatchCallLoopTaskFuncs = [
  null, // [POKENAV_MC_FUNC_NONE]
  MatchCallListCursorDown, // [POKENAV_MC_FUNC_DOWN]
  MatchCallListCursorUp, // [POKENAV_MC_FUNC_UP]
  MatchCallListPageDown, // [POKENAV_MC_FUNC_PG_DOWN]
  MatchCallListPageUp, // [POKENAV_MC_FUNC_PG_UP]
  SelectMatchCallEntry, // [POKENAV_MC_FUNC_SELECT]
  MoveMatchCallOptionsCursor, // [POKENAV_MC_FUNC_MOVE_OPTIONS_CURSOR]
  CancelMatchCallSelection, // [POKENAV_MC_FUNC_CANCEL]
  DoMatchCallMessage, // [POKENAV_MC_FUNC_CALL_MSG]
  DoTrainerCloseByMessage, // [POKENAV_MC_FUNC_NEARBY_MSG]
  CloseMatchCallMessage, // [POKENAV_MC_FUNC_EXIT_CALL]
  ShowCheckPage, // [POKENAV_MC_FUNC_SHOW_CHECK_PAGE]
  ShowCheckPageUp, // [POKENAV_MC_FUNC_CHECK_PAGE_UP]
  ShowCheckPageDown, // [POKENAV_MC_FUNC_CHECK_PAGE_DOWN]
  ExitCheckPage, // [POKENAV_MC_FUNC_EXIT_CHECK_PAGE]
  ExitMatchCall, // [POKENAV_MC_FUNC_EXIT]
];

/** 1:1 (pokenav_match_call_gfx.c:176) */
const sMatchCallLocationWindowTemplate = {
  bg: 2,
  tilemapLeft: 0,
  tilemapTop: 5,
  width: 11,
  height: 2,
  paletteNum: 2,
  baseBlock: 16 };

/** 1:1 (pokenav_match_call_gfx.c:187) */
const sMatchCallInfoBoxWindowTemplate = {
  bg: 2,
  tilemapLeft: 0,
  tilemapTop: 9,
  width: 11,
  height: 8,
  paletteNum: 2,
  baseBlock: 38 };

/** 1:1 (pokenav_match_call_gfx.c:198) */
const sMatchCallOptionTexts = [
  getString('gText_Call'), // [MATCH_CALL_OPTION_CALL]
  getString('gText_Check'), // [MATCH_CALL_OPTION_CHECK]
  getString('gText_Cancel6'), // [MATCH_CALL_OPTION_CANCEL]
];

// The series of 5 dots that appear when someone is called with Match Call

/** 1:1 (pokenav_match_call_gfx.c:206) */
const sText_CallingDots = encodeOwText("·{PAUSE 4}·{PAUSE 4}·{PAUSE 4}·{PAUSE 4}·\p");

/** 1:1 (pokenav_match_call_gfx.c:208) */
const sCallMsgBoxWindowTemplate = {
  bg: 1,
  tilemapLeft: 1,
  tilemapTop: 12,
  width: 28,
  height: 4,
  paletteNum: 1,
  baseBlock: 10 };

/** 1:1 (pokenav_match_call_gfx.c:219) */
const sOptionsCursorSpriteSheets = [
  {
    data: sOptionsCursor_Gfx,
    size: 0x40,
    tag: GFXTAG_CURSOR },
];

/** 1:1 (pokenav_match_call_gfx.c:224) */
const sOptionsCursorSpritePalettes = [
  {
    data: sOptionsCursor_Pal,
    tag: PALTAG_CURSOR },
];

/** 1:1 (pokenav_match_call_gfx.c:229) */
const sOptionsCursorOamData = {
  y: 0, /* :8 */
  affineMode: ST_OAM_AFFINE_OFF, /* :2 */
  objMode: ST_OAM_OBJ_NORMAL, /* :2 */
  bpp: ST_OAM_4BPP, /* :1 */
  shape: 2, /* :2 */
  /* SPRITE_SHAPE(8x16) */
  x: 0, /* :9 */
  size: 0, /* :2 */
  /* SPRITE_SIZE(8x16) */
  tileNum: 0, /* :10 */
  priority: 1, /* :2 */
  paletteNum: 0, /* :4 */
};

/** 1:1 (pokenav_match_call_gfx.c:243) */
const sOptionsCursorSpriteTemplate = {
  tileTag: GFXTAG_CURSOR,
  paletteTag: PALTAG_CURSOR,
  oam: sOptionsCursorOamData,
  anims: gDummySpriteAnimTable,
  images: null,
  affineAnims: gDummySpriteAffineAnimTable,
  callback: SpriteCB_OptionsCursor };

/** 1:1 (pokenav_match_call_gfx.c:254) */
const sTrainerPicOamData = {
  y: 0, /* :8 */
  affineMode: ST_OAM_AFFINE_OFF, /* :2 */
  objMode: ST_OAM_OBJ_NORMAL, /* :2 */
  bpp: ST_OAM_4BPP, /* :1 */
  shape: 0, /* :2 */
  /* SPRITE_SHAPE(64x64) */
  x: 0, /* :9 */
  size: 3, /* :2 */
  /* SPRITE_SIZE(64x64) */
  tileNum: 0, /* :10 */
  priority: 1, /* :2 */
  paletteNum: 0, /* :4 */
};

/** 1:1 (pokenav_match_call_gfx.c:268) */
const sTrainerPicSpriteTemplate = {
  tileTag: GFXTAG_TRAINER_PIC,
  paletteTag: PALTAG_TRAINER_PIC,
  oam: sTrainerPicOamData,
  anims: gDummySpriteAnimTable,
  images: null,
  affineAnims: gDummySpriteAffineAnimTable,
  callback: SpriteCallbackDummy };

/** 1:1 `bool32 OpenMatchCall(void)` (pokenav_match_call_gfx.c:279-289). */
export function OpenMatchCall(): boolean {
  let gfx = AllocSubstruct(POKENAV_SUBSTRUCT_MATCH_CALL_OPEN, 0 /* TRANSPILER-TODO sizeof(struct Pokenav_MatchCallGfx) */);
  if (!gfx)
    return false;
  gfx.unused19 = 0;
  gfx.loopTaskId = CreateLoopedTask(LoopedTask_OpenMatchCall, 1);
  gfx.isTaskActiveCB = GetCurrentLoopedTaskActive;
  return true;
}

/** 1:1 `void CreateMatchCallLoopedTask(s32 index)` (pokenav_match_call_gfx.c:291-296). */
export function CreateMatchCallLoopedTask(index: number): void {
  let gfx = GetSubstructPtr(POKENAV_SUBSTRUCT_MATCH_CALL_OPEN);
  gfx.loopTaskId = CreateLoopedTask(sMatchCallLoopTaskFuncs[index], 1);
  gfx.isTaskActiveCB = GetCurrentLoopedTaskActive;
}

/** 1:1 `bool32 IsMatchCallLoopedTaskActive(void)` (pokenav_match_call_gfx.c:298-302). */
export function IsMatchCallLoopedTaskActive(): boolean {
  let gfx = GetSubstructPtr(POKENAV_SUBSTRUCT_MATCH_CALL_OPEN);
  return gfx.isTaskActiveCB();
}

/** 1:1 `void FreeMatchCallSubstruct2(void)` (pokenav_match_call_gfx.c:304-313). */
export function FreeMatchCallSubstruct2(): void {
  let gfx = GetSubstructPtr(POKENAV_SUBSTRUCT_MATCH_CALL_OPEN);
  FreeMatchCallSprites();
  DestroyMatchCallList();
  RemoveWindow(gfx.infoBoxWindowId);
  RemoveWindow(gfx.locWindowId);
  RemoveWindow(gfx.msgBoxWindowId);
  FreePokenavSubstruct(POKENAV_SUBSTRUCT_MATCH_CALL_OPEN);
}

/** 1:1 `static bool32 GetCurrentLoopedTaskActive(void)` (pokenav_match_call_gfx.c:315-319). */
function GetCurrentLoopedTaskActive(): boolean {
  let gfx = GetSubstructPtr(POKENAV_SUBSTRUCT_MATCH_CALL_OPEN);
  return IsLoopedTaskActive(gfx.loopTaskId);
}

/** 1:1 `static u32 LoopedTask_OpenMatchCall(s32 state)` (pokenav_match_call_gfx.c:321-393). */
function LoopedTask_OpenMatchCall(state: number): number {
  let gfx = GetSubstructPtr(POKENAV_SUBSTRUCT_MATCH_CALL_OPEN);
  switch (state) {
    case 0:
      // Gate async assets UI (adaptation moteur : le décomp a les assets en ROM = instantané ;
      // le port les fetch → on attend leur chargement avant de les copier en VRAM, comme le
      // menu principal gate sur _pokenavHeaderLoaded).
      _loadMatchCallUiGfx();
      // + gate data trainers (la liste imprime les dresseurs normaux via gTrainers ;
      // table JSON du bridge combat, fetch async — même pattern que les assets).
      ensureGTrainersLoaded().catch((e) => console.error('[match call gTrainers]', e));
      if (!gMatchCallUI_Gfx || !gMatchCallUI_Tilemap || !gMatchCallUI_Pal
          || !(globalThis as { __gTrainers?: unknown }).__gTrainers)
        return LT_PAUSE;
      InitBgTemplates(sMatchCallBgTemplates, sMatchCallBgTemplates.length);
      ChangeBgX(2, 0, BG_COORD_SET);
      ChangeBgY(2, 0, BG_COORD_SET);
      //!< Global variables in the French Version
      DecompressAndCopyTileDataToVram(2, gMatchCallUI_Gfx, 0, 0, 0);
      SetBgTilemapBuffer(2, gfx.bgTilemapBuffer2);
      CopyToBgTilemapBuffer(2, gMatchCallUI_Tilemap, 0, 0);
      CopyBgTilemapBufferToVram(2);
      CopyPaletteIntoBufferUnfaded(gMatchCallUI_Pal, BG_PLTT_ID(2), PLTT_SIZE_4BPP);
      CopyBgTilemapBufferToVram(2);
      return LT_INC_AND_PAUSE;
    case 1:
      if (FreeTempTileDataBuffersIfPossible())
        return LT_PAUSE;
      BgDmaFill(1, 0, 0, 1);
      SetBgTilemapBuffer(1, gfx.bgTilemapBuffer1);
      FillBgTilemapBufferRect_Palette0(1, 0x1000, 0, 0, 32, 20);
      CopyPaletteIntoBufferUnfaded(sCallWindow_Pal, BG_PLTT_ID(1), sCallWindow_Pal.length /* TRANSPILER-TODO sizeof */);
      CopyBgTilemapBufferToVram(1);
      return LT_INC_AND_PAUSE;
    case 2:
      if (FreeTempTileDataBuffersIfPossible())
        return LT_PAUSE;
      LoadCallWindowAndFade(gfx);
      DecompressAndCopyTileDataToVram(3, sPokeball_Gfx, 0, 0, 0);
      CopyPaletteIntoBufferUnfaded(sListWindow_Pal, BG_PLTT_ID(3), sListWindow_Pal.length /* TRANSPILER-TODO sizeof */);
      CopyPaletteIntoBufferUnfaded(sPokeball_Pal, BG_PLTT_ID(5), PLTT_SIZE_4BPP);
      return LT_INC_AND_PAUSE;
    case 3:
      if (FreeTempTileDataBuffersIfPossible() || !IsMatchCallListInitFinished())
        return LT_PAUSE;
      CreateMatchCallList();
      return LT_INC_AND_PAUSE;
    case 4:
      if (IsCreatePokenavListTaskActive())
        return LT_PAUSE;
      DrawMatchCallLeftColumnWindows(gfx);
      return LT_INC_AND_PAUSE;
    case 5:
      UpdateMatchCallInfoBox(gfx);
      PrintMatchCallLocation(gfx, 0);
      return LT_INC_AND_PAUSE;
    case 6:
      ChangeBgX(1, 0, BG_COORD_SET);
      ChangeBgY(1, 0, BG_COORD_SET);
      ShowBg(2);
      ShowBg(3);
      ShowBg(1);
      AllocMatchCallSprites();
      LoadLeftHeaderGfxForIndex(3);
      ShowLeftHeaderGfx(POKENAV_GFX_MATCH_CALL_MENU, true, false);
      PokenavFadeScreen(POKENAV_FADE_FROM_BLACK);
      return LT_INC_AND_PAUSE;
    case 7:
      if (IsPaletteFadeActive() || AreLeftHeaderSpritesMoving())
        return LT_PAUSE;
      SetPokeballIconsFlashing(true);
      return LT_FINISH;
    default:
      return LT_FINISH;
  }
}

/** 1:1 `static u32 MatchCallListCursorDown(s32 state)` (pokenav_match_call_gfx.c:395-430). */
function MatchCallListCursorDown(state: number): number {
  let gfx = GetSubstructPtr(POKENAV_SUBSTRUCT_MATCH_CALL_OPEN);
  switch (state) {
    case 0:
      switch (PokenavList_MoveCursorDown()) {
        case 0:
          break;
        case 1:
          PlaySE(SE_SELECT);
          return LT_SET_STATE(2);
        case 2:
          PlaySE(SE_SELECT);
        // fall through
        default:
          return LT_INC_AND_PAUSE;
      }
      break;
    case 1:
      if (PokenavList_IsMoveWindowTaskActive())
        return LT_PAUSE;
      PrintMatchCallLocation(gfx, 0);
      return LT_INC_AND_PAUSE;
    case 2:
      PrintMatchCallLocation(gfx, 0);
      return LT_INC_AND_PAUSE;
    case 3:
      if (IsDma3ManagerBusyWithBgCopy())
        return LT_PAUSE;
      break;
  }
  return LT_FINISH;
}

/** 1:1 `static u32 MatchCallListCursorUp(s32 state)` (pokenav_match_call_gfx.c:432-467). */
function MatchCallListCursorUp(state: number): number {
  let gfx = GetSubstructPtr(POKENAV_SUBSTRUCT_MATCH_CALL_OPEN);
  switch (state) {
    case 0:
      switch (PokenavList_MoveCursorUp()) {
        case 0:
          break;
        case 1:
          PlaySE(SE_SELECT);
          return LT_SET_STATE(2);
        case 2:
          PlaySE(SE_SELECT);
        // fall through
        default:
          return LT_INC_AND_PAUSE;
      }
      break;
    case 1:
      if (PokenavList_IsMoveWindowTaskActive())
        return LT_PAUSE;
      PrintMatchCallLocation(gfx, 0);
      return LT_INC_AND_PAUSE;
    case 2:
      PrintMatchCallLocation(gfx, 0);
      return LT_INC_AND_PAUSE;
    case 3:
      if (IsDma3ManagerBusyWithBgCopy())
        return LT_PAUSE;
      break;
  }
  return LT_FINISH;
}

/** 1:1 `static u32 MatchCallListPageDown(s32 state)` (pokenav_match_call_gfx.c:469-504). */
function MatchCallListPageDown(state: number): number {
  let gfx = GetSubstructPtr(POKENAV_SUBSTRUCT_MATCH_CALL_OPEN);
  switch (state) {
    case 0:
      switch (PokenavList_PageDown()) {
        case 0:
          break;
        case 1:
          PlaySE(SE_SELECT);
          return LT_SET_STATE(2);
        case 2:
          PlaySE(SE_SELECT);
        // fall through
        default:
          return LT_INC_AND_PAUSE;
      }
      break;
    case 1:
      if (PokenavList_IsMoveWindowTaskActive())
        return LT_PAUSE;
      PrintMatchCallLocation(gfx, 0);
      return LT_INC_AND_PAUSE;
    case 2:
      PrintMatchCallLocation(gfx, 0);
      return LT_INC_AND_PAUSE;
    case 3:
      if (IsDma3ManagerBusyWithBgCopy())
        return LT_PAUSE;
      break;
  }
  return LT_FINISH;
}

/** 1:1 `static u32 MatchCallListPageUp(s32 state)` (pokenav_match_call_gfx.c:506-541). */
function MatchCallListPageUp(state: number): number {
  let gfx = GetSubstructPtr(POKENAV_SUBSTRUCT_MATCH_CALL_OPEN);
  switch (state) {
    case 0:
      switch (PokenavList_PageUp()) {
        case 0:
          break;
        case 1:
          PlaySE(SE_SELECT);
          return LT_SET_STATE(2);
        case 2:
          PlaySE(SE_SELECT);
        // fall through
        default:
          return LT_INC_AND_PAUSE;
      }
      break;
    case 1:
      if (PokenavList_IsMoveWindowTaskActive())
        return LT_PAUSE;
      PrintMatchCallLocation(gfx, 0);
      return LT_INC_AND_PAUSE;
    case 2:
      PrintMatchCallLocation(gfx, 0);
      return LT_INC_AND_PAUSE;
    case 3:
      if (IsDma3ManagerBusyWithBgCopy())
        return LT_PAUSE;
      break;
  }
  return LT_FINISH;
}

/** 1:1 `static u32 SelectMatchCallEntry(s32 state)` (pokenav_match_call_gfx.c:543-560). */
function SelectMatchCallEntry(state: number): number {
  let gfx = GetSubstructPtr(POKENAV_SUBSTRUCT_MATCH_CALL_OPEN);
  switch (state) {
    case 0:
      PlaySE(SE_SELECT);
      PrintMatchCallSelectionOptions(gfx);
      PrintHelpBarText(HELPBAR_MC_CALL_MENU);
      return LT_INC_AND_PAUSE;
    case 1:
      if (ShowOptionsCursor(gfx))
        return LT_PAUSE;
      break;
  }
  return LT_FINISH;
}

/** 1:1 `static u32 MoveMatchCallOptionsCursor(s32 state)` (pokenav_match_call_gfx.c:562-572). */
function MoveMatchCallOptionsCursor(state: number): number {
  let gfx: any = null;
  let cursorPos = 0;
  PlaySE(SE_SELECT);
  gfx = GetSubstructPtr(POKENAV_SUBSTRUCT_MATCH_CALL_OPEN);
  cursorPos = GetMatchCallOptionCursorPos();
  UpdateCursorGfxPos(gfx, cursorPos);
  return LT_FINISH;
}

/** 1:1 `static u32 CancelMatchCallSelection(s32 state)` (pokenav_match_call_gfx.c:574-591). */
function CancelMatchCallSelection(state: number): number {
  let gfx = GetSubstructPtr(POKENAV_SUBSTRUCT_MATCH_CALL_OPEN);
  switch (state) {
    case 0:
      PlaySE(SE_SELECT);
      UpdateWindowsReturnToTrainerList(gfx);
      PrintHelpBarText(HELPBAR_MC_TRAINER_LIST);
      return LT_INC_AND_PAUSE;
    case 1:
      if (IsDma3ManagerBusyWithBgCopy1(gfx))
        return LT_PAUSE;
      break;
  }
  return LT_FINISH;
}

/** 1:1 `static u32 DoMatchCallMessage(s32 state)` (pokenav_match_call_gfx.c:593-623). */
function DoMatchCallMessage(state: number): number {
  let gfx = GetSubstructPtr(POKENAV_SUBSTRUCT_MATCH_CALL_OPEN);
  switch (state) {
    case 0:
      PokenavList_ToggleVerticalArrows(true);
      DrawMsgBoxForMatchCallMsg(gfx);
      return LT_INC_AND_PAUSE;
    case 1:
      if (IsDma3ManagerBusyWithBgCopy2(gfx))
        return LT_PAUSE;
      PrintCallingDots(gfx);
      PlaySE(SE_POKENAV_CALL);
      gfx.skipHangUpSE = false;
      return LT_INC_AND_PAUSE;
    case 2:
      if (WaitForCallingDotsText(gfx))
        return LT_PAUSE;
      PrintMatchCallMessage(gfx);
      return LT_INC_AND_PAUSE;
    case 3:
      if (WaitForMatchCallMessageText(gfx))
        return LT_PAUSE;
      break;
  }
  return LT_FINISH;
}

/** 1:1 `static u32 DoTrainerCloseByMessage(s32 state)` (pokenav_match_call_gfx.c:625-649). */
function DoTrainerCloseByMessage(state: number): number {
  let gfx = GetSubstructPtr(POKENAV_SUBSTRUCT_MATCH_CALL_OPEN);
  switch (state) {
    case 0:
      PlaySE(SE_SELECT);
      DrawMsgBoxForCloseByMsg(gfx);
      PokenavList_ToggleVerticalArrows(true);
      gfx.skipHangUpSE = true;
      return LT_INC_AND_PAUSE;
    case 1:
      if (IsDma3ManagerBusyWithBgCopy2(gfx))
        return LT_PAUSE;
      PrintTrainerIsCloseBy(gfx);
      return LT_INC_AND_PAUSE;
    case 2:
      if (WaitForTrainerIsCloseByText(gfx))
        return LT_PAUSE;
      break;
  }
  return LT_FINISH;
}

/** 1:1 `static u32 CloseMatchCallMessage(s32 state)` (pokenav_match_call_gfx.c:651-715). */
function CloseMatchCallMessage(state: number): number {
  let gfx = GetSubstructPtr(POKENAV_SUBSTRUCT_MATCH_CALL_OPEN);
  let result = LT_INC_AND_PAUSE;
  switch (state) {
    case 0:
      if (!gfx.skipHangUpSE)
        PlaySE(SE_POKENAV_HANG_UP);
      PlaySE(SE_SELECT);
      break;
    case 1:
      EraseCallMessageBox(gfx);
      break;
    case 2:
      if (WaitForCallMessageBoxErase(gfx))
        result = LT_PAUSE;
      break;
    case 3:
      UpdateWindowsReturnToTrainerList(gfx);
      break;
    case 4:
      if (IsDma3ManagerBusyWithBgCopy1(gfx))
        result = LT_PAUSE;
      PrintHelpBarText(HELPBAR_MC_TRAINER_LIST);
      break;
    case 5:
      if (WaitForHelpBar())
      {
        result = LT_PAUSE;
      }
      else
      {
        if (gfx.newRematchRequest)
        {
          // This call was a new rematch request,
          // add the Pokéball icon to their entry
          PokenavList_DrawCurrentItemIcon();
          result = LT_INC_AND_CONTINUE;
        }
        else
        {
          PokenavList_ToggleVerticalArrows(false);
          result = LT_FINISH;
        }
      }
      break;
    case 6:
      if (IsDma3ManagerBusyWithBgCopy())
      {
        result = LT_PAUSE;
      }
      else
      {
        PokenavList_ToggleVerticalArrows(false);
        result = LT_FINISH;
      }
      break;
  }
  return result;
}

/** 1:1 `static u32 ShowCheckPage(s32 state)` (pokenav_match_call_gfx.c:717-744). */
function ShowCheckPage(state: number): number {
  let gfx = GetSubstructPtr(POKENAV_SUBSTRUCT_MATCH_CALL_OPEN);
  switch (state) {
    case 0:
      PlaySE(SE_SELECT);
      PokenavList_EraseListForCheckPage();
      UpdateWindowsToShowCheckPage(gfx);
      return LT_INC_AND_PAUSE;
    case 1:
      if (PokenavList_IsTaskActive() || IsDma3ManagerBusyWithBgCopy1(gfx))
        return LT_PAUSE;
      PrintHelpBarText(HELPBAR_MC_CHECK_PAGE);
      return LT_INC_AND_PAUSE;
    case 2:
      PrintCheckPageInfo(0);
      LoadCheckPageTrainerPic(gfx);
      return LT_INC_AND_PAUSE;
    case 3:
      if (PokenavList_IsTaskActive() || WaitForTrainerPic(gfx) || WaitForHelpBar())
        return LT_PAUSE;
      break;
  }
  return LT_FINISH;
}

/** 1:1 `static u32 ShowCheckPageDown(s32 state)` (pokenav_match_call_gfx.c:746-783). */
function ShowCheckPageDown(state: number): number {
  let topId = 0;
  let delta = 0;
  let gfx = GetSubstructPtr(POKENAV_SUBSTRUCT_MATCH_CALL_OPEN);
  switch (state) {
    case 0:
      topId = PokenavList_GetTopIndex();
      delta = GetIndexDeltaOfNextCheckPageDown(topId);
      if (delta)
      {
        PlaySE(SE_SELECT);
        gfx.pageDelta = delta;
        TrainerPicSlideOffscreen(gfx);
        return LT_INC_AND_PAUSE;
      }
      break;
    case 1:
      if (WaitForTrainerPic(gfx))
        return LT_PAUSE;
      PrintMatchCallLocation(gfx, gfx.pageDelta);
      return LT_INC_AND_PAUSE;
    case 2:
      PrintCheckPageInfo(gfx.pageDelta);
      return LT_INC_AND_PAUSE;
    case 3:
      LoadCheckPageTrainerPic(gfx);
      return LT_INC_AND_PAUSE;
    case 4:
      if (PokenavList_IsTaskActive() || WaitForTrainerPic(gfx))
        return LT_PAUSE;
      break;
  }
  return LT_FINISH;
}

/** 1:1 `static u32 ExitCheckPage(s32 state)` (pokenav_match_call_gfx.c:785-809). */
function ExitCheckPage(state: number): number {
  let gfx = GetSubstructPtr(POKENAV_SUBSTRUCT_MATCH_CALL_OPEN);
  switch (state) {
    case 0:
      PlaySE(SE_SELECT);
      TrainerPicSlideOffscreen(gfx);
      PokenavList_ReshowListFromCheckPage();
      return LT_INC_AND_PAUSE;
    case 1:
      if (PokenavList_IsTaskActive() || WaitForTrainerPic(gfx))
        return LT_PAUSE;
      PrintHelpBarText(HELPBAR_MC_TRAINER_LIST);
      UpdateMatchCallInfoBox(gfx);
      return LT_INC_AND_PAUSE;
    case 2:
      if (IsDma3ManagerBusyWithBgCopy())
        return LT_PAUSE;
      break;
  }
  return LT_FINISH;
}

/** 1:1 `static u32 ShowCheckPageUp(s32 state)` (pokenav_match_call_gfx.c:811-848). */
function ShowCheckPageUp(state: number): number {
  let topId = 0;
  let delta = 0;
  let gfx = GetSubstructPtr(POKENAV_SUBSTRUCT_MATCH_CALL_OPEN);
  switch (state) {
    case 0:
      topId = PokenavList_GetTopIndex();
      delta = GetIndexDeltaOfNextCheckPageUp(topId);
      if (delta)
      {
        PlaySE(SE_SELECT);
        gfx.pageDelta = delta;
        TrainerPicSlideOffscreen(gfx);
        return LT_INC_AND_PAUSE;
      }
      break;
    case 1:
      if (WaitForTrainerPic(gfx))
        return LT_PAUSE;
      PrintMatchCallLocation(gfx, gfx.pageDelta);
      return LT_INC_AND_PAUSE;
    case 2:
      PrintCheckPageInfo(gfx.pageDelta);
      return LT_INC_AND_PAUSE;
    case 3:
      LoadCheckPageTrainerPic(gfx);
      return LT_INC_AND_PAUSE;
    case 4:
      if (PokenavList_IsTaskActive() || WaitForTrainerPic(gfx))
        return LT_PAUSE;
      break;
  }
  return LT_FINISH;
}

/** 1:1 `static u32 ExitMatchCall(s32 state)` (pokenav_match_call_gfx.c:850-869). */
function ExitMatchCall(state: number): number {
  switch (state) {
    case 0:
      PlaySE(SE_SELECT);
      SetPokeballIconsFlashing(false);
      PokenavFadeScreen(POKENAV_FADE_TO_BLACK);
      SlideMenuHeaderDown();
      return LT_INC_AND_PAUSE;
    case 1:
      if (IsPaletteFadeActive() || MainMenuLoopedTaskIsBusy())
        return LT_PAUSE;
      SetLeftHeaderSpritesInvisibility();
      break;
  }
  return LT_FINISH;
}

/** 1:1 `static void CreateMatchCallList(void)` (pokenav_match_call_gfx.c:871-888). */
function CreateMatchCallList(): void {
  const template: any = {}; // TRANSPILER-TODO struct locale struct PokenavListTemplate
  template.list = GetMatchCallList();
  template.count = GetNumberRegistered();
  template.itemSize = 0 /* TRANSPILER-TODO sizeof(struct PokenavListItem) */;
  template.startIndex = 0;
  template.item_X = 12;
  //!< French Difference
  template.windowWidth = 17;
  //!< ^
  template.listTop = 1;
  template.maxShowed = 8;
  template.fillValue = 3;
  template.fontId = FONT_NARROW;
  template.bufferItemFunc = BufferMatchCallNameAndDesc;
  template.iconDrawFunc = TryDrawRematchPokeballIcon;
  CreatePokenavList(sMatchCallBgTemplates[2], template, 2);
  CreateTask((t: { taskId: number }) => Task_FlashPokeballIcons(t.taskId), 7);
}

/** 1:1 `static void DestroyMatchCallList(void)` (pokenav_match_call_gfx.c:890-894). */
function DestroyMatchCallList(): void {
  DestroyPokenavList();
  DestroyTask(FindTaskIdByFunc(Task_FlashPokeballIcons));
}

// #define tSinIdx data[0]  (alias — expansé aux usages)

// #define tSinVal data[1]  (alias — expansé aux usages)

// #define tActive data[15]  (alias — expansé aux usages)

/** 1:1 `static void SetPokeballIconsFlashing(bool32 active)` (pokenav_match_call_gfx.c:900-905). */
function SetPokeballIconsFlashing(active: boolean): void {
  let taskId = FindTaskIdByFunc(Task_FlashPokeballIcons);
  if (taskId != TASK_NONE)
    gTasks[taskId].data[15] /* tActive */ = active;
}

/** 1:1 `static void Task_FlashPokeballIcons(u8 taskId)` (pokenav_match_call_gfx.c:907-919). */
function Task_FlashPokeballIcons(taskId: number): void {
  let data = gTasks[taskId].data;
  if (data[15] /* tActive */)
  {
    data[0] /* tSinIdx */ += 4;
    data[0] /* tSinIdx */ &= 0x7F;
    data[1] /* tSinVal */ = gSineTable[data[0] /* tSinIdx */] >> 4;
    PokenavCopyPalette(sPokeball_Pal, sPokeball_Pal[0x10] /* TRANSPILER-TODO &élément scalaire (out-param ?) */, 0x10, 0x10, data[1] /* tSinVal */, gPlttBufferUnfaded[BG_PLTT_ID(5)] /* TRANSPILER-TODO &élément scalaire (out-param ?) */);
    if (!gPaletteFade.active)
      CpuCopy32(gPlttBufferUnfaded[BG_PLTT_ID(5)] /* TRANSPILER-TODO &élément scalaire (out-param ?) */, gPlttBufferFaded[BG_PLTT_ID(5)] /* TRANSPILER-TODO &élément scalaire (out-param ?) */, PLTT_SIZE_4BPP);
  }
}

// enum pokenav_match_call_gfx.c:925
const POKEBALL_ICON_TOP = 20480;
const POKEBALL_ICON_BOTTOM = 20481;
const POKEBALL_ICON_EMPTY = 20482;

/** 1:1 `static void TryDrawRematchPokeballIcon(u16 windowId, u32 rematchId, u32 tileOffset)` (pokenav_match_call_gfx.c:931-946). */
function TryDrawRematchPokeballIcon(windowId: number, rematchId: number, tileOffset: number): void {
  let bg = GetWindowAttribute(windowId, WINDOW_BG);
  const tilemap = GetBgTilemapBuffer(bg);
  // 1:1 `tilemap += tileOffset * 64 + 0x1D;` — arithmétique de pointeur u16* C → offset d'indexation JS
  // (Uint16Array : `+= N` le stringifierait, cf. pièges pointer-walk).
  const p = tileOffset * 64 + 0x1D;
  if (ShouldDrawRematchPokeballIcon(rematchId))
  {
    tilemap[p + 0] = POKEBALL_ICON_TOP;
    tilemap[p + 0x20] = POKEBALL_ICON_BOTTOM;
  }
  else
  {
    tilemap[p + 0] = POKEBALL_ICON_EMPTY;
    tilemap[p + 0x20] = POKEBALL_ICON_EMPTY;
  }
}

/** 1:1 `void ClearRematchPokeballIcon(u16 windowId, u32 tileOffset)` (pokenav_match_call_gfx.c:948-955). */
export function ClearRematchPokeballIcon(windowId: number, tileOffset: number): void {
  let bg = GetWindowAttribute(windowId, WINDOW_BG);
  const tilemap = GetBgTilemapBuffer(bg);
  // 1:1 `tilemap += tileOffset * 64 + 0x1D;` — arithmétique de pointeur u16* C → offset d'indexation JS.
  const p = tileOffset * 64 + 0x1D;
  tilemap[p + 0] = POKEBALL_ICON_EMPTY;
  tilemap[p + 0x20] = POKEBALL_ICON_EMPTY;
}

/** 1:1 `static void DrawMatchCallLeftColumnWindows(struct Pokenav_MatchCallGfx *gfx)` (pokenav_match_call_gfx.c:957-966). */
function DrawMatchCallLeftColumnWindows(gfx: Pokenav_MatchCallGfx): void {
  gfx.locWindowId = AddWindow(sMatchCallLocationWindowTemplate);
  gfx.infoBoxWindowId = AddWindow(sMatchCallInfoBoxWindowTemplate);
  FillWindowPixelBuffer(gfx.locWindowId, PIXEL_FILL(1));
  PutWindowTilemap(gfx.locWindowId);
  FillWindowPixelBuffer(gfx.infoBoxWindowId, PIXEL_FILL(1));
  PutWindowTilemap(gfx.infoBoxWindowId);
  CopyWindowToVram(gfx.locWindowId, COPYWIN_MAP);
}

/** 1:1 `static void UpdateMatchCallInfoBox(struct Pokenav_MatchCallGfx *gfx)` (pokenav_match_call_gfx.c:968-976). */
function UpdateMatchCallInfoBox(gfx: Pokenav_MatchCallGfx): void {
  FillWindowPixelBuffer(gfx.infoBoxWindowId, PIXEL_FILL(1));
  PrintNumberRegisteredLabel(gfx.infoBoxWindowId);
  PrintNumberRegistered(gfx.infoBoxWindowId);
  PrintNumberOfBattlesLabel(gfx.infoBoxWindowId);
  PrintNumberOfBattles(gfx.infoBoxWindowId);
  CopyWindowToVram(gfx.infoBoxWindowId, COPYWIN_GFX);
}

/** 1:1 `static void PrintNumberRegisteredLabel(u16 windowId)` (pokenav_match_call_gfx.c:978-981). */
function PrintNumberRegisteredLabel(windowId: number): void {
  PrintMatchCallInfoLabel(windowId, getString('gText_NumberRegistered'), 0);
}

/** 1:1 `static void PrintNumberRegistered(u16 windowId)` (pokenav_match_call_gfx.c:983-988). */
function PrintNumberRegistered(windowId: number): void {
  const str = new Uint8Array(3);
  ConvertIntToDecimalStringN(str, GetNumberRegistered(), STR_CONV_MODE_LEFT_ALIGN, 3);
  PrintMatchCallInfoNumber(windowId, str, 1);
}

/** 1:1 `static void PrintNumberOfBattlesLabel(u16 windowId)` (pokenav_match_call_gfx.c:990-993). */
function PrintNumberOfBattlesLabel(windowId: number): void {
  PrintMatchCallInfoLabel(windowId, getString('gText_NumberOfBattles'), 2);
}

/** 1:1 `static void PrintNumberOfBattles(u16 windowId)` (pokenav_match_call_gfx.c:995-1004). */
function PrintNumberOfBattles(windowId: number): void {
  const str = new Uint8Array(5);
  let numTrainerBattles = GetGameStat(GAME_STAT_TRAINER_BATTLES);
  if (numTrainerBattles > 99999)
    numTrainerBattles = 99999;
  ConvertIntToDecimalStringN(str, numTrainerBattles, STR_CONV_MODE_LEFT_ALIGN, 5);
  PrintMatchCallInfoNumber(windowId, str, 3);
}

/** 1:1 `static void PrintMatchCallInfoLabel(u16 windowId, const u8 *str, int top)` (pokenav_match_call_gfx.c:1006-1010). */
function PrintMatchCallInfoLabel(windowId: number, str: Uint8Array, top: number): void {
  let y = top * 16 + 1;
  AddTextPrinterParameterized(windowId, FONT_NARROW, str, 2, y, TEXT_SKIP_DRAW, null);
}

/** 1:1 `static void PrintMatchCallInfoNumber(u16 windowId, const u8 *str, int top)` (pokenav_match_call_gfx.c:1012-1017). */
function PrintMatchCallInfoNumber(windowId: number, str: Uint8Array, top: number): void {
  let x = GetStringRightAlignXOffset(FONT_NARROW, str, 86);
  let y = top * 16 + 1;
  AddTextPrinterParameterized(windowId, FONT_NARROW, str, x, y, TEXT_SKIP_DRAW, null);
}

/** 1:1 `static void PrintMatchCallLocation(struct Pokenav_MatchCallGfx *gfx, int delta)` (pokenav_match_call_gfx.c:1019-1033). */
function PrintMatchCallLocation(gfx: Pokenav_MatchCallGfx, delta: number): void {
  const mapName = new Uint8Array(32);
  let x = 0;
  let index = PokenavList_GetSelectedIndex() + delta;
  let mapSec = GetMatchCallMapSec(index);
  if (mapSec != MAPSEC_NONE)
    GetMapName(mapName, mapSec, 0);
  else
    StringCopy(mapName, getString('gText_Unknown'));
  x = GetStringCenterAlignXOffset(FONT_NARROW, mapName, 88);
  FillWindowPixelBuffer(gfx.locWindowId, PIXEL_FILL(1));
  AddTextPrinterParameterized(gfx.locWindowId, FONT_NARROW, mapName, x, 1, 0, null);
}

/** 1:1 `static void PrintMatchCallSelectionOptions(struct Pokenav_MatchCallGfx *gfx)` (pokenav_match_call_gfx.c:1035-1050). */
function PrintMatchCallSelectionOptions(gfx: Pokenav_MatchCallGfx): void {
  let i = 0;
  FillWindowPixelBuffer(gfx.infoBoxWindowId, PIXEL_FILL(1));
  for (i = 0; i < MATCH_CALL_OPTION_COUNT; i++)
  {
    let optionText = GetMatchCallOptionId(i);
    if (optionText == MATCH_CALL_OPTION_COUNT)
      break;
    AddTextPrinterParameterized(gfx.infoBoxWindowId, FONT_NARROW, sMatchCallOptionTexts[optionText], 16, i * 16 + 1, TEXT_SKIP_DRAW, null);
  }
  CopyWindowToVram(gfx.infoBoxWindowId, COPYWIN_GFX);
}

/** 1:1 `static bool32 ShowOptionsCursor(struct Pokenav_MatchCallGfx *gfx)` (pokenav_match_call_gfx.c:1052-1061). */
function ShowOptionsCursor(gfx: Pokenav_MatchCallGfx): boolean {
  if (!IsDma3ManagerBusyWithBgCopy())
  {
    CreateOptionsCursorSprite(gfx, GetMatchCallOptionCursorPos());
    return false;
  }
  return true;
}

/** 1:1 `static void UpdateWindowsReturnToTrainerList(struct Pokenav_MatchCallGfx *gfx)` (pokenav_match_call_gfx.c:1063-1067). */
function UpdateWindowsReturnToTrainerList(gfx: Pokenav_MatchCallGfx): void {
  CloseMatchCallSelectOptionsWindow(gfx);
  UpdateMatchCallInfoBox(gfx);
}

/** 1:1 `static bool32 IsDma3ManagerBusyWithBgCopy1(struct Pokenav_MatchCallGfx *gfx)` (pokenav_match_call_gfx.c:1069-1072). */
function IsDma3ManagerBusyWithBgCopy1(gfx: Pokenav_MatchCallGfx): boolean {
  return IsDma3ManagerBusyWithBgCopy();
}

/** 1:1 `static void UpdateWindowsToShowCheckPage(struct Pokenav_MatchCallGfx *gfx)` (pokenav_match_call_gfx.c:1074-1079). */
function UpdateWindowsToShowCheckPage(gfx: Pokenav_MatchCallGfx): void {
  CloseMatchCallSelectOptionsWindow(gfx);
  FillWindowPixelBuffer(gfx.infoBoxWindowId, PIXEL_FILL(1));
  CopyWindowToVram(gfx.infoBoxWindowId, COPYWIN_GFX);
}

/** 1:1 `static void LoadCallWindowAndFade(struct Pokenav_MatchCallGfx *gfx)` (pokenav_match_call_gfx.c:1081-1086). */
function LoadCallWindowAndFade(gfx: Pokenav_MatchCallGfx): void {
  gfx.msgBoxWindowId = AddWindow(sCallMsgBoxWindowTemplate);
  LoadMatchCallWindowGfx(gfx.msgBoxWindowId, 1, 4);
  FadeToBlackExceptPrimary();
}

/** 1:1 `static void DrawMsgBoxForMatchCallMsg(struct Pokenav_MatchCallGfx *gfx)` (pokenav_match_call_gfx.c:1088-1100). */
function DrawMsgBoxForMatchCallMsg(gfx: Pokenav_MatchCallGfx): void {
  let sprite: any = null;
  LoadMatchCallWindowGfx(gfx.msgBoxWindowId, 1, 4);
  DrawMatchCallTextBoxBorder(gfx.msgBoxWindowId, 1, 4);
  FillWindowPixelBuffer(gfx.msgBoxWindowId, PIXEL_FILL(1));
  PutWindowTilemap(gfx.msgBoxWindowId);
  CopyWindowToVram(gfx.msgBoxWindowId, COPYWIN_FULL);
  sprite = GetSpinningPokenavSprite();
  sprite.x = 24;
  sprite.y = 112;
  sprite.y2 = 0;
}

/** 1:1 `static void DrawMsgBoxForCloseByMsg(struct Pokenav_MatchCallGfx *gfx)` (pokenav_match_call_gfx.c:1102-1109). */
function DrawMsgBoxForCloseByMsg(gfx: Pokenav_MatchCallGfx): void {
  LoadUserWindowBorderGfx(gfx.msgBoxWindowId, 1, BG_PLTT_ID(4));
  DrawTextBorderOuter(gfx.msgBoxWindowId, 1, 4);
  FillWindowPixelBuffer(gfx.msgBoxWindowId, PIXEL_FILL(1));
  PutWindowTilemap(gfx.msgBoxWindowId);
  CopyWindowToVram(gfx.msgBoxWindowId, COPYWIN_FULL);
}

/** 1:1 `static bool32 IsDma3ManagerBusyWithBgCopy2(struct Pokenav_MatchCallGfx *gfx)` (pokenav_match_call_gfx.c:1111-1114). */
function IsDma3ManagerBusyWithBgCopy2(gfx: Pokenav_MatchCallGfx): boolean {
  return IsDma3ManagerBusyWithBgCopy();
}

/** 1:1 `static void PrintCallingDots(struct Pokenav_MatchCallGfx *gfx)` (pokenav_match_call_gfx.c:1116-1119). */
function PrintCallingDots(gfx: Pokenav_MatchCallGfx): void {
  AddTextPrinterParameterized(gfx.msgBoxWindowId, FONT_NORMAL, sText_CallingDots, 32, 1, 1, null);
}

/** 1:1 `static bool32 WaitForCallingDotsText(struct Pokenav_MatchCallGfx *gfx)` (pokenav_match_call_gfx.c:1121-1125). */
function WaitForCallingDotsText(gfx: Pokenav_MatchCallGfx): boolean {
  RunTextPrinters();
  return IsTextPrinterActive(gfx.msgBoxWindowId);
}

/** 1:1 `static void PrintTrainerIsCloseBy(struct Pokenav_MatchCallGfx *gfx)` (pokenav_match_call_gfx.c:1127-1130). */
function PrintTrainerIsCloseBy(gfx: Pokenav_MatchCallGfx): void {
  AddTextPrinterParameterized(gfx.msgBoxWindowId, FONT_NORMAL, getString('gText_TrainerCloseBy'), 0, 1, 1, null);
}

/** 1:1 `static bool32 WaitForTrainerIsCloseByText(struct Pokenav_MatchCallGfx *gfx)` (pokenav_match_call_gfx.c:1132-1136). */
function WaitForTrainerIsCloseByText(gfx: Pokenav_MatchCallGfx): boolean {
  RunTextPrinters();
  return IsTextPrinterActive(gfx.msgBoxWindowId);
}

/** 1:1 `static void PrintMatchCallMessage(struct Pokenav_MatchCallGfx *gfx)` (pokenav_match_call_gfx.c:1138-1144). */
function PrintMatchCallMessage(gfx: Pokenav_MatchCallGfx): void {
  let index = PokenavList_GetSelectedIndex();
  let str = GetMatchCallMessageText(index, gfx.newRematchRequest);
  let speed = GetPlayerTextSpeedDelay();
  AddTextPrinterParameterized(gfx.msgBoxWindowId, FONT_NORMAL, str, 32, 1, speed, null);
}

/** 1:1 `static bool32 WaitForMatchCallMessageText(struct Pokenav_MatchCallGfx *gfx)` (pokenav_match_call_gfx.c:1146-1155). */
function WaitForMatchCallMessageText(gfx: Pokenav_MatchCallGfx): boolean {
  if (JOY_HELD(A_BUTTON))
    gTextFlags.canABSpeedUpPrint = true;
  else
    gTextFlags.canABSpeedUpPrint = false;
  RunTextPrinters();
  return IsTextPrinterActive(gfx.msgBoxWindowId);
}

/** 1:1 `static void EraseCallMessageBox(struct Pokenav_MatchCallGfx *gfx)` (pokenav_match_call_gfx.c:1157-1162). */
function EraseCallMessageBox(gfx: Pokenav_MatchCallGfx): void {
  HideSpinningPokenavSprite();
  FillBgTilemapBufferRect_Palette0(1, 0, 0, 0, 32, 20);
  CopyBgTilemapBufferToVram(1);
}

/** 1:1 `static bool32 WaitForCallMessageBoxErase(struct Pokenav_MatchCallGfx *gfx)` (pokenav_match_call_gfx.c:1164-1167). */
function WaitForCallMessageBoxErase(gfx: Pokenav_MatchCallGfx): boolean {
  return IsDma3ManagerBusyWithBgCopy();
}

/** 1:1 `static void AllocMatchCallSprites(void)` (pokenav_match_call_gfx.c:1169-1191). */
function AllocMatchCallSprites(): void {
  let i = 0;
  let paletteNum = 0;
  const spriteSheet = { data: null as any, size: 0, tag: 0 };
  let gfx = GetSubstructPtr(POKENAV_SUBSTRUCT_MATCH_CALL_OPEN);
  // Load options cursor gfx
  for (i = 0; i < sOptionsCursorSpriteSheets.length; i++)
    LoadCompressedSpriteSheet(sOptionsCursorSpriteSheets[i]);
  Pokenav_AllocAndLoadPalettes(sOptionsCursorSpritePalettes);
  gfx.optionsCursorSprite = null;
  // Load trainer pic gfx
  spriteSheet.data = gfx.trainerPicGfx;
  spriteSheet.size = 0 /* TRANSPILER-TODO sizeof(gfx->trainerPicGfx) */;
  spriteSheet.tag = GFXTAG_TRAINER_PIC;
  gfx.trainerPicGfxPtr = OBJ_VRAM0 + LoadSpriteSheet(spriteSheet) * 0x20;
  paletteNum = AllocSpritePalette(PALTAG_TRAINER_PIC);
  gfx.trainerPicPalOffset = OBJ_PLTT_ID(paletteNum);
  gfx.trainerPicSprite = CreateTrainerPicSprite();
  gfx.trainerPicSprite.invisible = true;
}

/** 1:1 `static void FreeMatchCallSprites(void)` (pokenav_match_call_gfx.c:1193-1205). */
function FreeMatchCallSprites(): void {
  let gfx = GetSubstructPtr(POKENAV_SUBSTRUCT_MATCH_CALL_OPEN);
  if (gfx.optionsCursorSprite)
    DestroySprite(gfx.optionsCursorSprite);
  if (gfx.trainerPicSprite)
    DestroySprite(gfx.trainerPicSprite);
  FreeSpriteTilesByTag(GFXTAG_TRAINER_PIC);
  FreeSpriteTilesByTag(GFXTAG_CURSOR);
  FreeSpritePaletteByTag(PALTAG_CURSOR);
  FreeSpritePaletteByTag(PALTAG_TRAINER_PIC);
}

/** 1:1 `static void CreateOptionsCursorSprite(struct Pokenav_MatchCallGfx *gfx, int top)` (pokenav_match_call_gfx.c:1207-1215). */
function CreateOptionsCursorSprite(gfx: Pokenav_MatchCallGfx, top: number): void {
  if (!gfx.optionsCursorSprite)
  {
    let spriteId = CreateSprite(sOptionsCursorSpriteTemplate, 4, 80, 5);
    gfx.optionsCursorSprite = gSprites[spriteId];
    UpdateCursorGfxPos(gfx, top);
  }
}

/** 1:1 `static void CloseMatchCallSelectOptionsWindow(struct Pokenav_MatchCallGfx *gfx)` (pokenav_match_call_gfx.c:1217-1221). */
function CloseMatchCallSelectOptionsWindow(gfx: Pokenav_MatchCallGfx): void {
  DestroySprite(gfx.optionsCursorSprite);
  gfx.optionsCursorSprite = null;
}

/** 1:1 `static void UpdateCursorGfxPos(struct Pokenav_MatchCallGfx *gfx, int top)` (pokenav_match_call_gfx.c:1223-1226). */
function UpdateCursorGfxPos(gfx: Pokenav_MatchCallGfx, top: number): void {
  gfx.optionsCursorSprite.y2 = top * 16;
}

/** 1:1 `static void SpriteCB_OptionsCursor(struct Sprite *sprite)` (pokenav_match_call_gfx.c:1228-1235). */
function SpriteCB_OptionsCursor(sprite: DecompSprite): void {
  if (++sprite.data[0] > 3)
  {
    sprite.data[0] = 0;
    sprite.x2 = (sprite.x2 + 1) & 7;
  }
}

/** 1:1 `static struct Sprite *CreateTrainerPicSprite(void)` (pokenav_match_call_gfx.c:1237-1241). */
function CreateTrainerPicSprite(): DecompSprite | null {
  let spriteId = CreateSprite(sTrainerPicSpriteTemplate, 44, 104, 6);
  return gSprites[spriteId];
}

/** 1:1 `static void LoadCheckPageTrainerPic(struct Pokenav_MatchCallGfx *gfx)` (pokenav_match_call_gfx.c:1243-1257). */
function LoadCheckPageTrainerPic(gfx: Pokenav_MatchCallGfx): void {
  let cursor = 0;
  let trainerPic = GetMatchCallTrainerPic(PokenavList_GetSelectedIndex());
  if (trainerPic >= 0)
  {
    DecompressPicFromTable(gTrainerFrontPicTable[trainerPic] /* TRANSPILER-TODO &élément scalaire (out-param ?) */, gfx.trainerPicGfx, SPECIES_NONE);
    LZ77UnCompWram(gTrainerFrontPicPaletteTable[trainerPic].data, gfx.trainerPicPal);
    cursor = RequestDma3Copy(gfx.trainerPicGfx, gfx.trainerPicGfxPtr, 0 /* TRANSPILER-TODO sizeof(gfx->trainerPicGfx) */, 1);
    LoadPalette(gfx.trainerPicPal, gfx.trainerPicPalOffset, 0 /* TRANSPILER-TODO sizeof(gfx->trainerPicPal) */);
    gfx.trainerPicSprite.data[0] = 0;
    gfx.trainerPicSprite.data[7] = cursor;
    gfx.trainerPicSprite.callback = SpriteCB_TrainerPicSlideOnscreen;
  }
}

/** 1:1 `static void TrainerPicSlideOffscreen(struct Pokenav_MatchCallGfx *gfx)` (pokenav_match_call_gfx.c:1259-1262). */
function TrainerPicSlideOffscreen(gfx: Pokenav_MatchCallGfx): void {
  gfx.trainerPicSprite.callback = SpriteCB_TrainerPicSlideOffscreen;
}

/** 1:1 `static bool32 WaitForTrainerPic(struct Pokenav_MatchCallGfx *gfx)` (pokenav_match_call_gfx.c:1264-1267). */
function WaitForTrainerPic(gfx: Pokenav_MatchCallGfx): boolean {
  return gfx.trainerPicSprite.callback != SpriteCallbackDummy;
}

/** 1:1 `static void SpriteCB_TrainerPicSlideOnscreen(struct Sprite *sprite)` (pokenav_match_call_gfx.c:1269-1290). */
function SpriteCB_TrainerPicSlideOnscreen(sprite: DecompSprite): void {
  switch (sprite.data[0]) {
    case 0:
      if (CheckForSpaceForDma3Request(sprite.data[7]) != -1)
      {
        sprite.x2 = -80;
        sprite.invisible = false;
        sprite.data[0]++;
      }
      break;
    case 1:
      sprite.x2 += 8;
      if (sprite.x2 >= 0)
      {
        sprite.x2 = 0;
        sprite.callback = SpriteCallbackDummy;
      }
      break;
  }
}

/** 1:1 `static void SpriteCB_TrainerPicSlideOffscreen(struct Sprite *sprite)` (pokenav_match_call_gfx.c:1292-1300). */
function SpriteCB_TrainerPicSlideOffscreen(sprite: DecompSprite): void {
  sprite.x2 -= 8;
  if (sprite.x2 <= -80)
  {
    sprite.invisible = true;
    sprite.callback = SpriteCallbackDummy;
  }
}
