// @ts-nocheck — transpilé brut (types stricts au câblage fin ; wire-transpiled.cjs)
/**
 * pokenav_list.ts — miroir 1:1 de `D:/Projet 1/decomps/pokeemeraude/src/pokenav_list.c` (transpilé).
 *
 * Généré par scripts/transpile-c.cjs — revue humaine OBLIGATOIRE avant commit :
 * rapport des flags dans audit-reports/transpile/pokenav_list.md.
 * Politique préproc : build vanilla FR (NDEBUG/FRENCH définis, BUGFIX/UBFIX absents).
 */

import { LoadCompressedSpriteSheet, SpriteCallbackDummy } from '../harness/runtime/decomp-globals';
import { ST_OAM_4BPP, ST_OAM_OBJ_NORMAL } from '../harness/runtime/decomp-helpers';
import { TEXT_COLOR_DARK_GRAY, TEXT_COLOR_LIGHT_RED, TEXT_COLOR_RED, TEXT_COLOR_TRANSPARENT, TEXT_COLOR_WHITE } from '../include/constants/characters';
import { ST_OAM_AFFINE_OFF } from '../include/sprite';
import { FONT_NARROW, TEXT_SKIP_DRAW } from '../include/text';
import { IsDma3ManagerBusyWithBgCopy } from './battle_bg';
import { PIXEL_FILL } from './window';
import { getString } from '../harness/runtime/decomp-strings';
import { FillWindowTilesByRow } from './international_string_util';
import { AddTextPrinterParameterized3 } from './menu';
import { CreateSprite, DestroySprite, FreeSpritePaletteByTag, FreeSpriteTilesByTag, gDummySpriteAffineAnimTable, gDummySpriteAnimTable, gSprites } from './sprite';
import { AddTextPrinterParameterized } from './text';
import { AddWindow, COPYWIN_FULL, COPYWIN_GFX, COPYWIN_MAP, ChangeBgX, ChangeBgY, CopyBgTilemapBufferToVram, CopyWindowToVram, FillBgTilemapBufferRect_Palette0, FillWindowPixelBuffer, FillWindowPixelRect, GetBgTilemapBuffer, GetWindowAttribute, PutWindowTilemap, RemoveWindow, WINDOW_BG } from './window';
import type { DecompSprite } from '../harness/runtime/decomp-runtime';
import type {  SpriteTemplate } from './sprite';
import type { BgTemplate, WindowTemplate } from './window';

// ═══ wire-transpiled (auto) : imports résolus par l'index + sentinelles ═══
import type { OamData } from '../include/gba/types';
import { __wireTodo } from './engine/wire-todo';
import { CreateLoopedTask, FuncIsActiveLoopedTask, IsLoopedTaskActive } from './pokenav_looped_task';
import { AllocSubstruct, FreePokenavSubstruct, GetSubstructPtr } from './pokenav_resources';
import { BgDmaFill } from '../harness/runtime/decomp-globals';
import { ClearRematchPokeballIcon } from './pokenav_match_call_gfx';
import { GetMatchCallFlavorText } from './pokenav_match_call_list';
import { LT_SET_STATE } from './pokenav_looped_task';
import { Pokenav_AllocAndLoadPalettes, SetBgTilemapBuffer } from './pokenav_main_menu';
// ─── WIRE-TODO : symboles transpilés SANS foyer dans le repo (throw à l'appel) ───
const CopyWindowRectToVram: any = __wireTodo('CopyWindowRectToVram');
const CpuFastFill8: any = __wireTodo('CpuFastFill8');
const GetBgY: any = __wireTodo('GetBgY');
// ─── constantes décomp inlinées (headers pas encore dans include/) ───
const POKENAV_SUBSTRUCT_LIST = 17; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const LT_PAUSE = 2; // 1:1 include/pokenav.h:60 (à consolider dans include/)
const LT_INC_AND_PAUSE = 0; // 1:1 include/pokenav.h:58 (à consolider dans include/)
const LT_INC_AND_CONTINUE = 1; // 1:1 include/pokenav.h:59 (à consolider dans include/)
const LT_FINISH = 4; // 1:1 include/pokenav.h:62 (à consolider dans include/)
const BG_COORD_SET = 0; // 1:1 include/bg.h:0 (à consolider dans include/)
const BG_COORD_SUB = 2; // 1:1 include/bg.h:0 (à consolider dans include/)
const LT_CONTINUE = 3; // 1:1 include/pokenav.h:61 (à consolider dans include/)
const BG_COORD_ADD = 1; // 1:1 include/bg.h:0 (à consolider dans include/)
const CHECK_PAGE_STRATEGY = 0; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const CHECK_PAGE_POKEMON = 1; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const CHECK_PAGE_INTRO_1 = 2; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const CHECK_PAGE_INTRO_2 = 3; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const WINDOW_TILE_DATA = 7; // 1:1 include/window.h:0 (à consolider dans include/)
const WINDOW_NONE = 255; // 1:1 include/window.h:43 (à consolider dans include/)

const GFXTAG_ARROW = 10; // 1:1 pokenav_list.c:11

const PALTAG_ARROW = 20; // 1:1 pokenav_list.c:12

/** 1:1 `struct PokenavListMenuWindow` (pokenav_list.c:14). */
interface PokenavListMenuWindow {
  bg: number;
  fillValue: number;
  x: number;
  y: number;
  width: number;
  fontId: number;
  tileOffset: number;
  windowId: number;
  unkA: number;
  numPrinted: number;
  numToPrint: number;
}

/** 1:1 `struct PokenavListWindowState` (pokenav_list.c:28). */
interface PokenavListWindowState {
  windowTopIndex: number;
  listLength: number;
  entriesOffscreen: number;
  selectedIndexOffset: number;
  entriesOnscreen: number;
  listItemSize: number;
  listPtr: any;
}

/** 1:1 `struct PokenavListSub` (pokenav_list.c:40). */
interface PokenavListSub {
  listWindow: PokenavListMenuWindow;
  printStart: number;
  printIndex: number;
  itemSize: number;
  listPtr: any;
  startBgY: number;
  endBgY: number;
  loopedTaskId: number;
  moveDelta: number;
  bgMoveType: number;
  bufferItemFunc: number;
  iconDrawFunc: ((...args: any[]) => any) | null;
  rightArrow: DecompSprite | null;
  upArrow: DecompSprite | null;
  downArrow: DecompSprite | null;
  itemTextBuffer: Uint8Array;
}

