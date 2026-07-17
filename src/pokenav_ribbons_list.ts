// @ts-nocheck — transpilé brut (types stricts au câblage fin ; wire-transpiled.cjs)
/**
 * pokenav_ribbons_list.ts — miroir 1:1 de `D:/Projet 1/decomps/pokeemeraude/src/pokenav_ribbons_list.c` (transpilé).
 *
 * Généré par scripts/transpile-c.cjs — revue humaine OBLIGATOIRE avant commit :
 * rapport des flags dans audit-reports/transpile/pokenav_ribbons_list.md.
 * Politique préproc : build vanilla FR (NDEBUG/FRENCH définis, BUGFIX/UBFIX absents).
 */

import { CHAR_EXTRA_SYMBOL, CHAR_LV_2, CHAR_SLASH } from '../include/constants/characters';
import { PARTY_SIZE } from '../include/constants/global';
import { MON_FEMALE, MON_MALE } from '../include/constants/pokemon';
import { SE_SELECT } from '../include/constants/songs';
import { A_BUTTON, B_BUTTON, DPAD_DOWN, DPAD_LEFT, DPAD_RIGHT, DPAD_UP } from '../include/gba/io_reg';
import { MON_DATA_NICKNAME, MON_DATA_RIBBONS, MON_DATA_RIBBON_COUNT, MON_DATA_SANITY_HAS_SPECIES, MON_DATA_SANITY_IS_BAD_EGG, MON_DATA_SANITY_IS_EGG } from '../include/pokemon';
import { STR_CONV_MODE_LEFT_ALIGN, STR_CONV_MODE_RIGHT_ALIGN } from '../include/string_util';
import { FONT_NORMAL, TEXT_SKIP_DRAW } from '../include/text';
import { IsDma3ManagerBusyWithBgCopy } from './dma3_manager';
import { JOY_NEW, JOY_REPEAT, PlaySE } from './battle_controllers';
import { GetMonData } from './engine/battle/party-storage';
import { IN_BOX_COUNT, TOTAL_BOXES_COUNT } from './engine/save/save-blocks';
import { GetStringCenterAlignXOffset, GetStringClearToWidth } from './international_string_util';
import { BG_PLTT_ID } from './palette';
import { GetBoxMonGender, GetLevelFromBoxMonExp, GetLevelFromMonExp, GetMonGender, gPlayerParty } from './pokemon';
import { GetBoxedMonPtr } from './pokemon_storage_system';
import { PLTT_SIZE_4BPP } from './sprite';
import { ConvertIntToDecimalStringN, StringCopy, StringGet_Nickname, gStringVar1, gStringVar3 } from './string_util';
import { AddTextPrinterParameterized, encodeOwText } from './text';
import { AddWindow, COPYWIN_GFX, COPYWIN_MAP, ChangeBgX, ChangeBgY, CopyBgTilemapBufferToVram, CopyToBgTilemapBuffer, CopyWindowToVram, HideBg, PutWindowTilemap, RemoveWindow, SetBgTilemapBuffer, ShowBg } from './window';
import type { Pokemon } from './engine/battle/party-storage';
import type { WindowTemplate } from './window';

// ═══ wire-transpiled (auto) : imports résolus par l'index ═══
import { CreateLoopedTask, IsLoopedTaskActive } from './pokenav_looped_task';
import { AllocSubstruct, FreePokenavSubstruct, GetSubstructPtr } from './pokenav_resources';
// ─── Câblage (ex-__wireTodo) : helpers déjà portés ailleurs dans le repo ───
import { AreLeftHeaderSpritesMoving, CopyPaletteIntoBufferUnfaded, DecompressAndCopyTileDataToVram, FreeTempTileDataBuffersIfPossible, InitBgTemplates, IsPaletteFadeActive, LoadLeftHeaderGfxForIndex, MainMenuLoopedTaskIsBusy, PokenavFadeScreen, PrintHelpBarText, SetLeftHeaderSpritesInvisibility, ShowLeftHeaderGfx, SlideMenuHeaderDown } from './pokenav_main_menu';
import { CreatePokenavList, DestroyPokenavList, IsCreatePokenavListTaskActive, PokenavList_GetSelectedIndex, PokenavList_IsMoveWindowTaskActive, PokenavList_MoveCursorDown, PokenavList_MoveCursorUp, PokenavList_PageDown, PokenavList_PageUp } from './pokenav_list';
import { LT_SET_STATE } from './pokenav_looped_task';
import { CheckBoxMonSanityAt, GetBoxMonDataAt } from './pokemon_storage_system'; // câblé (ex-__wireTodo)
import { loadTileBin, loadTilemapBin, extractPngPlte, loadGbaPal } from '../harness/gba/png-loader';

// 1:1 décomp `GetBoxMonData` (pokemon.c) : notre modèle unifie BoxPokemon→Pokemon, donc GetMonData
//  couvre les champs box (NICKNAME/RIBBONS…). Alias (précédent mail_data.ts:43).
const GetBoxMonData = GetMonData;

