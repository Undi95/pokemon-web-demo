// @ts-nocheck — transpilé brut (types stricts au câblage fin ; wire-transpiled.cjs)
/**
 * pokenav_region_map.ts — miroir 1:1 de `D:/Projet 1/decomps/pokeemeraude/src/pokenav_region_map.c` (transpilé).
 *
 * Généré par scripts/transpile-c.cjs — revue humaine OBLIGATOIRE avant commit :
 * rapport des flags dans audit-reports/transpile/pokenav_region_map.md.
 * Politique préproc : build vanilla FR (NDEBUG/FRENCH définis, BUGFIX/UBFIX absents).
 */

import { CpuFill16, FuncIsActiveTask, LoadCompressedSpriteSheet, TransferPlttBuffer } from '../harness/runtime/decomp-globals';
import { RGB_BLACK, ST_OAM_4BPP, ST_OAM_OBJ_NORMAL } from '../harness/runtime/decomp-helpers';
import { CHAR_SPACE } from '../include/constants/characters';
import { SE_SELECT } from '../include/constants/songs';
import { B_BUTTON } from '../include/gba/io_reg';
import { ST_OAM_AFFINE_OFF } from '../include/sprite';
import { FONT_NARROW, TEXT_SKIP_DRAW } from '../include/text';
import { IsDma3ManagerBusyWithBgCopy } from './battle_bg';
import { JOY_NEW, PlaySE } from './battle_controllers';
import { PIXEL_FILL } from './engine/battle/battle-windows';
import { MAPSECTYPE_BATTLE_FRONTIER, MAPSECTYPE_CITY_CANFLY, MAPSECTYPE_CITY_CANTFLY, MAPSECTYPE_NONE, MAPSECTYPE_ROUTE } from './engine/field/region-map-data';
import { gSaveBlock2Ptr } from './engine/save/save-block-state';
import { gMapHeader } from './fieldmap';
import { GetLandmarkName } from './landmark';
import { BG_PLTT_ID } from './palette';
import { CreateSprite, DestroySprite, FreeSpritePaletteByTag, FreeSpriteTilesByTag, LoadOam, PLTT_SIZE_4BPP, ProcessSpriteCopyRequests, gDummySpriteAffineAnimTable, gDummySpriteAnimTable, gSprites } from './sprite';
import { StringCopyPadded, gStringVar1 } from './string_util';
import { CreateTask, DestroyTask, gTasks } from './task';
import { AddTextPrinterParameterized } from './text';
import { DrawTextBorderOuter, LoadUserWindowBorderGfx_ } from './text_window';
import { AddWindow, COPYWIN_FULL, ChangeBgX, ChangeBgY, CopyBgTilemapBufferToVram, CopyWindowToVram, FillBgTilemapBufferRect, FillBgTilemapBufferRect_Palette0, FillWindowPixelBuffer, HideBg, PutWindowTilemap, RemoveWindow, ShowBg } from './window';
import type { DecompSprite } from '../harness/runtime/decomp-runtime';
import type {  SpriteTemplate } from './sprite';
import type { WindowTemplate } from './window';

