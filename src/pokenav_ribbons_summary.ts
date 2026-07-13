// @ts-nocheck — transpilé brut (types stricts au câblage fin ; wire-transpiled.cjs)
/**
 * pokenav_ribbons_summary.ts — miroir 1:1 de `D:/Projet 1/decomps/pokeemeraude/src/pokenav_ribbons_summary.c` (transpilé).
 *
 * Généré par scripts/transpile-c.cjs — revue humaine OBLIGATOIRE avant commit :
 * rapport des flags dans audit-reports/transpile/pokenav_ribbons_summary.md.
 * Politique préproc : build vanilla FR (NDEBUG/FRENCH définis, BUGFIX/UBFIX absents).
 */

import { LoadCompressedSpriteSheet, SpriteCallbackDummy } from '../harness/runtime/decomp-globals';
import { ST_OAM_4BPP, ST_OAM_OBJ_NORMAL } from '../harness/runtime/decomp-helpers';
import { CHAR_EXTRA_SYMBOL, CHAR_LV_2, CHAR_SLASH, TEXT_COLOR_DARK_GRAY, TEXT_COLOR_LIGHT_GRAY, TEXT_COLOR_RED } from '../include/constants/characters';
import { ARTIST_RIBBON, BEAUTY_RIBBON_NORMAL, CHAMPION_RIBBON, COOL_RIBBON_NORMAL, COUNTRY_RIBBON, CUTE_RIBBON_NORMAL, EARTH_RIBBON, EFFORT_RIBBON, LAND_RIBBON, MARINE_RIBBON, MON_FEMALE, MON_MALE, NATIONAL_RIBBON, SKY_RIBBON, SMART_RIBBON_NORMAL, TOUGH_RIBBON_NORMAL, VICTORY_RIBBON, WINNING_RIBBON, WORLD_RIBBON } from '../include/constants/pokemon';
import { SE_SELECT } from '../include/constants/songs';
import { A_BUTTON, B_BUTTON, DPAD_DOWN, DPAD_LEFT, DPAD_RIGHT, DPAD_UP } from '../include/gba/io_reg';
import { MON_DATA_NICKNAME, MON_DATA_OT_ID, MON_DATA_PERSONALITY, MON_DATA_RIBBONS, MON_DATA_RIBBON_COUNT, MON_DATA_SPECIES } from '../include/pokemon';
import { ST_OAM_AFFINE_NORMAL, TAG_NONE } from '../include/sprite';
import { STR_CONV_MODE_LEFT_ALIGN, STR_CONV_MODE_RIGHT_ALIGN } from '../include/string_util';
import { FONT_NORMAL, TEXT_SKIP_DRAW } from '../include/text';
import { IsDma3ManagerBusyWithBgCopy } from './battle_bg';
import { JOY_NEW, JOY_REPEAT, PlaySE } from './battle_controllers';
import { DynamicPlaceholderTextUtil_ExpandPlaceholders, DynamicPlaceholderTextUtil_Reset, DynamicPlaceholderTextUtil_SetPlaceholderPtr } from './dynamic_placeholder_text_util';
import { PIXEL_FILL } from './window';
import { GetMonData } from './engine/battle/party-storage';
import { StartSpriteAffineAnim } from './engine/decomp-impls/sprite-engine-impl';
import { gSaveBlock1Ptr } from './engine/save/save-block-state';
import { TOTAL_BOXES_COUNT } from './engine/save/save-blocks';
import { getString } from '../harness/runtime/decomp-strings';
import { GetStringCenterAlignXOffset } from './international_string_util';
import { AddTextPrinterParameterized3 } from './menu';
import { BG_PLTT_ID } from './palette';
import { GetBoxMonGender, GetLevelFromBoxMonExp, GetLevelFromMonExp, GetMonGender, gPlayerParty } from './pokemon';
import { GetBoxedMonPtr } from './pokemon_storage_system';
import { CreateSprite, DestroySprite, FreeSpritePaletteByTag, FreeSpriteTilesByTag, GetSpriteTileStartByTag, IndexOfSpritePaletteTag, PLTT_SIZE_4BPP, gDummySpriteAnimTable, gSprites } from './sprite';
import { ConvertIntToDecimalStringN, StringCopy, StringGet_Nickname, gStringVar1, gStringVar3, gStringVar4 } from './string_util';
import { AddTextPrinterParameterized, encodeOwText } from './text';
import { FreeAndDestroyMonPicSprite, ResetAllPicSprites } from './trainer_pokemon_sprites';
import { AddWindow, COPYWIN_GFX, ChangeBgX, ChangeBgY, CopyBgTilemapBufferToVram, CopyToBgTilemapBuffer, CopyWindowToVram, FillBgTilemapBufferRect_Palette0, FillWindowPixelBuffer, HideBg, PutWindowTilemap, RemoveWindow, ShowBg } from './window';
import type { DecompSprite } from '../harness/runtime/decomp-runtime';
import type { Pokemon } from './engine/battle/party-storage';
import type {  SpriteTemplate } from './sprite';
import type { WindowTemplate } from './window';

// ═══ wire-transpiled (auto) : imports résolus par l'index + sentinelles ═══
import type { OamData } from '../include/gba/types';
import { __wireTodo } from './engine/wire-todo';
import { CreateLoopedTask, IsLoopedTaskActive } from './pokenav_looped_task';
import { AllocSubstruct, FreePokenavSubstruct, GetSubstructPtr } from './pokenav_resources';
// ─── WIRE-TODO : symboles transpilés SANS foyer dans le repo (throw à l'appel) ───
const AFFINEANIMCMD_END: any = __wireTodo('AFFINEANIMCMD_END');
const AFFINEANIMCMD_FRAME: any = __wireTodo('AFFINEANIMCMD_FRAME');
const BgDmaFill: any = __wireTodo('BgDmaFill');
const CopyPaletteIntoBufferUnfaded: any = __wireTodo('CopyPaletteIntoBufferUnfaded');
const CopyToBgTilemapBufferRect: any = __wireTodo('CopyToBgTilemapBufferRect');
const CreateMonPicSprite_HandleDeoxys: any = __wireTodo('CreateMonPicSprite_HandleDeoxys');
const DecompressAndCopyTileDataToVram: any = __wireTodo('DecompressAndCopyTileDataToVram');
const FreeSpriteOamMatrix: any = __wireTodo('FreeSpriteOamMatrix');
const FreeTempTileDataBuffersIfPossible: any = __wireTodo('FreeTempTileDataBuffersIfPossible');
const GetBoxMonData: any = __wireTodo('GetBoxMonData');
import { GetBoxMonDataAt } from './pokemon_storage_system'; // câblé (ex-__wireTodo)
const InitBgTemplates: any = __wireTodo('InitBgTemplates');
const IsPaletteFadeActive: any = __wireTodo('IsPaletteFadeActive');
const PokenavFadeScreen: any = __wireTodo('PokenavFadeScreen');
const PokenavFillPalette: any = __wireTodo('PokenavFillPalette');
const Pokenav_AllocAndLoadPalettes: any = __wireTodo('Pokenav_AllocAndLoadPalettes');
const PrintHelpBarText: any = __wireTodo('PrintHelpBarText');
const SetBgTilemapBuffer: any = __wireTodo('SetBgTilemapBuffer');
const gGiftRibbonDescriptionPointers: any = __wireTodo('gGiftRibbonDescriptionPointers');
const gKeyRepeatContinueDelay: any = __wireTodo('gKeyRepeatContinueDelay');
const gKeyRepeatStartDelay: any = __wireTodo('gKeyRepeatStartDelay');
const gPokenavRibbonsSummaryBg_Gfx: any = __wireTodo('gPokenavRibbonsSummaryBg_Gfx');
const gPokenavRibbonsSummaryBg_Pal: any = __wireTodo('gPokenavRibbonsSummaryBg_Pal');
const gPokenavRibbonsSummaryBg_Tilemap: any = __wireTodo('gPokenavRibbonsSummaryBg_Tilemap');
const gRibbonDescriptionPointers: any = __wireTodo('gRibbonDescriptionPointers');

// ─── constantes décomp inlinées (headers pas encore dans include/) ───
const POKENAV_SUBSTRUCT_RIBBONS_SUMMARY_LIST = 13; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_SUBSTRUCT_MON_LIST = 18; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_RIBBONS_RETURN_TO_MON_LIST = 100014; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const FIRST_GIFT_RIBBON = 25; // 1:1 include/constants/pokemon.h:130 (à consolider dans include/)
const POKENAV_SUBSTRUCT_RIBBONS_SUMMARY_MENU = 14; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const LT_INC_AND_PAUSE = 0; // 1:1 include/pokenav.h:58 (à consolider dans include/)
const LT_PAUSE = 2; // 1:1 include/pokenav.h:60 (à consolider dans include/)
const LT_INC_AND_CONTINUE = 1; // 1:1 include/pokenav.h:59 (à consolider dans include/)
const HELPBAR_RIBBONS_LIST = 10; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const BG_COORD_SET = 0; // 1:1 include/bg.h:0 (à consolider dans include/)
const POKENAV_FADE_FROM_BLACK = 1; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const LT_FINISH = 4; // 1:1 include/pokenav.h:62 (à consolider dans include/)
const POKENAV_FADE_TO_BLACK = 0; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const HELPBAR_RIBBONS_CHECK = 11; // 1:1 include/pokenav.h:0 (à consolider dans include/)

// enum pokenav_ribbons_summary.c:17
const RIBBONS_SUMMARY_FUNC_NONE = 0;
const RIBBONS_SUMMARY_FUNC_SWITCH_MONS = 1;
const RIBBONS_SUMMARY_FUNC_SELECT_RIBBON = 2;
const RIBBONS_SUMMARY_FUNC_EXPANDED_CURSOR_MOVE = 3;
const RIBBONS_SUMMARY_FUNC_EXPANDED_CANCEL = 4;
const RIBBONS_SUMMARY_FUNC_EXIT = 5;

