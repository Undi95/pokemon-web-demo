// @ts-nocheck — transpilé brut (types stricts au câblage fin ; wire-transpiled.cjs)
/**
 * pokenav_conditions_gfx.ts — miroir 1:1 de `D:/Projet 1/decomps/pokeemeraude/src/pokenav_conditions_gfx.c` (transpilé).
 *
 * Généré par scripts/transpile-c.cjs — revue humaine OBLIGATOIRE avant commit :
 * rapport des flags dans audit-reports/transpile/pokenav_conditions_gfx.md.
 * Politique préproc : build vanilla FR (NDEBUG/FRENCH définis, BUGFIX/UBFIX absents).
 */

import { BLDALPHA_BLEND, BLDCNT_EFFECT_BLEND, BLDCNT_TGT1_BG2, BLDCNT_TGT2_BG3, CpuFill32, LZ77UnCompVram, LoadPalette, SpriteCallbackDummy, TransferPlttBuffer } from '../harness/runtime/decomp-globals';
import { EXT_CTRL_CODE_BEGIN, EXT_CTRL_CODE_COLOR_HIGHLIGHT_SHADOW, TEXT_COLOR_BLUE, TEXT_COLOR_LIGHT_BLUE, TEXT_COLOR_TRANSPARENT } from '../include/constants/characters';
import { PARTY_SIZE } from '../include/constants/global';
import { BG_SCREEN_SIZE, BG_VRAM_SIZE, VRAM } from '../include/gba/defines';
import { DISPCNT_BG0_ON, DISPCNT_BG3_ON, DISPCNT_OBJ_1D_MAP, DISPCNT_OBJ_ON, DISPCNT_WIN0_ON, DISPCNT_WIN1_ON, REG_OFFSET_BLDALPHA, REG_OFFSET_BLDCNT, REG_OFFSET_DISPCNT } from '../include/gba/io_reg';
import { MAX_SPRITES, SPRITE_NONE } from '../include/sprite';
import { STR_CONV_MODE_RIGHT_ALIGN } from '../include/string_util';
import { FONT_NORMAL } from '../include/text';
import { MON_PIC_SIZE } from './battle_gfx_sfx_util';
import { getString } from './engine/ui/gba-strings';
import { SetGpuReg } from './gpu_regs';
import { BG_PLTT_ID, OBJ_PLTT_ID } from './palette';
import { ScanlineEffect_InitHBlankDmaTransfer } from './scanline_effect';
import { CreateSprite, DestroySprite, FreeSpritePaletteByTag, FreeSpriteTilesByTag, IndexOfSpritePaletteTag, LoadOam, LoadSpritePalette, LoadSpriteSheet, LoadSpriteSheets, PLTT_SIZE_4BPP, ProcessSpriteCopyRequests, StartSpriteAnim, gSprites } from './sprite';
import { ConvertIntToDecimalStringN, StringCopy } from './string_util';
import { AddTextPrinterParameterized, DeactivateAllTextPrinters } from './text';
import { AddWindow, COPYWIN_FULL, COPYWIN_GFX, ChangeBgX, ChangeBgY, CopyBgTilemapBufferToVram, CopyWindowToVram, FillWindowPixelBuffer, HideBg, PutWindowTilemap, RemoveWindow, ShowBg } from './window';
import type { DecompSprite } from '../harness/runtime/decomp-runtime';
import type { SpriteTemplate } from './sprite';
import type { WindowTemplate } from './window';