// ── Assets (INCGFX) : le décomp a tout en ROM (instantané) ; le port fetch async (preload au fade
//    d'ouverture, cf. PrefetchListArrowAssets). gMonRibbonListFrame* = frame bg du list screen
//    (graphics.c:1623-1625). Populés par _loadRibbonsListAssets() ; DecompressAndCopyTileDataToVram
//    / CopyToBgTilemapBuffer / CopyPaletteIntoBufferUnfaded no-op proprement si encore null. ──
let gMonRibbonListFrameTiles: Uint8Array | null = null;    // list_bg.png .4bpp.lz (décompressé)
let gMonRibbonListFrameTilemap: Uint16Array | null = null; // list_bg.bin.lz (décompressé)
let gMonRibbonListFramePal: Uint16Array | null = null;     // list_bg.png .gbapal

// ─── constantes décomp inlinées (headers pas encore dans include/) ───
const POKENAV_SUBSTRUCT_RIBBONS_MON_LIST = 9; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_SUBSTRUCT_MON_LIST = 18; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_MAIN_MENU_CURSOR_ON_RIBBONS = 100005; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_RIBBONS_SUMMARY_SCREEN = 100013; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const LT_INC_AND_CONTINUE = 1; // 1:1 include/pokenav.h:59 (à consolider dans include/)
const LT_CONTINUE = 3; // 1:1 include/pokenav.h:61 (à consolider dans include/)
const LT_FINISH = 4; // 1:1 include/pokenav.h:62 (à consolider dans include/)
const POKENAV_SUBSTRUCT_RIBBONS_MON_MENU = 10; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const LT_INC_AND_PAUSE = 0; // 1:1 include/pokenav.h:58 (à consolider dans include/)
const LT_PAUSE = 2; // 1:1 include/pokenav.h:60 (à consolider dans include/)
const BG_COORD_SET = 0; // 1:1 include/bg.h:0 (à consolider dans include/)
const HELPBAR_RIBBONS_MON_LIST = 9; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_FADE_FROM_BLACK = 1; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_GFX_RIBBONS_MENU = 2; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_FADE_TO_BLACK = 0; // 1:1 include/pokenav.h:0 (à consolider dans include/)

// enum pokenav_ribbons_list.c:13
const RIBBONS_MON_LIST_FUNC_NONE = 0;
const RIBBONS_MON_LIST_FUNC_MOVE_UP = 1;
const RIBBONS_MON_LIST_FUNC_MOVE_DOWN = 2;
const RIBBONS_MON_LIST_FUNC_PAGE_UP = 3;
const RIBBONS_MON_LIST_FUNC_PAGE_DOWN = 4;
const RIBBONS_MON_LIST_FUNC_EXIT = 5;
const RIBBONS_MON_LIST_FUNC_OPEN_RIBBONS_SUMMARY = 6;

/** 1:1 `struct Pokenav_RibbonsMonList` (pokenav_ribbons_list.c:25). */
interface Pokenav_RibbonsMonList {
  callback: ((...args: any[]) => any) | null;
  loopedTaskId: number;
  winid: number;
  boxId: number;
  monId: number;
  changeBgs: number;
  saveMonList: number;
  monList: any;
}

/** 1:1 `struct Pokenav_RibbonsMonMenu` (pokenav_ribbons_list.c:37). */
interface Pokenav_RibbonsMonMenu {
  callback: ((...args: any[]) => any) | null;
  loopedTaskId: number;
  winid: number;
  fromSummary: boolean;
  buff: Uint8Array;
}

/** 1:1 (pokenav_ribbons_list.c:69) */
const sMonRibbonListLoopTaskFuncs = [
  BuildPartyMonRibbonList,
  InitBoxMonRibbonList,
  BuildBoxMonRibbonList,
];

// TRANSPILER-TODO INCGFX : sMonRibbonListUi_Pal ← graphics/pokenav/ribbons/list_ui.pal (pipeline assets : loadTileBin/loadGbaPal('/decomp/em/…'))
let sMonRibbonListUi_Pal: any = null;

/** 1:1 (pokenav_ribbons_list.c:78) */
const sMonRibbonListBgTemplates = [
  {
    bg: 1, /* :2 */
    charBaseIndex: 1, /* :2 */
    mapBaseIndex: 0x06, /* :5 */
    screenSize: 0, /* :2 */
    paletteMode: 0, /* :1 */
    priority: 2, /* :2 */
    baseTile: 0, /* :10 */
  },
  {
    bg: 2, /* :2 */
    charBaseIndex: 2, /* :2 */
    mapBaseIndex: 0x07, /* :5 */
    screenSize: 0, /* :2 */
    paletteMode: 0, /* :1 */
    priority: 3, /* :2 */
    baseTile: 0, /* :10 */
  },
];

/** 1:1 (pokenav_ribbons_list.c:99) */
const sRibbonsMonMenuLoopTaskFuncs = [
  null, // [RIBBONS_MON_LIST_FUNC_NONE]
  LoopedTask_RibbonsListMoveCursorUp, // [RIBBONS_MON_LIST_FUNC_MOVE_UP]
  LoopedTask_RibbonsListMoveCursorDown, // [RIBBONS_MON_LIST_FUNC_MOVE_DOWN]
  LoopedTask_RibbonsListMovePageUp, // [RIBBONS_MON_LIST_FUNC_PAGE_UP]
  LoopedTask_RibbonsListMovePageDown, // [RIBBONS_MON_LIST_FUNC_PAGE_DOWN]
  LoopedTask_RibbonsListReturnToMainMenu, // [RIBBONS_MON_LIST_FUNC_EXIT]
  LoopedTask_RibbonsListOpenSummary, // [RIBBONS_MON_LIST_FUNC_OPEN_RIBBONS_SUMMARY]
];