const GFXTAG_RIBBON_ICONS_BIG = 9; // 1:1 pokenav_ribbons_summary.c:27

const PALTAG_RIBBON_ICONS_1 = 15; // 1:1 pokenav_ribbons_summary.c:29

const PALTAG_RIBBON_ICONS_2 = 16; // 1:1 pokenav_ribbons_summary.c:30

const PALTAG_RIBBON_ICONS_3 = 17; // 1:1 pokenav_ribbons_summary.c:31

const PALTAG_RIBBON_ICONS_4 = 18; // 1:1 pokenav_ribbons_summary.c:32

const PALTAG_RIBBON_ICONS_5 = 19; // 1:1 pokenav_ribbons_summary.c:33

const RIBBONS_PER_ROW = 9; // 1:1 pokenav_ribbons_summary.c:35

const GIFT_RIBBON_ROW = (1 + (FIRST_GIFT_RIBBON / RIBBONS_PER_ROW)) // Gift ribbons start on a new row after the normal ribbons.; // 1:1 pokenav_ribbons_summary.c:36

const GIFT_RIBBON_START_POS = (RIBBONS_PER_ROW * GIFT_RIBBON_ROW); // 1:1 pokenav_ribbons_summary.c:37

const MON_SPRITE_X_ON = 40; // 1:1 pokenav_ribbons_summary.c:39

const MON_SPRITE_X_OFF = -32; // 1:1 pokenav_ribbons_summary.c:40

const MON_SPRITE_Y = 104; // 1:1 pokenav_ribbons_summary.c:41

/** 1:1 `struct Pokenav_RibbonsSummaryList` (pokenav_ribbons_summary.c:43). */
interface Pokenav_RibbonsSummaryList {
  unused1: Uint8Array;
  monList: any;
  selectedPos: number;
  normalRibbonLastRowStart: number;
  numNormalRibbons: number;
  numGiftRibbons: number;
  ribbonIds: Uint32Array;
  giftRibbonIds: Uint32Array;
  unused2: number;
  callback: ((...args: any[]) => any) | null;
}

/** 1:1 `struct Pokenav_RibbonsSummaryMenu` (pokenav_ribbons_summary.c:57). */
interface Pokenav_RibbonsSummaryMenu {
  callback: ((...args: any[]) => any) | null;
  loopedTaskId: number;
  nameWindowId: number;
  ribbonCountWindowId: number;
  listIdxWindowId: number;
  unusedWindowId: number;
  monSpriteId: number;
  bigRibbonSprite: DecompSprite | null;
  unused: number;
  tilemapBuffers: Uint8Array;
}

// Used for the initial drawing of the ribbons

/** 1:1 (pokenav_ribbons_summary.c:72) */
let sRibbonDraw_Total = 0;

/** 1:1 (pokenav_ribbons_summary.c:73) */
let sRibbonDraw_Current = 0;

/** 1:1 (pokenav_ribbons_summary.c:123) */
export const sRibbonData = [
  [
    1,
    1,
    CHAMPION_RIBBON,
    false,
  ],
  [
    3,
    4,
    COOL_RIBBON_NORMAL,
    false,
  ],
  [
    3,
    4,
    BEAUTY_RIBBON_NORMAL,
    false,
  ],
  [
    3,
    4,
    CUTE_RIBBON_NORMAL,
    false,
  ],
  [
    3,
    4,
    SMART_RIBBON_NORMAL,
    false,
  ],
  [
    3,
    4,
    TOUGH_RIBBON_NORMAL,
    false,
  ],
  [
    1,
    1,
    WINNING_RIBBON,
    false,
  ],
  [
    1,
    1,
    VICTORY_RIBBON,
    false,
  ],
  [
    1,
    1,
    ARTIST_RIBBON,
    false,
  ],
  [
    1,
    1,
    EFFORT_RIBBON,
    false,
  ],
  [
    1,
    1,
    MARINE_RIBBON,
    true,
  ],
  [
    1,
    1,
    LAND_RIBBON,
    true,
  ],
  [
    1,
    1,
    SKY_RIBBON,
    true,
  ],
  [
    1,
    1,
    COUNTRY_RIBBON,
    true,
  ],
  [
    1,
    1,
    NATIONAL_RIBBON,
    true,
  ],
  [
    1,
    1,
    EARTH_RIBBON,
    true,
  ],
  [
    1,
    1,
    WORLD_RIBBON,
    true,
  ],
];

// TRANSPILER-TODO INCGFX : sRibbonIcons1_Pal ← graphics/pokenav/ribbons/icons1.pal (pipeline assets : loadTileBin/loadGbaPal('/decomp/em/…'))
let sRibbonIcons1_Pal: any = null;

// TRANSPILER-TODO INCGFX : sRibbonIcons2_Pal ← graphics/pokenav/ribbons/icons2.pal (pipeline assets : loadTileBin/loadGbaPal('/decomp/em/…'))
let sRibbonIcons2_Pal: any = null;

// TRANSPILER-TODO INCGFX : sRibbonIcons3_Pal ← graphics/pokenav/ribbons/icons3.pal (pipeline assets : loadTileBin/loadGbaPal('/decomp/em/…'))
let sRibbonIcons3_Pal: any = null;

// TRANSPILER-TODO INCGFX : sRibbonIcons4_Pal ← graphics/pokenav/ribbons/icons4.pal (pipeline assets : loadTileBin/loadGbaPal('/decomp/em/…'))
let sRibbonIcons4_Pal: any = null;

// TRANSPILER-TODO INCGFX : sRibbonIcons5_Pal ← graphics/pokenav/ribbons/icons5.pal (pipeline assets : loadTileBin/loadGbaPal('/decomp/em/…'))
let sRibbonIcons5_Pal: any = null;

// TRANSPILER-TODO INCGFX : sMonInfo_Pal ← graphics/pokenav/ribbons/mon_info.pal (pipeline assets : loadTileBin/loadGbaPal('/decomp/em/…'))
let sMonInfo_Pal: any = null;

// palette for Pokémon's name/gender/level text

// TRANSPILER-TODO INCGFX : sRibbonIconsSmall_Gfx ← graphics/pokenav/ribbons/icons.png (pipeline assets : loadTileBin/loadGbaPal('/decomp/em/…'))
let sRibbonIconsSmall_Gfx: any = null;

// TRANSPILER-TODO INCGFX : sRibbonIconsBig_Gfx ← graphics/pokenav/ribbons/icons_big.png (pipeline assets : loadTileBin/loadGbaPal('/decomp/em/…'))
let sRibbonIconsBig_Gfx: any = null;

/** 1:1 (pokenav_ribbons_summary.c:156) */
const sBgTemplates = [
  {
    bg: 1, /* :2 */
    charBaseIndex: 3, /* :2 */
    mapBaseIndex: 0x07, /* :5 */
    screenSize: 0, /* :2 */
    paletteMode: 0, /* :1 */
    priority: 1, /* :2 */
    baseTile: 0, /* :10 */
  },
  {
    bg: 2, /* :2 */
    charBaseIndex: 1, /* :2 */
    mapBaseIndex: 0x06, /* :5 */
    screenSize: 0, /* :2 */
    paletteMode: 0, /* :1 */
    priority: 2, /* :2 */
    baseTile: 0, /* :10 */
  },
];

/** 1:1 (pokenav_ribbons_summary.c:178) */
const sRibbonsSummaryMenuLoopTaskFuncs = [
  null, // [RIBBONS_SUMMARY_FUNC_NONE]
  LoopedTask_SwitchRibbonsSummaryMon, // [RIBBONS_SUMMARY_FUNC_SWITCH_MONS]
  LoopedTask_ExpandSelectedRibbon, // [RIBBONS_SUMMARY_FUNC_SELECT_RIBBON]
  LoopedTask_MoveRibbonsCursorExpanded, // [RIBBONS_SUMMARY_FUNC_EXPANDED_CURSOR_MOVE]
  LoopedTask_ShrinkExpandedRibbon, // [RIBBONS_SUMMARY_FUNC_EXPANDED_CANCEL]
  LoopedTask_ExitRibbonsSummaryMenu, // [RIBBONS_SUMMARY_FUNC_EXIT]
];

/** 1:1 `bool32 PokenavCallback_Init_RibbonsSummaryMenu(void)` (pokenav_ribbons_summary.c:188-203). */
export function PokenavCallback_Init_RibbonsSummaryMenu(): boolean {
  let list = AllocSubstruct(POKENAV_SUBSTRUCT_RIBBONS_SUMMARY_LIST, 0 /* TRANSPILER-TODO sizeof(struct Pokenav_RibbonsSummaryList) */);
  if (list == null)
    return false;
  list.monList = GetSubstructPtr(POKENAV_SUBSTRUCT_MON_LIST);
  if (list.monList == null)
    return false;
  GetMonRibbons(list);
  list.callback = RibbonsSummaryHandleInput;
  gKeyRepeatContinueDelay = 3;
  gKeyRepeatStartDelay = 10;
  return true;
}

/** 1:1 `u32 GetRibbonsSummaryMenuCallback(void)` (pokenav_ribbons_summary.c:205-209). */
export function GetRibbonsSummaryMenuCallback(): number {
  let list = GetSubstructPtr(POKENAV_SUBSTRUCT_RIBBONS_SUMMARY_LIST);
  return list.callback(list);
}

/** 1:1 `void FreeRibbonsSummaryScreen1(void)` (pokenav_ribbons_summary.c:211-214). */
export function FreeRibbonsSummaryScreen1(): void {
  FreePokenavSubstruct(POKENAV_SUBSTRUCT_RIBBONS_SUMMARY_LIST);
}

