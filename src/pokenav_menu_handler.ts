// @ts-nocheck — transpilé brut (types stricts au câblage fin ; wire-transpiled.cjs)
/**
 * pokenav_menu_handler.ts — miroir 1:1 de `D:/Projet 1/decomps/pokeemeraude/src/pokenav_menu_handler.c` (transpilé).
 *
 * Généré par scripts/transpile-c.cjs — revue humaine OBLIGATOIRE avant commit :
 * rapport des flags dans audit-reports/transpile/pokenav_menu_handler.md.
 * Politique préproc : build vanilla FR (NDEBUG/FRENCH définis, BUGFIX/UBFIX absents).
 */

import { FLAG_ADDED_MATCH_CALL_TO_POKENAV, FLAG_SYS_RIBBON_GET } from '../include/constants/flags';
import { SE_FAILURE, SE_SELECT } from '../include/constants/songs';
import { A_BUTTON, B_BUTTON, DPAD_DOWN, DPAD_UP } from '../include/gba/io_reg';
import { JOY_NEW, PlaySE } from './battle_controllers';
import { gSaveBlock2Ptr } from './engine/save/save-block-state';
import { FlagGet } from './event_data';

// ═══ wire-transpiled (auto) : imports résolus par l'index + sentinelles ═══
import { __wireTodo } from './engine/wire-todo';
import { AllocSubstruct, CanViewRibbonsMenu, FreePokenavSubstruct, GetPokenavMode, GetSelectedConditionSearch, GetSubstructPtr, SetPokenavMode, SetSelectedConditionSearch } from './pokenav_resources';
// ─── WIRE-TODO : symboles transpilés SANS foyer dans le repo (throw à l'appel) ───
const MAX_POKENAV_MENUITEMS = 6; // 1:1 include/pokenav.h:167. ⚠️ était __wireTodo (stub) → dans sMenuItems
// `Array.from({ length: MAX_POKENAV_MENUITEMS - 2 })` faisait `Array.from({length: NaN}) = []` → les lignes
// étaient tronquées (ex. [MAP, CONDITION] au lieu de 6) → sMenuItems[type][cursorPos>=len] = undefined →
// currMenuItem undefined → PrintCurrentOptionDescription throw chaque frame → GEL total de la navigation.
const POKENAV_MENU_FUNC_EXIT = -1; // 1:1 include/pokenav.h:269 (était __wireTodo → B ne sortait jamais : le handler renvoyait le sentinelle, pas -1)

// ─── constantes décomp inlinées (headers pas encore dans include/) ───
const POKENAV_MENUITEM_MAP = 0; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_MENUITEM_CONDITION = 1; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_MENUITEM_MATCH_CALL = 2; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_MENUITEM_RIBBONS = 3; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_MENUITEM_CONDITION_PARTY = 5; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_MENUITEM_CONDITION_SEARCH = 6; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_MENUITEM_CONDITION_CANCEL = 7; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_MENUITEM_CONDITION_SEARCH_COOL = 8; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_MENUITEM_CONDITION_SEARCH_BEAUTY = 9; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_MENUITEM_CONDITION_SEARCH_CUTE = 10; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_MENUITEM_CONDITION_SEARCH_SMART = 11; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_MENUITEM_CONDITION_SEARCH_TOUGH = 12; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_MENUITEM_CONDITION_SEARCH_CANCEL = 13; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_MENU_TYPE_DEFAULT = 0; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_MENU_TYPE_UNLOCK_MC = 1; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_MENU_TYPE_UNLOCK_MC_RIBBONS = 2; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_SUBSTRUCT_MAIN_MENU_HANDLER = 1; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const HELPBAR_NONE = 0; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_MENU_TYPE_CONDITION = 3; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_MENU_TYPE_CONDITION_SEARCH = 4; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_MODE_NORMAL = 0; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_MODE_FORCE_CALL_READY = 1; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_MODE_FORCE_CALL_EXIT = 2; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_MENU_FUNC_MOVE_CURSOR = 1; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const HELPBAR_MAP_ZOOMED_IN = 2; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const HELPBAR_MAP_ZOOMED_OUT = 1; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_REGION_MAP = 100006; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_MENU_FUNC_OPEN_FEATURE = 8; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_MENU_FUNC_OPEN_CONDITION = 2; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const HELPBAR_MC_TRAINER_LIST = 6; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_MATCH_CALL = 100011; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const HELPBAR_RIBBONS_MON_LIST = 9; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_RIBBONS_MON_LIST = 100012; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_MENU_FUNC_NO_RIBBON_WINNERS = 6; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_MENUITEM_SWITCH_OFF = 4; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_MENU_FUNC_NONE = 0; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_MENU_FUNC_RESHOW_DESCRIPTION = 7; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_MENU_FUNC_OPEN_CONDITION_SEARCH = 4; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_CONDITION_GRAPH_PARTY = 100007; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_MENU_FUNC_RETURN_TO_MAIN = 3; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_CONDITION_SEARCH_RESULTS = 100008; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const HELPBAR_CONDITION_MON_LIST = 3; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_MENU_FUNC_RETURN_TO_CONDITION = 5; // 1:1 include/pokenav.h:0 (à consolider dans include/)