/** 1:1 (pokenav_ribbons_list.c:110) */
const sRibbonsMonListWindowTemplate = {
  bg: 1,
  tilemapLeft: 1,
  tilemapTop: 6,
  width: 7,
  height: 2,
  paletteNum: 1,
  baseBlock: 20,
};

/** 1:1 (pokenav_ribbons_list.c:121) */
const sText_MaleSymbol = encodeOwText("{COLOR_HIGHLIGHT_SHADOW}{LIGHT_RED}{WHITE}{GREEN}♂{COLOR_HIGHLIGHT_SHADOW}{DARK_GRAY}{WHITE}{LIGHT_GRAY}");

/** 1:1 (pokenav_ribbons_list.c:122) */
const sText_FemaleSymbol = encodeOwText("{COLOR_HIGHLIGHT_SHADOW}{LIGHT_GREEN}{WHITE}{BLUE}♀{COLOR_HIGHLIGHT_SHADOW}{DARK_GRAY}{WHITE}{LIGHT_GRAY}");

/** 1:1 (pokenav_ribbons_list.c:123) */
const sText_NoGenderSymbol = encodeOwText("{UNK_SPACER}");

/** 1:1 `bool32 PokenavCallback_Init_MonRibbonList(void)` (pokenav_ribbons_list.c:125-139). */
export function PokenavCallback_Init_MonRibbonList(): boolean {
  let list = AllocSubstruct(POKENAV_SUBSTRUCT_RIBBONS_MON_LIST, 0 /* TRANSPILER-TODO sizeof(struct Pokenav_RibbonsMonList) */);
  if (list == null)
    return false;
  list.monList = AllocSubstruct(POKENAV_SUBSTRUCT_MON_LIST, 0 /* TRANSPILER-TODO sizeof(struct PokenavMonList) */);
  if (list.monList == null)
    return false;
  // ADAPTATION MOTEUR : `struct PokenavMonList { PokenavMonListItem monData[]; s32 listCount; s32 currIndex; }`
  // zéro-init en C ; AllocSubstruct rend un objet vide → init explicite (sinon monData[i]= crash).
  list.monList.monData = [];
  list.monList.listCount = 0;
  list.monList.currIndex = 0;
  list.callback = HandleRibbonsMonListInput_WaitListInit;
  list.loopedTaskId = CreateLoopedTask(GetMonRibbonListLoopTaskFunc, 1);
  list.changeBgs = 0;
  return true;
}

/** 1:1 `bool32 PokenavCallback_Init_RibbonsMonListFromSummary(void)` (pokenav_ribbons_list.c:141-151). */
export function PokenavCallback_Init_RibbonsMonListFromSummary(): boolean {
  let list = AllocSubstruct(POKENAV_SUBSTRUCT_RIBBONS_MON_LIST, 0 /* TRANSPILER-TODO sizeof(struct Pokenav_RibbonsMonList) */);
  if (list == null)
    return false;
  list.monList = GetSubstructPtr(POKENAV_SUBSTRUCT_MON_LIST);
  list.callback = HandleRibbonsMonListInput;
  list.changeBgs = 1;
  return true;
}

/** 1:1 `u32 GetRibbonsMonListCallback(void)` (pokenav_ribbons_list.c:153-157). */
export function GetRibbonsMonListCallback(): number {
  let list = GetSubstructPtr(POKENAV_SUBSTRUCT_RIBBONS_MON_LIST);
  return list.callback(list);
}

/** 1:1 `void FreeRibbonsMonList(void)` (pokenav_ribbons_list.c:159-165). */
export function FreeRibbonsMonList(): void {
  let list = GetSubstructPtr(POKENAV_SUBSTRUCT_RIBBONS_MON_LIST);
  if (!list.saveMonList)
    FreePokenavSubstruct(POKENAV_SUBSTRUCT_MON_LIST);
  FreePokenavSubstruct(POKENAV_SUBSTRUCT_RIBBONS_MON_LIST);
}

/** 1:1 `static u32 HandleRibbonsMonListInput_WaitListInit(struct Pokenav_RibbonsMonList *list)` (pokenav_ribbons_list.c:167-172). */
function HandleRibbonsMonListInput_WaitListInit(list: Pokenav_RibbonsMonList): number {
  if (!IsLoopedTaskActive(list.loopedTaskId))
    list.callback = HandleRibbonsMonListInput;
  return 0;
}

/** 1:1 `static u32 HandleRibbonsMonListInput(struct Pokenav_RibbonsMonList *list)` (pokenav_ribbons_list.c:174-198). */
function HandleRibbonsMonListInput(list: Pokenav_RibbonsMonList): number {
  if (JOY_REPEAT(DPAD_UP))
    return RIBBONS_MON_LIST_FUNC_MOVE_UP;
  if (JOY_REPEAT(DPAD_DOWN))
    return RIBBONS_MON_LIST_FUNC_MOVE_DOWN;
  if (JOY_NEW(DPAD_LEFT))
    return RIBBONS_MON_LIST_FUNC_PAGE_UP;
  if (JOY_NEW(DPAD_RIGHT))
    return RIBBONS_MON_LIST_FUNC_PAGE_DOWN;
  if (JOY_NEW(B_BUTTON))
  {
    list.saveMonList = 0;
    list.callback = RibbonsMonMenu_ReturnToMainMenu;
    return RIBBONS_MON_LIST_FUNC_EXIT;
  }
  if (JOY_NEW(A_BUTTON))
  {
    list.monList.currIndex = PokenavList_GetSelectedIndex();
    list.saveMonList = 1;
    list.callback = RibbonsMonMenu_ToSummaryScreen;
    return RIBBONS_MON_LIST_FUNC_OPEN_RIBBONS_SUMMARY;
  }
  return RIBBONS_MON_LIST_FUNC_NONE;
}