/** 1:1 `struct PokenavList` (pokenav_list.c:60). */
interface PokenavList {
  sub: PokenavListSub;
  tilemapBuffer: Uint8Array;
  windowState: PokenavListWindowState;
  eraseIndex: number;
  loopedTaskId: number;
}

// TRANSPILER-TODO INCGFX : sListArrow_Pal ← graphics/pokenav/list_arrows.png (pipeline assets : loadTileBin/loadGbaPal('/decomp/em/…'))
let sListArrow_Pal: any = null;

// TRANSPILER-TODO INCGFX : sListArrow_Gfx ← graphics/pokenav/list_arrows.png (pipeline assets : loadTileBin/loadGbaPal('/decomp/em/…'))
let sListArrow_Gfx: any = null;

/** 1:1 (pokenav_list.c:99) */
let sMoveWindowDownIndex = 0;

// Read, but pointlessly

/** 1:1 `bool32 CreatePokenavList(const struct BgTemplate *bgTemplate, struct PokenavListTemplate *listTemplate, s32 tileOffset)` (pokenav_list.c:101-113). */
export function CreatePokenavList(bgTemplate: BgTemplate, listTemplate: any, tileOffset: number): boolean {
  let list = AllocSubstruct(POKENAV_SUBSTRUCT_LIST, 0 /* TRANSPILER-TODO sizeof(struct PokenavList) */);
  if (list == null)
    return false;
  // 1:1 décomp `struct PokenavList { PokenavListSub sub; u8 tilemapBuffer[BG_SCREEN_SIZE];
  // PokenavListWindowState windowState; ... }` — champs structs imbriqués zéro-init en C. En JS le
  // substruct est un objet vide → on crée les sous-objets/buffer (sinon list.windowState = undefined
  // → crash InitPokenavListWindowState). Les champs de sub.listWindow sont remplis par CopyPokenavListMenuTemplate.
  // 1:1 C type-punning : `struct PokenavListSub sub` est le PREMIER champ de `struct PokenavList`
  // (offset 0), donc `GetSubstructPtr(LIST)` casté en `PokenavListSub*` == `&list` (même adresse).
  // Plusieurs fonctions (LoopedTask_PrintListItems, InitPokenavListWindow...) accèdent `list->X`
  // comme le SUB (list.listWindow, list.printStart...). En JS on émule via self-ref `list.sub = list`
  // → `list.listWindow` ≡ `list.sub.listWindow` (les 2 patterns d'accès pointent le même objet).
  list.sub = list;
  list.listWindow = {};
  list.windowState = {};
  list.tilemapBuffer = new Uint8Array(0x800); // BG_SCREEN_SIZE
  list.itemTextBuffer = new Uint8Array(64); // 1:1 `u8 itemTextBuffer[64]` (pokenav_list.c:57)
  InitPokenavListWindowState(list.windowState, listTemplate);
  if (!CopyPokenavListMenuTemplate(list.sub, bgTemplate, listTemplate, tileOffset))
    return false;
  CreateLoopedTask(LoopedTask_CreatePokenavList, 6);
  return true;
}

/** 1:1 `bool32 IsCreatePokenavListTaskActive(void)` (pokenav_list.c:115-118). */
export function IsCreatePokenavListTaskActive(): boolean {
  return FuncIsActiveLoopedTask(LoopedTask_CreatePokenavList);
}

/** 1:1 `void DestroyPokenavList(void)` (pokenav_list.c:120-126). */
export function DestroyPokenavList(): void {
  let list = GetSubstructPtr(POKENAV_SUBSTRUCT_LIST);
  DestroyListArrows(list.sub);
  RemoveWindow(list.sub.listWindow.windowId);
  FreePokenavSubstruct(POKENAV_SUBSTRUCT_LIST);
}

/** 1:1 `static u32 LoopedTask_CreatePokenavList(s32 state)` (pokenav_list.c:128-164). */
function LoopedTask_CreatePokenavList(state: number): number {
  let list: any = null;
  if (IsDma3ManagerBusyWithBgCopy())
    return LT_PAUSE;
  list = GetSubstructPtr(POKENAV_SUBSTRUCT_LIST);
  switch (state) {
    case 0:
      InitPokenavListBg(list);
      return LT_INC_AND_PAUSE;
    case 1:
      InitPokenavListWindow(list.sub.listWindow);
      return LT_INC_AND_PAUSE;
    case 2:
      InitListItems(list.windowState, list.sub);
      return LT_INC_AND_PAUSE;
    case 3:
      if (IsPrintListItemsTaskActive())
      {
        return LT_PAUSE;
      }
      else
      {
        LoadListArrowGfx();
        return LT_INC_AND_CONTINUE;
      }
    case 4:
      CreateListArrowSprites(list.windowState, list.sub);
      return LT_FINISH;
    default:
      return LT_FINISH;
  }
}

/** 1:1 `static void InitPokenavListBg(struct PokenavList *list)` (pokenav_list.c:166-177). */
function InitPokenavListBg(list: PokenavList): void {
  let tileNum = (list.sub.listWindow.fillValue << 12) | list.sub.listWindow.tileOffset;
  BgDmaFill(list.sub.listWindow.bg, PIXEL_FILL(1), list.sub.listWindow.tileOffset, 1);
  BgDmaFill(list.sub.listWindow.bg, PIXEL_FILL(4), list.sub.listWindow.tileOffset + 1, 1);
  SetBgTilemapBuffer(list.sub.listWindow.bg, list.tilemapBuffer);
  FillBgTilemapBufferRect_Palette0(list.sub.listWindow.bg, tileNum, 0, 0, 32, 32);
  ChangeBgY(list.sub.listWindow.bg, 0, BG_COORD_SET);
  ChangeBgX(list.sub.listWindow.bg, 0, BG_COORD_SET);
  ChangeBgY(list.sub.listWindow.bg, list.sub.listWindow.y << 11, BG_COORD_SUB);
  CopyBgTilemapBufferToVram(list.sub.listWindow.bg);
}

