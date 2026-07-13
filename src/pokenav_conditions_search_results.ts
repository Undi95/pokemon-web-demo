// @ts-nocheck — transpilé brut (types stricts au câblage fin ; wire-transpiled.cjs)
/**
 * pokenav_conditions_search_results.ts — miroir 1:1 de `D:/Projet 1/decomps/pokeemeraude/src/pokenav_conditions_search_results.c` (transpilé).
 *
 * Généré par scripts/transpile-c.cjs — revue humaine OBLIGATOIRE avant commit :
 * rapport des flags dans audit-reports/transpile/pokenav_conditions_search_results.md.
 * Politique préproc : build vanilla FR (NDEBUG/FRENCH définis, BUGFIX/UBFIX absents).
 */

import { CHAR_EXTRA_SYMBOL, CHAR_LV_2, CHAR_SLASH, EOS } from '../include/constants/characters';
import { PARTY_SIZE } from '../include/constants/global';
import { MON_FEMALE, MON_MALE } from '../include/constants/pokemon';
import { SE_SELECT } from '../include/constants/songs';
import { A_BUTTON, B_BUTTON, DPAD_DOWN, DPAD_LEFT, DPAD_RIGHT, DPAD_UP } from '../include/gba/io_reg';
import { MON_DATA_BEAUTY, MON_DATA_COOL, MON_DATA_CUTE, MON_DATA_NICKNAME, MON_DATA_SANITY_HAS_SPECIES, MON_DATA_SANITY_IS_EGG, MON_DATA_SMART, MON_DATA_TOUGH } from '../include/pokemon';
import { STR_CONV_MODE_LEFT_ALIGN, STR_CONV_MODE_RIGHT_ALIGN } from '../include/string_util';
import { FONT_NORMAL, TEXT_SKIP_DRAW } from '../include/text';
import { IsDma3ManagerBusyWithBgCopy } from './battle_bg';
import { JOY_NEW, JOY_REPEAT, PlaySE } from './battle_controllers';
import { DynamicPlaceholderTextUtil_ExpandPlaceholders, DynamicPlaceholderTextUtil_Reset, DynamicPlaceholderTextUtil_SetPlaceholderPtr } from './dynamic_placeholder_text_util';
import { GetMonData } from './engine/battle/party-storage';
import { IN_BOX_COUNT, TOTAL_BOXES_COUNT } from './engine/save/save-blocks';
import { getString } from '../harness/runtime/decomp-strings';
import { GetStringClearToWidth } from './international_string_util';
import { BG_PLTT_ID } from './palette';
import { GetBoxMonGender, GetLevelFromBoxMonExp, GetLevelFromMonExp, GetMonGender, gPlayerParty } from './pokemon';
import { GetBoxedMonPtr } from './pokemon_storage_system';
import { PLTT_SIZE_4BPP } from './sprite';
import { ConvertIntToDecimalStringN, StringCopy, StringGet_Nickname, gStringVar1, gStringVar2, gStringVar3 } from './string_util';
import { AddTextPrinterParameterized, encodeOwText } from './text';
import { AddWindow, COPYWIN_GFX, COPYWIN_MAP, ChangeBgX, ChangeBgY, CopyBgTilemapBufferToVram, CopyToBgTilemapBuffer, CopyWindowToVram, HideBg, PutWindowTilemap, RemoveWindow, ShowBg } from './window';
import type { Pokemon } from './engine/battle/party-storage';
import type { WindowTemplate } from './window';