/** 1:1 `static u32 RibbonsMonMenu_ReturnToMainMenu(struct Pokenav_RibbonsMonList *list)` (pokenav_ribbons_list.c:200-203). */
function RibbonsMonMenu_ReturnToMainMenu(list: Pokenav_RibbonsMonList): number {
  return POKENAV_MAIN_MENU_CURSOR_ON_RIBBONS;
}

/** 1:1 `static u32 RibbonsMonMenu_ToSummaryScreen(struct Pokenav_RibbonsMonList *list)` (pokenav_ribbons_list.c:205-208). */
function RibbonsMonMenu_ToSummaryScreen(list: Pokenav_RibbonsMonList): number {
  return POKENAV_RIBBONS_SUMMARY_SCREEN;
}

/** 1:1 `static u32 UpdateMonListBgs(void)` (pokenav_ribbons_list.c:210-214). */
function UpdateMonListBgs(): number {
  let list = GetSubstructPtr(POKENAV_SUBSTRUCT_RIBBONS_MON_LIST);
  return list.changeBgs;
}

/** 1:1 `static struct PokenavMonListItem *GetMonRibbonMonListData(void)` (pokenav_ribbons_list.c:216-220). */
function GetMonRibbonMonListData(): any {
  let list = GetSubstructPtr(POKENAV_SUBSTRUCT_RIBBONS_MON_LIST);
  return list.monList.monData;
}

/** 1:1 `static s32 GetRibbonsMonListCount(void)` (pokenav_ribbons_list.c:222-226). */
function GetRibbonsMonListCount(): number {
  let list = GetSubstructPtr(POKENAV_SUBSTRUCT_RIBBONS_MON_LIST);
  return list.monList.listCount;
}

/** 1:1 `static s32 GetMonRibbonSelectedMonData(void)` (pokenav_ribbons_list.c:228-233). */
function GetMonRibbonSelectedMonData(): number {
  let list = GetSubstructPtr(POKENAV_SUBSTRUCT_RIBBONS_MON_LIST);
  let idx = PokenavList_GetSelectedIndex();
  return list.monList.monData[idx].data;
}

/** 1:1 `static s32 GetRibbonListMenuCurrIndex(void)` (pokenav_ribbons_list.c:235-239). */
function GetRibbonListMenuCurrIndex(): number {
  let list = GetSubstructPtr(POKENAV_SUBSTRUCT_RIBBONS_MON_LIST);
  return list.monList.currIndex;
}

/** 1:1 `static u32 GetMonRibbonListLoopTaskFunc(s32 state)` (pokenav_ribbons_list.c:241-244). */
function GetMonRibbonListLoopTaskFunc(state: number): number {
  return sMonRibbonListLoopTaskFuncs[state](state);
}

/** 1:1 `static u32 BuildPartyMonRibbonList(s32 state)` (pokenav_ribbons_list.c:246-273). */
function BuildPartyMonRibbonList(state: number): number {
  let i = 0;
  const item = { boxId: 0, monId: 0, data: 0 };
  let list = GetSubstructPtr(POKENAV_SUBSTRUCT_RIBBONS_MON_LIST);
  list.monList.listCount = 0;
  list.monList.currIndex = 0;
  item.boxId = TOTAL_BOXES_COUNT;
  for (i = 0; i < PARTY_SIZE; i++)
  {
    let pokemon = gPlayerParty[i];
    if (!GetMonData(pokemon, MON_DATA_SANITY_HAS_SPECIES))
      return LT_INC_AND_CONTINUE;
    if (!GetMonData(pokemon, MON_DATA_SANITY_IS_EGG) && !GetMonData(pokemon, MON_DATA_SANITY_IS_BAD_EGG))
    {
      let ribbonCount = GetMonData(pokemon, MON_DATA_RIBBON_COUNT);
      if (ribbonCount != 0)
      {
        item.monId = i;
        item.data = ribbonCount;
        InsertMonListItem(list, item);
      }
    }
  }
  return LT_INC_AND_CONTINUE;
}

/** 1:1 `static u32 InitBoxMonRibbonList(s32 state)` (pokenav_ribbons_list.c:275-281). */
function InitBoxMonRibbonList(state: number): number {
  let list = GetSubstructPtr(POKENAV_SUBSTRUCT_RIBBONS_MON_LIST);
  list.monId = 0;
  list.boxId = 0;
  return LT_INC_AND_CONTINUE;
}