// ═══ wire-transpiled (auto) : imports résolus par l'index + sentinelles ═══
import { __wireTodo } from './engine/wire-todo';
// ─── WIRE-TODO : symboles transpilés SANS foyer dans le repo (throw à l'appel) ───
const AllocSubstruct: any = __wireTodo('AllocSubstruct');
const AreLeftHeaderSpritesMoving: any = __wireTodo('AreLeftHeaderSpritesMoving');
const BgDmaFill: any = __wireTodo('BgDmaFill');
const BufferMonMarkingsMenuTiles: any = __wireTodo('BufferMonMarkingsMenuTiles');
const ConditionGraph_Draw: any = __wireTodo('ConditionGraph_Draw');
const ConditionGraph_InitResetScanline: any = __wireTodo('ConditionGraph_InitResetScanline');
const ConditionGraph_InitWindow: any = __wireTodo('ConditionGraph_InitWindow');
const ConditionGraph_ResetScanline: any = __wireTodo('ConditionGraph_ResetScanline');
const ConditionGraph_SetNewPositions: any = __wireTodo('ConditionGraph_SetNewPositions');
const ConditionGraph_TryUpdate: any = __wireTodo('ConditionGraph_TryUpdate');
const ConditionMenu_UpdateMonEnter: any = __wireTodo('ConditionMenu_UpdateMonEnter');
const ConditionMenu_UpdateMonExit: any = __wireTodo('ConditionMenu_UpdateMonExit');
const CopyPaletteIntoBufferUnfaded: any = __wireTodo('CopyPaletteIntoBufferUnfaded');
const CopyToBgTilemapBufferRect: any = __wireTodo('CopyToBgTilemapBufferRect');
const CreateConditionSparkleSprites: any = __wireTodo('CreateConditionSparkleSprites');
const CreateLoopedTask: any = __wireTodo('CreateLoopedTask');
const CreateMonMarkingAllCombosSprite: any = __wireTodo('CreateMonMarkingAllCombosSprite');
const DecompressAndCopyTileDataToVram: any = __wireTodo('DecompressAndCopyTileDataToVram');
const DestroyConditionSparkleSprites: any = __wireTodo('DestroyConditionSparkleSprites');
const DmaCopy16Defvars: any = __wireTodo('DmaCopy16Defvars');
const FreeConditionSparkles: any = __wireTodo('FreeConditionSparkles');
const FreeMonMarkingsMenu: any = __wireTodo('FreeMonMarkingsMenu');
const FreePokenavSubstruct: any = __wireTodo('FreePokenavSubstruct');
const FreeTempTileDataBuffersIfPossible: any = __wireTodo('FreeTempTileDataBuffersIfPossible');
const GetConditionGraphCurrentListIndex: any = __wireTodo('GetConditionGraphCurrentListIndex');
const GetConditionGraphMenuCurrentLoadIndex: any = __wireTodo('GetConditionGraphMenuCurrentLoadIndex');
const GetConditionGraphPtr: any = __wireTodo('GetConditionGraphPtr');
const GetConditionMonDataBuffer: any = __wireTodo('GetConditionMonDataBuffer');
const GetConditionMonLocationText: any = __wireTodo('GetConditionMonLocationText');
const GetConditionMonNameText: any = __wireTodo('GetConditionMonNameText');
const GetConditionMonPal: any = __wireTodo('GetConditionMonPal');
const GetConditionMonPicGfx: any = __wireTodo('GetConditionMonPicGfx');
const GetMonListCount: any = __wireTodo('GetMonListCount');
const GetNumConditionMonSparkles: any = __wireTodo('GetNumConditionMonSparkles');
const GetSubstructPtr: any = __wireTodo('GetSubstructPtr');
const InitBgTemplates: any = __wireTodo('InitBgTemplates');
const InitMonMarkingsMenu: any = __wireTodo('InitMonMarkingsMenu');
const IsConditionMenuSearchMode: any = __wireTodo('IsConditionMenuSearchMode');
const IsLoopedTaskActive: any = __wireTodo('IsLoopedTaskActive');
const IsPaletteFadeActive: any = __wireTodo('IsPaletteFadeActive');
const LoadConditionGraphMenuGfx: any = __wireTodo('LoadConditionGraphMenuGfx');
const LoadConditionMonPicTemplate: any = __wireTodo('LoadConditionMonPicTemplate');
const LoadConditionSelectionIcons: any = __wireTodo('LoadConditionSelectionIcons');
const LoadConditionSparkle: any = __wireTodo('LoadConditionSparkle');
const LoadLeftHeaderGfxForIndex: any = __wireTodo('LoadLeftHeaderGfxForIndex');
const LoadNextConditionMenuMonData: any = __wireTodo('LoadNextConditionMenuMonData');
const MainMenuLoopedTaskIsBusy: any = __wireTodo('MainMenuLoopedTaskIsBusy');
const MoveConditionMonOffscreen: any = __wireTodo('MoveConditionMonOffscreen');
const OpenMonMarkingsMenu: any = __wireTodo('OpenMonMarkingsMenu');
const PokenavFadeScreen: any = __wireTodo('PokenavFadeScreen');
const PokenavFillPalette: any = __wireTodo('PokenavFillPalette');
const Pokenav_AllocAndLoadPalettes: any = __wireTodo('Pokenav_AllocAndLoadPalettes');
const PrintHelpBarText: any = __wireTodo('PrintHelpBarText');
const ResetConditionSparkleSprites: any = __wireTodo('ResetConditionSparkleSprites');
const SetBgTilemapBuffer: any = __wireTodo('SetBgTilemapBuffer');
const SetLeftHeaderSpritesInvisibility: any = __wireTodo('SetLeftHeaderSpritesInvisibility');
const SetPokenavVBlankCallback: any = __wireTodo('SetPokenavVBlankCallback');
const SetVBlankCallback_: any = __wireTodo('SetVBlankCallback_');
const ShowLeftHeaderGfx: any = __wireTodo('ShowLeftHeaderGfx');
const SlideMenuHeaderDown: any = __wireTodo('SlideMenuHeaderDown');
const TryGetMonMarkId: any = __wireTodo('TryGetMonMarkId');
const WaitForHelpBar: any = __wireTodo('WaitForHelpBar');
const gPokenavCondition_Gfx: any = __wireTodo('gPokenavCondition_Gfx');
const gPokenavCondition_Pal: any = __wireTodo('gPokenavCondition_Pal');
const gPokenavCondition_Tilemap: any = __wireTodo('gPokenavCondition_Tilemap');
const gPokenavOptions_Tilemap: any = __wireTodo('gPokenavOptions_Tilemap');

// ─── constantes décomp inlinées (headers pas encore dans include/) ───
const POKENAV_SUBSTRUCT_CONDITION_GRAPH_MENU_GFX = 12; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const LT_PAUSE = 2; // 1:1 include/pokenav.h:60 (à consolider dans include/)
const LT_INC_AND_PAUSE = 0; // 1:1 include/pokenav.h:58 (à consolider dans include/)
const BG_COORD_SET = 0; // 1:1 include/bg.h:0 (à consolider dans include/)
const HELPBAR_CONDITION_MON_STATUS = 4; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_FADE_FROM_BLACK = 1; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_GFX_PARTY_MENU = 6; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_GFX_CONDITION_MENU = 1; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const LT_FINISH = 4; // 1:1 include/pokenav.h:62 (à consolider dans include/)
const LT_INC_AND_CONTINUE = 1; // 1:1 include/pokenav.h:59 (à consolider dans include/)
const POKENAV_FADE_TO_BLACK = 0; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const CONDITION_LOAD_MON_INFO = 0; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const CONDITION_LOAD_GRAPH = 1; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const CONDITION_LOAD_MON_PIC = 2; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const HELPBAR_CONDITION_MARKINGS = 5; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const CONDITION_ICON_SELECTED = 0; // 1:1 include/menu_specialized.h:0 (à consolider dans include/)
const CONDITION_ICON_UNSELECTED = 1; // 1:1 include/menu_specialized.h:0 (à consolider dans include/)
const TAG_CONDITION_BALL = 101; // 1:1 include/menu_specialized.h:0 (à consolider dans include/)
const TAG_CONDITION_CANCEL = 102; // 1:1 include/menu_specialized.h:0 (à consolider dans include/)
const TAG_CONDITION_MARKINGS_MENU = 106; // 1:1 include/menu_specialized.h:0 (à consolider dans include/)
const TAG_CONDITION_MON_MARKINGS = 105; // 1:1 include/menu_specialized.h:0 (à consolider dans include/)
const TAG_CONDITION_BALL_PLACEHOLDER = 103; // 1:1 include/menu_specialized.h:0 (à consolider dans include/)
const TAG_CONDITION_MON = 100; // 1:1 include/menu_specialized.h:0 (à consolider dans include/)
const CONDITION_GRAPH_LOAD_MAX = 4; // 1:1 include/menu_specialized.h:55 (à consolider dans include/)

/** 1:1 (pokenav_conditions_gfx.c:25) */
let sInitialLoadId = 0;

// Never read

// TRANSPILER-TODO INCGFX : gConditionGraphData_Pal ← graphics/pokenav/condition/graph_data.pal (pipeline assets : loadTileBin/loadGbaPal('/decomp/em/…'))
let gConditionGraphData_Pal: any = null;

// TRANSPILER-TODO INCGFX : gConditionText_Pal ← graphics/pokenav/condition/text.pal (pipeline assets : loadTileBin/loadGbaPal('/decomp/em/…'))
let gConditionText_Pal: any = null;

// TRANSPILER-TODO INCGFX : sConditionGraphData_Gfx ← graphics/pokenav/condition/graph_data.png (pipeline assets : loadTileBin/loadGbaPal('/decomp/em/…'))
let sConditionGraphData_Gfx: any = null;