// Handles input when a specific ribbon is not currently selected

/** 1:1 `static u32 RibbonsSummaryHandleInput(struct Pokenav_RibbonsSummaryList *list)` (pokenav_ribbons_summary.c:217-248). */
function RibbonsSummaryHandleInput(list: Pokenav_RibbonsSummaryList): number {
  // Handle Up/Down movement to select a new Pokémon to show ribbons for
  if (JOY_REPEAT(DPAD_UP) && list.monList.currIndex != 0)
  {
    list.monList.currIndex--;
    list.selectedPos = 0;
    GetMonRibbons(list);
    return RIBBONS_SUMMARY_FUNC_SWITCH_MONS;
  }
  if (JOY_REPEAT(DPAD_DOWN) && list.monList.currIndex < list.monList.listCount - 1)
  {
    list.monList.currIndex++;
    list.selectedPos = 0;
    GetMonRibbons(list);
    return RIBBONS_SUMMARY_FUNC_SWITCH_MONS;
  }
  if (JOY_NEW(A_BUTTON))
  {
    // Enter ribbon selection
    list.callback = HandleExpandedRibbonInput;
    return RIBBONS_SUMMARY_FUNC_SELECT_RIBBON;
  }
  if (JOY_NEW(B_BUTTON))
  {
    // Exit ribbon summary menu
    list.callback = ReturnToRibbonsListFromSummary;
    return RIBBONS_SUMMARY_FUNC_EXIT;
  }
  return RIBBONS_SUMMARY_FUNC_NONE;
}

// Handles input when a ribbon is selected

/** 1:1 `static u32 HandleExpandedRibbonInput(struct Pokenav_RibbonsSummaryList *list)` (pokenav_ribbons_summary.c:251-270). */
function HandleExpandedRibbonInput(list: Pokenav_RibbonsSummaryList): number {
  // Handle movement while a ribbon is selected
  if (JOY_REPEAT(DPAD_UP) && TrySelectRibbonUp(list))
    return RIBBONS_SUMMARY_FUNC_EXPANDED_CURSOR_MOVE;
  if (JOY_REPEAT(DPAD_DOWN) && TrySelectRibbonDown(list))
    return RIBBONS_SUMMARY_FUNC_EXPANDED_CURSOR_MOVE;
  if (JOY_REPEAT(DPAD_LEFT) && TrySelectRibbonLeft(list))
    return RIBBONS_SUMMARY_FUNC_EXPANDED_CURSOR_MOVE;
  if (JOY_REPEAT(DPAD_RIGHT) && TrySelectRibbonRight(list))
    return RIBBONS_SUMMARY_FUNC_EXPANDED_CURSOR_MOVE;
  if (JOY_NEW(B_BUTTON))
  {
    // Exit ribbon selection
    list.callback = RibbonsSummaryHandleInput;
    return RIBBONS_SUMMARY_FUNC_EXPANDED_CANCEL;
  }
  return RIBBONS_SUMMARY_FUNC_NONE;
}

/** 1:1 `static u32 ReturnToRibbonsListFromSummary(struct Pokenav_RibbonsSummaryList *list)` (pokenav_ribbons_summary.c:272-275). */
function ReturnToRibbonsListFromSummary(list: Pokenav_RibbonsSummaryList): number {
  return POKENAV_RIBBONS_RETURN_TO_MON_LIST;
}

/** 1:1 `static bool32 TrySelectRibbonUp(struct Pokenav_RibbonsSummaryList *list)` (pokenav_ribbons_summary.c:277-300). */
function TrySelectRibbonUp(list: Pokenav_RibbonsSummaryList): boolean {
  if (list.selectedPos < FIRST_GIFT_RIBBON)
  {
    // In normal ribbons, try to move up a row
    if (list.selectedPos < RIBBONS_PER_ROW)
      return false;
    list.selectedPos -= RIBBONS_PER_ROW;
    return true;
  }
  if (list.numNormalRibbons != 0)
  {
    // In gift ribbons, try to move up into normal ribbons
    // If there's > 1 row of gift ribbons (not normally possible)
    // it's impossible to move up between them
    let ribbonPos = list.selectedPos - GIFT_RIBBON_START_POS;
    list.selectedPos = ribbonPos + list.normalRibbonLastRowStart;
    if (list.selectedPos >= list.numNormalRibbons)
      list.selectedPos = list.numNormalRibbons - 1;
    return true;
  }
  return false;
}

/** 1:1 `static bool32 TrySelectRibbonDown(struct Pokenav_RibbonsSummaryList *list)` (pokenav_ribbons_summary.c:302-325). */
function TrySelectRibbonDown(list: Pokenav_RibbonsSummaryList): boolean {
  if (list.selectedPos >= FIRST_GIFT_RIBBON)
    return false;
  if (list.selectedPos < list.normalRibbonLastRowStart)
  {
    // Not in last row of normal ribbons, advance to next row
    list.selectedPos += RIBBONS_PER_ROW;
    if (list.selectedPos >= list.numNormalRibbons)
      list.selectedPos = list.numNormalRibbons - 1;
    return true;
  }
  if (list.numGiftRibbons != 0)
  {
    // In/beyond last of row of normal ribbons and gift ribbons present, move down to gift ribbon row
    let ribbonPos = list.selectedPos - list.normalRibbonLastRowStart;
    if (ribbonPos >= list.numGiftRibbons)
      ribbonPos = list.numGiftRibbons - 1;
    list.selectedPos = ribbonPos + GIFT_RIBBON_START_POS;
    return true;
  }
  return false;
}

/** 1:1 `static bool32 TrySelectRibbonLeft(struct Pokenav_RibbonsSummaryList *list)` (pokenav_ribbons_summary.c:327-337). */
function TrySelectRibbonLeft(list: Pokenav_RibbonsSummaryList): boolean {
  let column = list.selectedPos % RIBBONS_PER_ROW;
  if (column != 0)
  {
    list.selectedPos--;
    return true;
  }
  return false;
}

/** 1:1 `static bool32 TrySelectRibbonRight(struct Pokenav_RibbonsSummaryList *list)` (pokenav_ribbons_summary.c:339-365). */
function TrySelectRibbonRight(list: Pokenav_RibbonsSummaryList): boolean {
  let column = list.selectedPos % RIBBONS_PER_ROW;
  if (column >= RIBBONS_PER_ROW - 1)
    return false;
  if (list.selectedPos < GIFT_RIBBON_START_POS)
  {
    // Move right in normal ribbon row
    if (list.selectedPos < list.numNormalRibbons - 1)
    {
      list.selectedPos++;
      return true;
    }
  }
  else
  {
    // Move right in gift ribbon row
    if (column < list.numGiftRibbons - 1)
    {
      list.selectedPos++;
      return true;
    }
  }
  return false;
}

/** 1:1 `static u32 GetRibbonsSummaryCurrentIndex(void)` (pokenav_ribbons_summary.c:367-371). */
function GetRibbonsSummaryCurrentIndex(): number {
  let list = GetSubstructPtr(POKENAV_SUBSTRUCT_RIBBONS_SUMMARY_LIST);
  return list.monList.currIndex;
}

/** 1:1 `static u32 GetRibbonsSummaryMonListCount(void)` (pokenav_ribbons_summary.c:373-377). */
function GetRibbonsSummaryMonListCount(): number {
  let list = GetSubstructPtr(POKENAV_SUBSTRUCT_RIBBONS_SUMMARY_LIST);
  return list.monList.listCount;
}

/** 1:1 `static void GetMonNicknameLevelGender(u8 *nick, u8 *level, u8 *gender)` (pokenav_ribbons_summary.c:379-402). */
function GetMonNicknameLevelGender(nick: Uint8Array, level: { v: number }, gender: { v: number }): void {
  let list = GetSubstructPtr(POKENAV_SUBSTRUCT_RIBBONS_SUMMARY_LIST);
  let mons = list.monList;
  let monInfo = mons.monData[mons.currIndex] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
  if (monInfo.boxId == TOTAL_BOXES_COUNT)
  {
    // Get info for party mon
    let mon = gPlayerParty[monInfo.monId];
    GetMonData(mon, MON_DATA_NICKNAME, nick);
    level.v = GetLevelFromMonExp(mon);
    gender.v = GetMonGender(mon);
  }
  else
  {
    // Get info for PC box mon
    let boxMon = GetBoxedMonPtr(monInfo.boxId, monInfo.monId);
    gender.v = GetBoxMonGender(boxMon);
    level.v = GetLevelFromBoxMonExp(boxMon);
    GetBoxMonData(boxMon, MON_DATA_NICKNAME, nick);
  }
  StringGet_Nickname(nick);
}

/** 1:1 `static void GetMonSpeciesPersonalityOtId(u16 *species, u32 *personality, u32 *otId)` (pokenav_ribbons_summary.c:404-426). */
function GetMonSpeciesPersonalityOtId(species: { v: number }, personality: { v: number }, otId: { v: number }): void {
  let list = GetSubstructPtr(POKENAV_SUBSTRUCT_RIBBONS_SUMMARY_LIST);
  let mons = list.monList;
  let monInfo = mons.monData[mons.currIndex] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
  if (monInfo.boxId == TOTAL_BOXES_COUNT)
  {
    // Get info for party mon
    let mon = gPlayerParty[monInfo.monId];
    species.v = GetMonData(mon, MON_DATA_SPECIES);
    personality.v = GetMonData(mon, MON_DATA_PERSONALITY);
    otId.v = GetMonData(mon, MON_DATA_OT_ID);
  }
  else
  {
    // Get info for PC box mon
    let boxMon = GetBoxedMonPtr(monInfo.boxId, monInfo.monId);
    species.v = GetBoxMonData(boxMon, MON_DATA_SPECIES);
    personality.v = GetBoxMonData(boxMon, MON_DATA_PERSONALITY);
    otId.v = GetBoxMonData(boxMon, MON_DATA_OT_ID);
  }
}