/** 1:1 `static u32 BuildBoxMonRibbonList(s32 state)` (pokenav_ribbons_list.c:283-321). */
function BuildBoxMonRibbonList(state: number): number {
  let list = GetSubstructPtr(POKENAV_SUBSTRUCT_RIBBONS_MON_LIST);
  let boxId = list.boxId;
  let monId = list.monId;
  let boxCount = 0;
  const item = { boxId: 0, monId: 0, data: 0 };
  while (boxId < TOTAL_BOXES_COUNT)
  {
    while (monId < IN_BOX_COUNT)
    {
      if (CheckBoxMonSanityAt(boxId, monId))
      {
        let ribbonCount = GetBoxMonDataAt(boxId, monId, MON_DATA_RIBBON_COUNT);
        if (ribbonCount != 0)
        {
          item.boxId = boxId;
          item.monId = monId;
          item.data = ribbonCount;
          InsertMonListItem(list, item);
        }
      }
      boxCount++;
      monId++;
      if (boxCount > TOTAL_BOXES_COUNT)
      {
        list.boxId = boxId;
        list.monId = monId;
        return LT_CONTINUE;
      }
    }
    monId = 0;
    boxId++;
  }
  list.changeBgs = 1;
  return LT_FINISH;
}

/** 1:1 `static void InsertMonListItem(struct Pokenav_RibbonsMonList *list, struct PokenavMonListItem *item)` (pokenav_ribbons_list.c:323-341). */
function InsertMonListItem(list: Pokenav_RibbonsMonList, item: any): void {
  let left = 0;
  let right = list.monList.listCount;
  let insertionIdx = left + Math.trunc((right - left) / 2);
  while (right != insertionIdx)
  {
    if (item.data > list.monList.monData[insertionIdx].data)
      right = insertionIdx;
    else
      left = insertionIdx + 1;
    insertionIdx = left + Math.trunc((right - left) / 2);
  }
  for (right = list.monList.listCount; right > insertionIdx; right--)
    list.monList.monData[right] = list.monList.monData[right - 1];
  // 1:1 `monData[insertionIdx] = *item` : COPIE par valeur (le caller réutilise le même `item`
  // local à chaque itération → stocker la référence ferait pointer toutes les entrées sur le dernier).
  list.monList.monData[insertionIdx] = { boxId: item.boxId, monId: item.monId, data: item.data };
  list.monList.listCount++;
}

/** 1:1 `static bool32 PlayerHasRibbonsMon(void)` (pokenav_ribbons_list.c:343-370). */
function PlayerHasRibbonsMon(): boolean {
  let i = 0;
  let j = 0;
  for (i = 0; i < PARTY_SIZE; i++)
  {
    let mon = gPlayerParty[i];
    if (!GetMonData(mon, MON_DATA_SANITY_HAS_SPECIES))
      continue;
    if (GetMonData(mon, MON_DATA_SANITY_IS_EGG))
      continue;
    if (GetMonData(mon, MON_DATA_RIBBONS))
      return true;
  }
  for (i = 0; i < TOTAL_BOXES_COUNT; i++)
  {
    for (j = 0; j < IN_BOX_COUNT; j++)
    {
      if (!CheckBoxMonSanityAt(i, j))
        continue;
      if (GetBoxMonDataAt(i, j, MON_DATA_RIBBONS))
        return true;
    }
  }
  return false;
}

/** 1:1 `bool32 OpenRibbonsMonList(void)` (pokenav_ribbons_list.c:372-381). */
export function OpenRibbonsMonList(): boolean {
  let menu = AllocSubstruct(POKENAV_SUBSTRUCT_RIBBONS_MON_MENU, 0 /* TRANSPILER-TODO sizeof(struct Pokenav_RibbonsMonMenu) */);
  if (menu == null)
    return false;
  menu.buff = new Uint8Array(0x800); // 1:1 `u8 buff[BG_SCREEN_SIZE]` — init explicite (AllocSubstruct rend {}).
  menu.loopedTaskId = CreateLoopedTask(LoopedTask_OpenRibbonsMonList, 1);
  menu.callback = GetRibbonsMonCurrentLoopedTaskActive;
  menu.fromSummary = false;
  return true;
}

/** 1:1 `bool32 OpenRibbonsMonListFromRibbonsSummary(void)` (pokenav_ribbons_list.c:383-392). */
export function OpenRibbonsMonListFromRibbonsSummary(): boolean {
  let menu = AllocSubstruct(POKENAV_SUBSTRUCT_RIBBONS_MON_MENU, 0 /* TRANSPILER-TODO sizeof(struct Pokenav_RibbonsMonMenu) */);
  if (menu == null)
    return false;
  menu.buff = new Uint8Array(0x800); // 1:1 `u8 buff[BG_SCREEN_SIZE]` — init explicite (AllocSubstruct rend {}).
  menu.loopedTaskId = CreateLoopedTask(LoopedTask_OpenRibbonsMonList, 1);
  menu.callback = GetRibbonsMonCurrentLoopedTaskActive;
  menu.fromSummary = true;
  return true;
}

/** 1:1 `void CreateRibbonsMonListLoopedTask(s32 idx)` (pokenav_ribbons_list.c:394-399). */
export function CreateRibbonsMonListLoopedTask(idx: number): void {
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_RIBBONS_MON_MENU);
  menu.loopedTaskId = CreateLoopedTask(sRibbonsMonMenuLoopTaskFuncs[idx], 1);
  menu.callback = GetRibbonsMonCurrentLoopedTaskActive;
}

/** 1:1 `bool32 IsRibbonsMonListLoopedTaskActive(void)` (pokenav_ribbons_list.c:401-405). */
export function IsRibbonsMonListLoopedTaskActive(): boolean {
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_RIBBONS_MON_MENU);
  return menu.callback();
}

/** 1:1 `bool32 GetRibbonsMonCurrentLoopedTaskActive(void)` (pokenav_ribbons_list.c:407-411). */
export function GetRibbonsMonCurrentLoopedTaskActive(): boolean {
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_RIBBONS_MON_MENU);
  return IsLoopedTaskActive(menu.loopedTaskId);
}