// TRANSPILER-TODO INCGFX : sConditionGraphData_Tilemap ← graphics/pokenav/condition/graph_data.bin (pipeline assets : loadTileBin/loadGbaPal('/decomp/em/…'))
let sConditionGraphData_Tilemap: any = null;

// TRANSPILER-TODO INCGFX : sMonMarkings_Pal ← graphics/pokenav/condition/mon_markings.pal (pipeline assets : loadTileBin/loadGbaPal('/decomp/em/…'))
let sMonMarkings_Pal: any = null;

/** 1:1 (pokenav_conditions_gfx.c:33) */
const sMenuBgTemplates = [
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
    charBaseIndex: 3, /* :2 */
    mapBaseIndex: 0x1D, /* :5 */
    screenSize: 0, /* :2 */
    paletteMode: 0, /* :1 */
    priority: 2, /* :2 */
    baseTile: 0, /* :10 */
  },
  {
    bg: 3, /* :2 */
    charBaseIndex: 2, /* :2 */
    mapBaseIndex: 0x1E, /* :5 */
    screenSize: 0, /* :2 */
    paletteMode: 0, /* :1 */
    priority: 3, /* :2 */
    baseTile: 0, /* :10 */
  },
];

/** 1:1 (pokenav_conditions_gfx.c:64) */
const sMonNameGenderWindowTemplate = {
  bg: 1,
  tilemapLeft: 13,
  tilemapTop: 1,
  width: 13,
  height: 4,
  paletteNum: 15,
  baseBlock: 2,
};

/** 1:1 (pokenav_conditions_gfx.c:75) */
const sListIndexWindowTemplate = {
  bg: 1,
  tilemapLeft: 1,
  tilemapTop: 6,
  width: 7,
  height: 2,
  paletteNum: 15,
  baseBlock: 0x36,
};

/** 1:1 (pokenav_conditions_gfx.c:86) */
const sUnusedWindowTemplate1 = {
  bg: 1,
  tilemapLeft: 1,
  tilemapTop: 0x1C,
  width: 5,
  height: 2,
  paletteNum: 15,
  baseBlock: 0x44,
};

/** 1:1 (pokenav_conditions_gfx.c:97) */
const sUnusedWindowTemplate2 = {
  bg: 1,
  tilemapLeft: 13,
  tilemapTop: 0x1C,
  width: 3,
  height: 2,
  paletteNum: 15,
  baseBlock: 0x44,
};

/** 1:1 (pokenav_conditions_gfx.c:108) */
const sLoopedTaskFuncs = [
  null, // [CONDITION_FUNC_NONE]
  LoopedTask_TransitionMons, // [CONDITION_FUNC_SLIDE_MON_IN]
  LoopedTask_ExitConditionGraphMenu, // [CONDITION_FUNC_RETURN]
  LoopedTask_MoveCursorNoTransition, // [CONDITION_FUNC_NO_TRANSITION]
  LoopedTask_SlideMonOut, // [CONDITION_FUNC_SLIDE_MON_OUT]
  LoopedTask_OpenMonMarkingsWindow, // [CONDITION_FUNC_ADD_MARKINGS]
  LoopedTask_CloseMonMarkingsWindow, // [CONDITION_FUNC_CLOSE_MARKINGS]
];

/** 1:1 `struct Pokenav_ConditionMenuGfx` (pokenav_conditions_gfx.c:121). */
interface Pokenav_ConditionMenuGfx {
  loopedTaskId: number;
  tilemapBuffers: any[];
  filler: Uint8Array;
  partyPokeballSpriteIds: Uint8Array;
  callback: ((...args: any[]) => any) | null;
  monTransitionX: number;
  monPicSpriteId: number;
  monPalIndex: number;
  monGfxTileStart: number;
  monGfxPtr: any;
  nameGenderWindowId: number;
  listIndexWindowId: number;
  unusedWindowId1: number;
  unusedWindowId2: number;
  marksMenu: any;
  monMarksSprite: DecompSprite | null;
  conditionSparkleSprites: DecompSprite | null;
  windowModeState: number;
  filler2: Uint8Array;
}

// This function's declaration here is s8 vs. u8 in pokenav_conditions.c

/** 1:1 `bool32 OpenConditionGraphMenu(void)` (pokenav_conditions_gfx.c:158-170). */
export function OpenConditionGraphMenu(): boolean {
  let menu = AllocSubstruct(POKENAV_SUBSTRUCT_CONDITION_GRAPH_MENU_GFX, 0 /* TRANSPILER-TODO sizeof(struct Pokenav_ConditionMenuGfx) */);
  if (menu == null)
    return false;
  menu.monPicSpriteId = SPRITE_NONE;
  menu.loopedTaskId = CreateLoopedTask(LoopedTask_OpenConditionGraphMenu, 1);
  menu.callback = GetConditionGraphMenuLoopedTaskActive;
  menu.windowModeState = 0;
  return true;
}

/** 1:1 `void CreateConditionGraphMenuLoopedTask(s32 id)` (pokenav_conditions_gfx.c:172-177). */
export function CreateConditionGraphMenuLoopedTask(id: number): void {
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_CONDITION_GRAPH_MENU_GFX);
  menu.loopedTaskId = CreateLoopedTask(sLoopedTaskFuncs[id], 1);
  menu.callback = GetConditionGraphMenuLoopedTaskActive;
}

/** 1:1 `u32 IsConditionGraphMenuLoopedTaskActive(void)` (pokenav_conditions_gfx.c:179-183). */
export function IsConditionGraphMenuLoopedTaskActive(): number {
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_CONDITION_GRAPH_MENU_GFX);
  return menu.callback();
}

/** 1:1 `static u32 GetConditionGraphMenuLoopedTaskActive(void)` (pokenav_conditions_gfx.c:185-189). */
function GetConditionGraphMenuLoopedTaskActive(): number {
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_CONDITION_GRAPH_MENU_GFX);
  return IsLoopedTaskActive(menu.loopedTaskId);
}