/** 1:1 `static u32 GetCurrMonRibbonCount(void)` (pokenav_ribbons_summary.c:428-438). */
function GetCurrMonRibbonCount(): number {
  let list = GetSubstructPtr(POKENAV_SUBSTRUCT_RIBBONS_SUMMARY_LIST);
  let mons = list.monList;
  let monInfo = mons.monData[mons.currIndex] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
  if (monInfo.boxId == TOTAL_BOXES_COUNT)
    return GetMonData(gPlayerParty[monInfo.monId], MON_DATA_RIBBON_COUNT);
  else
    return GetBoxMonDataAt(monInfo.boxId, monInfo.monId, MON_DATA_RIBBON_COUNT);
}

/** 1:1 `static void GetMonRibbons(struct Pokenav_RibbonsSummaryList *list)` (pokenav_ribbons_summary.c:440-483). */
function GetMonRibbons(list: Pokenav_RibbonsSummaryList): void {
  let ribbonFlags = 0;
  let i = 0;
  let j = 0;
  let mons = list.monList;
  let monInfo = mons.monData[mons.currIndex] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
  if (monInfo.boxId == TOTAL_BOXES_COUNT)
    ribbonFlags = GetMonData(gPlayerParty[monInfo.monId], MON_DATA_RIBBONS);
  else
    ribbonFlags = GetBoxMonDataAt(monInfo.boxId, monInfo.monId, MON_DATA_RIBBONS);
  list.numNormalRibbons = 0;
  list.numGiftRibbons = 0;
  for (i = 0; i < sRibbonData.length; i++)
  {
    // For all non-contest ribbons, numRibbons will be 1 if they have it, 0 if they don't
    // For contest ribbons, numRibbons will be 0-4
    let numRibbons = ((1 << sRibbonData[i].numBits) - 1) & ribbonFlags;
    if (!sRibbonData[i].isGiftRibbon)
    {
      for (j = 0; j < numRibbons; j++)
        list.ribbonIds[list.numNormalRibbons++] = sRibbonData[i].ribbonId + j;
    }
    else
    {
      for (j = 0; j < numRibbons; j++)
        list.giftRibbonIds[list.numGiftRibbons++] = sRibbonData[i].ribbonId + j;
    }
    ribbonFlags >>= sRibbonData[i].numBits;
  }
  if (list.numNormalRibbons != 0)
  {
    list.normalRibbonLastRowStart = (Math.trunc((list.numNormalRibbons - 1) / RIBBONS_PER_ROW)) * RIBBONS_PER_ROW;
    list.selectedPos = 0;
  }
  else
  {
    // There are no normal ribbons, move cursor to first gift ribbon
    list.normalRibbonLastRowStart = 0;
    list.selectedPos = GIFT_RIBBON_START_POS;
  }
}

/** 1:1 `static u32 *GetNormalRibbonIds(u32 *size)` (pokenav_ribbons_summary.c:485-490). */
function GetNormalRibbonIds(size: { v: number }): Uint32Array | null {
  let list = GetSubstructPtr(POKENAV_SUBSTRUCT_RIBBONS_SUMMARY_LIST);
  size.v = list.numNormalRibbons;
  return list.ribbonIds;
}

/** 1:1 `static u32 *GetGiftRibbonIds(u32 *size)` (pokenav_ribbons_summary.c:492-497). */
function GetGiftRibbonIds(size: { v: number }): Uint32Array | null {
  let list = GetSubstructPtr(POKENAV_SUBSTRUCT_RIBBONS_SUMMARY_LIST);
  size.v = list.numGiftRibbons;
  return list.giftRibbonIds;
}

/** 1:1 `static u16 GetSelectedPosition(void)` (pokenav_ribbons_summary.c:499-503). */
function GetSelectedPosition(): number {
  let list = GetSubstructPtr(POKENAV_SUBSTRUCT_RIBBONS_SUMMARY_LIST);
  return list.selectedPos;
}

/** 1:1 `static u32 GetRibbonId(void)` (pokenav_ribbons_summary.c:505-513). */
function GetRibbonId(): number {
  let list = GetSubstructPtr(POKENAV_SUBSTRUCT_RIBBONS_SUMMARY_LIST);
  let ribbonPos = list.selectedPos;
  if (ribbonPos < FIRST_GIFT_RIBBON)
    return list.ribbonIds[ribbonPos];
  else
    return list.giftRibbonIds[ribbonPos - GIFT_RIBBON_START_POS];
}

/** 1:1 `bool32 OpenRibbonsSummaryMenu(void)` (pokenav_ribbons_summary.c:515-524). */
export function OpenRibbonsSummaryMenu(): boolean {
  let menu = AllocSubstruct(POKENAV_SUBSTRUCT_RIBBONS_SUMMARY_MENU, 0 /* TRANSPILER-TODO sizeof(struct Pokenav_RibbonsSummaryMenu) */);
  if (menu == null)
    return false;
  menu.loopedTaskId = CreateLoopedTask(LoopedTask_OpenRibbonsSummaryMenu, 1);
  menu.callback = GetCurrentLoopedTaskActive;
  return true;
}

/** 1:1 `void CreateRibbonsSummaryLoopedTask(s32 id)` (pokenav_ribbons_summary.c:526-531). */
export function CreateRibbonsSummaryLoopedTask(id: number): void {
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_RIBBONS_SUMMARY_MENU);
  menu.loopedTaskId = CreateLoopedTask(sRibbonsSummaryMenuLoopTaskFuncs[id], 1);
  menu.callback = GetCurrentLoopedTaskActive;
}

/** 1:1 `u32 IsRibbonsSummaryLoopedTaskActive(void)` (pokenav_ribbons_summary.c:533-537). */
export function IsRibbonsSummaryLoopedTaskActive(): number {
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_RIBBONS_SUMMARY_MENU);
  return menu.callback();
}

/** 1:1 `void FreeRibbonsSummaryScreen2(void)` (pokenav_ribbons_summary.c:539-558). */
export function FreeRibbonsSummaryScreen2(): void {
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_RIBBONS_SUMMARY_MENU);
  RemoveWindow(menu.ribbonCountWindowId);
  RemoveWindow(menu.nameWindowId);
  RemoveWindow(menu.listIdxWindowId);
  RemoveWindow(menu.unusedWindowId);
  // Removing window, but window id is never set
  DestroyRibbonsMonFrontPic(menu);
  FreeSpriteTilesByTag(GFXTAG_RIBBON_ICONS_BIG);
  FreeSpritePaletteByTag(PALTAG_RIBBON_ICONS_1);
  FreeSpritePaletteByTag(PALTAG_RIBBON_ICONS_2);
  FreeSpritePaletteByTag(PALTAG_RIBBON_ICONS_3);
  FreeSpritePaletteByTag(PALTAG_RIBBON_ICONS_4);
  FreeSpritePaletteByTag(PALTAG_RIBBON_ICONS_5);
  FreeSpriteOamMatrix(menu.bigRibbonSprite);
  DestroySprite(menu.bigRibbonSprite);
  FreePokenavSubstruct(POKENAV_SUBSTRUCT_RIBBONS_SUMMARY_MENU);
}

/** 1:1 `static bool32 GetCurrentLoopedTaskActive(void)` (pokenav_ribbons_summary.c:560-564). */
function GetCurrentLoopedTaskActive(): boolean {
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_RIBBONS_SUMMARY_MENU);
  return IsLoopedTaskActive(menu.loopedTaskId);
}

/** 1:1 `static u32 LoopedTask_OpenRibbonsSummaryMenu(s32 state)` (pokenav_ribbons_summary.c:566-651). */
function LoopedTask_OpenRibbonsSummaryMenu(state: number): number {
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_RIBBONS_SUMMARY_MENU);
  switch (state) {
    case 0:
      InitBgTemplates(sBgTemplates, sBgTemplates.length);
      DecompressAndCopyTileDataToVram(2, gPokenavRibbonsSummaryBg_Gfx, 0, 0, 0);
      SetBgTilemapBuffer(2, menu.tilemapBuffers[0]);
      CopyToBgTilemapBuffer(2, gPokenavRibbonsSummaryBg_Tilemap, 0, 0);
      CopyPaletteIntoBufferUnfaded(gPokenavRibbonsSummaryBg_Pal, BG_PLTT_ID(1), PLTT_SIZE_4BPP);
      CopyBgTilemapBufferToVram(2);
      return LT_INC_AND_PAUSE;
    case 1:
      if (!FreeTempTileDataBuffersIfPossible())
      {
        BgDmaFill(1, 0, 0, 1);
        DecompressAndCopyTileDataToVram(1, sRibbonIconsSmall_Gfx, 0, 1, 0);
        SetBgTilemapBuffer(1, menu.tilemapBuffers[1]);
        FillBgTilemapBufferRect_Palette0(1, 0, 0, 0, 32, 20);
        CopyPaletteIntoBufferUnfaded(sRibbonIcons1_Pal, BG_PLTT_ID(2), 5 * PLTT_SIZE_4BPP);
        CopyPaletteIntoBufferUnfaded(sMonInfo_Pal, BG_PLTT_ID(10), sMonInfo_Pal.length /* TRANSPILER-TODO sizeof */);
        CopyBgTilemapBufferToVram(1);
        return LT_INC_AND_PAUSE;
      }
      return LT_PAUSE;
    case 2:
      if (!FreeTempTileDataBuffersIfPossible())
      {
        AddRibbonCountWindow(menu);
        return LT_INC_AND_PAUSE;
      }
      return LT_PAUSE;
    case 3:
      if (!FreeTempTileDataBuffersIfPossible())
      {
        AddRibbonSummaryMonNameWindow(menu);
        return LT_INC_AND_PAUSE;
      }
      return LT_PAUSE;
    case 4:
      if (!FreeTempTileDataBuffersIfPossible())
      {
        AddRibbonListIndexWindow(menu);
        return LT_INC_AND_PAUSE;
      }
      return LT_PAUSE;
    case 5:
      if (!IsDma3ManagerBusyWithBgCopy())
      {
        CopyBgTilemapBufferToVram(2);
        return LT_INC_AND_PAUSE;
      }
      return LT_PAUSE;
    case 6:
      if (!IsDma3ManagerBusyWithBgCopy())
      {
        ResetSpritesAndDrawMonFrontPic(menu);
        return LT_INC_AND_CONTINUE;
      }
      return LT_PAUSE;
    case 7:
      DrawAllRibbonsSmall(menu);
      PrintHelpBarText(HELPBAR_RIBBONS_LIST);
      return LT_INC_AND_PAUSE;
    case 8:
      if (!IsDma3ManagerBusyWithBgCopy())
      {
        CreateBigRibbonSprite(menu);
        ChangeBgX(1, 0, BG_COORD_SET);
        ChangeBgY(1, 0, BG_COORD_SET);
        ChangeBgX(2, 0, BG_COORD_SET);
        ChangeBgY(2, 0, BG_COORD_SET);
        ShowBg(1);
        ShowBg(2);
        HideBg(3);
        PokenavFadeScreen(POKENAV_FADE_FROM_BLACK);
        return LT_INC_AND_PAUSE;
      }
      return LT_PAUSE;
    case 9:
      if (IsPaletteFadeActive())
        return LT_PAUSE;
  }
  return LT_FINISH;
}