/** 1:1 `struct Pokenav_Menu` (pokenav_menu_handler.c:8). */
interface Pokenav_Menu {
  menuType: number;
  cursorPos: number;
  currMenuItem: number;
  helpBarIndex: number;
  menuId: number;
  callback: ((...args: any[]) => any) | null;
}

// Number of entries - 1 for that menu type

/** 1:1 (pokenav_menu_handler.c:35) */
const sLastCursorPositions = Uint8Array.from([
  2, // [POKENAV_MENU_TYPE_DEFAULT]
  3, // [POKENAV_MENU_TYPE_UNLOCK_MC]
  4, // [POKENAV_MENU_TYPE_UNLOCK_MC_RIBBONS]
  2, // [POKENAV_MENU_TYPE_CONDITION]
  5, // [POKENAV_MENU_TYPE_CONDITION_SEARCH]
]);

/** 1:1 (pokenav_menu_handler.c:44) */
const sMenuItems: number[][] = [
  [
    POKENAV_MENUITEM_MAP,
    POKENAV_MENUITEM_CONDITION,
    ...Array.from({ length: MAX_POKENAV_MENUITEMS - 2 }, () => POKENAV_MENUITEM_SWITCH_OFF), /* [2...] designated init */
  ], // [POKENAV_MENU_TYPE_DEFAULT]
  [
    POKENAV_MENUITEM_MAP,
    POKENAV_MENUITEM_CONDITION,
    POKENAV_MENUITEM_MATCH_CALL,
    ...Array.from({ length: MAX_POKENAV_MENUITEMS - 3 }, () => POKENAV_MENUITEM_SWITCH_OFF), /* [3...] designated init */
  ], // [POKENAV_MENU_TYPE_UNLOCK_MC]
  [
    POKENAV_MENUITEM_MAP,
    POKENAV_MENUITEM_CONDITION,
    POKENAV_MENUITEM_MATCH_CALL,
    POKENAV_MENUITEM_RIBBONS,
    ...Array.from({ length: MAX_POKENAV_MENUITEMS - 4 }, () => POKENAV_MENUITEM_SWITCH_OFF), /* [4...] designated init */
  ], // [POKENAV_MENU_TYPE_UNLOCK_MC_RIBBONS]
  [
    POKENAV_MENUITEM_CONDITION_PARTY,
    POKENAV_MENUITEM_CONDITION_SEARCH,
    POKENAV_MENUITEM_CONDITION_CANCEL,
    ...Array.from({ length: MAX_POKENAV_MENUITEMS - 3 }, () => POKENAV_MENUITEM_SWITCH_OFF), /* [3...] designated init */
  ], // [POKENAV_MENU_TYPE_CONDITION]
  [
    POKENAV_MENUITEM_CONDITION_SEARCH_COOL,
    POKENAV_MENUITEM_CONDITION_SEARCH_BEAUTY,
    POKENAV_MENUITEM_CONDITION_SEARCH_CUTE,
    POKENAV_MENUITEM_CONDITION_SEARCH_SMART,
    POKENAV_MENUITEM_CONDITION_SEARCH_TOUGH,
    POKENAV_MENUITEM_CONDITION_SEARCH_CANCEL,
  ], // [POKENAV_MENU_TYPE_CONDITION_SEARCH]
];