/** 1:1 `static u32 LoopedTask_OpenConditionGraphMenu(s32 state)` (pokenav_conditions_gfx.c:191-339). */
function LoopedTask_OpenConditionGraphMenu(state: number): number {
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_CONDITION_GRAPH_MENU_GFX);
  switch (state) {
    case 0:
      if (LoadConditionGraphMenuGfx() != 1)
        return LT_PAUSE;
      return LT_INC_AND_PAUSE;
    case 1:
      InitBgTemplates(sMenuBgTemplates, sMenuBgTemplates.length);
      ChangeBgX(1, 0, BG_COORD_SET);
      ChangeBgY(1, 0, BG_COORD_SET);
      ChangeBgX(2, 0, BG_COORD_SET);
      ChangeBgY(2, 0, BG_COORD_SET);
      ChangeBgX(3, 0, BG_COORD_SET);
      ChangeBgY(3, 0, BG_COORD_SET);
      SetGpuReg(REG_OFFSET_DISPCNT, DISPCNT_WIN0_ON | DISPCNT_WIN1_ON | DISPCNT_OBJ_ON | DISPCNT_OBJ_1D_MAP | DISPCNT_BG0_ON | DISPCNT_BG3_ON);
      SetGpuReg(REG_OFFSET_BLDCNT, BLDCNT_TGT1_BG2 | BLDCNT_EFFECT_BLEND | BLDCNT_TGT2_BG3);
      SetGpuReg(REG_OFFSET_BLDALPHA, BLDALPHA_BLEND(11, 4));
      DecompressAndCopyTileDataToVram(3, gPokenavCondition_Gfx, 0, 0, 0);
      return LT_INC_AND_PAUSE;
    case 2:
      if (FreeTempTileDataBuffersIfPossible())
        return LT_PAUSE;
      DecompressAndCopyTileDataToVram(2, sConditionGraphData_Gfx, 0, 0, 0);
      return LT_INC_AND_PAUSE;
    case 3:
      if (FreeTempTileDataBuffersIfPossible())
        return LT_PAUSE;
      LZ77UnCompVram(gPokenavCondition_Tilemap, menu.tilemapBuffers[0]);
      SetBgTilemapBuffer(3, menu.tilemapBuffers[0]);
      if (IsConditionMenuSearchMode() == 1)
        CopyToBgTilemapBufferRect(3, gPokenavOptions_Tilemap, 0, 5, 9, 4);
      CopyBgTilemapBufferToVram(3);
      CopyPaletteIntoBufferUnfaded(gPokenavCondition_Pal, BG_PLTT_ID(1), PLTT_SIZE_4BPP);
      CopyPaletteIntoBufferUnfaded(gConditionText_Pal, BG_PLTT_ID(15), PLTT_SIZE_4BPP);
      menu.monTransitionX = -80;
      return LT_INC_AND_PAUSE;
    case 4:
      if (FreeTempTileDataBuffersIfPossible())
        return LT_PAUSE;
      LZ77UnCompVram(sConditionGraphData_Tilemap, menu.tilemapBuffers[2]);
      SetBgTilemapBuffer(2, menu.tilemapBuffers[2]);
      CopyBgTilemapBufferToVram(2);
      CopyPaletteIntoBufferUnfaded(gConditionGraphData_Pal, BG_PLTT_ID(3), PLTT_SIZE_4BPP);
      ConditionGraph_InitWindow(2);
      return LT_INC_AND_PAUSE;
    case 5:
      BgDmaFill(1, 0, 0, 1);
      BgDmaFill(1, 17, 1, 1);
      CpuFill32(0, menu.tilemapBuffers[1], BG_SCREEN_SIZE);
      SetBgTilemapBuffer(1, menu.tilemapBuffers[1]);
      return LT_INC_AND_PAUSE;
    case 6:
      if (FreeTempTileDataBuffersIfPossible())
        return LT_PAUSE;
      menu.nameGenderWindowId = AddWindow(sMonNameGenderWindowTemplate);
      if (IsConditionMenuSearchMode() == 1)
      {
        menu.listIndexWindowId = AddWindow(sListIndexWindowTemplate);
        menu.unusedWindowId1 = AddWindow(sUnusedWindowTemplate1);
        menu.unusedWindowId2 = AddWindow(sUnusedWindowTemplate2);
      }
      DeactivateAllTextPrinters();
      return LT_INC_AND_PAUSE;
    case 7:
      CreateConditionMonPic(0);
      return LT_INC_AND_PAUSE;
    case 8:
      CreateMonMarkingsOrPokeballIndicators();
      return LT_INC_AND_PAUSE;
    case 9:
      if (IsConditionMenuSearchMode() == 1)
        CopyUnusedConditionWindowsToVram();
      return LT_INC_AND_PAUSE;
    case 10:
      UpdateConditionGraphMenuWindows(0, GetConditionGraphMenuCurrentLoadIndex(), true);
      return LT_INC_AND_PAUSE;
    case 11:
      UpdateConditionGraphMenuWindows(1, GetConditionGraphMenuCurrentLoadIndex(), true);
      return LT_INC_AND_PAUSE;
    case 12:
      UpdateConditionGraphMenuWindows(2, GetConditionGraphMenuCurrentLoadIndex(), true);
      return LT_INC_AND_PAUSE;
    case 13:
      if (UpdateConditionGraphMenuWindows(3, GetConditionGraphMenuCurrentLoadIndex(), true) != 1)
        return LT_PAUSE;
      PutWindowTilemap(menu.nameGenderWindowId);
      if (IsConditionMenuSearchMode() == 1)
      {
        PutWindowTilemap(menu.listIndexWindowId);
        PutWindowTilemap(menu.unusedWindowId1);
        PutWindowTilemap(menu.unusedWindowId2);
      }
      return LT_INC_AND_PAUSE;
    case 14:
      ShowBg(1);
      HideBg(2);
      ShowBg(3);
      if (IsConditionMenuSearchMode() == 1)
        PrintHelpBarText(HELPBAR_CONDITION_MON_STATUS);
      return LT_INC_AND_PAUSE;
    case 15:
      PokenavFadeScreen(POKENAV_FADE_FROM_BLACK);
      if (!IsConditionMenuSearchMode())
      {
        LoadLeftHeaderGfxForIndex(POKENAV_GFX_PARTY_MENU);
        ShowLeftHeaderGfx(POKENAV_GFX_CONDITION_MENU, true, false);
        ShowLeftHeaderGfx(POKENAV_GFX_PARTY_MENU, true, false);
      }
      return LT_INC_AND_PAUSE;
    case 16:
      if (IsPaletteFadeActive())
        return LT_PAUSE;
      if (!IsConditionMenuSearchMode() && AreLeftHeaderSpritesMoving())
        return LT_PAUSE;
      SetVBlankCallback_(VBlankCB_PokenavConditionGraph);
      return LT_INC_AND_PAUSE;
    case 17:
      DoConditionGraphEnterTransition();
      ConditionGraph_InitResetScanline(GetConditionGraphPtr());
      return LT_INC_AND_PAUSE;
    case 18:
      if (ConditionGraph_ResetScanline(GetConditionGraphPtr()))
        return LT_PAUSE;
      return LT_INC_AND_PAUSE;
    case 19:
      ToggleGraphData(true);
      return LT_INC_AND_PAUSE;
    case 20:
      if (!ConditionMenu_UpdateMonEnter(GetConditionGraphPtr(), menu.monTransitionX))
      {
        ResetConditionSparkleSprites(menu.conditionSparkleSprites);
        if (IsConditionMenuSearchMode() == 1 || GetConditionGraphCurrentListIndex() != GetMonListCount())
          CreateConditionSparkleSprites(menu.conditionSparkleSprites, menu.monPicSpriteId, GetNumConditionMonSparkles());
        return LT_FINISH;
      }
      return LT_PAUSE;
  }
  return LT_FINISH;
}