/** 1:1 `void FreeRibbonsMonMenu(void)` (pokenav_ribbons_list.c:413-419). */
export function FreeRibbonsMonMenu(): void {
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_RIBBONS_MON_MENU);
  DestroyPokenavList();
  RemoveWindow(menu.winid);
  FreePokenavSubstruct(POKENAV_SUBSTRUCT_RIBBONS_MON_MENU);
}

/** 1:1 `static u32 LoopedTask_OpenRibbonsMonList(s32 state)` (pokenav_ribbons_list.c:421-476). */
function LoopedTask_OpenRibbonsMonList(state: number): number {
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_RIBBONS_MON_MENU);
  switch (state) {
    case 0:
      // ADAPTATION MOTEUR (async asset) : le décomp a la frame bg en ROM (instantané). Le port
      // fetch → on gate le case 0 tant que list_bg n'est pas fetché (sanctionné, cf. pokenav_list
      // case 3). `_settled` (loaded OU 404) débloque même si l'asset manque (jamais de freeze dur).
      if (!_ribbonsListAssetsSettled) { _loadRibbonsListAssets(); return LT_PAUSE; }
      InitBgTemplates(sMonRibbonListBgTemplates, sMonRibbonListBgTemplates.length);
      //!< Global variables in the French Version
      DecompressAndCopyTileDataToVram(1, gMonRibbonListFrameTiles, 0, 0, 0);
      SetBgTilemapBuffer(1, menu.buff);
      CopyToBgTilemapBuffer(1, gMonRibbonListFrameTilemap, 0, 0);
      CopyPaletteIntoBufferUnfaded(gMonRibbonListFramePal, BG_PLTT_ID(1), PLTT_SIZE_4BPP);
      CopyBgTilemapBufferToVram(1);
      return LT_INC_AND_PAUSE;
    case 1:
      if (FreeTempTileDataBuffersIfPossible())
        return LT_PAUSE;
      if (!UpdateMonListBgs())
        return LT_PAUSE;
      ChangeBgX(1, 0, BG_COORD_SET);
      ChangeBgY(1, 0, BG_COORD_SET);
      ShowBg(1);
      return LT_INC_AND_PAUSE;
    case 2:
      if (FreeTempTileDataBuffersIfPossible())
        return LT_PAUSE;
      CopyPaletteIntoBufferUnfaded(sMonRibbonListUi_Pal, BG_PLTT_ID(2), sMonRibbonListUi_Pal ? sMonRibbonListUi_Pal.length * 2 : 0 /* sizeof = octets */);
      CreateRibbonMonsList();
      return LT_INC_AND_PAUSE;
    case 3:
      if (IsCreatePokenavListTaskActive())
        return LT_PAUSE;
      AddRibbonsMonListWindow(menu);
      return LT_INC_AND_PAUSE;
    case 4:
      if (FreeTempTileDataBuffersIfPossible())
        return LT_PAUSE;
      ShowBg(2);
      HideBg(3);
      PrintHelpBarText(HELPBAR_RIBBONS_MON_LIST);
      PokenavFadeScreen(POKENAV_FADE_FROM_BLACK);
      if (!menu.fromSummary)
      {
        LoadLeftHeaderGfxForIndex(POKENAV_GFX_RIBBONS_MENU);
        ShowLeftHeaderGfx(POKENAV_GFX_RIBBONS_MENU, true, false);
      }
      return LT_INC_AND_PAUSE;
    case 5:
      if (IsPaletteFadeActive())
        return LT_PAUSE;
      if (AreLeftHeaderSpritesMoving())
        return LT_PAUSE;
      break;
  }
  return LT_FINISH;
}

/** 1:1 `static u32 LoopedTask_RibbonsListMoveCursorUp(s32 state)` (pokenav_ribbons_list.c:478-509). */
function LoopedTask_RibbonsListMoveCursorUp(state: number): number {
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_RIBBONS_MON_MENU);
  switch (state) {
    case 0:
      switch (PokenavList_MoveCursorUp()) {
        case 0:
          return LT_FINISH;
        case 1:
          PlaySE(SE_SELECT);
          return LT_SET_STATE(2);
        case 2:
          PlaySE(SE_SELECT);
          break;
      }
      return LT_INC_AND_PAUSE;
    case 1:
      if (PokenavList_IsMoveWindowTaskActive())
        return LT_PAUSE;
    // fallthrough
    case 2:
      UpdateIndexNumberDisplay(menu);
      return LT_INC_AND_PAUSE;
    case 3:
      if (IsDma3ManagerBusyWithBgCopy())
        return LT_PAUSE;
      break;
  }
  return LT_FINISH;
}

/** 1:1 `static u32 LoopedTask_RibbonsListMoveCursorDown(s32 state)` (pokenav_ribbons_list.c:511-542). */
function LoopedTask_RibbonsListMoveCursorDown(state: number): number {
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_RIBBONS_MON_MENU);
  switch (state) {
    case 0:
      switch (PokenavList_MoveCursorDown()) {
        case 0:
          return LT_FINISH;
        case 1:
          PlaySE(SE_SELECT);
          return LT_SET_STATE(2);
        case 2:
          PlaySE(SE_SELECT);
          break;
      }
      return LT_INC_AND_PAUSE;
    case 1:
      if (PokenavList_IsMoveWindowTaskActive())
        return LT_PAUSE;
    // fallthrough
    case 2:
      UpdateIndexNumberDisplay(menu);
      return LT_INC_AND_PAUSE;
    case 3:
      if (IsDma3ManagerBusyWithBgCopy())
        return LT_PAUSE;
      break;
  }
  return LT_FINISH;
}