// ═══ wire-transpiled (auto) : imports résolus par l'index + sentinelles ═══
import { __wireTodo } from './engine/wire-todo';
import { CreateLoopedTask, IsLoopedTaskActive } from './pokenav_looped_task';
import { AllocSubstruct, FreePokenavSubstruct, GetSubstructPtr } from './pokenav_resources';
// ─── WIRE-TODO : symboles transpilés SANS foyer dans le repo (throw à l'appel) ───
const AreLeftHeaderSpritesMoving: any = __wireTodo('AreLeftHeaderSpritesMoving');
import { CheckBoxMonSanityAt } from './pokemon_storage_system'; // câblé (ex-__wireTodo)
const CopyPaletteIntoBufferUnfaded: any = __wireTodo('CopyPaletteIntoBufferUnfaded');
const CreatePokenavList: any = __wireTodo('CreatePokenavList');
const DecompressAndCopyTileDataToVram: any = __wireTodo('DecompressAndCopyTileDataToVram');
const DestroyPokenavList: any = __wireTodo('DestroyPokenavList');
const FreeTempTileDataBuffersIfPossible: any = __wireTodo('FreeTempTileDataBuffersIfPossible');
const GetBoxMonData: any = __wireTodo('GetBoxMonData');
import { GetBoxMonDataAt } from './pokemon_storage_system'; // câblé (ex-__wireTodo)
const GetSelectedConditionSearch: any = __wireTodo('GetSelectedConditionSearch');
const InitBgTemplates: any = __wireTodo('InitBgTemplates');
const IsCreatePokenavListTaskActive: any = __wireTodo('IsCreatePokenavListTaskActive');
const IsPaletteFadeActive: any = __wireTodo('IsPaletteFadeActive');
const LT_SET_STATE: any = __wireTodo('LT_SET_STATE');
const LoadLeftHeaderGfxForIndex: any = __wireTodo('LoadLeftHeaderGfxForIndex');
const MainMenuLoopedTaskIsBusy: any = __wireTodo('MainMenuLoopedTaskIsBusy');
const PokenavFadeScreen: any = __wireTodo('PokenavFadeScreen');
const PokenavList_GetSelectedIndex: any = __wireTodo('PokenavList_GetSelectedIndex');
const PokenavList_IsMoveWindowTaskActive: any = __wireTodo('PokenavList_IsMoveWindowTaskActive');
const PokenavList_MoveCursorDown: any = __wireTodo('PokenavList_MoveCursorDown');
const PokenavList_MoveCursorUp: any = __wireTodo('PokenavList_MoveCursorUp');
const PokenavList_PageDown: any = __wireTodo('PokenavList_PageDown');
const PokenavList_PageUp: any = __wireTodo('PokenavList_PageUp');
const PrintHelpBarText: any = __wireTodo('PrintHelpBarText');
const SetBgTilemapBuffer: any = __wireTodo('SetBgTilemapBuffer');
const SetLeftHeaderSpritesInvisibility: any = __wireTodo('SetLeftHeaderSpritesInvisibility');
const ShowLeftHeaderGfx: any = __wireTodo('ShowLeftHeaderGfx');
const SlideMenuHeaderDown: any = __wireTodo('SlideMenuHeaderDown');
const gConditionSearchResultFramePal: any = __wireTodo('gConditionSearchResultFramePal');
const gConditionSearchResultTilemap: any = __wireTodo('gConditionSearchResultTilemap');
const gConditionSearchResultTiles: any = __wireTodo('gConditionSearchResultTiles');

// ─── constantes décomp inlinées (headers pas encore dans include/) ───
const POKENAV_SUBSTRUCT_CONDITION_SEARCH_RESULTS = 7; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_SUBSTRUCT_MON_LIST = 18; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_CONDITION_SEARCH_MENU = 100003; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_CONDITION_GRAPH_SEARCH = 100009; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const LT_INC_AND_CONTINUE = 1; // 1:1 include/pokenav.h:59 (à consolider dans include/)
const LT_CONTINUE = 3; // 1:1 include/pokenav.h:61 (à consolider dans include/)
const LT_FINISH = 4; // 1:1 include/pokenav.h:62 (à consolider dans include/)
const POKENAV_SUBSTRUCT_CONDITION_SEARCH_RESULTS_GFX = 8; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const LT_INC_AND_PAUSE = 0; // 1:1 include/pokenav.h:58 (à consolider dans include/)
const LT_PAUSE = 2; // 1:1 include/pokenav.h:60 (à consolider dans include/)
const HELPBAR_CONDITION_MON_LIST = 3; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const BG_COORD_SET = 0; // 1:1 include/bg.h:0 (à consolider dans include/)
const POKENAV_MENUITEM_CONDITION_SEARCH_COOL = 8; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_GFX_CONDITION_MENU = 1; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_FADE_FROM_BLACK = 1; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_FADE_TO_BLACK = 0; // 1:1 include/pokenav.h:0 (à consolider dans include/)

// enum pokenav_conditions_search_results.c:15
const CONDITION_SEARCH_FUNC_NONE = 0;
const CONDITION_SEARCH_FUNC_MOVE_UP = 1;
const CONDITION_SEARCH_FUNC_MOVE_DOWN = 2;
const CONDITION_SEARCH_FUNC_PAGE_UP = 3;
const CONDITION_SEARCH_FUNC_PAGE_DOWN = 4;
const CONDITION_SEARCH_FUNC_EXIT = 5;
const CONDITION_SEARCH_FUNC_SELECT_MON = 6;