/** 1:1 `static u32 LoopedTask_ExitConditionGraphMenu(s32 state)` (pokenav_conditions_gfx.c:341-372). */
function LoopedTask_ExitConditionGraphMenu(state: number): number {
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_CONDITION_GRAPH_MENU_GFX);
  switch (state) {
    case 0:
      DoConditionGraphExitTransition();
      DestroyConditionSparkleSprites(menu.conditionSparkleSprites);
      return LT_INC_AND_CONTINUE;
    case 1:
      if (ConditionMenu_UpdateMonExit(GetConditionGraphPtr(), menu.monTransitionX))
        return 2;
      ToggleGraphData(false);
      return LT_INC_AND_CONTINUE;
    case 2:
      PokenavFadeScreen(POKENAV_FADE_TO_BLACK);
      if (!IsConditionMenuSearchMode())
        SlideMenuHeaderDown();
      return LT_INC_AND_PAUSE;
    case 3:
      if (IsPaletteFadeActive() || MainMenuLoopedTaskIsBusy())
        return LT_PAUSE;
      FreeConditionSparkles(menu.conditionSparkleSprites);
      HideBg(1);
      HideBg(2);
      HideBg(3);
      return LT_INC_AND_CONTINUE;
  }
  return LT_FINISH;
}

/** 1:1 `static u32 LoopedTask_TransitionMons(s32 state)` (pokenav_conditions_gfx.c:374-429). */
function LoopedTask_TransitionMons(state: number): number {
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_CONDITION_GRAPH_MENU_GFX);
  let graph = GetConditionGraphPtr();
  switch (state) {
    case 0:
      LoadNextConditionMenuMonData(CONDITION_LOAD_MON_INFO);
      return LT_INC_AND_CONTINUE;
    case 1:
      LoadNextConditionMenuMonData(CONDITION_LOAD_GRAPH);
      return LT_INC_AND_CONTINUE;
    case 2:
      LoadNextConditionMenuMonData(CONDITION_LOAD_MON_PIC);
      DestroyConditionSparkleSprites(menu.conditionSparkleSprites);
      return LT_INC_AND_CONTINUE;
    case 3:
      ConditionGraph_TryUpdate(graph);
      return LT_INC_AND_CONTINUE;
    case 4:
      if (!MoveConditionMonOffscreen(menu.monTransitionX))
      {
        CreateConditionMonPic(GetConditionGraphMenuCurrentLoadIndex());
        return LT_INC_AND_CONTINUE;
      }
      return LT_PAUSE;
    case 5:
      UpdateConditionGraphMenuWindows(0, GetConditionGraphMenuCurrentLoadIndex(), false);
      return LT_INC_AND_CONTINUE;
    case 6:
      UpdateConditionGraphMenuWindows(1, GetConditionGraphMenuCurrentLoadIndex(), false);
      return LT_INC_AND_CONTINUE;
    case 7:
      UpdateConditionGraphMenuWindows(2, GetConditionGraphMenuCurrentLoadIndex(), false);
      return LT_INC_AND_CONTINUE;
    case 8:
      if (UpdateConditionGraphMenuWindows(3, GetConditionGraphMenuCurrentLoadIndex(), false) == 1)
        return LT_INC_AND_CONTINUE;
      return LT_PAUSE;
    case 9:
      graph = GetConditionGraphPtr();
      if (!ConditionMenu_UpdateMonEnter(graph, menu.monTransitionX))
      {
        ResetConditionSparkleSprites(menu.conditionSparkleSprites);
        if (IsConditionMenuSearchMode() != 1 && GetConditionGraphCurrentListIndex() == GetMonListCount())
          return LT_INC_AND_CONTINUE;
        CreateConditionSparkleSprites(menu.conditionSparkleSprites, menu.monPicSpriteId, GetNumConditionMonSparkles());
        return LT_INC_AND_CONTINUE;
      }
      return LT_PAUSE;
  }
  return LT_FINISH;
}

/** 1:1 `static u32 LoopedTask_MoveCursorNoTransition(s32 state)` (pokenav_conditions_gfx.c:431-473). */
function LoopedTask_MoveCursorNoTransition(state: number): number {
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_CONDITION_GRAPH_MENU_GFX);
  switch (state) {
    case 0:
      LoadNextConditionMenuMonData(CONDITION_LOAD_MON_INFO);
      return LT_INC_AND_CONTINUE;
    case 1:
      LoadNextConditionMenuMonData(CONDITION_LOAD_GRAPH);
      return LT_INC_AND_CONTINUE;
    case 2:
      LoadNextConditionMenuMonData(CONDITION_LOAD_MON_PIC);
      return LT_INC_AND_CONTINUE;
    case 3:
      CreateConditionMonPic(GetConditionGraphMenuCurrentLoadIndex());
      return LT_INC_AND_CONTINUE;
    case 4:
      UpdateConditionGraphMenuWindows(0, GetConditionGraphMenuCurrentLoadIndex(), false);
      return LT_INC_AND_CONTINUE;
    case 5:
      UpdateConditionGraphMenuWindows(1, GetConditionGraphMenuCurrentLoadIndex(), false);
      return LT_INC_AND_CONTINUE;
    case 6:
      UpdateConditionGraphMenuWindows(2, GetConditionGraphMenuCurrentLoadIndex(), false);
      return LT_INC_AND_CONTINUE;
    case 7:
      if (UpdateConditionGraphMenuWindows(3, GetConditionGraphMenuCurrentLoadIndex(), false) == 1)
        return LT_INC_AND_CONTINUE;
      return LT_PAUSE;
    case 8:
      if (!ConditionMenu_UpdateMonEnter(GetConditionGraphPtr(), menu.monTransitionX))
      {
        ResetConditionSparkleSprites(menu.conditionSparkleSprites);
        CreateConditionSparkleSprites(menu.conditionSparkleSprites, menu.monPicSpriteId, GetNumConditionMonSparkles());
        return LT_INC_AND_CONTINUE;
      }
      return LT_PAUSE;
  }
  return LT_FINISH;
}