/** 1:1 `static void InitPokenavListWindow(struct PokenavListMenuWindow *listWindow)` (pokenav_list.c:179-184). */
function InitPokenavListWindow(listWindow: PokenavListMenuWindow): void {
  FillWindowPixelBuffer(listWindow.windowId, PIXEL_FILL(1));
  PutWindowTilemap(listWindow.windowId);
  CopyWindowToVram(listWindow.windowId, COPYWIN_MAP);
}

/** 1:1 `static void InitListItems(struct PokenavListWindowState *windowState, struct PokenavListSub *subPtr)` (pokenav_list.c:186-193). */
function InitListItems(windowState: PokenavListWindowState, subPtr: PokenavListSub): void {
  let numToPrint = windowState.listLength - windowState.windowTopIndex;
  if (numToPrint > windowState.entriesOnscreen)
    numToPrint = windowState.entriesOnscreen;
  PrintListItems(windowState.listPtr, windowState.windowTopIndex, numToPrint, windowState.listItemSize, 0, subPtr);
}

/** 1:1 `static void PrintListItems(void *listPtr, u32 topIndex, u32 numItems, u32 itemSize, u32 printStart, struct PokenavListSub *list)` (pokenav_list.c:195-207). */
function PrintListItems(listPtr: any, topIndex: number, numItems: number, itemSize: number, printStart: number, list: PokenavListSub): void {
  if (numItems == 0)
    return;
  // 1:1 décomp `list->listPtr = listPtr + topIndex * itemSize` = arithmétique de POINTEUR (avance
  // au topIndex-ème item). En JS `listPtr` est un TABLEAU d'entrées → on garde le tableau base et on
  // indexe par `printIndex` (= topIndex, incrémenté) dans LoopedTask_PrintListItems (pas d'arithmétique).
  list.listPtr = listPtr;
  list.itemSize = itemSize;
  list.listWindow.numPrinted = 0;
  list.listWindow.numToPrint = numItems;
  list.printIndex = topIndex;
  list.printStart = printStart;
  CreateLoopedTask(LoopedTask_PrintListItems, 5);
}

/** 1:1 `static bool32 IsPrintListItemsTaskActive(void)` (pokenav_list.c:209-212). */
function IsPrintListItemsTaskActive(): boolean {
  return FuncIsActiveLoopedTask(LoopedTask_PrintListItems);
}

/** 1:1 `static u32 LoopedTask_PrintListItems(s32 state)` (pokenav_list.c:214-251). */
function LoopedTask_PrintListItems(state: number): number {
  let row = 0;
  let listSub = GetSubstructPtr(POKENAV_SUBSTRUCT_LIST);
  switch (state) {
    case 0:
      row = (listSub.listWindow.unkA + listSub.listWindow.numPrinted + listSub.printStart) & 0xF;
      // 1:1 : `bufferItemFunc(listPtr, ...)` où listPtr POINTE l'entrée courante ; ici listPtr = tableau
      // base, l'entrée courante = listPtr[printIndex] (émulation JS de l'arithmétique de pointeur).
      listSub.bufferItemFunc(listSub.listPtr[listSub.printIndex], listSub.itemTextBuffer);
      if (listSub.iconDrawFunc != null)
        listSub.iconDrawFunc(listSub.listWindow.windowId, listSub.printIndex, row);
      //!< French Difference
      AddTextPrinterParameterized(listSub.listWindow.windowId, listSub.listWindow.fontId, listSub.itemTextBuffer, 10, (row << 4) + 1, TEXT_SKIP_DRAW, null);
      if (++listSub.listWindow.numPrinted >= listSub.listWindow.numToPrint)
      {
        // Finished printing items. If icons were being drawn, draw the
        // window tilemap and graphics. Otherwise just do the graphics
        if (listSub.iconDrawFunc != null)
          CopyWindowToVram(listSub.listWindow.windowId, COPYWIN_FULL);
        else
          CopyWindowToVram(listSub.listWindow.windowId, COPYWIN_GFX);
        return LT_INC_AND_PAUSE;
      }
      else
      {
        // (listPtr reste le tableau base ; le walk vers l'entrée suivante = printIndex++)
        listSub.printIndex++;
        return LT_CONTINUE;
      }
    case 1:
      if (IsDma3ManagerBusyWithBgCopy())
        return LT_PAUSE;
      return LT_FINISH;
  }
  return LT_FINISH;
}

/** 1:1 `static bool32 ShouldShowUpArrow(void)` (pokenav_list.c:253-258). */
function ShouldShowUpArrow(): boolean {
  let list = GetSubstructPtr(POKENAV_SUBSTRUCT_LIST);
  return (list.windowState.windowTopIndex != 0);
}

/** 1:1 `static bool32 ShouldShowDownArrow(void)` (pokenav_list.c:260-266). */
function ShouldShowDownArrow(): boolean {
  let list = GetSubstructPtr(POKENAV_SUBSTRUCT_LIST);
  let windowState = list.windowState;
  return (windowState.windowTopIndex + windowState.entriesOnscreen < windowState.listLength);
}

/** 1:1 `static void MoveListWindow(s32 delta, bool32 printItems)` (pokenav_list.c:268-291). */
function MoveListWindow(delta: number, printItems: boolean): void {
  let list = GetSubstructPtr(POKENAV_SUBSTRUCT_LIST);
  let windowState = list.windowState;
  if (delta < 0)
  {
    if (windowState.windowTopIndex + delta < 0)
      delta = -1 * windowState.windowTopIndex;
    if (printItems)
      PrintListItems(windowState.listPtr, windowState.windowTopIndex + delta, delta * -1, windowState.listItemSize, delta, list.sub);
  }
  else if (printItems)
  {
    let index = sMoveWindowDownIndex = windowState.windowTopIndex + windowState.entriesOnscreen;
    if (index + delta >= windowState.listLength)
      delta = windowState.listLength - index;
    PrintListItems(windowState.listPtr, index, delta, windowState.listItemSize, windowState.entriesOnscreen, list.sub);
  }
  CreateMoveListWindowTask(delta, list.sub);
  windowState.windowTopIndex += delta;
}

/** 1:1 `static void CreateMoveListWindowTask(s32 delta, struct PokenavListSub *list)` (pokenav_list.c:293-303). */
function CreateMoveListWindowTask(delta: number, list: PokenavListSub): void {
  list.startBgY = GetBgY(list.listWindow.bg);
  list.endBgY = list.startBgY + (delta << 12);
  if (delta > 0)
    list.bgMoveType = BG_COORD_ADD;
  else
    list.bgMoveType = BG_COORD_SUB;
  list.moveDelta = delta;
  list.loopedTaskId = CreateLoopedTask(LoopedTask_MoveListWindow, 6);
}