/** 1:1 `static u8 GetPokenavMainMenuType(void)` (pokenav_menu_handler.c:85-98). */
function GetPokenavMainMenuType(): number {
  let menuType = POKENAV_MENU_TYPE_DEFAULT;
  if (FlagGet(FLAG_ADDED_MATCH_CALL_TO_POKENAV))
  {
    menuType = POKENAV_MENU_TYPE_UNLOCK_MC;
    if (FlagGet(FLAG_SYS_RIBBON_GET))
      menuType = POKENAV_MENU_TYPE_UNLOCK_MC_RIBBONS;
  }
  return menuType;
}

/** 1:1 `bool32 PokenavCallback_Init_MainMenuCursorOnMap(void)` (pokenav_menu_handler.c:100-112). */
export function PokenavCallback_Init_MainMenuCursorOnMap(): boolean {
  let menu = AllocSubstruct(POKENAV_SUBSTRUCT_MAIN_MENU_HANDLER, 0 /* TRANSPILER-TODO sizeof(struct Pokenav_Menu) */);
  if (!menu)
    return false;
  menu.menuType = GetPokenavMainMenuType();
  menu.cursorPos = POKENAV_MENUITEM_MAP;
  menu.currMenuItem = POKENAV_MENUITEM_MAP;
  menu.helpBarIndex = HELPBAR_NONE;
  SetMenuInputHandler(menu);
  return true;
}

/** 1:1 `bool32 PokenavCallback_Init_MainMenuCursorOnMatchCall(void)` (pokenav_menu_handler.c:114-126). */
export function PokenavCallback_Init_MainMenuCursorOnMatchCall(): boolean {
  let menu = AllocSubstruct(POKENAV_SUBSTRUCT_MAIN_MENU_HANDLER, 0 /* TRANSPILER-TODO sizeof(struct Pokenav_Menu) */);
  if (!menu)
    return false;
  menu.menuType = GetPokenavMainMenuType();
  menu.cursorPos = POKENAV_MENUITEM_MATCH_CALL;
  menu.currMenuItem = POKENAV_MENUITEM_MATCH_CALL;
  menu.helpBarIndex = HELPBAR_NONE;
  SetMenuInputHandler(menu);
  return true;
}

/** 1:1 `bool32 PokenavCallback_Init_MainMenuCursorOnRibbons(void)` (pokenav_menu_handler.c:128-139). */
export function PokenavCallback_Init_MainMenuCursorOnRibbons(): boolean {
  let menu = AllocSubstruct(POKENAV_SUBSTRUCT_MAIN_MENU_HANDLER, 0 /* TRANSPILER-TODO sizeof(struct Pokenav_Menu) */);
  if (!menu)
    return false;
  menu.menuType = GetPokenavMainMenuType();
  menu.cursorPos = POKENAV_MENUITEM_RIBBONS;
  menu.currMenuItem = POKENAV_MENUITEM_RIBBONS;
  SetMenuInputHandler(menu);
  return true;
}

/** 1:1 `bool32 PokenavCallback_Init_ConditionMenu(void)` (pokenav_menu_handler.c:141-153). */
export function PokenavCallback_Init_ConditionMenu(): boolean {
  let menu = AllocSubstruct(POKENAV_SUBSTRUCT_MAIN_MENU_HANDLER, 0 /* TRANSPILER-TODO sizeof(struct Pokenav_Menu) */);
  if (!menu)
    return false;
  menu.menuType = POKENAV_MENU_TYPE_CONDITION;
  menu.cursorPos = 0;
  //party
  menu.currMenuItem = POKENAV_MENUITEM_CONDITION_PARTY;
  menu.helpBarIndex = HELPBAR_NONE;
  SetMenuInputHandler(menu);
  return true;
}