/** 1:1 `static u32 LoopedTask_SlideMonOut(s32 state)` (pokenav_conditions_gfx.c:475-511). */
function LoopedTask_SlideMonOut(state: number): number {
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_CONDITION_GRAPH_MENU_GFX);
  switch (state) {
    case 0:
      LoadNextConditionMenuMonData(CONDITION_LOAD_MON_INFO);
      return LT_INC_AND_CONTINUE;
    case 1:
      LoadNextConditionMenuMonData(CONDITION_LOAD_GRAPH);
      return LT_INC_AND_CONTINUE;
    case 2:
      LoadNextConditionMenuMonData(CONDITION_LOAD_MON_PIC);
      DestroyConditionSparkleSprites(menu.conditionSparkleSprites);
      return LT_INC_AND_CONTINUE;
    case 3:
      if (!ConditionMenu_UpdateMonExit(GetConditionGraphPtr(), menu.monTransitionX))
        return LT_INC_AND_CONTINUE;
      return LT_PAUSE;
    case 4:
      UpdateConditionGraphMenuWindows(0, GetConditionGraphMenuCurrentLoadIndex(), false);
      return LT_INC_AND_CONTINUE;
    case 5:
      UpdateConditionGraphMenuWindows(1, GetConditionGraphMenuCurrentLoadIndex(), false);
      return LT_INC_AND_CONTINUE;
    case 6:
      UpdateConditionGraphMenuWindows(2, GetConditionGraphMenuCurrentLoadIndex(), false);
      return LT_INC_AND_CONTINUE;
    case 7:
      if (UpdateConditionGraphMenuWindows(3, GetConditionGraphMenuCurrentLoadIndex(), false) == 1)
        return LT_INC_AND_CONTINUE;
      return LT_PAUSE;
  }
  return LT_FINISH;
}

/** 1:1 `static u32 LoopedTask_OpenMonMarkingsWindow(s32 state)` (pokenav_conditions_gfx.c:513-530). */
function LoopedTask_OpenMonMarkingsWindow(state: number): number {
  switch (state) {
    case 0:
      OpenMonMarkingsMenu(TryGetMonMarkId(), 176, 32);
      return LT_INC_AND_CONTINUE;
    case 1:
      PrintHelpBarText(HELPBAR_CONDITION_MARKINGS);
      return LT_INC_AND_CONTINUE;
    case 2:
      if (WaitForHelpBar() == 1)
        return LT_PAUSE;
      return LT_INC_AND_CONTINUE;
  }
  return LT_FINISH;
}

/** 1:1 `static u32 LoopedTask_CloseMonMarkingsWindow(s32 state)` (pokenav_conditions_gfx.c:532-549). */
function LoopedTask_CloseMonMarkingsWindow(state: number): number {
  switch (state) {
    case 0:
      FreeMonMarkingsMenu();
      return LT_INC_AND_CONTINUE;
    case 1:
      PrintHelpBarText(HELPBAR_CONDITION_MON_STATUS);
      return LT_INC_AND_CONTINUE;
    case 2:
      if (WaitForHelpBar() == 1)
        return LT_PAUSE;
      return LT_INC_AND_CONTINUE;
  }
  return LT_FINISH;
}

/** 1:1 `static u8 *UnusedPrintNumberString(u8 *dst, u16 num)` (pokenav_conditions_gfx.c:551-557). */
function UnusedPrintNumberString(dst: Uint8Array, num: number): Uint8Array | null {
  let txtPtr = ConvertIntToDecimalStringN(dst, num, STR_CONV_MODE_RIGHT_ALIGN, 4);
  txtPtr = StringCopy(txtPtr, getString('gText_Number2'));
  return txtPtr;
}

/** 1:1 `static bool32 UpdateConditionGraphMenuWindows(u8 mode, u16 bufferIndex, bool8 winMode)` (pokenav_conditions_gfx.c:559-626). */
function UpdateConditionGraphMenuWindows(mode: number, bufferIndex: number, winMode: boolean): boolean {
  const text = new Uint8Array(32);
  let str: any = null;
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_CONDITION_GRAPH_MENU_GFX);
  switch (mode) {
    case 0:
      FillWindowPixelBuffer(menu.nameGenderWindowId, 0);
      if (IsConditionMenuSearchMode() == 1)
        FillWindowPixelBuffer(menu.listIndexWindowId, 0);
      break;
    case 1:
      if (GetConditionGraphCurrentListIndex() != GetMonListCount() - 1 || IsConditionMenuSearchMode() == 1)
      {
        str = GetConditionMonNameText(bufferIndex);
        AddTextPrinterParameterized(menu.nameGenderWindowId, FONT_NORMAL, str, 0, 1, 0, null);
      }
      break;
    case 2:
      if (IsConditionMenuSearchMode() == 1)
      {
        str = GetConditionMonLocationText(bufferIndex);
        AddTextPrinterParameterized(menu.nameGenderWindowId, FONT_NORMAL, str, 0, 17, 0, null);
        text[0] = EXT_CTRL_CODE_BEGIN;
        text[1] = EXT_CTRL_CODE_COLOR_HIGHLIGHT_SHADOW;
        text[2] = TEXT_COLOR_BLUE;
        text[3] = TEXT_COLOR_TRANSPARENT;
        text[4] = TEXT_COLOR_LIGHT_BLUE;
        StringCopy(text[5] /* TRANSPILER-TODO &élément scalaire (out-param ?) */, getString('gText_Number2'));
        AddTextPrinterParameterized(menu.listIndexWindowId, FONT_NORMAL, text, 4, 1, 0, null);
        ConvertIntToDecimalStringN(text[5] /* TRANSPILER-TODO &élément scalaire (out-param ?) */, GetConditionMonDataBuffer(), STR_CONV_MODE_RIGHT_ALIGN, 4);
        AddTextPrinterParameterized(menu.listIndexWindowId, FONT_NORMAL, text, 28, 1, 0, null);
      }
      break;
    case 3:
      switch (menu.windowModeState) {
        case 0:
          if (winMode)
            CopyWindowToVram(menu.nameGenderWindowId, COPYWIN_FULL);
          else
            CopyWindowToVram(menu.nameGenderWindowId, COPYWIN_GFX);
          if (IsConditionMenuSearchMode() == 1)
          {
            menu.windowModeState++;
            return false;
          }
          else
          {
            menu.windowModeState = 0;
            return true;
          }
        case 1:
          if (winMode)
            CopyWindowToVram(menu.listIndexWindowId, COPYWIN_FULL);
          else
            CopyWindowToVram(menu.listIndexWindowId, COPYWIN_GFX);
          menu.windowModeState = 0;
          return true;
      }
  }
  return false;
}