/** 1:1 `static u32 LoopedTask_MoveListWindow(s32 state)` (pokenav_list.c:305-342). */
function LoopedTask_MoveListWindow(state: number): number {
  let oldY = 0;
  let newY = 0;
  let finished = false;
  let list = GetSubstructPtr(POKENAV_SUBSTRUCT_LIST);
  let subPtr = list.sub;
  switch (state) {
    case 0:
      if (!IsPrintListItemsTaskActive())
        return LT_INC_AND_CONTINUE;
      return LT_PAUSE;
    case 1:
      finished = false;
      oldY = GetBgY(subPtr.listWindow.bg);
      newY = ChangeBgY(subPtr.listWindow.bg, 0x1000, subPtr.bgMoveType);
      if (subPtr.bgMoveType == BG_COORD_SUB)
      {
        if ((oldY > subPtr.endBgY || oldY <= subPtr.startBgY) && newY <= subPtr.endBgY)
          finished = true;
      }
      else
        // BG_COORD_ADD
      if (finished)
      {
        subPtr.listWindow.unkA = (subPtr.listWindow.unkA + subPtr.moveDelta) & 0xF;
        ChangeBgY(subPtr.listWindow.bg, subPtr.endBgY, BG_COORD_SET);
        return LT_FINISH;
      }
      return LT_PAUSE;
  }
  return LT_FINISH;
}

/** 1:1 `bool32 PokenavList_IsMoveWindowTaskActive(void)` (pokenav_list.c:344-348). */
export function PokenavList_IsMoveWindowTaskActive(): boolean {
  let list = GetSubstructPtr(POKENAV_SUBSTRUCT_LIST);
  return IsLoopedTaskActive(list.sub.loopedTaskId);
}

/** 1:1 `static struct PokenavListWindowState *GetPokenavListWindowState(void)` (pokenav_list.c:350-354). */
function GetPokenavListWindowState(): PokenavListWindowState | null {
  let list = GetSubstructPtr(POKENAV_SUBSTRUCT_LIST);
  return list.windowState;
}

/** 1:1 `int PokenavList_MoveCursorUp(void)` (pokenav_list.c:356-371). */
export function PokenavList_MoveCursorUp(): number {
  let windowState = GetPokenavListWindowState();
  if (windowState.selectedIndexOffset != 0)
  {
    windowState.selectedIndexOffset--;
    return 1;
  }
  if (ShouldShowUpArrow())
  {
    MoveListWindow(-1, true);
    return 2;
  }
  return 0;
}

/** 1:1 `int PokenavList_MoveCursorDown(void)` (pokenav_list.c:373-390). */
export function PokenavList_MoveCursorDown(): number {
  let windowState = GetPokenavListWindowState();
  if (windowState.windowTopIndex + windowState.selectedIndexOffset >= windowState.listLength - 1)
    return 0;
  if (windowState.selectedIndexOffset < windowState.entriesOnscreen - 1)
  {
    windowState.selectedIndexOffset++;
    return 1;
  }
  if (ShouldShowDownArrow())
  {
    MoveListWindow(1, true);
    return 2;
  }
  return 0;
}

/** 1:1 `int PokenavList_PageUp(void)` (pokenav_list.c:392-412). */
export function PokenavList_PageUp(): number {
  let scroll = 0;
  let windowState = GetPokenavListWindowState();
  if (ShouldShowUpArrow())
  {
    if (windowState.windowTopIndex >= windowState.entriesOnscreen)
      scroll = windowState.entriesOnscreen;
    else
      scroll = windowState.windowTopIndex;
    MoveListWindow(scroll * -1, true);
    return 2;
  }
  else if (windowState.selectedIndexOffset != 0)
  {
    windowState.selectedIndexOffset = 0;
    return 1;
  }
  return 0;
}

/** 1:1 `int PokenavList_PageDown(void)` (pokenav_list.c:414-448). */
export function PokenavList_PageDown(): number {
  let windowState = GetPokenavListWindowState();
  if (ShouldShowDownArrow())
  {
    let windowBottomIndex = windowState.windowTopIndex + windowState.entriesOnscreen;
    let scroll = windowState.entriesOffscreen - windowState.windowTopIndex;
    if (windowBottomIndex <= windowState.entriesOffscreen)
      scroll = windowState.entriesOnscreen;
    MoveListWindow(scroll, true);
    return 2;
  }
  else
  {
    let cursor = 0;
    let lastVisibleIndex = 0;
    if (windowState.listLength >= windowState.entriesOnscreen)
    {
      cursor = windowState.selectedIndexOffset;
      lastVisibleIndex = windowState.entriesOnscreen;
    }
    else
    {
      cursor = windowState.selectedIndexOffset;
      lastVisibleIndex = windowState.listLength;
    }
    lastVisibleIndex -= 1;
    if (cursor >= lastVisibleIndex)
      return 0;
    windowState.selectedIndexOffset = lastVisibleIndex;
    return 1;
  }
}

/** 1:1 `u32 PokenavList_GetSelectedIndex(void)` (pokenav_list.c:450-455). */
export function PokenavList_GetSelectedIndex(): number {
  let windowState = GetPokenavListWindowState();
  return windowState.windowTopIndex + windowState.selectedIndexOffset;
}

/** 1:1 `u32 PokenavList_GetTopIndex(void)` (pokenav_list.c:457-462). */
export function PokenavList_GetTopIndex(): number {
  let windowState = GetPokenavListWindowState();
  return windowState.windowTopIndex;
}

/** 1:1 `void PokenavList_EraseListForCheckPage(void)` (pokenav_list.c:464-469). */
export function PokenavList_EraseListForCheckPage(): void {
  let list = GetSubstructPtr(POKENAV_SUBSTRUCT_LIST);
  list.eraseIndex = 0;
  list.loopedTaskId = CreateLoopedTask(LoopedTask_EraseListForCheckPage, 6);
}