/** 1:1 `struct Pokenav_SearchResults` (pokenav_conditions_search_results.c:26). */
interface Pokenav_SearchResults {
  callback: ((...args: any[]) => any) | null;
  loopedTaskId: number;
  fill1: Uint8Array;
  boxId: number;
  monId: number;
  conditionDataId: number;
  returnFromGraph: boolean;
  saveResultsList: boolean;
  monList: any;
}

/** 1:1 `struct Pokenav_SearchResultsGfx` (pokenav_conditions_search_results.c:39). */
interface Pokenav_SearchResultsGfx {
  callback: ((...args: any[]) => any) | null;
  loopedTaskId: number;
  winid: number;
  fromGraph: boolean;
  buff: Uint8Array;
}

// size: 0x810

/** 1:1 (pokenav_conditions_search_results.c:71) */
const sSearchMonDataIds = Uint32Array.from([
  MON_DATA_COOL,
  MON_DATA_BEAUTY,
  MON_DATA_CUTE,
  MON_DATA_SMART,
  MON_DATA_TOUGH,
]);

/** 1:1 (pokenav_conditions_search_results.c:73) */
const sConditionSearchLoopedTaskFuncs = [
  BuildPartyMonSearchResults,
  InitBoxMonSearchResults,
  BuildBoxMonSearchResults,
  ConvertConditionsToListRanks,
];

// TRANSPILER-TODO INCGFX : sListBg_Pal ← graphics/pokenav/condition/search_results_list.pal (pipeline assets : loadTileBin/loadGbaPal('/decomp/em/…'))
let sListBg_Pal: any = null;

/** 1:1 (pokenav_conditions_search_results.c:83) */
const sConditionSearchResultBgTemplates = [
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

/** 1:1 (pokenav_conditions_search_results.c:104) */
const sSearchResultLoopTaskFuncs = [
  null, // [CONDITION_SEARCH_FUNC_NONE]
  LoopedTask_MoveSearchListCursorUp, // [CONDITION_SEARCH_FUNC_MOVE_UP]
  LoopedTask_MoveSearchListCursorDown, // [CONDITION_SEARCH_FUNC_MOVE_DOWN]
  LoopedTask_MoveSearchListPageUp, // [CONDITION_SEARCH_FUNC_PAGE_UP]
  LoopedTask_MoveSearchListPageDown, // [CONDITION_SEARCH_FUNC_PAGE_DOWN]
  LoopedTask_ExitConditionSearchMenu, // [CONDITION_SEARCH_FUNC_EXIT]
  LoopedTask_SelectSearchResult, // [CONDITION_SEARCH_FUNC_SELECT_MON]
];

/** 1:1 (pokenav_conditions_search_results.c:115) */
const sSearchResultListMenuWindowTemplate = {
  bg: 1,
  tilemapLeft: 1,
  tilemapTop: 6,
  width: 7,
  height: 2,
  paletteNum: 1,
  baseBlock: 20,
};

/** 1:1 (pokenav_conditions_search_results.c:126) */
const sText_MaleSymbol = encodeOwText("{COLOR_HIGHLIGHT_SHADOW}{LIGHT_RED}{WHITE}{GREEN}♂{COLOR_HIGHLIGHT_SHADOW}{DARK_GRAY}{WHITE}{LIGHT_GRAY}");

/** 1:1 (pokenav_conditions_search_results.c:127) */
const sText_FemaleSymbol = encodeOwText("{COLOR_HIGHLIGHT_SHADOW}{LIGHT_GREEN}{WHITE}{BLUE}♀{COLOR_HIGHLIGHT_SHADOW}{DARK_GRAY}{WHITE}{LIGHT_GRAY}");

/** 1:1 (pokenav_conditions_search_results.c:128) */
const sText_NoGenderSymbol = encodeOwText("{UNK_SPACER}");

/** 1:1 `bool32 PokenavCallback_Init_ConditionSearch(void)` (pokenav_conditions_search_results.c:130-145). */
export function PokenavCallback_Init_ConditionSearch(): boolean {
  let menu = AllocSubstruct(POKENAV_SUBSTRUCT_CONDITION_SEARCH_RESULTS, 0 /* TRANSPILER-TODO sizeof(struct Pokenav_SearchResults) */);
  if (menu == null)
    return false;
  menu.monList = AllocSubstruct(POKENAV_SUBSTRUCT_MON_LIST, 0 /* TRANSPILER-TODO sizeof(struct PokenavMonList) */);
  if (menu.monList == null)
    return false;
  menu.callback = HandleConditionSearchInput_WaitSetup;
  menu.loopedTaskId = CreateLoopedTask(GetConditionSearchLoopedTask, 1);
  menu.returnFromGraph = false;
  menu.conditionDataId = sSearchMonDataIds[GetSelectedConditionSearch()];
  return true;
}

// return to search results from condition graph

/** 1:1 `bool32 PokenavCallback_Init_ReturnToMonSearchList(void)` (pokenav_conditions_search_results.c:148-159). */
export function PokenavCallback_Init_ReturnToMonSearchList(): boolean {
  let menu = AllocSubstruct(POKENAV_SUBSTRUCT_CONDITION_SEARCH_RESULTS, 0 /* TRANSPILER-TODO sizeof(struct Pokenav_SearchResults) */);
  if (menu == null)
    return false;
  menu.monList = GetSubstructPtr(POKENAV_SUBSTRUCT_MON_LIST);
  menu.callback = HandleConditionSearchInput;
  menu.returnFromGraph = true;
  menu.conditionDataId = sSearchMonDataIds[GetSelectedConditionSearch()];
  return true;
}

/** 1:1 `u32 GetConditionSearchResultsCallback(void)` (pokenav_conditions_search_results.c:161-165). */
export function GetConditionSearchResultsCallback(): number {
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_CONDITION_SEARCH_RESULTS);
  return menu.callback(menu);
}