/** 1:1 `bool32 PokenavCallback_Init_ConditionSearchMenu(void)` (pokenav_menu_handler.c:155-167). */
export function PokenavCallback_Init_ConditionSearchMenu(): boolean {
  let menu = AllocSubstruct(POKENAV_SUBSTRUCT_MAIN_MENU_HANDLER, 0 /* TRANSPILER-TODO sizeof(struct Pokenav_Menu) */);
  if (!menu)
    return false;
  menu.menuType = POKENAV_MENU_TYPE_CONDITION_SEARCH;
  menu.cursorPos = GetSelectedConditionSearch();
  menu.currMenuItem = menu.cursorPos + POKENAV_MENUITEM_CONDITION_SEARCH_COOL;
  menu.helpBarIndex = HELPBAR_NONE;
  SetMenuInputHandler(menu);
  return true;
}

/** 1:1 `static void SetMenuInputHandler(struct Pokenav_Menu *menu)` (pokenav_menu_handler.c:169-187). */
function SetMenuInputHandler(menu: Pokenav_Menu): void {
  switch (menu.menuType) {
    case POKENAV_MENU_TYPE_DEFAULT:
      SetPokenavMode(POKENAV_MODE_NORMAL);
    // fallthrough
    case POKENAV_MENU_TYPE_UNLOCK_MC:
    case POKENAV_MENU_TYPE_UNLOCK_MC_RIBBONS:
      menu.callback = GetMainMenuInputHandler();
      break;
    case POKENAV_MENU_TYPE_CONDITION:
      menu.callback = HandleConditionMenuInput;
      break;
    case POKENAV_MENU_TYPE_CONDITION_SEARCH:
      menu.callback = HandleConditionSearchMenuInput;
      break;
  }
}

/** 1:1 `static u32 (*GetMainMenuInputHandler(void)` (pokenav_menu_handler.c:189-201). */
function GetMainMenuInputHandler(): number {
  switch (GetPokenavMode()) {
    default:
    case POKENAV_MODE_NORMAL:
      return HandleMainMenuInput;
    case POKENAV_MODE_FORCE_CALL_READY:
      return HandleMainMenuInputTutorial;
    case POKENAV_MODE_FORCE_CALL_EXIT:
      return HandleMainMenuInputEndTutorial;
  }
}

/** 1:1 `u32 GetMenuHandlerCallback(void)` (pokenav_menu_handler.c:203-207). */
export function GetMenuHandlerCallback(): number {
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_MAIN_MENU_HANDLER);
  return menu.callback(menu);
}

/** 1:1 `void FreeMenuHandlerSubstruct1(void)` (pokenav_menu_handler.c:209-212). */
export function FreeMenuHandlerSubstruct1(): void {
  FreePokenavSubstruct(POKENAV_SUBSTRUCT_MAIN_MENU_HANDLER);
}

/** 1:1 `static u32 HandleMainMenuInput(struct Pokenav_Menu *menu)` (pokenav_menu_handler.c:214-258). */
function HandleMainMenuInput(menu: Pokenav_Menu): number {
  if (UpdateMenuCursorPos(menu))
    return POKENAV_MENU_FUNC_MOVE_CURSOR;
  if (JOY_NEW(A_BUTTON))
  {
    switch (sMenuItems[menu.menuType][menu.cursorPos]) {
      case POKENAV_MENUITEM_MAP:
        menu.helpBarIndex = gSaveBlock2Ptr.regionMapZoom ? HELPBAR_MAP_ZOOMED_IN : HELPBAR_MAP_ZOOMED_OUT;
        SetMenuIdAndCB(menu, POKENAV_REGION_MAP);
        return POKENAV_MENU_FUNC_OPEN_FEATURE;
      case POKENAV_MENUITEM_CONDITION:
        menu.menuType = POKENAV_MENU_TYPE_CONDITION;
        menu.cursorPos = 0;
        menu.currMenuItem = sMenuItems[POKENAV_MENU_TYPE_CONDITION][0];
        menu.callback = HandleConditionMenuInput;
        return POKENAV_MENU_FUNC_OPEN_CONDITION;
      case POKENAV_MENUITEM_MATCH_CALL:
        menu.helpBarIndex = HELPBAR_MC_TRAINER_LIST;
        SetMenuIdAndCB(menu, POKENAV_MATCH_CALL);
        return POKENAV_MENU_FUNC_OPEN_FEATURE;
      case POKENAV_MENUITEM_RIBBONS:
        if (CanViewRibbonsMenu())
        {
          menu.helpBarIndex = HELPBAR_RIBBONS_MON_LIST;
          SetMenuIdAndCB(menu, POKENAV_RIBBONS_MON_LIST);
          return POKENAV_MENU_FUNC_OPEN_FEATURE;
        }
        else
        {
          menu.callback = HandleCantOpenRibbonsInput;
          return POKENAV_MENU_FUNC_NO_RIBBON_WINNERS;
        }
      case POKENAV_MENUITEM_SWITCH_OFF:
        return POKENAV_MENU_FUNC_EXIT;
    }
  }
  if (JOY_NEW(B_BUTTON))
    return POKENAV_MENU_FUNC_EXIT;
  return POKENAV_MENU_FUNC_NONE;
}