// ═══ wire-transpiled (auto) : imports résolus par l'index + sentinelles ═══
import type { OamData } from '../include/gba/types';
import { __wireTodo } from './engine/wire-todo';
// ─── WIRE-TODO : symboles transpilés SANS foyer dans le repo (throw à l'appel) ───
const AllocSubstruct: any = __wireTodo('AllocSubstruct');
const AreLeftHeaderSpritesMoving: any = __wireTodo('AreLeftHeaderSpritesMoving');
const BgDmaFill: any = __wireTodo('BgDmaFill');
const BlendRegionMap: any = __wireTodo('BlendRegionMap');
const CopyPaletteIntoBufferUnfaded: any = __wireTodo('CopyPaletteIntoBufferUnfaded');
const CopyToBgTilemapBufferRect: any = __wireTodo('CopyToBgTilemapBufferRect');
const CreateLoopedTask: any = __wireTodo('CreateLoopedTask');
const CreateRegionMapCursor: any = __wireTodo('CreateRegionMapCursor');
const CreateRegionMapPlayerIcon: any = __wireTodo('CreateRegionMapPlayerIcon');
const DecompressAndCopyTileDataToVram: any = __wireTodo('DecompressAndCopyTileDataToVram');
const DoRegionMapInputCallback: any = __wireTodo('DoRegionMapInputCallback');
const FadeToBlackExceptPrimary: any = __wireTodo('FadeToBlackExceptPrimary');
const FreePokenavSubstruct: any = __wireTodo('FreePokenavSubstruct');
const FreeRegionMapIconResources: any = __wireTodo('FreeRegionMapIconResources');
const FreeTempTileDataBuffersIfPossible: any = __wireTodo('FreeTempTileDataBuffersIfPossible');
const FuncIsActiveLoopedTask: any = __wireTodo('FuncIsActiveLoopedTask');
const GetBgY: any = __wireTodo('GetBgY');
const GetSubstructPtr: any = __wireTodo('GetSubstructPtr');
const InitBgTemplates: any = __wireTodo('InitBgTemplates');
const InitRegionMapData: any = __wireTodo('InitRegionMapData');
const IsEventIslandMapSecId: any = __wireTodo('IsEventIslandMapSecId');
const IsLoopedTaskActive: any = __wireTodo('IsLoopedTaskActive');
const IsPaletteFadeActive: any = __wireTodo('IsPaletteFadeActive');
const IsRegionMapZoomed: any = __wireTodo('IsRegionMapZoomed');
const LZ77UnCompWram: any = __wireTodo('LZ77UnCompWram');
const LoadLeftHeaderGfxForIndex: any = __wireTodo('LoadLeftHeaderGfxForIndex');
const LoadRegionMapGfx: any = __wireTodo('LoadRegionMapGfx');
const MainMenuLoopedTaskIsBusy: any = __wireTodo('MainMenuLoopedTaskIsBusy');
const PokenavFadeScreen: any = __wireTodo('PokenavFadeScreen');
const Pokenav_AllocAndLoadPalettes: any = __wireTodo('Pokenav_AllocAndLoadPalettes');
const PrintHelpBarText: any = __wireTodo('PrintHelpBarText');
const PutWindowRectTilemap: any = __wireTodo('PutWindowRectTilemap');
const SetBgMode: any = __wireTodo('SetBgMode');
const SetBgTilemapBuffer: any = __wireTodo('SetBgTilemapBuffer');
const SetLeftHeaderSpritesInvisibility: any = __wireTodo('SetLeftHeaderSpritesInvisibility');
const SetPokenavVBlankCallback: any = __wireTodo('SetPokenavVBlankCallback');
const SetRegionMapDataForZoom: any = __wireTodo('SetRegionMapDataForZoom');
const SetVBlankCallback_: any = __wireTodo('SetVBlankCallback_');
const ShowLeftHeaderGfx: any = __wireTodo('ShowLeftHeaderGfx');
const SlideMenuHeaderDown: any = __wireTodo('SlideMenuHeaderDown');
const TrySetPlayerIconBlink: any = __wireTodo('TrySetPlayerIconBlink');
const UpdateRegionMapRightHeaderTiles: any = __wireTodo('UpdateRegionMapRightHeaderTiles');
const UpdateRegionMapVideoRegs: any = __wireTodo('UpdateRegionMapVideoRegs');
const UpdateRegionMapZoom: any = __wireTodo('UpdateRegionMapZoom');
const WaitForHelpBar: any = __wireTodo('WaitForHelpBar');
const gRegionMapCityZoomText_Gfx: any = __wireTodo('gRegionMapCityZoomText_Gfx');
const gRegionMapCityZoomTiles_Pal: any = __wireTodo('gRegionMapCityZoomTiles_Pal');
const sPokenavCityMaps: any = __wireTodo('sPokenavCityMaps');

// ─── constantes décomp inlinées (headers pas encore dans include/) ───
const POKENAV_SUBSTRUCT_REGION_MAP_STATE = 3; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_SUBSTRUCT_REGION_MAP = 16; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const MAP_INPUT_MOVE_END = 3; // 1:1 include/region_map.h:0 (à consolider dans include/)
const POKENAV_MAP_FUNC_CURSOR_MOVED = 1; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const MAP_INPUT_A_BUTTON = 4; // 1:1 include/region_map.h:0 (à consolider dans include/)
const POKENAV_MAP_FUNC_ZOOM_IN = 3; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_MAP_FUNC_ZOOM_OUT = 2; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const MAP_INPUT_B_BUTTON = 5; // 1:1 include/region_map.h:0 (à consolider dans include/)
const POKENAV_MAP_FUNC_EXIT = 4; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_MAP_FUNC_NONE = 0; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_MAIN_MENU_CURSOR_ON_MAP = 100001; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_SUBSTRUCT_REGION_MAP_ZOOM = 4; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const LT_INC_AND_PAUSE = 0; // 1:1 include/pokenav.h:58 (à consolider dans include/)
const LT_PAUSE = 2; // 1:1 include/pokenav.h:60 (à consolider dans include/)
const LT_INC_AND_CONTINUE = 1; // 1:1 include/pokenav.h:59 (à consolider dans include/)
const POKENAV_GFX_MAP_MENU_ZOOMED_OUT = 4; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_GFX_MAP_MENU_ZOOMED_IN = 5; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_FADE_FROM_BLACK = 1; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const LT_FINISH = 4; // 1:1 include/pokenav.h:62 (à consolider dans include/)
const HELPBAR_MAP_ZOOMED_OUT = 1; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const HELPBAR_MAP_ZOOMED_IN = 2; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_FADE_TO_BLACK = 0; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const BG_COORD_SET = 0; // 1:1 include/bg.h:0 (à consolider dans include/)
const BG_COORD_ADD = 1; // 1:1 include/bg.h:0 (à consolider dans include/)
const BG_COORD_SUB = 2; // 1:1 include/bg.h:0 (à consolider dans include/)

const GFXTAG_CITY_ZOOM = 6; // 1:1 pokenav_region_map.c:20

const PALTAG_CITY_ZOOM = 11; // 1:1 pokenav_region_map.c:21

const NUM_CITY_MAPS = 22; // 1:1 pokenav_region_map.c:23