/** 1:1 `void FreeSearchResultSubstruct1(void)` (pokenav_conditions_search_results.c:167-173). */
export function FreeSearchResultSubstruct1(): void {
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_CONDITION_SEARCH_RESULTS);
  if (!menu.saveResultsList)
    FreePokenavSubstruct(POKENAV_SUBSTRUCT_MON_LIST);
  FreePokenavSubstruct(POKENAV_SUBSTRUCT_CONDITION_SEARCH_RESULTS);
}

/** 1:1 `static bool32 HandleConditionSearchInput_WaitSetup(struct Pokenav_SearchResults *menu)` (pokenav_conditions_search_results.c:175-180). */
function HandleConditionSearchInput_WaitSetup(menu: Pokenav_SearchResults): boolean {
  if (!IsLoopedTaskActive(menu.loopedTaskId))
    menu.callback = HandleConditionSearchInput;
  return false;
}

/** 1:1 `static u32 HandleConditionSearchInput(struct Pokenav_SearchResults *menu)` (pokenav_conditions_search_results.c:182-219). */
function HandleConditionSearchInput(menu: Pokenav_SearchResults): number {
  if (JOY_REPEAT(DPAD_UP))
  {
    return CONDITION_SEARCH_FUNC_MOVE_UP;
  }
  else if (JOY_REPEAT(DPAD_DOWN))
  {
    return CONDITION_SEARCH_FUNC_MOVE_DOWN;
  }
  else if (JOY_NEW(DPAD_LEFT))
  {
    return CONDITION_SEARCH_FUNC_PAGE_UP;
  }
  else if (JOY_NEW(DPAD_RIGHT))
  {
    return CONDITION_SEARCH_FUNC_PAGE_DOWN;
  }
  else if (JOY_NEW(B_BUTTON))
  {
    // Exiting back to main search menu
    menu.saveResultsList = false;
    menu.callback = ReturnToConditionSearchList;
    return CONDITION_SEARCH_FUNC_EXIT;
  }
  else if (JOY_NEW(A_BUTTON))
  {
    // Entering graph menu
    menu.monList.currIndex = PokenavList_GetSelectedIndex();
    menu.saveResultsList = true;
    menu.callback = OpenConditionGraphFromSearchList;
    return CONDITION_SEARCH_FUNC_SELECT_MON;
  }
  else
  {
    return CONDITION_SEARCH_FUNC_NONE;
  }
}

/** 1:1 `static u32 ReturnToConditionSearchList(struct Pokenav_SearchResults *menu)` (pokenav_conditions_search_results.c:221-224). */
function ReturnToConditionSearchList(menu: Pokenav_SearchResults): number {
  return POKENAV_CONDITION_SEARCH_MENU;
}

/** 1:1 `static u32 OpenConditionGraphFromSearchList(struct Pokenav_SearchResults *menu)` (pokenav_conditions_search_results.c:226-229). */
function OpenConditionGraphFromSearchList(menu: Pokenav_SearchResults): number {
  return POKENAV_CONDITION_GRAPH_SEARCH;
}

/** 1:1 `static u32 GetReturningFromGraph(void)` (pokenav_conditions_search_results.c:231-235). */
function GetReturningFromGraph(): number {
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_CONDITION_SEARCH_RESULTS);
  return menu.returnFromGraph;
}