/** 1:1 `static void CopyUnusedConditionWindowsToVram(void)` (pokenav_conditions_gfx.c:628-634). */
function CopyUnusedConditionWindowsToVram(): void {
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_CONDITION_GRAPH_MENU_GFX);
  CopyWindowToVram(menu.unusedWindowId1, COPYWIN_FULL);
  CopyWindowToVram(menu.unusedWindowId2, COPYWIN_FULL);
}

/** 1:1 `static void SpriteCB_PartyPokeball(struct Sprite *sprite)` (pokenav_conditions_gfx.c:636-642). */
function SpriteCB_PartyPokeball(sprite: DecompSprite): void {
  if (sprite.data[0] == GetConditionGraphCurrentListIndex())
    StartSpriteAnim(sprite, CONDITION_ICON_SELECTED);
  else
    StartSpriteAnim(sprite, CONDITION_ICON_UNSELECTED);
}

/** 1:1 `void HighlightCurrentPartyIndexPokeball(struct Sprite *sprite)` (pokenav_conditions_gfx.c:644-650). */
export function HighlightCurrentPartyIndexPokeball(sprite: DecompSprite): void {
  if (GetConditionGraphCurrentListIndex() == GetMonListCount() - 1)
    sprite.oam.paletteNum = IndexOfSpritePaletteTag(TAG_CONDITION_BALL);
  else
    sprite.oam.paletteNum = IndexOfSpritePaletteTag(TAG_CONDITION_CANCEL);
}

/** 1:1 `void MonMarkingsCallback(struct Sprite *sprite)` (pokenav_conditions_gfx.c:652-655). */
export function MonMarkingsCallback(sprite: DecompSprite): void {
  StartSpriteAnim(sprite, TryGetMonMarkId());
}

/** 1:1 `static void CreateMonMarkingsOrPokeballIndicators(void)` (pokenav_conditions_gfx.c:657-742). */
function CreateMonMarkingsOrPokeballIndicators(): void {
  const sprSheets: any[] = []; // TRANSPILER-TODO tableau de struct SpriteSheet non initialisé
  const sprTemplate: any = {}; // TRANSPILER-TODO struct locale struct SpriteTemplate
  const sprPals: any[] = []; // TRANSPILER-TODO tableau de struct SpritePalette non initialisé
  const sprSheet = { data: null as any, size: 0, tag: 0 };
  let sprite: any = null;
  let i = 0;
  let spriteId = 0;
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_CONDITION_GRAPH_MENU_GFX);
  LoadConditionSelectionIcons(sprSheets, sprTemplate, sprPals);
  if (IsConditionMenuSearchMode() == 1)
  {
    // Search Mode, load markings menu
    menu.marksMenu.baseTileTag = TAG_CONDITION_MARKINGS_MENU;
    menu.marksMenu.basePaletteTag = TAG_CONDITION_MARKINGS_MENU;
    InitMonMarkingsMenu(menu.marksMenu);
    BufferMonMarkingsMenuTiles();
    sprite = CreateMonMarkingAllCombosSprite(TAG_CONDITION_MON_MARKINGS, TAG_CONDITION_MON_MARKINGS, sMonMarkings_Pal);
    sprite.oam.priority = 3;
    sprite.x = 192;
    sprite.y = 32;
    sprite.callback = MonMarkingsCallback;
    menu.monMarksSprite = sprite;
    PokenavFillPalette(IndexOfSpritePaletteTag(TAG_CONDITION_MON_MARKINGS), 0);
  }
  else
  {
    // Party Mode, load Pokéball selection icons
    LoadSpriteSheets(sprSheets);
    Pokenav_AllocAndLoadPalettes(sprPals);
    // Add icons for occupied slots
    for (i = 0; i < GetMonListCount() - 1; i++)
    {
      spriteId = CreateSprite(sprTemplate, 226, (i * 20) + 8, 0);
      if (spriteId != MAX_SPRITES)
      {
        menu.partyPokeballSpriteIds[i] = spriteId;
        gSprites[spriteId].data[0] = i;
        gSprites[spriteId].callback = SpriteCB_PartyPokeball;
      }
      else
      {
        menu.partyPokeballSpriteIds[i] = SPRITE_NONE;
      }
    }
    // Add icons for empty slots
    sprTemplate.tileTag = TAG_CONDITION_BALL_PLACEHOLDER;
    sprTemplate.callback = SpriteCallbackDummy;
    for (; i < PARTY_SIZE; i++)
    {
      spriteId = CreateSprite(sprTemplate, 230, (i * 20) + 8, 0);
      if (spriteId != MAX_SPRITES)
      {
        menu.partyPokeballSpriteIds[i] = spriteId;
        gSprites[spriteId].oam.size = 0;
      }
      else
      {
        menu.partyPokeballSpriteIds[i] = SPRITE_NONE;
      }
    }
    // Add cancel icon
    sprTemplate.tileTag = TAG_CONDITION_CANCEL;
    sprTemplate.callback = HighlightCurrentPartyIndexPokeball;
    spriteId = CreateSprite(sprTemplate, 222, (i * 20) + 8, 0);
    if (spriteId != MAX_SPRITES)
    {
      menu.partyPokeballSpriteIds[i] = spriteId;
      gSprites[spriteId].oam.shape = 1;
      gSprites[spriteId].oam.size = 2;
    }
    else
    {
      menu.partyPokeballSpriteIds[i] = SPRITE_NONE;
    }
  }
  LoadConditionSparkle(sprSheet, sprPals[0]);
  LoadSpriteSheet(sprSheet);
  sprPals[1].data = null;
  Pokenav_AllocAndLoadPalettes(sprPals);
}