/** 1:1 `struct Pokenav_RegionMapMenu` (pokenav_region_map.c:25). */
interface Pokenav_RegionMapMenu {
  unused: Uint8Array;
  zoomDisabled: boolean;
  callback: ((...args: any[]) => any) | null;
}

/** 1:1 `struct Pokenav_RegionMapGfx` (pokenav_region_map.c:32). */
interface Pokenav_RegionMapGfx {
  isTaskActiveCB: ((...args: any[]) => any) | null;
  loopTaskId: number;
  infoWindowId: number;
  cityZoomTextSprites: DecompSprite | null;
  tilemapBuffer: Uint8Array;
  cityZoomPics: Uint8Array;
}

/** 1:1 `struct CityMapEntry` (pokenav_region_map.c:42). */
interface CityMapEntry {
  mapSecId: number;
  index: number;
  tilemap: Uint32Array;
}

// TRANSPILER-TODO INCGFX : sMapSecInfoWindow_Pal ← graphics/pokenav/region_map/info_window.pal (pipeline assets : loadTileBin/loadGbaPal('/decomp/em/…'))
let sMapSecInfoWindow_Pal: any = null;

// TRANSPILER-TODO INCGFX : sRegionMapCityZoomTiles_Gfx ← graphics/pokenav/region_map/zoom_tiles.png (pipeline assets : loadTileBin/loadGbaPal('/decomp/em/…'))
let sRegionMapCityZoomTiles_Gfx: any = null;

/** 1:1 (pokenav_region_map.c:85) */
const sRegionMapBgTemplates = [
  {
    bg: 1, /* :2 */
    charBaseIndex: 1, /* :2 */
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
    baseTile: 0, /* :10 */
  },
  {
    bg: 2, /* :2 */
    charBaseIndex: 0, /* :2 */
    mapBaseIndex: 0x00, /* :5 */
    screenSize: 2, /* :2 */
    paletteMode: 0, /* :1 */
    priority: 3, /* :2 */
    baseTile: 0, /* :10 */
  },
];

/** 1:1 (pokenav_region_map.c:116) */
const sRegionMapLoopTaskFuncs = [
  null, // [POKENAV_MAP_FUNC_NONE]
  LoopedTask_UpdateInfoAfterCursorMove, // [POKENAV_MAP_FUNC_CURSOR_MOVED]
  LoopedTask_RegionMapZoomOut, // [POKENAV_MAP_FUNC_ZOOM_OUT]
  LoopedTask_RegionMapZoomIn, // [POKENAV_MAP_FUNC_ZOOM_IN]
  LoopedTask_ExitRegionMap, // [POKENAV_MAP_FUNC_EXIT]
];

/** 1:1 (pokenav_region_map.c:125) */
const sCityZoomTextSpriteSheet = [
  {
    data: gRegionMapCityZoomText_Gfx,
    size: 0x800,
    tag: GFXTAG_CITY_ZOOM },
];

/** 1:1 (pokenav_region_map.c:130) */
const sCityZoomTilesSpritePalette = [
  {
    data: gRegionMapCityZoomTiles_Pal,
    tag: PALTAG_CITY_ZOOM },
  [

  ],
];

/** 1:1 (pokenav_region_map.c:136) */
const sMapSecInfoWindowTemplate = {
  bg: 1,
  tilemapLeft: 17,
  tilemapTop: 4,
  width: 13,
  //!< French Difference
  height: 13,
  paletteNum: 1,
  baseBlock: 0x4C };

/** 1:1 (pokenav_region_map.c:149) */
const sCityZoomTextSprite_OamData = {
  y: 0, /* :8 */
  affineMode: ST_OAM_AFFINE_OFF, /* :2 */
  objMode: ST_OAM_OBJ_NORMAL, /* :2 */
  bpp: ST_OAM_4BPP, /* :1 */
  shape: 1, /* :2 */
  /* SPRITE_SHAPE(32x8) */
  x: 0, /* :9 */
  size: 1, /* :2 */
  /* SPRITE_SIZE(32x8) */
  tileNum: 0, /* :10 */
  priority: 1, /* :2 */
  paletteNum: 0, /* :4 */
};

/** 1:1 (pokenav_region_map.c:163) */
const sCityZoomTextSpriteTemplate = {
  tileTag: GFXTAG_CITY_ZOOM,
  paletteTag: PALTAG_CITY_ZOOM,
  oam: sCityZoomTextSprite_OamData,
  anims: gDummySpriteAnimTable,
  images: null,
  affineAnims: gDummySpriteAffineAnimTable,
  callback: SpriteCB_CityZoomText };

/** 1:1 `u32 PokenavCallback_Init_RegionMap(void)` (pokenav_region_map.c:174-190). */
export function PokenavCallback_Init_RegionMap(): number {
  let state = AllocSubstruct(POKENAV_SUBSTRUCT_REGION_MAP_STATE, 0 /* TRANSPILER-TODO sizeof(struct Pokenav_RegionMapMenu) */);
  if (!state)
    return false;
  if (!AllocSubstruct(POKENAV_SUBSTRUCT_REGION_MAP, 0 /* TRANSPILER-TODO sizeof(struct RegionMap) */))
    return false;
  state.zoomDisabled = IsEventIslandMapSecId(gMapHeader.regionMapSectionId);
  if (!state.zoomDisabled)
    state.callback = HandleRegionMapInput;
  else
    state.callback = HandleRegionMapInputZoomDisabled;
  return true;
}