/** 1:1 `static struct PokenavMonListItem * GetSearchResultsMonDataList(void)` (pokenav_conditions_search_results.c:237-241). */
function GetSearchResultsMonDataList(): any {
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_CONDITION_SEARCH_RESULTS);
  return menu.monList.monData;
}

/** 1:1 `static u16 GetSearchResultsMonListCount(void)` (pokenav_conditions_search_results.c:243-247). */
function GetSearchResultsMonListCount(): number {
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_CONDITION_SEARCH_RESULTS);
  return menu.monList.listCount;
}

// data below has been set by ConvertConditionsToListRanks

/** 1:1 `static s32 GetSearchResultsSelectedMonRank(void)` (pokenav_conditions_search_results.c:250-255). */
function GetSearchResultsSelectedMonRank(): number {
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_CONDITION_SEARCH_RESULTS);
  let i = PokenavList_GetSelectedIndex();
  return menu.monList.monData[i].data;
}

/** 1:1 `static u16 GetSearchResultsCurrentListIndex(void)` (pokenav_conditions_search_results.c:257-261). */
function GetSearchResultsCurrentListIndex(): number {
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_CONDITION_SEARCH_RESULTS);
  return menu.monList.currIndex;
}

/** 1:1 `static u32 GetConditionSearchLoopedTask(s32 state)` (pokenav_conditions_search_results.c:263-266). */
function GetConditionSearchLoopedTask(state: number): number {
  return sConditionSearchLoopedTaskFuncs[state](state);
}

/** 1:1 `static u32 BuildPartyMonSearchResults(s32 state)` (pokenav_conditions_search_results.c:268-291). */
function BuildPartyMonSearchResults(state: number): number {
  let i = 0;
  const item = { boxId: 0, monId: 0, data: 0 };
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_CONDITION_SEARCH_RESULTS);
  menu.monList.listCount = 0;
  menu.monList.currIndex = 0;
  item.boxId = TOTAL_BOXES_COUNT;
  for (i = 0; i < PARTY_SIZE; i++)
  {
    let pokemon = gPlayerParty[i];
    if (!GetMonData(pokemon, MON_DATA_SANITY_HAS_SPECIES))
      return LT_INC_AND_CONTINUE;
    if (!GetMonData(pokemon, MON_DATA_SANITY_IS_EGG))
    {
      item.monId = i;
      item.data = GetMonData(pokemon, menu.conditionDataId);
      InsertMonListItem(menu, item);
    }
  }
  return LT_INC_AND_CONTINUE;
}

/** 1:1 `static u32 InitBoxMonSearchResults(s32 state)` (pokenav_conditions_search_results.c:293-299). */
function InitBoxMonSearchResults(state: number): number {
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_CONDITION_SEARCH_RESULTS);
  menu.monId = 0;
  menu.boxId = 0;
  return LT_INC_AND_CONTINUE;
}

/** 1:1 `static u32 BuildBoxMonSearchResults(s32 state)` (pokenav_conditions_search_results.c:301-334). */
function BuildBoxMonSearchResults(state: number): number {
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_CONDITION_SEARCH_RESULTS);
  let boxId = menu.boxId;
  let monId = menu.monId;
  let boxCount = 0;
  const item = { boxId: 0, monId: 0, data: 0 };
  while (boxId < TOTAL_BOXES_COUNT)
  {
    while (monId < IN_BOX_COUNT)
    {
      if (CheckBoxMonSanityAt(boxId, monId))
      {
        item.boxId = boxId;
        item.monId = monId;
        item.data = GetBoxMonDataAt(boxId, monId, menu.conditionDataId);
        InsertMonListItem(menu, item);
      }
      boxCount++;
      monId++;
      if (boxCount > TOTAL_BOXES_COUNT)
      {
        menu.boxId = boxId;
        menu.monId = monId;
        return LT_CONTINUE;
      }
    }
    monId = 0;
    boxId++;
  }
  return LT_INC_AND_CONTINUE;
}

// Data below is initially set by BuildPartyMonSearchResults / BuildBoxMonSearchResults, and

// is the Pokémon's condition value for the condition they are sorted by.

// The condition value in data is then overwritten with their ranking.

/** 1:1 `static u32 ConvertConditionsToListRanks(s32 state)` (pokenav_conditions_search_results.c:339-361). */
function ConvertConditionsToListRanks(state: number): number {
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_CONDITION_SEARCH_RESULTS);
  let listCount = menu.monList.listCount;
  let prevCondition = menu.monList.monData[0].data;
  let i = 0;
  menu.monList.monData[0].data = 1;
  for (i = 1; i < listCount; i++)
  {
    if (menu.monList.monData[i].data == prevCondition)
    {
      // Same condition value as prev, share rank
      menu.monList.monData[i].data = menu.monList.monData[i - 1].data;
    }
    else
    {
      prevCondition = menu.monList.monData[i].data;
      menu.monList.monData[i].data = i + 1;
    }
  }
  menu.returnFromGraph = true;
  return LT_FINISH;
}