// Force the player to select Match Call during the call Mr. Stone PokéNav tutorial

/** 1:1 `static u32 HandleMainMenuInputTutorial(struct Pokenav_Menu *menu)` (pokenav_menu_handler.c:261-288). */
function HandleMainMenuInputTutorial(menu: Pokenav_Menu): number {
  if (UpdateMenuCursorPos(menu))
    return POKENAV_MENU_FUNC_MOVE_CURSOR;
  if (JOY_NEW(A_BUTTON))
  {
    if (sMenuItems[menu.menuType][menu.cursorPos] == POKENAV_MENUITEM_MATCH_CALL)
    {
      menu.helpBarIndex = HELPBAR_MC_TRAINER_LIST;
      SetMenuIdAndCB(menu, POKENAV_MATCH_CALL);
      return POKENAV_MENU_FUNC_OPEN_FEATURE;
    }
    else
    {
      PlaySE(SE_FAILURE);
      return POKENAV_MENU_FUNC_NONE;
    }
  }
  if (JOY_NEW(B_BUTTON))
  {
    PlaySE(SE_FAILURE);
    return POKENAV_MENU_FUNC_NONE;
  }
  return POKENAV_MENU_FUNC_NONE;
}

// After calling Mr. Stone during the PokéNav tutorial, force player to exit or use Match Call again

/** 1:1 `static u32 HandleMainMenuInputEndTutorial(struct Pokenav_Menu *menu)` (pokenav_menu_handler.c:291-320). */
function HandleMainMenuInputEndTutorial(menu: Pokenav_Menu): number {
  if (UpdateMenuCursorPos(menu))
    return POKENAV_MENU_FUNC_MOVE_CURSOR;
  if (JOY_NEW(A_BUTTON))
  {
    let menuItem = sMenuItems[menu.menuType][menu.cursorPos];
    if (menuItem != POKENAV_MENUITEM_MATCH_CALL && menuItem != POKENAV_MENUITEM_SWITCH_OFF)
    {
      PlaySE(SE_FAILURE);
      return POKENAV_MENU_FUNC_NONE;
    }
    else if (menuItem == POKENAV_MENUITEM_MATCH_CALL)
    {
      menu.helpBarIndex = HELPBAR_MC_TRAINER_LIST;
      SetMenuIdAndCB(menu, POKENAV_MATCH_CALL);
      return POKENAV_MENU_FUNC_OPEN_FEATURE;
    }
    else
    {
      return -1;
    }
  }
  else if (JOY_NEW(B_BUTTON))
  {
    return -1;
  }
  return POKENAV_MENU_FUNC_NONE;
}

// Handles input after selecting Ribbons when there are no ribbon winners left

// Selecting it again just reprints the Ribbon description to replace the "No Ribbon winners" message

/** 1:1 `static u32 HandleCantOpenRibbonsInput(struct Pokenav_Menu *menu)` (pokenav_menu_handler.c:324-339). */
function HandleCantOpenRibbonsInput(menu: Pokenav_Menu): number {
  if (UpdateMenuCursorPos(menu))
  {
    menu.callback = GetMainMenuInputHandler();
    return POKENAV_MENU_FUNC_MOVE_CURSOR;
  }
  if (JOY_NEW(A_BUTTON | B_BUTTON))
  {
    menu.callback = GetMainMenuInputHandler();
    return POKENAV_MENU_FUNC_RESHOW_DESCRIPTION;
  }
  return POKENAV_MENU_FUNC_NONE;
}