/** 1:1 `static u32 LoopedTask_ExitRibbonsSummaryMenu(s32 state)` (pokenav_ribbons_summary.c:653-667). */
function LoopedTask_ExitRibbonsSummaryMenu(state: number): number {
  switch (state) {
    case 0:
      PlaySE(SE_SELECT);
      PokenavFadeScreen(POKENAV_FADE_TO_BLACK);
      return LT_INC_AND_PAUSE;
    case 1:
      if (IsPaletteFadeActive())
        return LT_PAUSE;
      return LT_FINISH;
  }
  return LT_FINISH;
}

/** 1:1 `static u32 LoopedTask_SwitchRibbonsSummaryMon(s32 state)` (pokenav_ribbons_summary.c:669-706). */
function LoopedTask_SwitchRibbonsSummaryMon(state: number): number {
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_RIBBONS_SUMMARY_MENU);
  switch (state) {
    case 0:
      PlaySE(SE_SELECT);
      SlideMonSpriteOff(menu);
      return LT_INC_AND_PAUSE;
    case 1:
      if (!IsMonSpriteAnimating(menu))
      {
        PrintRibbbonsSummaryMonInfo(menu);
        return LT_INC_AND_CONTINUE;
      }
      return LT_PAUSE;
    case 2:
      DrawAllRibbonsSmall(menu);
      return LT_INC_AND_CONTINUE;
    case 3:
      PrintRibbonsMonListIndex(menu);
      return LT_INC_AND_CONTINUE;
    case 4:
      PrintCurrentMonRibbonCount(menu);
      return LT_INC_AND_CONTINUE;
    case 5:
      if (!IsDma3ManagerBusyWithBgCopy())
      {
        SlideMonSpriteOn(menu);
        return LT_INC_AND_PAUSE;
      }
      return LT_PAUSE;
    case 6:
      if (IsMonSpriteAnimating(menu))
        return LT_PAUSE;
  }
  return LT_FINISH;
}

/** 1:1 `static u32 LoopedTask_ExpandSelectedRibbon(s32 state)` (pokenav_ribbons_summary.c:708-730). */
function LoopedTask_ExpandSelectedRibbon(state: number): number {
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_RIBBONS_SUMMARY_MENU);
  switch (state) {
    case 0:
      PlaySE(SE_SELECT);
      UpdateAndZoomInSelectedRibbon(menu);
      return LT_INC_AND_PAUSE;
    case 1:
      if (!IsRibbonAnimating(menu))
      {
        PrintRibbonNameAndDescription(menu);
        PrintHelpBarText(HELPBAR_RIBBONS_CHECK);
        return LT_INC_AND_PAUSE;
      }
      return LT_PAUSE;
    case 2:
      if (IsDma3ManagerBusyWithBgCopy())
        return LT_PAUSE;
  }
  return LT_FINISH;
}

/** 1:1 `static u32 LoopedTask_MoveRibbonsCursorExpanded(s32 state)` (pokenav_ribbons_summary.c:732-760). */
function LoopedTask_MoveRibbonsCursorExpanded(state: number): number {
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_RIBBONS_SUMMARY_MENU);
  switch (state) {
    case 0:
      PlaySE(SE_SELECT);
      ZoomOutSelectedRibbon(menu);
      return LT_INC_AND_PAUSE;
    case 1:
      if (!IsRibbonAnimating(menu))
      {
        UpdateAndZoomInSelectedRibbon(menu);
        return LT_INC_AND_PAUSE;
      }
      return LT_PAUSE;
    case 2:
      if (!IsRibbonAnimating(menu))
      {
        PrintRibbonNameAndDescription(menu);
        return LT_INC_AND_PAUSE;
      }
      return LT_PAUSE;
    case 3:
      if (IsDma3ManagerBusyWithBgCopy())
        return LT_PAUSE;
  }
  return LT_FINISH;
}

/** 1:1 `static u32 LoopedTask_ShrinkExpandedRibbon(s32 state)` (pokenav_ribbons_summary.c:762-784). */
function LoopedTask_ShrinkExpandedRibbon(state: number): number {
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_RIBBONS_SUMMARY_MENU);
  switch (state) {
    case 0:
      PlaySE(SE_SELECT);
      ZoomOutSelectedRibbon(menu);
      return LT_INC_AND_PAUSE;
    case 1:
      if (!IsRibbonAnimating(menu))
      {
        PrintCurrentMonRibbonCount(menu);
        PrintHelpBarText(HELPBAR_RIBBONS_LIST);
        return LT_INC_AND_PAUSE;
      }
      return LT_PAUSE;
    case 2:
      if (IsDma3ManagerBusyWithBgCopy())
        return LT_PAUSE;
  }
  return LT_FINISH;
}

/** 1:1 (pokenav_ribbons_summary.c:786) */
const sRibbonCountWindowTemplate = {
  bg: 2,
  tilemapLeft: 12,
  tilemapTop: 13,
  width: 16,
  height: 4,
  paletteNum: 1,
  baseBlock: 0x14 };

/** 1:1 `static void AddRibbonCountWindow(struct Pokenav_RibbonsSummaryMenu *menu)` (pokenav_ribbons_summary.c:797-802). */
function AddRibbonCountWindow(menu: Pokenav_RibbonsSummaryMenu): void {
  menu.ribbonCountWindowId = AddWindow(sRibbonCountWindowTemplate);
  PutWindowTilemap(menu.ribbonCountWindowId);
  PrintCurrentMonRibbonCount(menu);
}

/** 1:1 `static void PrintCurrentMonRibbonCount(struct Pokenav_RibbonsSummaryMenu *menu)` (pokenav_ribbons_summary.c:804-815). */
function PrintCurrentMonRibbonCount(menu: Pokenav_RibbonsSummaryMenu): void {
  const color = Uint8Array.from([
  TEXT_COLOR_RED,
  TEXT_COLOR_DARK_GRAY,
  TEXT_COLOR_LIGHT_GRAY,
]);
  ConvertIntToDecimalStringN(gStringVar1, GetCurrMonRibbonCount(), STR_CONV_MODE_LEFT_ALIGN, 2);
  DynamicPlaceholderTextUtil_Reset();
  DynamicPlaceholderTextUtil_SetPlaceholderPtr(0, gStringVar1);
  DynamicPlaceholderTextUtil_ExpandPlaceholders(gStringVar4, getString('gText_RibbonsF700'));
  FillWindowPixelBuffer(menu.ribbonCountWindowId, PIXEL_FILL(4));
  AddTextPrinterParameterized3(menu.ribbonCountWindowId, FONT_NORMAL, 0, 1, color, TEXT_SKIP_DRAW, gStringVar4);
  CopyWindowToVram(menu.ribbonCountWindowId, COPYWIN_GFX);
}

/** 1:1 `static void PrintRibbonNameAndDescription(struct Pokenav_RibbonsSummaryMenu *menu)` (pokenav_ribbons_summary.c:817-848). */
function PrintRibbonNameAndDescription(menu: Pokenav_RibbonsSummaryMenu): void {
  let i = 0;
  let ribbonId = GetRibbonId();
  const color = Uint8Array.from([
  TEXT_COLOR_RED,
  TEXT_COLOR_DARK_GRAY,
  TEXT_COLOR_LIGHT_GRAY,
]);
  FillWindowPixelBuffer(menu.ribbonCountWindowId, PIXEL_FILL(4));
  if (ribbonId < FIRST_GIFT_RIBBON)
  {
    // Print normal ribbon name/description
    for (i = 0; i < 2; i++)
      AddTextPrinterParameterized3(menu.ribbonCountWindowId, FONT_NORMAL, 0, (i * 16) + 1, color, TEXT_SKIP_DRAW, gRibbonDescriptionPointers[ribbonId][i]);
  }
  else
  {
    // ribbonId here is one of the 'gift' ribbon slots, used to read
    // its actual value from giftRibbons to determine which specific
    // gift ribbon it is
    ribbonId = gSaveBlock1Ptr.giftRibbons[ribbonId - FIRST_GIFT_RIBBON];
    // If 0, this gift ribbon slot is unoccupied
    if (ribbonId == 0)
      return;
    // Print gift ribbon name/description
    ribbonId--;
    for (i = 0; i < 2; i++)
      AddTextPrinterParameterized3(menu.ribbonCountWindowId, FONT_NORMAL, 0, (i * 16) + 1, color, TEXT_SKIP_DRAW, gGiftRibbonDescriptionPointers[ribbonId][i]);
  }
  CopyWindowToVram(menu.ribbonCountWindowId, COPYWIN_GFX);
}