/** 1:1 `void PrintCheckPageInfo(s16 delta)` (pokenav_list.c:471-477). */
export function PrintCheckPageInfo(delta: number): void {
  let list = GetSubstructPtr(POKENAV_SUBSTRUCT_LIST);
  list.windowState.windowTopIndex += delta;
  list.eraseIndex = 0;
  list.loopedTaskId = CreateLoopedTask(LoopedTask_PrintCheckPageInfo, 6);
}

/** 1:1 `void PokenavList_ReshowListFromCheckPage(void)` (pokenav_list.c:479-484). */
export function PokenavList_ReshowListFromCheckPage(): void {
  let list = GetSubstructPtr(POKENAV_SUBSTRUCT_LIST);
  list.eraseIndex = 0;
  list.loopedTaskId = CreateLoopedTask(LoopedTask_ReshowListFromCheckPage, 6);
}

/** 1:1 `bool32 PokenavList_IsTaskActive(void)` (pokenav_list.c:486-490). */
export function PokenavList_IsTaskActive(): boolean {
  let list = GetSubstructPtr(POKENAV_SUBSTRUCT_LIST);
  return IsLoopedTaskActive(list.loopedTaskId);
}

/** 1:1 `void PokenavList_DrawCurrentItemIcon(void)` (pokenav_list.c:492-498). */
export function PokenavList_DrawCurrentItemIcon(): void {
  let list = GetSubstructPtr(POKENAV_SUBSTRUCT_LIST);
  let windowState = list.windowState;
  list.sub.iconDrawFunc(list.sub.listWindow.windowId, windowState.windowTopIndex + windowState.selectedIndexOffset, (list.sub.listWindow.unkA + windowState.selectedIndexOffset) & 0xF);
  CopyWindowToVram(list.sub.listWindow.windowId, COPYWIN_MAP);
}

/** 1:1 `static u32 LoopedTask_EraseListForCheckPage(s32 state)` (pokenav_list.c:500-545). */
function LoopedTask_EraseListForCheckPage(state: number): number {
  let list = GetSubstructPtr(POKENAV_SUBSTRUCT_LIST);
  switch (state) {
    case 0:
      ToggleListArrows(list.sub, true);
    // fall-through
    case 1:
      if (list.eraseIndex != list.windowState.selectedIndexOffset)
        EraseListEntry(list.sub.listWindow, list.eraseIndex, 1);
      list.eraseIndex++;
      return LT_INC_AND_PAUSE;
    case 2:
      if (!IsDma3ManagerBusyWithBgCopy())
      {
        if (list.eraseIndex != list.windowState.entriesOnscreen)
          return LT_SET_STATE(1);
        if (list.windowState.selectedIndexOffset != 0)
          EraseListEntry(list.sub.listWindow, list.eraseIndex, list.windowState.selectedIndexOffset);
        return LT_INC_AND_PAUSE;
      }
      return LT_PAUSE;
    case 3:
      if (!IsDma3ManagerBusyWithBgCopy())
      {
        if (list.windowState.selectedIndexOffset != 0)
        {
          MoveListWindow(list.windowState.selectedIndexOffset, false);
          return LT_INC_AND_PAUSE;
        }
        return LT_FINISH;
      }
      return LT_PAUSE;
    case 4:
      if (PokenavList_IsMoveWindowTaskActive())
        return LT_PAUSE;
      list.windowState.selectedIndexOffset = 0;
      return LT_FINISH;
  }
  return LT_FINISH;
}

/** 1:1 `static u32 LoopedTask_PrintCheckPageInfo(s32 state)` (pokenav_list.c:547-583). */
function LoopedTask_PrintCheckPageInfo(state: number): number {
  let list = GetSubstructPtr(POKENAV_SUBSTRUCT_LIST);
  if (IsDma3ManagerBusyWithBgCopy())
    return LT_PAUSE;
  switch (state) {
    case 0:
      PrintCheckPageTrainerName(list.windowState, list.sub);
      break;
    case 1:
      PrintMatchCallFieldNames(list.sub, 0);
      break;
    case 2:
      PrintMatchCallFlavorText(list.windowState, list.sub, CHECK_PAGE_STRATEGY);
      break;
    case 3:
      PrintMatchCallFieldNames(list.sub, 1);
      break;
    case 4:
      PrintMatchCallFlavorText(list.windowState, list.sub, CHECK_PAGE_POKEMON);
      break;
    case 5:
      PrintMatchCallFieldNames(list.sub, 2);
      break;
    case 6:
      PrintMatchCallFlavorText(list.windowState, list.sub, CHECK_PAGE_INTRO_1);
      break;
    case 7:
      PrintMatchCallFlavorText(list.windowState, list.sub, CHECK_PAGE_INTRO_2);
      break;
    default:
      return LT_FINISH;
  }
  return LT_INC_AND_PAUSE;
}

/** 1:1 `static u32 LoopedTask_ReshowListFromCheckPage(s32 state)` (pokenav_list.c:585-665). */
function LoopedTask_ReshowListFromCheckPage(state: number): number {
  let list: any = null;
  let windowState: any = null;
  let subPtr: any = null;
  let r5 = 0;
  let ptr: any = null;
  if (IsDma3ManagerBusyWithBgCopy())
    return LT_PAUSE;
  list = GetSubstructPtr(POKENAV_SUBSTRUCT_LIST);
  windowState = list.windowState;
  subPtr = list.sub;
  switch (state) {
    case 0:
      // Rewrite the name of the trainer whose check page was just being viewed.
      // This is done to erase the red background it had.
      PrintMatchCallListTrainerName(windowState, subPtr);
      return LT_INC_AND_PAUSE;
    case 1:
      ptr = list.eraseIndex;
      if (++(ptr[0] /* *ptr */) < list.windowState.entriesOnscreen)
      {
        EraseListEntry(subPtr.listWindow, ptr[0] /* *ptr */, 1);
        return LT_PAUSE;
      }
      ptr[0] /* *ptr */ = 0;
      if (windowState.listLength <= windowState.entriesOnscreen)
      {
        if (windowState.windowTopIndex != 0)
        {
          let r4 = windowState.windowTopIndex;
          r5 = -r4;
          EraseListEntry(subPtr.listWindow, r5, r4);
          windowState.selectedIndexOffset = r4;
          ptr[0] /* *ptr */ = r5;
          return LT_INC_AND_PAUSE;
        }
      }
      else
      {
        if (windowState.windowTopIndex + windowState.entriesOnscreen > windowState.listLength)
        {
          let r4 = windowState.windowTopIndex + windowState.entriesOnscreen - windowState.listLength;
          r5 = -r4;
          EraseListEntry(subPtr.listWindow, r5, r4);
          windowState.selectedIndexOffset = r4;
          ptr[0] /* *ptr */ = r5;
          return LT_INC_AND_PAUSE;
        }
      }
      return LT_SET_STATE(4);
    case 2:
      MoveListWindow(list.eraseIndex, false);
      return LT_INC_AND_PAUSE;
    case 3:
      if (!PokenavList_IsMoveWindowTaskActive())
      {
        list.eraseIndex = 0;
        return LT_INC_AND_CONTINUE;
      }
      return LT_PAUSE;
    case 4:
      PrintListItems(windowState.listPtr, windowState.windowTopIndex + list.eraseIndex, 1, windowState.listItemSize, list.eraseIndex, list.sub);
      return LT_INC_AND_PAUSE;
    case 5:
      if (IsPrintListItemsTaskActive())
        return LT_PAUSE;
      if (++list.eraseIndex >= windowState.listLength || list.eraseIndex >= windowState.entriesOnscreen)
        return LT_INC_AND_CONTINUE;
      return LT_SET_STATE(4);
    case 6:
      ToggleListArrows(subPtr, false);
      return LT_FINISH;
  }
  return LT_FINISH;
}