/** 1:1 `static u32 HandleConditionMenuInput(struct Pokenav_Menu *menu)` (pokenav_menu_handler.c:341-383). */
function HandleConditionMenuInput(menu: Pokenav_Menu): number {
  if (UpdateMenuCursorPos(menu))
    return POKENAV_MENU_FUNC_MOVE_CURSOR;
  if (JOY_NEW(A_BUTTON))
  {
    switch (sMenuItems[menu.menuType][menu.cursorPos]) {
      case POKENAV_MENUITEM_CONDITION_SEARCH:
        menu.menuType = POKENAV_MENU_TYPE_CONDITION_SEARCH;
        menu.cursorPos = 0;
        menu.currMenuItem = sMenuItems[POKENAV_MENU_TYPE_CONDITION_SEARCH][0];
        menu.callback = HandleConditionSearchMenuInput;
        return POKENAV_MENU_FUNC_OPEN_CONDITION_SEARCH;
      case POKENAV_MENUITEM_CONDITION_PARTY:
        menu.helpBarIndex = 0;
        SetMenuIdAndCB(menu, POKENAV_CONDITION_GRAPH_PARTY);
        return POKENAV_MENU_FUNC_OPEN_FEATURE;
      case POKENAV_MENUITEM_CONDITION_CANCEL:
        PlaySE(SE_SELECT);
        ReturnToMainMenu(menu);
        return POKENAV_MENU_FUNC_RETURN_TO_MAIN;
    }
  }
  if (JOY_NEW(B_BUTTON))
  {
    if (menu.cursorPos != sLastCursorPositions[menu.menuType])
    {
      menu.cursorPos = sLastCursorPositions[menu.menuType];
      menu.callback = CB2_ReturnToMainMenu;
      return POKENAV_MENU_FUNC_MOVE_CURSOR;
    }
    else
    {
      PlaySE(SE_SELECT);
      ReturnToMainMenu(menu);
      return POKENAV_MENU_FUNC_RETURN_TO_MAIN;
    }
  }
  return POKENAV_MENU_FUNC_NONE;
}

/** 1:1 `static u32 HandleConditionSearchMenuInput(struct Pokenav_Menu *menu)` (pokenav_menu_handler.c:385-423). */
function HandleConditionSearchMenuInput(menu: Pokenav_Menu): number {
  if (UpdateMenuCursorPos(menu))
    return POKENAV_MENU_FUNC_MOVE_CURSOR;
  if (JOY_NEW(A_BUTTON))
  {
    let menuItem = sMenuItems[menu.menuType][menu.cursorPos];
    if (menuItem != POKENAV_MENUITEM_CONDITION_SEARCH_CANCEL)
    {
      SetSelectedConditionSearch(menuItem - POKENAV_MENUITEM_CONDITION_SEARCH_COOL);
      SetMenuIdAndCB(menu, POKENAV_CONDITION_SEARCH_RESULTS);
      menu.helpBarIndex = HELPBAR_CONDITION_MON_LIST;
      return POKENAV_MENU_FUNC_OPEN_FEATURE;
    }
    else
    {
      PlaySE(SE_SELECT);
      ReturnToConditionMenu(menu);
      return POKENAV_MENU_FUNC_RETURN_TO_CONDITION;
    }
  }
  if (JOY_NEW(B_BUTTON))
  {
    if (menu.cursorPos != sLastCursorPositions[menu.menuType])
    {
      menu.cursorPos = sLastCursorPositions[menu.menuType];
      menu.callback = CB2_ReturnToConditionMenu;
      return POKENAV_MENU_FUNC_MOVE_CURSOR;
    }
    else
    {
      PlaySE(SE_SELECT);
      ReturnToConditionMenu(menu);
      return POKENAV_MENU_FUNC_RETURN_TO_CONDITION;
    }
  }
  return POKENAV_MENU_FUNC_NONE;
}