/** 1:1 (pokenav_ribbons_summary.c:850) */
const sRibbonSummaryMonNameWindowTemplate = {
  bg: 2,
  tilemapLeft: 14,
  tilemapTop: 1,
  width: 13,
  height: 2,
  paletteNum: 10,
  baseBlock: 0x54 };

/** 1:1 `static void AddRibbonSummaryMonNameWindow(struct Pokenav_RibbonsSummaryMenu *menu)` (pokenav_ribbons_summary.c:861-866). */
function AddRibbonSummaryMonNameWindow(menu: Pokenav_RibbonsSummaryMenu): void {
  menu.nameWindowId = AddWindow(sRibbonSummaryMonNameWindowTemplate);
  PutWindowTilemap(menu.nameWindowId);
  PrintRibbbonsSummaryMonInfo(menu);
}

/** 1:1 (pokenav_ribbons_summary.c:868) */
const sMaleIconString = encodeOwText("{COLOR_HIGHLIGHT_SHADOW}{LIGHT_RED}{WHITE}{GREEN}♂{COLOR_HIGHLIGHT_SHADOW}{DARK_GRAY}{WHITE}{LIGHT_GRAY}");

/** 1:1 (pokenav_ribbons_summary.c:869) */
const sFemaleIconString = encodeOwText("{COLOR_HIGHLIGHT_SHADOW}{LIGHT_GREEN}{WHITE}{BLUE}♀{COLOR_HIGHLIGHT_SHADOW}{DARK_GRAY}{WHITE}{LIGHT_GRAY}");

/** 1:1 (pokenav_ribbons_summary.c:870) */
const sGenderlessIconString = encodeOwText("{UNK_SPACER}");

/** 1:1 `static void PrintRibbbonsSummaryMonInfo(struct Pokenav_RibbonsSummaryMenu *menu)` (pokenav_ribbons_summary.c:872-902). */
function PrintRibbbonsSummaryMonInfo(menu: Pokenav_RibbonsSummaryMenu): void {
  let genderTxt: any = null;
  let txtPtr: any = null;
  const level = { v: 0 }; // TRANSPILER: &level pris → box
  const gender = { v: 0 }; // TRANSPILER: &gender pris → box
  let windowId = menu.nameWindowId;
  FillWindowPixelBuffer(windowId, PIXEL_FILL(1));
  GetMonNicknameLevelGender(gStringVar3, level, gender);
  AddTextPrinterParameterized(windowId, FONT_NORMAL, gStringVar3, 0, 1, TEXT_SKIP_DRAW, null);
  switch (gender.v) {
    case MON_MALE:
      genderTxt = sMaleIconString;
      break;
    case MON_FEMALE:
      genderTxt = sFemaleIconString;
      break;
    default:
      genderTxt = sGenderlessIconString;
      break;
  }
  txtPtr = StringCopy(gStringVar1, genderTxt);
  void 0 /* TRANSPILER-TODO ASSIGN: *(txtPtr++) = CHAR_SLASH */;
  void 0 /* TRANSPILER-TODO ASSIGN: *(txtPtr++) = CHAR_EXTRA_SYMBOL */;
  void 0 /* TRANSPILER-TODO ASSIGN: *(txtPtr++) = CHAR_LV_2 */;
  ConvertIntToDecimalStringN(txtPtr, level.v, STR_CONV_MODE_LEFT_ALIGN, 3);
  AddTextPrinterParameterized(windowId, FONT_NORMAL, gStringVar1, 60, 1, TEXT_SKIP_DRAW, null);
  CopyWindowToVram(windowId, COPYWIN_GFX);
}

/** 1:1 (pokenav_ribbons_summary.c:904) */
const sRibbonMonListIndexWindowTemplate = [
  {
    bg: 2,
    tilemapLeft: 1,
    tilemapTop: 5,
    width: 7,
    height: 2,
    paletteNum: 1,
    baseBlock: 0x6E },
  [

  ],
];

/** 1:1 `static void AddRibbonListIndexWindow(struct Pokenav_RibbonsSummaryMenu *menu)` (pokenav_ribbons_summary.c:918-924). */
function AddRibbonListIndexWindow(menu: Pokenav_RibbonsSummaryMenu): void {
  menu.listIdxWindowId = AddWindow(sRibbonMonListIndexWindowTemplate);
  FillWindowPixelBuffer(menu.listIdxWindowId, PIXEL_FILL(1));
  PutWindowTilemap(menu.listIdxWindowId);
  PrintRibbonsMonListIndex(menu);
}

/** 1:1 `static void PrintRibbonsMonListIndex(struct Pokenav_RibbonsSummaryMenu *menu)` (pokenav_ribbons_summary.c:926-939). */
function PrintRibbonsMonListIndex(menu: Pokenav_RibbonsSummaryMenu): void {
  let x = 0;
  let txtPtr: any = null;
  let id = GetRibbonsSummaryCurrentIndex() + 1;
  let count = GetRibbonsSummaryMonListCount();
  txtPtr = ConvertIntToDecimalStringN(gStringVar1, id, STR_CONV_MODE_RIGHT_ALIGN, 3);
  void 0 /* TRANSPILER-TODO ASSIGN: *(txtPtr++) = CHAR_SLASH */;
  ConvertIntToDecimalStringN(txtPtr, count, STR_CONV_MODE_RIGHT_ALIGN, 3);
  x = GetStringCenterAlignXOffset(FONT_NORMAL, gStringVar1, 56);
  AddTextPrinterParameterized(menu.listIdxWindowId, FONT_NORMAL, gStringVar1, x, 1, TEXT_SKIP_DRAW, null);
  CopyWindowToVram(menu.listIdxWindowId, COPYWIN_GFX);
}

/** 1:1 `static void ResetSpritesAndDrawMonFrontPic(struct Pokenav_RibbonsSummaryMenu *menu)` (pokenav_ribbons_summary.c:941-950). */
function ResetSpritesAndDrawMonFrontPic(menu: Pokenav_RibbonsSummaryMenu): void {
  const species = { v: 0 }; // TRANSPILER: &species pris → box
  const personality = { v: 0 }; // TRANSPILER: &personality pris → box
  const otId = { v: 0 }; // TRANSPILER: &otId pris → box
  GetMonSpeciesPersonalityOtId(species, personality, otId);
  ResetAllPicSprites();
  menu.monSpriteId = DrawRibbonsMonFrontPic(MON_SPRITE_X_ON, MON_SPRITE_Y);
  PokenavFillPalette(15, 0);
}

/** 1:1 `static void DestroyRibbonsMonFrontPic(struct Pokenav_RibbonsSummaryMenu *menu)` (pokenav_ribbons_summary.c:952-955). */
function DestroyRibbonsMonFrontPic(menu: Pokenav_RibbonsSummaryMenu): void {
  FreeAndDestroyMonPicSprite(menu.monSpriteId);
}

// x and y arguments are ignored

// y is always given as MON_SPRITE_Y

// x is given as either MON_SPRITE_X_ON or MON_SPRITE_X_OFF (but ignored and MON_SPRITE_X_ON is used)

/** 1:1 `static u16 DrawRibbonsMonFrontPic(s32 x, s32 y)` (pokenav_ribbons_summary.c:960-969). */
function DrawRibbonsMonFrontPic(x: number, y: number): number {
  const species = { v: 0 }; // TRANSPILER: &species pris → box
  let spriteId = 0;
  const personality = { v: 0 }; // TRANSPILER: &personality pris → box
  const otId = { v: 0 }; // TRANSPILER: &otId pris → box
  GetMonSpeciesPersonalityOtId(species, personality, otId);
  spriteId = CreateMonPicSprite_HandleDeoxys(species.v, otId.v, personality.v, true, MON_SPRITE_X_ON, MON_SPRITE_Y, 15, TAG_NONE);
  gSprites[spriteId].oam.priority = 0;
  return spriteId;
}

/** 1:1 `static void SlideMonSpriteOff(struct Pokenav_RibbonsSummaryMenu *menu)` (pokenav_ribbons_summary.c:971-974). */
function SlideMonSpriteOff(menu: Pokenav_RibbonsSummaryMenu): void {
  StartMonSpriteSlide(gSprites[menu.monSpriteId], MON_SPRITE_X_ON, MON_SPRITE_X_OFF, 6);
}

/** 1:1 `static void SlideMonSpriteOn(struct Pokenav_RibbonsSummaryMenu *menu)` (pokenav_ribbons_summary.c:976-984). */
function SlideMonSpriteOn(menu: Pokenav_RibbonsSummaryMenu): void {
  // Switch to new mon sprite
  FreeAndDestroyMonPicSprite(menu.monSpriteId);
  menu.monSpriteId = DrawRibbonsMonFrontPic(MON_SPRITE_X_OFF, MON_SPRITE_Y);
  // Slide on
  StartMonSpriteSlide(gSprites[menu.monSpriteId], MON_SPRITE_X_OFF, MON_SPRITE_X_ON, 6);
}

// Is Pokémon summary sprite still sliding off/on

/** 1:1 `static bool32 IsMonSpriteAnimating(struct Pokenav_RibbonsSummaryMenu *menu)` (pokenav_ribbons_summary.c:987-990). */
function IsMonSpriteAnimating(menu: Pokenav_RibbonsSummaryMenu): boolean {
  return (gSprites[menu.monSpriteId].callback != SpriteCallbackDummy);
}

// #define sCurrX data[0]  (alias — expansé aux usages)