/** 1:1 `void FreeRegionMapSubstruct1(void)` (pokenav_region_map.c:192-197). */
export function FreeRegionMapSubstruct1(): void {
  gSaveBlock2Ptr.regionMapZoom = IsRegionMapZoomed();
  FreePokenavSubstruct(POKENAV_SUBSTRUCT_REGION_MAP);
  FreePokenavSubstruct(POKENAV_SUBSTRUCT_REGION_MAP_STATE);
}

/** 1:1 `u32 GetRegionMapCallback(void)` (pokenav_region_map.c:199-203). */
export function GetRegionMapCallback(): number {
  let state = GetSubstructPtr(POKENAV_SUBSTRUCT_REGION_MAP_STATE);
  return state.callback(state);
}

/** 1:1 `static u32 HandleRegionMapInput(struct Pokenav_RegionMapMenu *state)` (pokenav_region_map.c:205-221). */
function HandleRegionMapInput(state: Pokenav_RegionMapMenu): number {
  switch (DoRegionMapInputCallback()) {
    case MAP_INPUT_MOVE_END:
      return POKENAV_MAP_FUNC_CURSOR_MOVED;
    case MAP_INPUT_A_BUTTON:
      if (!IsRegionMapZoomed())
        return POKENAV_MAP_FUNC_ZOOM_IN;
      return POKENAV_MAP_FUNC_ZOOM_OUT;
    case MAP_INPUT_B_BUTTON:
      state.callback = GetExitRegionMapMenuId;
      return POKENAV_MAP_FUNC_EXIT;
  }
  return POKENAV_MAP_FUNC_NONE;
}

/** 1:1 `static u32 HandleRegionMapInputZoomDisabled(struct Pokenav_RegionMapMenu *state)` (pokenav_region_map.c:223-232). */
function HandleRegionMapInputZoomDisabled(state: Pokenav_RegionMapMenu): number {
  if (JOY_NEW(B_BUTTON))
  {
    state.callback = GetExitRegionMapMenuId;
    return POKENAV_MAP_FUNC_EXIT;
  }
  return POKENAV_MAP_FUNC_NONE;
}

/** 1:1 `static u32 GetExitRegionMapMenuId(struct Pokenav_RegionMapMenu *state)` (pokenav_region_map.c:234-237). */
function GetExitRegionMapMenuId(state: Pokenav_RegionMapMenu): number {
  return POKENAV_MAIN_MENU_CURSOR_ON_MAP;
}

/** 1:1 `bool32 GetZoomDisabled(void)` (pokenav_region_map.c:239-243). */
export function GetZoomDisabled(): boolean {
  let state = GetSubstructPtr(POKENAV_SUBSTRUCT_REGION_MAP_STATE);
  return state.zoomDisabled;
}

/** 1:1 `bool32 OpenPokenavRegionMap(void)` (pokenav_region_map.c:245-254). */
export function OpenPokenavRegionMap(): boolean {
  let state = AllocSubstruct(POKENAV_SUBSTRUCT_REGION_MAP_ZOOM, 0 /* TRANSPILER-TODO sizeof(struct Pokenav_RegionMapGfx) */);
  if (!state)
    return false;
  state.loopTaskId = CreateLoopedTask(LoopedTask_OpenRegionMap, 1);
  state.isTaskActiveCB = GetCurrentLoopedTaskActive;
  return true;
}

/** 1:1 `void CreateRegionMapLoopedTask(s32 index)` (pokenav_region_map.c:256-261). */
export function CreateRegionMapLoopedTask(index: number): void {
  let state = GetSubstructPtr(POKENAV_SUBSTRUCT_REGION_MAP_ZOOM);
  state.loopTaskId = CreateLoopedTask(sRegionMapLoopTaskFuncs[index], 1);
  state.isTaskActiveCB = GetCurrentLoopedTaskActive;
}

/** 1:1 `bool32 IsRegionMapLoopedTaskActive(void)` (pokenav_region_map.c:263-267). */
export function IsRegionMapLoopedTaskActive(): boolean {
  let state = GetSubstructPtr(POKENAV_SUBSTRUCT_REGION_MAP_ZOOM);
  return state.isTaskActiveCB();
}

/** 1:1 `void FreeRegionMapSubstruct2(void)` (pokenav_region_map.c:269-279). */
export function FreeRegionMapSubstruct2(): void {
  let state = GetSubstructPtr(POKENAV_SUBSTRUCT_REGION_MAP_ZOOM);
  FreeRegionMapIconResources();
  FreeCityZoomViewGfx();
  RemoveWindow(state.infoWindowId);
  FreePokenavSubstruct(POKENAV_SUBSTRUCT_REGION_MAP);
  FreePokenavSubstruct(POKENAV_SUBSTRUCT_REGION_MAP_ZOOM);
  SetPokenavVBlankCallback();
  SetBgMode(0);
}

/** 1:1 `static void VBlankCB_RegionMap(void)` (pokenav_region_map.c:281-287). */
function VBlankCB_RegionMap(): void {
  TransferPlttBuffer();
  LoadOam();
  ProcessSpriteCopyRequests();
  UpdateRegionMapVideoRegs();
}