/** 1:1 `static void InsertMonListItem(struct Pokenav_SearchResults *menu, struct PokenavMonListItem *item)` (pokenav_conditions_search_results.c:363-381). */
function InsertMonListItem(menu: Pokenav_SearchResults, item: any): void {
  let left = 0;
  let right = menu.monList.listCount;
  let insertionIdx = left + Math.trunc((right - left) / 2);
  while (right != insertionIdx)
  {
    if (item.data > menu.monList.monData[insertionIdx].data)
      right = insertionIdx;
    else
      left = insertionIdx + 1;
    insertionIdx = left + Math.trunc((right - left) / 2);
  }
  for (right = menu.monList.listCount; right > insertionIdx; right--)
    menu.monList.monData[right] = menu.monList.monData[right - 1];
  menu.monList.monData[insertionIdx] = item /* TRANSPILER-TODO deref */;
  menu.monList.listCount++;
}

/** 1:1 `bool32 OpenConditionSearchResults(void)` (pokenav_conditions_search_results.c:383-392). */
export function OpenConditionSearchResults(): boolean {
  let gfx = AllocSubstruct(POKENAV_SUBSTRUCT_CONDITION_SEARCH_RESULTS_GFX, 0 /* TRANSPILER-TODO sizeof(struct Pokenav_SearchResultsGfx) */);
  if (gfx == null)
    return false;
  gfx.loopedTaskId = CreateLoopedTask(LoopedTask_OpenConditionSearchResults, 1);
  gfx.callback = GetSearchResultCurrentLoopedTaskActive;
  gfx.fromGraph = false;
  return true;
}

/** 1:1 `bool32 OpenConditionSearchListFromGraph(void)` (pokenav_conditions_search_results.c:394-403). */
export function OpenConditionSearchListFromGraph(): boolean {
  let gfx = AllocSubstruct(POKENAV_SUBSTRUCT_CONDITION_SEARCH_RESULTS_GFX, 0 /* TRANSPILER-TODO sizeof(struct Pokenav_SearchResultsGfx) */);
  if (gfx == null)
    return false;
  gfx.loopedTaskId = CreateLoopedTask(LoopedTask_OpenConditionSearchResults, 1);
  gfx.callback = GetSearchResultCurrentLoopedTaskActive;
  gfx.fromGraph = true;
  return true;
}

/** 1:1 `void CreateSearchResultsLoopedTask(s32 idx)` (pokenav_conditions_search_results.c:405-410). */
export function CreateSearchResultsLoopedTask(idx: number): void {
  let gfx = GetSubstructPtr(POKENAV_SUBSTRUCT_CONDITION_SEARCH_RESULTS_GFX);
  gfx.loopedTaskId = CreateLoopedTask(sSearchResultLoopTaskFuncs[idx], 1);
  gfx.callback = GetSearchResultCurrentLoopedTaskActive;
}

/** 1:1 `bool32 IsSearchResultLoopedTaskActive(void)` (pokenav_conditions_search_results.c:412-416). */
export function IsSearchResultLoopedTaskActive(): boolean {
  let gfx = GetSubstructPtr(POKENAV_SUBSTRUCT_CONDITION_SEARCH_RESULTS_GFX);
  return gfx.callback();
}

/** 1:1 `bool32 GetSearchResultCurrentLoopedTaskActive(void)` (pokenav_conditions_search_results.c:418-422). */
export function GetSearchResultCurrentLoopedTaskActive(): boolean {
  let gfx = GetSubstructPtr(POKENAV_SUBSTRUCT_CONDITION_SEARCH_RESULTS_GFX);
  return IsLoopedTaskActive(gfx.loopedTaskId);
}

/** 1:1 `void FreeSearchResultSubstruct2(void)` (pokenav_conditions_search_results.c:424-430). */
export function FreeSearchResultSubstruct2(): void {
  let gfx = GetSubstructPtr(POKENAV_SUBSTRUCT_CONDITION_SEARCH_RESULTS_GFX);
  DestroyPokenavList();
  RemoveWindow(gfx.winid);
  FreePokenavSubstruct(POKENAV_SUBSTRUCT_CONDITION_SEARCH_RESULTS_GFX);
}