// #define sMoveIncr data[1]  (alias — expansé aux usages)

// #define sTime data[2]  (alias — expansé aux usages)

// #define sDestX data[3]  (alias — expansé aux usages)

/** 1:1 `static void StartMonSpriteSlide(struct Sprite *sprite, s32 startX, s32 destX, s32 time)` (pokenav_ribbons_summary.c:997-1008). */
function StartMonSpriteSlide(sprite: DecompSprite, startX: number, destX: number, time: number): void {
  let delta = destX - startX;
  sprite.x = startX;
  sprite.data[0] /* sCurrX */ = startX << 4;
  sprite.data[1] /* sMoveIncr */ = Math.trunc((delta << 4) / time);
  sprite.data[2] /* sTime */ = time;
  sprite.data[3] /* sDestX */ = destX;
  sprite.callback = SpriteCB_MonSpriteSlide;
}

/** 1:1 `static void SpriteCB_MonSpriteSlide(struct Sprite *sprite)` (pokenav_ribbons_summary.c:1010-1027). */
function SpriteCB_MonSpriteSlide(sprite: DecompSprite): void {
  if (sprite.data[2] /* sTime */ != 0)
  {
    sprite.data[2] /* sTime */--;
    sprite.data[0] /* sCurrX */ += sprite.data[1] /* sMoveIncr */;
    sprite.x = sprite.data[0] /* sCurrX */ >> 4;
    if (sprite.x <= MON_SPRITE_X_OFF)
      sprite.invisible = true;
    else
      sprite.invisible = false;
  }
  else
  {
    sprite.x = sprite.data[3] /* sDestX */;
    sprite.callback = SpriteCallbackDummy;
  }
}

/** 1:1 `static void DrawAllRibbonsSmall(struct Pokenav_RibbonsSummaryMenu *menu)` (pokenav_ribbons_summary.c:1034-1049). */
function DrawAllRibbonsSmall(menu: Pokenav_RibbonsSummaryMenu): void {
  let ribbonIds: any = null;
  ClearRibbonsSummaryBg();
  ribbonIds = GetNormalRibbonIds(sRibbonDraw_Total);
  for (sRibbonDraw_Current = 0; sRibbonDraw_Current < sRibbonDraw_Total; sRibbonDraw_Current++)
    DrawRibbonSmall(sRibbonDraw_Current, (ribbonIds++ /* TRANSPILER-TODO ptr-arith */) /* TRANSPILER-TODO deref */);
  ribbonIds = GetGiftRibbonIds(sRibbonDraw_Total);
  for (sRibbonDraw_Current = 0; sRibbonDraw_Current < sRibbonDraw_Total; sRibbonDraw_Current++)
    DrawRibbonSmall(sRibbonDraw_Current + GIFT_RIBBON_START_POS, (ribbonIds++ /* TRANSPILER-TODO ptr-arith */) /* TRANSPILER-TODO deref */);
  CopyBgTilemapBufferToVram(1);
}

// Redundant, the same FillBg is called in LoopedTask_OpenRibbonsSummaryMenu

/** 1:1 `static void ClearRibbonsSummaryBg(void)` (pokenav_ribbons_summary.c:1052-1055). */
function ClearRibbonsSummaryBg(): void {
  FillBgTilemapBufferRect_Palette0(1, 0, 0, 0, 32, 20);
}

/** 1:1 `static void DrawRibbonSmall(u32 i, u32 ribbonId)` (pokenav_ribbons_summary.c:1057-1065). */
function DrawRibbonSmall(i: number, ribbonId: number): void {
  const bgData = new Uint16Array(4);
  let destX = (i % RIBBONS_PER_ROW) * 2 + 11;
  let destY = (Math.trunc(i / RIBBONS_PER_ROW)) * 2 + 4;
  BufferSmallRibbonGfxData(bgData, ribbonId);
  CopyToBgTilemapBufferRect(1, bgData, destX, destY, 2, 2);
}

// Below correspond to a ribbon icon in ribbons/icons.png and ribbons/icons_big.png; 0 at top, 11 at bottom

// enum pokenav_ribbons_summary.c:1068
const RIBBONGFX_CHAMPION = 0;
const RIBBONGFX_CONTEST_NORMAL = 1;
const RIBBONGFX_CONTEST_SUPER = 2;
const RIBBONGFX_CONTEST_HYPER = 3;
const RIBBONGFX_CONTEST_MASTER = 4;
const RIBBONGFX_WINNING = 5;
const RIBBONGFX_VICTORY = 6;
const RIBBONGFX_ARTIST = 7;
const RIBBONGFX_EFFORT = 8;
const RIBBONGFX_GIFT_1 = 9;
const RIBBONGFX_GIFT_2 = 10;
const RIBBONGFX_GIFT_3 = 11;

const TO_PAL_OFFSET = (palNum: number) => ((palNum) - PALTAG_RIBBON_ICONS_1); // 1:1 macro pokenav_ribbons_summary.c:1083

/** 1:1 (pokenav_ribbons_summary.c:1089) */
export const sRibbonGfxData = [
  [
    RIBBONGFX_CHAMPION,
    TO_PAL_OFFSET(PALTAG_RIBBON_ICONS_1),
  ], // [CHAMPION_RIBBON]
  [
    RIBBONGFX_CONTEST_NORMAL,
    TO_PAL_OFFSET(PALTAG_RIBBON_ICONS_1),
  ], // [COOL_RIBBON_NORMAL]
  [
    RIBBONGFX_CONTEST_SUPER,
    TO_PAL_OFFSET(PALTAG_RIBBON_ICONS_1),
  ], // [COOL_RIBBON_SUPER]
  [
    RIBBONGFX_CONTEST_HYPER,
    TO_PAL_OFFSET(PALTAG_RIBBON_ICONS_1),
  ], // [COOL_RIBBON_HYPER]
  [
    RIBBONGFX_CONTEST_MASTER,
    TO_PAL_OFFSET(PALTAG_RIBBON_ICONS_1),
  ], // [COOL_RIBBON_MASTER]
  [
    RIBBONGFX_CONTEST_NORMAL,
    TO_PAL_OFFSET(PALTAG_RIBBON_ICONS_2),
  ], // [BEAUTY_RIBBON_NORMAL]
  [
    RIBBONGFX_CONTEST_SUPER,
    TO_PAL_OFFSET(PALTAG_RIBBON_ICONS_2),
  ], // [BEAUTY_RIBBON_SUPER]
  [
    RIBBONGFX_CONTEST_HYPER,
    TO_PAL_OFFSET(PALTAG_RIBBON_ICONS_2),
  ], // [BEAUTY_RIBBON_HYPER]
  [
    RIBBONGFX_CONTEST_MASTER,
    TO_PAL_OFFSET(PALTAG_RIBBON_ICONS_2),
  ], // [BEAUTY_RIBBON_MASTER]
  [
    RIBBONGFX_CONTEST_NORMAL,
    TO_PAL_OFFSET(PALTAG_RIBBON_ICONS_3),
  ], // [CUTE_RIBBON_NORMAL]
  [
    RIBBONGFX_CONTEST_SUPER,
    TO_PAL_OFFSET(PALTAG_RIBBON_ICONS_3),
  ], // [CUTE_RIBBON_SUPER]
  [
    RIBBONGFX_CONTEST_HYPER,
    TO_PAL_OFFSET(PALTAG_RIBBON_ICONS_3),
  ], // [CUTE_RIBBON_HYPER]
  [
    RIBBONGFX_CONTEST_MASTER,
    TO_PAL_OFFSET(PALTAG_RIBBON_ICONS_3),
  ], // [CUTE_RIBBON_MASTER]
  [
    RIBBONGFX_CONTEST_NORMAL,
    TO_PAL_OFFSET(PALTAG_RIBBON_ICONS_4),
  ], // [SMART_RIBBON_NORMAL]
  [
    RIBBONGFX_CONTEST_SUPER,
    TO_PAL_OFFSET(PALTAG_RIBBON_ICONS_4),
  ], // [SMART_RIBBON_SUPER]
  [
    RIBBONGFX_CONTEST_HYPER,
    TO_PAL_OFFSET(PALTAG_RIBBON_ICONS_4),
  ], // [SMART_RIBBON_HYPER]
  [
    RIBBONGFX_CONTEST_MASTER,
    TO_PAL_OFFSET(PALTAG_RIBBON_ICONS_4),
  ], // [SMART_RIBBON_MASTER]
  [
    RIBBONGFX_CONTEST_NORMAL,
    TO_PAL_OFFSET(PALTAG_RIBBON_ICONS_5),
  ], // [TOUGH_RIBBON_NORMAL]
  [
    RIBBONGFX_CONTEST_SUPER,
    TO_PAL_OFFSET(PALTAG_RIBBON_ICONS_5),
  ], // [TOUGH_RIBBON_SUPER]
  [
    RIBBONGFX_CONTEST_HYPER,
    TO_PAL_OFFSET(PALTAG_RIBBON_ICONS_5),
  ], // [TOUGH_RIBBON_HYPER]
  [
    RIBBONGFX_CONTEST_MASTER,
    TO_PAL_OFFSET(PALTAG_RIBBON_ICONS_5),
  ], // [TOUGH_RIBBON_MASTER]
  [
    RIBBONGFX_WINNING,
    TO_PAL_OFFSET(PALTAG_RIBBON_ICONS_1),
  ], // [WINNING_RIBBON]
  [
    RIBBONGFX_VICTORY,
    TO_PAL_OFFSET(PALTAG_RIBBON_ICONS_1),
  ], // [VICTORY_RIBBON]
  [
    RIBBONGFX_ARTIST,
    TO_PAL_OFFSET(PALTAG_RIBBON_ICONS_2),
  ], // [ARTIST_RIBBON]
  [
    RIBBONGFX_EFFORT,
    TO_PAL_OFFSET(PALTAG_RIBBON_ICONS_3),
  ], // [EFFORT_RIBBON]
  [
    RIBBONGFX_GIFT_1,
    TO_PAL_OFFSET(PALTAG_RIBBON_ICONS_2),
  ], // [MARINE_RIBBON]
  [
    RIBBONGFX_GIFT_1,
    TO_PAL_OFFSET(PALTAG_RIBBON_ICONS_4),
  ], // [LAND_RIBBON]
  [
    RIBBONGFX_GIFT_1,
    TO_PAL_OFFSET(PALTAG_RIBBON_ICONS_5),
  ], // [SKY_RIBBON]
  [
    RIBBONGFX_GIFT_2,
    TO_PAL_OFFSET(PALTAG_RIBBON_ICONS_4),
  ], // [COUNTRY_RIBBON]
  [
    RIBBONGFX_GIFT_2,
    TO_PAL_OFFSET(PALTAG_RIBBON_ICONS_5),
  ], // [NATIONAL_RIBBON]
  [
    RIBBONGFX_GIFT_3,
    TO_PAL_OFFSET(PALTAG_RIBBON_ICONS_1),
  ], // [EARTH_RIBBON]
  [
    RIBBONGFX_GIFT_3,
    TO_PAL_OFFSET(PALTAG_RIBBON_ICONS_2),
  ], // [WORLD_RIBBON]
];