/** 1:1 `static void FreeConditionMenuGfx(struct Pokenav_ConditionMenuGfx *menu)` (pokenav_conditions_gfx.c:744-774). */
function FreeConditionMenuGfx(menu: Pokenav_ConditionMenuGfx): void {
  let i = 0;
  if (IsConditionMenuSearchMode() == 1)
  {
    DestroySprite(menu.monMarksSprite);
    FreeSpriteTilesByTag(TAG_CONDITION_MARKINGS_MENU);
    FreeSpriteTilesByTag(TAG_CONDITION_MON_MARKINGS);
    FreeSpritePaletteByTag(TAG_CONDITION_MARKINGS_MENU);
    FreeSpritePaletteByTag(TAG_CONDITION_MON_MARKINGS);
  }
  else
  {
    for (i = 0; i < PARTY_SIZE + 1; i++)
      DestroySprite(menu.partyPokeballSpriteIds[i]);
    FreeSpriteTilesByTag(TAG_CONDITION_BALL);
    FreeSpriteTilesByTag(TAG_CONDITION_CANCEL);
    FreeSpriteTilesByTag(TAG_CONDITION_BALL_PLACEHOLDER);
    FreeSpritePaletteByTag(TAG_CONDITION_BALL);
    FreeSpritePaletteByTag(TAG_CONDITION_CANCEL);
  }
  if (menu.monPicSpriteId != SPRITE_NONE)
  {
    DestroySprite(menu.monPicSpriteId);
    FreeSpriteTilesByTag(TAG_CONDITION_MON);
    FreeSpritePaletteByTag(TAG_CONDITION_MON);
  }
}

/** 1:1 `void FreeConditionGraphMenuSubstruct2(void)` (pokenav_conditions_gfx.c:776-796). */
export function FreeConditionGraphMenuSubstruct2(): void {
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_CONDITION_GRAPH_MENU_GFX);
  RemoveWindow(menu.nameGenderWindowId);
  if (IsConditionMenuSearchMode() == 1)
  {
    RemoveWindow(menu.listIndexWindowId);
    RemoveWindow(menu.unusedWindowId1);
    RemoveWindow(menu.unusedWindowId2);
  }
  else
  {
    SetLeftHeaderSpritesInvisibility();
  }
  SetGpuReg(REG_OFFSET_DISPCNT, DISPCNT_OBJ_ON | DISPCNT_BG0_ON | DISPCNT_OBJ_1D_MAP);
  FreeConditionMenuGfx(menu);
  SetExitVBlank();
  FreePokenavSubstruct(POKENAV_SUBSTRUCT_CONDITION_GRAPH_MENU_GFX);
}

/** 1:1 `void MonPicGfxSpriteCallback(struct Sprite *sprite)` (pokenav_conditions_gfx.c:798-802). */
export function MonPicGfxSpriteCallback(sprite: DecompSprite): void {
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_CONDITION_GRAPH_MENU_GFX);
  sprite.x = menu.monTransitionX + 38;
}

/** 1:1 `static void CreateConditionMonPic(u8 id)` (pokenav_conditions_gfx.c:804-840). */
function CreateConditionMonPic(id: number): void {
  const sprTemplate: any = {}; // TRANSPILER-TODO struct locale struct SpriteTemplate
  const sprSheet = { data: null as any, size: 0, tag: 0 };
  const sprPal = { data: null as any, tag: 0 };
  let spriteId = 0;
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_CONDITION_GRAPH_MENU_GFX);
  if (menu.monPicSpriteId == SPRITE_NONE)
  {
    LoadConditionMonPicTemplate(sprSheet, sprTemplate, sprPal);
    sprSheet.data = GetConditionMonPicGfx(id);
    sprPal.data = GetConditionMonPal(id);
    menu.monPalIndex = LoadSpritePalette(sprPal);
    menu.monGfxTileStart = LoadSpriteSheet(sprSheet);
    spriteId = CreateSprite(sprTemplate, 38, 104, 0);
    menu.monPicSpriteId = spriteId;
    if (spriteId == MAX_SPRITES)
    {
      FreeSpriteTilesByTag(TAG_CONDITION_MON);
      FreeSpritePaletteByTag(TAG_CONDITION_MON);
      menu.monPicSpriteId = SPRITE_NONE;
    }
    else
    {
      menu.monPicSpriteId = spriteId;
      gSprites[menu.monPicSpriteId].callback = MonPicGfxSpriteCallback;
      menu.monGfxPtr = VRAM + BG_VRAM_SIZE + (menu.monGfxTileStart * 32);
      menu.monPalIndex = OBJ_PLTT_ID(menu.monPalIndex);
    }
  }
  else
  {
    DmaCopy16Defvars(3, GetConditionMonPicGfx(id), menu.monGfxPtr, MON_PIC_SIZE);
    LoadPalette(GetConditionMonPal(id), menu.monPalIndex, PLTT_SIZE_4BPP);
  }
}

/** 1:1 `static void VBlankCB_PokenavConditionGraph(void)` (pokenav_conditions_gfx.c:842-850). */
function VBlankCB_PokenavConditionGraph(): void {
  let graph = GetConditionGraphPtr();
  LoadOam();
  ProcessSpriteCopyRequests();
  TransferPlttBuffer();
  ConditionGraph_Draw(graph);
  ScanlineEffect_InitHBlankDmaTransfer();
}

/** 1:1 `static void SetExitVBlank(void)` (pokenav_conditions_gfx.c:852-855). */
function SetExitVBlank(): void {
  SetPokenavVBlankCallback();
}

/** 1:1 `static void ToggleGraphData(bool8 showBg)` (pokenav_conditions_gfx.c:857-863). */
function ToggleGraphData(showBg: boolean): void {
  if (showBg)
    ShowBg(2);
  else
    HideBg(2);
}

/** 1:1 `static void DoConditionGraphEnterTransition(void)` (pokenav_conditions_gfx.c:865-873). */
function DoConditionGraphEnterTransition(): void {
  let graph = GetConditionGraphPtr();
  let id = GetConditionGraphMenuCurrentLoadIndex();
  sInitialLoadId = id;
  ConditionGraph_SetNewPositions(graph, graph.savedPositions[CONDITION_GRAPH_LOAD_MAX - 1], graph.savedPositions[id]);
  ConditionGraph_TryUpdate(graph);
}

// Transition the graph back to empty before exiting.

// This is skipped if the player is in party mode and the cursor

// is on Cancel, in which case the graph is already empty.

/** 1:1 `static void DoConditionGraphExitTransition(void)` (pokenav_conditions_gfx.c:878-884). */
function DoConditionGraphExitTransition(): void {
  let graph = GetConditionGraphPtr();
  if (IsConditionMenuSearchMode() || GetConditionGraphCurrentListIndex() != GetMonListCount() - 1)
    ConditionGraph_SetNewPositions(graph, graph.savedPositions[GetConditionGraphMenuCurrentLoadIndex()], graph.savedPositions[CONDITION_GRAPH_LOAD_MAX - 1]);
}

/** 1:1 `u8 GetMonMarkingsData(void)` (pokenav_conditions_gfx.c:886-894). */
export function GetMonMarkingsData(): number {
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_CONDITION_GRAPH_MENU_GFX);
  if (IsConditionMenuSearchMode() == 1)
    return menu.marksMenu.markings;
  else
    return 0;
}