/** 1:1 `static u32 LoopedTask_OpenConditionSearchResults(s32 state)` (pokenav_conditions_search_results.c:432-490). */
function LoopedTask_OpenConditionSearchResults(state: number): number {
  let gfx = GetSubstructPtr(POKENAV_SUBSTRUCT_CONDITION_SEARCH_RESULTS_GFX);
  switch (state) {
    case 0:
      InitBgTemplates(sConditionSearchResultBgTemplates, sConditionSearchResultBgTemplates.length);
      //!< French Difference
      DecompressAndCopyTileDataToVram(1, gConditionSearchResultTiles, 0, 0, 0);
      SetBgTilemapBuffer(1, gfx.buff);
      CopyToBgTilemapBuffer(1, gConditionSearchResultTilemap, 0, 0);
      CopyBgTilemapBufferToVram(1);
      CopyPaletteIntoBufferUnfaded(gConditionSearchResultFramePal, 16, PLTT_SIZE_4BPP);
      CopyBgTilemapBufferToVram(1);
      return LT_INC_AND_PAUSE;
    case 1:
      if (FreeTempTileDataBuffersIfPossible())
        return LT_PAUSE;
      if (!GetReturningFromGraph())
        return LT_PAUSE;
      return LT_INC_AND_PAUSE;
    case 2:
      if (FreeTempTileDataBuffersIfPossible())
        return LT_PAUSE;
      CopyPaletteIntoBufferUnfaded(sListBg_Pal, BG_PLTT_ID(2), sListBg_Pal.length /* TRANSPILER-TODO sizeof */);
      CreateSearchResultsList();
      return LT_INC_AND_PAUSE;
    case 3:
      if (IsCreatePokenavListTaskActive())
        return LT_PAUSE;
      AddSearchResultListMenuWindow(gfx);
      PrintHelpBarText(HELPBAR_CONDITION_MON_LIST);
      return LT_INC_AND_PAUSE;
    case 4:
      if (FreeTempTileDataBuffersIfPossible())
        return LT_PAUSE;
      ChangeBgX(1, 0, BG_COORD_SET);
      ChangeBgY(1, 0, BG_COORD_SET);
      ShowBg(1);
      ShowBg(2);
      HideBg(3);
      if (!gfx.fromGraph)
      {
        let searchGfxId = GetSelectedConditionSearch() + POKENAV_MENUITEM_CONDITION_SEARCH_COOL;
        LoadLeftHeaderGfxForIndex(searchGfxId);
        ShowLeftHeaderGfx(searchGfxId, true, false);
        ShowLeftHeaderGfx(POKENAV_GFX_CONDITION_MENU, true, false);
      }
      PokenavFadeScreen(POKENAV_FADE_FROM_BLACK);
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

/** 1:1 `static u32 LoopedTask_MoveSearchListCursorUp(s32 state)` (pokenav_conditions_search_results.c:492-523). */
function LoopedTask_MoveSearchListCursorUp(state: number): number {
  let gfx = GetSubstructPtr(POKENAV_SUBSTRUCT_CONDITION_SEARCH_RESULTS_GFX);
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
      PrintSearchResultListMenuItems(gfx);
      return LT_INC_AND_PAUSE;
    case 3:
      if (IsDma3ManagerBusyWithBgCopy())
        return LT_PAUSE;
      break;
  }
  return LT_FINISH;
}

/** 1:1 `static u32 LoopedTask_MoveSearchListCursorDown(s32 state)` (pokenav_conditions_search_results.c:525-556). */
function LoopedTask_MoveSearchListCursorDown(state: number): number {
  let gfx = GetSubstructPtr(POKENAV_SUBSTRUCT_CONDITION_SEARCH_RESULTS_GFX);
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
      PrintSearchResultListMenuItems(gfx);
      return LT_INC_AND_PAUSE;
    case 3:
      if (IsDma3ManagerBusyWithBgCopy())
        return LT_PAUSE;
      break;
  }
  return LT_FINISH;
}

/** 1:1 `static u32 LoopedTask_MoveSearchListPageUp(s32 state)` (pokenav_conditions_search_results.c:558-589). */
function LoopedTask_MoveSearchListPageUp(state: number): number {
  let gfx = GetSubstructPtr(POKENAV_SUBSTRUCT_CONDITION_SEARCH_RESULTS_GFX);
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
      PrintSearchResultListMenuItems(gfx);
      return LT_INC_AND_PAUSE;
    case 3:
      if (IsDma3ManagerBusyWithBgCopy())
        return LT_PAUSE;
      break;
  }
  return LT_FINISH;
}