/** 1:1 `static bool32 GetCurrentLoopedTaskActive(void)` (pokenav_region_map.c:289-293). */
function GetCurrentLoopedTaskActive(): boolean {
  let state = GetSubstructPtr(POKENAV_SUBSTRUCT_REGION_MAP_ZOOM);
  return IsLoopedTaskActive(state.loopTaskId);
}

/** 1:1 `static bool8 ShouldOpenRegionMapZoomed(void)` (pokenav_region_map.c:295-301). */
function ShouldOpenRegionMapZoomed(): boolean {
  if (GetZoomDisabled())
    return false;
  return gSaveBlock2Ptr.regionMapZoom == 1;
}

/** 1:1 `static u32 LoopedTask_OpenRegionMap(s32 taskState)` (pokenav_region_map.c:303-379). */
function LoopedTask_OpenRegionMap(taskState: number): number {
  let menuGfxId = 0;
  let regionMap: any = null;
  let state = GetSubstructPtr(POKENAV_SUBSTRUCT_REGION_MAP_ZOOM);
  switch (taskState) {
    case 0:
      SetVBlankCallback_(null);
      HideBg(1);
      HideBg(2);
      HideBg(3);
      SetBgMode(1);
      InitBgTemplates(sRegionMapBgTemplates, sRegionMapBgTemplates.length - 1);
      regionMap = GetSubstructPtr(POKENAV_SUBSTRUCT_REGION_MAP);
      InitRegionMapData(regionMap, sRegionMapBgTemplates[1], ShouldOpenRegionMapZoomed());
      LoadCityZoomViewGfx();
      return LT_INC_AND_PAUSE;
    case 1:
      if (LoadRegionMapGfx())
        return LT_PAUSE;
      if (!GetZoomDisabled())
      {
        CreateRegionMapPlayerIcon(4, 9);
        CreateRegionMapCursor(5, 10);
        TrySetPlayerIconBlink();
      }
      else
      {
        // Dim the region map when zoom is disabled
        // (when the player is off the map)
        BlendRegionMap(RGB_BLACK, 6);
      }
      return LT_INC_AND_PAUSE;
    case 2:
      DecompressCityMaps();
      return LT_INC_AND_CONTINUE;
    case 3:
      if (IsDecompressCityMapsActive())
        return LT_PAUSE;
      LoadPokenavRegionMapGfx(state);
      return LT_INC_AND_CONTINUE;
    case 4:
      if (TryFreeTempTileDataBuffers())
        return LT_PAUSE;
      UpdateMapSecInfoWindow(state);
      FadeToBlackExceptPrimary();
      return LT_INC_AND_PAUSE;
    case 5:
      if (IsDma3ManagerBusyWithBgCopy_(state))
        return LT_PAUSE;
      ShowBg(1);
      ShowBg(2);
      SetVBlankCallback_(VBlankCB_RegionMap);
      return LT_INC_AND_PAUSE;
    case 6:
      if (!ShouldOpenRegionMapZoomed())
        menuGfxId = POKENAV_GFX_MAP_MENU_ZOOMED_OUT;
      else
        menuGfxId = POKENAV_GFX_MAP_MENU_ZOOMED_IN;
      LoadLeftHeaderGfxForIndex(menuGfxId);
      ShowLeftHeaderGfx(menuGfxId, true, true);
      PokenavFadeScreen(POKENAV_FADE_FROM_BLACK);
      return LT_INC_AND_PAUSE;
    case 7:
      if (IsPaletteFadeActive() || AreLeftHeaderSpritesMoving())
        return LT_PAUSE;
      return LT_INC_AND_CONTINUE;
    default:
      return LT_FINISH;
  }
}

/** 1:1 `static u32 LoopedTask_UpdateInfoAfterCursorMove(s32 taskState)` (pokenav_region_map.c:381-396). */
function LoopedTask_UpdateInfoAfterCursorMove(taskState: number): number {
  let state = GetSubstructPtr(POKENAV_SUBSTRUCT_REGION_MAP_ZOOM);
  switch (taskState) {
    case 0:
      UpdateMapSecInfoWindow(state);
      return LT_INC_AND_PAUSE;
    case 1:
      if (IsDma3ManagerBusyWithBgCopy_(state))
        return LT_PAUSE;
      break;
  }
  return LT_FINISH;
}

/** 1:1 `static u32 LoopedTask_RegionMapZoomOut(s32 taskState)` (pokenav_region_map.c:398-422). */
function LoopedTask_RegionMapZoomOut(taskState: number): number {
  switch (taskState) {
    case 0:
      PlaySE(SE_SELECT);
      ChangeBgYForZoom(false);
      SetRegionMapDataForZoom();
      return LT_INC_AND_PAUSE;
    case 1:
      if (UpdateRegionMapZoom() || IsChangeBgYForZoomActive())
        return LT_PAUSE;
      PrintHelpBarText(HELPBAR_MAP_ZOOMED_OUT);
      return LT_INC_AND_PAUSE;
    case 2:
      if (WaitForHelpBar())
        return LT_PAUSE;
      UpdateRegionMapRightHeaderTiles(POKENAV_GFX_MAP_MENU_ZOOMED_OUT);
      break;
  }
  return LT_FINISH;
}