/** 1:1 `static u32 CB2_ReturnToMainMenu(struct Pokenav_Menu *menu)` (pokenav_menu_handler.c:425-429). */
function CB2_ReturnToMainMenu(menu: Pokenav_Menu): number {
  ReturnToMainMenu(menu);
  return POKENAV_MENU_FUNC_RETURN_TO_MAIN;
}

/** 1:1 `static u32 CB2_ReturnToConditionMenu(struct Pokenav_Menu *menu)` (pokenav_menu_handler.c:431-435). */
function CB2_ReturnToConditionMenu(menu: Pokenav_Menu): number {
  ReturnToConditionMenu(menu);
  return POKENAV_MENU_FUNC_RETURN_TO_CONDITION;
}

/** 1:1 `static void SetMenuIdAndCB(struct Pokenav_Menu *menu, u32 menuId)` (pokenav_menu_handler.c:437-441). */
function SetMenuIdAndCB(menu: Pokenav_Menu, menuId: number): void {
  menu.menuId = menuId;
  menu.callback = GetMenuId;
}

/** 1:1 `static u32 GetMenuId(struct Pokenav_Menu *menu)` (pokenav_menu_handler.c:443-446). */
function GetMenuId(menu: Pokenav_Menu): number {
  return menu.menuId;
}

/** 1:1 `static void ReturnToMainMenu(struct Pokenav_Menu *menu)` (pokenav_menu_handler.c:448-454). */
function ReturnToMainMenu(menu: Pokenav_Menu): void {
  menu.menuType = GetPokenavMainMenuType();
  menu.cursorPos = 1;
  menu.currMenuItem = sMenuItems[menu.menuType][menu.cursorPos];
  menu.callback = HandleMainMenuInput;
}

/** 1:1 `static void ReturnToConditionMenu(struct Pokenav_Menu *menu)` (pokenav_menu_handler.c:456-462). */
function ReturnToConditionMenu(menu: Pokenav_Menu): void {
  menu.menuType = POKENAV_MENU_TYPE_CONDITION;
  menu.cursorPos = 1;
  menu.currMenuItem = sMenuItems[POKENAV_MENU_TYPE_CONDITION][1];
  menu.callback = HandleConditionMenuInput;
}

/** 1:1 `static bool32 UpdateMenuCursorPos(struct Pokenav_Menu *menu)` (pokenav_menu_handler.c:464-487). */
function UpdateMenuCursorPos(menu: Pokenav_Menu): boolean {
  if (JOY_NEW(DPAD_UP))
  {
    if (--menu.cursorPos < 0)
      menu.cursorPos = sLastCursorPositions[menu.menuType];
    menu.currMenuItem = sMenuItems[menu.menuType][menu.cursorPos];
    return true;
  }
  else if (JOY_NEW(DPAD_DOWN))
  {
    menu.cursorPos++;
    if (menu.cursorPos > sLastCursorPositions[menu.menuType])
      menu.cursorPos = 0;
    menu.currMenuItem = sMenuItems[menu.menuType][menu.cursorPos];
    return true;
  }
  else
  {
    return false;
  }
}

/** 1:1 `int GetPokenavMenuType(void)` (pokenav_menu_handler.c:489-493). */
export function GetPokenavMenuType(): number {
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_MAIN_MENU_HANDLER);
  return menu.menuType;
}

// Position of cursor relative to number of current menu options

/** 1:1 `int GetPokenavCursorPos(void)` (pokenav_menu_handler.c:496-500). */
export function GetPokenavCursorPos(): number {
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_MAIN_MENU_HANDLER);
  return menu.cursorPos;
}

// ID of menu item the cursor is currently on

/** 1:1 `int GetCurrentMenuItemId(void)` (pokenav_menu_handler.c:503-507). */
export function GetCurrentMenuItemId(): number {
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_MAIN_MENU_HANDLER);
  return menu.currMenuItem;
}

/** 1:1 `u16 GetHelpBarTextId(void)` (pokenav_menu_handler.c:509-513). */
export function GetHelpBarTextId(): number {
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_MAIN_MENU_HANDLER);
  return menu.helpBarIndex;
}