/** 1:1 `static u32 LoopedTask_MoveSearchListPageDown(s32 state)` (pokenav_conditions_search_results.c:591-622). */
function LoopedTask_MoveSearchListPageDown(state: number): number {
  let gfx = GetSubstructPtr(POKENAV_SUBSTRUCT_CONDITION_SEARCH_RESULTS_GFX);
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
      PrintSearchResultListMenuItems(gfx);
      return LT_INC_AND_PAUSE;
    case 3:
      if (IsDma3ManagerBusyWithBgCopy())
        return LT_PAUSE;
      break;
  }
  return LT_FINISH;
}

/** 1:1 `static u32 LoopedTask_ExitConditionSearchMenu(s32 state)` (pokenav_conditions_search_results.c:624-642). */
function LoopedTask_ExitConditionSearchMenu(state: number): number {
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

/** 1:1 `static u32 LoopedTask_SelectSearchResult(s32 state)` (pokenav_conditions_search_results.c:644-658). */
function LoopedTask_SelectSearchResult(state: number): number {
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

/** 1:1 `static void AddSearchResultListMenuWindow(struct Pokenav_SearchResultsGfx *gfx)` (pokenav_conditions_search_results.c:660-666). */
function AddSearchResultListMenuWindow(gfx: Pokenav_SearchResultsGfx): void {
  gfx.winid = AddWindow(sSearchResultListMenuWindowTemplate);
  PutWindowTilemap(gfx.winid);
  CopyWindowToVram(gfx.winid, COPYWIN_MAP);
  PrintSearchResultListMenuItems(gfx);
}

/** 1:1 `static void PrintSearchResultListMenuItems(struct Pokenav_SearchResultsGfx *gfx)` (pokenav_conditions_search_results.c:668-679). */
function PrintSearchResultListMenuItems(gfx: Pokenav_SearchResultsGfx): void {
  let rank = GetSearchResultsSelectedMonRank();
  DynamicPlaceholderTextUtil_Reset();
  DynamicPlaceholderTextUtil_SetPlaceholderPtr(0, gStringVar1);
  void 0 /* TRANSPILER-TODO ASSIGN: *gStringVar1 = EOS */;
  DynamicPlaceholderTextUtil_ExpandPlaceholders(gStringVar2, getString('gText_NumberIndex'));
  AddTextPrinterParameterized(gfx.winid, FONT_NORMAL, gStringVar2, 4, 1, TEXT_SKIP_DRAW, null);
  ConvertIntToDecimalStringN(gStringVar1, rank, STR_CONV_MODE_RIGHT_ALIGN, 3);
  AddTextPrinterParameterized(gfx.winid, FONT_NORMAL, gStringVar1, 34, 1, TEXT_SKIP_DRAW, null);
  CopyWindowToVram(gfx.winid, COPYWIN_GFX);
}

/** 1:1 `static void CreateSearchResultsList(void)` (pokenav_conditions_search_results.c:681-698). */
function CreateSearchResultsList(): void {
  const template: any = {}; // TRANSPILER-TODO struct locale struct PokenavListTemplate
  template.list = GetSearchResultsMonDataList();
  template.count = GetSearchResultsMonListCount();
  template.itemSize = 0 /* TRANSPILER-TODO sizeof(struct PokenavListItem) */;
  template.startIndex = GetSearchResultsCurrentListIndex();
  template.item_X = 12;
  //!< French Difference
  template.windowWidth = 18;
  //!< ^
  template.listTop = 1;
  template.maxShowed = 8;
  template.fillValue = 2;
  template.fontId = FONT_NORMAL;
  template.bufferItemFunc = BufferSearchMonListItem;
  template.iconDrawFunc = null;
  CreatePokenavList(sConditionSearchResultBgTemplates[1], template, 0);
}

/** 1:1 `static void BufferSearchMonListItem(struct PokenavMonListItem *item, u8 *dest)` (pokenav_conditions_search_results.c:700-744). */
function BufferSearchMonListItem(item: any, dest: Uint8Array): void {
  let gender = 0;
  let level = 0;
  let s: any = null;
  let genderStr: any = null;
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
  void 0 /* TRANSPILER-TODO ASSIGN: *s++ = CHAR_SLASH */;
  void 0 /* TRANSPILER-TODO ASSIGN: *s++ = CHAR_EXTRA_SYMBOL */;
  void 0 /* TRANSPILER-TODO ASSIGN: *s++ = CHAR_LV_2 */;
  ConvertIntToDecimalStringN(s, level, STR_CONV_MODE_LEFT_ALIGN, 3);
  GetStringClearToWidth(dest, FONT_NORMAL, gStringVar1, 40);
}