/** 1:1 `static u32 LoopedTask_RegionMapZoomIn(s32 taskState)` (pokenav_region_map.c:424-455). */
function LoopedTask_RegionMapZoomIn(taskState: number): number {
  let state = GetSubstructPtr(POKENAV_SUBSTRUCT_REGION_MAP_ZOOM);
  switch (taskState) {
    case 0:
      PlaySE(SE_SELECT);
      UpdateMapSecInfoWindow(state);
      return LT_INC_AND_PAUSE;
    case 1:
      if (IsDma3ManagerBusyWithBgCopy_(state))
        return LT_PAUSE;
      ChangeBgYForZoom(true);
      SetRegionMapDataForZoom();
      return LT_INC_AND_PAUSE;
    case 2:
      if (UpdateRegionMapZoom() || IsChangeBgYForZoomActive())
        return LT_PAUSE;
      PrintHelpBarText(HELPBAR_MAP_ZOOMED_IN);
      return LT_INC_AND_PAUSE;
    case 3:
      if (WaitForHelpBar())
        return LT_PAUSE;
      UpdateRegionMapRightHeaderTiles(POKENAV_GFX_MAP_MENU_ZOOMED_IN);
      break;
  }
  return LT_FINISH;
}

/** 1:1 `static u32 LoopedTask_ExitRegionMap(s32 taskState)` (pokenav_region_map.c:457-483). */
function LoopedTask_ExitRegionMap(taskState: number): number {
  switch (taskState) {
    case 0:
      PlaySE(SE_SELECT);
      PokenavFadeScreen(POKENAV_FADE_TO_BLACK);
      return LT_INC_AND_PAUSE;
    case 1:
      if (IsPaletteFadeActive())
        return LT_PAUSE;
      SetLeftHeaderSpritesInvisibility();
      SlideMenuHeaderDown();
      return LT_INC_AND_PAUSE;
    case 2:
      if (MainMenuLoopedTaskIsBusy())
        return LT_PAUSE;
      HideBg(1);
      HideBg(2);
      HideBg(3);
      return LT_INC_AND_PAUSE;
  }
  return LT_FINISH;
}

/** 1:1 `static void LoadCityZoomViewGfx(void)` (pokenav_region_map.c:485-493). */
function LoadCityZoomViewGfx(): void {
  let i = 0;
  for (i = 0; i < sCityZoomTextSpriteSheet.length; i++)
    LoadCompressedSpriteSheet(sCityZoomTextSpriteSheet[i]);
  Pokenav_AllocAndLoadPalettes(sCityZoomTilesSpritePalette);
  CreateCityZoomTextSprites();
}

/** 1:1 `static void FreeCityZoomViewGfx(void)` (pokenav_region_map.c:495-503). */
function FreeCityZoomViewGfx(): void {
  let i = 0;
  let state = GetSubstructPtr(POKENAV_SUBSTRUCT_REGION_MAP_ZOOM);
  FreeSpriteTilesByTag(GFXTAG_CITY_ZOOM);
  FreeSpritePaletteByTag(PALTAG_CITY_ZOOM);
  for (i = 0; i < (state.cityZoomTextSprites.length | 0); i++)
    DestroySprite(state.cityZoomTextSprites[i]);
}

/** 1:1 `static void LoadPokenavRegionMapGfx(struct Pokenav_RegionMapGfx *state)` (pokenav_region_map.c:505-526). */
function LoadPokenavRegionMapGfx(state: Pokenav_RegionMapGfx): void {
  BgDmaFill(1, PIXEL_FILL(0), 0x40, 1);
  BgDmaFill(1, PIXEL_FILL(1), 0x41, 1);
  CpuFill16(0x1040, state.tilemapBuffer, 0x800);
  SetBgTilemapBuffer(1, state.tilemapBuffer);
  state.infoWindowId = AddWindow(sMapSecInfoWindowTemplate);
  LoadUserWindowBorderGfx_(state.infoWindowId, 0x42, BG_PLTT_ID(4));
  DrawTextBorderOuter(state.infoWindowId, 0x42, 4);
  DecompressAndCopyTileDataToVram(1, sRegionMapCityZoomTiles_Gfx, 0, 0, 0);
  FillWindowPixelBuffer(state.infoWindowId, PIXEL_FILL(1));
  PutWindowTilemap(state.infoWindowId);
  CopyWindowToVram(state.infoWindowId, COPYWIN_FULL);
  CopyPaletteIntoBufferUnfaded(sMapSecInfoWindow_Pal, BG_PLTT_ID(1), sMapSecInfoWindow_Pal.length /* TRANSPILER-TODO sizeof */);
  CopyPaletteIntoBufferUnfaded(gRegionMapCityZoomTiles_Pal, BG_PLTT_ID(3), PLTT_SIZE_4BPP);
  if (!IsRegionMapZoomed())
    ChangeBgY(1, -0x6000, BG_COORD_SET);
  else
    ChangeBgY(1, 0, BG_COORD_SET);
  ChangeBgX(1, 0, BG_COORD_SET);
}