/** 1:1 `static void EraseListEntry(struct PokenavListMenuWindow *listWindow, s32 offset, s32 entries)` (pokenav_list.c:667-692). */
function EraseListEntry(listWindow: PokenavListMenuWindow, offset: number, entries: number): void {
  let tileData = GetWindowAttribute(listWindow.windowId, WINDOW_TILE_DATA);
  let width = listWindow.width * 64;
  offset = (listWindow.unkA + offset) & 0xF;
  if (offset + entries <= 16)
  {
    CpuFastFill8(PIXEL_FILL(1), tileData + offset * width, entries * width);
    CopyWindowToVram(listWindow.windowId, COPYWIN_GFX);
  }
  else
  {
    let v3 = 16 - offset;
    let v4 = entries - v3;
    CpuFastFill8(PIXEL_FILL(1), tileData + offset * width, v3 * width);
    CpuFastFill8(PIXEL_FILL(1), tileData, v4 * width);
    CopyWindowToVram(listWindow.windowId, COPYWIN_GFX);
  }
  for (entries--; entries != -1; (offset = (offset + 1) & 0xF, entries--))
    ClearRematchPokeballIcon(listWindow.windowId, offset);
  CopyWindowToVram(listWindow.windowId, COPYWIN_MAP);
}

// Pointless

/** 1:1 `static void SetListMarginTile(struct PokenavListMenuWindow *listWindow, bool32 draw)` (pokenav_list.c:695-708). */
function SetListMarginTile(listWindow: PokenavListMenuWindow, draw: boolean): void {
  let var_ = 0;
  let tilemapBuffer = GetBgTilemapBuffer(GetWindowAttribute(listWindow.windowId, WINDOW_BG));
  tilemapBuffer += (listWindow.unkA << 6) + listWindow.x - 1;
  if (draw)
    var_ = (listWindow.fillValue << 12) | (listWindow.tileOffset + 1);
  else
    var_ = (listWindow.fillValue << 12) | (listWindow.tileOffset);
  tilemapBuffer[0] = var_;
  tilemapBuffer[0x20] = var_;
}

// Print the trainer's name and title at the top of their check page

/** 1:1 `static void PrintCheckPageTrainerName(struct PokenavListWindowState *state, struct PokenavListSub *list)` (pokenav_list.c:711-722). */
function PrintCheckPageTrainerName(state: PokenavListWindowState, list: PokenavListSub): void {
  const colors = Uint8Array.from([
  TEXT_COLOR_TRANSPARENT,
  TEXT_COLOR_DARK_GRAY,
  TEXT_COLOR_LIGHT_RED,
]);
  list.bufferItemFunc(state.listPtr[state.windowTopIndex], list.itemTextBuffer); // 1:1 : listPtr[base]+itemSize*topIndex = entrée topIndex (émulation JS array indexé)
  list.iconDrawFunc(list.listWindow.windowId, state.windowTopIndex, list.listWindow.unkA);
  FillWindowPixelRect(list.listWindow.windowId, PIXEL_FILL(4), 0, list.listWindow.unkA * 16, list.listWindow.width * 8, 16);
  //!< French Difference
  AddTextPrinterParameterized3(list.listWindow.windowId, list.listWindow.fontId, 10, (list.listWindow.unkA * 16) + 1, colors, TEXT_SKIP_DRAW, list.itemTextBuffer);
  SetListMarginTile(list.listWindow, true);
  CopyWindowRectToVram(list.listWindow.windowId, COPYWIN_FULL, 0, list.listWindow.unkA * 2, list.listWindow.width, 2);
}

// Print the trainer's name and title for the list (to replace the check page name and title, which has a red background)

/** 1:1 `static void PrintMatchCallListTrainerName(struct PokenavListWindowState *state, struct PokenavListSub *list)` (pokenav_list.c:725-733). */
function PrintMatchCallListTrainerName(state: PokenavListWindowState, list: PokenavListSub): void {
  list.bufferItemFunc(state.listPtr[state.windowTopIndex], list.itemTextBuffer); // 1:1 : listPtr[base]+itemSize*topIndex = entrée topIndex (émulation JS array indexé)
  FillWindowPixelRect(list.listWindow.windowId, PIXEL_FILL(1), 0, list.listWindow.unkA * 16, list.listWindow.width * 8, 16);
  //!< French Difference
  AddTextPrinterParameterized(list.listWindow.windowId, list.listWindow.fontId, list.itemTextBuffer, 10, list.listWindow.unkA * 16 + 1, TEXT_SKIP_DRAW, null);
  SetListMarginTile(list.listWindow, false);
  CopyWindowToVram(list.listWindow.windowId, COPYWIN_FULL);
}