/** 1:1 `static u32 LoopedTask_RibbonsListMovePageUp(s32 state)` (pokenav_ribbons_list.c:544-575). */
function LoopedTask_RibbonsListMovePageUp(state: number): number {
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_RIBBONS_MON_MENU);
  switch (state) {
    case 0:
      switch (PokenavList_PageUp()) {
        case 0:
          return LT_FINISH;
        case 1:
          PlaySE(SE_SELECT);
          return LT_SET_STATE(2);
        case 2:
          PlaySE(SE_SELECT);
          break;
      }
      return LT_INC_AND_PAUSE;
    case 1:
      if (PokenavList_IsMoveWindowTaskActive())
        return LT_PAUSE;
    // fallthrough
    case 2:
      UpdateIndexNumberDisplay(menu);
      return LT_INC_AND_PAUSE;
    case 3:
      if (IsDma3ManagerBusyWithBgCopy())
        return LT_PAUSE;
      break;
  }
  return LT_FINISH;
}

/** 1:1 `static u32 LoopedTask_RibbonsListMovePageDown(s32 state)` (pokenav_ribbons_list.c:577-608). */
function LoopedTask_RibbonsListMovePageDown(state: number): number {
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_RIBBONS_MON_MENU);
  switch (state) {
    case 0:
      switch (PokenavList_PageDown()) {
        case 0:
          return LT_FINISH;
        case 1:
          PlaySE(SE_SELECT);
          return LT_SET_STATE(2);
        case 2:
          PlaySE(SE_SELECT);
          break;
      }
      return LT_INC_AND_PAUSE;
    case 1:
      if (PokenavList_IsMoveWindowTaskActive())
        return LT_PAUSE;
    // fallthrough
    case 2:
      UpdateIndexNumberDisplay(menu);
      return LT_INC_AND_PAUSE;
    case 3:
      if (IsDma3ManagerBusyWithBgCopy())
        return LT_PAUSE;
      break;
  }
  return LT_FINISH;
}

/** 1:1 `static u32 LoopedTask_RibbonsListReturnToMainMenu(s32 state)` (pokenav_ribbons_list.c:610-628). */
function LoopedTask_RibbonsListReturnToMainMenu(state: number): number {
  switch (state) {
    case 0:
      PlaySE(SE_SELECT);
      PokenavFadeScreen(POKENAV_FADE_TO_BLACK);
      SlideMenuHeaderDown();
      return LT_INC_AND_PAUSE;
    case 1:
      if (IsPaletteFadeActive())
        return LT_PAUSE;
      if (MainMenuLoopedTaskIsBusy())
        return LT_PAUSE;
      SetLeftHeaderSpritesInvisibility();
      break;
  }
  return LT_FINISH;
}

/** 1:1 `static u32 LoopedTask_RibbonsListOpenSummary(s32 state)` (pokenav_ribbons_list.c:630-644). */
function LoopedTask_RibbonsListOpenSummary(state: number): number {
  switch (state) {
    case 0:
      PlaySE(SE_SELECT);
      PokenavFadeScreen(POKENAV_FADE_TO_BLACK);
      return LT_INC_AND_PAUSE;
    case 1:
      if (IsPaletteFadeActive())
        return LT_PAUSE;
      break;
  }
  return LT_FINISH;
}

/** 1:1 `static void AddRibbonsMonListWindow(struct Pokenav_RibbonsMonMenu *menu)` (pokenav_ribbons_list.c:646-655). */
function AddRibbonsMonListWindow(menu: Pokenav_RibbonsMonMenu): void {
  let listCount = 0;
  menu.winid = AddWindow(sRibbonsMonListWindowTemplate);
  PutWindowTilemap(menu.winid);
  listCount = GetRibbonsMonListCount();
  DrawListIndexNumber(menu.winid, 0, listCount);
  CopyWindowToVram(menu.winid, COPYWIN_MAP);
  UpdateIndexNumberDisplay(menu);
}

/** 1:1 `static void UpdateIndexNumberDisplay(struct Pokenav_RibbonsMonMenu *menu)` (pokenav_ribbons_list.c:657-663). */
function UpdateIndexNumberDisplay(menu: Pokenav_RibbonsMonMenu): void {
  let listIndex = PokenavList_GetSelectedIndex();
  let listCount = GetRibbonsMonListCount();
  DrawListIndexNumber(menu.winid, listIndex + 1, listCount);
  CopyWindowToVram(menu.winid, COPYWIN_GFX);
}

/** 1:1 `static void DrawListIndexNumber(s32 windowId, s32 index, s32 max)` (pokenav_ribbons_list.c:665-676). */
function DrawListIndexNumber(windowId: number, index: number, max: number): void {
  const strbuf = new Uint8Array(16);
  let x = 0;
  let ptr = strbuf;
  ptr = ConvertIntToDecimalStringN(ptr, index, STR_CONV_MODE_RIGHT_ALIGN, 3);
  ptr[0] = CHAR_SLASH; ptr = ptr.subarray(1); // 1:1 `*ptr++ = CHAR_SLASH` (ptr = pointeur EOS)
  ConvertIntToDecimalStringN(ptr, max, STR_CONV_MODE_RIGHT_ALIGN, 3);
  x = GetStringCenterAlignXOffset(FONT_NORMAL, strbuf, 56);
  AddTextPrinterParameterized(windowId, FONT_NORMAL, strbuf, x, 1, TEXT_SKIP_DRAW, null);
}