/** 1:1 `static bool32 TryFreeTempTileDataBuffers(void)` (pokenav_region_map.c:528-531). */
function TryFreeTempTileDataBuffers(): boolean {
  return FreeTempTileDataBuffersIfPossible();
}

/** 1:1 `static void UpdateMapSecInfoWindow(struct Pokenav_RegionMapGfx *state)` (pokenav_region_map.c:533-569). */
function UpdateMapSecInfoWindow(state: Pokenav_RegionMapGfx): void {
  let regionMap = GetSubstructPtr(POKENAV_SUBSTRUCT_REGION_MAP);
  switch (regionMap.mapSecType) {
    case MAPSECTYPE_CITY_CANFLY:
      FillWindowPixelBuffer(state.infoWindowId, PIXEL_FILL(1));
      PutWindowRectTilemap(state.infoWindowId, 0, 0, 13, 2);
      //!< French Difference
      AddTextPrinterParameterized(state.infoWindowId, FONT_NARROW, regionMap.mapSecName, 0, 1, TEXT_SKIP_DRAW, null);
      DrawCityMap(state, regionMap.mapSecId, regionMap.posWithinMapSec);
      CopyWindowToVram(state.infoWindowId, COPYWIN_FULL);
      SetCityZoomTextInvisibility(false);
      break;
    case MAPSECTYPE_CITY_CANTFLY:
      FillWindowPixelBuffer(state.infoWindowId, PIXEL_FILL(1));
      PutWindowRectTilemap(state.infoWindowId, 0, 0, 13, 2);
      //!< French Difference
      AddTextPrinterParameterized(state.infoWindowId, FONT_NARROW, regionMap.mapSecName, 0, 1, TEXT_SKIP_DRAW, null);
      FillBgTilemapBufferRect(1, 0x1041, 17, 6, 13, 11, 17);
      //!< French Difference
      CopyWindowToVram(state.infoWindowId, COPYWIN_FULL);
      SetCityZoomTextInvisibility(true);
      break;
    case MAPSECTYPE_ROUTE:
    case MAPSECTYPE_BATTLE_FRONTIER:
      FillWindowPixelBuffer(state.infoWindowId, PIXEL_FILL(1));
      PutWindowTilemap(state.infoWindowId);
      AddTextPrinterParameterized(state.infoWindowId, FONT_NARROW, regionMap.mapSecName, 0, 1, TEXT_SKIP_DRAW, null);
      PrintLandmarkNames(state, regionMap.mapSecId, regionMap.posWithinMapSec);
      CopyWindowToVram(state.infoWindowId, COPYWIN_FULL);
      SetCityZoomTextInvisibility(true);
      break;
    case MAPSECTYPE_NONE:
      FillBgTilemapBufferRect(1, 0x1041, 17, 4, 13, 13, 17);
      //!< French Difference
      CopyBgTilemapBufferToVram(1);
      SetCityZoomTextInvisibility(true);
      break;
  }
}

/** 1:1 `static bool32 IsDma3ManagerBusyWithBgCopy_(struct Pokenav_RegionMapGfx *state)` (pokenav_region_map.c:571-574). */
function IsDma3ManagerBusyWithBgCopy_(state: Pokenav_RegionMapGfx): boolean {
  return IsDma3ManagerBusyWithBgCopy();
}

// #define tZoomIn data[0]  (alias — expansé aux usages)

/** 1:1 `static void ChangeBgYForZoom(bool32 zoomIn)` (pokenav_region_map.c:578-582). */
function ChangeBgYForZoom(zoomIn: boolean): void {
  let taskId = CreateTask((t: { taskId: number }) => Task_ChangeBgYForZoom(t.taskId), 3);
  gTasks[taskId].data[0] /* tZoomIn */ = zoomIn;
}

/** 1:1 `static bool32 IsChangeBgYForZoomActive(void)` (pokenav_region_map.c:584-587). */
function IsChangeBgYForZoomActive(): boolean {
  return FuncIsActiveTask(Task_ChangeBgYForZoom);
}

/** 1:1 `static void Task_ChangeBgYForZoom(u8 taskId)` (pokenav_region_map.c:589-611). */
function Task_ChangeBgYForZoom(taskId: number): void {
  if (gTasks[taskId].data[0] /* tZoomIn */)
  {
    if (ChangeBgY(1, 0x480, BG_COORD_ADD) >= 0)
    {
      ChangeBgY(1, 0, BG_COORD_SET);
      DestroyTask(taskId);
    }
    UpdateCityZoomTextPosition();
  }
  else
  {
    if (ChangeBgY(1, 0x480, BG_COORD_SUB) <= -0x6000)
    {
      ChangeBgY(1, -0x6000, BG_COORD_SET);
      DestroyTask(taskId);
    }
    UpdateCityZoomTextPosition();
  }
}

/** 1:1 `static void DecompressCityMaps(void)` (pokenav_region_map.c:615-618). */
function DecompressCityMaps(): void {
  CreateLoopedTask(LoopedTask_DecompressCityMaps, 1);
}

/** 1:1 `static bool32 IsDecompressCityMapsActive(void)` (pokenav_region_map.c:620-623). */
function IsDecompressCityMapsActive(): boolean {
  return FuncIsActiveLoopedTask(LoopedTask_DecompressCityMaps);
}