/** 1:1 `static void PrintMatchCallFieldNames(struct PokenavListSub *list, u32 fieldId)` (pokenav_list.c:735-749). */
function PrintMatchCallFieldNames(list: PokenavListSub, fieldId: number): void {
  const fieldNames = [
  getString('gText_PokenavMatchCall_Strategy'),
  getString('gText_PokenavMatchCall_TrainerPokemon'),
  getString('gText_PokenavMatchCall_SelfIntroduction'),
];
  const colors = Uint8Array.from([
  TEXT_COLOR_WHITE,
  TEXT_COLOR_RED,
  TEXT_COLOR_LIGHT_RED,
]);
  let top = (list.listWindow.unkA + 1 + (fieldId * 2)) & 0xF;
  FillWindowPixelRect(list.listWindow.windowId, PIXEL_FILL(1), 0, top << 4, list.listWindow.width, 16);
  //!< French Difference
  AddTextPrinterParameterized3(list.listWindow.windowId, FONT_NARROW, 4, (top << 4) + 1, colors, TEXT_SKIP_DRAW, fieldNames[fieldId]);
  CopyWindowRectToVram(list.listWindow.windowId, COPYWIN_GFX, 0, top << 1, list.listWindow.width, 2);
}

/** 1:1 `static void PrintMatchCallFlavorText(struct PokenavListWindowState *windowState, struct PokenavListSub *list, u32 checkPageEntry)` (pokenav_list.c:751-771). */
function PrintMatchCallFlavorText(windowState: PokenavListWindowState, list: PokenavListSub, checkPageEntry: number): void {
  // lines 1, 3, and 5 are the field names printed by PrintMatchCallFieldNames
  const lineOffsets = Uint8Array.from([
  2, // [CHECK_PAGE_STRATEGY]
  4, // [CHECK_PAGE_POKEMON]
  6, // [CHECK_PAGE_INTRO_1]
  7, // [CHECK_PAGE_INTRO_2]
]);
  let r6 = (list.listWindow.unkA + lineOffsets[checkPageEntry]) & 0xF;
  let str = GetMatchCallFlavorText(windowState.windowTopIndex, checkPageEntry);
  if (str != null)
  {
    FillWindowTilesByRow(list.listWindow.windowId, 1, r6 * 2, list.listWindow.width - 1, 2);
    //!< French Difference
    AddTextPrinterParameterized(list.listWindow.windowId, FONT_NARROW, str, 4, (r6 << 4) + 1, TEXT_SKIP_DRAW, null);
    CopyWindowRectToVram(list.listWindow.windowId, COPYWIN_GFX, 0, r6 * 2, list.listWindow.width, 2);
  }
}

/** 1:1 (pokenav_list.c:773) */
const sListArrowSpriteSheets = [
  {
    data: sListArrow_Gfx,
    size: 0xC0,
    tag: GFXTAG_ARROW },
];

/** 1:1 (pokenav_list.c:782) */
const sListArrowPalettes = [
  {
    data: sListArrow_Pal,
    tag: PALTAG_ARROW },
  [

  ],
];

/** 1:1 (pokenav_list.c:791) */
const sOamData_RightArrow = {
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
  priority: 2, /* :2 */
  paletteNum: 0, /* :4 */
};

/** 1:1 (pokenav_list.c:805) */
const sSpriteTemplate_RightArrow = {
  tileTag: GFXTAG_ARROW,
  paletteTag: PALTAG_ARROW,
  oam: sOamData_RightArrow,
  anims: gDummySpriteAnimTable,
  images: null,
  affineAnims: gDummySpriteAffineAnimTable,
  callback: SpriteCB_RightArrow };

/** 1:1 (pokenav_list.c:816) */
const sOamData_UpDownArrow = {
  y: 0, /* :8 */
  affineMode: ST_OAM_AFFINE_OFF, /* :2 */
  objMode: ST_OAM_OBJ_NORMAL, /* :2 */
  bpp: ST_OAM_4BPP, /* :1 */
  shape: 1, /* :2 */
  /* SPRITE_SHAPE(16x8) */
  x: 0, /* :9 */
  size: 0, /* :2 */
  /* SPRITE_SIZE(16x8) */
  tileNum: 0, /* :10 */
  priority: 2, /* :2 */
  paletteNum: 0, /* :4 */
};

/** 1:1 (pokenav_list.c:830) */
const sSpriteTemplate_UpDownArrow = {
  tileTag: GFXTAG_ARROW,
  paletteTag: PALTAG_ARROW,
  oam: sOamData_UpDownArrow,
  anims: gDummySpriteAnimTable,
  images: null,
  affineAnims: gDummySpriteAffineAnimTable,
  callback: SpriteCallbackDummy };

/** 1:1 `static void LoadListArrowGfx(void)` (pokenav_list.c:841-850). */
function LoadListArrowGfx(): void {
  let i = 0;
  let ptr: any = null;
  for ((i = 0, ptr = sListArrowSpriteSheets); i < sListArrowSpriteSheets.length; (ptr++ /* TRANSPILER-TODO ptr-arith */, i++))
    LoadCompressedSpriteSheet(ptr);
  Pokenav_AllocAndLoadPalettes(sListArrowPalettes);
}

/** 1:1 `static void CreateListArrowSprites(struct PokenavListWindowState *windowState, struct PokenavListSub *list)` (pokenav_list.c:852-871). */
function CreateListArrowSprites(windowState: PokenavListWindowState, list: PokenavListSub): void {
  let spriteId = 0;
  let x = 0;
  //!< French Difference
  spriteId = CreateSprite(sSpriteTemplate_RightArrow, list.listWindow.x * 8 + 5, (list.listWindow.y + 1) * 8, 7);
  list.rightArrow = gSprites[spriteId];
  x = list.listWindow.x * 8 + (list.listWindow.width - 1) * 4;
  spriteId = CreateSprite(sSpriteTemplate_UpDownArrow, x, list.listWindow.y * 8 + windowState.entriesOnscreen * 16, 7);
  list.downArrow = gSprites[spriteId];
  list.downArrow.oam.tileNum += 2;
  list.downArrow.callback = SpriteCB_DownArrow;
  spriteId = CreateSprite(sSpriteTemplate_UpDownArrow, x, list.listWindow.y * 8, 7);
  list.upArrow = gSprites[spriteId];
  list.upArrow.oam.tileNum += 4;
  list.upArrow.callback = SpriteCB_UpArrow;
}