/** 1:1 `static void BufferSmallRibbonGfxData(u16 *dst, u32 ribbonId)` (pokenav_ribbons_summary.c:1127-1136). */
function BufferSmallRibbonGfxData(dst: Uint16Array, ribbonId: number): void {
  let palNum = sRibbonGfxData[ribbonId].palNumOffset + 2;
  let tileNum = (sRibbonGfxData[ribbonId].tileNumOffset * 2) + 1;
  dst[0] = tileNum | (palNum << 12);
  dst[1] = tileNum | (palNum << 12) | 0x400;
  dst[2] = (tileNum + 1) | (palNum << 12);
  dst[3] = (tileNum + 1) | (palNum << 12) | 0x400;
}

/** 1:1 (pokenav_ribbons_summary.c:1138) */
const sSpriteSheet_RibbonIconsBig = {
  data: sRibbonIconsBig_Gfx,
  size: 0x1800,
  tag: GFXTAG_RIBBON_ICONS_BIG };

/** 1:1 (pokenav_ribbons_summary.c:1143) */
const sSpritePalettes_RibbonIcons = [
  {
    data: sRibbonIcons1_Pal,
    tag: PALTAG_RIBBON_ICONS_1 },
  {
    data: sRibbonIcons2_Pal,
    tag: PALTAG_RIBBON_ICONS_2 },
  {
    data: sRibbonIcons3_Pal,
    tag: PALTAG_RIBBON_ICONS_3 },
  {
    data: sRibbonIcons4_Pal,
    tag: PALTAG_RIBBON_ICONS_4 },
  {
    data: sRibbonIcons5_Pal,
    tag: PALTAG_RIBBON_ICONS_5 },
  [

  ],
];

/** 1:1 (pokenav_ribbons_summary.c:1153) */
const sOamData_RibbonIconBig = {
  y: 0, /* :8 */
  affineMode: ST_OAM_AFFINE_NORMAL, /* :2 */
  objMode: ST_OAM_OBJ_NORMAL, /* :2 */
  mosaic: 0, /* :1 */
  bpp: ST_OAM_4BPP, /* :1 */
  shape: 0, /* :2 */
  /* SPRITE_SHAPE(32x32) */
  x: 0, /* :9 */
  matrixNum: 0, /* :5 */
  size: 2, /* :2 */
  /* SPRITE_SIZE(32x32) */
  tileNum: 0, /* :10 */
  priority: 1, /* :2 */
  paletteNum: 0, /* :4 */
  affineParam: 0 };

/** 1:1 (pokenav_ribbons_summary.c:1170) */
const sAffineAnim_RibbonIconBig_Normal = {
  type: AFFINEANIMCMD_FRAME(128, 128, 0, 0),
  frame: AFFINEANIMCMD_END };

/** 1:1 (pokenav_ribbons_summary.c:1176) */
const sAffineAnim_RibbonIconBig_ZoomIn = {
  type: AFFINEANIMCMD_FRAME(128, 128, 0, 0),
  frame: AFFINEANIMCMD_FRAME(32, 32, 0, 4),
  loop: AFFINEANIMCMD_END };

/** 1:1 (pokenav_ribbons_summary.c:1183) */
const sAffineAnim_RibbonIconBig_ZoomOut = {
  type: AFFINEANIMCMD_FRAME(256, 256, 0, 0),
  frame: AFFINEANIMCMD_FRAME(-32, -32, 0, 4),
  loop: AFFINEANIMCMD_END };

// enum pokenav_ribbons_summary.c:1190
const RIBBONANIM_NORMAL = 0;
const RIBBONANIM_ZOOM_IN = 1;
const RIBBONANIM_ZOOM_OUT = 2;

/** 1:1 (pokenav_ribbons_summary.c:1196) */
const sAffineAnims_RibbonIconBig = [
  sAffineAnim_RibbonIconBig_Normal, // [RIBBONANIM_NORMAL]
  sAffineAnim_RibbonIconBig_ZoomIn, // [RIBBONANIM_ZOOM_IN]
  sAffineAnim_RibbonIconBig_ZoomOut, // [RIBBONANIM_ZOOM_OUT]
];

/** 1:1 (pokenav_ribbons_summary.c:1203) */
const sSpriteTemplate_RibbonIconBig = {
  tileTag: GFXTAG_RIBBON_ICONS_BIG,
  paletteTag: PALTAG_RIBBON_ICONS_1,
  oam: sOamData_RibbonIconBig,
  anims: gDummySpriteAnimTable,
  images: null,
  affineAnims: sAffineAnims_RibbonIconBig,
  callback: SpriteCallbackDummy };

// Create dummy sprite to be used for the zoomed in version of the selected ribbon

/** 1:1 `static void CreateBigRibbonSprite(struct Pokenav_RibbonsSummaryMenu *menu)` (pokenav_ribbons_summary.c:1215-1225). */
function CreateBigRibbonSprite(menu: Pokenav_RibbonsSummaryMenu): void {
  let spriteId = 0;
  LoadCompressedSpriteSheet(sSpriteSheet_RibbonIconsBig);
  Pokenav_AllocAndLoadPalettes(sSpritePalettes_RibbonIcons);
  spriteId = CreateSprite(sSpriteTemplate_RibbonIconBig, 0, 0, 0);
  menu.bigRibbonSprite = gSprites[spriteId];
  menu.bigRibbonSprite.invisible = true;
}

// #define sInvisibleWhenDone data[0]  (alias — expansé aux usages)

/** 1:1 `static void UpdateAndZoomInSelectedRibbon(struct Pokenav_RibbonsSummaryMenu *menu)` (pokenav_ribbons_summary.c:1229-1249). */
function UpdateAndZoomInSelectedRibbon(menu: Pokenav_RibbonsSummaryMenu): void {
  let ribbonId = 0;
  let position = GetSelectedPosition();
  let x = (position % RIBBONS_PER_ROW) * 16 + 96;
  let y = (Math.trunc(position / RIBBONS_PER_ROW)) * 16 + 40;
  menu.bigRibbonSprite.x = x;
  menu.bigRibbonSprite.y = y;
  // Set new selected ribbon's gfx data
  ribbonId = GetRibbonId();
  menu.bigRibbonSprite.oam.tileNum = (sRibbonGfxData[ribbonId].tileNumOffset * 16) + GetSpriteTileStartByTag(GFXTAG_RIBBON_ICONS_BIG);
  menu.bigRibbonSprite.oam.paletteNum = IndexOfSpritePaletteTag(sRibbonGfxData[ribbonId].palNumOffset + PALTAG_RIBBON_ICONS_1);
  // Start zoom in animation
  StartSpriteAffineAnim(menu.bigRibbonSprite, RIBBONANIM_ZOOM_IN);
  menu.bigRibbonSprite.invisible = false;
  menu.bigRibbonSprite.data[0] /* sInvisibleWhenDone */ = false;
  menu.bigRibbonSprite.callback = SpriteCB_WaitForRibbonAnimation;
}

// Start animation to zoom out of selected ribbon

/** 1:1 `static void ZoomOutSelectedRibbon(struct Pokenav_RibbonsSummaryMenu *menu)` (pokenav_ribbons_summary.c:1252-1257). */
function ZoomOutSelectedRibbon(menu: Pokenav_RibbonsSummaryMenu): void {
  menu.bigRibbonSprite.data[0] /* sInvisibleWhenDone */ = true;
  StartSpriteAffineAnim(menu.bigRibbonSprite, RIBBONANIM_ZOOM_OUT);
  menu.bigRibbonSprite.callback = SpriteCB_WaitForRibbonAnimation;
}

/** 1:1 `static bool32 IsRibbonAnimating(struct Pokenav_RibbonsSummaryMenu *menu)` (pokenav_ribbons_summary.c:1259-1262). */
function IsRibbonAnimating(menu: Pokenav_RibbonsSummaryMenu): boolean {
  return (menu.bigRibbonSprite.callback != SpriteCallbackDummy);
}

/** 1:1 `static void SpriteCB_WaitForRibbonAnimation(struct Sprite *sprite)` (pokenav_ribbons_summary.c:1264-1271). */
function SpriteCB_WaitForRibbonAnimation(sprite: DecompSprite): void {
  if (sprite.affineAnimEnded)
  {
    sprite.invisible = sprite.data[0] /* sInvisibleWhenDone */;
    sprite.callback = SpriteCallbackDummy;
  }
}