/** 1:1 `static void CreateRibbonMonsList(void)` (pokenav_ribbons_list.c:678-694). */
function CreateRibbonMonsList(): void {
  const template: any = {}; // TRANSPILER-TODO struct locale struct PokenavListTemplate
  template.list = GetMonRibbonMonListData();
  template.count = GetRibbonsMonListCount();
  template.itemSize = 0 /* TRANSPILER-TODO sizeof(struct PokenavListItem) */;
  template.startIndex = GetRibbonListMenuCurrIndex();
  template.item_X = 12;
  //!< French Differences
  template.windowWidth = 18;
  //!< ^
  template.listTop = 1;
  template.maxShowed = 8;
  template.fillValue = 2;
  template.fontId = FONT_NORMAL;
  template.bufferItemFunc = BufferRibbonMonInfoText;
  template.iconDrawFunc = null;
  CreatePokenavList(sMonRibbonListBgTemplates[1], template, 0);
}

// Buffers the "Nickname gender/level" text for the ribbon mon list

/** 1:1 `static void BufferRibbonMonInfoText(struct PokenavListItem *listItem, u8 *dest)` (pokenav_ribbons_list.c:697-744). */
function BufferRibbonMonInfoText(listItem: any, dest: Uint8Array): void {
  let gender = 0;
  let level = 0;
  let s: any = null;
  let genderStr: any = null;
  let item = listItem;
  // Mon is in party
  if (item.boxId == TOTAL_BOXES_COUNT)
  {
    let mon = gPlayerParty[item.monId];
    gender = GetMonGender(mon);
    level = GetLevelFromMonExp(mon);
    GetMonData(mon, MON_DATA_NICKNAME, gStringVar3);
  }
  else
  {
    let mon = GetBoxedMonPtr(item.boxId, item.monId);
    gender = GetBoxMonGender(mon);
    level = GetLevelFromBoxMonExp(mon);
    GetBoxMonData(mon, MON_DATA_NICKNAME, gStringVar3);
  }
  StringGet_Nickname(gStringVar3);
  dest = GetStringClearToWidth(dest, FONT_NORMAL, gStringVar3, 60);
  switch (gender) {
    default:
      genderStr = sText_NoGenderSymbol;
      break;
    case MON_MALE:
      genderStr = sText_MaleSymbol;
      break;
    case MON_FEMALE:
      genderStr = sText_FemaleSymbol;
      break;
  }
  s = StringCopy(gStringVar1, genderStr);
  s[0] = CHAR_SLASH; s = s.subarray(1);         // 1:1 `*s++ = CHAR_SLASH`
  s[0] = CHAR_EXTRA_SYMBOL; s = s.subarray(1);  // 1:1 `*s++ = CHAR_EXTRA_SYMBOL`
  s[0] = CHAR_LV_2; s = s.subarray(1);          // 1:1 `*s++ = CHAR_LV_2`
  ConvertIntToDecimalStringN(s, level, STR_CONV_MODE_LEFT_ALIGN, 3);
  dest = GetStringClearToWidth(dest, FONT_NORMAL, gStringVar1, 54);
  ConvertIntToDecimalStringN(dest, item.data, STR_CONV_MODE_RIGHT_ALIGN, 2);
}

// ─── Préchargement assets (INCGFX) — 1:1 côté ROM = INCGFX instantané ; ici fetch async au fade
//     d'ouverture (précédent PrefetchListArrowAssets). Réinjecte dans les module-vars capturées null. ──
let _ribbonsListAssetsLoaded = false;
let _ribbonsListAssetsSettled = false;  // loaded OU échec (404) — débloque le gate même en cas de manque
let _ribbonsListAssetsLoadStarted = false;
/** Préchauffe la frame bg (list_bg) + la palette UI (list_ui) du list screen (idempotent). */
export function PrefetchRibbonsListAssets(): void { _loadRibbonsListAssets(); }
function _loadRibbonsListAssets(): void {
  if (_ribbonsListAssetsLoadStarted) return;
  _ribbonsListAssetsLoadStarted = true;
  void (async () => {
    try {
      const [tiles, tilemap, framePal, uiPal] = await Promise.all([
        loadTileBin('/decomp/em/pokenav/ribbons/list_bg.png', 4),
        loadTilemapBin('/decomp/em/pokenav/ribbons/list_bg.bin'),
        extractPngPlte('/decomp/em/pokenav/ribbons/list_bg.png'),
        loadGbaPal('/decomp/em/pokenav/ribbons/list_ui.pal'),
      ]);
      gMonRibbonListFrameTiles = tiles;
      gMonRibbonListFrameTilemap = tilemap;
      gMonRibbonListFramePal = framePal;
      sMonRibbonListUi_Pal = uiPal;
      _ribbonsListAssetsLoaded = true;
    } catch (e) {
      console.error('[pokenav_ribbons_list] chargement assets ribbons/list_bg ÉCHOUÉ (frame invisible)', e);
    } finally {
      _ribbonsListAssetsSettled = true;
    }
  })();
}