/** 1:1 `static void DestroyListArrows(struct PokenavListSub *list)` (pokenav_list.c:873-880). */
function DestroyListArrows(list: PokenavListSub): void {
  DestroySprite(list.rightArrow);
  DestroySprite(list.upArrow);
  DestroySprite(list.downArrow);
  FreeSpriteTilesByTag(GFXTAG_ARROW);
  FreeSpritePaletteByTag(PALTAG_ARROW);
}

/** 1:1 `static void ToggleListArrows(struct PokenavListSub *list, bool32 invisible)` (pokenav_list.c:882-899). */
function ToggleListArrows(list: PokenavListSub, invisible: boolean): void {
  if (invisible)
  {
    list.rightArrow.callback = SpriteCallbackDummy;
    list.upArrow.callback = SpriteCallbackDummy;
    list.downArrow.callback = SpriteCallbackDummy;
  }
  else
  {
    list.rightArrow.callback = SpriteCB_RightArrow;
    list.upArrow.callback = SpriteCB_UpArrow;
    list.downArrow.callback = SpriteCB_DownArrow;
  }
  list.rightArrow.invisible = invisible;
  list.upArrow.invisible = invisible;
  list.downArrow.invisible = invisible;
}

/** 1:1 `static void SpriteCB_RightArrow(struct Sprite *sprite)` (pokenav_list.c:901-905). */
function SpriteCB_RightArrow(sprite: DecompSprite): void {
  let list = GetSubstructPtr(POKENAV_SUBSTRUCT_LIST);
  sprite.y2 = list.windowState.selectedIndexOffset << 4;
}

// #define sTimer data[0]  (alias — expansé aux usages)

// #define sOffset data[1]  (alias — expansé aux usages)

// #define sInvisible data[7]  (alias — expansé aux usages)

/** 1:1 `static void SpriteCB_DownArrow(struct Sprite *sprite)` (pokenav_list.c:911-927). */
function SpriteCB_DownArrow(sprite: DecompSprite): void {
  if (!sprite.data[7] /* sInvisible */ && ShouldShowDownArrow())
    sprite.invisible = false;
  else
    sprite.invisible = true;
  if (++sprite.data[0] /* sTimer */ > 3)
  {
    let offset = 0;
    sprite.data[0] /* sTimer */ = 0;
    offset = (sprite.data[1] /* sOffset */ + 1) & 7;
    sprite.data[1] /* sOffset */ = offset;
    sprite.y2 = offset;
  }
}

/** 1:1 `static void SpriteCB_UpArrow(struct Sprite *sprite)` (pokenav_list.c:929-945). */
function SpriteCB_UpArrow(sprite: DecompSprite): void {
  if (!sprite.data[7] /* sInvisible */ && ShouldShowUpArrow())
    sprite.invisible = false;
  else
    sprite.invisible = true;
  if (++sprite.data[0] /* sTimer */ > 3)
  {
    let offset = 0;
    sprite.data[0] /* sTimer */ = 0;
    offset = (sprite.data[1] /* sOffset */ + 1) & 7;
    sprite.data[1] /* sOffset */ = offset;
    sprite.y2 = -1 * offset;
  }
}

/** 1:1 `void PokenavList_ToggleVerticalArrows(bool32 invisible)` (pokenav_list.c:947-952). */
export function PokenavList_ToggleVerticalArrows(invisible: boolean): void {
  let list = GetSubstructPtr(POKENAV_SUBSTRUCT_LIST);
  list.sub.upArrow.data[7] /* sInvisible */ = invisible;
  list.sub.downArrow.data[7] /* sInvisible */ = invisible;
}

/** 1:1 `static void InitPokenavListWindowState(struct PokenavListWindowState *dst, struct PokenavListTemplate *template)` (pokenav_list.c:958-984). */
function InitPokenavListWindowState(dst: PokenavListWindowState, template: any): void {
  dst.listPtr = template.list;
  dst.windowTopIndex = template.startIndex;
  dst.listLength = template.count;
  dst.listItemSize = template.itemSize;
  dst.entriesOnscreen = template.maxShowed;
  if (dst.entriesOnscreen >= dst.listLength)
  {
    dst.windowTopIndex = 0;
    dst.entriesOffscreen = 0;
    dst.selectedIndexOffset = template.startIndex;
  }
  else
  {
    dst.entriesOffscreen = dst.listLength - dst.entriesOnscreen;
    if (dst.windowTopIndex + dst.entriesOnscreen > dst.listLength)
    {
      dst.selectedIndexOffset = dst.windowTopIndex + dst.entriesOnscreen - dst.listLength;
      dst.windowTopIndex = template.startIndex - dst.selectedIndexOffset;
    }
    else
    {
      dst.selectedIndexOffset = 0;
    }
  }
}

/** 1:1 `static bool32 CopyPokenavListMenuTemplate(struct PokenavListSub *dest, const struct BgTemplate *bgTemplate, struct PokenavListTemplate *template, s32 tileOffset)` (pokenav_list.c:986-1017). */
function CopyPokenavListMenuTemplate(dest: PokenavListSub, bgTemplate: BgTemplate, template: any, tileOffset: number): boolean {
  const window = { bg: 0, tilemapLeft: 0, tilemapTop: 0, width: 0, height: 0, paletteNum: 0, baseBlock: 0 };
  dest.listWindow.bg = bgTemplate.bg;
  dest.listWindow.tileOffset = tileOffset;
  dest.bufferItemFunc = template.bufferItemFunc;
  dest.iconDrawFunc = template.iconDrawFunc;
  dest.listWindow.fillValue = template.fillValue;
  dest.listWindow.x = template.item_X;
  dest.listWindow.y = template.listTop;
  dest.listWindow.width = template.windowWidth;
  dest.listWindow.fontId = template.fontId;
  window.bg = bgTemplate.bg;
  window.tilemapLeft = template.item_X;
  window.tilemapTop = 0;
  window.width = template.windowWidth;
  window.height = 32;
  window.paletteNum = template.fillValue;
  window.baseBlock = tileOffset + 2;
  dest.listWindow.windowId = AddWindow(window);
  if (dest.listWindow.windowId == WINDOW_NONE)
    return false;
  dest.listWindow.unkA = 0;
  dest.rightArrow = null;
  dest.upArrow = null;
  dest.downArrow = null;
  return true;
}