/** 1:1 `static u32 LoopedTask_DecompressCityMaps(s32 taskState)` (pokenav_region_map.c:625-635). */
function LoopedTask_DecompressCityMaps(taskState: number): number {
  let state = GetSubstructPtr(POKENAV_SUBSTRUCT_REGION_MAP_ZOOM);
  if (taskState < NUM_CITY_MAPS)
  {
    LZ77UnCompWram(sPokenavCityMaps[taskState].tilemap, state.cityZoomPics[taskState]);
    return LT_INC_AND_CONTINUE;
  }
  return LT_FINISH;
}

/** 1:1 `static void DrawCityMap(struct Pokenav_RegionMapGfx *state, mapsec_s32_t mapSecId, int pos)` (pokenav_region_map.c:637-648). */
function DrawCityMap(state: Pokenav_RegionMapGfx, mapSecId: number, pos: number): void {
  let i = 0;
  for (i = 0; i < NUM_CITY_MAPS && (sPokenavCityMaps[i].mapSecId != mapSecId || sPokenavCityMaps[i].index != pos); i++)
    ;
  if (i == NUM_CITY_MAPS)
    return;
  FillBgTilemapBufferRect_Palette0(1, 0x1041, 17, 6, 13, 11);
  //!< French Difference
  CopyToBgTilemapBufferRect(1, state.cityZoomPics[i], 18, 6, 10, 10);
}

/** 1:1 `static void PrintLandmarkNames(struct Pokenav_RegionMapGfx *state, mapsec_s32_t mapSecId, int pos)` (pokenav_region_map.c:650-663). */
function PrintLandmarkNames(state: Pokenav_RegionMapGfx, mapSecId: number, pos: number): void {
  let i = 0;
  while (1)
  {
    let landmarkName = GetLandmarkName(mapSecId, pos, i);
    if (!landmarkName)
      break;
    StringCopyPadded(gStringVar1, landmarkName, CHAR_SPACE, 13);
    //!< French Difference
    AddTextPrinterParameterized(state.infoWindowId, FONT_NARROW, gStringVar1, 0, i * 16 + 17, TEXT_SKIP_DRAW, null);
    i++;
  }
}

/** 1:1 `static void CreateCityZoomTextSprites(void)` (pokenav_region_map.c:665-690). */
function CreateCityZoomTextSprites(): void {
  let i = 0;
  let y = 0;
  let sprite: any = null;
  let state = GetSubstructPtr(POKENAV_SUBSTRUCT_REGION_MAP_ZOOM);
  // When not zoomed in the text is still created but its pushed off screen
  if (!IsRegionMapZoomed())
    y = 228;
  else
    y = 132;
  for (i = 0; i < (state.cityZoomTextSprites.length | 0); i++)
  {
    let spriteId = CreateSprite(sCityZoomTextSpriteTemplate, 152 + i * 32, y, 8);
    sprite = gSprites[spriteId];
    sprite.data[0] = 0;
    sprite.data[1] = i * 4;
    sprite.data[2] = sprite.oam.tileNum;
    sprite.data[3] = 150;
    sprite.data[4] = i * 4;
    sprite.oam.tileNum += i * 4;
    state.cityZoomTextSprites[i] = sprite;
  }
}

// Slide and cycle through the text key showing what the features on the zoomed city map are

/** 1:1 `static void SpriteCB_CityZoomText(struct Sprite *sprite)` (pokenav_region_map.c:693-725). */
function SpriteCB_CityZoomText(sprite: DecompSprite): void {
  if (sprite.data[3])
  {
    sprite.data[3]--;
    return;
  }
  if (++sprite.data[0] > 11)
    sprite.data[0] = 0;
  if (++sprite.data[1] > 60)
    sprite.data[1] = 0;
  sprite.oam.tileNum = sprite.data[2] + sprite.data[1];
  if (sprite.data[5] < 4)
  {
    if (sprite.data[0] == 0)
    {
      sprite.data[5]++;
      sprite.data[3] = 120;
    }
  }
  else
  {
    if (sprite.data[1] == sprite.data[4])
    {
      sprite.data[5] = 0;
      sprite.data[0] = 0;
      sprite.data[3] = 120;
    }
  }
}

/** 1:1 `static void UpdateCityZoomTextPosition(void)` (pokenav_region_map.c:727-734). */
function UpdateCityZoomTextPosition(): void {
  let i = 0;
  let state = GetSubstructPtr(POKENAV_SUBSTRUCT_REGION_MAP_ZOOM);
  let y = 132 - (GetBgY(1) >> 8);
  for (i = 0; i < (state.cityZoomTextSprites.length | 0); i++)
    state.cityZoomTextSprites[i].y = y;
}

/** 1:1 `static void SetCityZoomTextInvisibility(bool32 invisible)` (pokenav_region_map.c:736-742). */
function SetCityZoomTextInvisibility(invisible: boolean): void {
  let i = 0;
  let state = GetSubstructPtr(POKENAV_SUBSTRUCT_REGION_MAP_ZOOM);
  for (i = 0; i < (state.cityZoomTextSprites.length | 0); i++)
    state.cityZoomTextSprites[i].invisible = invisible;
}
